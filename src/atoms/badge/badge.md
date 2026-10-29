# Badge

Two families on one Badge component, picked by boolean props. The metadata badge labels a schema, role, or tag: with no tone it is the accent's soft pill, and the tones give `default` the solid call-to-action pill, `secondary` the quiet surface pill, `outline` a hairline pill and `destructive` the soft red pill; add `mono` for token names. A status tone (`success`, `warning`, `error`, `info`, `neutral`) paints the pill in that tone's wash and ink and leads it with a dot. The status badge (`status`) has no pill: a dot in the tone's color, ringed in its wash, beside a muted label, for live state like active, pending, or failed.

The tone colors come from `statusColors`, the helper every toned surface in the kit reads, so a warning badge and a warning alert are the same state, and every ink is the solved text role that keeps 4.5:1 on its wash.

If more than one tone is passed, Badge resolves the highest-precedence one: `default` > `destructive` > `secondary` > `outline` for metadata (the accent's soft pill when none is passed), and `success` > `error` > `warning` > `info` > `neutral` for status (`neutral` when none is passed). The metadata tones win over a status tone's colors; the status tone's dot stays.

Lay out a series of badges with `BadgeGroup`, a wrapping row that owns the gap (`tight` / `snug` / `cozy`, default `snug`; the largest gap passed wins: `cozy` > `snug` > `tight`) and centers its badges, so a call site never hand-rolls a flex row around them. Give it an `accessibilityLabel` (say, "Rachel Chen's roles") and it is announced as a named group that keeps its badges' text; without one it is a plain row.

The pill is 22 px tall with a 12 px label; `small` is 18 px with an 11 px label and `large` 26 px. `count` is the small pill with the heavier label, `navigationCount` the small solid count, and `reference` a linked key at the 6 px key corner in the code face, underlined, with an arrow when it has an `href`. `token` is a code token chip, the 22 px pill under the small 11 px label in the code face, for a role, a state or an attribute name listed beside its term; `tier` is a tier tag, a 24 px pill with a 10 px inset under an 11 px mono label in caps on its own line, the tag that names a component's tier beside its title, in whichever tone the tier takes. The metric precedence is `notification` > `reference` > `navigationCount` > `count` > `tier` > `token` > `small`. `primary` and `action` take the accent's wash, `soft` names the soft wash every toned pill already has, `neutralFill` fills with the border color, `foreground` overrides the label ink, `dot` adds the leading dot without a status tone, and `inverse` and `solid` supply branded surfaces. `uppercase` tracks caps; `start` pins a badge in a host layout.

`notification` is a destructive count: a 20 px pill with a 600 11 px label, soft by default and solid with `solid`, set off from the page by a ring of the background; `action` adds a halo of the destructive wash. Button carries its own count when passed a `count`.

`signal` is the original standalone 10px status marker. It uses the existing
status-tone precedence and announces its supplied status label.

`marker` is an anatomy figure's numbered disc: a 22 px pill with no inset, its number 600 11 px in the code face on the accent (the solid call-to-action fill under its ink), set off from the stage by a 3 px ring of the stage well's fill (`surface-sunken`) and a drop shadow, the way the component page's Anatomy section numbers a specimen's parts. It wins over the other metrics but `notification`.

`disc` is the same 22 px numbered disc in a legend: the marker's disc and 600 11 px code-face number, in the tone axis's fill (`default` the solid accent for a part the figure draws, `secondary` the quiet surface for one it does not) with no ring and no shadow, the way the Anatomy legend numbers its rows. It sits below `marker` in precedence and above the pills.

`tier` is the tier pill beside a page title (Atom, Molecule, Organism): 24 px tall with a 10 px inset and a 500 11 px label on its own line, tracked in caps with `uppercase` and in the code face with `mono`, in the tone axis's fill. It sits above `small` in precedence.

`band` is a group band's pill, the "pick one" beside an axis's title in a props table: 20 px tall with a 7 px inset, no border, and a 500 11 px label, in the code face with `mono`, in the tone axis's fill (the accent's soft pill with none). It sits between `tier` and `small` in precedence.

## Usage

```tsx
<Badge>admin</Badge>
```

## Variants

### Notification count

```tsx
<Badge notification solid action>3</Badge>
```


### Solid

```tsx
<Badge default>admin</Badge>
```

### Outline

```tsx
<Badge outline>admin</Badge>
```

### Destructive

```tsx
<Badge destructive>admin</Badge>
```

### Mono (token / event names)

```tsx
<Badge mono>refresh_token</Badge>
```

### Status

```tsx
<Badge status>pending</Badge>
```

### Status tones

```tsx
<BadgeGroup>
  <Badge status success>active</Badge>
  <Badge status warning>degraded</Badge>
  <Badge status error>failed</Badge>
  <Badge status info>syncing</Badge>
  <Badge status neutral>archived</Badge>
</BadgeGroup>
```

### Group

```tsx
<BadgeGroup>
  <Badge>employee</Badge>
  <Badge>engineering</Badge>
  <Badge status success>active</Badge>
</BadgeGroup>
```

### Reference link

```tsx
<Badge reference href="https://example.com">CORE-1842</Badge>
```

### Anatomy marker

```tsx
<BadgeGroup>
  <Badge marker>1</Badge>
  <Badge marker>2</Badge>
  <Badge marker>3</Badge>
</BadgeGroup>
```

### Legend disc

```tsx
<BadgeGroup>
  <Badge disc default>1</Badge>
  <Badge disc default>2</Badge>
  <Badge disc secondary>3</Badge>
</BadgeGroup>
```

### Tier pill

