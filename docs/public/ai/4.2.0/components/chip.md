# Chip

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: ffd42edcc8828d3edcdcfd4bb3a9835f8b54674438055997f10ebf5989e7e006

Source: `src/atoms/chip/chip.md`
Human reference: https://canvas.nannier.com/components/chip

## Public imports

```tsx
import { Chip, ChipGroup } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

An interactive pill for filter chips, tags, and selectable tokens. It carries an
optional leading icon and a label, becomes tappable with `onPress`, and grows a
trailing "×" remove button with `onRemove`.

A Chip is a LOW-emphasis tag, not a call to action: the neutral chip is a 28 px
outlined pill (the raised neutral fill inside a hairline, its label at weight
500). A status chip is its soft pill (the status wash under the status ink, the
recipe Alert and the other toned surfaces share); a palette hue is that hue's
16% wash inside the same hue at 30%, under a deep ink in the hue that holds
4.5:1 on the wash. A selectable chip rests as the bare pill in the field border,
and once selected it is the accent's soft wash in the accent ink, inside an
accent edge and leading with a check.
On Android the chip is Material 3's: a 32dp outlined
container at the 8dp chip corner, its selected filter chip tonal with an 18dp
check and no outline.
The chip owns that whole look, so no call site
hand-composes a `borderRadius` + `backgroundColor` + padding Pressable.

Two orthogonal axes drive the look:

- **Color** (pick one; default the neutral tag). A semantic status (`success`,
  `warning`, `destructive`, `info`, `neutral`) or a free-form palette hue (`red`,
  `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`,
  `blue`, `indigo`, `violet`, `fuchsia`, `purple`, `pink`, `rose`, `gray`). Status
  names read the theme's status colors (`statusColors`), so a success chip matches a
  success Badge and Alert; `info` is the primary color. Precedence when more than one
  is set: status names first, then hues in the order above.
- **Emphasis**. `outline` drops the fill for the field-border edge around the
  color's ink; `primary` is the solid accent;
`secondary` is the higher raised
  fill with no edge (on Android, the filled chip beside the bare outlined
  container that is its idle chip).
`neutral` is the muted tag with no edge;
  `gray` is the same muted fill and ink inside the chip's own edge. `outline` composes with any color,
  e.g. `<Chip blue outline>`. Precedence: a color wins over `primary`, and
  `outline` wins over `primary`'s fill.

`count` adds a dimmed trailing count in the mono face. A hovering pointer
brightens the chip on the web. `start` pins a chip when its host layout does not
publish a Canvas sizing context.

`steadyPress` retains the resting opacity during a press, while selection,
hover feedback and the native ripple keep working.

`href` makes the chip a link to a route or a URL: a real anchor on the web (so
middle-click and open-in-new-tab work and assistive tech hears a link), with
`hrefAttrs` forwarding `target`, `rel` and `download`. Native platforms have no
anchors, so pair `href` with an `onPress` that navigates through the app's router; it
receives the press event, so a web app routing on the client calls
`event?.preventDefault()` there. A hovering pointer turns a link chip's ink and edge to
the accent instead of brightening it. A link is not a toggle: `href` is ignored on a
selectable chip or a ChipGroup option.

`small` gives passive metadata tags a 24 px container and 11 px label where the skin supports it. Platform-native chips and the option, token and link looks keep their own dimensions.

## Usage

```tsx
<Chip>Design</Chip>
```

## Variants

### Colors

```tsx
<Row wrap>
  <Chip red>Bug</Chip>
  <Chip orange>Chore</Chip>
  <Chip amber>Docs</Chip>
  <Chip green>Feature</Chip>
  <Chip teal>Design</Chip>
  <Chip blue>Backend</Chip>
  <Chip indigo>Frontend</Chip>
  <Chip violet>Research</Chip>
  <Chip purple>Infra</Chip>
  <Chip pink>Growth</Chip>
  <Chip gray>Archived</Chip>
</Row>
```

### Status

```tsx
<Row wrap>
  <Chip success>Passing</Chip>
  <Chip warning>Flaky</Chip>
  <Chip destructive>Failing</Chip>
  <Chip info>Queued</Chip>
  <Chip neutral>Skipped</Chip>
</Row>
```

### Emphasis

```tsx
<Row>
  <Chip>Neutral</Chip>
  <Chip primary>Accent</Chip>
  <Chip outline>Outline</Chip>
