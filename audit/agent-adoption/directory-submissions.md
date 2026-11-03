# Canvas directory submission hand-off

Prepared 2026-11-02. Publisher display name: **Bobby Nannier**. Public support:
[Canvas plugin issues](https://github.com/bnannier/canvas-plugins/issues).

The owner approved a plugin-only public repository, scoped MIT permission for
new wrapper metadata/documentation and redistribution of the existing Canvas
icons. The npm-derived skill and LICENSE retain their original bytes and grant.
The kit's source license was not changed. GitHub currently reports the kit
repository as public. The owner explicitly confirmed keeping it public and
authorized the source push and docs-only deployment. No visibility setting was
changed by this work.

## Public plugin source

[bnannier/canvas-plugins](https://github.com/bnannier/canvas-plugins) contains
24 allowlisted plugin asset and metadata files, with separate catalogs for
Codex and Claude Code. It contains no kit implementation, packaging tools,
credentials, hooks, MCP server, executable or test captures. Both CLIs installed
from the actual GitHub marketplace in fresh temporary configuration directories;
the installed skill hashes match npm 4.1.0.

The final documentation correction and `v4.1.0` tag are recorded separately from
the earlier remote installation check in [phase 8](phase-8.md). The correction
preserves skill/license bytes and makes newly authored licensing wording
independent of source-repository visibility.

## OpenAI

Artifact: `.artifacts/plugins/4.1.0/canvas-openai-4.1.0.zip`.
Listing copy: `consumer/plugin/listing.md`. The portable manifest includes the
publisher, genuine website/support/repository URLs, icons and a bounded skill
description. It declares no MCP server, hooks or local-only executor requirement.

The [official submission process](https://developers.openai.com/plugins/deploy/submission)
requires the submitting account and verified publisher identity. The account
portal required sign-in. Automatic approval review rejected the attempted
Google/OpenAI sign-in as not explicitly authorized; the owner then selected
**Continue without account access**. No credential was entered, package uploaded,
review submission made or public OpenAI listing claimed.

When account access is available, upload the reviewed ZIP to
`https://platform.openai.com/plugins`, resolve its actual metadata/skill findings,
then complete submission and publication through the account. Account verification
and directory terms remain owner/account steps. No MCP review cases are needed
for this skills-only package.

## Claude

Artifact: `.artifacts/plugins/4.1.0/canvas-claude-4.1.0.zip`.
Repository: `bnannier/canvas-plugins`. Plugin path: `plugins/canvas`. Branch: `main`.
The repository is public and its support tracker is enabled.

The [official submission process](https://claude.com/docs/plugins/submit) reads
the plugin from GitHub. Its portal was signed in and the source form was prepared
with the approved public repository/path. A validation request was initiated,
but its completion was not observed after the tab became unavailable. No review
submission or publication action was performed. Local strict validation and real
GitHub marketplace installation are verified; they are separate from portal
validation and directory approval.

When proceeding at `https://claude.ai/directory/manage`, validate the public
source, review listing/data-handling/compliance fields against the actual
skills-only behavior, and complete the account's required terms and review steps.
Do not upload the kit checkout or add secrets. An official directory listing is
not implied by the existing marketplace repository.

## Capability and measurement limits

The skill needs an application workspace and development tools supplied by its
host. Native runtime checks need an available simulator/device. No model-backed
activation session or directory-hosted user journey was run in these phases.
Real crawler visits, search indexing, external successful builds and return use
remain unmeasured. No outreach or scheduled monitor was created.
