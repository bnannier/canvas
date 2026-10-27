import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { useState } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Chip, ChipGroup } from "../src/atoms/chip/chip.tsx";
import { Chip as AndroidChip, ChipGroup as AndroidChipGroup } from "../src/atoms/chip/chip.android.tsx";
import { ChipGroup as IOSChipGroup } from "../src/atoms/chip/chip.ios.tsx";

// ChipGroup: a pick-one set of chips with the WAI-ARIA radiogroup semantics and one roving
// tab stop through the shared useRovingFocus (as RadioGroup and Tabs use it).

afterEach(cleanup);

const ui = (node: React.ReactNode) => render(<ThemeProvider light solid>{node}</ThemeProvider>);
const radios = () => screen.getAllByRole("radio");
const checked = () => radios().filter((r) => r.getAttribute("aria-checked") === "true").map((r) => r.textContent);
const stops = () => radios().map((r) => r.getAttribute("tabindex"));

function Set_(props: { defaultValue?: string; disabledB?: boolean; onChange?: (v: string | number) => void }) {
  return (
    <ChipGroup accessibilityLabel="Color" defaultValue={props.defaultValue} onChange={props.onChange} testID="group">
      <Chip value="a">Alpha</Chip>
      <Chip value="b" disabled={props.disabledB}>Beta</Chip>
      <Chip value="c">Gamma</Chip>
      <Chip value="d">Delta</Chip>
    </ChipGroup>
  );
}

describe("ChipGroup", () => {
  it("is one named radiogroup of radio chips, the chosen one checked", () => {
    ui(<Set_ defaultValue="b" />);
    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-label")).toBe("Color");
    expect(radios()).toHaveLength(4);
    expect(checked()).toEqual(["Beta"]);
    // No toggle-button semantics on an option.
    for (const r of radios()) expect(r.getAttribute("aria-pressed")).toBeNull();
  });

  it("makes the chosen chip the one tab stop, and the first chip when nothing is chosen", () => {
    ui(<Set_ defaultValue="c" />);
    expect(stops()).toEqual(["-1", "-1", "0", "-1"]);
    cleanup();
    ui(<Set_ />);
    expect(stops()).toEqual(["0", "-1", "-1", "-1"]);
    expect(checked()).toEqual([]);
  });

  it("moves and selects with the arrows, wrapping, and takes Home and End", () => {
    const changes: (string | number)[] = [];
    ui(<Set_ defaultValue="a" onChange={(v) => changes.push(v)} />);
    act(() => { fireEvent.keyDown(radios()[0], { key: "ArrowRight" }); });
    expect(checked()).toEqual(["Beta"]);
    expect(document.activeElement?.textContent).toBe("Beta");
    act(() => { fireEvent.keyDown(radios()[1], { key: "ArrowDown" }); });
    expect(checked()).toEqual(["Gamma"]);
    act(() => { fireEvent.keyDown(radios()[2], { key: "End" }); });
    expect(checked()).toEqual(["Delta"]);
    act(() => { fireEvent.keyDown(radios()[3], { key: "ArrowRight" }); });
    expect(checked()).toEqual(["Alpha"]);
    act(() => { fireEvent.keyDown(radios()[0], { key: "ArrowLeft" }); });
    expect(checked()).toEqual(["Delta"]);
    act(() => { fireEvent.keyDown(radios()[3], { key: "Home" }); });
    expect(checked()).toEqual(["Alpha"]);
    expect(changes).toEqual(["b", "c", "d", "a", "d", "a"]);
    expect(stops()).toEqual(["0", "-1", "-1", "-1"]);
  });

  it("skips a disabled chip and never makes it the tab stop", () => {
    ui(<Set_ defaultValue="a" disabledB />);
    act(() => { fireEvent.keyDown(radios()[0], { key: "ArrowRight" }); });
    expect(checked()).toEqual(["Gamma"]);
    expect(radios()[1].getAttribute("aria-disabled")).toBe("true");
  });

  it("selects on press, and keeps one chip chosen (pressing the chosen chip keeps it)", () => {
    ui(<Set_ defaultValue="a" />);
    act(() => { fireEvent.click(radios()[2]); });
    expect(checked()).toEqual(["Gamma"]);
    act(() => { fireEvent.click(radios()[2]); });
    expect(checked()).toEqual(["Gamma"]);
  });

  it("is controlled through value and onChange", () => {
    function Controlled() {
      const [v, setV] = useState<string | number>("d");
      return (
        <ChipGroup accessibilityLabel="Pick" value={v} onChange={setV}>
          <Chip value="a">Alpha</Chip>
          <Chip value="d">Delta</Chip>
        </ChipGroup>
      );
    }
    ui(<Controlled />);
    expect(checked()).toEqual(["Delta"]);
    act(() => { fireEvent.click(radios()[0]); });
    expect(checked()).toEqual(["Alpha"]);
  });

  it("renders a visible label heading that also names the group, RadioGroup's anatomy", () => {
    ui(<ChipGroup label="Size" defaultValue="m"><Chip value="s">S</Chip><Chip value="m">M</Chip></ChipGroup>);
    expect(screen.getByText("Size")).toBeDefined();
    expect(screen.getByRole("radiogroup").getAttribute("aria-label")).toBe("Size");
  });

  it("paints the chosen chip as the selected filter chip, on Android too", () => {
    ui(<AndroidChipGroup accessibilityLabel="A" defaultValue="x"><AndroidChip value="x">X</AndroidChip><AndroidChip value="y">Y</AndroidChip></AndroidChipGroup>);
    expect(checked()).toEqual(["X"]);
    expect(IOSChipGroup).toBe(ChipGroup);
  });

  it("leaves a chip outside a group a toggle button", () => {
    ui(<Chip selectable>Solo</Chip>);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
  });
});
