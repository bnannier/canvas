import { Calendar } from "@nannier/canvas";

const base = { month: "May 2026", today: 23, daysInMonth: 31, startWeekday: 4 };

export const MonthWithEvents = () => (
  <Calendar
    {...base}
    defaultSelected={24}
    events={[
      { day: 8, title: "Design review" },
      { day: 14, title: "1:1 with manager" },
      { day: 24, title: "Sprint planning" },
    ]}
  />
);

export const RangeSelection = () => <Calendar {...base} range defaultRangeStart={14} defaultRangeEnd={20} />;

export const WeekView = () => (
  <Calendar
    {...base}
    week
    defaultSelected={20}
    events={[
      { day: 19, title: "Design review", start: 11, end: 12.5 },
      { day: 20, title: "Sprint planning", start: 9.5, end: 11 },
      { day: 21, title: "User interviews", start: 10, end: 12 },
    ]}
  />
);

export const DayView = () => (
  <Calendar
    {...base}
    day
    defaultSelected={24}
    events={[
      { day: 24, title: "Sprint planning", start: 9, end: 10.5, description: "Backlog grooming and capacity check for the next sprint." },
      { day: 24, title: "Design review", start: 11.5, end: 13 },
      { day: 24, title: "Team lunch", start: 12.5, end: 13.5 },
    ]}
  />
);

export const Compact = () => <Calendar {...base} compact defaultSelected={24} />;
