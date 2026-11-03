# design-sync notes (Canvas -> Claude Design)

Repo-specific facts a future sync needs. Config lives in `config.json`; this file holds what
config cannot say.

## Build

- Canvas is a React Native kit. The converter bundles with plain esbuild defaults, which
  cannot build React Native for the browser, so `web-entry.mjs` compiles `dist/` the way
  Expo's web bundler resolves it (`react-native` -> `react-native-web`, `.web.js` first,
  `__DEV__`/`EXPO_OS` defined, React external) into `.cache/web/index.mjs`, which is
  `cfg.entry`. The converter reads component types from the package's own `types` field,
  so the pre-compiled entry does not affect `.d.ts` extraction.
- `web-entry.mjs` also flattens `styles/canvas.css` (the CSS token hand-off) into
  `.cache/web/canvas.css`, which is `cfg.cssEntry`: the converter copies a cssEntry
  verbatim and does not follow its relative `@import`s.
- Full build: `bun run build && node .design-sync/web-entry.mjs` (`cfg.buildCmd`), then the
  converter with `--node-modules ./node_modules` (the repo root; no `--entry` flag needed,
  `cfg.entry` carries it).
- Fonts: `fonts.css` declares the three variable woff2 files the docs site self-hosts
  (`docs/public/fonts`, named in `docs/src/ui/web-fonts.json`). If the subsetter re-cuts
  them, the hashed file names change: update `fonts.css` to match.
- The provider is `ThemeProvider` with `fonts` set to the three family stacks; without
  `fonts` the kit paints in the system face.
- Playwright: the repo's own `playwright-core` pins chromium 1247, which is cached in
  `~/Library/Caches/ms-playwright`; nothing to install.

## Discovery

- Fork `overrides/source-kit.mjs` (declared in `cfg.libOverrides`): the group is the kit
  tier, the first `src/` segment (atoms, molecules, organisms, charts, style), and a part
  exported from its parent's file (CardTitle in card.tsx) is matched by its export. The
  bundled heuristic named groups after kebab-case component dirs. The fork imports
  `ts-morph`, so a fresh clone needs `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules`.
- `docsDir` is `src` (each component's `.md` sits beside it). The default `docs/` matched the
  docs app's generated per-version copies (`docs/public/ai/<version>/components/`), four
  per component.
- Excluded from the sync (`componentSrcMap: null`): `AnatomyPart`, `AnatomyProvider`,
  `InteractionOverride`, the docs specimen seams (src/style/public.ts says so); not app API.
- `View` is a React Native re-export (src/style/primitives.ts), pinned in `componentSrcMap`.
- Also excluded: `GlassSurface` (its `style` prop is the kit's skin style, "not a styling
  prop for an app", so a card would teach the design agent to hand-build surfaces) and
  `GlassBlurPlane`, `GlassBlurScope`, `GlassModalBlurTarget` (Android capture plumbing; a
  web card shows nothing of them). They stay on `window.Canvas`; glass mode is taught
  through `ThemeProvider glass` in the conventions header.

## Previews and capture

- `package-capture.mjs` pins the page clock (`page.clock.setFixedTime`), which freezes the
  kit's clock-driven entrances at their first frame. Reveal and RevealGroup capture blank
  there; on a real clock they settle within 1 s (verified with a scratch Playwright run,
  2 s wait). Their grades were written from those real-clock shots. A re-sync that clears
  their grades must re-verify the same way, not from the capture sheet.
- Drawer previews are real open drawers (card mode single). `embedded` "fills the parent it
  is given" and a card root has no height, so an embedded drawer paints nothing.
- Video: the docs' `/video-sample.*` files are docs-site assets that neither the bundle nor
  the project ships; the preview uses an inline SVG poster. `controls` is not previewed (the
  bar appears on interaction, so its still equals the poster cell).
- Image previews use base64 SVG data URIs (`btoa`); utf8 data URIs rendered blank.
- Uncontrolled components need their default-state prop to show a selection
  (`defaultActive`, `defaultChecked`, `defaultValue`); Dropdown's open state is the
  controlled `open` prop.
- Single-key Kbd, Dropdown and Tooltip triggers stretch to full width in a Column: wrap them
  in a Row (or `Column alignCenter`) in previews.
- States that cannot render statically and are shown at rest instead: ToastProvider (toasts
  appear on press; Toast's own previews carry the look), StackedList reordering, Video
  controls, OverlayProvider's hosted tooltip.
- Card parts (CardTitle, CardHeader, ...) and other parts (BreadcrumbItem, GridItem,
  RadioGroup, ChatMessage) are previewed as their full parent composition.

## Kit observations (component behavior seen while previewing, not sync defects)

- AvatarGroup `small` (the docs' own example): the initials crowd under the overlap.
- Stats `Plain`: the title sits flush left with no inset.
- GridList `cols2` with four tiles draws narrow, widely spaced tiles.
- RadialBarChart `Detailed`: the legend stretches full width.
- The bare `TextInput` primitive draws no field box (expected; `Input` is the field).

## Re-sync risks

- `fonts.css` names the docs' hashed woff2 files; a re-subset renames them and the build
  then prints `! extraFonts` / `[FONT_DANGLING]`.
- `web-entry.mjs` mirrors Expo's web resolution by hand (alias, `.web.js` first, defines).
  A new native peer with a different web entry convention needs a line there.
- The `source-kit.mjs` fork tracks the bundled converter's copy: diff it on every re-sync.
- Reveal/RevealGroup grades are verified outside the capture harness (see above).
- Preview data for charts is inline literal data; it does not track docs changes.

## Known render warns (expected, non-blocking)

- Drawer `[RENDER_THIN]`: an open drawer paints through a portal outside the card root in
  `single` mode, so the root measures thin; the graded shots show the panel.

## Validator patch

- `validate-roots.patch` changes `package-validate.mjs`'s root query to
  `#root, [id^="r"]:not(style):not(script)`: React Native Web injects
  `<style id="react-native-stylesheet">`, which the stock `[id^="r"]` matched, reporting
  every card "root empty". Re-apply it after every fresh copy of the scripts into
  `.ds-sync/` (`patch -d .ds-sync -p1 < .design-sync/validate-roots.patch`, or edit
  the one line by hand), and check `grep -c "not(style)" .ds-sync/package-validate.mjs` is 1.

## Conventions header

- `conventions.md` (`cfg.readmeHeader`) is stitched into the uploaded README. Every prop it
  names was checked against the built `.d.ts` files; re-check after an API rename.
