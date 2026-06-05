import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Button } from "./button.js";
import { Input } from "./input.js";

// Dialog: a modal panel centered over a dimmed backdrop, with a title, an
// optional description, and a right-aligned action row (a primary confirm plus
// an outline cancel). In the docs preview the overlay is rendered INLINE: a
// contained dim backdrop Box wraps the centered card, so it reads as a modal
// within the preview area rather than a full-screen portal that would cover it.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Axes:
//
// - Confirm intent: `destructive` renders the confirm action as a destructive
//   Button (for an irreversible action); omit for the default primary confirm.
// - Width (pick one): from narrowest to widest, `xs`, `small`, `medium`,
//   `large`, `wide`; omit for the default panel width (one step wider than
//   `medium`). First-match precedence in that order, so a narrower prop wins if
//   more than one is set.

export interface DialogProps {
  children?: ReactNode;
  // Content (strings, for the children-less / data-driven case).
  title?: string;
  description?: string;
  // Body: render a short form (Amount + Reason fields) inside the panel for
  // the data-driven case.
  withBody?: boolean;
  // Action labels.
  confirmLabel?: string;
  cancelLabel?: string;
  // Visibility: render the open dialog when true (default).
  open?: boolean;
  // Confirm intent (default is a primary confirm).
  destructive?: boolean;
  // Width (pick one; default is the standard panel width). First-match
  // precedence: xs, small, medium, large, wide.
  xs?: boolean;
  small?: boolean;
  medium?: boolean;
  large?: boolean;
  wide?: boolean;
  // Action handlers.
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

type Size = "xs" | "small" | "medium" | "default" | "large" | "wide";

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: DialogProps): Size {
  if (p.xs) return "xs";
  if (p.small) return "small";
  if (p.medium) return "medium";
  if (p.large) return "large";
  if (p.wide) return "wide";
  return "default";
}

// The dialog card's max width per size, narrowest to widest. The default sits
// one step wider than `medium`, roomy enough for a short form; `xs`/`small`
// tighten the panel for a terse message, `large`/`wide` open it up for a longer
// form. Pixel widths mirror Tailwind's max-w-xs..2xl scale.
const PANEL_SIZE: Record<Size, string> = {
  xs: "max-w-[320px]",
  small: "max-w-[384px]",
  medium: "max-w-[448px]",
  default: "max-w-[512px]",
  large: "max-w-[576px]",
  wide: "max-w-[672px]",
};

export function Dialog(props: DialogProps) {
  const {
    children,
    title,
    description,
    withBody,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    open = true,
    destructive,
    onConfirm,
    onCancel,
    className,
  } = props;

  if (!open) return null;

  const size = sizeOf(props);

  // Contained dim backdrop: a centered, rounded scrim with presence in the
  // preview (explicit minHeight) so the panel reads as a modal within the area.
  return (
    <Box
      className="items-center justify-center rounded-lg bg-black/50 p-8"
      style={{ minHeight: 220 }}
    >
      <Box
        className={cn(
          "w-full rounded-lg border border-border bg-popover p-6 shadow-xl",
          PANEL_SIZE[size],
          className,
        )}
      >
        {children != null ? (
          children
        ) : (
          <>
            {title != null ? (
              <Text className="text-base font-semibold text-popover-foreground">{title}</Text>
            ) : null}
            {description != null ? (
              <Text className="text-sm text-muted-foreground mt-2">{description}</Text>
            ) : null}
            {withBody ? (
              <Box className="mt-5">
                <Text className="text-sm font-medium text-foreground mb-1.5">Amount</Text>
                <Box className="flex-row items-center">
                  <Text className="text-sm text-muted-foreground mr-2">$</Text>
                  <Input value="90.00" className="flex-1" />
                </Box>
                <Text className="text-sm font-medium text-foreground mb-1.5 mt-4">Reason</Text>
                <Input placeholder="Duplicate charge" />
              </Box>
            ) : null}
            <Box className="flex-row justify-end gap-2 mt-6">
              <Button outline small onPress={onCancel}>
                {cancelLabel}
              </Button>
              {destructive ? (
                <Button destructive small onPress={onConfirm}>
                  {confirmLabel}
                </Button>
              ) : (
                <Button primary small onPress={onConfirm}>
                  {confirmLabel}
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
