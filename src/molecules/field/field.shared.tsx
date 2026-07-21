import { type ComponentType, useId } from "react";
import { View, Text, useTheme, useFieldWidth, useResponsive, type FieldWidthProps, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Avatar as WebAvatar } from "../../atoms/avatar/avatar.js";
import { Badge as WebBadge } from "../../atoms/badge/badge.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Input as WebInput } from "../../atoms/input/input.js";
import { type AvatarProps } from "../../atoms/avatar/avatar.shared.js";
import { type BadgeProps } from "../../atoms/badge/badge.shared.js";
import { type ButtonProps } from "../../atoms/button/button.shared.js";
import { type InputProps } from "../../atoms/input/input.shared.js";
import * as s from "./field.styles.js";
import { type FieldSkin } from "./field.styles.js";

// Shared Field shell. The structure (a read-only stack of label/value rows in
// display mode, or a label / Input / message stack in control mode), the
// data-driven value precedence, the boolean-prop axes, the disabled dim, and the
// accessibility live here once; a platform file supplies only its skin (type
// tracking, density, the overflow-chip shape) and the platform-correct composed
// atoms, then calls createField.
//
// Field is a "Light" platform treatment: ONE structure and one set of semantic
// colors, with per-OS touches limited to type tracking, row/stack density, and
// the avatar overflow-chip radius (carried by the skin).
//
// Field has no pressable surface of its own. Its only interactive bits are the
// composed atoms (the ghost Copy Button, the Input), which already carry their
// own per-OS press feedback from their own skins; this molecule re-skins only
// its OWN surface (the label/value text and layout), never the atoms.

// The composed-atom component types, so each platform can pass its own resolved
// atoms (web base by default) without widening to `any`.
export type AvatarComponent = ComponentType<AvatarProps>;
export type BadgeComponent = ComponentType<BadgeProps>;
export type ButtonComponent = ComponentType<ButtonProps>;
export type InputComponent = ComponentType<InputProps>;

/** One avatar in a Members stack: a photo (`src`) or initials (`name`). */
export interface FieldAvatar {
  src?: string;
  name?: string;
}

/**
 * One row of the read-only Field display: a label paired with a value. The
 * value slot is data-driven and composes real atoms; pass at most one value
 * shape per row, resolved in this precedence: avatars > copyValue > status >
 * badge > plain value.
 */
export interface FieldRow {
  /** Left-column label (the muted term). */
  label: string;
  /** Plain text value (the default value shape). */
  value?: string;
  /** Render `value`/`copyValue` in a fixed-width monospace face (IDs, tokens, hashes). */
  mono?: boolean;
  /** Render the value as a metadata Badge (secondary tone) carrying this text, e.g. a plan tier. */
  badge?: string;
  /** Render the value as a success status Badge carrying this text, e.g. "Active". */
  status?: string;
  /**
   * Append a ghost "Copy" button after the value. Pressing it invokes the
   * Field's `onCopy` callback with this string (the kit ships no clipboard
   * dependency; the consumer performs the write).
   */
  copyValue?: string;
  /** Render the value as an overlapping avatar stack. */
  avatars?: FieldAvatar[];
  /** Trailing "+N" overflow chip after an avatar stack. */
  overflow?: number;
}

/**
 * A plain-text rendering of a display row's value, used to pair the term and
 * value into one screen-reader announcement (the visual value composes atoms
 * that a screen reader would otherwise read as disconnected fragments).
 */
function rowValueText(row: FieldRow): string {
  if (row.avatars && row.avatars.length > 0) {
    const names = row.avatars.map((a) => a.name).filter(Boolean) as string[];
    const more = typeof row.overflow === "number" && row.overflow > 0 ? ` and ${row.overflow} more` : "";
    return names.length > 0 ? `${names.join(", ")}${more}` : `${row.avatars.length} members${more}`;
  }
  return row.value ?? row.status ?? row.badge ?? row.copyValue ?? "";
}

