# Drawer

A full-screen panel that slides in from an edge: a navigation drawer, a mobile menu, or a bottom action sheet. Built on React Native's Modal,
<!-- only: web -->
so it floats over the whole app on iOS, Android, and the web,
<!-- /only -->
<!-- only: ios android -->
so it floats over the whole app on every platform Canvas supports,
<!-- /only -->
over a dimmed scrim that glass on the web also blurs. For a small contextual menu, reach for Dropdown or RowMenu instead.

Drawer provides an overlay host inside its own window. Dropdown, Select, and other anchored children render above the panel without being clipped by its corners; no additional OverlayProvider is needed inside the drawer. A tap outside an open child menu dismisses that menu, and Escape dismisses the child before the drawer. Nested drawers each keep their overlays in their own window.

<!-- only: web ios -->
On iOS, VoiceOver's accessibility escape gesture requests dismissal of the
foremost open child before the drawer.
<!-- /only -->
<!-- only: web -->
Android system back uses the same child
ownership.
<!-- /only -->
<!-- only: android -->
Android system back requests dismissal of the foremost open child before the drawer.
<!-- /only -->
A controlled child that stays open continues to own later requests;
one request never falls through to its parent. The scrim remains a pointer
target, and the built-in trigger opens the drawer. Sidebar drill-down navigation
has its own back behavior; accessibility escape dismisses the overlay rather
than navigating a sidebar level. Focus restoration remains platform-dependent.

Give a controlled drawer an `accessibilityLabel` when it has no built-in
`trigger`. A drawer with a trigger uses the trigger label as its modal name.

`header` and `footer` pin content around an independently scrolling body. Its
application inset is 20 pixels vertically and 24 horizontally, with 22 between
children. `navigation` gives that body no inset or gap and fills its height.
`plain` preserves the original square Argus side panel and lightly frosted dim on
web; native skins retain their platform panel. `instant` presents and dismisses
without a slide or fade. Existing drawers retain their animated default.

## Usage

```tsx
<Drawer trigger="Open menu">
  <Column padLoose cozy>
    <Typography lead semibold>Menu</Typography>
    <Button ghost block>Home</Button>
    <Button ghost block>Components</Button>
    <Button ghost block>Settings</Button>
  </Column>
</Drawer>
```

## Variants

### Terminal sidebar

`terminal` opens a solid execution screen at the right edge, using the active
light or dark theme even under glass. All four corners round to 12 pixels; the
screen sits 12 pixels inside wider windows and 8 pixels inside windows up to
640 pixels wide. Its width is capped to the available viewport. Header and footer
remain pinned around the scrolling body; `navigation` removes the body inset.
`terminal` wins over edge flags and `plain`. The existing slide, Escape, focus and
Reduced Motion behavior remain in effect (`instant` still skips animation).
`onClosed` fires once after a completed dismissal, allowing a parent to retain the
drawer through its exit animation; an initially closed drawer does not fire it.

```tsx
<Drawer terminal navigation width={820} trigger="Execution" header={<Typography h5>Execution</Typography>}>
  <CodeBlock transcript code={output} />
</Drawer>
```

### Application panel

```tsx
<Drawer plain instant right width={440} trigger="Agent details" header={<Typography h3 bold>Scout</Typography>} footer={<Button secondary>Pause</Button>}>
  <Typography>Recent work and trace details.</Typography>
</Drawer>
```


### Right

```tsx
<Drawer trigger="Right drawer" right>
  <Column padLoose snug>
    <Typography lead semibold>Details</Typography>
    <Typography small muted>A full-height panel on the right.</Typography>
  </Column>
</Drawer>
```

### Open in place

`embedded` draws the drawer open inside its parent (the panel at its edge over the parent's
own dim) for a specimen or a preview: it is a labelled region, not a modal, so it traps no
focus, takes no Escape or hardware back, and its dim passes touches through. It needs no
trigger and fills the parent it is given.

```tsx
<Drawer embedded open right accessibilityLabel="Invite people" header={<Typography h5>Invite people</Typography>}>
  <Input label="Email" placeholder="name@company.com" />
</Drawer>
```

### Bottom sheet

```tsx
<Drawer trigger="Bottom sheet" bottom>
  <Column padLoose snug>
    <Typography lead semibold>Actions</Typography>
    <Typography small muted>A sheet that rises from the bottom edge.</Typography>
  </Column>
</Drawer>
```

### Top sheet

```tsx
<Drawer trigger="Top sheet" top>
  <Column padLoose snug>
    <Typography lead semibold>What's new</Typography>
    <Typography small muted>A sheet that drops down from the top edge.</Typography>
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
