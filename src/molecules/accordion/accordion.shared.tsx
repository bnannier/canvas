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

// Shared Accordion shell. The structure (a vertically stacked group of disclosure
// rows: a header carrying the title and a rotating chevron over a collapsible
// content panel), the controlled-or-uncontrolled open state, the single-vs-multiple
// open axis, the accessibility, the chevron rotation animation, and the press
// handlers live here once; a platform file supplies only its skin (the container
// shape, the row divider, header insets, title type, chevron tint/size, content
// insets, and press feedback) and calls createAccordion.
//
// The accordion is a CONTENT-layer surface, so it stays SOLID on every platform
// (it is never routed through GlassSurface; per Apple, glass is the material for
// the functional layer only).
//
// Open state is controlled OR uncontrolled:
//   - Uncontrolled: omit `value`; the component tracks which panels are open in
//     internal state, seeded once from `defaultValue`.
//   - Controlled: pass `value` (a single key, or an array of keys when
//     `multiple`) plus `onValueChange`; the parent owns the open set.
//
// Open-mode axis (boolean):
//   - default (single-open): opening a panel closes the others; tapping the open
//     panel's header collapses it.
//   - `multiple`: any number of panels may be open at once; each header toggles
//     its own panel independently.
//
// The chevron rotates 0 -> 90deg when its panel opens (chevronRight glyph), the
// HIG/Radix disclosure affordance. The panel reveal uses LayoutAnimation natively
// (a smooth height ease) and a plain show/hide on web, which is robust everywhere.

// The platform-varying surface. Everything shape/color/feedback-bearing the rows
// need lives here, built from the active tokens (so each follows light/dark).
export interface AccordionSkin {
  /** iOS/web dim the header on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android header ripple; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  /**
   * Web-only focus-outline reset for the header Pressables, so the
   * react-native-web keyboard-focus blue ring (which a real device never shows)
   * is suppressed. No-op natively, where `outline*` are not real styles.
   */
  focusOutlineReset?: ViewStyle;

  /** Chevron glyph size, in px. The glyph paints in the `muted-foreground` token
   *  (the HIG tertiary-gray / M3 on-surface-variant disclosure tint) on every
   *  platform, via the kit Icon's `muted` color prop. */
  chevronSize: number;

  /** The optional outer container shape (iOS inset-grouped card; flat on web/Android). */
  container: (t: ColorTokens) => ViewStyle;
  /** One item's wrapper: the row divider (and any leading inset). `first`/`last` for edge rules. */
  item: (t: ColorTokens, first: boolean, last: boolean) => ViewStyle;
  /** The header trigger row layout/insets. */
  header: (t: ColorTokens) => ViewStyle;
  /** The header title type. */
  title: (t: ColorTokens) => TextStyle;
  /** The content panel insets. */
  content: (t: ColorTokens) => ViewStyle;
  /** The default content text type (when an item's content is a plain string). */
  contentText: (t: ColorTokens) => TextStyle;
}

export interface AccordionItem {
  /** Stable identity for the panel; also its controlled-value token. */
  key: string;
  /** The header label. */
  title: string;
  /** The collapsible panel body. A string renders in the skin's content type; a
   *  ReactNode renders as-is. */
  content: ReactNode;
  /** A disabled row does not toggle and reads dimmed. */
  disabled?: boolean;
}

