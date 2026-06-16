import type { ReactNode } from "react";
import type { ColorTokens } from "@olympusoss/canvas";

// The scope an example fence renders against: every Canvas export (components,
// primitives, the alpha/shadow/palette style helpers) plus the live, theme-aware
// `tokens`. This mirrors the docs runtime LIVE_SCOPE (docs/src/live-scope.ts), but
// as a STATIC type, so every generated example fence is type-checked against the
// real component prop types at build time — a guarantee the old runtime sucrase +
// `new Function` engine could never give.
//
// A generated example module is a pure function of this scope: it destructures the
// names its fence uses and returns the fence as JSX. The consuming Playground builds
// the scope value and injects the active `tokens`:
//   - on web it builds three scopes (web / iOS / Android) by swapping in the
//     per-platform skins, to render the three-up comparison; and
//   - on native it builds one scope from the device skins Metro already resolved.
// No `eval`, no sucrase, Hermes-safe.
export type ExampleScope = typeof import("@olympusoss/canvas") & { tokens: ColorTokens };

// A generated example module's default export.
export type ExampleRender = (scope: ExampleScope) => ReactNode;

export interface DocExample {
  label: string;
  // The verbatim fence source, for the CodeBlock display beneath the preview.
  code: string;
  render: ExampleRender;
}

export interface DocDontSide {
  caption: string;
  code: string;
  render: ExampleRender;
}

export interface DocDontPair {
  title?: string;
  do: DocDontSide;
  dont: DocDontSide;
}

export interface DocEntry {
  // The source directory / `.md` stem (src/<category>/<dir>/<dir>.md). The URL slug
  // can differ (see the components data); the consuming page maps slug -> dir.
  dir: string;
  category: "atoms" | "molecules" | "organisms";
  examples: DocExample[];
  donts: DocDontPair[];
}
