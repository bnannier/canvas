# Theming and semantic props

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 86ef0dd5d9d38fae6d7bc8bc3fe6497bee4796a18ec156364a14f4fae6008b14

Wrap the application in `ThemeProvider`. Use flat boolean styling props; choose at most one prop per visual axis, such as `primary`, `large`, and `loading`.

The default accent is violet. The `cyan`, `mint`, `rose`, and `amber` palettes apply in both light and dark schemes. Omitted scheme follows the OS; omitted surface selects the platform default. Material capability and accessibility preferences can select a solid fallback.

```tsx
import { ThemeProvider, OverlayProvider, Button } from "@nannier/canvas";

export default function App() {
  return <ThemeProvider dark rose><OverlayProvider><Button primary large>Save</Button></OverlayProvider></ThemeProvider>;
}
```

### ThemeProviderProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| dark | boolean \| undefined | no | false | Force the dark color scheme. |
| light | boolean \| undefined | no | false | Force the light color scheme. |
| scheme | ColorScheme \| undefined | no |  | Legacy value form of the scheme axis ("light" \| "dark"), kept for back-compat and for config-driven code that already holds a `ColorScheme` value (a stored preference, an <html> hook). The boolean axis above wins when both are passed. |
| ssrScheme | ColorScheme \| undefined | no |  | The scheme the SERVER rendered, for SSR/SSG apps (Next.js and the like) whose client scheme can differ from it (a stored preference, the OS). Canvas resolves colors in JS and serializes them into the server HTML as literal inline styles, so when the hydration render disagrees with that HTML, React logs a mismatch and keeps the server's colors on any element that never re-renders again: components stay stuck in the server's scheme. With `ssrScheme` set, the provider renders it on the server AND for the hydration render (matching the server HTML exactly), then applies the requested scheme (the boolean axis or the legacy `scheme` prop) right after mount; that switch re-renders every consumer, which writes the real colors to the DOM. Pass the same value the server resolves (e.g. the next-themes `defaultTheme`). Omit in client-only apps and on native. |
| violet | boolean \| undefined | no | false | Paint the accent violet (hue 285), the default. |
| cyan | boolean \| undefined | no | false | Paint the accent cyan (hue 205). |
| mint | boolean \| undefined | no | false | Paint the accent mint (hue 165). |
| rose | boolean \| undefined | no | false | Paint the accent rose (hue 20). |
| amber | boolean \| undefined | no | false | Paint the accent amber (hue 75). |
| ssrPalette | Palette \| undefined | no |  | The palette the SERVER rendered, for SSR/SSG apps whose client palette can differ from it (a stored preference: `getPalette()` reads one on the web). The `ssrScheme` contract applied to the palette axis: the server render and the hydration render paint this palette, matching the server HTML exactly, and the requested one (`cyan`, `mint` and so on) applies right after mount. Omit in client-only apps and on native. |
| ssrBreakpoint | BreakpointKey \| "base" \| undefined | no |  | The breakpoint bucket the SERVER should assume, for SSR/SSG apps (the `ssrScheme` contract applied to the viewport axis). The server cannot measure a window, so `useBreakpoint`/`useResponsive`/`useFormFactor` resolve to the desktop `base` there by default; an app that knows it is serving a narrow client (UA hints) passes the bucket the server should render instead (e.g. "sm" for phones). The server render and the hydration render use it, then the real measured bucket re-renders every consumer right after hydration. Omit in client-only apps and on native. |
| glass | boolean \| undefined | no | false | Request role-appropriate glass: stable content material and functional Liquid Glass where supported. Semantic tokens remain opaque. |
| solid | boolean \| undefined | no | false | Request complete opaque surfaces without glass effects, even on iOS 26+. |
| surface | Surface \| undefined | no |  | Legacy value form of the surface axis ("solid" \| "glass"), kept for back-compat and for config-driven code that already holds a `Surface` value. The boolean axis above wins when both are passed. |
| tokens | ThemeTokenOverrides \| undefined | no |  | Brand token overrides, merged over the active palette's base tokens so a consumer can rebrand the kit (e.g. `tokens={{ primary: "#7c3aed" }}`) without forking the token files. Pass a flat `Partial<ColorTokens>` to apply the same overrides to both schemes, or `{ light, dark }` to override each scheme separately. These are the SEMANTIC tokens only; the glass material carries its own fill (`glassByScheme`) and is never rewritten by a rebrand, so the two are independent. Pass a stable reference (a module constant or a memoized object); an inline literal re-creates the theme value on every render. Unlike `fonts`, a nested ThemeProvider does not inherit a parent's `tokens`: a nested provider is how a subtree shows its own palette or brand, so it paints its palette unbranded unless it is given overrides of its own. Pass the same constant again to carry a rebrand into a nested provider. |
| fonts | ThemeFonts \| undefined | no |  | The typefaces the app registered, so the kit can paint its labels in the brand faces (`typeface.sans` is Instrument Sans, `typeface.display` Bricolage Grotesque, `typeface.mono` JetBrains Mono). Each entry is either one family name that carries every weight (a variable font, an OS-installed family) or a map from weight to the face registered for that weight (expo-google-fonts style: `{ "400": "InstrumentSans_400Regular", "500": "InstrumentSans_500Medium" }`). Pass it once, on the app's root provider: the faces are what the app loaded, not a per-subtree choice, so a nested ThemeProvider that omits `fonts` keeps the nearest parent provider's, and one that passes it uses its own map in place of the parent's (the roles are not merged; a stable empty map, `{}`, returns that subtree to the system face). Omit it on the root and the kit renders in the platform's system face, as it always has. Pass a stable reference (a module constant); an inline literal re-creates the theme value on every render. |
| children | ReactNode | yes |  |  |
