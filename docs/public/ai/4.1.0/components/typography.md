# Typography

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 67dc17133b58d1a84056a7de4adc0eb91490ed8002a53a34897e3109a497dd42

Source: `src/atoms/typography/typography.md`
Human reference: https://canvas.nannier.com/components/typography

## Public imports

```tsx
import { Typography } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Type scale classes for headings, body text, and helper styles.

`terminal` selects the system terminal face while retaining the reading role, size, weight, and ink: pair it with `tiny`, `caption`, `small`, or a heading. The web uses the system monospace stack beginning with `ui-monospace`, SFMono-Regular, and Menlo; native platforms use Menlo or their monospace alias. Existing `mono` and code typography keep their current behavior.

Argus reading roles include `subheading`, `label`, `micro`, `tag`, `eyebrow`,
`eyebrowLg`, `stageLabel`, `statValue`, `metricValue`, and `formValue`. These extend
Typography itself. Semantic leading and tracking props preserve the reference's
fractional web metrics; for example `labelLeading` is the compact label line box
and `wideTracking` its uppercase eyebrow tracking. `extraBold` selects the 800 face.
The owner's exact-reference directive preserves the existing 9.5px eyebrows.

`foreground`, `inverse`, `action`, `actionForeground`, and `info` name the ink;
`hue` gives a stage its theme-aware identity text. `inverseHint`, `inverseSubtle`,
`inverseMuted`, `inverseSoft`, and `inverseFaint` express the reference's hierarchy
on branded surfaces. `numberOfLines` truncates a reading block, and accessible
labels and roles stay with the text. Existing roles and defaults keep working.

`section` lets a heading own its `count`, muted `description` and trailing `actions`.
They wrap along a shared baseline, preserving dense section anatomy. Pair it with
`h5 bold labelLeading` or `subheading bold labelLeading`; the latter uses the compact
metadata metrics. Actions move to the far edge and wrap below on narrow surfaces.

`level={1..6}` sets the heading level assistive tech hears without changing the
look. A heading role exposes its own level (`hero`, `pageTitle`, `display` and `h1` at 1, `sectionTitle` at 2, `cardTitle` at 3, `h2` to `h5` at
2 to 5, a `section` heading 6), so `<Typography h3 level={2}>` draws the h3 size
and is announced as a level-2 heading: a real `<h2>` on the web, the header trait
natively. On a non-heading role `level` makes the text a heading at that level.
`href` still wins: a link is never a heading. The level is a number because it is
the document outline, not a style (the same reason Row's `span` is one); the look
stays on the boolean role axis.

`hero` and `pageTitle` are the two fluid headlines, sized by the window rather than a
fixed step: `hero` is the landing headline (56 to 112 px at 7.2 percent of the window,
a .94 line, tracked -.045em) and `pageTitle` a page's own title (40 to 64 px at 5
percent, a 1.0 line, tracked -.04em). Both are medium-weight display face.

The page roles are the hand-off pages' own titles and leads, outside its type table:
`sectionTitle` (a page section's heading, display 500 28/1.1), `cardTitle` (a feature
card's title, display 500 22/1.15), `panelTitle` (a panel's title, display 500 20/1.2),
`tagline` (the line under a section's title, display 400 22/1.3), `pageLead` (a page's
summary, 18/1.55, held to the hand-off's 72ch measure), `sectionLead` (a section's introduction, 17/1.55), `cardBody` (a feature
card's description, 14/1.55), `sectionNote` (the note under a section's heading,
14/1.5), `pageBody` (a page's body paragraph, 15/1.6) and `pageNote` (a page's note paragraph,
14/1.6), the last six in the secondary ink and the last two held to an 80ch measure.
Four more are the component page's own: `pageLabel` (a panel's "Props", a rail's group
header, a table's header cell, a previous/next eyebrow: 500 11/1 tracked .08em in caps, in
the subtle ink; pass `mono` for the mono face, as the hand-off's page does), `knobLabel` (a
knob panel's label row, a knob's name and its type hint: 500 12/1 in the secondary ink, the
hint beside it in the `muted` tone, the third ink; pass `mono` for the mono face), `guideTitle` (a
guidance card's title, 600 16/1.3 in the interface face, a level-3 heading) and `guideBody`
(a guidance card's paragraph, 400 13.5/1.6 in the secondary ink). `pageLabel` is not the
`eyebrow`: that is the type table's accent-ink label tracked .1em. `pagerName` is the
previous or next card's name under its label: the display face, 500 18 on the face's own 22
line (the hand-off sets no ratio), in the foreground ink. Two are the reference sheet's cells
(the component page's props table): `specMeta` (a type or default cell, 400 12/1.55; pass
`mono` for the mono face and `subtle` or `muted` for the ink, as the sheet's cells take
them) and `specText` (a description cell or an inherited-props note, 400 13/1.55 in the
secondary ink).
line the same way: `pagerLabel` (the previous or next card's label over its name, the page
label's 500 11 tracked .08em in caps and subtle ink on a 14 line; pass `mono`), `legendLabel`
(a legend row's label beside its numbered disc, 500 14 on an 18 line in the foreground ink)
and `tileCaption` (a specimen tile's caption strip, 500 12 on a 16 line in the secondary ink;
pass `mono`). Three more are the component page's Variants and Tokens sections: `variantTitle`
(a variant card's title over its note and snippet, 500 14/1.3 in the foreground ink),
`linkName` (a link tile's name beside its arrow, 600 14 on the face's own 18 line in the
foreground ink) and `subsectionTitle` (a section's own sub-heading over a grid of tiles,
600 16 on the face's own 20 line in the interface face, a level-3 heading).

The section pages' card roles are the hand-off's section cards' own text, one role per
value set however many pages set it: `cardNote` (a card's foot caption or an in-card note,
400 12/1.6 in the subtle ink; pass `mono`), `codeLabel` (a code name on its own line, a
variant row's label or a token's name, 400 12 on a 16 line in the secondary ink; pass
`mono`), `inlineNote` (a note beside a specimen, 400 12 on a 15 line in the subtle ink),
`tileTitle` (a tile's title, display 500 15/1.3), `paneTitle` (a pane's title, display 500
16/1.2 tracked -.01em; pass `level` to announce it), `gridLabel` (a grid widget's label, 500
10 mono tracked .08em in caps on a 13 line, subtle ink), `tick` (a scale's tick label, 500 10
mono on a 13 line, secondary ink), `rowLabel` (a stat row's label, 500 11/1 mono tracked
.06em in caps, subtle ink), `rowValue` (the value beside it, display 500 22/1 tracked
-.02em), `headlineValue` (a card's headline figure, display 500 26/1 tracked -.02em),
`bigNumber` (a card's big number, display 500 40/1 tracked -.03em), `unit` (the unit after a
figure, 400 16 on a 20 line in the subtle ink, nested in the figure's Typography so it shares
its baseline), `sampleLabel` and `sampleMeta` (a sample's caption and meta line, 400 11 on 14
and 400 10 on 13 in the subtle ink; pass `mono`) and `base` (the 14 px body in the
foreground ink, 400 14 on an 18 line). The figures and titles rank with the titles, the
labels with the page label, and the notes, samples, unit and base with the reading roles.

`natural` sets the text on its face's own normal line at the role's size, the line the
hand-off's text takes where it sets a size with no ratio: JetBrains Mono 10, 11 and 12 px on
13, 14 and 16, Instrument Sans 12, 13 and 14 on 15, 16 and 18, Bricolage Grotesque 14 and
15 on 17 and 18 (measured in Chromium on the faces, 10 to 28 px). The face is the one the
text is set in: `mono`, a display role, or the interface face. It sits on the leading axis
after the fixed ratios and before `tightLeading`.

`cyan` and `mint` are two inks on the tone axis that name a fixed series hue whatever the
palette (the hand-off's `--cyan` and `--mint`, the `chart-2` and `chart-3` tokens), each
solved to 4.5:1 on the scheme's surfaces. Tone precedence: `destructive`, `warning`,
`success`, `cyan`, `mint`, `primary`, `subtle`, `muted`.

`code` is the standalone code pill (regular 13px mono on the muted fill, a 6 radius and 2
by 6 padding). `code inline` is the prose code chip, a word of code inside a sentence: the
hand-off's inline `<code>`, regular weight at .88 of the surrounding reading role's size
(pass that role beside it, `lead`, `small`, `pageBody`, `pageNote`, `pageLead` or
`sectionLead`; body when none), a 5 radius, 1 by 5 padding, the surface fill and a 1px
hairline rim. The chip keeps its regular weight inside a strong run, as the hand-off
applies bold and code independently. Under glass the fill is the same ink tint the pill
takes. Natively a Text nested in a Text has no border and no vertical box, so there the
chip draws its fill and horizontal padding only; `inline` without `code` does nothing.

## Usage

```tsx
<Typography>The quick brown fox</Typography>
```

## Variants

### Hero

```tsx
<Typography hero>Made of light.</Typography>
```

### Page title

```tsx
<Typography pageTitle>Button</Typography>
```

### Section title

```tsx
<Typography sectionTitle>Playground</Typography>
```

### Card title

```tsx
<Typography cardTitle>One charged accent</Typography>
```

### Panel title

```tsx
<Typography panelTitle>Workspace</Typography>
```

### Tagline

```tsx
<Typography tagline>Buttons, toggles and sliders.</Typography>
```

### Page lead

```tsx
<Typography pageLead>Six intents, three sizes and every state.</Typography>
```

### Section lead

```tsx
<Typography sectionLead>Everything here is live. Press, drag and toggle.</Typography>
```

### Card body

```tsx
<Typography cardBody>Surfaces are lit glass.</Typography>
```

### Section note

```tsx
<Typography sectionNote>Every control sets a real prop.</Typography>
```

### Display

```tsx
<Typography display>The quick brown fox</Typography>
```

### H1

```tsx
<Typography h1>The quick brown fox</Typography>
```

### H2

```tsx
<Typography h2>The quick brown fox</Typography>
```

### H3

```tsx
<Typography h3>The quick brown fox</Typography>
```

### H4

```tsx
<Typography h4>The quick brown fox</Typography>
```

### H5

```tsx
<Typography h5>The quick brown fox</Typography>
```

### Lead

```tsx
<Typography lead>The quick brown fox</Typography>
```

### Body

```tsx
<Typography body>The quick brown fox</Typography>
```

### Small

```tsx
<Typography small>The quick brown fox</Typography>
```

### Tiny

```tsx
<Typography tiny>The quick brown fox</Typography>
```

### Muted

```tsx
<Typography muted>The quick brown fox</Typography>
```

### Caption

```tsx
<Typography caption>The quick brown fox</Typography>
```

### Code

```tsx
<Typography code>The quick brown fox</Typography>
```

### Inline code

```tsx
<Typography pageBody>
  Pass 
  <Typography code inline pageBody>secondary</Typography>
   for the next action down.
