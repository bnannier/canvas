# Carousel

A horizontally paged slide viewer: swipe (or use the prev/next arrows and the
dot indicators) to move one slide at a time. Paging snaps to the viewport width,
the current slide drives the dots, and the arrows step the index (clamped, or
wrapped when `loop`). Slides hold any content; pass an `items` array of
`{ key, content }`.

## Usage

```tsx
<Carousel
  items={[
    { key: "one", content: (
      <View style={{ height: 160, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: tokens.foreground }}>Slide 1</Text>
      </View>
    ) },
    { key: "two", content: (
      <View style={{ height: 160, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: tokens.foreground }}>Slide 2</Text>
      </View>
    ) },
    { key: "three", content: (
      <View style={{ height: 160, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: tokens.foreground }}>Slide 3</Text>
      </View>
    ) }
  ]}
  defaultIndex={0}
  onIndexChange={() => {}}
/>
```

## Variants

### Arrows hidden (dots only)

Hide the prev/next chevrons with `showArrows={false}`; swipe and the dots still
page the carousel, the iOS page-control idiom.

```tsx
<Carousel
  showArrows={false}
  items={[
    { key: "a", content: (
      <View style={{ height: 140, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: tokens.foreground }}>Featured</Text>
      </View>
    ) },
    { key: "b", content: (
      <View style={{ height: 140, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: tokens.foreground }}>Popular</Text>
      </View>
    ) }
  ]}
  defaultIndex={0}
  onIndexChange={() => {}}
/>
```

### Default index

Start on a later slide with `defaultIndex`; the matching dot reads selected.

```tsx
<Carousel
  defaultIndex={1}
  loop
  items={[
    { key: "x", content: (
      <View style={{ height: 140, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: tokens.foreground }}>First</Text>
      </View>
    ) },
    { key: "y", content: (
      <View style={{ height: 140, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: tokens.foreground }}>Second</Text>
      </View>
    ) },
    { key: "z", content: (
      <View style={{ height: 140, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: tokens.foreground }}>Third</Text>
      </View>
    ) }
  ]}
  onIndexChange={() => {}}
/>
```

## Do & Don't

**Do** — Keep one current slide and let the dots mirror it, so the position in
the set is always clear.

```tsx
<Carousel
  items={[
    { key: "do1", content: (
      <View style={{ height: 140, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: tokens.foreground }}>Step 1</Text>
      </View>
    ) },
    { key: "do2", content: (
      <View style={{ height: 140, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: tokens.foreground }}>Step 2</Text>
      </View>
    ) }
  ]}
  defaultIndex={0}
  onIndexChange={() => {}}
/>
```

**Don't** — Stack the slides yourself with a manual row of pressables; it loses
the snap paging, the synced dots, and the per-slide accessibility.

```tsx
<View style={{ flexDirection: "row", gap: 8 }}>
  <View style={{ width: 200, height: 140, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
    <Text style={{ fontSize: 16, color: tokens.foreground }}>Slide 1</Text>
  </View>
  <View style={{ width: 200, height: 140, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: tokens.muted }}>
    <Text style={{ fontSize: 16, color: tokens.foreground }}>Slide 2</Text>
  </View>
</View>
```
