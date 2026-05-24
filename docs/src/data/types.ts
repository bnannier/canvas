export interface CssClass {
  name: string;
  description: string;
  type: "base" | "variant" | "size" | "state" | "sub-element";
}

export interface ComponentExample {
  title: string;
  description?: string;
  html: string;
}

export interface ComponentDoc {
  slug: string;
  name: string;
  description: string;
  cssFile: string;
  category: Category;
  classes: CssClass[];
  examples: ComponentExample[];
  notes?: string;
}

export type Category =
  | "Layout"
  | "Typography"
  | "Forms"
  | "Data Display"
  | "Feedback"
  | "Navigation";

export const CATEGORIES: Category[] = [
  "Layout",
  "Typography",
  "Forms",
  "Data Display",
  "Feedback",
  "Navigation",
];

export interface GuidePage {
  slug: string;
  title: string;
  description: string;
  section: "Foundations" | "Guides";
}

export interface SearchEntry {
  title: string;
  description: string;
  path: string;
  category: string;
  keywords: string[];
}
