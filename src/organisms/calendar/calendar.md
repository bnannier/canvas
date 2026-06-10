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
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 24 }}>
  <Calendar month="May 2026" today={23} selected={24} daysInMonth={31} startWeekday={4} />
  <Card style={{ minWidth: 240, flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <View style={{ borderBottomWidth: 1, borderColor: tokens.border, paddingHorizontal: 20, paddingVertical: 12 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens["card-foreground"] }}>May 24</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: tokens.border }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Sprint planning</Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>9:00 AM</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: tokens.border }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Design review</Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>11:30 AM</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>1:1 with manager</Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>2:00 PM</Text>
    </View>
  </Card>
</View>
```

## Do & Don't

### Single date

**Do** — Exactly one selected day (primary), with today marked separately in the accent tone.

```tsx
<View style={{ width: "auto", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, padding: 12 }}>
  <View style={{ flexDirection: "row", gap: 2 }}>
    <Pressable style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>8</Text>
    </Pressable>
    <Pressable style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: tokens.accent }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["accent-foreground"] }}>23</Text>
    </Pressable>
    <Pressable style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: tokens.primary }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["primary-foreground"] }}>24</Text>
    </Pressable>
  </View>
</View>
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
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 24 }}>
  <Calendar month="May 2026" today={23} selected={24} daysInMonth={31} startWeekday={4} />
  <Card style={{ minWidth: 240, flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <View style={{ borderBottomWidth: 1, borderColor: tokens.border, paddingHorizontal: 20, paddingVertical: 12 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens["card-foreground"] }}>May 24</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Sprint planning</Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>9:00 AM</Text>
    </View>
  </Card>
</View>
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
