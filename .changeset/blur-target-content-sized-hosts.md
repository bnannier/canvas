---
"@nannier/canvas": patch
---

Android: OverlayProvider mounts its expo-blur BlurTargetView only for flex-sized hosts (an app root). Inside ScrollView content, Fabric's measurement clamps a BlurTargetView to the viewport regardless of its flex longhands, which capped every content-sized host's page at about one screen of scrolling. Content-sized hosts (a docs page or example stage) now keep the plain-View passthrough and publish no target, so their frosts fall back to the fill-only material and the page scrolls its full range. Mount a root-level OverlayProvider (flex-sized) to keep the window blur target for modal frosts.
