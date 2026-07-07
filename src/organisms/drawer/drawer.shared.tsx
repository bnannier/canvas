import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BackHandler, Modal } from "react-native";
import { View, Pressable, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../../atoms/button/button.js";
import * as s from "./drawer.styles.js";
import { type Edge, type DrawerSkin } from "./drawer.styles.js";

// Shared Drawer shell. The structure (a full-screen Modal whose scrim lays an
// opaque panel against an edge), the public boolean-prop API, the edge
// precedence, the controlled/uncontrolled open state, the trigger/scrim/back
// handlers, and the hardware-back wiring all live here once. A platform file
// supplies only its skin (the scrim dimming and the per-edge panel shape) and
// calls createDrawer.
//
// Drawer: a full-screen overlay that slides a panel in from an edge over the
// whole app. This is the kit's full-screen portal case (a nav drawer, a mobile
// menu, an action sheet), distinct from the inline Overlay/Dialog used for docs
// previews. It is built on React Native's Modal, which react-native-web
// implements on the web, so the same drawer renders on iOS, Android, and the
// web. The panel is an opaque card surface (not glass): it sits directly over
// page content, so a translucent panel would bleed the content through;
// legibility wins over the glass look for a full-screen takeover.
//
// Open state mirrors the kit's other overlays: pass `trigger` for an uncontrolled
// drawer that renders its own button and manages itself, or drive `open` /
// `onOpenChange` yourself. The scrim, the system back/escape, AND the Android
// hardware back button all request a close.
//
// Boolean-prop API: one boolean per option, first-match precedence. Edge axis
// (pick one):
//
// - `left`:  a full-height panel on the left edge (the default).
// - `right`: a full-height panel on the right edge.
// - `bottom`: a sheet that spans the width and rises from the bottom.

export interface DrawerProps {
  /** Panel content. */
  children?: ReactNode;
  /** Controlled open state. Omit for uncontrolled (a `trigger` opens it). */
  open?: boolean;
  /** Fired when the open state changes (trigger press, scrim tap, back/escape). */
  onOpenChange?: (open: boolean) => void;
  /**
   * Label for an optional outline trigger button. When set, the drawer renders the button
   * and opens itself on press (uncontrolled). Omit when you drive `open` yourself.
   */
  trigger?: string;
  // Edge axis (pick one; first match wins, default is the left side drawer).
  /** A full-height panel on the left edge (default). */
  left?: boolean;
  /** A full-height panel on the right edge. */
  right?: boolean;
  /** A sheet spanning the width, rising from the bottom. */
  bottom?: boolean;
  /** Width of a side drawer in px (default 288). Ignored for the bottom sheet. */
  width?: number;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Escape hatch for the panel surface (e.g. safe-area padding). */
  style?: StyleProp<ViewStyle>;
}

// First-match edge precedence; defaults to the left side drawer.
function edgeOf(p: DrawerProps): Edge {
  if (p.right) return "right";
  if (p.bottom) return "bottom";
  return "left";
}

/** Build a Drawer component from a platform skin. */
export function createDrawer(skin: DrawerSkin) {
  return function Drawer(props: DrawerProps) {
    const { children, open: openProp, onOpenChange, trigger, width = 288, testID, style } = props;
    const { tokens } = useTheme();
    const edge = edgeOf(props);

    // Uncontrolled by default: the trigger opens the drawer and the scrim closes it; a
    // controlled `open` prop overrides this.
    const [internalOpen, setInternalOpen] = useState(false);
    const open = openProp ?? internalOpen;
    const setOpen = useCallback(
      (next: boolean) => {
        if (openProp === undefined) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [openProp, onOpenChange],
    );

    // Hardware back closes the open drawer. BackHandler fires on Android only
    // (the Modal's own onRequestClose also covers the system back/escape); the
    // subscription is a documented no-op on iOS and web, so no Platform branch is
    // needed. The handler returns true while open to consume the event (prevent
    // the app from navigating back / exiting), and false when closed so the
    // default back behavior runs.
    useEffect(() => {
      if (!open) return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        setOpen(false);
        return true;
      });
      return () => sub.remove();
    }, [open, setOpen]);

    return (
      <>
        {trigger != null ? (
          <Button outline small onPress={() => setOpen(true)}>
            {trigger}
          </Button>
        ) : null}
        <Modal
          visible={open}
          transparent
          animationType={edge === "bottom" ? "slide" : "fade"}
          onRequestClose={() => setOpen(false)}
          testID={testID}
          // Tell assistive tech the content behind this full-screen overlay is
          // inert while the drawer is open (iOS VoiceOver honors this; a no-op
          // elsewhere). No focus trap is attempted (hard cross-platform).
          accessibilityViewIsModal={true}
        >
          {/* The dim backdrop is a dismiss affordance, not a control to land on:
              keep it out of the focus order and unannounced (matching
              anchored-overlay's backdrop) so web screen-reader/keyboard users
              are not stopped on an unlabeled button. Back/escape and the trigger
              remain the discoverable dismiss paths. */}
          <Pressable accessible={false} style={s.scrim(edge, skin.scrimOpacity)} onPress={() => setOpen(false)}>
            {/* A no-op press inside the panel keeps taps from falling through to
                the scrim. It is a pure event-capture wrapper, never a control,
                so it is hidden from assistive tech to avoid a phantom button. */}
            <Pressable accessible={false} style={s.panelPos[edge]} onPress={() => {}}>
              <View style={[skin.panelShape(edge, width, tokens), style]}>{children}</View>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  };
}
