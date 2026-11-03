# Canvas plugin packaging

The source of skill truth is `consumer/canvas/SKILL.md`, already public in
`@nannier/canvas@4.1.0`. The builder reads the actual integrity-pinned npm tarball,
checks its name/version, checks the skill, metadata and license hashes, and compares
the skill files to the checkout. No kit source or npm runtime is copied.
Two platform manifests wrap the same unmodified skill. Keep edits to the canonical
skill on the normal npm release path; do not fork the skill inside a plugin.

## Build offline

Prerequisite: Python 3.9+ (standard library only). Download the public tarball in a
separate network-enabled step; this does not execute npm scripts:

```sh
curl --fail --location --output /private/tmp/canvas-4.1.0.tgz \
  https://registry.npmjs.org/@nannier/canvas/-/canvas-4.1.0.tgz
python3 tools/plugins/build.py --tarball /private/tmp/canvas-4.1.0.tgz
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tools/plugins -p 'test_*.py' -v
```

The builder performs no network requests, subprocesses, package installation or
external writes. `consumer/plugin/release-lock.json` records registry metadata and
SRI verified on 2026-11-02. Refresh that lock deliberately for a new npm release.
Symlinks in input/output paths, tar links, traversal, duplicates, wrong identities
and mismatched hashes fail closed. On macOS use `/private/tmp`, since `/tmp` is a
symlink. Outputs are ignored under `.artifacts/plugins/4.1.0/`:

- `canvas-openai-4.1.0.zip`: portable root `plugin.json`, OpenAI interface metadata,
  icons, skill and the published `agents/openai.yaml`.
- `canvas-claude-4.1.0.zip`: `.claude-plugin/plugin.json`, icons and skill.
- `integrity.json`: complete ZIP hashes, sizes and exact entry lists.

Both ZIPs contain their files directly at the root. Entries use a fixed timestamp,
regular-file permissions, sorted names and stored bytes for reproducibility across
compression implementations. `PROVENANCE.json` records individual content hashes.
There is no MCP server, hook, telemetry, executable or second npm package.
The allowlist is in `package_files`; it never recursively packages a directory.

## Validate without touching personal settings

Extract each ZIP to a new temporary directory. For Claude, run:

```sh
CLAUDE_CONFIG_DIR=/private/tmp/canvas-validation/claude-config \
  claude plugin validate /private/tmp/canvas-validation/claude --strict
```

For installation checks, create a temporary marketplace root with the expanded
OpenAI plugin in `openai/`, and save this as `.agents/plugins/marketplace.json`:

```json
{
  "name": "canvas-validation",
  "interface": { "displayName": "Canvas validation" },
  "plugins": [{
    "name": "canvas",
    "source": { "source": "local", "path": "./openai" },
    "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
    "category": "Developer Tools"
  }]
}
```

Create the temporary `codex-config` directory first, then run:

```sh
CODEX_HOME=/private/tmp/canvas-validation/codex-config \
  codex plugin marketplace add /private/tmp/canvas-validation --json
CODEX_HOME=/private/tmp/canvas-validation/codex-config \
  codex plugin add canvas@canvas-validation --json
CODEX_HOME=/private/tmp/canvas-validation/codex-config codex plugin list --json
```

For Claude, place its expanded plugin in `claude/` under the same temporary root
and save `.claude-plugin/marketplace.json`:

```json
{
  "name": "canvas-local-validation",
  "owner": { "name": "Bobby Nannier" },
  "plugins": [{ "name": "canvas", "source": "./claude" }]
}
```

```sh
CLAUDE_CONFIG_DIR=/private/tmp/canvas-validation/claude-config \
  claude plugin marketplace add /private/tmp/canvas-validation --json
CLAUDE_CONFIG_DIR=/private/tmp/canvas-validation/claude-config \
  claude plugin install canvas@canvas-local-validation --json
CLAUDE_CONFIG_DIR=/private/tmp/canvas-validation/claude-config \
  claude plugin details canvas@canvas-local-validation
```

These commands install into disposable config roots and do not start a provider
session. A successful install establishes packaging/discovery, not skill quality,
desktop UI behavior or directory approval. Delete the temporary root after review.
Do not overwrite or reset the user's real configuration.

## Distribution and remaining owner inputs

The two ZIPs are concrete review artifacts; nothing here publishes or uploads them.
Use `consumer/plugin/listing.md` for listing copy. The public submission operator
must use the owner-approved publisher name **Bobby Nannier**, confirm account
access, name availability and portal category, and complete directory review.
The original npm copyright notice remains **Robert Nannier**, unchanged.

The npm license is copied verbatim and scopes MIT to npm-distributed files.
The owner granted MIT permission for newly generated wrapper metadata and
documentation, and permitted redistribution of Canvas icons with these plugins.
`LICENSE.wrapper.txt` records the narrow wrapper grant; `NOTICE.md` records icon
permission with trademark rights reserved. The icons are not MIT licensed. The
Canvas source repository's existing rights remain unchanged. Both ZIPs include both
license files. Local validation does not establish compliance with every directory
publication term.

The owner approved the dedicated public repository
[bnannier/canvas-plugins](https://github.com/bnannier/canvas-plugins), with support at
[its issue tracker](https://github.com/bnannier/canvas-plugins/issues). Both URLs
are verified public; root owns further repository updates. Only reviewed expanded
plugin assets and approved distribution files may be exported; kit source and
source-only packaging tools are not exported. The approved marketplace
name is `canvas-plugins`. Its Claude entry points to `./plugins/canvas`, and its
OpenAI entry points to `./plugins/canvas-openai`. Claude users can install with
`/plugin install canvas --marketplace bnannier/canvas-plugins`.
The directory still needs an eligible paid account/role and portal validation.

OpenAI's skills-only upload uses the portable ZIP. The manifest includes icons and
bounded listing text and the approved support issue URL. Privacy/terms URLs remain
omitted because no genuine destinations were supplied and skills-only metadata
does not require the MCP URL set. If a portal/account requires additional policy
or support information, the owner must
supply genuine destinations. No MCP review cases or app connection are claimed.

`requires_local_executor` is intentionally omitted. The canonical skill needs a
workspace and development tools that can exist locally or in a supported cloud
workspace. The desktop-only flag applies when execution must be local to the
user's computer. This is an interpretation of the skill's requirements, not a
promise that every host provides those capabilities. Native verification remains
conditional on an available runtime.

## Reviewed public repository setup

`consumer/plugin/repository/` saves the three setup files read from the reviewed
public-repository task output: root `README.md`, `.agents/plugins/marketplace.json`
and `.claude-plugin/marketplace.json`. The README uses visibility-neutral source
rights wording; the marketplace manifests retain the remotely validated bytes.
These files make the public marketplace setup reproducible without exporting the
Canvas source or packaging tools. No `.git` directory or other task-output files
are copied. Root owns public-repository updates.

## Primary sources checked 2026-11-02

- [OpenAI portable packaging and marketplace layout](https://developers.openai.com/plugins/build/plugins)
- [OpenAI listing and submission fields](https://developers.openai.com/plugins/deploy/submission)
- [OpenAI local-executor condition](https://developers.openai.com/plugins/deploy/desktop-only)
- [Claude manifest and directory layout](https://code.claude.com/docs/en/plugins-reference)
- [Claude distribution routes](https://code.claude.com/docs/en/plugins/publish)
- [Claude directory checklist](https://claude.com/docs/plugins/pre-submission-checklist)
