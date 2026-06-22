---
"@olympusoss/canvas": minor
---

Skin the 14 single-file molecules into the platform-skin pattern, aligning every molecule to
the shared-shell + web/iOS/Android-skin structure. Light treatment (per-OS corner radius,
density, type tracking, and press feedback on their own rows; web unchanged; registered for
the docs platform comparison): ActionPanel, Alert, Card, DescriptionList, EmptyState, Feed,
Field, Fieldset, Form, GridList, MediaObject, StackedList, Stats. Shared treatment
(platform-neutral, identical skins): CodeBlock. Subcomponents (Card's header/title/etc.) and
all public APIs are preserved; composed atoms keep their own per-OS fidelity.
