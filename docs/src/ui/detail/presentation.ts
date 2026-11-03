import type { DocExample, DocGuidance, DocGuidanceBlock, DocProse } from "../../core/scope";
import { DETAIL_PRESENTATION } from "./presentation-data";
import type { ColorTokens } from "@nannier/canvas";

export interface DetailPresentation {
  variants: readonly string[];
  variantNotes?: readonly string[];
  /** Variants whose card spans every column of the Variants grid. */
  fullRow?: readonly string[];
  introCount: number;
  guidance: readonly { title: string; paragraphs: number; code: boolean }[];
  noteCount: number;
  noteLeads?: readonly string[];
  related?: readonly string[];
  tokens?: readonly string[];
  tokenDeltas?: Readonly<Record<string, Readonly<Record<string, { add: readonly string[]; remove: readonly string[] }>>>>;
}

/** Apply the source renderer's token changes for each active discrete knob. */
export function referenceTokens(presentation: DetailPresentation | undefined, state: Readonly<Record<string, unknown>>): string[] | undefined {
  if (!presentation?.tokens) return undefined;
  const names = new Set(presentation.tokens);
  const additions = new Set<string>();
  for (const [key, value] of Object.entries(state)) {
    const delta = presentation.tokenDeltas?.[key]?.[JSON.stringify(value)];
    if (!delta) continue;
    for (const name of delta.remove) names.delete(name);
    for (const name of delta.add) additions.add(name);
  }
  return [...new Set([...names, ...additions])].sort();
}

/** The source's CSS-role names resolve to the same live kit values on every build. */
export function referenceTokenValue(name: string, tokens: ColorTokens): string | undefined {
  const roles: Readonly<Record<string, keyof ColorTokens>> = {
    "--bg": "background", "--bg2": "surface-sunken", "--sf": "card", "--sf2": "popover", "--sf3": "secondary", "--sf4": "surface-raised",
    "--tx": "foreground", "--tx2": "muted-foreground", "--tx3": "subtle-foreground", "--ln": "border", "--ln2": "field-border", "--hl": "highlight",
    "--ion": "primary", "--ion-fg": "primary-foreground", "--ion-tx": "primary-text", "--ion-soft": "primary-soft", "--ion-glow": "glow", "--ion-ring": "ring",
    "--ok": "success", "--ok-fg": "success-foreground", "--ok-soft": "success-soft", "--warn": "warning", "--warn-fg": "warning-foreground", "--warn-soft": "warning-soft",
    "--bad": "destructive", "--bad-fg": "destructive-foreground", "--bad-soft": "destructive-soft", "--cyan": "chart-2", "--mint": "chart-3", "--scrim": "scrim",
  };
  const role = roles[name] ?? (/^--c[1-8]$/.test(name) ? `chart-${name.slice(3)}` as keyof ColorTokens : undefined);
  if (role) return tokens[role];
  return ({ "--fd": '"Bricolage Grotesque",system-ui,sans-serif', "--ft": '"Instrument Sans",system-ui,sans-serif', "--fm": '"JetBrains Mono",ui-monospace,Menlo,monospace' } as Record<string, string>)[name];
}

export function presentationFor(slug: string): DetailPresentation | undefined {
  return (DETAIL_PRESENTATION as Readonly<Record<string, DetailPresentation>>)[slug];
}

/** Select current executable examples by the reference's labels and order. */
export function referenceVariants(examples: readonly DocExample[], presentation?: DetailPresentation) {
  const variants = examples.map((example, index) => ({ example, index })).slice(1);
  if (!presentation) return variants;
  return presentation.variants.flatMap((label) => {
    // The palette API replaced the hand-off's older "Theme picker" name.
    const currentLabel = label === "Theme picker" ? "Palette picker" : label;
    const match = variants.find(({ example }) => example.label === label) ?? variants.find(({ example }) => example.label === currentLabel);
    return match ? [{ ...match, example: { ...match.example, label, note: presentation.variantNotes?.includes(label) ? match.example.note : undefined }, full: !!presentation.fullRow?.includes(label) }] : [];
  });
}

/** Match the reference's note subjects against current, build-specific prose. */
export function referenceNotes(prose: readonly DocProse[], presentation?: DetailPresentation): DocProse[] {
  if (!presentation) return prose.slice(0, 6);
  const paragraphs = prose.filter((p): p is string => typeof p === "string");
  const used = new Set<string>();
  const leads = presentation.noteLeads ?? [];
  return leads.slice(0, presentation.noteCount).flatMap((lead) => {
    const match = paragraphs.find((p) => !used.has(p) && (p.toLowerCase().match(/[a-z0-9]+/g) ?? []).slice(0, 2).join(" ") === lead);
    if (!match) return [];
    used.add(match);
    // The prototype's document scanner caps a note at 520 source characters.
    return [match.slice(0, 520)];
  });
}

const isProse = (block: DocGuidanceBlock): block is DocProse => typeof block === "string" || "list" in block;

/** The reference draws section prose and its first snippet, without live duplicates. */
export function referenceGuidance(guidance: readonly DocGuidance[], presentation?: DetailPresentation): DocGuidance[] {
  if (!presentation) return [...guidance];
  return presentation.guidance.flatMap((section) => {
    const match = guidance.find((g) => g.title === section.title);
    if (!match) return [];
    const blocks: DocGuidanceBlock[] = match.blocks.filter(isProse).slice(0, section.paragraphs);
    const snippet = section.code ? match.blocks.find((block) => !isProse(block) && "code" in block) : undefined;
    if (snippet) blocks.push(snippet);
    return [{ ...match, blocks }];
  });
}
