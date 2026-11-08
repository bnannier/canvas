# CodeBlock

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: cad8362f307ce0e914f64529ae9e6f6167ae84ffa078073eb1d3746d89c2808b

Source: `src/molecules/code-block/code-block.md`
Human reference: https://canvas.nannier.com/components/code-block

## Public imports

```tsx
import { CodeBlock } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Syntax-highlighted code display with clipboard copy, horizontal scrolling, line
emphasis, diff rendering, collapsible folding, and tabbed alternatives.

The variant axis picks the surface (`transcript` > `terminal` > `numbered` > `inline` > plain,
first match wins); the density axis is `compact` (the tightened ramp), `playground`
(the hand-off component page's JSX card: the block at the card corner, its header a 40
px bar on the card fill, 16 in and 8 out, its Copy a 28 px hairline button, and the code
16 above and below and 18 in at the default ramp), `snippet` (the page's own snippet, the
Usage section's block: the code-card corner with the code 16 above and below and 18 in
at the default ramp) or `guide` (a card's snippet, the block in a guidance card: a 10 px
corner with the code 12 above and below and 14 in at 12 / 1.65), in that order of
precedence; `copy`, `wrap`, `diff`,
`collapsible`, `attached`, `headerless`, and `unbadged` stack orthogonally. `language`
drives the in-kit highlighter (ts/tsx/js/jsx, json, bash, css, html, python; anything
else renders monochrome) and, with no `filename`, labels a header bar above the code;
with a `filename` it is a trailing badge beside the copy chip instead, which `unbadged`
drops for a filename that already names the language (the hand-off's playground bar,
"JSX · ButtonProps" and a Copy button only). `headerless` keeps the highlighting and
drops the whole bar (a `tabs` strip and the terminal chrome stay), so `copy` floats
over the code's corner. Long lines scroll horizontally instead of truncating, and
every run of code, highlighted tokens included, is set in the theme's mono face.

The block is the v4 hand-off's code card on every platform: the sunken well on a
hairline at a 14 px corner, a 36 px header of 12 px mono labels, 13 / 1.7 code, line
numbers in the subtle ink, and the hand-off's code inks (each light-scheme ink held
to 4.5:1 on the well). A ts or js snippet takes the hand-off's CodeBlock renderer:
keywords, strings, numbers and tag names in the accent, mint, amber and cyan. A tsx
or jsx snippet takes the hand-off's component-page highlighter, which paints four
things and nothing else: a Capitalised tag name in the accent (the brackets and slash
neutral), an attribute name before its `=` in cyan, a string literal in mint and a
comment in the subtle ink; a bare boolean attribute, a keyword, a number and the
children text stay in the code ink, so `<Button>Save changes</Button>` reads as one
label after one accent name. The terminal is a fixed dark window in every scheme.

`inline` honours `copy` alone of the orthogonal booleans: `<CodeBlock inline copy>`
is the import chip, a raised monospace pill (34 tall, the control corner, the
`popover` fill and `field-border` hairline, 12 px mono in `muted-foreground`)
whose whole surface is one copy button, with a trailing copy glyph that turns to
a check for a moment once the code is on the clipboard. The chip copies the code
verbatim, announces itself as "Copy" followed by the code, sets the code in one
ink (no syntax colours), and on the web its hairline turns to the accent under the
pointer. Under glass it is a control-layer pane.

When a line is wider than the block, Tab reaches the scrollable code and the
platform's arrow keys scroll it; while it has keyboard focus, the block's card
draws the theme's focus ring. Short content, `wrap`, and `inline` do not add
a scrolling tab stop. Native scrolling continues to use the native ScrollView.

## Usage

```tsx
<CodeBlock
  language="ts"
  code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`}
/>
```

## Variants

### Execution transcript

`transcript` renders raw execution output as selectable, soft-wrapped monospace text
in the active theme's foreground. Tabs, newlines and prompt markers remain verbatim.
It has no window chrome, card fill, border, syntax highlighting or expander.
It takes precedence over the other variants and ignores the display modifiers,
including `copy`, `diff` and `collapsible`; density still controls the type size.

```tsx
<CodeBlock transcript code={"$ bun test\nRan 42 tests across 6 files.\n42 pass, 0 fail"} />
```

### Syntax highlighting

```tsx
<CodeBlock
  language="tsx"
  code={`export function Hello({ name }: { name: string }) {
  // Greet the current user
  return <Badge primary>Hi {name}</Badge>;
}`}
/>
```

### Terminal

