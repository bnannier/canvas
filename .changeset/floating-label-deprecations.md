---
"@nannier/canvas": patch
---

`FloatingLabel`, `FloatingLabelStyles`, `HIDDEN_FROM_A11Y` and `LabelContent` are deprecated aliases (the owner's K12-2 decision): all four keep working until a major, and their `@deprecated` text names what to use instead. Input, Textarea, Select and Autocomplete float their label for you, and every field family (those four with Field, Stepper and PhoneInput) renders its label and required marker from its own `label` and `required` props.
