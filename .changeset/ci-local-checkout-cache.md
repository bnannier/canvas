---
"@nannier/canvas": patch
---

The local CI runner (`bun run ci:local`) gives each checkout its own action cache and takes free ports for act's servers: a cache one worktree saved restored into another at the wrong path (setup-bun then found no bun), and two checkouts' runs at once collided on act's fixed artifact port. Tooling only; nothing in the package changes.
