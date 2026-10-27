// Horizontal overflow for Tabs: a non-block underline/pills row rides inside a
// horizontal ScrollView so a row longer than its container pans instead of
// clipping; block and vertical render unwrapped as before. happy-dom fires no
// layout or scroll events, so the DOM assertions here are structural (wrapper
// present/absent) and the scroll-into-view positioning is covered as the pure
// tabScrollTarget function (the board-logic/chart-math precedent).
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { tabScrollTarget } from "../src/organisms/tabs/tabs.shared.tsx";
import { iosSkin, webSkin } from "../src/organisms/tabs/tabs.styles.ts";
import { colorsFor } from "../src/style/tokens.ts";

afterEach(cleanup);

const ui = (node: React.ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);
const rootOf = (testID: string) => document.querySelector(`[data-testid="${testID}"]`) as HTMLElement;

// The scroller frame is the ancestor carrying the overflowScroller style (the
// RNW overflow itself resolves to hashed classes, so the inline flexGrow:0 +
// maxWidth:100% pair is the stable inline signature).
const scrollerOf = (el: HTMLElement | null): HTMLElement | null => {
  for (let node = el?.parentElement ?? null; node; node = node.parentElement) {
    if (node.style.maxWidth === "100%" && node.style.flexGrow === "0") return node;
  }
  return null;
};

const MANY = ["General", "Security", "Notifications", "Billing", "Integrations", "Advanced"];

describe("Tabs horizontal overflow scroller", () => {
  it("wraps the underline row in the scroller frame", () => {
    ui(<Tabs tabs={MANY} testID="tabs" />);
    const row = rootOf("tabs");
    expect(row.getAttribute("role")).toBe("tablist");
    expect(scrollerOf(row)).not.toBeNull();
  });

  it("wraps the pills row in the scroller frame", () => {
    ui(<Tabs pills tabs={MANY} testID="tabs" />);
    expect(scrollerOf(rootOf("tabs"))).not.toBeNull();
  });

  it("leaves a block row unwrapped (equal shares cannot overflow)", () => {
    ui(<Tabs block tabs={MANY} testID="tabs" />);
    expect(scrollerOf(rootOf("tabs"))).toBeNull();
  });

  it("leaves the vertical rail unwrapped", () => {
    ui(<Tabs vertical tabs={MANY} testID="tabs" />);
    expect(scrollerOf(rootOf("tabs"))).toBeNull();
  });

  it("keeps selection and the single aria-selected working through the scroller", () => {
    let picked = -1;
    ui(<Tabs tabs={MANY} testID="tabs" onSelect={(i) => { picked = i; }} />);
    fireEvent.click(screen.getByText("Billing"));
    expect(picked).toBe(3);
    expect(rootOf("tabs").querySelectorAll('[aria-selected="true"]').length).toBe(1);
  });
});

// `wrap` trades the scroller for lines: the tablist is the outermost node, lays its
// lines out in place (flexWrap on the row) and the capsule skins square the track off
// to the corner concentric with the pills. happy-dom lays nothing out, so these are
// structural too: the frame, the wrap style, the corner.
describe("Tabs wrap", () => {
  it("lays the underline row out in place of the scroller frame", () => {
    ui(<Tabs wrap tabs={MANY} testID="tabs" />);
    const row = rootOf("tabs");
    expect(row.getAttribute("role")).toBe("tablist");
    expect(scrollerOf(row)).toBeNull();
    expect(row.style.flexWrap).toBe("wrap");
    // The scroller's hug-and-cap contract rides the row itself now.
    expect(row.style.maxWidth).toBe("100%");
  });

  it("lays the pills row out in place of the scroller frame", () => {
    ui(<Tabs pills wrap tabs={MANY} testID="tabs" />);
    const row = rootOf("tabs");
    expect(scrollerOf(row)).toBeNull();
    expect(row.style.flexWrap).toBe("wrap");
  });

  it("keeps the web pills track's own tile corner wrapped or not (it is no capsule)", () => {
    // The hand-off's pills track is a 12px tile, so a wrapped one needs no concentric corner.
    ui(<Tabs pills wrap tabs={MANY} testID="wrapped" />);
    expect(rootOf("wrapped").style.borderRadius).toBe("12px");
    ui(<Tabs pills tabs={MANY} testID="single" />);
    expect(rootOf("single").style.borderRadius).toBe("12px");
  });

  it("gives iOS its own skin, the UISegmentedControl the hand-off's K.PF ios row draws", () => {
    expect(iosSkin).not.toBe(webSkin);
  });

  it("lets block win: equal shares never overflow, so nothing wraps", () => {
    ui(<Tabs block wrap tabs={MANY} testID="tabs" />);
    const row = rootOf("tabs");
    expect(scrollerOf(row)).toBeNull();
    expect(row.style.flexWrap).not.toBe("wrap");
    expect(row.style.width).toBe("100%");
  });

  it("keeps selection and the single aria-selected working through a wrapped row", () => {
    let picked = -1;
    ui(<Tabs wrap tabs={MANY} testID="tabs" onSelect={(i) => { picked = i; }} />);
    fireEvent.click(screen.getByText("Integrations"));
    expect(picked).toBe(4);
    expect(rootOf("tabs").querySelectorAll('[aria-selected="true"]').length).toBe(1);
  });
});

