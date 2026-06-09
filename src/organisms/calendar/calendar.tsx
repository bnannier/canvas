import { type GestureResponderEvent } from "react-native";
import { cn } from "../../cn.js";
import { View, Pressable, Text } from "../../engine/index.js";

// A month calendar: a header (month/year label flanked by prev/next chevrons),
// a weekday label row, and a 6x7 grid of day cells. Today and the selected day
// are highlighted; leading blanks pad the first row to the correct weekday.
//
// The engine has no CSS grid, so the day grid is a `flex-row flex-wrap` of
// fixed-width cells. Seven cells per row times the cell width gives the grid a
// fixed width, set explicitly so wrapping lands exactly seven-per-row.

export interface CalendarProps {
  /** Month + year label shown in the header, e.g. "June 2026". */
  month?: string;
  /** The day number currently selected (primary highlight). */
  selected?: number;
  /** The day number that is today (primary highlight when unselected). */
  today?: number;
  /** Number of days in the month. */
  daysInMonth?: number;
  /** Weekday (0=Sun .. 6=Sat) the 1st falls on; sets leading blank cells. */
  startWeekday?: number;
  /** Fired with the day number when a day cell is pressed. */
  onSelect?: (day: number) => void;
  /** Fired when the previous-month chevron is pressed. */
  onPrev?: (event: GestureResponderEvent) => void;
  /** Fired when the next-month chevron is pressed. */
  onNext?: (event: GestureResponderEvent) => void;

  // Density (pick one; default is the comfortable 36px cell).
  /** Tighter 32px cells and smaller type, for dense surfaces. */
  compact?: boolean;

  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Cell metrics per density. The grid width is exactly seven cell widths so the
// flex-wrap row breaks after the seventh cell.
const CELL: Record<"compact" | "default", { cell: string; grid: string; label: string; head: string }> = {
  compact: { cell: "w-8 h-8", grid: "w-[224px]", label: "text-xs", head: "w-8 h-7" },
  default: { cell: "w-9 h-9", grid: "w-[252px]", label: "text-sm", head: "w-9 h-8" },
};

export function Calendar(props: CalendarProps) {
  const {
    month = "June 2026",
    selected,
    today,
    daysInMonth = 30,
    startWeekday = 0,
    onSelect,
    onPrev,
    onNext,
    compact,
    className,
  } = props;

  const metrics = compact ? CELL.compact : CELL.default;
  const lead = ((startWeekday % 7) + 7) % 7;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <View className={cn("self-start rounded-lg border border-border bg-card p-3", className)}>
      {/* Header: month label between two ghost chevron buttons. */}
      <View className="mb-2 flex-row items-center justify-between">
        <Pressable
          className="h-7 w-7 items-center justify-center rounded-md bg-transparent active:opacity-90"
          onPress={onPrev}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Text className="text-sm text-foreground">{"‹"}</Text>
        </Pressable>
        <Text className="text-sm font-medium text-foreground">{month}</Text>
        <Pressable
          className="h-7 w-7 items-center justify-center rounded-md bg-transparent active:opacity-90"
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Text className="text-sm text-foreground">{"›"}</Text>
        </Pressable>
      </View>

      {/* Weekday label row. */}
      <View className={cn("flex-row flex-wrap", metrics.grid)}>
        {WEEKDAYS.map((wd) => (
          <View key={wd} className={cn("items-center justify-center", metrics.head)}>
            <Text className="text-xs font-medium text-muted-foreground">{wd}</Text>
          </View>
        ))}
      </View>

      {/* Day grid: leading blanks, then one cell per day. */}
      <View className={cn("flex-row flex-wrap", metrics.grid)}>
        {Array.from({ length: lead }, (_, i) => (
          <View key={`blank-${i}`} className={cn("items-center justify-center", metrics.cell)} />
        ))}
        {days.map((day) => {
          const isSelected = selected != null && day === selected;
          const isToday = today != null && day === today;
          const highlighted = isSelected || isToday;
          const cell = cn(
            "items-center justify-center rounded-full active:opacity-90",
            metrics.cell,
            highlighted && "bg-primary",
          );
          const label = cn(
            metrics.label,
            highlighted ? "font-medium text-primary-foreground" : "text-foreground",
          );
          return (
            <Pressable
              key={day}
              className={cell}
              onPress={() => onSelect?.(day)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text className={label}>{day}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
