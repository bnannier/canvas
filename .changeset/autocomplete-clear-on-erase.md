---
"@nannier/canvas": patch
---

Autocomplete: erasing the field now clears the selection instead of snapping the value back. After selecting an option the field showed the committed value through a display fallback, so deleting the text to empty re-filled it with the same value and the selection could never be cleared. Emptying the field now clears an uncontrolled value (a controlled `value` remains the parent's to own), leaving the field genuinely empty.