</Typography>
```

### Mono

```tsx
<Typography mono>The quick brown fox</Typography>
```

### Page label

```tsx
<Typography pageLabel mono>Props</Typography>
```

### Knob label

```tsx
<Row between snug>
  <Typography knobLabel mono>iconLeft</Typography>
  <Typography knobLabel mono muted>icon</Typography>
</Row>
```

### Guide title

```tsx
<Typography guideTitle>Real links (href)</Typography>
```

### Guide body

```tsx
<Typography guideBody>A button that navigates renders a real link on the web, so middle-click and open-in-new-tab work.</Typography>
```

### Pager name

```tsx
<Typography pagerName>ButtonGroup</Typography>
```

### Spec meta

```tsx
<Typography specMeta mono subtle>ReactNode</Typography>
```

### Spec text

```tsx
<Typography specText>An icon element rendered before the label. It takes the label's ink and size.</Typography>
```

### Pager label

```tsx
<Typography pagerLabel mono>Previous</Typography>
```

### Legend label

```tsx
<Typography legendLabel>Leading icon</Typography>
```

### Tile caption

```tsx
<Typography tileCaption mono>small</Typography>
```

### Variant title

```tsx
<Typography variantTitle>Attention required</Typography>
```

### Link name

```tsx
<Typography linkName>Row & Column</Typography>
```

### Subsection title

```tsx
<Typography subsectionTitle>Related components</Typography>
```

### Card note

```tsx
<Typography cardNote mono>&lt;Button primary&gt; · &lt;Button outline&gt;</Typography>
```

### Card figures

```tsx
<Column>
  <Typography bigNumber tabular>107<Typography unit> components</Typography></Typography>
  <Typography headlineValue tabular>1,284</Typography>
  <Row alignCenter between relaxed>
    <Typography rowLabel>p95</Typography>
    <Typography rowValue tabular>212 ms</Typography>
  </Row>
