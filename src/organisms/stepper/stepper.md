# Steppers

Multi-step progress indicators: horizontal, vertical, with progress.

## Usage

```tsx
<Stepper
  steps={[
    { label: "Account", description: "Email verified and password set." },
    { label: "Profile", description: "Add your name and avatar." },
    { label: "Review", description: "Invite collaborators to your workspace." },
    { label: "Done", description: "You're all set." }
  ]}
  current={1}
  value={68}
  label="Setup progress"
/>
```

## Do & Don't

### Horizontal

**Do** — Mark exactly one step active; show completed steps filled and the rest pending.

```tsx
<Stepper current={1} steps={[
    { label: "Account" },
    { label: "Profile" },
    { label: "Review" }
  ]} />
```

**Don't** — Styling several steps as active at once hides which step the user is actually on.

```tsx
<View className="flex-row items-start">
  <View className="flex-row items-start flex-1">
    <View className="items-center gap-1.5">
      <View className="h-8 w-8 shrink-0 flex-row items-center justify-center rounded-full border-2 border-primary bg-transparent">
        <Text className="text-sm font-medium text-primary">1</Text>
      </View>
      <Text className="text-xs font-medium text-foreground">Account</Text>
    </View>
    <View className="mx-2 mt-4 h-px flex-1 bg-border" />
  </View>
  <View className="flex-row items-start flex-1">
    <View className="items-center gap-1.5">
      <View className="h-8 w-8 shrink-0 flex-row items-center justify-center rounded-full border-2 border-primary bg-transparent">
        <Text className="text-sm font-medium text-primary">2</Text>
      </View>
      <Text className="text-xs font-medium text-foreground">Profile</Text>
    </View>
    <View className="mx-2 mt-4 h-px flex-1 bg-border" />
  </View>
  <View className="flex-row items-start">
    <View className="items-center gap-1.5">
      <View className="h-8 w-8 shrink-0 flex-row items-center justify-center rounded-full border-2 border-primary bg-transparent">
        <Text className="text-sm font-medium text-primary">3</Text>
      </View>
      <Text className="text-xs font-medium text-foreground">Review</Text>
    </View>
  </View>
</View>
```

### Vertical

**Do** — Pair each vertical step with a one-line description so the extra width earns its place.

```tsx
<View className="max-w-[320px]">
  <Stepper vertical current={1} steps={[
    { label: "Account created", description: "Email verified and password set." },
    { label: "Profile setup", description: "Add your name and avatar." },
    { label: "Team invite", description: "Invite collaborators to your workspace." },
    { label: "Done", description: "You're all set." }
  ]} />
</View>
```

**Don't** — A vertical step with only a title wastes the space the layout is built to use.

```tsx
<View className="max-w-[320px]">
  <Stepper vertical current={1} steps={[
    { label: "Account created" },
    { label: "Profile setup" },
    { label: "Team invite" },
    { label: "Done" }
  ]} />
</View>
```

### Progress bar

**Do** — Label the bar and show the exact percentage so progress is legible at a glance.

```tsx
<View className="max-w-[320px]">
  <Stepper progress current={0} steps={[]} label="Setup progress" value={68} />
</View>
```

**Don't** — A bare progress bar with no percentage leaves users guessing how far along they are.

```tsx
<View className="max-w-[320px]">
  <View className="h-1.5 overflow-hidden rounded-full bg-muted">
    <View className="h-full rounded-full bg-primary w-[68%]" />
  </View>
</View>
```
