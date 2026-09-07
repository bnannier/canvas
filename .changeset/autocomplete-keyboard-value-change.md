---
"@nannier-com/canvas": minor
---

Add Autocomplete's public `onValueChange` callback so controlled consumers can observe both option selection and clearing with an empty string. This additive public capability justifies the minor release; `onSelect` continues to report selections only.

Add keyboard suggestion navigation and selection, accessible active-option relationships, and native ScrollView scrolling. Preserve IME composition and let an active suggestion consume Enter before a surrounding Form submits.

Give the disclosure button a real platform-sized touch target, including a 44pt minimum height for small iOS fields.
