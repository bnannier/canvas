---
"@nannier/canvas": minor
---

MediaObject now owns the full identity-row anatomy. Its leading `src` photo routes through the platform `Avatar` atom instead of a raw image, so a broken or missing photo falls back to initials (from `avatar`, else the title) exactly like an initials row, while keeping the 40px circular photo. A new `compact` boolean adds a menu-header density: a smaller 28px leading avatar and title/description type stepped down one size per platform (web/iOS/Android). Both changes are backward-compatible; without `compact` the row is unchanged.
