# Dialog

A modal dialog: a centered panel over a dimmed, blurred backdrop, with a title, an optional description, a body for real content like a form, and right-aligned actions. Use it for a focused task that warrants interrupting the page; reach for the Alert Dialog for a terse yes/no confirmation.

## Usage

```tsx
<Dialog
  trigger="Open dialog"
  title="Refund payment"
  description="The refund will be reflected in the customer's bank account within 2 to 3 business days."
  withBody
  confirmLabel="Confirm"
  cancelLabel="Cancel"
/>
```

## Do & Don't

### When to use

**Do** — Use the Dialog for a focused task with real content, like a short form.

```tsx
<Dialog open large>
  <Text className="text-base font-semibold text-popover-foreground">Edit profile</Text>
  <Text className="text-sm text-muted-foreground mt-2">Update how your name and email appear to teammates.</Text>
  <View className="mt-5">
    <Text className="text-sm font-medium text-foreground mb-1.5">Name</Text>
    <Input value="Ada Lovelace" />
    <Text className="text-sm font-medium text-foreground mb-1.5 mt-4">Email</Text>
    <Input value="ada@example.com" />
  </View>
  <View className="flex-row justify-end gap-2 mt-6">
    <Button outline small>Cancel</Button>
    <Button primary small>Save changes</Button>
  </View>
</Dialog>
```

**Don't** — A bare yes/no question does not need the roomier Dialog; that is what the Alert Dialog is for.

```tsx
<Dialog open title="Delete file?" small destructive confirmLabel="Delete" cancelLabel="Cancel" />
```

### Description

**Do** — Keep the description to one supporting line; link out for the full policy.

```tsx
<Dialog open title="Refund payment" description="The refund posts to the original card in 2 to 3 business days." medium confirmLabel="Refund" cancelLabel="Cancel" />
```

**Don't** — A multi-sentence policy dump in the description buries the task under reading.

```tsx
<Dialog open title="Refund payment" description="Refunds are processed through the original payment method. Depending on the bank, the amount can take 2 to 3 business days to appear. Partial refunds are supported. Once submitted a refund cannot be cancelled, and the payout for this period will be adjusted on your next statement." medium confirmLabel="Refund" cancelLabel="Cancel" />
```

### Body form

**Do** — Keep the body to the few fields the task needs; send long forms to a full page.

```tsx
<Dialog open large>
  <Text className="text-base font-semibold text-popover-foreground">Create project</Text>
  <View className="mt-5">
    <Text className="text-sm font-medium text-foreground mb-1.5">Name</Text>
    <Input placeholder="Acme website" />
    <Text className="text-sm font-medium text-foreground mb-1.5 mt-4">Key</Text>
    <Input placeholder="ACME" />
  </View>
  <View className="flex-row justify-end gap-2 mt-6">
    <Button outline small>Cancel</Button>
    <Button primary small>Create</Button>
  </View>
</Dialog>
```

**Don't** — A seven-field form crammed into a small dialog feels like a page stuffed into a popup.

```tsx
<Dialog open small>
  <Text className="text-base font-semibold text-popover-foreground">Create project</Text>
  <View className="mt-5">
    <Text className="text-sm font-medium text-foreground mb-1.5">Name</Text>
    <Input />
    <Text className="text-sm font-medium text-foreground mb-1.5 mt-3">Key</Text>
    <Input />
    <Text className="text-sm font-medium text-foreground mb-1.5 mt-3">Description</Text>
    <Input />
    <Text className="text-sm font-medium text-foreground mb-1.5 mt-3">Lead</Text>
    <Input />
    <Text className="text-sm font-medium text-foreground mb-1.5 mt-3">Team</Text>
    <Input />
    <Text className="text-sm font-medium text-foreground mb-1.5 mt-3">Visibility</Text>
    <Input />
    <Text className="text-sm font-medium text-foreground mb-1.5 mt-3">Template</Text>
    <Input />
  </View>
  <View className="flex-row justify-end gap-2 mt-6">
    <Button outline small>Cancel</Button>
    <Button primary small>Create</Button>
  </View>
</Dialog>
```

### Actions

**Do** — One primary plus quieter secondaries, right-aligned and labeled with their verb.

```tsx
<Dialog open medium>
  <Text className="text-base font-semibold text-popover-foreground">Unsaved changes</Text>
  <Text className="text-sm text-muted-foreground mt-2">You have edits that are not saved.</Text>
  <View className="flex-row justify-end gap-2 mt-6">
    <Button ghost small>Discard</Button>
    <Button outline small>Keep editing</Button>
    <Button primary small>Save</Button>
  </View>
</Dialog>
```

**Don't** — Three look-alike primary buttons give no signal about the default, safe choice.

```tsx
<Dialog open medium>
  <Text className="text-base font-semibold text-popover-foreground">Unsaved changes</Text>
  <Text className="text-sm text-muted-foreground mt-2">You have edits that are not saved.</Text>
  <View className="flex-row justify-end gap-2 mt-6">
    <Button primary small>Save</Button>
    <Button primary small>Discard</Button>
    <Button primary small>Keep editing</Button>
  </View>
</Dialog>
```

### Destructive action

**Do** — Reserve the destructive tone for the irreversible action it names.

```tsx
<Dialog open title="Delete workspace" description="This removes all projects and cannot be undone." medium destructive confirmLabel="Delete" cancelLabel="Cancel" />
```

**Don't** — A red button on a routine Save trains users to ignore the colour that should mean danger.

```tsx
<Dialog open title="Save changes" description="Update the profile with your edits." medium destructive confirmLabel="Save" cancelLabel="Cancel" />
```

### Size

**Do** — Size the dialog to its content: a single field belongs in xs or sm.

```tsx
<Dialog open small>
  <Text className="text-base font-semibold text-popover-foreground">Rename</Text>
  <View className="mt-5">
    <Text className="text-sm font-medium text-foreground mb-1.5">Name</Text>
    <Input value="Untitled" />
  </View>
  <View className="flex-row justify-end gap-2 mt-6">
    <Button outline small>Cancel</Button>
    <Button primary small>Save</Button>
  </View>
</Dialog>
```

**Don't** — A 2xl panel around a single field leaves a vast empty expanse beside the input.

```tsx
<Dialog open wide>
  <Text className="text-base font-semibold text-popover-foreground">Rename</Text>
  <View className="mt-5">
    <Text className="text-sm font-medium text-foreground mb-1.5">Name</Text>
    <Input value="Untitled" />
  </View>
  <View className="flex-row justify-end gap-2 mt-6">
    <Button outline small>Cancel</Button>
    <Button primary small>Save</Button>
  </View>
</Dialog>
```
