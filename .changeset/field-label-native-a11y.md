---
"@nannier/canvas": patch
---

VoiceOver and TalkBack no longer read a field's visible label twice or speak its required star. On iOS and Android the label of Input, Textarea, Select, Autocomplete, PhoneInput and Stepper (above the field, or floating in it on Android) is hidden beside the field it names, so the screen reader stops once, on the field. The label Field draws over a control that names itself (a Switch) stays a stop of its own, now named without its star. The web is unchanged: the label stays in the page as the field's `aria-labelledby` target, and the star stays `aria-hidden`.
