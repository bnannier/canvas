---
"@nannier/canvas": patch
---

Stop BackHandler console.error noise on web: Drawer, ActionSheet, and the Sidebar drill-down now wire Android hardware-back through a shared useHardwareBack hook that subscribes only while the overlay is open and never on web, where react-native-web's BackHandler shim logs "BackHandler is not supported on web" on every addEventListener call. Native behavior is unchanged.
