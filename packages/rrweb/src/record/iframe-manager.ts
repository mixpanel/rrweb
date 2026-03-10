import type { Mirror } from 'rrweb-snapshot';
import { genId } from 'rrweb-snapshot';
import type { CrossOriginIframeMessageEvent } from '../types';
import CrossOriginIframeMirror from './cross-origin-iframe-mirror';
import { EventType, NodeType, IncrementalSource } from '@rrweb/types';
import type {
  eventWithTime,
  eventWithoutTime,
  serializedNodeWithId,
  mutationCallBack,
} from '@rrweb/types';
import type { StylesheetManager } from './stylesheet-manager';

export class IframeManager {
  private iframes: WeakMap<HTMLIFrameElement, true> = new WeakMap();
  private crossOriginIframeMap: WeakMap<MessageEventSource, HTMLIFrameElement> =
    new WeakMap();
  public crossOriginIframeMirror = new CrossOriginIframeMirror(genId);
  public crossOriginIframeStyleMirror: CrossOriginIframeMirror;
  public crossOriginIframeRootIdMap: WeakMap<HTMLIFrameElement, number> =
    new WeakMap();
  private iframeContentDocumentMap: WeakMap<HTMLIFrameElement, Document> =
    new WeakMap();
  private iframeObserverCleanupMap: WeakMap<HTMLIFrameElement, () => void> =
    new WeakMap();
  // private attachedIframes: Set<HTMLIFrameElement> = new Set();
  private mirror: Mirror;
  private mutationCb: mutationCallBack;
  private wrappedEmit: (e: eventWithoutTime, isCheckout?: boolean) => void;
  private loadListener?: (iframeEl: HTMLIFrameElement) => unknown;
  private stylesheetManager: StylesheetManager;
  private recordCrossOriginIframes: boolean;

