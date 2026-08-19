---
"@nannier/canvas": minor
---

Backdrop: `twinkle` now scintillates individual bodies instead of fading the whole
layer, and adds a `scintillate` channel to the exported clock.

The minor is for the new public API: `BackdropClock` gains `scintillate`, a linear
0..1 sawtooth at the flare period that an application's own `Backdrop.Custom` art
can bind to the same way it already binds `flight`, `drift` and `event`.

The effect itself was close to invisible, and the reason was structural rather than
a matter of tuning. A twinkling layer multiplied ONE shimmer value into its single
wrapper, so every body in the field rose and fell together over a 0.55..0.95 range.
A field that changes brightness as a unit is a global luminance change, and the eye
adapts straight through it; widening the range would only have made the whole sky
pulse.

Twinkling is now differential. A twinkling field is dealt into nine phase buckets by
a hash of the body index (a hash, not `i % k`, because fields are generated on
lattices and every k-th body would otherwise land on a regular sub-grid that flashes
as a pattern). Each bucket is its own Animated.View over its own static Svg, riding
the shared `scintillate` ramp at its own offset, through a flare curve with a fast
attack and a long rest. Neighbouring bodies therefore flare at unrelated moments.
Bodies big and bright enough to have earned one also carry a diffraction glint and a
white core that ride the same curve, so a flaring star briefly grows spikes and goes
hot rather than merely getting less transparent, which is what makes the effect read
at two or three pixels across.

The flare peaks exactly AT the layer's prominence cap rather than above it, so the
legibility budget in `backdrop.styles.ts` still means what it says; the added
contrast comes from the resting floor. Aggregate luminance behind text goes down,
not up. The Reduce Motion poster still fans the buckets across the flare curve, so
the still frame is a sky of bright and faint stars rather than one flat field.
