# Badge

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 86ef0dd5d9d38fae6d7bc8bc3fe6497bee4796a18ec156364a14f4fae6008b14

Source: `src/atoms/badge/badge.md`
Human reference: https://canvas.nannier.com/components/badge

## Public imports

```tsx
import { Badge, BadgeGroup } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Two families on one Badge component, picked by boolean props. The metadata badge labels a schema, role, or tag: with no tone it is the accent's soft pill, and the tones give `default` the solid call-to-action pill, `secondary` the quiet surface pill, `outline` a hairline pill and `destructive` the soft red pill; add `mono` for token names. A status tone (`success`, `warning`, `error`, `info`, `neutral`) paints the pill in that tone's wash and ink and leads it with a dot. The status badge (`status`) has no pill: a dot in the tone's color, ringed in its wash, beside a muted label, for live state like active, pending, or failed.

The tone colors come from `statusColors`, the helper every toned surface in the kit reads, so a warning badge and a warning alert are the same state, and every ink is the solved text role that keeps 4.5:1 on its wash.

`contrast` is the most prominent neutral: the scheme's ink (`foreground`) as the fill under the page colour as the label (under glass, the ink at the dense alpha, as the Tooltip bubble's). `dashed` is the placeholder outline: no fill inside a dashed `field-border` edge, the label in the second ink.

If more than one tone is passed, Badge resolves the highest-precedence one: `default` > `contrast` > `destructive` > `secondary` > `outline` > `dashed` for metadata (the accent's soft pill when none is passed), and `success` > `error` > `warning` > `info` > `neutral` for status (`neutral` when none is passed). The metadata tones win over a status tone's colors; the status tone's dot stays.

`cyan` and `mint` paint a metadata pill in a fixed series hue, the same whatever the palette (the hand-off's `--cyan` and `--mint`, the `chart-2` and `chart-3` tokens): the hue's 16% wash under its ink, solved to 4.5:1 on the wash, with no dot. They sit after the status tones in precedence (`success` > `warning` > `error` > `info` > `cyan` > `mint`), so a section can name three tiers mint, cyan and the accent and keep them apart under every palette.

Lay out a series of badges with `BadgeGroup`, a wrapping row that owns the gap (`tight` 4 / `compact` 6 / `snug` 8 / `cozy` 12, default `compact`, the hand-off's 6; the largest gap passed wins: `cozy` > `snug` > `compact` > `tight`) and centers its badges, so a call site never hand-rolls a flex row around them. Give it an `accessibilityLabel` (say, "Rachel Chen's roles") and it is announced as a named group that keeps its badges' text; without one it is a plain row.

The pill is 22 px tall with a 12 px label; `small` is 18 px with an 11 px label and `large` 26 px. `count` is the small pill with the heavier label, `navigationCount` the small solid count, and `reference` a linked key at the 6 px key corner in the code face, underlined, with an arrow when it has an `href`. `token` is a code token chip, the 22 px pill under the small 11 px label in the code face, for a role, a state or an attribute name listed beside its term; `tier` is a tier tag, a 24 px pill with a 10 px inset under an 11 px mono label in caps on its own line, the tag that names a component's tier beside its title, in whichever tone the tier takes. `tiny` is the 18 px pill under a 10 px label on its own line, at the regular weight even when `solid` (a navigation row's "New" tag). The metric precedence is `notification` > `marker` > `disc` > `step` > `reference` > `navigationCount` > `count` > `tier` > `band` > `tick` > `token` > `tiny` > `small`. `primary` and `action` take the accent's wash, `soft` names the soft wash every toned pill already has, `neutralFill` fills with the border color, `foreground` overrides the label ink, `dot` adds the leading dot without a status tone, and `inverse` and `solid` supply branded surfaces. `uppercase` tracks caps; `start` pins a badge in a host layout.

`notification` is a destructive count: a 20 px pill with a 600 11 px label, soft by default and solid with `solid`, set off from the page by a ring of the background; `action` adds a halo of the destructive wash. Button carries its own count when passed a `count`.

`signal` is the original standalone 10px status marker. It uses the existing
status-tone precedence and announces its supplied status label.

`marker` is an anatomy figure's numbered disc: a 22 px pill with no inset, its number 600 11 px in the code face on the accent (the solid call-to-action fill under its ink), set off from the stage by a 3 px ring of the stage well's fill (`surface-sunken`) and a drop shadow, the way the component page's Anatomy section numbers a specimen's parts. It wins over the other metrics but `notification`.

`disc` is the same 22 px numbered disc in a legend: the marker's disc and 600 11 px code-face number, in the tone axis's fill (`default` the solid accent for a part the figure draws, `secondary` the quiet surface for one it does not) with no ring and no shadow, the way the Anatomy legend numbers its rows. It sits below `marker` in precedence and above the pills.

`tier` is the tier pill beside a page title (Atom, Molecule, Organism): 24 px tall with a 10 px inset and a 500 11 px label on its own line, tracked in caps with `uppercase` and in the code face with `mono`, in the tone axis's fill. It sits above `small` in precedence.

`band` is a group band's pill, the "pick one" beside an axis's title in a props table: 20 px tall with a 7 px inset, no border, and a 500 11 px label, in the code face with `mono`, in the tone axis's fill (the accent's soft pill with none). It sits between `tier` and `small` in precedence; like `tick`, it never leads with a tone's dot.

`tick` is a ruler tick's readout: 20 px tall with an 8 px inset, no border and a 500 10 px label in the code face on the pill's own 20 px line, usually `contrast` (the Layout page's "this window" pill under its marker).

`step` is a numbered step mark: a 32 px square at the 10 px step corner with its number 600 13 px in the code face, centred, in the tone axis's fill: `default` the solid accent with the accent's glow beneath, none the accent's soft wash, `secondary` the quiet surface inside the `field-border` edge in the second ink. Pass it as a MediaObject's `icon` with `bareIcon` to number a list of steps.

`keyCorners` sets any pill at the key cap's 6 px corner in place of the round one (the corner axis has this one member); `reference` and `step` keep their own corners.

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

### Bare dot

`dot` with no label is the 8 px dot alone, in the tone's ink with no pill: a marker beside
text that names it. Give it an `accessibilityLabel` when it carries meaning of its own.

```tsx
<Row snug alignCenter>
  <Badge dot />
  <Typography small>Live</Typography>
