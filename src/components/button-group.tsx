import { type GestureResponderEvent } from "react-native";
import { cn } from "../cn.js";
import { Box, Pressable, Text } from "../engine/index.js";

// A button group is a horizontal row of buttons that read as one control.
//
// Three kinds, picked by boolean prop (first match wins):
//   - `segmented` (default): attached segments sharing borders and joined
//     corners; one segment reads selected via `active`. Use for mutually
//     exclusive views (Day / Week / Month).
//   - `split`: a primary action attached to a smaller secondary trigger,
//     divided by a hairline. Use for one action with related variants.
//   - `spaced`: a plain row of detached buttons separated by a gap. Use for
//     a few peer actions that do not form a single control.
//
// Because the engine has no `first:` / `last:` variants, the joined-corner and
// shared-border math is computed per segment here in JS rather than in markup.

export interface ButtonGroupProps {
  /** Labels, one per segment, left to right. */
  items?: string[];
  /** Index of the selected segment (segmented kind only). */
  active?: number;
  /** Called with the pressed segment's index and label. */
  onSelect?: (index: number, item: string, event: GestureResponderEvent) => void;

  // Kind (pick one; default is segmented).
  segmented?: boolean;
  split?: boolean;
  spaced?: boolean;

  // Size (pick one; default is the medium size).
  small?: boolean;
  large?: boolean;

  disabled?: boolean;
  className?: string;
}

type Kind = "segmented" | "split" | "spaced";
type Size = "small" | "default" | "large";

// Kind precedence when more than one is passed: first match wins.
function kindOf(p: ButtonGroupProps): Kind {
  if (p.segmented) return "segmented";
  if (p.split) return "split";
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

export function ButtonGroup(props: ButtonGroupProps) {
  const { items = DEFAULT_ITEMS, active = 0, onSelect, disabled, className } = props;
  const kind = kindOf(props);
  const size = sizeOf(props);

  // Spaced: detached peers separated by a gap, each with full rounding.
  if (kind === "spaced") {
    return (
      <Box className={cn("flex-row items-center gap-2", className)}>
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
      </Box>
    );
  }

  // Split: a primary action attached to a smaller secondary trigger, the two
  // divided by a hairline so the trigger reads as distinct.
  if (kind === "split") {
    const labels = items.length > 0 ? items : DEFAULT_ITEMS;
    const primary = labels[0] ?? "Save";
    const secondary = labels[1] ?? "More";
    return (
      <Box className={cn("flex-row items-center", className)}>
        <Pressable
          className={cn(
            "flex-row items-center justify-center rounded-l-md rounded-r-none bg-primary active:opacity-90",
            SIZE_CONTAINER[size],
            disabled && "opacity-50",
          )}
          onPress={(e) => onSelect?.(0, primary, e)}
          disabled={disabled}
          accessibilityRole="button"
        >
          <Text className={cn("font-medium text-primary-foreground", SIZE_LABEL[size])}>
            {primary}
          </Text>
        </Pressable>
        {/* Hairline divider: the engine has no border-l-{color}, so the
            separator is an explicit 1px sliver tinted with the label color. */}
        <Box
          className={cn(
            "w-px bg-primary-foreground/20",
            size === "small" ? "h-8" : size === "large" ? "h-10" : "h-9",
          )}
        />
        <Pressable
          className={cn(
            "flex-row items-center justify-center rounded-r-md rounded-l-none bg-primary px-2 active:opacity-90",
            size === "small" ? "h-8" : size === "large" ? "h-10" : "h-9",
            disabled && "opacity-50",
          )}
          onPress={(e) => onSelect?.(1, secondary, e)}
          disabled={disabled}
          accessibilityRole="button"
        >
          <Text className={cn("font-medium text-primary-foreground", SIZE_LABEL[size])}>
            {secondary}
          </Text>
        </Pressable>
      </Box>
    );
  }

  // Segmented (default): attached segments, one selected.
  const count = items.length;
  return (
    <Box className={cn("flex-row items-center", className)}>
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
    </Box>
  );
}
