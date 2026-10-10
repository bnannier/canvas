// AnchoredOverlay's placement contract (the audit turn's AO-3, AO-4, AO-5, AO-7, AO-10
// and AO-11): the placement preference (above, beside at the start or end), the layout
// direction it follows by default and the keys its physical insets go out under, the
// window's safe area on all four edges, the 8px inset every edge keeps, and the cost of
// an overlay that is closed or idle.
import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { Profiler, useContext, useEffect, useRef, type ReactNode } from "react";
import { I18nManager, Text, View } from "react-native";
import { AnchoredOverlay, placeOverlay, useOverlayAnchor, useOverlaySide } from "../src/style/anchored-overlay.tsx";
import { fitOverlayHeight } from "../src/style/overlay-layout.ts";
import { OverlayProvider, useOverlayHost, type OverlayBounds, type OverlayHost } from "../src/style/portal.tsx";
import { SafeAreaFrameContext, SafeAreaInsetsContext } from "../src/style/safe-area.tsx";
import { NativeScrollContext, ScrollAncestryContext, useUnheardScroller } from "../src/style/scroll-ancestry.tsx";
import { ScrollView } from "../src/style/scroll-view.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { hostedEntranceParts, layoutHostedEntrance } from "./entrance-layout.ts";
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);

const settle = async () => {
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });
};

type Box = { x: number; y: number; width: number; height: number };
// Give the outlet, the trigger and every other node a box (happy-dom reports 0x0).
const withBoxes = async (boxOf: (node: Element) => Box, run: () => Promise<void>) => {
  const measure = spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const { x, y, width, height } = boxOf(this);
    return { x, y, width, height, left: x, top: y, right: x + width, bottom: y + height, toJSON: () => ({}) } as DOMRect;
  });
  try { await run(); } finally { measure.mockRestore(); }
};
const isOutlet = (node: Element) => getComputedStyle(node).zIndex === "1000";
const OUTLET = { x: 0, y: 0, width: 800, height: 600 };

// The card's placement wrapper, read back through its content.
const wrapperOf = (testID: string) => hostedEntranceParts(screen.getByTestId(testID)).entrance as HTMLElement;

function Anchored({ trigger, children, ...props }: { trigger?: ReactNode; children?: ReactNode } & Partial<Parameters<typeof AnchoredOverlay>[0]>) {
  const ref = useRef<View>(null);
  return <>
    <View ref={ref} testID="trigger">{trigger ?? <Text>Trigger</Text>}</View>
    <AnchoredOverlay open onDismiss={() => {}} triggerRef={ref} {...props}>
      <View testID="content">{children ?? <Text>Card</Text>}</View>
    </AnchoredOverlay>
  </>;
}
const hosted = (node: ReactNode) => render(<ThemeProvider light solid><OverlayProvider>{node}</OverlayProvider></ThemeProvider>);