</Column>
```

### Card labels

```tsx
<Column>
  <Typography tileTitle natural>Phone</Typography>
  <Typography paneTitle>Overview</Typography>
  <Typography gridLabel>Revenue</Typography>
  <Typography tick>sm 640</Typography>
  <Typography codeLabel mono>primary</Typography>
  <Typography inlineNote>Keycaps read as one unit</Typography>
  <Typography sampleLabel mono>285</Typography>
  <Typography sampleMeta mono>#0a0a0f</Typography>
  <Typography base>Design · 24 members</Typography>
</Column>
```

### Natural leading

```tsx
<Column flush>
  <Typography caption mono natural>container 1164 px</Typography>
  <Typography small subtle natural>Hugs its content</Typography>
</Column>
```

### Hue tones

```tsx
<Row relaxed>
  <Typography tiny mono medium mint natural>≤ 640</Typography>
  <Typography tiny mono medium cyan natural>641 – 1024</Typography>
  <Typography tiny mono medium primary natural>≥ 1025</Typography>
</Row>
```

### Semibold

```tsx
<Typography semibold>The quick brown fox</Typography>
```

### Primary

```tsx
<Typography primary>View invoices</Typography>
```

### Success

```tsx
<Typography success>+12.4% this week</Typography>
```

### Destructive

```tsx
<Typography destructive>Payment failed</Typography>
```

### Underline

```tsx
<Typography underline>View invoices</Typography>
```

### Italic

`italic` sets the text in the face's italic, on any role.

```tsx
<Typography italic>Draft, not yet shared</Typography>
```

### Tight leading

```tsx
<Column flush>
  <Typography lead tightLeading>Canvas</Typography>
  <Typography tiny tightLeading>design system</Typography>
