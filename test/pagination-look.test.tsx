import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { I18nManager } from "react-native";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as iconModule from "../src/atoms/icon/icon.tsx";
import * as touchTargetSeed from "../src/style/touch-target-seed.ts";
import { webHover } from "../src/style/hover.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { Pagination } from "../src/atoms/pagination/pagination.tsx";
import { arrowIcon } from "../src/atoms/pagination/pagination.shared.tsx";
import { Pagination as IOSPagination } from "../src/atoms/pagination/pagination.ios.tsx";
import { Pagination as AndroidPagination } from "../src/atoms/pagination/pagination.android.tsx";
import { webSkin, iosSkin, androidSkin, itemSize, arrowSize, selectorSize, labelSize, gapBox, cellStep, iconSize, selectorIconSize, numberedRow, compactRow, type Size } from "../src/atoms/pagination/pagination.styles.ts";
import { MONO_FONT } from "../src/style/mono.ts";

// Pagination has no platform control (PLATFORM-REFERENCES.md), so every platform takes the
// v4 hand-off's pager (its `pagination` renderer in tools/v4/handoff/cv-kit-inputs.js): 8-
// cornered hairline cells at 28 / 34 / 40, 500 13px mono numerals in the muted ink, the
// current page the accent fill under its own ink with the accent's glow, Prev / Next a 14px
// chevron and a 500 13px label, the ellipsis s / 1.5 wide in the subtle ink, the secondary
// hover wash, and .4 for disabled.

afterEach(cleanup);