</Row>
```

### With leading icon

A leading `<Icon />` is auto-tinted to the chip's color, so a bare `<Icon check />`
matches without threading the color through.

```tsx
<Chip success icon={<Icon check size={14} />}>Verified</Chip>
```

### Removable filters

`onRemove` grows the trailing "×"; wire it to your own state to drop the filter.

```tsx
<Chip onRemove={() => {}}>Role: Admin</Chip>
```

### Link

A chip that names a destination, such as the component chips at the head of a docs
card. A trailing `<Icon arrowUpRight />` says it leaves the page.

`link` is the look made for it, the link pill of a section card: 26 px tall at the full
round, 10 px at both sides and 6 px between the label and its arrow, a 500 12 px label in
the secondary ink on the popover fill inside the field-border edge. A hovering pointer
turns the label, the arrow and the edge to the accent. A press keeps the resting look, as
the hand-off draws it.
Precedence: `token` > `option` > `link`.
On Android a link is the Material 3 assist chip.

```tsx
<Row wrap compact>
  <Chip link href="/components/switch" trailing={<Icon arrowUpRight size={12} />}>Switch</Chip>
  <Chip link href="/components/checkbox" trailing={<Icon arrowUpRight size={12} />}>Checkbox</Chip>
</Row>
```

### Selectable

A selectable chip is a filter chip: the outlined pill at rest, and the accent's soft
wash inside an accent edge, leading with a check, once selected.

```tsx
<Row>
  <Chip selectable defaultSelected>Design</Chip>
  <Chip selectable>Engineering</Chip>
</Row>
```

### Pick one

`ChipGroup` makes a set of chips a single choice: wrap `<Chip value="…">` options in it
and exactly one is selected, the selected filter chip's look. It is a radiogroup of
radio chips and ONE tab stop: Tab lands on the chosen chip (the first one when nothing
is chosen), the arrow keys move the choice and wrap, Home and End take the ends, and a
disabled chip is skipped. Controlled via `value` + `onChange`, uncontrolled via
`defaultValue`, the RadioGroup contract. `label` renders a heading that also names the
group; `accessibilityLabel` names it when the heading is already on the page. The group
draws no chrome of its own: it wraps its chips 8 px apart, and fills its parent.

```tsx
<ChipGroup label="Density" defaultValue="comfortable">
  <Chip value="compact">Compact</Chip>
  <Chip value="comfortable">Comfortable</Chip>
  <Chip value="spacious">Spacious</Chip>
  <Chip value="custom" disabled>Custom</Chip>
</ChipGroup>
```

### Options

`option` is the compact pick of a settings panel: 26 px tall at a small corner, a 500 12 px
label and no check, a bare field-border edge around the muted ink at rest and the accent's
soft wash inside its edge once chosen. An icon-only option is a 30 px square, and `square`
holds any option to that square, its label then the tile's own 500 10 px mono line (the
"none" pick at the head of an icon knob). `ChipGroup option` makes every chip in the set an
option and sets them 4 px apart.
On Android an option is the Material 3 chip.

```tsx
<ChipGroup option accessibilityLabel="Size" defaultValue="base">
  <Chip value="small">small</Chip>
  <Chip value="base">base</Chip>
  <Chip value="large">large</Chip>
</ChipGroup>
```

### Square options

```tsx
<ChipGroup option accessibilityLabel="Icon" defaultValue="">
  <Chip value="" square>none</Chip>
  <Chip value="plus" icon={<Icon plus size={14} />} accessibilityLabel="plus" />
  <Chip value="sparkles" icon={<Icon sparkles size={14} />} accessibilityLabel="sparkles" />
</ChipGroup>
```

### Token

`token` is the tag of a colour role: a 32 px pill in the card fill inside the hairline, 8 px
between its elements, a 500 12 px mono label with 12 px beside it, and 6 px beside its
leading element, which is sized for a `tiny` `ring` Swatch. `token` wins over `option`
when both are passed.
On Android a token tag is the Material 3 chip.

```tsx
<Row wrap snug>
  <Chip token icon={<Swatch tiny ring circle color={tokens.primary} accessibilityLabel="primary" />}>primary</Chip>
  <Chip token icon={<Swatch tiny ring circle color={tokens.border} accessibilityLabel="border" />}>border</Chip>
  <Chip token icon={<Swatch tiny ring circle color={tokens.foreground} accessibilityLabel="foreground" />}>foreground</Chip>