</Column>
```

### Tabular

```tsx
<Column tight>
  <Row alignCenter between relaxed>
    <Typography small>Requests</Typography>
    <Typography tabular>1,204,118</Typography>
  </Row>
  <Row alignCenter between relaxed>
    <Typography small>Errors</Typography>
    <Typography tabular>11,407</Typography>
  </Row>
</Column>
```

### Heading level

```tsx
<Column chapter>
  <Typography h3 level={2}>Playground</Typography>
  <Typography h3 level={2}>Examples</Typography>
</Column>
```

## Do & Don't

### display

**Do** — Use display once per hero, then drop to a muted line for the supporting copy.

```tsx
<Column snug>
  <Typography display>Welcome</Typography>
  <Typography muted>Sign in to pick up where you left off.</Typography>
</Column>
```

**Don't** — Two display-size lines in one view fight for attention and leave no clear focal point.

```tsx
<View style={{ gap: 8 }}>
  <Typography display>Welcome</Typography>
  <Typography display>Get started</Typography>
</View>
```

### h1

**Do** — Give each page a single h1, then step down to h2 for the sections beneath it.

```tsx
<Column relaxed>
  <Typography h1>Billing</Typography>
  <Typography h2>Invoices</Typography>
</Column>
```

**Don't** — Two h1 titles on a page break the document outline and confuse assistive tech.

```tsx
<View style={{ gap: 4 }}>
  <Typography h1>Billing</Typography>
  <Typography h1>Invoices</Typography>
</View>
```

### h2

**Do** — Follow an h1 with h2 for its top-level sections; don't skip the scale.

```tsx
<Column relaxed>
  <Typography h1>Settings</Typography>
  <Typography h2>Profile</Typography>
</Column>
```

**Don't** — Jumping from h1 straight to h4 skips a level and flattens the visible hierarchy.

```tsx
<View>
  <Typography h1>Settings</Typography>
  <Typography h4 style={{ marginTop: 16 }}>Profile</Typography>
</View>
```

### h3

**Do** — Reserve heading styles for titles; set running text in a small body utility.

```tsx
<Column tight>
  <Typography h3>About Canvas</Typography>
  <Typography body>Canvas is a universal React Native UI kit for building consistent product interfaces.</Typography>
</Column>
```

**Don't** — Body copy set in a heading style is hard to read in bulk and flattens the hierarchy.

```tsx
<Typography h3>Canvas is a universal React Native UI kit for building consistent product interfaces.</Typography>
```

### h4

**Do** — Keep h4 to a short label and carry the explanation in a small supporting line.

```tsx
<Column tight>
  <Typography h4>Notifications</Typography>
  <Typography small>Choose how and when we reach you.</Typography>
</Column>
```

**Don't** — h4 is a minor heading, not a place for full sentences; long text at this weight reads as a wall.

```tsx
<View style={{ gap: 4, flexShrink: 1 }}>
  <Typography h4>Notifications</Typography>
  <Typography h4>A long descriptive sentence that explains everything in detail.</Typography>
</View>
```

### h5

**Do** — Use h5 only for the label; render the value in body so the pair stays scannable.

```tsx
<Column tight>
  <Typography h5>Members</Typography>
  <Typography body>Aisha, Bao, Cleo, and 9 others have access.</Typography>
</Column>
```

**Don't** — Setting the value in h5 too makes the label and its data indistinguishable.

```tsx
<View style={{ gap: 4 }}>
  <Typography h5>Members</Typography>
  <Typography h5>Aisha, Bao, Cleo, and 9 others have access.</Typography>
</View>
```

### body

**Do** — Keep body copy in sentence case and let inline code carry the technical emphasis.

```tsx
<Typography body>
  Run 
  <Typography code>npm install</Typography>
  , then restart the dev server before you continue.
</Typography>
```

**Don't** — All-caps emphasis inside body copy shouts and undercuts the relaxed reading rhythm.

```tsx
<Typography body>
  <Typography code>npm install</Typography>
   THEN restart the dev server BEFORE you continue.
</Typography>
```

### small

**Do** — Use small for secondary captions on a plain surface, not for the primary label.

```tsx
<Column tight>
  <Typography body>Save changes</Typography>
  <Typography small>Last saved 2 minutes ago.</Typography>
</Column>
```

**Don't** — small is muted-foreground; on a colored button it loses contrast and looks disabled.

```tsx
<Button secondary>
  <Typography small>Save changes</Typography>
</Button>
```

### tiny

**Do** — Reserve tiny for short metadata like timestamps and counts beside the main text.

```tsx
<Row alignCenter snug>
  <Typography body>Deploy succeeded</Typography>
  <Typography tiny>3m ago</Typography>
