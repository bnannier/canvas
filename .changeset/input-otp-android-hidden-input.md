---
"@nannier/canvas": patch
---

InputOTP no longer paints its raw code across the middle of the row on Android.

The single text input that captures the keystrokes sits over the whole segmented
row and is meant to be invisible, with the cells doing the drawing. It was
hidden with `color: "transparent"`, which Android does not honour, so the code
being typed was painted in the default text colour across the centre of the
field, on top of the cells. It is hidden with `opacity: 0` now, which every
platform honours and which changes nothing else: an opacity-0 view still takes
touches, still focuses, and is still read by assistive tech.

Caught by the landing-page hero capture, which had been shipping the artefact in
`input-otp-android.webp` for as long as those shots have existed.
