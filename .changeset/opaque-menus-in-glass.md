---
"@nannier/canvas": minor
---

Menus are opaque cards in glass mode, and glass stops rewriting a semantic token.

Glass used to work by overriding one semantic token: `popover` became translucent, and since `GlassSurface` takes its under-fill from that token and `AnchoredOverlay` renders every anchored card through it, every option-list menu in the kit inherited the translucency. Measured on a rendered page, a menu painted `rgba(255, 255, 255, 0.72)` over an SVG lens that deliberately keeps its centre optically flat, so the page behind read straight through between the rows. The design hand-off never did this: its `--popover` is opaque in both schemes, and glass paints from a separate `--glass-tint`.

So the material now carries its own fill. `glassByScheme` publishes `glass-tint` (`rgba(255, 255, 255, 0.20)` light, `rgba(22, 22, 28, 0.30)` dark, both read from `styles/tokens/colors.css` and cross-checked by `validate-tokens` so the two layers cannot drift), `GlassSurface` defaults its under-fill to that instead of to `popover`, and `popover` and `card` keep their opaque values in every mode. The shipped CSS matches: the `[data-surface="glass"]` popover swap in `styles/tokens/surface.css` is gone, which also means the reduced-transparency and increased-contrast fallbacks genuinely turn the material off now, where before they resolved back to the translucent value.

Which surfaces take the material follows the hand-off. Popovers, dialogs, action sheets, the command palette, navbars, tab bars and the sidebar are glass. The option-list menus (Dropdown, Select, Autocomplete, AvatarMenu, SplitButton's overflow menu), alert dialogs, toasts and chart tooltips are opaque cards, because a surface a reader picks rows from has to stay legible over whatever is behind it. Content surfaces stay solid as before.

Breaking for one caller shape, which is why this is a minor rather than a patch: `glassByScheme` changed from `Record<ColorScheme, Partial<ColorTokens>>` to a `GlassTokens` family, so code reading `glassByScheme.light.popover` should read the opaque `colorsByScheme.light.popover` instead. The internal `ToastSkin.solidSurface` flag was removed, which is a skin field rather than a component prop.
