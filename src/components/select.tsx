import { cn } from "../cn.js";
import { Box, Pressable, Text } from "../engine/index.js";
import { Icon } from "./icon.js";

export interface SelectProps {
  /** The currently selected option label. Empty shows the placeholder. */
  value?: string;
  /** The list of selectable option labels. */
  options?: string[];
  /** Optional stacked field label rendered above the trigger. */
  label?: string;
  /** Renders a leading globe glyph inside the trigger, indented so the value clears it. */
  icon?: boolean;
  /** Prompt shown in the trigger when no value is selected. */
  placeholder?: string;
  /**
   * Whether the option list is open. Defaults to true so the open state is
   * visible inline (the docs render it this way; there is no portal/Modal).
   */
  open?: boolean;
  /** Dims the control and blocks interaction. */
  disabled?: boolean;
  /** Called with the chosen option label when a row is pressed. */
  onSelect?: (option: string) => void;
  // Size (pick one; default is the medium field, matching Input's h-9).
  small?: boolean;
  large?: boolean;
  /** Extra utilities, mainly for width (e.g. "max-w-[280px]"). */
  className?: string;
}

type Size = "small" | "default" | "large";

// First match wins when more than one size flag is passed.
function sizeOf(p: SelectProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// Trigger height per size; mirrors the Input control's footprint.
const TRIGGER_BOX: Record<Size, string> = {
  small: "h-8",
  default: "h-9",
  large: "h-10",
};

// Type scale per size, shared by the trigger value and the option rows.
const TEXT_SIZE: Record<Size, string> = {
  small: "text-xs",
  default: "text-sm",
  large: "text-base",
};

export function Select(props: SelectProps) {
  const {
    value,
    options = [],
    label,
    icon,
    placeholder = "Select an option",
    open = true,
    disabled,
    onSelect,
    className,
  } = props;
  const size = sizeOf(props);

  const hasValue = value != null && value !== "";

  const trigger = cn(
    "flex-row items-center justify-between rounded-md border border-input bg-background px-3",
    TRIGGER_BOX[size],
    disabled && "opacity-50",
  );

  const triggerText = cn(
    TEXT_SIZE[size],
    hasValue ? "text-foreground" : "text-muted-foreground",
  );

  return (
    <Box className={cn("w-full", className)}>
      {label != null && label !== "" ? (
        <Text className={cn("mb-1.5 font-medium text-foreground", TEXT_SIZE[size])}>
          {label}
        </Text>
      ) : null}
      <Pressable className={trigger} disabled={disabled} accessibilityRole="button">
        <Box className="flex-row items-center gap-2">
          {icon ? <Icon globe muted size={14} /> : null}
          <Text className={triggerText}>{hasValue ? value : placeholder}</Text>
        </Box>
        <Text className={cn("text-muted-foreground", TEXT_SIZE[size])}>▾</Text>
      </Pressable>

      {open ? (
        <Box className="mt-1 max-h-[240px] rounded-md border border-border bg-popover p-1 shadow-lg">
          {options.map((option) => {
            const selected = option === value;
            const row = cn(
              "flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:bg-accent",
              selected && "bg-accent",
            );
            return (
              <Pressable
                key={option}
                className={row}
                onPress={onSelect ? () => onSelect(option) : undefined}
                accessibilityRole="button"
              >
                <Text
                  className={cn(TEXT_SIZE[size], "text-popover-foreground")}
                  style={{ width: 14 }}
                >
                  {selected ? "✓" : " "}
                </Text>
                <Text className={cn(TEXT_SIZE[size], "text-popover-foreground")}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}
