# Board

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 65a274e5daeaf87f9df07daf7e7604143f2e07a133bcae9c9c1bfed57b45e53e

Source: `src/organisms/board/board.md`
Human reference: https://canvas.nannier.com/components/board

## Public imports

```tsx
import { Board, applyBoardMove } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A data-driven kanban board: columns scroll horizontally, each column is a drop zone in a sunken well headed by its label and item count, and every card carries a drag grip, an optional trailing badge, a two-line description, a free-form chips slot, and an optional kebab menu.

Dragging is the kit's own drag-and-drop family,
so it runs on iOS, Android, and the web from one code path
and stays keyboard- and screen-reader-operable: press Space on a grip to grab, the arrow keys to move between positions and columns, Space to drop, Escape to cancel. The list stays controlled: a drop reports a `BoardMove` (source, target, insertion index, and the new neighbor ids) through `onMove`, and `applyBoardMove` is the standard reducer to apply it. Pass `defaultItems` instead of `items` for uncontrolled use, where the board applies each move itself.

For an action-driven work board, `plain` drops the lane wells and keeps the lane
headers and dashed empty slots. `renderItem` supplies the domain card with its
own controls. Add `draggable` to enable drag grips and drop targets while retaining
the plain layout. A custom `renderItem` receives `{ dragHandle }` as its second
argument; place that supplied grip in the card's header. `disabled` prevents moves
while a consumer saves a change. `bleed`
extends horizontal scrolling through the owning container's inset.
Plain lanes share the Board's measured width equally, with a 168px minimum per
lane. Narrow containers scroll horizontally; long card text stays within its lane.

Add `pageScroll` when the surrounding page or content pane owns horizontal scrolling.
The Board then renders an overflow-visible lane row without an inner scrollport.
Plain lanes still fill the available content width equally down to their 168px
minimum; standard lanes keep their configured width. The surrounding scroll area
must allow horizontal overflow and keyboard scrolling. Card actions and drag grips
retain their keyboard behavior. Omit `pageScroll` to keep the default local scroller.

## Usage

```tsx
<Board
  columns={[
    { id: "todo", label: "To do" },
    { id: "doing", label: "Doing" },
    { id: "done", label: "Done" },
  ]}
  defaultItems={[
    { id: "t1", columnId: "todo", title: "Rotate webhook secrets" },
    { id: "t2", columnId: "todo", title: "Draft the design review" },
    { id: "t3", columnId: "doing", title: "SSO rollout" },
    { id: "t4", columnId: "done", title: "Upgrade the CI runners" },
  ]}
/>
```

## Variants

### Plain work lanes

```tsx
<Board plain emptyLabel="No work here" columns={[{ id: "ready", label: "Ready" }, { id: "review", label: "Review" }]} items={[{ id: "core-1", columnId: "ready", title: "Preserve the Argus experience" }]} />
```

### Draggable plain work lanes

The grip supports pointer dragging and Space/arrow/Enter keyboard moves. Drop
targets fill each column's height, including the space below an empty placeholder.
Controlled consumers persist `onMove` before replacing their saved `items`.

```tsx
<Board plain draggable
  columns={[{ id: "ready", label: "Ready" }, { id: "doing", label: "In progress" }, { id: "done", label: "Done" }]}
  defaultItems={[{ id: "core-1", columnId: "ready", title: "Preserve the Argus experience" }]}
  renderItem={(item, { dragHandle }) => (
    <Card compact>
      <Row between alignCenter><Typography bold>{item.title}</Typography>{dragHandle}</Row>
    </Card>
  )}
/>
```


### Compact

The density axis tightens the lane padding, the card gaps, and the card insets for a board that has to show more at once.

```tsx
<Board
  compact
  columns={[
    { id: "todo", label: "To do" },
    { id: "doing", label: "Doing" },
  ]}
  defaultItems={[
    { id: "t1", columnId: "todo", title: "Rotate webhook secrets" },
    { id: "t2", columnId: "todo", title: "Draft the design review" },
    { id: "t3", columnId: "doing", title: "SSO rollout" },
  ]}
/>
```

### Card menus and press

`onPressItem` makes each card's body pressable (the grip and the kebab stay separate controls), and a card with `menu` rows gains a kebab reported through `onSelectItemMenu`. `chips` is a free slot under the title for chips or avatars.

```tsx
<Board
  columns={[
    { id: "todo", label: "To do" },
    { id: "doing", label: "Doing" },
  ]}
  defaultItems={[
    { id: "t1", columnId: "todo", title: "Rotate webhook secrets", menu: [{ label: "Edit", icon: "pencil" }, { label: "Delete", icon: "trash", destructive: true }] },
    { id: "t2", columnId: "doing", title: "SSO rollout", chips: <Chip>identity</Chip> },
  ]}
  onPressItem={(item) => {}}
  onSelectItemMenu={(item, menuItem) => {}}
