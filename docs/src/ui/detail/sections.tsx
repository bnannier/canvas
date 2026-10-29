import type { ReactNode, Ref } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { View, Grid, Card, Column, Row, Typography, Chip, Swatch, Divider, Icon, type ColorTokens } from "@nannier/canvas";
import type { DocDontPair, DocGuidance, DocGuidanceBlock, DocProse, ExampleScope } from "../../core/scope";
import { getComponent } from "../../core/data/components";
import { SECTIONS } from "../../core/data/detail-sections";
import { CodeBlock } from "../code-block";
import { DoDontCard } from "../dont";
import { InlineMarkdown, Prose } from "../prose";
import { ExampleErrorBoundary, FitStage } from "../stage";
import { DetailSection } from "./frame";

// The detail page's closing sections (Component.dc.html `#cv-use`, `#cv-tok`, the related
// grid and the previous / next pair), with the repository's Do & Don't after Usage (PLAN
// decision P3).

/** A live guidance example over its source, found by the tooling attribute every example carries. */
function GuidanceExample({ code, render, scope }: { code: string; render: (scope: ExampleScope) => ReactNode; scope: ExampleScope }) {
  return (
    <Column snug>
      <View {...(Platform.OS === "web" ? ({ dataSet: { previewStage: "" } } as object) : null)}>
        <ExampleErrorBoundary>
          <FitStage code={code}>{render(scope)}</FitStage>
        </ExampleErrorBoundary>
      </View>
      <CodeBlock headerless code={code} />
    </Column>
  );
}

const isProse = (block: DocGuidanceBlock): block is DocProse => typeof block === "string" || "list" in block;

/** One guidance section of the .md as a card: its title, prose, sub-headings and live examples in order. */
function GuidanceCard({ section, scope }: { section: DocGuidance; scope: ExampleScope }) {
  const runs: (DocProse[] | Exclude<DocGuidanceBlock, DocProse>)[] = [];
  for (const block of section.blocks) {
    const last = runs[runs.length - 1];
    if (!isProse(block)) runs.push(block);
    else if (Array.isArray(last)) last.push(block);
    else runs.push([block]);
  }
  return (
    // The hand-off's guidance card (line 285): `padding:18px 20px;border:1px solid var(--ln);
    // border-radius:18px;background:var(--sf);...;gap:10px`, no shadow; the card owns the rhythm.
    <Card guide largeCorners outlined>
      <Typography h5 level={3}><InlineMarkdown text={section.title} heading /></Typography>
      {runs.map((run, i) =>
        Array.isArray(run) ? (
          <Prose key={i} blocks={run} small subtle />
        ) : "heading" in run ? (
          <Typography key={i} small semibold><InlineMarkdown text={run.heading} heading /></Typography>
        ) : (
          <GuidanceExample key={i} code={run.code} render={run.render} scope={scope} />
        ),
      )}
    </Card>
  );
}

export function UsageSection({ note, code, overview, guidance, scope, sectionRef }: {
  /** The Usage example's own note (the .md's `## Usage` prose). */
  note?: DocProse[];
  /** The Usage example's source. */
  code?: string;
  overview?: DocProse[];
  guidance: readonly DocGuidance[];
  scope: ExampleScope;
  sectionRef?: Ref<View>;
}) {
  if (!note?.length && !code && !overview?.length && guidance.length === 0) return null;
  return (
    <DetailSection id="use" title="Usage" sectionRef={sectionRef}>
      {note?.length ? <Prose blocks={note} pageBody relaxed /> : null}
      {code ? <CodeBlock headerless code={code} /> : null}
      {overview?.length ? <Prose blocks={overview} pageNote relaxed /> : null}
      {guidance.length ? (
        <Grid minTileWidth={420} roomy>
          {guidance.map((section) => <GuidanceCard key={section.title} section={section} scope={scope} />)}
        </Grid>
      ) : null}
    </DetailSection>
  );
}

export function DoDontSection({ donts, scope, sectionRef }: { donts: readonly DocDontPair[]; scope: ExampleScope; sectionRef?: Ref<View> }) {
  if (donts.length === 0) return null;
  return (
    <DetailSection id="dodont" title="Do & Don’t" sectionRef={sectionRef}>
      {donts.map((pair, i) => (
        <Column key={i} snug>
          {pair.title ? <Typography h5 level={3}><InlineMarkdown text={pair.title} heading /></Typography> : null}
          <Row stacks stackBreakpoint="md" relaxed>
            <Column span={6}><DoDontCard dont caption={pair.dont.caption}>{pair.dont.render(scope)}</DoDontCard></Column>
            <Column span={6}><DoDontCard do caption={pair.do.caption}>{pair.do.render(scope)}</DoDontCard></Column>
          </Row>
        </Column>
      ))}
    </DetailSection>
  );
}

