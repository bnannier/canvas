---
"@nannier/canvas": patch
---

The ScrollView primitive now takes the theme's ring colour for the keyboard focus ring the browser draws on a scroller with nothing focusable inside it, like the kit's Pressable and TextInput. A zoomable GeoMap draws its ring around the whole chart on keyboard focus, so it no longer runs under the zoom buttons. An errored Input, Textarea or PhoneInput, whose red edge shows the error rather than focus, now shows the kit's 2 px ring around that edge on keyboard focus instead of no focus cue at all. The Android Textarea's focused indicator and the Android InputOTP's active cell use the `ring` colour, like every other field. Under glass, a field's focus or error border, an open trigger's border and an active cell's border stay over the material, so the Android fields' focused indicator no longer disappears there. A Video with the platform's own controls gives its surface the theme's ring on the web.
