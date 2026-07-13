import { forwardRef, useId, useState } from "react";
import { type TextInput as RNTextInput, type TextInputProps as RNTextInputProps } from "react-native";
import { View, Text, TextInput, useTheme, useFieldWidth, FloatingLabel, LabelContent, FOCUS_RESET, type FieldWidthProps, type StyleProp, type TextStyle, type ViewStyle } from "../../style/index.js";
import { type TextEntryProps } from "../input/input.shared.js";
import { type TextareaSkin, type Size, sizeText, minHeight } from "./textarea.styles.js";

// A style bump keeping the above-field label spaced from its field (the 6px the
// Field/Form control stacks use), mirroring the single-line Input.
const LABEL_GAP: ViewStyle = { gap: 6 };

// Read a numeric style value (the resolved min height), falling back when absent.
const asNum = (v: unknown, fallback: number): number => (typeof v === "number" ? v : fallback);

// The Android floating label aligns with the field's leading text edge (the M3
// multiline field's 12dp horizontal content padding).
const ANDROID_TEXTAREA_INSET = 12;

// react-native-web paints the browser's blue focus outline on a focused multiline
// <textarea>; real iOS/Android have no such outline. The shared FOCUS_RESET suppresses
// it so the skin's own focus cue (the bottom hairline thickening to the brand ring) is
// the only treatment, matching the sibling Input. It is web-only and a no-op natively.

// Shared Textarea shell. The structure (a multiline TextInput), the public
// boolean-prop API, the size precedence, the error/focus state resolution, the
// accessibility, the handlers, and the disabled dim live here once; a platform
// file supplies only its skin (fill, shape, border/underline, focus feedback)
// and calls createTextarea.

export interface TextareaProps extends TextEntryProps, FieldWidthProps {
  /** Controlled text value. Omit and use `defaultValue` for uncontrolled use. */
  value?: string;
  /** Fired with the next text value on each edit. */
  onChangeText?: (next: string) => void;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /**
   * The field's persistent label. Its placement is platform-adaptive: iOS and web
   * render it ABOVE the field; Android renders the Material 3 in-container FLOATING
   * label — a MULTILINE float pinned to the first text line at rest, floating to the
   * top once the field is focused or filled. The label names the field for a11y.
   */
  label?: string;
  /**
   * Marks the field as required: appends a destructive "*" to the label (hidden
   * from the accessible name) and sets aria-required on the field. Takes effect
   * only alongside `label`.
   */
  required?: boolean;
  /**
   * Visible rows the field sizes to. Sets the min height (rows * ~22px + 16px
   * padding); the field still grows with content past this floor.
   */
  rows?: number;
  // State (pick one; orthogonal to size).
  /** Error/validation state: a destructive cue. `invalid` is an alias. */
  error?: boolean;
  invalid?: boolean;
  // Size (pick one; default is the base text-sm field).
  small?: boolean;
  large?: boolean;
  /** Blocks editing and focus, and dims the field. */
  disabled?: boolean;
  /**
   * Borderless: drop the field's own border and radius so it sits flush inside a
   * framed container (e.g. a Card with a formatting toolbar above it).
   */
  flush?: boolean;
  /** Outer flex composition within a parent only, never a restyle hook; width comes from the width axis (block/narrow/wide). */
  style?: StyleProp<TextStyle>;
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: TextareaProps): Size {
  if (p.large) return "large";
  if (p.small) return "small";
  return "base";
}

