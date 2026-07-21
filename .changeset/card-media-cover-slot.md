---
"@nannier/canvas": minor
---

Card: new `CardMedia` anatomy subcomponent, the full-bleed cover slot at the top of a card. It spans the card edge to edge inside the border, its top corners nest into the card's per-platform corner (8px web, 12 on iOS with the continuous curve, 12 on Android's M3 medium shape), and its bottom edge stays flat where the content continues. Compose it with `flush` and let `CardContent` pad the text below: `<Card flush><CardMedia src="…" height={180} alt="…" /><CardContent>…</CardContent></Card>`. Props: `src` (URI string or bundled `require(...)` asset), `height` (default 180), `alt` / `accessibilityLabel`, `testID`.
