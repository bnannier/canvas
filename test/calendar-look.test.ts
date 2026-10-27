import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { MONO_FONT } from "../src/style/mono.ts";
import { webSkin, iosSkin, androidSkin } from "../src/organisms/calendar/calendar.styles.ts";

// The v4 hand-off's Calendar renderer (cv-kit-data.js K.def('calendar'), cv-kit-code3.js O('calendar')).
describe("the v4 calendar", () => {
  it("is a card 14 in with the month label at the start and 15px chevrons at the end", () => {
    expect(webSkin.containerBase).toMatchObject({ borderRadius: 16, borderWidth: 1, padding: 14 });
    expect(webSkin.header).toMatchObject({ marginBottom: 10, justifyContent: "space-between" });
    expect(webSkin.chevrons).toMatchObject({ flexDirection: "row", gap: 6 });
    expect(webSkin.chevronIcon).toBe(15);
    expect(webSkin.chevronText(t).color).toBe(t["muted-foreground"]);
    expect(webSkin.monthLabel(t)).toMatchObject({ fontSize: 15, fontWeight: "600" });
  });

  it("sets the weekdays in the 11px mono subtle caption, three letters", () => {
    expect(webSkin.weekdayLabel(t)).toMatchObject({ fontFamily: MONO_FONT, fontSize: 11, color: t["subtle-foreground"] });
    expect(webSkin.weekdays).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });

  it("draws 38px days at the control corner: the accent fill selected, a ring-alpha hairline today", () => {
    expect(webSkin.metrics.default.cell).toEqual({ width: 38, height: 38 });
    expect(webSkin.metrics.default.label).toMatchObject({ fontSize: 13 });
    expect(webSkin.dayCellBase.borderRadius).toBe(10);
    expect(webSkin.dayCellState(t, { selected: true, today: false })).toEqual({ backgroundColor: t.primary });
    expect(webSkin.dayCellState(t, { selected: false, today: true })).toMatchObject({ borderWidth: 1 });
    expect(webSkin.dayLabel(t, { selected: true, today: false })).toMatchObject({ fontWeight: "600", color: t["primary-foreground"] });
    expect(webSkin.rangeBand(t)).toMatchObject({ top: 0, bottom: 0, backgroundColor: t["primary-soft"] });
    expect(webSkin.eventDotColor(t, { selected: false, today: true })).toEqual({ backgroundColor: t.primary });
  });

  it("draws timeline events at the 6 corner in the soft wash, under 34px hours", () => {
    expect(webSkin.timeline.default.hourHeight).toBe(34);
    expect(webSkin.eventBlock).toMatchObject({ borderRadius: 6, borderWidth: 1 });
    expect(webSkin.eventBlockSurface(t).backgroundColor).toBe(t["primary-soft"]);
    expect(webSkin.eventTitle(t)).toMatchObject({ fontSize: 11, fontWeight: "500", color: t["primary-text"] });
    expect(webSkin.hourLabel(t)).toMatchObject({ fontFamily: MONO_FONT, fontSize: 10 });
  });

  it("keeps the native date pickers' round days in the hand-off's colours", () => {
    for (const skin of [iosSkin, androidSkin]) {
      expect(skin.dayCellBase.borderRadius).toBe(9999);
      expect(skin.weekdayLabel(t).color).toBe(t["subtle-foreground"]!);
    }
    expect(iosSkin.chevronText(t).color).toBe(t.primary);
  });
});
