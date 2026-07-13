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
