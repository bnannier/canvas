# Button

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: ffd42edcc8828d3edcdcfd4bb3a9835f8b54674438055997f10ebf5989e7e006

Source: `src/atoms/button/button.md`
Human reference: https://canvas.nannier.com/components/button

## Public imports

```tsx
import { AnatomyPart, AnatomyProvider, Button } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Six intents × three sizes (plus the icon square) × disabled / focus / hover states. Always semantic: the intent communicates what the button does (default = the primary action, destructive = irreversible, ghost = chrome).

On the web a button is 32, 40 or 48 tall (`small`, default, `large`) with the 10 px control corner, a 500-weight label at 13, 14 or 16 px, and an 8 px gap beside its icons. The call to action fills with the accent, `destructive` with the status red, both under a lit top edge; `secondary` is the quiet well with a boundary, `outline` the boundary alone, `ghost` and `link` bare (the link underlined). A filled button brightens and rises 1 px under the pointer over 150 ms and settles back when it leaves; the other looks take the well's wash at once. A press scales the button to 96% and darkens it, unless `steadyPress`. A disabled button fades to 40%; a loading one keeps its full look while its spinner runs. A disabled or loading button stays put, and Reduce Motion makes the lift instant.
On iOS the button is the 50 pt capsule with a semibold 17 pt label, on Android the 40 dp Material 3 stadium, both in the same colours.

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

`plainLink` is a plain accent text action with no box and no underline, still read
as a button: a panel's Reset, a table's show-all row. On the web it is a 500 13 px
label in the accent text ink (12 px with `small`) that brightens to the foreground ink
under the pointer; natively it is the platform's own tint-coloured text button. Among
the bodies, `inlineLink` wins over `plainLink` when both are passed.

`scopeTrigger ghost steadyPress` is a bare 32 px menu trigger with a 600-weight
14px label; `filterTrigger ghost steadyPress` the same with a muted 13px label. Both
take the well's wash on hover. Supply the trailing chevron through `iconRight`, and
announce the menu with `expanded` and `haspopup`.

`identityAction` is a 28 px hairline pill around a leading avatar and its name;
`referenceLink` an underlined monospace key in the link ink; `inlineIcon` an unboxed
22 px icon action; `themeChoice` a 32 px pill around the theme's colour disc, a
`<Swatch tiny ring circle decorative>` passed through `iconLeft`, whose `selected` state is the
accent edge with a soft accent halo. `pageLink` is a page header's link, a 34 px hairline box
around a muted 13 px label (a page's section, its source); add `mono` when the label is a
path, which sets it in the 400 12 px mono face. `jumpLink` is a page's jump to one of its sections, a 28 px
hairline pill around a muted 500 12 px label. Both header links brighten their label to the
full ink and take the `secondary` wash under the pointer.

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

The disc is the theme's own colour, data the example carries rather than a token: the
hand-off's `THM` table (cv-kit-code.js line 67) gives blush `oklch(.8 .09 10)` and mint
`oklch(.84 .11 165)`, which are `#f1a6b0` and `#80e2b9` in sRGB.

```tsx
<Row snug>
  <Button themeChoice ghost steadyPress selected iconLeft={<Swatch tiny ring circle decorative color="#f1a6b0" />}>blush</Button>
  <Button themeChoice ghost steadyPress iconLeft={<Swatch tiny ring circle decorative color="#80e2b9" />}>mint</Button>
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

### Unread mark

`unread` marks something new without a number: the accent dot inside the box's upper trailing corner, ringed in the card colour. The dot is decorative, so name the state in the accessible label; `count` wins when both are passed.

```tsx
<Button outline icon unread accessibilityLabel="Inbox, unread messages" iconLeft={<Icon inbox size={16} decorative />} />
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

### Plain link

```tsx
<Row snug alignCenter>
  <Button plainLink>Show all 54 props</Button>
  <Button plainLink small>Reset</Button>
</Row>
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
<Button icon accessibilityLabel="Add item" iconLeft={<Icon plus size={16} />} />
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

### Rounded

`rounded` gives a button fully rounded ends: the pill in place of the control corner, and a circle on an `icon` square. The special bodies keep their own corners.

```tsx
<Button secondary rounded>Rounded</Button>
```

### Block

```tsx
<Button block>Create account</Button>
```

### Dashed

`dashed` draws the edge dashed, for an add-a-row or drop-here action. It shows on the looks that draw an edge, `secondary` and `outline`.

```tsx
<Button secondary block dashed>Add a row</Button>
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

