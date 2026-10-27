# Button

Six intents × three sizes (plus the icon square) × disabled / focus / hover states. Always semantic: the intent communicates what the button does (default = the primary action, destructive = irreversible, ghost = chrome).

On the web a button is 32, 40 or 48 tall (`small`, default, `large`) with the 10 px control corner, a 500-weight label at 13, 14 or 16 px, and an 8 px gap beside its icons. The call to action fills with the accent, `destructive` with the status red, both under a lit top edge; `secondary` is the quiet well with a boundary, `outline` the boundary alone, `ghost` and `link` bare (the link underlined). A filled button brightens and rises 1 px under the pointer over 150 ms and settles back when it leaves; the other looks take the well's wash at once. A press scales the button to 96% and darkens it, unless `steadyPress`. A disabled button fades to 40%; a loading one keeps its full look while its spinner runs. A disabled or loading button stays put, and Reduce Motion makes the lift instant. On iOS the button is the 50 pt capsule with a semibold 17 pt label, on Android the 40 dp Material 3 stadium, both in the same colours.

Pass `ref` to access the interactive Pressable, including link buttons. Use `useRef<ComponentRef<typeof Button>>(null)` from React, or `useRef<View>(null)` with React Native's `View` type. Object and callback refs are supported and detach on unmount. Calling `ref.current?.focus()` or `.blur()` delegates to the host without activating the control. Browser focus is supported; native focus depends on the platform and React Native version, and is separate from accessibility focus.

`softHover` dims a link to 85% on hover in place of the wash. Inverse actions use
a translucent white hover wash over a branded surface.

Utility icon actions use `icon` with `compactIcon` (28), `mediumIcon` (32), or
`largeIcon` (34). `wideIcon` gives the compact box two extra pixels of
horizontal room; `circle` rounds it fully. Pair with `ghost` for a plain surface,
`outline` for a boundary, or `ghost inset` for a quiet fill. `steadyPress` keeps
the resting look while pressed, and `count` carries a notification badge over the
upper trailing corner. The button still owns its accessible name, hover wash, and
native touch-target extension.

Use `inlineLink link small` for an inline text action: an underlined 13-pixel
label with no box, read as a link and washed on hover. The default size is 14
pixels; `large` is 16. `extraBold`, `foreground`, and `inverse` set its weight and
ink. `external` opens `href` through the system browser on every platform, while
keeping its browser link semantics.

`scopeTrigger ghost steadyPress` is a bare 32 px menu trigger with a 600-weight
14px label; `filterTrigger ghost steadyPress` the same with a muted 13px label. Both
take the well's wash on hover. Supply the trailing chevron through `iconRight`, and
announce the menu with `expanded` and `haspopup`.

`identityAction` is a 28 px hairline pill around a leading avatar and its name;
`referenceLink` an underlined monospace key in the link ink; `inlineIcon` an unboxed
22 px icon action; `themeChoice` a 32 px pill whose `selected` state is the accent
edge with a soft accent halo.

## Usage

A button's whole job is to fire `onPress`. Wire it to your own handler and every press runs it.

```tsx
<Button>Save changes</Button>
```

## Variants

The variant only changes how a button looks; every one of them fires `onPress` the same way.

### Attention required

Use `attention` for a required setup action. Soft red glow swells outward and returns
in a heartbeat rhythm: a strong beat, a softer beat, then a pause every 1.8 seconds.
Its inner edge, label and button dimensions stay still. Reduce Motion
keeps a steady halo; disabled and loading buttons suppress it. Remove the button
or the prop when the required setup is complete.

```tsx
<Button outline small attention>Configure AI</Button>
```

### Inline identity and reference actions

```tsx
<Row comfortable alignCenter>
  <Button identityAction ghost steadyPress iconLeft={<Avatar annotation initials="S" hue={20} />}>Scout v2.3</Button>
  <Button referenceLink inlineLink link steadyPress iconRight={<Icon externalLink size={10} heavyStroke muted />}>CORE-1790</Button>
  <Button inlineIcon inlineLink link steadyPress iconLeft={<Icon externalLink size={13} heavyStroke primary />} accessibilityLabel="Open repository" />
</Row>
```

### Theme choices

```tsx
<Row snug>
  <Button themeChoice ghost steadyPress selected>blush</Button>
  <Button themeChoice ghost steadyPress>mint</Button>
</Row>
```


### Scope and filter triggers

```tsx
<Row comfortable alignCenter>
  <Button scopeTrigger ghost steadyPress iconRight={<Icon chevronDown size={14} heavyStroke />}>All my projects</Button>
  <Button filterTrigger ghost steadyPress iconRight={<Icon chevronDown size={13} heavyStroke muted />}>Filter by</Button>
</Row>
```


### Utility icon

```tsx
<Button icon compactIcon ghost steadyPress accessibilityLabel="Open menu" iconLeft={<Icon menu size={15} boldStroke muted />} />
```

### Notification action

```tsx
<Button icon largeIcon circle ghost steadyPress count={3} accessibilityLabel="Approvals" iconLeft={<Icon bell size={17} mediumStroke muted />} />
```

### Outline

```tsx
<Button outline>Save changes</Button>
```

### Secondary

```tsx
<Button secondary>Save changes</Button>
```

### Ghost

```tsx
<Button ghost>Save changes</Button>
```

### Destructive

```tsx
<Button destructive>Save changes</Button>
```

### Link

```tsx
<Button inlineLink link small steadyPress>Save changes</Button>
```

### Small

```tsx
<Button small>Save changes</Button>
```

### Large

```tsx
<Button large>Save changes</Button>
```

### Icon only

