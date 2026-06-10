import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./calendar.styles.js";
import { type Density } from "./calendar.styles.js";

// A month calendar: a header (month/year label flanked by prev/next chevrons),
// a weekday label row, and a 6x7 grid of day cells. Today and the selected day
// are highlighted; leading blanks pad the first row to the correct weekday.
//
// There is no CSS grid, so the day grid is a `flex-row flex-wrap` of fixed-width
// cells. Seven cells per row times the cell width gives the grid a fixed width,
// set explicitly so wrapping lands exactly seven-per-row.

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

  /** Escape hatch for layout/positioning composition (width, margins). */
  style?: StyleProp<ViewStyle>;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Density precedence: `compact` wins, otherwise the default 36px cell.
function densityOf(p: CalendarProps): Density {
  if (p.compact) return "compact";
  return "default";
}

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
    style,
  } = props;

  const { tokens } = useTheme();
  const density = densityOf(props);
  const m = s.metrics[density];
  const lead = ((startWeekday % 7) + 7) % 7;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <View style={[s.containerBase, s.containerSurface(tokens), style]}>
      {/* Header: month label between two ghost chevron buttons. */}
      <View style={s.header}>
        <Pressable
          style={({ pressed }) => [s.chevron, pressed ? { opacity: 0.9 } : null]}
          onPress={onPrev}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Text style={s.chevronText(tokens)}>{"‹"}</Text>
        </Pressable>
        <Text style={s.monthLabel(tokens)}>{month}</Text>
        <Pressable
          style={({ pressed }) => [s.chevron, pressed ? { opacity: 0.9 } : null]}
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Text style={s.chevronText(tokens)}>{"›"}</Text>
        </Pressable>
      </View>

      {/* Weekday label row. */}
      <View style={[s.grid, { width: m.gridWidth }]}>
        {WEEKDAYS.map((wd) => (
          <View key={wd} style={[s.headCell, m.head]}>
            <Text style={s.weekdayLabel(tokens)}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Day grid: leading blanks, then one cell per day. */}
      <View style={[s.grid, { width: m.gridWidth }]}>
        {Array.from({ length: lead }, (_, i) => (
          <View key={`blank-${i}`} style={[s.headCell, m.cell]} />
        ))}
        {days.map((day) => {
          const isSelected = selected != null && day === selected;
          const isToday = today != null && day === today;
          const highlighted = isSelected || isToday;
          return (
            <Pressable
              key={day}
              style={({ pressed }) => [
                s.dayCellBase,
                m.cell,
                highlighted ? s.dayCellHighlight(tokens) : null,
                pressed ? { opacity: 0.9 } : null,
              ]}
              onPress={() => onSelect?.(day)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[m.label, s.dayLabel(tokens, highlighted)]}>{day}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
