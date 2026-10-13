import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { Text, View, type ViewStyle } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";
import { GlassSurface as IOSGlassSurface } from "../src/style/glass-surface/glass-surface.ios.tsx";
import { Card, CodeBlock, StackedList, Feed, MediaObject, Calendar, Command, Navbar, Sidebar, DataTable, Stats } from "../src/index.ts";

// GlassSurface's geometry under the owner's GP-1 decision (audit/DECISIONS.md), the one
// GlassPane's hosts already follow: under glass the material covers the surface's whole
// solid footprint. The host trades its resting border for padding of the same width, so it
// keeps its size and its content stays put while its padding box, which the material fills,
// grows to the footprint. A state border stays a border in its own colour, and the material
// sits flush inside it with concentric corners. In solid mode the host is the skin's style.
// Before this, GlassBox kept the border's width as a transparent inset and laid its material
// inside it, one border width in from the solid edge (a static Card 1 px smaller than a
// pressable one, a selected Card's material corners rounder than its border's inner curve).
//
// happy-dom computes no layout, so the boxes are read the way the browser resolves them: an
// absolutely filled child lies on its parent's padding box, so a box is its parent's box
// less the parent's border on each side.

afterEach(cleanup);

type Side = "top" | "right" | "bottom" | "left";
const SIDES: readonly Side[] = ["top", "right", "bottom", "left"];
const px = (value: string) => (value === "" ? 0 : Number.parseFloat(value));
const borderOf = (node: Element, side: Side) => px(getComputedStyle(node).getPropertyValue(`border-${side}-width`));
const paddingOf = (node: Element, side: Side) => px(getComputedStyle(node).getPropertyValue(`padding-${side}`));
const insetsOf = (node: Element) => Object.fromEntries(SIDES.map((side) => [side, borderOf(node, side) + paddingOf(node, side)])) as Record<Side, number>;
const bordersOf = (node: Element) => Object.fromEntries(SIDES.map((side) => [side, borderOf(node, side)])) as Record<Side, number>;
const radiusOf = (node: Element, corner = "top-left") => getComputedStyle(node).getPropertyValue(`border-${corner}-radius`);
const ZERO = { top: 0, right: 0, bottom: 0, left: 0 };
const materialOf = (host: Element) => host.querySelector(':scope > [data-testid="glass-material"]') as HTMLElement | null;

const SHAPE: ViewStyle = { width: 200, height: 80, borderRadius: 14, borderWidth: 1, borderColor: "#e4e4e7", backgroundColor: "#ffffff", padding: 12 };

async function renderIn(surface: "glass" | "solid", ui: ReactNode) {
  const result = render(<ThemeProvider light glass={surface === "glass"} solid={surface === "solid"}>{ui}</ThemeProvider>);
  if (surface === "glass") await waitFor(() => expect(result.container.querySelector('[data-testid="glass-material"]')).not.toBeNull());
  return result;
}

