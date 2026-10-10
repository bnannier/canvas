// The placement option's first consumer and the phone sheet (the audit turn's AO-3 and
// AO-6): Popover's `top` anchors the card above its trigger, flipping below without room,
// and its iOS beak follows the side the card took; at the phone form factor a card that
// offers a sheet and can close is presented as one along the bottom of the window.
import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef, type ReactNode } from "react";
import { Text, View } from "react-native";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { Popover as IOSPopover } from "../src/atoms/popover/popover.ios.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { iosSkin, webSkin } from "../src/atoms/popover/popover.styles.tsx";
import { AnchoredOverlay } from "../src/style/anchored-overlay.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { hostedEntranceParts, layoutHostedEntrance } from "./entrance-layout.ts";
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);

const settle = async () => {
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });
};
type Box = { x: number; y: number; width: number; height: number };
const WINDOW: Box = { x: 0, y: 0, width: 390, height: 844 };
const withBoxes = async (boxOf: (node: Element) => Box, run: () => Promise<void>) => {
  const measure = spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const { x, y, width, height } = boxOf(this);
    return { x, y, width, height, left: x, top: y, right: x + width, bottom: y + height, toJSON: () => ({}) } as DOMRect;
  });
  try { await run(); } finally { measure.mockRestore(); }
};
const triggerAt = (box: Box) => (node: Element) => node.getAttribute("data-testid") === "trigger" ? box : WINDOW;
const hosted = (node: ReactNode) => render(<ThemeProvider light solid><OverlayProvider>{node}</OverlayProvider></ThemeProvider>);
// The held card's placement wrapper and parts, read before the reveal releases the hold.
const held = async (role: string) => hostedEntranceParts(await screen.findByRole(role, { hidden: true }));

describe("Popover's top anchors above its trigger (AO-3, P3e)", () => {
  it("places the card above the trigger, and below by default", async () => {
    await withBoxes(triggerAt({ x: 40, y: 500, width: 120, height: 32 }), async () => {
      hosted(<Popover testID="trigger" top trigger="Rename" title="Rename project" />);
      fireEvent.click(screen.getByRole("button", { name: "Rename" }));
      const parts = await held("dialog");
      // Its bottom edge the gap above the trigger's top.
      expect((parts.entrance as HTMLElement).style.bottom).toBe(`${844 - (500 - 4)}px`);
      expect((parts.entrance as HTMLElement).style.top).toBe("");
    });
    cleanup();
    await withBoxes(triggerAt({ x: 40, y: 500, width: 120, height: 32 }), async () => {
      hosted(<Popover testID="trigger" trigger="Rename" title="Rename project" />);
      fireEvent.click(screen.getByRole("button", { name: "Rename" }));
      const parts = await held("dialog");
      expect((parts.entrance as HTMLElement).style.top).toBe(`${500 + 32 + 4}px`);
    });
  });

  it("flips a top card below a trigger with no room above it", async () => {
    await withBoxes(triggerAt({ x: 40, y: 20, width: 120, height: 32 }), async () => {
      hosted(<Popover testID="trigger" top trigger="Rename" title="Rename project" />);
      fireEvent.click(screen.getByRole("button", { name: "Rename" }));
      const parts = await held("dialog");
      layoutHostedEntrance(parts.content, { width: 260, height: 200 });
      await settle();
      expect((parts.entrance as HTMLElement).style.top).toBe(`${20 + 32 + 4}px`);
    });
  });

  it("points the iOS beak at the trigger from the side the card took", async () => {
    // The beak is an SVG path (which draws nothing under happy-dom), so read the edge
    // the skin is asked to draw it on.
    const asked: string[] = [];
    const draw = iosSkin.arrow!;
    const arrow = spyOn(iosSkin, "arrow").mockImplementation((tokens, placement, anchor) => { asked.push(placement); return draw(tokens, placement, anchor); });
    try {
      await withBoxes(triggerAt({ x: 40, y: 500, width: 120, height: 32 }), async () => {
        hosted(<IOSPopover testID="trigger" top trigger="Rename" title="Rename project" />);
        fireEvent.click(screen.getByRole("button", { name: "Rename" }));
        await held("dialog");
        // Above the trigger: the beak rides the card's bottom edge, pointing down.
        expect(asked.at(-1)).toBe("top");
      });
      cleanup();
      await withBoxes(triggerAt({ x: 40, y: 20, width: 120, height: 32 }), async () => {
        hosted(<IOSPopover testID="trigger" top trigger="Rename" title="Rename project" />);
        fireEvent.click(screen.getByRole("button", { name: "Rename" }));
        const parts = await held("dialog");
        layoutHostedEntrance(parts.content, { width: 260, height: 200 });
        await settle();
        // Flipped below a trigger with no room above it: the beak points up.
        expect(asked.at(-1)).toBe("bottom");
      });
    } finally { arrow.mockRestore(); }
  });
});

