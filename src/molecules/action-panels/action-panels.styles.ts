import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette } from "../../style/index.js";

// Co-located ActionPanel skins, one per platform. ActionPanel is a "Light"
// platform treatment: ONE structure (a settings card with a copy block and a
// single action), with only small per-OS touches on the layout rhythm and the
// type. The shared shell (action-panels.shared.tsx) owns the structure, the
// prop axes, and the tone-color logic (the danger-zone red and the neutral
// token foreground); the skin carries ONLY the per-OS-varying pieces:
//   - the title type (weight / size / tracking),
//   - the description type (size / tracking),
//   - the layout rhythm (copy gap, the inline-row gap, the stacked gap).
//
// The BRAND survives on every platform: the action itself is the platform-skinned
// Button / Switch atom (those bring their own per-OS shape and press feedback, so
// this molecule does NOT re-skin them), and the danger-zone red is the same
// semantic red on every OS. Only the native type tracking and spacing shift:
//   iOS (HIG / SwiftUI grouped-list & Form rows): SF type with tightened title
//     tracking and a roomier inline gap, matching iOS settings-row rhythm.
//   Android (Material 3 list / card): M3 label tracking on the title (positive
//     tracking, M3 title-medium convention) over the same scale.
//   Web: the established Canvas look (the current action-panel, lifted verbatim):
//     14pt/600 title, 14pt muted description, 4pt copy gap, 24pt inline gap,
//     16pt stacked gap, no tracking.
//
// ActionPanel itself has NO pressable rows of its own (its only interactive
// elements are the composed Button / Switch atoms), so there is no per-OS press
// feedback for the molecule to carry — the atoms own it.

export type Tone = "destructive" | "neutral";
export type Layout = "inline" | "stacked";

// The contract a platform skin fulfills. The shell renders the card, the copy
// block, the title/description, and the action; the skin maps the active
// platform's type and spacing onto the copy + the two body layouts.
export interface ActionPanelSkin {
  /** Title type (weight / size / tracking). The tone color is supplied by shared. */
  titleType: TextStyle;
  /** Description type (size / line-height / tracking). The muted color is supplied by shared. */
  descriptionType: TextStyle;
  /** Vertical gap between the title and its consequence line. */
  copyGap: number;
  /** Horizontal gap between the copy and the pinned action in the inline/toggle row. */
  inlineGap: number;
  /** Vertical gap between the copy and the action in the stacked layout. */
  stackedGap: number;
}

// The danger-zone red rides the Tailwind palette (fixed per scheme so it stays a
// red rather than following the semantic tokens); this is platform-neutral and
// therefore lives here as a helper the shell calls, shared by every skin.
export function titleColor(tokens: ColorTokens, dark: boolean, tone: Tone): string {
  return tone === "destructive"
    ? dark
      ? palette["red-400"]
      : palette["red-700"]
    : tokens["card-foreground"];
}

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// The current action-panel: a 14pt/600 title sharing the settings-row scale, a
// 14pt muted description, a 4pt copy gap, a 24pt inline-row gap, and a 16pt
// stacked gap. No type tracking.
export const webSkin: ActionPanelSkin = {
  titleType: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
  descriptionType: { fontSize: 14, lineHeight: 20 },
  copyGap: 4,
  inlineGap: 24,
  stackedGap: 16,
};

// ---------- iOS (HIG / SwiftUI grouped-list & Form rows) ----------
// iOS settings rows use SF type. Keeping Canvas's 14pt scale, the title takes the
// SF tightened tracking (-0.24) and the inline action sits with a roomier gap (the
// iOS grouped-row rhythm); the stacked gap matches.
export const iosSkin: ActionPanelSkin = {
  titleType: { fontSize: 14, lineHeight: 20, fontWeight: "600", letterSpacing: -0.24 },
  descriptionType: { fontSize: 14, lineHeight: 20, letterSpacing: -0.16 },
  copyGap: 4,
  inlineGap: 28,
  stackedGap: 16,
};

// ---------- Android (Material 3 list / card) ----------
// M3 uses positive label tracking. The title takes the M3 title-medium tracking
// (+0.15) and the body the M3 body tracking (+0.25) over Canvas's 14pt scale; the
// action row sits a touch tighter (the M3 card-action rhythm).
export const androidSkin: ActionPanelSkin = {
  titleType: { fontSize: 14, lineHeight: 20, fontWeight: "600", letterSpacing: 0.15 },
  descriptionType: { fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  copyGap: 4,
  inlineGap: 24,
  stackedGap: 16,
};
