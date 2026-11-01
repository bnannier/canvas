# Distribution and adoption

Status: prepared source materials, 2026-11-01. External adoption evidence is
pending. No launch messages, community posts or issues have been sent by this
work, and no release is implied by these drafts.

## Audience and claim

Address developers building React Native applications for iOS, Android and web,
including teams using coding agents in an existing app. Canvas offers a single
component API, platform skins, semantic boolean styling and shared layout/theme
primitives. Optional native material integrations require platform setup and
runtime checks. Do not describe browser previews as native results, claim every
integration is automatic, or claim agents will prefer Canvas unprompted.

The initial adoption task is concrete: install a matching package, complete a
settings, dashboard or booking screen, verify it on the intended platforms and
report any setup blocker. Avoid broad comparisons with unrelated libraries when
a reproducible workflow gives readers better evidence.

## Release gates

Before using the launch draft below:

1. Run local required checks and isolated packed-package consumer checks. Record
   command output and exact versions. Verify each advertised recipe and supported
   client installation; distinguish web build checks from native runtime evidence.
2. Dispatch the existing release workflow manually on `main` under the repository
   release policy. Publishing, external announcements and account changes remain
   separate owner actions. A commit or push does not publish. An npm/docs-only
   release must explicitly disable the workflow's default iOS/Android store builds.
3. Verify the published npm version and tarball contain the documented CLI,
   machine documentation, consumer skill, recipes and package LICENSE. The
   LICENSE must cover every packaged file, including copied recipes and skills;
   repository source terms remain unchanged.
4. Confirm public `/agents.md`, `/llms.txt`, `/llms-full.txt` and versioned
   `/ai/<version>/` links resolve and agree with the released API. Keep snapshot
   status and content/source digests visible. Do not relabel a source snapshot as
   a released-package verification.
5. Replace preview wording only after verifying the actual npm artifact. Published
   `4.0.0` lacks this CLI; do not use an unversioned launch command before the new
   package is available. If `main` advances during release validation, dispatch
   another release as required by the repository policy.

## Launch draft — use only after those gates pass

> Canvas is a React Native UI kit for iOS, Android and web through React Native
> Web. The new release includes versioned Markdown API documentation, a component
> catalog, project-local guidance for Codex and Claude Code, and settings,
> dashboard and booking starter recipes in the same `@nannier/canvas` package.
>
> Start with `npx @nannier/canvas init --recipe settings --dir ./my-app`, review
> the files and follow the printed dependency/setup steps. In an existing project,
> use `npx --no-install canvas docs button` and
> `npx --no-install canvas doctor --json` after installing the new version.
> The CLI copies files without overwriting them and does not install dependencies.
>
> Read [the workflow](https://canvas.nannier.com/agents.md), check the installed
> version against its documentation, and try one screen on your target platforms.
> Voluntary setup reports help identify the next blocker to fix.

Add the verified version and release link when preparing a real announcement.
No testimonials, user counts, stars or success rates are asserted here.

## Measurement without telemetry

Do not add automatic usage collection, outbound CLI requests, tracking pixels or
account linking. Record voluntary public setup reports and explicitly consented
feedback. Use the consumer setup issue template to request text evidence; no
screenshots, recordings or secret-bearing environment dumps are required.

Keep a small text or JSON log with one row per report and separate rows for repeat
attempts. Do not infer unique users from npm downloads or count internal pilots
as external adoption.

The repository is currently private. Its setup issue form is available only to
invited collaborators; do not send public readers to that private tracker. A public
support URL or email is still awaiting the owner's choice. Add the chosen contact
to the onboarding guide and launch text before inviting public feedback. This does
not require changing repository visibility.

| Field | Meaning |
| --- | --- |
| `recordedAt` | UTC date/time of the observation |
| `source` | Public issue URL or consented feedback reference; no private contact details |
| `cohort` | `internal-pilot` or `external-voluntary` |
| `packageVersion` | Resolved npm version; note any source overlay or tarball |
| `framework` / `platforms` | Reported framework versions and intended targets |
| `client` | Reported agent/client version, or `none`/`unknown` |
| `task` / `recipe` | Concrete intended screen and chosen recipe, if any |
| `attempt` | First attempt or correction number; retain first-attempt outcome |
| `outcome` | `blocked`, `typechecked`, `web-built`, `web-interacted`, `native-interacted`, or `unknown` |
| `evidence` | Text command/result or public reproduction reference supporting that outcome |
| `blocker` / `resolution` | Observed failure and linked fix, or `pending` |
| `repeatUse` | Voluntary later use report with date/reference, or `unknown` |

Review incoming reports after a release and at the next maintenance review.
Group blockers by missing documentation, dependency setup, API mismatch, recipe
failure and platform behavior. Fix reproducible blockers, then request a voluntary
retest in the existing report only when the owner authorizes a reply. Keep elapsed
time to first successful screen only when start/end evidence exists; do not fill
gaps with estimates.

An optional manual npm download observation may record observation date, package,
query interval, public source URL and raw download count. Downloads include CI,
reinstalls and automation, so report them as downloads, never people, projects or
retention. Do not add an automated monitor as part of this plan.

## Evidence now

External successful builds: pending. External repeat use: pending. Internal
pilots and their limitations belong in the existing evaluation records, not a
public adoption total. Distribution materials and an evaluation protocol are
deliverables; actual external adoption requires subsequent voluntary evidence.
