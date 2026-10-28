import { useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../template-types";

// The hand-off's Calendar (`Canvas v4.0.0 Templates.dc.html`, `t.calendar`): the October
// 2026 heading with Today and the month chevrons, the kit Calendar's month grid with a dot
// on each day that holds events, and the selected day's agenda beside it (under it once the
// screen is too narrow for two columns). Every part is a kit component from the frame's scope.

interface DayEvent {
  time: string;
  title: string;
  duration: string;
}

/** The hand-off's CAL_EV: the events of October 2026, by day. */
const EVENTS: Record<number, DayEvent[]> = {
  5: [{ time: "10:00", title: "Sprint planning", duration: "1h" }],
  12: [{ time: "14:00", title: "Token review", duration: "45m" }, { time: "16:30", title: "Design crit", duration: "30m" }],
  14: [{ time: "11:00", title: "Release v6.2", duration: "all day" }],
  21: [{ time: "09:30", title: "Accessibility audit", duration: "2h" }],
  26: [{ time: "10:00", title: "Design review", duration: "1h" }, { time: "13:30", title: "Token sync", duration: "45m" }, { time: "16:00", title: "Release v6.3", duration: "all day" }],
  28: [{ time: "15:00", title: "Android blur rebuild", duration: "1h" }],
};

/** The hand-off's DOW, indexed so that October 1, 2026 (a Thursday) reads right. */
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY = 26;

/** "10:00" as the kit Calendar's fractional hour. */
const hour = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) + (m ?? 0) / 60;
};

function CalendarScreen({ K }: TemplateScreenProps) {
  const { Row, Column, Card, Typography, Button, Icon, Calendar, useToast } = K;
  const { toast } = useToast();
  const [selected, setSelected] = useState(TODAY);
  const events = EVENTS[selected] ?? [];
  const nextMonth = () => toast({ message: "November 2026" });
  return (
    <Column airy>
      <Row between alignCenter wrap cozy>
        <Row snug baseline>
          <Typography h3 level={2}>October</Typography>
          <Typography h3 subtle>2026</Typography>
        </Row>
        <Row snug alignCenter>
          <Button secondary onPress={() => setSelected(TODAY)}>Today</Button>
          <Button outline icon accessibilityLabel="Previous month" iconLeft={<Icon chevronLeft decorative />} />
          <Button outline icon accessibilityLabel="Next month" iconLeft={<Icon chevronRight decorative />} onPress={nextMonth} />
        </Row>
      </Row>
      <Row stacks stackBreakpoint="sm" cozy>
        <Column span={7}>
          <Calendar
            month="October 2026"
            daysInMonth={31}
            startWeekday={4}
            today={TODAY}
            selected={selected}
            onSelect={setSelected}
            onNext={nextMonth}
            events={Object.entries(EVENTS).flatMap(([day, list]) =>
              list.map((e) => ({ day: Number(day), title: e.title, ...(e.duration === "all day" ? {} : { start: hour(e.time) }) })),
            )}
          />
        </Column>
        <Column span={5}>
          <Card>
            <Column cozy>
              <Typography body semibold>{`${DOW[(selected + 2) % 7]}, October ${selected}`}</Typography>
              {events.length === 0 ? <Typography small subtle>Nothing scheduled.</Typography> : null}
              {events.map((e) => (
                <Row key={e.title} cozy alignCenter>
                  <Typography caption mono subtle>{e.time}</Typography>
                  <Column fill>
                    <Card compact>
                      <Row between alignCenter snug>
                        <Typography small medium>{e.title}</Typography>
                        <Typography caption mono subtle>{e.duration}</Typography>
                      </Row>
                    </Card>
                  </Column>
                </Row>
              ))}
            </Column>
          </Card>
        </Column>
      </Row>
    </Column>
  );
}

export const CALENDAR_TEMPLATE: TemplateDoc = {
  slug: "calendar",
  name: "Calendar",
  group: "App",
  icon: "calendarDays",
  description: "Month view with a Today jump and a synced event panel for the selected day.",
  path: "calendar",
  app: true,
  Screen: CalendarScreen,
};
