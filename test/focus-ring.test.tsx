import { afterEach, describe, expect, it } from "bun:test";
import { createRef } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Glob } from "bun";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { View } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Pressable, FOCUS_RING_OFFSET, FOCUS_RING_WIDTH } from "../src/style/pressable.tsx";
import { Text, TextInput } from "../src/style/text.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { ScrollView } from "../src/style/scroll-view.tsx";
import { ScrollView as RNScrollView } from "react-native";
import { FOCUS_RESET } from "../src/style/focus-reset.ts";
import { darkColors, lightColors } from "../src/style/tokens.ts";
import { Button } from "../src/atoms/button/button.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { Slider } from "../src/atoms/slider/slider.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";
import { GeoMap } from "../src/charts/geo-map/geo-map.tsx";
import { Pagination as IOSPagination } from "../src/atoms/pagination/pagination.ios.tsx";
import { Accordion } from "../src/molecules/accordion/accordion.tsx";
import { Accordion as IOSAccordion } from "../src/molecules/accordion/accordion.ios.tsx";
import { Sidebar } from "../src/organisms/sidebar/sidebar.tsx";
import { Tabs as IOSTabs } from "../src/organisms/tabs/tabs.ios.tsx";
import { DragDropProvider, DropZone, Draggable, DragHandle } from "../src/organisms/drag-drop/drag-drop.tsx";
import { CodeBlock } from "../src/molecules/code-block/code-block.tsx";
import { LOOKS, lookProps } from "./fixtures/looks.ts";

// The keyboard focus ring. The kit's Pressable hands the browser the palette's `ring`
// colour and a 2 px offset, and the browser draws the ring on keyboard focus only. A
// control that paints its own focus state (a field) spreads FOCUS_RESET, which keeps
// winning; every other control shows the ring, drawn inside a full-bleed row that a
// clipping container would otherwise cut.

afterEach(cleanup);

const outline = (node: HTMLElement, property: "color" | "offset" | "style" | "width") => node.style.getPropertyValue(`outline-${property}`);
// Whether a node's inline style switches its outline off, either way a browser reads it: no
// style, or a zero width under a named style (the browser's `auto` ring ignores the width).
const suppressed = (node: HTMLElement) =>
  outline(node, "style") === "none" || (outline(node, "width") === "0px" && !["", "auto"].includes(outline(node, "style")));
