import { type GestureResponderEvent, TextInput, type TextStyle } from "react-native";
import { cn } from "../cn.js";
import { Box, Pressable, Text, useStyles, useTheme } from "../engine/index.js";

// An input group is a single text field with attached addons that read as one
// control: a leading prefix (a fixed protocol, a currency symbol, an icon
// glyph) and/or a trailing suffix (a unit, a domain, or a pressable action).
// The pieces share one outer border with squared joined edges and 1px inner
// separators, so prefix + field + suffix look continuous rather than detached.
//
// This component is self-contained: it renders react-native's TextInput
// directly (styled via useStyles) instead of composing the Input component, and
// addons are plain strings so no icon library is required at this layer.

export interface InputGroupProps {
  /** Current field value (controlled). */
  value?: string;
  /** Called with the new text as the user types. */
  onChangeText?: (text: string) => void;
  /** Placeholder shown when the field is empty. */
  placeholder?: string;

  /** Leading addon content (e.g. "https://", "$", an icon glyph). */
  prefix?: string;
  /** Trailing addon content (e.g. "@canvas.dev", "USD", "Copy"). */
  suffix?: string;

  // Suffix behavior. When `action`, the trailing addon reads as a pressable
  // button rather than a passive label.
  /** Render the suffix as a pressable action button. */
  action?: boolean;
  /** Called when the action suffix is pressed (action only). */
  onActionPress?: (event: GestureResponderEvent) => void;

  // Size (pick one; default is the medium size). Drives the field height,
  // the addon padding, and the text size together.
  small?: boolean;
  large?: boolean;

  /** Dim the whole control and block input. */
  disabled?: boolean;
  /** Extra utilities for the outer row, mainly for width (e.g. "max-w-[320px]"). */
  className?: string;
}

type Size = "small" | "default" | "large";

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: InputGroupProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// Field height per size, mirroring the docs h-8 / h-9 / h-10 scale.
const FIELD_HEIGHT: Record<Size, string> = {
  small: "h-8",
  default: "h-9",
  large: "h-10",
};

// Text size per size; addon and field share it so they line up.
const TEXT_SIZE: Record<Size, string> = {
  small: "text-xs",
  default: "text-sm",
  large: "text-sm",
};

export function InputGroup(props: InputGroupProps) {
  const {
    value,
    onChangeText,
    placeholder,
    prefix,
    suffix,
    action,
    onActionPress,
    disabled,
    className,
  } = props;
  const size = sizeOf(props);
  const { tokens } = useTheme();

  const height = FIELD_HEIGHT[size];
  const textSize = TEXT_SIZE[size];

  // The TextInput is a non-engine element, so resolve its className to a style.
  const fieldStyle = useStyles(
    cn("flex-1 h-full px-3 py-2 text-foreground", textSize),
  );

  return (
    <Box
      className={cn(
        "flex-row items-stretch w-full border border-input rounded-md overflow-hidden bg-background",
        disabled && "opacity-50",
        className,
      )}
    >
      {prefix != null ? (
        <Box className={cn("justify-center bg-muted px-3 border-r border-border", height)}>
          <Text className={cn("text-muted-foreground", textSize)}>{prefix}</Text>
        </Box>
      ) : null}

      <TextInput
        style={fieldStyle as unknown as TextStyle}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens["muted-foreground"]}
        editable={!disabled}
      />

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
