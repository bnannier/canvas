import { useTextEntryMaterial } from "../../style/text-entry-material.js";
import { textEntryState } from "../../style/text-entry-state.js";
import { useInputEscapeBridge } from "../../style/escape-layer.js";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import {
  StyleSheet,
  type GestureResponderEvent,
  type Insets,
  type TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from "react-native";
import { View, Pressable, Text, TextInput, useFillStyle, FloatingLabel, LabelContent, labelA11y, requiredName, useFloatingLabelRoom, FOCUS_RESET, type ColorTokens, type LayoutStyle, type MeasureProps, type StyleProp, type ViewStyle, type TextStyle, GlassPane, paneHost, paneStyle, paneRipple, isGlass, legibleWash, PANE_SIBLING_INPUT, shape, LoopView, createLoopChannel, useReducedMotion } from "../../style/index.js";
import { useComposedRefs } from "../../style/use-composed-refs.js";
import { frameHandlers, useFocusFrame } from "../../style/focus-frame.js";
import { rowSeam } from "../../style/touch-seam.js";
import { useHover } from "../../style/hover.js";
import { usePinnedFocus } from "../../style/interaction-override.js";
import { Icon, type IconName } from "../icon/icon.js";
import { Kbd } from "../kbd/kbd.js";
import { type InputSkin, type Size } from "./input.styles.js";

// Shared Input shell. The structure (bare field vs. grouped addon layout, the
// prefix/suffix boxes, overlaid icons, the optional action button), the
// public boolean-prop API, the size precedence, the border-color precedence
// (error > focus > default), accessibility, refs, and handlers all live here
// once. A platform file supplies only its skin (field shape, fill, border,
// height, the Android active-indicator underline, press feedback) and calls
// createInput.

// The overlaid leading/trailing glyph is named by the scalar `icon` string (any
// Canvas glyph, typed as IconName so a typo is a type error) and rendered through
// the Icon atom's flat boolean prop, so the playground stays serializable (a name
// string, not a React element).

// The trailing action glyphs: the password eye (by default eye-off while the value is
// masked and eye once revealed, the iOS reference's eye.slash; the web skin swaps them,
// `revealGlyph`) and the clear button (the
// reference's xmark.circle.fill). Hit slop widens each glyph to a 44pt target.
const ACTION_HIT_SLOP = 12;
// The gap between two trailing glyphs when both the clear button and the eye show.
export const ACTION_GAP = 8;

/**
 * The touch slop of each pressable trailing glyph, in order (the clear glyph, then the eye).
 * Each reaches the minimum (ACTION_HIT_SLOP a side) except where it faces a neighbor: the
 * first faces the value the user is editing across `textGap`, and two glyphs face each other
 * across ACTION_GAP. There the gap is split (src/style/touch-seam.ts): React Native gives a
 * point two touch areas admit to the later sibling, so the eye's whole slop took taps on the
 * clear glyph (and revealed the password), and the clear glyph's took taps on the end of the
 * text. The value asks for no slop, so the first glyph may take that whole gap and no more.
 */
export function actionSlops(count: number, textGap: number): Array<Insets | undefined> {
  const slops: Array<Insets | undefined> = [];
  for (let i = 0; i < count; i += 1) {
    if (i === 0) {
      slops.push(rowSeam(undefined, ACTION_HIT_SLOP, textGap)[1]);
    } else {
      const [before, own] = rowSeam(slops[i - 1], ACTION_HIT_SLOP, ACTION_GAP);
      slops[i - 1] = before;
      slops.push(own);
    }
  }
  return slops;
}

/**
 * The touch slop the grouped box carries for its trailing actions. The box clips (it
 * squares the addons into its rounded corners), and React Native hit-tests a clipping view
 * only inside its own bounds plus its own slop, so the part of an action's slop that
 * reaches past the box would be cut. A glyph sits centered in the box, so its slop overhangs
 * the top and bottom where the glyph plus its slop is taller than the box: the 36pt iOS
 * small field under a 20pt glyph. The gutter's end inset already covers the slop sideways
 * on every skin (test/touch-target-clips.test.tsx holds that), so the overhang is vertical.
 */
export function actionOverhang(iconSize: number, boxHeight: number): Insets | undefined {
  const v = Math.max(0, (iconSize + 2 * ACTION_HIT_SLOP - boxHeight) / 2);
  return v > 0 ? { top: v, bottom: v, left: 0, right: 0 } : undefined;
}

// The pinned-focus caret. A field held focused by an InteractionOverride (a docs specimen)
// is not the platform's focused input, so no native caret shows; where the skin declares a
// `pinnedCaret` the shell draws the hand-off's caret after the value instead (the
// renderer's focus state, cv-kit-inputs.js). The bar sits in an overlay over the editor
// with the editor's own start inset: a hidden copy of the value in the value's type holds
// its width, so the bar lands one step after the last glyph without measuring anything.
// It blinks on the hand-off's `1s steps(1)` (half on, half off) on one shared loop channel
// (src/style/loop.tsx: the native driver natively, a compositor CSS animation on the web),
// running only while a pinned caret is mounted; Reduce Motion holds it solid.
const caretBlink = createLoopChannel({ period: 1000 });
const CARET_BLINK = { channel: caretBlink, inputRange: [0, 0.5, 0.501, 1], outputRange: [1, 1, 0, 0] };
let blinkingCarets = 0;

// The start inset of an editor's text: its start border and its start padding.
function startInset(style: StyleProp<ViewStyle>): number {
  const f = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
  const border = asNum(f.borderStartWidth ?? f.borderLeftWidth ?? f.borderWidth, 0);
  const pad = asNum(f.paddingStart ?? f.paddingLeft ?? f.paddingHorizontal ?? f.padding, 0);
  return border + pad;
}

function PinnedCaret({ inset, value, text, bar }: { inset: number; value: string; text: StyleProp<TextStyle>; bar: ViewStyle }) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    if (blinkingCarets++ === 0) caretBlink.play();
    return () => {
      if (--blinkingCarets === 0) caretBlink.stop();
    };
  }, [reduced]);
  return (
    <View style={[StyleSheet.absoluteFill, { flexDirection: "row", alignItems: "center", paddingStart: inset, overflow: "hidden", pointerEvents: "none" }]} aria-hidden accessible={false}>
      <Text numberOfLines={1} style={[text, { opacity: 0, flexShrink: 1 }]}>{value}</Text>
      {reduced ? <View style={bar} /> : <LoopView style={bar} opacity={CARET_BLINK} />}
    </View>
  );
}