```tsx
<CodeBlock
  terminal
  code={`$ npm install @nannier/canvas
added 42 packages in 3s`}
/>
```

### Numbered

```tsx
<CodeBlock
  numbered
  language="ts"
  code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`}
/>
```

### Inline

```tsx
<CodeBlock inline language="bash" code="npm install" />
```

### Inline copy

```tsx
<CodeBlock inline copy code={`import { Button } from "@nannier/canvas"`} />
```

### Compact

```tsx
<CodeBlock
  compact
  language="json"
  code={`{
  "theme": "system",
  "surface": "glass",
  "primary": "#6366f1"
}`}
/>
```

### Copy button

```tsx
<CodeBlock
  copy
  language="ts"
  code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`}
/>
```

### Wrap long lines

```tsx
<CodeBlock
  wrap
  language="ts"
  code={`const message = "This is a very long line that would normally scroll horizontally, but wrap lets it soft-wrap onto the next line instead.";`}
/>
```

### Terminal label

```tsx
<CodeBlock
  terminal
  filename="deploy.sh"
  code={`$ ./deploy.sh --stage production
Build complete in 12s`}
/>
```

### Highlight lines

```tsx
<CodeBlock
  numbered
  language="tsx"
  highlightLines={["2-3"]}
  code={`export function Cta() {
  const label = getLabel();
  return <Button primary large>{label}</Button>;
}`}
/>
```

### Excerpt

```tsx
<CodeBlock
  numbered
  startLine={128}
  language="ts"
  code={`function resolveTokens(scheme: Scheme) {
  return scheme === "dark" ? darkTokens : lightTokens;
}`}
/>
```

### Diff

```tsx
<CodeBlock
  diff
  language="ts"
  code={`-const theme = "light";
+const theme = getTheme();
 setTheme(theme);`}
/>
```

### Collapsible

```tsx
<CodeBlock
  collapsible
  collapsedLines={3}
  language="ts"
  code={`export const tokens = {
  primary: "#6366f1",
  radius: 8,
  border: "#e4e4e7",
  muted: "#f4f4f5",
};`}
/>
```

### Tabs

```tsx
<CodeBlock
  tabs={[
    { label: "npm", code: "npm install @nannier/canvas" },
    { label: "yarn", code: "yarn add @nannier/canvas" },
    { label: "bun", code: "bun add @nannier/canvas" },
  ]}
/>
```

### Headerless

```tsx
<CodeBlock
  headerless
  copy
  language="tsx"
  code={`<Button primary>Save changes</Button>`}
/>
```

### Unbadged

```tsx
<CodeBlock
  unbadged
  copy
  filename="JSX · ButtonProps"
  language="tsx"
  code={`<Button outline small iconLeft={<Icon plus />}>Add item</Button>`}
/>
```

### Playground card

```tsx
<CodeBlock
  playground
  unbadged
  copy
  filename="JSX · ButtonProps"
  language="tsx"
  code={`<Button>Save changes</Button>`}
/>
```

### Page snippet

```tsx
<CodeBlock snippet headerless language="tsx" code={`<Button>Save changes</Button>`} />
```

### Guide snippet

```tsx
<CodeBlock
  guide
  headerless
  language="tsx"
  code={`<Row alignCenter cozy>
  <Button link href="/pricing">Pricing</Button>
</Row>`}
/>
```

## Do & Don't

### Plain

**Do** — Use CodeBlock so whitespace, line breaks, and indentation survive verbatim.

```tsx
<CodeBlock code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`} />
```

**Don't** — A paragraph collapses the line breaks and indentation, so multi-line code reads as one run-on string.

```tsx
<Text style={{ fontSize: 13, fontFamily: "monospace" }}>const theme = getTheme(); setTheme(theme === "dark" ? "light" : "dark");</Text>
```

### Terminal

**Do** — Use the terminal variant: the prompt stays out of the selection, so a copy yields only the command, not the shell glyph.

```tsx
<CodeBlock terminal code="npm install @nannier/canvas" />
```

**Don't** — Selectable prompt text means a reader who copies the line drags the $ marker into their shell.

```tsx
<View style={{ width: "100%", alignSelf: "flex-start", borderRadius: 8, backgroundColor: palette["zinc-900"], padding: 16 }}>
  <Text style={{ fontSize: 13, color: palette["zinc-100"], fontFamily: "monospace" }}>$ npm install @nannier/canvas</Text>
