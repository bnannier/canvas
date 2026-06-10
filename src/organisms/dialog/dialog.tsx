import { useState, type ReactNode } from "react";
import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../../atoms/button/button.js";
import { Input } from "../../atoms/input/input.js";
import * as s from "./dialog.styles.js";
import { type Size } from "./dialog.styles.js";

// Dialog: a modal panel centered over a dimmed backdrop, with a title, an
// optional description, and a right-aligned action row (a primary confirm plus
// an outline cancel). In the docs preview the overlay is rendered INLINE: a
// contained dim backdrop View wraps the centered card, so it reads as a modal
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
  /** Escape hatch for layout/positioning composition on the panel (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: DialogProps): Size {
  if (p.xs) return "xs";
  if (p.small) return "small";
  if (p.medium) return "medium";
  if (p.large) return "large";
  if (p.wide) return "wide";
  return "default";
}

export function Dialog(props: DialogProps) {
  const {
    children,
    title,
    description,
    withBody,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    trigger,
    open: openProp,
    onOpenChange,
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

  const size = sizeOf(props);

  // Optional trigger button plus the modal. The modal is a contained dim
  // backdrop: a centered, rounded scrim with presence in the preview (explicit
  // minHeight) so the panel reads as a modal within the area.
  return (
    <View style={s.root}>
      {trigger != null ? (
        <Button outline small onPress={() => setOpen(true)}>
          {trigger}
        </Button>
      ) : null}
      {open ? (
        <View style={[trigger != null ? s.backdropTriggerGap : null, s.backdrop]}>
          <View style={[s.panelBase, s.panelSurface(tokens), s.panelWidth(size), style]}>
            {children != null ? (
              children
            ) : (
              <>
                {title != null ? <Text style={s.title(tokens)}>{title}</Text> : null}
                {description != null ? <Text style={s.description(tokens)}>{description}</Text> : null}
                {withBody ? (
                  <View style={s.body}>
                    <Text style={s.amountLabel(tokens)}>Amount</Text>
                    <View style={s.amountRow}>
                      <Text style={s.currency(tokens)}>$</Text>
                      <Input value="90.00" style={s.amountInput} />
                    </View>
                    <Text style={s.reasonLabel(tokens)}>Reason</Text>
                    <Input placeholder="Duplicate charge" />
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
              </>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}
