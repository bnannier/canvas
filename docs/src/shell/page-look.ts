import type { ColorTokens } from "@nannier/canvas";

// The docs' page look: the v4 hand-off's page, which is flat, the scheme's `background`
// behind everything (tools/v4/handoff; audit/v4-redesign/PLAN.md, D8). Docs-only
// scaffolding: nothing here enters the kit. It replaced Dark Factory's page (the 165 deg
// gradient, the blurred orbs, the frosted shell and its wedges, the `df-argus-shell` card)
// on 2026-10-27, and is judged against the `v4-glass` card's page (the evidence log,
// tools/native/liquid-motion.md). The hand-off's grain and its floating chrome land with
// the docs shell (phase 3).
//
// Plain TypeScript with no React Native import, so it is tested on its own
// (test/docs-page-look.test.ts) and the e2e paint check reads it.

export type ShellTier = "phone" | "tablet" | "desktop";

/** The page colour behind the docs in a theme: the scheme's own `background`, whatever the palette. */
export function pageColor(tokens: Pick<ColorTokens, "background">): string {
  return tokens.background;
}

/** The shell's tier for a window this wide: Canvas's form factors. */
export function shellTier(width: number): ShellTier {
  return width <= 640 ? "phone" : width <= 1024 ? "tablet" : "desktop";
}
