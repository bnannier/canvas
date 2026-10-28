---
"@nannier/canvas": patch
---

An `embedded` Wizard now renders in place in the page's flow, the way Dialog's contained form does: no portal, no scrim over the window, and the compact spacing of an inline panel. It used to keep the modal presentation and cover the whole page with its scrim even when embedded in a docs card or an app screen.