// react-native-web paints a default focus outline on the field; in the grouped
// (addon) layout that ring is clipped by the rounded, overflow-hidden container
// and reads as half-baked, so the shared FOCUS_RESET suppresses it there and the
// group shows focus on its shared border instead. Natively its zero width draws nothing.
// An errored field's border shows the error, not its focus, so there it paints no focus
// state of its own: the kit's ring marks keyboard focus around the red edge instead
// (src/style/focus-frame.tsx), drawn by the node that owns the border (the field, or the
// group box), and FOCUS_RESET keeps the browser's own ring off, so the two never stack.

/**
 * The curated slice of React Native's TextInput behavior forwarded by Input and
 * Textarea. Styling stays semantic (the kit's boolean props); BEHAVIOR — what
 * keyboard appears, how text is captured, focus/submit events — belongs to the
 * consumer, and hiding it made real forms (login, search, OTP) impossible to
 * build. Typed via Pick so the props track react-native's own definitions.
 */
export type TextEntryProps = Pick<
  RNTextInputProps,
  | "defaultValue"
  | "secureTextEntry"
  | "keyboardType"
  | "inputMode"
  | "autoCapitalize"
  | "autoComplete"
  | "autoCorrect"
  | "autoFocus"
  | "maxLength"
  | "returnKeyType"
  | "textContentType"
  | "onSubmitEditing"
  | "onFocus"
  | "onBlur"
  | "onKeyPress"
  | "testID"
>;

export interface InputProps extends TextEntryProps, MeasureProps {
  /** Current text value (controlled). Omit and use `defaultValue` for uncontrolled use. */
  value?: string;
  /** Called with the new text on each keystroke. */
  onChangeText?: (text: string) => void;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /**
   * The field's persistent label. Its placement is platform-adaptive:
   * <!-- only: web -->
   * iOS and
   * web render it ABOVE the field (the static title the Field/Form composers
   * produce today); Android renders the Material 3 in-container FLOATING label
   * (centered like a placeholder at rest, floating to the top once the field is
   * focused or filled).
   * <!-- /only -->
   * <!-- only: ios -->
   * iOS renders it ABOVE the field (the static title the Field/Form composers produce today).
   * <!-- /only -->
   * <!-- only: android -->
   * Android renders the Material 3 in-container FLOATING label (centered like a
   * placeholder at rest, floating to the top once the field is focused or filled).
   * <!-- /only -->
   * The label is the field's programmatic name (wired via
   * both accessibilityLabel and aria-labelledby), so a placeholder is no longer
   * needed for the accessible name.
   */
  label?: string;
  /** A toolbar search field with a magnifier and a tracked uppercase empty prompt on web. */
  search?: boolean;
  /** Dense uppercase eyebrow label where the skin offers it. */
  eyebrow?: boolean;
  /** Preserve the system focus outline on a framed field. */
  systemFocus?: boolean;
  /** Use the brand’s softer entry-well fill where the skin provides it. */
  soft?: boolean;
  /**
   * Marks the field as required: appends a destructive "*" to the label (decorative,
   * never in the accessible name) and announces the field as required,
   * <!-- only: web -->
   * through
   * aria-required on the web and with the word in its name ("Full name, required")
   * on iOS and Android.
   * <!-- /only -->
   * <!-- only: ios android -->
   * with the word in its name ("Full name, required").
   * <!-- /only -->
   * The star takes effect only alongside `label`.
   */
  required?: boolean;
  // State (orthogonal). `error` (alias `invalid`) flags a validation problem.
  error?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  /** Read-only: shows the value but blocks editing without the dimmed look. */
  readOnly?: boolean;
  // Size (pick one; default is the medium field).
  small?: boolean;
  large?: boolean;
  /** A compact outlined well: 40 high with a 14px value by default; small is 32/13,
   * large is 48/16. Keeps the platform's field corner and places labels above. */
  compact?: boolean;
  // Width: a field is FILL (src/style/sizing.ts). It takes the bounds its parent
  // layout container provides, a Column, a Row span, a Container step, and never
  // carries a width of its own.
  // Multi-line entry is a separate concern: use the dedicated `Textarea` atom.

