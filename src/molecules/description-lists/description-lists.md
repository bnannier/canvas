# Description Lists

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

## Do & Don't

### Two-column

**Do** — Fix the label column wide enough for the longest term so every value lines up on one edge.

```tsx
<DescriptionList twoColumn divided className="max-w-[420px]" items={[
    { term: "Client identifier", value: "clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF", mono: true },
    { term: "Status", value: "Active", status: true }
  ]} />
```

**Don't** — A too-narrow label column wraps the longest term and knocks the two columns out of alignment.

```tsx
<View className="max-w-[420px]">
  <View className="flex-row items-baseline gap-4 border-b border-border py-3">
    <Text className="w-16 text-sm text-muted-foreground">Client identifier</Text>
    <Text className="flex-1 break-all text-[12.5px] font-medium text-foreground" style={{ fontFamily: "monospace" }}>clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF</Text>
  </View>
  <View className="flex-row items-baseline gap-4 py-3">
    <Text className="w-16 text-sm text-muted-foreground">Status</Text>
    <View className="flex-1">
      <Badge status success>Active</Badge>
    </View>
  </View>
</View>
```

### Inline-edit

**Do** — Give every editable row a trailing Update affordance so the inline editor is discoverable.

```tsx
<DescriptionList twoColumn className="max-w-[420px]" items={[
    { term: "Name", value: "Rachel Chen", update: true },
    { term: "Email", value: "rachel.chen@example.com", update: true }
  ]} />
```

**Don't** — Editable rows that look identical to read-only ones give no hint a value can be changed.

```tsx
<DescriptionList twoColumn className="max-w-[420px]" items={[
    { term: "Name", value: "Rachel Chen" },
    { term: "Email", value: "rachel.chen@example.com" }
  ]} />
```

### Stacked

**Do** — Keep the label small, uppercase, and muted above a full-weight value so the data stays primary.

```tsx
<DescriptionList stacked className="max-w-[320px]" items={[
    { term: "Full name", value: "Rachel Chen" },
    { term: "Email", value: "rachel.chen@example.com" }
  ]} />
```

**Don't** — Muting the value and bolding nothing inverts the hierarchy; the label outweighs the data it describes.

```tsx
<View className="max-w-[320px] gap-4">
  <View className="gap-1">
    <Text className="text-sm text-foreground">Full name</Text>
    <Text className="text-sm text-muted-foreground">Rachel Chen</Text>
  </View>
  <View className="gap-1">
    <Text className="text-sm text-foreground">Email</Text>
    <Text className="text-sm text-muted-foreground">rachel.chen@example.com</Text>
  </View>
</View>
```
