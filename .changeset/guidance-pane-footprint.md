---
"@nannier/canvas": patch
---

The repository guidance (CLAUDE.md and AGENTS.md, identically) now says what `paneStyle` does under glass since the owner's GP-1 decision: it drops the node's own fill and trades a resting border for padding of the same width, so the pane covers the node's whole solid footprint while a state border stays a border over it. Repository guidance only; nothing in the package changes.
