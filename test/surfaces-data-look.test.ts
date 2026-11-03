import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { shadow } from "../src/style/index.ts";
import { MONO_FONT, DISPLAY_FONT } from "../src/style/mono.ts";
import * as stats from "../src/molecules/stats/stats.styles.ts";
import * as table from "../src/organisms/data-table/data-table.styles.ts";
import * as stacked from "../src/molecules/stacked-lists/stacked-lists.styles.ts";
import * as grid from "../src/molecules/grid-lists/grid-lists.styles.ts";
import * as media from "../src/molecules/media-objects/media-objects.styles.ts";
import * as feeds from "../src/molecules/feeds/feeds.styles.ts";
import * as dl from "../src/molecules/description-lists/description-lists.styles.ts";

// The v4 hand-off's Surfaces & data renderers (tools/v4/handoff/cv-kit-data.js K.def and the
// code-driven forms in cv-kit-code3.js), pinned by their numbers.
const subtle = t["subtle-foreground"];

describe("the v4 stats", () => {
  // Snippets that pass `items` render through the code-driven renderer (cv-kit-code3.js
  // `stats`); only the dense surfaces come from the base one (cv-kit-data.js `K.def`).
  it("draws a framed tile at 14, 16 in, lines 8 apart, tiles 12 apart, with no shadow", () => {
    const tile = stats.webSkin.cardSurface(t);
    expect(tile).toMatchObject({ borderRadius: 14, borderWidth: 1, borderColor: t.border, backgroundColor: t.card, padding: 16, gap: 8 });
    expect(tile.boxShadow).toBeUndefined();
    expect(stats.webSkin.rowGap.card).toEqual({ gap: 12 });
  });

  it("keeps the dense tiles on the base renderer's raised card", () => {
    expect(stats.webSkin.denseCard(t, false)).toMatchObject({ borderRadius: 16, padding: 12, gap: 6, boxShadow: shadow("sm", t).boxShadow });
    expect(stats.webSkin.denseCard(t, true).padding).toBe(18);
    expect(stats.webSkin.denseLabel(t, false)).toMatchObject({ fontSize: 12, fontWeight: "500", color: subtle });
    expect(stats.webSkin.denseDeltaBase).toMatchObject({ fontFamily: MONO_FONT, fontSize: 12, fontWeight: "500" });
  });

  it("sets the figure 600 28 (20 compact, 36 large) in the display face, tracked -0.02em", () => {
    expect(stats.webSkin.valueText(t)).toMatchObject({ fontFamily: DISPLAY_FONT, fontSize: 28, lineHeight: 28, fontWeight: "600", letterSpacing: -0.56 });
    expect(stats.webSkin.denseValue(t, false).fontSize).toBe(20);
    expect(stats.webSkin.denseValue(t, true).fontSize).toBe(36);
    expect(stats.webSkin.labelText(t)).toMatchObject({ fontSize: 13, fontWeight: "500", color: t["muted-foreground"] });
    expect(stats.webSkin.deltaBase).toMatchObject({ fontSize: 12, fontWeight: "500" });
    expect(stats.webSkin.deltaBase.fontFamily).toBeUndefined();
  });

  it("rules the group's metrics with hairlines inside one card", () => {
    expect(stats.webSkin.plainContainer(t)).toMatchObject({ borderRadius: 16, borderWidth: 1, backgroundColor: t.card, overflow: "hidden" });
    expect(stats.webSkin.plainItem(t, false)).toMatchObject({ padding: 16, gap: 8, borderLeftWidth: 1, borderLeftColor: t.border });
    expect(stats.webSkin.plainItem(t, true).borderLeftWidth).toBeUndefined();
    expect(stats.webSkin.rowGap.plain).toEqual({ gap: 0 });
  });

  it("plots the trend line as the hand-off's spark helper does", () => {
    expect(stats.SPARK).toEqual({ width: 84, height: 28, stroke: 1.75 });
    expect(stats.sparkPoints([0, 10, 5])).toBe("0.0,26.0 42.0,2.0 84.0,14.0");
    // A flat series sits on the floor rather than dividing by zero.
    expect(stats.sparkPoints([3, 3])).toBe("0.0,26.0 84.0,26.0");
  });

  it("shares the tile on iOS and Android in the platform face", () => {
    for (const skin of [stats.iosSkin, stats.androidSkin]) {
      expect(skin.cardSurface(t)).toEqual(stats.webSkin.cardSurface(t));
      expect(skin.valueText(t).fontFamily).toBeUndefined();
    }
  });
});

describe("the v4 data table", () => {
  it("frames the table at 14 with a popover header band of 500 12 muted labels", () => {
    expect(table.webSkin.frame!(t)).toMatchObject({ borderRadius: 14, borderWidth: 1, borderColor: t.border, backgroundColor: t.card });
    expect(table.webSkin.headerRow(t)).toMatchObject({ backgroundColor: t.popover, borderBottomWidth: 1 });
    expect(table.webSkin.headerCell(t)).toMatchObject({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: t["muted-foreground"] });
  });

  it("sets 400 13/18 cells 16 across, 12 down at the regular density", () => {
    expect(table.webSkin.cellText(t)).toMatchObject({ fontSize: 13, lineHeight: 18, fontWeight: "400" });
    expect(table.webSkin.cellPad.regular).toMatchObject({ paddingHorizontal: 16, paddingVertical: 12 });
    expect(table.webSkin.pressTint(t)).toEqual({ backgroundColor: t["primary-soft"] });
  });
});

