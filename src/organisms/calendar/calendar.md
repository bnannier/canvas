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

## Do & Don't

### Single date

**Do** — Exactly one selected day (primary), with today marked separately in the accent tone.

```tsx
<View className="w-fit rounded-lg border border-border p-3">
  <View className="flex-row gap-0.5">
    <Pressable className="h-9 w-9 items-center justify-center rounded-md">
      <Text className="text-sm text-foreground">8</Text>
    </Pressable>
    <Pressable className="h-9 w-9 items-center justify-center rounded-md bg-accent">
      <Text className="text-sm font-medium text-accent-foreground">23</Text>
    </Pressable>
    <Pressable className="h-9 w-9 items-center justify-center rounded-md bg-primary">
      <Text className="text-sm text-primary-foreground">24</Text>
    </Pressable>
  </View>
</View>
```

**Don't** — Painting several days with the primary selected style makes a single-date picker look like a multi-select.

```tsx
<View className="w-fit rounded-lg border border-border p-3">
  <View className="flex-row gap-0.5">
    <Pressable className="h-9 w-9 items-center justify-center rounded-md bg-primary">
      <Text className="text-sm text-primary-foreground">8</Text>
    </Pressable>
    <Pressable className="h-9 w-9 items-center justify-center rounded-md bg-primary">
      <Text className="text-sm text-primary-foreground">14</Text>
    </Pressable>
    <Pressable className="h-9 w-9 items-center justify-center rounded-md bg-primary">
      <Text className="text-sm text-primary-foreground">23</Text>
    </Pressable>
  </View>
</View>
```

### With event list

**Do** — Keep the panel header and rows in sync with the selected day so the two views always agree.

```tsx
<View className="flex-row flex-wrap items-start gap-6">
  <Calendar month="May 2026" today={23} selected={24} daysInMonth={31} startWeekday={4} />
  <Card className="min-w-[240px] flex-1">
    <View className="border-b border-border px-5 py-3">
      <Text className="text-sm font-semibold text-card-foreground">May 24</Text>
    </View>
    <View className="flex-row items-center justify-between px-4 py-2.5">
      <Text className="text-sm font-medium text-foreground">Sprint planning</Text>
      <Text className="text-sm text-muted-foreground">9:00 AM</Text>
    </View>
  </Card>
</View>
```

**Don't** — Selecting May 24 but leaving the panel on a placeholder breaks the link between the grid and its day.

```tsx
<View className="flex-row flex-wrap items-start gap-6">
  <Calendar month="May 2026" today={23} selected={24} daysInMonth={31} startWeekday={4} />
  <Card className="min-w-[240px] flex-1">
    <View className="px-4 py-3">
      <Text className="text-sm text-muted-foreground">Pick a date to see events.</Text>
    </View>
  </Card>
</View>
```
