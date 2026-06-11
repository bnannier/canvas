import { useState } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Icon } from "../icon/icon.js";
import * as s from "./button-group.styles.js";

// Shared ButtonGroup shell. The structure (the four kinds, their layout, the
// uncontrolled stepper position, the split dropdown), the accessibility, the
// kind/size precedence, and the handlers live here once; a platform file supplies
// only its skin (the native container shape, selected-segment treatment, label
// color, dividers, press feedback) and calls createButtonGroup.
//
// A button group is a horizontal row of buttons that read as one control.
//
// Four kinds, picked by boolean prop (first match wins):
//   - `segmented` (default): attached segments sharing one control; one segment
//     reads selected via `active`. Use for mutually exclusive views (Day / Week /
//     Month). The native shape differs per OS: iOS draws a gray track with a
//     raised white pill on the selected segment; Android a stadium-outlined group
//     with a tonal selected fill; web the joined-buttons look with a solid fill.
//   - `split`: a primary action attached to a chevron trigger, divided by a
//     hairline; the chevron opens a dropdown of related actions (`menu`). Use
//     for one primary action with a few related variants.
//   - `stepper`: a prev / current / next control whose chevrons are built in;
//     `items` is the list it cycles through (wrapping at the ends) and the middle
//     label tracks the position. Use for stepping an ordered set (dates, pages).
//   - `spaced`: a plain row of detached buttons separated by a gap. Use for
//     a few peer actions that do not form a single control.
//
// Because there are no `first:` / `last:` style variants, the joined-corner and
// shared-border math is computed per segment in the skin rather than in markup.

export type Kind = "segmented" | "split" | "stepper" | "spaced";
export type Size = "small" | "default" | "large";

// Icon color axis (semantic boolean props), chosen by the skin per platform.
export type IconColor = "primary" | "primaryForeground" | "muted" | "foreground";

// Spread the chosen Icon color as its boolean prop (foreground is the default,
// so it needs none). Keeps the semantic prop API: no raw color strings.
function iconColorProps(c: IconColor) {
  switch (c) {
    case "primary": return { primary: true } as const;
    case "primaryForeground": return { primaryForeground: true } as const;
    case "muted": return { muted: true } as const;
    case "foreground": return {} as const;
  }
}

// The platform-varying surface. Everything color/shape-bearing the four kinds
// need lives here, built from the active tokens (so each follows light/dark/glass).
export interface ButtonGroupSkin {
  // --- segmented / spaced ---
  /** Optional gray track wrapping the segmented row (iOS); null = bare row. */
  segmentedWrap: (t: ColorTokens) => ViewStyle | null;
  /** Border width on each segment cell (0 on iOS/Android, 1 on web). */
  segmentBorderWidth: number;
  /** Corner radii for an attached segment given its position in the row. */
  joinCorners: (index: number, count: number) => ViewStyle;
  /** Corner radii for a detached (spaced) peer. */
  spacedCorners: ViewStyle;
  /** Shared-border overlap applied to every non-leading segment; null = none. */
  overlap: ViewStyle | null;
  /** Optional leading divider on every non-leading segment (Android stadium). */
  segmentDivider?: (t: ColorTokens) => ViewStyle;
  /** Selected vs. unselected segment fill/border. */
  segmentSurface: (t: ColorTokens, selected: boolean) => ViewStyle;
  /** Segment label color/weight for selected vs. unselected. */
  segmentLabel: (t: ColorTokens, selected: boolean) => TextStyle;
  /** Show a leading check glyph on the selected segment (Android M3). */
  showSelectedCheck: boolean;

  // --- split ---
  splitPrimary: (t: ColorTokens) => ViewStyle;
  splitPrimaryLabel: (t: ColorTokens) => TextStyle;
  splitDivider: (t: ColorTokens, height: number) => ViewStyle;
  splitTrigger: (t: ColorTokens, height: number) => ViewStyle;
  splitChevronColor: IconColor;
  splitMenu: (t: ColorTokens) => ViewStyle;
  splitMenuItemPressed: (t: ColorTokens) => ViewStyle;
  splitMenuText: (t: ColorTokens) => TextStyle;

  // --- stepper ---
  stepperArrow: (t: ColorTokens, height: number) => ViewStyle;
  stepperArrowLeft: ViewStyle;
  stepperArrowRight: ViewStyle;
  stepperMiddle: (t: ColorTokens) => ViewStyle;
  stepperLabel: (t: ColorTokens) => TextStyle;
  stepperChevronColor: IconColor;

  // --- feedback ---
  /** iOS/web dim the cell on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over a pressed cell; null on iOS/web. */
  ripple?: (t: ColorTokens) => { color: string; borderless: boolean };
}

