---
"@nannier/canvas": patch
---

The component page gate learns the Accessibility section (rule S10): once a component's audit checklist (`audit/components/<slug>.md`) signs a platform off, with a run id in its sign-off table, `docs:gen` refuses that component's page unless it carries a `## Accessibility` section after Do & Don't, which renders as one of its guidance sections. No component is signed off yet, so no page needs one today; the rule is proven on a copy of a real checklist with a sign-off typed in. The sign-off table now has one reader (`tools/audit/sign-off.ts`) that audit:status, the checklist gate and the docs gate share. Repository tooling and docs only; nothing in the package changes.
