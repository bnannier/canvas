import { Platform, type TextStyle } from "react-native";

/**
 * Tabular figures: every digit the same width.
 *
 * Proportional digits are drawn at different widths (a 1 is narrow, a 0 and a 4 are
 * wide), which is right for prose and wrong everywhere numbers are compared. A column
 * of figures fails to line up on the decimal, and a value that updates in place, a
 * progress readout, a live metric, a slider label, visibly jitters as its digits
 * change. Reach for this wherever digits are read down a column or watched as they
 * move; leave prose alone.
 *
 * The two platforms spell it differently, and until this existed the kit only said it
 * one way. `fontVariant` is the React Native API and works on iOS and Android;
 * react-native-web silently DROPS it, emitting neither an inline style nor a generated
 * class, so every tabular-figure call site in the kit was a no-op in a browser. The web
 * branch emits `font-variant-numeric`, which is the CSS property that actually does
 * this, so the same call now produces the same result on all three platforms.
 *
 * Spread it into a text style: `{ ...tabularNums(), fontSize: 14 }`.
 */
export function tabularNums(): TextStyle {
  if (Platform.OS === "web") {
    // Not in React Native's TextStyle, since it is a CSS property; react-native-web
    // passes it through to the DOM, which is the whole point.
    return { fontVariantNumeric: "tabular-nums" } as unknown as TextStyle;
  }
  return { fontVariant: ["tabular-nums"] };
}
