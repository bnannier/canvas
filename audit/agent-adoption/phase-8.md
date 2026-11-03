# Phase 8 — skills-only plugin packaging

Date: 2026-11-02. Local packaging and discovery are verified. The approved GitHub
marketplace is public and remote installs are verified. Public
directory submission, account verification and directory publication have not
occurred. The remaining
account and portal steps below prevent claiming directory acceptance or a public
listing. The owner has approved the publisher, scoped wrapper MIT grant, icon
redistribution and dedicated public plugin repository.

## Delivered

`tools/plugins/build.py` creates two deterministic ZIPs from the verified public
`@nannier/canvas@4.1.0` npm tarball. It never fetches, runs package scripts or
recursively copies source. The exact canonical application skill is copied from
npm and compared against `consumer/canvas/SKILL.md`; OpenAI's agent metadata is
also copied unchanged. Per-platform manifests, the packaged README, attribution,
source listing copy and pinned release evidence live under `consumer/plugin/`.
The packaging runbook is `tools/plugins/README.md`.

Outputs are ignored local artifacts, with no extra enclosing directory in the ZIP:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `.artifacts/plugins/4.1.0/canvas-openai-4.1.0.zip` | 311455 | `f1861e18caa3d1e9cbf436e04a5dedf4811fa3202b9c5caba1e099d38ae26828` |
| `.artifacts/plugins/4.1.0/canvas-claude-4.1.0.zip` | 309819 | `f5abbe04572de7196ef6113603391e6d510ec3652b13498a2c8bdcde68329b5b` |

Each ZIP includes a provenance file, the original published npm LICENSE, and
`LICENSE.wrapper.txt` for the newly generated wrapper metadata/documentation.
`integrity.json` records ZIP hashes and their exact entry lists. Existing product
artwork comes from `docs/public/favicon.svg` and `docs/assets/images/icon.png`.
No testing screenshots, kit implementation, credentials, source map, executable,
MCP server, hooks, telemetry or additional npm package are included.

## Verified public provenance

Registry metadata was read from
`https://registry.npmjs.org/@nannier%2fcanvas/4.1.0`; its tarball is
`https://registry.npmjs.org/@nannier/canvas/-/canvas-4.1.0.tgz`.
The locally available release tarball matched the registry SRI exactly:

```text
sha512-PlZre81dxq9d++H098BslkxoPiz3iUfcdaA1Q80lY7BuxVLmIw3xoaDAEE41k+TFPLww9atTq9lMxUpOb5wPgg==
```

Pinned SHA-256 values:

| Published file | SHA-256 |
| --- | --- |
| `consumer/canvas/SKILL.md` | `d488962faba3341dfab044ca73e934fa82d4f7c7911da456994528ad2f0f75bf` |
| `consumer/canvas/agents/openai.yaml` | `f59c8fba683e3592d176215630900108d9b835d3ce2d497c231980d78ba9cafa` |
| `LICENSE` | `6ffeeba9c7cb8dc81b4c0a83a09c3a60c229c81723a2a8bd2b146129e6685ac4` |

The archive parser rejects unsafe paths, links, duplicate members and unexpected
package identity, and enforces size limits before selecting the allowlisted files.
Every source/output path rejects symlinks. The ZIP format fixes order, timestamp,
permissions and storage method; separate builds were byte-identical.

## Current format decisions

