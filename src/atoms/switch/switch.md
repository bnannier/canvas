# Toggles

On / off switch, isolated or grouped in a settings list.

## Usage

```tsx
<Switch checked>Available to chat</Switch>
```

## Variants

### State - off

```tsx
<Switch>Available to chat</Switch>
```

### With description

```tsx
<Switch checked description="Show your availability to teammates.">Available to chat</Switch>
```

### Disabled

```tsx
<Switch checked disabled>Available to chat</Switch>
```

## Do & Don't

### Off

**Do** — Keep the standard bg-input off track so off stays clearly interactive and distinct from a disabled control.

```tsx
<Switch className="max-w-[280px]">Two-factor auth</Switch>
```

**Don't** — A washed-out off track reads as disabled, so users can't tell the switch is simply off versus locked.

```tsx
<Pressable className="max-w-[280px] flex-row items-center justify-between gap-4">
  <Text className="text-sm font-medium text-foreground">Two-factor auth</Text>
  <View className="relative shrink-0 rounded-full w-9 h-5 bg-muted/30">
    <View className="absolute top-0.5 left-0.5 rounded-full w-4 h-4 bg-muted" />
  </View>
</Pressable>
```

### On

**Do** — Reserve the on switch for instantly reversible settings; route irreversible actions through a button plus confirmation.

```tsx
<View className="max-w-[280px] flex-col gap-3">
  <Switch checked>Auto-save drafts</Switch>
  <Button destructive small className="self-start">Delete account…</Button>
</View>
```

**Don't** — A switch applies instantly; wiring an on toggle to an irreversible action invites accidental, unconfirmed data loss.

```tsx
<Pressable className="max-w-[280px] flex-row items-center justify-between gap-4">
  <Text className="text-sm font-medium text-destructive">Permanently delete account</Text>
  <View className="relative shrink-0 rounded-full w-9 h-5 bg-primary">
    <View className="absolute top-0.5 right-0.5 rounded-full w-4 h-4 bg-background shadow" />
  </View>
</Pressable>
```

**Do** — Label the setting, not the state; the switch communicates on or off.

```tsx
<Switch checked className="max-w-[280px]">Notifications</Switch>
```

**Don't** — An On/Off label duplicates what the switch position already shows.

```tsx
<View className="max-w-[280px] flex-row items-center justify-between">
  <Text className="text-[13px]">Notifications</Text>
  <View className="flex-row items-center gap-2">
    <Text className="text-xs text-muted-foreground">Off</Text>
    <Switch />
    <Text className="text-xs text-muted-foreground">On</Text>
  </View>
</View>
```
