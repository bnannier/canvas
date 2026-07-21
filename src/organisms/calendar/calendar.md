# Calendar

Month grid, week timeline, and day timeline in one component. Events mark their days with a dot in the month grid and week strip, and timed events render as blocks on the week/day hour timelines. The view is a semantic boolean axis: pass `week` or `day`, or neither for the month grid (`day` wins over `week` when both are set).

## Usage

A bare calendar is uncontrolled: pressing a day selects it, and in the week/day views the chevrons page the selection a week or a day at a time (crossing into another month hands the press to `onPrev`/`onNext`, since the month itself is a prop).

```tsx
<Calendar
  month="May 2026"
  today={23}
  defaultSelected={24}
  daysInMonth={31}
  startWeekday={4}
/>
```

## Variants

### Events

Each event carries the `day` it falls on, plus an optional `title` and `start`/`end` hours. The month grid marks event days with a dot and reads the count to assistive tech; the panel stays in sync by holding the selected day. (`Stateful` is a docs-only helper that holds the example's state; in your app that state is your own.)

```tsx
<Stateful initial={{
  day: 24,
  events: [
    { day: 8, title: "Design review", start: 11.5, end: 13, time: "11:30 AM" },
    { day: 14, title: "1:1 with manager", start: 14, end: 15, time: "2:00 PM" },
    { day: 23, title: "Release cut", start: 16, end: 17, time: "4:00 PM" },
    { day: 24, title: "Sprint planning", start: 9, end: 10.5, time: "9:00 AM" },
    { day: 24, title: "Team lunch", start: 12.5, end: 13.5, time: "12:30 PM" }
  ]
}}>
  {(state, set) => (
    <Row loose wrap alignStart>
      <Calendar
        month="May 2026"
        today={23}
        selected={state.day}
        onSelect={(day) => set({ ...state, day })}
        daysInMonth={31}
        startWeekday={4}
        events={state.events}
      />
      <Card grow flush style={{ minWidth: 240 }}>
        <CardHeader>
          <Typography small semibold>{`May ${state.day}`}</Typography>
        </CardHeader>
        <CardSeparator />
        <CardContent>
          {state.events.filter((e) => e.day === state.day).length === 0 ? (
            <Typography small muted>No events this day.</Typography>
          ) : (
            <Column tight>
              {state.events.filter((e) => e.day === state.day).map((e) => (
                <Row key={e.title} between alignCenter>
                  <Typography small medium>{e.title}</Typography>
                  <Typography small muted>{e.time}</Typography>
                </Row>
              ))}
            </Column>
          )}
        </CardContent>
      </Card>
    </Row>
  )}
</Stateful>
```

### Week

`week` renders the selected day's week: a strip of seven selectable day cells over an hour timeline, with each timed event as a block in its day column. Overlapping events split their column into side-by-side lanes. The chevrons page a week at a time.

```tsx
<Calendar
  week
  month="May 2026"
  today={23}
  defaultSelected={20}
  daysInMonth={31}
  startWeekday={4}
  events={[
    { day: 18, title: "Standup", start: 9, end: 9.5 },
    { day: 19, title: "Design review", start: 11, end: 12.5 },
    { day: 20, title: "Sprint planning", start: 9.5, end: 11 },
    { day: 20, title: "Team lunch", start: 12.5, end: 13.5 },
    { day: 21, title: "User interviews", start: 10, end: 12 },
    { day: 22, title: "Retro", start: 16, end: 17 },
    { day: 23, title: "Release cut", start: 14, end: 15 }
  ]}
/>
```

### Day

`day` renders a single day's hour timeline with each block carrying its title and time span. The visible range defaults to 8 AM through 6 PM and stretches to fit the events; `startHour`/`endHour` set it explicitly. The chevrons page a day at a time, so pressing next here reveals the following day's schedule.

```tsx
<Calendar
  day
  month="May 2026"
  today={23}
  defaultSelected={24}
  daysInMonth={31}
  startWeekday={4}
  events={[
    { day: 24, title: "Sprint planning", start: 9, end: 10.5 },
    { day: 24, title: "Design review", start: 11.5, end: 13 },
    { day: 24, title: "Team lunch", start: 12.5, end: 13.5 },
    { day: 25, title: "1:1 with manager", start: 14, end: 15 }
  ]}
/>
```

### Compact

`compact` tightens the cells and type for dense surfaces, in every view.

```tsx
<Row loose wrap alignStart>
  <Calendar
    compact
    month="May 2026"
    today={23}
    defaultSelected={24}
    daysInMonth={31}
    startWeekday={4}
    events={[{ day: 8 }, { day: 14 }, { day: 24 }]}
  />
  <Calendar
    compact
    day
    month="May 2026"
    defaultSelected={24}
    daysInMonth={31}
    startWeekday={4}
    events={[
      { day: 24, title: "Sprint planning", start: 9, end: 10.5 },
      { day: 24, title: "Design review", start: 11.5, end: 13 }
    ]}
  />
</Row>
```

## Do & Don't

### Single date

**Do**: Exactly one selected day (primary), with today marked separately in the accent tone.

```tsx
<Calendar month="May 2026" today={23} defaultSelected={24} daysInMonth={31} startWeekday={4} />
```

**Don't**: Painting several days with the primary selected style makes a single-date picker look like a multi-select.

```tsx
<View style={{ width: "auto", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, padding: 12 }}>
  <View style={{ flexDirection: "row", gap: 2 }}>
    <Pressable style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: tokens.primary }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["primary-foreground"] }}>8</Text>
    </Pressable>
    <Pressable style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: tokens.primary }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["primary-foreground"] }}>14</Text>
    </Pressable>
    <Pressable style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: tokens.primary }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["primary-foreground"] }}>23</Text>
    </Pressable>
  </View>
</View>
```

### Event marks

**Do**: A dot marks a day with events and the count lives in the accessible name; titles belong to the week/day timelines or a side panel.

```tsx
<Calendar
  month="May 2026"
  today={23}
  defaultSelected={24}
  daysInMonth={31}
  startWeekday={4}
  events={[{ day: 8, title: "Design review" }, { day: 14 }, { day: 24, title: "Sprint planning" }]}
/>
```

**Don't**: Cramming event titles into month cells clips them into unreadable slivers and breaks the grid's rhythm.

```tsx
<View style={{ width: "auto", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, padding: 12 }}>
  <View style={{ flexDirection: "row", gap: 2 }}>
    <View style={{ height: 40, width: 36, alignItems: "center", borderRadius: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>8</Text>
      <Text numberOfLines={1} style={{ fontSize: 7, maxWidth: 34, color: tokens["muted-foreground"] }}>Design review</Text>
    </View>
    <View style={{ height: 40, width: 36, alignItems: "center", borderRadius: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>9</Text>
    </View>
    <View style={{ height: 40, width: 36, alignItems: "center", borderRadius: 6, backgroundColor: tokens.primary }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["primary-foreground"] }}>10</Text>
      <Text numberOfLines={1} style={{ fontSize: 7, maxWidth: 34, color: tokens["primary-foreground"] }}>Sprint planning meeting</Text>
    </View>
  </View>
</View>
```

### With event list

**Do**: Keep the panel header and rows in sync with the selected day, and let the grid's dots point at the days worth visiting.

```tsx
<Row loose wrap alignStart>
  <Calendar
    month="May 2026"
    today={23}
    defaultSelected={24}
    daysInMonth={31}
    startWeekday={4}
    events={[{ day: 24, title: "Sprint planning", start: 9 }]}
  />
  <Card grow flush style={{ minWidth: 240 }}>
    <CardHeader>
      <Typography small semibold>May 24</Typography>
    </CardHeader>
    <CardSeparator />
    <CardContent>
      <Row between alignCenter>
        <Typography small medium>Sprint planning</Typography>
        <Typography small muted>9:00 AM</Typography>
      </Row>
    </CardContent>
  </Card>
</Row>
```

**Don't**: Selecting May 24 but leaving the panel on a placeholder breaks the link between the grid and its day.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 24 }}>
  <Calendar month="May 2026" today={23} defaultSelected={24} daysInMonth={31} startWeekday={4} />
  <Card flush style={{ minWidth: 240, flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Pick a date to see events.</Text>
    </View>
  </Card>
</View>
```
