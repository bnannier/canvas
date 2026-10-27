import { describe, expect, it } from "bun:test";
import { lightColors as t } from "../src/style/tokens.ts";
import { platformShape } from "../src/style/platform-shape.ts";
import * as video from "../src/atoms/video/video.styles.ts";
import * as qr from "../src/atoms/qrcode/qrcode.styles.ts";

// The v4 hand-off's media frames: cv-kit-code3.js O('video') and K.def('qrcode') in
// tools/v4/handoff/cv-kit-data.js, both at the 14 media corner.
describe("the v4 media frames", () => {
  it("frames a video at the 14 corner on a border hairline, on every platform", () => {
    expect(platformShape.web.mediaFrame).toBe(14);
    for (const skin of [video.webSkin, video.iosSkin, video.androidSkin]) {
      expect(skin.frame(t)).toMatchObject({ borderRadius: 14, borderWidth: 1, borderColor: t.border, overflow: "hidden" });
    }
    expect(video.webSkin.picture.backgroundColor).toBe("#000000");
  });
  it("sets a QR code in 12 of white quiet zone at the 14 corner", () => {
    expect(qr.webSkin.frame).toMatchObject({ padding: 12, borderRadius: 14, backgroundColor: "#ffffff" });
    expect(qr.iosSkin).toBe(qr.webSkin);
    expect(qr.androidSkin).toBe(qr.webSkin);
  });
});
