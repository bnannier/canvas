import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Select } from "../src/atoms/select/select.tsx";
import { Select as IOSSelect } from "../src/atoms/select/select.ios.tsx";
import { Select as AndroidSelect } from "../src/atoms/select/select.android.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

for (const [platform, Component] of [["web", Select], ["ios", IOSSelect], ["android", AndroidSelect]] as const) {
  describe(`Select disabled lifecycle (${platform} skin)`, () => {
    it("suppresses a controlled open and leaves callbacks silent while disabled", () => {
      const selections: string[] = [];
      const openings: boolean[] = [];
      const { container, getByRole } = render(
        <ThemeProvider>
          <Component label="Region" options={["EU", "US"]} value="EU" open disabled
            onSelect={(value) => selections.push(value)} onOpenChange={(open) => openings.push(open)} />
        </ThemeProvider>,
      );

      const trigger = getByRole("button", { name: "Region" });
      expect(trigger.getAttribute("aria-disabled")).toBe("true");
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(container.querySelector('[role="listbox"]')).toBeNull();
      fireEvent.click(trigger);
      fireEvent.keyDown(trigger, { key: "Escape" });
      expect(selections).toEqual([]);
      expect(openings).toEqual([]);
    });

    it("suppresses an open uncontrolled menu, then restores its state on re-enable", () => {
      const selections: string[] = [];
      const openings: boolean[] = [];
      const view = (disabled: boolean) => (
        <ThemeProvider>
          <Component label="Region" options={["EU", "US"]} defaultValue="EU" disabled={disabled}
            onSelect={(value) => selections.push(value)} onOpenChange={(open) => openings.push(open)} />
        </ThemeProvider>
      );
      const { container, getByRole, rerender } = render(view(false));
      fireEvent.click(getByRole("button", { name: "Region" }));
      expect(container.querySelector('[role="listbox"]')).not.toBeNull();
      expect(openings).toEqual([true]);

      rerender(view(true));
      expect(getByRole("button", { name: "Region" }).getAttribute("aria-expanded")).toBe("false");
      expect(container.querySelector('[role="option"]')).toBeNull();
      fireEvent.click(getByRole("button", { name: "Region" }));
      fireEvent.keyDown(getByRole("button", { name: "Region" }), { key: "Escape" });
      expect(selections).toEqual([]);
      expect(openings).toEqual([true]);

      rerender(view(false));
      expect(getByRole("button", { name: "Region" }).getAttribute("aria-expanded")).toBe("true");
      expect(getByRole("option", { name: /EU/ }).getAttribute("aria-selected")).toBe("true");
      fireEvent.click(getByRole("option", { name: /US/ }));
      expect(selections).toEqual(["US"]);
      expect(openings).toEqual([true, false]);
      expect(container.querySelector('[role="listbox"]')).toBeNull();
      expect(getByRole("button", { name: "Region" }).textContent).toContain("US");
    });

    it("keeps parent-controlled changes made while disabled when re-enabled", () => {
      const selections: string[] = [];
      const openings: boolean[] = [];
      const view = (disabled: boolean, open: boolean, value: string) => (
        <ThemeProvider>
          <Component label="Region" options={["EU", "US"]} value={value} open={open} disabled={disabled}
            onSelect={(next) => selections.push(next)} onOpenChange={(next) => openings.push(next)} />
        </ThemeProvider>
      );
      const { container, getByRole, rerender } = render(view(true, true, "EU"));
      rerender(view(true, false, "US"));
      rerender(view(false, false, "US"));
      expect(container.querySelector('[role="listbox"]')).toBeNull();
      expect(getByRole("button", { name: "Region" }).textContent).toContain("US");
      expect(selections).toEqual([]);
      expect(openings).toEqual([]);

      fireEvent.click(getByRole("button", { name: "Region" }));
      expect(openings).toEqual([true]);
      expect(container.querySelector('[role="listbox"]')).toBeNull();
      rerender(view(false, true, "US"));
      fireEvent.click(getByRole("option", { name: /EU/ }));
      expect(selections).toEqual(["EU"]);
      expect(openings).toEqual([true, false]);
      expect(getByRole("option", { name: /US/ }).getAttribute("aria-selected")).toBe("true");
    });
  });
}
