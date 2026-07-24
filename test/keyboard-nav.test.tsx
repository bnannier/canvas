import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { RadioGroup } from "../src/atoms/radio/radio-group.tsx";
import { Radio } from "../src/atoms/radio/radio.tsx";
import { Listbox } from "../src/atoms/listbox/listbox.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { Slider } from "../src/atoms/slider/slider.tsx";
import { I18nManager } from "react-native";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Tabs roving keyboard navigation", () => {
  it("moves + activates the tab with arrows, wraps, and honors Home/End", () => {
    const { container } = ui(<Tabs tabs={["One", "Two", "Three"]} defaultActive={0} />);
    const tabs = () => [...container.querySelectorAll('[role="tab"]')];
    const selected = () => tabs().findIndex((t) => t.getAttribute("aria-selected") === "true");
    expect(selected()).toBe(0);
    // Roving tabindex: only the active tab is in the tab order.
    expect(tabs()[0].getAttribute("tabindex")).toBe("0");
    expect(tabs()[1].getAttribute("tabindex")).toBe("-1");

    fireEvent.keyDown(tabs()[0], { key: "ArrowRight" });
    expect(selected()).toBe(1);
    fireEvent.keyDown(tabs()[1], { key: "ArrowRight" });
    expect(selected()).toBe(2);
    // Wraps past the end.
    fireEvent.keyDown(tabs()[2], { key: "ArrowRight" });
    expect(selected()).toBe(0);
    // ArrowLeft goes back (and wraps).
    fireEvent.keyDown(tabs()[0], { key: "ArrowLeft" });
    expect(selected()).toBe(2);
    // Home/End jump to the ends.
    fireEvent.keyDown(tabs()[2], { key: "Home" });
    expect(selected()).toBe(0);
    fireEvent.keyDown(tabs()[0], { key: "End" });
    expect(selected()).toBe(2);
  });
});

describe("RadioGroup roving keyboard navigation", () => {
  it("moves selection with all four arrows, wraps, and keeps one tab stop", () => {
    const { container } = ui(
      <RadioGroup defaultValue="a">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
        <Radio value="c">C</Radio>
      </RadioGroup>,
    );
    const radios = () => [...container.querySelectorAll('[role="radio"]')];
    const checked = () => radios().findIndex((r) => r.getAttribute("aria-checked") === "true");
    expect(checked()).toBe(0);
    // Roving tabindex: only the selected radio is in the tab order.
    expect(radios()[0].getAttribute("tabindex")).toBe("0");
    expect(radios()[1].getAttribute("tabindex")).toBe("-1");

    fireEvent.keyDown(radios()[0], { key: "ArrowDown" });
    expect(checked()).toBe(1);
    fireEvent.keyDown(radios()[1], { key: "ArrowRight" });
    expect(checked()).toBe(2);
    // Wraps forward and back.
    fireEvent.keyDown(radios()[2], { key: "ArrowDown" });
    expect(checked()).toBe(0);
    fireEvent.keyDown(radios()[0], { key: "ArrowUp" });
    expect(checked()).toBe(2);
  });
});

