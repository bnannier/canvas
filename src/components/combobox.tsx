import { useState } from "react";
import { cn } from "../cn.js";
import { Box, Pressable, Text } from "../engine/index.js";

// Combobox: a searchable single-select. It mirrors Select's structure (a field
// plus an open option list) and adds text filtering: the field shows the typed
// query, and the list narrows to options matching that query as you type.
//
// Like Select, the open state is rendered inline (the docs render it this way;
// there is no portal/Modal). `open` defaults to true so the floating list is
// visible. The selected option carries a leading "✓" and an accent surface; an
// empty filtered list shows a muted "No results" row.

export interface ComboboxProps {
  /** The text typed into the field. Filters the option list when set. */
  query?: string;
  /** The full list of selectable option labels. */
  options?: string[];
  /** The currently selected option label, marked with a check in the list. */
  value?: string;
  /** Prompt shown in the field when there is no query or value. */
  placeholder?: string;
  /**
   * Whether the option list is open. Defaults to true so the open state is
   * visible inline (the docs render it this way; there is no portal/Modal).
   */
  open?: boolean;
  /** Fired when the open state changes (field tap, select). */
  onOpenChange?: (open: boolean) => void;
  /** Optional stacked field label rendered above the field. */
  label?: string;
  /** Optional muted helper line rendered below the option list. */
  helperText?: string;
  /** Dims the control and blocks interaction. */
  disabled?: boolean;
  /** Called with the chosen option label when a row is pressed. */
  onSelect?: (option: string) => void;
  // Size (pick one; default is the medium field, matching Input's h-9).
  small?: boolean;
  large?: boolean;
  /** Extra utilities, mainly for width (e.g. "max-w-[300px]"). */
  className?: string;
}

type Size = "small" | "default" | "large";

// First match wins when more than one size flag is passed.
function sizeOf(p: ComboboxProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// Field height per size; mirrors the Input control's footprint.
const FIELD_BOX: Record<Size, string> = {
  small: "h-8",
  default: "h-9",
  large: "h-10",
};

// Type scale per size, shared by the field text and the option rows.
const TEXT_SIZE: Record<Size, string> = {
  small: "text-xs",
  default: "text-sm",
  large: "text-base",
};

export function Combobox(props: ComboboxProps) {
  const {
    query,
    options = [],
    value,
    label,
    helperText,
    placeholder = "Search…",
    open: openProp,
    onOpenChange,
    disabled,
    onSelect,
    className,
  } = props;
  const size = sizeOf(props);
  // Uncontrolled by default: the field opens/closes the list, a select closes it.
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // What the field shows: the typed query, then the selected value, else the
  // placeholder. The first two read as foreground text; the placeholder is muted.
  const hasQuery = query != null && query !== "";
  const hasValue = value != null && value !== "";
  const fieldText = hasQuery ? query : hasValue ? value : placeholder;
  const fieldMuted = !hasQuery && !hasValue;

  // Filter the list by the query (case-insensitive). With no query, show all.
  const q = hasQuery ? (query as string).toLowerCase() : "";
  const matches = hasQuery
    ? options.filter((o) => o.toLowerCase().includes(q))
    : options;

  const field = cn(
    "flex-row items-center justify-between rounded-md border border-input bg-background px-3",
    FIELD_BOX[size],
    disabled && "opacity-50",
  );

  return (
    <Box className={cn("relative w-full", className)}>
      {label != null && label !== "" ? (
        <Text className={cn("mb-1.5 font-medium text-foreground", TEXT_SIZE[size])}>
          {label}
        </Text>
      ) : null}
      <Pressable className={field} disabled={disabled} onPress={() => setOpen(!open)} accessibilityRole="button">
        <Text
          className={cn(
            TEXT_SIZE[size],
            fieldMuted ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {fieldText}
        </Text>
        <Text className={cn("text-muted-foreground", TEXT_SIZE[size])}>▾</Text>
      </Pressable>

      {open ? (
        <Box className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[240px] rounded-md border border-border bg-popover p-1 shadow-lg">
          {matches.length === 0 ? (
            <Box className="px-2 py-1.5">
              <Text className={cn(TEXT_SIZE[size], "text-muted-foreground")}>
                No results
              </Text>
            </Box>
          ) : (
            matches.map((option) => {
              const selected = option === value;
              const row = cn(
                "flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:bg-accent",
                selected && "bg-accent",
              );
              return (
                <Pressable
                  key={option}
                  className={row}
                  onPress={() => { onSelect?.(option); setOpen(false); }}
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
            })
          )}
        </Box>
      ) : null}

      {helperText != null && helperText !== "" ? (
        <Text className="mt-1.5 text-xs text-muted-foreground">{helperText}</Text>
      ) : null}
    </Box>
  );
}
