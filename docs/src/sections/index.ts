import type { ComponentType } from "react";
import type { SectionId } from "../data/rooms";
import * as foundations from "./foundations";
import * as layout from "./layout";
import * as controls from "./controls";
import * as inputs from "./inputs";
import * as navigation from "./navigation";
import * as data from "./data";
import * as charts from "./charts";
import * as overlays from "./overlays";

// The section pages (`/sections/<id>`, docs/src/app/(components)/sections/[section].tsx):
// each section's hero vignette and its cards, from the section's own module, so the pages
// are built one file each.

export interface SectionPage {
  /** The hero's still vignette, framed by VignetteStage (null for none). */
  Vignette: ComponentType;
  /** The page's cards, in ShowcaseGrids (and Data's ShowcaseGroups). */
  Cards: ComponentType;
}

export const SECTION_PAGES: Readonly<Record<SectionId, SectionPage>> = {
  foundations,
  layout,
  controls,
  inputs,
  navigation,
  data,
  charts,
  overlays,
};
