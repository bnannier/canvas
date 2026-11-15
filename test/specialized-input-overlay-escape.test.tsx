import { afterEach, expect, it } from "bun:test";
import { act, cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { InputOTP } from "../src/atoms/input-otp/input-otp.tsx";
import { Stepper } from "../src/atoms/stepper/stepper.tsx";
import { PhoneInput } from "../src/molecules/phone-input/phone-input.tsx";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { Drawer } from "../src/organisms/drawer/drawer.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { layoutEntrance } from "./entrance-layout.ts";

afterEach(() => {
  cleanup();
  fireEvent.keyUp(document.body, { key: "Escape" });
});
const ui = (children: ReactNode) => render(<ThemeProvider light solid>{children}</ThemeProvider>);
const focus = (field: HTMLElement) => act(() => field.focus());
const release = () => fireEvent.keyUp(document.activeElement ?? document.body, { key: "Escape" });
const controls = [
  { name: "InputOTP", role: "textbox", label: "One-time code", value: "123", node: <InputOTP defaultValue="123" /> },
  { name: "PhoneInput", role: "textbox", label: "Phone number", value: "415", node: <PhoneInput label="Phone number" defaultValue="415" /> },
  { name: "Stepper", role: "spinbutton", label: "Quantity", value: "5", node: <Stepper label="Quantity" defaultValue={5} /> },
] as const;

for (const control of controls) {
  it(`focused ${control.name} cancels its Dialog once through keydown and keyup`, () => {
    let cancelled = 0;
    let confirmed = 0;
    ui(<Dialog trigger="Open editor" accessibilityLabel="Editor" onCancel={() => cancelled++} onConfirm={() => confirmed++}>
      {control.node}
    </Dialog>);
    const trigger = screen.getByRole("button", { name: "Open editor" });
    focus(trigger);
    fireEvent.click(trigger);
    const field = screen.getByRole(control.role, { name: control.label });
    focus(field);
    expect(fireEvent.keyDown(field, { key: "Escape" })).toBe(false);
    release();
    expect(cancelled).toBe(1);
    expect(confirmed).toBe(0);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it(`${control.name} closes the nested Dialog without repeat or keyup dismissing its Drawer`, () => {
    let parentCloses = 0;
    let childCloses = 0;
    ui(<Drawer open onOpenChange={() => parentCloses++}>
      <Dialog trigger="Open inner editor" accessibilityLabel="Inner editor" onCancel={() => childCloses++}>
        {control.node}
      </Dialog>
    </Drawer>);
    const trigger = screen.getByRole("button", { name: "Open inner editor" });
    focus(trigger);
    fireEvent.click(trigger);
    const field = screen.getByRole(control.role, { name: control.label });
    focus(field);
    fireEvent.keyDown(field, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(trigger, { key: "Escape", repeat: true });
    release();
    expect(childCloses).toBe(1);
    expect(parentCloses).toBe(0);
    fireEvent.keyDown(trigger, { key: "Escape" });
    release();
    expect(parentCloses).toBe(1);
  });

  for (const composition of [{ isComposing: true }, { keyCode: 229 }]) {
    it(`${control.name} retains IME ${Object.keys(composition)[0]} Escape through Dialog keyup`, () => {
      let cancelled = 0;
      ui(<Dialog open accessibilityLabel="Composing editor" onCancel={() => cancelled++}>{control.node}</Dialog>);
      const field = screen.getByRole(control.role, { name: control.label }) as HTMLInputElement;
      focus(field);
      const event = createEvent.keyDown(field, { key: "Escape", ...composition });
      fireEvent(field, event);
      expect(event.defaultPrevented).toBe(false);
      fireEvent.keyUp(field, { key: "Escape" });
      expect(cancelled).toBe(0);
      expect(field.value).toBe(control.value);
      expect(document.activeElement).toBe(field);
      fireEvent.keyDown(field, { key: "Escape" });
      release();
      expect(cancelled).toBe(1);
    });
  }

  it(`${control.name} outside an overlay keeps its Escape default and value`, () => {
    ui(control.node);
    const field = screen.getByRole(control.role, { name: control.label }) as HTMLInputElement;
    focus(field);
    expect(fireEvent.keyDown(field, { key: "Escape" })).toBe(true);
    fireEvent.keyUp(field, { key: "Escape" });
    expect(field.value).toBe(control.value);
    expect(document.activeElement).toBe(field);
  });
}

it("PhoneInput runs the consumer handler before Dialog cancellation", () => {
  const calls: string[] = [];
  ui(<Dialog open accessibilityLabel="Phone editor" onCancel={() => calls.push("cancel")}>
    <PhoneInput label="Phone" onKeyPress={event => calls.push(event.nativeEvent.key)} />
  </Dialog>);
  const field = screen.getByRole("textbox", { name: "Phone" });
  focus(field);
  fireEvent.keyDown(field, { key: "x" });
  fireEvent.keyDown(field, { key: "Escape" });
  release();
  expect(calls).toEqual(["x", "Escape", "cancel"]);
});

it("PhoneInput consumer prevention retains editing focus through Dialog keyup", () => {
  let cancelled = 0;
  let localEscapes = 0;
  ui(<Dialog open accessibilityLabel="Phone editor" onCancel={() => cancelled++}>
    <PhoneInput label="Phone" defaultValue="415" onKeyPress={event => {
      if (event.nativeEvent.key === "Escape") { localEscapes++; event.preventDefault(); }
    }} />
  </Dialog>);
  const field = screen.getByRole("textbox", { name: "Phone" }) as HTMLInputElement;
  focus(field);
  expect(fireEvent.keyDown(field, { key: "Escape" })).toBe(false);
  fireEvent.keyUp(field, { key: "Escape" });
  expect(cancelled).toBe(0);
  expect(localEscapes).toBe(1);
  expect(field.value).toBe("415");
  expect(document.activeElement).toBe(field);
});

it("PhoneInput number Escape closes the active country list before its Dialog", () => {
  let cancelled = 0;
  const picks: string[] = [];
  ui(<Dialog open accessibilityLabel="Phone editor" onCancel={() => cancelled++}>
    <PhoneInput label="Phone" defaultValue="415" onCountryChange={code => picks.push(code)} />
  </Dialog>);
  fireEvent.click(screen.getByRole("button", { name: "Country, United States +1" }));
  layoutEntrance(screen.getByRole("listbox", { hidden: true }), { width: 320, height: 200 });
  const field = screen.getByRole("textbox", { name: "Phone" }) as HTMLInputElement;
  focus(field);
  fireEvent.keyDown(field, { key: "Escape" });
  release();
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(cancelled).toBe(0);
  expect(picks).toEqual([]);
  expect(field.value).toBe("415");
  focus(field);
  fireEvent.keyDown(field, { key: "Escape" });
  release();
  expect(cancelled).toBe(1);
});
