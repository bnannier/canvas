import { expect, test } from "bun:test";
import { resolve, type ResolveContext } from "./resolve.js";
import { lightColors, darkColors } from "./tokens.js";

const ctx = (over: Partial<ResolveContext> = {}): ResolveContext => ({
  tokens: lightColors,
  width: 1280,
  dark: false,
  ...over,
});

test("layout, spacing and gap map to RN props", () => {
  expect(resolve("flex-row items-center gap-2 px-4 py-2", ctx())).toEqual({
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  });
});

test("sizing supports scale, full and fractions", () => {
  expect(resolve("w-10 h-full max-w-1/2", ctx())).toEqual({
    width: 40,
    height: "100%",
    maxWidth: "50%",
  });
});

test("color tokens resolve against the active scheme", () => {
  expect(resolve("bg-primary text-primary-foreground", ctx())).toEqual({
    backgroundColor: "#4f46e5",
    color: "#ffffff",
  });
  expect(resolve("bg-primary", ctx({ tokens: darkColors }))).toEqual({
    backgroundColor: "#6366f1",
  });
});

test("text- disambiguates size, color and align", () => {
  expect(resolve("text-sm text-muted-foreground text-center", ctx())).toEqual({
    fontSize: 14,
    lineHeight: 20,
    color: "#71717a",
    textAlign: "center",
  });
});

test("later utilities win on conflict (last-wins)", () => {
  expect(resolve("px-2 px-4", ctx())).toEqual({ paddingHorizontal: 16 });
});

test("border width vs border color", () => {
  expect(resolve("border border-2 border-primary", ctx())).toEqual({
    borderWidth: 2,
    borderColor: "#4f46e5",
  });
});

test("rounded scale and per-corner", () => {
  expect(resolve("rounded-md", ctx())).toEqual({ borderRadius: 6 });
  expect(resolve("rounded-t-lg", ctx())).toEqual({
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  });
});

test("color alpha modifier", () => {
  expect(resolve("bg-black/50", ctx())).toEqual({
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  });
});

test("palette hues resolve for bg/text/border, including alpha", () => {
  expect(resolve("bg-red-500", ctx())).toEqual({ backgroundColor: "#ef4444" });
  expect(resolve("text-green-700", ctx())).toEqual({ color: "#15803d" });
  expect(resolve("bg-blue-500/50", ctx())).toEqual({
    backgroundColor: "rgba(59, 130, 246, 0.5)",
  });
});

test("desktop-first: md: applies at width and below, and wins there", () => {
  expect(resolve("flex-row md:flex-col", ctx({ width: 700 }))).toEqual({
    flexDirection: "column",
  });
  expect(resolve("flex-row md:flex-col", ctx({ width: 1280 }))).toEqual({
    flexDirection: "row",
  });
});

test("smaller breakpoint wins over larger on narrow screens", () => {
  // At 500px both lg (<=1024) and sm (<=640) match; sm must win.
  expect(resolve("p-2 lg:p-4 sm:p-8", ctx({ width: 500 }))).toEqual({
    padding: 32,
  });
});

test("dark: variant only applies when scheme is dark", () => {
  expect(resolve("bg-white dark:bg-black", ctx())).toEqual({
    backgroundColor: "#ffffff",
  });
  expect(resolve("bg-white dark:bg-black", ctx({ dark: true, tokens: darkColors }))).toEqual({
    backgroundColor: "#000000",
  });
});

test("interaction state variant gates utilities", () => {
  expect(resolve("opacity-100 disabled:opacity-50", ctx())).toEqual({ opacity: 1 });
  expect(resolve("opacity-100 disabled:opacity-50", ctx({ state: { disabled: true } }))).toEqual({
    opacity: 0.5,
  });
});

test("unknown utilities are ignored, not thrown", () => {
  expect(resolve("definitely-not-a-utility px-1", ctx())).toEqual({ paddingHorizontal: 4 });
});
