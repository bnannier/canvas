# Field Display

Read-only key/value pairs. Used in detail views, modal previews, and audit screens. Optional mono mode for IDs, tokens, dates.

## Usage

```tsx
<Field
  rows={[
    { label: "User ID", value: "usr_abc123", mono: true },
    { label: "Name", value: "Rachel Chen" },
    { label: "Role", value: "Admin" },
    { label: "Status", status: "Active" }
  ]}
  className="max-w-[400px]"
/>
```

## Do & Don't

### Basic

**Do** — Use the fixed 180px label column so every value aligns to one baseline.

```tsx
<Field className="max-w-[400px]" rows={[
    { label: "Name", value: "Rachel Chen" },
    { label: "Role", value: "Admin" }
  ]} />
```

**Don't** — Inline label-colon-value with no shared column makes values ragged and impossible to scan down a list.

```tsx
<View className="max-w-[400px] flex-col gap-1">
  <Text className="text-sm">
    <Text className="font-semibold">Name:</Text>
     Rachel Chen
  </Text>
  <Text className="text-sm">
    <Text className="font-semibold">Role:</Text>
     Admin
  </Text>
</View>
```

### Mono

**Do** — Wrap IDs, hashes, and timestamps in font-mono so every glyph is fixed-width and copy-able.

```tsx
<Field className="max-w-[400px]" rows={[
    { label: "Client ID", value: "clt_8f2a9b4c7e1d", mono: true },
    { label: "Fingerprint", value: "sha256:xK9v...", mono: true }
  ]} />
```

**Don't** — Rendering IDs and hashes in proportional type makes look-alike characters (l/1, O/0) hard to compare.

```tsx
<Field className="max-w-[400px]" rows={[
    { label: "Client ID", value: "clt_8f2a9b4c7e1d" },
    { label: "Fingerprint", value: "sha256:xK9v..." }
  ]} />
```

### Composed

**Do** — Compose real nodes into the value slot: a status badge for state, a badge for the plan tier.

```tsx
<Field className="max-w-[400px]" rows={[
    { label: "Status", status: "Active" },
    { label: "Plan", badge: "Pro" }
  ]} />
```

**Don't** — Flattening a live status or plan tier to plain text drops the color and shape that signal state at a glance.

```tsx
<Field className="max-w-[400px]" rows={[
    { label: "Status", value: "Active" },
    { label: "Plan", value: "Pro" }
  ]} />
```
