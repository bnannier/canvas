# Canvas UI plugins

Agent guidance for building with [`@nannier/canvas`](https://www.npmjs.com/package/@nannier/canvas), published by **Bobby Nannier**. The Canvas library runs on web, iOS and Android. These plugins contain the same skill distributed in npm version **4.1.0**, plus platform manifests and Canvas icons.

## Codex

```sh
codex plugin marketplace add https://github.com/bnannier/canvas-plugins.git
codex plugin add canvas@canvas-plugins
```

## Claude Code

```sh
claude plugin marketplace add bnannier/canvas-plugins
claude plugin install canvas@canvas-plugins
```

From the application workspace, ask the agent to build or fix a Canvas screen, or invoke its installed Canvas skill. An accessible workspace and development tools are required; platform runtime checks need an available simulator or device. Installation does not install the Canvas library or its peer dependencies into your application.

## Try it

- Build a settings screen with Canvas for web, iOS and Android.
- Fix a Canvas dialog and verify keyboard focus.
- Check a Canvas layout at desktop and phone widths.

Read the [Canvas agent guide](https://canvas.nannier.com/agents.md) and [API index](https://canvas.nannier.com/llms.txt). Report setup issues in [this repository](https://github.com/bnannier/canvas-plugins/issues), with package/client versions and a small text reproduction. Do not include credentials or private application code.

## Scope and licensing

This repository contains plugin assets only. Existing rights of the Canvas source repository remain unchanged. There are no MCP servers, hooks, executables or telemetry in these plugins. The host agent uses its own tools and permissions to read an application workspace, fetch documentation and make requested changes.

The npm-derived skill files retain their original packaged MIT LICENSE. Newly generated wrapper metadata and documentation have the scoped MIT grant in LICENSE.wrapper.txt. Canvas icons may be redistributed with these plugins; trademark rights remain reserved as described in NOTICE.md. Each platform directory includes its own licenses and PROVENANCE.json with file hashes and registry integrity.

A public repository and working CLI install are separate from public directory approval. No OpenAI or Anthropic directory listing is claimed here.
