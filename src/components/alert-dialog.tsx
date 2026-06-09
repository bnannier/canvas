import { useState } from "react";
import { cn } from "../cn.js";
import { View, Text } from "../engine/index.js";
import { Button } from "./button.js";
import { Input } from "./input.js";

// AlertDialog: a terse yes/no confirmation modal, the compact sibling of Dialog.
// It poses a question (title), an optional short description, and a right-aligned
// action row of a Cancel button plus a single confirm. Reserve it for decisions
// that must block the rest of the app, especially irreversible ones (pass
// `destructive` to render the confirm as a red, destructive Button).
//
// In the docs preview the overlay is rendered INLINE: a contained dim backdrop
// View wraps the centered card, so it reads as a modal within the preview area
// rather than a full-screen portal that would cover it.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Axes:
//
// - Width: `narrow` < `small` < (default medium) < `large`, the panel max-width.
//   Pass at most one; first match wins in that order (narrow, small, large).
// - Confirm intent: `destructive` renders the confirm action as a destructive
//   Button (for an irreversible action); omit for the default primary confirm.

export interface AlertDialogProps {
  // Content (strings).
  title?: string;
  description?: string;
  // Trigger button label. When set, the dialog renders the button and opens
  // itself on press (uncontrolled). Omit when you drive `open` yourself.
  trigger?: string;
  // Action labels.
  confirmLabel?: string;
  cancelLabel?: string;
  // Controlled open state. Omit for uncontrolled (the trigger opens it).
  open?: boolean;
  // Fired when the open state changes (trigger press, confirm, cancel).
  onOpenChange?: (open: boolean) => void;
  // Width (pick one; default is the medium panel).
  narrow?: boolean;
  small?: boolean;
  large?: boolean;
  // Body: render a confirmation field ("Type DELETE to confirm") in the panel.
  withInput?: boolean;
  // Confirm intent (default is a primary confirm).
  destructive?: boolean;
  // Action handlers.
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

type Width = "narrow" | "small" | "medium" | "large";

// Width precedence when more than one is passed: first match wins.
function widthOf(p: AlertDialogProps): Width {
  if (p.narrow) return "narrow";
  if (p.small) return "small";
  if (p.large) return "large";
  return "medium";
}

// The engine has no named max-w scale, so widths are explicit pixels
// (mirroring Tailwind's max-w-xs..lg: 320 / 384 / 448 / 512).
const PANEL_WIDTH: Record<Width, string> = {
  narrow: "max-w-[320px]",
  small: "max-w-[384px]",
  medium: "max-w-[448px]",
  large: "max-w-[512px]",
};

export function AlertDialog(props: AlertDialogProps) {
  const {
    title,
    description,
    confirmLabel = "Continue",
    cancelLabel = "Cancel",
    trigger,
    open: openProp,
    onOpenChange,
    withInput,
    destructive,
    onConfirm,
    onCancel,
    className,
  } = props;

  // Uncontrolled by default: the trigger opens the dialog and an action closes
  // it; a controlled `open` prop overrides this.
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const width = widthOf(props);

  // Optional trigger button plus the modal. The modal is a contained dim
  // backdrop: a centered, rounded scrim with presence in the preview (explicit
  // minHeight) so the card reads as a modal within the area.
  return (
    <View className="self-start">
      {trigger != null ? (
        <Button outline small onPress={() => setOpen(true)}>
          {trigger}
        </Button>
      ) : null}
      {open ? (
        <View
          className={cn(trigger != null && "mt-3", "items-center justify-center rounded-lg bg-black/50 p-8")}
          style={{ minHeight: 200 }}
        >
          <View
            className={cn(
              "w-full rounded-lg border border-border bg-popover p-6 shadow-xl",
              PANEL_WIDTH[width],
              className,
            )}
          >
            {title != null ? (
              <Text className="text-base font-semibold text-popover-foreground">{title}</Text>
            ) : null}
            {description != null ? (
              <Text className="text-sm text-muted-foreground mt-2">{description}</Text>
            ) : null}
            {withInput ? (
              <View className="mt-4">
                <Text className="text-sm font-medium text-foreground mb-1.5">
                  Type DELETE to confirm
                </Text>
                <Input placeholder="DELETE" />
              </View>
            ) : null}
            <View className="flex-row justify-end gap-2 mt-6">
              <Button outline small onPress={() => { onCancel?.(); setOpen(false); }}>
                {cancelLabel}
              </Button>
              {destructive ? (
                <Button destructive small onPress={() => { onConfirm?.(); setOpen(false); }}>
                  {confirmLabel}
                </Button>
              ) : (
                <Button primary small onPress={() => { onConfirm?.(); setOpen(false); }}>
                  {confirmLabel}
                </Button>
              )}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
