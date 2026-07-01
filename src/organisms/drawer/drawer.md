# Drawer

A full-screen panel that slides in from an edge: a navigation drawer, a mobile menu, or a bottom action sheet. Built on React Native's Modal, so it floats over the whole app on iOS, Android, and the web. For a small contextual menu, reach for Dropdown or RowMenu instead.

## Usage

```tsx
<Drawer trigger="Open menu" left width={260}>
  <Column padLoose cozy>
    <Typography lead semibold>Menu</Typography>
    <Button ghost block onPress={() => {}}>Home</Button>
    <Button ghost block onPress={() => {}}>Components</Button>
    <Button ghost block onPress={() => {}}>Settings</Button>
  </Column>
</Drawer>
```

## Variants

### Edge - left

```tsx
<Drawer trigger="Left drawer" left width={240}>
  <Column padLoose snug>
    <Typography lead semibold>Navigation</Typography>
    <Typography small muted>A full-height panel on the left.</Typography>
    <Button primary block onPress={() => {}}>Go to settings</Button>
  </Column>
</Drawer>
```

### Edge - right

```tsx
<Drawer trigger="Right drawer" right width={240}>
  <Column padLoose snug>
    <Typography lead semibold>Details</Typography>
    <Typography small muted>A full-height panel on the right.</Typography>
    <Button primary block onPress={() => {}}>View full details</Button>
  </Column>
</Drawer>
```

### Edge - bottom sheet

```tsx
<Drawer trigger="Bottom sheet" bottom>
  <Column padLoose snug>
    <Typography lead semibold>Actions</Typography>
    <Button ghost block onPress={() => {}}>Share</Button>
    <Button ghost block onPress={() => {}}>Duplicate</Button>
    <Button destructive block onPress={() => {}}>Delete</Button>
  </Column>
</Drawer>
```

## Do & Don't

### Right tool for the job

**Do** — Use a Drawer for primary navigation or a full sheet of actions that should take over the screen on a phone.

```tsx
<Drawer trigger="Open navigation" left width={260}>
  <Column padLoose snug>
    <Typography lead semibold>Navigation</Typography>
    <Typography small muted>Home</Typography>
    <Typography small muted>Components</Typography>
  </Column>
</Drawer>
```

**Don't** — Use a full-screen Drawer for a small contextual menu; covering the whole screen for two choices is disorienting. Use a Dropdown or RowMenu anchored to the trigger.

```tsx
<Drawer trigger="Edit" right width={240}>
  <View style={{ padding: 20, gap: 10 }}>
    <Text style={{ fontSize: 14, color: tokens.foreground }}>Rename</Text>
    <Text style={{ fontSize: 14, color: tokens.foreground }}>Delete</Text>
  </View>
</Drawer>
```
