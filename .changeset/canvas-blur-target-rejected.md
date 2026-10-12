---
"@nannier/canvas-blur": minor
---

`FrostView` reports a refused capture target. A frost handed a host that contains it (an ancestor, which it can never sample without recording itself) still draws no blur, and now also calls its new optional `onTargetRejected` event once for that target, with `{ targetId, reason: "ancestor" }`, so the app can show its complete solid appearance instead of a tint with no blur. A minor: the event is a new capability of the package's public `FrostView`. It is optional and backward compatible; a detached host still reports through `CaptureHost`'s `onAvailabilityChange`, and nothing else changes. The device instrumentation gains `TargetSafetyTest` for the ancestor, sibling, other-window and detached verdicts and the once-per-target report.
