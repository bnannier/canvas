---
"@nannier/canvas": patch
---

The docs app runs on the iOS 27 SDK again: apps linked against it that keep the app-delegate-only lifecycle stop at launch, so the docs move to Expo 57.0.27 with `expo-build-properties`' UIScene support turned on, every Expo SDK package at its matching version, and the five docs patches re-created for the new versions (all still needed, all still in force under `check:patches`). Two end-to-end journeys measure what they mean again: the wide-trigger popover is checked against its overlay outlet, which the page frame now puts inside its gutters, and the search resize journey starts on the desktop shell that has the topbar opener, whose compact form now carries the same "Search components" name. The Linux visual baselines are re-minted for that page frame: every preview card is 16 px wider and its rows hug their content, and no component's own rendering changed. Repository tooling and docs only; nothing in the package changes.