describe("GlassBox covers the surface's whole solid footprint", () => {
  it("a resting bordered surface: the border becomes padding and the material fills the footprint with the shape's radii", async () => {
    const { getByTestId } = await renderIn("glass", <GlassSurface layer="content" testID="host" style={SHAPE}><Text>Content</Text></GlassSurface>);
    const host = getByTestId("host");
    // The content keeps its place: 1 of border and 12 of padding become 13 of padding.
    expect(bordersOf(host)).toEqual(ZERO);
    expect(insetsOf(host)).toEqual({ top: 13, right: 13, bottom: 13, left: 13 });
    expect(host.style.backgroundColor).toBe("rgba(0, 0, 0, 0.00)");
    const material = materialOf(host)!;
    expect(material).not.toBeNull();
    // An absolutely filled first child of a borderless host: the whole 200 x 80 footprint.
    expect(SIDES.map((side) => material.style.getPropertyValue(side))).toEqual(["0px", "0px", "0px", "0px"]);
    expect(radiusOf(material)).toBe("14px");
    // Its tint, blur and rim layers take the same corners, so the web's backdrop filter is
    // clipped to the footprint's own rounded box.
    for (const layer of Array.from(material.children)) expect(radiusOf(layer)).toBe("14px");
  });

  it("a state border stays in its colour and the material sits flush inside it with concentric corners", async () => {
    const state: ViewStyle = { ...SHAPE, borderWidth: 2, borderColor: "#7262e5" };
    const { getByTestId } = await renderIn("glass", <GlassSurface layer="content" stateBorder testID="host" style={state}><Text>Content</Text></GlassSurface>);
    const host = getByTestId("host");
    expect(bordersOf(host)).toEqual({ top: 2, right: 2, bottom: 2, left: 2 });
    expect(host.style.borderTopColor || host.style.borderColor).toMatch(/114, ?98, ?229/);
    expect(insetsOf(host)).toEqual({ top: 14, right: 14, bottom: 14, left: 14 });
    const material = materialOf(host)!;
    // Inside the 2 px border, on its inner curve: 14 less 2.
    expect(radiusOf(material)).toBe("12px");
    for (const layer of Array.from(material.children)) expect(radiusOf(layer)).toBe("12px");
  });

  it("a one-sided border (a sheet's top edge, a bar's bottom edge) becomes padding on that side alone", async () => {
    const sheet: ViewStyle = { height: 300, borderTopWidth: 1, borderColor: "#e4e4e7", borderTopStartRadius: 22, borderTopEndRadius: 22, paddingTop: 8 };
    const bar: ViewStyle = { height: 56, borderBottomWidth: 1, borderBottomColor: "#e4e4e7", paddingHorizontal: 16 };
    const { getByTestId } = await renderIn("glass", <>
      <GlassSurface testID="sheet" style={sheet}><Text>Sheet</Text></GlassSurface>
      <GlassSurface testID="bar" style={bar}><Text>Bar</Text></GlassSurface>
    </>);
    const sheetHost = getByTestId("sheet");
    expect(bordersOf(sheetHost)).toEqual(ZERO);
    expect(insetsOf(sheetHost)).toEqual({ top: 9, right: 0, bottom: 0, left: 0 });
    expect(radiusOf(materialOf(sheetHost)!, "top-left")).toBe("22px");
    const barHost = getByTestId("bar");
    expect(bordersOf(barHost)).toEqual(ZERO);
    expect(insetsOf(barHost)).toEqual({ top: 0, right: 16, bottom: 1, left: 16 });
  });

  it("the iOS host lays its material on the same footprint", async () => {
    // The optional native peers are absent under test, so the iOS host's material resolves
    // solid; its GlassBox geometry is the shared one this file pins on the web host, and the
    // iOS material layers are pinned in test/glass-surface-ios.test.tsx.
    const { getByTestId } = await renderIn("solid", <IOSGlassSurface testID="host" style={SHAPE}><Text>Content</Text></IOSGlassSurface>);
    expect(insetsOf(getByTestId("host"))).toEqual({ top: 13, right: 13, bottom: 13, left: 13 });
  });

  it("leaves the solid tree untouched: the host is the skin's style and nothing else", async () => {
    const solid = await renderIn("solid", <GlassSurface testID="host" style={SHAPE}><Text>Content</Text></GlassSurface>);
    const surfaceHtml = solid.container.innerHTML;
    cleanup();
    const plain = render(<ThemeProvider light solid><View testID="host" style={SHAPE}><Text>Content</Text></View></ThemeProvider>);
    expect(surfaceHtml).toBe(plain.container.innerHTML);
  });
});

