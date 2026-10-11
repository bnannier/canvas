---
"@nannier/canvas": patch
---

On iOS, an anchored card covered by a modal card opened from it (a Popover under the Select list it opened) is hidden from VoiceOver as intended. The readiness hold passed `aria-hidden={false}` whenever the card was shown, and React Native lets a defined `aria-hidden` overwrite `accessibilityElementsHidden`, so the covered card stayed exposed under the top card. `aria-hidden` is now set only while the card is held; the web output is unchanged, and Android kept the card hidden already.