describe("Listbox roving keyboard navigation", () => {
  it("single-select: arrows and Home/End move + select the option", () => {
    const items = [{ label: "A" }, { label: "B" }, { label: "C" }];
    const { container } = ui(<Listbox items={items} defaultSelected={0} />);
    const opts = () => [...container.querySelectorAll('[role="option"]')];
    const sel = () => opts().findIndex((o) => o.getAttribute("aria-selected") === "true");
    expect(sel()).toBe(0);
    expect(opts()[0].getAttribute("tabindex")).toBe("0");
    expect(opts()[1].getAttribute("tabindex")).toBe("-1");
    fireEvent.keyDown(opts()[0], { key: "ArrowDown" });
    expect(sel()).toBe(1);
    fireEvent.keyDown(opts()[1], { key: "End" });
    expect(sel()).toBe(2);
  });

  it("multi-select: arrows move focus, Space toggles the focused row", () => {
    const items = [{ label: "A" }, { label: "B" }, { label: "C" }];
    const { container } = ui(<Listbox multi items={items} />);
    // The row Pressables are the direct children of the listbox; each multi row also
    // holds an inner presentational Checkbox (aria-hidden), so query the rows directly.
    const list = container.querySelector('[role="listbox"]') as HTMLElement;
    const rows = () => [...list.children] as HTMLElement[];
    const checkedIdx = () =>
      rows().map((r, i) => (r.getAttribute("aria-checked") === "true" ? i : -1)).filter((i) => i >= 0);
    // The first row is the single tab stop.
    expect(rows()[0].getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(rows()[0], { key: " " });
    expect(checkedIdx()).toEqual([0]);
    // Arrow moves focus down without toggling.
    fireEvent.keyDown(rows()[0], { key: "ArrowDown" });
    expect(rows()[1].getAttribute("tabindex")).toBe("0");
    expect(checkedIdx()).toEqual([0]);
    fireEvent.keyDown(rows()[1], { key: " " });
    expect(checkedIdx()).toEqual([0, 1]);
  });
});

describe("Dropdown menu roving keyboard navigation", () => {
  it("opens focused on the first row, arrows move focus, Enter selects and closes", () => {
    let picked = -1;
    const items = [{ label: "Profile" }, { label: "Settings" }, { label: "Sign out" }];
    const { container } = ui(<Dropdown trigger="Menu" items={items} onSelect={(_it, i) => { picked = i; }} />);
    fireEvent.click(screen.getByText("Menu"));
    const menuitems = () => [...container.querySelectorAll('[role="menuitem"]')];
    expect(menuitems().length).toBe(3);
    // The first row is the tab stop once the menu opens.
    expect(menuitems()[0].getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(menuitems()[0], { key: "ArrowDown" });
    expect(menuitems()[1].getAttribute("tabindex")).toBe("0");
    // Enter activates the focused row and closes the menu.
    fireEvent.keyDown(menuitems()[1], { key: "Enter" });
    expect(picked).toBe(1);
    expect(container.querySelectorAll('[role="menuitem"]').length).toBe(0);
  });
});

describe("Command palette keyboard navigation", () => {
  it("arrows move the active row (clamped), aria-activedescendant follows, Enter selects", () => {
    let picked = -1;
    const groups = [{ heading: "Actions", items: [{ label: "New" }, { label: "Open" }, { label: "Save" }] }];
    const { container } = ui(<Command groups={groups} footer onSelect={(_it, i) => { picked = i; }} />);
    // The focusable driver is the search row's real text input.
    const search = container.querySelector('[role="search"] input') as HTMLElement;
    const options = () => [...container.querySelectorAll('[role="option"]')];
    const activeIdx = () => options().findIndex((o) => o.getAttribute("aria-selected") === "true");
    expect(activeIdx()).toBe(0);
    expect(search.getAttribute("aria-activedescendant")).toBe(options()[0].getAttribute("id"));

    fireEvent.keyDown(search, { key: "ArrowDown" });
    expect(activeIdx()).toBe(1);
    expect(search.getAttribute("aria-activedescendant")).toBe(options()[1].getAttribute("id"));
    fireEvent.keyDown(search, { key: "ArrowDown" });
    expect(activeIdx()).toBe(2);
    // Clamps at the last row.
    fireEvent.keyDown(search, { key: "ArrowDown" });
    expect(activeIdx()).toBe(2);
    fireEvent.keyDown(search, { key: "ArrowUp" });
    expect(activeIdx()).toBe(1);
    // Enter selects the active row.
    fireEvent.keyDown(search, { key: "Enter" });
    expect(picked).toBe(1);
  });
});

describe("Slider RTL keyboard direction", () => {
  it("reverses the horizontal arrows in a right-to-left locale, keeping Home/End/vertical logical", () => {
    // Force RTL through the SAME accessor the kit reads (isRTL() ->
    // I18nManager.getConstants().isRTL). React Native Web has no direct
    // `I18nManager.isRTL` property, so stubbing that would be a no-op here.
    const origGetConstants = I18nManager.getConstants;
    I18nManager.getConstants = () => ({ ...origGetConstants.call(I18nManager), isRTL: true });
    try {
      let val = 50;
      const { container } = ui(<Slider value={50} min={0} max={100} onChange={(v) => { val = v; }} accessibilityLabel="Vol" />);
      const slider = container.querySelector('[role="slider"]') as HTMLElement;
      // ArrowRight moves the thumb visually rightward, which is toward MIN in RTL.
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(val).toBe(49);
      fireEvent.keyDown(slider, { key: "ArrowLeft" });
      expect(val).toBe(51);
      // Vertical arrows and Home/End keep their logical direction.
      fireEvent.keyDown(slider, { key: "ArrowUp" });
      expect(val).toBe(51);
      fireEvent.keyDown(slider, { key: "Home" });
      expect(val).toBe(0);
      fireEvent.keyDown(slider, { key: "End" });
      expect(val).toBe(100);
    } finally {
      I18nManager.getConstants = origGetConstants;
    }
  });
});
