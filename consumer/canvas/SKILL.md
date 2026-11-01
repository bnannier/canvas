---
name: canvas
description: Build or fix application UI with @nannier/canvas when the user chooses Canvas or the app already uses it. Covers its shared React Native API on web, iOS, and Android; not library contributor work or migration from another chosen UI library.
---

# Canvas application UI

Use the published `@nannier/canvas` package to implement the requested app behavior with one component API for React Native and React Native Web. Preserve the user's library choice, application structure, package manager, and target platforms. This skill does not authorize replacing another UI library, changing Canvas itself, or publishing anything.

## Resolve the actual API

Read the app manifest and lockfile first. Determine the installed Canvas version; keep an explicitly requested version. Check imports, prop names, callback signatures, and state ownership before writing a component. Canvas is not a collection of shadcn, Radix, or HTML components: familiar names do not imply their APIs.

Find focused documentation through [the machine-readable index](https://canvas.nannier.com/llms.txt), then use versioned resources under `https://canvas.nannier.com/ai/<version>/`:

- `manifest.json` and `catalog.json` identify package/version, source provenance, component exports and props, and peers.
- `installation.md`, `theming.md`, `layout.md`, and `overlays.md` explain the relevant setup or composition contract.
- `components/<slug>.md` documents an individual component.

When the installed release includes the `canvas` CLI, use `npx --no-install canvas docs --list`, `npx --no-install canvas docs button`, or `npx --no-install canvas docs button --json` for local lookups. `npx --no-install canvas doctor --json` reports installed-package and required-peer checks. Use the project's equivalent package-manager command when appropriate. The packaged documents live under `node_modules/@nannier/canvas/docs/public/ai/<version>/`; locate the actual installed directory if dependencies are hoisted.

Read only the pages relevant to the task. A `source-snapshot` is documentation generated from a checkout; matching version text alone does not prove that checkout is the npm release. Older releases may lack both the CLI and packaged documents. If a page is unavailable, stale, or disagrees with the installed package, inspect the installed package's `package.json`, its `types` entry and the referenced `.d.ts` files. Resolve exports through the public entry point; do not import internal files merely because you inspected them. Report material documentation disagreements. Do not guess props, hide type errors with casts, or patch dependencies to make an example compile.

## Set up the app

- Wrap the app in `ThemeProvider`. Scheme (`light`, `dark`), palette (`cyan`, `mint`, `rose`, `amber`; violet by default), and material (`solid`, `glass`) are provider choices. Omit scheme to follow the OS. Use registered fonts via the provider's `fonts` API only when needed; system fonts work without a font-loading dependency.
- Keep the existing Expo or React Native setup. Web needs React Native Web and React DOM; native resolves the package's native entry automatically. Keep CSS imports in a web entry or platform-specific setup module so native never imports CSS. Confirm the appropriate stylesheet path from the installed package and installation guide.
- For app overlays, mount `OverlayProvider` inside `ThemeProvider`, outside scrolling content, filling the app window. An unhosted overlay can render inline. A provider inside a short content-sized panel cannot provide full-screen bounds.
- Read required peers and `peerDependenciesMeta` from the installed package. Use Expo-compatible versions in an Expo app. Install optional peers only for capabilities the app needs; do not install all optional native modules by default. If a peer is intentionally absent, exercise the actual component's documented fallback. A successful import alone does not verify that fallback.

## Compose with Canvas

Prefer the existing Canvas component that serves the job. Import components and primitives from `@nannier/canvas`; compose application logic around them. An unsupported product requirement is a reason to explain the gap or compose available primitives, not edit the library or invent a public component API.

Styling choices use semantic boolean props, for example `<Button primary large>Save</Button>`, `<Typography h2>Profile</Typography>`, and `<ThemeProvider dark rose>`. Use at most one choice per axis. Do not translate familiar APIs into `variant="primary"`, `size="lg"`, `tone="..."`, Tailwind classes, or CSS overrides unless the installed component actually documents that API. Boolean styling does not mean every prop is boolean: labels, values, callbacks, data, and configuration retain their documented types.

Use layout components for bounds and spacing:

- `Container` is fluid by default; a width-step boolean such as `sm`, `lg`, or `page` caps and centers it; `start` pins the cap to the start. These are token measures, not breakpoint names: in 4.0.0 `lg` caps at 512 px and `page` at 1280 px. Choose a parent cap that can fit the intended desktop tile count plus gaps; a three-column Grid still collapses inside a narrow parent.
- `Column` and `Row` provide semantic gap and alignment props. `Row stacks` stacks when narrow; inspect `stackBreakpoint` and the documented `span` placement for unequal columns.
- `Grid columns={3} minTileWidth={240}` caps the desktop column count and reduces it as its own container narrows.
- Controls and content fill or hug their parent. Put the measure on a `Container`, or use documented measure props on a control; avoid fixed widths on fields/cards and a content-sized parent around a fill child.

Start with the desktop composition, then verify narrow containers and scrolling. Preserve the same app implementation on native and web. Use supported React Native primitives and Canvas tokens for application-specific layout; keep platform setup at the entry boundary rather than creating separate copies of the screen.

## State, overlays, and accessibility

Choose controlled or uncontrolled state deliberately using each component's documented API. For forms, keep draft values separate from saved values when Cancel or validation requires it. Associate visible labels and errors with fields; expose invalid/disabled/selected states through the supported props. Give icon-only actions useful accessible names.

For a real modal, use the documented live overlay mode. In Canvas 4.0.0, `Dialog overlay form` retains its title and description around custom form content; a plain `Dialog` with `children` replaces the built-in body, so supply `accessibilityLabel` when necessary. `embedded` is a nonmodal specimen and does not provide modal focus behavior. Use public close/state callbacks, including cancellation from Escape or native Back; make saving and cancellation explicit.

On web, verify opening focus, Tab and Shift+Tab containment, Escape, every close path's focus return, and background interaction in a browser. Canvas provides modal focus handling; application state can still invalidate it. Keep the opener mounted and focusable through the opening handoff. If an app must disable or replace it, verify or explicitly implement a public-ref focus return after it becomes available again. Hiding background accessibility content must leave the portaled dialog outside that hidden subtree. Check native screen reader semantics and Android Back on available native runtimes; a web export does not establish native behavior.

## Finish with evidence

Run the app's typecheck and relevant build. Exercise the requested interactions at desktop and phone widths, including keyboard operation where applicable. Inspect actual rendered content and horizontal overflow. Test optional-peer absence when that is a requirement. Keep temporary testing screenshots out of version control.

Report the installed Canvas version, completed behavior, commands/results, and which web/iOS/Android runtime checks were actually performed. Distinguish a successful typecheck or bundle from runtime verification. If the released package prevents an acceptance criterion, preserve the consumer's package provenance and report a small reproduction instead of silently substituting local library code.
