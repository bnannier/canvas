# Canvas UI

Build or fix application UI with `@nannier/canvas`, the universal React Native UI
kit for web, iOS, and Android. This plugin guides an agent through the installed
API, semantic boolean props, responsive layout, state, overlays and accessibility.
It uses the same canonical Canvas application skill shipped on npm.
The publisher is **Bobby Nannier**.

The agent needs an accessible application workspace and the development tools
required by that app. Local and supported cloud workspaces can work. Browser
checks need a browser; native runtime checks need an available simulator or
device. Report unavailable runtime checks. Plain chat without workspace tools
cannot implement or verify an app. Installing the plugin does not install Canvas
or its peer dependencies, connect an account, or grant workspace access.

The package contains one skill, product artwork, metadata and documentation.
It adds no MCP server, hooks, telemetry, executable scripts or account connection.
The agent may fetch Canvas documentation or use the app's package manager when
the requested work needs them. Those actions use the host's tools and permission
rules. This plugin does not replace a different chosen UI library, edit the
Canvas source repository, or publish an app.

## Try it

- “Build a settings screen with Canvas for web, iOS, and Android.”
- “Fix the Canvas dialog in this app and verify keyboard focus.”
- “Check this Canvas layout at desktop and phone widths.”

OpenAI: install the OpenAI ZIP through the host's supported local-plugin import
or the owner's published listing once available. The ZIP has `plugin.json` at its
root and `skills/canvas/SKILL.md`; no extra enclosing directory is needed. Invoke
Canvas UI or `$canvas` where the host supports skill invocation.

Claude Code: extract the Claude ZIP to an empty directory and run
`claude plugin validate /absolute/path/to/canvas-plugin --strict`. To load it for
one session, run `claude --plugin-dir /absolute/path/to/canvas-plugin` from the
application workspace, then invoke `/canvas:canvas`. This session-local option
avoids changing persistent settings. Team marketplace installation is a separate
owner/admin distribution step through the approved Canvas plugins repository.
Install from the publisher's marketplace with:

```text
/plugin install canvas --marketplace bnannier/canvas-plugins
```

For isolated validation, set `CLAUDE_CONFIG_DIR` to a newly created temporary
directory before running `claude plugin validate`. Avoid running model-backed
sessions during packaging validation. The portable OpenAI manifest can be
validated against its declared Agent Plugins schema. A supported local
marketplace can be used for a Codex installation smoke check in a disposable
`CODEX_HOME`; see the source packaging runbook for the tested command sequence.

Documentation: [Canvas](https://canvas.nannier.com/) and the
[machine-readable index](https://canvas.nannier.com/llms.txt).
Repository: [Canvas plugins](https://github.com/bnannier/canvas-plugins).
Support: [Plugin issues](https://github.com/bnannier/canvas-plugins/issues).

The copied npm skill retains its original MIT `LICENSE`. Newly generated wrapper
metadata and documentation use the scoped MIT `LICENSE.wrapper.txt`. The owner
permits distribution of the Canvas icons with these plugins; trademark rights
remain reserved. These permissions do not license the Canvas source.
See `NOTICE.md` and `PROVENANCE.json` for content scope and release provenance.
Directory availability and account verification are established by the submitting
account, not by this archive.
