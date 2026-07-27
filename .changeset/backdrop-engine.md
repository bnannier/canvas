---
"@nannier/canvas": minor
---

Add `Backdrop`, the engine for a full-screen animated background.

New user-visible capability: a consuming application can now ship an animated
background through the kit instead of hand-rolling one. Canvas owns the surface,
the shared clock, the per-platform frame budget and the accessibility ladder; the
application owns the scene, composed from `Backdrop.Particles`,
`Backdrop.Gradient`, `Backdrop.Shader` and `Backdrop.Custom` layers. The kit ships
no artwork of its own, so the animation belongs to the app: point the same engine
at different children and it renders something else entirely.

Also exports `BackdropHost`, which lets one surface serve every `Backdrop` in an
app (so a stack of screens shares a single drawing surface rather than one each),
and `backdropClock`, so bespoke app-supplied art can bind to the same timeline as
the declared layers.

Semantic boolean axes: `energetic`/`calm` (rate), `dense`/`sparse` (field detail,
which is also the frame-budget lever), `vivid`/`subtle` (weight), plus `still`.
Reduce Motion renders a poster frame from the first paint, Reduce Transparency
drops the translucent washes, and Increase Contrast paints the background token
alone.