export interface FieldProps extends FieldWidthProps {
  /**
   * Read-only key/value rows. When set, Field renders the field-display
   * (label column + composed value) instead of the editable input control.
   */
  rows?: FieldRow[];
  /** Label shown above the control. */
  label?: string;
  /** Helper text shown below the control in the resting state. */
  helper?: string;
  /** Error message shown below the control when `error` is set; replaces the helper. */
  error?: string;
  /** Placeholder forwarded to the wrapped Input. */
  placeholder?: string;
  /** Current text value (controlled), forwarded to the Input. */
  value?: string;
  /** Called with the new text on each keystroke, forwarded to the Input. */
  onChangeText?: (text: string) => void;
  /**
   * Called with a row's `copyValue` when its "Copy" button is pressed. The kit
   * carries no clipboard peer dependency, so the consumer supplies the write
   * (e.g. `expo-clipboard` / `@react-native-clipboard/clipboard`).
   */
  onCopy?: (value: string) => void;
  // Boolean axes (orthogonal, stack freely).
  /**
   * End-align the display-row values: each value packs to the row's trailing
   * edge (receipt / iOS-Settings style) instead of resting beside the label
   * column. Values rest at the leading edge by default. Display mode only; the
   * control-mode stack is unaffected.
   */
  alignEnd?: boolean;
  /** Marks the field as required: appends a destructive "*" to the label. */
  required?: boolean;
  /** Disables the control and dims the whole field. */
  disabled?: boolean;
  /** Invalid state: shows the error message (red) and flags the Input. */
  invalid?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer flex composition within a parent only, never a restyle hook; width comes from the width axis (block/narrow/wide). */
  style?: StyleProp<ViewStyle>;
}

/**
 * Build a Field component from a platform skin and the platform-correct composed
 * atoms.
 *
 * The composed atoms (Avatar / Badge / Button / Input) are passed in by each
 * platform's thin `.tsx`/`.ios`/`.android` file, so a value row's avatar stack,
 * status/plan badge, Copy button, and the control-mode Input all match the
 * Field's platform on every build path. This matters for the WEB docs 3-up
 * preview: a bare barrel import always resolves the WEB atoms in a browser
 * bundler, which would paint web-styled atoms inside the iOS/Android rows; each
 * platform file passes its own `.ios`/`.android` atoms so the row reads native.
 * On a real device Metro resolves the right atoms by extension regardless, so
 * the defaults (the web base) are correct there too.
 */
