import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { type CalendarSkin, type Density } from "./calendar.styles.js";

// Shared Calendar shell. The structure (header with prev/next chevrons + month
// label, a weekday label row, and a 6x7 grid of day cells), the density
// precedence, the leading-blank padding, the accessibility, and the press
// handlers live here once; a platform file supplies only its skin (the native
// container/header/cell shape, weekday-label style, selected/today day treatment,
// and press feedback) and calls createCalendar.
//
// A month calendar: a header (month/year label flanked by prev/next chevrons),
// a weekday label row, and a 6x7 grid of day cells. Today and the selected day
// are highlighted; leading blanks pad the first row to the correct weekday.
//
// There is no CSS grid, so the day grid is a `flex-row flex-wrap` of fixed-width
// cells. Seven cells per row times the cell width gives the grid a fixed width,
// set explicitly so wrapping lands exactly seven-per-row (width supplied by the
// skin's per-density metrics).

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

  // Density (pick one; default is the comfortable cell).
  /** Tighter cells and smaller type, for dense surfaces. */
  compact?: boolean;

  /** Escape hatch for layout/positioning composition (width, margins). */
  style?: StyleProp<ViewStyle>;
}

// Density precedence: `compact` wins, otherwise the default cell.
function densityOf(p: CalendarProps): Density {
  if (p.compact) return "compact";
  return "default";
}

/** Build a Calendar component from a platform skin. */
export function createCalendar(skin: CalendarSkin) {
  return function Calendar(props: CalendarProps) {
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
    const m = skin.metrics[density];
    const lead = ((startWeekday % 7) + 7) % 7;
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      <View style={[skin.containerBase, skin.containerSurface(tokens), style]}>
        {/* Header: month label between two ghost chevron buttons. */}
        <View style={skin.header}>
          <Pressable
            style={({ pressed }) => [
              skin.chevron,
              skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
            ]}
            android_ripple={ripple ? { ...ripple, borderless: true } : undefined}
            onPress={onPrev}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
          >
            <Text style={skin.chevronText(tokens)}>{"‹"}</Text>
          </Pressable>
          <Text style={skin.monthLabel(tokens)}>{month}</Text>
          <Pressable
            style={({ pressed }) => [
              skin.chevron,
              skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
            ]}
            android_ripple={ripple ? { ...ripple, borderless: true } : undefined}
            onPress={onNext}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <Text style={skin.chevronText(tokens)}>{"›"}</Text>
          </Pressable>
        </View>

        {/* Weekday label row. */}
        <View style={[skin.grid, { width: m.gridWidth }]}>
          {skin.weekdays.map((wd, i) => (
            <View key={`wd-${i}`} style={[skin.headCell, m.head]}>
              <Text style={skin.weekdayLabel(tokens)}>{wd}</Text>
            </View>
          ))}
        </View>

        {/* Day grid: leading blanks, then one cell per day. */}
        <View style={[skin.grid, { width: m.gridWidth }]}>
          {Array.from({ length: lead }, (_, i) => (
            <View key={`blank-${i}`} style={[skin.headCell, m.cell]} />
          ))}
          {days.map((day) => {
            const isSelected = selected != null && day === selected;
            const isToday = today != null && day === today;
            const state = { selected: isSelected, today: isToday };
            return (
              <Pressable
                key={day}
                style={({ pressed }) => [
                  skin.dayCellBase,
                  m.cell,
                  skin.dayCellState(tokens, state),
                  skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
                ]}
                android_ripple={ripple}
                onPress={() => onSelect?.(day)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                aria-selected={isSelected}
              >
                <Text style={[m.label, skin.dayLabel(tokens, state)]}>{day}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };
}
