import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Platform, type LayoutChangeEvent } from "react-native";
import { Text, View, type TextStyle, type ViewStyle } from "./primitives.js";
import { fontStyle } from "./text.js";
import { useTheme } from "./theme.js";
import { type ColorTokens } from "./tokens.js";
import { useReducedMotion, supportsNativeDriver, FLOAT, FLOAT_EASING } from "./motion.js";
import { primaryText } from "./primary-text.js";
import { destructiveText } from "./destructive-text.js";
import { isRTL } from "./rtl.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

// A field's label, shared by every field family. FloatingLabel is the Material 3
// in-container FLOATING label the Android skins of Input, Textarea, Select and Autocomplete
// render inside their field; it is the single source of truth for the label placement
// contract and its float, so the four controls float their label identically and a fix
// lands once. LabelContent is the label text with its required marker, which every field
// family (those four, Field, Stepper and PhoneInput) renders, above the field or floating
// in it; labelA11y gives the Text holding it its accessibility props. The BRAND survives
// (the floated tint is `primary-text`, the error tint `destructive-text`, never a platform
// default); only the shape the per-OS skin describes changes.
//
// Placement per platform lives in each skin as a `FloatingLabelStyles` slice: Android sets
// `floatingLabel: true` and supplies the rest/floated/reserve types; iOS and web set
// `floatingLabel: false` and render the label ABOVE the field (the static title the
// Field/Form composers produce). Only the geometry members vary here; the label COLOR is
// animated in this component from the active tokens.

/**
 * The label-placement slice a filled-field skin fulfills. iOS + web render the
 * label ABOVE the field (`floatingLabel: false`), Android floats the M3
 * in-container label (`floatingLabel: true`, supplying the rest/floated/reserve
 * types). The label's COLOR (muted at rest, `primary-text` on focus, `destructive-text`
 * on error) is animated by `FloatingLabel` from the active tokens, so it is not
 * described here.
 */
export interface FloatingLabelStyles<S extends string = string> {
  /** true on the Android skin (floating label); false on iOS/web (label above). */
  floatingLabel: boolean;
  /** The static above-field label's whole type and ink, colour included: the skin
   *  supplies all of it and the shell adds none. iOS and web always place the label
   *  here; an Android skin supplies it for a field that cannot float its label. */
  labelAbove?: (t: ColorTokens, size: S) => TextStyle;
  /** Android: the resting (unfocused, empty) label type, body-large, centered like a placeholder. */
  labelRest?: (t: ColorTokens, size: S) => TextStyle;
  /** Android: the floated label type, body-small at the top. Only its `fontSize` is
   *  used, for the transform's scale (floated over rest): the label is rendered at
   *  `labelRest` and scaled, never re-sized, so the float stays on the transform, which
   *  the native driver and react-native-web both move. */
  labelFloated?: (t: ColorTokens, size: S) => TextStyle;
  /** Android: the state-independent top padding the field's value takes to clear the
   *  floated label at the skin's text size (`useFloatingLabelRoom` grows it with a larger
   *  one), spread by the shell so the skin's field/trigger signature (and the
   *  active-indicator invariant it is tested against) stays intact. */
  labelReserve?: (size: S) => TextStyle;
}

// Read a numeric style value (height / paddingTop / fontSize), falling back when absent.
const asNum = (v: unknown, fallback: number): number => (typeof v === "number" ? v : fallback);

// The float's geometry is the skin's own numbers at the skin's own text size, and the
// rendered text's once the user's text size changes it: React Native scales a label's
// fontSize and lineHeight with the system font scale (nonlinearly on Android 14 and up), so
// the label is measured, never multiplied. A measurement within half a point of the skin's
// number is the pixel grid's rounding, not a different text size, and keeps the number, so
// the default look and the first frame (and the server's) are the skin's exactly.
const LAYOUT_EPSILON = 0.5;

/** A rendered length, or the skin's number when the two differ only by layout rounding. */
const rendered = (seed: number, measured: number | null | undefined): number =>
  measured != null && Math.abs(measured - seed) >= LAYOUT_EPSILON ? measured : seed;

/** A length measured against one skin number, valid while that number holds. */
type Measured = { seed: number; value: number };

/** The float's numbers from a skin: its resting line, the floated scale, the reserve and the floated label's top inset. */
interface FloatSeeds {
  line: number;
  scale: number;
  reserve: number;
  top: number;
}

