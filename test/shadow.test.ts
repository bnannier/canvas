import { describe, it, expect } from "bun:test";
import { shadow, customShadow } from "../src/style/shadow.ts";
import { darkColors, lightColors } from "../src/style/tokens.ts";

// The kit test harness resolves `react-native` to react-native-web, so `Platform.OS`
// is "web" here and `shadow()` / `customShadow()` return the cross-platform `boxShadow`
// form (react-native-web deprecated the `shadow*` style props). The native branch
// returns the iOS `shadow*` props + Android `elevation` and is verified on device.

describe("shadow", () => {
  it("defaults to the standard elevation", () => {
    expect(shadow()).toEqual(shadow("DEFAULT"));
  });

  it("scales the shadow with the level (web boxShadow, the hand-off's three steps)", () => {
    const light = (drop: string) => `inset 0px 1px 0px 0px rgba(255, 255, 255, 0), ${drop}, 0px 0px 0px 1px rgba(17, 17, 24, 0.03)`;
    expect(shadow("none")).toEqual({ boxShadow: "none" });
    expect(shadow("sm").boxShadow).toBe(light("0px 1px 2px 0px rgba(17, 17, 24, 0.05)"));
    expect(shadow("md").boxShadow).toBe(light("0px 12px 32px -10px rgba(17, 17, 24, 0.16)"));
    expect(shadow("lg").boxShadow).toBe(light("0px 30px 80px -16px rgba(17, 17, 24, 0.25)"));
    // The legacy levels alias the three: the resting ones are sm, the top layer is lg.
    for (const level of ["DEFAULT", "row", "empty"] as const) expect(shadow(level)).toEqual(shadow("sm"));
    expect(shadow("xl")).toEqual(shadow("lg"));
  });

  it("colours by the scheme's shade roles, and defaults to the light scheme's", () => {
    expect(shadow("DEFAULT", lightColors)).toEqual(shadow("DEFAULT"));
    // The dark scheme lights the top edge and drops black, with no hairline ring.
    expect(shadow("sm", darkColors).boxShadow).toBe("inset 0px 1px 0px 0px rgba(255, 255, 255, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.5), 0px 0px 0px 1px rgba(0, 0, 0, 0)");
    expect(shadow("lg", darkColors).boxShadow).toBe("inset 0px 1px 0px 0px rgba(255, 255, 255, 0.1), 0px 30px 80px -16px rgba(0, 0, 0, 0.8), 0px 0px 0px 1px rgba(0, 0, 0, 0)");
  });

  it("does not emit the deprecated shadow* props on web", () => {
    const md = shadow("md");
    expect(md.shadowRadius).toBeUndefined();
    expect(md.shadowColor).toBeUndefined();
    expect(md.elevation).toBeUndefined();
  });

  it("customShadow emits an equivalent boxShadow on web", () => {
    expect(customShadow({ offsetY: 1, radius: 2, opacity: 0.18 }).boxShadow).toBe("0px 1px 2px rgba(0, 0, 0, 0.18)");
    expect(customShadow({ offsetY: 1, radius: 3, opacity: 0.18 }).boxShadow).toBe("0px 1px 3px rgba(0, 0, 0, 0.18)");
  });
});