export interface AccordionProps {
  /** The disclosure rows, top to bottom. */
  items?: AccordionItem[];
  /**
   * Controlled open state. A single key in single-open mode, an array of keys in
   * `multiple` mode. Pair with `onValueChange`. Omit for uncontrolled.
   */
  value?: string | string[];
  /** Initial open state for the uncontrolled case (read once). */
  defaultValue?: string | string[];
  /** Called with the next open value whenever a header toggles. */
  onValueChange?: (value: string | string[]) => void;
  /** Allow more than one panel open at once (default: single-open). */
  multiple?: boolean;
  /** Disable the whole group (every row stops toggling and dims). */
  disabled?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Enable LayoutAnimation on old-arch Android (off by default there); a no-op on iOS, web, and the
// New Architecture, where it is on by default and the setter only logs a warning. Once per bundle.
enableAndroidLayoutAnimations();

const DEFAULT_ITEMS: AccordionItem[] = [
  { key: "what", title: "What is Canvas?", content: "Canvas is a universal React Native UI kit that renders natively on iOS and Android and on the web through React Native Web." },
  { key: "platform", title: "Is it accessible?", content: "Yes. Every header is a button exposing its expanded and disabled state to assistive technology." },
  { key: "themed", title: "Is it themed?", content: "Yes. All colors come from the active theme tokens, so light, dark, and glass surfaces keep working." },
];

// Normalize the open value (controlled or the internal store) into a Set of keys,
// regardless of single (string) or multiple (string[]) shape.
function toSet(value: string | string[] | undefined): Set<string> {
  // `null`/`undefined` and the single-mode "nothing open" sentinel ("" emitted by
  // fromSet) both normalize to an empty Set, so collapsing the last open panel in
  // controlled single-open mode round-trips cleanly instead of seeding Set { "" }.
  if (value == null || value === "") return new Set();
  return new Set(Array.isArray(value) ? value : [value]);
}

// Project a Set of open keys back into the public value shape for onValueChange /
// internal state: an array in multiple mode, the first (or "") in single mode.
function fromSet(open: Set<string>, multiple: boolean): string | string[] {
  if (multiple) return [...open];
  return open.size ? [...open][0] : "";
}

/** Build an Accordion component from a platform skin. */
export function createAccordion(skin: AccordionSkin) {
  // One disclosure row: the header (title + rotating chevron) over its panel.
  function Row({
    item,
    open,
    groupDisabled,
    first,
    last,
    onToggle,
  }: {
    item: AccordionItem;
    open: boolean;
    groupDisabled?: boolean;
    first: boolean;
    last: boolean;
    onToggle: () => void;
  }) {
    const { tokens } = useTheme();
    const reduced = useReducedMotion();
    const disabled = !!item.disabled || !!groupDisabled;

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

    const headerStyle: StyleProp<ViewStyle> = [
      skin.header(tokens),
      skin.focusOutlineReset,
      disabled ? DISABLED_DIM : null,
    ];

    return (
      <View style={skin.item(tokens, first, last)}>
        <Pressable
          onPress={disabled ? undefined : onToggle}
          disabled={disabled}
          android_ripple={skin.ripple && !disabled ? skin.ripple(tokens) : undefined}
          accessibilityRole="button"
          accessibilityLabel={item.title}
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
          <Text style={skin.title(tokens)} numberOfLines={2}>
            {item.title}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon chevronRight muted size={skin.chevronSize} />
          </Animated.View>
        </Pressable>
        {open ? (
          <View style={skin.content(tokens)}>
            {typeof item.content === "string" ? (
              <Text style={skin.contentText(tokens)}>{item.content}</Text>
            ) : (
              item.content
            )}
          </View>
        ) : null}
      </View>
    );
  }

  return function Accordion(props: AccordionProps) {
    const { items = DEFAULT_ITEMS, value, defaultValue, onValueChange, multiple = false, disabled, testID, style } = props;
    const { tokens } = useTheme();
    const reduced = useReducedMotion();

    // Uncontrolled store, seeded once from defaultValue; ignored when controlled.
    const [internal, setInternal] = useState<Set<string>>(() => toSet(defaultValue));
    const controlled = value !== undefined;
    const open = controlled ? toSet(value) : internal;

    const toggle = useCallback(
      (key: string) => {
        // Animate the reveal natively (a smooth height ease); web falls back to a
        // plain show/hide. Reduce Motion skips the height ease entirely.
        if (supportsNativeDriver && !reduced) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const next = new Set(open);
        if (next.has(key)) {
          next.delete(key);
        } else {
          if (!multiple) next.clear();
          next.add(key);
        }
        if (!controlled) setInternal(next);
        onValueChange?.(fromSet(next, multiple));
      },
      [open, multiple, controlled, onValueChange, reduced],
    );

    return (
      <View testID={testID} style={[skin.container(tokens), style]}>
        {items.map((item, i) => (
          <Row
            key={item.key}
            item={item}
            open={open.has(item.key)}
            groupDisabled={disabled}
            first={i === 0}
            last={i === items.length - 1}
            onToggle={() => toggle(item.key)}
          />
        ))}
      </View>
    );
  };
}

// opacity-50: the dimmed disabled look applied per header.
const DISABLED_DIM: ViewStyle = { opacity: 0.5 };
