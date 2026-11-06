# Container

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d27c9b7debc9f8fea1016a51d1f700b1572754ac7d4f68c83b30055d3798cc5a

Source: `src/atoms/container/container.md`
Human reference: https://canvas.nannier.com/components/container

## Public imports

```tsx
import { Container } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The bounds provider. A Canvas component never dictates its own width:
`Container` conforms to its parent (full width, no cap) by default, and a named
step of the shared width scale (`xxxs` 192 through `page` 1280) caps and centers
it, so the reading measure of a form, an article, or a card stack is a step you
can name instead of a width invented at the call site.

A component fills the parent it is given (a field, a card, a table) or hugs its
content (a button, a badge), and the nearest layout container provides the
bounds. `Container` is the layout container whose job is a MEASURE, and by
default the parent is the conformance factor. A cap is fluid: inside anything
narrower than the step the container simply fills its parent, which is all a
phone screen is. `start` pins a capped box to the leading edge instead of
centering it, and `padTight` / `pad` / `padLoose` add horizontal gutters from
Row and Column's own padding scale.

The step booleans and `start` are the kit's measure axis, and the fields, Field,
Form, Button, and ButtonGroup carry it too: `<Input sm start>` says exactly what
`<Container sm start>` around it says, a cap at the step and fluid below it. Reach
for Container when the measure belongs to a group (a form, an article, a card
stack) rather than to one component.

## Usage

```tsx
<Container sm>
  <Card>
    <Typography medium>Sign in</Typography>
  </Card>
</Container>
```

## Variants

### Steps

```tsx
<Column>
  <Container xs><Card><Typography small>xs, 320</Typography></Card></Container>
  <Container md><Card><Typography small>md, 448</Typography></Card></Container>
  <Container xl><Card><Typography small>xl, 576</Typography></Card></Container>
</Column>
```

### Pinned to the start

```tsx
<Container sm start>
  <Card>
    <Typography small>Settings</Typography>
  </Card>
</Container>
```

### Full width with gutters

```tsx
<Container pad>
  <Card padded>
    <Typography small>The default measure is the parent's own width; pad adds 16px gutters on both sides.</Typography>
  </Card>
</Container>
```

## Do & Don't

### Naming a measure

**Do**: Wrap the block in a Container step; the component inside fills it.

```tsx
<Container md>
  <Card padded>
    <Typography medium>Billing</Typography>
    <Typography small muted>Plan, invoices, and payment method.</Typography>
  </Card>
</Container>
```

**Don't**: Cap a raw View with a maxWidth of your own; the number is invented at the call site, drifts off the shared width scale, and pins the box to the start where a step would center it.

```tsx
<View style={{ maxWidth: 448 }}>
  <Card padded>
    <Typography medium>Billing</Typography>
    <Typography small muted>Plan, invoices, and payment method.</Typography>
  </Card>
</View>
```

## Supported props

### ContainerProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  |  |
| fluid | boolean \| undefined | no | false | No cap, the default: the container spans its parent. Explicit `fluid` wins over every step when several are passed. |
| padTight | boolean \| undefined | no | false | Gutters: horizontal padding (pick one; omit for none). |
| pad | boolean \| undefined | no | false | Gutters: horizontal padding (pick one; omit for none). |
| padLoose | boolean \| undefined | no | false | Gutters: horizontal padding (pick one; omit for none). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Layout containers are the exception to the no-sizing rule: for composition inside an app frame only (a `flex` in a screen shell), never a restyle hook. |
| xxxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| sm | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| md | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| lg | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wide | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wider | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| widest | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| page | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| start | boolean \| undefined | no | false | Pin a capped component to the leading edge instead of centering it in its column. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
