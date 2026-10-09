---
"@nannier/canvas": patch
---

The component page gate now fails every `##` that would silently end Do & Don't: a `##` with no name, and a section of the page's own that holds Do/Don't markers (a pair's `###` title typed as `##`). Both passed before while the generator dropped that pair and every pair after it. A Do/Don't marker in Usage or Variants fails too, since only Do & Don't renders pairs. DepthChart's one-sided Don't caption now says the price axis covers only the bids, which is what the chart draws. Repository tooling and docs only; nothing in the package changes.
