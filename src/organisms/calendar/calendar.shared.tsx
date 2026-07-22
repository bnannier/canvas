import { useEffect, useRef, useState } from "react";
import { type GestureResponderEvent, type View as RNView } from "react-native";
import { View, Pressable, Text, RippleClip, cornerRadii, useTheme, useControllableState, AnchoredOverlay, useEscapeKey, type StyleProp, type ViewStyle } from "../../style/index.js";
import { type CalendarSkin, type DayState, type Density } from "./calendar.styles.js";

// Shared Calendar shell. The structure (header with prev/next chevrons + view
// label, the month grid, and the week/day timelines), the density and view
// precedence, the leading-blank padding, the event model, the accessibility, and
// the press handlers live here once; a platform file supplies only its skin (the
// native container/header/cell shape, weekday-label style, selected/today day
// treatment, event dot/block treatment, and press feedback) and calls
// createCalendar.
//
// Views (one axis, month is the default):
//   month — a header, a weekday label row, and a 6x7 grid of day cells. Today and
//     the selected day are highlighted; leading blanks pad the first row to the
//     correct weekday; a day with events carries a dot under its number.
//   week — a strip of the seven day cells around the selected day, over an
//     hour-axis time grid; timed events render as positioned blocks in their day
//     column. Chevrons page a week at a time within the month.
//   day — a single-day hour timeline of the selected day's timed events.
//     Chevrons page a day at a time within the month.
// In week/day views the chevrons move the selection (so a bare calendar pages out
// of the box) and fire onPrev/onNext only when the step would leave the month —
// the month itself is a prop, so crossing it is the consumer's move.
//
// There is no CSS grid, so the month grid is a `flex-row flex-wrap` of fixed-width
// cells. Seven cells per row times the cell width gives the grid a fixed width,
// set explicitly so wrapping lands exactly seven-per-row (width supplied by the
// skin's per-density metrics). The timelines instead flex their day columns inside
// a fixed desktop-first container width capped at 100%, so week/day scale down to
// a phone without a breakpoint.

export interface CalendarEvent {
  /** Day of month the event falls on (1-based). */
  day: number;
  /** Title shown on the event block in the week/day timelines and read to assistive tech. */
  title?: string;
  /** Start hour, 0-24; fractions are minutes (9.5 = 9:30). Untimed events (no start) mark the day with a dot but stay out of the timelines. */
  start?: number;
  /** End hour, 0-24; defaults to one hour after `start`. */
  end?: number;
}

export interface CalendarProps {
  /** Month + year label shown in the header, e.g. "June 2026". */
  month?: string;
  /** The day number currently selected (CONTROLLED, primary highlight). Omit for uncontrolled use. */
  selected?: number;
  /** Initial selected day for uncontrolled use (a bare calendar highlights the day on press). */
  defaultSelected?: number;
  /** The day number that is today (primary highlight when unselected). */
  today?: number;
  /** Number of days in the month. */
  daysInMonth?: number;
  /** Weekday (0=Sun .. 6=Sat) the 1st falls on; sets leading blank cells. */
  startWeekday?: number;
  /** Events to mark: dots on their days in the month grid and week strip, timed blocks in the week/day timelines. */
  events?: CalendarEvent[];
  /** Fired with the day number when a day cell is pressed (and when week/day chevron paging moves the selection). */
  onSelect?: (day: number) => void;
  /** Fired with the event when a timed block in the week/day timeline is pressed. */
  onEventPress?: (event: CalendarEvent) => void;
  /** Fired when the previous chevron is pressed in the month view, or when week/day paging would cross into the previous month. */
  onPrev?: (event: GestureResponderEvent) => void;
  /** Fired when the next chevron is pressed in the month view, or when week/day paging would cross into the next month. */
  onNext?: (event: GestureResponderEvent) => void;

  // View (pick one; default is the month grid). Precedence: day, then week.
  /** Seven-day strip over an hour timeline; chevrons page by week. */
  week?: boolean;
  /** Single-day hour timeline; chevrons page by day. */
  day?: boolean;