// Every kit GlassSurface whose root carries a testID: the host keeps its solid insets under
// glass (the content does not move when the mode changes), its border is padding, and its
// material is its first child, filling the footprint.
const HOSTS: { name: string; node: ReactNode }[] = [
  { name: "Card (static)", node: <Card testID="host" title="Plan"><Text>Body</Text></Card> },
  { name: "StackedList (framed)", node: <StackedList testID="host" title="People" items={[{ title: "Ada" }, { title: "Grace" }]} /> },
  { name: "Feed", node: <Feed testID="host" items={[{ actor: "Ada", action: "commented", time: "1h" }]} /> },
  { name: "MediaObject (bordered)", node: <MediaObject testID="host" bordered title="Release notes" description="Version 2" /> },
  { name: "Calendar", node: <Calendar testID="host" /> },
  { name: "Command", node: <Command testID="host" items={[{ label: "Open" }]} /> },
  { name: "Navbar", node: <Navbar testID="host" title="Canvas" /> },
  { name: "Sidebar", node: <Sidebar testID="host" items={[{ label: "Inbox" }]} /> },
  { name: "DataTable", node: <DataTable testID="host" columns={[{ key: "name", header: "Name" }]} rows={[{ name: "Ada" }]} /> },
];

describe("every kit GlassSurface keeps its solid insets and lays its material on its footprint", () => {
  for (const { name, node } of HOSTS) {
    it(name, async () => {
      const solid = await renderIn("solid", node);
      const solidInsets = insetsOf(solid.getByTestId("host"));
      cleanup();
      const glass = await renderIn("glass", node);
      const host = glass.getByTestId("host");
      expect(insetsOf(host), "insets").toEqual(solidInsets);
      expect(bordersOf(host), "border").toEqual(ZERO);
      const material = materialOf(host);
      expect(material, "material").not.toBeNull();
      expect(SIDES.map((side) => material!.style.getPropertyValue(side))).toEqual(["0px", "0px", "0px", "0px"]);
    });
  }
});

describe("a GlassSurface's absolutely placed child keeps its solid place", () => {
  // Offsets count from the host's padding box, which under glass grew over the border. Where
  // solid's host has a border (Calendar), the child adds it back (`panePlaced`); where solid's
  // host has none and only glass's root carries the card's border (CodeBlock), the traded
  // border puts the child back where solid has it, which the transparent inset had moved.
  const absoluteIn = (root: HTMLElement, match: (node: HTMLElement) => boolean) =>
    Array.from(root.querySelectorAll("*")).find((node) => (node as HTMLElement).style.position === "absolute" && match(node as HTMLElement)) as HTMLElement;

  it("CodeBlock's floating copy chip sits 8 from the card's top and end edges in both modes", async () => {
    const chipOf = (root: HTMLElement) => absoluteIn(root, (node) => node.querySelector('[role="button"]') != null);
    const offsets = (host: HTMLElement) => {
      const chip = chipOf(host);
      return { top: borderOf(host, "top") + px(chip.style.top), end: borderOf(host, "right") + px(chip.style.right) };
    };
    const solid = await renderIn("solid", <CodeBlock testID="host" copy code="const a = 1;" />);
    expect(offsets(solid.getByTestId("host"))).toEqual({ top: 8, end: 8 });
    cleanup();
    const glass = await renderIn("glass", <CodeBlock testID="host" copy code="const a = 1;" />);
    const host = glass.getByTestId("host");
    // Only glass's root carries the card's surface: its border is padding, its material the footprint.
    expect(bordersOf(host)).toEqual(ZERO);
    expect(materialOf(host)).not.toBeNull();
    expect(offsets(host)).toEqual({ top: 8, end: 8 });
  });

  it("Calendar's day peek, anchored inline with no overlay host, hangs from the same edge in both modes", async () => {
    const calendar = <Calendar testID="host" dayPeek month="May 2026" daysInMonth={31} startWeekday={4} events={[{ day: 8, title: "Offsite" }]} />;
    const anchorLeft = async (surface: "glass" | "solid") => {
      const result = await renderIn(surface, calendar);
      fireEvent.click(result.getByRole("button", { name: "8, 1 event" }));
      const host = result.getByTestId("host");
      const card = absoluteIn(host, (node) => node.style.top === "100%" && node.parentElement === host);
      expect(card).toBeDefined();
      const left = borderOf(host, "left") + px(card.style.left);
      cleanup();
      return left;
    };
    // Solid's root has a 1 px border, so the card hangs 1 px in from the outer edge.
    expect(await anchorLeft("solid")).toBe(1);
    expect(await anchorLeft("glass")).toBe(1);
  });
});