  constructor(options: {
    mirror: Mirror;
    mutationCb: mutationCallBack;
    stylesheetManager: StylesheetManager;
    recordCrossOriginIframes: boolean;
    wrappedEmit: (e: eventWithoutTime, isCheckout?: boolean) => void;
  }) {
    this.mutationCb = options.mutationCb;
    this.wrappedEmit = options.wrappedEmit;
    this.stylesheetManager = options.stylesheetManager;
    this.recordCrossOriginIframes = options.recordCrossOriginIframes;
    this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(
      this.stylesheetManager.styleMirror.generateId.bind(
        this.stylesheetManager.styleMirror,
      ),
    );
    this.mirror = options.mirror;
    if (this.recordCrossOriginIframes) {
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  public addIframe(iframeEl: HTMLIFrameElement) {
    this.iframes.set(iframeEl, true);
    if (iframeEl.contentWindow)
      this.crossOriginIframeMap.set(iframeEl.contentWindow, iframeEl);
  }

  public getIframeContentDocument(
    iframeEl: HTMLIFrameElement,
  ): Document | undefined {
    return this.iframeContentDocumentMap.get(iframeEl);
  }

  public setObserverCleanup(
    iframeEl: HTMLIFrameElement,
    cleanup: () => void,
  ): void {
    this.iframeObserverCleanupMap.set(iframeEl, cleanup);
  }

  public getObserverCleanup(
    iframeEl: HTMLIFrameElement,
  ): (() => void) | undefined {
    return this.iframeObserverCleanupMap.get(iframeEl);
  }

  public removeIframe(iframeEl: HTMLIFrameElement): void {
    const storedDoc = this.iframeContentDocumentMap.get(iframeEl);
    const sizeBefore = this.mirror.getMapSize();
    console.log(`[rrweb-diag] removeIframe: storedDoc=${!!storedDoc}, idNodeMap.size=${sizeBefore}`);

    if (storedDoc) {
      const childCount = storedDoc.childNodes ? storedDoc.childNodes.length : -1;
      console.log(`[rrweb-diag] removeIframe: storedDoc.childNodes.length=${childCount}`);
      this.stylesheetManager.cleanupStylesheetsForRemovedNode(storedDoc);
      this.mirror.removeNodeFromMap(storedDoc, true);
      console.log(`[rrweb-diag] removeIframe: after cleanup idNodeMap.size=${this.mirror.getMapSize()} (removed ${sizeBefore - this.mirror.getMapSize()})`);
    }

    this.iframes.delete(iframeEl);
    this.iframeContentDocumentMap.delete(iframeEl);
    // this.attachedIframes.delete(iframeEl);

    const observerCleanup = this.iframeObserverCleanupMap.get(iframeEl);
    if (observerCleanup) {
      try {
        observerCleanup();
      } catch (e) {
        console.warn('[rrweb-v9] observer cleanup error:', e);
      }
      this.iframeObserverCleanupMap.delete(iframeEl);
    }
  }

  public cleanupOrphanedIframes(): void {
    // if (this.attachedIframes.size === 0) return;
    // const stale: HTMLIFrameElement[] = [];
    // for (const iframeEl of this.attachedIframes) {
    //   if (!iframeEl.isConnected) {
    //     stale.push(iframeEl);
    //     continue;
    //   }
    //   // Check if iframe is hidden (in a stale container kept in DOM but not visible)
    //   try {
    //     const rect = iframeEl.getBoundingClientRect();
    //     if (rect.width === 0 && rect.height === 0) {
    //       stale.push(iframeEl);
    //     }
    //   } catch (e) {
    //     // If we can't check, leave it alone
    //   }
    // }
    // if (stale.length > 0) {
    //   for (const iframeEl of stale) {
    //     this.removeIframe(iframeEl);
    //   }
    // }
  }

  public addLoadListener(cb: (iframeEl: HTMLIFrameElement) => unknown) {
    this.loadListener = cb;
  }

  public attachIframe(
    iframeEl: HTMLIFrameElement,
    childSn: serializedNodeWithId,
  ) {
    // Clean up iframes that are no longer connected to the DOM
    // This handles the case where iframe elements are destroyed and recreated
    // (e.g., SPA frameworks that replace iframe elements on navigation)
    this.cleanupOrphanedIframes();

    // Clean up old contentDocument before attaching new one (e.g. iframe src change)
    // TODO do i need this???, dont think so
    // const oldDoc = this.iframeContentDocumentMap.get(iframeEl);
    // if (oldDoc && oldDoc !== iframeEl.contentDocument) {
    //   const oldChildCount = oldDoc.childNodes ? oldDoc.childNodes.length : -1;
    //   const sizeBefore = this.mirror.getMapSize();
    //   console.log(`[rrweb-diag] attachIframe: replacing old doc, oldDoc.childNodes.length=${oldChildCount}, idNodeMap.size=${sizeBefore}`);

    //   this.stylesheetManager.cleanupStylesheetsForRemovedNode(oldDoc);
    //   this.mirror.removeNodeFromMap(oldDoc, true);

    //   console.log(`[rrweb-diag] attachIframe: after old doc cleanup idNodeMap.size=${this.mirror.getMapSize()} (removed ${sizeBefore - this.mirror.getMapSize()})`);

    //   // Disconnect old observer
    //   const oldCleanup = this.iframeObserverCleanupMap.get(iframeEl);
    //   if (oldCleanup) {
    //     try {
    //       oldCleanup();
    //     } catch (e) {
    //       // Ignore errors during cleanup
    //     }
    //     this.iframeObserverCleanupMap.delete(iframeEl);
    //   }
    // }

    this.mutationCb({
      adds: [
        {
          parentId: this.mirror.getId(iframeEl),
          nextId: null,
          node: childSn,
        },
      ],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: true,
    });

    if (iframeEl.contentDocument) {
      this.iframeContentDocumentMap.set(iframeEl, iframeEl.contentDocument);
    }
    // this.attachedIframes.add(iframeEl);

    // Receive messages (events) coming from cross-origin iframes that are nested in this same-origin iframe.
    if (this.recordCrossOriginIframes)
      iframeEl.contentWindow?.addEventListener(
        'message',
        this.handleMessage.bind(this),
      );

    this.loadListener?.(iframeEl);

    if (
      iframeEl.contentDocument &&
      iframeEl.contentDocument.adoptedStyleSheets &&
      iframeEl.contentDocument.adoptedStyleSheets.length > 0
    )
      this.stylesheetManager.adoptStyleSheets(
        iframeEl.contentDocument.adoptedStyleSheets,
        this.mirror.getId(iframeEl.contentDocument),
      );
  }
  private handleMessage(message: MessageEvent | CrossOriginIframeMessageEvent) {
    const crossOriginMessageEvent = message as CrossOriginIframeMessageEvent;
    if (
      crossOriginMessageEvent.data.type !== 'rrweb' ||
      // To filter out the rrweb messages which are forwarded by some sites.
      crossOriginMessageEvent.origin !== crossOriginMessageEvent.data.origin
    )
      return;

    const iframeSourceWindow = message.source;
    if (!iframeSourceWindow) return;

    const iframeEl = this.crossOriginIframeMap.get(message.source);
    if (!iframeEl) return;

    const transformedEvent = this.transformCrossOriginEvent(
      iframeEl,
      crossOriginMessageEvent.data.event,
    );

    if (transformedEvent)
      this.wrappedEmit(
        transformedEvent,
        crossOriginMessageEvent.data.isCheckout,
      );
  }

  private transformCrossOriginEvent(
    iframeEl: HTMLIFrameElement,
    e: eventWithTime,
  ): eventWithTime | false {
    switch (e.type) {
      case EventType.FullSnapshot: {
        this.crossOriginIframeMirror.reset(iframeEl);
        this.crossOriginIframeStyleMirror.reset(iframeEl);
        /**
         * Replaces the original id of the iframe with a new set of unique ids
         */
        this.replaceIdOnNode(e.data.node, iframeEl);
        const rootId = e.data.node.id;
        this.crossOriginIframeRootIdMap.set(iframeEl, rootId);
        this.patchRootIdOnNode(e.data.node, rootId);
        return {
          timestamp: e.timestamp,
          type: EventType.IncrementalSnapshot,
          data: {
            source: IncrementalSource.Mutation,
            adds: [
              {
                parentId: this.mirror.getId(iframeEl),
                nextId: null,
                node: e.data.node,
              },
            ],
            removes: [],
            texts: [],
            attributes: [],
            isAttachIframe: true,
          },
        };
      }
      case EventType.Meta:
      case EventType.Load:
      case EventType.DomContentLoaded: {
        return false;
      }
      case EventType.Plugin: {
        return e;
      }
      case EventType.Custom: {
        this.replaceIds(
          e.data.payload as {
            id?: unknown;
            parentId?: unknown;
            previousId?: unknown;
            nextId?: unknown;
          },
          iframeEl,
          ['id', 'parentId', 'previousId', 'nextId'],
        );
        return e;
      }
      case EventType.IncrementalSnapshot: {
        switch (e.data.source) {
          case IncrementalSource.Mutation: {
            e.data.adds.forEach((n) => {
              this.replaceIds(n, iframeEl, [
                'parentId',
                'nextId',
                'previousId',
              ]);
              this.replaceIdOnNode(n.node, iframeEl);
              const rootId = this.crossOriginIframeRootIdMap.get(iframeEl);
              rootId && this.patchRootIdOnNode(n.node, rootId);
            });
            e.data.removes.forEach((n) => {
              this.replaceIds(n, iframeEl, ['parentId', 'id']);
            });
            e.data.attributes.forEach((n) => {
              this.replaceIds(n, iframeEl, ['id']);
            });
            e.data.texts.forEach((n) => {
              this.replaceIds(n, iframeEl, ['id']);
            });
            return e;
          }
          case IncrementalSource.Drag:
          case IncrementalSource.TouchMove:
          case IncrementalSource.MouseMove: {
            e.data.positions.forEach((p) => {
              this.replaceIds(p, iframeEl, ['id']);
            });
            return e;
          }
          case IncrementalSource.ViewportResize: {
            // can safely ignore these events
            return false;
          }
          case IncrementalSource.MediaInteraction:
          case IncrementalSource.MouseInteraction:
          case IncrementalSource.Scroll:
          case IncrementalSource.CanvasMutation:
          case IncrementalSource.Input: {
            this.replaceIds(e.data, iframeEl, ['id']);
            return e;
          }
          case IncrementalSource.StyleSheetRule:
          case IncrementalSource.StyleDeclaration: {
            this.replaceIds(e.data, iframeEl, ['id']);
            this.replaceStyleIds(e.data, iframeEl, ['styleId']);
            return e;
          }
          case IncrementalSource.Font: {
            // fine as-is no modification needed
            return e;
          }
          case IncrementalSource.Selection: {
            e.data.ranges.forEach((range) => {
              this.replaceIds(range, iframeEl, ['start', 'end']);
            });
            return e;
          }
          case IncrementalSource.AdoptedStyleSheet: {
            this.replaceIds(e.data, iframeEl, ['id']);
            this.replaceStyleIds(e.data, iframeEl, ['styleIds']);
            e.data.styles?.forEach((style) => {
              this.replaceStyleIds(style, iframeEl, ['styleId']);
            });
            return e;
          }
        }
      }
    }
    return false;
  }

  private replace<T extends Record<string, unknown>>(
    iframeMirror: CrossOriginIframeMirror,
    obj: T,
    iframeEl: HTMLIFrameElement,
    keys: Array<keyof T>,
  ): T {
    for (const key of keys) {
      if (!Array.isArray(obj[key]) && typeof obj[key] !== 'number') continue;
      if (Array.isArray(obj[key])) {
        obj[key] = iframeMirror.getIds(
          iframeEl,
          obj[key] as number[],
        ) as T[keyof T];
      } else {
        (obj[key] as number) = iframeMirror.getId(iframeEl, obj[key] as number);
      }
    }

    return obj;
  }

  private replaceIds<T extends Record<string, unknown>>(
    obj: T,
    iframeEl: HTMLIFrameElement,
    keys: Array<keyof T>,
  ): T {
    return this.replace(this.crossOriginIframeMirror, obj, iframeEl, keys);
  }

  private replaceStyleIds<T extends Record<string, unknown>>(
    obj: T,
    iframeEl: HTMLIFrameElement,
    keys: Array<keyof T>,
  ): T {
    return this.replace(this.crossOriginIframeStyleMirror, obj, iframeEl, keys);
  }

  private replaceIdOnNode(
    node: serializedNodeWithId,
    iframeEl: HTMLIFrameElement,
  ) {
    this.replaceIds(node, iframeEl, ['id', 'rootId']);
    if ('childNodes' in node) {
      node.childNodes.forEach((child) => {
        this.replaceIdOnNode(child, iframeEl);
      });
    }
  }

  private patchRootIdOnNode(node: serializedNodeWithId, rootId: number) {
    if (node.type !== NodeType.Document && !node.rootId) node.rootId = rootId;
    if ('childNodes' in node) {
      node.childNodes.forEach((child) => {
        this.patchRootIdOnNode(child, rootId);
      });
    }
  }
}
