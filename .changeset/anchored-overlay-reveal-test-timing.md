---
"@nannier/canvas": patch
---

The anchored-overlay test that checks an option list scrolls to the selected option on entry now waits for that scroll instead of assuming a fixed 50ms delay covers it: react-native-web answers `measureLayout` on a timer, and a loaded CI runner missed the window (Deploy run 39610128823). Test only; nothing in the package changes.