describe("the placement preference (AO-3)", () => {
  const base = { triggerTop: 300, triggerHeight: 40, outletHeight: 600, gap: 4 };

  it("fits a card that prefers above, above, and flips it below only when below has more room", () => {
    expect(fitOverlayHeight({ ...base, desiredHeight: 200, currentSide: "above" })).toEqual({ side: "above", bottom: 304, maxHeight: 288 });
    // A trigger near the top: above is short, below is roomier, so it flips.
    expect(fitOverlayHeight({ ...base, triggerTop: 60, desiredHeight: 200, currentSide: "above" }).side).toBe("below");
    // Neither side holds it: capped to the larger band, never placed beside.
    const capped = fitOverlayHeight({ ...base, triggerTop: 340, desiredHeight: 2000, currentSide: "above" });
    expect(capped.side).toBe("above");
    expect(capped.maxHeight).toBe(328);
  });

  it("takes the preferred beside side first, the other next, then above or below, centered", () => {
    const cell = { x: 380, y: 200, width: 40, height: 40 };
    const opts = { cardWidth: 200, gap: 6, outletWidth: 800 };
    expect(placeOverlay(cell, { ...opts, besideEnd: true })).toEqual({ left: 426, top: 200, side: "end" });
    expect(placeOverlay(cell, { ...opts, besideStart: true })).toEqual({ left: 174, top: 200, side: "start" });
    // No room at the start: the end.
    expect(placeOverlay({ ...cell, x: 100 }, { ...opts, besideStart: true })).toEqual({ left: 146, top: 200, side: "end" });
    // Room at neither side: below (the vertical fit may still flip it above), centered.
    expect(placeOverlay({ ...cell, x: 100 }, { ...opts, outletWidth: 320, besideStart: true })).toEqual({ left: 20, top: 246 });
    // A content-sized card is placed beside once it has reported its width.
    expect(placeOverlay(cell, { gap: 6, outletWidth: 800, measuredWidth: 150, besideEnd: true })).toEqual({ left: 426, top: 200, side: "end" });
    expect(placeOverlay(cell, { gap: 6, outletWidth: 800, measuredWidth: null, besideEnd: true })).toEqual({ left: 380, top: 246 });
  });

  it("mounts a card that prefers above, above its trigger, and tells its decoration so", async () => {
    let side: string | undefined;
    function Decoration() { side = useOverlaySide(); return null; }
    await withBoxes((node) => isOutlet(node) ? OUTLET : node.getAttribute("data-testid") === "trigger" ? { x: 100, y: 400, width: 80, height: 32 } : OUTLET, async () => {
      hosted(<Anchored above decoration={<Decoration />} />);
      await settle();
      const wrapper = wrapperOf("content");
      expect(wrapper.style.bottom).toBe(`${600 - (400 - 4)}px`);
      expect(wrapper.style.top).toBe("");
      expect(side).toBe("above");
    });
  });

  it("reports a beside card's side to its decoration rather than calling it below", async () => {
    let side: string | undefined;
    function Decoration() { side = useOverlaySide(); return null; }
    await withBoxes((node) => isOutlet(node) ? OUTLET : node.getAttribute("data-testid") === "trigger" ? { x: 100, y: 200, width: 40, height: 40 } : OUTLET, async () => {
      hosted(<Anchored besideEnd cardWidth={200} gap={6} decoration={<Decoration />} />);
      await settle();
      expect(wrapperOf("content").style.left).toBe("146px");
      expect(side).toBe("end");
    });
  });
});

describe("the layout direction (AO-5)", () => {
  const stubDirection = (constants: { isRTL: boolean; doLeftAndRightSwapInRTL?: boolean }) => {
    const original = I18nManager.getConstants;
    I18nManager.getConstants = () => ({ ...original.call(I18nManager), ...constants });
    return () => { I18nManager.getConstants = original; };
  };

  it("composes a fixed width with right-to-left alignment instead of pushing the card off the outlet", () => {
    // Before: { right: 660 }, which put a 300px card's left edge at -160.
    expect(placeOverlay({ x: 100, y: 200, width: 40, height: 20 }, { cardWidth: 300, rtl: true, gap: 4, outletWidth: 800 })).toEqual({ left: 8, top: 224 });
    // Leading-aligned in RTL: the card's right edge on the trigger's right edge.
    expect(placeOverlay({ x: 500, y: 200, width: 40, height: 20 }, { cardWidth: 300, rtl: true, gap: 4, outletWidth: 800 })).toEqual({ left: 240, top: 224 });
    // Beside, RTL: the trailing side is the physical left.
    expect(placeOverlay({ x: 500, y: 200, width: 40, height: 20 }, { cardWidth: 300, rtl: true, besideEnd: true, gap: 4, outletWidth: 800 })).toEqual({ left: 196, top: 200, side: "end" });
  });

  it("follows the app's layout direction when the consumer does not say", async () => {
    const restore = stubDirection({ isRTL: true });
    try {
      await withBoxes((node) => isOutlet(node) ? OUTLET : node.getAttribute("data-testid") === "trigger" ? { x: 500, y: 100, width: 120, height: 32 } : OUTLET, async () => {
        hosted(<Anchored />);
        await settle();
        // Leading in RTL is the physical right: pinned by the right edge, the trigger's.
        const wrapper = wrapperOf("content");
        expect(wrapper.style.right).toBe(`${800 - 620}px`);
        expect(wrapper.style.left).toBe("");
      });
    } finally { restore(); }
  });

  it("hands physical insets to a renderer that swaps left and right under the keys it resolves", async () => {
    const restore = stubDirection({ isRTL: true, doLeftAndRightSwapInRTL: true });
    let centerX: number | undefined;
    function Decoration() { centerX = useOverlayAnchor().centerX; return null; }
    try {
      await withBoxes((node) => isOutlet(node) ? OUTLET : node.getAttribute("data-testid") === "trigger" ? { x: 500, y: 100, width: 120, height: 32 } : OUTLET, async () => {
        hosted(<Anchored decoration={<Decoration />} />);
        await settle();
        const content = screen.getByTestId("content");
        const wrapper = hostedEntranceParts(content).entrance as HTMLElement;
        layoutHostedEntrance(content, { width: 200, height: 100 });
        await settle();
        // Physically pinned by its right edge, 180 in; React Native reads `left` as the
        // start edge (the right one here), so that is the key the inset goes out under.
        expect(wrapper.style.left).toBe("180px");
        expect(wrapper.style.right).toBe("");
        // The trigger's center (560) seen from the card's start (right) edge, at 620.
        expect(centerX).toBe(60);
      });
    } finally { restore(); }
  });
});

