import type { ReactNode } from "react";
import { Typography, Divider, Container, Column, Row, View } from "@nannier/canvas";
import { geistMono } from "./fonts";
import { parseInline } from "../lib/inline-markdown";
import type { DocProse } from "../core/scope";

export const MONO = geistMono("400");

// Docs names are composition aliases; the kit owns all type and divider styling.
export function H1({ children }: { children: ReactNode }) { return <Typography h1>{children}</Typography>; }
export function H2({ children }: { children: ReactNode }) { return <Typography h2>{children}</Typography>; }
export function H3({ children }: { children: ReactNode }) { return <Typography h3>{children}</Typography>; }
export function P({ children, muted }: { children: ReactNode; muted?: boolean }) { return <Typography subtle={muted}>{children}</Typography>; }
export function Lead({ children }: { children: ReactNode }) { return <Container xxl start><Typography lead subtle>{children}</Typography></Container>; }
export function InlineCode({ children, strong }: { children: ReactNode; strong?: boolean }) { return <Typography mono semibold={strong}>{children}</Typography>; }
export function Rule() { return <Divider />; }

// The role a line of prose is set in. A strong run repeats it at semibold, so a bold word
// keeps its paragraph's size; a heading is set strong already, so a strong run in one is
// its plain text.
type ProseRole = { lead?: boolean; small?: boolean; subtle?: boolean; heading?: boolean };

/**
 * A line of a component's .md prose (a description, a note, a Do/Don't caption or title)
 * as the children of the Typography it sits in: its code spans in the mono face, its
 * strong runs at semibold, nothing printed with its Markdown syntax
 * (docs/src/lib/inline-markdown.ts, the grammar the generator holds every page to).
 */
export function InlineMarkdown({ text, lead, small, subtle, heading }: { text: string } & ProseRole) {
  return (
    <>
      {parseInline(text).map((run, i) => {
        if (run.code) return <InlineCode key={i} strong={run.strong && !heading}>{run.text}</InlineCode>;
        if (run.strong && !heading) return <Typography key={i} lead={lead} small={small} subtle={subtle} semibold>{run.text}</Typography>;
        return run.text;
      })}
    </>
  );
}

/** One paragraph of inline Markdown, in the body role (or `small`). */
export function Paragraph({ text, small, subtle }: { text: string; small?: boolean; subtle?: boolean }) {
  return <Typography small={small} subtle={subtle}><InlineMarkdown text={text} small={small} subtle={subtle} /></Typography>;
}

// A bulleted list with list semantics: a `list` whose items are each a `listitem`, which
// react-native-web renders as the very elements (`ul` of `li`), so a screen reader names
// the list, counts its items and moves by item. Each item is a kit Row of the bullet and
// its paragraph; the bullet is hidden from assistive tech, which the list role already
// tells. Docs frame scaffolding by the owner's ruling (audit/DECISIONS.md, K2 lists):
// composed of kit primitives and Typography, never added to the kit for the docs. The
// items sit flush, as a browser sets a tight list, because a gap between them would take
// a layout wrapper between the list and its items, which the list role forbids.
export function BulletList({ items, small, subtle }: { items: string[]; small?: boolean; subtle?: boolean }) {
  return (
    <View role="list">
      {items.map((item, i) => (
        <View key={i} role="listitem">
          <Row snug>
            <View aria-hidden>
              <Typography small={small} subtle>•</Typography>
            </View>
            <Column fill>
              <Paragraph text={item} small={small} subtle={subtle} />
            </Column>
          </Row>
        </View>
      ))}
    </View>
  );
}

/**
 * Prose from a component's .md (its overview, an example's note, a guidance paragraph):
 * each paragraph, and each bullet list as a list.
 */
export function Prose({ blocks, small, subtle }: { blocks: DocProse[]; small?: boolean; subtle?: boolean }) {
  return (
    <Column snug>
      {blocks.map((block, i) =>
        typeof block === "string" ? (
          <Paragraph key={i} text={block} small={small} subtle={subtle} />
        ) : (
          <BulletList key={i} items={block.list} small={small} subtle={subtle} />
        ),
      )}
    </Column>
  );
}
