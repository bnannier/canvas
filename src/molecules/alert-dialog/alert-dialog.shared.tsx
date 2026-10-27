import { EscapeLayerProvider, useEscapeLayer } from "../../style/escape-layer.js";
import { useHardwareBack } from "../../style/use-hardware-back.js";
import { type ReactNode, useId, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { GlassSurface, Portal, Pressable, Text, View, type StyleProp, type ViewStyle, useDialogFocus, useTheme } from "../../style/index.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Input as WebInput } from "../../atoms/input/input.js";
import { Emblem } from "../../atoms/emblem/emblem.js";
import { Icon } from "../../atoms/icon/icon.js";
import * as s from "./alert-dialog.styles.js";
import { useHeldScrim } from "../../style/glass-surface/scrim-frost.js";
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
  // Body: render a confirmation field that gates confirm. The user must type the
  // `confirmText` token (default "DELETE") for the confirm action to enable; until
  // it matches exactly, confirm is disabled and `handleConfirm` is a no-op. This is
  // a real safety gate, not a decorative field.
  withInput?: boolean;
  /** The token the confirmation field must match to enable confirm (default
   *  "DELETE"). Only used when `withInput` is set; drives the label, placeholder,
   *  and the gate. */
  confirmText?: string;
  // Confirm intent (default is a primary confirm).
  destructive?: boolean;
  // Action handlers.
  onConfirm?: () => void;
  onCancel?: () => void;
  /**
   * Presents the confirm OVER the page instead of inline where it is mounted.
   *
   * The default is a contained overlay, which the docs catalogue needs to show
   * one inside an example stage. An application asking to confirm a destructive
   * action needs the opposite: inline, the scrim appears wherever the component
   * happens to sit, the page behind stays scrollable and clickable, and the
   * dialog still claims `aria-modal`. Teleports into the nearest
   * `OverlayProvider`; with none in the tree it renders in place.
   */
  overlay?: boolean;
  /**
   * Show the open dialog as a non-modal specimen in the page, for a catalogue or a
   * showcase: it keeps its look, its alertdialog role and its labelling, but does not
   * take focus when it opens, trap Tab, return focus, claim `aria-modal`, or cancel on
   * Escape or native back. Ignored with `trigger`, which always opens a live modal.
   */
  embedded?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// Width precedence when more than one is passed: first match wins.
export function widthOf(p: AlertDialogProps): Width {
  if (p.narrow) return "narrow";
  if (p.small) return "small";
  if (p.large) return "large";
  return "medium";
}

/**
 * The components an AlertDialog draws with that look different per platform: the
 * action Buttons and the confirmation field's Input (`withInput`). Each platform's
 * thin `.tsx`/`.ios`/`.android` file passes the builds it resolves for that platform,
 * so the alert matches its platform on every build path. This matters for the WEB docs
 * 3-up preview: a bare barrel import always resolves the WEB builds in a browser
 * bundler, which would paint web buttons and a boxed field inside the iOS and Android
 * rows. On a real device Metro resolves the right builds by extension regardless, so
 * the defaults (the web bases) are correct there too.
 */
export interface AlertDialogParts {
  Button?: typeof WebButton;
  Input?: typeof WebInput;
}
// Teleports its children into the nearest OverlayProvider when presenting as an
// overlay, and renders them in place otherwise, so the contained default is
// unchanged.
function Present({ overlay, children }: { overlay: boolean; children: ReactNode }) {
  return overlay ? <Portal>{children}</Portal> : <>{children}</>;
}

/** Build an AlertDialog component from a platform skin and its platform parts. */
export function createAlertDialog(skin: AlertDialogSkin, parts: AlertDialogParts = {}) {
  const Button = parts.Button ?? WebButton;
  const Input = parts.Input ?? WebInput;
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
      confirmText = "DELETE",
      destructive,
      onConfirm,
      onCancel,
      testID,
      style,
    } = props;
    const overlay = props.overlay === true;
    // An embedded dialog is a specimen, not a live modal; a trigger always opens a live one.
    const modal = !(props.embedded === true && trigger == null);

    const { tokens } = useTheme();

    // Uncontrolled by default: the trigger opens the dialog and an action closes
    // it; a controlled `open` prop overrides this.
    const [internalOpen, setInternalOpen] = useState(false);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // Confirmation-field text (only meaningful when `withInput` is set). The
    // confirm action is gated on an exact match with `confirmText`, so the field
    // is a real safety check rather than decorative.
    const [confirmInput, setConfirmInput] = useState("");
    const confirmGated = !!withInput && confirmInput !== confirmText;

    // Stable ids so web screen readers can wire the dialog's accessible name and
    // description (aria-labelledby/aria-describedby) and tie the confirmation
    // label to its field. useId yields one collision-free base per instance.
    const baseId = useId();
    const titleId = `${baseId}-title`;
    const descriptionId = `${baseId}-description`;
    const inputLabelId = `${baseId}-input-label`;

    const width = widthOf(props);

    const handleConfirm = () => {
      // The confirmation field, when present, must match before confirm fires.
      if (confirmGated) return;
      onConfirm?.();
      setConfirmInput("");
      setOpen(false);
    };
    const handleCancel = () => {
      onCancel?.();
      setConfirmInput("");
      setOpen(false);
    };

    // Web focus management for the modal: move focus into the panel on open, trap
    // Tab within it, and return focus to the trigger on close. This focus helper
    // does nothing natively or under SSR. The shared escape scope routes browser
    // Escape and native accessibility escape through the same Cancel policy.
    // An embedded specimen takes none of this: focus, Tab, Escape and Back stay the page's.
    const panelRef = useDialogFocus(open && modal);
    const escapeScope = useEscapeLayer(open && modal, handleCancel);
    // Inline catalogue panels do not own page navigation. A presented overlay
    // consumes native Back through the same cancellation policy as Escape.
    useHardwareBack(open && overlay && modal, escapeScope.onRequestClose);

    // The action row. iOS renders the UIAlertController's two action cells drawn by
    // the skin; the web and Android render the hand-off's row of the shell's Buttons
    // (a secondary Cancel + a primary/destructive Confirm).
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;
    const actionRow =
      skin.actionLayout === "capsule" ? (
        <View style={[skin.capsuleRow!, skin.capsuleRowColor?.(tokens)]}>
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
            disabled={confirmGated}
            accessibilityRole="button"
            accessibilityState={{ disabled: confirmGated }}
            aria-disabled={confirmGated || undefined}
            android_ripple={ripple}
            style={({ pressed }) => [
              skin.capsuleCell!,
              skin.confirmFill!(tokens, !!destructive),
              confirmGated ? { opacity: 0.4 } : null,
              !confirmGated && skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
            ]}
          >
            <Text style={skin.confirmLabelStyle!(tokens, !!destructive)}>{confirmLabel}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={skin.actions}>
          <Button {...skin.cancelButton} small={skin.buttonSmall} block={skin.blockButtons} onPress={handleCancel}>
            {cancelLabel}
          </Button>
          {destructive ? (
            <Button destructive small={skin.buttonSmall} block={skin.blockButtons} disabled={confirmGated} onPress={handleConfirm}>
              {confirmLabel}
            </Button>
          ) : (
            <Button primary small={skin.buttonSmall} block={skin.blockButtons} disabled={confirmGated} onPress={handleConfirm}>
              {confirmLabel}
            </Button>
          )}
        </View>
      );

    // Optional trigger button plus the modal. The modal is a contained dim
    // backdrop: a centered, rounded scrim with presence in the preview (explicit
    // minHeight) so the card reads as a modal within the area.
    const backdrop = [
      skin.backdrop(tokens),
      trigger != null && !overlay ? s.triggerGap : null,
      overlay ? s.backdropOverlay : { minHeight: 200, minWidth: 0 },
    ];
    // Under glass on the web the dim moves onto the scrim's blur layer (useHeldScrim).
    const scrim = useHeldScrim(backdrop);
    return (
      <View testID={testID} style={s.root}>
        {trigger != null ? (
          <View style={s.triggerWrap}>
            <Button outline small onPress={() => setOpen(true)}>
              {trigger}
            </Button>
          </View>
        ) : null}
        {open ? (
          <Present overlay={overlay}>
          <EscapeLayerProvider scope={escapeScope}>
          <View
            // The overlay carries the dialog semantics so assistive tech announces
            // it. `role="alertdialog"` + `aria-modal` make web screen readers treat
            // it as a modal alert dialog and the page behind it as inert; the title
            // (and description, when present) are wired as the accessible name and
            // description via aria-labelledby/aria-describedby. `accessibilityViewIsModal`
            // keeps iOS VoiceOver honoring the inert backdrop. On the web the panel
            // below also traps Tab focus and returns focus to the trigger on close
            // (see useDialogFocus).
            role="alertdialog"
            accessibilityViewIsModal={modal}
            onAccessibilityEscape={modal ? escapeScope.onAccessibilityEscape : undefined}
            aria-modal={modal ? true : undefined}
            aria-labelledby={title != null ? titleId : undefined}
            aria-describedby={description != null ? descriptionId : undefined}
            style={scrim.style}
          >
            {/* Under glass on the web the scrim also blurs what it dims (GS-6): the dim and
                the blur are one layer of their own beneath the card (useHeldScrim), so the
                blur never samples the dim, and this node, which holds the card, wears
                neither (a blur here would cut the card's frost off from the page). */}
            {scrim.layer}
            <View style={[s.cardBase, s.panelWidth[width], skin.panelWidth, style]}>
            {/* An alert dialog takes the DENSE layer of the glass model: the same
                material as a Dialog, under the model's densest tint. It is the prompt
                that stops the user to confirm a destructive action, and under the
                functional layer's sheer tint the page it interrupts read straight
                through the very text asking the question; the dense tint keeps that
                text legible while the card still takes the material. In solid mode
                GlassSurface is the plain box wearing the skin's own `popover` fill.
                The dimming scrim behind it is unaffected. */}
            <GlassSurface layer="dense" style={[s.cardBase, skin.card(tokens)]}>
              {/* The panel content region: a focusable (tabIndex -1) container the
                  web focus manager pulls focus into and traps Tab within, wrapping
                  the content in a KeyboardAvoidingView so the iOS keyboard never
                  covers the confirmation field (padding behavior on iOS; a plain
                  passthrough View on web/Android). Neither wrapper adds layout. */}
              <View ref={panelRef} tabIndex={modal ? -1 : undefined}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                  <View style={skin.content}>
                  {skin.emblem != null ? (
                    // The hand-off's tone tile: a trash glyph on the destructive wash, else
                    // info on the accent's.
                    <View style={skin.emblem}>
                      {destructive ? <Emblem destructive><Icon trash2 decorative /></Emblem> : <Emblem primary><Icon info decorative /></Emblem>}
                    </View>
                  ) : null}
                  {title != null ? (
                    <Text nativeID={titleId} role="heading" style={skin.title(tokens)}>
                      {title}
                    </Text>
                  ) : null}
                  {description != null ? (
                    <Text nativeID={descriptionId} style={skin.description(tokens)}>
                      {description}
                    </Text>
                  ) : null}
                  {withInput ? (
                    // The confirmation field is wired to its visible label: the label
                    // Text carries a stable id and the group is associated to it via
                    // aria-labelledby (role="group" so web screen readers name the
                    // field by the visible label, independent of the placeholder).
                    <View
                      style={skin.inputBlock}
                      role="group"
                      aria-labelledby={inputLabelId}
                    >
                      <Text nativeID={inputLabelId} style={skin.inputLabel(tokens)}>
                        Type {confirmText} to confirm
                      </Text>
                      <Input
 value={confirmInput}
 onChangeText={setConfirmInput}
 placeholder={confirmText}
 accessibilityLabel={`Type ${confirmText} to confirm`}
 aria-labelledby={inputLabelId}
/>
                    </View>
                  ) : null}
                  </View>
                  {actionRow}
                </KeyboardAvoidingView>
              </View>
            </GlassSurface>
            </View>
          </View>
          </EscapeLayerProvider>
          </Present>
        ) : null}
      </View>
    );
  };
}
