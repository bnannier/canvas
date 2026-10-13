---
"@nannier/canvas": patch
---

The component audit's records cite commits that are on main. Every turn so far merged by cherry-pick, which gave its commits new SHAs on main, so the checklists, the decisions log and the audit README cited 71 turn-branch commits (142 times) that main never contains; each now names its commit on main (matched by subject). `audit:checklists:check` now fails on a commit an audit record cites that HEAD's history does not hold (`tools/audit/commit-refs.ts`, with tests), and the audit README's process says a turn merges by rebasing onto main and fast-forwarding. Repository tooling and docs only; nothing in the package changes.
