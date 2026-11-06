# Tooltip

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d27c9b7debc9f8fea1016a51d1f700b1572754ac7d4f68c83b30055d3798cc5a

Source: `src/atoms/tooltip/tooltip.md`
Human reference: https://canvas.nannier.com/components/tooltip

## Public imports

```tsx
import { Tooltip } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Small floating helper text on hover or focus.

The bubble floats over the page: it is drawn in the overlay layer of the nearest
`OverlayProvider`, placed against its trigger, and changes no layout, so a tip on a
table row's action never grows the cell. It centers on the trigger at the side you
pick, flips to the opposite side when the visible area has no room there, and slides
to stay inside it. Moving the pointer from the trigger onto the bubble keeps it up.
With no `OverlayProvider` mounted it still floats, on an absolute anchor beside the
trigger, but an ancestor that clips its content can then cut it off.

The bubble inverts against the page (dark in the light scheme, light in the dark one)
and sets its text in Dark Factory's label type;
iOS, which has no tooltip, shows the
same bubble, and Android keeps the Material 3 plain tooltip.

The trigger is a boolean axis of its own, resolved first match wins:

- `children`, an element you already have (an icon `Button`, a `Chip`, any
  control that owns its own press and accessible name). The child renders as-is
  and the tip hangs off it through a wrapper that only LISTENS: no accessibility
  role, no tab stop, and no press of its own, so the child stays the single
  interactive, labelled element, keeps its `onPress`, and the tip never toggles
  on tap. Hover and focus on the child both raise it.
- `iconTrigger`, a ghost icon button carrying a settings glyph.
- `textTrigger`, the `trigger` string as a pressable inline word.
- Otherwise the default: the `trigger` string as an outline Button.

Hover and focus are pointer-and-keyboard affordances. Touch pointers are
skipped,
and iOS and Android never fire hover at all.
On touch the built-in
triggers toggle the tip on tap (tap again to close it; a tip is never modal, so a
tap elsewhere goes to the page). A long press is not taken: it belongs to the
platform and to the control. An element trigger has no tap toggle either, because
that press belongs to the child, so on native and on touch the controlled `open`
prop is the way to show its tip: drive it from whatever the platform does offer (a
long press the child handles, a selected row, an inline help toggle). Keyboard
focus, including a hardware keyboard on a tablet, raises the tip on every platform.

Escape hides an open tip and leaves focus where it is (WCAG 1.4.13: hover and focus
content is dismissable without moving the pointer or focus). It goes through the kit's
one Escape owner, so a tip inside a Dialog or Popover closes first and the next Escape
reaches its host; a closed tip takes no Escape at all. A controlled tip reports the
close through `onOpenChange(false)`.
On iOS the same close answers the accessibility
escape (the VoiceOver two-finger scrub, and Escape on a hardware keyboard under Full
Keyboard Access).
Android delivers no Escape key to a view, and its back gesture is
never taken for a tip, so there the tip closes with focus or the controlled `open`.

## Usage

The examples pinned open leave room on the bubble's side, as a page would: the
bubble floats and takes no room of its own.

```tsx
<Column padLoose alignCenter>
  <Tooltip label="Open settings" trigger="Settings" open />
</Column>
```

## Variants

### Right

```tsx
<Tooltip label="Open settings" trigger="Settings" open right />
```

### Bottom

```tsx
<Column padLoose alignCenter>
  <Tooltip label="Open settings" trigger="Settings" open bottom />
</Column>
```

### Left

```tsx
<Tooltip label="Open settings" trigger="Settings" open left />
```

### Icon

```tsx
<Column padLoose alignCenter>
  <Tooltip label="Open settings" iconTrigger open />
</Column>
```

### Text

```tsx
<Column padLoose alignCenter>
  <Tooltip textTrigger label="Open settings" trigger="hover this text" open />
</Column>
```

### Element trigger

```tsx
<Column padLoose alignCenter>
  <Tooltip label="Open settings" open>
    <Button ghost icon accessibilityLabel="Open settings" iconLeft={<Icon settings size={16} />} />
  </Tooltip>
</Column>
```

### On hover

```tsx
<Tooltip label="Open settings" trigger="Hover me" />
```

## Do & Don't

### Short labels

**Do** — Keep tooltips short and supplementary; put essential steps in visible copy.

```tsx
<Column padLoose alignCenter>
  <Tooltip iconTrigger bottom open label="Rotate key" />
</Column>
```

**Don't** — Long, essential instructions hidden in a tooltip are missed on touch and by screen readers.

```tsx
<Column padLoose alignCenter>
  <Tooltip iconTrigger bottom open label="To rotate this key you must first revoke the old one in Settings, then confirm via email within 24 hours." />
</Column>
```

### Placement

**Do** — Pick the side with the most room; the tip flips and slides to stay on screen when it has none.

```tsx
<Column padLoose alignCenter>
  <Tooltip trigger="Save" top open label="Saves your changes" />
</Column>
```

**Don't** — Don't place a tip where it covers the control a user needs next; it floats over the page, so it masks whatever sits on that side.

```tsx
<View style={{ alignItems: "flex-start", gap: 4 }}>
  <Tooltip trigger="Filters" bottom open label="Refine results" />
  <Button outline small>Clear all</Button>
</View>
```

## Supported props

### TooltipProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  | An arbitrary element for the tip to hang off: an existing Button, Chip, or any other control that already owns its own press and accessible name. The highest-precedence trigger: children win over `iconTrigger`, `textTrigger`, and the default Button. The child renders as-is and stays the single interactive, labelled element; the root view Tooltip wraps it in takes no accessibility role and no tab stop, listens only for hover and focus, and never claims the press, so a Button child keeps its `onPress` and the tip does not toggle on tap. |
| label | string \| undefined | no |  | The tip text shown in the bubble. |
| trigger | string \| undefined | no |  | The element the tip describes. By default rendered as a text `<Button outline small>`; set `iconTrigger` for a ghost icon button, `textTrigger` to hang the tip off an inline pressable word, or pass `children` to wrap an element you already have. Ignored when `children` is passed. |
| iconTrigger | boolean \| undefined | no | false | Render the trigger as a ghost icon button (a settings glyph) instead of the text Button. When set, `trigger` (the label string) is ignored. Ignored when `children` is passed, which takes precedence. |
| textTrigger | boolean \| undefined | no | false | Render the `trigger` string as a pressable inline word (an underlined hover-text affordance) rather than the default text Button, so the tip can hang off a run of body copy. Orthogonal to placement (top/left/right/bottom). Ignored when `children` or `iconTrigger` is set, both of which take precedence. |
| open | boolean \| undefined | no | false | Controlled visibility. Omit for uncontrolled: the tip shows while the trigger is hovered or focused, and a tap toggles it (the touch analogue of hover) on the built-in triggers. An element trigger (`children`) has no tap toggle (the child keeps its own press), and native platforms never fire hover, so `open` is the native and touch path for that trigger. |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the bubble is shown/hidden. |
| top | boolean \| undefined | no | false | Placement (pick one; default is top). |
| bottom | boolean \| undefined | no | false | Placement (pick one; default is top). |
| left | boolean \| undefined | no | false | Placement (pick one; default is top). |
| right | boolean \| undefined | no | false | Placement (pick one; default is top). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
