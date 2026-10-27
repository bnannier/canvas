import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Kbd } from "../src/atoms/kbd/kbd.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { channelsOf } from "../src/style/color.ts";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Kbd", () => {
  it("renders a single cap from children with no chord wrapper", () => {
    const { container } = ui(<Kbd>Esc</Kbd>);
    expect(container.textContent).toBe("Esc");
    // The single-cap path carries no combined accessible name (it is one cap).
    expect(container.querySelector("[aria-label]")).toBeNull();
  });

  it("composes a combo from a space-separated keys string, the caps side by side", () => {
    const { container } = ui(<Kbd keys="⌘ K" />);
    const chord = container.querySelector('[aria-label="⌘+K"]');
    expect(chord).not.toBeNull();
    // Two caps in order, with no joiner drawn between them (the hand-off's combo).
    expect(chord?.textContent).toBe("⌘K");
  });

  it("composes a combo from an array of keys", () => {
    const { container } = ui(<Kbd keys={["⌘", "⇧", "P"]} />);
    const chord = container.querySelector('[aria-label="⌘+⇧+P"]');
    expect(chord).not.toBeNull();
    expect(chord?.textContent).toBe("⌘⇧P");
  });

  it("renders a sequence with \"then\" between the caps", () => {
    const { container } = ui(<Kbd keys="⌘K ⌘S" sequence />);
    const chord = container.querySelector('[aria-label="⌘K then ⌘S"]');
    expect(chord).not.toBeNull();
    expect(chord?.textContent).toBe("⌘Kthen⌘S");
    expect(container.textContent).not.toContain("+");
  });

  it("treats a single-entry keys list like one cap (no separator, no combined name)", () => {
    const { container } = ui(<Kbd keys="Esc" />);
    expect(container.textContent).toBe("Esc");
    expect(container.querySelector("[aria-label]")).toBeNull();
  });

  it("hides the individual caps from assistive tech so only the shortcut name is read", () => {
    const { container } = ui(<Kbd keys="⌘ K" />);
    // Every cap is aria-hidden; the wrapper's aria-label is the one name.
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(hidden.length).toBeGreaterThanOrEqual(2);
  });

  // The hand-off's cap (`K.def('kbd')` in tools/v4/handoff/cv-kit-controls.js).
  it("draws the hand-off's 24px cap: 6px sides and corner, the raised fill inside the field border with a 2px bottom", () => {
    const { container } = ui(<Kbd testID="k">Esc</Kbd>);
    const cap = container.querySelector('[data-testid="k"]') as HTMLElement;
    expect(cap.style.height).toBe("24px");
    expect(cap.style.minWidth).toBe("24px");
    expect(cap.style.paddingLeft || cap.style.paddingInlineStart).toBe("6px");
    expect(cap.style.borderBottomWidth).toBe("2px");
    expect(cap.style.borderTopWidth).toBe("1px");
    expect(cap.style.borderTopLeftRadius || cap.style.borderRadius).toBe("6px");
    expect(channelsOf(cap.style.backgroundColor)?.slice(0, 3)).toEqual(channelsOf(lightColors.secondary)!.slice(0, 3));
    expect(channelsOf(cap.style.borderTopColor)).toEqual(channelsOf(lightColors["field-border"]!));
    const label = screen.getByText("Esc");
    expect(label.style.fontSize).toBe("12px");
    expect(label.style.fontWeight).toBe("500");
    expect(channelsOf(label.style.color)?.slice(0, 3)).toEqual(channelsOf(lightColors.foreground)!.slice(0, 3));
  });

  it("sets a sequence's \"then\" in the 400 11px subtle ink, and spaces caps 4px apart", () => {
    const { container } = ui(<Kbd testID="s" keys="G C" sequence />);
    const then = screen.getByText("then");
    expect(then.style.fontSize).toBe("11px");
    expect(then.style.fontWeight).toBe("400");
    expect(channelsOf(then.style.color)?.slice(0, 3)).toEqual(channelsOf(lightColors["subtle-foreground"]!)!.slice(0, 3));
    expect((container.querySelector('[data-testid="s"]') as HTMLElement).style.gap).toBe("4px");
  });
});
