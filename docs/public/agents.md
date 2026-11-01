<!-- Generated from tools/agent-docs/agents.md; edit the template, then regenerate. -->
# Build with Canvas

Repository package version: 4.1.0. This is source documentation, not proof
that npm has published this version.

Canvas (`@nannier/canvas`) is a React Native UI kit for native iOS and Android
apps and the web through React Native Web. Use one component API with platform
skins, semantic boolean props, layout primitives and theme providers. Native
materials use optional native integrations; check the installation guide for your
runtime rather than treating a browser skin preview as native verification.

## Check the version first

This page describes the source package's onboarding workflow. As of 2026-11-01,
the published `4.0.0` package does **not** include the CLI shown below. These
commands require a package containing the CLI. Check the installed package's
`package.json` for the `canvas` executable before using them; otherwise follow
the [installation guide](/ai/4.1.0/installation.md) and installed declarations.
Repository previews and generated source snapshots do not prove publication.

In an existing project, read the resolved version in your lockfile or run
`npm ls @nannier/canvas`. Use documentation and declarations matching that
installed version. The currently generated [documentation index](/ai/4.1.0/index.md)
identifies its package version, source snapshot status and source digest.

## Start a project with an available CLI

Choose one recipe and a new destination:

```sh
npx @nannier/canvas init --recipe settings --dir ./my-app
```

The other recipes are `dashboard` and `booking`. Canvas copies a starter and
recipe files, refuses to overwrite existing files and prints the next steps.
The CLI does not install dependencies or run a package manager. Review the
generated files, then follow their installation and run instructions yourself.
The `npx` invocation can fetch the package; the Canvas CLI itself does not make
network requests.

## Work in an existing project

After installing a release that contains the CLI, run these from the project
root to use the installed package:

```sh
npx --no-install canvas docs --list
npx --no-install canvas docs button
npx --no-install canvas doctor --json
npx --no-install canvas skills install --client codex
```

Choose `--client claude` or `--client both` for the other supported destinations.
The skill installer writes project-local guidance into `.agents/skills/canvas`
for Codex and `.claude/skills/canvas` for Claude Code. It refuses file collisions;
review and reconcile existing guidance before trying the installation again.
It does not change account settings. The doctor reports setup findings locally;
read its output before sharing it in a public issue.

Give your coding agent a concrete task, the target platforms and the installed
Canvas version. For example: “Build a settings form with Canvas components for
web and iOS. Read the installed Canvas skill and component documentation, keep
the existing app shell, and verify keyboard use and the native runtime.” Agent
guidance helps retrieve the right API; it does not guarantee a model's choices
or a working application without verification.

## Read the API

- [Discovery index](/llms.txt) and [combined documentation](/llms-full.txt)
- [Installation](/ai/4.1.0/installation.md)
- [Theming](/ai/4.1.0/theming.md)
- [Layout](/ai/4.1.0/layout.md)
- [Overlays](/ai/4.1.0/overlays.md)
- [Component catalog](/ai/4.1.0/catalog.json) and [source/content manifest](/ai/4.1.0/manifest.json)

Compose existing Canvas components. Use boolean styling such as
`<Button primary large>` and layout components such as `Container`, `Row`,
`Column` and `Grid`. Read each component's props before using it, preserve
accessible names and keyboard behavior, and test each target platform. Typechecks,
web bundles and native runtime checks provide different evidence.

## Package and source terms

Canvas ships as one npm package. The npm package's LICENSE covers its packaged
files, including the consumer skill and recipes. Repository source retains its
all-rights-reserved terms; a public source preview is not a separate source grant.
Use the license and copyright notice included with the installed tarball for
the distributed package's terms. The public onboarding and API references linked
above do not require access to the private source repository.