const channels = (color: string) => {
  if (color.startsWith("#")) {
    const n = parseInt(color.slice(1), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  return (/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color) ?? []).slice(1, 4).join(",");
};
const INSET = `-${FOCUS_RING_OFFSET}px`;
const AROUND = `${FOCUS_RING_OFFSET}px`;

// The browser's one material question: does it render a CSS backdrop filter?
function backdropFilter(enabled: boolean) {
  const css = Object.getOwnPropertyDescriptor(globalThis, "CSS");
  Object.defineProperty(globalThis, "CSS", { value: { supports: () => enabled }, configurable: true });
  return () => {
    if (css) Object.defineProperty(globalThis, "CSS", css);
    else delete (globalThis as Record<string, unknown>).CSS;
  };
}

describe("the themed focus ring", () => {
  for (const look of LOOKS) {
    it(`colours a kit control's ring with the ${look.name} palette's ring, around the control`, () => {
      render(<ThemeProvider {...lookProps(look)} solid><Button primary testID="save">Save</Button></ThemeProvider>);
      const button = screen.getByTestId("save");
      expect(channels(outline(button, "color"))).toBe(channels(look.tokens.ring));
      expect(outline(button, "offset")).toBe(AROUND);
      // The browser draws it: no style is forced, so it only shows on keyboard focus.
      expect(outline(button, "style")).toBe("");
    });
  }

  it("leaves a field, which paints its own focus border, on its reset", () => {
    render(<ThemeProvider light solid><Input label="Name" testID="name" /></ThemeProvider>);
    // A solid outline of zero width paints nothing (a zero width alone would leave the
    // browser's `auto` ring, which ignores it); `solid` is a style native parses.
    expect(outline(screen.getByTestId("name"), "width")).toBe("0px");
    expect(outline(screen.getByTestId("name"), "style")).toBe("solid");
  });

  it("draws the ring inside full-bleed rows a clipping container would cut", () => {
    render(
      <ThemeProvider light solid>
        <Accordion card items={[{ key: "a", title: "Billing", content: "Plans" }]} />
        <IOSAccordion items={[{ key: "b", title: "Team", content: "Roles" }]} />
        <Sidebar defaultActive="Dashboard" items={[{ label: "Dashboard" }, { label: "Inbox" }]} />
      </ThemeProvider>,
    );
    for (const name of ["Billing", "Team"]) {
      const header = screen.getByRole("button", { name });
      expect(outline(header, "offset"), name).toBe(INSET);
      expect(outline(header, "style"), name).toBe("");
    }
    const row = screen.getByText("Inbox").closest("[tabindex]") as HTMLElement;
    expect(outline(row, "offset")).toBe(INSET);
    expect(outline(row, "style")).toBe("");
  });

  it("keeps the ring around a bare header, which nothing clips", () => {
    render(<ThemeProvider light solid><Accordion items={[{ key: "a", title: "Billing", content: "Plans" }]} /></ThemeProvider>);
    const header = screen.getByRole("button", { name: "Billing" });
    expect(outline(header, "offset")).toBe(AROUND);
    expect(outline(header, "style")).toBe("");
  });

  it("no longer suppresses the ring on the iOS skins the docs preview on the web", () => {
    render(
      <ThemeProvider light solid>
        <IOSPagination total={3} />
        <IOSTabs tabs={["Overview", "Activity"]} />
      </ThemeProvider>,
    );
    const focusable = [...screen.getAllByRole("button"), ...screen.getAllByRole("tab")];
    expect(focusable.length).toBeGreaterThan(3);
    for (const node of focusable) expect(suppressed(node), node.textContent ?? "").toBe(false);
  });

  it("rings the drag handle, a focusable View rather than a Pressable", () => {
    render(
      <ThemeProvider light solid>
        <DragDropProvider>
          <DropZone id="list" label="Tasks">
            <Draggable id="a" data={{ id: "a" }} label="Write the spec">
              <DragHandle label="Reorder Write the spec" testID="grip" />
            </Draggable>
          </DropZone>
        </DragDropProvider>
      </ThemeProvider>,
    );
    const grip = screen.getByTestId("grip");
    expect(outline(grip, "style")).toBe("");
    expect(outline(grip, "offset")).toBe(AROUND);
  });

  it("keeps the style callback and the ref", () => {
    const ref = createRef<View>();
    render(
      <ThemeProvider light solid>
        <Pressable ref={ref} testID="bare" style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })} />
      </ThemeProvider>,
    );
    const bare = screen.getByTestId("bare");
    expect(bare.style.opacity).toBe("1");
    expect(outline(bare, "offset")).toBe(AROUND);
    expect(ref.current as unknown).toBe(bare);
  });

  for (const look of LOOKS) {
    it(`colours a raw TextInput's ring with the ${look.name} palette's ring, as a Pressable's`, () => {
      render(<ThemeProvider {...lookProps(look)} solid><TextInput accessibilityLabel="Name" testID="raw" style={{ height: 36 }} /></ThemeProvider>);
      const field = screen.getByTestId("raw");
      expect(channels(outline(field, "color"))).toBe(channels(look.tokens.ring));
      expect(outline(field, "offset")).toBe(AROUND);
      // The browser draws it on keyboard focus only: no style or width is forced.
      expect(outline(field, "style")).toBe("");
      expect(outline(field, "width")).toBe("");
      expect(field.style.height).toBe("36px");
    });
  }

  for (const look of LOOKS) {
    it(`colours a raw ScrollView's ring with the ${look.name} palette's ring, as a Pressable's`, () => {
      // Chromium and Firefox make a scroller with nothing focusable inside it a keyboard
      // stop of its own, and the browser draws its ring there.
      const ref = createRef<RNScrollView>();
      render(
        <ThemeProvider {...lookProps(look)} solid>
          <ScrollView ref={ref} testID="scroller" style={{ height: 120 }}><TextInput accessibilityLabel="Inside" /></ScrollView>
        </ThemeProvider>,
      );
      const scroller = screen.getByTestId("scroller");
      expect(channels(outline(scroller, "color"))).toBe(channels(look.tokens.ring));
      expect(outline(scroller, "offset")).toBe(AROUND);
      // The browser draws it on keyboard focus only: no style or width is forced.
      expect(outline(scroller, "style")).toBe("");
      expect(outline(scroller, "width")).toBe("");
      expect(scroller.style.height).toBe("120px");
      // The ref is React Native's own scroller, with its scroll methods.
      expect(typeof ref.current?.scrollTo).toBe("function");
    });
  }

  for (const look of LOOKS) {
    it(`colours a Typography link's ring with the ${look.name} palette's ring, as a Pressable's`, () => {
      // react-native-web renders a Text with an `href` as an <a>, a keyboard stop the
      // browser rings; before the Text primitive carried the kit's ring, this one took
      // the browser's own colour (the docs' Inline links (href) example).
      render(
        <ThemeProvider {...lookProps(look)} solid>
          <Typography small>
            Read the <Typography small underline href="https://canvas.nannier.com">Canvas docs</Typography> for the full list.
          </Typography>
        </ThemeProvider>,
      );
      const link = screen.getByRole("link", { name: "Canvas docs" });
      expect(link.tagName).toBe("A");
      expect(channels(outline(link, "color"))).toBe(channels(look.tokens.ring));
      expect(outline(link, "offset")).toBe(AROUND);
      // The browser draws it on keyboard focus only: no style or width is forced.
      expect(outline(link, "style")).toBe("");
      expect(outline(link, "width")).toBe("");
    });
  }

  it("rings a Text in the link role, and leaves plain text without a ring", () => {
    render(
      <ThemeProvider light solid>
        <Text accessibilityRole="link" testID="role-link">Open</Text>
        <Text testID="plain">Read me</Text>
        <Typography testID="heading" h2>Title</Typography>
      </ThemeProvider>,
    );
    expect(channels(outline(screen.getByTestId("role-link"), "color"))).toBe(channels(lightColors.ring));
    expect(outline(screen.getByTestId("role-link"), "offset")).toBe(AROUND);
    for (const id of ["plain", "heading"]) {
      expect(outline(screen.getByTestId(id), "color"), id).toBe("");
      expect(outline(screen.getByTestId(id), "offset"), id).toBe("");
    }
  });

  it("lets a scroller that hands its ring to a frame keep its reset", () => {
    // A terminal's scrollport sits flush inside its clipping card, so the card draws the
    // ring (src/style/focus-frame.tsx) and the scrollport's own reset wins over the
    // primitive's ring.
    render(<ThemeProvider light solid><CodeBlock terminal code={"bun run build && bun run test --timeout 20000 ./test ./tools"} /></ThemeProvider>);
    const ports = [...document.querySelectorAll<HTMLElement>("*")].filter((node) => node.style.getPropertyValue("outline-offset") === AROUND && node.style.getPropertyValue("outline-width") === "0px");
    expect(ports.length).toBeGreaterThan(0);
    for (const port of ports) expect(suppressed(port)).toBe(true);
  });

  it("leaves every kit field on its reset, so the field's own border is the one focus cue", () => {
    render(
      <ThemeProvider light solid>
        <Input label="Name" testID="input" />
        <Textarea label="Notes" testID="notes" />
        <Command items={[{ label: "Open file" }]} />
      </ThemeProvider>,
    );
    const search = screen.getByRole("search").querySelector("input")!;
    const fields = [screen.getByTestId("input"), screen.getByTestId("notes"), search];
    for (const field of fields) {
      expect(outline(field, "width")).toBe("0px");
      expect(outline(field, "style")).toBe("solid");
    }
  });

  it("rings the DataTable cell editor, whose border marks editing rather than focus", () => {
    // The editor's primary border is on for as long as the cell is open, so it is no
    // focus cue; the editor keeps the browser's ring, now in the palette's colour.
    render(<ThemeProvider light solid><DataTable columns={["Name"]} rows={[["Ada"]]} inlineEdit onCellCommit={() => {}} /></ThemeProvider>);
    fireEvent.click(screen.getByText("Ada"));
    const editor = screen.getByRole("textbox", { name: "Edit Name for Ada" });
    expect(channels(outline(editor, "color"))).toBe(channels(lightColors.ring));
    expect(outline(editor, "offset")).toBe(AROUND);
    expect(suppressed(editor)).toBe(false);
  });

  for (const glass of [false, true]) {
    it(`rings the Slider's knob on keyboard focus only${glass ? ", over the glass knob" : ""}`, () => {
      const restore = backdropFilter(true);
      try {
        render(<ThemeProvider light glass={glass} solid={!glass}><Slider testID="volume" accessibilityLabel="Volume" defaultValue={40} /></ThemeProvider>);
        const root = screen.getByTestId("volume");
        const knob = screen.getByTestId("volume-thumb");
        expect(knob.querySelectorAll('[data-testid="glass-material"]').length).toBe(glass ? 1 : 0);
        expect(outline(knob, "width")).toBe("");
        // Tab lands on the slider and releases there: the knob wears the kit's ring.
        act(() => { fireEvent.keyUp(root, { key: "Tab" }); });
        expect(channels(outline(knob, "color"))).toBe(channels(lightColors.ring));
        expect(outline(knob, "style")).toBe("solid");
        expect(outline(knob, "width")).toBe(`${FOCUS_RING_WIDTH}px`);
        expect(outline(knob, "offset")).toBe(AROUND);
        // The focus is no border: the knob keeps its resting border width.
        expect(knob.style.borderWidth).toBe("1px");
        // A pointer press ends the keyboard mark, as :focus-visible does.
        act(() => { fireEvent.pointerDown(root); });
        expect(outline(knob, "width")).toBe("");
        // The root drops the browser's own outline, so the two never stack.
        expect(suppressed(root)).toBe(true);
      } finally { restore(); }
    });
  }

  for (const glass of [false, true]) {
    it(`rings a zoomable GeoMap's whole chart on keyboard focus, zoom bar included${glass ? ", under glass" : ""}`, () => {
      // The zoom bar sits over the map's bottom-right corner, so a ring around the map
      // itself would run under its buttons: the chart's surface draws it instead.
      const restore = backdropFilter(true);
      try {
        render(
          <ThemeProvider dark glass={glass} solid={!glass}>
            <GeoMap zoomable title="Installs" points={[{ label: "London", lat: 51.5072, lng: -0.1276, count: 5170 }]} />
          </ThemeProvider>,
        );
        const chart = screen.getByRole("group", { name: "Installs chart" });
        const map = screen.getByRole("img", { name: /Installs/ });
        expect(map.getAttribute("tabindex")).toBe("0");
        // The map drops the browser's own ring, so the two never stack.
        expect(suppressed(map)).toBe(true);
        expect(outline(chart, "width")).toBe("");
        const zoomIn = screen.getByRole("button", { name: "Zoom in" });
        expect(chart.contains(zoomIn)).toBe(true);
        // Tab lands on the map and releases there: the chart wears the kit's ring.
        act(() => { fireEvent.keyUp(map, { key: "Tab" }); });
        expect(channels(outline(chart, "color"))).toBe(channels(darkColors.ring));
        expect(outline(chart, "style")).toBe("solid");
        expect(outline(chart, "width")).toBe(`${FOCUS_RING_WIDTH}px`);
        expect(outline(chart, "offset")).toBe(AROUND);
        // A pointer press on the map ends the keyboard mark, as :focus-visible does.
        act(() => { fireEvent.pointerDown(map); });
        expect(outline(chart, "width")).toBe("");
      } finally { restore(); }
    });
  }

  it("draws a solid ring in --ring on :focus-visible wherever the CSS hand-off is loaded", () => {
    const base = readFileSync(new URL("../styles/tokens/base.css", import.meta.url), "utf8");
    const layer = /@layer base\s*\{([\s\S]*)\n\}/.exec(base)?.[1] ?? "";
    expect(layer).toMatch(/:focus-visible\{outline:var\(--ring-width\) solid var\(--ring\);outline-offset:var\(--ring-offset\)\}/);
    const shadows = readFileSync(new URL("../styles/tokens/shadows.css", import.meta.url), "utf8");
    expect(shadows).toContain(`--ring-offset:${FOCUS_RING_OFFSET}px`);
    // A frame's ring (src/style/focus-frame.tsx) is drawn by the kit itself, at the same width.
    expect(shadows).toContain(`--ring-width:${FOCUS_RING_WIDTH}px`);
  });
});

