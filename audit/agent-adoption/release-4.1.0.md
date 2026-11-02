# Canvas 4.1.0 release verification

The owner approved npm and docs publication. The [release workflow](https://github.com/bnannier/canvas/actions/runs/41362322417)
completed successfully on 2026-11-02 UTC: npm and Cloudflare succeeded, and both
store jobs were skipped. Source commit: `198c70ef562fb96552458c1af3dade367ce276dd`.
The accepted version commit and `v4.1.0` tag are
`d7bb5af31414552ed286562ce4fa91d0faf1debd`.

## Public delivery

[`@nannier/canvas@4.1.0`](https://www.npmjs.com/package/@nannier/canvas/v/4.1.0)
is available and was the `latest` dist-tag when verified. The actual registry
tarball matches the sealed candidate's SHA-256:
`a740d41a06c58b23aa23cf43dbbf60203ee304e5e9d7eec3b0bcc3dd686f9df5`.
Registry SHA-512 integrity was checked independently.

A fresh public `npm exec --package @nannier/canvas@4.1.0 -- canvas init` created
a settings project pinned to 4.1.0. Dependency installation, TypeScript and a
production web export passed. Its installed CLI passed `doctor`, returned 4.1.0
Button documentation, and installed both project-local skills; repeating the
installation left the skills unchanged. The sealed candidate also passed all
three recipe choices, version pins, license propagation and gitignore checks.

[agents.md](https://canvas.nannier.com/agents.md),
[llms.txt](https://canvas.nannier.com/llms.txt),
[llms-full.txt](https://canvas.nannier.com/llms-full.txt) and the
[4.1.0 reference](https://canvas.nannier.com/ai/4.1.0/index.md) are live.
All 113 versioned files and three global files match their manifest hashes and
the actual npm tarball bytes. The manifest/catalog also match the tarball.
The 4.0.0 archive remains available; sitemap entries and public Markdown/XML
content types and revalidation headers passed inspection.

npm first reported successful publication at 00:27:38 UTC. Public metadata was
observed by 00:32:08, and the tarball downloaded successfully at 00:34:58. Earlier
404 responses and failed fresh-install attempts were retained in temporary text
logs. Publication was not retried. Final verification used the available public
tarball and a successful fresh installation.

## Validation and limits

Required CI validation passed: **8,761 unit tests**, **3,424 end-to-end tests**,
**333 web smoke tests**, and **30 starter tests**. The unit suite had eight skips
and zero failures. Build, typechecks, lint, generated-file checks, package sealing
and the React/React Native support checks passed.

Four advisory native jobs failed. Both iOS builds succeeded, then failed the
same prior-release Maestro assertion about “Work item 40” above the command
palette's “to navigate” footer. Both Android runners exhausted disk space during
builds; their native runtime checks did not run. These remain failures. Earlier
independent recipe flows passed on web, iOS and Android, which is separate
evidence from the release-native jobs.

The existing development-only `happy-dom` security alert remains open. No outreach
was sent, the repository remains private, and the public support contact is
pending. External adoption and repeat use remain unmeasured. Compact hashes and
results are in [the verification record](release-4.1.0.json); no test images,
recordings or traces are committed.