</Row>
```

### Hue tones

```tsx
<BadgeGroup>
  <Badge mint mono>compact</Badge>
  <Badge cyan mono>regular</Badge>
  <Badge mono>wide</Badge>
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

### Contrast tick

```tsx
<Badge tick contrast>this window · 1440px</Badge>
```

### Step marks

```tsx
<BadgeGroup>
  <Badge step default>1</Badge>
  <Badge step>2</Badge>
  <Badge step secondary>3</Badge>
</BadgeGroup>
```

### Key corners and the dashed outline

```tsx
<BadgeGroup>
  <Badge band mono keyCorners>fill</Badge>
  <Badge band mono keyCorners cyan>hug</Badge>
  <Badge mono keyCorners dashed>View</Badge>
  <Badge mono keyCorners dashed>ScrollView</Badge>
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

## Supported props

### BadgeProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  |  |
| status | boolean \| undefined | no | false | Family: metadata badge (default) vs. status badge (with a dot). |
| soft | boolean \| undefined | no | false | Soft intent fill with matching ink (every toned pill is soft; kept for the intent grammar). |
| solid | boolean \| undefined | no | false |  |
| action | boolean \| undefined | no | false |  |
| primary | boolean \| undefined | no | false |  |
| inverse | boolean \| undefined | no | false |  |
| neutralFill | boolean \| undefined | no | false | Neutral border-colored fill. |
| foreground | boolean \| undefined | no | false | Foreground ink on the quiet surface. |
| small | boolean \| undefined | no | false | The small pill: 18 px tall, 11 px label. |
| tiny | boolean \| undefined | no | false | The tiny pill: 18 px tall under a 10 px label on the pill's own 18 px line, at the regular weight even when solid (a navigation row's "New" tag beside its count). |
| count | boolean \| undefined | no | false | A count at the small size with the heavier label. |
| navigationCount | boolean \| undefined | no | false | Solid count used in navigation. |
| notification | boolean \| undefined | no | false | Compact counter carried by a notification control. |
| reference | boolean \| undefined | no | false | A linked reference key at the key corner, in the code face. |
| token | boolean \| undefined | no | false | A code token chip: the 22 px pill with its 8 px inset under the small 11 px label in the code face, for a role, a state or an attribute name beside its term. |
| large | boolean \| undefined | no | false | The large pill: 26 px tall. |
| marker | boolean \| undefined | no | false | An anatomy figure's numbered marker: a 22 px disc on the accent with its number in the code face, set off from the stage by a ring of the stage's fill and a shadow (Component.dc.html line 220). |
| disc | boolean \| undefined | no | false | A legend's numbered disc: the marker's 22 px disc with its number in the code face, in the tone axis's fill (the solid accent as `default`, the quiet surface as `secondary`) with no ring and no shadow (Component.dc.html line 222, the anatomy legend's part numbers). |
| tier | boolean \| undefined | no | false | A tier pill (Atom, Molecule, Organism beside a page title): 24 px tall with a 10 px inset and a 500 11 px label on its own line (Component.dc.html line 139), tracked in caps with `uppercase` and in the code face with `mono`, as the page sets it. |
| band | boolean \| undefined | no | false | A group band's pill (the props table's "pick one" beside an axis's title): 20 px tall with a 7 px inset and a 500 11 px label (Component.dc.html line 237), in the code face with `mono` as the page sets it, in the tone axis's fill (the accent's soft pill with none). It sits between `tier` and `small` in precedence. |
| tick | boolean \| undefined | no | false | A ruler tick's pill (the Layout page's "this window" readout under its marker): 20 px tall with an 8 px inset and a 500 10 px label in the code face on the pill's own 20 px line, with no border and no tone dot. Usually with `contrast`. After `band` in precedence. |
| step | boolean \| undefined | no | false | A numbered step mark (the Layout page's "try in this order" list): a 32 px square at the step mark's corner with its number 600 13 px in the code face, centred. In the tone axis's fill: `default` the solid accent with its glow, none the accent's soft wash, `secondary` the quiet surface inside the `field-border` edge in the second ink. Pass it as a MediaObject's `icon` with `bareIcon`. After `disc` in precedence. |
| keyCorners | boolean \| undefined | no | false | The key cap's corner in place of the round pill's, on any size: the sizing legend's mode tags and the primitive names under a Grid (Layout.dc.html). The corner axis has this one member; `reference` and `step` keep their own corners. |
| dot | boolean \| undefined | no | false | Show the intent dot without switching to the status family. With no children it is the bare 8 px dot in the tone's ink, with no pill (a marker beside text that names it). |
| signal | boolean \| undefined | no | false | Standalone 10px signal marker, retaining its status label. |
| start | boolean \| undefined | no | false | Pin to the start when embedded in an unmeasured host layout. |
| uppercase | boolean \| undefined | no | false |  |
| href | string \| undefined | no |  | A reference can open its source in the system browser. |
| default | boolean \| undefined | no | false | Metadata tone (pick one; default is the accent's soft pill). |
| secondary | boolean \| undefined | no | false | Metadata tone (pick one; default is the accent's soft pill). |
| outline | boolean \| undefined | no | false | Metadata tone (pick one; default is the accent's soft pill). |
| dashed | boolean \| undefined | no | false | The placeholder outline: no fill inside a dashed `field-border` edge, the label in the second ink (the Layout page's primitive names). On the tone axis after `outline`. |
| contrast | boolean \| undefined | no | false | The contrast pill: the scheme's ink (`foreground`) as the fill under the page colour (`background`) as the label, the most prominent neutral (the Layout ruler's "this window" readout). On the tone axis after `default`; under glass the ink at the dense alpha, as the Tooltip bubble's, so its label keeps its contrast. |
| destructive | boolean \| undefined | no | false |  |
| mono | boolean \| undefined | no | false | Metadata modifier: monospace face for tokens, scopes, event names. |
| success | boolean \| undefined | no | false | Status tone (pick one; on a metadata pill it paints the tone and adds the dot). |
| warning | boolean \| undefined | no | false | Status tone (pick one; on a metadata pill it paints the tone and adds the dot). |
| error | boolean \| undefined | no | false | Status tone (pick one; on a metadata pill it paints the tone and adds the dot). |
| info | boolean \| undefined | no | false | Status tone (pick one; on a metadata pill it paints the tone and adds the dot). |
| neutral | boolean \| undefined | no | false | Status tone (pick one; on a metadata pill it paints the tone and adds the dot). |
| cyan | boolean \| undefined | no | false | The fixed cyan series hue (the hand-off's `--cyan`, `chart-2`) as a soft pill, whatever the palette: its 16% wash under its ink, solved to 4.5:1 on the wash. No dot. On the intent axis, after the status tones. |
| mint | boolean \| undefined | no | false | The fixed mint series hue (the hand-off's `--mint`, `chart-3`) as a soft pill, like `cyan`. |
| accessibilityLabel | string \| undefined | no |  | Accessible name for the badge. Most useful for the status family: the bare-dot status form (`<Badge status error />` with no children) is otherwise color-only and silent to screen readers. When omitted on a childless status badge, the status tone word (e.g. "error") is announced as a fallback. Mirrors the Spinner/Progress `accessibilityLabel` contract. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

### BadgeGroupProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  | The Badge elements to lay out in a wrapping row. |
| tight | boolean \| undefined | no | false | Inter-badge gap (pick one; default `compact`, the hand-off's 6). Precedence: cozy > snug > compact > tight. |
| compact | boolean \| undefined | no | false | Inter-badge gap (pick one; default `compact`, the hand-off's 6). Precedence: cozy > snug > compact > tight. |
| snug | boolean \| undefined | no | false | Inter-badge gap (pick one; default `compact`, the hand-off's 6). Precedence: cozy > snug > compact > tight. |
| cozy | boolean \| undefined | no | false | Inter-badge gap (pick one; default `compact`, the hand-off's 6). Precedence: cozy > snug > compact > tight. |
| accessibilityLabel | string \| undefined | no |  | Accessible name for the whole group (e.g. "Rachel Chen's roles"). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
