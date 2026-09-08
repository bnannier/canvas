import { afterEach, expect, it } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";
import type { LayoutChangeEvent } from "react-native";
import { useHorizontalScrollFocus, useScrollFocus } from "../src/style/use-scroll-focus.ts";

afterEach(cleanup);
const layout = (width: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height: 80 } } }) as LayoutChangeEvent;

it("uses vertical overflow for capped menu content", () => {
  const { result } = renderHook(() => useScrollFocus("vertical"));
  act(() => result.current.onLayout(layout(320)));
  act(() => result.current.onContentSizeChange(600, 80));
  expect(result.current.tabIndex).toBe(-1);
  act(() => result.current.onContentSizeChange(320, 300));
  expect(result.current.tabIndex).toBe(0);
  act(() => result.current.onContentSizeChange(320, 40));
  expect(result.current.tabIndex).toBe(-1);
});

it("waits for both native measurements before exposing overflowing content to the keyboard", () => {
  const { result } = renderHook(useHorizontalScrollFocus);
  expect(result.current.focusable).toBe(false);
  expect(result.current.tabIndex).toBe(-1);
  act(() => result.current.onContentSizeChange(900, 80));
  expect(result.current.tabIndex).toBe(-1);
  act(() => result.current.onLayout(layout(320)));
  expect(result.current.focusable).toBe(true);
  expect(result.current.tabIndex).toBe(0);
});

it("updates keyboard access when the container grows and shrinks without remounting", () => {
  const { result } = renderHook(useHorizontalScrollFocus);
  act(() => result.current.onLayout(layout(500)));
  act(() => result.current.onContentSizeChange(450, 80));
  expect(result.current.tabIndex).toBe(-1);
  act(() => result.current.onLayout(layout(300)));
  expect(result.current.focusable).toBe(true);
  act(() => result.current.onLayout(layout(450)));
  expect(result.current.focusable).toBe(false);
  expect(result.current.tabIndex).toBe(-1);
});

it("tracks changed snippet or table content independently of viewport layout", () => {
  const { result } = renderHook(useHorizontalScrollFocus);
  act(() => result.current.onLayout(layout(320)));
  act(() => result.current.onContentSizeChange(800, 80));
  expect(result.current.tabIndex).toBe(0);
  act(() => result.current.onContentSizeChange(320, 240));
  expect(result.current.tabIndex).toBe(-1);
  act(() => result.current.onContentSizeChange(600, 80));
  expect(result.current.tabIndex).toBe(0);
  act(() => result.current.onLayout(layout(0)));
  expect(result.current.focusable).toBe(false);
});