describe("every edge keeps 8px inside the band (AO-10)", () => {
  it("clamps an anchored edge at the inset, not at the outlet's edge", () => {
    expect(placeOverlay({ x: 2, y: 0, width: 40, height: 20 }, { gap: 4, outletWidth: 400 })).toEqual({ left: 8, top: 24 });
    expect(placeOverlay({ x: 358, y: 0, width: 40, height: 20 }, { alignEnd: true, gap: 4, outletWidth: 400 })).toEqual({ right: 8, top: 24 });
  });

  it("caps a content-sized card and its trigger-derived minimum width to the band less both insets", async () => {
    await withBoxes((node) => isOutlet(node) ? { x: 0, y: 0, width: 400, height: 600 } : node.getAttribute("data-testid") === "trigger" ? { x: 4, y: 40, width: 392, height: 32 } : { x: 0, y: 0, width: 400, height: 600 }, async () => {
      hosted(<Anchored cardStyle={{ minWidth: 392 }} />);
      await settle();
      const parts = hostedEntranceParts(screen.getByTestId("content"));
      expect((parts.entrance as HTMLElement).style.maxWidth).toBe("384px");
      expect((parts.card as HTMLElement).style.minWidth).toBe("384px");
    });
  });
});

describe("the window's safe area (AO-4)", () => {
  const SAFE_FRAME = { x: 0, y: 0, width: 874, height: 402 };
  // Landscape: the sensor housing on the left, the home indicator at the bottom.
  const SAFE_INSETS = { top: 0, right: 0, bottom: 21, left: 62 };
  const inSafeArea = (node: ReactNode, insets = SAFE_INSETS) => (
    <SafeAreaFrameContext.Provider value={SAFE_FRAME}>
      <SafeAreaInsetsContext.Provider value={insets}>{node}</SafeAreaInsetsContext.Provider>
    </SafeAreaFrameContext.Provider>
  );
  function Capture({ onHost }: { onHost: (host: OverlayHost) => void }) {
    const host = useOverlayHost();
    useEffect(() => { onHost(host!); }, [host, onHost]);
    return null;
  }

  it("bounds a window layer's band by the safe rect on all four edges, and a nested host inherits it", async () => {
    await withBoxes(() => SAFE_FRAME, async () => {
      let root: OverlayHost | null = null;
      let nested: OverlayHost | null = null;
      render(inSafeArea(<ThemeProvider><OverlayProvider>
        <Capture onHost={(host) => { root = host; }} />
        <OverlayProvider style={{ flex: 0 }}><Capture onHost={(host) => { nested = host; }} /></OverlayProvider>
      </OverlayProvider></ThemeProvider>));
      const band = (host: OverlayHost) => new Promise<OverlayBounds>((resolve) => host.measureVisibleBounds!(resolve));
      expect(await band(root!)).toEqual({ x: 62, y: 0, width: 812, height: 381 });
      expect(await band(nested!)).toEqual({ x: 62, y: 0, width: 812, height: 381 });
    });
  });

  it("re-places open cards when the safe area changes (a rotation)", async () => {
    await withBoxes(() => SAFE_FRAME, async () => {
      let root: OverlayHost | null = null;
      const ui = (insets: typeof SAFE_INSETS) => inSafeArea(<ThemeProvider><OverlayProvider><Capture onHost={(host) => { root = host; }} /></OverlayProvider></ThemeProvider>, insets);
      const view = render(ui(SAFE_INSETS));
      let revisions = 0;
      const stop = root!.subscribeLayout!(() => { revisions += 1; });
      view.rerender(ui({ ...SAFE_INSETS, left: 0, right: 62 }));
      expect(revisions).toBe(1);
      stop();
    });
  });

  it("clamps a card off the sensor housing and above the home indicator", async () => {
    await withBoxes((node) => node.getAttribute("data-testid") === "trigger" ? { x: 30, y: 330, width: 80, height: 32 } : SAFE_FRAME, async () => {
      render(inSafeArea(<ThemeProvider light solid><OverlayProvider><Anchored /></OverlayProvider></ThemeProvider>));
      await settle();
      const wrapper = wrapperOf("content");
      layoutHostedEntrance(screen.getByTestId("content"), { width: 200, height: 120 });
      await settle();
      // Its leading edge 8 inside the safe edge (62), not at the trigger's 30.
      expect(wrapper.style.left).toBe("70px");
      // Too tall for the band below the trigger, above the home indicator: it flips above.
      expect(wrapper.style.bottom).toBe(`${402 - (330 - 4)}px`);
    });
  });
});