</Row>
```

**Don't** — tiny is for metadata, not legal prose; long copy at 11px strains the eye.

```tsx
<Typography tiny>These terms govern your use of the service and your data; please read them carefully before you continue past this screen.</Typography>
```

### muted

**Do** — Keep muted for de-emphasized context; give the actual action full foreground or primary color.

```tsx
<Typography body>
  Payment due May 31. 
  <Typography body primary underline>View invoices</Typography>
</Typography>
```

**Don't** — A primary, clickable action in muted-foreground reads as disabled and is easy to miss.

```tsx
<Typography muted style={{ alignSelf: "flex-start", textDecorationLine: "underline" }}>View your invoices</Typography>
```

### caption

**Do** — Use caption as a short eyebrow label above a section, then explain in body.

```tsx
<Column tight>
  <Typography caption>Billing</Typography>
  <Typography body>Your subscription renews automatically each month.</Typography>
</Column>
```

**Don't** — Uppercase, letter-spaced caption text is illegible for anything longer than a label.

```tsx
<Typography caption>Your subscription renews automatically each month unless you cancel from the billing page.</Typography>
```

### code

**Do** — Use code for inline tokens inside a sentence; reach for the code block component for multi-line snippets.

```tsx
<Typography body>
  Create a branch with 
  <Typography code>git checkout -b feature</Typography>
   before committing.
</Typography>
```

**Don't** — The inline code utility has tight padding and no scroll; multi-line blocks overflow and clip.

```tsx
<Typography code>git checkout -b feature
git add .
git commit -m "wip"</Typography>
```

### mono

**Do**: Use mono for identifiers and hashes, where every character must line up; set figures in a column or a changing value in `tabular` instead.

```tsx
<Row alignCenter between relaxed>
  <Typography small>Request ID</Typography>
  <Typography mono>req_8f2c10ab</Typography>
</Row>
```

**Don't** — Mono spacing makes prose sentences sparse and slow to read; it is meant for fixed-width data.

```tsx
<Typography mono>We could not process your request because the upstream service returned an unexpected response.</Typography>
```

### tabular

**Do**: Set figures read down a column or updated in place in `tabular`, so every digit takes the same width and the column lines up.

```tsx
<Column tight>
  <Row alignCenter between relaxed>
    <Typography small>Uptime</Typography>
    <Typography tabular>99.982%</Typography>
  </Row>
  <Row alignCenter between relaxed>
    <Typography small>Latency</Typography>
    <Typography tabular>118 ms</Typography>
  </Row>
</Column>
```

**Don't**: Tabular figures in running prose space the digits out of the sentence's rhythm; prose keeps the face's own figures.

```tsx
<Typography tabular>Your 14 invoices from 2024 total $1,180.</Typography>
```

## Inline links (href)

Inline text that NAVIGATES should be a real link, not pressable text that sets `location`: pass `href` and the web render becomes a genuine browser link (middle-click, new tab, crawlers, and assistive tech all treat it as one). Native platforms ignore `href`, so pair it with an `onPress` that runs the same navigation through your router; `underline` supplies the conventional link look, and `hrefAttrs` forwards `target` / `rel` / `download` on the web.

```tsx
<Typography small>
  Read the <Typography small underline href="https://canvas.nannier.com">Canvas docs</Typography> for the full component list.
