import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Platform } from "react-native";
import { Calendar } from "../src/organisms/calendar/calendar.tsx";
import { Calendar as CalendarIOS } from "../src/organisms/calendar/calendar.ios.tsx";
import { Calendar as CalendarAndroid } from "../src/organisms/calendar/calendar.android.tsx";
import { calendarDayAccessibility } from "../src/organisms/calendar/calendar.accessibility.ts";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

for (const [platform, Component] of [["web", Calendar], ["ios", CalendarIOS], ["android", CalendarAndroid]] as const) {
  describe(`${platform} Calendar skin in the browser runtime`, () => {
    for (const week of [false, true]) {
      it(`reports the selected ${week ? "week" : "month"} day as a pressed button and updates on selection`, () => {
        const selected: number[] = [];
        const { container, getByRole } = render(<ThemeProvider><Component week={week} month="June 2026"
          daysInMonth={30} startWeekday={1} defaultSelected={10} onSelect={(day) => selected.push(day)} /></ThemeProvider>);
        expect(getByRole("button", { name: "10, selected" }).getAttribute("aria-pressed")).toBe("true");
        const next = getByRole("button", { name: "11", exact: true });
        expect(next.getAttribute("aria-pressed")).toBe("false");
        fireEvent.click(next);
        expect(getByRole("button", { name: "11, selected" }).getAttribute("aria-pressed")).toBe("true");
        expect(getByRole("button", { name: "10", exact: true }).getAttribute("aria-pressed")).toBe("false");
        expect(container.querySelector('button[aria-selected]')).toBeNull();
        expect(selected).toEqual([11]);
      });
    }

    it("announces both selected range endpoints and preserves the in-range description", () => {
      const { container, getByRole } = render(<ThemeProvider><Component range month="June 2026"
        daysInMonth={30} startWeekday={1} defaultRangeStart={8} defaultRangeEnd={14} /></ThemeProvider>);
      expect(getByRole("button", { name: "8, selected, start of range" }).getAttribute("aria-pressed")).toBe("true");
      expect(getByRole("button", { name: "14, selected, end of range" }).getAttribute("aria-pressed")).toBe("true");
      expect(getByRole("button", { name: "10, in range" }).getAttribute("aria-pressed")).toBe("false");
      expect(container.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(2);
      expect(container.querySelector('button[aria-selected]')).toBeNull();
    });
  });
}

for (const platform of ["ios", "android"] as const) {
  it(`preserves the selected native accessibility trait on ${platform}`, () => {
    // RNW's Platform.select always selects web. Exercise the actual native
    // metadata branch without changing the platform used by other test files.
    const select = spyOn(Platform, "select").mockImplementation((specifics) =>
      specifics[platform] ?? specifics.native ?? specifics.default,
    );
    try {
      for (const selected of [false, true]) {
        const metadata = calendarDayAccessibility(selected);
        expect(metadata.accessibilityState).toEqual({ selected });
        expect(metadata["aria-pressed"]).toBeUndefined();
        expect(metadata["aria-selected"]).toBeUndefined();
      }
    } finally {
      select.mockRestore();
    }
  });
}
