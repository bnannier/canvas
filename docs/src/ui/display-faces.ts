import type { FontFaces } from "@nannier/canvas";

// The display face the docs register on the web: one variable file per weight, cut by
// scripts/subset-fonts.mjs with the optical-size axis kept, which the browser sets from
// the text's size (`font-optical-sizing: auto`) as the hand-off's page does. iOS and
// Android cannot set the axis by size, so they register pinned cuts instead
// (./display-faces.native.ts).
export const DISPLAY: FontFaces = {
  "500": "BricolageGrotesque_500Medium",
  "600": "BricolageGrotesque_600SemiBold",
};

/** The files behind DISPLAY, by registered name. */
export const DISPLAY_FILES: Record<string, number> = {
  BricolageGrotesque_500Medium: require("../../assets/fonts/BricolageGrotesque_500Medium.ttf"),
  BricolageGrotesque_600SemiBold: require("../../assets/fonts/BricolageGrotesque_600SemiBold.ttf"),
};
