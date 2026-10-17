import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { useChatTailFollow } from "../src/organisms/chat/chat-scroll.ts";

let nextFrame = 0;
let frames: Map<number, FrameRequestCallback>;
let requestSpy: ReturnType<typeof spyOn>;
let cancelSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  nextFrame = 0;
  frames = new Map();
  requestSpy = spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
    const id = ++nextFrame;
    frames.set(id, callback);
    return id;
  });
  cancelSpy = spyOn(globalThis, "cancelAnimationFrame").mockImplementation((id) => { frames.delete(id); });
});
afterEach(() => { cleanup(); requestSpy.mockRestore(); cancelSpy.mockRestore(); });
const flushFrame = () => act(() => {
  const ready = [...frames.values()];
  frames.clear();
  ready.forEach((callback) => callback(0));
});
const setup = () => {
  const moves: { animated?: boolean }[] = [];
  const scroll = { current: { scrollToEnd: (options: { animated?: boolean } = {}) => moves.push(options) } };
  const hook = renderHook(() => useChatTailFollow(scroll));
  return { ...hook, moves };
};

test("initial layout and repeated content updates follow once after the committed frame without animation", () => {
  const { result, moves } = setup();
  act(() => {
    result.current.onLayout(400);
    result.current.onContentSizeChange(1000);
    result.current.requestFollow();
    result.current.onContentSizeChange(1200);
  });
  expect(moves).toEqual([]);
  expect(frames.size).toBe(1);
  flushFrame();
  expect(moves).toEqual([{ animated: false }]);
  act(() => result.current.onScroll(800, 400, 1200));
  act(() => {
    result.current.onContentSizeChange(1600);
    result.current.requestFollow();
  });
  flushFrame();
  expect(moves).toEqual([{ animated: false }, { animated: false }]);
});

test("a geometry event at the old offset cannot cancel following while streamed text grows", () => {
  const { result, moves } = setup();
  flushFrame();
  act(() => result.current.onScroll(600, 400, 1000));
  flushFrame();
  moves.length = 0;
  act(() => {
    result.current.onScroll(600, 400, 1400);
    result.current.onContentSizeChange(1400);
    result.current.onScroll(600, 400, 1400);
  });
  flushFrame();
  expect(moves).toEqual([{ animated: false }]);
});

test("scrolling up cancels an already queued follow and leaves later answer growth or resize alone", () => {
  const { result, moves } = setup();
  flushFrame();
  act(() => result.current.onScroll(600, 400, 1000));
  flushFrame();
  moves.length = 0;
  act(() => {
    result.current.onContentSizeChange(1500);
    result.current.onScroll(200, 400, 1500);
  });
  flushFrame();
  expect(moves).toEqual([]);
  act(() => {
    result.current.requestFollow();
    result.current.onContentSizeChange(1800);
    result.current.onLayout(320);
  });
  flushFrame();
  expect(moves).toEqual([]);
});

test("returning to the bottom resumes following for new answers and local question-height changes", () => {
  const { result, moves } = setup();
  flushFrame();
  act(() => result.current.onScroll(600, 400, 1000));
  flushFrame();
  act(() => result.current.onScroll(100, 400, 1000));
  moves.length = 0;
  act(() => result.current.onContentSizeChange(1500));
  flushFrame();
  expect(moves).toEqual([]);
  act(() => result.current.onScroll(1100, 400, 1500));
  flushFrame();
  expect(moves).toEqual([{ animated: false }]);
  moves.length = 0;
  act(() => {
    result.current.onContentSizeChange(1700);
    result.current.requestFollow();
  });
  flushFrame();
  expect(moves).toEqual([{ animated: false }]);
});

test("a viewport resize follows the current tail, and shrinking content that fits resumes a paused reader", () => {
  const { result, moves } = setup();
  flushFrame();
  act(() => result.current.onScroll(600, 400, 1000));
  flushFrame();
  moves.length = 0;
  act(() => result.current.onLayout(280));
  flushFrame();
  expect(moves).toEqual([{ animated: false }]);
  act(() => result.current.onScroll(720, 280, 1000));
  act(() => result.current.onScroll(100, 280, 1000));
  moves.length = 0;
  act(() => result.current.onContentSizeChange(200));
  flushFrame();
  expect(moves).toEqual([{ animated: false }]);
  act(() => result.current.onContentSizeChange(1100));
  flushFrame();
  expect(moves).toHaveLength(2);
});

test("unmount cancels queued scrolling and stale callbacks cannot start another move", () => {
  const { result, moves, unmount } = setup();
  const callbacks = result.current;
  expect(frames.size).toBe(1);
  unmount();
  expect(frames.size).toBe(0);
  callbacks.requestFollow();
  callbacks.onContentSizeChange(1500);
  flushFrame();
  expect(moves).toEqual([]);
});

for (const platform of ["web", "ios", "android"] as const) {
  test(`the ${platform} ChatThread connects initial layout, message commits, local content changes, and viewport resize to tail following`, async () => {
    const suffix = platform === "web" ? "" : `.${platform}`;
    const { ChatThread } = await import(`../src/organisms/chat/chat${suffix}.tsx`);
    const message = { id: "stream", role: "assistant" as const, content: "First words", streaming: true };
    const { rerender } = render(<ThemeProvider light solid><ChatThread testID="thread" messages={[message]} /></ThemeProvider>);
    const host = screen.getByTestId("thread").firstElementChild as HTMLElement;
    const calls: ScrollToOptions[] = [];
    const originalScroll = host.scroll;
    host.scroll = ((options: ScrollToOptions) => { calls.push(options); }) as typeof host.scroll;
    Object.defineProperty(host, "scrollHeight", { configurable: true, value: 1000 });
    const layout = (node: Element, height: number) => {
      const handler = (node as HTMLElement & { __reactLayoutHandler?: (event: unknown) => void }).__reactLayoutHandler;
      if (!handler) throw new Error("Chat scroll host has no layout handler");
      act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width: 500, height } }, timeStamp: 1 }));
    };
    try {
      layout(host, 400);
      layout(host.firstElementChild!, 1000);
      flushFrame();
      expect(calls).toEqual([{ top: 1000, left: 0, behavior: "auto" }]);
      rerender(<ThemeProvider light solid><ChatThread testID="thread" messages={[{ ...message, content: "More streamed words under the same message id" }]} /></ThemeProvider>);
      flushFrame();
      expect(calls).toHaveLength(2);
      layout(host.firstElementChild!, 1400);
      flushFrame();
      expect(calls).toHaveLength(3);
      layout(host, 300);
      flushFrame();
      expect(calls).toHaveLength(4);
    } finally {
      host.scroll = originalScroll;
    }
  });
}
