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

## Variants

### Variant - side-by-side

```tsx
<ActionPanel
  title="Delete this project"
  description="You have unsaved edits in this form. Leaving now will lose all progress."
  actionLabel="Discard"
  destructive
  inline
/>
```

### Variant - toggle

```tsx
<ActionPanel
  title="Delete this project"
  description="Add an extra layer of security to your account by requiring a verification code on login."
  toggle
  checked
/>
```

## Do & Don't

### Simple

**Do** — Spell out the consequence above the button so the stakes are clear before the click.

```tsx
<ActionPanel title="Delete this project" description="Once you delete a project, there is no going back. Please be certain." actionLabel="Delete project" destructive style={{ maxWidth: 420 }} />
```

**Don't** — A destructive action with no consequence copy invites accidental, irreversible clicks.

```tsx
<ActionPanel title="Delete this project" actionLabel="Delete project" destructive style={{ maxWidth: 420 }} />
```

### With form inline

**Do** — Keep the input and its submit button on one row so the input + action reads as one step.

```tsx
<Card padded style={{ maxWidth: 420 }}>
  <Column relaxed>
    <Column tight>
      <Typography lead semibold>Subscribe to updates</Typography>
      <Typography small muted>We'll send you a weekly digest of what changed.</Typography>
    </Column>
    <Row alignCenter snug>
      <Column fill>
        <Input placeholder="you@example.com" />
      </Column>
      <Button primary>Subscribe</Button>
    </Row>
  </Column>
</Card>
```

**Don't** — Stacking the field above its button breaks the single-decision rhythm and adds a row of dead space.

```tsx
<Card padded style={{ maxWidth: 420, gap: 16 }}>
  <View style={{ gap: 4 }}>
    <Text style={{ fontSize: 15, fontWeight: "600", color: tokens["card-foreground"] }}>Subscribe to updates</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>We'll send you a weekly digest of what changed.</Text>
  </View>
  <Input placeholder="you@example.com" />
  <View style={{ alignItems: "flex-start" }}>
    <Button primary>Subscribe</Button>
  </View>
</Card>
```

### Side-by-side

**Do** — Style only the irreversible action as destructive; keep the cancel/escape as a quiet outline button.

```tsx
<Card padded style={{ maxWidth: 460 }}>
  <Row alignStart loose>
    <Column fill tight>
      <Typography lead semibold>Discard unsaved changes?</Typography>
      <Typography small muted>You have unsaved edits in this form. Leaving now will lose all progress.</Typography>
    </Column>
    <Row snug>
      <Button outline small>Cancel</Button>
      <Button destructive small>Discard</Button>
    </Row>
  </Row>
</Card>
```

**Don't** — Two destructive-styled buttons make the safe escape (Cancel) look as dangerous as the discard.

```tsx
<Card padded style={{ maxWidth: 460, flexDirection: "row", alignItems: "flex-start", gap: 24 }}>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", gap: 4 }}>
    <Text style={{ fontSize: 15, fontWeight: "600", color: tokens["card-foreground"] }}>Discard unsaved changes?</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>You have unsaved edits in this form. Leaving now will lose all progress.</Text>
  </View>
  <View style={{ flexShrink: 0, flexDirection: "row", gap: 8 }}>
    <Button destructive small>Discard</Button>
    <Button destructive small>Cancel</Button>
  </View>
</Card>
```

### With toggle

**Do** — Pair the switch with a one-line explanation of what turning it on or off does.

```tsx
<ActionPanel title="Two-factor authentication" description="Add an extra layer of security to your account by requiring a verification code on login." toggle checked style={{ maxWidth: 460 }} />
```

**Don't** — A bare switch with no description leaves the user guessing what flipping it actually changes.

```tsx
<ActionPanel title="Two-factor authentication" toggle checked style={{ maxWidth: 460 }} />
```