An `Icon` in `iconLeft` or `iconRight` takes the button's label ink when it carries no
tone of its own: the primary's contrast ink on a primary button, the foreground on an
outline or ghost one, the muted ink on a quiet trigger, the link ink on a link, and it
dims with the label while the button is disabled. Size the glyph (16 at the base size,
14 small); pass a tone (`destructive`, `muted`) only to colour it apart from the label.

```tsx
<Button iconLeft={<Icon plus size={16} />}>Save changes</Button>
```

### Icon ink per intent

The same bare glyph on each intent, in that intent's label ink. The row wraps, so the
six buttons fold onto a second line inside a narrow card instead of running past its edge.

```tsx
<Row wrap relaxed alignCenter>
  <Button iconLeft={<Icon sparkles size={16} />} iconRight={<Icon chevronDown size={16} />}>Save changes</Button>
  <Button secondary iconLeft={<Icon sparkles size={16} />}>Save changes</Button>
  <Button outline iconLeft={<Icon sparkles size={16} />}>Save changes</Button>
  <Button destructive iconLeft={<Icon trash2 size={16} />}>Delete</Button>
  <Button disabled iconLeft={<Icon sparkles size={16} />}>Save changes</Button>
</Row>
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

A Button registers its parts with an enclosing `AnatomyProvider`, in the hand-off's order: `Container` (the pressable box), `Label`, `Leading icon`, `Trailing icon` and `Count badge`. The provider (`AnatomyProviderProps`) fills its stage and centres the specimen, and reports each rendered part's rectangle (an `AnatomyRect`, relative to its own box and in the space the specimen is seen in) to its `onMeasure` callback as `AnatomyRects` by part name, with its own box as its parent laid it out, so a docs Anatomy section can number the parts with markers drawn over the specimen. `zoomed` draws the specimen at the hand-off's anatomy zoom (1.6, for a component that hugs its content): the provider lays its inner box out at the stage width over the zoom and scales it back up about its centre, reserves the scaled height so the stage grows with the figure, and maps the rectangles before reporting them. Outside a provider the registration costs one context read and adds no node. Every kit component registers its own parts the same way, under the names its docs page lists, and a part belongs to the outermost component that names it: the Badge inside a Button's count, or the Buttons in a Dialog's footer, register nothing of theirs. `AnatomyPart` registers an element of your own as a named part (`<AnatomyPart name="Child view">...</AnatomyPart>`), measured in a wrapping view inside a provider and rendered bare outside one; its `AnatomyPartProps` take the part's `name`, or a `part` a component already took, which renders its children bare when undefined.

## Workflow actions

Use `outline quiet` for a muted secondary operation and `outline inverse` on a dark
branded surface. `consistent` gives short workflow actions a shared minimum width;
`comfortable` supplies the roomier surround used for a compact featured action.

## Touch area

On iOS and Android a Button smaller than the platform's minimum touch target (44pt, 48dp) keeps its size
and extends only its touch area to the minimum, from its first frame, so nothing moves. React Native bounds that area by two rules of its own. It never reaches past a native container that does not contain it: a container of yours that clips (overflow hidden, a scroll view's edge) stops it at that edge. A container that paints, carries a `testID` or handles pointer events admits it, because such a container records the touch area at its layout and the Button has it from its first one. Every kit control does the same for itself; a control the kit lacks belongs in the kit, never in a Pressable of your own (see DESIGN.md, Shapes).
And where two touch areas overlap, the later sibling takes the tap: on Android two small icon Buttons 8 apart in a Row both reach across the gap between them, so a tap anywhere in it presses the second. Leave at least twice the extra touch area between small Buttons you place side by side (16 between two small icon Buttons on Android, 8 on iOS).

## Supported props

### ButtonProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  |  |
| iconLeft | ReactNode | no |  | An icon element rendered before the label (e.g. a lucide or Canvas `Icon`). It renders directly (not wrapped in the label `Text`, which cannot host an SVG), spaced from the label by the skin's gap. Pass `iconLeft` alone with the `icon` size prop for an icon-only square button. The caller sizes the icon; a Canvas `Icon` with no tone of its own takes the button's label ink (the primary's contrast ink on a primary button, the muted ink on a quiet one, dimmed with the label while disabled), and an explicit tone keeps it. |
| iconRight | ReactNode | no |  | An icon element rendered after the label (e.g. a trailing chevron/arrow). |
| accessibilityLabel | string \| undefined | no |  | Accessibility label, required for an icon-only button (no text to read). |
| onPress | ((event: GestureResponderEvent) => void) \| undefined | no |  |  |
| href | string \| undefined | no |  | Renders the button as a REAL link on the web: react-native-web gives the root Pressable an `<a href>`, so middle-click, cmd-click, open-in-new-tab, and crawlers all see the destination, and assistive tech hears a link. Native platforms have no anchors and ignore it, so pair `href` with an `onPress` that runs the same navigation through the host's router. While `disabled` or `loading` the anchor is suppressed, exactly like `onPress`. |
| hrefAttrs | { target?: "_blank" \| "_self"; rel?: string; download?: boolean \| string; } \| undefined | no |  | Anchor attributes forwarded with `href` on the web (react-native-web's `hrefAttrs`): `target`, `rel`, `download`. Ignored without `href`, and everywhere natively. |
| onHoverIn | ((event: MouseEvent) => void) \| undefined | no |  | Called when a pointer starts hovering the button. Fires on pointer devices only (web via react-native-web, pointer-equipped iPads/desktops natively); touch never triggers it. For hover-driven disclosure such as Tooltip. |
| onHoverOut | ((event: MouseEvent) => void) \| undefined | no |  | Called when the pointer stops hovering the button (see `onHoverIn`). |
| onFocus | ((event: NativeSyntheticEvent<TargetedEvent>) => void) \| undefined | no |  | Called when the button gains focus (keyboard tab, or click on web). |
| onBlur | ((event: NativeSyntheticEvent<TargetedEvent>) => void) \| undefined | no |  | Called when the button loses focus. |
| primary | boolean \| undefined | no | false | Intent (pick one; default is the primary action). |
| secondary | boolean \| undefined | no | false | Intent (pick one; default is the primary action). |
| inverse | boolean \| undefined | no | false | White outlined action over a dark or branded surface. |
| quiet | boolean \| undefined | no | false | Muted outlined action for a low-emphasis operation. |
| softHover | boolean \| undefined | no | false | The reference link hover dims to 85% while keeping its normal ink. |
| scopeTrigger | boolean \| undefined | no | false | A bare project-scope menu trigger: its label set in 600, a hover wash, the chevron through `iconRight`. |
| identityAction | boolean \| undefined | no | false | An identity action: a 28-tall hairline pill around a leading avatar and its name. |
| pageLink | boolean \| undefined | no | false | A page header's link: a 34-tall hairline box around a muted label (a source path, the page's section). |
| jumpLink | boolean \| undefined | no | false | A page's jump to one of its sections: a 28-tall hairline pill around a muted 12px label. |
| mono | boolean \| undefined | no | false | A `pageLink` whose label is a path or code: the 400 12px mono face. |
| referenceLink | boolean \| undefined | no | false | A reference-key link: an underlined monospace key in the link ink. |
| inlineIcon | boolean \| undefined | no | false | An unboxed 22px icon action. |
| themeChoice | boolean \| undefined | no | false | A theme choice pill whose `selected` state is the accent edge and a soft accent halo. |
| selected | boolean \| undefined | no | false |  |
| filterTrigger | boolean \| undefined | no | false | A bare filter-menu trigger: a muted label, a hover wash, the chevron through `iconRight`. |
| inlineLink | boolean \| undefined | no | false | Inline text action: an underlined link label with no box, read as a link, washed on hover. |
| plainLink | boolean \| undefined | no | false | A plain accent text action with no box and no underline, still read as a button: a panel's Reset, a table's show-all row. On the web a 500 13 px label in the accent text ink (12 px with `small`) that brightens to the foreground ink under the pointer; natively the platform's own tint-coloured text button. |
| foreground | boolean \| undefined | no | false | Foreground ink on an inline text action. |
| extraBold | boolean \| undefined | no | false | Extra-bold inline text action label. |
| external | boolean \| undefined | no | false | Open href in the system browser on every platform. |
| consistent | boolean \| undefined | no | false | Align a row of short workflow actions on the same minimum measure. |
| comfortable | boolean \| undefined | no | false | A roomier hit surround for a compact featured action. |
| testOnly_hovered | boolean \| undefined | no | false | Visual reference harness only; pointer hover remains the production source. |
| destructive | boolean \| undefined | no | false |  |
| outline | boolean \| undefined | no | false |  |
| ghost | boolean \| undefined | no | false |  |
| link | boolean \| undefined | no | false |  |
| small | boolean \| undefined | no | false | Size (pick one). |
| large | boolean \| undefined | no | false | Size (pick one). |
| icon | boolean \| undefined | no | false | Size (pick one). |
| compactIcon | boolean \| undefined | no | false | Compact utility icon box (28px). |
| mediumIcon | boolean \| undefined | no | false | Medium utility icon box (32px). |
| largeIcon | boolean \| undefined | no | false | Large utility icon box (34px). |
| wideIcon | boolean \| undefined | no | false | Give a compact icon box two extra pixels of horizontal room. |
| circle | boolean \| undefined | no | false | Round a utility icon box into a circle. |
| rounded | boolean \| undefined | no | false | Fully rounded ends: the control's corner becomes the pill (an `icon` square a circle). The special bodies (the links, the triggers, the utility boxes) keep their own corners; a utility box rounds with `circle`. The pill's ends sit 2 px wider at each side (18 at the default size). |
| dashed | boolean \| undefined | no | false | A dashed edge in place of the solid one: an add-a-row or drop-here affordance. It shows on the intents that draw an edge (`secondary`, `outline`); the filled, ghost and link looks have no visible edge to dash. |
| unread | boolean \| undefined | no | false | An unread mark: the accent dot inside the box's upper trailing corner, ringed in the card colour. A quieter sibling of `count` for "something new" without a number; name the state in `accessibilityLabel` (the dot is decorative). `count` wins when both are passed. |
| inset | boolean \| undefined | no | false | Quiet inset fill for a utility icon action. |
| steadyPress | boolean \| undefined | no | false | Keep the resting look while pressed (no dim, no press scale). |
| count | string \| number \| undefined | no |  | Notification count carried in the upper trailing corner. |
| block | boolean \| undefined | no | false | Layout and state. A Button is HUG (src/style/sizing.ts): it keeps its content width inside a stretching Column and sits content-sized in a Row; `block` makes it FILL (full width in a Column, an equal share in a Row), and a measure step (`sm`, `lg`, …, from MeasureProps) makes it FILL up to that width of the scale. |
| shrink | boolean \| undefined | no | false | Keep the content-sized button in a tight row, allowing its label to wrap within the available width. |
| loading | boolean \| undefined | no | false |  |
| disabled | boolean \| undefined | no | false |  |
| raised | boolean \| undefined | no | false | Lifts a primary button off the page with a soft glow in its own colour: the page's main call to action. Other intents, and a disabled button, ignore it. |
| attention | boolean \| undefined | no | false | An outward red glow for an action requiring attention. Static under Reduce Motion; hidden while disabled or loading. |
| expanded | boolean \| undefined | no | false | Marks the Button as a disclosure/menu trigger and announces its open state to assistive tech (aria-expanded, which react-native-web forwards and RN maps back to the native expanded state). Pass the live open boolean; omit for a plain button. So a Button that toggles a Dropdown/Popover stays accessible. |
| haspopup | true \| "menu" \| "dialog" \| "grid" \| "tree" \| "listbox" \| undefined | no |  | Announces that the button opens a popup of this kind (aria-haspopup), for a menu / dialog / listbox trigger. Pair it with `expanded` so assistive tech reads both the popup relationship and its open state. Web-only; a no-op natively. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: `block`, the measure steps, and the parent layout container own the width. |
| ref | React.Ref<View> | no |  | Ref to the interactive Pressable, including link buttons. Typed as a React Native View. On web, React Native Web exposes its DOM host; focus() and blur() move browser focus. Native host behavior depends on the platform and React Native version. Calling focus() does not activate the control or call accessibility focus APIs. |
| xxxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| sm | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| md | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| lg | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wide | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wider | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| widest | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| page | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| start | boolean \| undefined | no | false | Pin a capped component to the leading edge instead of centering it in its column. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
