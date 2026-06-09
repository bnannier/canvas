import { useState } from "react";
import { type GestureResponderEvent, type TextStyle } from "react-native";
import { cn } from "../cn.js";
import { Box, Pressable, Text, TextInput, useTheme } from "../engine/index.js";
import { Icon } from "./icon.js";

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

  /** Extra utilities, mainly for width (e.g. "max-w-[320px]", "w-1/2"). */
  className?: string;
}

// Height per size; mirrors the real control's footprint. Multiline grows the
// minimum height instead.
function sizeBox(p: InputProps): string {
  if (p.multiline) return p.large ? "min-h-24" : p.small ? "min-h-16" : "min-h-20";
  if (p.large) return "h-10";
  if (p.small) return "h-8";
  return "h-9";
}

// Type scale per size; the field and its addons share it so they line up.
function sizeText(p: InputProps): string {
  if (p.large) return "text-base";
  if (p.small) return "text-xs";
  return "text-sm";
}

// Fixed field height per size for the grouped layout (the addon boxes set the
// row height and the field stretches to it). No multiline in this layout.
function fieldHeight(p: InputProps): string {
  if (p.large) return "h-10";
  if (p.small) return "h-8";
  return "h-9";
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
    className,
  } = props;
  const isError = !!(props.error || props.invalid);
  const [focused, setFocused] = useState(false);
  const { tokens } = useTheme();

  // Border color precedence: error > focus > default input border. Shared by
  // both layouts; in the grouped layout it lives on the outer border so prefix
  // + field + suffix light up together as one control.
  const border = isError ? "border-destructive" : focused ? "border-ring" : "border-input";
  const textSize = sizeText(props);
  const iconName = icon != null ? ICON_BOOL[icon] : undefined;
  const hasAddons =
    prefix != null || suffix != null || !!leadingIcon || !!trailingIcon || !!action;

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
        className={cn(
          "w-full rounded-md border bg-background px-3 py-2 text-foreground",
          sizeBox(props),
          textSize,
          border,
          disabled && "opacity-50",
          className,
        )}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...common}
      />
    );
  }

  // Grouped field: prefix/suffix addons, overlaid icons, optional action button.
  // The whole group shares one border, so it owns the focus state and the inner
  // field's default outline is suppressed (see FIELD_OUTLINE_RESET).
  const height = fieldHeight(props);
  return (
    <Box
      className={cn(
        "flex-row items-stretch w-full border rounded-md overflow-hidden bg-background",
        border,
        disabled && "opacity-50",
        className,
      )}
    >
      {prefix != null ? (
        <Box className={cn("justify-center bg-muted px-3 border-r border-border", height)}>
          <Text className={cn("text-muted-foreground", textSize)}>{prefix}</Text>
        </Box>
      ) : null}

      {leadingIcon && iconName != null ? (
        <Box className="absolute inset-y-0 left-0 z-10 justify-center pl-3" pointerEvents="none">
          <Icon {...{ [iconName]: true }} muted size={16} />
        </Box>
      ) : null}

      <TextInput
        className={cn(
          "flex-1 h-full px-3 py-2 text-foreground",
          textSize,
          leadingIcon && "pl-9",
          trailingIcon && "pr-9",
        )}
        style={FIELD_OUTLINE_RESET}
        {...common}
      />

      {trailingIcon && iconName != null ? (
        <Box className="absolute inset-y-0 right-0 z-10 justify-center pr-3" pointerEvents="none">
          <Icon {...{ [iconName]: true }} muted size={16} />
        </Box>
      ) : null}

      {suffix != null ? (
        action ? (
          <Pressable
            className={cn(
              "justify-center bg-muted px-3 border-l border-border active:opacity-90",
              height,
            )}
            onPress={onActionPress}
            disabled={disabled}
            accessibilityRole="button"
          >
            <Text className={cn("font-medium text-foreground", textSize)}>{suffix}</Text>
          </Pressable>
        ) : (
          <Box className={cn("justify-center bg-muted px-3 border-l border-border", height)}>
            <Text className={cn("text-muted-foreground", textSize)}>{suffix}</Text>
          </Box>
        )
      ) : null}
    </Box>
  );
}
