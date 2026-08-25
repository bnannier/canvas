// Drive the test viewport. The setup.ts visualViewport stub is stateful and
// exposes __canvasTestViewport; resizing through it mutates the stubbed size
// and re-fires the `resize` listeners react-native-web registered, which makes
// RNW's Dimensions recompute and notify its "change" subscribers: the exact
// signal a real browser resize produces. The 1280x800 desktop default is
// restored by a GLOBAL beforeEach living in setup.ts (an afterEach here would
// register only in the first importing file, thanks to module caching), so a
// resized viewport never leaks into another test.
import { act } from "@testing-library/react";

type ViewportHandle = { set(width: number, height: number): void };

function handle(): ViewportHandle {
  const h = (globalThis as Record<string, unknown>).__canvasTestViewport;
  if (!h) throw new Error("test/setup.ts did not install the visualViewport stub (is it preloaded?)");
  return h as ViewportHandle;
}

/** The harness default viewport (see test/setup.ts). */
export const DEFAULT_VIEWPORT = { width: 1280, height: 800 } as const;

/** Resize the stubbed viewport and flush the resulting re-renders. */
export function resizeViewport(width: number, height: number = DEFAULT_VIEWPORT.height): void {
  act(() => handle().set(width, height));
}