</View>
```

### Numbered

**Do** — Use the numbered variant: the gutter stays out of the selection, so copying the block returns clean, runnable code.

```tsx
<CodeBlock numbered code={`const theme = getTheme();
setTheme(theme);`} />
```

**Don't** — Selectable line numbers get swept into the selection and pasted as 1 2 ahead of every line.

```tsx
<View style={{ width: "100%", alignSelf: "flex-start", flexDirection: "row", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: alpha(tokens.muted, 0.5), padding: 16 }}>
  <View style={{ marginRight: 16, alignItems: "flex-end" }}>
    <Text style={{ fontSize: 14, lineHeight: 28, color: alpha(tokens["muted-foreground"], 0.5), fontFamily: "monospace" }}>1</Text>
    <Text style={{ fontSize: 14, lineHeight: 28, color: alpha(tokens["muted-foreground"], 0.5), fontFamily: "monospace" }}>2</Text>
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <Text style={{ fontSize: 14, lineHeight: 28, color: tokens.foreground, fontFamily: "monospace" }}>const theme = getTheme();</Text>
    <Text style={{ fontSize: 14, lineHeight: 28, color: tokens.foreground, fontFamily: "monospace" }}>setTheme(theme);</Text>
  </View>
</View>
```

### Diff

**Do** — Use diff mode: markers stay out of the selection and the copy chip yields the post-change code.

```tsx
<CodeBlock diff copy language="ts" code={`-const theme = "light";
+const theme = getTheme();
 setTheme(theme);`} />
```

**Don't** — Hand-colored +/- rows leave the markers selectable, so a copied block pastes broken code.

```tsx
<View style={{ width: "100%", alignSelf: "flex-start", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: alpha(tokens.muted, 0.5), padding: 16 }}>
  <Text style={{ fontSize: 14, lineHeight: 28, color: palette["red-700"], fontFamily: "monospace" }}>-const theme = "light";</Text>
  <Text style={{ fontSize: 14, lineHeight: 28, color: palette["green-700"], fontFamily: "monospace" }}>+const theme = getTheme();</Text>
  <Text style={{ fontSize: 14, lineHeight: 28, color: tokens.foreground, fontFamily: "monospace" }}>setTheme(theme);</Text>
</View>
```

### Tabs

**Do** — One tabbed block keeps the package-manager alternatives in one place; the reader picks once.

```tsx
<CodeBlock terminal tabs={[
  { label: "npm", code: "npm install @nannier/canvas" },
  { label: "bun", code: "bun add @nannier/canvas" },
]} />
```

**Don't** — Stacked one-per-manager blocks repeat the same install three times and triple the page height.

```tsx
<Column snug>
  <CodeBlock terminal code="npm install @nannier/canvas" />
  <CodeBlock terminal code="yarn add @nannier/canvas" />
  <CodeBlock terminal code="bun add @nannier/canvas" />
