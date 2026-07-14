---
"@olympusoss/canvas": minor
---

Popover: the panel can now host custom content. Pass `children` and it renders in the card body between the description and the action row — an input, a form row, any node — in both the triggered and the inline modes, on all three platform skins, with the panel still drawn on the shared `GlassSurface` material. The existing data-driven props (`trigger` / `title` / `description` / `actionLabel`) are unchanged and compose with children; pass any subset.
