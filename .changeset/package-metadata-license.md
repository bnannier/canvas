---
"@olympusoss/canvas": patch
---

Add the missing package license and npm metadata. The package previously shipped with no `license` field and no `LICENSE` file even though the README declared proprietary, so npm reported the license as unknown. Add `"license": "UNLICENSED"` plus a standard proprietary `LICENSE` file, and fill in `homepage` (the docs site), `repository`, `bugs`, and `keywords` so the npm package page links back to the project and is discoverable.
