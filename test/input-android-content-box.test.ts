import { describe, expect, it } from "bun:test";
import { StyleSheet } from "react-native";
import { androidSkin } from "../src/atoms/input/input.styles.ts";
import { lightColors as lightTokens } from "../src/style/tokens.ts";

// A React Native EditText keeps every touch from its scrolling parent while it can scroll
// its own text (ReactEditText.onTouchEvent). The Android filled field's content box must
// therefore hold its value's line exactly: 2dp short, a populated field swallowed a page
// swipe that started on it (the native smoke's materials page, Deploy and local runs).
describe("Android Input content box", () => {
  for (const size of ["small", "base", "large"] as const) {
    for (const focused of [false, true]) {
      it(`holds the ${size} value line exactly${focused ? " while focused" : ""}`, () => {
        const field = StyleSheet.flatten(androidSkin.bareField(lightTokens, "ring", focused, false));
        const box = androidSkin.bareBox(size).height as number;
        const reserve = androidSkin.labelReserve!(size).paddingTop as number;
        const below = (field.paddingBottom as number) + (field.borderBottomWidth as number);
        const line = androidSkin.text(lightTokens, size).lineHeight as number;
        expect(box - reserve - below).toBe(line);
      });
    }
  }
});