```tsx
<Button icon accessibilityLabel="Add item" iconLeft={<Icon plus primaryForeground size={16} />} />
```

### Disabled

A disabled button ignores presses: `onPress` never runs.

```tsx
<Button disabled>Save changes</Button>
```

### Loading

```tsx
<Button loading>Saving</Button>
```

### Raised

`raised` rests the page's main call to action on a soft glow in its own colour. Only a primary button takes it, and never while disabled.

```tsx
<Button raised>Mint agent</Button>
```

### Block

```tsx
<Button block>Create account</Button>
```

### Measure

Use `shrink` for a content-sized action in a narrow row. The button keeps its
normal width when space permits and wraps its full label when constrained.

```tsx
<Container>
  <Column>
    <Button xs start>xs step, pinned to the start (320)</Button>
    <Button md>md step, centered (448)</Button>
    <Button block>Block: fills the parent</Button>
  </Column>
</Container>
```

### With icon

```tsx
<Button iconLeft={<Icon plus primaryForeground size={16} />}>Save changes</Button>
```

## Do & Don't

### Default (primary)

**Do** — One clear primary action; everything else is supporting.

```tsx
<Row alignCenter snug>
  <Button primary>Save</Button>
  <Button outline>Cancel</Button>
</Row>
```

**Don't** — Multiple primaries compete; nothing stands out.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  <Button primary>Save</Button>
  <Button primary>Apply</Button>
  <Button primary>Continue</Button>
</View>
```

### Outline

**Do** — Promote the main action to default; keep the rest outline.

```tsx
<Row alignCenter snug>
  <Button primary>Publish</Button>
  <Button outline>Save draft</Button>
  <Button outline>Schedule</Button>
</Row>
```

**Don't** — All-outline leaves no signal which action is primary.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  <Button outline>Save</Button>
  <Button outline>Publish</Button>
  <Button outline>Schedule</Button>
</View>
```

### Secondary

**Do** — Default for the primary action; secondary for the next one down.

```tsx
<Row alignCenter snug>
  <Button primary>Create account</Button>
  <Button secondary>Import instead</Button>
</Row>
```

**Don't** — A secondary button as the main call to action under-sells it.

```tsx
<Button secondary>Create account</Button>
```

### Ghost

**Do** — Use ghost for tertiary and toolbar actions; keep the CTA filled.

```tsx
<Row alignCenter snug>
  <Button ghost>Cancel</Button>
  <Button primary>Save changes</Button>
</Row>
```

**Don't** — A ghost button is too quiet to carry the primary action.

```tsx
<Button ghost>Save changes</Button>
```

### Destructive

**Do** — Reserve the destructive variant for irreversible actions like delete.

```tsx
<Row alignCenter snug>
  <Button primary>Save changes</Button>
  <Button destructive>Delete account</Button>
</Row>
```

**Don't** — Red on a safe action cries wolf; users learn to ignore it.

```tsx
<Button destructive>Save changes</Button>
```

### Link

**Do** — Link variant for inline navigation; a filled button for the submit.

```tsx
<Row alignCenter cozy>
  <Button primary>Submit</Button>
  <Button link>Learn more</Button>
</Row>
```

**Don't** — A link-styled submit doesn't look pressable and gets lost.

```tsx
<Button link>Submit form</Button>
```

## Real links (href)

A button that NAVIGATES should be a real link, not a press handler that sets `location`. Pass `href` and the web render becomes a genuine browser link: middle-click, cmd-click, and open-in-new-tab all work, crawlers see the destination, and assistive tech hears a link. Native platforms have no anchors, so pair `href` with an `onPress` that runs the same navigation through your router; while `disabled` or `loading` the anchor is suppressed exactly like `onPress`. `hrefAttrs` carries the anchor attributes react-native-web forwards (`target`, `rel`, `download`).

```tsx
<Row alignCenter cozy>
  <Button link href="https://canvas.nannier.com">Read the docs</Button>
  <Button outline href="https://www.npmjs.com/package/@nannier/canvas" hrefAttrs={{ target: "_blank", rel: "noreferrer" }}>
    npm package
  </Button>
</Row>
```

## Anatomy

A Button registers its parts with an enclosing `AnatomyProvider`, in the hand-off's order: `Container` (the pressable box), `Label`, `Leading icon`, `Trailing icon` and `Count badge`. The provider (`AnatomyProviderProps`) reports each rendered part's rectangle (an `AnatomyRect`, relative to its own box) to its `onMeasure` callback as `AnatomyRects` by part name, so a docs Anatomy section can number the parts with markers drawn over the specimen. Outside a provider the registration costs one context read and adds no node.

## Workflow actions

Use `outline quiet` for a muted secondary operation and `outline inverse` on a dark
branded surface. `consistent` gives short workflow actions a shared minimum width;
`comfortable` supplies the roomier surround used for a compact featured action.

## Touch area

On iOS and Android a Button smaller than the platform's minimum touch target (44pt, 48dp) keeps its size and extends only its touch area to the minimum, from its first frame, so nothing moves. React Native bounds that area by two rules of its own. It never reaches past a native container that does not contain it: a container of yours that clips (overflow hidden, a scroll view's edge) stops it at that edge. A container that paints, carries a `testID` or handles pointer events admits it, because such a container records the touch area at its layout and the Button has it from its first one. Every kit control does the same for itself; a control the kit lacks belongs in the kit, never in a Pressable of your own (see DESIGN.md, Shapes). And where two touch areas overlap, the later sibling takes the tap: on Android two small icon Buttons 8 apart in a Row both reach across the gap between them, so a tap anywhere in it presses the second. Leave at least twice the extra touch area between small Buttons you place side by side (16 between two small icon Buttons on Android, 8 on iOS).
