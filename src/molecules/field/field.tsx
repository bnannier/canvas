import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Button } from "../../atoms/button/button.js";
import { Input } from "../../atoms/input/input.js";
import * as s from "./field.styles.js";

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
  /** Append a ghost "Copy" button after the value that copies this string. */
  copyValue?: string;
  /** Render the value as an overlapping avatar stack. */
  avatars?: FieldAvatar[];
  /** Trailing "+N" overflow chip after an avatar stack. */
  overflow?: number;
}

export interface FieldProps {
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
  // Boolean axes (orthogonal, stack freely).
  /** Marks the field as required: appends a destructive "*" to the label. */
  required?: boolean;
  /** Disables the control and dims the whole field. */
  disabled?: boolean;
  /** Invalid state: shows the error message (red) and flags the Input. */
  invalid?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Render a row's value slot from its data descriptor. Precedence: an avatar
// stack, then a copyable value, then a status badge, then a metadata badge,
// then plain (optionally monospace) text.
function FieldValue(row: FieldRow) {
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
          <View style={s.overflowChip(tokens)}>
            <Text style={s.overflowText(tokens)}>{`+${row.overflow}`}</Text>
          </View>
        ) : null}
      </View>
    );
  }
  if (row.copyValue != null) {
    return (
      <View style={s.copyRow}>
        <Text style={[s.fieldValue(tokens), row.mono ? s.monoStyle : null]}>
          {row.value ?? row.copyValue}
        </Text>
        <Button ghost small>
          Copy
        </Button>
      </View>
    );
  }
  if (row.status != null) {
    return (
      <Badge status success>
        {row.status}
      </Badge>
    );
  }
  if (row.badge != null) {
    return <Badge secondary>{row.badge}</Badge>;
  }
  return (
    <Text style={[s.fieldValue(tokens), row.mono ? s.monoStyle : null]}>
      {row.value}
    </Text>
  );
}

export function Field(props: FieldProps) {
  const {
    rows,
    label,
    helper,
    error,
    placeholder,
    value,
    onChangeText,
    required,
    disabled,
    invalid,
    style,
  } = props;
  const { tokens } = useTheme();

  // Display mode: a read-only stack of label/value rows. Each row aligns its
  // label to a fixed 180px column (flex, not grid) so every value lines up to
  // one baseline.
  if (rows) {
    return (
      <View style={[s.displayStack, disabled ? s.dimmed : null, style]}>
        {rows.map((row, index) => (
          <View key={`${row.label}-${index}`} style={s.displayRow}>
            <Text style={s.fieldLabel(tokens)}>{row.label}</Text>
            <View style={s.valueFill}>{FieldValue(row)}</View>
          </View>
        ))}
      </View>
    );
  }

  // Error takes precedence over the resting helper below the control.
  const showError = !!invalid && !!error;
  const messageText = showError ? error : helper;

  return (
    <View style={[s.controlStack, disabled ? s.dimmed : null, style]}>
      {label != null ? (
        <Text style={s.label(tokens)}>
          {label}
          {required ? <Text style={s.requiredMark(tokens)}> *</Text> : null}
        </Text>
      ) : null}
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        disabled={disabled}
        error={invalid}
      />
      {messageText != null ? <Text style={s.message(tokens, showError)}>{messageText}</Text> : null}
    </View>
  );
}
