---
"@nannier/canvas": patch
---

The Deploy workflow proves npm will issue a trusted-publishing token for every package a release candidate publishes before it accepts the candidate, using the same OIDC exchange `npm publish` performs. Accepting pushes the version commit, so a trusted publisher npm cannot match used to consume a version (3.9.0 to 3.9.2 were versioned and never published); now the job fails first, with npm's own message. Repository release tooling only; nothing in the package changes.