function floatSeeds<S extends string>(styles: FloatingLabelStyles<S>, tokens: ColorTokens, size: S): FloatSeeds {
  const rest = (styles.labelRest?.(tokens, size) ?? {}) as TextStyle;
  const floated = (styles.labelFloated?.(tokens, size) ?? {}) as TextStyle;
  const line = asNum(rest.lineHeight, 24);
  const scale = asNum(floated.fontSize, 12) / asNum(rest.fontSize, 16);
  const reserve = asNum((styles.labelReserve?.(size) ?? {}).paddingTop, 24);
  return { line, scale, reserve, top: reserve - line * scale };
}

/**
 * The top padding a field's value takes for a rendered resting line: the skin's reserve,
 * or more once a larger text size makes the floated label taller, keeping the floated
 * label's top inset and landing its bottom edge where the value begins.
 */
const reserveFor = (seeds: FloatSeeds, line: number): number => Math.max(seeds.reserve, seeds.top + line * seeds.scale);

/** The room a floating-label field gives its label (`useFloatingLabelRoom`). */
export interface FloatingLabelRoom {
  /** The value's top padding, clearing the floated label: spread where the skin's `labelReserve` went. */
  reserve: TextStyle;
  /** How much taller the rendered label makes a fixed-height field than the skin's numbers: 0 at the skin's text size or smaller. */
  growth: number;
  /** Hand to FloatingLabel's `onLine`: the label reports its rendered resting line through it. */
  onLine: (line: number) => void;
}

/**
 * The room a field gives its floating label, which follows the user's text size: the
 * value's top padding (the skin's `labelReserve` until the label has measured its rendered
 * line, and more once a larger text size needs it) and, for a field of fixed height, how
 * much taller it grows. A field that floats its label calls it unconditionally, spreads
 * `reserve` on its value and hands `onLine` to its FloatingLabel. One commit when the label
 * first measures a line that differs from the skin's, and on a text-size change; none at
 * the skin's own text size.
 */
export function useFloatingLabelRoom<S extends string>(styles: FloatingLabelStyles<S>, tokens: ColorTokens, size: S): FloatingLabelRoom {
  const seeds = floatSeeds(styles, tokens, size);
  const [measured, setMeasured] = useState<Measured | null>(null);
  const onLine = useCallback(
    (value: number) =>
      setMeasured((prev) => {
        const next = rendered(seeds.line, value) === seeds.line ? null : { seed: seeds.line, value };
        return prev?.seed === next?.seed && prev?.value === next?.value ? prev : next;
      }),
    [seeds.line],
  );
  const line = rendered(seeds.line, measured?.seed === seeds.line ? measured.value : null);
  const reserve = reserveFor(seeds, line);
  // Never shorter than the skin's field: a smaller text size leaves it at the skin's height.
  const growth = Math.max(0, reserve - seeds.reserve + (line - seeds.line));
  return useMemo(() => ({ reserve: { paddingTop: reserve }, growth, onLine }), [reserve, growth, onLine]);
}

/**
 * The props that take a node out of the accessibility tree, spread together:
 * `accessibilityElementsHidden` (VoiceOver), `importantForAccessibility:
 * "no-hide-descendants"` (TalkBack) and `aria-hidden` (the web, where an `aria-labelledby`
 * name computation also skips it). They hide a View, or a Text that is not inside another
 * Text, on every platform. A Text nested in another Text is a span of its parent's
 * paragraph on iOS and Android, not a view of its own, so there only `aria-hidden` on the
 * web takes effect: the kit keeps LabelContent's required star out of the native name
 * through the label Text's own accessible name instead (`labelA11y`).
 */
export const HIDDEN_FROM_A11Y = {
  accessibilityElementsHidden: true,
  importantForAccessibility: "no-hide-descendants" as const,
  "aria-hidden": true,
} as const;

/** The accessibility props `labelA11y` gives a field's visible label Text. */
export interface LabelA11y {
  accessibilityLabel?: string;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: "no-hide-descendants";
}

/**
 * The accessibility props of a field's visible label: the Text that holds LabelContent,
 * above a field or floating in it.
 *
 * On iOS and Android the label Text takes `name` as its accessible name, so the required
 * star is never spoken: React Native renders the star, a Text nested in the label, as a
 * span of the label's paragraph, which its own hiding props cannot reach. `name` is the
 * bare label, or `requiredName(label, required)` for a label that is the required field's
 * only cue (Field's heading over a control that names itself). The web keeps its markup as
 * it is: the star's `aria-hidden` already keeps it out of the field's name through
 * `aria-labelledby`, and an `aria-label` on the label's generic element is one ARIA
 * prohibits.
 *
 * With `names` (the control takes its accessible name from this label) the label is also
 * hidden from VoiceOver and TalkBack, which would otherwise stop on it and then on the
 * field with the same name. Both props are native only (react-native-web drops them), so
 * the label stays in the web DOM, where it is the node the field's `aria-labelledby`
 * names. Leave `names` off where the label heads a control that names itself (Field around
 * a Switch): there the label is a stop of its own.
 *
 * `os` is the platform to resolve for; it defaults to the running one.
 */
