import { useState } from "react";
import { type GestureResponderEvent, type TextStyle } from "react-native";
import { View, Pressable, Text, TextInput, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Icon } from "../icon/icon.js";
import * as s from "./input.styles.js";

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
// and reads as half-baked, so it is suppressed there and the group shows focus
// on its shared border instead. No-op on native, which has no CSS outline.
const FIELD_OUTLINE_RESET = { outlineStyle: "none", outlineWidth: 0 } as unknown as TextStyle;

export interface InputProps {
  /** Current text value (controlled). */
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
  /** Full-width field (the default); pass to be explicit. */
  block?: boolean;
  /** Multi-line text area instead of a single-line field. Ignored when addons
   *  (prefix/suffix/icons/action) are present, which are single-line only. */
  multiline?: boolean;

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

  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

export function Input(props: InputProps) {
  const {
    value,
    onChangeText,
    placeholder,
    disabled,
    readOnly,
    multiline,
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
  const [focused, setFocused] = useState(false);
  const { tokens } = useTheme();

  // Border color precedence: error > focus > default input border. Shared by
  // both layouts; in the grouped layout it lives on the outer border so prefix
  // + field + suffix light up together as one control.
  const borderColor = isError ? tokens.destructive : focused ? tokens.ring : tokens.input;
  const text = s.textType(props);
  const iconName = icon != null ? ICON_BOOL[icon] : undefined;
  const hasAddons = prefix != null || suffix != null || !!leadingIcon || !!trailingIcon || !!action;

  const common = {
    value,
    onChangeText,
    placeholder,
    placeholderTextColor: tokens["muted-foreground"],
    editable: !disabled && !readOnly,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };

  // Bare field (and the multiline text area): no addons.
  if (!hasAddons) {
    return (
      <TextInput
        style={[s.bareField(tokens, borderColor), s.bareBox(props), text, disabled ? { opacity: 0.5 } : null, style]}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...common}
      />
    );
  }

  // Grouped field: prefix/suffix addons, overlaid icons, optional action button.
  // The whole group shares one border, so it owns the focus state and the inner
  // field's default outline is suppressed (see FIELD_OUTLINE_RESET).
  const height = s.groupedHeight(props);
  return (
    <View style={[s.groupContainer(tokens, borderColor), disabled ? { opacity: 0.5 } : null, style]}>
      {prefix != null ? (
        <View style={s.addonBox(tokens, "left", height)}>
          <Text style={[s.addonText(tokens), text]}>{prefix}</Text>
        </View>
      ) : null}

      {leadingIcon && iconName != null ? (
        <View style={s.iconOverlay("left")} pointerEvents="none">
          <Icon {...{ [iconName]: true }} muted size={16} />
        </View>
      ) : null}

      <TextInput style={[s.groupField(tokens, !!leadingIcon, !!trailingIcon), text, FIELD_OUTLINE_RESET]} {...common} />

      {trailingIcon && iconName != null ? (
        <View style={s.iconOverlay("right")} pointerEvents="none">
          <Icon {...{ [iconName]: true }} muted size={16} />
        </View>
      ) : null}

      {suffix != null ? (
        action ? (
          <Pressable
            style={({ pressed }) => [s.addonBox(tokens, "right", height), pressed ? { opacity: 0.9 } : null]}
            onPress={onActionPress}
            disabled={disabled}
            accessibilityRole="button"
          >
            <Text style={[s.actionText(tokens), text]}>{suffix}</Text>
          </Pressable>
        ) : (
          <View style={s.addonBox(tokens, "right", height)}>
            <Text style={[s.addonText(tokens), text]}>{suffix}</Text>
          </View>
        )
      ) : null}
    </View>
  );
}
