# Feeds

Vertical activity streams with icons and timestamps. Used for audit logs, change history, and notification lists.

## Usage

```tsx
<Feed
  connector
  items={[
    { actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" },
    { actor: "Ada Lovelace", action: "updated the description", time: "5 hours ago" },
    { actor: "System", action: "created the project", time: "3 days ago" }
  ]}
/>
```

## Variants

### Variant - avatar

```tsx
<Feed
  avatar
  items={[
    { actor: "Rachel Chen", action: "commented on the pull request", time: "2 hours ago" },
    { actor: "Ada Lovelace", action: "pushed 3 commits", time: "5 hours ago" },
    { actor: "Kevin Turner", action: "opened the pull request", time: "1 day ago" }
  ]}
/>
```

## Do & Don't

### Connector

**Do** — Drop the connector on the last item so the line terminates cleanly at the final event.

```tsx
<Feed connector items={[
    { actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" },
    { actor: "System", action: "created the project", time: "3 days ago" }
  ]} />
```

**Don't** — Running the connector line past the final event leaves a dangling tail pointing at nothing.

```tsx
<View className="w-full max-w-[420px] rounded-lg border border-border bg-card overflow-hidden p-6">
  <View className="relative flex-row gap-3 pb-6">
    <View className="absolute -bottom-6 left-[13px] top-7 w-px bg-border" />
    <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
      <Text className="text-xs font-medium text-muted-foreground">RC</Text>
    </View>
    <View className="flex-1 pt-0.5">
      <Text className="text-sm">
        <Text className="font-medium">Rachel Chen </Text>
        <Text className="text-muted-foreground">approved the request</Text>
      </Text>
      <Text className="mt-0.5 text-xs text-muted-foreground">2 hours ago</Text>
    </View>
  </View>
  <View className="relative flex-row gap-3">
    <View className="absolute -bottom-6 left-[13px] top-7 w-px bg-border" />
    <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
      <Text className="text-xs font-medium text-muted-foreground">SY</Text>
    </View>
    <View className="flex-1 pt-0.5">
      <Text className="text-sm">
        <Text className="font-medium">System </Text>
        <Text className="text-muted-foreground">created the project</Text>
      </Text>
      <Text className="mt-0.5 text-xs text-muted-foreground">3 days ago</Text>
    </View>
  </View>
</View>
```

### Avatar

**Do** — Lead with the person's avatar, bold the actor, and keep the action plus a relative timestamp muted.

```tsx
<Feed avatar items={[
    { actor: "Ada Lovelace", action: "pushed 3 commits", time: "5 hours ago", avatar: "/ada-lovelace.jpg" }
  ]} />
```

**Don't** — An anonymous avatar with no actor name and no timestamp strips the row of the who and the when.

```tsx
<View className="w-full max-w-[420px] rounded-lg border border-border bg-card overflow-hidden">
  <View className="flex-row items-start gap-3 px-5 py-4">
    <View className="h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
      <Text className="text-base font-medium text-muted-foreground">?</Text>
    </View>
    <View className="min-w-0 flex-1">
      <Text className="text-sm text-muted-foreground">Pushed 3 commits</Text>
    </View>
  </View>
</View>
```
