export interface ComponentExample {
  label?: string;
  html: string;
  code?: string;
  full?: boolean;
  allowOverflow?: boolean;
}

export interface ComponentSection {
  title: string;
  description?: string;
  anatomy?: string;
  examples: ComponentExample[];
  columns?: number;
}

export interface DontDo {
  title?: string;
  dont: { html: string; caption: string };
  do: { html: string; caption: string };
}

export interface PlaygroundControl {
  type: "pills" | "check" | "text" | "range";
  key: string;
  label: string;
  options?: string[];
  cols?: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabledWhen?: (state: Record<string, unknown>) => boolean;
}

export interface PlaygroundConfig {
  controls: PlaygroundControl[];
  defaults: Record<string, unknown>;
  render: (state: Record<string, unknown>) => string;
}

export interface ComponentDoc {
  slug: string;
  name: string;
  description: string;
  category: Category;
  sections: ComponentSection[];
  playground?: PlaygroundConfig;
  donts?: DontDo[];
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
