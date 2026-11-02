# Agent adoption implementation

Implemented on 2026-11-01, following the [phase-1 findings](phase-1.md).
This record separates implementation from publication and external adoption.

## Phase 2: generated documentation

`bun run agent-docs:gen` produces versioned Markdown for 107 component pages,
a catalog of 444 public exports, complete prop information, setup/theme/layout/
overlay guides, manifests and the root `llms` indexes. The generator reads the
existing component Markdown and typed API. It normalizes consumer imports and
rejects private API imports. Older snapshots retain their content hashes;
`--check` detects drift, and sealed snapshots cannot be silently rewritten.

The web export generates a sitemap from real output files and advertises it in
robots.txt. Internal testing routes are excluded. Plain-text guides revalidate
instead of receiving immutable cache headers. This supports retrieval; it does
not guarantee search indexing or a model's library choice.

## Phase 3: consumer guidance

The packaged `consumer/canvas` skill works in project-local Codex and Claude Code
skill folders. It respects an existing library choice, checks installed versions,
reads the actual API and covers semantic layout, optional peers and interaction
verification. It is separate from repository contributor instructions.

The [phase-3 evaluation](phase-3.md) preserves both successful and failed attempts.
It includes fresh dialog discovery/informed runs and repeated fixed tasks in both
clients. Informed runs explicitly read the skill; automatic selection was not
measured. These observations do not establish a statistical success-rate uplift.

## Phase 4: runnable recipes

`examples/recipes` is one independent Expo app using npm Canvas 4.0.0, with
settings, dashboard and booking screens. Each uses real Canvas components and
stateful interactions. `recipe-config.json` chooses the starting screen.

The recipes passed TypeScript, production web export and Chromium flows at 1280
and 390 CSS pixels. Release builds and the full Maestro flow passed on the iOS 27
Canvas Audit simulator and the Android API 35 canvas_audit emulator: editing and
saving, filtering and refreshing, choosing a service/date/time, confirming and
cancelling a booking, and returning to saved settings. Native flows took 65.5 and
95.2 seconds respectively with zero failures. Physical-device accessibility is
not established by those checks. Temporary captures were inspected and deleted.

These are complete frontend recipes with session state, not backend services.
They do not make real reservations, send email or persist through a reload.

## Phase 5: tools addressing observed failures

The existing package gains the `canvas` command:

- `docs`: offline, installed-version component and guide lookup, including JSON
  props. It refuses a different version when matching documentation is absent.
- `doctor`: read-only required-peer inspection with explicit limits; this is not
  a replacement for Expo compatibility, bundling or runtime checks.
- `skills install`: project-local copies for either or both clients. Identical
  copies are a no-op; differing files and symlink destinations are refused.
- `init`: copies a tested recipe into a new destination, selects its initial
  screen, pins the CLI's Canvas version and preserves the package license.

The tools neither run a package manager nor contact a server. The user's `npx`
invocation may fetch the npm package before the CLI starts. A network MCP server
is not needed to address the measured stale-retrieval and setup problems.

Generated recipe assets exclude node_modules, native builds, lockfiles, tests and
private files. The consumer creates its own lockfile. The existing npm LICENSE
already applies to all packaged files; distributing these assets through npm
does not change the private source repository's terms.

## Phase 6: distribution and measurement

The public entry guide, npm README, package keyword metadata, local skill
installation, recipes and sitemap are prepared. The release transaction regenerates
version-specific references after versioning and before freezing the candidate;
validation and the local push hook check drift. There are no push/PR-triggered
GitHub workflows.

[Distribution instructions](distribution.md) include a release-gated launch draft
and voluntary feedback process. [Baseline evidence](adoption-baseline.json) records
the public npm counter separately from actual consumer adoption. The repository
is private, so its issue form only serves invited collaborators. A public feedback
contact is an owner decision; no repository visibility change or outbound message
is part of this implementation.

Publication and external adoption are not claimed by completing the code. A minor
changeset prepares the next release through the existing manually dispatched
workflow. Independent users' successful builds and return usage remain external
outcomes to measure after publication.

The subsequent owner-approved [4.1.0 release](release-4.1.0.md) published the
package and docs. Its verification record includes the required CI results,
public artifact comparisons and advisory native failures.

## Final verification

The full suite passed with the repository's pinned Bun 1.4.0: 8,758 passed,
8 skipped, zero failures, across 414 files. The final focused generator, CLI,
sitemap and release tests passed separately: 50 tests and 3,083 assertions.
Root/tooling/docs/E2E typechecks, lint, package verification, API checks, size
budgets, documentation generation and the existing audit/privacy/design checks
passed. Local network and watcher tests required execution outside the filesystem
sandbox; sandbox failures are not counted as product regressions or passing runs.

An isolated rerun of `tools/docs/static-server.test.ts` from the repository root
failed when Bun tried to spawn OpenSSL (`EBADF`), despite passing in the full suite.
The unchanged test passed with the same pinned Bun binary from `/private/tmp`,
outside the repository's auto-loaded React Native test setup: one test, six
assertions. Direct Node HTTPS/Markdown verification also passed. The exact preload
interaction is unproven; no unrelated test-setup change was made to hide it.

The final local npm tarball was installed into an independent recipe consumer.
Its actual `node_modules/.bin/canvas` command successfully served help and the
installed Button API, checked dependencies, created a version-pinned recipe and
installed both clients' skills. Repeating skill installation was a no-op. The
recipe and both skills retained the package LICENSE. Installed consumer assets
matched the source byte-for-byte. A generated recipe also passed TypeScript and
a production web export against registry Canvas 4.0.0.

This is an unpublished candidate using the checkout's current version, 4.0.0;
it is not the existing npm 4.0.0 artifact. Its SHA-256 is
`f1c2efceb187010497725f55f076133de2405a0bef29c02a4e096e30a136c802`.
The minor changeset requests 4.1.0 through the release workflow. Release-candidate
tests cover regenerating and staging the new version's references and entry guide.

The production docs export completed with 1,001 sitemap URLs. Local HTTP checks
returned 200 and the expected content types for both `llms` files, `agents.md`,
versioned installation/Button Markdown, the catalog and sitemap. The deployment
`_headers` file was copied exactly. The local test server applies only its baseline
security headers; production path-specific cache headers still require checking
after deployment. Drift checks verified 117 generated documentation files and
11 recipe assets. No testing screenshots, recordings or traces were added to Git.

Independent review found and resolved npm's symlink entry-point behavior, private
links in installation guidance and version drift in the public entry guide. Its
final review reported no remaining blocker. At this implementation checkpoint,
nothing had been committed, pushed, published or dispatched; subsequent release
authorization and outcomes are recorded separately above.