export function labelA11y(name: string, names: boolean, os: string = Platform.OS): LabelA11y {
  const native = os === "ios" || os === "android";
  return {
    ...(native ? { accessibilityLabel: name } : null),
    ...(names ? { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const } : null),
  };
}

/**
 * A required field's accessible name: `"<name>, required"` on iOS and Android, and the name
 * itself on the web and wherever `required` is off. React Native has no native required
 * state (its `aria-required` reaches the web alone) and the label's star is never spoken
 * (`labelA11y`), so natively the word in the name is the only required cue VoiceOver and
 * TalkBack hear, as they hear it in Select's trigger name. The web keeps the bare name,
 * since the field's `aria-required` announces it there and the word would say it twice.
 * Give it to the field's `accessibilityLabel` and `aria-label` both: React Native takes
 * `aria-label` over `accessibilityLabel`. An absent name stays absent.
 *
 * `os` is the platform to resolve for; it defaults to the running one.
 */
export function requiredName<N extends string | undefined>(name: N, required: boolean | undefined, os: string = Platform.OS): N {
  const native = os === "ios" || os === "android";
  return (name != null && required && native ? `${name}, required` : name) as N;
}

/**
 * The label text plus, when required, a trailing destructive "*". Used for BOTH the
 * above-field label and the floated label so every field family renders the required
 * affordance identically. The star is decorative: `aria-hidden` keeps it out of the
 * field's name on the web, and on iOS and Android the label Text that holds this content
 * names itself with the bare label (`labelA11y`), since the star is part of its paragraph
 * there.
 */
export function LabelContent({ label, required, starColor }: { label: string; required?: boolean; starColor: string }): ReactNode {
  return (
    <>
      {label}
      {required ? (
        <Text aria-hidden style={{ color: starColor }}>
          {" *"}
        </Text>
      ) : null}
    </>
  );
}

/**
 * The Material 3 in-container floating label, which the Android skins of Input, Textarea,
 * Select and Autocomplete render inside their field (the iOS and web skins title the field
 * from above). It overlays the field, pinned to the leading edge and bounded on both sides,
 * and moves between its resting place (centered like a placeholder, or on the first line of
 * a multiline field) and its floated one (small, at the top, its bottom edge where the value
 * begins). It never takes a tap (taps reach the field beneath), never paints a material of
 * its own, and never wraps: a label longer than the field truncates on one line while the
 * field's accessible name stays the whole label.
 *
 * Two values drive it, each a one-shot timing from the motion tunables (`FLOAT`):
 *  - `pos` (0 to 1, its target focused or populated) drives only the transform, translateY
 *    and a scale from 1 to floated/rest, on the native driver where there is one and the JS
 *    driver on the web. It never animates fontSize, top or width, which the native driver
 *    cannot move.
 *  - `tint` (0 to 1, its target focused or in error) drives only the colour, from
 *    `muted-foreground` to `primary-text` (or `destructive-text`), so a filled, valid,
 *    unfocused field floats yet stays muted. It runs on the JS driver on every platform:
 *    Android's text view takes its colour only through the paragraph's attributed string,
 *    so React Native 0.86's default native animated backend cannot animate a Text's colour,
 *    a stated exception to the native-driver gate in motion.ts. Natively each of its frames
 *    is a setNativeProps Fabric commit, with a single React render after the last frame; on
 *    the web both values run on the JS driver, and each frame updates the label through
 *    react-native-web's Animated for the length of the float.
 * Under Reduce Motion both values jump to their target in one write: the label still floats.
 * Each value is seeded at its target, so a field that mounts filled (or in error) is floated
 * (or tinted) from its first frame, the server's included, and a mount starts no timing.
 *
 * The label is pinned to the logical `start` edge, and its transform origin pins that edge
 * while it scales (no measurement, no translateX): the origin follows the layout direction
 * from `isRTL()`, "0% 50%" or "100% 50%", because transform origins are physical while
 * `start` is the right edge in a right-to-left layout.
 *
 * Geometry: translateY carries the label's resting vertical center to its floated one. The
 * floated center lands the scaled label's bottom edge on the reserve, where the value
 * begins, so the value always clears it; the resting center is the field's middle, or the
 * first value line of a multiline field (the reserve plus half a line). The numbers are the
 * skin's at the skin's own text size and the rendered label's at any other, the reserve
 * handed back to the field through `onLine` (`useFloatingLabelRoom`).
 *
 * To assistive technology the label is the field's name, never a second stop beside it:
 * natively it names itself with the bare label and, while `names`, is hidden (`labelA11y`);
 * on the web it stays in the DOM, the node the field's `aria-labelledby` names.
 */
