import { useState } from "react";
import { View, Text, Pressable, useTheme, GlassSurface, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../../atoms/button/button.js";
import { Input } from "../../atoms/input/input.js";
import * as s from "./alert-dialog.styles.js";
import { type Width, type AlertDialogSkin } from "./alert-dialog.styles.js";

// Shared AlertDialog shell. The structure (optional trigger + dim backdrop +
// centered card + title/description + optional confirmation field + action row),
// the uncontrolled/controlled open state, the width/destructive precedence, and
// the confirm/cancel handlers live here once; a platform file supplies only its
// skin (card shape, type, action layout, press feedback) and calls
// createAlertDialog.
//
// AlertDialog: a terse yes/no confirmation modal, the compact sibling of Dialog.
// It poses a question (title), an optional short description, and an action row of
// a Cancel plus a single confirm. Reserve it for decisions that must block the
// rest of the app, especially irreversible ones (pass `destructive` to render the
// confirm as a red, destructive action).
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
//   action (for an irreversible action); omit for the default primary confirm.

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

/** Build an AlertDialog component from a platform skin. */
export function createAlertDialog(skin: AlertDialogSkin) {
  return function AlertDialog(props: AlertDialogProps) {
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

    const handleConfirm = () => {
      onConfirm?.();
      setOpen(false);
    };
    const handleCancel = () => {
      onCancel?.();
      setOpen(false);
    };

    // The action row. iOS renders two capsule buttons side by side (no divider)
    // drawn by the skin; web/Android render a right-aligned row of the shell's
    // Buttons.
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;
    const actionRow =
      skin.actionLayout === "capsule" ? (
        <View style={skin.capsuleRow!}>
          <Pressable
            onPress={handleCancel}
            accessibilityRole="button"
            android_ripple={ripple}
            style={({ pressed }) => [
              skin.capsuleCell!,
              skin.cancelFill!(tokens),
              skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
            ]}
          >
            <Text style={skin.cancelLabelStyle!(tokens)}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            onPress={handleConfirm}
            accessibilityRole="button"
            android_ripple={ripple}
            style={({ pressed }) => [
              skin.capsuleCell!,
              skin.confirmFill!(tokens, !!destructive),
              skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
            ]}
          >
            <Text style={skin.confirmLabelStyle!(tokens, !!destructive)}>{confirmLabel}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={skin.actions}>
          <Button {...skin.cancelButton} small={skin.buttonSmall} onPress={handleCancel}>
            {cancelLabel}
          </Button>
          {destructive ? (
            <Button destructive small={skin.buttonSmall} onPress={handleConfirm}>
              {confirmLabel}
            </Button>
          ) : (
            <Button primary small={skin.buttonSmall} onPress={handleConfirm}>
              {confirmLabel}
            </Button>
          )}
        </View>
      );

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
          <View style={[skin.backdrop, trigger != null ? s.triggerGap : null, { minHeight: 200 }]}>
            <GlassSurface style={[s.cardBase, skin.card(tokens), s.panelWidth[width], style]}>
              {title != null ? <Text style={skin.title(tokens)}>{title}</Text> : null}
              {description != null ? <Text style={skin.description(tokens)}>{description}</Text> : null}
              {withInput ? (
                <View style={skin.inputBlock}>
                  <Text style={skin.inputLabel(tokens)}>Type DELETE to confirm</Text>
                  <Input placeholder="DELETE" />
                </View>
              ) : null}
              {actionRow}
            </GlassSurface>
          </View>
        ) : null}
      </View>
    );
  };
}
