# Empty States

Centered, calm, never blame the user. Always tell them what could be here, and ideally how to get there.

## Usage

```tsx
<EmptyState
  icon="🔍"
  title="No results found"
  description="Try adjusting your search filters."
  actionLabel="Clear filters"
  bordered
/>
```

## Variants

### Variant - users

```tsx
<EmptyState
  icon="👥"
  title="No users"
  description="Invite your first team member."
  actionLabel="Invite member"
  bordered
/>
```

### Variant - files

```tsx
<EmptyState
  icon="📄"
  title="No files"
  description="Upload or drag files here."
  actionLabel="Upload files"
  bordered
/>
```

### Variant - activity

```tsx
<EmptyState
  icon="📈"
  title="No activity"
  description="Events will appear as they happen."
  actionLabel="Refresh"
  bordered
/>
```

### Variant - notifications

```tsx
<EmptyState
  icon="🔔"
  title="All caught up"
  description="No new notifications."
  actionLabel="View archive"
  bordered
/>
```

### Variant - errors

```tsx
<EmptyState
  icon="✅"
  title="No errors"
  description="Everything is running smoothly."
  actionLabel="View logs"
  positive
  bordered
/>
```

### Variant - all-clear

```tsx
<EmptyState
  icon="✅"
  title="All clear"
  description="No locked accounts or pending reviews."
  actionLabel="View history"
  positive
  bordered
/>
```

### Single action

```tsx
<EmptyState
  icon="🔍"
  title="No results found"
  description="Try adjusting your search filters."
  actionLabel="Create identity"
  bordered
/>
```

### Inside a table

```tsx
<Card flat flush style={{ overflow: "hidden" }}>
  <DataTable columns={["Name", "Email", "Role", "Status"]} rows={[]} />
  <Column alignCenter padLoose>
    <EmptyState bordered icon="🔍" title="No results found" description="Try adjusting your search filters." actionLabel="Clear filters" />
  </Column>
</Card>
```

## Do & Don't

### search

**Do** — State the result neutrally and point at the lever the user can pull (filters, query).

```tsx
<EmptyState bordered icon="🔍" title="No results found" description="Try adjusting your search filters." />
```

**Don't** — Blaming the searcher for an empty result set makes a normal outcome feel like a mistake.

```tsx
<EmptyState bordered icon="🔍" title="Nothing matched" description="You searched for the wrong thing. Check your spelling and try again." />
```

### users

**Do** — When the user can fix it, give them the one action that does (Invite, Create).

```tsx
<EmptyState bordered icon="👥" title="No users" description="Invite your first team member." actionLabel="Invite member" />
```

**Don't** — A dead-end that only restates the emptiness leaves the user with nowhere to go.

```tsx
<EmptyState bordered icon="👥" title="No users" description="There are no team members in this workspace." />
```

### files

**Do** — Name the gesture that fills the empty space so the next step is obvious.

```tsx
<EmptyState bordered icon="📄" title="No files" description="Upload or drag files here." />
```

**Don't** — Generic 'nothing here' copy never tells the user how files would get into the folder.

```tsx
<EmptyState bordered icon="📄" title="Nothing here" description="This folder is empty." />
```

### activity

**Do** — Keep a routinely-empty state calm: muted icon, reassuring copy, no urgency.

```tsx
<EmptyState bordered icon="📈" title="No activity" description="Events will appear as they happen." />
```

**Don't** — An alarming red icon turns a calm, expected empty feed into a false error.

```tsx
<View style={{ alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, paddingHorizontal: 24, paddingVertical: 32 }}>
  <View style={{ marginBottom: 12, height: 48, width: 48, alignItems: "center", justifyContent: "center", borderRadius: 9999, backgroundColor: alpha(tokens.destructive, 0.1) }}>
    <Text style={{ fontSize: 20, lineHeight: 28, color: tokens.destructive }}>⚠️</Text>
  </View>
  <Text style={{ textAlign: "center", fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground }}>No activity</Text>
  <Text style={{ marginTop: 4, textAlign: "center", fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Events will appear as they happen.</Text>
</View>
```

### notifications

**Do** — Celebrate a cleared queue: 'All caught up' reads as success, not absence.

```tsx
<EmptyState bordered icon="🔔" title="All caught up" description="No new notifications." />
```

**Don't** — Apologetic, sad-toned copy frames an inbox-zero win as a letdown.

```tsx
<EmptyState bordered icon="🔔" title="Nothing to see" description="You have no notifications. Sorry, it's quiet in here." />
```

### errors

**Do** — Signal the good news with a green check: zero errors is a passing state, not an empty one.

```tsx
<EmptyState bordered positive icon="✅" title="No errors" description="Everything is running smoothly." />
```

**Don't** — A grey 'nothing found' disc reads as a failed query, not as a healthy, error-free system.

```tsx
<EmptyState bordered icon="🔍" title="No errors" description="Nothing was found." />
```

### all-clear

**Do** — Reserve the green all-clear for genuinely empty queues: nothing locked, nothing waiting.

```tsx
<EmptyState bordered positive icon="✅" title="All clear" description="No locked accounts or pending reviews." />
```

**Don't** — A green all-clear over copy that admits work is pending hides the action the user must take.

```tsx
<EmptyState bordered positive icon="✅" title="No pending reviews" description="3 accounts are locked and waiting on you." />
```
