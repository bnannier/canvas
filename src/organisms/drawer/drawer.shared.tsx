import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, BackHandler, I18nManager, KeyboardAvoidingView, Modal, Platform, StyleSheet } from "react-native";
import { Pressable, View, useTheme, useReducedMotion, supportsNativeDriver, type StyleProp, type ViewStyle } from "../../style/index.js";
import { SafeAreaView } from "../../style/safe-area.js";
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
  /** Outer layout composition for the panel surface, never a restyle hook. (Device safe-area insets are applied automatically.) */
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

    // Side edges (left/right) SLIDE via a manual translateX + scrim fade: RN Modal's
    // animationType can only slide vertically ("slide" rises from the bottom), so a start-edge
    // drawer would otherwise just fade in. Keep the Modal mounted through the exit so the
    // slide-out is visible, then unmount. The BOTTOM sheet keeps RN Modal's native slide.
    const isSide = edge !== "bottom";
    const reduced = useReducedMotion();
    const [mounted, setMounted] = useState(open);
    const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
    useEffect(() => {
      if (!isSide) return;
      if (open) {
        setMounted(true);
        Animated.timing(progress, { toValue: 1, duration: reduced ? 0 : 220, useNativeDriver: supportsNativeDriver }).start();
      } else if (mounted) {
        Animated.timing(progress, { toValue: 0, duration: reduced ? 0 : 180, useNativeDriver: supportsNativeDriver }).start(({ finished }) => {
          if (finished) setMounted(false);
        });
      }
    }, [open, mounted, isSide, progress, reduced]);

    // The panel lands on the logical start (left) / end (right) edge via flexbox, which mirrors
    // under RTL — so the off-screen slide origin follows the PHYSICAL side the panel ends up on.
    const physicalRight = (edge === "right") !== I18nManager.isRTL;
    const slideX = progress.interpolate({ inputRange: [0, 1], outputRange: [physicalRight ? width : -width, 0] });
    const dimOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, skin.scrimOpacity] });

    // A no-op press inside the panel keeps taps from falling through to the scrim; it is a pure
    // event-capture wrapper, hidden from assistive tech. SafeAreaView pads the panel content
    // clear of the device insets on iOS (a bottom sheet clears the home indicator, a side drawer
    // the notch/status bar); the opaque `card` fill still reaches the screen edge, and insets
    // resolve to 0 elsewhere so the layout is unchanged off iOS.
    const panel = (
      <Pressable accessible={false} style={s.panelPos[edge]} onPress={() => {}}>
        <SafeAreaView style={[skin.panelShape(edge, width, tokens), style]}>{children}</SafeAreaView>
      </Pressable>
    );

    return (
      <>
        {trigger != null ? (
          <Button outline small onPress={() => setOpen(true)}>
            {trigger}
          </Button>
        ) : null}
        <Modal
          visible={isSide ? mounted : open}
          transparent
          animationType={isSide ? "none" : "slide"}
          onRequestClose={() => setOpen(false)}
          testID={testID}
          // Tell assistive tech the content behind this full-screen overlay is
          // inert while the drawer is open (iOS VoiceOver honors this; a no-op
          // elsewhere). No focus trap is attempted (hard cross-platform).
          accessibilityViewIsModal={true}
        >
          {/* Lift the panel above the iOS software keyboard so a field inside the drawer stays
              visible while typing. "padding" shrinks the overlay by the keyboard height on iOS;
              off iOS no behavior is passed (Android's window resizes, web has no soft keyboard). */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            {isSide ? (
              // The dim is an Animated layer that fades in behind a TRANSPARENT tap-to-close
              // layout; the panel rides in on translateX. The dim is a dismiss affordance, not a
              // control, so it is unannounced (back/escape/trigger remain the discoverable paths).
              <View style={{ flex: 1 }}>
                <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgb(0, 0, 0)", opacity: dimOpacity }]} />
                <Pressable accessible={false} style={s.scrim(edge, 0)} onPress={() => setOpen(false)}>
                  <Animated.View style={{ transform: [{ translateX: slideX }] }}>{panel}</Animated.View>
                </Pressable>
              </View>
            ) : (
              // Bottom: RN Modal's native slide + the static scrim dim.
              <Pressable accessible={false} style={s.scrim(edge, skin.scrimOpacity)} onPress={() => setOpen(false)}>
                {panel}
              </Pressable>
            )}
          </KeyboardAvoidingView>
        </Modal>
      </>
    );
  };
}