describe("an overlay costs nothing while it is closed or idle (AO-7, AO-11)", () => {
  it("does not re-render closed overlays when the window resizes", async () => {
    let commits = 0;
    function Closed() {
      const ref = useRef<View>(null);
      return <View ref={ref}><AnchoredOverlay open={false} onDismiss={() => {}} triggerRef={ref}><Text>Card</Text></AnchoredOverlay></View>;
    }
    render(<ThemeProvider><OverlayProvider>
      <Profiler id="closed" onRender={() => { commits += 1; }}>
        {Array.from({ length: 12 }, (_, index) => <Closed key={index} />)}
      </Profiler>
    </OverlayProvider></ThemeProvider>);
    await settle();
    const mounted = commits;
    act(() => resizeViewport(900, 700));
    act(() => resizeViewport(390, 844));
    await settle();
    expect(commits).toBe(mounted);
  });

  it("reads no layout while nothing happens, and once when a scroll is heard", async () => {
    let reads = 0;
    await withBoxes((node) => {
      reads += 1;
      return isOutlet(node) ? OUTLET : node.getAttribute("data-testid") === "trigger" ? { x: 100, y: 100, width: 80, height: 32 } : OUTLET;
    }, async () => {
      hosted(<Anchored />);
      await settle();
      layoutHostedEntrance(screen.getByTestId("content"), { width: 200, height: 100 });
      await settle();
      reads = 0;
      // Several idle frames: no read at all.
      await act(async () => { await new Promise((resolve) => setTimeout(resolve, 120)); });
      expect(reads).toBe(0);
      // A heard scroll: one round of reads on the next frame (the trigger and the outlet).
      act(() => { document.dispatchEvent(new Event("scroll")); });
      await waitFor(() => expect(reads).toBeGreaterThan(0));
      const once = reads;
      await act(async () => { await new Promise((resolve) => setTimeout(resolve, 120)); });
      expect(reads).toBe(once);
    });
  });

  it("keeps the frame poll only under a scroller the kit cannot hear", async () => {
    let unheardHere: boolean | undefined;
    let unheardInKit: boolean | undefined;
    function Probe({ onRead }: { onRead: (unheard: boolean) => void }) { onRead(useUnheardScroller()); return null; }
    render(<ThemeProvider>
      <NativeScrollContext.Provider value={{ horizontal: false }}>
        <Probe onRead={(value) => { unheardHere = value; }} />
        <ScrollView><Probe onRead={(value) => { unheardInKit = value; }} /></ScrollView>
      </NativeScrollContext.Provider>
    </ThemeProvider>);
    // React Native's own scroll context, not a kit scroller's: unheard. Inside the kit's
    // ScrollView, which re-provides that context with its own token: heard.
    expect(unheardHere).toBe(true);
    expect(unheardInKit).toBe(false);

    let reads = 0;
    await withBoxes((node) => {
      reads += 1;
      return isOutlet(node) ? OUTLET : node.getAttribute("data-testid") === "trigger" ? { x: 100, y: 100, width: 80, height: 32 } : OUTLET;
    }, async () => {
      hosted(<NativeScrollContext.Provider value={{ horizontal: false }}><Anchored /></NativeScrollContext.Provider>);
      await settle();
      reads = 0;
      await act(async () => { await new Promise((resolve) => setTimeout(resolve, 120)); });
      // Unheard: the card reads where its trigger sits each frame.
      expect(reads).toBeGreaterThan(2);
    });
  });

  it("hears a kit scroller and every kit scroller around it", () => {
    const heard: string[] = [];
    function Listener() {
      const ancestry = useContext(ScrollAncestryContext);
      useEffect(() => ancestry?.subscribe(() => heard.push("scroll")), [ancestry]);
      return <Text>Row</Text>;
    }
    const view = render(<ThemeProvider>
      <ScrollView testID="outer"><ScrollView testID="inner"><Listener /></ScrollView></ScrollView>
    </ThemeProvider>);
    act(() => { view.getByTestId("outer").dispatchEvent(new Event("scroll")); });
    act(() => { view.getByTestId("inner").dispatchEvent(new Event("scroll")); });
    expect(heard.length).toBe(2);
  });
});
