---
"@nannier/canvas": minor
---

Icon: remove the `set` gallery prop. `set` rendered the whole glyph catalog in a grid, which is a documentation concern, not something an app builds with, so the prop is gone and `Icon` is now purely a single-glyph component. Browsing the full set moved to a searchable gallery in the docs. This also drops the now-empty per-OS `IconSkin` and `createIcon` factory: Icon is a "Shared" treatment, so the iOS, Android, and web entry points re-export one shared component.
