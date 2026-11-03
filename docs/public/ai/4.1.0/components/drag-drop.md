# Drag & drop

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: e09f8965dff7d0af07ba1dd1deaa62611de669dfcb059d93145325e8bdbb1cbc

Source: `src/organisms/drag-drop/drag-drop.md`
Human reference: https://canvas.nannier.com/components/drag-drop

## Public imports

```tsx
import { DragDropProvider, DragHandle, Draggable, DropZone } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A reusable drag-and-drop context: wrap a surface in a `DragDropProvider`, mark droppable regions with `DropZone`, and make items draggable with `Draggable` plus a `DragHandle` grip.

Items lift into a floating ghost and reorder within or across zones, position-aware.
It runs on iOS, Android, and the web from one PanResponder + Animated code path,
and the grip is keyboard- and screen-reader-operable: press Space to grab, the arrow keys to move, Space to drop, Escape to cancel.

The reading direction is respected throughout. In a right-to-left locale a `horizontal` zone lays its items out right to left, so the first position is the rightmost one, the drop indicator meets the row's right edge, and the two horizontal arrows swap roles (Left Arrow moves forward, Right Arrow back, per the WAI-ARIA practices). Vertical lists and the up/down arrows read the same way in both directions.

## Usage

```tsx
<Stateful initial={[
  { id: "a", zone: "list", title: "Design review" },
  { id: "b", zone: "list", title: "Write the tests" },
  { id: "c", zone: "list", title: "Ship the release" },
]}>
  {(cards, setCards) => (
    <DragDropProvider>
      <DropZone bordered id="list" label="Tasks" onDrop={(e) => setCards(applyDrop(cards, e))}>
        <Column snug>
          {cards.map((c) => (
            <Draggable key={c.id} id={c.id} data={c} label={c.title}>
              <Card>
                <Row between alignCenter>
                  <Typography>{c.title}</Typography>
                  <DragHandle label={`Reorder ${c.title}`} />
                </Row>
              </Card>
            </Draggable>
          ))}
        </Column>
      </DropZone>
    </DragDropProvider>
  )}
</Stateful>
```

## Variants

### Bordered zone

Pass `bordered` to a `DropZone` to draw it as a visible drop well: a dashed, sunken surface
with the zone's `label` as an eyebrow over its items. While a drag is over it, its edge and
fill take the accent. Without `bordered` the zone is only a drop target around its children
(a Board lane or a StackedList draws its own surface), and a drag over it lays the same
accent edge and wash across it.

```tsx
<DragDropProvider>
  <DropZone bordered id="queue" label="Queue">
    <Draggable id="tokens" data={{ id: "tokens", zone: "queue" }} label="Tokens">
      <Card compact>
        <Row between alignCenter>
          <Typography small>Tokens</Typography>
          <DragHandle label="Reorder Tokens" />
        </Row>
      </Card>
    </Draggable>
  </DropZone>
</DragDropProvider>
```

### Locked item

Pass `disabled` to a `Draggable` to pin it in place: its grip dims and becomes inert while the
rest of the list stays draggable.

```tsx
<DragDropProvider>
  <DropZone bordered id="list" label="Tasks">
    <Column snug>
      <Draggable id="a" data={{ id: "a", zone: "list" }} label="Design review">
        <Card>
          <Row between alignCenter>
            <Typography>Design review</Typography>
            <DragHandle label="Reorder Design review" />
          </Row>
        </Card>
      </Draggable>
      <Draggable id="b" data={{ id: "b", zone: "list" }} disabled label="Locked task">
        <Card>
          <Row between alignCenter>
            <Typography>Locked task</Typography>
            <DragHandle label="Locked task" />
          </Row>
        </Card>
      </Draggable>
    </Column>
  </DropZone>
