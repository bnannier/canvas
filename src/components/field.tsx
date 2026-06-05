import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Input } from "./input.js";

export interface FieldProps {
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

export function Field(props: FieldProps) {
  const {
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

  // Error takes precedence over the resting helper below the control.
  const showError = !!invalid && !!error;
  const message = showError ? error : helper;
  const messageClass = cn("text-xs", showError ? "text-destructive" : "text-muted-foreground");

  const wrapper = cn("flex-col gap-1.5", disabled && "opacity-50", className);
  const labelClass = "text-sm font-medium text-foreground";

  return (
    <Box className={wrapper}>
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
    </Box>
  );
}
