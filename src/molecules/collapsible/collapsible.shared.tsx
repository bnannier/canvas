import { type ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { Animated, LayoutAnimation } from "react-native";
import {
  View,
  Text,
  Pressable,
  useTheme,
  supportsNativeDriver,
  useReducedMotion,
  enableAndroidLayoutAnimations,
  type ColorTokens,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "../../style/index.js";
import { Icon } from "../../atoms/icon/icon.js";

// Shared Collapsible shell. A Collapsible is a SINGLE disclosure: one header
// carrying a label (the `title`, or a custom `trigger` node) and a rotating
// chevron over one collapsible content panel. An Accordion is a GROUP of these;
// Collapsible is the standalone primitive (essentially one accordion Row lifted
// out, with its own single open/close state).
//
// The structure (the header trigger over a collapsible panel), the
// controlled-or-uncontrolled open state, the accessibility, the chevron rotation
// animation, and the press handlers live here once; a platform file supplies only
// its skin (the container shape, header insets, title type, chevron tint/size,
// content insets, and press feedback) and calls createCollapsible.
//
// The collapsible is a CONTENT-layer surface, so it stays SOLID on every platform
// (it is never routed through GlassSurface; per Apple, glass is the material for
// the functional layer only).
//
// Open state is controlled OR uncontrolled:
//   - Uncontrolled: omit `open`; the component tracks open/closed in internal
//     state, seeded once from `defaultOpen` (default false).
//   - Controlled: pass `open` plus `onOpenChange`; the parent owns the state.
//
// The chevron rotates 0 -> 90deg when the panel opens (chevronRight glyph), the
// HIG/Radix disclosure affordance. The panel reveal uses LayoutAnimation natively
// (a smooth height ease) and a plain show/hide on web, which is robust everywhere.

// The platform-varying surface. Everything shape/color/feedback-bearing the
// disclosure needs lives here, built from the active tokens (so each follows
// light/dark).
export interface CollapsibleSkin {
  /** iOS/web dim the header on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android header ripple; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  /**
   * Web-only focus-outline reset for the header Pressable, so the
   * react-native-web keyboard-focus blue ring (which a real device never shows)
   * is suppressed. No-op natively, where `outline*` are not real styles.
   */
  focusOutlineReset?: ViewStyle;

  /** Chevron glyph size, in px. The glyph paints in the `muted-foreground` token
   *  (the HIG tertiary-gray / M3 on-surface-variant disclosure tint) on every
   *  platform, via the kit Icon's `muted` color prop. */
  chevronSize: number;

  /** The outer container shape (iOS inset-grouped card; flat on web/Android). */
  container: (t: ColorTokens) => ViewStyle;
  /** The header trigger row layout/insets. */
  header: (t: ColorTokens) => ViewStyle;
  /** The header title type (used for the default `title` text). */
  title: (t: ColorTokens) => TextStyle;
  /** The content panel insets. */
  content: (t: ColorTokens) => ViewStyle;
  /** The default content text type (when the children is a plain string). */
  contentText: (t: ColorTokens) => TextStyle;
}

export interface CollapsibleProps {
  /** The default trigger label text. */
  title?: string;
  /**
   * A custom trigger node; if provided, it renders as the pressable's content
   * instead of the `title` text (the chevron still renders alongside).
   */
  trigger?: ReactNode;
  /** The collapsible content. A string renders in the skin's content type; a
   *  ReactNode renders as-is. */
  children: ReactNode;
  /** Controlled open state. Pair with `onOpenChange`. Omit for uncontrolled. */
  open?: boolean;
  /** Called with the next open state whenever the header toggles. */
  onOpenChange?: (open: boolean) => void;
  /** Initial open state for the uncontrolled case (read once, default false). */
  defaultOpen?: boolean;
  /** A disabled header does not toggle and reads dimmed. */
  disabled?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Enable LayoutAnimation on old-arch Android (off by default there); a no-op on iOS, web, and the
// New Architecture, where it is on by default and the setter only logs a warning. Once per bundle.
enableAndroidLayoutAnimations();

/** Build a Collapsible component from a platform skin. */
export function createCollapsible(skin: CollapsibleSkin) {
  return function Collapsible(props: CollapsibleProps) {
    const { title, trigger, children, open: openProp, onOpenChange, defaultOpen = false, disabled, testID, style } = props;
    const { tokens } = useTheme();
    const reduced = useReducedMotion();

    // Uncontrolled store, seeded once from defaultOpen; ignored when controlled.
    const [internal, setInternal] = useState<boolean>(() => defaultOpen);
    const controlled = openProp !== undefined;
    const open = controlled ? !!openProp : internal;

    // Chevron rotation: 0deg collapsed -> 90deg open (chevronRight points down).
    // Reduce Motion snaps it (duration 0) rather than easing.
    const spin = useRef(new Animated.Value(open ? 1 : 0)).current;
    useEffect(() => {
      Animated.timing(spin, {
        toValue: open ? 1 : 0,
        duration: reduced ? 0 : 180,
        useNativeDriver: supportsNativeDriver,
      }).start();
    }, [open, spin, reduced]);
    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "90deg"] });

    const toggle = useCallback(() => {
      // Animate the reveal natively (a smooth height ease); web falls back to a
      // plain show/hide. Reduce Motion skips the height ease entirely.
      if (supportsNativeDriver && !reduced) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const next = !open;
      if (!controlled) setInternal(next);
      onOpenChange?.(next);
    }, [open, controlled, onOpenChange, reduced]);

    const headerStyle: StyleProp<ViewStyle> = [
      skin.header(tokens),
      skin.focusOutlineReset,
      disabled ? DISABLED_DIM : null,
    ];

    // A sensible accessibility label when only a custom trigger is given.
    const a11yLabel = title ?? "Toggle section";

    return (
      <View testID={testID} style={[skin.container(tokens), style]}>
        <Pressable
          onPress={disabled ? undefined : toggle}
          disabled={disabled}
          android_ripple={skin.ripple && !disabled ? skin.ripple(tokens) : undefined}
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
          accessibilityState={{ expanded: open, disabled }}
          // react-native-web drops accessibilityState.expanded, so the disclosure
          // state never reaches the DOM from accessibilityState alone. The ARIA
          // alias (RN 0.71+) is the cross-platform fix: RNW forwards aria-expanded
          // straight to the <button>, and natively it maps back to the expanded state.
          aria-expanded={open}
          style={({ pressed }) => [
            headerStyle,
            skin.pressedOpacity != null && pressed && !disabled ? { opacity: skin.pressedOpacity } : null,
          ]}
        >
          {trigger !== undefined ? (
            <View style={TRIGGER_SLOT}>{trigger}</View>
          ) : (
            <Text style={skin.title(tokens)} numberOfLines={2}>
              {title}
            </Text>
          )}
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon chevronRight muted size={skin.chevronSize} />
          </Animated.View>
        </Pressable>
        {open ? (
          <View style={skin.content(tokens)}>
            {typeof children === "string" ? (
              <Text style={skin.contentText(tokens)}>{children}</Text>
            ) : (
              children
            )}
          </View>
        ) : null}
      </View>
    );
  };
}

// The custom-trigger slot fills the leading space so the chevron stays trailing,
// mirroring the title's flexShrink behavior.
const TRIGGER_SLOT: ViewStyle = { flexShrink: 1, flexGrow: 1 };

// opacity-50: the dimmed disabled look applied to the header.
const DISABLED_DIM: ViewStyle = { opacity: 0.5 };
