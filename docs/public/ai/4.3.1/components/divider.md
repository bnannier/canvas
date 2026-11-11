# Divider

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 675fbe581e8b4ad6486d40d1b26a76d0ab3c2910cab444fa77edd63dd809f77b

Source: `src/atoms/divider/divider.md`
Human reference: https://canvas.nannier.com/components/divider

## Public imports

```tsx
import { Divider } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Horizontal, vertical, with label, with action.

## Usage

A divider spans the width of its parent, so give it a bounded container.

```tsx
<Column>
  <Typography>Profile</Typography>
  <Divider />
  <Typography>Account</Typography>
</Column>
```

## Variants

### Vertical

```tsx
<Row>
  <Typography>Edit</Typography>
  <Divider vertical />
  <Typography>Delete</Typography>
</Row>
```

### Inset

A vertical rule of its own short length, centred in its row with a little space on each
side: the separator between groups in a toolbar or a floating bar, where a rule the row's
full height would read as a wall.

```tsx
<Row alignCenter flush>
  <Button ghost small>Bold</Button>
  <Button ghost small>Italic</Button>
  <Divider vertical inset />
  <Button ghost small>Link</Button>
</Row>
```

### Emphasis

The hairline by default; `strong` for a firmer line, `soft` for a quieter one.

```tsx
<Column snug>
  <Divider soft />
  <Divider />
  <Divider strong />
</Column>
```

### Label

```tsx
<Divider>Or continue with</Divider>
```

### Action

```tsx
<Divider>
  <Button ghost small>Show more</Button>
</Divider>
```

## Do & Don't

### Plain

**Do** — Click a row: group with spacing and reserve a divider for a real break like Sign out.

```tsx
<Column tight>
  <Typography small>Profile</Typography>
  <Typography small>Account</Typography>
  <Typography small>Notifications</Typography>
  <Divider />
  <Typography small>Sign out</Typography>
</Column>
```

**Don't** — Click a row: a divider between every one is noise that competes with the content.

```tsx
<View>
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Profile</Text>
  <Divider />
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Account</Text>
  <Divider />
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Notifications</Text>
  <Divider />
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Billing</Text>
</View>
```

### With label

**Do** — Click a provider: keep the label to a few words and let the buttons carry the options.

```tsx
<Column snug>
  <Button primary block>Sign in</Button>
  <Divider>or continue with</Divider>
  <Row snug>
    <Column fill>
      <Button outline block>Google</Button>
    </Column>
    <Column fill>
      <Button outline block>GitHub</Button>
    </Column>
  </Row>
</Column>
```

**Don't** — Click Sign in: a full sentence in the label divider buries the choice.

```tsx
<View style={{ width: 320, maxWidth: "100%", flexDirection: "column", gap: 8 }}>
  <Button primary block>Sign in</Button>
  <Divider>or continue with one of your previously linked third-party accounts</Divider>
</View>
```

### With action

**Do** — Click Show more: the button toggles its label and reveals the rest.

```tsx
<Column snug>
  <Typography small muted>Logged in from 2 new devices · 3 more entries</Typography>
  <Divider>
    <Button ghost small>Show less</Button>
  </Divider>
</Column>
```

**Don't** — Click the button: an action divider that does nothing is just decoration.

```tsx
<Divider>
  <Button ghost small>Show more</Button>
</Divider>
```

### Vertical

**Do** — Click an action: the vertical rule separates inline actions in a row.

```tsx
<Row alignCenter cozy>
  <Typography small>Edit</Typography>
  <Divider vertical inset />
  <Typography small>Delete</Typography>
  <Divider vertical inset />
  <Typography small>Share</Typography>
</Row>
```

**Don't** — Click an action: a vertical rule between stacked items reads as a glitch.

```tsx
<View style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20 }}>Edit</Text>
  <Divider vertical inset />
  <Text style={{ fontSize: 14, lineHeight: 20 }}>Delete</Text>
</View>
```

## Supported props

### DividerProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  | Optional middle content. With children, a horizontal divider renders a flanking-line + centered-label row (the "with label" / "with action" patterns). A string renders as the uppercase mono caption label; arbitrary nodes (e.g. a button) render as-is for the action pattern. Ignored when `vertical`. |
| horizontal | boolean \| undefined | no | false | Orientation (pick one; default is horizontal). |
| vertical | boolean \| undefined | no | false | Orientation (pick one; default is horizontal). |
| soft | boolean \| undefined | no | false | A quieter rule: the hairline at 60% of its strength. |
| strong | boolean \| undefined | no | false | A firmer rule: the `field-border` line, twice the hairline's strength. |
| inset | boolean \| undefined | no | false | Vertical only: a short rule (18 px) centred in its row with 4 px kept on each side, instead of a rule that stretches to the row's height. The separator between groups in a toolbar or a floating bar. A horizontal divider ignores it. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