// Geometry: a 600-wide row in a 300-wide viewport, 24px peek padding.
describe("tabScrollTarget", () => {
  it("returns null when the row fits the viewport", () => {
    expect(tabScrollTarget({ x: 500, width: 100 }, 600, 600, 0)).toBeNull();
    expect(tabScrollTarget({ x: 0, width: 100 }, 600, 400, 0)).toBeNull();
  });

  it("returns null before layout (zero viewport)", () => {
    expect(tabScrollTarget({ x: 500, width: 100 }, 0, 0, 0)).toBeNull();
  });

  it("scrolls a trigger past the trailing edge into view with peek padding", () => {
    expect(tabScrollTarget({ x: 400, width: 100 }, 300, 600, 0)).toBe(224);
  });

  it("scrolls a trigger past the leading edge into view with peek padding", () => {
    expect(tabScrollTarget({ x: 100, width: 100 }, 300, 600, 300)).toBe(76);
  });

  it("clamps to the scrollable range at both ends", () => {
    expect(tabScrollTarget({ x: 0, width: 100 }, 300, 600, 300)).toBe(0);
    expect(tabScrollTarget({ x: 520, width: 80 }, 300, 600, 0)).toBe(300);
  });

  it("returns null when the trigger is already fully visible", () => {
    expect(tabScrollTarget({ x: 330, width: 100 }, 300, 600, 300)).toBeNull();
  });
});

// The iOS skin is the hand-off's K.PF ios row (`P.tabs.ios` in tools/v4/handoff/cv-kit-platform.js).
describe("Tabs iOS segmented skin", () => {
  const dark = colorsFor("violet", "dark");
  const light = colorsFor("violet", "light");

  it("draws underline and pills as the capsule segmented control", () => {
    for (const row of [iosSkin.underlineRow(dark, false), iosSkin.pillsRow(dark, false)]) {
      expect(row).toMatchObject({ padding: 3, borderRadius: 9999, backgroundColor: dark.secondary });
    }
    // Wrapped, the track's corner is concentric with its segments: 7 + 18 / 2 + 3.
    expect(iosSkin.underlineRow(dark, true).borderRadius).toBe(19);
    expect(iosSkin.underlineTrigger(dark, false, true)).toMatchObject({ paddingHorizontal: 14, paddingVertical: 7, gap: 6, borderRadius: 9999, backgroundColor: "transparent" });
    expect(iosSkin.underlineLabel(dark, true)).toMatchObject({ fontSize: 13, lineHeight: 18, fontWeight: "600", color: dark.foreground });
    expect(iosSkin.underlineLabel(dark, false).fontWeight).toBe("500");
    expect(iosSkin.underlineIndicator(dark, true)).toEqual({ display: "none" });
  });

  it("raises the hand-off's --seg thumb: white in light, #5a5a63 on the dark neutrals", () => {
    expect(iosSkin.underlineTrigger(light, true, false).backgroundColor).toBe(light.card);
    expect(iosSkin.underlineTrigger(dark, true, true).backgroundColor).toBe("rgb(90, 90, 99)");
    expect(iosSkin.pillsFill(dark, true, true).backgroundColor).toBe("rgb(90, 90, 99)");
  });

  it("draws vertical as a 220pt grouped rail at the 10 corner", () => {
    expect(iosSkin.railWidth).toBe(220);
    expect(iosSkin.railGap).toBe(2);
    expect(iosSkin.verticalTrigger(dark, true)).toMatchObject({ borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, gap: 6 });
    expect(iosSkin.verticalFill(dark, true)).toEqual({ backgroundColor: dark.secondary });
    expect(iosSkin.verticalLabel(dark, true)).toMatchObject({ fontSize: 15, lineHeight: 20, fontWeight: "600", color: dark.foreground });
    expect(iosSkin.verticalLabel(dark, false).fontWeight).toBe("400");
  });

  it("sets the badge at 600 and dims a disabled tab to 0.5", () => {
    expect(iosSkin.countBadgeLabel(dark, false)).toMatchObject({ fontSize: 12, lineHeight: 16, fontWeight: "600", color: dark["muted-foreground"] });
    expect(iosSkin.countBadgeBox(dark)).toMatchObject({ paddingHorizontal: 7, paddingVertical: 1, backgroundColor: dark["surface-raised"] });
    expect(iosSkin.disabledOpacity).toBe(0.5);
    expect(iosSkin.hoverLabel).toBeNull();
  });
});
