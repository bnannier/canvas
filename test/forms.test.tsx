import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import type { TextInput } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Input } from "../src/atoms/input/input.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Checkbox", () => {
  it("renders its label and toggles to the next value on press", () => {
    let next: boolean | null = null;
    ui(<Checkbox checked={false} onChange={(v) => { next = v; }}>Accept terms</Checkbox>);
    fireEvent.click(screen.getByText("Accept terms"));
    expect(next).toBe(true);
  });

  it("does not toggle while disabled", () => {
    let called = false;
    ui(<Checkbox checked={false} disabled onChange={() => { called = true; }}>Disabled</Checkbox>);
    fireEvent.click(screen.getByText("Disabled"));
    expect(called).toBe(false);
  });
});

describe("Switch", () => {
  it("toggles to the opposite of its controlled value", () => {
    let next: boolean | null = null;
    ui(<Switch checked={true} onChange={(v) => { next = v; }}>Wi-Fi</Switch>);
    fireEvent.click(screen.getByText("Wi-Fi"));
    expect(next).toBe(false);
  });
});

describe("Input", () => {
  it("renders a placeholder and reports typed text", () => {
    let text = "";
    ui(<Input placeholder="Email" onChangeText={(t) => { text = t; }} />);
    const field = screen.getByPlaceholderText("Email") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "a@b.co" } });
    expect(text).toBe("a@b.co");
  });

  it("forwards a ref to the underlying field and exposes focus()", () => {
    const ref = createRef<TextInput>();
    ui(<Input ref={ref} placeholder="Name" />);
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.focus).toBe("function");
  });

  it("sets a displayName for DevTools/stack traces", () => {
    expect((Input as { displayName?: string }).displayName).toBe("Input");
  });
});
