import { afterEach, describe, expect, it } from "bun:test";
import { createRef, useState } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import type { TextInput } from "react-native";
import { Input as WebInput } from "../src/atoms/input/input.tsx";
import { Input as IOSInput } from "../src/atoms/input/input.ios.tsx";
import { Input as AndroidInput } from "../src/atoms/input/input.android.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { colorsFor } from "../src/style/tokens.ts";
afterEach(cleanup);
const colors = colorsFor("violet", "light");
const color = (value: string) => value.startsWith("#")
  ? [1, 3, 5].map(start => parseInt(value.slice(start, start + 2), 16))
  : (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
for (const [name, Input, radius, defaultHeight] of [["web", WebInput, 10, 40], ["ios", IOSInput, 8, 44], ["android", AndroidInput, 4, 56]] as const) {
  describe(`${name} compact Input`, () => {
    it("keeps the outlined density's size ladder separate from the unchanged platform default", () => {
      const view = render(<ThemeProvider light solid><Input compact accessibilityLabel="Email" placeholder="Teammate email" /></ThemeProvider>);
      const field = view.getByRole("textbox", { name: "Email" }) as HTMLInputElement;
      expect(field.style.height).toBe("40px");
      expect(field.style.fontSize).toBe("14px");
      expect(field.style.borderRadius).toBe(`${radius}px`);
      expect(field.style.borderWidth).toBe("1px");
      expect(color(field.style.borderColor)).toEqual(color(colors["field-border"]!));
      expect(field.style.paddingLeft).toBe("12px");
      expect(color(field.style.backgroundColor)).toEqual(color(colors["surface-sunken"]!));
      expect(color(field.style.getPropertyValue("--placeholderTextColor"))).toEqual(color(colors["subtle-foreground"]!));
      for (const [size, height, font] of [["small", 32, 13], ["large", 48, 16]] as const) {
        view.rerender(<ThemeProvider light solid><Input compact {...{ [size]: true }} accessibilityLabel="Email" /></ThemeProvider>);
        expect(field.style.height).toBe(`${height}px`);
        expect(field.style.fontSize).toBe(`${font}px`);
      }
      view.rerender(<ThemeProvider light solid><Input accessibilityLabel="Email" /></ThemeProvider>);
      expect((view.getByRole("textbox", { name: "Email" }) as HTMLInputElement).style.height).toBe(`${defaultHeight}px`);
    });
    it("preserves the editor ref, uncontrolled draft and focus/error/disabled semantics", () => {
      const ref = createRef<TextInput>(); const changes: string[] = []; let focuses = 0;
      const view = render(<ThemeProvider light solid><Input compact ref={ref} accessibilityLabel="Email" defaultValue="Draft" onChangeText={v => changes.push(v)} onFocus={() => focuses++} /></ThemeProvider>);
      const field = view.getByRole("textbox", { name: "Email" }) as HTMLInputElement;
      expect(ref.current).toBe(field as unknown as TextInput);
      act(() => { ref.current!.focus(); }); fireEvent.focus(field);
      expect(document.activeElement).toBe(field);
      expect(focuses).toBeGreaterThan(0);
      expect(color(field.style.borderColor)).toEqual(color(colors.ring));
      fireEvent.change(field, { target: { value: "Edited" } });
      expect(field.value).toBe("Edited"); expect(changes).toEqual(["Edited"]);
      view.rerender(<ThemeProvider light solid><Input compact invalid ref={ref} accessibilityLabel="Email" defaultValue="Draft" /></ThemeProvider>);
      expect(view.getByRole("textbox")).toBe(field);
      expect(field.value).toBe("Edited");
      expect(field.getAttribute("aria-invalid")).toBe("true");
      // An invalid Android field uses the grouped alert path; its frame owns the edge.
      const errorEdge = field.style.borderColor || field.parentElement?.parentElement?.style.borderColor;
      expect(color(errorEdge ?? "")).toEqual(color(colors.destructive));
      view.rerender(<ThemeProvider light solid><Input compact disabled ref={ref} accessibilityLabel="Email" /></ThemeProvider>);
      expect((view.getByRole("textbox") as HTMLInputElement).disabled).toBe(true);
      expect(view.getByRole("textbox").getAttribute("aria-disabled")).toBe("true");
    });
    it("updates controlled text and names required fields", () => {
      function Controlled() {
        const [value, setValue] = useState("Initial");
        return <Input compact label="Teammate" required value={value} onChangeText={setValue} />;
      }
      const view = render(<ThemeProvider light solid><Controlled /></ThemeProvider>);
      const field = view.getByRole("textbox", { name: /Teammate/ }) as HTMLInputElement;
      fireEvent.change(field, { target: { value: "noor@nannier.com" } });
      expect(field.value).toBe("noor@nannier.com");
      expect(field.getAttribute("aria-required")).toBe("true");
      expect(view.getByText("Teammate")).toBeTruthy();
    });
  });
}