export function createField(
  skin: FieldSkin,
  Avatar: AvatarComponent = WebAvatar,
  Badge: BadgeComponent = WebBadge,
  Button: ButtonComponent = WebButton,
  Input: InputComponent = WebInput,
) {
  // Render a row's value slot from its data descriptor. Precedence: an avatar
  // stack, then a copyable value, then a status badge, then a metadata badge,
  // then plain (optionally monospace) text.
  function FieldValue(row: FieldRow, onCopy?: (value: string) => void, alignEnd?: boolean) {
    const { tokens } = useTheme();

    if (row.avatars && row.avatars.length > 0) {
      return (
        <View style={s.avatarRow}>
          {row.avatars.map((a, i) => (
            <View key={i} style={i > 0 ? s.avatarOverlap : undefined}>
              <Avatar small ring src={a.src} name={a.name}>
                {a.name}
              </Avatar>
            </View>
          ))}
          {typeof row.overflow === "number" && row.overflow > 0 ? (
            <View style={skin.overflowChip(tokens)}>
              <Text style={skin.overflowText(tokens)}>{`+${row.overflow}`}</Text>
            </View>
          ) : null}
        </View>
      );
    }
    if (row.copyValue != null) {
      const copyValue = row.copyValue;
      return (
        <View style={s.copyRow}>
          <Text style={[skin.fieldValue(tokens), row.mono ? skin.monoStyle : null, s.copyValueText, alignEnd ? s.valueTextEnd : null]} numberOfLines={1}>
            {row.value ?? copyValue}
          </Text>
          <Button
            ghost
            small
            accessibilityLabel={`Copy ${row.label}`}
            onPress={() => onCopy?.(copyValue)}
          >
            Copy
          </Button>
        </View>
      );
    }
    if (row.status != null) {
      return (
        <Badge status success style={alignEnd ? s.badgeEnd : undefined}>
          {row.status}
        </Badge>
      );
    }
    if (row.badge != null) {
      return <Badge secondary style={alignEnd ? s.badgeEnd : undefined}>{row.badge}</Badge>;
    }
    return (
      <Text style={[skin.fieldValue(tokens), row.mono ? skin.monoStyle : null, alignEnd ? s.valueTextEnd : null]}>
        {row.value}
      </Text>
    );
  }

  return function Field(props: FieldProps) {
    const {
      rows,
      label,
      helper,
      error,
      placeholder,
      value,
      onChangeText,
      onCopy,
      alignEnd,
      required,
      disabled,
      invalid,
      testID,
      style,
    } = props;
    const { tokens } = useTheme();
    // One collision-free id base per field instance, used in control mode to link
    // the visible label and the helper/error message to the Input below.
    const fieldId = useId();
    // The width axis caps the CONTROL-mode stack (label + Input + message share
    // one field edge; the inner Input gets `block` so the stack governs). The
    // read-only display mode is a label/value table, not a field, so it stays
    // uncapped. Resolved before the mode branch to keep hook order stable.
    const widthCap = useFieldWidth(props);
    // Display-mode label column: the skins' 180px column reads well on desktop,
    // but on phone widths it starves the value column into hard wraps, so it
    // narrows at the sm breakpoint and below. Resolved unconditionally (before
    // the mode branch) to keep hook order stable.
    const narrowLabel = useResponsive({ base: false, sm: true });

    // Display mode: a read-only stack of label/value rows. Each row aligns its
    // label to a fixed-width column (flex, not grid) so every value lines up to
    // one baseline.
    if (rows) {
      return (
        <View testID={testID} style={[skin.displayStack, disabled ? s.dimmed : null, style]}>
          {rows.map((row, index) => {
            // A row with a Copy button carries a separately-focusable control,
            // so it stays ungrouped (collapsing it would hide that button from
            // the controls list). Every other shape is read-only, so group the
            // term + value into one announced unit and hide the now-redundant
            // child text nodes from the accessibility tree.
            const interactive = row.copyValue != null;
            const valueText = rowValueText(row);
            return (
              <View
                key={`${row.label}-${index}`}
                style={skin.displayRow}
                {...(interactive
                  ? {}
                  : {
                      accessible: true,
                      accessibilityRole: "text" as const,
                      accessibilityLabel: valueText ? `${row.label}, ${valueText}` : row.label,
                    })}
              >
                <Text
                  style={[skin.fieldLabel(tokens), narrowLabel ? s.labelNarrow : null]}
                  {...(interactive
                    ? {}
                    : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const })}
                >
                  {row.label}
                </Text>
                <View
                  style={[s.valueFill, alignEnd ? s.valueEnd : null]}
                  {...(interactive
                    ? {}
                    : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const })}
                >
                  {FieldValue(row, onCopy, alignEnd)}
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    // Error takes precedence over the resting helper below the control.
    const showError = !!invalid && !!error;
    const messageText = showError ? error : helper;
    // The label is delegated to the Input, which places it per platform (above on
    // iOS/web, the M3 floating label on Android) and owns its accessible-name
    // wiring (accessibilityLabel + aria-labelledby). Field keeps only the message
    // below the control and links it as the field's description (aria-describedby),
    // so a screen reader still reads the field name then the helper/error text.
    const messageId = messageText != null ? `${fieldId}-message` : undefined;

    return (
      <View testID={testID} style={[skin.controlStack, disabled ? s.dimmed : null, widthCap, style]}>
        <Input
          label={label}
          required={required}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          disabled={disabled}
          error={invalid}
          block
          aria-describedby={messageId}
        />
        {messageText != null ? <Text nativeID={messageId} style={skin.message(tokens, showError)}>{messageText}</Text> : null}
      </View>
    );
  };
}
