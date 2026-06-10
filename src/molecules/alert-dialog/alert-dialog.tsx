import { useState } from "react";
import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../../atoms/button/button.js";
import { Input } from "../../atoms/input/input.js";
import * as s from "./alert-dialog.styles.js";
import { type Width } from "./alert-dialog.styles.js";

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
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Width precedence when more than one is passed: first match wins.
function widthOf(p: AlertDialogProps): Width {
  if (p.narrow) return "narrow";
  if (p.small) return "small";
  if (p.large) return "large";
  return "medium";
}

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
    style,
  } = props;

  const { tokens } = useTheme();

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
    <View style={s.root}>
      {trigger != null ? (
        <Button outline small onPress={() => setOpen(true)}>
          {trigger}
        </Button>
      ) : null}
      {open ? (
        <View style={[s.backdrop, trigger != null ? s.triggerGap : null, { minHeight: 200 }]}>
          <View style={[s.panelBase, s.panelSurface(tokens), s.panelWidth[width], style]}>
            {title != null ? <Text style={s.title(tokens)}>{title}</Text> : null}
            {description != null ? <Text style={s.description(tokens)}>{description}</Text> : null}
            {withInput ? (
              <View style={s.inputBlock}>
                <Text style={s.inputLabel(tokens)}>Type DELETE to confirm</Text>
                <Input placeholder="DELETE" />
              </View>
            ) : null}
            <View style={s.actions}>
              <Button
                outline
                small
                onPress={() => {
                  onCancel?.();
                  setOpen(false);
                }}
              >
                {cancelLabel}
              </Button>
              {destructive ? (
                <Button
                  destructive
                  small
                  onPress={() => {
                    onConfirm?.();
                    setOpen(false);
                  }}
                >
                  {confirmLabel}
                </Button>
              ) : (
                <Button
                  primary
                  small
                  onPress={() => {
                    onConfirm?.();
                    setOpen(false);
                  }}
                >
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
