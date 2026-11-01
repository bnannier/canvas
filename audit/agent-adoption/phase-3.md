# Phase 3: consumer skill and forward tests

The consumer skill now covers applications using the published `@nannier/canvas`
package: version-aware API retrieval, one React Native API for web/iOS/Android,
semantic boolean props, parent-provided bounds, optional peers, and modal keyboard
and focus behavior. It preserves an explicit choice of another library and does
not import this repository's contributor requirements into consumer projects.

The skill is [consumer/canvas/SKILL.md](../../consumer/canvas/SKILL.md), with
Codex UI metadata in `consumer/canvas/agents/openai.yaml`. The bundled skill
validator and targeted ESLint checks passed. No source-license grant was added.

## Observed application results

Each row below describes independent Chromium checks at 1280 and 390 CSS pixels,
after a separate typecheck and production web export. These are bounded diagnostic
observations, not model rankings or a general success-rate measurement.

| Fixed task, initial informed run | Codex | Claude |
| --- | --- | --- |
| Install and counter | Passed heading, pointer 0→1, Enter 1→2, no page errors/overflow | Same checks passed |
| Settings form | Passed edits, pointer/Space switch, associated validation errors, invalid-save preservation, saved values/notification state, draft separation | Same checks passed |
| Accessible dialog | Passed named modal/field, pointer/keyboard opening, Tab/Shift+Tab containment, Escape/Cancel/Save/header Close, focus restoration, background interception, discard/save/reopen | Same checks passed |
| Responsive dashboard | Passed desktop row/phone column, six reachable activity entries, two pointer/Enter Refresh activations, fixed values, real 200% zoom, no page errors/overflow | Desktop metrics incorrectly stacked; other listed checks passed, including phone layout and real 200% zoom |
| Missing optional QR peer | Passed whole dependency-tree absence, resolution failure, mounted accessible Canvas fallback, exact clipboard URL, visible copy feedback | Same checks passed |

All ten initial informed consumers passed typechecking and production web export.
Every generated application's iOS/Android **runtime** checks remain `not_run`.
Some agents also exported native bundles; that does not establish native behavior,
screen-reader behavior, or Android hardware Back.

### Dashboard correction and fresh forward test

The initial Claude dashboard used `<Container lg>` around three tiles with a
240 px minimum. In Canvas 4.0.0, `lg` caps the parent at 512 px, so the grid
correctly reduced itself to one column even in the 1280 px window. Independent
measurement found metric label y positions 230.45, 336.45 and 442.45.

The skill received one narrow clarification: width-step names are token measures,
with `lg` at 512 px and `page` at 1280 px in 4.0.0; the parent must have enough
room for the requested desktop tile count and gaps. The initial app was untouched.

A fresh Claude run, `claude-dashboard-skill-r2`, received the same frozen task and
client configuration plus that revised skill. It chose `Container page`. Independent
checks passed at both widths, including six activity entries, two Refresh
activations, metric values, layout, and real 200% browser zoom. At 1280 px, all
three metric labels had y=159.70. Both original and revised runs remain in the
[compact record](phase-3-pilots.json). This single rerun supports the usefulness
of that clarification; it does not establish a causal or statistical uplift.

## Fresh matched dialog comparison

The fresh `codex-dialog-discovery` and `codex-dialog-skill` runs used identical
Codex arguments, the same externally generated Expo scaffold and npm release,
and independent workspaces. Their configuration SHA-256 values match. The only
intended treatment was the copied consumer skill and explicit instruction to read
it. Both completed the independent browser checks.

The discovery run independently identified the opener-disable focus issue and
added explicit public-ref focus restoration on web. The informed run kept the
opener mounted and enabled through the focus handoff, used Canvas layout
components, and relied on Canvas's focus lifecycle. This is an observed difference
in the generated integrations, not evidence of a success-rate improvement.

The earlier phase-1 failure remains unchanged. A separate temporary diagnostic
copy removed only `disabled={open}` from that consumer's opener; the same phase-1
verifier then passed focus restoration, cancellation and saving at both widths.
No Canvas source or installed package change was needed for that diagnostic.

## Conditions and provenance

