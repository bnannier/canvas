---
"@nannier/canvas": patch
---

The docs app's iOS header menu now check-marks the palette in force beside the current page. expo-router hands every menu to iOS as single-selection unless told otherwise, and UIKit applies a single-selection menu's rule to its whole tree, inline sections included, so the menu's root made the current page and the palette one group and only the page's check survived. The root is now multiselectable, which leaves each section (a component category, the Palette section) a single-selection group of its own. The menu is built in a module of its own, and a unit test follows it through expo-router's header config and react-native-screens' bar button config and holds it to UIKit's single-selection rule. Repository tooling and docs only; nothing in the package changes.