export function FloatingLabel<S extends string>({
  styles,
  size,
  tokens,
  label,
  required,
  labelId,
  focused,
  populated,
  isError,
  height,
  inset = 16,
  end = inset,
  multiline = false,
  names = true,
  onLine,
}: {
  styles: FloatingLabelStyles<S>;
  size: S;
  tokens: ColorTokens;
  label: string;
  required?: boolean;
  labelId: string;
  focused: boolean;
  populated: boolean;
  isError: boolean;
  /**
   * The single-line field's height, from its skin, which centers the resting label at the
   * skin's text size; once a different text size changes the rendered line, the field's
   * measured height takes over. Ignored in `multiline` mode.
   */
  height: number;
  /** Leading inset that matches the field's horizontal content padding (default 16dp). */
  inset?: number;
  /**
   * How far from the field's end edge the label stays: the field's end padding, `inset`
   * by default, or the width of the trailing chevron or toggle where one sits there. A
   * label longer than the room between the two ends truncates with an ellipsis, and the
   * field's accessible name stays the whole label.
   */
  end?: number;
  /** Multiline field (Textarea): rest the label at the top text line, not the box middle. */
  multiline?: boolean;
  /**
   * The field takes its accessible name from this label (default true), so VoiceOver and
   * TalkBack skip the label and stop on the field alone (`labelA11y`).
   */
  names?: boolean;
  /** Told the label's rendered resting line height whenever it changes: a field's `useFloatingLabelRoom` `onLine`. */
  onLine?: (line: number) => void;
}) {
  const reduced = useReducedMotion();
  const posTarget = focused || populated ? 1 : 0;
  const tintTarget = focused || isError ? 1 : 0;
  // Seed each value at its target so a prefilled/defaultValue field starts floated
  // (and a required-invalid field starts tinted) with no opening animation.
  const [pos] = useState(() => new Animated.Value(posTarget));
  const [tint] = useState(() => new Animated.Value(tintTarget));

  // The target each value was last sent to. It starts where the value was seeded, so a
  // field that mounts has nothing to animate and starts no timing; a later Reduce Motion
  // reading alone sends nothing either.
  const sent = useRef({ pos: posTarget, tint: tintTarget });

  // pos drives the TRANSFORM (translateY + scale): native driver where available
  // (one-shot, so the loop-freeze caveat does not apply), JS on web. Reduced
  // motion snaps to the final frame; the label still moves.
  useEffect(() => {
    if (sent.current.pos === posTarget) return;
    sent.current.pos = posTarget;
    if (reduced) {
      pos.setValue(posTarget);
      return;
    }
    Animated.timing(pos, { toValue: posTarget, duration: FLOAT.position.duration, easing: FLOAT_EASING, useNativeDriver: supportsNativeDriver }).start();
  }, [pos, posTarget, reduced]);

  // tint drives ONLY the COLOR, always on the JS driver: React Native 0.86's native
  // animated backend cannot animate a Text's colour on Android (see the JSDoc above). Never
  // interpolate it off `pos`, which runs on the native driver.
  useEffect(() => {
    if (sent.current.tint === tintTarget) return;
    sent.current.tint = tintTarget;
    if (reduced) {
      tint.setValue(tintTarget);
      return;
    }
    Animated.timing(tint, { toValue: tintTarget, duration: FLOAT.tint.duration, easing: FLOAT_EASING, useNativeDriver: false }).start();
  }, [tint, tintTarget, reduced]);

  // The label paints through Animated.Text, not the kit Text, so it takes the theme's
  // face here (src/style/text.tsx `fontStyle`), on its static type only: the animated
  // colour rides beside it, outside the flatten.
  const { fonts } = useTheme();
  const rest = useMemo(() => styles.labelRest!(tokens, size) as TextStyle, [styles, tokens, size]);
  const themedRest = useMemo(() => fontStyle(rest, fonts), [rest, fonts]);

  // The rendered resting line (the label Text's height, one line) and the single-line
  // field's height (the bounds' height), each read once at mount and again when the text
  // size changes, never per frame; a reading the skin's numbers already give is dropped.
  // The field's height is the skin's while the line is: the label's bounds sit inside the
  // field's border, which the skin's height includes, and the float is drawn to that.
  const seeds = floatSeeds(styles, tokens, size);
  const [measured, setMeasured] = useState<{ line: Measured | null; box: Measured | null }>({ line: null, box: null });
  const onTextLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const value = e.nativeEvent.layout.height;
      if (!(value > 0)) return;
      setMeasured((prev) => {
        const line = rendered(seeds.line, value) === seeds.line ? null : { seed: seeds.line, value };
        return prev.line?.seed === line?.seed && prev.line?.value === line?.value ? prev : { ...prev, line };
      });
    },
    [seeds.line],
  );
  const onBoundsLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const value = e.nativeEvent.layout.height;
      if (!(value > 0)) return;
      setMeasured((prev) => {
        const line = rendered(seeds.line, prev.line?.seed === seeds.line ? prev.line.value : null);
        const box = line === seeds.line ? null : { seed: height, value };
        return prev.box?.seed === box?.seed && prev.box?.value === box?.value ? prev : { ...prev, box };
      });
    },
    [seeds.line, height],
  );
  const line = rendered(seeds.line, measured.line?.seed === seeds.line ? measured.line.value : null);
  const box = line === seeds.line ? height : rendered(height, measured.box?.seed === height ? measured.box.value : null);
  const reserve = reserveFor(seeds, line);
  const scaleTo = seeds.scale;
  useIsomorphicLayoutEffect(() => {
    onLine?.(line);
  }, [onLine, line]);

  // The floated label's bottom edge lands at `reserve` (where the value begins),
  // so the value clears it; its center is that minus half the scaled line box.
  const floatedCenterY = reserve - (line * scaleTo) / 2;
  // The resting center: the field's vertical middle for a single-line field, or the
  // first value line for a multiline one (its value is top-aligned below `reserve`).
  const restCenterY = multiline ? reserve + line / 2 : box / 2;
  const translateYTo = floatedCenterY - restCenterY;

  // The interpolation nodes live as long as their ends do. A field re-renders on every
  // keystroke, and React Native keys a view's animated props on the identity of these nodes,
  // so new ones each render built and attached a new animated graph per keystroke (three
  // nodes a keystroke, measured in test/floating-label-contract.test.tsx).
  const translateY = useMemo(() => pos.interpolate({ inputRange: [0, 1], outputRange: [0, translateYTo] }), [pos, translateYTo]);
  const scale = useMemo(() => pos.interpolate({ inputRange: [0, 1], outputRange: [1, scaleTo] }), [pos, scaleTo]);
  const restInk = tokens["muted-foreground"];
  const activeInk = isError ? destructiveText(tokens) : primaryText(tokens);
  const color = useMemo(() => tint.interpolate({ inputRange: [0, 1], outputRange: [restInk, activeInk] }), [tint, restInk, activeInk]);

  // Transform origins are physical (React Native, Fabric and CSS alike) while the label is
  // pinned to the logical start edge, so the origin names the side `start` lands on: the
  // left, or the right in a right-to-left layout (as touch-seam.ts's inlineSide does).
  const transformOrigin = isRTL() ? "100% 50%" : "0% 50%";

  // The label's bounds: pinned between the field's two ends, so a long label truncates
  // before the end padding or a trailing chevron or toggle instead of running out of the
  // field; taps fall through to the field beneath. Single-line fills the field vertically
  // and centers the label (rest center = the field's middle); multiline pins it at the top
  // text line (top = reserve). Inside, the floating view hugs the text against the start edge, so
  // the transform floats it, scaling around its leading edge (transformOrigin above).
  const bounds: ViewStyle = multiline
    ? { position: "absolute", top: reserve, start: inset, end, alignItems: "flex-start", pointerEvents: "none" }
    : { position: "absolute", top: 0, bottom: 0, start: inset, end, alignItems: "flex-start", justifyContent: "center", pointerEvents: "none" };

  return (
    <View style={bounds} onLayout={multiline ? undefined : onBoundsLayout}>
      <Animated.View style={{ maxWidth: "100%", transformOrigin, transform: [{ translateY }, { scale }] }}>
        <Animated.Text nativeID={labelId} numberOfLines={1} style={[themedRest, { color }]} onLayout={onTextLayout} {...labelA11y(label, names)}>
          <LabelContent label={label} required={required} starColor={tokens.destructive} />
        </Animated.Text>
      </Animated.View>
    </View>
  );
}