const t = lightColors;
const flat = (value: string) => value.replace(/\s/g, "");
const hex = (color: string) => [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
const rgbaOf = (color: string) => `rgba(${hex(color).join(",")},1.00)`;

describe("the hand-off's pager on every platform", () => {
  it("is one skin on the web, iOS and Android", () => {
    expect(iosSkin).toBe(webSkin);
    expect(androidSkin).toBe(webSkin);
  });

  it("draws a resting page as an 8-cornered hairline cell, its number 500 mono in the muted ink", () => {
    expect(webSkin.pageBox(t, false)).toMatchObject({ borderRadius: 8, borderWidth: 1, borderColor: t.border, backgroundColor: "transparent" });
    expect(webSkin.pageLabel(t, false)).toEqual({ fontFamily: MONO_FONT, fontWeight: "500", color: t["muted-foreground"] });
  });

  it("fills the current page with the accent under its own ink, the accent's glow beneath it", () => {
    expect(webSkin.pageBox(t, true)).toMatchObject({
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.primary,
      backgroundColor: t.primary,
      boxShadow: `0px 6px 16px -6px ${t.glow}`,
    });
    expect(webSkin.pageLabel(t, true)).toEqual({ fontFamily: MONO_FONT, fontWeight: "500", color: t["primary-foreground"] });
  });

  it("draws the arrows on the border hairline and the rows-per-page trigger on the input edge", () => {
    expect(webSkin.controlBox(t)).toMatchObject({ borderRadius: 8, borderWidth: 1, borderColor: t.border, backgroundColor: "transparent" });
    expect(webSkin.selectorBox(t)).toMatchObject({ borderRadius: 8, borderWidth: 1, borderColor: t.input, backgroundColor: "transparent", gap: 6 });
    expect(webSkin.controlLabel(t)).toEqual({ fontWeight: "500", color: t["muted-foreground"] });
    expect(webSkin.selectorLabel(t)).toEqual({ fontWeight: "400", color: t.foreground });
    expect(webSkin.mutedLabel(t)).toEqual({ fontWeight: "400", color: t["muted-foreground"] });
    expect(webSkin.gapLabel(t).color).toBe(t["subtle-foreground"]);
  });

  it("is the hand-off's metrics at every size: 28 / 34 / 40 cells, 13px labels, 14px chevrons, s / 1.5 gaps", () => {
    const step: Record<Size, number> = { small: 28, default: 34, large: 40 };
    for (const size of ["small", "default", "large"] as Size[]) {
      expect(cellStep[size], size).toBe(step[size]);
      expect(itemSize[size], size).toEqual({ height: step[size], minWidth: step[size] });
      expect(arrowSize[size], size).toEqual({ height: step[size], minWidth: step[size], paddingHorizontal: 10, gap: 4 });
      expect(selectorSize[size], size).toEqual({ height: step[size], paddingHorizontal: 10 });
      expect(labelSize[size].fontSize, size).toBe(13);
      expect(iconSize[size], size).toBe(14);
      expect(gapBox[size].width, size).toBeCloseTo(step[size] / 1.5);
    }
    expect(selectorIconSize).toBe(12);
    expect(numberedRow.gap).toBe(6);
    expect(compactRow.gap).toBe(10);
  });

  it("labels the arrows Prev and Next beside the numbers, never at the small size or in the compact row", () => {
    render(<ThemeProvider light solid><Pagination total={3} defaultPage={2} /></ThemeProvider>);
    expect(screen.getByRole("button", { name: "Previous page" }).textContent).toBe("Prev");
    expect(screen.getByRole("button", { name: "Next page" }).textContent).toBe("Next");
    cleanup();
    render(
      <ThemeProvider light solid>
        <Pagination small total={3} defaultPage={2} />
        <Pagination compact total={3} defaultPage={2} />
      </ThemeProvider>,
    );
    for (const button of [...screen.getAllByRole("button", { name: "Previous page" }), ...screen.getAllByRole("button", { name: "Next page" })]) {
      expect(button.textContent).toBe("");
    }
  });

  it("widens a three-digit page past the square with the hand-off's 10px inset", () => {
    render(<ThemeProvider light solid><Pagination total={120} defaultPage={100} /></ThemeProvider>);
    expect(screen.getByRole("button", { name: "Page 100" }).style.paddingLeft).toBe("10px");
    expect(screen.getByRole("button", { name: "Page 1" }).style.paddingLeft).toBe("");
  });

  it("dims a disabled pager as one at .4, and an end arrow on its own in an enabled one", () => {
    expect(webSkin.disabledOpacity).toBe(0.4);
    render(<ThemeProvider light solid><Pagination disabled total={3} defaultPage={2} testID="off" /></ThemeProvider>);
    expect(screen.getByTestId("off").style.opacity).toBe("0.4");
    for (const button of screen.getAllByRole("button")) expect(button.style.opacity, button.getAttribute("aria-label") ?? "").toBe("");
    // A disabled current page keeps its fill under the dim.
    expect(flat(screen.getByRole("button", { name: "Page 2" }).style.backgroundColor)).toBe(rgbaOf(t.primary));
    cleanup();
    render(<ThemeProvider light solid><Pagination total={3} defaultPage={1} testID="on" /></ThemeProvider>);
    expect(screen.getByTestId("on").style.opacity).toBe("");
    expect(screen.getByRole("button", { name: "Previous page" }).style.opacity).toBe("0.4");
    expect(screen.getByRole("button", { name: "Next page" }).style.opacity).toBe("");
  });
});

describe("the pager renders kit icons for its controls, and the renderer's text ellipsis in a gap", () => {
  // The test DOM stubs react-native-svg (tools/rnw-preload.ts), so an Icon draws nothing
  // there; a spy on the Icon export reads which glyph each one was asked for, in order.
  const glyphs = (ui: React.ReactElement) => {
    const spy = spyOn(iconModule, "Icon");
    try {
      render(ui);
      return spy.mock.calls.map(([props]) => Object.keys(props).find((key) => key !== "decorative" && (props as Record<string, unknown>)[key] === true));
    } finally {
      spy.mockRestore();
    }
  };

  it("draws a chevron in each arrow and the text ellipsis in each gap", () => {
    const drawn = glyphs(<ThemeProvider light solid><Pagination total={12} defaultPage={6} testID="pages" /></ThemeProvider>);
    expect(drawn).toEqual(["chevronLeft", "chevronRight"]);
    // The arrows' only text is their label; the chevron is the icon, never a glyph.
    expect(["Previous page", "Next page"].map((name) => screen.getByRole("button", { name }).textContent)).toEqual(["Prev", "Next"]);
    expect((screen.getByTestId("pages").textContent ?? "")).not.toMatch(/[‹›▾]/);
    // A gap is the renderer's `<span>…</span>` (cv-kit-inputs.js `pagination`), hidden from
    // assistive technology: two gaps around the window at page 6 of 12.
    expect((screen.getByTestId("pages").textContent ?? "").match(/…/g)?.length).toBe(2);
  });

  it("draws a chevron-down in the rows-per-page trigger", () => {
    const drawn = glyphs(<ThemeProvider light solid><Pagination withSize total={12} /></ThemeProvider>);
    expect(drawn).toEqual(["chevronDown", "chevronLeft", "chevronRight"]);
    expect(screen.getByRole("button", { name: "Rows per page" }).textContent).toBe("10");
  });

  it("points Previous along the reading direction, so it points right under right-to-left", () => {
    expect([arrowIcon("previous", false), arrowIcon("next", false)]).toEqual(["chevronLeft", "chevronRight"]);
    expect([arrowIcon("previous", true), arrowIcon("next", true)]).toEqual(["chevronRight", "chevronLeft"]);
    const original = I18nManager.getConstants;
    I18nManager.getConstants = () => ({ ...original.call(I18nManager), isRTL: true });
    try {
      expect(glyphs(<ThemeProvider light solid><Pagination total={3} defaultPage={2} /></ThemeProvider>)).toEqual(["chevronRight", "chevronLeft"]);
    } finally {
      I18nManager.getConstants = original;
    }
  });
});

describe("hover and platforms", () => {
  // The hover wash, the hand-off's `--sf3` (`secondary`), as react-native-web prints it.
  const [wr, wg, wb] = hex(t.secondary);
  const wash = new RegExp(`rgba\\(${wr},\\s*${wg},\\s*${wb},\\s*1\\.00\\)`);
  it("washes a resting page and an arrow at once on hover, never the current page or a disabled arrow", () => {
    render(<ThemeProvider light solid><Pagination total={3} defaultPage={1} /></ThemeProvider>);
    for (const name of ["Page 2", "Next page"]) {
      const cell = screen.getByRole("button", { name });
      expect(cell.style.getPropertyValue("transition-property"), name).toBe("");
      fireEvent.pointerEnter(cell, { pointerType: "mouse" });
      expect(cell.style.backgroundColor, name).toMatch(wash);
      fireEvent.pointerLeave(cell);
      expect(cell.style.backgroundColor, name).not.toMatch(wash);
    }
    const current = screen.getByRole("button", { name: "Page 1" });
    fireEvent.pointerEnter(current, { pointerType: "mouse" });
    expect(flat(current.style.backgroundColor)).toBe(rgbaOf(t.primary));
    // Page 1 is the first page, so Previous is disabled.
    const previous = screen.getByRole("button", { name: "Previous page" });
    fireEvent.pointerEnter(previous, { pointerType: "mouse" });
    expect(previous.style.backgroundColor).not.toMatch(wash);
  });

  it("washes the rows-per-page trigger on hover, and nothing in a disabled pager", () => {
    render(<ThemeProvider light solid><Pagination withSize total={3} /></ThemeProvider>);
    const trigger = screen.getByRole("button", { name: "Rows per page" });
    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    expect(trigger.style.backgroundColor).toMatch(wash);
    cleanup();
    render(
      <ThemeProvider light solid>
        <Pagination disabled total={3} defaultPage={1} />
        <Pagination disabled withSize total={3} />
      </ThemeProvider>,
    );
    for (const cell of [screen.getByRole("button", { name: "Page 2" }), screen.getByRole("button", { name: "Rows per page" }), ...screen.getAllByRole("button", { name: "Next page" })]) {
      fireEvent.pointerEnter(cell, { pointerType: "mouse" });
      expect(cell.style.backgroundColor, cell.getAttribute("aria-label") ?? "").not.toMatch(wash);
    }
  });

  it("declares the wash on the web only: native pointer hover waits on the owner", () => {
    const look = { backgroundColor: t.secondary };
    expect(webHover(look, "web")).toBe(look);
    expect(webHover(look, "ios")).toBeNull();
    expect(webHover(look, "android")).toBeNull();
    // The test DOM is the web build, where the shared skin keeps its wash.
    expect(webSkin.hover?.(t)).toEqual(look);
  });

  it("grows the arrows' touch area vertically beside a page, and both ways beside the compact count", () => {
    const axes = (ui: React.ReactElement) => {
      const spy = spyOn(touchTargetSeed, "useSeededMinTargetSlop");
      try {
        render(ui);
        return spy.mock.calls.map(([, , options]) => options?.axis ?? "both");
      } finally {
        spy.mockRestore();
        cleanup();
      }
    };
    // Numbered: the two arrows and three pages, all 6px apart.
    expect(axes(<ThemeProvider light solid><Pagination total={3} /></ThemeProvider>)).toEqual(["vertical", "vertical", "vertical", "vertical", "vertical"]);
    // Compact: the two arrows sit beside the count.
    expect(axes(<ThemeProvider light solid><Pagination compact total={3} /></ThemeProvider>)).toEqual(["both", "both"]);
    // With size: the trigger has room; the arrows sit 6px apart.
    expect(axes(<ThemeProvider light solid><Pagination withSize total={3} /></ThemeProvider>)).toEqual(["both", "vertical", "vertical"]);
  });

  it("reads the item range beside the size selector when itemCount is set, as the prop promises", () => {
    render(<ThemeProvider light solid><Pagination withSize itemCount={118} total={12} defaultPage={2} defaultPageSize={10} /></ThemeProvider>);
    expect(screen.getByText("Showing 11-20 of 118")).toBeTruthy();
    cleanup();
    render(<ThemeProvider light solid><Pagination withSize total={12} defaultPage={2} /></ThemeProvider>);
    expect(screen.getByText("Page 2 of 12")).toBeTruthy();
  });

  it("renders the same pager from the iOS and Android entries", () => {
    render(
      <ThemeProvider light solid>
        <IOSPagination total={3} defaultPage={2} testID="ios" />
        <AndroidPagination total={3} defaultPage={2} testID="android" />
      </ThemeProvider>,
    );
    for (const id of ["ios", "android"]) {
      const current = document.querySelector(`[data-testid="${id}"] [aria-current="page"]`) as HTMLElement;
      expect(flat(current.style.backgroundColor), id).toBe(rgbaOf(t.primary));
      expect(flat(getComputedStyle(current.querySelector("div") as HTMLElement).color), id).toBe(rgbaOf(t["primary-foreground"]));
    }
  });
});
