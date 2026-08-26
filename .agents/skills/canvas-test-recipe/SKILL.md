---
name: canvas-test-recipe
description: Write tests for the Canvas RN UI kit: the bun-test + react-native-web render harness, ThemeProvider wrapping, aria-* state queries, per-OS skin smoke, the DOM-nesting console gate, the module-level-cache cross-file isolation fix, and pure-function tooling tests. Use whenever adding or fixing a test under test/ or tools/, testing a new component/prop, or a suite is flaky across files.
---

# Test the Canvas kit

Tests run under `bun test` and render every universal component through
react-native-web, so a test exercises the exact web output a RNW consumer ships.
The harness is wired in `test/setup.ts` (a bun preload, per `bunfig.toml`
`preload = ["./test/setup.ts"]`). Follow the render + query conventions below or
tests either fail to load the kit or assert against the wrong DOM.

## 0. What the harness gives you (test/setup.ts)

The preload does three things before any test file loads:

- Registers happy-dom (`GlobalRegistrator.register()`) so components render to a DOM.
- Aliases `react-native` to `react-native-web` via `plugin({ build.module("react-native", …) })`.
  Node/Bun cannot parse RN's Flow-typed entry, so this alias is mandatory; it also
  means `import { Text } from "react-native"` in a test IS react-native-web.
- Stubs the optional/native peers `expo-blur`, `expo-glass-effect`, and
  `react-native-svg`. GlassSurface then takes its documented translucent-View
  fallback, and svg-drawn parts (Icon, Spinner, Popover) render as no-op fragments.
  So test the LOGIC/interaction, not rendered vector paths or the real glass material.

Do NOT re-import or re-configure any of this per file; it is process-wide.

## 1. Render harness: ThemeProvider wrap + platform entry import

Every render MUST be wrapped in `ThemeProvider` (components read `useTheme()`
tokens; an unwrapped render throws). The one-liner every suite uses:

```tsx
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
afterEach(cleanup);
```

Import components from their PLATFORM ENTRY, never the shared factory:
`../src/atoms/checkbox/checkbox.tsx` (the web build), NOT `checkbox.shared.tsx`
(that exports `createCheckbox(skin)`, not a component). Under bun there is no
`.ios`/`.android` extension resolution, so `<name>.tsx` is the web build the alias
serves. `rerender` must re-wrap: `rerender(<ThemeProvider><Checkbox indeterminate /></ThemeProvider>)`.

## 2. Query STATE via aria-*, not accessibilityState

react-native-web forwards neither `accessibilityState` nor `accessibilityValue`
to the DOM, so the kit carries cross-platform `aria-*` aliases and tests assert
those. Query by role + aria attribute (see `test/a11y-state.test.tsx`):

```tsx
const attr = (c: HTMLElement, sel: string, a: string) => c.querySelector(sel)?.getAttribute(a);
expect(attr(container, '[role="checkbox"]', "aria-checked")).toBe("true");   // or "mixed"
expect(attr(container, "[aria-expanded]", "aria-expanded")).toBe("false");
```

Coverage the a11y suite locks: `aria-checked` (Checkbox/Switch/Radio),
`aria-selected` (TabBar/Tabs/Select/Combobox/Command/ButtonGroup/Listbox exactly
one true), `aria-expanded` (Dropdown/Combobox), `aria-pressed` (tappable Chip),
`role="listbox"`/`role="option"` for overlay pickers, and named remove buttons
(`[aria-label="Remove Design"]`). `role="img"` (charts), never `"image"`.

## 3. Behavior tests: drive the real logic

Assert interaction and computed logic, not just that it mounts (see
`test/behavior.test.tsx`). Overlay pickers accept `open`/`active`/`query` props to
render their body without a click. Patterns:

```tsx
fireEvent.click(screen.getByText("4"));               // Pagination reports page 4
fireEvent.change(screen.getByPlaceholderText("Search…"), { target: { value: "ban" } });  // Combobox filters
expect((Combobox as { displayName?: string }).displayName).toBe("Combobox");  // factory sets displayName
const ref = createRef<TextInput>(); … expect(typeof ref.current?.focus).toBe("function");  // ref forwarded
```

Capture callback payloads with a `let` closure (`onChange={(p) => { page = p; }}`);
use `screen.getByDisplayValue` / `getByPlaceholderText` for inputs, `getByText`
for labels, `container.querySelector('[role="option"]')` for structural asserts.

