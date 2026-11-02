# Canvas agent adoption

This work makes the published Canvas package easier for consumer coding agents to
discover and use. It does not change the source license or promise that a model
will select Canvas without being asked.

## Milestones

| Phase | Deliverable | Exit evidence | Status |
| --- | --- | --- | --- |
| 1 | Dependable installation, accurate release identity, fixed evaluation tasks | Registry artifact verified, starter verified on web/iOS/Android, five tasks attempted in each client | Foundation verified; diagnostic results and limits in [phase 1](phase-1.md) |
| 2 | Generated agent-readable documentation | Versioned Markdown/component catalog, `llms.txt`, sitemap, drift checks | Implemented; [details](implementation.md) |
| 3 | Consumer skill for Codex and Claude Code | Installable guidance, repeated evaluations with the same tasks | Implemented and evaluated; [results](phase-3.md) |
| 4 | Starter onboarding and three complete application recipes | Independent consumers can adapt settings, dashboard and booking examples | Recipes verified on web/iOS/Android; npm assets use existing package terms |
| 5 | Tooling justified by measured failures | Setup or documentation retrieval tools improve recorded task outcomes | Offline CLI implemented; artifact verification recorded in [details](implementation.md) |
| 6 | Public distribution and adoption | External developers build successfully and return to use Canvas | [4.1.0 and docs published and verified](release-4.1.0.md); external adoption pending |

Phases 1–3 are the first release milestone. Publication remains a separate,
manually dispatched release. Keep one npm package, the existing local checks and
release-only CI. Never commit test screenshots, videos, traces or image archives.

## Evaluation

The fixed tasks and blank evidence record are in
[tools/agent-evals](../../tools/agent-evals/README.md). They test use of the
released npm package, without this repository's contributor instructions or local
package overlays. Protocol files alone are not evaluation results.

Keep first-attempt and corrected outcomes separate. Typechecking, production
bundling, browser interaction and native runtime interaction are distinct checks.
An unavailable prerequisite is not a pass. Document tool policy differences and
inherited client context before comparing agents or publishing success rates.

The npm package is MIT-licensed. Repository source, including the starter,
retains its existing all-rights-reserved terms. Reusable recipe/skill assets are
delivered through that same MIT-licensed npm distribution, whose existing license
covers its files. No new grant is made for the private source checkout.
