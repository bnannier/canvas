---
"@nannier/canvas": minor
---

Collapsible and Accordion gain `card` and `description`, both backward compatible. `description` renders a muted secondary line under the title in the default trigger anatomy (on Accordion it lives per item, on `AccordionItem`); title truncation is unchanged. `card` wraps the disclosure (or the whole group) in an outlined card surface: an 8px-radius hairline card with 20px insets on web, the Material 3 outlined-card equivalent with 16dp insets on Android, and a documented no-op on iOS, where the default skin already renders the inset-grouped card.

Minor justification: two new public props on Collapsible and Accordion (card surface variant and per-title description line), a user-visible API capability addition.
