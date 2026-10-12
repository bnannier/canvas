---
"@nannier/canvas": patch
---

PhoneInput's label on Android takes the foreground ink at the Android field label's type, so it reads in the dark scheme. It had no colour of its own and painted the platform's default black, about 1.45:1 on the dark page. Input's and Textarea's Android labels above the field (a grouped Input, a flush Textarea) render as before.
