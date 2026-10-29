import type { ReactNode } from "react";
import { Typography, Divider, Container, Column, Row, View } from "@nannier/canvas";
import { parseInline } from "../lib/inline-markdown";
import type { DocProse } from "../core/scope";

// Docs names are composition aliases; the kit owns all type and divider styling.
export function H1({ children }: { children: ReactNode }) { return <Typography h1>{children}</Typography>; }
export function H2({ children }: { children: ReactNode }) { return <Typography h2>{children}</Typography>; }
export function H3({ children }: { children: ReactNode }) { return <Typography h3>{children}</Typography>; }
export function P({ children, muted }: { children: ReactNode; muted?: boolean }) { return <Typography subtle={muted}>{children}</Typography>; }
export function Lead({ children }: { children: ReactNode }) { return <Container xxl start><Typography lead subtle>{children}</Typography></Container>; }
export function Rule() { return <Divider />; }

// The reading role a line of prose is set in. A strong run repeats it at semibold, so a
// bold word keeps its paragraph's size; a heading is set strong already, so a strong run
// in one is its plain text. A code span takes the same role so its chip sizes from it.
type ReadingRole = { lead?: boolean; pageLead?: boolean; sectionLead?: boolean; pageBody?: boolean; pageNote?: boolean; guideBody?: boolean; specText?: boolean; small?: boolean };
type ProseRole = ReadingRole & { subtle?: boolean; heading?: boolean };

/**
 * A word of code inside a sentence: the kit's prose code chip (`<Typography code inline>`,
 * the hand-off's inline `<code>` from its Markdown helper), sized at .88 of the reading
 * role it sits in. The chip keeps its regular weight and its own foreground ink inside a
 * strong or subtle run, as the hand-off applies bold and code independently.
 */
export function InlineCode({ children, lead, pageLead, sectionLead, pageBody, pageNote, guideBody, specText, small }: { children: ReactNode } & ReadingRole) {
  return <Typography code inline lead={lead} pageLead={pageLead} sectionLead={sectionLead} pageBody={pageBody} pageNote={pageNote} guideBody={guideBody} specText={specText} small={small}>{children}</Typography>;
}

/**
 * A line of a component's .md prose (a description, a note, a Do/Don't caption or title)
 * as the children of the Typography it sits in: its code spans on the prose code chip,
 * its strong runs at semibold, nothing printed with its Markdown syntax
 * (docs/src/lib/inline-markdown.ts, the grammar the generator holds every page to).
 */
export function InlineMarkdown({ text, lead, pageLead, sectionLead, pageBody, pageNote, guideBody, specText, small, subtle, heading }: { text: string } & ProseRole) {
  return (
    <>
      {parseInline(text).map((run, i) => {
        if (run.code) return <InlineCode key={i} lead={lead} pageLead={pageLead} sectionLead={sectionLead} pageBody={pageBody} pageNote={pageNote} guideBody={guideBody} specText={specText} small={small}>{run.text}</InlineCode>;
        if (run.strong && !heading) return <Typography key={i} lead={lead} pageLead={pageLead} sectionLead={sectionLead} pageBody={pageBody} pageNote={pageNote} guideBody={guideBody} specText={specText} small={small} subtle={subtle} semibold>{run.text}</Typography>;
        return run.text;
      })}
    </>
  );
}

/** The role a block of prose is set in: the body (or `small`), or a page's own prose role (its body, note or guidance paragraph). */
type BlockRole = { small?: boolean; subtle?: boolean; pageBody?: boolean; pageNote?: boolean; guideBody?: boolean };

/** One paragraph of inline Markdown, in the body role (or `small`, or a page prose role). */
export function Paragraph({ text, small, subtle, pageBody, pageNote, guideBody }: { text: string } & BlockRole) {
  return <Typography small={small} subtle={subtle} pageBody={pageBody} pageNote={pageNote} guideBody={guideBody}><InlineMarkdown text={text} small={small} subtle={subtle} pageBody={pageBody} pageNote={pageNote} guideBody={guideBody} /></Typography>;
}

// A bulleted list with list semantics: a `list` whose items are each a `listitem`, which
// react-native-web renders as the very elements (`ul` of `li`), so a screen reader names
// the list, counts its items and moves by item. Each item is a kit Row of the bullet and
// its paragraph; the bullet is hidden from assistive tech, which the list role already
// tells. Docs frame scaffolding by the owner's ruling (audit/DECISIONS.md, K2 lists):
// composed of kit primitives and Typography, never added to the kit for the docs. The
// items sit flush, as a browser sets a tight list, because a gap between them would take
// a layout wrapper between the list and its items, which the list role forbids.
export function BulletList({ items, small, subtle, pageBody, pageNote, guideBody }: { items: string[] } & BlockRole) {
  return (
    <View role="list">
      {items.map((item, i) => (
        <View key={i} role="listitem">
          <Row snug>
            <View aria-hidden>
              <Typography small={small} pageBody={pageBody} pageNote={pageNote} guideBody={guideBody} subtle>•</Typography>
            </View>
            <Column fill>
              <Paragraph text={item} small={small} subtle={subtle} pageBody={pageBody} pageNote={pageNote} guideBody={guideBody} />
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
export function Prose({ blocks, relaxed, small, subtle, pageBody, pageNote, guideBody }: { blocks: DocProse[]; /** 16 between blocks, a page section's own rhythm, in place of 8. */ relaxed?: boolean } & BlockRole) {
  return (
    <Column snug={!relaxed} relaxed={relaxed}>
      {blocks.map((block, i) =>
        typeof block === "string" ? (
          <Paragraph key={i} text={block} small={small} subtle={subtle} pageBody={pageBody} pageNote={pageNote} guideBody={guideBody} />
        ) : (
          <BulletList key={i} items={block.list} small={small} subtle={subtle} pageBody={pageBody} pageNote={pageNote} guideBody={guideBody} />
        ),
      )}
    </Column>
  );
}
