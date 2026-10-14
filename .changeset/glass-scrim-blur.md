---
"@nannier/canvas": patch
---

Under glass on the web a modal's scrim now also blurs the page it dims, by Dark Factory's 2 px (the owner's GS-6 decision, `blur(2px)` under its tinted dim, as Dark Factory's overlay scrim draws it): the Dialog's and the AlertDialog's backdrop, the Drawer's (and so the Sidebar's and the FilterPanel's drawers), the ActionSheet's and the phone sheet a Popover becomes at the phone form factor. The scrim's colour is unchanged, and the blur fades in with the dim. On a Dialog and an AlertDialog the blur is a layer of its own beneath the card, so the card's frost still samples the page. Solid mode keeps its promise that nothing samples the backdrop: solid, Reduce Transparency, Increase Contrast and a browser without a backdrop filter render the plain dim with unchanged markup, and the iOS and Android scrims do not change. The Dialog and AlertDialog pages no longer promise a blurred backdrop in every mode.
