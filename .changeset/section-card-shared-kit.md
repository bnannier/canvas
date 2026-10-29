---
"@nannier/canvas": minor
---

The Canvas v4 section pages' shared card vocabulary lands in the kit (justification for the minor: new public options on existing components, which the section cards of every docs section draw).

- `Chip link`: the section card's link pill, 26 px tall at the full round, 10 px sides, a 500 12/12 label in the secondary ink on the popover fill inside the field-border edge, the accent ink and edge on hover; a press keeps the resting look (on the web and on iOS, which shares the web skin). Look precedence `token` > `option` > `link`. Android keeps its Material 3 assist chip.
- Typography roles, one per value set the section cards use: `cardNote`, `codeLabel`, `inlineNote`, `tileTitle`, `paneTitle`, `gridLabel`, `tick`, `rowLabel`, `rowValue`, `headlineValue`, `bigNumber`, `unit`, `sampleLabel`, `sampleMeta` and `base`; the `natural` leading modifier, the face's own normal line at the role's size (measured in Chromium on the hand-off's faces); and the `cyan` and `mint` tones, the fixed series hues as inks solved to 4.5:1 whatever the palette.
- `Badge cyan` and `Badge mint`: the fixed series hues as soft pills (the hue's 16% wash under its solved ink), after the status tones in precedence.
- `Card sunken`: the `surface-sunken` well under the hairline with no shadow, on the elevation axis after `flat`; the Material 3 filled card on Android.
- `Kbd small` (the 22 px cap) and `Kbd tiny` (the 20 px cap), a size axis over the 24 px cap, and `Kbd flat`, the hint cap's one-pixel edge in the secondary ink.
- `Input shortcut`: a keyboard shortcut hint at the field's end, drawn as `<Kbd small flat>` (`tiny` on a small field), 8 px from the end and 10 px from the value (8 on a small field), on the framed field and the toolbar search alike.
