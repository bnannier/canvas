---
"@nannier/canvas": minor
---

Radio: add a `card` mode so a selectable option card is one component, not a hand-composed `<Card><Column><Radio/><Typography/><Typography/></Column></Card>`.

Passing `card` wraps the whole control in the kit Card surface (bordered + padded, with Card's per-OS radius and iOS continuous corner curve), and the ENTIRE card is the tap target. The title (`children`) and muted `description` sit beside the ring as usual, and when the radio is the chosen option the card takes Card's own `selected` treatment (a primary border and a soft primary tint) derived from its checked state, so the whole tile reads as chosen, not just the dot. The chrome is derived from the existing Card skin/token styles (no new borders or tints), so a card-style radio and a `<Card selected>` stay in lockstep on every platform. Card radios are still group-wired through `value` inside a `<RadioGroup>` (pair with `row` to lay them out side by side), keep the radio role and checked state, and on Android show a bounded surface ripple clipped to the card's corners. A Radio without `card` is unchanged.