describe("the v4 stacked list", () => {
  it("frames the rows at 14 under the small shade, 16 by 12 in", () => {
    expect(stacked.webSkin.cardSurface(t)).toMatchObject({ borderRadius: 14, borderWidth: 1, backgroundColor: t.card });
    expect(stacked.webSkin.rowBase).toMatchObject({ gap: 12, paddingHorizontal: 16, paddingVertical: 12 });
    expect(stacked.webSkin.nameLabel(t)).toMatchObject({ fontSize: 14, fontWeight: "500" });
    expect(stacked.webSkin.metaLabel(t)).toMatchObject({ fontFamily: MONO_FONT, fontSize: 12, color: subtle });
  });
});

describe("the v4 grid list", () => {
  it("frames a gallery tile at 14 with a 110 thumbnail over a 10 by 12 caption", () => {
    expect(grid.webSkin.galleryTile!(t)).toMatchObject({ borderRadius: 14, borderWidth: 1, backgroundColor: t.card, overflow: "hidden" });
    expect(grid.galleryThumb).toMatchObject({ height: 110 });
    expect(grid.webSkin.galleryCaption).toMatchObject({ paddingVertical: 10, paddingHorizontal: 12, gap: 2 });
    expect(grid.webSkin.gap).toEqual({ default: 12, compact: 8 });
  });
});

describe("the v4 media object", () => {
  it("leads with a 40 icon box at 11, a 500 14 title over a 400 12 description", () => {
    expect(media.webSkin.iconBox).toMatchObject({ width: 40, height: 40, borderRadius: 11 });
    expect(media.webSkin.title).toMatchObject({ fontSize: 14, fontWeight: "500" });
    expect(media.webSkin.description).toMatchObject({ fontSize: 12, fontWeight: "400" });
    expect(media.webSkin.borderedSurface(t)).toMatchObject({ borderRadius: 12, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14 });
  });
});

describe("the v4 feed", () => {
  it("rows 16 apart (10 compact) behind a 28 secondary node and a field-border line", () => {
    expect(feeds.webSkin.connectorRowGap(false)).toEqual({ paddingBottom: 16 });
    expect(feeds.webSkin.connectorRowGap(true)).toEqual({ paddingBottom: 10 });
    expect(feeds.webSkin.node(t)).toMatchObject({ width: 28, height: 28, backgroundColor: t.secondary });
    expect(feeds.webSkin.connectorLine(t)).toMatchObject({ start: 13, top: 30, width: 1, backgroundColor: t["field-border"] });
  });

  it("leads a glyph-less event with a 10 dot in the 28 column, the first in the accent", () => {
    expect(feeds.webSkin.dot(t, true)).toMatchObject({ width: 10, height: 10, marginVertical: 5, marginHorizontal: 9, backgroundColor: t.primary });
    expect(feeds.webSkin.dot(t, false).backgroundColor).toBe(t["surface-raised"]);
  });

  it("sets a 400 13/19 line with a 600 actor over a 12 subtle timestamp", () => {
    expect(feeds.webSkin.actorLabel(t)).toMatchObject({ fontSize: 13, lineHeight: 19, fontWeight: "600", color: t.foreground });
    expect(feeds.webSkin.actionLabel(t)).toMatchObject({ fontSize: 13, color: t["muted-foreground"] });
    expect(feeds.webSkin.timeLabel(t)).toMatchObject({ fontSize: 12, color: subtle });
    expect(feeds.activityTime(t)).toMatchObject({ fontFamily: MONO_FONT, fontSize: 12, color: subtle });
  });

  it("shares the web parts on iOS and Android", () => {
    for (const skin of [feeds.iosSkin, feeds.androidSkin]) expect(skin.node(t)).toEqual(feeds.webSkin.node(t));
    expect(feeds.iosSkin.minTarget).toBe(44);
    expect(feeds.androidSkin.minTarget).toBe(48);
  });
});

describe("the v4 description list", () => {
  it("insets the card 16 by 20, rows 12 above and below, a 12 header rule", () => {
    expect(dl.cardSurface(t, dl.webSkin)).toMatchObject({ borderRadius: 16, borderWidth: 1, backgroundColor: t.card, boxShadow: shadow("sm", t).boxShadow });
    expect(dl.webSkin.cardPadding).toBe(20);
    expect(dl.webSkin.inset).toEqual({ cardPadY: 16, rowPadY: 12, headerPadBottom: 12 });
    expect(dl.insetHeaderBand(t, 12)).toMatchObject({ borderBottomWidth: 1, paddingBottom: 12 });
  });

  it("sets a 500 13 muted term beside a 400 14 value, under a 500 16 title", () => {
    expect(dl.webSkin.termType(t)).toMatchObject({ fontSize: 13, fontWeight: "500", color: t["muted-foreground"] });
    expect(dl.webSkin.valueType(t)).toMatchObject({ fontSize: 14, fontWeight: "400", color: t.foreground });
    expect(dl.webSkin.headerTitleType(t)).toMatchObject({ fontSize: 16, fontWeight: "500" });
    expect(dl.webSkin.headerSubtitleType!(t)).toMatchObject({ fontSize: 13, color: subtle });
  });

  it("draws the web list on Android and keeps the iOS grouped list", () => {
    expect(dl.androidSkin).toEqual(dl.webSkin);
    expect(dl.iosSkin.inset).toBeUndefined();
    expect(dl.iosSkin.cardRadius).toBe(26);
  });
});
