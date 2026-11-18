# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

Every user-facing change (new component, API change, bug fix, breaking change)
should include a changeset. Pushes and pull requests do not start GitHub CI or
publish a version. Manually dispatch `.github/workflows/deploy.yml` on `main`
to release: it prepares a frozen version candidate from the pending changesets,
validates its package and docs artifacts, then accepts the version commit and
publishes the tested artifacts. It does not open a "Version Packages" PR.

If `main` advances during validation, dispatch a new release from the current
revision. A push does not schedule a replacement. Major releases require the
workflow's explicit `major` and `major_version` inputs and owner authorization.

## Creating a changeset

```sh
bun changeset
```

The CLI prompts you for:

1. Which packages changed (just Canvas for this repo).
2. Semver bump (patch / minor / major).
3. A short description — this becomes the CHANGELOG line.

Commit the generated `.md` file alongside your code change.

## Semver guidelines

- **patch**: bug fixes, internal refactors, doc updates.
- **minor**: new components, new props, new exports. No breaking changes.
- **major**: removed/renamed exports, changed required prop types, deprecation
  removals.

Deprecated components stay in the public API for one full major before being
removed. Flag with JSDoc `@deprecated` and link to the replacement.
