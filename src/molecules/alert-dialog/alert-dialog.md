# Alert Dialog

Catalyst-style confirmation dialog: a centered panel over a dimmed, blurred backdrop, with a title, description, optional body, and action buttons. Reserve it for decisions that must block the rest of the app.

## Usage

```tsx
<AlertDialog
  title="Delete this identity?"
  description="This permanently removes the identity and revokes any active sessions. This action cannot be undone."
  confirmLabel="Delete"
  destructive
  trigger="Delete identity…"
/>
```

## Do & Don't

### Reserve the dialog for blocking decisions

**Do** — Use an inline banner or toast for passive feedback; reserve the dialog for decisions that must be confirmed.

```tsx
<Alert success title="Saved" description="Your changes have been saved." />
```

**Don't** — A blocking alert dialog for passive confirmation interrupts the user for no reason.

```tsx
<AlertDialog open small title="Saved" description="Your changes have been saved." confirmLabel="OK" />
```

### Name the action on the confirm button

**Do** — Label the confirm button with the verb it performs (Delete, Archive, Sign out).

```tsx
<AlertDialog open small destructive title="Delete this identity?" cancelLabel="Cancel" confirmLabel="Delete" />
```

**Don't** — Generic Yes / No forces the user to re-read the title to know what they are confirming.

```tsx
<AlertDialog open small destructive title="Delete this identity?" cancelLabel="No" confirmLabel="Yes" />
```

### xs

**Do** — Reserve xs for a terse one-line question with short button labels and no body content.

```tsx
<AlertDialog open narrow destructive title="Remove device?" cancelLabel="Cancel" confirmLabel="Remove" />
```

**Don't** — A long title, multi-line description, and wordy buttons get cramped in the xs width and wrap awkwardly.

```tsx
<AlertDialog open narrow destructive title="Remove this trusted device?" description="It will need to re-authenticate, and any pending background syncs from it will be cancelled the next time it connects." cancelLabel="Cancel" confirmLabel="Remove device" />
```

### sm

**Do** — Use sm for a single short confirmation with a one-line description; move real forms to a full dialog.

```tsx
<AlertDialog open small title="Transfer ownership?" description="You will lose admin access to this workspace." cancelLabel="Cancel" confirmLabel="Transfer" />
```

**Don't** — Packing a multi-field form into sm makes it feel like a form crammed into a confirmation popup.

```tsx
<View className="items-center justify-center rounded-lg bg-black/50 p-8" style={{ minHeight: 200 }}>
  <View className="w-full max-w-[384px] rounded-lg border border-border bg-popover p-6 shadow-xl">
    <Text className="text-base font-semibold text-popover-foreground">Transfer ownership</Text>
    <View className="mt-4 gap-4">
      <View>
        <Text className="text-sm font-medium text-foreground mb-1.5">New owner email</Text>
        <Input placeholder="owner@example.com" />
      </View>
      <View>
        <Text className="text-sm font-medium text-foreground mb-1.5">Reason</Text>
        <Input placeholder="Optional note" />
      </View>
      <View>
        <Text className="text-sm font-medium text-foreground mb-1.5">Type TRANSFER to confirm</Text>
        <Input placeholder="TRANSFER" />
      </View>
    </View>
    <View className="flex-row justify-end gap-2 mt-6">
      <Button outline small>Cancel</Button>
      <Button primary small>Transfer</Button>
    </View>
  </View>
</View>
```

### md

**Do** — md is the default home for a typical destructive confirm with a sentence or two of description.

```tsx
<AlertDialog open destructive title="Delete this identity?" description="This permanently removes the identity and revokes any active sessions. This action cannot be undone." cancelLabel="Cancel" confirmLabel="Delete" />
```

**Don't** — Squeezing a description-carrying confirm into a smaller width crowds the copy against the edges.

```tsx
<AlertDialog open narrow destructive title="Delete this identity?" description="This permanently removes the identity and revokes any active sessions. This action cannot be undone." cancelLabel="Cancel" confirmLabel="Delete" />
```

### lg

**Do** — Reserve lg for dialogs that earn the width: a body field or a longer explanation to read.

```tsx
<AlertDialog open large destructive withInput title="Delete this identity?" description="This permanently removes the identity and revokes any active sessions. This action cannot be undone." cancelLabel="Cancel" confirmLabel="Delete" />
```

**Don't** — A bare yes/no in lg leaves a wide, empty panel that reads as heavier than the trivial decision it asks for.

```tsx
<AlertDialog open large title="Sign out?" cancelLabel="Cancel" confirmLabel="Sign out" />
```
