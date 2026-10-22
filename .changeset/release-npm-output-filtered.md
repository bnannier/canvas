---
"@nannier/canvas": patch
---

The release script runs `npm publish` captured again, as every publish before 3.9.1 did (stdin closed, no terminal): inheriting the job's stdio for 3.9.1 stalled npm past the publish job's ten minute limit. npm's output is now printed without its tarball listing, so the error and details fit in the job log instead of being cut at one pipe buffer, the call is bounded at six minutes so a stall still reaches the failure path, and the workflow's npm debug-log step runs when the publish fails or is cancelled. 3.9.1 was versioned in git and did not reach npm. Repository release tooling only; nothing in the package changes.
