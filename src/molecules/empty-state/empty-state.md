# Empty States

Centered, calm, never blame the user. Always tell them what could be here, and ideally how to get there.

## Usage

```tsx
<EmptyState
  icon="🔍"
  title="No results found"
  description="Try adjusting your search filters."
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
  bordered
/>
```

### Variant - files

```tsx
<EmptyState
  icon="📄"
  title="No files"
  description="Upload or drag files here."
  bordered
/>
```

### Variant - activity

```tsx
<EmptyState
  icon="📈"
  title="No activity"
  description="Events will appear as they happen."
  bordered
/>
```

### Variant - notifications

```tsx
<EmptyState
  icon="🔔"
  title="All caught up"
  description="No new notifications."
  bordered
/>
```

### Variant - errors

```tsx
<EmptyState
  icon="✅"
  title="No errors"
  description="Everything is running smoothly."
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
<View className="overflow-x-auto rounded-lg border border-border">
  <View className="flex-row border-b border-border">
    <Text className="flex-1 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</Text>
    <Text className="flex-1 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</Text>
    <Text className="flex-1 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</Text>
    <Text className="flex-1 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</Text>
  </View>
  <View className="px-4 py-10">
    <EmptyState bordered icon="🔍" title="No results found" description="Try adjusting your search filters." />
  </View>
</View>
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
<View className="items-center rounded-lg border border-border px-6 py-8">
  <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
    <Text className="text-xl text-destructive">⚠️</Text>
  </View>
  <Text className="text-center text-base font-semibold text-foreground">No activity</Text>
  <Text className="mt-1 text-center text-sm text-muted-foreground">Events will appear as they happen.</Text>
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
