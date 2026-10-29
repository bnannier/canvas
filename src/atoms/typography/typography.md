# Typography

Type scale classes for headings, body text, and helper styles.

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
