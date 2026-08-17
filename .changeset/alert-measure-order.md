---
"@nannier/canvas": patch
---

Alert resolves its width measure axis `block` > `wide` > `narrow`, the order the design hand-off uses; v2.20.0 shipped the axis with the reverse first-match order. The order only decides what happens when a call site passes more than one measure, which the docs already tell you not to do, so nothing that passes a single measure changes. `block` leading is also the better reading: asking a banner to fill its container is the most specific of the three instructions, so it should not lose to a cap.
