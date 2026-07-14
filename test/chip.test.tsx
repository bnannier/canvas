import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Chip", () => {
  it("interactive + removable renders two sibling buttons (no button-in-button)", () => {
    const { container } = ui(
      <Chip selectable onPress={() => {}} onRemove={() => {}}>Tag</Chip>,
    );
    const buttons = [...container.querySelectorAll('[role="button"]')];
    expect(buttons.length).toBe(2);
    // Neither button contains the other: the invalid nesting is gone.
    expect(buttons[0].contains(buttons[1])).toBe(false);
    expect(buttons[1].contains(buttons[0])).toBe(false);
  });

  it("pressing remove fires only onRemove, never the toggle", () => {
    let toggled = 0;
    let removed = 0;
    ui(
      <Chip selectable onPress={() => { toggled += 1; }} onRemove={() => { removed += 1; }}>Tag</Chip>,
    );
    fireEvent.click(screen.getByLabelText("Remove Tag"));
    expect(removed).toBe(1);
    expect(toggled).toBe(0);
  });

  it("interactive without a remove control stays a single button", () => {
    const { container } = ui(<Chip selectable onPress={() => {}}>Tag</Chip>);
    expect(container.querySelectorAll('[role="button"]').length).toBe(1);
  });
});
