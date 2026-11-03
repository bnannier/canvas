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
