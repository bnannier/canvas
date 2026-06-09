# Dividers

Horizontal, vertical, with label, with action.

## Usage

```tsx
<Divider />
```

## Variants

### Orientation - vertical

```tsx
<Divider vertical />
```

### Variant - label

```tsx
<Divider>Or continue with</Divider>
```

### Variant - action

```tsx
<View className="w-80">
  <View className="gap-2">
    <View className="rounded-md border border-border px-3 py-2">
      <Text className="text-sm text-foreground">Ada commented on the draft</Text>
    </View>
    <View className="rounded-md border border-border px-3 py-2">
      <Text className="text-sm text-foreground">Grace approved the request</Text>
    </View>
  </View>
  <Divider className="mt-3" children={<Button ghost small>Show more</Button>} />
</View>
```

## Do & Don't

### Plain

**Do** — Click a row: group with spacing and reserve a divider for a real break like Sign out.

```tsx
<View className="max-w-[280px]">
  <Text className="rounded-md px-2 py-1.5 text-sm">Profile</Text>
  <Text className="rounded-md px-2 py-1.5 text-sm">Account</Text>
  <Text className="rounded-md px-2 py-1.5 text-sm">Notifications</Text>
  <Divider className="my-1" />
  <Text className="rounded-md px-2 py-1.5 text-sm">Sign out</Text>
</View>
```

**Don't** — Click a row: a divider between every one is noise that competes with the content.

```tsx
<View className="max-w-[280px]">
  <Text className="rounded-md px-2 py-1.5 text-sm">Profile</Text>
  <Divider />
  <Text className="rounded-md px-2 py-1.5 text-sm">Account</Text>
  <Divider />
  <Text className="rounded-md px-2 py-1.5 text-sm">Notifications</Text>
  <Divider />
  <Text className="rounded-md px-2 py-1.5 text-sm">Billing</Text>
</View>
```

### With label

**Do** — Click a provider: keep the label to a few words and let the buttons carry the options.

```tsx
<View className="w-80 flex-col gap-2">
  <Button primary block>Sign in</Button>
  <Divider>or continue with</Divider>
  <View className="flex-row gap-2">
    <Button outline block className="flex-1">Google</Button>
    <Button outline block className="flex-1">GitHub</Button>
  </View>
</View>
```

**Don't** — Click Sign in: a full sentence in the label divider buries the choice.

```tsx
<View className="w-80 flex-col gap-2">
  <Button primary block>Sign in</Button>
  <Divider>or continue with one of your previously linked third-party accounts</Divider>
</View>
```

### With action

**Do** — Click Show more: the button toggles its label and reveals the rest.

```tsx
<View className="w-80 gap-1.5">
  <Text className="py-1.5 text-sm text-muted-foreground">Logged in from 2 new devices · 3 more entries</Text>
  <Divider>
    <Button ghost small>Show less</Button>
  </Divider>
</View>
```

**Don't** — Click the button: an action divider that does nothing is just decoration.

```tsx
<View className="w-80">
  <Divider>
    <Button ghost small>Show more</Button>
  </Divider>
</View>
```

### Vertical

**Do** — Click an action: the vertical rule separates inline actions in a row.

```tsx
<View className="flex-row items-center gap-3">
  <Text className="text-sm">Edit</Text>
  <Divider vertical className="h-4" />
  <Text className="text-sm">Delete</Text>
  <Divider vertical className="h-4" />
  <Text className="text-sm">Share</Text>
</View>
```

**Don't** — Click an action: a vertical rule between stacked items reads as a glitch.

```tsx
<View className="flex-col items-start gap-2">
  <Text className="text-sm">Edit</Text>
  <Divider vertical className="h-4" />
  <Text className="text-sm">Delete</Text>
</View>
```
