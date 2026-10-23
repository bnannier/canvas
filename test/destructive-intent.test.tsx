import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Alert } from "../src/molecules/alert/alert.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// The danger intent is spelled `destructive` across the kit (Button, AlertDialog, every chart)
// and in the design hand-off, Alert, Chip and Toast included (their old `error` alias was removed
// on 2026-10-23). These tests pin that the name paints the danger tone.

/** Every backgroundColor/color/borderColor in a subtree, as a stable signature of the tone. */
function paint(root: HTMLElement): string[] {
  return [...root.querySelectorAll<HTMLElement>("*")]
    .flatMap((el) => [el.style.backgroundColor, el.style.color, el.style.borderColor])
    .filter(Boolean);
}

describe("destructive is the intent-axis name", () => {
  it("Alert: destructive paints its own tone, distinct from the neutral default", () => {
    const destructive = paint(ui(<Alert destructive title="Payment failed" />).container);
    cleanup();
    const neutral = paint(ui(<Alert title="Payment failed" />).container);

    expect(destructive.length).toBeGreaterThan(0);
    expect(destructive).not.toEqual(neutral);
  });

  it("Chip: destructive resolves to its own hue, distinct from success", () => {
    const destructive = paint(ui(<Chip destructive>Failing</Chip>).container);
    cleanup();
    const success = paint(ui(<Chip success>Passing</Chip>).container);

    expect(destructive.length).toBeGreaterThan(0);
    expect(destructive).not.toEqual(success);
  });

  it("destructive does not displace the other tones on the same axis", () => {
    // The axis is success / warning / destructive / info / neutral. Adding a name to one member
    // must not perturb the precedence of the rest.
    const warning = paint(ui(<Alert warning title="Low disk space" />).container);
    cleanup();
    const destructive = paint(ui(<Alert destructive title="Low disk space" />).container);
    expect(warning).not.toEqual(destructive);
  });
});
