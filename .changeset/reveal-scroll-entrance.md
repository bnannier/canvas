---
"@nannier/canvas": minor
---

Add the `Reveal` atom and `RevealGroup`: a scroll-triggered content entrance.

New user-visible capability, which is what makes this a minor: the kit had no
in-view primitive at all. Its only animation component, `Entrance`, fires on mount,
is spring-only opacity plus scale, and has no delay, duration, direction, or trigger,
so every app that wanted content to arrive as it scrolled into view had to reach
outside the kit for it. `Reveal` is that capability, and it is additive: no existing
export changes shape, and `Entrance` and the four overlays built on it are untouched.

`<Reveal>` wraps content, holds it slightly offset and transparent, then travels it
into place and fades it in when the element reaches the viewport, once. The API is
semantic booleans on four axes and carries no numbers: direction (`fromBelow`, the
default, plus `fromAbove`, `fromLeft`, `fromRight`), distance (`pronounced`), speed
(`brisk`), and threshold (`deepInView`).

`<RevealGroup>` makes stagger structural instead of numeric: it hands each child the
next ordinal in document order and the child turns that into its own delay, so a
mapped list cascades without any call site computing a per-item delay. It renders no
host element, so it can sit between a grid and the items the grid lays out without
disturbing the layout.

Detection is a shared throttled ticker that measures only elements still waiting,
and stops dead when the last one arrives, so a fully revealed page holds no timer.
Every path that cannot produce a trustworthy measurement reveals the content: an
entrance primitive must never be able to leave content invisible. Under Reduce
Motion the whole mechanism is skipped, not merely shortened (no registration, no
measurement, no timer), the final frame renders immediately, and the stagger is
dropped with the motion, since delaying a static frame would only withhold content.