## 4. Per-OS skin smoke (the ONLY layer that loads .ios/.android)

Every other suite imports `<name>.tsx` (web), so a `.ios.tsx`/`.android.tsx` skin
that references a missing token, mis-shapes a StyleSheet, or throws at render ships
untested. `test/skins-smoke.test.tsx` is the one net: a data-driven `CASES` array
(one row per exported symbol: `{ name, dir, file, props?, children? }`) that
dynamically imports BOTH builds and asserts export + non-throwing mount:

```tsx
const mod = (await import(`../src/${c.dir}/${c.file}.${platform}.tsx`)) as Record<string, unknown>;
const Comp = mod[c.name];
expect(Comp, `${c.name} not exported from …`).toBeDefined();
expect(() => render(createElement(ThemeProvider, null, createElement(Comp as never, c.props ?? null, kids)))).not.toThrow();
```

`PLATFORMS = ["ios", "android"]` loops both. When you add a component (or a new
exported symbol from an existing skin, e.g. AvatarGroup, StackedBar), ADD A CASE
here with the minimal props to render its body, or the skin is untested. Wrap raw
string children in `<Text>` for View-only panels (the `txt()` helper); a `children`
function receives the resolved module (see AvatarGroup building Avatars).

## 5. The DOM-nesting console gate

RNW renders a button-roled `Pressable` to a real `<button>`, so nesting one
interactive control in another emits a React console.error (`"<button> cannot be a
descendant of <button>"`) that assertion tests miss. `test/no-console-violations.test.tsx`
intercepts `console.error` during render and fails on any nesting-style message:

```tsx
const NESTING_RE = /cannot be a descendant|cannot appear as a descendant|cannot contain a nested|validateDOMNesting/i;
```

Always restore `console.error` in a `finally`. It regression-locks the ActionSheet
fix (its dismiss target is an EMPTY sibling Pressable behind the sheet, not a
wrapper around the action rows) with a structural assert:
`buttons.some((b) => b.parentElement?.closest("button") != null)` must be `false`.
RNW portals `Modal` onto `document.body`, so query `document.querySelectorAll`, not
`container`, for Modal-based overlays. When you add an interactive or overlay
component, add it to the representative spread.

## 6. Cross-file isolation: reset module-level caches

A module-scoped dedup/memo cache leaks across every test FILE in the process, so
one file's render can swallow another file's assertion. `src/style/dev-warn.ts`
holds `const warned = new Set<string>()` (once-per-message), and ships
`resetDevWarnings()` purely so tests can clear it. `test/dev-warn.test.tsx`:

```tsx
beforeEach(() => { resetDevWarnings(); warnSpy = spyOn(console, "warn").mockImplementation(() => {}); });
afterEach(() => { warnSpy.mockRestore(); cleanup(); });
```

Two rules this enforces, copy them for any process-wide cache you test:
- RESET the cache in `beforeEach` (not just `afterEach`), so a prior file that
  already fired the message cannot mask you.
- Assert each unique warning in EXACTLY ONE test; a second assertion on the same
  string is dead once the dedup fires. Restore the spy in `afterEach`.
Assert the clamp/fallback still happens alongside the warn (`Gauge value={140}`
warns AND renders `100%`); assert valid data stays SILENT (`canvasWarnings()` empty).

## 7. Pure-function tooling tests

CI-gating tooling (the docgen parser) is tested as string-in/data-out, no
React/DOM (see `tools/docgen/parse-md.test.ts`). It covers `splitDoc`,
`firstFence`, `parseVariants`, `parseDonts`, `scopeNamesFromLiveScope`, and
`bannedStyleViolations` (the style guardrail) directly from `./parse-md.ts`. When
you change the parser or the guardrail's banned-key list, add a case here first:
the generator gates `docs:gen` (pre-push + CI), so a silent parser regression
corrupts every Playground example. Interpolate `` const F = "```" `` to keep fenced
markdown readable in fixtures. One case reads the REAL
`docs/src/core/live-scope.ts` to prove the extractor stays wired to codegen's
source of truth.

## 8. Verification

```bash
bun test                       # whole suite must be green
bun test test/behavior.test.tsx  # a single file while iterating
bun run typecheck              # tsc --noEmit, REQUIRED whenever you touch src/
```

`test/dist-smoke.test.tsx` self-skips unless `dist/` exists (`bun run build`
first); CI builds before test. Green tests verify code, not visuals: for CSS/layout
changes still do the visual QA pass (`canvas-new-component` §6).