  // Addons. Passing any of these switches the field to the grouped layout: a
  // single control where a leading prefix and/or trailing suffix share one outer
  // border with the field (squared joined edges, 1px inner separators), so they
  // read as one piece rather than detached. Addons are plain strings, so no icon
  // library is required at this layer.
  /** Leading addon content (e.g. "https://", "$", an icon glyph). */
  prefix?: string;
  /** Trailing addon content (e.g. "@canvas.dev", "USD", "Copy"). */
  suffix?: string;
  // Overlaid glyph mode. Unlike prefix/suffix (a bordered addon box), these
  // float a real Lucide glyph INSIDE the field with no separator, and pad the
  // text away from it (pl-9 / pr-9). `icon` names which glyph (see ICON_BOOL).
  /** Render `icon` as a passive glyph inside the left of the field. */
  leadingIcon?: boolean;
  /** Render `icon` as a passive glyph inside the right of the field. */
  trailingIcon?: boolean;
  /** Glyph name for leadingIcon/trailingIcon: any Canvas glyph (e.g. "search", "mail", "lock", "phone", "calendar", "creditCard"). */
  icon?: IconName;
  /** Render the suffix as a pressable action button rather than a passive label. */
  action?: boolean;
  /** Called when the action suffix is pressed (action only). */
  onActionPress?: (event: GestureResponderEvent) => void;
  /**
   * A trailing eye button that reveals and re-masks a `secureTextEntry` value (the
   * password field's show/hide toggle). The field starts masked; the button is
   * announced as "Show password" / "Hide password". Takes effect only with
   * `secureTextEntry`.
   */
  passwordToggle?: boolean;
  /**
   * A trailing clear button (a circled x) that empties the field, shown while the
   * field holds text (the search field's clear affordance). Works in both the
   * controlled and the uncontrolled mode: it clears the native field and reports
   * "" through `onChangeText`.
   */
  clearable?: boolean;
  /**
   * A keyboard shortcut hint at the field's end: a compact flat keycap (`<Kbd small flat>`,
   * the 20 px `tiny` cap on a `small` field) after the value and any inline suffix, before
   * the trailing glyphs, the hint a search field shows for the key that focuses it
   * (`shortcut="⌘K"`). Pass the keys as Kbd's `keys` takes them: `"⌘K"` is one cap, `"⌘ K"`
   * two. A hint only: bind the key yourself.
   */
  shortcut?: string;

