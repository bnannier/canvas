# Button Groups

Segmented controls, split buttons, attached groups.

## Usage

```tsx
<ButtonGroup segmented active={0} items={["Day", "Week", "Month"]} small />
```

## Variants

### Variant - attached

```tsx
<ButtonGroup
  stepper
  items={[
    "May 21",
    "May 22",
    "May 23",
    "Today",
    "May 25",
    "May 26",
    "May 27"
  ]}
  active={3}
  small
/>
```

### Variant - split

```tsx
<ButtonGroup
  split
  items={["Save"]}
  menu={["Save as draft", "Save and close", "Save a copy"]}
  small
/>
```

### Size - default

```tsx
<ButtonGroup segmented active={0} items={["Day", "Week", "Month"]} />
```

### Size - lg

```tsx
<ButtonGroup segmented active={0} items={["Day", "Week", "Month"]} large />
```

### Disabled

```tsx
<ButtonGroup segmented active={0} items={["Day", "Week", "Month"]} disabled small />
```

## Do & Don't

### Segmented

**Do** — Keep a segmented control to a few mutually-exclusive views.

```tsx
<ButtonGroup segmented active={0} items={["Day", "Week", "Month"]} />
```

**Don't** — Past ~4 options a segmented control gets cramped and hard to scan; reach for a select.

```tsx
<ButtonGroup segmented active={0} items={["Day", "Week", "Month", "Quarter", "Year", "5Y", "All"]} />
```

### Attached

**Do** — Reserve attached groups for closely-related actions like prev / today / next.

```tsx
<ButtonGroup stepper active={1} items={["Yesterday", "Today", "Tomorrow"]} />
```

**Don't** — Attaching unrelated actions implies they belong to one control.

```tsx
<ButtonGroup segmented active={-1} items={["Save", "Delete", "Export"]} />
```

### Split

**Do** — Separate the chevron with a hairline so the secondary menu reads as distinct.

```tsx
<ButtonGroup split items={["Save"]} menu={["Save as draft", "Save and close", "Save a copy"]} />
```

**Don't** — With no divider the chevron looks like part of one button, hiding the menu.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start" }}>
  <Pressable
    style={({ pressed }) => [
      { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 36, paddingHorizontal: 16, borderTopLeftRadius: 6, borderBottomLeftRadius: 6, borderTopRightRadius: 0, borderBottomRightRadius: 0, backgroundColor: tokens.primary },
      pressed ? { opacity: 0.9 } : null
    ]}
  >
    <Text style={{ fontWeight: "500", fontSize: 14, lineHeight: 20, color: tokens["primary-foreground"] }}>Save</Text>
  </Pressable>
  <Pressable
    style={({ pressed }) => [
      { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 36, paddingHorizontal: 8, borderTopRightRadius: 6, borderBottomRightRadius: 6, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, backgroundColor: tokens.primary },
      pressed ? { opacity: 0.9 } : null
    ]}
  >
    <Icon chevronDown primaryForeground size={16} />
  </Pressable>
</View>
```
