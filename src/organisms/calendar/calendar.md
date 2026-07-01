# Calendars

Date picker, event list. Production: wrap react-day-picker.

## Usage

```tsx
<Calendar
  month="May 2026"
  today={23}
  selected={24}
  daysInMonth={31}
  startWeekday={4}
/>
```

## Variants

### Variant - events

```tsx
<Row loose wrap alignStart>
  <Calendar month="May 2026" today={23} selected={24} daysInMonth={31} startWeekday={4} />
  <Card grow style={{ minWidth: 240 }}>
    <CardHeader>
      <Typography small semibold>May 24</Typography>
    </CardHeader>
    <CardSeparator />
    <CardContent>
      <Column tight>
        <Row between alignCenter>
          <Typography small medium>Sprint planning</Typography>
          <Typography small muted>9:00 AM</Typography>
        </Row>
        <Divider />
        <Row between alignCenter>
          <Typography small medium>Design review</Typography>
          <Typography small muted>11:30 AM</Typography>
        </Row>
        <Divider />
        <Row between alignCenter>
          <Typography small medium>1:1 with manager</Typography>
          <Typography small muted>2:00 PM</Typography>
        </Row>
      </Column>
    </CardContent>
  </Card>
</Row>
```

## Do & Don't

### Single date

**Do** — Exactly one selected day (primary), with today marked separately in the accent tone.

```tsx
<Calendar month="May 2026" today={23} selected={24} daysInMonth={31} startWeekday={4} />
```

**Don't** — Painting several days with the primary selected style makes a single-date picker look like a multi-select.

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

### With event list

**Do** — Keep the panel header and rows in sync with the selected day so the two views always agree.

```tsx
<Row loose wrap alignStart>
  <Calendar month="May 2026" today={23} selected={24} daysInMonth={31} startWeekday={4} />
  <Card grow style={{ minWidth: 240 }}>
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

**Don't** — Selecting May 24 but leaving the panel on a placeholder breaks the link between the grid and its day.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 24 }}>
  <Calendar month="May 2026" today={23} selected={24} daysInMonth={31} startWeekday={4} />
  <Card style={{ minWidth: 240, flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Pick a date to see events.</Text>
    </View>
  </Card>
</View>
```