describe("the phone sheet (AO-6)", () => {
  it("presents a Popover as a sheet along the bottom of the window at the phone form factor", async () => {
    act(() => resizeViewport(390, 844));
    await withBoxes(triggerAt({ x: 40, y: 200, width: 120, height: 32 }), async () => {
      hosted(<Popover testID="trigger" trigger="Rename" title="Rename project" actionLabel="Save" />);
      fireEvent.click(screen.getByRole("button", { name: "Rename" }));
      const parts = await held("dialog");
      const wrapper = parts.entrance as HTMLElement;
      // As wide as the band (8px nowhere: a sheet spans it), standing on its bottom edge.
      expect(wrapper.style.left).toBe("0px");
      expect(wrapper.style.right).toBe("0px");
      expect(wrapper.style.bottom).toBe("0px");
      expect(wrapper.style.top).toBe("");
      // The skin's sheet, capped below the band's top by the sheet's gap.
      const card = (parts.card as HTMLElement).getAttribute("style") ?? "";
      expect(card).toContain(`border-top-left-radius: ${webSkin.sheet(lightColors).borderTopLeftRadius}px`);
      expect(card).toContain(`max-height: ${844 - 48}px`);
      expect(card).not.toContain("width: 260px");
      // Over a dimming scrim, which closes it like any outside tap.
      const backdrop = [...wrapper.parentElement!.children].find((child) => child !== wrapper) as HTMLElement;
      expect(getComputedStyle(backdrop).backgroundColor).not.toBe("");
      expect(backdrop.getAttribute("style") ?? "").toContain("background-color");
      fireEvent.click(backdrop);
      await settle();
      expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
    });
  });

  it("caps a sheet at 640 and centers it on a wider band", async () => {
    act(() => resizeViewport(600, 900));
    function Sheet() {
      const ref = useRef<View>(null);
      return <>
        <View ref={ref} testID="trigger"><Text>Open</Text></View>
        <AnchoredOverlay open onDismiss={() => {}} triggerRef={ref} sheetStyle={{ padding: 16 }}><View testID="content"><Text>Body</Text></View></AnchoredOverlay>
      </>;
    }
    await withBoxes((node) => node.getAttribute("data-testid") === "trigger" ? { x: 10, y: 10, width: 80, height: 32 } : { x: 0, y: 0, width: 1000, height: 900 }, async () => {
      hosted(<Sheet />);
      const parts = hostedEntranceParts(await screen.findByTestId("content"));
      expect((parts.entrance as HTMLElement).style.left).toBe("180px");
      expect((parts.entrance as HTMLElement).style.right).toBe("180px");
    });
  });

  it("keeps a card anchored above the phone form factor, pinned open, or without a sheet to offer", async () => {
    act(() => resizeViewport(1280, 800));
    await withBoxes(triggerAt({ x: 40, y: 200, width: 120, height: 32 }), async () => {
      hosted(<Popover testID="trigger" trigger="Rename" title="Rename project" />);
      fireEvent.click(screen.getByRole("button", { name: "Rename" }));
      expect(((await held("dialog")).entrance as HTMLElement).style.top).toBe(`${200 + 32 + 4}px`);
    });
    cleanup();
    act(() => resizeViewport(390, 844));
    await withBoxes(triggerAt({ x: 40, y: 200, width: 120, height: 32 }), async () => {
      // Pinned open (it cannot close): a sheet would cover the page for good.
      hosted(<Popover testID="trigger" open trigger="Rename" title="Rename project" />);
      expect(((await held("dialog")).entrance as HTMLElement).style.top).toBe(`${200 + 32 + 4}px`);
    });
    cleanup();
    await withBoxes(triggerAt({ x: 40, y: 200, width: 120, height: 32 }), async () => {
      // A menu stays anchored on phones, as HIG and Material 3 keep it.
      hosted(<Dropdown testID="trigger" trigger="Actions" items={[{ label: "Edit" }]} />);
      fireEvent.click(screen.getByRole("button", { name: "Actions" }));
      expect(((await held("menu")).entrance as HTMLElement).style.bottom).toBe("");
    });
  });
});
