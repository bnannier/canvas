import { useState } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Icon } from "../icon/icon.js";
import * as s from "./button-group.styles.js";
import { type Kind, type Size } from "./button-group.styles.js";

// A button group is a horizontal row of buttons that read as one control.
//
// Three kinds, picked by boolean prop (first match wins):
//   - `segmented` (default): attached segments sharing borders and joined
//     corners; one segment reads selected via `active`. Use for mutually
//     exclusive views (Day / Week / Month).
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
// shared-border math is computed per segment here in JS rather than in markup.

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

interface SegmentProps {
  label: string;
  selected: boolean;
  /** Corner radii for this segment given its position in the row. */
  corners: ViewStyle;
  /** All but the leading segment overlap the previous border by 1px. */
  overlap: boolean;
  size: Size;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

function Segment({ label, selected, corners, overlap, size, disabled, onPress }: SegmentProps) {
  const { tokens } = useTheme();
  const container: StyleProp<ViewStyle> = [
    s.segmentBase,
    s.sizeContainer[size],
    corners,
    overlap ? s.overlap : null,
    s.segmentSurface(tokens, selected),
    disabled ? s.dim : null,
  ];
  return (
    <Pressable
      style={({ pressed }) => [container, pressed ? { opacity: 0.9 } : null]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
    >
      <Text style={[s.sizeLabel[size], s.segmentLabel(tokens, selected)]}>{label}</Text>
    </Pressable>
  );
}

const DEFAULT_MENU = ["Save as draft", "Save and close", "Save a copy"];

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
        style={({ pressed }) => [s.splitPrimary(tokens), s.sizeContainer[size], pressed ? { opacity: 0.9 } : null]}
        onPress={(e) => onSelect?.(0, primary, e)}
        disabled={disabled}
        accessibilityRole="button"
      >
        <Text style={[s.splitPrimaryLabel(tokens), s.sizeLabel[size]]}>{primary}</Text>
      </Pressable>
      {/* Hairline divider so the chevron reads as a distinct trigger. */}
      <View style={s.splitDivider(tokens, triggerHeight)} />
      <Pressable
        style={({ pressed }) => [s.splitTrigger(tokens, triggerHeight), pressed ? { opacity: 0.9 } : null]}
        onPress={() => setOpen((o) => !o)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="More actions"
      >
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <Icon chevronDown primaryForeground size={s.chevronSize[size]} />
        </View>
      </Pressable>
      {open ? (
        <View style={s.splitMenu(tokens)}>
          {menu.map((item, i) => (
            <Pressable
              key={`${item}-${i}`}
              style={({ pressed }) => [s.splitMenuItem, pressed ? s.splitMenuItemPressed(tokens) : null]}
              onPress={(e) => {
                onSelect?.(i + 1, item, e);
                setOpen(false);
              }}
              accessibilityRole="menuitem"
            >
              <Text style={s.splitMenuText(tokens)}>{item}</Text>
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
        style={({ pressed }) => [s.stepperArrow(tokens, height), s.stepperArrowLeft, pressed ? { opacity: 0.9 } : null]}
        onPress={(e) => step(-1, e)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Previous"
      >
        <Icon chevronLeft muted size={chevron} />
      </Pressable>
      <View style={[s.stepperMiddle(tokens), s.sizeContainer[size]]}>
        <Text style={[s.stepperLabel(tokens), s.sizeLabel[size]]}>{items[i] ?? ""}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [s.stepperArrow(tokens, height), s.stepperArrowRight, pressed ? { opacity: 0.9 } : null]}
        onPress={(e) => step(1, e)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Next"
      >
        <Icon chevronRight muted size={chevron} />
      </Pressable>
    </View>
  );
}

export function ButtonGroup(props: ButtonGroupProps) {
  const { items = DEFAULT_ITEMS, active = 0, onSelect, disabled, style } = props;
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
            corners={{ borderRadius: 6 }}
            overlap={false}
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

  // Segmented (default): attached segments, one selected.
  const count = items.length;
  return (
    <View style={[s.segmentedContainer, style]}>
      {items.map((item, i) => (
        <Segment
          key={`${item}-${i}`}
          label={item}
          selected={i === active}
          corners={s.joinCorners(i, count)}
          overlap={i > 0}
          size={size}
          disabled={disabled}
          onPress={(e) => onSelect?.(i, item, e)}
        />
      ))}
    </View>
  );
}
