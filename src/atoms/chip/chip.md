# Chip

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
accent edge and leading with a check. On Android the chip is Material 3's: a 32dp outlined
container at the 8dp chip corner, its selected filter chip tonal with an 18dp
check and no outline. The chip owns that whole look, so no call site
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
  color's ink; `primary` is the solid accent; `secondary` is the higher raised
  fill with no edge (on Android, the filled chip beside the bare outlined
  container that is its idle chip). `neutral` is the muted tag with no edge;
  `gray` is the same muted fill and ink inside the chip's own edge. `outline` composes with any color,
  e.g. `<Chip blue outline>`. Precedence: a color wins over `primary`, and
  `outline` wins over `primary`'s fill.

`count` adds a dimmed trailing count in the mono face. A hovering pointer
brightens the chip on the web. `start` pins a chip when its host layout does not
publish a Canvas sizing context.

`steadyPress` retains the resting opacity during a press, while selection,
hover feedback and the native ripple keep working.

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

On Android a tappable Chip's touch area grows to the 48dp minimum without the chip changing size: 8dp above and below the 32dp chip, and nothing sideways once it is 48dp wide. On iOS it keeps 8pt of extra touch area on every side, which clears the 44pt minimum around the 28pt chip. The remove "×" pads out to the minimum on both, biased away from the label. Inside one chip the two never overlap: the chip splits the gap between its label and its "×", so a tap on the label never removes it. Between chips, React Native's own rule applies: where two touch areas overlap, the later chip takes the tap. Android chips that meet the minimum's width reach nothing sideways, so a Row of them never overlaps; on iOS two tappable chips closer than 16pt do, and a tap on the edge of one toggles the next. Leave room between chips on iOS where a mistaken toggle matters.
