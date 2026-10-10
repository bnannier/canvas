---
"@nannier/canvas": patch
---

The API changes of the AnchoredOverlay audit turn, all optional and backward compatible, on exports the public API manifest classifies as deprecated aliases (`AnchoredOverlay`, `AnchoredOverlayProps`, `placeOverlay`) or as internal by accident (`Entrance`, `EntranceProps`, `OverlayHost`). The placement preference and `sheetStyle` are the minor's (see the placement option changeset). Changes:

- `AnchoredOverlayProps` gains `dismissOnTab` (the card is a menu or an option list: a Tab out of it closes it, and its rows are its one tab stop, so its scrollport takes none), `combobox` (the card is a combobox's popup: it is not modal to VoiceOver and TalkBack, and focus is never handed back to its field) and `returnFocusRef` (the control that opened the card, where `triggerRef` is a wrapper around it: the card's controls follow it in the tab order, and focus returns to it).
- `onCardMount` no longer fires for a card that cannot close (`dismissable` false, a card pinned open): nothing moves focus into a card nobody opened.
- `placeOverlay` takes `besideStart`, `besideEnd`, `visibleLeft` and `visibleRight`, and its result names the side a beside card took (`side`, `start` or `end`).
- `Entrance` forwards a ref to its wrapper and takes `accessibilityViewIsModal` and `obscured`, the native screen-reader modality of an anchored card (both dropped on the web).
- `OverlayHost` gains `holdModal`, `subscribeModal` and `topModal` (the modal cards open in a window layer) and `measureWindowBounds` (the window a sheet stands in: the layer's box cut at the keyboard's top, and its safe area). A window layer's `measureVisibleBounds` band now also intersects the window's safe area.
- On Android a window layer whose page has no capture host now wraps its page in a View of its own, laid out as the capture path's content split, which is the node TalkBack is kept out of while a modal card is open: the rendered tree gains that one View.
