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
      <Column alignCenter center style={{ height: 160, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography h5 semibold>Slide 1</Typography>
      </Column>
    ) },
    { key: "two", content: (
      <Column alignCenter center style={{ height: 160, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography h5 semibold>Slide 2</Typography>
      </Column>
    ) },
    { key: "three", content: (
      <Column alignCenter center style={{ height: 160, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography h5 semibold>Slide 3</Typography>
      </Column>
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
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Featured</Typography>
      </Column>
    ) },
    { key: "b", content: (
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Popular</Typography>
      </Column>
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
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>First</Typography>
      </Column>
    ) },
    { key: "y", content: (
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Second</Typography>
      </Column>
    ) },
    { key: "z", content: (
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Third</Typography>
      </Column>
    ) }
  ]}
  onIndexChange={() => {}}
/>
```

### Arrows and dots everywhere

The chrome defaults are platform-adaptive (web shows both, iOS dots only,
Android neither); pass `showArrows` and `showDots` to force the full
arrows-plus-dots anatomy on every platform.

```tsx
<Carousel
  showArrows
  showDots
  items={[
    { key: "p", content: (
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Photos</Typography>
      </Column>
    ) },
    { key: "q", content: (
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Albums</Typography>
      </Column>
    ) },
    { key: "r", content: (
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Shared</Typography>
      </Column>
    ) }
  ]}
  defaultIndex={0}
  onIndexChange={() => {}}
/>
```

### Clamped at the ends

Without `loop` the index clamps: the prev arrow disables on the first slide and
the next arrow on the last, so the ends are unmistakable.

```tsx
<Carousel
  showArrows
  items={[
    { key: "first", content: (
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Start</Typography>
      </Column>
    ) },
    { key: "mid", content: (
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Middle</Typography>
      </Column>
    ) },
    { key: "last", content: (
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>End</Typography>
      </Column>
    ) }
  ]}
  defaultIndex={0}
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
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Step 1</Typography>
      </Column>
    ) },
    { key: "do2", content: (
      <Column alignCenter center style={{ height: 140, backgroundColor: tokens.muted }}>{/* docgen-allow-style: demo placeholder slide surface */}
        <Typography lead medium>Step 2</Typography>
      </Column>
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
