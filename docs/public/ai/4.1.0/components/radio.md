# Radio

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 67dc17133b58d1a84056a7de4adc0eb91490ed8002a53a34897e3109a497dd42

Source: `src/atoms/radio/radio.md`
Human reference: https://canvas.nannier.com/components/radio

## Public imports

```tsx
import { Radio, RadioGroup } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Single-pick selection: stacked, inline, card-style.

One job, a platform's own control: iOS has no radio button, so there a single choice is a checkmark list, the inline picker of a grouped form. Each option's label leads and the chosen option carries a trailing check, and a RadioGroup's options form one inset-grouped section with a hairline between two rows. The web and Android keep the ring, and the role is `radio` on every platform: on the web an 18 px ring (16 `small`, 22 `large`) whose edge thickens in the accent around a hollow center when chosen, on Android Material 3's 20dp ring around an accent dot.
In glass mode the ring keeps its solid look on every platform: a ring is a small mark inside content, not a surface, so it draws with no pane and no rim. A `card` option is a content-layer pane, as a selectable Card is.
On iOS the list stays vertical when the group asks for a `row` (a list has no row form), and `card` options stay tiles that mark the choice with the same trailing check.

Pass `ref` to access the interactive radio row, preserving group navigation. Use `useRef<ComponentRef<typeof Radio>>(null)` from React, or `useRef<View>(null)` with React Native's `View` type. Object and callback refs are supported and detach on unmount. Calling `ref.current?.focus()` or `.blur()` delegates to the host without activating the control. Browser focus is supported; native focus depends on the platform and React Native version, and is separate from accessibility focus.

On the web, Space activates the focused control on key release, and Enter also activates it. Holding Space does not repeat the change. Moving focus away, disabling the control, or composing text cancels a pending Space press. RadioGroup arrow keys continue to move focus and selection.

## Usage

```tsx
<RadioGroup defaultValue="pro">
  <Radio value="hobby">Hobby</Radio>
  <Radio value="pro">Pro</Radio>
  <Radio value="enterprise">Enterprise</Radio>
</RadioGroup>
```

## Variants

### Inline

`row` lays the options out in a wrapping row. The group fills its parent's width (the parent provides the bounds, as for any list or field), so the row wraps onto another line when the options run out of room instead of running past its container.

```tsx
<RadioGroup row defaultValue="hobby">
  <Radio value="hobby">Hobby</Radio>
  <Radio value="pro">Pro</Radio>
  <Radio value="enterprise">Enterprise</Radio>
</RadioGroup>
```

### Card

```tsx
<RadioGroup row defaultValue="pro">
  <Radio card value="hobby" description="For personal projects.">Hobby</Radio>
  <Radio card value="pro" description="For growing teams.">Pro</Radio>
  <Radio card value="enterprise" description="Advanced security and support.">Enterprise</Radio>
</RadioGroup>
```

### Card icon and meta

A `card` radio takes an `icon` over its title, which turns the accent when it is chosen, and `equal` on a `row` group gives every option the same share of the row. Any radio takes `meta`, a short trailing note on the title's line (a version, a price, a badge).

```tsx
<RadioGroup row equal defaultValue="stable">
  <Radio card value="stable" icon={<Icon shieldCheck size={18} decorative />} meta="v4.0" description="Tested releases.">Stable</Radio>
  <Radio card value="beta" icon={<Icon gitBranch size={18} decorative />} meta="v4.1" description="Early features.">Beta</Radio>
  <Radio card value="canary" icon={<Icon bird size={18} decorative />} meta="nightly" description="Every commit.">Canary</Radio>
</RadioGroup>
```

### Inline label

`inlineLabel` sets a `row` group's `label` at the start of the row, before the options, in place of the heading above them.

```tsx
<RadioGroup row inlineLabel label="Digest" defaultValue="weekly">
  <Radio value="daily">Daily</Radio>
  <Radio value="weekly" meta={<Badge success small>default</Badge>}>Weekly</Radio>
  <Radio value="never">Never</Radio>
