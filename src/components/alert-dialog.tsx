import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Button } from "./button.js";

// AlertDialog: a terse yes/no confirmation modal, the compact sibling of Dialog.
// It poses a question (title), an optional short description, and a right-aligned
// action row of a Cancel button plus a single confirm. Reserve it for decisions
// that must block the rest of the app, especially irreversible ones (pass
// `destructive` to render the confirm as a red, destructive Button).
//
// In the docs preview the overlay is rendered INLINE: a contained dim backdrop
// Box wraps the centered card, so it reads as a modal within the preview area
// rather than a full-screen portal that would cover it.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Axis:
//
// - Confirm intent: `destructive` renders the confirm action as a destructive
//   Button (for an irreversible action); omit for the default primary confirm.

export interface AlertDialogProps {
  // Content (strings).
  title?: string;
  description?: string;
  // Action labels.
  confirmLabel?: string;
  cancelLabel?: string;
  // Visibility: render the open dialog when true (default).
  open?: boolean;
  // Confirm intent (default is a primary confirm).
  destructive?: boolean;
  // Action handlers.
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function AlertDialog(props: AlertDialogProps) {
  const {
    title,
    description,
    confirmLabel = "Continue",
    cancelLabel = "Cancel",
    open = true,
    destructive,
    onConfirm,
    onCancel,
    className,
  } = props;

  if (!open) return null;

  // Contained dim backdrop: a centered, rounded scrim with presence in the
  // preview (explicit minHeight) so the card reads as a modal within the area.
  return (
    <Box
      className="items-center justify-center rounded-lg bg-black/50 p-8"
      style={{ minHeight: 200 }}
    >
      <Box
        className={cn(
          "w-full max-w-[400px] rounded-lg border border-border bg-popover p-6 shadow-xl",
          className,
        )}
      >
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
      </Box>
    </Box>
  );
}
