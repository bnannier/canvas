---
"@nannier/canvas": patch
---

The public API gate (`check:api`) ends the staged docs migration route by route instead of all at once when the `/foundation` reference appears: `tools/api/manifest.ts` `PLANNED_ROUTES` gives every planned route the audit turn that lands its docs, that turn closes it, and nothing may be staged for a closed route or left open with nothing staged. Every deprecated alias's home is the foundation reference, which must list each one once it exists. Repository tooling only; nothing in the package changes.
