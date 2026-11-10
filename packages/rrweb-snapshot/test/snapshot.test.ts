/**
 * @vitest-environment jsdom
 */
import { JSDOM } from 'jsdom';
import { describe, expect, it, vi } from 'vitest';

import snapshot, {
  _isBlockedElement,
  needMaskingText,
  serializeNodeWithId,
} from '../src/snapshot';
import { elementNode, serializedNodeWithId } from '../src/types';
import { Mirror, absolutifyURLs } from '../src/utils';

const serializeNode = (node: Node): serializedNodeWithId | null => {
  return serializeNodeWithId(node, {
    doc: document,
    mirror: new Mirror(),
    blockClass: 'blockblock',
    blockSelector: null,
    maskTextClass: 'maskmask',
    maskTextSelector: null,
    skipChild: false,
    inlineStylesheet: true,
    maskTextFn: undefined,
    maskInputFn: undefined,
    slimDOMOptions: {},
  });
};

describe('absolute url to stylesheet', () => {
  const href = 'http://localhost/css/style.css';

  it('can handle relative path', () => {
    expect(absolutifyURLs('url(a.jpg)', href)).toEqual(
      `url(http://localhost/css/a.jpg)`,
    );
  });

  it('can handle same level path', () => {
    expect(absolutifyURLs('url("./a.jpg")', href)).toEqual(
      `url("http://localhost/css/a.jpg")`,
    );
  });

  it('can handle parent level path', () => {
    expect(absolutifyURLs('url("../a.jpg")', href)).toEqual(
      `url("http://localhost/a.jpg")`,
    );
  });

  it('can handle absolute path', () => {
    expect(absolutifyURLs('url("/a.jpg")', href)).toEqual(
      `url("http://localhost/a.jpg")`,
    );
  });

  it('can handle external path', () => {
    expect(absolutifyURLs('url("http://localhost/a.jpg")', href)).toEqual(
      `url("http://localhost/a.jpg")`,
    );
  });

  it('can handle single quote path', () => {
    expect(absolutifyURLs(`url('./a.jpg')`, href)).toEqual(
      `url('http://localhost/css/a.jpg')`,
    );
  });

  it('can handle no quote path', () => {
    expect(absolutifyURLs('url(./a.jpg)', href)).toEqual(
      `url(http://localhost/css/a.jpg)`,
    );
  });

  it('can handle multiple no quote paths', () => {
    expect(
      absolutifyURLs(
        'background-image: url(images/b.jpg);background: #aabbcc url(images/a.jpg) 50% 50% repeat;',
        href,
      ),
    ).toEqual(
      `background-image: url(http://localhost/css/images/b.jpg);` +
        `background: #aabbcc url(http://localhost/css/images/a.jpg) 50% 50% repeat;`,
    );
  });

  it('can handle data url image', () => {
    expect(absolutifyURLs('url(data:image/gif;base64,ABC)', href)).toEqual(
      'url(data:image/gif;base64,ABC)',
    );
    expect(
      absolutifyURLs(
        'url(data:application/font-woff;base64,d09GMgABAAAAAAm)',
        href,
      ),
    ).toEqual('url(data:application/font-woff;base64,d09GMgABAAAAAAm)');
  });

  it('preserves quotes around inline svgs with spaces', () => {
    expect(
      absolutifyURLs(
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath fill='%2328a745' d='M3'/%3E%3C/svg%3E\")",
        href,
      ),
    ).toEqual(
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath fill='%2328a745' d='M3'/%3E%3C/svg%3E\")",
    );
    expect(
      absolutifyURLs(
        'url(\'data:image/svg+xml;utf8,<svg width="28" height="32" viewBox="0 0 28 32" xmlns="http://www.w3.org/2000/svg"><path d="M27 14C28" fill="white"/></svg>\')',
        href,
      ),
    ).toEqual(
      'url(\'data:image/svg+xml;utf8,<svg width="28" height="32" viewBox="0 0 28 32" xmlns="http://www.w3.org/2000/svg"><path d="M27 14C28" fill="white"/></svg>\')',
    );
    expect(
      absolutifyURLs(
        'url("data:image/svg+xml;utf8,<svg width="28" height="32" viewBox="0 0 28 32" xmlns="http://www.w3.org/2000/svg"><path d="M27 14C28" fill="white"/></svg>")',
        href,
      ),
    ).toEqual(
      'url("data:image/svg+xml;utf8,<svg width="28" height="32" viewBox="0 0 28 32" xmlns="http://www.w3.org/2000/svg"><path d="M27 14C28" fill="white"/></svg>")',
    );
  });
  it('can handle empty path', () => {
    expect(absolutifyURLs(`url('')`, href)).toEqual(`url('')`);
  });
});

