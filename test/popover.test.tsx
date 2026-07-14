import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Popover } from "../src/atoms/popover/popover.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Popover", () => {
  it("the trigger announces the popup relationship and its open state", () => {
    const { container } = ui(<Popover trigger="Open" title="Title" description="Body" />);
    const trigger = container.querySelector("[aria-haspopup]") as HTMLElement;
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(screen.getByText("Open"));
    expect(container.querySelector("[aria-haspopup]")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("Escape dismisses the open popover", () => {
    ui(<Popover trigger="Open" title="Title" description="Body" />);
    fireEvent.click(screen.getByText("Open"));
    expect(screen.queryByText("Body")).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Body")).toBeNull();
  });

  it("moves focus into the panel when it opens", () => {
    ui(<Popover trigger="Open" title="Title" description="Body" />);
    fireEvent.click(screen.getByText("Open"));
    const panel = document.querySelector('[role="dialog"]');
    expect(panel).not.toBeNull();
    expect(document.activeElement).toBe(panel);
  });
});
