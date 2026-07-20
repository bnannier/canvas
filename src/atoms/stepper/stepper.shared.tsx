import { forwardRef, useId, useState, type ReactNode } from "react";
import {
  TextInput,
  type AccessibilityActionEvent,
  type NativeSyntheticEvent,
  type TextInputEndEditingEventData,
} from "react-native";
import {
  View,
  Text,
  Pressable,
  RippleClip,
  cornerRadii,
  useTheme,
  useControllableState,
  FOCUS_RESET,
  LabelContent,
  type ColorTokens,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "../../style/index.js";
import { clamp } from "../../style/math.js";
import { Icon } from "../icon/icon.js";

// Shared Stepper shell. A numeric value with a − button, an editable numeric
// center field, and a + button (the iOS UIStepper idiom, ± with direct entry). ALL
// of the structure (the three slots), the clamping math, the direct-entry parsing,
// the disabled-at-bound logic, and the full accessibility (button roles + the
// cross-platform ARIA value props the container carries) live here ONCE. A platform
// file supplies only its skin (the per-OS shape, sizing, fill, divider, glyph color,
// and press feedback) and calls createStepper.
//
// Why the ARIA props are spelled out: react-native-web DROPS accessibilityValue, so
// the container View carries aria-valuenow/min/max directly (RN 0.71+ accepts these
// and RNW forwards them to the DOM) for web screen readers; native reads the value
// from the same numbers. The − / + buttons carry aria-disabled alongside
// accessibilityState so RNW marks them disabled too.

// Style axes (semantic boolean props, the prop name is the value):
//   - Size: small / large (omit for the default medium). Precedence: large > small.
//   - State: disabled (dims the whole control and blocks every slot).
// There is no string-enum styling; every visual variation is a boolean above.

export type Size = "small" | "base" | "large";

export interface StepperProps {
  /** Controlled numeric value (clamped to [min, max] for display); omit for uncontrolled use. */
  value?: number;
  /** Initial value for uncontrolled use (a bare <Stepper /> steps out of the box). Default `min`. */
  defaultValue?: number;
  /** Fired with the next clamped value when ±, or direct entry, changes it (both modes). */
  onChange?: (next: number) => void;
  /** E2E hook forwarded to the group container. */
  testID?: string;
  /** Lower bound. Default 0. The − button disables when value <= min. */
  min?: number;
  /** Upper bound. Default Number.MAX_SAFE_INTEGER. The + button disables when value >= max. */
  max?: number;
  /** Increment/decrement amount for the ± buttons. Default 1. */
  step?: number;
  /**
   * The control's persistent, component-owned label. When set it renders as a
   * VISIBLE title ABOVE the ± control (mirroring Input's above-field placement,
   * per-OS type from the skin) and becomes the group's programmatic name (wired via
   * accessibilityLabel + aria-labelledby). When omitted, the control keeps the
   * invisible "Number" accessible-name fallback and renders no visible label, so a
   * bare `<Stepper />` looks exactly as before.
   */
  label?: string;
  /** Optional muted secondary line rendered under the label (parity with Input). Takes effect only alongside `label`. */
  description?: ReactNode;
  /**
   * Marks the control required: appends a destructive "*" to the label (hidden from
   * the accessible name) and sets aria-required on the group/field. Takes effect only
   * alongside `label`.
   */
  required?: boolean;
  // Size (pick one; default is the medium control). Precedence: large > small.
  small?: boolean;
  large?: boolean;
  // State.
  disabled?: boolean;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// The only thing a platform skin owns: the group shape, the ± button geometry and
// press feedback, the center field surface, the divider, and the glyph color/size.
// The fill/structure stay the brand on every OS; the skin never injects a platform
// default color (no iOS system blue, no M3 default).
export interface StepperSkin {
  /** The outer group container (the [ − | value | + ] shell shape). */
  group: (t: ColorTokens, size: Size, disabled: boolean) => ViewStyle;
  /** One ± button cell; `side` lets the skin round the matching outer corner. */
  button: (t: ColorTokens, size: Size, side: "left" | "right", disabled: boolean, pressed: boolean) => ViewStyle;
  /** The editable center field surface (and its type scale). */
  field: (t: ColorTokens, size: Size, disabled: boolean) => TextStyle;
  /** Divider line between a button and the value (null = no separator on this skin). */
  divider: ((t: ColorTokens, disabled: boolean) => ViewStyle) | null;
  /** The ± glyph color token and px size for a given size/state. */
  glyph: (t: ColorTokens, size: Size, disabled: boolean) => { color: keyof ColorTokens; size: number };
  /**
   * Web dims a ± button on press. null on Android (ripple carries the feedback)
   * and on iOS (the skin's `button` paints a highlight fill on the pressed half
   * instead — the iOS 27 stepper never dims its glyph).
   */
  pressedOpacity: number | null;
  /** Android ripple over a ± button; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  /**
   * Uniform hitSlop (px per edge) padding a ± button's touch target out to the
   * platform minimum (Android M3 48dp); null = no padding (web, and iOS where
   * Apple's own 32pt UIStepper sets the precedent).
   */
  hitSlop: ((size: Size) => number) | null;
  /** Layout order: the iOS HIG puts the value field to the LEFT of the [ − | + ] pill. */
  fieldOnLeft: boolean;
  /**
   * The persistent label rendered ABOVE the control (the canonical field-label
   * type, matching Input's label scale): iOS the SF field-label (semibold 600,
   * -0.15 tracking), web the 500-weight title, Android the M3 label (medium, M3
   * tracking). The floating M3 in-container label Input uses does not apply — a ±
   * button row has no filled field box to float a label into — so Android keeps the
   * component-owned title above, at the M3 label type.
   */
  labelAbove: (t: ColorTokens, size: Size) => TextStyle;
  /** The muted secondary description line under the label (per-OS supporting-text type). */
  description: (t: ColorTokens, size: Size) => TextStyle;
}

// Map a glyph color token to the Icon atom's boolean color prop. A disabled (at-bound)
// button dims its glyph to `muted` regardless of the skin's active color, so the
// disabled state reads on every platform.
function glyphColorProps(token: keyof ColorTokens, disabled: boolean): Record<string, boolean> {
  if (disabled) return { muted: true };
  if (token === "primary") return { primary: true };
  if (token === "muted-foreground") return { muted: true };
  if (token === "destructive") return { destructive: true };
  // `foreground` is the Icon default (no color boolean needed).
  return {};
}

// Size precedence when more than one is passed: first match wins (large > small).
function sizeOf(p: StepperProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

/** Build a Stepper component from a platform skin. */
export function createStepper(skin: StepperSkin) {
  const Stepper = forwardRef<TextInput, StepperProps>(function Stepper(props, ref) {
    const {
      onChange,
      min = 0,
      max = Number.MAX_SAFE_INTEGER,
      step = 1,
      label,
      description,
      required,
      disabled,
      style,
    } = props;
    const { tokens } = useTheme();
    const size = sizeOf(props);

    // Collision-free ids so the group can name itself from the visible label and be
    // described by the description (unconditional hooks: the ids are cheap and always
    // available). The label (when present) is the group's programmatic name on BOTH
    // channels — accessibilityLabel (native) and aria-labelledby -> the label Text's
    // nativeID (web, which RNW forwards). With no label, both are undefined and the
    // editable field keeps the invisible "Number" fallback below.
    const labelId = useId();
    const descId = useId();
    const accessibleName = label ?? "Number";
    const ariaLabelledby = label != null ? labelId : undefined;
    const ariaDescribedby = description != null ? descId : undefined;

    // Controlled when `value` is provided, self-managed otherwise, so a bare
    // <Stepper /> steps out of the box (the standard library contract).
    const [value, setValue] = useControllableState<number>(
      props.value,
      props.defaultValue ?? min,
      onChange,
    );

    const current = clamp(value, min, max);
    const atMin = disabled || current <= min;
    const atMax = disabled || current >= max;

    // Direct-entry draft. While the field is focused the user may type a transient
    // value (empty, "-", a partial number); we keep that raw text locally and only
    // coerce/clamp on each numeric change and on commit (blur), so the cursor never
    // jumps and a half-typed number is not clobbered. When not editing, the field
    // shows the controlled value.
    const [draft, setDraft] = useState<string | null>(null);
    const shown = draft != null ? draft : String(current);

    const emit = (next: number) => {
      const clamped = clamp(next, min, max);
      if (clamped !== current) setValue(clamped);
    };

    const decrement = () => {
      if (atMin) return;
      emit(current - step);
    };
    const increment = () => {
      if (atMax) return;
      emit(current + step);
    };

    // Keyboard / Switch Control / VoiceOver / TalkBack "adjust value" gesture for the
    // container's `adjustable` role: route the assistive-tech increment/decrement to the
    // same step helpers (which already guard atMin/atMax). Without this the role
    // would over-promise an adjust affordance that does nothing.
    const onAccessibilityAction = (event: AccessibilityActionEvent) => {
      if (disabled) return;
      const name = event.nativeEvent.actionName;
      if (name === "increment") increment();
      else if (name === "decrement") decrement();
    };

    // Parse on every keystroke: ignore non-numeric input, allow an empty/partial
    // transient draft, and emit the clamped number whenever the draft parses.
    const onChangeText = (raw: string) => {
      // Keep only characters that can form a (possibly negative/decimal) number.
      const cleaned = raw.replace(/[^0-9.-]/g, "");
      setDraft(cleaned);
      if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return; // transient
      const parsed = Number(cleaned);
      if (!Number.isNaN(parsed)) emit(parsed);
    };

    // Commit on blur: coerce an empty/partial draft to a real number (clamped),
    // then drop the draft so the field re-syncs to the controlled value.
    const commit = (_e?: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
      if (draft != null) {
        const parsed = Number(draft);
        const next = Number.isNaN(parsed) ? min : clamp(parsed, min, max);
        if (next !== current) setValue(next);
      }
      setDraft(null);
    };

    const glyph = skin.glyph(tokens, size, !!disabled);
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;
    const hitSlop = skin.hitSlop ? skin.hitSlop(size) : undefined;

    // Each ± button is its own rounded surface (a circle on Android), so its bounded
    // android_ripple is clipped to those corners by a RippleClip parent (a transparent
    // passthrough on iOS/web; the corner radii are constant across pressed/disabled). See
    // src/style/ripple-clip.
    const MinusButton = (
      <RippleClip shape={cornerRadii(skin.button(tokens, size, "left", atMin, false))}>
        <Pressable
          onPress={decrement}
          disabled={atMin}
          accessibilityRole="button"
          accessibilityLabel="Decrease"
          accessibilityState={{ disabled: atMin }}
          aria-disabled={atMin}
          android_ripple={ripple}
          hitSlop={hitSlop}
          style={({ pressed }) => [
            skin.button(tokens, size, "left", atMin, pressed),
            skin.pressedOpacity != null && pressed && !atMin ? { opacity: skin.pressedOpacity } : null,
          ]}
        >
          <Icon minus {...glyphColorProps(glyph.color, atMin)} size={glyph.size} />
        </Pressable>
      </RippleClip>
    );

    const PlusButton = (
      <RippleClip shape={cornerRadii(skin.button(tokens, size, "right", atMax, false))}>
        <Pressable
          onPress={increment}
          disabled={atMax}
          accessibilityRole="button"
          accessibilityLabel="Increase"
          accessibilityState={{ disabled: atMax }}
          aria-disabled={atMax}
          android_ripple={ripple}
          hitSlop={hitSlop}
          style={({ pressed }) => [
            skin.button(tokens, size, "right", atMax, pressed),
            skin.pressedOpacity != null && pressed && !atMax ? { opacity: skin.pressedOpacity } : null,
          ]}
        >
          <Icon plus {...glyphColorProps(glyph.color, atMax)} size={glyph.size} />
        </Pressable>
      </RippleClip>
    );

    const Field = (
      <TextInput
        ref={ref}
        value={shown}
        onChangeText={onChangeText}
        onBlur={() => commit()}
        onEndEditing={commit}
        editable={!disabled}
        inputMode="numeric"
        keyboardType="number-pad"
        selectionColor={tokens.primary}
        accessibilityLabel={accessibleName}
        aria-label={accessibleName}
        aria-labelledby={ariaLabelledby}
        // Required is surfaced programmatically (aria-required), matching Input;
        // omitted entirely when optional so no aria-required="false" is emitted.
        aria-required={required || undefined}
        style={[skin.field(tokens, size, !!disabled), FOCUS_RESET]}
      />
    );

    const makeDivider = (key: string) =>
      skin.divider ? <View key={key} style={[skin.divider(tokens, !!disabled), { pointerEvents: "none" }]} /> : null;

    // The [ − | + ] pill is one piece; the field sits beside it (LEFT on iOS per HIG,
    // RIGHT-of-minus / inline on the others). The dividers sit between adjacent slots.
    const control = (
      <View
        testID={props.testID}
        // Cross-platform ARIA value props: RNW DROPS accessibilityValue, so the
        // numbers are forwarded directly (RN 0.71+ accepts them; RNW maps them to
        // aria-valuenow/min/max on the DOM node) for web screen readers.
        accessibilityRole="adjustable"
        accessibilityValue={{ min, max, now: current }}
        aria-valuenow={current}
        aria-valuemin={min}
        aria-valuemax={max}
        // The visible label (when present) names the whole group and the description
        // describes it. Both are undefined without a label, so nothing changes for a
        // bare <Stepper /> (the group stays unnamed, as before).
        accessibilityLabel={label}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        // Programmatic required on the group too (aria-required), omitted when optional.
        aria-required={required || undefined}
        accessibilityState={{ disabled: !!disabled }}
        // RNW drops accessibilityState, so alias the disabled flag for web SR (matching
        // the ± buttons) — otherwise the group's adjustable element omits disabled.
        aria-disabled={!!disabled}
        // The adjustable role advertises an "adjust value" gesture; bind it so swipe /
        // arrow-key adjust actually steps the value (helpers guard atMin/atMax).
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={onAccessibilityAction}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            // With a label the outer wrapper carries the disabled dim (so the label
            // dims with the control, matching Input); bare, the group dims itself.
            opacity: label == null && disabled ? 0.5 : 1,
          },
          // The style escape hatch rides the outer wrapper when a label is present
          // (as in Input); on the bare control it stays here so the bare output is
          // byte-identical.
          label != null ? null : style,
        ]}
      >
        {skin.fieldOnLeft ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {Field}
            <View style={skin.group(tokens, size, !!disabled)}>
              {MinusButton}
              {makeDivider("d")}
              {PlusButton}
            </View>
          </View>
        ) : (
          <View style={skin.group(tokens, size, !!disabled)}>
            {MinusButton}
            {makeDivider("d1")}
            {Field}
            {makeDivider("d2")}
            {PlusButton}
          </View>
        )}
      </View>
    );

    // No label: return the bare control, byte-identical to the pre-label output.
    if (label == null) return control;

    // With a label: a component-owned title (and optional muted description) ABOVE
    // the control, mirroring Input's above-field placement. The wrapper owns the
    // style escape hatch and the disabled dim so the label dims with the control.
    return (
      <View style={[{ alignSelf: "flex-start", gap: 6 }, disabled ? { opacity: 0.5 } : null, style]}>
        <Text nativeID={labelId} style={skin.labelAbove(tokens, size)}>
          <LabelContent label={label} required={required} starColor={tokens.destructive} />
        </Text>
        {description != null ? (
          <Text nativeID={descId} style={skin.description(tokens, size)}>
            {description}
          </Text>
        ) : null}
        {control}
      </View>
    );
  });
  Stepper.displayName = "Stepper";
  return Stepper;
}