describe('isBlockedElement()', () => {
  const subject = (html: string, opt: any = {}) =>
    _isBlockedElement(render(html), 'rr-block', opt.blockSelector);

  const render = (html: string): HTMLElement =>
    JSDOM.fragment(html).querySelector('div')!;

  it('can handle empty elements', () => {
    expect(subject('<div />')).toEqual(false);
  });

  it('blocks prohibited className', () => {
    expect(subject('<div class="foo rr-block bar" />')).toEqual(true);
  });

  it('does not block random data selector', () => {
    expect(subject('<div data-rr-block />')).toEqual(false);
  });

  it('blocks blocked selector', () => {
    expect(
      subject('<div data-rr-block />', { blockSelector: '[data-rr-block]' }),
    ).toEqual(true);
  });
});

describe('style elements', () => {
  const render = (html: string): HTMLStyleElement => {
    document.write(html);
    return document.querySelector('style')!;
  };

  it('should serialize all rules of stylesheet when the sheet has a single child node', () => {
    const styleEl = render(`<style>body { color: red; }</style>`);
    styleEl.sheet?.insertRule('section { color: blue; }');
    expect(serializeNode(styleEl)).toMatchObject({
      rootId: undefined,
      attributes: {
        _cssText: 'section {color: blue;}body {color: red;}',
      },
      type: 2,
    });
  });

  it('should serialize all rules on stylesheets with mix of insertion type', () => {
    const styleEl = render(`<style>body { color: red; }</style>`);
    styleEl.sheet?.insertRule('section.lost { color: unseeable; }'); // browser throws this away after append
    styleEl.append(document.createTextNode('section { color: blue; }'));
    styleEl.sheet?.insertRule('section.working { color: pink; }');
    expect(serializeNode(styleEl)).toMatchObject({
      rootId: undefined,
      attributes: {
        _cssText:
          'section.working {color: pink;}body {color: red;}/* rr_split */section {color: blue;}',
      },
      type: 2,
    });
  });
});

describe('scrollTop/scrollLeft', () => {
  const render = (html: string): HTMLDivElement => {
    document.write(html);
    return document.querySelector('div')!;
  };

  it('should serialize scroll positions', () => {
    const el = render(`<div stylel='overflow: auto; width: 1px; height: 1px;'>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </div>`);
    el.scrollTop = 10;
    el.scrollLeft = 20;
    expect(serializeNode(el)).toMatchObject({
      attributes: {
        rr_scrollTop: 10,
        rr_scrollLeft: 20,
      },
    });
  });
});

describe('form', () => {
  const render = (html: string): HTMLTextAreaElement => {
    document.write(html);
    return document.querySelector('textarea')!;
  };

  it('should record textarea values once', () => {
    const el = render(`<textarea>Lorem ipsum</textarea>`);
    const sel = serializeNode(el) as elementNode;

    // we serialize according to where the DOM stores the value, not how
    // the HTML stores it (this is so that maskInputValue can work over
    // inputs/textareas/selects in a uniform way)
    expect(sel).toMatchObject({
      attributes: {
        value: 'Lorem ipsum',
      },
    });
    expect(sel?.childNodes).toEqual([]); // shouldn't be stored in childNodes while in transit
  });
});

describe('jsdom snapshot', () => {
  const render = (html: string): Document => {
    document.write(html);
    return document;
  };

  it("doesn't rely on global browser objects", () => {
    // this test is incomplete in terms of coverage,
    // but the idea being that we are checking that all features use the
    // passed-in `doc` object rather than the global `document`
    // (which is only present in browsers)
    // in any case, supporting jsdom is not a primary goal

    const doc = render(`<!DOCTYPE html><p>Hello world</p><canvas></canvas>`);
    const sn = snapshot(doc, {
      // JSDOM Error: Not implemented: HTMLCanvasElement.prototype.toDataURL (without installing the canvas npm package)
      //recordCanvas: true,
    });
    expect(sn).toMatchObject({
      type: 0,
    });
  });
});

