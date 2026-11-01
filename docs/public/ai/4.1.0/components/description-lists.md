# DescriptionList

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 63292636c7ff2f224185aef7c96ac78124f9170a170b90ee11718addfa280643

Source: `src/molecules/description-lists/description-lists.md`
Human reference: https://canvas.nannier.com/components/description-lists

## Public imports

```tsx
import { DescriptionList } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Key-value pairs in stacked, two-column, or inline-edit layouts. Used for detail panels, settings, and profile views. Rows flagged `update` carry a working in-place editor: Update opens it, Enter or Save commits the new value and fires `onUpdate`, Escape or Cancel dismisses it. `muted` sets each text value as a note beside its term, in the small type and the muted ink, for a list that explains its terms (a key and its effect) rather than reporting data; a node value renders as given, and a platform skin whose value detail is already the secondary ink keeps its type.

The rows axis (pick one; `ruled` wins over `divided`): `divided` draws a hairline under every row but the last, the two-column detail look. `ruled` draws the v4 hand-off's accessibility-card rows: a 1 px top rule on every row, the first included, so the list reads as a table that starts under its caption, each row padded 9 above and below with nothing beside, and in the two-column layout the term hugging its content over a 120 floor with 14 to the value.

The density axis: `compact` tightens the ruled rows to the hand-off's semantics-card rows, each padded 8 above and below with 12 to the value, the two-column term a fixed 110 column, and the value at the top of its row (so a wrapping row of badges starts level with its term); the plain and divided rows have no compact step, so `compact` without `ruled` changes nothing.

## Usage

```tsx
<DescriptionList
  items={[
    { term: "Full name", value: "Rachel Chen" },
    { term: "Email", value: "rachel.chen@example.com" },
    { term: "Role", value: "Admin" }
  ]}
/>
```

## Variants

### Card

```tsx
<DescriptionList
  card
  title="Application details"
  subtitle="Personal information and credentials."
  items={[
    { term: "Full name", value: "Rachel Chen" },
    { term: "Email", value: "rachel.chen@example.com" },
    { term: "Role", value: "Admin" }
  ]}
/>
```

### Inline

Each value sits on the right of its term. A value too wide to fit beside its term (a long id with its Copy button in a narrow sidebar) wraps onto its own line under the term, still at the trailing edge, so the list never runs past its container.

```tsx
<DescriptionList
  inline
  items={[
    { term: "Status", value: "Active" },
    { term: "Seats", value: "12 of 20" },
    { term: "Renews", value: "Mar 1, 2026" }
  ]}
/>
```

### Rich values

A row's value can compose real atoms: `status`/`badge` render Badges, `avatars` renders an overlapping AvatarGroup (`overflow` folds the rest into its "+N" chip), and `copyValue` appends a ghost Copy button that hands the string to `onCopy` (wire your clipboard there).

```tsx
<DescriptionList
  twoColumn
  items={[
    { term: "Status", value: "Active", status: true },
    { term: "Plan", value: "Pro", badge: true },
    { term: "Members", value: "8 members", avatars: [{ name: "Rachel Chen" }, { name: "Alan Turing" }, { name: "Grace Hopper" }], overflow: 5 },
    { term: "Client ID", value: "clnt_01H2X8K9", mono: true, copyValue: "clnt_01H2X8K9" }
  ]}
/>
```

### Node values

A `term` or `value` may be any node, as a DataTable cell may: a string or number takes the list's own type and the per-item forms (`badge`, `status`, `mono`, `copyValue`, `update`), and any other node renders as given in its place, here a row of Badges. A node value yields to its cell, so a wrapping Row wraps at the cell's width instead of running past the list. An `update` row needs a text value to edit.

```tsx
<DescriptionList
  twoColumn
  divided
  items={[
    { term: "Role", value: <Row snug wrap><Badge soft>button</Badge></Row> },
    { term: "States", value: <Row snug wrap><Badge soft>disabled</Badge><Badge soft>busy</Badge><Badge soft>loading</Badge><Badge soft>pressed</Badge><Badge soft>focused</Badge><Badge soft>hovered</Badge></Row> },
    { term: "Keyboard", value: "Enter and Space activate it" }
  ]}
/>
```

### Ruled

Every row carries a top rule, the first included, under a caption the parent sets; the term hugs its content over a 120 floor.

```tsx
<DescriptionList
  twoColumn
  ruled
  items={[
    { term: <Kbd>Enter</Kbd>, value: "Activates" },
    { term: <Kbd>Space</Kbd>, value: "Activates" },
    { term: <Kbd>Tab</Kbd>, value: "Moves focus to the next control" }
  ]}
/>
```

### Compact ruled

The semantics-card rows: 8 above and below, 12 to the value, the term a fixed 110 column and the value at the top of its row.

```tsx
<DescriptionList
  twoColumn
  ruled
  compact
  items={[
    { term: "Roles", value: <Row compact wrap><Badge mono small>button</Badge></Row> },
    { term: "States", value: <Row compact wrap><Badge mono small>disabled</Badge><Badge mono small>busy</Badge><Badge mono small>loading</Badge><Badge mono small>pressed</Badge><Badge mono small>focused</Badge><Badge mono small>hovered</Badge></Row> },
    { term: "ARIA on web", value: <Row compact wrap><Badge mono small>aria-busy</Badge><Badge mono small>aria-disabled</Badge></Row> }
  ]}
