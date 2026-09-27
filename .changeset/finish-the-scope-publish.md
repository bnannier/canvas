---
"@nannier/canvas": patch
"@nannier/canvas-blur": patch
---

Retry the npm publish that `patient-scopes-return`'s release attempt started but couldn't finish: that changeset's version bump (3.4.3 / 0.1.1) landed in git and on GitHub, but the registry publish itself failed on an invalid NPM_TOKEN (`ENEEDAUTH`), so neither package actually reached npm and the git tags were never pushed. Per this repo's own recovery path (a partial release gets a new changeset, not a retry of the same version), this one carries the versions forward so the next CI run makes a fresh publish attempt with the corrected token.
