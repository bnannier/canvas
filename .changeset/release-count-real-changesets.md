---
"@nannier/canvas": patch
---

Count only the changesets that changesets itself will read.

The release workflow decides whether to version, commit and tag by counting pending
changesets with a shell `find`, and that `find` did not match changesets' own filter,
which is `!file.startsWith(".") && file.endsWith(".md") && !/^README\.md$/i.test(file)`.
It was missing the dotfile exclusion and its README check was case-sensitive.

The consequence is small but confusing: a repo whose only pending entry is a scratch
`.changeset/.draft.md` counted as one pending release, so the workflow took the
version-and-tag path with nothing behind it and produced a no-op re-tag of the
current version, which the existing `|| echo "Release already exists"` then hid.

Over-counting is the safe direction, since the worst case is a wasted no-op, whereas
under-counting would skip a real release. This change only ever removes entries
changesets refuses to read, so it cannot cause a missed release. Verified against
every filename case: a dotfile draft, a lowercase readme, a legacy directory
changeset, and two real changesets.

Found by adversarially reviewing a changeset guard in daedalus, then confirmed
identical in all seven repos.