The OpenAI package uses root `plugin.json` with the Agent Plugins 1.0.0 schema,
fixed root `skills/`, and presentation under `extensions.com.openai.interface`.
No redundant compatibility manifest or onboarding skill is added. Listing text
fits the published limits; icons are packaged. These choices follow the current
[OpenAI packaging guide](https://developers.openai.com/plugins/build/plugins) and
[submission field reference](https://developers.openai.com/plugins/deploy/submission).
Skills-only metadata does not require the four URLs used for MCP app review;
the approved support issue URL is included; no unknown privacy/terms destinations
are invented.

The OpenAI desktop-only flag is intentionally absent. The
[local executor guide](https://developers.openai.com/plugins/deploy/desktop-only)
conditions it on requiring local execution. Our interpretation is that this skill
needs a filesystem/tool-capable app workspace, which can be local or cloud-hosted;
it does not require the user's own machine. Plain chat cannot implement the app,
and native runtime verification still needs an available simulator/device. The
README makes these capability limits explicit. No directory allowlist is claimed.

Claude uses `.claude-plugin/plugin.json` and `skills/canvas/SKILL.md`, with all
resources outside the manifest directory. See the current
[manifest reference](https://code.claude.com/docs/en/plugins-reference).
The [publishing guide](https://code.claude.com/docs/en/plugins/publish)
distinguishes direct ZIP sharing, a marketplace and the public directory.

## Actual verification

- Seven Python regression tests passed. Cases cover integrity/hash tampering,
  wrong package identity, traversal/link/duplicate rejection, exact payload
  selection, canonical-skill drift, symlink protection and deterministic ZIPs.
  Command: `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tools/plugins -p 'test_*.py' -v`.
- Two complete builds to independent output directories produced identical ZIPs
  and `integrity.json`; every packaged provenance hash matched its entry. Both
  skills matched the canonical/published bytes exactly, and product PNG signatures
  were checked.
- Installed Claude Code **2.1.310**: `plugin validate --strict` passed against the
  expanded Claude artifact. A local marketplace install in a disposable
  `CLAUDE_CONFIG_DIR` succeeded. `plugin details` discovered **one skill**, with
  **zero agents, hooks, MCP servers and LSP servers**. The README now includes the approved
  `/plugin install canvas --marketplace bnannier/canvas-plugins` line; the final
  strict validation passed without that earlier install-line advice.
- Installed Codex CLI **0.166.0**: local marketplace registration, plugin installation
  and plugin listing all succeeded in a disposable `CODEX_HOME`. The installed
  plugin was enabled at **4.1.0**. Its installed skill hash matched the npm and
  canonical hash above. The portable manifest installed without a compatibility
  overlay.
- CLI validation state was confined to
  `/private/tmp/canvas-plugin-final-2hh2hg41/`; no personal settings were
  changed. No provider/API-backed generation session was run. CLI installation
  does not prove host UI behavior, skill quality or directory approval.
- `git diff --check` passed. Artifacts are confirmed ignored. No `src/` files,
  package manifest, root licensing or versioned release snapshots were changed
  by this phase.

## Owner approvals recorded and remaining publication gates

The owner confirmed **Bobby Nannier** as the publisher display name, approved a
public `bnannier/canvas-plugins` repository containing only reviewed plugin assets,
granted MIT permission for newly generated wrapper metadata/documentation, and
permitted distribution of Canvas icons. These prerequisites are satisfied.
The original npm LICENSE remains byte-identical and retains **Robert Nannier** in
its copyright notice. `LICENSE.wrapper.txt` scopes the new MIT grant;
`NOTICE.md` records icon redistribution permission and reserves trademark rights.
The icons are not blanket-MIT licensed. The Canvas source LICENSE is unchanged; repository visibility is a separate
owner decision.

The approved repository destination is
[bnannier/canvas-plugins](https://github.com/bnannier/canvas-plugins), with
[support through its issue tracker](https://github.com/bnannier/canvas-plugins/issues).
Both manifests include that repository and support destination, and the source
listing/packaged README use the approved publisher. Root created the approved
repository; both installed CLIs fetched it successfully, and its issue URL returned
HTTP 200. No fabricated email or support contact is supplied.

The approved public marketplace name is `canvas-plugins`. The root Claude
marketplace will point `canvas` to `./plugins/canvas`; the root OpenAI marketplace
will point `canvas` to `./plugins/canvas-openai`. Both expanded artifacts were
installed successfully with this exact layout in a fresh temporary root. Only
reviewed plugin assets and wrapper distribution files may be exported from the
Canvas source repository; source-only build/test tools stay outside the plugin
repository.

Remaining gates:

1. Root completed the approved public repository and support endpoint. The remote
   verification below confirms both marketplace paths. Any further repository
   edits remain with root.
2. The operator must obtain any required submitting-account access, confirm name
   availability and portal category, and complete OpenAI upload/submission and
   Claude portal validation/review. Local CLI installation is not directory
   approval. No Cloudflare or OpenAI account access is assumed.
3. Supply genuine privacy/terms destinations if the selected account or directory
   terms require them. The skills-only OpenAI metadata rules do not require the
   MCP app URL set; no unavailable policy URL is invented.
4. Run any separately authorized provider-backed evaluations or additional
   host-surface checks and record actual runtime evidence. No provider session was
   run as part of this packaging revision.

## Actual public GitHub marketplace verification — 2026-11-02 05:25 UTC

The published repository is
[bnannier/canvas-plugins](https://github.com/bnannier/canvas-plugins) at commit
`1253a01febcc2902a99249a98d08372c400c15bd`. Both CLIs fetched that exact commit in
fresh configuration roots under `/private/tmp/canvas-plugin-remote-x8cakpe0/`.
The tests below used the real `bnannier/canvas-plugins` GitHub source, not the
previous local marketplace fixture. No provider/model session was started.

- Claude Code **2.1.310**: `plugin marketplace add bnannier/canvas-plugins --json`
  cloned via public HTTPS; `plugin install canvas@canvas-plugins --json` succeeded.
  `plugin list --json` reports version **4.1.0**, enabled, installed in the temporary
  Claude cache. `plugin details canvas@canvas-plugins` reports **one canvas skill**
  and **zero agents, hooks, MCP servers and LSP servers**. Strict validation of
  that installed remote artifact passed with no findings.
- Codex CLI **0.166.0**: `plugin marketplace add bnannier/canvas-plugins --json`
  succeeded; `plugin add canvas@canvas-plugins --json` installed **4.1.0**.
  `plugin list --json` reports enabled and records marketplace source type `git`
  with URL `https://github.com/bnannier/canvas-plugins.git`. Inspection of the
  installed manifest and exact file inventory confirms no hook/MCP declarations,
  server configuration, agents, commands or executable directory. The only
  OpenAI extension is its presentation interface.
- Both installed `skills/canvas/SKILL.md` files have SHA-256
  `d488962faba3341dfab044ca73e934fa82d4f7c7911da456994528ad2f0f75bf`, identical
  to the pinned npm release and canonical consumer skill. The npm license and
  canonical skill were not modified.
- The public support destination
  [Canvas plugin issues](https://github.com/bnannier/canvas-plugins/issues)
  returned **HTTP 200**. Repository creation and issue enabling were performed by
  root under the owner's authorization; this verification subtask made no public
  writes and changed no personal plugin settings.

GitHub reports the separate `bnannier/canvas` kit repository as public. The owner
explicitly confirmed keeping that visibility and approved the remaining source
push and docs-only deployment. The kit source LICENSE is unchanged; this task did
not change the kit repository's visibility.

These successful remote installs establish public marketplace distribution and
skill discovery. They do not establish OpenAI/Claude directory approval or
provider-backed behavior quality. Account/portal review remains pending.

## Final wrapper wording correction and reproducible repository setup

Newly authored packaged README, NOTICE and wrapper license now use visibility-neutral
“Canvas source repository” wording and state that existing source rights remain
unchanged. The packaging runbook and saved repository README use the same factual
boundary. Wrapper metadata/documentation remain MIT licensed; icon redistribution
permission and reserved trademark rights are unchanged. The npm LICENSE and
canonical skill retain their original bytes and pinned hashes. No new capability
or plugin version was introduced.

The ZIP sizes and hashes in the Delivered table are the final corrected archives.
They were rebuilt to an independent directory and compared byte for byte, every
provenance hash was checked, the seven regression tests passed, and strict Claude
validation of the final expanded Claude ZIP passed without findings. The earlier
remote-install section records the public commit tested at that time; root owns
publishing these corresponding wrapper-document corrections.

`consumer/plugin/repository/` now contains exactly the three requested setup files
read from `/private/tmp/canvas-plugins-public-20261102/`: root `README.md`,
`.agents/plugins/marketplace.json`, and `.claude-plugin/marketplace.json`.
Both saved marketplace manifests are byte-identical to that reviewed task output;
only the root README's assertion about kit visibility was replaced with neutral
existing-source-rights wording. No `.git` directory or other task-output files
were copied. These files preserve the setup that both remote CLI tests validated.

No docs preview route applies: this phase changes packaging/tooling, not app UI.

The final wrapper corrections were published at public repository commit
`90e9266c50a29078c28bbc7586336a61cdef75a7`, also tagged `v4.1.0`. This changes
wrapper wording and provenance hashes from the earlier remote-install test,
while preserving the original npm skill and LICENSE bytes.
