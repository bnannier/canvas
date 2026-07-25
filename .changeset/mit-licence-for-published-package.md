---
"@nannier/canvas": minor
---

The published package is now MIT licensed.

Canvas was previously published as `UNLICENSED` with no licence file, which in npm's
vocabulary means proprietary, all rights reserved. Anyone who installed it therefore had
no grant of rights to use it at all, despite the project being described publicly as open
source. That is now fixed for consumers: `license` is `MIT`, and the MIT text ships inside
the tarball.

The grant is deliberately scoped to the distributed package. The source repository stays
all rights reserved, so the licence file is generated at pack time by `tools/licensegen`
rather than committed, because a `LICENSE` at the repository root is exactly how GitHub
decides a repository's licence and committing it would extend MIT to the source too.

Nothing about the API, the build output or the runtime changes; this only adds the
permission to use what was already being published.
