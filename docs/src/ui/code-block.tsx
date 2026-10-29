import { CodeBlock as KitCodeBlock } from "@nannier/canvas";

// The docs' code panel IS the kit CodeBlock (dogfooding). The hand-rolled
// TSX highlighter + copy chip that used to live here were absorbed into the kit
// component, which now tokenizes cross-platform, scrolls long lines, and writes
// the clipboard itself (navigator.clipboard on web, expo-clipboard natively).
// This adapter only pins the docs-wide defaults: compact density (unless the v4 detail
// page's own `snippet` or `guide` density is asked for), the TSX grammar, and a copy
// chip. It is always the standalone rounded block: the preview stage sits a gap above
// it, never flush to its top edge.
export function CodeBlock({
  code,
  wrap,
  language = "tsx",
  headerless,
  snippet,
  guide,
}: {
  code: string;
  /** Soft-wrap long lines instead of scrolling them (the kit CodeBlock's `wrap`).
   *  For short teaching snippets (the Do/Don't cards), where a scrolled-away tail
   *  defeats the point on a phone. */
  wrap?: boolean;
  language?: string;
  /** The v4 detail page's snippet: highlighted with no header bar and no copy chip, as
   *  the hand-off draws its section snippets (a floating chip would sit over long lines). */
  headerless?: boolean;
  /** The detail page's own snippet (the kit CodeBlock's `snippet` density): the Usage
   *  section's block, 16 by 18 at 13 / 1.7 on the code-card corner. */
  snippet?: boolean;
  /** A guidance card's snippet (the kit CodeBlock's `guide` density): 12 by 14 at
   *  12 / 1.65 on the card-snippet corner. */
  guide?: boolean;
}) {
  return <KitCodeBlock code={code} language={language} compact={!snippet && !guide} snippet={snippet} guide={guide} copy={!headerless} headerless={headerless} wrap={wrap} />;
}
