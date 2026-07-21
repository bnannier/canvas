import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import type { TextInput } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Pagination } from "../src/atoms/pagination/pagination.tsx";
import { Radio } from "../src/atoms/radio/radio.tsx";
import { RadioGroup } from "../src/atoms/radio/radio-group.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { ButtonGroup } from "../src/atoms/button-group/button-group.tsx";
import { Listbox } from "../src/atoms/listbox/listbox.tsx";
import { Calendar } from "../src/organisms/calendar/calendar.tsx";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";

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

describe("Autocomplete", () => {
  it("filters the option list by the query", () => {
    const { container } = ui(
      <Autocomplete open options={["Apple", "Banana", "Avocado"]} query="av" onSelect={() => {}} />,
    );
    const opts = container.querySelectorAll('[role="option"]');
    expect(opts.length).toBe(1);
    expect(opts[0].textContent?.includes("Avocado")).toBe(true);
  });

  it("shows a no-results state when nothing matches", () => {
    ui(<Autocomplete open options={["Apple", "Banana"]} query="zzz" onSelect={() => {}} />);
    expect(screen.getByText("No results")).toBeDefined();
  });

  it("is typeable out of the box: keystrokes filter the list (uncontrolled query)", () => {
    const { container } = ui(<Autocomplete open options={["Apple", "Banana", "Avocado"]} onSelect={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText("Search…"), { target: { value: "ban" } });
    const opts = container.querySelectorAll('[role="option"]');
    expect(opts.length).toBe(1);
    expect(opts[0].textContent?.includes("Banana")).toBe(true);
  });

  it("reports each keystroke through onQueryChange", () => {
    let typed = "";
    ui(<Autocomplete open options={["Apple"]} onQueryChange={(q) => { typed = q; }} />);
    fireEvent.change(screen.getByPlaceholderText("Search…"), { target: { value: "ap" } });
    expect(typed).toBe("ap");
  });

  it("seeds the filter from defaultQuery and forwards a ref to the text field", () => {
    const ref = createRef<TextInput>();
    const { container } = ui(
      <Autocomplete ref={ref} open defaultQuery="av" options={["Apple", "Banana", "Avocado"]} onSelect={() => {}} />,
    );
    expect(container.querySelectorAll('[role="option"]').length).toBe(1);
    expect(typeof ref.current?.focus).toBe("function");
  });

  it("resets the query on select so the field falls back to the value", () => {
    let query = "unset";
    const { container } = ui(
      <Autocomplete open defaultQuery="av" options={["Avocado"]} onSelect={() => {}} onQueryChange={(q) => { query = q; }} />,
    );
    fireEvent.click(container.querySelector('[role="option"]') as Element);
    expect(query).toBe("");
  });

  it("shows the selected value in the field when there is no query", () => {
    ui(<Autocomplete options={["Devon Webb"]} value="Devon Webb" onSelect={() => {}} />);
    expect(screen.getByDisplayValue("Devon Webb")).toBeDefined();
  });

  it("clears the selection when the field is erased, so the value does not snap back (uncontrolled)", () => {
    const { container } = ui(
      <Autocomplete open defaultValue="Devon Webb" options={["Devon Webb", "Tom Cook"]} onSelect={() => {}} />,
    );
    const input = container.querySelector("input") as HTMLInputElement;
    // At rest the field shows the committed selection via the display fallback.
    expect(input.value).toBe("Devon Webb");
    // Erasing to empty must leave the field empty, not snap the value back in.
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
  });

  it("sets a displayName for DevTools/stack traces", () => {
    expect((Autocomplete as { displayName?: string }).displayName).toBe("Autocomplete");
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

  it("marks days with events and counts them in the accessible name", () => {
    const { container } = ui(
      <Calendar selected={10} events={[{ day: 15 }, { day: 15, title: "Review", start: 11 }, { day: 20 }]} />,
    );
    expect(container.querySelector('[aria-label="15, 2 events"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="20, 1 event"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="16"]')).not.toBeNull();
  });

  it("week view shows the selected day's week and pages by week within the month", () => {
    let crossed = false;
    const { container } = ui(
      <Calendar week defaultSelected={10} daysInMonth={30} startWeekday={1} onPrev={() => { crossed = true; }} />,
    );
    // startWeekday=1 → day 10 falls in the week of days 7..13.
    expect(screen.getByText("7")).toBeTruthy();
    expect(screen.getByText("13")).toBeTruthy();
    expect(screen.queryByText("14")).toBeNull();
    const prev = container.querySelector('[aria-label="Previous week"]') as Element;
    fireEvent.click(prev); // pages to the partial first week, selecting its first in-month day
    expect(container.querySelector('[aria-selected="true"]')?.textContent).toBe("1");
    fireEvent.click(prev); // already the first week → hands the press to onPrev
    expect(crossed).toBe(true);
  });

  it("day view renders the timed events with their hours and pages by day", () => {
    const { container } = ui(
      <Calendar
        day
        month="May 2026"
        defaultSelected={24}
        daysInMonth={31}
        startWeekday={4}
        events={[{ day: 24, title: "Sprint planning", start: 9 }, { day: 24, title: "Design review", start: 11.5, end: 13 }]}
      />,
    );
    expect(screen.getByText("Sprint planning")).toBeTruthy();
    expect(screen.getByText("11:30 AM – 1 PM")).toBeTruthy();
    // startWeekday 4 puts the 1st on Thursday → the 24th lands on Saturday.
    expect(screen.getByText("Saturday, May 24")).toBeTruthy();
    fireEvent.click(container.querySelector('[aria-label="Next day"]') as Element);
    expect(screen.getByText("Sunday, May 25")).toBeTruthy();
  });

  it("dayPeek opens the pressed day's timeline in a peek card and skips event-less days", () => {
    const { container } = ui(
      <Calendar
        dayPeek
        month="May 2026"
        daysInMonth={31}
        startWeekday={4}
        events={[
          { day: 24, title: "Sprint planning", start: 9, end: 10.5 },
          { day: 14, title: "1:1 with manager", start: 14 },
          { day: 8, title: "Offsite" },
        ]}
      />,
    );
    // Closed until a day with events is pressed.
    expect(screen.queryByText("Saturday, May 24")).toBeNull();
    fireEvent.click(container.querySelector('[aria-label="24, 1 event"]') as Element);
    expect(screen.getByText("Saturday, May 24")).toBeTruthy();
    expect(screen.getByText("Sprint planning")).toBeTruthy();
    expect(screen.getByText("9 AM – 10:30 AM")).toBeTruthy();
    // Pressing another event day moves the peek there.
    fireEvent.click(container.querySelector('[aria-label="14, 1 event"]') as Element);
    expect(screen.queryByText("Saturday, May 24")).toBeNull();
    expect(screen.getByText("Wednesday, May 14")).toBeTruthy();
    // An untimed event lists as a title row (no timeline needed).
    fireEvent.click(container.querySelector('[aria-label="8, 1 event"]') as Element);
    expect(screen.getByText("Offsite")).toBeTruthy();
    // An event-less day closes the peek instead of showing an empty card.
    fireEvent.click(screen.getByText("16"));
    expect(screen.queryByText(/May 16/)).toBeNull();
    expect(screen.queryByText("Offsite")).toBeNull();
  });

  it("fires onEventPress with the pressed event block", () => {
    let pressed = "";
    ui(
      <Calendar
        day
        defaultSelected={10}
        events={[{ day: 10, title: "Standup", start: 9, end: 9.5 }]}
        onEventPress={(e) => { pressed = e.title ?? ""; }}
      />,
    );
    fireEvent.click(screen.getByText("Standup"));
    expect(pressed).toBe("Standup");
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

  it("renders the built-in title and description without hand-composed layout", () => {
    ui(<Radio checked description="For growing teams that need more control.">Pro</Radio>);
    expect(screen.getByText("Pro")).not.toBeNull();
    expect(screen.getByText("For growing teams that need more control.")).not.toBeNull();
  });
});

describe("RadioGroup", () => {
  it("selects on press and moves the single selection to the pressed option", () => {
    let picked: string | number | undefined;
    const { container } = ui(
      <RadioGroup defaultValue="pro" onChange={(v) => { picked = v; }}>
        <Radio value="hobby" description="For personal projects.">Hobby</Radio>
        <Radio value="pro" description="For growing teams.">Pro</Radio>
        <Radio value="enterprise" description="Advanced security.">Enterprise</Radio>
      </RadioGroup>,
    );
    // Exactly one option is chosen out of the box (defaultValue).
    const checked = Array.from(container.querySelectorAll('[aria-checked="true"]'));
    expect(checked.length).toBe(1);
    // Pressing another option moves the selection to it.
    fireEvent.click(screen.getByText("Enterprise"));
    expect(picked).toBe("enterprise");
    expect(container.querySelectorAll('[aria-checked="true"]').length).toBe(1);
  });

  it("renders its label as the group heading and names the radiogroup with it", () => {
    const { container } = ui(
      <RadioGroup label="Plan" description="Pick the tier that fits." defaultValue="pro">
        <Radio value="hobby">Hobby</Radio>
        <Radio value="pro">Pro</Radio>
      </RadioGroup>,
    );
    // The visible heading and supporting line render above the options.
    expect(screen.getByText("Plan")).toBeTruthy();
    expect(screen.getByText("Pick the tier that fits.")).toBeTruthy();
    // The radiogroup node itself takes the label as its accessible name (the
    // aria-label alias is what RNW forwards to the DOM).
    const group = container.querySelector('[role="radiogroup"]') as HTMLElement;
    expect(group.getAttribute("aria-label")).toBe("Plan");
  });
});

describe("ButtonGroup", () => {
  it("marks the active segment and reports the pressed index", () => {
    let idx = -1;
    const { container } = ui(<ButtonGroup items={["Day", "Week", "Month"]} active={0} onSelect={(i) => { idx = i; }} />);
    const selected = Array.from(container.querySelectorAll("[aria-selected]")).map((e) => e.getAttribute("aria-selected"));
    expect(selected.filter((s) => s === "true").length).toBe(1);
    fireEvent.click(screen.getByText("Month"));
    expect(idx).toBe(2);
  });
});

describe("Listbox", () => {
  it("marks the selected item and reports the pressed index", () => {
    let sel = -1;
    const { container } = ui(
      <Listbox items={[{ label: "One", selected: true }, { label: "Two" }]} onSelect={(i) => { sel = i; }} />,
    );
    expect(container.querySelector('[aria-selected="true"]')).not.toBeNull();
    fireEvent.click(screen.getByText("Two"));
    expect(sel).toBe(1);
  });
});

describe("DataTable", () => {
  it("renders headers and cells and reports the pressed row", () => {
    let pressed = -1;
    ui(
      <DataTable
        columns={["Name", "Role"]}
        rows={[["Ada", "Eng"], ["Bob", "PM"]]}
        onRowPress={(_row, i) => { pressed = i; }}
      />,
    );
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Ada")).toBeDefined();
    fireEvent.click(screen.getByText("Bob"));
    expect(pressed).toBe(1);
  });
});