</Column>
```

### Inline

**Do** — Reserve inline code for short tokens; move anything multi-line into a block.

```tsx
<Column snug>
  <Typography body>Run the setup command:</Typography>
  <CodeBlock code={`npm install @nannier/canvas
npm run build`} />
</Column>
```

**Don't** — A long, multi-step command crammed inline wraps mid-token and offers no horizontal scroll.

```tsx
<View style={{ maxWidth: 360, flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
  <Text style={{ fontSize: 14, lineHeight: 28, color: tokens.foreground }}>Run </Text>
  <View style={{ alignSelf: "flex-start", borderRadius: 4, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.muted, paddingHorizontal: 6, paddingVertical: 2 }}>
    <Text style={{ fontSize: 13, color: tokens.foreground, fontFamily: "monospace" }}>npm install @nannier/canvas && npm run build && npm run preview</Text>
  </View>
  <Text style={{ fontSize: 14, lineHeight: 28, color: tokens.foreground }}> to start.</Text>
</View>
```

## Supported props

### CodeBlockProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| code | string \| undefined | no |  | The code to render. Newlines are preserved (RN Text honors "\n"). |
| filename | string \| undefined | no |  | Optional filename label shown in a header bar above the surface. Honored by the plain and numbered variants (and the terminal chrome label); the inline pill has no header. When both are set, `filename` takes the header label and `language` renders as a trailing badge. |
| language | string \| undefined | no |  | The snippet's language. Drives syntax highlighting (ts/tsx/js/jsx, json, bash/sh, css, html, python — anything else renders monochrome) and the header/terminal label when no `filename` is given. |
| transcript | boolean \| undefined | no | false | Bare execution output: selectable, wrapped monochrome text with no card, header or expander. Takes precedence over terminal, numbered and inline; other display modifiers are ignored. |
| terminal | boolean \| undefined | no | false |  |
| numbered | boolean \| undefined | no | false |  |
| inline | boolean \| undefined | no | false |  |
| compact | boolean \| undefined | no | false | Density (pick one; default is the comfortable ramp). |
| playground | boolean \| undefined | no | false | The hand-off component page's JSX card (Component.dc.html lines 171 to 174, the playground's output): the block at the card corner, its header a 40 px bar on the card fill, 16 in and 8 out, with its Copy a 28 px hairline button, and the code 16 above and below, 18 in, at the default 13 / 1.7 ramp. `compact` wins when both are passed. |
| snippet | boolean \| undefined | no | false | The hand-off component page's own snippet (Component.dc.html line 283, the Usage section's block under its paragraph): the code-card corner, with the code 16 above and below and 18 in at the default 13 / 1.7 ramp. `compact` and `playground` win over it. |
| guide | boolean \| undefined | no | false | The hand-off component page's card snippet (Component.dc.html line 288, the block in a Usage guidance card): the card-snippet corner, with the code 12 above and below and 14 in at 12 / 1.65. Every other density wins over it. |
| copy | boolean \| undefined | no | false | Show a copy affordance (header-hosted when a header/chrome exists, else pinned top-right). On the `inline` variant the whole pill becomes the copy button: a raised mono chip with a trailing copy glyph that turns to a check once copied (an import line a reader takes away). |
| wrap | boolean \| undefined | no | false | Soft-wrap long lines instead of scrolling them horizontally. An overflowing unwrapped block is a keyboard tab stop; arrow keys use the platform's normal scrolling. |
| diff | boolean \| undefined | no | false | Render the code as a unified diff: the first column of every line is the marker ("+" added, "-" removed, anything else context). Added/removed rows tint green/red, markers stay out of the selection, and the copy chip yields the post-change code (context + added lines, markers stripped). |
| attached | boolean \| undefined | no | false | Square the top edge (no top radius/border) to sit flush under an adjoining bar. |
| headerless | boolean \| undefined | no | false | Draw no header bar: `language` still drives the highlighting, but neither it nor a `filename` labels the block, and `copy` floats over the code's top-right corner. For a snippet whose context already names it (a docs page's usage block). Plain and numbered variants; a `tabs` strip still needs its header, and the terminal keeps its chrome. |
| unbadged | boolean \| undefined | no | false | Keep the header bar but draw no trailing language badge beside the copy chip: `language` still drives the highlighting, for a header whose `filename` already names the language (the hand-off's playground bar, Component.dc.html lines 171 to 174, is "JSX · <Interface>" and a Copy button only). Nothing changes when there is no `filename`, since the language is then the header's label, not a badge. |
| highlightLines | readonly (string \| number)[] \| undefined | no |  | Emphasize lines: entries are 1-based line numbers or "start-end" ranges (e.g. `[2, "5-7"]`). Numbers refer to the displayed numbering, so they respect `startLine`. Plain and numbered variants only. |
| startLine | number \| undefined | no | 1 | First displayed line number for the numbered variant (default 1). |
| collapsible | boolean \| undefined | no | false | Fold long blocks behind a "Show all" expander (plain + numbered variants). |
| collapsedLines | number \| undefined | no | 8 | How many lines a collapsed block shows (default 8). |
| expanded | boolean \| undefined | no | false | Controlled expanded state for `collapsible`. |
| defaultExpanded | boolean \| undefined | no | false | Uncontrolled initial expanded state (default false). |
| onExpandedChange | ((expanded: boolean) => void) \| undefined | no |  | Called when the expander toggles (fires in both modes). |
| tabs | readonly CodeBlockTab[] \| undefined | no |  | Labeled code alternatives rendered as a tab strip in the header (or the terminal chrome) — the classic npm/yarn/bun switcher. Each tab supplies its own code and optional language/filename. |
| active | number \| undefined | no |  | Controlled active tab index. |
| defaultActive | number \| undefined | no |  | Uncontrolled initial tab index (default 0). |
| onTabChange | ((index: number) => void) \| undefined | no |  | Called with the next tab index when a tab is selected (fires in both modes). |
| prompt | string \| undefined | no | "$" | The terminal prompt marker (default "$"). Lines starting with it render as commands. |
| onCopy | ((code: string, event: GestureResponderEvent) => void) \| undefined | no |  | Called when the copy affordance is pressed, with the copied text. The chip also writes the clipboard itself (navigator.clipboard on web, the optional expo-clipboard peer on native), so this is for side effects, not plumbing. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