- The fixed prompts are suite `canvas-consumer-phase1`, revision 1. Full original
  prompts and their hashes are retained in [phase-3-pilots.json](phase-3-pilots.json).
  Informed prompts append an instruction to read the copied skill file; there
  were no evaluator correction messages. Each run had a 20-minute limit.
- Codex CLI 0.166.0 requested `gpt-6.1-sol`, medium effort. User config, project
  instructions, unrelated skill directories/files/realpaths, bundled skills,
  plugins, apps and memories were disabled. Claude Code 2.1.310 requested `sonnet`,
  medium effort, reporting `claude-sonnet-5-5`; it used empty setting sources,
  strict MCP configuration, disabled slash commands, excluded user instructions,
  disabled memory, explicit tools and the recorded npm/Canvas/Expo domain allowance.
- Skills were explicitly read as files. These tests do not measure automatic skill
  selection or prove complete instruction isolation. All informed traces show the
  consumer skill read; no unrelated skill-file reads were observed. No user API
  keys were requested or copied.
- Install cases began empty except for the skill. The other cases independently
  copied the verified official blank Expo 57 scaffold, without Canvas or the
  licensed product starter. Scaffold generator, versions, lock and source hashes
  are recorded. Installation cases independently selected Expo 58; their exact
  versions are recorded per run.
- All twelve completed installations, including the fresh discovery dialog and
  revised dashboard, contain 4,083 Canvas files identical to the retained phase-1
  npm reference. Exact pins, tarball URLs and integrity agree. Canonical package
  tree digest: `bf33aefa306787dedc9d5a2ecf7669be1e6896efe03df7807322b749bb3c312b`.
  This is a path/byte-count/content-hash digest compared with that reference, not
  a separately downloaded tarball digest. No generated app was edited by the evaluator.
- The current published 4.0.0 package lacks the new CLI and packaged AI docs, and
  the new public AI URLs returned 404 during these runs. Agents used the skill's
  installed-declaration fallback. These observations do not verify deployment of
  the new documentation or a future package.

Raw workspaces, exact prompts, metadata, traces, verifier results, source manifests
and the package-tree audit remain under `/private/tmp/canvas-adoption-phase3`.
The checked-in JSON retains hashes and compact text observations, not test images,
traces containing images, or whole diagnostic directories. Phase-1 evidence was
not overwritten.

## Independent verification

The reusable manual tools are:

```sh
node tools/agent-evals/phase3-run.mjs codex unique-label skill settings-form
node tools/agent-evals/phase3-verify.mjs unique-label
```

`phase3-run.mjs` supports all five frozen cases and fresh discovery runs.
`phase3-verify.mjs` serves a unique production export through browser request
routing. It emits compact JSON without screenshots, video or traces. The dialog
entry point remains available as `phase3-verify-dialog.mjs`.

Dashboard zoom uses a temporary extension calling Chromium's `tabs.setZoom(2)`;
the verifier checks a factor of 2 and a halved CSS viewport (640/195 px), then
scrolls metrics, values, Refresh and every activity item into view and checks
horizontal bounds. This is actual browser zoom, following the official
[Playwright extension setup](https://playwright.dev/docs/chrome-extensions) and
[Chromium Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom).
It does not use CSS zoom or pinch emulation. Temporary browser profiles and the
extension are deleted after verification.

Two evaluator assumptions were corrected without changing generated applications:
an npm `{}` entry denotes a declared but absent optional peer, and activity entries
must be counted by list semantics/composed rows rather than fixed wording. Invalid
attempt JSON files were retained separately. Corrected checks confirmed the QR
peer's absence and all six activity rows. Child Codex browser launches were blocked
by the nested sandbox; independent verification ran outside it. That distinction
is retained rather than treating an agent's own blocked browser attempt as a pass.

## Installation-location references

Official documentation was fetched on 2026-11-01 before installation guidance was
written: [Codex](https://learn.chatgpt.com/docs/build-skills) documents project
`.agents/skills/<name>` and personal `~/.agents/skills/<name>`; [Claude Code](https://code.claude.com/docs/en/skills)
documents project `.claude/skills/<name>` and personal `~/.claude/skills/<name>`.
The consumer package installer uses project-local locations; these tests did not
alter global skill installations.
