import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { View, TextInput } from "../src/style/primitives.ts";
import { ScrollView } from "../src/style/scroll-view.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { Chat } from "../src/organisms/chat/chat.tsx";
import { colorsFor } from "../src/style/tokens.ts";
import type { ExampleScope } from "../docs/src/core/scope.ts";
import { DETAIL_SPECS } from "../docs/src/core/data/detail-specs.ts";
import { componentName, initialKnobs } from "../docs/src/ui/detail/knobs.ts";
import { InteractionOverride } from "../src/style/interaction-override.tsx";

// Docs have their own dependency tree; use the renderer's React for this DOM harness.
mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);
const { referenceSpecimen } = await import("../docs/src/ui/detail/reference-specimens.tsx");

afterEach(cleanup);
const scope = { View, TextInput, ScrollView, Typography, Chat, tokens: colorsFor("violet", "dark") } as ExampleScope;
const specimen = (name: string, props = {}) => render(<ThemeProvider dark solid>{referenceSpecimen(scope, name, props)}</ThemeProvider>);

describe("reference conversation and scrolling specimens", () => {
  it("targets the complete Chat export from the generated detail spec", () => {
    expect(DETAIL_SPECS.chat.propsInterface).toBe("ChatProps");
    expect(componentName(DETAIL_SPECS.chat, initialKnobs(DETAIL_SPECS.chat.knobs))).toBe("Chat");
  });

  it("renders the whole conversation and its working composer rather than the delivery-error example", () => {
    specimen("Chat");
    expect(screen.getByText("Can the accent follow our brand hue?")).toBeTruthy();
    expect(screen.getByText("Yes. Set one oklch hue and every ion token, glow and ring follows.")).toBeTruthy();
    expect(screen.queryByText("Reply failed")).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Message" }), { target: { value: "Review the cyan accent" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByText("Review the cyan accent")).toBeTruthy();
    expect((screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement).value).toBe("");
  });

  it("gives every horizontal tile definite dimensions and preserves all ten numbered children", () => {
    specimen("ScrollView", { horizontal: true });
    const scroll = screen.getByTestId("detail-reference-scroll-view");
    expect(scroll.style.height).toBe("102px");
    for (let index = 1; index <= 10; index++) {
      const tile = screen.getByTestId(`detail-reference-scroll-tile-${index}`);
      expect(tile.textContent).toBe(String(index));
      expect(tile.style.width).toBe("120px");
      expect(tile.style.height).toBe("80px");
    }
  });

  it("switches to ten vertical tiles in a bounded 180px viewport", () => {
    specimen("ScrollView", { horizontal: false });
    expect(screen.getByTestId("detail-reference-scroll-view").style.height).toBe("180px");
    expect(screen.getAllByTestId(/^detail-reference-scroll-tile-/)).toHaveLength(10);
    const tile = screen.getByTestId("detail-reference-scroll-tile-1");
    expect(tile.style.width).toBe("");
    expect(tile.style.height).toBe("40px");
  });

  it("leaves unrelated components and ChatMessage examples to the normal specimen renderer", () => {
    expect(referenceSpecimen(scope, "Button", {})).toBeUndefined();
    expect(referenceSpecimen(scope, "ChatMessage", {})).toBeUndefined();
  });

  it("keeps raw TextInput editable, synchronizes knob values, and shows the authored focus underline", () => {
    const view = specimen("TextInput", { placeholder: "Write here", value: "Draft" });
    const input = screen.getByRole("textbox", { name: "Text input example" }) as HTMLInputElement;
    expect(input.value).toBe("Draft");
    expect(input.style.color.match(/[\d.]+/g)?.slice(0, 3).map(Number)).toEqual(
      [1, 3, 5].map((start) => parseInt(scope.tokens.foreground.slice(start, start + 2), 16)),
    );
    expect(input.style.height).toBe("36px");
    fireEvent.change(input, { target: { value: "Edited draft" } });
    expect(input.value).toBe("Edited draft");
    fireEvent.focus(input);
    const focusColor = input.style.borderBottomColor;
    fireEvent.blur(input);
    expect(input.style.borderBottomColor).not.toBe(focusColor);
    view.rerender(<ThemeProvider dark solid>{referenceSpecimen(scope, "TextInput", { value: "Knob value", multiline: true })}</ThemeProvider>);
    const multiline = screen.getByRole("textbox", { name: "Text input example" }) as HTMLTextAreaElement;
    expect(multiline.value).toBe("Knob value");
    expect(multiline.tagName).toBe("TEXTAREA");
    expect(multiline.style.height).toBe("88px");
  });

  it("respects a read-only primitive and renders both View children with the knob's text", () => {
    specimen("TextInput", { editable: false });
    expect((screen.getByRole("textbox") as HTMLInputElement).readOnly).toBe(true);
    expect(screen.getByRole("textbox").getAttribute("aria-disabled")).toBe("true");
    cleanup();
    specimen("View", { children: { element: "Text", children: "Parent data" } });
    expect(screen.getByTestId("detail-reference-view-child-1").textContent).toBe("Parent data");
    expect(screen.getByTestId("detail-reference-view-child-2").textContent).toBe("View");
    expect(screen.getByTestId("detail-reference-view").style.minWidth).toBe("220px");
  });

  it("uses the same accent underline for the pinned Focus specimen without taking keyboard focus", () => {
    specimen("TextInput");
    const resting = screen.getByRole("textbox").style.borderBottomColor;
    cleanup();
    render(<ThemeProvider dark solid><InteractionOverride focused>{referenceSpecimen(scope, "TextInput", {})}</InteractionOverride></ThemeProvider>);
    expect(screen.getByRole("textbox").style.borderBottomColor).not.toBe(resting);
    expect(document.activeElement).not.toBe(screen.getByRole("textbox"));
  });
});
