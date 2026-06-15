export interface ComponentDoc {
  slug: string;
  name: string;
  description: string;
  category: Category;
  // Source directory under src/<level>/, when it differs from the URL slug.
  // The published package keeps its own names (e.g. the Sidebar / Switch
  // exports), so the docs URL can read /components/navigation while the docs
  // still load from src/organisms/sidebar/. Defaults to slug when omitted.
  dir?: string;
}

export type Category =
  | "Atoms"
  | "Molecules"
  | "Organisms";

export const CATEGORIES: Category[] = [
  "Atoms",
  "Molecules",
  "Organisms",
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
  html: string;
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
  html: string;
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