/>
```

### Empty column and explicit badges

An empty column shows `emptyLabel` in a dashed slot and stays a valid drop target. A column's `badge` prop replaces the automatic item count (a WIP limit, a status).

```tsx
<Board
  columns={[
    { id: "todo", label: "To do", badge: "WIP 2" },
    { id: "doing", label: "Doing" },
  ]}
  defaultItems={[
    { id: "t1", columnId: "todo", title: "Rotate webhook secrets" },
    { id: "t2", columnId: "todo", title: "Draft the design review" },
  ]}
  emptyLabel="Drop tasks here"
/>
```

### Controlled

`items` keeps the list in your hands: each drop reports a `BoardMove` through `onMove`, and `applyBoardMove` is the standard reducer to apply it.

```tsx
<Stateful initial={[
  { id: "t1", columnId: "todo", title: "Rotate webhook secrets" },
  { id: "t2", columnId: "doing", title: "SSO rollout" },
]}>
  {(items, setItems) => (
    <Board
      columns={[
        { id: "todo", label: "To do" },
        { id: "doing", label: "Doing" },
      ]}
      items={items}
      onMove={(move) => setItems(applyBoardMove(items, move))}
    />
  )}
</Stateful>
```

## Do & Don't

### Moves stay in the consumer's data

**Do** — Treat `items` as the single source of truth: apply every `onMove` to your own array (`applyBoardMove`), and persist `afterId`/`beforeId` if your backend ranks by neighbors.

```tsx
<Stateful initial={[
  { id: "t1", columnId: "todo", title: "Rotate webhook secrets" },
  { id: "t2", columnId: "doing", title: "SSO rollout" },
]}>
  {(items, setItems) => (
    <Board
      columns={[
        { id: "todo", label: "To do" },
        { id: "doing", label: "Doing" },
      ]}
      items={items}
      onMove={(move) => setItems(applyBoardMove(items, move))}
    />
  )}
</Stateful>
```

**Don't** — Don't pass a controlled `items` and drop the move on the floor: the drag completes, announces, and then the card snaps back because nothing updated the array.

```tsx
<Board
  columns={[
    { id: "todo", label: "To do" },
    { id: "doing", label: "Doing" },
  ]}
  items={[
    { id: "t1", columnId: "todo", title: "Rotate webhook secrets" },
    { id: "t2", columnId: "doing", title: "SSO rollout" },
  ]}
/>
```

## Supported props

### BoardProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| plain | boolean \| undefined | no | false | Unframed work lanes with custom domain cards. |
| pageScroll | boolean \| undefined | no | false | Let the surrounding page own horizontal overflow instead of an inner scroller. |
| draggable | boolean \| undefined | no | false | Enable drag handles and drop targets in plain lanes. |
| disabled | boolean \| undefined | no | false | Temporarily prevent moves, for example while the consumer saves a drop. |
| renderItem | ((item: BoardItem, controls: { dragHandle: ReactNode; }) => ReactNode) \| undefined | no |  | Custom plain card; place the supplied dragHandle alongside its domain actions. |
| bleed | number \| undefined | no |  | Extend the scroller through its parent's horizontal inset. |
| columns | BoardColumn[] | yes |  | The columns (lanes), left to right. |
| items | BoardItem[] \| undefined | no |  | CONTROLLED list; order within a column is array order filtered by `columnId`. The kit never mutates it: apply each `onMove` yourself (`applyBoardMove` is the standard reducer). Omit it (optionally passing `defaultItems`) for uncontrolled use. |
| defaultItems | BoardItem[] \| undefined | no |  | Initial list for UNCONTROLLED use; Board then applies each move internally. |
| onItemsChange | ((items: BoardItem[]) => void) \| undefined | no |  | Fired with the would-be next list after a drop, in both modes. |
| onMove | ((move: BoardMove) => void) \| undefined | no |  | Fired on every completed drop with the computed move (source, target, index, neighbors). |
| onPressItem | ((item: BoardItem) => void) \| undefined | no |  | Makes each card body pressable and reports the pressed item. |
| onSelectItemMenu | ((item: BoardItem, menuItem: RowMenuItem, menuIndex: number) => void) \| undefined | no |  | Fired when a row of a card's kebab menu (`item.menu`) is selected. |
| columnWidth | number \| undefined | no | 300 | Column width in px (default 300). |
| compact | boolean \| undefined | no | false | Density axis (pass none for the default density). |
| emptyLabel | string \| undefined | no | "No items" | Message shown in an empty column (default "No items"). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