</Typography>
```

## Supported props

### TypographyProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| terminal | boolean \| undefined | no | false | Use the system terminal face while retaining the selected reading role and size. |
| section | boolean \| undefined | no | false | A section heading owning its count, metadata and trailing actions. |
| count | string \| number \| undefined | no |  |  |
| description | string \| undefined | no |  |  |
| actions | ReactNode | no |  |  |
| subheading | boolean \| undefined | no | false | Exact Argus reading roles; these preserve the original dense web type. |
| label | boolean \| undefined | no | false |  |
| micro | boolean \| undefined | no | false |  |
| tag | boolean \| undefined | no | false |  |
| eyebrow | boolean \| undefined | no | false |  |
| eyebrowLg | boolean \| undefined | no | false |  |
| stageLabel | boolean \| undefined | no | false |  |
| statValue | boolean \| undefined | no | false |  |
| metricValue | boolean \| undefined | no | false |  |
| formValue | boolean \| undefined | no | false |  |
| extraBold | boolean \| undefined | no | false |  |
| uppercase | boolean \| undefined | no | false |  |
| foreground | boolean \| undefined | no | false |  |
| inverse | boolean \| undefined | no | false |  |
| action | boolean \| undefined | no | false |  |
| actionForeground | boolean \| undefined | no | false |  |
| info | boolean \| undefined | no | false |  |
| hue | number \| undefined | no |  | Hue-keyed stage text; deep in light schemes, pastel in dark. |
| inverseHint | boolean \| undefined | no | false | De-emphasized white ink over branded surfaces. |
| inverseSubtle | boolean \| undefined | no | false |  |
| inverseMuted | boolean \| undefined | no | false |  |
| inverseSoft | boolean \| undefined | no | false |  |
| inverseFaint | boolean \| undefined | no | false |  |
| right | boolean \| undefined | no | false |  |
| center | boolean \| undefined | no | false |  |
| numberOfLines | number \| undefined | no |  |  |
| onTextLayout | ((event: NativeSyntheticEvent<TextLayoutEventData>) => void) \| undefined | no |  | The text's laid-out lines, as React Native reports them (each line's `y`, `height`, `ascender` and `descender`, so its baseline is `y + height - descender`): for drawing something on the text's own lines, such as an illustration over a word. Fired by the native platforms; the web does not report it. |
| accessibilityRole | AccessibilityRole \| undefined | no |  |  |
| accessibilityLabel | string \| undefined | no |  |  |
| level | HeadingLevel \| undefined | no |  | The heading level assistive tech hears, independent of the visual role: a heading role exposes its own level (display and h1 at 1, h2 to h5 at 2 to 5) unless this overrides it, so `<Typography h3 level={2}>` draws the h3 size and is announced as a level-2 heading (a real `<h2>` on the web). On a non-heading role it makes the text a heading at that level. Semantics only: it never changes the look. `href` still wins (a link is not a heading). |
| displayLeading | boolean \| undefined | no | false |  |
| singleLeading | boolean \| undefined | no | false |  |
| lockupLeading | boolean \| undefined | no | false |  |
| denseLeading | boolean \| undefined | no | false |  |
| compactLeading | boolean \| undefined | no | false |  |
| labelLeading | boolean \| undefined | no | false |  |
| captionLeading | boolean \| undefined | no | false |  |
| smallLeading | boolean \| undefined | no | false |  |
| strongLeading | boolean \| undefined | no | false |  |
| bodyLeading | boolean \| undefined | no | false |  |
| relaxedLeading | boolean \| undefined | no | false |  |
| displayTracking | boolean \| undefined | no | false |  |
| tightTracking | boolean \| undefined | no | false |  |
| referenceTracking | boolean \| undefined | no | false |  |
| labelTracking | boolean \| undefined | no | false |  |
| eyebrowTracking | boolean \| undefined | no | false |  |
| wideTracking | boolean \| undefined | no | false |  |
| expandedTracking | boolean \| undefined | no | false |  |
| children | ReactNode | no |  |  |
| hero | boolean \| undefined | no | false | The hand-off's hero headline: the display face sized by the window, `clamp(56px, 7.2vw, 112px)` at a .94 line and -.045em tracking (56 px on a phone, 103.68 at a 1440 window, 112 from 1556 up). One per page, its lead line. A level-1 heading. |
| pageTitle | boolean \| undefined | no | false | The hand-off's page title (a component page's name): the display face sized by the window, `clamp(40px, 5vw, 64px)` at a 1.0 line and -.04em tracking. A level-1 heading. |
| sectionTitle | boolean \| undefined | no | false | A page section's heading (a component page's Playground, Variants...): the display face, 500 28/1.1, -.02em. A level-2 heading. |
| cardTitle | boolean \| undefined | no | false | A feature card's title: the display face, 500 22/1.15, -.02em. A level-3 heading. |
| panelTitle | boolean \| undefined | no | false | A panel's or dialog's title: the display face, 500 20/1.2, -.02em. |
| tagline | boolean \| undefined | no | false | The one-line tagline under a section's title: the display face, 400 22/1.3, -.015em, in the foreground ink. |
| pageLead | boolean \| undefined | no | false | A page's summary under its title: 400 18/1.55 in the secondary ink. |
| sectionLead | boolean \| undefined | no | false | A section's introductory paragraph: 400 17/1.55 in the secondary ink. |
| cardBody | boolean \| undefined | no | false | A feature card's description: 400 14/1.55 in the secondary ink. |
| sectionNote | boolean \| undefined | no | false | The note under a page section's heading: 400 14/1.5 in the secondary ink. |
| pageBody | boolean \| undefined | no | false | A page's body paragraph (a component page's usage line): 400 15/1.6 in the secondary ink, held to an 80ch measure. |
| pageNote | boolean \| undefined | no | false | A page's note paragraph (a component page's overview and docs notes): 400 14/1.6 in the secondary ink, held to an 80ch measure. |
| pageLabel | boolean \| undefined | no | false | A page's label (a panel's "Props", a rail's group header, a table's header cell, a previous/next eyebrow): 500 11/1 tracked .08em in caps, in the subtle ink. Pass `mono` for the mono face, as the other page roles do. Not the `eyebrow`, which is the type table's accent-ink label tracked .1em. |
| knobLabel | boolean \| undefined | no | false | A knob panel's label row (a knob's name, and the type hint beside it with `muted`, the third ink): 500 12/1 in the secondary ink. Pass `mono` for the mono face, as the hand-off's page does. |
| guideTitle | boolean \| undefined | no | false | A guidance card's title: 600 16/1.3 in the interface face. A level-3 heading. |
| guideBody | boolean \| undefined | no | false | A guidance card's paragraph: 400 13.5/1.6 in the secondary ink. |
| pagerName | boolean \| undefined | no | false | A pager card's name (the previous or next page under its label): the display face, 500 18 on the face's own 22 line, in the foreground ink. |
| specMeta | boolean \| undefined | no | false | A reference sheet's meta cell (a props table's type or default): 400 12/1.55 in the foreground ink. Pass `mono` for the mono face and `subtle` or `muted` for the ink, as the sheet's cells take them. |
| specText | boolean \| undefined | no | false | A reference sheet's text cell (a props table's description, an inherited-props note): 400 13/1.55 in the secondary ink. |
| pagerLabel | boolean \| undefined | no | false | A pager card's label (Previous, Next): the page label's 500 11 tracked .08em in caps and subtle ink on the face's own 14 line (the hand-off sets no ratio there). Pass `mono` for the mono face, as the page label takes it. |
| legendLabel | boolean \| undefined | no | false | A legend row's label (an anatomy part's name beside its numbered disc): 500 14 on the face's own 18 line, in the foreground ink. |
| tileCaption | boolean \| undefined | no | false | A specimen tile's caption strip (a size or state name under its well): 500 12 on the face's own 16 line, in the secondary ink. Pass `mono` for the mono face. |
| variantTitle | boolean \| undefined | no | false | A variant card's title (an example's label over its note and snippet): 500 14/1.3 in the interface face and the foreground ink. |
| linkName | boolean \| undefined | no | false | A link tile's name (a related component beside its arrow): 600 14 on the face's own 18 line, in the foreground ink. |
| subsectionTitle | boolean \| undefined | no | false | A page section's own sub-heading (the "Related components" title over its tiles): 600 16 on the face's own 20 line in the interface face. A level-3 heading. |
| cardNote | boolean \| undefined | no | false | A section card's foot caption, or a note inside the card: 400 12/1.6 (19.2) in the subtle ink. Pass `mono` for the mono face, as the hand-off sets it. |
| codeLabel | boolean \| undefined | no | false | A code name on its own line (a variant row's label, a token's name): 400 12 on the mono face's 16 line, in the secondary ink. Pass `mono` for the mono face. |
| inlineNote | boolean \| undefined | no | false | A short note beside a specimen: 400 12 on the interface face's 15 line, in the subtle ink. |
| tileTitle | boolean \| undefined | no | false | A tile's title: the display face, 500 15/1.3 (19.5), in the foreground ink. |
| gridLabel | boolean \| undefined | no | false | A grid widget's label: 500 10 mono tracked .08em in caps on a 13 line, in the subtle ink. |
| tick | boolean \| undefined | no | false | A scale's tick label: 500 10 mono on a 13 line, in the secondary ink. |
| rowLabel | boolean \| undefined | no | false | A stat row's label: 500 11/1 mono tracked .06em in caps, in the subtle ink. |
| rowValue | boolean \| undefined | no | false | A stat row's value beside its label: the display face, 500 22/1, -.02em, in the foreground ink. |
| headlineValue | boolean \| undefined | no | false | A card's headline figure: the display face, 500 26/1, -.02em, in the foreground ink. |
| bigNumber | boolean \| undefined | no | false | A card's big number: the display face, 500 40/1, -.03em, in the foreground ink. |
| unit | boolean \| undefined | no | false | The unit after a figure: 400 16 on the interface face's 20 line, in the subtle ink. Nest it inside the figure's Typography so it shares the figure's baseline (`<Typography bigNumber>107<Typography unit> components</Typography></Typography>`). |
| paneTitle | boolean \| undefined | no | false | A pane's title: the display face, 500 16/1.2, -.01em, in the foreground ink. Pass `level` to announce it as a heading. |
| sampleLabel | boolean \| undefined | no | false | A sample's caption (a hue number, a series name): 400 11 on the mono face's 14 line, in the subtle ink. Pass `mono`. |
| sampleMeta | boolean \| undefined | no | false | A sample's meta line (a hex value, a size): 400 10 on the mono face's 13 line, in the subtle ink. Pass `mono`. |
| base | boolean \| undefined | no | false | The 14 px body in the foreground ink: 400 14 on the interface face's 18 line (a description list's value). |
| display | boolean \| undefined | no | false |  |
| h1 | boolean \| undefined | no | false |  |
| h2 | boolean \| undefined | no | false |  |
| h3 | boolean \| undefined | no | false |  |
| h4 | boolean \| undefined | no | false |  |
| h5 | boolean \| undefined | no | false |  |
| lead | boolean \| undefined | no | false |  |
| body | boolean \| undefined | no | false |  |
| small | boolean \| undefined | no | false |  |
| tiny | boolean \| undefined | no | false |  |
| muted | boolean \| undefined | no | false |  |
| caption | boolean \| undefined | no | false |  |
| code | boolean \| undefined | no | false |  |
| mono | boolean \| undefined | no | false |  |
| inline | boolean \| undefined | no | false | With `code`: the prose code chip, a word of code inside a sentence. Regular weight at .88 of the surrounding reading role's size (pass that role beside it, `lead`, `small`, `pageBody`, `pageNote`, `pageLead` or `sectionLead`; body when none), the chip's own small corner, 1 by 5 padding, the surface fill and a hairline rim. Natively a Text nested in a Text draws the fill and horizontal padding only. Without `code` it does nothing. |
| subtle | boolean \| undefined | no | false | Tone (pick one; orthogonal to role). When omitted, the role's own color is used. |
| primary | boolean \| undefined | no | false | Tone (pick one; orthogonal to role). When omitted, the role's own color is used. |
| destructive | boolean \| undefined | no | false | Tone (pick one; orthogonal to role). When omitted, the role's own color is used. |
| success | boolean \| undefined | no | false | Tone (pick one; orthogonal to role). When omitted, the role's own color is used. |
| warning | boolean \| undefined | no | false | Tone (pick one; orthogonal to role). When omitted, the role's own color is used. |
| cyan | boolean \| undefined | no | false | The fixed cyan series hue (the hand-off's `--cyan`, `chart-2`) as an ink, whatever the palette, solved to 4.5:1 on the scheme's surfaces. |
| mint | boolean \| undefined | no | false | The fixed mint series hue (the hand-off's `--mint`, `chart-3`) as an ink, whatever the palette, solved like `cyan`. |
| regular | boolean \| undefined | no | false | Weight (pick one; orthogonal to role). When omitted, the role's own weight is used. |
| medium | boolean \| undefined | no | false | Weight (pick one; orthogonal to role). When omitted, the role's own weight is used. |
| semibold | boolean \| undefined | no | false | Weight (pick one; orthogonal to role). When omitted, the role's own weight is used. |
| bold | boolean \| undefined | no | false | Weight (pick one; orthogonal to role). When omitted, the role's own weight is used. |
| tightLeading | boolean \| undefined | no | false | Leading (orthogonal to role). Pulls the line box in to 1.25x the font size for a STACKED LOCKUP, where two lines read as one unit (a wordmark over its tagline, a title over its subtitle) and the roles reading leading would leave dead air between them. Only ever tightens, so it is safe on every role. Omit for prose: the role's own line height is the reading value. |
| natural | boolean \| undefined | no | false | Leading: the face's own normal line at the role's size, the line the hand-off's text takes where it sets a size with no ratio (JetBrains Mono 10, 11 and 12 px on 13, 14 and 16; Instrument Sans 12, 13 and 14 on 15, 16 and 18; Bricolage Grotesque 14 and 15 on 17 and 18). The face is the one the text is set in (`mono`, a display role, or the interface face). A size off the measured table (10 to 28 px) keeps the role's line. |
| underline | boolean \| undefined | no | false | Decoration (orthogonal to role / tone / weight). Underlines the text so an inline text link reads as a link, replacing the banned raw `textDecorationLine` style shim. Combines freely with every role, tone, and weight; omit for undecorated text. |
| italic | boolean \| undefined | no | false | Slant (orthogonal to role / tone / weight / decoration). Sets the text in the face's italic, for a word set off in prose or the italic mark of a formatting toolbar. Omit for upright text. |
| tabular | boolean \| undefined | no | false | Numerals (orthogonal to role / tone / weight). Tabular figures: every digit the same width, for numbers read down a column or updated in place (a table's figures, a live metric, a counter), so the column lines up and a changing value holds still. Never for prose, which keeps the face's own proportional figures. |
| href | string \| undefined | no |  | Renders this text as a REAL inline link on the web: react-native-web gives the root element a browser link with this destination, so middle-click, cmd-click, and open-in-new-tab work and assistive tech hears a link. Native platforms have no browser links and ignore it, so pair `href` with an `onPress` running the same navigation through the host's router. Combine with `underline` for the conventional link look. When a heading role and `href` are both set, the link role wins. |
| hrefAttrs | { target?: "_blank" \| "_self"; rel?: string; download?: boolean \| string; } \| undefined | no |  | Attributes forwarded with `href` on the web: `target`, `rel`, `download`. |
| onPress | ((event: GestureResponderEvent) => void) \| undefined | no |  | Press handler; the native navigation path for `href` (fires on web too). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<TextStyle> | no |  | For layout/positioning composition only (margins handled by Row/Column). Not a styling escape hatch: size, color, and weight come from the props above. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