// React Native parses the outline keys natively too (View and TextInput), and its parser
// accepts only the styles it names: anything else, `none` included, logs "Could not parse
// OutlineStyle" on every node that carries it. The accepted set is read from the parser
// itself, so the scan follows React Native if it ever widens it.
describe("outline styles native can parse", () => {
  const ROOT = join(import.meta.dir, "..");
  const parser = readFileSync(join(ROOT, "node_modules/react-native/ReactCommon/react/renderer/components/view/conversions.h"), "utf8");
  const body = /fromRawValue\([^)]*OutlineStyle &result\)\s*\{([\s\S]*?)\n\}/.exec(parser)?.[1] ?? "";
  const accepted = new Set([...body.matchAll(/stringValue == "(\w+)"/g)].map((match) => match[1]));

  it("reads the accepted styles from React Native's prop parser", () => {
    expect(accepted.has("solid")).toBe(true);
  });

  it("gives FOCUS_RESET a style native accepts and a zero width", () => {
    expect(accepted.has(FOCUS_RESET.outlineStyle as string)).toBe(true);
    expect(FOCUS_RESET.outlineWidth).toBe(0);
  });

  it("writes no other outline style anywhere a React Native tree renders", () => {
    const files = ["src", "docs/src", "examples", "packages"]
      .flatMap((dir) => [...new Glob(`${dir}/**/*.{ts,tsx}`).scanSync(ROOT)])
      .filter((file) => !file.endsWith(".d.ts") && !file.includes("node_modules/"));
    expect(files.length).toBeGreaterThan(200);
    // The key quoted or not, and every string literal in its value, so a conditional
    // (`focused ? "solid" : "none"`) is read whole.
    const rejected = files.flatMap((file) =>
      [...readFileSync(join(ROOT, file), "utf8").matchAll(/["']?outlineStyle["']?\s*:\s*([^,}\n]+)/g)]
        .flatMap((match) => [...match[1]!.matchAll(/["'`](\w+)["'`]/g)].map((literal) => literal[1]!))
        .filter((value) => !accepted.has(value))
        .map((value) => `${file}: ${value}`));
    expect(rejected).toEqual([]);
  });
});
