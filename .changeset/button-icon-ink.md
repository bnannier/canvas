---
"@nannier/canvas": minor
---

A Button's icon slots take the button's label ink. An `Icon` in `iconLeft` or `iconRight` (and the icon-only body) with no tone of its own now paints in the label's colour for the intent, emphasis, body and state the button resolves (the primary's contrast ink on a primary button, the foreground on outline and ghost, the muted ink on a quiet or filter trigger, the link ink on a link, dimmed with the label while disabled), on web, iOS and Android, as the v4 hand-off draws its glyphs in `currentColor`. The seam is a kit ink context (`src/style/ink.tsx`): Button provides its resolved label ink around its slots, and Icon's colour precedence becomes the explicit tone or `color`, then the nearest ink, then the foreground, so every Icon that passes a tone keeps it and an Icon on the page is unchanged. The docs playground and Anatomy figure stop hand-toning the demo glyphs. Minor: a new capability, icons inherit the button's ink without a per-call tone.
