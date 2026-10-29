# Card

A content surface, used three ways: a stat card (a single metric, a big number and a delta), a section card (a labeled surface with an optional eyebrow, header and footer), and the generic card that brings its own structure. It is the Canvas v4 panel: the card fill under a hairline at the card corner (16 px on the web, 12 natively), the small shadow at rest and the large one `raised`; `flat` drops the shadow and steps the fill up a surface, `sunken` drops the shadow and sinks the fill to the well beneath the page (`surface-sunken`, the hand-off's `--bg2` tiles, stages and panels set into a card) under the hairline, and `outlined` drops the shadow and keeps the card fill under the hairline (the hand-off's page cards; a platform whose card control draws an outline instead of a shadow draws both the same), and `heroShadow` is the medium shadow (the hand-off's `--sh-md`, its section hero's stage), between the resting card and the raised one. Precedence is `raised`, `flat`, `sunken`, `outlined`, `heroShadow`.
<!-- only: web android -->
On Android `sunken` is the Material 3 filled card: the well's fill with no outline.
<!-- /only -->
A pressable card lifts 2 px on hover and takes the raised shadow. `selected` draws the primary border with a ring of the accent's soft wash around it.

Corners (pick one; the smaller step wins): the card corner by default, `smallCorners` for the tile corner (12), and the three steps the hand-off's component page frames with, `calloutCorners` (14: a note under a table, a compact link tile), `largeCorners` (18: a card framing a section of a page) and `stageCorners` (20: a staging frame, a figure and its legend), and the two its section pages frame with, `showcaseCorners` (20: a section page's showcase card) and `heroCorners` (24: the section hero's stage). The web skin draws each from its row; the native skins keep their own card corner on every step but the tile.

A card with content is padded by default, and a padded surface also spaces its flat children (the card owns the vertical rhythm, so a stack of Typography lines needs no layout wrapper); pass `flush` to opt out of both, the inset and the spacing, for edge-to-edge content (a table, a nav bar) or when you compose the self-padding `CardHeader`/`CardContent`.

The section props (`eyebrow` / `badge` / `title` / `description` / `icon` / `actions` / `footer`) render self-padding sections, so a sectioned card needs no `padded`: a tracked mono eyebrow with a badge opposite, the 20 px title in the display face over its muted description, the body, and a footer under a hairline in the subtle ink. They compose with a string `body` OR with raw children, so a panel can carry a titled header above a table or a form; children win when both are passed. For a cover image, `CardMedia` is the full-bleed top slot: it spans the card edge to edge, its top corners follow the card's corner, and its bottom edge stays flat; compose it with `flush` and let `CardContent` pad the text below.

Density: the card's own inset is 20 px with an 8 px rhythm; pass `compact` (14 / 8) or `comfortable` (28 / 8) to tighten or relax the card's own padding and the gap between flat children (`compact` takes precedence, and a density prop pads the surface on its own). On a sectioned card (an eyebrow, a title or a footer) the surface never pads, so a density moves its inset and rhythm onto the sections instead: the first section takes the inset above, every section the inset beside, the last the inset below, and each section sits the rhythm under the one before it. `grow` fills the height a parent Row or Column hands the card (the body takes the slack, so a footer stays on its floor); inside a `Grid` cell it is implied, so the tiles of one row are equal-height without being asked.

The hand-off's component page insets are their own density steps, the same on every platform: `panel` (18 with a 12 px rhythm: a section panel, an accessibility card, a figure's legend), `guide` (18×20 with 10: a guidance card), `linkTile` (14×16 with 6: a link tile) and `pager` (16×18 with 4: a previous or next card); the section pages add `well` (16 with a 12 px rhythm: a loading-state well, a wizard's preview).

Gap-free content densities preserve dense application layouts: `dense` (12),
`snug` (18), `cozy` (20), `relaxed` (22×24), `spacious` (28), `insetContent` (14),
`rail` (12×14), `summary` (14×16), `metric` (14×18), `request` (18/22/18/20),
and `menu` (12 vertical). `roomy` sits between `relaxed` and `spacious` and keeps a
rhythm: a 24 px inset with 20 px between flat children, the Canvas v4 section page's
showcase card, the same on every platform. Precedence follows that order, then the
page steps (`panel`, `guide`, `linkTile`, `pager`, `well`), before compact/comfortable.
`gapless` removes flat-child spacing; `borderless`, `inset`,
`dimmed` and `clip` control surface anatomy. `tileShadow`, `rowShadow`, and
`emptyShadow` extend the elevation axis after raised/flat/outlined/heroShadow. Accessible names and
hover-lift reporting are supported on interactive cards.

`interactiveContents` keeps a clickable card from nesting a button role around its
own buttons and links. `steadyPress` preserves its resting opacity while keeping
the hover lift and native ripple.

`gatePanel`, `versionPanel` and `notePanel` preserve the original Argus inset
content surfaces. Precedence is note, version, then gate; they own their secondary
fill, exact insets and corners.

## Usage

```tsx
<Card>
  <Typography caption medium>Active identities</Typography>
  <Typography h3 bold>12,348</Typography>
  <Typography tiny muted>+142 today</Typography>
</Card>
```

## Variants

### Featured approval

`featured` washes the card with the accent's soft tint from its top-left corner and
rims it in the accent. Supply the identity, eyebrow, stage badge, summary, gate
caption, metadata and domain action controls. `stacked` sets a second card behind
it. A pressable featured card lifts two pixels on hover.

```tsx
<Card featured stacked hue={285} initials="B" title="Blueprint" description="v3.0" eyebrow="Awaiting approval · Architect gate" badge="Architecture" body="Proposes service boundaries for pricing and money paths." caption="A human signs every money path." metadata="Commerce · $2.1k / 30d" actions={<Button primary small>Approve</Button>} />
```

### Artwork alone

Give `artwork` a parent with definite height. It paints two radial blooms, the
accent and the brand cyan (swapped on `promo`), over the quiet surface, without
text, padding or shadow. Add `illustration` with children for a 12px inset around
an identity.

```tsx
<Row cozy>
  <Column fill flush style={{ height: 100 }}><Card featured artwork /></Column>
  <Column fill flush style={{ height: 100 }}><Card promo artwork /></Column>
</Row>
```

### Promotional artwork

```tsx
<Card promo title="Gates come down only with receipts." body="Autonomy charter, circuit breakers, all as code." actions={<Button inlineLink link small>Read the charter</Button>} />
```

`promo` sweeps from the accent to the brand cyan, each mixed into the card fill,
under the card's own inks. It stays opaque content in glass mode.


### Linked references

`referenceInline`, `referenceStacked`, `referenceTile` and `referenceDetail`
preserve the original Argus reference layouts. `referenceKey` is the key, `title`
the summary and `description` the status/context. `referenceSource` adds the
source affordance in the detail panel. An `href` opens through the system browser.

```tsx
<Column cozy>
  <Card referenceInline referenceKey="CORE-1790" title="Size the pricing bet" description="In Progress" />
  <Card referenceStacked referenceKey="CORE-1790" title="Size the pricing bet" description="In Progress" />
  <Card referenceTile referenceKey="CORE-1790" title="Size the pricing bet" />
  <Card referenceDetail referenceKey="CORE-1790" title="Size the pricing bet" description="In Progress · Platform Core" referenceSource="Jira" />
</Column>
```


### Board tickets

`board` owns the ticket anatomy while retaining Card's existing surface, corner,
elevation and press behavior. It reads `ticketNumber`, `priorityLabel`, `title`,
`description`, `statusLabel` and `typeLabel`. Metadata shows the values without
visible field-name prefixes; accessible names retain their field context. High
and Critical priorities use the destructive text ink, Medium uses warning, and
other priorities use muted text. Pass the Board render callback's
`moveHandle` unchanged; Card places it at the top right beside the ticket number.
`blocked` displays “Blocked by Discovery” when `blockedReason` is “Discovery”,
or just “Blocked” when there is no reason. `aiActive` reveals
“AI work in progress” with a shimmer in the text and cycling dots. Reduced motion
keeps that label static. Title and description clamp to two lines; each other
text row has one line. The metadata spacer and optional progress keep their
reserved slots, so short and long tickets have the same text height.

`imageSource` accepts an actual React Native image source (including authentication
headers), with `imageLabel` for its accessible name. It adds a taller, full-bleed
header, with matching top corners and the number, move handle and priority over
an opaque, legible backing. Images use contain fitting. A failed image collapses
to the compact metadata header; a new source retries. Only the image header adds
height. Board anatomy takes precedence over raw children and section props.

```tsx
<Card board compact smallCorners tileShadow borderless
  ticketNumber="ARGUS-123" priorityLabel="High" title="Preserve saved work"
  description="Keep the current project state when returning to the board."
  statusLabel="In Progress" typeLabel="Task" aiActive />
```

### Generic

```tsx
<Card>
  <Typography lead semibold>Anything goes here</Typography>
</Card>
```

### Flat children

```tsx
<Card>
  <Typography lead semibold>The surface owns the rhythm</Typography>
  <Typography small muted>Each line lands a steady step below the last.</Typography>
  <Typography small muted>No layout wrapper between them.</Typography>
</Card>
```

### Flat

```tsx
<Card flat>
  <Typography lead semibold>Outlined and quiet</Typography>
</Card>
```

### Raised

```tsx
<Card raised>
  <Typography lead semibold>Lifted above the page</Typography>
</Card>
```

### Outlined

```tsx
<Card outlined>
  <Typography lead semibold>A hairline and no shadow</Typography>
</Card>
```

### Sunken

```tsx
<Card sunken>
  <Typography lead semibold>A well beneath the page</Typography>
</Card>
```

### Elevation samples

`sample` draws an empty card 72 px tall on the popover fill, so a row of them shows the
elevation steps side by side; its edge is the field border at `heroShadow` and `raised`.

```tsx
<Row cozy alignEnd>
  <Column fill><Card sample flat calloutCorners /></Column>
  <Column fill><Card sample calloutCorners /></Column>
  <Column fill><Card sample heroShadow calloutCorners /></Column>
  <Column fill><Card sample raised calloutCorners /></Column>
</Row>
```

### Floating

`floating` marks a card that floats over the page: under glass on the web it takes the
floating material (the functional layer's tint over the backdrop blur), where a resting
card keeps its solid skin.

```tsx
<Card floating heroShadow calloutCorners>
  <Typography label foreground>A pane over the page</Typography>
</Card>
```

### Corners

```tsx
<Column cozy>
  <Card outlined calloutCorners summary>
    <Typography small medium>calloutCorners</Typography>
  </Card>
  <Card outlined largeCorners panel>
    <Typography small medium>largeCorners</Typography>
  </Card>
  <Card outlined stageCorners panel>
    <Typography small medium>stageCorners</Typography>
  </Card>
  <Card outlined showcaseCorners panel>
    <Typography small medium>showcaseCorners</Typography>
  </Card>
  <Card outlined heroCorners panel>
    <Typography small medium>heroCorners</Typography>
  </Card>
</Column>
```

### Showcase frame

The section pages' frame: a showcase card at the showcase corner with the `roomy` density (24 in, 20 between its parts), and the hero's stage at the hero corner under the medium shadow.

```tsx
<Column cozy>
  <Card showcaseCorners roomy>
    <Typography eyebrow subtle>Showcase card</Typography>
    <Typography small subtle>24 in, a 20 px rhythm, the 20 corner.</Typography>
  </Card>
  <Card heroCorners heroShadow>
    <Typography small medium>Hero stage</Typography>
    <Typography small subtle>The 24 corner under the medium shadow.</Typography>
  </Card>
</Column>
```

### Page densities

```tsx
<Column cozy>
  <Card outlined largeCorners guide>
    <Typography h5 level={3}>Guide</Typography>
    <Typography small subtle>18 by 20, a 10 px rhythm.</Typography>
  </Card>
  <Card outlined calloutCorners linkTile>
    <Typography semibold>Link tile</Typography>
    <Typography caption subtle>14 by 16, a 6 px rhythm.</Typography>
  </Card>
  <Card outlined pager>
    <Typography eyebrow subtle>Pager</Typography>
    <Typography lead semibold>16 by 18, a 4 px rhythm.</Typography>
  </Card>
  <Card sunken well>
    <Typography eyebrow subtle>Well</Typography>
    <Typography small subtle>16 all round, a 12 px rhythm.</Typography>
  </Card>
</Column>
```

### Sectioned panel

A density on a sectioned card reshapes the sections: here the eyebrow sits 18 px in and the list 12 px under it.

```tsx
<Card outlined largeCorners panel eyebrow="Keyboard">
  <DescriptionList
    twoColumn
    divided
    items={[
      { term: "Enter", value: "Activates" },
      { term: "Space", value: "Activates" },
    ]}
  />
</Card>
```

### Density

```tsx
<Column cozy>
  <Card compact>
    <Typography lead semibold>Compact</Typography>
    <Typography small muted>Tight padding and rhythm.</Typography>
  </Card>
  <Card comfortable>
    <Typography lead semibold>Comfortable</Typography>
    <Typography small muted>Roomy padding and rhythm.</Typography>
  </Card>
</Column>
```

### Section

```tsx
<Card title="Recent activity" body="Two events today." />
```

### Section with children

```tsx
<Card title="Identity">
  <DescriptionList
    items={[
      { term: "ID", value: "6f1c2a" },
      { term: "State", value: "Active" },
    ]}
  />
</Card>
```

### Icon and footer

```tsx
<Card
  title="Identity"
  icon={<Icon user size={16} />}
  body="Name, primary email, and sign-in methods."
  footer="Updated 2 minutes ago"
/>
```

### Media

```tsx
<Card flush>
  <CardMedia src="/kira-tanaka.jpg" alt="Portrait of Kira Tanaka" />
  <CardContent>
    <Typography h5 semibold>Kira Tanaka</Typography>
  </CardContent>
</Card>
```

### Specimen well

Given children instead of `src`, `CardMedia` is a sunken well that stages live content: the page's sunken fill (an ink tint under glass), the content centered, at least 160 px tall with a 28 x 20 inset, growing with what it holds. `compact` takes the 130 px well with a 24 x 16 inset and `tall` the 240 px one with a 32 x 20 inset; `stage` is a figure's stage, 320 px with an 80 x 40 inset, and `playground` a live specimen's, 340 px with a 44 x 28 inset that also grows to the height and the remaining width of a panel beside it (precedence `compact`, `tall`, `stage`, `playground`). `height` sizes the image band only. Children win over `src`.

```tsx
<Card flush>
  <CardMedia>
    <Button primary>Save changes</Button>
  </CardMedia>
  <CardSeparator />
  <CardContent>
    <Typography small medium>Primary</Typography>
  </CardContent>
</Card>
```

### Caption density

`CardContent` pads its body 20 px on every side. Under a media well a caption takes a
tighter inset: `dense` is 10 x 14 (a one-line label), `compact` 12 x 16 (a title over a
meta line) and `cozy` 14 x 16 (a title, a note and a code line). Precedence is `dense`,
then `compact`, then `cozy`.

```tsx
<Card flush>
  <CardMedia compact>
    <Button small>Save</Button>
  </CardMedia>
  <CardSeparator />
  <CardContent dense>
    <Typography caption mono medium muted>size small</Typography>
  </CardContent>
</Card>
```

### Specimen well sizes

```tsx
<Column relaxed>
  <Card flush>
    <CardMedia compact>
      <Button small>Small</Button>
    </CardMedia>
    <CardSeparator />
    <CardContent>
      <Typography small medium>compact</Typography>
    </CardContent>
  </Card>
  <Card flush>
    <CardMedia tall>
      <Button large>Large</Button>
    </CardMedia>
    <CardSeparator />
    <CardContent>
      <Typography small medium>tall</Typography>
    </CardContent>
  </Card>
</Column>
```

### Actions

```tsx
<Card flush>
  <CardContent>
    <Typography small>Rename the workspace. The URL updates everywhere.</Typography>
  </CardContent>
  <CardSeparator />
  <CardFooter>
    <Button ghost small>Cancel</Button>
    <Button primary small>Save</Button>
  </CardFooter>
</Card>
```

### Pressable

Pass `onPress` and the whole card becomes a control, with the button role. On the web it lifts under the pointer: it rises 2 px over 180 ms while its resting shade deepens to the raised one in step, and settles back when the pointer leaves (a `raised` or `flat` card rises with its shade unchanged). While it lifts and settles it stacks above the cards around it, so its deeper shade falls over the next one. Reduce Motion makes the change instant.
<!-- only: web -->
iOS and Android keep their own press feedback.
<!-- /only -->
<!-- only: ios android -->
The native apps keep the platform's own press feedback.
<!-- /only -->

```tsx
<Column relaxed>
  <Card onPress={() => {}} title="Scout" description="Research agent, v2.3" />
  <Card onPress={() => {}} title="Mint" description="Release agent, v1.8" />
</Column>
```

### Selectable

```tsx
<Card selected onPress={() => {}}>
  <Typography lead semibold>Pro</Typography>
</Card>
```

## Do & Don't

### stat

**Do** — One big number, a short label, a small delta. The metric is scannable in a glance.

```tsx
<Card padded>
  <Row between alignStart>
    <Column tight>
      <Typography caption medium>Active identities</Typography>
      <Typography h3 bold>12,348</Typography>
      <Typography tiny muted>+142 today</Typography>
    </Column>
    <Emblem primary label="U" />
  </Row>
</Card>
```

**Don't** — Prose where the number should be: the eye has nothing big to land on, so the card stops being a stat.

```tsx
<Card padded>
  <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.4, color: tokens["muted-foreground"] }}>This month</Text>
  <Text style={{ marginTop: 4, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["card-foreground"] }}>We onboarded 12,348 active identities, up 142 today, with churn holding steady.</Text>
</Card>
```

### section

**Do** — Give the header its title and description through the card's own parts; the header's spacing sets it apart from the body.

```tsx
<Card flush>
  <CardHeader>
    <CardTitle>Recent activity</CardTitle>
    <CardDescription>Events from the last 24 hours.</CardDescription>
  </CardHeader>
  <CardContent>
    <Typography small>Two events today.</Typography>
  </CardContent>
</Card>
```

**Don't** — Hand-style a title in the body; it loses the card's title type and the header's spacing.

```tsx
<Card flush>
  <CardContent>
    <Text style={{ fontSize: 18, fontWeight: "700", color: tokens["card-foreground"] }}>Recent activity</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["card-foreground"] }}>Two events today.</Text>
  </CardContent>
</Card>
```

### generic

**Do** — Use the surface once and layout the content with plain spacing inside it.

```tsx
<Card padded>
  <Column tight>
    <Typography lead semibold>Anything goes here</Typography>
    <Typography small muted>The card surface gives you the border, radius, and shadow. You bring the content.</Typography>
  </Column>
</Card>
```

**Don't** — Nesting one card surface inside another stacks border on border and shadow on shadow; the inner block looks dropped in.

```tsx
<Card padded>
  <Card padded>
    <Text style={{ marginBottom: 4, fontSize: 15, fontWeight: "600", color: tokens["card-foreground"] }}>Nested surface</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>A card inside a card doubles the border and shadow.</Text>
  </Card>
</Card>
```
