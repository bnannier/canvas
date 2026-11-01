# Canvas consumer evaluation, phase 1

This is a small manual protocol, not a benchmark runner. `cases.json` contains five fixed tasks for the released npm package `@nannier/canvas@4.0.0`. `result-template.json` is an unexecuted record: every check starts `not_run`, and unknown measurements are `null`. Adding this protocol makes no claim about model performance or runtime success. It makes no model/API calls and adds no CI workflows.

## Conditions and isolation

Use one fresh agent session and one disposable workspace **per task, per model, per condition, per repetition**. Keep consumers outside this repository and outside directories inheriting its contributor instructions. Do not expose this repository, AGENTS.md, contributor skills, internal source, local docs, earlier solutions, or evaluator acceptance notes to the agent. Disable unrelated project/global memory, skills, and injected instructions where the client permits it; record unavoidable client/system context and any contamination. A contaminated run cannot be reported as a clean baseline.

The **discovery** condition supplies only the exact `prompt` string of the chosen case. The common package name, version, and official docs URL are intentional starting information. Public documentation and the installed npm package are discoverable resources; do not preload API advice, component names, import examples, installation fixes, or evaluator criteria. The other case fields are evaluator-only. An **informed** condition adds one explicitly selected consumer skill as separate context. Record its exact content hash, version, source and injection method, and keep everything else identical. Do not substitute this repository's contributor skills for a consumer skill. Compare discovery and informed results separately, never pool them.

The default workspace mode is **isolated**. `install-expo-rnw` starts empty; the other four tasks start from independently copied, identical clean Expo/RNW scaffolds without Canvas or task solutions. Their prerequisite model is recorded in each case. Generate the scaffold externally, pin its generator and dependencies, record its file/lockfile hashes and verify its typecheck/web export before exposing it. Do not use a successful install task's output as the default prerequisite: that would confound the tasks. Do not copy a licensed product starter into these public fixtures. Prompt-generated consumer source and installed dependencies remain temporary.

A deliberately **sequential** experiment may reuse a workspace/session across tasks, but must record sequence ID, position, earlier tasks and retained context. Report it separately as accumulated learning. It is not comparable to isolated first attempts. Never silently replace a failed prerequisite with another task's successful output.

## Running a task

1. Preflight outside the model run: check client authentication/availability, permitted tools, registry/network access and promised browser/device runtimes. Record exact client version and exact model identifier (requested and resolved when exposed), settings, OS and all toolchain versions. If a setting or model resolution is hidden, record `null` with an explanation rather than guessing. Use the same permission/network policy across matched runs. No paid call is required by this protocol; obtain any needed authorization before starting a billable run.
2. Copy `result-template.json` to a temporary results directory. Select a case and copy `cases.json`'s `revision` to the result's `suiteRevision`; record the case ID, condition and prerequisite model. Freeze budget before execution: default 20 wall-clock minutes from prompt submission and at most two diagnostic correction messages. Freeze model, client, scaffold, docs context, platform availability and tool policy for comparisons. A change starts a new experimental condition.
3. Record npm provenance from registry metadata, the consumer manifest, lockfile and installed package. Pin exactly `4.0.0`; do not infer the published version from this source repository's package.json. Verify registry tarball/integrity and resolved version. Reject `file:`, `link:`, workspace links, TS/Metro/bundler aliases to Canvas source, copied overlays (including `.origin`), local patches and library edits. Record exact dependency versions after installation. A genuine resolution failure is evidence, not permission to substitute local code.
4. Extract only the prompt, without reformatting its contents, and hash its exact UTF-8 bytes. The command below writes those bytes with no extra newline. Save any informed skill/context separately and hash it too. Start a clean session in the temporary consumer directory and supply only the permitted context.
5. Stop at the first declared completion, budget limit or blocking event. Snapshot the first attempt before correction. Run independent verification, retaining commands and concise text observations. If correction budget remains, supply factual diagnostics (exact failing command/error or observed action), with no Canvas API solution. Record every message, attempt boundary, edit summary and recheck. Do not quietly fix consumer code yourself; reviewer fixes constitute a separate assisted condition. Count agent self-correction within an attempt in the transcript; count evaluator diagnostic messages in `corrections`.
6. Record first-attempt and final outcomes separately. Retain compact, redacted text evidence, hashes, manifests/lockfile metadata and error excerpts. Do not commit consumers, secrets, screenshots, videos, screenshot archives, browser traces or diagnostic bundles containing images. Temporary images used for inspection must be removed. No release or CI dispatch is part of this evaluation.

From this repository, using an absolute temporary output path:

```sh
python3 - tools/agent-evals/cases.json settings-form /tmp/canvas-task-prompt.txt <<'PY'
import hashlib, json, pathlib, sys
suite = json.loads(pathlib.Path(sys.argv[1]).read_text())
case = next(c for c in suite['cases'] if c['id'] == sys.argv[2])
data = case['prompt'].encode('utf-8')
pathlib.Path(sys.argv[3]).write_bytes(data)
print(hashlib.sha256(data).hexdigest(), len(data))
PY
```