```tsx
<BadgeGroup>
  <Badge tier mono uppercase secondary>Atom</Badge>
  <Badge tier mono uppercase soft>Molecule</Badge>
  <Badge tier mono uppercase outline>Organism</Badge>
</BadgeGroup>
```

### Band pill

```tsx
<BadgeGroup>
  <Badge band mono>pick one</Badge>
  <Badge band mono secondary>stacks</Badge>
</BadgeGroup>
```

### Token chips

```tsx
<BadgeGroup tight>
  <Badge token>busy</Badge>
  <Badge token>disabled</Badge>
  <Badge token>aria-expanded</Badge>
</BadgeGroup>
```

## Do & Don't

### Grouping

**Do**: Reach for `BadgeGroup` to lay out a series of badges; it owns the wrap, the gap, and the vertical centering.

```tsx
<BadgeGroup>
  <Badge secondary>employee</Badge>
  <Badge secondary>engineering</Badge>
  <Badge secondary>remote</Badge>
</BadgeGroup>
```

**Don't**: Hand-rolling a flex row for a badge series re-invents the gap and wrap and drifts from the kit's spacing scale.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
  <Badge secondary>employee</Badge>
  <Badge secondary>engineering</Badge>
  <Badge secondary>remote</Badge>
</View>
```

### Metadata badge

**Do**: Neutral tags for metadata; reserve color and the status-badge dot for live state.

```tsx
<BadgeGroup>
  <Badge secondary>employee</Badge>
  <Badge secondary>engineering</Badge>
  <Badge secondary>remote</Badge>
  <Badge status success>active</Badge>
</BadgeGroup>
```

**Don't**: Borrowing status colors for plain metadata reads as severity that isn't there; a red tag looks like an error.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge default>employee</Badge>
  <Badge destructive>engineering</Badge>
  <Badge default>remote</Badge>
  <Badge destructive>active</Badge>
</View>
```

### Status badge

**Do**: Always pair the dot with a word: active, pending, failed.

```tsx
<Badge status error>Failed</Badge>
```

**Don't**: A bare colored dot isn't a label and fails for color-blind users.

```tsx
<Badge status error />
```

### Identity row

**Do**: Show only the one or two badges relevant to this view.

```tsx
<Row wrap alignCenter snug>
  <Typography lead semibold>Rachel Chen</Typography>
  <BadgeGroup>
    <Badge status success>active</Badge>
    <Badge secondary>employee</Badge>
  </BadgeGroup>
</Row>
```

**Don't**: A wall of badges after a name buries the one that matters.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
  <Text style={{ fontSize: 15, fontWeight: "600", color: tokens.foreground }}>Rachel Chen</Text>
  <Badge status success>active</Badge>
  <Badge status info>Verified</Badge>
  <Badge secondary>employee</Badge>
  <Badge secondary>engineering</Badge>
  <Badge secondary>remote</Badge>
  <Badge secondary>admin</Badge>
</View>
```

### Token / code badge

**Do**: Use the mono variant for tokens, scopes, and event names.

```tsx
<BadgeGroup tight>
  <Badge secondary mono>authorization_code</Badge>
  <Badge secondary mono>refresh_token</Badge>
  <Badge secondary mono>client_credentials</Badge>
</BadgeGroup>
```

**Don't**: Proportional type makes identifiers hard to scan and compare.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
  <Badge secondary>authorization_code</Badge>
  <Badge secondary>refresh_token</Badge>
  <Badge secondary>client_credentials</Badge>
</View>
```

### Default variant

**Do**: Reserve the default fill for the single tag you want noticed first; keep the rest secondary.

```tsx
<BadgeGroup>
  <Badge default>admin</Badge>
  <Badge secondary>engineering</Badge>
  <Badge secondary>remote</Badge>
</BadgeGroup>
```

**Don't**: The solid call-to-action fill is the loudest badge; using it for every tag makes the whole row shout and nothing leads.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge default>employee</Badge>
  <Badge default>engineering</Badge>
  <Badge default>remote</Badge>
  <Badge default>admin</Badge>
</View>
```

### Secondary variant

**Do**: Keep secondary for static metadata (role, team) and switch to the status-badge for anything live.

```tsx
<BadgeGroup>
  <Badge secondary>employee</Badge>
  <Badge secondary>engineering</Badge>
  <Badge status success>active</Badge>
</BadgeGroup>
```

**Don't**: A muted gray pill reads as static metadata, so live state shown as a secondary badge looks inert and goes unnoticed.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge secondary>active</Badge>
  <Badge secondary>pending</Badge>
  <Badge secondary>failed</Badge>
</View>
```

### Outline variant

**Do**: Use outline on a plain surface where the quiet border has contrast, for low-priority secondary tags.

```tsx
<Card padded>
  <BadgeGroup>
    <Badge outline>draft</Badge>
    <Badge outline>internal</Badge>
  </BadgeGroup>
</Card>
```

**Don't**: The thin border is the whole badge; on a colored or busy surface it disappears and the label floats unboxed.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, borderRadius: 6, backgroundColor: tokens.primary, padding: 12 }}>
  <Badge outline>draft</Badge>
  <Badge outline>internal</Badge>
</View>
```

### Destructive variant

**Do**: Reserve destructive for genuinely destructive or error semantics like revoked or banned.

```tsx
<BadgeGroup>
  <Badge destructive>Revoked</Badge>
  <Badge destructive>Banned</Badge>
  <Badge secondary>marketing</Badge>
</BadgeGroup>
```

**Don't**: Solid red signals error or danger, so using it to color-code neutral categories raises a false alarm.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge destructive>marketing</Badge>
  <Badge destructive>finance</Badge>
  <Badge destructive>legal</Badge>
</View>
```
