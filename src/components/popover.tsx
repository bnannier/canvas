import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Button } from "./button.js";

// Popover: a trigger paired with a floating card of rich content (a heading,
// supporting text, and an optional action). The card is an overlay surface;
// in real use it floats above the page anchored to the trigger. Here it is
// rendered inline, directly below the trigger, so the open state is visible
// without a portal or Modal.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). The placement axis is
// presentational only in this inline rendering; it does not move the card.
//
// Axes:
//
// - Placement (pick one; default is `bottom`): `top` > `bottom`. Presentational
//   only here, it documents the intended anchor side.
//
// Content props (the children-less / data-driven case):
//
// - `trigger`: label for the trigger Button (rendered as <Button outline small>).
// - `title`: the popover heading.
// - `description`: the supporting line beneath the title.
// - `actionLabel`: when set, renders a <Button primary small> action row.
//
// State:
//
// - `open` (default true): when true, the floating card is shown below the
//   trigger; when false, only the trigger renders.

export interface PopoverProps {
  /** Label for the trigger button. */
  trigger?: string;
  /** Heading shown at the top of the floating card. */
  title?: string;
  /** Supporting line beneath the title. */
  description?: string;
  /** When set, renders a primary action button at the bottom of the card. */
  actionLabel?: string;
  // Placement (pick one; default is `bottom`). Presentational only here.
  top?: boolean;
  bottom?: boolean;
  /** Whether the floating card is shown. Defaults to open. */
  open?: boolean;
  className?: string;
}

type Placement = "top" | "bottom";

// Placement precedence when more than one is passed: first match wins.
function placementOf(p: PopoverProps): Placement {
  if (p.top) return "top";
  return "bottom";
}

export function Popover(props: PopoverProps) {
  const { trigger, title, description, actionLabel, className } = props;
  const open = props.open ?? true;
  // Resolve the placement axis (documented, presentational in this rendering).
  placementOf(props);

  const card = cn(
    "mt-2 w-[260px] rounded-lg border border-border bg-popover p-4 shadow-lg",
    className,
  );

  return (
    <Box>
      <Box className="self-start">
        <Button outline small>
          {trigger ?? "Open popover"}
        </Button>
      </Box>
      {open ? (
        <Box className={card}>
          {title != null ? (
            <Text className="text-sm font-semibold text-popover-foreground">{title}</Text>
          ) : null}
          {description != null ? (
            <Text className="mt-1 text-sm text-muted-foreground">{description}</Text>
          ) : null}
          {actionLabel != null ? (
            <Box className="mt-3 flex-row justify-end">
              <Button primary small>
                {actionLabel}
              </Button>
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}
