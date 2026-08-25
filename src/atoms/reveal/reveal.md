# Reveal

An entrance for page content: what it wraps starts slightly offset and transparent, then travels into place and fades in when it reaches the viewport. It fires once and stays, so content that has arrived never leaves again. Direction chooses the axis it travels from, with `fromBelow` the default and `fromAbove`, `fromLeft`, `fromRight` the alternatives (that is also the precedence order if more than one is passed). `pronounced` travels further, `brisk` arrives faster, and `deepInView` holds the entrance until the element is properly inside the viewport instead of firing as it enters. Stagger is structural rather than numeric: wrap a set in `RevealGroup` and each child arrives after the one before it, so no call site ever computes a delay. `RevealGroup` renders no box of its own, so it can sit between a grid and the items the grid lays out. The trigger is measured against the window rather than the nearest scrolling parent, so content sitting inside a short inner scroller can arrive before that scroller has been scrolled to it; reveal on the page scroll, which is what this is for. Under Reduce Motion the content renders its final frame immediately, with no measuring and no timers, and the stagger is skipped along with the motion.

## Usage

```tsx
<Reveal>
  <Card padded style={{ width: 300, maxWidth: "100%" }}>
    <Column tight>
      <Typography h4 semibold>Built for scroll</Typography>
      <Typography small muted>This card rose into place when it reached the viewport.</Typography>
    </Column>
  </Card>
</Reveal>
```

## Variants

### Replay

```tsx
<Ticker values={[1, 2]} interval={2800}>
  {(pass) => (
    <Reveal key={pass}>
      <Card padded style={{ width: 300, maxWidth: "100%" }}>
        <Column tight>
          <Typography h4 semibold>Arriving</Typography>
          <Typography small muted>The same entrance, played again every few seconds.</Typography>
        </Column>
      </Card>
    </Reveal>
  )}
</Ticker>
```

### Staggered group

```tsx
<Ticker values={[1, 2]} interval={2800}>
  {(pass) => (
    <Row cozy wrap key={pass}>
      <RevealGroup>
        <Reveal>
          <Card padded style={{ width: 150 }}>
            <Typography small semibold>Measure</Typography>
          </Card>
        </Reveal>
        <Reveal>
          <Card padded style={{ width: 150 }}>
            <Typography small semibold>Reveal</Typography>
          </Card>
        </Reveal>
        <Reveal>
          <Card padded style={{ width: 150 }}>
            <Typography small semibold>Settle</Typography>
          </Card>
        </Reveal>
      </RevealGroup>
    </Row>
  )}
</Ticker>
```

### From above

```tsx
<Reveal fromAbove>
  <Card padded style={{ width: 300, maxWidth: "100%" }}>
    <Typography small semibold>Descends into place</Typography>
  </Card>
</Reveal>
```

### From the left

```tsx
<Reveal fromLeft>
  <Card padded style={{ width: 300, maxWidth: "100%" }}>
    <Typography small semibold>Slides in from the left</Typography>
  </Card>
</Reveal>
```

### From the right

```tsx
<Reveal fromRight>
  <Card padded style={{ width: 300, maxWidth: "100%" }}>
    <Typography small semibold>Slides in from the right</Typography>
  </Card>
</Reveal>
```

### Pronounced

```tsx
<Reveal pronounced>
  <Card padded style={{ width: 300, maxWidth: "100%" }}>
    <Typography small semibold>Travels further before settling</Typography>
  </Card>
</Reveal>
```

### Brisk

```tsx
<Reveal brisk>
  <Card padded style={{ width: 300, maxWidth: "100%" }}>
    <Typography small semibold>Arrives faster</Typography>
  </Card>
</Reveal>
```

### Deep in view

```tsx
<Reveal deepInView>
  <Card padded style={{ width: 300, maxWidth: "100%" }}>
    <Typography small semibold>Waits until it is properly in view</Typography>
  </Card>
</Reveal>
```

## Do & Don't

### stagger

**Do** - Wrap the set in a `RevealGroup` and let each item's position set its own rhythm.

```tsx
<Row cozy wrap>
  <RevealGroup>
    <Reveal>
      <Card padded style={{ width: 140 }}>
        <Typography small semibold>First</Typography>
      </Card>
    </Reveal>
    <Reveal>
      <Card padded style={{ width: 140 }}>
        <Typography small semibold>Second</Typography>
      </Card>
    </Reveal>
    <Reveal>
      <Card padded style={{ width: 140 }}>
        <Typography small semibold>Third</Typography>
      </Card>
    </Reveal>
  </RevealGroup>
</Row>
```

**Don't** - Leave a set ungrouped: every card fires at the same instant, so the row lands as one slab instead of a cascade.

```tsx
<Row cozy wrap>
  <Reveal>
    <Card padded style={{ width: 140 }}>
      <Typography small semibold>First</Typography>
    </Card>
  </Reveal>
  <Reveal>
    <Card padded style={{ width: 140 }}>
      <Typography small semibold>Second</Typography>
    </Card>
  </Reveal>
  <Reveal>
    <Card padded style={{ width: 140 }}>
      <Typography small semibold>Third</Typography>
    </Card>
  </Reveal>
</Row>
```

### direction

**Do** - Give a set one direction, so it arrives as a single gesture.

```tsx
<Row cozy wrap>
  <RevealGroup>
    <Reveal fromBelow>
      <Card padded style={{ width: 140 }}>
        <Typography small semibold>Rises</Typography>
      </Card>
    </Reveal>
    <Reveal fromBelow>
      <Card padded style={{ width: 140 }}>
        <Typography small semibold>Rises</Typography>
      </Card>
    </Reveal>
  </RevealGroup>
</Row>
```

**Don't** - Mix a direction per item; the set reads as scattered rather than as one movement.

```tsx
<Row cozy wrap>
  <RevealGroup>
    <Reveal fromLeft>
      <Card padded style={{ width: 140 }}>
        <Typography small semibold>Left</Typography>
      </Card>
    </Reveal>
    <Reveal fromRight>
      <Card padded style={{ width: 140 }}>
        <Typography small semibold>Right</Typography>
      </Card>
    </Reveal>
  </RevealGroup>
</Row>
```

### scope

**Do** - Reveal the block, so its contents arrive together as one piece of content.

```tsx
<Reveal>
  <Card padded style={{ width: 300, maxWidth: "100%" }}>
    <Column tight>
      <Typography h4 semibold>One entrance</Typography>
      <Typography small muted>The card and its lines arrive as a single object.</Typography>
    </Column>
  </Card>
</Reveal>
```

**Don't** - Reveal each leaf inside one card; the card assembles itself in pieces in front of the reader.

```tsx
<Card padded style={{ width: 300, maxWidth: "100%" }}>
  <Column tight>
    <Reveal>
      <Typography h4 semibold>Three entrances</Typography>
    </Reveal>
    <Reveal>
      <Typography small muted>Every line arrives on its own schedule.</Typography>
    </Reveal>
  </Column>
</Card>
```

### the real thing

**Do** - Use the atom, so the entrance is one prop, plays on scroll, and honors Reduce Motion.

```tsx
<Reveal pronounced>
  <Card padded style={{ width: 300, maxWidth: "100%" }}>
    <Typography small semibold>Reveals itself</Typography>
  </Card>
</Reveal>
```

**Don't** - Hand-roll it with a wrapper and a hard-coded opacity: it never arrives, never watches the scroll position, and ignores Reduce Motion.

```tsx
<View style={{ opacity: 0.35, width: 300, maxWidth: "100%" }}>
  <Card padded>
    <Typography small semibold>Stuck half-arrived</Typography>
  </Card>
</View>
```