describe('text attribute masking', () => {
  const serializeWith = (
    html: string,
    options: {
      maskTextClass?: string;
      maskTextFn?: (text: string, element: HTMLElement | null) => string;
    } = {},
  ) => {
    const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
    const doc = dom.window.document;
    return serializeNodeWithId(doc.body.firstElementChild!, {
      doc,
      mirror: new Mirror(),
      blockClass: 'blockblock',
      blockSelector: null,
      maskTextClass: options.maskTextClass ?? 'maskmask',
      maskTextSelector: null,
      skipChild: true,
      inlineStylesheet: true,
      maskTextFn: options.maskTextFn,
      maskInputFn: undefined,
      slimDOMOptions: {},
    }) as elementNode & { attributes: Record<string, unknown> };
  };

  it('masks listed attributes on leaf elements with the default mask', () => {
    const node = serializeWith(
      '<img class="maskmask" alt="secret" title="t" />',
    );
    expect(node.attributes.alt).toBe('******');
    expect(node.attributes.title).toBe('*');
  });

  it('matches attribute names case-insensitively', () => {
    const node = serializeWith(
      '<button class="maskmask" ARIA-LABEL="secret"></button>',
    );
    expect(node.attributes['aria-label']).toBe('******');
  });

  it('uses maskTextFn with the element', () => {
    const maskTextFn = vi.fn((text: string) => `[${text}]`);
    const node = serializeWith(
      '<input class="maskmask" aria-label="secret" />',
      { maskTextFn },
    );
    expect(node.attributes['aria-label']).toBe('[secret]');
    expect(maskTextFn.mock.calls[0][1]!.tagName).toBe('INPUT');
  });

  it('masks when an ancestor matches', () => {
    const dom = new JSDOM(
      '<!DOCTYPE html><body><div class="maskmask"><img alt="secret" /></div></body>',
    );
    const doc = dom.window.document;
    const node = serializeNodeWithId(doc.querySelector('img')!, {
      doc,
      mirror: new Mirror(),
      blockClass: 'blockblock',
      blockSelector: null,
      maskTextClass: 'maskmask',
      maskTextSelector: null,
      skipChild: true,
      inlineStylesheet: true,
      maskTextFn: undefined,
      maskInputFn: undefined,
      slimDOMOptions: {},
    }) as elementNode & { attributes: Record<string, unknown> };
    expect(node.attributes.alt).toBe('******');
  });

  it('does not mask unmatched elements, style, value or placeholder', () => {
    const plain = serializeWith('<img alt="secret" />');
    expect(plain.attributes.alt).toBe('secret');
    const masked = serializeWith(
      '<input class="maskmask" style="color: red" value="v" placeholder="p" />',
    );
    expect(masked.attributes.style).toBe('color: red');
    expect(masked.attributes.value).toBe('v');
    expect(masked.attributes.placeholder).toBe('p');
  });

  it('masks the label attribute', () => {
    const node = serializeWith(
      '<optgroup class="maskmask" label="secret"></optgroup>',
    );
    expect(node.attributes.label).toBe('******');
  });

  it('does not mask the title of stylesheets', () => {
    const style = serializeWith(
      '<style class="maskmask" title="dark"></style>',
    );
    expect(style.attributes.title).toBe('dark');
    const link = serializeWith(
      '<link class="maskmask" rel="stylesheet" title="dark" />',
    );
    expect(link.attributes.title).toBe('dark');
  });

  it('does not record attributes of blocked elements', () => {
    const node = serializeWith(
      '<div class="blockblock maskmask" aria-label="secret"></div>',
    );
    expect(node.attributes['aria-label']).toBeUndefined();
  });

  it('needMaskingText still skips leaf elements', () => {
    const doc = new JSDOM('<body><i class="maskmask"></i></body>').window
      .document;
    expect(
      needMaskingText(doc.querySelector('i')!, 'maskmask', null, true),
    ).toBe(false);
  });
});