Use only the generated prompt file in the consumer session; do not attach `cases.json` or this README. For repeated evaluation, retain exact prompt bytes/hash and suite revision. Changes to a prompt, criteria or prerequisites require a new suite revision; keep case IDs stable unless task meaning changes.

## Evidence and scoring

Each criterion has a stable ID and a verification category. Review against the actual public package/docs contract, not repository internals. Check installed declarations as well as build output; do not accept errors hidden by `any`, `@ts-ignore`, disabled checking or unrelated custom replacement controls. A `build` criterion requires both typecheck and web export evidence. Record actual commands selected for the generated scaffold; do not assume a script exists. A development server starting is not a production build result.

Record typecheck, production web build, interactive browser runtime, iOS runtime and Android runtime independently. Browser interaction must exercise the case's prescribed actions, keyboard behavior and states, using automation or documented manual observation. Accessibility claims require inspection and interaction evidence, not just source presence. Record viewport, zoom and browser for responsive checks. Native runtime means an actual device/simulator/emulator running the app, with OS/device identity and actions recorded. A web preview of a native skin, a Metro bundle, a native compilation or an available simulator alone is not a native interaction pass. For criteria applying to both native platforms, record separate platform observations.

For the missing-peer case, inspect the **published** package metadata to confirm optionality, then prove `react-native-qrcode-svg` is absent from the whole dependency tree and cannot resolve from the consumer. Do not delete package files or stub modules to manufacture absence. If the selected frozen package manager/scaffold introduces it transitively and a clean absence cannot be obtained within the rules, record the cause explicitly. Whether a bundler can handle the genuine absent-peer path is an evaluated behavior, not an infrastructure exception. Repeated development warnings, import/build failures and fallback behavior belong in the record.

Allowed check/criterion statuses are `not_run`, `pass`, `fail`, `blocked`, and `not_applicable`. Use `pass` only for observed successful evidence, `fail` for an executed unmet requirement, and `blocked` for a named unavailable external prerequisite (for example authentication, registry outage or unavailable device). Unavailable runtime is **never a pass**. Use `not_applicable` only for criteria outside a deliberately declared platform scope, with an explanation; universal claims still require both native platforms. A package import failure, type error, missing API, broken focus trap or absent-peer bundling error is a task failure, not an infrastructure block. Mixed records may contain both failures and blocks; preserve both.

`finalWeb` passes only when provenance, typecheck, web build and every applicable non-native criterion pass. `finalUniversal` additionally requires successful iOS and Android runtime evidence for every native criterion. If required observations are unavailable, use `blocked` (or `not_run` if simply not attempted), even when web passes. An observed task failure takes precedence over an additional block. Missing checks do not become passes because the agent declared completion.

Report per model/client/condition/platform: scheduled runs, completed runs, first-attempt passes, passes after correction, task failures, infrastructure-blocked runs and unattempted runs. For the executable-run pass rate, divide passes by passes plus task failures; exclude pure infrastructure-blocked and unattempted runs and show their counts alongside the denominator. Any observed task failure remains in the failure denominator even if another check was blocked. Also report coverage as executable runs divided by scheduled runs. Never label a web-only rate as universal success. Phase 1 is five diagnostic cases; do not imply statistical significance or broad model rankings from a single repetition.

## Filling the result record

The template is a record shape, not a fabricated completed run or a runtime validator. Populate arrays as evidence is collected:

- `documentation.pages`: objects with `url`, `accessedAt`, `claimedVersion`, `sha256` and an optional text evidence reference. Record version mismatch or an unversioned live site explicitly; never assume live docs describe 4.0.0. Freeze/cache the same permitted public text for matched runs where practical, retaining hashes and source dates.
- `attempts`: objects with `number`, `startedAt`, `finishedAt`, `stopReason`, `transcriptReference`, `transcriptSha256`, `changedFiles` and `commandEvidenceIds`. Preserve first-attempt output before later edits.
- `corrections`: objects with `afterAttempt`, `sentAt`, exact `message`, `messageSha256` and `reason`. Record even an apparently minor evaluator hint.
- `commandEvidence`: objects with unique `id`, `attempt`, `cwd`, exact `command`, `startedAt`, `durationSeconds`, `exitCode`, redacted `stdout`, redacted `stderr`, and optional `textLogReference`/`textLogSha256`. A tool interaction can instead use an exact `tool`/`arguments` record with observed output; do not invent an exit code.
- `criteria`: one object per case criterion, with `id`, `status`, `platform`, `evidenceIds`, `observations`, and `blockReason`. Repeat native criteria for iOS and Android; add no success defaults. Each `checks` entry uses the same status vocabulary and links to evidence IDs.
- `errors`: objects with `attempt`, `stage`, `category`, `message`, `evidenceIds` and `resolved`. Distinguish agent/API mistakes, package/docs issues and external infrastructure; preserve resolved errors too.
- `metrics`: measured wall time, agent-active time, tokens and cost when actually exposed by the client. Leave unavailable values `null`; record their source and units. Do not estimate hidden token counts or confuse cached input with new input. State any budget overrun.

No product screen changes with this protocol, so there is no Web/iOS/Android preview route.