/>
```

### Inline-edit

```tsx
<DescriptionList
  twoColumn
  items={[
    { term: "Name", value: "Rachel Chen", update: true },
    { term: "Email", value: "rachel.chen@example.com", update: true }
  ]}
/>
```

### Muted notes

Each value explains its term: a key and what it does, the value in the small type and the muted ink.

```tsx
<DescriptionList
  twoColumn
  divided
  muted
  items={[
    { term: <Kbd comfortable>Enter</Kbd>, value: "Activates" },
    { term: <Kbd comfortable>Space</Kbd>, value: "Activates" },
    { term: <Kbd comfortable>Tab</Kbd>, value: "Moves focus on" }
  ]}
/>
```

## Do & Don't

### Two-column

**Do** — Fix the label column wide enough for the longest term so every value lines up on one edge.

```tsx
<DescriptionList twoColumn divided items={[
  { term: "Client identifier", value: "clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF", mono: true },
  { term: "Status", value: "Active", status: true }
]} />
```

**Don't** — A too-narrow label column wraps the longest term and knocks the two columns out of alignment.

```tsx
<View>
  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 16, borderBottomWidth: 1, borderColor: tokens.border, paddingVertical: 12 }}>
    <Text style={{ width: 64, fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Client identifier</Text>
    <Text style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 12.5, fontWeight: "500", color: tokens.foreground, fontFamily: "monospace" }}>clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF</Text>
  </View>
  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 16, paddingVertical: 12 }}>
    <Text style={{ width: 64, fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Status</Text>
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
      <Badge status success>Active</Badge>
    </View>
  </View>
</View>
```

### Inline-edit

**Do** — Give every editable row a trailing Update affordance so the inline editor is discoverable; pressing it opens the editor in place, and Enter or Save commits.

```tsx
<DescriptionList twoColumn items={[
  { term: "Name", value: "Rachel Chen", update: true },
  { term: "Email", value: "rachel.chen@example.com", update: true }
]} />
```

**Don't** — Editable rows that look identical to read-only ones give no hint a value can be changed.

```tsx
<DescriptionList twoColumn items={[
  { term: "Name", value: "Rachel Chen" },
  { term: "Email", value: "rachel.chen@example.com" }
]} />
```

### Stacked

**Do** — Keep the label small, uppercase, and muted above a full-weight value so the data stays primary.

```tsx
<DescriptionList stacked items={[
  { term: "Full name", value: "Rachel Chen" },
  { term: "Email", value: "rachel.chen@example.com" }
]} />
```

**Don't** — Muting the value and bolding nothing inverts the hierarchy; the label outweighs the data it describes.

```tsx
<View style={{ maxWidth: 320, gap: 16 }}>
  <View style={{ gap: 4 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Full name</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Rachel Chen</Text>
  </View>
  <View style={{ gap: 4 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Email</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>rachel.chen@example.com</Text>
  </View>
</View>
```

## Supported props

### DescriptionListProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | DescriptionListItem[] | yes |  |  |
| title | string \| undefined | no |  | Card header band (only shown when `card`): a title and optional subtitle. |
| subtitle | string \| undefined | no |  | Card header band (only shown when `card`): a title and optional subtitle. |
| inline | boolean \| undefined | no | false | Layout (pick one; precedence inline > twoColumn > stacked). |
| twoColumn | boolean \| undefined | no | false | Layout (pick one; precedence inline > twoColumn > stacked). |
| stacked | boolean \| undefined | no | false | Layout (pick one; precedence inline > twoColumn > stacked). |
| divided | boolean \| undefined | no | false | Rows (pick one; precedence ruled > divided): a hairline divider beneath every row but the last. |
| ruled | boolean \| undefined | no | false | Rows: a 1 px top rule on every row, the first included, with the row padded 9 above and below and the term hugging its content (a 120 floor, 14 to the value), the v4 hand-off's accessibility-card rows. Wins over `divided`. |
| compact | boolean \| undefined | no | false | Density: tightens the ruled rows to the v4 hand-off's semantics-card rows (Component.dc.html line 263): 8 above and below the text, 12 to the value, the term a fixed 110 column and the value at the top of its row. Only the ruled rows have a compact step; a plain or divided list is unchanged by it. |
| muted | boolean \| undefined | no | false | The values as notes beside their terms: a text value in the small type and the muted ink (400 13/19) instead of the full-weight foreground data, for a list that explains each term (a key and its effect). A node value renders as given, and a platform skin whose value detail is already the secondary ink keeps its type. |
| card | boolean \| undefined | no | false | Surface: wrap the list in a card surface. |
| onUpdate | ((index: number, value: string) => void) \| undefined | no |  | Fires when a row's inline editor commits (Enter or Save): the item index and the new value. |
| onCopy | ((value: string) => void) \| undefined | no |  | Fires with a row's `copyValue` when its "Copy" button is pressed. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
