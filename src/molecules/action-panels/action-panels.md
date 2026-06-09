# Action Panels

Section card with headline, body text, and a primary action. Used to surface a single decision or call-to-action.

## Usage

```tsx
<ActionPanel
  title="Delete this project"
  description="Once you delete a project, there is no going back. Please be certain."
  actionLabel="Delete project"
  destructive
/>
```

## Do & Don't

### Simple

**Do** — Spell out the consequence above the button so the stakes are clear before the click.

```tsx
<ActionPanel title="Delete this project" description="Once you delete a project, there is no going back. Please be certain." actionLabel="Delete project" destructive className="max-w-[420px]" />
```

**Don't** — A destructive action with no consequence copy invites accidental, irreversible clicks.

```tsx
<ActionPanel title="Delete this project" actionLabel="Delete project" destructive className="max-w-[420px]" />
```

### With form inline

**Do** — Keep the input and its submit button on one row so the input + action reads as one step.

```tsx
<Card padded className="max-w-[420px] gap-4">
  <View className="gap-1">
    <Text className="text-[15px] font-semibold text-card-foreground">Subscribe to updates</Text>
    <Text className="text-sm text-muted-foreground">We'll send you a weekly digest of what changed.</Text>
  </View>
  <View className="flex-row items-center gap-2">
    <Input placeholder="you@example.com" className="flex-1" />
    <Button primary>Subscribe</Button>
  </View>
</Card>
```

**Don't** — Stacking the field above its button breaks the single-decision rhythm and adds a row of dead space.

```tsx
<Card padded className="max-w-[420px] gap-4">
  <View className="gap-1">
    <Text className="text-[15px] font-semibold text-card-foreground">Subscribe to updates</Text>
    <Text className="text-sm text-muted-foreground">We'll send you a weekly digest of what changed.</Text>
  </View>
  <Input placeholder="you@example.com" />
  <View className="items-start">
    <Button primary>Subscribe</Button>
  </View>
</Card>
```

### Side-by-side

**Do** — Style only the irreversible action as destructive; keep the cancel/escape as a quiet outline button.

```tsx
<Card padded className="max-w-[460px] flex-row items-start gap-6">
  <View className="flex-1 gap-1">
    <Text className="text-[15px] font-semibold text-card-foreground">Discard unsaved changes?</Text>
    <Text className="text-sm text-muted-foreground">You have unsaved edits in this form. Leaving now will lose all progress.</Text>
  </View>
  <View className="shrink-0 flex-row gap-2">
    <Button outline small>Cancel</Button>
    <Button destructive small>Discard</Button>
  </View>
</Card>
```

**Don't** — Two destructive-styled buttons make the safe escape (Cancel) look as dangerous as the discard.

```tsx
<Card padded className="max-w-[460px] flex-row items-start gap-6">
  <View className="flex-1 gap-1">
    <Text className="text-[15px] font-semibold text-card-foreground">Discard unsaved changes?</Text>
    <Text className="text-sm text-muted-foreground">You have unsaved edits in this form. Leaving now will lose all progress.</Text>
  </View>
  <View className="shrink-0 flex-row gap-2">
    <Button destructive small>Discard</Button>
    <Button destructive small>Cancel</Button>
  </View>
</Card>
```

### With toggle

**Do** — Pair the switch with a one-line explanation of what turning it on or off does.

```tsx
<ActionPanel title="Two-factor authentication" description="Add an extra layer of security to your account by requiring a verification code on login." toggle checked className="max-w-[460px]" />
```

**Don't** — A bare switch with no description leaves the user guessing what flipping it actually changes.

```tsx
<ActionPanel title="Two-factor authentication" toggle checked className="max-w-[460px]" />
```
