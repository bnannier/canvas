import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Stepper } from "../src/atoms/stepper/stepper.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

describe("Stepper decimal arithmetic", () => {
  it("emits and displays exact decimal steps in both directions and disables at each bound", () => {
    const values: number[] = [];
    const { getByLabelText, container } = render(
      <ThemeProvider><Stepper defaultValue={0} min={0} max={0.3} step={0.1}
        onChange={(value) => values.push(value)} /></ThemeProvider>,
    );
    const field = container.querySelector("input")!;
    const increase = getByLabelText("Increase");
    const decrease = getByLabelText("Decrease");
    for (const expected of [0.1, 0.2, 0.3]) {
      fireEvent.click(increase);
      expect(field.value).toBe(String(expected));
      expect(container.querySelector("[aria-valuenow]")?.getAttribute("aria-valuenow")).toBe(String(expected));
    }
    expect(increase.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(increase);
    expect(values).toEqual([0.1, 0.2, 0.3]);

    for (const expected of [0.2, 0.1, 0]) {
      fireEvent.click(decrease);
      expect(field.value).toBe(String(expected));
    }
    expect(decrease.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(decrease);
    expect(values).toEqual([0.1, 0.2, 0.3, 0.2, 0.1, 0]);
  });

  for (const example of [
    { name: "an offset with more decimal places than the step", initial: 0.05, step: 0.1, min: 0, max: 1, next: 0.15 },
    { name: "negative values", initial: -0.3, step: 0.1, min: -1, max: 1, next: -0.2 },
    { name: "an exponent-form step", initial: 2e-7, step: 1e-7, min: 0, max: 1, next: 3e-7 },
    { name: "an exponent-form offset", initial: 5e-8, step: 1e-7, min: 0, max: 1, next: 1.5e-7 },
    { name: "a tiny step beyond fixed-point formatting limits", initial: 2e-120, step: 1e-120, min: 0, max: 1, next: 3e-120 },
    { name: "a subnormal step", initial: 0, step: Number.MIN_VALUE, min: 0, max: 1, next: Number.MIN_VALUE },
    { name: "large exact integers", initial: Number.MAX_SAFE_INTEGER - 1, step: 1, min: 0, max: Number.MAX_SAFE_INTEGER, next: Number.MAX_SAFE_INTEGER },
    { name: "large exponent-form values", initial: 2e100, step: 1e100, min: 0, max: 1e101, next: 3e100 },
  ]) {
    it(`preserves ${example.name} through increment and decrement`, () => {
      const values: number[] = [];
      const { getByLabelText, container } = render(
        <ThemeProvider><Stepper defaultValue={example.initial} min={example.min} max={example.max}
          step={example.step} onChange={(value) => values.push(value)} /></ThemeProvider>,
      );
      fireEvent.click(getByLabelText("Increase"));
      expect(values).toEqual([example.next]);
      expect(container.querySelector("input")?.value).toBe(String(example.next));
      fireEvent.click(getByLabelText("Decrease"));
      expect(values).toEqual([example.next, example.initial]);
      expect(container.querySelector("input")?.value).toBe(String(example.initial));
    });
  }

  it("normalizes controlled callback payloads while leaving the displayed value parent-owned", () => {
    const values: number[] = [];
    const view = (value: number) => (
      <ThemeProvider><Stepper value={value} step={0.1} onChange={(next) => values.push(next)} /></ThemeProvider>
    );
    const { getByLabelText, container, rerender } = render(view(0.05));
    fireEvent.click(getByLabelText("Increase"));
    expect(values).toEqual([0.15]);
    expect(container.querySelector("input")?.value).toBe("0.05");
    rerender(view(0.15));
    expect(container.querySelector("input")?.value).toBe("0.15");
    fireEvent.click(getByLabelText("Decrease"));
    expect(values).toEqual([0.15, 0.05]);
    expect(container.querySelector("input")?.value).toBe("0.15");
  });

  it("preserves direct-entry precision and uses that offset on the next increment", () => {
    const values: number[] = [];
    const { getByLabelText, container } = render(
      <ThemeProvider><Stepper step={0.1} onChange={(value) => values.push(value)} /></ThemeProvider>,
    );
    const field = container.querySelector("input")!;
    fireEvent.change(field, { target: { value: "0.055" } });
    expect(field.value).toBe("0.055");
    expect(values).toEqual([0.055]);
    fireEvent.blur(field);
    fireEvent.click(getByLabelText("Increase"));
    expect(field.value).toBe("0.155");
    expect(values).toEqual([0.055, 0.155]);
  });

  it("clamps to an off-grid bound without rounding the bound to the step", () => {
    const values: number[] = [];
    const { getByLabelText, container } = render(
      <ThemeProvider><Stepper defaultValue={0.2} step={0.1} max={0.25}
        onChange={(value) => values.push(value)} /></ThemeProvider>,
    );
    fireEvent.click(getByLabelText("Increase"));
    expect(container.querySelector("input")?.value).toBe("0.25");
    expect(values).toEqual([0.25]);
    expect(getByLabelText("Increase").getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(getByLabelText("Decrease"));
    expect(values).toEqual([0.25, 0.15]);
  });
});
