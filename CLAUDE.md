# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Rules

- **Never post comments, replies, or reviews to GitHub (via `gh` CLI or otherwise) without explicit user approval.** Always draft the comment text and wait for confirmation before posting.

## Overview

This is Mixpanel's fork of rrweb (record and replay the web), published under the `@mixpanel/` npm scope. It is a TypeScript monorepo using Yarn 1 workspaces with Turbo for build orchestration.

## Development Commands

### Build and Dev

- `yarn install` - Install dependencies (use yarn, not npm)
- `yarn build:all` - Build all packages (runs `turbo run prepublish` with 4GB heap)
- `yarn dev` - Start development mode with auto-rebuilding

### Testing

- `yarn test` - Run all tests across all packages
- Run a single package's tests: `cd packages/rrweb && yarn test`
- Run a single test file: `cd packages/rrweb && yarn vitest run test/record.test.ts`
- Run tests with visible browser: `cd packages/rrweb && yarn test:headful`
- Re-run tests without rebuilding: `cd packages/rrweb && yarn retest`
- Update snapshots: `yarn test:update`
- Benchmarks: `cd packages/rrweb && yarn benchmark`

### Code Quality

- `yarn check-types` - TypeScript type checking across all packages
- `yarn lint` - ESLint + markdownlint
- `yarn format` - Prettier on all .ts and .md files
- `yarn format:head` - Format only files changed since last commit

## Architecture

### Data Pipeline

The core flow is: **Snapshot → Record → Replay**

1. **Snapshot** (`packages/rrweb-snapshot`): Serializes the full DOM tree into a JSON representation (`serializedNodeWithId`). Each DOM node gets a unique numeric ID. The `rebuild` module does the reverse — reconstructs DOM from serialized data.

2. **Record** (`packages/rrweb/src/record/`): After an initial full snapshot, observes incremental changes via `MutationObserver` and event listeners. The entry point is `record()` in `index.ts`, which coordinates several managers:

   - `observer.ts` — Sets up all DOM observers (mutations, mouse, scroll, input, resize, media, stylesheets, fonts, canvas)
   - `mutation.ts` (`MutationBuffer`) — Processes `MutationObserver` records into serializable mutation data, using a double-linked list for ordering
   - `iframe-manager.ts` — Handles same-origin and cross-origin iframe recording
   - `shadow-dom-manager.ts` — Attaches observers inside shadow DOM roots
   - `stylesheet-manager.ts` — Tracks stylesheet changes and adopted stylesheets
   - `canvas-manager.ts` — Records canvas 2D/WebGL mutations

3. **Replay** (`packages/rrweb/src/replay/`): The `Replayer` class rebuilds the DOM from a full snapshot, then applies incremental events in timestamp order. Uses `@xstate/fsm` for player state management (play/pause/live) and `rrdom` as a virtual DOM layer for diffing.

### The Mirror

The `Mirror` class (`packages/rrweb-snapshot/src/utils.ts`) is central to the architecture. It maintains a bidirectional mapping between DOM nodes and their numeric IDs (`idNodeMap` + `nodeMetaMap`). Both recording and replay maintain their own Mirror instance to look up nodes by ID and vice versa.

### Key Packages

- **packages/rrweb** — Main recording (`src/record/`) and replay (`src/replay/`) logic
- **packages/rrweb-snapshot** — DOM serialization (`snapshot.ts`) and rebuilding (`rebuild.ts`)
- **packages/types** — Shared TypeScript types: `EventType`, `IncrementalSource`, event/mutation types
- **packages/utils** — `@rrweb/utils`: untainted prototype access (protects against monkey-patching by Angular/MooTools), `patch()` helper
- **packages/rrdom** — Virtual DOM implementation used during replay for diffing
- **packages/rrweb-player** — Svelte-based player UI
- **packages/plugins/** — Optional plugins (console record/replay, canvas WebRTC, sequential IDs)

### Event Types

Events are typed via `EventType` enum in `packages/types/src/index.ts`:

- `FullSnapshot` — Complete serialized DOM tree
- `IncrementalSnapshot` — Mutations, mouse moves, scroll, input, canvas, etc. (discriminated by `IncrementalSource`)
- `Meta` — Page URL and viewport dimensions
- `Custom` / `Plugin` — Extension points

All events are timestamped as `eventWithTime`.

## Testing Infrastructure

- Integration tests (`packages/rrweb/test/`) use **Puppeteer** to launch a real browser, serve HTML fixtures from `test/html/`, inject the built rrweb bundle, and capture events
- Test utilities are in `packages/rrweb/test/utils.ts` (browser launch, HTTP server, snapshot assertion helpers)
- Tests require a build first (`yarn test` does this automatically; `yarn retest` skips the build)
- `PUPPETEER_HEADLESS` env var controls headless mode
- **Vitest** is the test runner with a workspace config (`vitest.workspace.ts`)

## Code Style

- Prettier for formatting, ESLint for linting
- TypeScript/ES6+ conventions: `const`/`let`, arrow functions, template literals
- PascalCase for classes, camelCase for functions/variables, kebab-case for file names