</DragDropProvider>
```

### Between columns

A `DropZone` per column; dragging a card moves it into another column at the drop position. The
shared list is a flat array with a `zone` field, and `applyDrop` re-homes the card.

```tsx
<Stateful initial={[
  { id: "t1", zone: "todo", title: "Rotate secrets" },
  { id: "t2", zone: "todo", title: "Draft the review" },
  { id: "t3", zone: "doing", title: "SSO rollout" },
  { id: "t4", zone: "doing", title: "Audit log export" },
]}>
  {(cards, setCards) => (
    <DragDropProvider>
      <Grid columns={2} relaxed>
        {["todo", "doing"].map((zone) => (
          <DropZone bordered key={zone} id={zone} label={zone === "todo" ? "To do" : "Doing"} onDrop={(e) => setCards(applyDrop(cards, e))}>
            <Column snug>
              {cards.filter((c) => c.zone === zone).map((c) => (
                <Draggable key={c.id} id={c.id} data={c} label={c.title}>
                  <Card>
                    <Row between alignCenter>
                      <Typography>{c.title}</Typography>
                      <DragHandle label={`Reorder ${c.title}`} />
                    </Row>
                  </Card>
                </Draggable>
              ))}
            </Column>
          </DropZone>
        ))}
      </Grid>
    </DragDropProvider>
  )}
</Stateful>
```

## Do & Don't

### Grip and fallback

**Do** — Give each item a labeled `DragHandle` and keep a non-drag way to move it. The grip is a keyboard tab stop that grabs on Space and moves with the arrows; a `RowMenu` "Move to" beside it is a good extra path for pointer and assistive-tech users.

```tsx
<DragDropProvider>
  <DropZone id="list" label="Tasks" style={{ width: 280, maxWidth: "100%", minHeight: 96 }}>
    <Draggable id="a" data={{ id: "a", zone: "list" }} label="Design review">
      <Card compact>
        <Row between alignCenter>
          <Typography small>Design review</Typography>
          <Row snug alignCenter>
            <DragHandle label="Reorder Design review" />
            <RowMenu items={[{ label: "Move to Doing", icon: "arrowRight" }]} triggerLabel="Move Design review" />
          </Row>
        </Row>
      </Card>
    </Draggable>
  </DropZone>
</DragDropProvider>
```

**Don't** — Don't make a bare card the only drag surface with no grip and no alternative: whole-card dragging fights taps and scrolling, and it leaves keyboard and screen-reader users with no way to move the item at all.

```tsx
<Card compact>
  <Pressable onPress={() => {}}>
    <Typography small>Design review (drag the whole card?)</Typography>
  </Pressable>
</Card>
```

## Supported props

### DragDropProviderProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | yes |  |  |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. The provider wraps the whole draggable surface and hosts the floating drag ghost. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |

### DropZoneProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | string | yes |  | Stable id for this drop target, used in the drop event and for keyboard navigation. |
| label | string | yes |  | Accessible name announced when a drag hovers or drops here (e.g. the column title). |
| onDrop | ((e: DropEvent) => void) \| undefined | no |  | Fired on THIS zone when an item is dropped into it (from any zone, including itself). |
| horizontal | boolean \| undefined | no | false | Lay the items out in a row so the insertion axis is horizontal (default is a vertical column). |
| disabled | boolean \| undefined | no | false | Refuse drops: the zone is skipped by hit-testing and the keyboard cursor, and never highlights. |
| bordered | boolean \| undefined | no | false | Draw the zone as a visible drop well: a dashed sunken surface with its `label` as an eyebrow over the items. Without it the zone is only a drop target around its children. |
| children | ReactNode | no |  |  |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |

### DraggableProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| id | string | yes |  | Stable id for this item (unique within the provider). |
| data | T | yes |  | Arbitrary payload handed back in the drop event. |
| label | string \| undefined | no |  | Accessible name of the item, used in drag announcements (falls back to `id`). |
| disabled | boolean \| undefined | no | false | Disable dragging: the grip inside becomes inert. |
| preview | ReactNode | no |  | Custom floating drag preview; defaults to the item's own `children`. |
| children | ReactNode | no |  |  |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |

### DragHandleProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | string \| undefined | no |  | Accessible name for the grip (e.g. "Reorder Rotate webhook secrets"). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
