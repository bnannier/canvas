---
"@nannier/canvas": patch
---

`check:api` now fails when any docs page but the Foundation reference, or DESIGN.md or README.md, presents a deprecated alias or a kit-internal helper as API: imported, called, rendered or typed in a snippet, or set alone as inline code. The kit's docs no longer teach a helper the kit retired. Repository tooling only; nothing in the package changes.
