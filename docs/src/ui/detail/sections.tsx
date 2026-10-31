import type { Ref } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { View, Grid, Card, Column, Row, Typography, Chip, Swatch, Divider, Icon, type ColorTokens } from "@nannier/canvas";
import type { DocGuidance, DocGuidanceBlock, DocProse } from "../../core/scope";
import { getComponent } from "../../core/data/components";
import { SECTIONS } from "../../core/data/detail-sections";
import { CodeBlock } from "../code-block";
import { InlineMarkdown, Prose } from "../prose";
import { DetailSection } from "./frame";
import { referenceTokenValue } from "./presentation";

// The detail page's closing sections (Component.dc.html `#cv-use`, `#cv-tok`, the related
// grid and the previous / next pair).

const isProse = (block: DocGuidanceBlock): block is DocProse => typeof block === "string" || "list" in block;

/** One guidance section of the .md as a card: its title, prose, sub-headings and live examples in order. */
function GuidanceCard({ section }: { section: DocGuidance }) {
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
      {/* The card's title (line 285: `<h3 style="margin:0;font:600 16px/1.3 var(--ft)">`) and
          paragraphs (line 286: `font:400 13.5px/1.6 var(--ft);color:var(--tx2)`): the kit's
          guideTitle (a level-3 heading) and guideBody roles. */}
      <Typography guideTitle><InlineMarkdown text={section.title} heading /></Typography>
      {runs.map((run, i) =>
        Array.isArray(run) ? (
          <Prose key={i} blocks={run} guideBody />
        ) : "heading" in run ? (
          <Typography key={i} small semibold><InlineMarkdown text={run.heading} heading /></Typography>
        ) : (
          <CodeBlock key={i} headerless guide code={run.code} />
        ),
      )}
    </Card>
  );
}

export function UsageSection({ note, code, overview, guidance, sectionRef }: {
  /** The Usage example's own note (the .md's `## Usage` prose). */
  note?: DocProse[];
  /** The Usage example's source. */
  code?: string;
  overview?: DocProse[];
  guidance: readonly DocGuidance[];
  sectionRef?: Ref<View>;
}) {
  if (!note?.length && !code && !overview?.length && guidance.length === 0) return null;
  return (
    <DetailSection id="use" title="Usage" sectionRef={sectionRef}>
      {note?.length ? <Prose blocks={note} pageBody relaxed /> : null}
      {/* The page's own snippet (line 283: `padding:16px 18px;border-radius:14px;background:var(--bg2);
          border:1px solid var(--ln);font:400 13px/1.7 var(--fm)`), the kit CodeBlock's `snippet` density. */}
      {code ? <CodeBlock headerless snippet code={code} /> : null}
      {overview?.length ? <Prose blocks={overview} pageNote relaxed /> : null}
      {guidance.length ? (
        <Grid minTileWidth={420} roomy>
          {guidance.map((section) => <GuidanceCard key={section.title} section={section} />)}
        </Grid>
      ) : null}
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
    <DetailSection id="tok" title="Tokens" note="Read from the playground render. Values follow the scheme and the ion hue." sectionRef={sectionRef}>
      {/* The chips and the related grid sit 32 apart: the hand-off's h3 (line 296) carries
          `margin:16px 0 0` inside the section's `gap:16px`, the `apart` step. */}
      <Column apart>
        <Row wrap snug>
          {roles.map((role) => {
            const value = role.startsWith("--") ? referenceTokenValue(role, tokens) : live[role];
            const color = value && /^(#|rgb|oklch|color-mix|hsl)/.test(value);
            const icon = color ? <Swatch tiny ring circle color={value} decorative /> : (
              <View style={{ position: "relative", width: 20, height: 20 }}>
                <Swatch tiny ring circle color={tokens.secondary} decorative />
                <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" }}>
                  <Icon type={/^--f/.test(role)} layers={/^--sh/.test(role)} sparkles={!/^--(f|sh)/.test(role)} muted size={11} decorative />
                </View>
              </View>
            );
            return (
            // The hand-off's token chip (Component.dc.html line 294): the 32 px pill with its
            // 20 px ringed swatch, the role name in mono beside it.
            <Chip key={role} token accessibilityLabel={value ? `${role}: ${value}` : role} icon={icon}>
              {role}
            </Chip>
            );
          })}
        </Row>
        {links.length ? (
          // The h3 (line 296: `font:600 16px var(--ft)` on its face's own 20 line, the kit's
          // subsectionTitle, a level-3 heading) sits the section's 16 gap over the grid.
          <Column relaxed>
            <Typography subsectionTitle>Related components</Typography>
            <Grid minTileWidth={220} comfortable>
              {links.map((c) => (
                // The hand-off's related link (line 297) is a compact tile (`padding:14px 16px;
                // border-radius:14px;border:1px solid var(--ln);background:var(--sf);...;gap:6px`,
                // no shadow), not a Card header's title type: its name is the kit's linkName
                // (`font:600 14px var(--ft)` on its face's own 18 line, the tile's `color:var(--tx)`)
                // and its room the caption (`font:400 12px/1.45 var(--ft);color:var(--tx3)`, the
                // caption's own subtle ink), so the tile owns the rhythm.
                <Card key={c.slug} linkTile calloutCorners outlined onPress={() => router.push(`/components/${c.slug}` as never)} accessibilityLabel={`${c.name}, ${c.section}`}>
                  <Row between alignCenter snug>
                    <Typography linkName>{c.name}</Typography>
                    <Icon arrowRight muted size={14} decorative />
                  </Row>
                  <Typography caption>{c.section}</Typography>
                </Card>
              ))}
            </Grid>
          </Column>
        ) : null}
      </Column>
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
        <Row cozy>
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
