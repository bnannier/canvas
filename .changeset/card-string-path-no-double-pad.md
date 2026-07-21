---
"@nannier/canvas": patch
---

Card: the data-driven string form (`title` / `description` / `body` / `footer`, no children) no longer double-pads when `padded` or a density boolean is set. Those sections pad themselves, so the surface inset now applies only to the raw-children path; before, `<Card padded title="…" body="…" />` stacked the 24px surface inset on top of the sections' own insets and read as excessive top and bottom padding. `padded`, `flush`, and the density booleans behave exactly as before when the card has children.
