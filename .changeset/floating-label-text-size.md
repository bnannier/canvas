---
"@nannier/canvas": patch
---

The Android floating label of Input, Textarea, Select and Autocomplete follows the user's text size. It measures its rendered line instead of trusting the skin's numbers, raises the value's top padding when a larger text size makes the floated label taller, and lands the float on it; Select's and Autocomplete's fields now grow from a minimum height and Input's grows by what the text adds, so at large Android text sizes the floated label no longer overlaps the value and the value is no longer clipped. At the default text size nothing changes.
