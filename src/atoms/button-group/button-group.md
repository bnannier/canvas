# ButtonGroup

Segmented controls, split buttons, attached groups.

On the web the segmented control is the v4 hand-off's: the options sit in a rounded track on the raised fill, and the selected one rides a flat card thumb with a small shadow, the rest in the muted ink. It is 30, 36 or 44 px tall at the small, default and large sizes. The split button is the green call-to-action pill with its chevron half, and the stepper and the spaced peers are hairline pills the height of a Button beside them.
<!-- only: web -->
On iOS and Android the groups keep their platform shapes (the iOS segmented control, the Material 3 segmented button) in the theme's colours.
<!-- /only -->
<!-- only: ios -->
On iOS the groups keep their platform shapes (the iOS segmented control) in the theme's colours.
<!-- /only -->
<!-- only: android -->
On Android the groups keep their platform shapes (the Material 3 segmented button) in the theme's colours.
<!-- /only -->

All four kinds follow the theme's surface mode.
<!-- only: web -->
Toggle Liquid Glass in the docs,
or use `<ThemeProvider glass>` in an app:
<!-- /only -->
<!-- only: ios -->
Toggle Liquid Glass in the docs,
or use `<ThemeProvider glass>` in an app:
<!-- /only -->
<!-- only: android -->
Toggle glass in the docs,
or use `<ThemeProvider glass>` in an app:
<!-- /only -->
segmented groups paint a glass
selection puck, in the segment's own corners, on the selected segment, a split group is its call to action's
brand-tinted glass (the action colour under the material, as a primary Button), a
stepper shares a glass capsule, and spaced peers get individual glass surfaces. Every
kind keeps its solid size under glass: the material covers the track or cell's whole
footprint and a hairline border gives way to the material's edge, so switching the surface
mode never moves the page. Solid mode keeps each platform's existing skin.
<!-- only: web -->
The material uses native Liquid Glass on supported iOS
versions, the native blur or tint fallback on Android and older iOS, and
the hand-off's frost in the browser.
<!-- /only -->
<!-- only: ios -->
The material uses native Liquid Glass on supported iOS versions and the native blur or tint fallback on older ones.
<!-- /only -->
<!-- only: android -->
The material uses the native blur, or a tint fallback where the blur is unavailable.
<!-- /only -->
Reduce Transparency and Increase Contrast use the
shared material's opaque fallbacks.

A web segment is 8 px shorter than its track, padded 14 px a side (8 px for an icon
alone) with a 500 label of 12 px at the small size and 13 px otherwise. `steadyPress` preserves the resting opacity of a
segment while pressed; `start` pins the group in an app-owned host arrangement.

## Usage

```tsx
<ButtonGroup items={["Day", "Week", "Month"]} />
```

## Variants

### Small

```tsx
<ButtonGroup items={["Day", "Week", "Month"]} small />
```

### Large

```tsx
<ButtonGroup items={["Day", "Week", "Month"]} large />
```

### Disabled

```tsx
<ButtonGroup items={["Day", "Week", "Month"]} disabled />
```

### Block

```tsx
<ButtonGroup items={["Day", "Week", "Month"]} block />
```

### Block spaced

```tsx
<ButtonGroup spaced items={["Edit", "Duplicate", "Archive"]} block />
```

### Measure

```tsx
<Container>
  <Column>
    <ButtonGroup items={["Day", "Week", "Month"]} xs start />
    <ButtonGroup spaced items={["Edit", "Duplicate", "Archive"]} md />
  </Column>
</Container>
```

### Stepper

```tsx
<ButtonGroup stepper items={["Yesterday", "Today", "Tomorrow"]} />
```

### Split

```tsx
<ButtonGroup split items={["Save"]} menu={["Save as draft", "Save and close", "Save a copy"]} />
```

In glass mode the split menu is a dense-layer glass card under the group, whose
shared glass, primary label, divider and chevron stay in place. The primary action
and the chevron stay two fixed targets throughout, and a group disabled while its
menu is open closes it. Solid mode paints the skin's own menu.

### Icon segments

An item may pair its label with a kit glyph (`{ label, icon }`); `iconsOnly`
renders each segment as the glyph alone, with the label as the segment's
accessible name. An icon-only segmented control: a view switcher, a
form-factor switcher.

```tsx
<ButtonGroup
  iconsOnly
  items={[
    { label: "Phone width", icon: "smartphone" },
    { label: "Tablet width", icon: "tablet" },
    { label: "Desktop width", icon: "monitor" }
  ]}
/>
```

## Do & Don't

### Segmented

**Do** — Keep a segmented control to a few mutually-exclusive views.

```tsx
<ButtonGroup segmented defaultActive={0} items={["Day", "Week", "Month"]} />
```

**Don't** — Past ~4 options a segmented control gets cramped and hard to scan; reach for a select.

```tsx
<ButtonGroup segmented defaultActive={0} items={["Day", "Week", "Month", "Quarter", "Year", "5Y", "All"]} />
```

### Attached

**Do** — Reserve attached groups for closely-related actions like prev / today / next.

```tsx
<ButtonGroup stepper active={1} items={["Yesterday", "Today", "Tomorrow"]} />
```

**Don't** — Attaching unrelated actions implies they belong to one control.

```tsx
<ButtonGroup segmented defaultActive={-1} items={["Save", "Delete", "Export"]} />
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
      { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 36, paddingHorizontal: 18, borderTopLeftRadius: 9999, borderBottomLeftRadius: 9999, borderTopRightRadius: 0, borderBottomRightRadius: 0, backgroundColor: tokens.action },
      pressed ? { opacity: 0.9 } : null
    ]}
  >
    <Text style={{ fontWeight: "800", fontSize: 12, lineHeight: 16, letterSpacing: 0.12, color: tokens["action-foreground"] }}>Save</Text>
  </Pressable>
  <Pressable
    style={({ pressed }) => [
      { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 36, paddingLeft: 8, paddingRight: 12, borderTopRightRadius: 9999, borderBottomRightRadius: 9999, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, backgroundColor: tokens.action },
      pressed ? { opacity: 0.9 } : null
    ]}
  >
    <Icon chevronDown color={tokens["action-foreground"]} size={16} />
  </Pressable>
</View>
```
