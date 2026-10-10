---
"@nannier/canvas": patch
---

AnchoredOverlay's placement follows the layout direction, keeps to the window's safe area and stops reading layout every frame (the AnchoredOverlay audit turn, AO-4, AO-5, AO-7, AO-10 and AO-11). Behaviour changes:

- When a consumer does not say, a card follows the app's layout direction: in a right-to-left locale its leading edge is the physical right, on every consumer (only Dropdown passed it before). Output changes only in RTL locales: the patch's stated assumption. A fixed-width card aligned by its trailing edge in RTL is now clamped inside the window instead of extending past its left edge, and its physical insets go out under the style keys React Native resolves when it swaps left and right.
- On iOS and Android a window layer bounds its cards by the safe area on all four edges, read from `react-native-safe-area-context` when a SafeAreaProvider is mounted, so no card sits under the status bar, the Dynamic Island, the home indicator or a landscape sensor housing.
- Every anchored edge keeps 8 px inside its band, and a card with no fixed width is capped to the band less both insets, its trigger-derived minimum width included, so it never reaches the far edge.
- An open card follows its trigger on events: the layout events of its frame and window, the keyboard, and the scrolls the kit hears (every scroll on the web, the kit's ScrollView and overlay scrollport natively). It reads layout every frame only while its trigger sits in a React Native ScrollView or list the kit cannot hear. A closed overlay holds no state and re-renders on no resize.
