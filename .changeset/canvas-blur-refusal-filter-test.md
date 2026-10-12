---
"@nannier/canvas-blur": patch
---

`FrostView`'s filter that drops a refusal of a host it no longer names moves into its own module, `forCurrentTarget`, with a unit test for the current host, a stale host, no host and no handler. Behaviour is unchanged; the filter is now covered, where before only the native side was.