/** Build a Textarea component from a platform skin. */
export function createTextarea(skin: TextareaSkin) {
  const Textarea = forwardRef<RNTextInput, TextareaProps>(function Textarea(props, ref) {
    const { value, onChangeText, placeholder, label, required, rows, disabled, flush, style } = props;
    const isError = !!props.error || !!props.invalid;
    const size = sizeOf(props);
    const [focused, setFocused] = useState(false);
    const { tokens } = useTheme();
    // Flush implies block: a flush textarea sits inside a framed container (a
    // toolbar Card) whose frame IS the field edge, so the container governs width
    // and a standard cap would leave a dead gutter inside the frame.
    const widthCap = useFieldWidth(flush ? { ...props, block: true } : props);
    // One collision-free id linking the field to its label (aria-labelledby).
    const labelId = useId();

    // Whether the field holds text — the Android floating label floats when the
    // field is focused OR populated. Seeded from value/defaultValue so a prefilled
    // field starts floated; a controlled field trusts its value, otherwise the
    // wrapped onChangeText keeps it in sync (mirrors the single-line Input).
    const [hasText, setHasText] = useState(() => (((value ?? props.defaultValue) ?? "") + "").length > 0);
    const populated = value != null ? value.length > 0 : hasText;
    const handleChangeText = (next: string) => {
      setHasText(next.length > 0);
      onChangeText?.(next);
    };

    // Label placement: iOS/web render it ABOVE the field; the Android skin FLOATS
    // it inside the container (M3 multiline float, pinned to the top text line).
    // A flush textarea drops its own frame to sit inside a toolbar Card, so a
    // floating in-container label makes no sense there — it always renders above.
    const hasLabel = label != null && label !== "";
    const floating = hasLabel && skin.floatingLabel && !flush;
    const above = hasLabel && !floating;

    // Accessible name + label link, mirroring the single-line Input: the label
    // names the field on BOTH channels (accessibilityLabel/aria-label and
    // aria-labelledby -> the label Text's nativeID). A caller override still wins.
    const accessibleName = hasLabel ? label : undefined;
    const ariaLabelledby = hasLabel ? labelId : undefined;

    // Surface the validation problem programmatically, not just as a red border
    // (the border alone fails WCAG 1.4.1 / 4.1.2). `aria-invalid` is the
    // cross-platform alias react-native-web forwards to the DOM textarea as
    // aria-invalid="true" so web screen readers announce the field as invalid;
    // it mirrors the sibling Input exactly. Undefined when valid so the attribute
    // is omitted rather than emitting aria-invalid="false". Spread (not direct JSX
    // attributes) because these aliases are outside RN's typed prop set.
    const a11y = {
      "aria-invalid": isError || undefined,
      "aria-required": required || undefined,
      accessibilityLabel: accessibleName,
      "aria-label": accessibleName,
      "aria-labelledby": ariaLabelledby,
    };

    // Everything the multiline field forwards, shared by all three label paths.
    const common = {
      value,
      onChangeText: handleChangeText,
      placeholderTextColor: tokens["muted-foreground"],
      selectionColor: tokens.primary, // brand cursor / selection on every platform
      editable: !disabled,
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
      ...a11y,
    };

    // The base field surface, shared by every path (width/style/disabled dim move
    // to the wrapper in the labeled paths so the label dims with the field). Typed
    // as an array (not StyleProp) so the floating path can spread it with the reserve.
    const fieldStyle: StyleProp<TextStyle>[] = [
      skin.field(tokens, { error: isError, focused }),
      sizeText(size),
      minHeight(rows),
      // Flush: strip the field's own border + radius so it sits flush inside a
      // framed container (a toolbar Card). Zero every edge so it works whether
      // the skin draws a full border or a bottom underline.
      flush
        ? { borderWidth: 0, borderTopWidth: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderRadius: 0 }
        : null,
      FOCUS_RESET,
    ];
    const disabledDim = disabled ? { opacity: 0.5 } : null;

    // Android M3 floating label: the field reserves top space for the floated
    // label, the animated label overlays the top text line, and the placeholder is
    // gated to focus (at rest the label itself is the placeholder). The wrapper
    // carries width/style and the disabled dim so the label dims with the field.
    if (floating) {
      return (
        <View style={[{ position: "relative" }, disabledDim, widthCap, style]}>
          <TextInput
            ref={ref}
            multiline
            textAlignVertical="top"
            style={[...fieldStyle, skin.labelReserve!(size)]}
            placeholder={focused ? placeholder : undefined}
            {...common}
          />
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
            height={asNum(minHeight(rows).minHeight, 80)}
            inset={ANDROID_TEXTAREA_INSET}
            multiline
          />
        </View>
      );
    }

    // iOS / web: the label sits above the field. The wrapper carries width/style
    // and the disabled dim; the field fills it (its skin sets width:100%). The
    // above-label type is the skin's `labelAbove` on iOS/web; the Android skin
    // (no `labelAbove`, since it normally floats) falls back to its resting label
    // type as a foreground title, so the flush+label edge case still reads.
    if (above) {
      const aboveLabelStyle: TextStyle = skin.labelAbove
        ? skin.labelAbove(tokens, size)
        : { ...(skin.labelRest ? skin.labelRest(tokens, size) : sizeText(size)), fontWeight: "500", color: tokens.foreground };
      return (
        <View style={[LABEL_GAP, disabledDim, widthCap, style]}>
          <Text nativeID={labelId} style={aboveLabelStyle}>
            <LabelContent label={label!} required={required} starColor={tokens.destructive} />
          </Text>
          <TextInput ref={ref} multiline textAlignVertical="top" placeholder={placeholder} style={fieldStyle} {...common} />
        </View>
      );
    }

    // No label: the original bare field, unchanged (byte-identical root).
    return (
      <TextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        placeholder={placeholder}
        style={[...fieldStyle, disabledDim, widthCap, style]}
        {...common}
      />
    );
  });
  Textarea.displayName = "Textarea";
  return Textarea;
}
