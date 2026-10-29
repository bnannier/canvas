import type { FontFaces } from "@nannier/canvas";

// The display face the docs register on iOS and Android. Both draw a variable font at its
// default optical size (96) whatever the text's size, so a 22 px card title would take the
// wide, tight 96 pt cut where the browser draws the 22 pt one. Each weight is registered as
// the cuts scripts/subset-fonts.mjs pins at the display roles' sizes, and the kit's font
// resolver (ThemeFonts optical cuts) takes the cut nearest the text's size. The web
// registers none of these: its document declares one variable file for every weight, whose
// optical-size axis the browser sets from the text's size (./fonts.ts).
export const DISPLAY: FontFaces = {
  "500": {
    17: "BricolageGrotesque_500Medium_opsz17",
    22: "BricolageGrotesque_500Medium_opsz22",
    28: "BricolageGrotesque_500Medium_opsz28",
    34: "BricolageGrotesque_500Medium_opsz34",
    44: "BricolageGrotesque_500Medium_opsz44",
    56: "BricolageGrotesque_500Medium_opsz56",
    72: "BricolageGrotesque_500Medium_opsz72",
    96: "BricolageGrotesque_500Medium_opsz96",
  },
  "600": {
    17: "BricolageGrotesque_600SemiBold_opsz17",
    22: "BricolageGrotesque_600SemiBold_opsz22",
    28: "BricolageGrotesque_600SemiBold_opsz28",
    34: "BricolageGrotesque_600SemiBold_opsz34",
    44: "BricolageGrotesque_600SemiBold_opsz44",
    56: "BricolageGrotesque_600SemiBold_opsz56",
    72: "BricolageGrotesque_600SemiBold_opsz72",
    96: "BricolageGrotesque_600SemiBold_opsz96",
  },
};

/** The files behind DISPLAY, by registered name. */
export const DISPLAY_FILES: Record<string, number> = {
  BricolageGrotesque_500Medium_opsz17: require("../../assets/fonts/BricolageGrotesque_500Medium_opsz17.ttf"),
  BricolageGrotesque_500Medium_opsz22: require("../../assets/fonts/BricolageGrotesque_500Medium_opsz22.ttf"),
  BricolageGrotesque_500Medium_opsz28: require("../../assets/fonts/BricolageGrotesque_500Medium_opsz28.ttf"),
  BricolageGrotesque_500Medium_opsz34: require("../../assets/fonts/BricolageGrotesque_500Medium_opsz34.ttf"),
  BricolageGrotesque_500Medium_opsz44: require("../../assets/fonts/BricolageGrotesque_500Medium_opsz44.ttf"),
  BricolageGrotesque_500Medium_opsz56: require("../../assets/fonts/BricolageGrotesque_500Medium_opsz56.ttf"),
  BricolageGrotesque_500Medium_opsz72: require("../../assets/fonts/BricolageGrotesque_500Medium_opsz72.ttf"),
  BricolageGrotesque_500Medium_opsz96: require("../../assets/fonts/BricolageGrotesque_500Medium_opsz96.ttf"),
  BricolageGrotesque_600SemiBold_opsz17: require("../../assets/fonts/BricolageGrotesque_600SemiBold_opsz17.ttf"),
  BricolageGrotesque_600SemiBold_opsz22: require("../../assets/fonts/BricolageGrotesque_600SemiBold_opsz22.ttf"),
  BricolageGrotesque_600SemiBold_opsz28: require("../../assets/fonts/BricolageGrotesque_600SemiBold_opsz28.ttf"),
  BricolageGrotesque_600SemiBold_opsz34: require("../../assets/fonts/BricolageGrotesque_600SemiBold_opsz34.ttf"),
  BricolageGrotesque_600SemiBold_opsz44: require("../../assets/fonts/BricolageGrotesque_600SemiBold_opsz44.ttf"),
  BricolageGrotesque_600SemiBold_opsz56: require("../../assets/fonts/BricolageGrotesque_600SemiBold_opsz56.ttf"),
  BricolageGrotesque_600SemiBold_opsz72: require("../../assets/fonts/BricolageGrotesque_600SemiBold_opsz72.ttf"),
  BricolageGrotesque_600SemiBold_opsz96: require("../../assets/fonts/BricolageGrotesque_600SemiBold_opsz96.ttf"),
};
