---
"@nannier/canvas": minor
---

`Dropdown` takes `triggerLabel`, the accessible name for a custom trigger.

New user-visible capability (the reason this is a minor, not a patch): a custom trigger passed as `children` is a View, so nothing named the button that wraps it. The browser then names it from its contents, which reads the trigger's text nodes back to back with no punctuation and repeats the label of anything nested inside. An account pill announced as "Rachel Chenrachel.chen@example.com Rachel Chen" rather than "Rachel Chen, rachel.chen@example.com". `triggerLabel` puts the name on the button itself, where assistive tech reads it; omit it and the platform's own name-from-contents still applies, so triggers that read fine on their own are unchanged. The default `trigger` button is unaffected: its own text names it.

`AvatarMenu` now passes its account name through this prop instead of labelling the capsule inside the button, which fixes the same announcement on every AvatarMenu.
