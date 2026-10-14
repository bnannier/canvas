---
"@nannier/canvas": patch
---

The audit's commit-reference check and its tests address the repository they are given even inside a git hook: git exports GIT_DIR to a pre-push run from a worktree, and the child git calls followed it instead of their working directory, so the pre-push battery failed three tests. Repository tooling only; nothing in the package changes.
