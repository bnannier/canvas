import { useEffect, Fragment } from "react";
import { BackHandler, Modal } from "react-native";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  GlassSurface,
  useTheme,
  type StyleProp,
  type ViewStyle,
} from "../../style/index.js";
import * as s from "./action-sheet.styles.js";
import { type ActionSheetSkin } from "./action-sheet.styles.js";

// Shared ActionSheet shell. The structure (a full-screen Modal whose dimmed scrim
// lays a bottom-anchored stack of action rows against the bottom edge), the
// controlled open state, the select-then-close + scrim/Cancel-dismiss handlers,
// the accessibility wiring, and the hardware-back wiring all live here once. A
// platform file supplies only its skin (the card shape, the row sizing/type, the
// Cancel layout, the press feedback) and calls createActionSheet.
//
// ActionSheet: the iOS HIG modal action menu (a bottom sheet of choices). It poses
// an optional title/message, lists a set of action rows (any of which may be
// destructive or disabled), and offers a Cancel. Selecting an action runs its
// onPress then closes; tapping the scrim or Cancel closes without acting. This is
// the kit's modal-action-list case, distinct from the anchored Dropdown/RowMenu
// (a small contextual menu) and the full-screen Drawer (a takeover panel).
//
// It is built on React Native's Modal, which react-native-web implements on the
// web, so the same sheet renders on iOS, Android, and the web. The card surfaces
// are FUNCTIONAL-LAYER overlays, so they render through GlassSurface (glass when
// the theme's surface mode is glass, a solid `popover` fill otherwise).
//
// Controlled only: drive `open` / `onOpenChange` yourself (an action sheet is
// summoned in response to a user action, so there is no built-in trigger button).
// The scrim, the system back/escape, AND the Android hardware back button all
// request a close.

/** A single action in the sheet. */
export interface ActionSheetAction {
  /** The row label. */
  label: string;
  /** Run when the row is selected (the sheet then closes). */
  onPress: () => void;
  /** Render the label in the destructive red (for an irreversible action). */
  destructive?: boolean;
  /** Dim the row and ignore presses. */
  disabled?: boolean;
}

export interface ActionSheetProps {
  /** Controlled open state. */
  open: boolean;
  /** Fired when the open state changes (scrim tap, Cancel, an action, back/escape). */
  onOpenChange?: (open: boolean) => void;
  /** Optional header title (a short, centered gray heading on iOS/web). */
  title?: string;
  /** Optional header message under the title. */
  message?: string;
  /** The action rows. Each runs its `onPress` then closes the sheet. */
  actions: ActionSheetAction[];
  /** The Cancel row label (default "Cancel"). */
  cancelLabel?: string;
  /**
   * Escape hatch for the bottom-anchored stack (e.g. a safe-area bottom inset:
   * `style={{ paddingBottom: insets.bottom }}`). Composed onto the stack container.
   */
  style?: StyleProp<ViewStyle>;
}

/** Build an ActionSheet component from a platform skin. */
export function createActionSheet(skin: ActionSheetSkin) {
  return function ActionSheet(props: ActionSheetProps) {
    const { open, onOpenChange, title, message, actions, cancelLabel = "Cancel", style } = props;
    const { tokens } = useTheme();

    const close = () => onOpenChange?.(false);

    // Selecting an action runs its handler, then closes the sheet.
    const selectAction = (action: ActionSheetAction) => {
      if (action.disabled) return;
      action.onPress();
      close();
    };

    // Hardware back closes the open sheet. BackHandler fires on Android only (the
    // Modal's own onRequestClose also covers the system back/escape); the
    // subscription is a documented no-op on iOS and web, so no Platform branch is
    // needed. The handler returns true while open to consume the event, false when
    // closed so the default back behavior runs.
    useEffect(() => {
      if (!open) return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        close();
        return true;
      });
      return () => sub.remove();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;
    const hasHeader = title != null || message != null;

    // A press feedback wrapper shared by the action and Cancel rows: iOS/web dim on
    // press, Android shows a ripple (the skin nulls the unused one per platform).
    const pressFeedback = (pressed: boolean): ViewStyle | null =>
      skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null;

    // The header (optional title/message) plus the action rows, drawn into the
    // actions card. On iOS/web a hairline divider separates the header from the
    // rows and one row from the next; on Android the rows sit flush.
    const headerNode = hasHeader ? (
      <Fragment>
        <View style={skin.header}>
          {title != null ? <Text style={skin.headerTitle(tokens)}>{title}</Text> : null}
          {message != null ? <Text style={skin.headerMessage(tokens)}>{message}</Text> : null}
        </View>
        {skin.divider ? <View style={skin.divider(tokens)} /> : null}
      </Fragment>
    ) : null;

    const actionRows = actions.map((action, i) => (
      <Fragment key={i}>
        {skin.divider && i > 0 ? <View style={skin.divider(tokens)} /> : null}
        <Pressable
          onPress={() => selectAction(action)}
          disabled={action.disabled}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          accessibilityState={{ disabled: !!action.disabled }}
          // A destructive row carries a hint so VoiceOver/TalkBack convey the
          // weight that the red color signals visually.
          accessibilityHint={action.destructive ? "Destructive action" : undefined}
          android_ripple={ripple}
          style={({ pressed }) => [skin.row, pressFeedback(pressed)]}
        >
          <Text style={skin.rowLabel(tokens, !!action.destructive, !!action.disabled)}>{action.label}</Text>
        </Pressable>
      </Fragment>
    ));

    // The Cancel affordance. On iOS/web it is a SEPARATE rounded card below the
    // actions card; on Android it folds into the same sheet as the last list row.
    const cancelRow = (
      <Pressable
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
        android_ripple={ripple}
        style={({ pressed }) => [skin.cancelRow, pressFeedback(pressed)]}
      >
        <Text style={skin.cancelLabel(tokens)}>{cancelLabel}</Text>
      </Pressable>
    );

    return (
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={close}
        // Tell assistive tech the content behind this overlay is inert while the
        // sheet is open (iOS VoiceOver honors this; a no-op elsewhere).
        accessibilityViewIsModal={true}
      >
        <Pressable style={s.scrim(skin.scrimOpacity)} onPress={close} accessibilityLabel={cancelLabel}>
          {/* A no-op press inside the stack keeps taps from falling through to the scrim. */}
          <Pressable style={[skin.stack, style]} onPress={() => {}}>
            <GlassSurface style={skin.actionsCard(tokens)}>
              {/* The handle (Android) sits above the header inside the sheet. */}
              {skin.handle ? <View style={skin.handle(tokens)} /> : null}
              {headerNode}
              {/* The rows scroll if they overflow the viewport (a long action list). */}
              <ScrollView bounces={false} style={{ maxHeight: 360 }}>
                {actionRows}
                {/* Android: Cancel is the last row in the same sheet. */}
                {skin.cancelLayout === "lastRow" ? (
                  <Fragment>
                    {skin.divider ? <View style={skin.divider(tokens)} /> : null}
                    {cancelRow}
                  </Fragment>
                ) : null}
              </ScrollView>
            </GlassSurface>
            {/* iOS/web: Cancel is a separate rounded card below the actions card. */}
            {skin.cancelLayout === "separateCard" && skin.cancelCard ? (
              <GlassSurface style={skin.cancelCard(tokens)}>{cancelRow}</GlassSurface>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    );
  };
}