</Row>
```

## Do & Don't

### Removable filter

**Do**: Use a Chip with `onRemove` so the pill and its "×" stay consistent and accessible.

```tsx
<Chip blue onRemove={() => {}}>Status: Active</Chip>
```

**Don't**: Hand-build the pill from a raw Pressable with border-radius, padding, and a text "×".

```tsx
<Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", borderRadius: 9999, backgroundColor: "#4f46e5", paddingHorizontal: 10, paddingVertical: 4 }}>
  <Text style={{ color: "#ffffff", fontSize: 13 }}>Status: Active</Text>
  <Text style={{ color: "#ffffff", fontSize: 13 }}>×</Text>
</Pressable>
```

## Touch area

On Android a tappable Chip's touch area grows to the 48dp minimum without the chip changing size: 8dp above and below the 32dp chip, and nothing sideways once it is 48dp wide. On iOS it keeps 8pt of extra touch area on every side, which clears the 44pt minimum around the 28pt chip. The remove "×" pads out to the minimum on both, biased away from the label.
Inside one chip the two never overlap: the chip splits the gap between its label and its "×", so a tap on the label never removes it. Between chips, React Native's own rule applies: where two touch areas overlap, the later chip takes the tap.
Android chips that meet the minimum's width reach nothing sideways, so a Row of them never overlaps; on iOS two tappable chips closer than 16pt do, and a tap on the edge of one toggles the next. Leave room between chips on iOS where a mistaken toggle matters.

## Supported props

### ChipGroupProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | string \| number \| undefined | no |  | The chosen chip's value (CONTROLLED). Omit for uncontrolled use. |
| defaultValue | string \| number \| undefined | no |  | Initial chosen value for uncontrolled use (a bare group selects on press). |
| onChange | ((value: string \| number) => void) \| undefined | no |  | Fired with the newly chosen chip's value. |
| disabled | boolean \| undefined | no | false | Disable every chip in the group. |
| option | boolean \| undefined | no | false | Draw every chip as an `option` chip (Chip's compact settings pick), 4 px apart: the pick-one sets of a settings panel. |
| label | string \| undefined | no |  | The group's name, rendered as a heading above the chips and announced as the radiogroup's accessible name. The group owns this label anatomy; never hand-compose a heading Text beside a bare group. |
| description | ReactNode | no |  | Optional muted supporting line rendered under the label. |
| accessibilityLabel | string \| undefined | no |  | The group's accessible name when the page already shows its heading elsewhere (no visible label is rendered). `label` wins when both are passed. |
| children | ReactNode | no |  | The `<Chip value="…">` options that make up the set. |
| testID | string \| undefined | no |  | E2E hook forwarded to the group container. |
| style | LayoutStyle | no |  | Outer layout composition only (flex within a parent), never a restyle hook. |

### ChipProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  | The chip label. |
| count | string \| number \| undefined | no |  | A dimmed trailing count, set in the mono face. |
| start | boolean \| undefined | no | false | Pin a chip within an app-owned host layout. |
| icon | ReactNode | no |  | A leading element (e.g. an `<Icon />` or a small `<Avatar />`). An `<Icon />` is auto-tinted to the chip's label color unless it sets its own color. |
| trailing | ReactNode | no |  | A trailing element (e.g. a chevron for a menu trigger). Rendered after the label. |
| onPress | ((event?: GestureResponderEvent) => void) \| undefined | no |  | Makes the whole chip tappable (e.g. toggling a filter). Called with the press event, which a ChipGroup option's Space key does not have, so an `href` chip that routes on the client calls `event?.preventDefault()` here. |
| href | string \| undefined | no |  | Makes the chip a LINK to this destination (a route or a URL): on the web react-native-web renders the chip as an `<a href>`, so middle-click, cmd-click and open-in-new-tab work and assistive tech hears a link; it takes the link chip's hover (the accent ink inside an accent edge) in place of the brightening. Native platforms have no anchors, so pair it with an `onPress` that navigates through the host's router, as Button's `href` does. While `disabled` the anchor is suppressed. A link is not a toggle, so it is ignored on a selectable chip or a ChipGroup option. |
| hrefAttrs | { target?: "_blank" \| "_self"; rel?: string; download?: boolean \| string; } \| undefined | no |  | Anchor attributes forwarded with `href` on the web (react-native-web's `hrefAttrs`): `target`, `rel`, `download`. Ignored without `href`, and everywhere natively. |
| onRemove | (() => void) \| undefined | no |  | Adds a trailing "×" remove button firing this handler. |
| selectable | boolean \| undefined | no | false | Turns the chip into a filter toggle that owns its own selected state: pressing it lights up (to the accent's soft wash, inside an accent edge on the web and iOS) and back. Selection is controlled via `selected`, uncontrolled via `defaultSelected`. |
| selected | boolean \| undefined | no | false | Selected state for a selectable chip (CONTROLLED). Omit for uncontrolled use. |
| defaultSelected | boolean \| undefined | no | false | Initial selected state for an uncontrolled selectable chip. |
| onSelectedChange | ((selected: boolean) => void) \| undefined | no |  | Fired with the next selected state when a selectable chip is pressed. |
| value | string \| number \| undefined | no |  | The chip's option value inside a ChipGroup: the chip is one option of the pick-one set, selected when the group's value is this one, and reads as a radio. Ignored outside a group. |
| success | boolean \| undefined | no | false | Color axis (pick one; default the neutral tag). Two families, both a soft tint: Semantic status (matches Badge): success / warning / error / info / neutral. |
| warning | boolean \| undefined | no | false | Color axis (pick one; default the neutral tag). Two families, both a soft tint: Semantic status (matches Badge): success / warning / error / info / neutral. |
| destructive | boolean \| undefined | no | false | The danger tone. This is the name the intent axis uses across the kit (Button, AlertDialog, and every chart) and the one the design hand-off uses here too. |
| info | boolean \| undefined | no | false |  |
| neutral | boolean \| undefined | no | false |  |
| red | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| orange | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| amber | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| yellow | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| lime | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| green | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| emerald | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| teal | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| cyan | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| sky | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| blue | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| indigo | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| violet | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| fuchsia | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| purple | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| pink | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| rose | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| gray | boolean \| undefined | no | false | Free-form palette hues, plus `gray` for an explicit neutral tag. |
| secondary | boolean \| undefined | no | false | Emphasis (orthogonal to color). `outline` is border-only; `primary` is the solid accent. `secondary` is the raised neutral fill (the default on the web and iOS; on Android it fills the otherwise bare outlined chip). |
| primary | boolean \| undefined | no | false | Emphasis (orthogonal to color). `outline` is border-only; `primary` is the solid accent. `secondary` is the raised neutral fill (the default on the web and iOS; on Android it fills the otherwise bare outlined chip). |
| outline | boolean \| undefined | no | false | Emphasis (orthogonal to color). `outline` is border-only; `primary` is the solid accent. `secondary` is the raised neutral fill (the default on the web and iOS; on Android it fills the otherwise bare outlined chip). |
| option | boolean \| undefined | no | false | A compact option in a settings panel, the hand-off playground's knob pick: 26 tall at a small corner, a 500 12px label and no check, idle a bare field-border edge around the muted ink, selected the accent's soft wash inside its edge. An icon-only option is a 30 px square. A ChipGroup's `option` sets it on every chip. On Android an option is the Material 3 chip. |
| token | boolean \| undefined | no | false | A token tag, the hand-off's Tokens chip: a 32 px pill in the card fill inside the hairline, 8 between elements, a 500 12 px mono label, 12 on the text side and 6 beside its leading element, which is sized for a 20 px swatch (`<Chip token icon={<Swatch tiny ring circle color={tokens.primary} />}>`). On Android a token tag is the Material 3 chip. |
| link | boolean \| undefined | no | false | A link to another page, the hand-off's section card link pill: 26 tall at the full round, 10 at both sides, a 500 12 px label in the secondary ink on the popover fill inside the field-border edge; a hovering pointer turns the label and the edge to the accent. Pair it with `href` (and a trailing `<Icon arrowUpRight size={12} />`, which takes the label's ink). A press keeps the resting look, as the hand-off draws it. On Android a link is the Material 3 assist chip. |
| square | boolean \| undefined | no | false | Forces an `option` chip to the 30 px square an icon-only option takes, even when it carries a label and no icon; a label inside the square is set in the tile's own type, a 500 10 px mono line (the hand-off's "none" pick in an icon knob). Ignored off the `option` look. |
| small | boolean \| undefined | no | false | A small metadata tag; option, token and link looks retain their own dimensions. |
| disabled | boolean \| undefined | no | false |  |
| steadyPress | boolean \| undefined | no | false | Keep resting opacity while pressed, preserving the reference filter treatment. |
| accessibilityLabel | string \| undefined | no |  |  |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For layout composition only (not styling). |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
