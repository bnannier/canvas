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
  style={{ maxWidth: 400 }}
/>
```

## Variants

### Value mode - mono

```tsx
<Field
  rows={[
    { label: "Client ID", value: "clt_8f2a9b4c7e1d", mono: true },
    { label: "Created", value: "2026-05-24T14:32:00Z", mono: true },
    { label: "Fingerprint", value: "sha256:xK9v...", mono: true }
  ]}
  style={{ maxWidth: 400 }}
/>
```

### Value mode - composed

```tsx
<Field
  rows={[
    { label: "Status", status: "Active" },
    { label: "Plan", badge: "Pro" },
    { label: "Token", value: "sk_live_a8f2...c9e1", mono: true, copyValue: "sk_live_a8f2c9e1" },
    { label: "Members", avatars: [
      { src: "/rachel-chen.jpg", name: "RC" },
      { name: "AJ" }
    ], overflow: 3 }
  ]}
  style={{ maxWidth: 400 }}
/>
```

## Do & Don't

### Basic

**Do** — Use the fixed 180px label column so every value aligns to one baseline.

```tsx
<Field style={{ maxWidth: 400 }} rows={[
    { label: "Name", value: "Rachel Chen" },
    { label: "Role", value: "Admin" }
  ]} />
```

**Don't** — Inline label-colon-value with no shared column makes values ragged and impossible to scan down a list.

```tsx
<View style={{ maxWidth: 400, flexDirection: "column", gap: 4 }}>
  <Text style={{ fontSize: 14, lineHeight: 20 }}>
    <Text style={{ fontWeight: "600" }}>Name:</Text>
     Rachel Chen
  </Text>
  <Text style={{ fontSize: 14, lineHeight: 20 }}>
    <Text style={{ fontWeight: "600" }}>Role:</Text>
     Admin
  </Text>
</View>
```

### Mono

**Do** — Wrap IDs, hashes, and timestamps in font-mono so every glyph is fixed-width and copy-able.

```tsx
<Field style={{ maxWidth: 400 }} rows={[
    { label: "Client ID", value: "clt_8f2a9b4c7e1d", mono: true },
    { label: "Fingerprint", value: "sha256:xK9v...", mono: true }
  ]} />
```

**Don't** — Rendering IDs and hashes in proportional type makes look-alike characters (l/1, O/0) hard to compare.

```tsx
<Field style={{ maxWidth: 400 }} rows={[
    { label: "Client ID", value: "clt_8f2a9b4c7e1d" },
    { label: "Fingerprint", value: "sha256:xK9v..." }
  ]} />
```

### Composed

**Do** — Compose real nodes into the value slot: a status badge for state, a badge for the plan tier.

```tsx
<Field style={{ maxWidth: 400 }} rows={[
    { label: "Status", status: "Active" },
    { label: "Plan", badge: "Pro" }
  ]} />
```

**Don't** — Flattening a live status or plan tier to plain text drops the color and shape that signal state at a glance.

```tsx
<Field style={{ maxWidth: 400 }} rows={[
    { label: "Status", value: "Active" },
    { label: "Plan", value: "Pro" }
  ]} />
```
