# Description List

Key-value pairs in stacked, two-column, or inline-edit layouts. Used for detail panels, settings, and profile views.

## Usage

```tsx
<DescriptionList
  card
  twoColumn
  divided
  title="Application details"
  subtitle="Personal information and credentials."
  items={[
    { term: "Full name", value: "Rachel Chen" },
    { term: "Email", value: "rachel.chen@example.com" },
    { term: "Role", value: "admin", badge: true },
    { term: "Status", value: "Active", status: true }
  ]}
/>
```

## Variants

### Layout - inline-edit

```tsx
<DescriptionList
  card
  twoColumn
  divided
  title="Profile"
  items={[
    { term: "Name", value: "Rachel Chen", update: true },
    { term: "Email", value: "rachel.chen@example.com", update: true },
    { term: "Title", value: "Senior Engineer", update: true }
  ]}
/>
```

### Layout - stacked

```tsx
<DescriptionList
  card
  stacked
  items={[
    { term: "Full name", value: "Rachel Chen" },
    { term: "Email", value: "rachel.chen@example.com" },
    { term: "Client ID", value: "clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF", mono: true }
  ]}
/>
```

## Do & Don't

### Two-column

**Do** — Fix the label column wide enough for the longest term so every value lines up on one edge.

```tsx
<DescriptionList twoColumn divided style={{ maxWidth: 420 }} items={[
    { term: "Client identifier", value: "clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF", mono: true },
    { term: "Status", value: "Active", status: true }
  ]} />
```

**Don't** — A too-narrow label column wraps the longest term and knocks the two columns out of alignment.

```tsx
<View style={{ maxWidth: 420 }}>
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

**Do** — Give every editable row a trailing Update affordance so the inline editor is discoverable.

```tsx
<DescriptionList twoColumn style={{ maxWidth: 420 }} items={[
    { term: "Name", value: "Rachel Chen", update: true },
    { term: "Email", value: "rachel.chen@example.com", update: true }
  ]} />
```

**Don't** — Editable rows that look identical to read-only ones give no hint a value can be changed.

```tsx
<DescriptionList twoColumn style={{ maxWidth: 420 }} items={[
    { term: "Name", value: "Rachel Chen" },
    { term: "Email", value: "rachel.chen@example.com" }
  ]} />
```

### Stacked

**Do** — Keep the label small, uppercase, and muted above a full-weight value so the data stays primary.

```tsx
<DescriptionList stacked style={{ maxWidth: 320 }} items={[
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
