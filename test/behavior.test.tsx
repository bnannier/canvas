import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Pagination } from "../src/atoms/pagination/pagination.tsx";
import { Radio } from "../src/atoms/radio/radio.tsx";
import { Combobox } from "../src/atoms/combobox/combobox.tsx";
import { Calendar } from "../src/organisms/calendar/calendar.tsx";

// Behavior tests for the interactive components' real logic (paging clamp, query
// filtering, date selection, radio toggle) — not just rendering.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

describe("Pagination", () => {
  it("reports the clicked page number", () => {
    let page = 2;
    ui(<Pagination page={2} total={5} onChange={(p) => { page = p; }} />);
    fireEvent.click(screen.getByText("4"));
    expect(page).toBe(4);
  });

  it("does not fire onChange when Previous is pressed on page 1", () => {
    let called = false;
    const { container } = ui(<Pagination page={1} total={5} onChange={() => { called = true; }} />);
    const prev = container.querySelector('[aria-label="Previous page"]');
    expect(prev).not.toBeNull();
    fireEvent.click(prev as Element);
    expect(called).toBe(false);
  });
});

describe("Combobox", () => {
  it("filters the option list by the query", () => {
    const { container } = ui(
      <Combobox open options={["Apple", "Banana", "Avocado"]} query="av" onSelect={() => {}} />,
    );
    const opts = container.querySelectorAll('[role="option"]');
    expect(opts.length).toBe(1);
    expect(opts[0].textContent?.includes("Avocado")).toBe(true);
  });

  it("shows a no-results state when nothing matches", () => {
    ui(<Combobox open options={["Apple", "Banana"]} query="zzz" onSelect={() => {}} />);
    expect(screen.getByText("No results")).toBeDefined();
  });
});

describe("Calendar", () => {
  it("reports the clicked day and marks the selected day", () => {
    let picked = 0;
    const { container } = ui(<Calendar selected={10} onSelect={(d) => { picked = d; }} />);
    const sel = container.querySelector('[aria-selected="true"]');
    expect(sel?.textContent).toBe("10");
    fireEvent.click(screen.getByText("15"));
    expect(picked).toBe(15);
  });
});

describe("Radio", () => {
  it("reports checked on press and reflects aria-checked", () => {
    let toggled = false;
    const { container } = ui(<Radio checked={false} onChange={() => { toggled = true; }}>Option A</Radio>);
    expect(container.querySelector("[aria-checked]")?.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(screen.getByText("Option A"));
    expect(toggled).toBe(true);
  });
});
