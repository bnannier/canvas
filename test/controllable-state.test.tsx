import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
import { useControllableState } from "../src/style/use-controllable-state.ts";
import { Listbox } from "../src/atoms/listbox/listbox.tsx";
import { Calendar } from "../src/organisms/calendar/calendar.tsx";

// useControllableState's own contract, the one controlled-and-uncontrolled implementation
// every kit control shares: the mode is latched at mount, the change callback fires in
// both modes, and a controlled value cleared to undefined keeps the LAST value the parent
// gave (React's own controlled-input semantics), never the value it mounted with, with a
// development warning on either mode switch.

let warn: ReturnType<typeof spyOn>;
beforeEach(() => {
  resetDevWarnings();
  warn = spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
  cleanup();
});

const warnings = () => warn.mock.calls.map((call) => String(call[0])).filter((message) => message.includes("useControllableState"));
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

type Props = { value: number | undefined };

function hook(initial: number | undefined, defaultValue = 0) {
  const changes: number[] = [];
  const rendered = renderHook(({ value }: Props) => useControllableState<number>(value, defaultValue, (next) => changes.push(next)), { initialProps: { value: initial } });
  return { ...rendered, changes };
}

describe("useControllableState", () => {
  it("controlled: renders the parent's value, and a set only reports it", () => {
    const { result, rerender, changes } = hook(5);
    expect(result.current[0]).toBe(5);
    act(() => result.current[1](9));
    expect(changes).toEqual([9]);
    // The parent owns the value: nothing moves until it passes the new one.
    expect(result.current[0]).toBe(5);
    rerender({ value: 9 });
    expect(result.current[0]).toBe(9);
    expect(warnings()).toEqual([]);
  });

  it("controlled, changed, then cleared to undefined: keeps the last value and warns once", () => {
    const { result, rerender } = hook(5);
    rerender({ value: 7 });
    expect(result.current[0]).toBe(7);
    rerender({ value: undefined });
    // Before, it fell back to the value it mounted with (5).
    expect(result.current[0]).toBe(7);
    rerender({ value: undefined });
    expect(result.current[0]).toBe(7);
    expect(warnings()).toHaveLength(1);
    expect(warnings()[0]).toContain("value became undefined");
    // It stays controlled: the parent's next value wins again.
    rerender({ value: 3 });
    expect(result.current[0]).toBe(3);
  });

  it("uncontrolled: starts at the default, holds its own state and reports each set", () => {
    const { result, changes } = hook(undefined, 2);
    expect(result.current[0]).toBe(2);
    act(() => result.current[1](4));
    expect(result.current[0]).toBe(4);
    expect(changes).toEqual([4]);
    expect(warnings()).toEqual([]);
  });

  it("latches the mode: an uncontrolled component given a value later keeps its own state and warns once", () => {
    const { result, rerender } = hook(undefined, 2);
    act(() => result.current[1](4));
    rerender({ value: 8 });
    expect(result.current[0]).toBe(4);
    rerender({ value: 9 });
    expect(warnings()).toHaveLength(1);
    expect(warnings()[0]).toContain("given a value after it mounted");
  });
});

describe("a controlled selection its parent clears keeps the last selection", () => {
  const items = [{ label: "Backend" }, { label: "Frontend" }, { label: "Design" }];
  const selectedRows = (container: HTMLElement) =>
    [...container.querySelectorAll('[role="option"]')].map((row) => row.getAttribute("aria-selected"));

  it("Listbox", () => {
    const { container, rerender } = ui(<Listbox items={items} selected={0} />);
    rerender(<ThemeProvider><Listbox items={items} selected={2} /></ThemeProvider>);
    expect(selectedRows(container)).toEqual(["false", "false", "true"]);
    rerender(<ThemeProvider><Listbox items={items} selected={undefined} /></ThemeProvider>);
    expect(selectedRows(container)).toEqual(["false", "false", "true"]);
  });

  it("Calendar", () => {
    const selectedDays = (container: HTMLElement) =>
      [...container.querySelectorAll("[aria-label]")].map((node) => node.getAttribute("aria-label")!).filter((name) => /^\d+, selected/.test(name));
    const { container, rerender } = ui(<Calendar selected={5} />);
    rerender(<ThemeProvider><Calendar selected={12} /></ThemeProvider>);
    expect(selectedDays(container)).toEqual(["12, selected"]);
    rerender(<ThemeProvider><Calendar selected={undefined} /></ThemeProvider>);
    expect(selectedDays(container)).toEqual(["12, selected"]);
  });
});
