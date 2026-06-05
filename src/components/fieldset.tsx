import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Input } from "./input.js";
import { Checkbox } from "./checkbox.js";

// Fieldset: a labeled group of related form controls. A legend names the group,
// an optional description explains it, and a field group stacks the controls so
// the set reads as one labeled unit. For the docs playground (data-only, no JSX
// children) it also accepts a flat `items` array that renders stacked
// label + <Input> rows, or a `checkboxes` array that renders a checkbox group.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Card's surfaceOf). Axes:
//
// - Surface: `bordered` (a bordered, padded card-like section) vs. the plain
//   default (a borderless group).
// - Columns: `twoColumn` lays the field group out in two columns (it collapses
//   to one column on small screens); omit for the single-column stack.
// - State: `disabled` dims the whole group and disables every control inside.
// - `error` flags a validation problem on the field group (shown via a default
//   inline message when `items` are rendered and no per-item error is set).

export interface FieldsetItem {
  /** The field's persistent label, shown above the control. */
  label: string;
  /** Optional example/format hint shown inside the control. */
  placeholder?: string;
  /** Optional value rendered into the control. */
  value?: string;
  /** Optional muted help line beneath the control. */
  help?: string;
  /** Optional inline error beneath the control (takes precedence over help). */
  error?: string;
}

export interface FieldsetProps {
  children?: ReactNode;
  /** The group's name, rendered as the legend heading. */
  legend?: string;
  /** A muted supporting line beneath the legend. */
  description?: string;
  /** Data-only field rows: each renders a label + <Input>. */
  items?: FieldsetItem[];
  /** Data-only checkbox rows: each renders a <Checkbox> with the label. */
  checkboxes?: { label: string; checked?: boolean }[];
  // Surface (pick one; default is the plain, borderless group).
  bordered?: boolean;
  // Columns (orthogonal): two-column field grid, collapses to one when narrow.
  twoColumn?: boolean;
  // State (orthogonal booleans).
  disabled?: boolean;
  /** Flags a validation problem on the group. */
  error?: boolean;
  className?: string;
}

type Surface = "bordered" | "plain";

// Surface precedence when more than one is passed: first match wins.
function surfaceOf(p: FieldsetProps): Surface {
  if (p.bordered) return "bordered";
  return "plain";
}

const SURFACE: Record<Surface, string> = {
  // Bordered: a card-like section with border, radius, and padding.
  bordered: "rounded-lg border border-border bg-card p-5",
  // Plain: no chrome, just the stacked content.
  plain: "",
};

const LEGEND = "text-base font-semibold text-foreground";
const DESCRIPTION = "mt-1 text-xs text-muted-foreground";
const FIELD_LABEL = "mb-1.5 text-sm font-medium text-foreground";
const FIELD_HELP = "mt-1.5 text-xs text-muted-foreground";
const FIELD_ERROR = "mt-1.5 text-xs text-destructive";

// One labeled field: label + control + optional help/error.
function Field({
  item,
  disabled,
  error,
}: {
  item: FieldsetItem;
  disabled?: boolean;
  error?: boolean;
}) {
  const msg = item.error ?? (error ? "Enter a valid value" : "");
  return (
    <Box className="w-full">
      {item.label ? <Text className={FIELD_LABEL}>{item.label}</Text> : null}
      <Input
        value={item.value}
        placeholder={item.placeholder}
        disabled={disabled}
        error={!!msg}
        block
      />
      {msg ? (
        <Text className={FIELD_ERROR}>{msg}</Text>
      ) : item.help ? (
        <Text className={FIELD_HELP}>{item.help}</Text>
      ) : null}
    </Box>
  );
}

export function Fieldset(props: FieldsetProps) {
  const { children, legend, description, items, checkboxes, twoColumn, disabled, error, className } =
    props;
  const surface = surfaceOf(props);

  const container = cn(
    "w-full max-w-[576px]",
    SURFACE[surface],
    disabled && "opacity-60",
    className,
  );

  const header =
    legend != null || description != null ? (
      <Box className="mb-4">
        {legend != null ? <Text className={LEGEND}>{legend}</Text> : null}
        {description != null ? <Text className={DESCRIPTION}>{description}</Text> : null}
      </Box>
    ) : null;

  // Children win: when composed, render exactly what the caller passed.
  if (children != null) {
    return (
      <Box className={container}>
        {header}
        {children}
      </Box>
    );
  }

  // Checkbox group: a stacked set of labeled checkboxes.
  if (checkboxes != null) {
    return (
      <Box className={container}>
        {header}
        <Box className="gap-2">
          {checkboxes.map((c, i) => (
            <Checkbox key={i} checked={c.checked} disabled={disabled}>
              {c.label}
            </Checkbox>
          ))}
        </Box>
      </Box>
    );
  }

  // Field group: stacked rows, or a two-column wrap that collapses when narrow.
  const rows = items ?? [];
  const group = cn(
    twoColumn ? "flex-row flex-wrap sm:flex-col" : "flex-col",
    "gap-4",
  );

  return (
    <Box className={container}>
      {header}
      <Box className={group}>
        {rows.map((item, i) => (
          <Box key={i} className={twoColumn ? "w-[47%] grow sm:w-full" : "w-full"}>
            <Field item={item} disabled={disabled} error={error} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