  /** Month view: pressing a day that has events also opens that day's hour timeline in an anchored overlay (a tooltip-style day peek) beside the cell — to its right, to its left when the right lacks room, and below it when neither side fits — dismissed by an outside tap or Escape. */
  dayPeek?: boolean;

  /** First hour shown on the week/day timeline (0-24; default 8, extended to fit events). */
  startHour?: number;
  /** Last hour shown on the week/day timeline (0-24; default 18, extended to fit events). */
  endHour?: number;

  // Density (pick one; default is the comfortable cell).
  /** Tighter cells and smaller type, for dense surfaces. */
  compact?: boolean;

  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// Density precedence: `compact` wins, otherwise the default cell.
function densityOf(p: CalendarProps): Density {
  if (p.compact) return "compact";
  return "default";
}

// View precedence: `day` wins, then `week`, otherwise the month grid.
function viewOf(p: CalendarProps): "month" | "week" | "day" {
  if (p.day) return "day";
  if (p.week) return "week";
  return "month";
}

const WEEKDAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// "9 AM" / "9:30 AM" from a 0-24 fractional hour.
function formatHour(h: number): string {
  const clamped = Math.max(0, Math.min(24, h));
  const whole = Math.floor(clamped);
  const minutes = Math.round((clamped - whole) * 60);
  const suffix = whole % 24 >= 12 ? "PM" : "AM";
  const twelve = ((whole + 11) % 12) + 1;
  return minutes > 0 ? `${twelve}:${String(minutes).padStart(2, "0")} ${suffix}` : `${twelve} ${suffix}`;
}

// A timed event's [start, end) hours, with the end defaulted and a floor so a
// zero-length event still draws a visible block.
function spanOf(e: CalendarEvent): [number, number] {
  const start = e.start ?? 0;
  return [start, Math.max(e.end ?? start + 1, start + 0.25)];
}

// Greedy cluster/lane layout for one day's timed events: overlapping events split
// the column into side-by-side lanes; non-overlapping clusters get the full width
// back. Returns each event with its lane and its cluster's lane count.
function layoutLanes(events: CalendarEvent[]): { event: CalendarEvent; lane: number; lanes: number }[] {
  const sorted = [...events].sort((a, b) => spanOf(a)[0] - spanOf(b)[0] || spanOf(a)[1] - spanOf(b)[1]);
  const placed: { event: CalendarEvent; lane: number; lanes: number }[] = [];
  let cluster: { event: CalendarEvent; lane: number }[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    for (const c of cluster) placed.push({ ...c, lanes: laneEnds.length });
    cluster = [];
    laneEnds = [];
    clusterEnd = -Infinity;
  };
  for (const event of sorted) {
    const [start, end] = spanOf(event);
    if (cluster.length > 0 && start >= clusterEnd) flush();
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    cluster.push({ event, lane });
    clusterEnd = Math.max(clusterEnd, end);
  }
  flush();
  return placed;
}

/** Build a Calendar component from a platform skin. */
export function createCalendar(skin: CalendarSkin) {
  return function Calendar(props: CalendarProps) {
    const {
      month = "June 2026",
      today,
      daysInMonth = 30,
      startWeekday = 0,
      events = [],
      onSelect,
      onEventPress,
      onPrev,
      onNext,
      testID,
      style,
    } = props;

    // Controlled when `selected` is provided, self-managed otherwise, so a bare
    // calendar highlights the pressed day (and pages its week/day) instead of
    // ignoring the tap.
    const [selected, setSelected] = useControllableState<number | undefined>(props.selected, props.defaultSelected);
    // The day whose timeline the anchored peek overlay is showing (dayPeek only).
    const [peekDay, setPeekDay] = useState<number | null>(null);
    // Every day cell registers its node so the peek can anchor to the pressed one.
    const cellRefs = useRef(new Map<number, RNView>());
    const peekAnchorRef = useRef<RNView | null>(null);
    const { tokens } = useTheme();
    const density = densityOf(props);
    const view = viewOf(props);
    const m = skin.metrics[density];
    const tm = skin.timeline[density];
    const lead = ((startWeekday % 7) + 7) % 7;
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    const eventsOn = (dayNum: number) => events.filter((e) => e.day === dayNum);
    const weekdayOf = (dayNum: number) => (lead + dayNum - 1) % 7;

    // The peek belongs to one month's grid: close it when the month swaps out
    // from under it, and let Escape dismiss it like any overlay.
    useEffect(() => setPeekDay(null), [month]);
    useEscapeKey(peekDay != null, () => setPeekDay(null));
    // The day the week/day views revolve around.
    const anchor = Math.min(Math.max(selected ?? today ?? 1, 1), daysInMonth);
    // Day-of-month the anchor's week starts on; ≤ 0 in a leading-blank first week.
    const weekStart = anchor - weekdayOf(anchor);

    const pick = (dayNum: number) => {
      setSelected(dayNum);
      onSelect?.(dayNum);
    };

    // Week/day chevrons page the selection within the month and only hand the
    // press to onPrev/onNext when the step would cross the month boundary.
    const page = (delta: number, handler: ((e: GestureResponderEvent) => void) | undefined) => (e: GestureResponderEvent) => {
      if (view === "month") {
        handler?.(e);
        return;
      }
      if (view === "day") {
        const next = anchor + delta;
        if (next < 1 || next > daysInMonth) handler?.(e);
        else pick(next);
        return;
      }
      const nextStart = weekStart + delta * 7;
      // A week exists in this month if any of its seven days lands inside it.
      if (nextStart > daysInMonth || nextStart + 6 < 1) handler?.(e);
      else pick(Math.min(Math.max(nextStart, 1), daysInMonth));
    };

    // Visible hour range: explicit props win; otherwise 8–18 stretched to fit
    // every timed event, so a bare timeline never clips a block.
    const timed = events.filter((e) => e.start != null);
    const rangeStart = Math.floor(
      props.startHour ?? Math.min(8, ...timed.map((e) => spanOf(e)[0])),
    );
    const rangeEnd = Math.max(
      Math.ceil(props.endHour ?? Math.max(18, ...timed.map((e) => spanOf(e)[1]))),
      rangeStart + 1,
    );
    const hours = Array.from({ length: rangeEnd - rangeStart }, (_, i) => rangeStart + i);

    const chevronUnit = view === "month" ? "month" : view;
    const monthName = month.split(" ")[0];

    const header = (label: string) => (
      <View style={skin.header}>
        <Pressable
          style={({ pressed }) => [
            skin.chevron,
            skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
          ]}
          android_ripple={ripple ? { ...ripple, borderless: true } : undefined}
          onPress={page(-1, onPrev)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Previous ${chevronUnit}`}
        >
          <Text style={skin.chevronText(tokens)}>{"‹"}</Text>
        </Pressable>
        <Text style={skin.monthLabel(tokens)}>{label}</Text>
        <Pressable
          style={({ pressed }) => [
            skin.chevron,
            skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
          ]}
          android_ripple={ripple ? { ...ripple, borderless: true } : undefined}
          onPress={page(1, onNext)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Next ${chevronUnit}`}
        >
          <Text style={skin.chevronText(tokens)}>{"›"}</Text>
        </Pressable>
      </View>
    );

    // One selectable day cell (month grid + week strip): number, state fill, and
    // the event dot. The bounded ripple is clipped by the RippleClip parent (a
    // node can never clip its own ripple on Android).
    const dayCell = (dayNum: number) => {
      const isSelected = selected != null && dayNum === selected;
      const isToday = today != null && dayNum === today;
      const state: DayState = { selected: isSelected, today: isToday };
      const count = eventsOn(dayNum).length;
      return (
        <RippleClip key={dayNum} shape={cornerRadii(skin.dayCellBase)}>
          <Pressable
            ref={(node) => {
              if (node) cellRefs.current.set(dayNum, node);
              else cellRefs.current.delete(dayNum);
            }}
            style={({ pressed }) => [
              skin.dayCellBase,
              m.cell,
              skin.dayCellState(tokens, state),
              skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
            ]}
            android_ripple={ripple}
            onPress={() => {
              pick(dayNum);
              if (props.dayPeek && view === "month") {
                if (count > 0) {
                  peekAnchorRef.current = cellRefs.current.get(dayNum) ?? null;
                  setPeekDay(dayNum);
                } else {
                  setPeekDay(null);
                }
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={`${dayNum}${isToday ? ", today" : ""}${isSelected ? ", selected" : ""}${
              count > 0 ? `, ${count} event${count === 1 ? "" : "s"}` : ""
            }`}
            accessibilityState={{ selected: isSelected }}
            aria-selected={isSelected}
          >
            <Text style={[m.label, skin.dayLabel(tokens, state)]}>{dayNum}</Text>
            {count > 0 ? <View style={[skin.eventDot, skin.eventDotColor(tokens, state)]} /> : null}
          </Pressable>
        </RippleClip>
      );
    };

    // The absolutely-positioned timed blocks for one day, laid over the hour
    // slots inside an inset layer (insets beat absolute-in-padding differences
    // between Yoga and the web). `rs`/`re` bound the visible hours (the views use
    // the shared range; the day peek passes a tighter slice).
    const eventLayer = (dayNum: number, showTime: boolean, rs = rangeStart, re = rangeEnd) => {
      const blocks = layoutLanes(timed.filter((e) => e.day === dayNum));
      if (blocks.length === 0) return null;
      return (
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 2, right: 2 }}>
          {blocks.map(({ event, lane, lanes }, i) => {
            const [start, end] = spanOf(event);
            const top = (Math.max(start, rs) - rs) * tm.hourHeight;
            const bottom = (Math.min(end, re) - rs) * tm.hourHeight;
            if (bottom <= 0 || top >= (re - rs) * tm.hourHeight) return null;
            const label = `${event.title ?? "Event"}, ${formatHour(start)} to ${formatHour(end)}`;
            const position: ViewStyle = {
              position: "absolute",
              top,
              height: Math.max(bottom - top, 12),
              left: `${(lane / lanes) * 100}%`,
              width: `${100 / lanes}%`,
            };
            const body = (
              <>
                {event.title != null ? (
                  <Text numberOfLines={1} style={skin.eventTitle(tokens)}>{event.title}</Text>
                ) : null}
                {showTime ? (
                  <Text numberOfLines={1} style={skin.eventTime(tokens)}>{`${formatHour(start)} – ${formatHour(end)}`}</Text>
                ) : null}
              </>
            );
            return (
              <RippleClip key={`${event.day}-${i}`} shape={cornerRadii(skin.eventBlock)} style={position}>
                {onEventPress ? (
                  <Pressable
                    style={({ pressed }) => [
                      skin.eventBlock,
                      skin.eventBlockSurface(tokens),
                      { flex: 1 },
                      skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
                    ]}
                    android_ripple={ripple ? { color: ripple.color, borderless: false } : undefined}
                    onPress={() => onEventPress(event)}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                  >
                    {body}
                  </Pressable>
                ) : (
                  <View
                    style={[skin.eventBlock, skin.eventBlockSurface(tokens), { flex: 1 }]}
                    accessible
                    accessibilityLabel={label}
                  >
                    {body}
                  </View>
                )}
              </RippleClip>
            );
          })}
        </View>
      );
    };

    // The left hour rail: one row per hour, its label hugging the slot line.
    const axisFor = (hrs: number[]) => (
      <View style={{ width: tm.axisWidth }}>
        {hrs.map((h) => (
          <View key={h} style={{ height: tm.hourHeight, alignItems: "flex-end", paddingRight: 6 }}>
            <Text style={skin.hourLabel(tokens)}>{formatHour(h)}</Text>
          </View>
        ))}
      </View>
    );

    // The stacked hour slots that draw the horizontal grid lines.
    const slotsFor = (hrs: number[]) =>
      hrs.map((h) => <View key={h} style={[{ height: tm.hourHeight }, skin.slotLine(tokens)]} />);

    const hourAxis = axisFor(hours);
    const slotLines = slotsFor(hours);

    if (view === "day") {
      const label = `${WEEKDAYS_FULL[weekdayOf(anchor)]}, ${monthName} ${anchor}`;
      return (
        <View testID={testID} style={[skin.containerBase, skin.containerSurface(tokens), { width: tm.dayWidth, maxWidth: "100%" }, style]}>
          {header(label)}
          <View style={{ flexDirection: "row" }}>
            {hourAxis}
            <View style={{ flex: 1 }}>
              {slotLines}
              {eventLayer(anchor, true)}
            </View>
          </View>
        </View>
      );
    }

    if (view === "week") {
      const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i);
      return (
        <View testID={testID} style={[skin.containerBase, skin.containerSurface(tokens), { width: tm.weekWidth, maxWidth: "100%" }, style]}>
          {header(month)}
          {/* Week strip: weekday label over the selectable day cell, aligned to the timeline columns below. */}
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: tm.axisWidth }} />
            {weekDays.map((dayNum, i) => (
              <View key={`strip-${i}`} style={{ flex: 1, alignItems: "center" }}>
                {/* The strip starts at the week's first weekday, so column i is weekday i. */}
                <View style={skin.headCell}>
                  <Text style={skin.weekdayLabel(tokens)}>{skin.weekdays[i]}</Text>
                </View>
                {dayNum >= 1 && dayNum <= daysInMonth ? (
                  dayCell(dayNum)
                ) : (
                  <View style={[skin.headCell, m.cell]} />
                )}
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", marginTop: 4 }}>
            {hourAxis}
            {weekDays.map((dayNum, i) => (
              <View key={`col-${i}`} style={[{ flex: 1 }, skin.colDivider(tokens)]}>
                {slotLines}
                {dayNum >= 1 && dayNum <= daysInMonth ? eventLayer(dayNum, false) : null}
              </View>
            ))}
          </View>
        </View>
      );
    }

    // The anchored day peek: the pressed day's timeline in a floating overlay
    // card. Untimed events list as title rows; timed events render the same
    // hour-slice timeline the day view draws, bounded to the day's events.
    const dayPeekOverlay = () => {
      if (peekDay == null) return null;
      const dayEvents = eventsOn(peekDay);
      const timedDay = dayEvents.filter((e) => e.start != null);
      const untimed = dayEvents.filter((e) => e.start == null);
      // Bound the slice to this day's events (min two hours so a lone half-hour
      // event still reads as a timeline).
      const rs = timedDay.length ? Math.max(0, Math.floor(Math.min(...timedDay.map((e) => spanOf(e)[0])))) : 0;
      const re = timedDay.length ? Math.min(24, Math.max(Math.ceil(Math.max(...timedDay.map((e) => spanOf(e)[1]))), rs + 2)) : 0;
      const peekHours = Array.from({ length: re - rs }, (_, i) => rs + i);
      return (
        <AnchoredOverlay
          key={peekDay}
          open
          onDismiss={() => setPeekDay(null)}
          triggerRef={peekAnchorRef}
          gap={6}
          cardWidth={tm.peekWidth}
          preferSide
          cardStyle={[skin.peekCard(tokens), { width: tm.peekWidth }]}
          inlineStyle={{ position: "absolute", top: "100%", left: 0 }}
        >
          <Text style={skin.peekTitle(tokens)}>{`${WEEKDAYS_FULL[weekdayOf(peekDay)]}, ${monthName} ${peekDay}`}</Text>
          {untimed.map((e, i) => (
            <View key={`untimed-${i}`} style={{ marginTop: 6 }}>
              <Text numberOfLines={1} style={skin.eventTitle(tokens)}>{e.title ?? "Event"}</Text>
            </View>
          ))}
          {timedDay.length > 0 ? (
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              {axisFor(peekHours)}
              <View style={{ flex: 1 }}>
                {slotsFor(peekHours)}
                {eventLayer(peekDay, true, rs, re)}
              </View>
            </View>
          ) : null}
        </AnchoredOverlay>
      );
    };

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return (
      <View testID={testID} style={[skin.containerBase, skin.containerSurface(tokens), style]}>
        {header(month)}

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
          {days.map((dayNum) => dayCell(dayNum))}
        </View>

        {dayPeekOverlay()}
      </View>
    );
  };
}
