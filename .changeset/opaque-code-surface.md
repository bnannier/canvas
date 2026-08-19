---
"@nannier/canvas": patch
---

`CodeBlock` paints an opaque surface.

Its fill was `alpha(muted, 0.5)`, translated literally from a Tailwind `bg-muted/50` in the kit's shadcn-era origins, so a code block sitting over any backdrop showed it straight through the code: a photo, a gradient, or the glass surface mode's own aurora wash. The design hand-off paints this surface flat `var(--muted)`, and a code block is a content surface, which the kit's glass model deliberately leaves solid. The zebra tints, the inline code chip and the terminal chrome are unchanged; only the block's own panel fill moved.
