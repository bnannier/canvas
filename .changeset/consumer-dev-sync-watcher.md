---
"@nannier/canvas": patch
---

`bun run dev` now pairs the tsc watch with a consumer sync watcher: it mirrors `dist/` and `styles/` into every sibling repo whose git-ignored `.canvas` marker points at this checkout, keeping locally linked consumers live-reloading while the kit is edited. Consumers overlay a real directory in node_modules because Next 16 Turbopack refuses out-of-repo symlinks there.
