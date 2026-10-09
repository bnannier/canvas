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

const CATEGORY_IDS = ["Tokens", "Atoms", "Molecules", "Organisms", "Charts", "Templates", "Patterns"];

// Previews are real, independently operable controls with separate reference links.
export default function ComponentsIndex() {
  const groups = [
    ["Tokens", TOKENS_TILES], ["Atoms", ATOMS_TILES], ["Molecules", MOLECULES_TILES],
    ["Organisms", ORGANISMS_TILES], ["Charts", CHARTS_TILES], ["Templates", TEMPLATES_TILES], ["Patterns", PATTERNS_TILES],
  ] as const;
  return <Page>
    <H1>Components</H1>
    <CatSubBar categories={CATEGORY_IDS} total={groups.reduce((n, [, tiles]) => n + tiles.length, 0)} />
    <Container xxl start><Typography subtle>Explore real Canvas components in the current theme. Try each control, then open its reference for examples and API details.</Typography></Container>
    {groups.map(([label, tiles]) => <CatGroup key={label} label={label} count={tiles.length} tiles={[...tiles]} />)}
    <PageNav />
  </Page>;
}
