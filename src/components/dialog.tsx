import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Button } from "./button.js";

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
// - Size (pick one): `small` tightens the panel to a compact width; omit for
//   the default panel width.

export interface DialogProps {
  children?: ReactNode;
  // Content (strings, for the children-less / data-driven case).
  title?: string;
  description?: string;
  // Action labels.
  confirmLabel?: string;
  cancelLabel?: string;
  // Visibility: render the open dialog when true (default).
  open?: boolean;
  // Confirm intent (default is a primary confirm).
  destructive?: boolean;
  // Size (pick one; default is the standard panel width).
  small?: boolean;
  // Action handlers.
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

type Size = "small" | "default";

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: DialogProps): Size {
  if (p.small) return "small";
  return "default";
}

// The dialog card's max width per size. `small` tightens the panel for a terse
// message; the default is roomy enough for a short form.
const PANEL_SIZE: Record<Size, string> = {
  small: "max-w-[320px]",
  default: "max-w-[420px]",
};

export function Dialog(props: DialogProps) {
  const {
    children,
    title,
    description,
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
