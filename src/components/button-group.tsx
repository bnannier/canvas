import { useState } from "react";
import { type GestureResponderEvent } from "react-native";
import { cn } from "../cn.js";
import { View, Pressable, Text } from "../engine/index.js";
import { Icon } from "./icon.js";

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
// Because the engine has no `first:` / `last:` variants, the joined-corner and
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
  className?: string;
}

type Kind = "segmented" | "split" | "stepper" | "spaced";
type Size = "small" | "default" | "large";

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

// Height + horizontal padding per size, mirroring the docs segSize scale.
const SIZE_CONTAINER: Record<Size, string> = {
  small: "h-8 px-3",
  default: "h-9 px-4",
  large: "h-10 px-5",
};

const SIZE_LABEL: Record<Size, string> = {
  small: "text-xs",
  default: "text-sm",
  large: "text-sm",
};

// Height-only per size, for segments whose padding differs from SIZE_CONTAINER
// (the stepper's chevron cells).
const SIZE_HEIGHT: Record<Size, string> = {
  small: "h-8",
  default: "h-9",
  large: "h-10",
};

const DEFAULT_ITEMS = ["Day", "Week", "Month"];

// Corner classes for an attached segment given its position in the row.
function joinCorners(index: number, count: number): string {
  if (count === 1) return "rounded-md";
  if (index === 0) return "rounded-l-md rounded-r-none";
  if (index === count - 1) return "rounded-r-md rounded-l-none";
  return "rounded-none";
}

interface SegmentProps {
  label: string;
  selected: boolean;
  corners: string;
  /** All but the leading segment overlap the previous border by 1px. */
  overlap: boolean;
  size: Size;
  disabled?: boolean;
  extraContainer?: string;
  onPress?: (event: GestureResponderEvent) => void;
}

function Segment({
  label,
  selected,
  corners,
  overlap,
  size,
  disabled,
  extraContainer,
  onPress,
}: SegmentProps) {
  const container = cn(
    "flex-row items-center justify-center border active:opacity-90",
    SIZE_CONTAINER[size],
    corners,
    overlap && "-ml-px",
    selected ? "z-10 border-primary bg-primary" : "border-input bg-background",
    disabled && "opacity-50",
    extraContainer,
  );
  const labelCls = cn(
    "font-medium",
    SIZE_LABEL[size],
    selected ? "text-primary-foreground" : "text-foreground",
  );
  return (
    <Pressable
      className={container}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
    >
      <Text className={labelCls}>{label}</Text>
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
  className,
}: {
  primary: string;
  menu: string[];
  size: Size;
  disabled?: boolean;
  onSelect?: (index: number, item: string, event: GestureResponderEvent) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerHeight = size === "small" ? "h-8" : size === "large" ? "h-10" : "h-9";
  return (
    <View className={cn("relative flex-row items-center self-start", disabled && "opacity-50", className)}>
      <Pressable
        className={cn(
          "flex-row items-center justify-center rounded-l-md rounded-r-none bg-primary active:opacity-90",
          SIZE_CONTAINER[size],
        )}
        onPress={(e) => onSelect?.(0, primary, e)}
        disabled={disabled}
        accessibilityRole="button"
      >
        <Text className={cn("font-medium text-primary-foreground", SIZE_LABEL[size])}>{primary}</Text>
      </Pressable>
      {/* Hairline divider so the chevron reads as a distinct trigger. */}
      <View className={cn("w-px bg-primary-foreground/20", triggerHeight)} />
      <Pressable
        className={cn(
          "flex-row items-center justify-center rounded-r-md rounded-l-none bg-primary px-2 active:opacity-90",
          triggerHeight,
        )}
        onPress={() => setOpen((o) => !o)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="More actions"
      >
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <Icon chevronDown primaryForeground size={size === "small" ? 14 : 16} />
        </View>
      </Pressable>
      {open ? (
        <View className="absolute top-full right-0 z-50 mt-1 min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-lg">
          {menu.map((item, i) => (
            <Pressable
              key={`${item}-${i}`}
              className="flex-row items-center rounded-sm px-2 py-1.5 active:bg-accent"
              onPress={(e) => {
                onSelect?.(i + 1, item, e);
                setOpen(false);
              }}
              accessibilityRole="menuitem"
            >
              <Text className="text-sm text-popover-foreground">{item}</Text>
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
  className,
}: {
  items: string[];
  initial: number;
  size: Size;
  disabled?: boolean;
  onSelect?: (index: number, item: string, event: GestureResponderEvent) => void;
  className?: string;
}) {
  const count = items.length;
  const clamp = (n: number) => (count > 0 ? Math.min(Math.max(0, n), count - 1) : 0);
  const [index, setIndex] = useState(() => clamp(initial));
  const i = clamp(index);
  const chevronSize = size === "small" ? 14 : 16;
  const step = (dir: number, e: GestureResponderEvent) => {
    if (count === 0) return;
    const next = (i + dir + count) % count;
    setIndex(next);
    onSelect?.(next, items[next], e);
  };
  const arrow = cn(
    "flex-row items-center justify-center border border-input bg-background px-2 active:opacity-90",
    SIZE_HEIGHT[size],
  );
  return (
    <View className={cn("flex-row items-center self-start", disabled && "opacity-50", className)}>
      <Pressable
        className={cn(arrow, "rounded-l-md rounded-r-none")}
        onPress={(e) => step(-1, e)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Previous"
      >
        <Icon chevronLeft muted size={chevronSize} />
      </Pressable>
      <View
        className={cn(
          "flex-row items-center justify-center border -ml-px border-input bg-background",
          SIZE_CONTAINER[size],
        )}
      >
        <Text className={cn("font-medium text-foreground", SIZE_LABEL[size])}>{items[i] ?? ""}</Text>
      </View>
      <Pressable
        className={cn(arrow, "-ml-px rounded-r-md rounded-l-none")}
        onPress={(e) => step(1, e)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Next"
      >
        <Icon chevronRight muted size={chevronSize} />
      </Pressable>
    </View>
  );
}

export function ButtonGroup(props: ButtonGroupProps) {
  const { items = DEFAULT_ITEMS, active = 0, onSelect, disabled, className } = props;
  const kind = kindOf(props);
  const size = sizeOf(props);

  // Spaced: detached peers separated by a gap, each with full rounding.
  if (kind === "spaced") {
    return (
      <View className={cn("flex-row items-center gap-2", className)}>
        {items.map((item, i) => (
          <Segment
            key={`${item}-${i}`}
            label={item}
            selected={false}
            corners="rounded-md"
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
        className={className}
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
        className={className}
      />
    );
  }

  // Segmented (default): attached segments, one selected.
  const count = items.length;
  return (
    <View className={cn("flex-row items-center", className)}>
      {items.map((item, i) => (
        <Segment
          key={`${item}-${i}`}
          label={item}
          selected={i === active}
          corners={joinCorners(i, count)}
          overlap={i > 0}
          size={size}
          disabled={disabled}
          onPress={(e) => onSelect?.(i, item, e)}
        />
      ))}
    </View>
  );
}
