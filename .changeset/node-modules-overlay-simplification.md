---
"@nannier/canvas": patch
---

dev-sync now mirrors straight into consumers' `node_modules/@nannier/canvas` overlays (stamped with `.origin`) instead of the former repo-root `.canvas` directories. Re-testing under clean conditions showed Turbopack live-watches real directories inside node_modules, so the `.canvas` indirection and consumer-side aliases were unnecessary.
