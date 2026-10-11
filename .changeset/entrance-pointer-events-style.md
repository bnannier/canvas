---
"@nannier/canvas": patch
---

An anchored card's readiness hold (Popover, Dropdown, Select, Autocomplete and the rest) stops taking touches through `style.pointerEvents` instead of the `pointerEvents` prop, so react-native-web no longer prints its "props.pointerEvents is deprecated" warning in development when a card opens. A held card still takes no touch or click, and a shown card takes them as before: React Native reads the style natively, and on the web the overlay outlet passes pointer events to the cards in it.