export interface ButtonGroupProps {
  /** Segment labels for segmented/spaced; the values the stepper cycles through. */
  items?: string[];
  /** Selected segment index (segmented), or the stepper's initial index. */
  active?: number;
  /** Called with the pressed/selected index and item (and, for the stepper, the new index). */
  onSelect?: (index: number, item: string, event: GestureResponderEvent) => void;

  // Kind (pick one; default is segmented).
  segmented?: boolean;
  split?: boolean;
  stepper?: boolean;
  spaced?: boolean;

  /** Related actions shown in the split kind's chevron dropdown. */
  menu?: string[];

  // Size (pick one; default is the medium size).
  small?: boolean;
  large?: boolean;

  disabled?: boolean;
  /** Escape hatch for layout/positioning composition (margins, alignment). */
  style?: StyleProp<ViewStyle>;
}

// Kind precedence when more than one is passed: first match wins.
function kindOf(p: ButtonGroupProps): Kind {
  if (p.segmented) return "segmented";
  if (p.split) return "split";
  if (p.stepper) return "stepper";
  if (p.spaced) return "spaced";
  return "segmented";
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: ButtonGroupProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

const DEFAULT_ITEMS = ["Day", "Week", "Month"];
const DEFAULT_MENU = ["Save as draft", "Save and close", "Save a copy"];

/** Build a ButtonGroup component from a platform skin. */
export function createButtonGroup(skin: ButtonGroupSkin) {
  const ripple = skin.ripple;

  interface SegmentProps {
    label: string;
    selected: boolean;
    /** Corner radii for this segment given its position in the row. */
    corners: ViewStyle;
    /** This segment overlaps the previous border / draws a leading divider. */
    leading: boolean;
    size: Size;
    disabled?: boolean;
    onPress?: (event: GestureResponderEvent) => void;
  }

  function Segment({ label, selected, corners, leading, size, disabled, onPress }: SegmentProps) {
    const { tokens } = useTheme();
    const container: StyleProp<ViewStyle> = [
      s.segmentBase,
      { borderWidth: skin.segmentBorderWidth },
      s.sizeContainer[size],
      corners,
      leading && skin.overlap ? skin.overlap : null,
      leading && skin.segmentDivider ? skin.segmentDivider(tokens) : null,
      skin.segmentSurface(tokens, selected),
      disabled ? s.dim : null,
    ];
    return (
      <Pressable
        style={({ pressed }) => [container, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
        onPress={onPress}
        disabled={disabled}
        android_ripple={ripple ? ripple(tokens) : undefined}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled: !!disabled }}
      >
        {skin.showSelectedCheck && selected ? (
          <Icon check primary size={s.chevronSize[size]} style={{ marginRight: 6 }} />
        ) : null}
        <Text style={[s.sizeLabel[size], skin.segmentLabel(tokens, selected)]}>{label}</Text>
      </Pressable>
    );
  }

  // The split kind's secondary control: a chevron that toggles a floating dropdown
  // of related actions, anchored to the right edge of the primary button. The
  // menu floats (absolute) so it overflows the group rather than growing it.
  function SplitButton({
    primary,
    menu,
    size,
    disabled,
    onSelect,
    style,
  }: {
    primary: string;
    menu: string[];
    size: Size;
    disabled?: boolean;
    onSelect?: (index: number, item: string, event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
  }) {
    const { tokens } = useTheme();
    const [open, setOpen] = useState(false);
    const triggerHeight = s.sizeHeight[size];
    return (
      <View style={[s.splitContainer, disabled ? s.dim : null, style]}>
        <Pressable
          style={({ pressed }) => [skin.splitPrimary(tokens), s.sizeContainer[size], skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
          onPress={(e) => onSelect?.(0, primary, e)}
          disabled={disabled}
          android_ripple={ripple ? ripple(tokens) : undefined}
          accessibilityRole="button"
        >
          <Text style={[skin.splitPrimaryLabel(tokens), s.sizeLabel[size]]}>{primary}</Text>
        </Pressable>
        {/* Hairline divider so the chevron reads as a distinct trigger. */}
        <View style={skin.splitDivider(tokens, triggerHeight)} />
        <Pressable
          style={({ pressed }) => [skin.splitTrigger(tokens, triggerHeight), skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
          onPress={() => setOpen((o) => !o)}
          disabled={disabled}
          android_ripple={ripple ? ripple(tokens) : undefined}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel="More actions"
        >
          <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
            <Icon chevronDown size={s.chevronSize[size]} {...iconColorProps(skin.splitChevronColor)} />
          </View>
        </Pressable>
        {open ? (
          <View style={skin.splitMenu(tokens)}>
            {menu.map((item, i) => (
              <Pressable
                key={`${item}-${i}`}
                style={({ pressed }) => [s.splitMenuItem, pressed ? skin.splitMenuItemPressed(tokens) : null]}
                onPress={(e) => {
                  onSelect?.(i + 1, item, e);
                  setOpen(false);
                }}
                accessibilityRole="menuitem"
              >
                <Text style={skin.splitMenuText(tokens)}>{item}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  // Stepper: a prev / current / next control. The chevrons are built in here; the
  // `items` array is what it cycles through. Uncontrolled, it tracks its own
  // position from the initial index, wraps at the ends, and reports each change
  // through onSelect. The middle cell is a passive label showing the current item.
  function Stepper({
    items,
    initial,
    size,
    disabled,
    onSelect,
    style,
  }: {
    items: string[];
    initial: number;
    size: Size;
    disabled?: boolean;
    onSelect?: (index: number, item: string, event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
  }) {
    const { tokens } = useTheme();
    const count = items.length;
    const clamp = (n: number) => (count > 0 ? Math.min(Math.max(0, n), count - 1) : 0);
    const [index, setIndex] = useState(() => clamp(initial));
    const i = clamp(index);
    const chevron = s.chevronSize[size];
    const height = s.sizeHeight[size];
    const step = (dir: number, e: GestureResponderEvent) => {
      if (count === 0) return;
      const next = (i + dir + count) % count;
      setIndex(next);
      onSelect?.(next, items[next], e);
    };
    return (
      <View style={[s.stepperContainer, disabled ? s.dim : null, style]}>
        <Pressable
          style={({ pressed }) => [skin.stepperArrow(tokens, height), skin.stepperArrowLeft, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
          onPress={(e) => step(-1, e)}
          disabled={disabled}
          android_ripple={ripple ? ripple(tokens) : undefined}
          accessibilityRole="button"
          accessibilityLabel="Previous"
        >
          <Icon chevronLeft size={chevron} {...iconColorProps(skin.stepperChevronColor)} />
        </Pressable>
        <View style={[skin.stepperMiddle(tokens), s.sizeContainer[size]]}>
          <Text style={[skin.stepperLabel(tokens), s.sizeLabel[size]]}>{items[i] ?? ""}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [skin.stepperArrow(tokens, height), skin.stepperArrowRight, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
          onPress={(e) => step(1, e)}
          disabled={disabled}
          android_ripple={ripple ? ripple(tokens) : undefined}
          accessibilityRole="button"
          accessibilityLabel="Next"
        >
          <Icon chevronRight size={chevron} {...iconColorProps(skin.stepperChevronColor)} />
        </Pressable>
      </View>
    );
  }

  return function ButtonGroup(props: ButtonGroupProps) {
    const { items = DEFAULT_ITEMS, active = 0, onSelect, disabled, style } = props;
    const { tokens } = useTheme();
    const kind = kindOf(props);
    const size = sizeOf(props);

    // Spaced: detached peers separated by a gap, each with full rounding.
    if (kind === "spaced") {
      return (
        <View style={[s.spacedContainer, style]}>
          {items.map((item, i) => (
            <Segment
              key={`${item}-${i}`}
              label={item}
              selected={false}
              corners={skin.spacedCorners}
              leading={false}
              size={size}
              disabled={disabled}
              onPress={(e) => onSelect?.(i, item, e)}
            />
          ))}
        </View>
      );
    }

    // Split: a primary action attached to a chevron that opens a dropdown of
    // related actions.
    if (kind === "split") {
      const labels = items.length > 0 ? items : DEFAULT_ITEMS;
      const primary = labels[0] ?? "Save";
      return (
        <SplitButton
          primary={primary}
          menu={props.menu && props.menu.length > 0 ? props.menu : DEFAULT_MENU}
          size={size}
          disabled={disabled}
          onSelect={onSelect}
          style={style}
        />
      );
    }

    // Stepper: a prev / current / next control that cycles through items; the
    // component owns the chevrons and the position.
    if (kind === "stepper") {
      const list = items.length > 0 ? items : DEFAULT_ITEMS;
      return (
        <Stepper
          items={list}
          initial={active}
          size={size}
          disabled={disabled}
          onSelect={onSelect}
          style={style}
        />
      );
    }

    // Segmented (default): attached segments, one selected. iOS wraps the row in
    // a gray track; Android/web render the row bare (the stadium/joined borders
    // are drawn by the segments themselves).
    const count = items.length;
    const wrap = skin.segmentedWrap(tokens);
    const row = items.map((item, i) => (
      <Segment
        key={`${item}-${i}`}
        label={item}
        selected={i === active}
        corners={skin.joinCorners(i, count)}
        leading={i > 0}
        size={size}
        disabled={disabled}
        onPress={(e) => onSelect?.(i, item, e)}
      />
    ));
    if (wrap) {
      return <View style={[wrap, style]}>{row}</View>;
    }
    return <View style={[s.segmentedContainer, style]}>{row}</View>;
  };
}
