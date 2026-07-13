import { forwardRef, useState } from "react";
import {
  type GestureResponderEvent,
  type TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from "react-native";
import { View, Pressable, Text, TextInput, useTheme, useFieldWidth, FOCUS_RESET, type ColorTokens, type FieldWidthProps, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Icon } from "../icon/icon.js";
import { type InputSkin, type Size } from "./input.styles.js";

// Shared Input shell. The structure (bare field vs. grouped addon layout, the
// prefix/suffix boxes, overlaid icons, the optional action button), the
// public boolean-prop API, the size precedence, the border-color precedence
// (error > focus > default), accessibility, refs, and handlers all live here
// once. A platform file supplies only its skin (field shape, fill, border,
// height, the Android active-indicator underline, press feedback) and calls
// createInput.

// Glyphs an overlaid leading/trailing icon can name. Maps the scalar `icon`
// string to the Icon atom's flat boolean prop, so the playground stays
// serializable (a name string, not a React element).
const ICON_BOOL: Record<string, "search" | "mail" | "lock" | "user" | "key" | "globe"> = {
  search: "search",
  mail: "mail",
  lock: "lock",
  user: "user",
  key: "key",
  globe: "globe",
};

// react-native-web paints a default focus outline on the field; in the grouped
// (addon) layout that ring is clipped by the rounded, overflow-hidden container
// and reads as half-baked, so the shared FOCUS_RESET suppresses it there and the
// group shows focus on its shared border instead. No-op on native (no CSS outline).

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

export interface InputProps extends TextEntryProps, FieldWidthProps {
  /** Current text value (controlled). Omit and use `defaultValue` for uncontrolled use. */
  value?: string;
  /** Called with the new text on each keystroke. */
  onChangeText?: (text: string) => void;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  // State (orthogonal). `error` (alias `invalid`) flags a validation problem.
  error?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  /** Read-only: shows the value but blocks editing without the dimmed look. */
  readOnly?: boolean;
  // Size (pick one; default is the medium field).
  small?: boolean;
  large?: boolean;
  // Width axis (block/narrow/wide) comes from FieldWidthProps: a bare field
  // caps at the standard width on desktop and fills its container at the sm
  // breakpoint and below; `block` fills the container everywhere.
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
  /** Glyph name for leadingIcon/trailingIcon (e.g. "search", "mail"). */
  icon?: string;
  /** Render the suffix as a pressable action button rather than a passive label. */
  action?: boolean;
  /** Called when the action suffix is pressed (action only). */
  onActionPress?: (event: GestureResponderEvent) => void;

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

  /** Outer flex composition within a parent only, never a restyle hook; width comes from the width axis (block/narrow/wide). */
  style?: StyleProp<ViewStyle>;
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: InputProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

/** Build an Input component from a platform skin. */
export function createInput(skin: InputSkin) {
  const Input = forwardRef<RNTextInput, InputProps>(function Input(props, ref) {
    const {
      value,
      onChangeText,
      placeholder,
      disabled,
      readOnly,
      prefix,
      suffix,
      leadingIcon,
      trailingIcon,
      icon,
      action,
      onActionPress,
      style,
    } = props;
    const isError = !!(props.error || props.invalid);
    const size = sizeOf(props);
    const [focused, setFocused] = useState(false);
    const { tokens } = useTheme();
    const widthCap = useFieldWidth(props);

    // Border-color precedence: error > focus > default input border. Shared by
    // both layouts; in the grouped layout it lives on the outer border so prefix
    // + field + suffix light up together as one control. The skin decides how
    // that color is used (a full border on iOS/web, the bottom active indicator
    // on Android).
    const borderColor: keyof ColorTokens = isError ? "destructive" : focused ? "ring" : "input";
    const text = skin.text(tokens, size);
    const iconName = icon != null ? ICON_BOOL[icon] : undefined;
    const hasAddons = prefix != null || suffix != null || !!leadingIcon || !!trailingIcon || !!action;

    const common = {
      value,
      onChangeText,
      placeholder,
      placeholderTextColor: tokens["muted-foreground"],
      editable: !disabled && !readOnly,
      selectionColor: tokens.primary, // brand cursor / selection on every platform
      // Text-entry behavior passthrough (the curated TextEntryProps slice).
      defaultValue: props.defaultValue,
      secureTextEntry: props.secureTextEntry,
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
      onKeyPress: props.onKeyPress,
      testID: props.testID,
      // Internal focus styling chains with (never replaces) the consumer's handlers.
      onFocus: (e: Parameters<NonNullable<RNTextInputProps["onFocus"]>>[0]) => {
        setFocused(true);
        props.onFocus?.(e);
      },
      onBlur: (e: Parameters<NonNullable<RNTextInputProps["onBlur"]>>[0]) => {
        setFocused(false);
        props.onBlur?.(e);
      },
      // Surface the validation problem programmatically, not just as a red border
      // (WCAG 1.4.1 / 4.1.2). `aria-invalid` is the cross-platform alias RNW
      // forwards to the DOM input as aria-invalid="true" so web screen readers
      // announce the field as invalid. Undefined when valid so the attribute is
      // omitted entirely rather than emitting aria-invalid="false".
      "aria-invalid": isError || undefined,
      // Accessible name + descriptions, forwarded to the TextInput so a Form/Field
      // control is announced with its label and helper/error text. aria-label is
      // the web alias for accessibilityLabel; aria-labelledby/aria-describedby link
      // to a visible label / helper Text by nativeID (RNW forwards them to the DOM).
      accessibilityLabel: props.accessibilityLabel,
      "aria-label": props.accessibilityLabel,
      "aria-labelledby": props["aria-labelledby"],
      "aria-describedby": props["aria-describedby"],
    };

    // Bare field: no addons.
    if (!hasAddons) {
      return (
        <TextInput
          ref={ref}
          style={[
            skin.bareField(tokens, borderColor, focused, isError),
            skin.bareBox(size),
            text,
            // Suppress the browser's default focus outline on web (RN Web draws it
            // on the <input>/<textarea>). Every skin paints its own focus affordance
            // (web: border -> ring, iOS: hairline, Android: bottom indicator), so the
            // outline is redundant and, over the filled Android skin, reads as a blue
            // rectangle on top of the indicator. No-op on native; matches the grouped
            // path and the Combobox/Textarea/NumberInput shells.
            FOCUS_RESET,
            disabled ? { opacity: skin.disabledOpacity } : null,
            widthCap,
            style,
          ]}
          textAlignVertical="center"
          {...common}
        />
      );
    }

    // Grouped field: prefix/suffix addons, overlaid icons, optional action button.
    // The whole group shares one border, so it owns the focus state and the inner
    // field's default outline is suppressed (see FOCUS_RESET).
    const height = skin.groupedHeight(size);
    return (
      <View
        style={[skin.groupContainer(tokens, borderColor, focused, isError), disabled ? { opacity: skin.disabledOpacity } : null, widthCap, style]}
      >
        {prefix != null ? (
          <View style={skin.addonBox(tokens, "left", height)}>
            <Text style={[skin.addonText(tokens), text]}>{prefix}</Text>
          </View>
        ) : null}

        {leadingIcon && iconName != null ? (
          <View style={[skin.iconOverlay("left"), { pointerEvents: "none" }]}>
            <Icon {...{ [iconName]: true }} muted size={16} />
          </View>
        ) : null}

        <TextInput ref={ref} style={[skin.groupField(tokens, { leadingIcon: !!leadingIcon, trailingIcon: !!trailingIcon, hasPrefix: prefix != null, hasSuffix: suffix != null }), text, FOCUS_RESET]} {...common} />

        {trailingIcon && iconName != null ? (
          <View style={[skin.iconOverlay("right"), { pointerEvents: "none" }]}>
            <Icon {...{ [iconName]: true }} muted size={16} />
          </View>
        ) : null}

        {suffix != null ? (
          action ? (
            <Pressable
              style={({ pressed }) => [
                skin.addonBox(tokens, "right", height),
                skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
              ]}
              onPress={onActionPress}
              disabled={disabled}
              android_ripple={skin.ripple ? skin.ripple(tokens) : undefined}
              accessibilityRole="button"
            >
              <Text style={[skin.actionText(tokens), text]}>{suffix}</Text>
            </Pressable>
          ) : (
            <View style={skin.addonBox(tokens, "right", height)}>
              <Text style={[skin.addonText(tokens), text]}>{suffix}</Text>
            </View>
          )
        ) : null}
      </View>
    );
  });
  Input.displayName = "Input";
  return Input;
}
