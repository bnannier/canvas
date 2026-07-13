import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Kbd } from "../src/atoms/kbd/kbd.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Kbd", () => {
  it("renders a single cap from children with no chord wrapper", () => {
    const { container } = ui(<Kbd>Esc</Kbd>);
    expect(container.textContent).toBe("Esc");
    // The single-cap path carries no combined accessible name (it is one cap).
    expect(container.querySelector("[aria-label]")).toBeNull();
  });

  it("composes a combo from a space-separated keys string with + separators", () => {
    const { container } = ui(<Kbd keys="⌘ K" />);
    const chord = container.querySelector('[aria-label="⌘+K"]');
    expect(chord).not.toBeNull();
    // Two caps joined by a "+" separator, in order.
    expect(chord?.textContent).toBe("⌘+K");
  });

  it("composes a combo from an array of keys", () => {
    const { container } = ui(<Kbd keys={["⌘", "⇧", "P"]} />);
    const chord = container.querySelector('[aria-label="⌘+⇧+P"]');
    expect(chord).not.toBeNull();
    expect(chord?.textContent).toBe("⌘+⇧+P");
  });

  it("renders a sequence with a gap and no + joiner", () => {
    const { container } = ui(<Kbd keys="⌘K ⌘S" sequence />);
    // Sequence joins the accessible name with a space, not a "+".
    const chord = container.querySelector('[aria-label="⌘K ⌘S"]');
    expect(chord).not.toBeNull();
    expect(chord?.textContent).toBe("⌘K⌘S");
    expect(container.textContent).not.toContain("+");
  });

  it("treats a single-entry keys list like one cap (no separator, no combined name)", () => {
    const { container } = ui(<Kbd keys="Esc" />);
    expect(container.textContent).toBe("Esc");
    expect(container.querySelector("[aria-label]")).toBeNull();
  });

  it("hides the individual caps from assistive tech so only the shortcut name is read", () => {
    const { container } = ui(<Kbd keys="⌘ K" />);
    // Every cap and separator is aria-hidden; the wrapper's aria-label is the one name.
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(hidden.length).toBeGreaterThanOrEqual(3); // 2 caps + 1 separator
  });
});
