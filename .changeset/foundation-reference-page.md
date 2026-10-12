---
"@nannier/canvas": patch
---

The docs gain the Foundation reference (`/foundation`, under Guides on the web and on iOS and Android, and in search under every deprecated name): every deprecated name in Canvas, grouped by the part of the kit it comes from, with what it was and what to use instead, linked to the replacement's page where one component, prop or token replaces it. Its rows are generated from the public API manifest and the source, so the page cannot drift from either, and it carries the contracts the retired machinery kept: how an anchored card behaves for every menu and Popover, how to test one without layout, the field label's contract, and server rendering against the window. React Native's `StyleSheet` pass-through's deprecation text no longer cites an audit ID.
