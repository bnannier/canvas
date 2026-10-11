---
"@nannier/canvas": patch
---

The native candidate smoke reads only what an open anchored card leaves in the iOS accessibility tree: an open menu or palette is modal to VoiceOver, so iOS hides the page under it. The flow reaches the Drawer menu's trigger by its measured place (its tap there failed with "Element not found: Open menu"), and checks the palette's typed query in its own search field rather than in the page's record. No kit change.
