import { useRef } from "react";
import { View, Pressable, Text, RippleClip, cornerRadii, useTheme, useControllableState, useRovingFocus, isRTL, type RovingItemProps, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
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
// shape), rendered as a small secondary pill after the label. An item may also
// be individually disabled (`{ label, disabled: true }`): its trigger renders
// through the skin's dimmed disabled treatment, is not pressable, sits out of
// the tab order, and the roving arrow keys skip over it.
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

/** A tab is either a bare label or a label paired with a count badge and/or an
 *  individual disabled flag (a disabled trigger dims, ignores presses, and is
 *  skipped by keyboard navigation). */
export type TabItem = string | { label: string; badge?: string; disabled?: boolean };

export interface TabsProps {
  /** Triggers, left to right. Strings, or `{ label, badge }` for a count. */
  tabs?: TabItem[];
  /** Index of the active trigger; omit for uncontrolled use. */
  active?: number;
  /** Initial active index for uncontrolled use (a bare <Tabs /> switches out of the box). */
  defaultActive?: number;
  /** Called with the pressed trigger's index (both modes). Matches TabBar and
   *  ButtonGroup, which also fire `onSelect` for the active-index change. */
  onSelect?: (index: number) => void;
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
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
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

function disabledOf(item: TabItem): boolean {
  return typeof item === "string" ? false : !!item.disabled;
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
    /** Roving-focus wiring (the single tab stop + arrow-key handler) from useRovingFocus. */
    itemProps?: RovingItemProps;
  }

  function Trigger({ label, badge, selected, variant, block, disabled, onPress, itemProps }: TriggerProps) {
    const { tokens, dark } = useTheme();
    // The roving tab stop + web arrow-key handler ride onto the Pressable. `ref` is
    // passed explicitly (React never spreads it); `onKeyDown` is web-only, so the
    // pair goes through a cast (RN's Pressable types omit onKeyDown), the same idiom
    // the Slider uses for its own keyboard handler.
    const itemRef = itemProps?.ref;
    // A trigger without roving wiring is a disabled one (per-item or whole-group):
    // pin it OUT of the tab order (focusable=false, tabIndex=-1) so keyboard focus
    // can only ever land on an operable tab.
    const rovingProps = itemProps
      ? { focusable: itemProps.focusable, tabIndex: itemProps.tabIndex, onKeyDown: itemProps.onKeyDown }
      : { focusable: false, tabIndex: -1 };

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
        // Round the vertical trigger's bounded Android ripple to its corners via this
        // RippleClip parent (Android only). The rail stretches its children (alignItems
        // "stretch") and the trigger is width:"100%", so the wrapper fills the rail and the
        // trigger fills the wrapper; there is no flex/width on the container to move.
        <RippleClip shape={cornerRadii(container)}>
          <Pressable
            ref={itemRef}
            {...(rovingProps as object)}
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
        </RippleClip>
      );
    }

    if (variant === "pills") {
      // In block mode each trigger flexes to share the row equally. That flex now rides the
      // RippleClip wrapper (the flex item in the pills row), not the Pressable, so the wrapper
      // grows and the Pressable fills it; keeping the flex on the Pressable would double it.
      const container: StyleProp<ViewStyle> = [
        skin.pillsTrigger(tokens, selected),
        skin.pillsFill(tokens, selected, dark),
        skin.focusOutlineReset,
        disabled ? s.disabledDim : null,
      ];
      return (
        // Round the pill trigger's bounded Android ripple to its capsule corners via this
        // RippleClip parent (Android only). Block-mode flex moves here so the tab still shares
        // the row width.
        <RippleClip shape={cornerRadii(container)} style={block ? s.flex1 : null}>
          <Pressable
            ref={itemRef}
            {...(rovingProps as object)}
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
        </RippleClip>
      );
    }

    // Underline: the active trigger gets the emphasized label and an indicator
    // drawn as an explicit sliver pinned to the trigger's bottom edge (iOS draws
    // a raised pill instead, supplied through underlineTrigger).
    // In block mode each trigger flexes to share the row equally. That flex rides the
    // RippleClip wrapper (the flex item in the row), not the Pressable, so the wrapper grows
    // and the Pressable fills it via the wrapper's default stretch.
    const container: StyleProp<ViewStyle> = [
      skin.underlineTrigger(tokens, selected, dark),
      skin.focusOutlineReset,
      disabled ? s.disabledDim : null,
    ];
    return (
      // Round the underline trigger's bounded Android ripple to its corners via this
      // RippleClip parent (Android only; iOS draws a capsule pill instead). Block-mode flex
      // moves here so the tab still shares the row width. The absolute bottom indicator stays
      // inside the Pressable, which fills this wrapper.
      <RippleClip shape={cornerRadii(container)} style={block ? s.flex1 : null}>
        <Pressable
          ref={itemRef}
          {...(rovingProps as object)}
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
      </RippleClip>
    );
  }

  return function Tabs(props: TabsProps) {
    const { tabs = DEFAULT_TABS, onSelect, disabled, style, testID } = props;
    const variant = variantOf(props);
    const { tokens } = useTheme();

    // Controlled when `active` is provided, self-managed otherwise, so a bare
    // <Tabs /> switches tabs out of the box (the standard library contract).
    const [active, setActive] = useControllableState<number>(props.active, props.defaultActive ?? 0, onSelect);

    // Per-item disabled flags (the `{ label, disabled }` item shape).
    const itemDisabled = tabs.map((item) => disabledOf(item));
    const count = tabs.length;

    // Own node refs beside the hook's: when an arrow lands on a disabled trigger
    // the activation is redirected below, and the hook only knows how to focus
    // the index the key targeted, so the redirect moves DOM focus itself.
    const itemNodes = useRef<Array<{ focus?: () => void } | null>>([]);

    // Activation with disabled-skipping: when a key lands on a disabled trigger,
    // keep walking in the direction of travel (wrapping, like the hook) until an
    // enabled trigger takes the activation; with every tab disabled the key is a
    // no-op. Direction: a distance-1 hop is an arrow (its sign wins even at the
    // ends); otherwise Home (index 0) walks forward and End walks backward.
    const activateSkippingDisabled = (index: number) => {
      const delta = (index - active + count) % count;
      const dir: 1 | -1 = delta === 1 ? 1 : delta === count - 1 ? -1 : index === 0 ? 1 : -1;
      for (let step = 0; step < count; step++) {
        const i = (((index + dir * step) % count) + count) % count;
        if (itemDisabled[i]) continue;
        setActive(i);
        if (i !== index) itemNodes.current[i]?.focus?.();
        return;
      }
    };

    // Roving-focus keyboard navigation (the WAI-ARIA tablist pattern): the row is one
    // tab stop and the arrows move + activate. Horizontal for the underline/pills
    // rows, vertical for the rail; RTL flips the horizontal arrows on the web.
    const { getItemProps } = useRovingFocus({
      count,
      active,
      onActivate: disabled ? () => {} : activateSkippingDisabled,
      orientation: variant === "vertical" ? "vertical" : "horizontal",
      rtl: isRTL(),
    });

    // Roving wiring per trigger: none for a disabled one (the Trigger then pins
    // itself out of the tab order); enabled ones get the hook's props with the
    // ref teed into itemNodes so the redirect above can focus them.
    const rovingFor = (i: number): RovingItemProps | undefined => {
      if (disabled || itemDisabled[i]) return undefined;
      const base = getItemProps(i);
      return {
        ...base,
        ref: (node) => {
          base.ref(node);
          itemNodes.current[i] = node;
        },
      };
    };

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
              disabled={disabled || itemDisabled[i]}
              onPress={() => setActive(i)}
              itemProps={rovingFor(i)}
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
              disabled={disabled || itemDisabled[i]}
              onPress={() => setActive(i)}
              itemProps={rovingFor(i)}
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
            disabled={disabled || itemDisabled[i]}
            onPress={() => setActive(i)}
            itemProps={rovingFor(i)}
          />
        ))}
      </View>
    );
  };
}
