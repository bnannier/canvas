// The kit's ScrollView (and the overlay scrollport) hand their children to React
// Native's ScrollView one for one while every child still hears its scroller
// (src/style/scroll-ancestry.tsx): a paging scroller gives each child its own snap cell,
// sticky headers are found by child index, and an empty slot adds no cell and moves no
// index. Compared with React Native's own ScrollView rendering the same children.
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { useContext, type ReactNode } from "react";
import { ScrollView as RNScrollView, Text, View } from "react-native";
import { ScrollView } from "../src/style/scroll-view.tsx";
import { OverlayScrollView } from "../src/style/overlay-scroll.tsx";
import { ScrollAncestryContext, useUnheardScroller } from "../src/style/scroll-ancestry.tsx";

afterEach(cleanup);

// What React Native made of each child: its cell (the node it sits in), and whether
// that cell is a snap cell or a sticky header.
const cells = (view: ReturnType<typeof render>, ids: readonly string[]) => ids.map((id) => {
  const cell = view.getByTestId(id).parentElement!;
  const style = getComputedStyle(cell);
  return { cell, snap: style.scrollSnapAlign, sticky: style.position === "sticky" };
});
const page = (id: string) => <View key={id} testID={id}><Text>{id}</Text></View>;

describe("a kit scroller passes its children through one for one", () => {
  it("gives each child of a paging scroller its own snap cell, as React Native does", () => {
    const own = render(<RNScrollView horizontal pagingEnabled>{page("a")}{page("b")}{page("c")}</RNScrollView>);
    const expected = cells(own, ["a", "b", "c"]);
    cleanup();
    for (const Scroller of [ScrollView, OverlayScrollView]) {
      const kit = render(<Scroller horizontal pagingEnabled>{page("a")}{page("b")}{page("c")}</Scroller>);
      const found = cells(kit, ["a", "b", "c"]);
      expect(new Set(found.map(({ cell }) => cell)).size).toBe(3);
      expect(found.map(({ snap }) => snap)).toEqual(expected.map(({ snap }) => snap));
      expect(found.every(({ snap }) => snap === "start")).toBe(true);
      cleanup();
    }
  });

  it("adds no cell for an empty slot and keeps every sticky header at its index", () => {
    const children = (): ReactNode[] => [null, page("a"), false, page("b"), page("c")];
    const own = render(<RNScrollView stickyHeaderIndices={[3]}>{children()}</RNScrollView>);
    const expected = cells(own, ["a", "b", "c"]).map(({ sticky }) => sticky);
    const container = own.getByTestId("a").parentElement!.parentElement!;
    const count = container.children.length;
    cleanup();
    const kit = render(<ScrollView stickyHeaderIndices={[3]}>{children()}</ScrollView>);
    expect(cells(kit, ["a", "b", "c"]).map(({ sticky }) => sticky)).toEqual(expected);
    expect(expected).toEqual([false, true, false]);
    expect(kit.getByTestId("a").parentElement!.parentElement!.children.length).toBe(count);
    cleanup();
    const paging = render(<ScrollView horizontal pagingEnabled>{children()}</ScrollView>);
    // Three pages, not five: the empty slots stay empty.
    expect(new Set(cells(paging, ["a", "b", "c"]).map(({ cell }) => cell)).size).toBe(3);
    expect(paging.getByTestId("a").parentElement!.parentElement!.children.length).toBe(3);
  });

  it("lets every child, paging or sticky, hear its scroller", () => {
    const heard: boolean[] = [];
    function Probe() {
      const ancestry = useContext(ScrollAncestryContext);
      const unheard = useUnheardScroller();
      heard.push(ancestry != null && !unheard);
      return null;
    }
    render(<ScrollView horizontal pagingEnabled><Probe /><Probe /></ScrollView>);
    render(<ScrollView stickyHeaderIndices={[0]}><Probe /><Probe /></ScrollView>);
    expect(heard.length).toBeGreaterThanOrEqual(4);
    expect(heard.every(Boolean)).toBe(true);
  });
});
