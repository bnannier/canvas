// The v4 hand-off's corners for the Alert callout and the EmptyState (`K.def('alert')` and
// `K.def('empty-state')` in tools/v4/handoff/cv-kit-overlays.js), read from the web row of
// src/style/platform-shape.ts; neither platform ships a control for either job, so the
// native skins draw the web skin's parts.
import { describe, expect, it } from "bun:test";
import * as alert from "../src/molecules/alert/alert.styles.ts";
import * as empty from "../src/molecules/empty-state/empty-state.styles.ts";
import { colorsFor } from "../src/style/tokens.ts";

const t = colorsFor("violet", "dark");

describe("the v4 overlay corners", () => {
  it("rounds the Alert callout at 14 on every platform", () => {
    for (const skin of [alert.webSkin, alert.iosSkin, alert.androidSkin]) expect(skin.container.borderRadius).toBe(14);
  });

  it("rounds the EmptyState at 18 with its glyph tile at 16, the web parts on every platform", () => {
    expect(empty.webSkin.container.default.borderRadius).toBe(18);
    expect(empty.webSkin.borderedBase.borderRadius).toBe(18);
    expect(empty.webSkin.discBase.default.borderRadius).toBe(16);
    for (const skin of [empty.iosSkin, empty.androidSkin]) {
      expect(skin.container).toBe(empty.webSkin.container);
      expect(skin.discBase).toBe(empty.webSkin.discBase);
      // The display face is the web skin's alone (design language item 5).
      expect(skin.title(t, "default").fontFamily).toBeUndefined();
    }
  });
});
