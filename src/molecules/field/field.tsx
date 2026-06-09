import { cn } from "../../cn.js";
import { View, Text } from "../../engine/index.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Button } from "../../atoms/button/button.js";
import { Input } from "../../atoms/input/input.js";

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
  /** Extra utilities, mainly for width (e.g. "max-w-[320px]", "w-1/2"). */
  className?: string;
}

// The engine has no font-family utility, so request RN's cross-platform
// monospace alias via inline style (the same technique Badge uses for `mono`).
const MONO_STYLE = { fontFamily: "monospace" } as const;

const FIELD_LABEL = "w-[180px] shrink-0 text-sm text-muted-foreground";
const FIELD_VALUE = "text-sm font-medium text-foreground";

// Render a row's value slot from its data descriptor. Precedence: an avatar
// stack, then a copyable value, then a status badge, then a metadata badge,
// then plain (optionally monospace) text.
function FieldValue(row: FieldRow) {
  if (row.avatars && row.avatars.length > 0) {
    return (
      <View className="flex-row items-center">
        {row.avatars.map((a, i) => (
          <View key={i} className={i > 0 ? "-ml-2" : undefined}>
            <Avatar small ring src={a.src} name={a.name}>
              {a.name}
            </Avatar>
          </View>
        ))}
        {typeof row.overflow === "number" && row.overflow > 0 ? (
          <View className="-ml-2 h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted">
            <Text className="text-xs font-medium text-muted-foreground">{`+${row.overflow}`}</Text>
          </View>
        ) : null}
      </View>
    );
  }
  if (row.copyValue != null) {
    return (
      <View className="flex-row items-center gap-2">
        <Text className={FIELD_VALUE} style={row.mono ? MONO_STYLE : undefined}>
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
    <Text className={FIELD_VALUE} style={row.mono ? MONO_STYLE : undefined}>
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
    className,
  } = props;

  // Display mode: a read-only stack of label/value rows. Each row aligns its
  // label to a fixed 180px column (flex, not grid, which the engine can't
  // parse) so every value lines up to one baseline.
  if (rows) {
    const display = cn("flex-col gap-3", disabled && "opacity-50", className);
    return (
      <View className={display}>
        {rows.map((row, index) => (
          <View key={`${row.label}-${index}`} className="flex-row items-center gap-4">
            <Text className={FIELD_LABEL}>{row.label}</Text>
            <View className="flex-1">{FieldValue(row)}</View>
          </View>
        ))}
      </View>
    );
  }

  // Error takes precedence over the resting helper below the control.
  const showError = !!invalid && !!error;
  const message = showError ? error : helper;
  const messageClass = cn("text-xs", showError ? "text-destructive" : "text-muted-foreground");

  const wrapper = cn("flex-col gap-1.5", disabled && "opacity-50", className);
  const labelClass = "text-sm font-medium text-foreground";

  return (
    <View className={wrapper}>
      {label != null ? (
        <Text className={labelClass}>
          {label}
          {required ? <Text className="text-destructive"> *</Text> : null}
        </Text>
      ) : null}
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        disabled={disabled}
        error={invalid}
      />
      {message != null ? <Text className={messageClass}>{message}</Text> : null}
    </View>
  );
}
