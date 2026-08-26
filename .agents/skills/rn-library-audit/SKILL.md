---
name: rn-library-audit
description: Audit a React Native UI component library against best practices — the 8-dimension playbook (API, a11y, performance, packaging, testing, theming, platform correctness, docs/DX) with the concrete checks, verification greps, and severity rules proven on the Canvas 2026-07 audit. Use for periodic re-audits of this kit or auditing any RN library.
---

# RN UI library audit playbook

Run one auditor per dimension (parallel agents with a structured findings
schema), then ADVERSARIALLY VERIFY every critical/high finding against source
before reporting (auditors over-claim; ~25% of serious findings die under
verification). Severity: critical = broken for a class of consumers/users;
high = clear violation with real impact; medium = worth fixing; low = polish.
Ground every finding in file:line evidence. Respect the library's own
documented conventions — don't report them as findings.

## The 8 dimensions and their highest-yield checks

**1. API consistency**
- `grep -rl forwardRef src | wc -l` vs component count (inputs & focusables must forward refs).
- `grep -rn testID src | wc -l` — 0 means E2E suites can't target anything (components that don't spread props need an explicit prop).
- Controlled/uncontrolled duality: every form control needs `value`+`onChange` AND `defaultValue` (a bare `<Switch />` must work). Check disclosure components too — kits are often split-brained here.
- Event-name and payload consistency (onSelect payloads: index vs item vs key).
- Text inputs must forward the core TextInput slice (secureTextEntry, keyboardType, onSubmitEditing, onFocus/onBlur) — hiding it blocks real forms.
- displayName on factory-built components.

**2. Accessibility**
- RNW drops `accessibilityState`/`Value` at the DOM: every stateful control needs dual `aria-*` aliases (checked/selected/expanded/disabled).
- Overlays: focus move-in, trap, return, Escape. RN `Modal`-based ones get much of it free; inline/portal ones get none — check those hardest.
- `grep -rn onKeyDown src | wc -l` — 0 means zero web keyboard operability (sliders, menus, tabs arrows).
- Touch targets ≥44pt (chip remove ×, pagination, breadcrumb links) or hitSlop.
- Toasts: persistent live region (mounting region WITH content skips announcements).
- Charts: `role="img"` hides child text — values must be in the label or reachable as text.

**3. Performance**
- Verify the theme context is memoized (stable token identity, changes only on real flips) BEFORE recommending React.memo — memoized context + leaf allocations is usually fine; don't cargo-cult.
- List-family components rendering `.map` into a View: fine to ~100-200 rows; needs a virtualization story beyond.
- `grep -rn "StyleSheet.create" src | wc -l` — 0 on RNW means per-element inline styles.
- Barrel + hard deps: does importing Button pull chart/QR libs? (`dependencies` audit + subpath/laziness.)

**4. Packaging (highest-yield dimension for source-shipped kits)**
- Raw TS shipping: NodeNext `.js` specifiers CANNOT resolve in stock Metro (`grep -rE 'from "\..*\.js"' src | wc -l`); if the repo's own app needs a metro `resolveRequest` hack, every consumer is broken.
- Shipped `.ts` as types = consumer tsc errors that `skipLibCheck` can't suppress (it only covers `.d.ts`); DOM globals in shipped source are the classic leak.
- Optional peers statically imported = build failure for everyone who skipped them. Fix: guarded LITERAL `require` (literal id keeps it bundleable; `typeof require === "function"` guard keeps pure-ESM alive) + `peerDependenciesMeta.optional`. Avoid `"type": "module"` if the dist mixes require (webpack strict-ESM drops it).
- Bare `__DEV__` breaks non-Metro bundlers — guard it.
- CI must validate the ARTIFACT: build → specifier-resolution integrity over dist → platform-fork preservation (.ios.js/.android.js) → no raw TS → no DOM types in public .d.ts → render components FROM dist in tests. (See scripts/verify-package.ts + test/dist-smoke.test.tsx in Canvas.)

**5. Testing**
- Coverage MAP (which components have any behavioral test), not %; overlays and newest components are always the gap.
- Are per-OS skins (`*.ios.*`/`*.android.*`) ever imported by a test?
- Is the doc/codegen tooling that gates CI itself tested?
- Does the "visual regression" harness actually compare anything, and against the real app?

**6. Theming/tokens**
- Missing semantic tokens (success/warning) → count hand-picked palette greens/ambers and their per-scheme recipes; drift = light-only colors in dark mode.
- Can consumers override brand tokens (rebrand), or is primary hardwired?
- Density/motion/transparency axes: implemented consistently or on 1-2 components?

**7. Platform correctness**
- Ripple discipline on Android (bounded ripple on rounded nodes needs clip), press feedback parity on NEW components.
- `fontFamily: "monospace"` is Android-only; iOS needs Menlo/Courier (silent SF fallback).
- SafeArea + KeyboardAvoiding in overlays (`grep -rn SafeArea src`).
- RTL: physical left/right vs logical start/end sweep.
- Portals vs Modals: portal-hosted menus render BEHIND RN Modals.

**8. Docs/DX**
- Generated prop tables vs examples-only; README consumer path (install, peers, Expo vs bare vs web); dev-mode misuse warnings; changelog shipped.

## Workflow shape (proven)

Phase 1: 8 parallel auditors, structured schema `{findings:[{id,title,severity,
evidence,affectedComponents,bestPractice,proposedFix,effort,breaking}],
dimensionSummary}`, max 10 findings each. Phase 2: one adversarial verifier per
critical/high finding ("try to REFUTE against source; sanity-check the fix
against the kit's conventions"). Phase 3: synthesize into 4-6 impact-ordered
workstreams; get scope/breaking-policy decisions from the user BEFORE executing.
Execute design-heavy fixes single-threaded; fan out mechanical sweeps
(testID/props/RTL) as parallel per-family agents that must run the repo's
validation battery before returning.
