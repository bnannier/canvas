import { type ReactNode } from "react";

export interface ComponentDoc {
  slug: string;
  name: string;
  description: string;
  category: Category;
  // Source directory under src/<level>/, when it differs from the URL slug.
  // Used when one docs page covers multiple exports (e.g. the Row & Column
  // page reads /components/row-column while loading from src/atoms/layout/).
  // Defaults to slug when omitted.
  dir?: string;
  // How the live preview positions the example within each platform row.
  // `center` (the default) shrink-wraps the example and centers it, which is
  // right for naturally-sized atoms (Button, Badge, Avatar). `start` makes the
  // example fill the row width and align to the leading edge, which is right for
  // block-level, leading-aligned components (Breadcrumb is a full-width nav trail
  // that reads from the left and should never preview centered).
  stageAlign?: "center" | "start";
  // Render ONE live preview instead of the stacked iOS/Android/Web 3-up. Right for a
  // component that IS full app chrome and reads as a single product surface rather than a
  // per-OS specimen to compare (Sidebar, whose example is a whole responsive app shell).
  // No-op on native, where the stage is already a single device preview.
  singlePreview?: boolean;
}

export type Category =
  | "Atoms"
  | "Molecules"
  | "Organisms"
  | "Charts";

export const CATEGORIES: Category[] = [
  "Atoms",
  "Molecules",
  "Organisms",
  "Charts",
];

export interface GuidePage {
  slug: string;
  title: string;
  description: string;
  section: "Foundations" | "Guides";
}

export interface TemplateSection {
  title: string;
  description?: string;
  anatomy?: string;
  /** Legacy raw-HTML mockup, rendered through the interpreter. Being replaced by
   *  `render` (real kit components); a section supplies one or the other. */
  html?: string;
  /** The section's live example built from real Canvas components (the dogfood
   *  path). When present it renders instead of `html`. */
  render?: () => ReactNode;
}

export interface TemplateDoc {
  slug: string;
  name: string;
  description: string;
  sections: TemplateSection[];
}

export interface PatternSection {
  title: string;
  description?: string;
  anatomy?: string;
  /** Legacy raw-HTML mockup, rendered through the interpreter. Being replaced by
   *  `render` (real kit components); a section supplies one or the other. */
  html?: string;
  /** The section's live example built from real Canvas components (the dogfood
   *  path). When present it renders instead of `html`. */
  render?: () => ReactNode;
}

export interface PatternDoc {
  slug: string;
  name: string;
  description: string;
  sections: PatternSection[];
}

export interface SearchEntry {
  title: string;
  description: string;
  path: string;
  category: string;
  keywords: string[];
}
