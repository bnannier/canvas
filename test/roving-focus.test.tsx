import { describe, expect, it } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useRovingFocus, type RovingFocusOptions } from "../src/style/use-roving-focus.ts";

// useRovingFocus's own contract (the WAI-ARIA roving tab stop Tabs, RadioGroup and Listbox
// share): one tab stop, the arrows, Home and End move and activate, and a disabled item
// is the hook's to skip, so no owner can forget it. Rendered under react-native-web, so
// the item props are the web branch's.

type Options = Omit<RovingFocusOptions, "onActivate">;

function roving(options: Options) {
  const activated: number[] = [];
  const focused: number[] = [];
  const { result, rerender } = renderHook((props: Options) => useRovingFocus({ ...props, onActivate: (i) => activated.push(i) }), { initialProps: options });
  // Register a focusable node per item, as an owner's Pressables do through `ref`.
  const register = () => {
    for (let i = 0; i < options.count; i++) result.current.getItemProps(i).ref({ focus: () => focused.push(i) });
  };
  register();
  const key = (index: number, name: string) => {
    let prevented = false;
    result.current.getItemProps(index).onKeyDown({ key: name, preventDefault: () => { prevented = true; } });
    return prevented;
  };
  const stops = () => Array.from({ length: options.count }, (_, i) => result.current.getItemProps(i).tabIndex);
  return { activated, focused, key, stops, rerender };
}

const DISABLED = new Set([1, 3]);
const isDisabled = (i: number) => DISABLED.has(i);

describe("useRovingFocus", () => {
  it("makes the active item the one tab stop and moves with the arrows, wrapping by default", () => {
    const { activated, focused, key, stops } = roving({ count: 3, active: 0 });
    expect(stops()).toEqual([0, -1, -1]);
    expect(key(0, "ArrowRight")).toBe(true);
    expect(key(0, "ArrowLeft")).toBe(true);
    expect(activated).toEqual([1, 2]);
    expect(focused).toEqual([1, 2]);
  });

  it("skips a disabled item in the direction of travel, wrapping with loop", () => {
    const { activated, key } = roving({ count: 5, active: 0, isDisabled });
    key(0, "ArrowRight");
    expect(activated.at(-1)).toBe(2);
    key(0, "ArrowLeft");
    expect(activated.at(-1)).toBe(4);
  });

  it("stops at the ends without loop, never landing on a disabled end", () => {
    const { activated, key } = roving({ count: 4, active: 2, isDisabled, loop: false });
    // Forward from 2: 3 is disabled and the end follows, so nothing moves.
    key(2, "ArrowRight");
    expect(activated).toEqual([]);
    key(2, "ArrowLeft");
    expect(activated).toEqual([0]);
  });

  it("takes Home and End to the first and last enabled items", () => {
    const { activated, key } = roving({ count: 4, active: 2, isDisabled: (i) => i === 0 || i === 3 });
    key(2, "Home");
    key(2, "End");
    expect(activated).toEqual([1, 2]);
  });

  it("hands the tab stop, and the walk's start, to the first enabled item when the active one is disabled", () => {
    const { activated, key, stops } = roving({ count: 5, active: 1, isDisabled });
    expect(stops()).toEqual([0, -1, -1, -1, -1]);
    key(0, "ArrowRight");
    expect(activated).toEqual([2]);
  });

  it("does nothing, and offers no tab stop, when every item is disabled", () => {
    const { activated, key, stops } = roving({ count: 3, active: 0, isDisabled: () => true });
    expect(stops()).toEqual([-1, -1, -1]);
    for (const name of ["ArrowRight", "ArrowLeft", "Home", "End"]) key(0, name);
    expect(activated).toEqual([]);
  });

  it("follows the orientation: vertical takes Up and Down, horizontal leaves them alone", () => {
    const vertical = roving({ count: 3, active: 0, orientation: "vertical", isDisabled: (i) => i === 1 });
    expect(vertical.key(0, "ArrowDown")).toBe(true);
    expect(vertical.activated).toEqual([2]);
    expect(vertical.key(0, "ArrowRight")).toBe(false);
    const horizontal = roving({ count: 3, active: 0 });
    expect(horizontal.key(0, "ArrowDown")).toBe(false);
    expect(horizontal.activated).toEqual([]);
  });

  it("mirrors the horizontal arrows in a right-to-left layout", () => {
    const { activated, key } = roving({ count: 3, active: 1, rtl: true });
    key(1, "ArrowLeft");
    key(1, "ArrowRight");
    expect(activated).toEqual([2, 0]);
  });
});
