import { View, Pressable, Text, useTheme, useControllableState, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import * as s from "./tabs.styles.js";
import { type Variant } from "./tabs.styles.js";

// Shared Tabs shell. The structure (the three looks, their layout, the active
// selection, the optional count badge), the accessibility, the look precedence,
// and the press handlers live here once; a platform file supplies only its skin
// (the native row/trigger shape, selected-tab treatment, indicator, label color,
// press feedback) and calls createTabs.
//
// Tabs are a horizontal row of pressable triggers above panel content, with the
// active trigger emphasized so the current view is unmistakable.
//
// Three looks, picked by boolean prop (first match wins):
//   - underline (default): each trigger is muted text; the active one gets the
//     foreground/brand color and an indicator beneath it. The native shape
//     differs per OS: web/Android draw an underline rule (Android = a 3px brand
//     `primary` bar with muted inactive labels); iOS draws a gray segmented
//     track with a raised white pill on the selected tab (no underline).
//   - `pills`: the row is a muted track; the active trigger is an elevated/tonal
//     background pill while the rest sit flat and muted.
//   - `vertical`: the triggers stack into a left-aligned column rail; the active
//     one is filled with an accent/tonal background while the rest sit flat and
//     muted. Use it as a settings-style side rail.
//
// Orthogonal layout modifier:
//   - `block`: triggers share the row equally (each flex-1) and the labels
//     center, so the group spans the full available width. Omit for triggers
//     that hug their labels at the leading edge.
//
// Each tab may carry an optional count badge (the `{ label, badge }` item
// shape), rendered as a small secondary pill after the label.
//
// The active underline is drawn as an explicit indicator View under the trigger
// rather than as a bottom border in markup (mirroring how ButtonGroup hand-rolls
// its hairline divider).

// The platform-varying surface. Everything color/shape-bearing the three looks
// need lives here, built from the active tokens (so each follows light/dark/glass).
export interface TabsSkin {
  /** iOS/web dim the trigger on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over a pressed trigger; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  /**
   * Web-only focus-outline reset for the trigger Pressables. The iOS skin sets
   * this so the react-native-web keyboard-focus blue ring (which a real iOS
   * device never shows) is suppressed, leaving the press dim as the only
   * feedback. Undefined on web/Android, which keep their own focus treatment.
   * No-op natively, where `outlineStyle`/`outlineWidth` are not real CSS.
   */
  focusOutlineReset?: ViewStyle;

  // --- underline ---
  // `dark` lets the selected-pill fill follow the scheme (iOS: a white thumb in
  // light mode, a lifted lighter-gray thumb in dark mode, matching Apple's
  // segmented control's tertiary/secondary system-fill layering).
  underlineRow: (t: ColorTokens) => ViewStyle;
  underlineTrigger: (t: ColorTokens, selected: boolean, dark: boolean) => ViewStyle;
  underlineIndicator: (t: ColorTokens, selected: boolean) => ViewStyle;
  underlineLabel: (t: ColorTokens, selected: boolean) => TextStyle;

  // --- pills ---
  pillsRow: (t: ColorTokens) => ViewStyle;
  pillsTrigger: (t: ColorTokens, selected: boolean) => ViewStyle;
  pillsFill: (t: ColorTokens, selected: boolean, dark: boolean) => ViewStyle;
  pillsLabel: (t: ColorTokens, selected: boolean) => TextStyle;

  // --- vertical ---
  verticalTrigger: (t: ColorTokens, selected: boolean) => ViewStyle;
  verticalFill: (t: ColorTokens, selected: boolean) => ViewStyle;
  verticalLabel: (t: ColorTokens, selected: boolean) => TextStyle;

  // --- count badge ---
  countBadgeBox: (t: ColorTokens) => ViewStyle;
  countBadgeLabel: (t: ColorTokens, muted: boolean) => TextStyle;
}

/** A tab is either a bare label or a label paired with a count badge. */
export type TabItem = string | { label: string; badge?: string };

export interface TabsProps {
  /** Triggers, left to right. Strings, or `{ label, badge }` for a count. */
  tabs?: TabItem[];
  /** Index of the active trigger; omit for uncontrolled use. */
  active?: number;
  /** Initial active index for uncontrolled use (a bare <Tabs /> switches out of the box). */
  defaultActive?: number;
  /** Called with the pressed trigger's index (both modes). */
  onChange?: (index: number) => void;
  /** E2E hook forwarded to the tablist row. */
  testID?: string;

  // Look (pick one; default is the underline look). Precedence when more than
  // one is passed: pills, then vertical, then underline.
  pills?: boolean;
  vertical?: boolean;
  underline?: boolean;

  // Layout: equal full-width triggers vs. leading-aligned hugging triggers.
  block?: boolean;

  disabled?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Variant precedence when more than one is passed: first match wins.
function variantOf(p: TabsProps): Variant {
  if (p.pills) return "pills";
  if (p.vertical) return "vertical";
  if (p.underline) return "underline";
  return "underline";
}

const DEFAULT_TABS: TabItem[] = ["General", "Security", "Notifications", "Billing"];

function labelOf(item: TabItem): string {
  return typeof item === "string" ? item : item.label;
}

function badgeOf(item: TabItem): string | undefined {
  return typeof item === "string" ? undefined : item.badge;
}

// vertical: flex-col items-stretch gap-1; width w-full (block) or w-[180px].
function verticalRail(block: boolean): ViewStyle {
  return {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 4,
    width: block ? "100%" : 180,
  };
}

/** Build a Tabs component from a platform skin. */
export function createTabs(skin: TabsSkin) {
  const ripple = skin.ripple;

  // A small secondary count pill shown after a trigger label.
  function CountBadge({ children, muted }: { children: string; muted: boolean }) {
    const { tokens } = useTheme();
    return (
      <View style={skin.countBadgeBox(tokens)}>
        <Text style={skin.countBadgeLabel(tokens, muted)}>{children}</Text>
      </View>
    );
  }

  interface TriggerProps {
    label: string;
    badge?: string;
    selected: boolean;
    variant: Variant;
    block?: boolean;
    disabled?: boolean;
    onPress?: () => void;
  }

  function Trigger({ label, badge, selected, variant, block, disabled, onPress }: TriggerProps) {
    const { tokens, dark } = useTheme();

    if (variant === "vertical") {
      // Vertical rail: a full-width, left-aligned row; the active item is filled
      // with an accent/tonal background.
      const container: StyleProp<ViewStyle> = [
        skin.verticalTrigger(tokens, selected),
        skin.verticalFill(tokens, selected),
        skin.focusOutlineReset,
        disabled ? s.disabledDim : null,
      ];
      return (
        <Pressable
          onPress={onPress}
          disabled={disabled}
          android_ripple={ripple ? ripple(tokens) : undefined}
          accessibilityRole="tab"
          accessibilityState={{ selected, disabled: !!disabled }}
          aria-selected={selected}
          aria-disabled={disabled || undefined}
          style={({ pressed }) => [container, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
        >
          <Text style={skin.verticalLabel(tokens, selected)}>{label}</Text>
          {badge != null ? <CountBadge muted={!selected}>{badge}</CountBadge> : null}
        </Pressable>
      );
    }

    if (variant === "pills") {
      const container: StyleProp<ViewStyle> = [
        skin.pillsTrigger(tokens, selected),
        block ? s.flex1 : null,
        skin.pillsFill(tokens, selected, dark),
        skin.focusOutlineReset,
        disabled ? s.disabledDim : null,
      ];
      return (
        <Pressable
          onPress={onPress}
          disabled={disabled}
          android_ripple={ripple ? ripple(tokens) : undefined}
          accessibilityRole="tab"
          accessibilityState={{ selected, disabled: !!disabled }}
          aria-selected={selected}
          aria-disabled={disabled || undefined}
          style={({ pressed }) => [container, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
        >
          <Text style={skin.pillsLabel(tokens, selected)}>{label}</Text>
          {badge != null ? <CountBadge muted={!selected}>{badge}</CountBadge> : null}
        </Pressable>
      );
    }

    // Underline: the active trigger gets the emphasized label and an indicator
    // drawn as an explicit sliver pinned to the trigger's bottom edge (iOS draws
    // a raised pill instead, supplied through underlineTrigger).
    const container: StyleProp<ViewStyle> = [
      skin.underlineTrigger(tokens, selected, dark),
      block ? s.flex1 : null,
      skin.focusOutlineReset,
      disabled ? s.disabledDim : null,
    ];
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        android_ripple={ripple ? ripple(tokens) : undefined}
        accessibilityRole="tab"
        accessibilityState={{ selected, disabled: !!disabled }}
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        style={({ pressed }) => [container, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
      >
        <Text style={skin.underlineLabel(tokens, selected)}>{label}</Text>
        {badge != null ? <CountBadge muted={!selected}>{badge}</CountBadge> : null}
        <View style={skin.underlineIndicator(tokens, selected)} />
      </Pressable>
    );
  }

  return function Tabs(props: TabsProps) {
    const { tabs = DEFAULT_TABS, onChange, disabled, style, testID } = props;
    const variant = variantOf(props);
    const { tokens } = useTheme();

    // Controlled when `active` is provided, self-managed otherwise, so a bare
    // <Tabs /> switches tabs out of the box (the standard library contract).
    const [active, setActive] = useControllableState<number>(props.active, props.defaultActive ?? 0, onChange);

    if (variant === "vertical") {
      // A left-aligned column rail of stacked triggers; width hugs its content
      // unless `block` stretches it to fill the available column.
      return (
        <View accessibilityRole="tablist" testID={testID} style={[verticalRail(!!props.block), style]}>
          {tabs.map((item, i) => (
            <Trigger
              key={`${labelOf(item)}-${i}`}
              label={labelOf(item)}
              badge={badgeOf(item)}
              selected={i === active}
              variant="vertical"
              block={props.block}
              disabled={disabled}
              onPress={() => setActive(i)}
            />
          ))}
        </View>
      );
    }

    if (variant === "pills") {
      return (
        <View accessibilityRole="tablist" testID={testID} style={[skin.pillsRow(tokens), s.blockWidth(!!props.block), style]}>
          {tabs.map((item, i) => (
            <Trigger
              key={`${labelOf(item)}-${i}`}
              label={labelOf(item)}
              badge={badgeOf(item)}
              selected={i === active}
              variant="pills"
              block={props.block}
              disabled={disabled}
              onPress={() => setActive(i)}
            />
          ))}
        </View>
      );
    }

    // Underline: the row sits on a hairline bottom border (web/Android) or a gray
    // segmented track (iOS).
    return (
      <View accessibilityRole="tablist" testID={testID} style={[skin.underlineRow(tokens), s.blockWidth(!!props.block), style]}>
        {tabs.map((item, i) => (
          <Trigger
            key={`${labelOf(item)}-${i}`}
            label={labelOf(item)}
            badge={badgeOf(item)}
            selected={i === active}
            variant="underline"
            block={props.block}
            disabled={disabled}
            onPress={() => onChange?.(i)}
          />
        ))}
      </View>
    );
  };
}
