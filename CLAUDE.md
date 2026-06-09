# Canvas

Canvas is a React Native UI kit, published as `@olympusoss/canvas`. It runs
universally: native on iOS and Android, and on the web through React Native Web.

## Highly responsive

Canvas is highly responsive by default. Every component must adapt cleanly across
the full range of viewport sizes, from large desktop down to phone.
Responsiveness is a core requirement of every component, not an optional add-on.

Author desktop-first: lay out and size each component for the desktop case first,
then add the responsive variants that scale it down to tablet and phone. This is
the inverse of mobile-first.

## Semantic prop styling

Semantic prop styling is the way to change a component's style, and Canvas does it
with flat boolean props. Each style choice is its own prop, named for the meaning
it carries; passing the prop turns it on. The prop name is the value.

Do this:

```jsx
<Button primary large>Save</Button>
<Button destructive>Delete</Button>
<Button ghost small>Cancel</Button>
<Card raised>...</Card>
```

Not this:

```jsx
<Button variant="primary" size="lg">Save</Button>
<Button tone="destructive">Delete</Button>
<Card elevation="raised">...</Card>
```

The boolean form reads like natural language ("a primary, large button") and is
the only accepted styling API. String-valued enum props (`variant="..."`,
`size="lg"`, `tone="..."`, `elevation="..."`) are rejected: do not add them and do
not document them.

### Axes

Style props are grouped into axes. Props on different axes are orthogonal and
combine freely; props within one axis are mutually exclusive, and you pass at most
one:

- Intent: `primary`, `secondary`, `destructive`, `ghost`, `outline`, `link`
  (pass none for the default look).
- Size: `small`, `large` (pass none for the default, medium size).
- Density: `compact`, `comfortable` (omit for the default density).
- State and layout, orthogonal booleans that stack: `loading`, `disabled`,
  `block` (full width), `rounded`, and the like.

So `<Button primary large loading block>` is four props drawn from four axes, all
applied together.

Glass is NOT a per-component axis: it is a theming-level surface mode, like the
light/dark scheme. Turn it on with the engine `ThemeProvider`'s `surface="glass"`
prop (or `setSurface("glass")` on the web), which swaps the card and popover
tokens to translucent so every surface component reads as glass at once. Do not
add a per-component `glass` prop.

### Conflicts

Any boolean can be passed, so an axis may receive more than one (for example
`<Button primary ghost>`). Each component defines a fixed precedence order per
axis and resolves to the single highest-precedence prop that is set; it never
stacks two intents or two sizes. Document that precedence in the component's entry,
and prefer not to pass conflicting props at the call site.

### Resolution

Each boolean maps to a curated internal set of Tailwind utility classes (the
component's implementation). Canvas reads the active booleans, applies the axis
and precedence rules above, and produces the final utility set. Components consume
these props internally; they do not forward unknown style props to the underlying
host element, and consumers never assemble utility soup or pass raw style overrides
to restyle a component.

Every visual variation a component supports must be exposed as a boolean prop on
one of these axes.
