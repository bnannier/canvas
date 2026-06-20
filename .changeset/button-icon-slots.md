---
"@olympusoss/canvas": minor
---

Button: add `iconLeft` / `iconRight` icon slots and `accessibilityLabel`

`Button` now accepts `iconLeft` and `iconRight` (ReactNode) to render an icon element
before or after the label. They render directly — not wrapped in the label `Text`, which
cannot host an SVG — spaced from the label by the button's gap. Pass `iconLeft` alone with
the `icon` size prop for an icon-only square button, and set `accessibilityLabel` (now
supported) so it reads for assistive tech. Existing buttons are unaffected (the new props
are optional).

```tsx
<Button primary iconRight={<ArrowRight size={16} color={tokens.background} />}>Browse</Button>
<Button ghost icon accessibilityLabel="Toggle menu" iconLeft={<Menu size={18} color={tokens.foreground} />} onPress={onMenu} />
```
