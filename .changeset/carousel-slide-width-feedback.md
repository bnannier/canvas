---
"@bnannier/canvas": patch
---

Fix Carousel slides rendering off-screen in a shrink-to-content parent.

The paged `FlatList` had no definite width, so it reported its intrinsic size
(the sum of the slides, each sized to the measured viewport width) up to the
viewport. In a parent with no definite width, that fed the viewport width back
into the slide width and the layout diverged; the browser clamped the runaway at
its ~2^24 layout cap, pushing every slide off-screen and leaving an empty box.
The scroll container is now pinned to the measured width (`style={{ width }}`),
capping its contribution so slide N sits at N * width and slide 0 stays visible.
