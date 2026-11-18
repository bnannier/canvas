import { Typography, Container } from "@nannier/canvas";
import { Page } from "../../../ui/page";
import { PageNav } from "../../../ui/page-nav";
import { H1 } from "../../../ui/prose";
import { CatSubBar, CatGroup } from "../../../catalog/tile";
import { TOKENS_TILES } from "../../../catalog/tokens";
import { ATOMS_TILES } from "../../../catalog/atoms";
import { MOLECULES_TILES } from "../../../catalog/molecules";
import { ORGANISMS_TILES } from "../../../catalog/organisms";
import { CHARTS_TILES } from "../../../catalog/charts";
import { TEMPLATES_TILES } from "../../../catalog/templates";
import { PATTERNS_TILES } from "../../../catalog/patterns";
import { catalogSections } from "../../../catalog/sections";
import { COMPONENTS } from "../../../core/data/components";
import { TEMPLATE_METADATA } from "../../../core/data/route-metadata";

const GROUPS = [
  ...catalogSections([...ATOMS_TILES, ...MOLECULES_TILES, ...ORGANISMS_TILES, ...CHARTS_TILES]),
  { id: "guides", label: "Token guides", href: undefined, count: TOKENS_TILES.length, noun: "pages", summary: `${TOKENS_TILES.length} pages`, tiles: TOKENS_TILES },
  { id: "templates", label: "Templates", href: "/templates", count: TEMPLATE_METADATA.length, noun: "templates", summary: `${TEMPLATE_METADATA.length} templates · ${TEMPLATES_TILES.length} previews`, tiles: TEMPLATES_TILES },
  { id: "patterns", label: "Patterns", href: undefined, count: PATTERNS_TILES.length, noun: "patterns", summary: `${PATTERNS_TILES.length} patterns`, tiles: PATTERNS_TILES },
];

// Previews are real, independently operable controls with separate reference links.
export default function ComponentsIndex() {
  return <Page>
    <H1>Components</H1>
    <CatSubBar categories={GROUPS} total={COMPONENTS.length} />
    <Container xxl start><Typography subtle>Explore real Canvas components in the current theme. Try each control, then open its reference for examples and API details.</Typography></Container>
    {GROUPS.map(({ id, label, href, summary, tiles }) => <CatGroup key={id} label={label} href={href} summary={summary} tiles={tiles} />)}
    <PageNav />
  </Page>;
}