  /**
   * Accessible name for the field when there is no programmatically-associated
   * visible label. Maps to accessibilityLabel + the aria-label web alias on the
   * underlying TextInput, so a Form/Field control is announced with its name.
   */
  accessibilityLabel?: string;
  /**
   * ID of the visible label element that names this field (its `nativeID`).
   * react-native-web forwards aria-labelledby to the DOM input; prefer this over
   * accessibilityLabel when a visible <Text> label is present so the label and
   * field are programmatically linked.
   */
  "aria-labelledby"?: string;
  /**
   * ID of the helper/error text that describes this field (its `nativeID`), so a
   * screen reader reads the hint after the field name.
   */
  "aria-describedby"?: string;

  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// Size precedence when more than one is passed: first match wins.
export function sizeOf(p: InputProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

// The grouped layout's field area: the flexible cell between the addon boxes that
// holds the TextInput and its overlaid icons. The icon overlays anchor to THIS
// wrapper (the container's content box) rather than to the bordered container:
// the Android active indicator swaps border for compensating padding on focus
// (1dp+1dp -> 2dp+0dp), and an overlay stretched across the container would span
// that shifting band and re-center its icon half the change lower/higher — a
// visible one-pixel hop on focus. The content box is constant by design (see
// activeIndicator), so overlays centered on it never move.
// A row + alignItems stretch (never height:"100%") sizes the input: a percentage
// height against this auto-sized wrapper resolves unpredictably on Fabric Android
// (the field ballooned to the available screen height).
const GROUP_FIELD_AREA: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  flexDirection: "row",
  alignItems: "stretch",
};

// Read a numeric style value (the bare field height), falling back when absent.
const asNum = (v: unknown, fallback: number): number => (typeof v === "number" ? v : fallback);

/** Build an Input component from a platform skin. */
export function createInput(platformSkin: InputSkin) {
  const Input = forwardRef<RNTextInput, InputProps>(function Input(props, ref) {
    const skin = props.compact ? (platformSkin.compact ?? platformSkin) : platformSkin;
    const {
      value,
      onChangeText,
      placeholder = props.search ? "Search" : undefined,
      label,
      required,
      disabled,
      readOnly,
      prefix,
      suffix,
      leadingIcon = props.search,
      trailingIcon,
      icon = props.search ? "search" : undefined,
      action,
      onActionPress,
      passwordToggle,
      clearable,
      shortcut,
      style,
    } = props;
    const isError = !!(props.error || props.invalid);
    const size = sizeOf(props);
    const [focusedState, setFocused] = useState(false);
    // An InteractionOverride's pinned focus shows the focused look (src/style/interaction-override.tsx).
    const pinnedFocus = usePinnedFocus(!disabled);
    const focused = pinnedFocus || focusedState;
    // The password toggle's own state: masked until the eye is pressed.
    const [revealed, setRevealed] = useState(false);
    const { theme, paneProps, stateSurface, inkFill } = useTextEntryMaterial(!!skin.liquid);
    const { tokens } = theme;
    // The room the Android floating label takes, which follows the user's text size.
    const room = useFloatingLabelRoom(skin, tokens, size);
    // GlassPane paints behind the editor. A grouped clear web field moves its
    // focus/error outline above the material so the frost never blurs it
    // (`stateSurface`, which clears the box's own border there, so it draws once).
    // Bare editors and native fields retain their existing state-border owner.
    const glass = isGlass(theme);
    const onKeyPress = useInputEscapeBridge(props.onKeyPress);
    const widthCap = useFillStyle("Input", props);
    // The clear button empties the NATIVE field too (an uncontrolled field keeps its
    // own text), so the shell holds a ref of its own beside the forwarded one.
    const fieldRef = useRef<RNTextInput>(null);
    // The ring an errored field wears on keyboard focus (see the note above FOCUS_RESET).
    const errorFrame = useFocusFrame();
    // A pointer over the box steps its resting edge (web only, where the skin declares it).
    const hover = useHover(!!skin.hover && !disabled);
    const hostRef = useComposedRefs(fieldRef, ref, errorFrame.target.ref);
    // One collision-free id for the label so the field can name itself via
    // aria-labelledby (unconditional hook: the id is cheap and always available).
    const labelId = useId();

    // Whether the field currently holds text — the Android floating label floats
    // when the field is focused OR populated. Seeded from value/defaultValue so a
    // prefilled field starts floated; for a controlled field the value is the
    // source of truth, otherwise the wrapped onChangeText keeps it in sync.
    // The uncontrolled text is kept too, for the pinned-focus caret's place after it.
    const [ownText, setOwnText] = useState(() => ((value ?? props.defaultValue) ?? "") + "");
    const hasText = ownText.length > 0;
    const populated = value != null ? value.length > 0 : hasText;
    const handleChangeText = (next: string) => {
      setOwnText(next);
      onChangeText?.(next);
    };

    // Accessible name + label link. The label (when present) is the field's
    // programmatic name on BOTH channels: accessibilityLabel/aria-label (RN + the
    // web alias) and aria-labelledby -> the label Text's nativeID. An explicit
    // accessibilityLabel / aria-labelledby from the caller still wins. Natively a
    // required field's name says so (requiredName), since aria-required is web-only.
    const accessibleName = requiredName(props.accessibilityLabel ?? label ?? (props.search ? placeholder : undefined), required);
    const ariaLabelledby = props["aria-labelledby"] ?? (label != null && props.accessibilityLabel == null ? labelId : undefined);

    // Border-color precedence: error > focus > hover > default input border. Shared by
    // both layouts; in the grouped layout it lives on the outer border so prefix
    // + field + suffix light up together as one control. The skin decides how
    // that color is used (a full border on iOS/web, the bottom active indicator
    // on Android).
    const borderColor: keyof ColorTokens = isError ? "destructive" : focused ? "ring" : hover.hovered ? "subtle-foreground" : "input";
    // The focused box's halo (the web's accent spread). An errored field under the kit's
    // keyboard ring takes none, so the ring and the halo never stack.
    const halo = focused && skin.focusHalo && !(isError && errorFrame.focused) ? skin.focusHalo(tokens, isError) : null;
    const state = { focused, error: isError };
    // What read-only changes on the box (the web's dashed edge on no fill, the Android
    // field's fill and resting indicator, which its frame below replaces).
    const readOnlyLook = readOnly && skin.readOnlyField ? skin.readOnlyField(tokens, state) : null;
    // The frame a skin draws over a read-only field (Android's dashed edge and subtle
    // underline). It is absolutely positioned and takes no touches, so the floating label,
    // the content box and the value never move; a focused or errored field keeps its own
    // active indicator in place of the frame's underline.
    const frameLook = readOnly && skin.readOnlyFrame ? skin.readOnlyFrame(tokens) : null;
    const readOnlyFrame = frameLook ? (
      <View style={[StyleSheet.absoluteFill, frameLook.frame, { pointerEvents: "none" }]}>
        {focused || isError ? null : <View style={frameLook.underline} />}
      </View>
    ) : null;
    const text = skin.text(tokens, size);
    // The pinned-focus caret over an editor whose style is `editorStyle` (see PinnedCaret):
    // only while the field is pinned focused and not really focused, where the platform
    // draws its own caret. A masked value is measured as the bullets the editor shows.
    const caretAfter = (editorStyle: StyleProp<ViewStyle>) => {
      if (!pinnedFocus || focusedState || !skin.pinnedCaret) return null;
      const shown = value ?? ownText;
      const masked = (props.secureTextEntry && !(passwordToggle && revealed)) ? "\u2022".repeat(shown.length) : shown;
      return <PinnedCaret inset={startInset(editorStyle)} value={masked} text={text} bar={skin.pinnedCaret(tokens)} />;
    };
    // The trailing glyph gutter: the glyph row's end inset, one glyph and the gap to the value.
    const gutter = asNum(skin.groupField(tokens, { leadingIcon: false, trailingIcon: true, hasPrefix: false, hasSuffix: false }).paddingEnd, 0);
    // An errored field's trailing alert glyph, where the skin draws one (Android).
    const alertGlyph = (
      <View style={{ pointerEvents: "none" }}>
        <Icon circleAlert color={tokens.destructive} size={skin.iconSize} decorative />
      </View>
    );
    const iconName = icon;
    // The trailing action glyphs: the eye needs a masked value to toggle; the clear
    // button shows only while there is text to clear (and the field is editable).
    const hasEye = !!passwordToggle && !!props.secureTextEntry;
    const hasClear = !!clearable && populated && !disabled && !readOnly;
    const hasShortcut = shortcut != null && shortcut.trim() !== "";
    const hasAddons = prefix != null || suffix != null || !!leadingIcon || !!trailingIcon || !!action || hasEye || !!clearable || hasShortcut;
    // The shortcut keycap: where it sits for this field size, and the compact cap it is.
    const shortcutSpec = skin.shortcut(size);
    const shortcutCap = hasShortcut ? <Kbd keys={shortcut} flat {...{ [shortcutSpec.cap]: true }} /> : null;
    const labelGap: ViewStyle = { gap: skin.labelGap };
    // Under glass the bare field drops its fill and its resting hairline (the pane's
    // material and rim carry them) and keeps the focus ring / error border as its state.
    const glassBox: ViewStyle = { ...PANE_SIBLING_INPUT, backgroundColor: "transparent", borderColor: focused || isError ? (tokens[borderColor] ?? tokens.input) : "transparent" };
    // The error wash, capped where the field's ink would lose 4.5:1 (legibleWash).
    const paneTint = isError ? legibleWash(theme, "error", paneProps) : undefined;

    const common = {
      value,
      systemFocus: props.systemFocus,
      onChangeText: handleChangeText,
      placeholder,
      placeholderTextColor: skin.placeholder(tokens),
      // Disabled reaches the browser as disabled (out of the tab order) and VoiceOver and
      // TalkBack as dimmed; read-only stays focusable on the web (src/style/text-entry-state.ts).
      ...textEntryState({ disabled, readOnly }),
      selectionColor: tokens.primary, // brand cursor / selection on every platform
      // Text-entry behavior passthrough (the curated TextEntryProps slice).
      defaultValue: props.defaultValue,
      // The eye reveals the masked value; without the toggle the prop passes through.
      secureTextEntry: hasEye ? !revealed : props.secureTextEntry,
      keyboardType: props.keyboardType,
      inputMode: props.inputMode,
      autoCapitalize: props.autoCapitalize,
      autoComplete: props.autoComplete,
      autoCorrect: props.autoCorrect,
      autoFocus: props.autoFocus,
      maxLength: props.maxLength,
      returnKeyType: props.returnKeyType,
      textContentType: props.textContentType,
      onSubmitEditing: props.onSubmitEditing,
      onKeyPress,
      testID: props.testID,
      // Internal focus styling chains with (never replaces) the consumer's handlers.
      ...frameHandlers(errorFrame.target, {
        onFocus: (e: Parameters<NonNullable<RNTextInputProps["onFocus"]>>[0]) => {
          setFocused(true);
          props.onFocus?.(e);
        },
        onBlur: (e: Parameters<NonNullable<RNTextInputProps["onBlur"]>>[0]) => {
          setFocused(false);
          props.onBlur?.(e);
        },
      }),
      // Surface the validation problem programmatically, not just as a red border
      // (WCAG 1.4.1 / 4.1.2). `aria-invalid` is the cross-platform alias RNW
      // forwards to the DOM input as aria-invalid="true" so web screen readers
      // announce the field as invalid. Undefined when valid so the attribute is
      // omitted entirely rather than emitting aria-invalid="false".
      "aria-invalid": isError || undefined,
      // Required is surfaced programmatically, not just via the "*" glyph: aria-required
      // on the web (omitted entirely when the field is optional) and the name natively.
      "aria-required": required || undefined,
      // Accessible name + descriptions, forwarded to the TextInput so a Form/Field
      // control is announced with its label and helper/error text. aria-label is
      // the web alias for accessibilityLabel; aria-labelledby/aria-describedby link
      // to a visible label / helper Text by nativeID (RNW forwards them to the DOM).
      // When `label` is set the field names itself (accessibleName / ariaLabelledby).
      accessibilityLabel: accessibleName,
      "aria-label": accessibleName,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": props["aria-describedby"],
    };

    // Label placement: iOS/web render it ABOVE the field; the Android skin floats
    // it inside the container (M3). Addons force the above layout everywhere (the
    // floating label can't share the container with a prefix/suffix box); the
    // Field/Form composers never pass addons, so this is only an edge case.
    const floating = label != null && skin.floatingLabel && !hasAddons;
    const above = label != null && !floating;
    // The above-field label's type and ink, from the skin on every platform (on
    // Android, for the grouped field whose addons keep the label from floating).
    const aboveLabelStyle: TextStyle = props.eyebrow && skin.referenceLabel ? skin.referenceLabel(tokens) : skin.labelAbove(tokens, size);
    // The field names itself from the label unless the caller named it, so natively the
    // label is then hidden beside it (labelA11y).
    const labelNames = props.accessibilityLabel == null;
    const aboveLabel = above ? (
      <Text nativeID={labelId} style={aboveLabelStyle} {...labelA11y(label!, labelNames)}>
        <LabelContent label={label!} required={required} starColor={tokens.destructive} />
      </Text>
    ) : null;

    // Search owns its magnifier, decorative empty prompt, and editor as one field.
    // It shares text state, refs and accessibility with both framed layouts. A search
    // container with a fill of its own (the native search fields) is a control surface:
    // under glass it renders through the pane like the framed field.
    if (props.search && skin.search) {
      const searchBox = skin.search.container(tokens);
      const filled = searchBox.backgroundColor != null;
      return <View style={[labelGap, widthCap, style, disabled ? { opacity: skin.disabledOpacity } : null]}>
        {aboveLabel}
        <View style={filled ? paneStyle(theme, searchBox) : searchBox}>
          {filled ? <GlassPane {...paneProps} shape={searchBox} /> : null}
          <Icon search boldStroke={skin.search.icon.bold} color={skin.search.icon.color(tokens)} size={skin.search.icon.size} decorative />
          <View style={{ flex: 1, justifyContent: "center" }}>
            {!populated ? <Text accessible={false} aria-hidden style={skin.search.placeholder(tokens)}>{placeholder}</Text> : null}
            <TextInput ref={hostRef} style={skin.search.field(tokens)} {...common} placeholder={undefined} />
          </View>
          {shortcutCap}
        </View>
      </View>;
    }

    // Bare field: no addons.
    if (!hasAddons) {
      // Suppress the browser's default focus outline on web (RN Web draws it on the
      // <input>/<textarea>). Every skin paints its own focus affordance (web: border
      // -> ring, iOS: hairline, Android: bottom indicator), so the outline is
      // redundant and, over the filled Android skin, reads as a blue rectangle on
      // top of the indicator. No-op on native; matches the grouped path and the
      // Autocomplete/Textarea/Stepper shells.
      const bareShape = { ...skin.bareField(tokens, borderColor, focused, isError), ...(props.soft && skin.softFill ? { backgroundColor: skin.softFill(tokens) } : null), ...readOnlyLook };
      // An errored bare field keeps its layout (and its floating label) and overlays the
      // alert glyph at the end, the value padded clear of it by the glyph gutter.
      const bareAlert = isError && !!skin.errorGlyph;
      // The field's whole box goes through paneStyle (its shape, height and any label
      // reserve), so under glass its resting border becomes padding of the same width.
      const bareStyleWith = (reserve: StyleProp<ViewStyle>) => [paneStyle(theme, [bareShape, skin.bareBox(size), reserve], focused || isError), text, props.systemFocus ? null : FOCUS_RESET, glass ? glassBox : null, bareAlert ? { paddingEnd: gutter } : null, halo, isError ? errorFrame.ring() : null];
      const bareTrailing = bareAlert ? <View style={[skin.iconOverlay("right"), { pointerEvents: "none" }]}>{alertGlyph}</View> : null;
      const bareStyle = bareStyleWith(null);
      const disabledDim = disabled ? { opacity: skin.disabledOpacity } : null;
      // The puck behind a bare field (nothing in solid mode).
      const barePane = <GlassPane {...paneProps} shape={bareShape} tint={paneTint} />;

      // Android M3 floating label: the field reserves top space for the floated
      // label, the animated label overlays it, and the placeholder is gated to the
      // focused state (at rest the label itself is the placeholder). The wrapper
      // (not the field) carries the width cap, the style escape hatch, and the
      // disabled dim so the label dims with the field.
      if (floating) {
        // The field keeps the skin's height at the skin's text size and grows by what a
        // larger text size adds to the label's reserve and the value's line.
        const fieldHeight = asNum(skin.bareBox(size).height, 56) + room.growth;
        return (
          <View style={[{ position: "relative" }, disabledDim, widthCap, style, paneHost(theme)]}>
            {barePane}
            <TextInput
              ref={hostRef}
              style={[...bareStyleWith(room.reserve), room.growth !== 0 ? { height: fieldHeight } : null]}
              textAlignVertical="center"
              {...common}
              placeholder={focused ? placeholder : undefined}
            />
            {bareTrailing}
            {readOnlyFrame}
            <FloatingLabel
              styles={skin}
              size={size}
              tokens={tokens}
              label={label!}
              required={required}
              labelId={labelId}
              focused={focused}
              populated={populated}
              isError={isError}
              height={fieldHeight}
              names={labelNames}
              onLine={room.onLine}
            />
          </View>
        );
      }

      // iOS / web: the label sits above the field. The wrapper carries the width
      // cap, style, and disabled dim; the field fills it (its skin sets width:100%).
      if (above) {
        return (
          <View style={[labelGap, disabledDim, widthCap, style]}>
            {aboveLabel}
            <View style={paneHost(theme)} {...hover.target}>
              {barePane}
              <TextInput ref={hostRef} style={bareStyle} textAlignVertical="center" {...common} />
              {caretAfter(bareStyle)}
              {bareTrailing}
              {readOnlyFrame}
            </View>
          </View>
        );
      }

      // Keep the field host in place when the material changes, preserving focus,
      // native selection and uncontrolled text. The pane stays decoration only.
      return (
        <View style={[disabledDim, widthCap, style, paneHost(theme)]} {...hover.target}>
          {barePane}
          <TextInput ref={hostRef} style={bareStyle} textAlignVertical="center" {...common} />
          {caretAfter(bareStyle)}
          {bareTrailing}
          {readOnlyFrame}
        </View>
      );
    }

    // Grouped field: prefix/suffix addons, overlaid icons, optional action button.
    // The whole group shares one border, so it owns the focus state and the inner
    // field's default outline is suppressed (see FOCUS_RESET). When a label is
    // present the floating label can't share the container with the addon boxes, so
    // the label falls back to the above layout: the wrapper owns width/style/dim and
    // the group container drops them.
    // minHeight (not addon-box heights) owns the row height: the addon boxes and
    // the field area stretch to it, so an icon-only group is as tall as the bare
    // field, and the total stays groupedHeight — the indicator/border band lives
    // INSIDE it rather than inflating past it.
    const height = skin.groupedHeight(size);
    // The trailing glyphs, in the hand-off's order: the clear button, the eye, the error
    // alert (where the skin draws one, and only in place of a clear or eye button), then a
    // passive trailing icon.
    const hasAlert = !!skin.errorGlyph && isError && !hasClear && !hasEye;
    const hasTrailingIcon = !!trailingIcon && iconName != null;
    const trailingGlyphs = (hasClear ? 1 : 0) + (hasEye ? 1 : 0) + (hasAlert ? 1 : 0) + (hasTrailingIcon ? 1 : 0);
    // The clear button's box: its disc where the skin draws one, never under the glyph size.
    const disc = skin.clearDisc;
    const clearBox = Math.max(skin.iconSize, disc?.size ?? 0);
    // The gutter the glyphs need: the one-glyph gutter widened by each further glyph and
    // ACTION_GAP, and by what a clear disc adds over a glyph.
    const trailingGutter = trailingGlyphs > 0 ? gutter + (hasClear ? clearBox - skin.iconSize : 0) + (trailingGlyphs - 1) * (skin.iconSize + ACTION_GAP) : 0;
    // A passive suffix the skin draws inline sits in the field area BEFORE the glyphs (web,
    // Android), so it, not the value, reserves their gutter; a boxed suffix stays at the
    // edge after them (iOS), and the action suffix is always last.
    const inlineSuffix = suffix != null && !action && !!skin.inlineSuffix;
    // What sits in the field area after the value, in order: the inline suffix, then the
    // shortcut keycap. The last of them reserves the trailing glyphs' gutter (or, for the
    // keycap, its end inset), so the value reserves nothing of its own past its gap.
    const inflowEnd = inlineSuffix || hasShortcut;
    // The pressable glyphs' slops (the clear glyph first, then the eye). The one-glyph gutter
    // holds the glyph row's end inset, the glyph and the gap to the value (or the inline
    // suffix), so that gap is what is left of it.
    const endInset = asNum((StyleSheet.flatten(skin.iconOverlay("right")) as ViewStyle).paddingEnd, 0);
    const [firstSlop, secondSlop] = actionSlops((hasClear ? 1 : 0) + (hasEye ? 1 : 0), Math.max(0, gutter - endInset - skin.iconSize));
    const clearSlop = hasClear ? firstSlop : undefined;
    const eyeSlop = hasEye ? (hasClear ? secondSlop : firstSlop) : undefined;
    // Clear: empty the native field (the uncontrolled case keeps its own text), then
    // report the empty value so a controlled parent and the populated flag follow.
    const clearField = () => {
      fieldRef.current?.clear();
      handleChangeText("");
      fieldRef.current?.focus();
    };
    // The editor's own box in the field area (its insets place the pinned-focus caret).
    const groupEditor = skin.groupField(tokens, { leadingIcon: !!leadingIcon, trailingIcon: trailingGlyphs > 0 && !inflowEnd, hasPrefix: prefix != null, hasSuffix: suffix != null, action: !!action });
    const groupShape = { ...skin.groupContainer(tokens, borderColor, focused, isError), ...(props.soft && skin.softFill ? { backgroundColor: skin.softFill(tokens) } : null), ...readOnlyLook };
    // The trailing addon's state: the action suffix is a box of its own on some skins.
    const suffixState = { ...state, action: !!action };
    const groupSurface = stateSurface(groupShape, focused || isError);
    // The clear and reveal buttons' borderless ripple is projected onto an ancestor's
    // background, beneath the group's pane: where the pane renders it draws in the
    // foreground (`paneRipple`).
    const actionRipple = paneRipple(theme, skin.ripple ? { ...skin.ripple(tokens), borderless: true } : undefined);
    const groupedField = (
      <View
        {...hover.target}
        hitSlop={hasClear || hasEye ? actionOverhang(hasClear ? clearBox : skin.iconSize, height) : undefined}
        style={[
          groupSurface.style,
          { minHeight: height },
          halo,
          above ? null : disabled ? { opacity: skin.disabledOpacity } : null,
          above ? null : widthCap,
          above ? null : style,
          isError ? errorFrame.ring() : null,
        ]}
      >
        <GlassPane {...paneProps} stateBorder={groupSurface.keepsBorder} shape={groupShape} tint={paneTint} />
        {prefix != null ? (
          <View style={inkFill(skin.addonBox(tokens, "left", state))}>
            <Text style={[text, skin.addonText(tokens, "left")]}>{prefix}</Text>
          </View>
        ) : null}

        <View style={GROUP_FIELD_AREA}>
          {leadingIcon && iconName != null ? (
            <View style={[skin.iconOverlay("left"), { pointerEvents: "none" }]}>
              <Icon {...{ [iconName]: true }} color={skin.iconColor(tokens, { ...state, action: false })} size={skin.iconSize} decorative />
            </View>
          ) : null}

          {caretAfter(groupEditor)}
          <TextInput
            ref={hostRef}
            style={[
              groupEditor,
              trailingGlyphs > 0 && !inflowEnd ? { paddingEnd: trailingGutter } : null,
              // The value stops the keycap's gap short of it, where no inline suffix sits between.
              hasShortcut && !inlineSuffix ? { paddingEnd: shortcutSpec.gap } : null,
              text,
              props.systemFocus ? null : FOCUS_RESET,
              glass ? PANE_SIBLING_INPUT : null,
            ]}
            textAlignVertical="center"
            {...common}
          />

          {inlineSuffix ? (
            <View style={[inkFill(skin.addonBox(tokens, "right", suffixState)), hasShortcut ? { paddingEnd: shortcutSpec.gap } : trailingGlyphs > 0 ? { paddingEnd: trailingGutter } : null]}>
              <Text style={[text, skin.addonText(tokens, "right")]}>{suffix}</Text>
            </View>
          ) : null}

          {hasShortcut ? (
            <View style={{ justifyContent: "center", paddingEnd: trailingGlyphs > 0 ? trailingGutter : shortcutSpec.endInset }}>
              {shortcutCap}
            </View>
          ) : null}

          {trailingGlyphs > 0 ? (
            <View style={[skin.iconOverlay("right"), { flexDirection: "row", alignItems: "center", gap: ACTION_GAP }]} pointerEvents="box-none">
              {hasClear ? (
                <Pressable
                  onPress={clearField}
                  hitSlop={clearSlop}
                  accessibilityRole="button"
                  accessibilityLabel="Clear text"
                  android_ripple={actionRipple}
                  style={({ pressed }) => [
                    disc ? { width: clearBox, height: clearBox, alignItems: "center", justifyContent: "center" } : null,
                    skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
                  ]}
                >
                  {disc ? (
                    <View style={{ width: disc.size, height: disc.size, borderRadius: shape.web.pill, backgroundColor: disc.fill(tokens), alignItems: "center", justifyContent: "center" }}>
                      <Icon x color={disc.ink(tokens)} size={disc.glyph} decorative />
                    </View>
                  ) : (
                    <Icon circleX color={skin.iconColor(tokens, { ...state, action: true })} size={skin.iconSize} decorative />
                  )}
                </Pressable>
              ) : null}
              {hasEye ? (
                <Pressable
                  onPress={() => setRevealed((r) => !r)}
                  hitSlop={eyeSlop}
                  accessibilityRole="button"
                  accessibilityLabel={revealed ? "Hide password" : "Show password"}
                  accessibilityState={{ selected: revealed }}
                  disabled={disabled}
                  android_ripple={actionRipple}
                  style={({ pressed }) => (skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null)}
                >
                  <Icon {...{ [revealed ? (skin.revealGlyph?.revealed ?? "eye") : (skin.revealGlyph?.masked ?? "eyeOff")]: true }} color={skin.iconColor(tokens, { ...state, action: true })} size={skin.iconSize} decorative />
                </Pressable>
              ) : null}
              {hasAlert ? alertGlyph : null}
              {hasTrailingIcon && iconName != null ? (
                <View pointerEvents="none">
                  <Icon {...{ [iconName]: true }} color={skin.iconColor(tokens, { ...state, action: false })} size={skin.iconSize} decorative />
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {suffix != null && !inlineSuffix ? (
          action ? (
            <Pressable
              style={({ pressed }) => [
                inkFill(skin.addonBox(tokens, "right", suffixState)),
                skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
              ]}
              onPress={onActionPress}
              disabled={disabled}
              android_ripple={skin.ripple ? skin.ripple(tokens) : undefined}
              accessibilityRole="button"
            >
              <Text style={[text, skin.actionText(tokens)]}>{suffix}</Text>
            </Pressable>
          ) : (
            <View style={inkFill(skin.addonBox(tokens, "right", suffixState))}>
              <Text style={[text, skin.addonText(tokens, "right")]}>{suffix}</Text>
            </View>
          )
        ) : null}
        {readOnlyFrame}
        {groupSurface.border}
      </View>
    );

    // Label + addons: render the label above the grouped control (documented
    // fallback). The wrapper carries width/style/dim; the group drops them above.
    if (above) {
      return (
        <View style={[labelGap, disabled ? { opacity: skin.disabledOpacity } : null, widthCap, style]}>
          {aboveLabel}
          {groupedField}
        </View>
      );
    }
    return groupedField;
  });
  Input.displayName = "Input";
  return Input;
}
