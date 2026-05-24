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

export interface SearchEntry {
  title: string;
  description: string;
  path: string;
  category: string;
  keywords: string[];
}
