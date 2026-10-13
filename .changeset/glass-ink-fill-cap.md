---
"@nannier/canvas": patch
---

Under glass in the browser, a field's prefix or suffix addon and PhoneInput's country segment now paint their fill only as dense as keeps the text on it at 4.5:1 over the field (the owner's GS-2 decision, the error and selection washes' rule extended to a fill that carries text). Drawn through the browser's dark control material (the docs' iOS preview of a field), the addon's `$` read 3.93 to 3.99:1; it now reads at least 4.6:1 there. In the light palettes the addon's fill becomes a faint trace (the text measured about 4.5:1 on it before, with no headroom), and on the web's dark field it keeps its full strength, which already held. iOS and Android keep the full fill: their frost paints a darker body than the tints predict, and on the iOS device the addon's text measures 4.76:1 in dark. Solid mode is unchanged.