</RadioGroup>
```

### With description

```tsx
<RadioGroup defaultValue="pro">
  <Radio value="hobby" description="For personal projects and experiments.">Hobby</Radio>
  <Radio value="pro" description="For growing teams that need more control.">Pro</Radio>
  <Radio value="enterprise" description="Advanced security, compliance, and support.">Enterprise</Radio>
</RadioGroup>
```

## Do & Don't

### Default selection

**Do**: Pre-select a sensible default so the common path needs no clicks, and name the set with the group's own `label`.

```tsx
<RadioGroup label="Plan" defaultValue="pro">
  <Radio value="hobby">Hobby</Radio>
  <Radio value="pro">Pro</Radio>
  <Radio value="enterprise">Enterprise</Radio>
</RadioGroup>
```

**Don't**: Leaving a radio group with nothing selected forces an extra decision and can submit empty.

```tsx
<View style={{ flexDirection: "column", gap: 8 }}>
  <Text style={{ marginBottom: 4, fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Plan</Text>
  <Radio>Hobby</Radio>
  <Radio>Pro</Radio>
  <Radio>Enterprise</Radio>
</View>
```

### Stacked

**Do**: Pass a `description` and the control stacks the title over its secondary line for you, the mark aligned to the title
(the ring to its first line on the web and Android, the check centered on the row on iOS).

```tsx
<Radio checked description="For growing teams that need more control.">Pro</Radio>
```

**Don't**: Center-aligning the control floats it to the vertical middle of a two-line label, leaving it visually unattached to the title it controls.

```tsx
<View style={{ flexDirection: "column", gap: 10 }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    <Radio checked />
    <View>
      <Text style={{ fontSize: 13, fontWeight: "500", color: tokens.foreground }}>Pro</Text>
      <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>For growing teams that need more control.</Text>
    </View>
  </View>
</View>
```

### Inline

**Do**: Keep generous spacing between options and tighter spacing inside each so every label clearly pairs with its own control.

```tsx
<RadioGroup row defaultValue="hobby">
  <Radio value="hobby" small>Hobby</Radio>
  <Radio value="pro" small>Pro</Radio>
  <Radio value="enterprise" small>Enterprise</Radio>
</RadioGroup>
```

**Don't**: Cramped spacing between options makes each label blur into the next radio, so it is hard to tell which dot belongs to which choice.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
  <Radio checked small>Hobby</Radio>
  <Radio small>Pro</Radio>
  <Radio small>Enterprise</Radio>
</View>
```

### Card

**Do**: Give the selected card a primary border and tinted fill so the whole tile reads as chosen, not just the dot. Pass `card` and the control derives that treatment from its checked state automatically.

```tsx
<RadioGroup row defaultValue="pro">
  <Radio card value="pro" description="For growing teams.">Pro</Radio>
  <Radio card value="enterprise" description="Advanced security.">Enterprise</Radio>
</RadioGroup>
```

**Don't**: When the selected card keeps the same plain border, only the tiny native dot signals the choice and the active card is easy to miss.

```tsx
<View style={{ flexDirection: "row", gap: 8 }}>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", flexDirection: "column", borderRadius: 6, borderWidth: 1, borderColor: tokens.border, padding: 14 }}>
    <Radio checked style={{ marginBottom: 8 }} />
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Pro</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>For growing teams.</Text>
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", flexDirection: "column", borderRadius: 6, borderWidth: 1, borderColor: tokens.border, padding: 14 }}>
    <Radio style={{ marginBottom: 8 }} />
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Enterprise</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Advanced security.</Text>
  </View>
</View>
```

## Supported props

### RadioGroupProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | string \| number \| undefined | no |  | The selected option's value (CONTROLLED). Omit for uncontrolled use. |
| defaultValue | string \| number \| undefined | no |  | Initial selected value for uncontrolled use (a bare group selects on press). |
| onChange | ((value: string \| number) => void) \| undefined | no |  | Fired with the newly selected option's value. |
| disabled | boolean \| undefined | no | false | Disable every radio in the group. |
| row | boolean \| undefined | no | false | Lay the options out in a wrapping row instead of the default column. iOS keeps its checkmark list vertical (a list has no row form); `card` options still sit in a row there. |
| equal | boolean \| undefined | no | false | With `row`: the options share the row equally and never wrap, a tile picker's even columns (card tiles 10 apart, plain options 20). |
| inlineLabel | boolean \| undefined | no | false | With `row` and a `label`: the label sits at the start of the row, before the options and centred on them, in the 500 13 px muted ink (a short setting's inline choice: "Digest ( ) Daily (o) Weekly"), instead of as a heading above. The `description` is not shown inline. |
| label | string \| undefined | no |  | The group's name, rendered as a heading above the options. It also becomes the radiogroup's accessible name, so a screen reader announces what the set of options is about before reading them. The group owns this label anatomy; never hand-compose a heading Text beside a bare group. |
| description | ReactNode | no |  | Optional muted supporting line rendered under the label. |
| children | ReactNode | no |  | The `<Radio value="…">` options that make up the group. |
| testID | string \| undefined | no |  | E2E hook forwarded to the group container. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

### RadioProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | string \| number \| undefined | no |  | This option's value within a RadioGroup. When the radio sits inside a `<RadioGroup>`, its checked state and selection are driven by the group matching this value; ignored for a standalone radio. |
| checked | boolean \| undefined | no | false | Whether this control is the selected option (controlled; standalone use). |
| selected | boolean \| undefined | no | false | Alias for `checked`, for callers that think in terms of "selected". |
| onChange | ((checked: boolean, event: GestureResponderEvent) => void) \| undefined | no |  | Fired on press with the next checked value (always true for a radio). Web keyboard activation supports Space on release and Enter; RadioGroup also handles arrows. |
| testID | string \| undefined | no |  | E2E hook forwarded to the pressable row. |
| children | ReactNode | no |  | Label text (the option's title) shown beside the control. |
| description | ReactNode | no |  | Optional muted secondary line rendered under the label, for the common title-plus-description option (a plan picker, a settings choice). Supplying it builds the stacked title/description layout inside the control, so the caller never hand-composes a Row + Column + two Typography nodes per option. |
| card | boolean \| undefined | no | false | Render the whole control as a selectable option CARD: the mark (the ring, or the trailing check on iOS) plus the title and description sit inside Card chrome (bordered, padded), and the ENTIRE card is the tap target. When this radio is the chosen option, the card takes Card's own `selected` treatment (a primary border and a soft primary tint), so the whole tile reads as chosen, not just the mark. Pairs with `description` for a plan/tier picker, and is still group-wired through `value` inside a `<RadioGroup>`. |
| meta | ReactNode | no |  | A trailing detail on the title's line (a version, a price, a status pill): a string is set in the small mono meta type in the subtle ink, a node (a `Badge`) as it is. The title takes the row, so in a full-width option the detail sits at its end; in a `row` group's hugging option it follows the title. |
| icon | ReactNode | no |  | A `card` tile's icon (a kit `Icon` with no tone of its own): the tile stacks the icon and the mark on one line above the title and description. The icon takes the accent text ink while the option is chosen and the subtle ink otherwise. Ignored without `card`. |
| small | boolean \| undefined | no | false | Size (pick one; default is the 18px control on the web). |
| large | boolean \| undefined | no | false | Size (pick one; default is the 18px control on the web). |
| disabled | boolean \| undefined | no | false | Dim the control and block presses. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| ref | React.Ref<View> | no |  | Ref to the interactive radio row, preserving group navigation. Typed as a React Native View. On web, React Native Web exposes its DOM host; focus() and blur() move browser focus. Native host behavior depends on the platform and React Native version. Calling focus() does not activate the control or call accessibility focus APIs. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
