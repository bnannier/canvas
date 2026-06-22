import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Accordion } from "../src/molecules/accordion/accordion.tsx";
import { ActionSheet } from "../src/organisms/action-sheet/action-sheet.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Accordion", () => {
  it("toggles a panel's expanded state on header press", () => {
    const { container } = ui(<Accordion items={[{ key: "a", title: "Section A", content: "Body A" }]} />);
    const before = container.querySelector("[aria-expanded]");
    expect(before?.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(screen.getByText("Section A"));
    expect(container.querySelector("[aria-expanded]")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("does not toggle a disabled item", () => {
    const { container } = ui(<Accordion items={[{ key: "a", title: "Locked", content: "x", disabled: true }]} />);
    fireEvent.click(screen.getByText("Locked"));
    expect(container.querySelector("[aria-expanded]")?.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("ActionSheet", () => {
  it("runs an action's handler and requests close", () => {
    let picked = "";
    let closed = false;
    ui(
      <ActionSheet
        open
        onOpenChange={(o) => { if (!o) closed = true; }}
        actions={[{ label: "Delete", destructive: true, onPress: () => { picked = "Delete"; } }]}
      />,
    );
    fireEvent.click(screen.getByText("Delete"));
    expect(picked).toBe("Delete");
    expect(closed).toBe(true);
  });
});
