---
"@nannier/canvas": patch
---

The release script streams `npm publish` output straight to the job log instead of capturing it and printing it again inside an uncaught error, where it was cut at one pipe buffer (64 KiB): the tarball listing alone is larger, so every failed publish from 3.5.0 to 3.9.0 lost npm's own error. On a failed publish the Deploy workflow also prints the authentication lines (OIDC exchange, HTTP, errors) from npm's debug log. 3.9.0, the first attempt through Trusted Publishing, was versioned in git but did not reach npm. Repository release tooling only; nothing in the package changes.