/** A section's components in the hand-off's order, every section after the last. */
const ORDER: readonly string[] = SECTIONS.flatMap((s) => [...s.slugs]);

/** The previous and next components in section order, wrapping around the library (the hand-off's `D.order`). */
export function neighbours(slug: string): { prev?: string; next?: string } {
  const i = ORDER.indexOf(slug);
  if (i < 0) return {};
  return { prev: ORDER[(i - 1 + ORDER.length) % ORDER.length], next: ORDER[(i + 1) % ORDER.length] };
}

export function TokensSection({ roles, related, tokens, sectionRef }: { roles: readonly string[]; related: readonly string[]; tokens: ColorTokens; sectionRef?: Ref<View> }) {
  const router = useRouter();
  const live = tokens as unknown as Record<string, string | undefined>;
  const links = related.map((slug) => getComponent(slug)).filter((c) => c != null);
  return (
    <DetailSection id="tok" title="Tokens" note="The colour roles this component's skins read, live from the active scheme and palette." sectionRef={sectionRef}>
      <Row wrap snug>
        {roles.map((role) => (
          // The hand-off's token chip (Component.dc.html line 294): the 32 px pill with its
          // 20 px ringed swatch, the role name in mono beside it.
          <Chip key={role} token icon={live[role] ? <Swatch tiny ring circle color={live[role]!} accessibilityLabel={role} /> : undefined}>
            {role}
          </Chip>
        ))}
      </Row>
      {links.length ? (
        <Column cozy>
          <Typography h5 level={3}>Related components</Typography>
          <Grid minTileWidth={220} comfortable>
            {links.map((c) => (
              // The hand-off's related link (line 297) is a compact tile (`padding:14px 16px;
              // border-radius:14px;border:1px solid var(--ln);background:var(--sf);...;gap:6px`,
              // no shadow; a 15 px name over its section), not a Card header's title type, so
              // the name is the card's body and the tile owns the rhythm.
              <Card key={c.slug} linkTile calloutCorners outlined onPress={() => router.push(`/components/${c.slug}` as never)} accessibilityLabel={`${c.name}, ${c.section}`}>
                <Row between alignCenter snug>
                  <Typography semibold>{c.name}</Typography>
                  <Icon arrowRight muted size={14} decorative />
                </Row>
                <Typography caption subtle>{c.section}</Typography>
              </Card>
            ))}
          </Grid>
        </Column>
      ) : null}
    </DetailSection>
  );
}

export function PrevNext({ slug }: { slug: string }) {
  const router = useRouter();
  const { prev, next } = neighbours(slug);
  const p = prev ? getComponent(prev) : undefined;
  const n = next ? getComponent(next) : undefined;
  if (!p && !n) return null;
  return (
    <View {...(Platform.OS === "web" ? ({ dataSet: { detailSection: "prevnext" } } as object) : null)}>
      <Column loose>
        <Divider />
        {/* The hand-off's previous and next cards (line 303): `padding:16px 18px;border-radius:16px;
            border:1px solid var(--ln);background:var(--sf);...;gap:4px`, no shadow, the next one
            `align-items:flex-end;text-align:right`; the card owns the rhythm. Its eyebrow is the
            pager label (line 303: `font:500 11px var(--fm);letter-spacing:.08em;text-transform:uppercase;color:var(--tx3)`,
            on the face's own 14 px line). */}
        {/* The pager grid's gap is 12 (line 302: `grid-template-columns:1fr 1fr;gap:12px`). */}
        <Row stacks cozy>
          <Column span={6}>
            {p ? (
              <Card pager outlined onPress={() => router.push(`/components/${p.slug}` as never)} accessibilityLabel={`Previous: ${p.name}`}>
                <Typography pagerLabel mono>Previous</Typography>
                <Typography pagerName>{p.name}</Typography>
              </Card>
            ) : null}
          </Column>
          <Column span={6}>
            {n ? (
              <Card pager outlined onPress={() => router.push(`/components/${n.slug}` as never)} accessibilityLabel={`Next: ${n.name}`}>
                <Typography pagerLabel mono right>Next</Typography>
                <Typography pagerName right>{n.name}</Typography>
              </Card>
            ) : null}
          </Column>
        </Row>
      </Column>
    </View>
  );
}
