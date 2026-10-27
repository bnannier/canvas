import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Pressable, Text } from "react-native";
import * as iconModule from "../src/atoms/icon/icon.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { Toast, ToastProvider, useToast } from "../src/organisms/toast/toast.tsx";
import { webSkin, iosSkin } from "../src/organisms/toast/toast.styles.ts";

// The web and iOS toast is the Canvas v4 hand-off's card (`K.def('toast')`): the overlay
// panel at the platform's card corner, padded 12 by 14, an 18 px intent glyph in the
// status color (the accent's sparkle on a neutral toast), a 500 14 message over a 400 13
// muted description, and the action in 600 13 accent ink.

afterEach(cleanup);

const t = lightColors;

describe("the v4 toast card", () => {
  it("is the overlay panel at the card corner, and iOS (no toast control) is the web skin", () => {
    expect(webSkin.container(t, false, false)).toMatchObject({
      borderRadius: 16, backgroundColor: t.popover, borderWidth: 1, borderColor: t["field-border"],
      paddingVertical: 12, paddingHorizontal: 14, gap: 12, alignItems: "flex-start", maxWidth: 380,
    });
    expect(webSkin.container(t, false, true).borderRadius).toBe(16);
    expect(iosSkin).toBe(webSkin);
    expect(webSkin.message(t)).toMatchObject({ fontSize: 14, lineHeight: 18, fontWeight: "500", color: t.foreground });
    expect(webSkin.description(t)).toMatchObject({ fontSize: 13, lineHeight: 19.5, fontWeight: "400", color: t["muted-foreground"] });
    expect(webSkin.actionLabel(t)).toMatchObject({ fontSize: 13, fontWeight: "600", color: t["primary-text"] });
    expect(webSkin.iconSize).toBe(18);
  });

  it("draws the intent glyphs in the status colors and the accent's sparkle on a neutral toast", () => {
    const drawn = (ui: React.ReactElement) => {
      const spy = spyOn(iconModule, "Icon");
      try {
        render(ui);
        return spy.mock.calls.map(([props]) => props as Record<string, unknown>);
      } finally {
        spy.mockRestore();
        cleanup();
      }
    };
    const [success] = drawn(<ThemeProvider light solid><Toast success message="Saved" /></ThemeProvider>);
    expect(success.circleCheck).toBe(true);
    expect(success.color).toBe(t.success);
    const [neutral] = drawn(<ThemeProvider light solid><Toast message="Saved" /></ThemeProvider>);
    expect(neutral.sparkles).toBe(true);
    expect(neutral.color).toBe(t["primary-text"]);
  });
});

describe("the toast provider", () => {
  it("passes the destructive intent through to the toast it shows", () => {
    function Fire() {
      const { toast } = useToast();
      return (
        <Pressable onPress={() => toast({ message: "Deleted", destructive: true })}>
          <Text>fire</Text>
        </Pressable>
      );
    }
    const spy = spyOn(iconModule, "Icon");
    try {
      render(<ThemeProvider light solid><ToastProvider><Fire /></ToastProvider></ThemeProvider>);
      act(() => { fireEvent.click(screen.getByText("fire")); });
      expect(screen.getByText("Deleted")).toBeTruthy();
      const glyph = spy.mock.calls.map(([props]) => props as Record<string, unknown>).find((props) => props.circleX === true);
      expect(glyph?.color).toBe(t.destructive);
    } finally {
      spy.mockRestore();
    }
  });
});

it("replaces a brief notification and restarts its configured lifetime", async () => {
  function Fire() {
    const { toast } = useToast();
    return <><Pressable onPress={() => toast({ message: "First" })}><Text>first</Text></Pressable><Pressable onPress={() => toast({ message: "Second" })}><Text>second</Text></Pressable></>;
  }
  render(<ThemeProvider light solid><ToastProvider single brief duration={100} bottomInset={28} horizontalInset={20}><Fire /></ToastProvider></ThemeProvider>);
  fireEvent.click(screen.getByText("first"));
  expect(screen.getByText("First")).toBeTruthy();
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 60)); });
  fireEvent.click(screen.getByText("second"));
  expect(screen.queryByText("First")).toBeNull();
  expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 60)); });
  expect(screen.getByText("Second")).toBeTruthy();
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 60)); });
  expect(screen.queryByText("Second")).toBeNull();
});
