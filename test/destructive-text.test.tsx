import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Text } from "react-native";
import { ThemeProvider, useTheme, type ThemeTokenOverrides } from "../src/style/theme.tsx";
import { colorsByScheme, type ColorScheme } from "../src/style/tokens.ts";
import { destructiveText } from "../src/style/destructive-text.ts";
import { galleryBlockFill } from "../src/molecules/grid-lists/grid-lists.styles.ts";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Icon } from "../src/atoms/icon/icon.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Field } from "../src/molecules/field/field.tsx";

afterEach(cleanup);

function color(value: string): string {
  const hex = /^#([\da-f]{3,8})$/i.exec(value);
  let channels: number[];
  if (hex) {
    const expanded = hex[1]!.length <= 4 ? [...hex[1]!].map(channel => channel + channel).join("") : hex[1]!;
    channels = [0, 2, 4].map(index => parseInt(expanded.slice(index, index + 2), 16));
    channels.push(expanded.length === 8 ? parseInt(expanded.slice(6), 16) / 255 : 1);
  } else {
    channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
    if (channels.length === 3) channels.push(1);
  }
  if (channels.length !== 4) throw new Error(`Expected a rendered color: ${value}`);
  // RNW rounds alpha to two decimal places, so compare the rendered channel.
  return `${channels.slice(0, 3).join(",")},${channels[3]!.toFixed(2)}`;
}

function Probe() {
  const { scheme, tokens } = useTheme();
  return <>
    <Typography destructive testID="error-text">Error text</Typography>
    <Field error="Explain the problem."><Input label="Name" required /></Field>
    <Button destructive>Delete permanently</Button>
    <Icon destructive trash accessibilityLabel="Delete icon" />
    <Text testID="resolved">{`${scheme}:${tokens["destructive-text"]}`}</Text>
  </>;
}

const errorColor = () => color(screen.getByTestId("error-text").style.color);

describe("destructive-text compatibility", () => {
  for (const scheme of ["light", "dark"] as const) {
    it(`uses the ${scheme} text role while retaining fills and required stars`, () => {
      render(<ThemeProvider scheme={scheme}><Probe /></ThemeProvider>);
      const t = colorsByScheme[scheme];
      expect(errorColor()).toBe(color(destructiveText(t)));
      expect(color(screen.getByText("Explain the problem.").style.color)).toBe(color(destructiveText(t)));
      const button = screen.getByRole("button", { name: "Delete permanently" });
      expect(color(button.style.backgroundColor)).toBe(color(t.destructive));
      expect(color(screen.getByText("Delete permanently").style.color)).toBe(color(t["destructive-foreground"]));
      // The shared harness omits SVG paint. Preserve icon semantics here; its
      // unchanged graphic color is checked in the real rendered visual matrix.
      expect(screen.getByRole("img", { name: "Delete icon" })).toBeDefined();
      const star = screen.getByText("*");
      expect(color(star.style.color)).toBe(color(t.destructive));
      expect(star.getAttribute("aria-hidden")).toBe("true");
      expect(screen.getByLabelText("Name").getAttribute("aria-required")).toBe("true");
    });

    for (const destructive of ["#7c2939", "#f008", "#ff000088", "rgba(255, 0, 0, 0.4)"]) {
      it(`preserves a ${scheme} destructive-only override ${destructive}`, () => {
        render(<ThemeProvider scheme={scheme} tokens={{ destructive }}><Probe /></ThemeProvider>);
        expect(errorColor()).toBe(color(destructive));
        expect(color(screen.getByText("Explain the problem.").style.color)).toBe(color(destructive));
        expect(color(screen.getByRole("button", { name: "Delete permanently" }).style.backgroundColor)).toBe(color(destructive));
      });
    }

    it(`honors the explicit ${scheme} text role and treats undefined as omission`, () => {
      const ui = (tokens: ThemeTokenOverrides) => <ThemeProvider scheme={scheme} tokens={tokens}><Probe /></ThemeProvider>;
      const { rerender } = render(ui({ destructive: "#7c2939", "destructive-text": "#a95364" }));
      expect(errorColor()).toBe(color("#a95364"));
      expect(color(screen.getByRole("button", { name: "Delete permanently" }).style.backgroundColor)).toBe(color("#7c2939"));
      rerender(ui({ destructive: "#7c2939", "destructive-text": undefined }));
      expect(errorColor()).toBe(color("#7c2939"));
      rerender(ui({ "destructive-text": undefined }));
      expect(errorColor()).toBe(color(destructiveText(colorsByScheme[scheme])));
      rerender(ui({ "destructive-text": "#a95364" }));
      expect(errorColor()).toBe(color("#a95364"));
      expect(color(screen.getByRole("button", { name: "Delete permanently" }).style.backgroundColor)).toBe(color(colorsByScheme[scheme].destructive));
    });
  }

  it("updates scheme-specific overrides without inheriting a parent's palette", () => {
    const tokens: ThemeTokenOverrides = { light: { destructive: "#712030" }, dark: { destructive: "#cf7080", "destructive-text": "#f9a9b9" } };
    const ui = (scheme: ColorScheme) => <ThemeProvider scheme={scheme} tokens={tokens}><Probe /></ThemeProvider>;
    const { rerender } = render(ui("light"));
    expect(errorColor()).toBe(color("#712030"));
    rerender(ui("dark"));
    expect(errorColor()).toBe(color("#f9a9b9"));
    rerender(<ThemeProvider dark tokens={tokens}><ThemeProvider light><Probe /></ThemeProvider></ThemeProvider>);
    expect(errorColor()).toBe(color(destructiveText(colorsByScheme.light)));
  });

  it("resolves the SSR role before applying the client scheme", () => {
    const ui = <ThemeProvider dark ssrScheme="light"><Probe /></ThemeProvider>;
    expect(renderToString(ui)).toContain(`light:${destructiveText(colorsByScheme.light)}`);
    render(ui);
    expect(screen.getByTestId("resolved").textContent).toBe(`dark:${destructiveText(colorsByScheme.dark)}`);
    expect(errorColor()).toBe(color(destructiveText(colorsByScheme.dark)));
  });

  it("falls back for old full token maps, including the named gallery color path", () => {
    const legacy = { ...colorsByScheme.light };
    delete legacy["destructive-text"];
    expect(destructiveText(legacy)).toBe(legacy.destructive);
    expect(destructiveText({ ...legacy, "destructive-text": "rgba(1, 2, 3, 0.5)" })).toBe("rgba(1, 2, 3, 0.5)");
    expect(galleryBlockFill(legacy, "destructive-text")).toEqual(galleryBlockFill(legacy, "destructive"));
    expect(galleryBlockFill({ ...legacy, "destructive-text": "#102030" }, "destructive-text").backgroundColor).toBe("rgba(16, 32, 48, 0.2)");
    expect(galleryBlockFill(legacy, "unknown-token")).toEqual(galleryBlockFill(legacy, "muted-foreground"));
  });
});
