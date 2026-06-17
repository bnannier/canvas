import { View, Text, useTheme } from "@olympusoss/canvas";
import { ScrollView } from "react-native";
import { COMPONENTS } from "docs-core/data/components";
import { PageNav } from "../../ui/page-nav";
import { geist } from "../../ui/fonts";
import { CatSubBar, CatGroup } from "../../catalog/tile";
import { TOKENS_TILES } from "../../catalog/tokens";
import { ATOMS_TILES } from "../../catalog/atoms";
import { MOLECULES_TILES } from "../../catalog/molecules";
import { ORGANISMS_TILES } from "../../catalog/organisms";
import { TEMPLATES_TILES } from "../../catalog/templates";
import { PATTERNS_TILES } from "../../catalog/patterns";

const CATEGORY_IDS = ["Tokens", "Atoms", "Molecules", "Organisms", "Templates", "Patterns"];

// A live catalog mirroring the Vite components-index: a category pill bar + intro, then a tile
// grid per category, each tile a small mockup preview of the component linking to its reference.
export default function ComponentsIndex() {
  const { tokens } = useTheme();
  const byCat = (c: string) => COMPONENTS.filter((x) => x.category === c).length;
  const counts = {
    Tokens: 3,
    Atoms: byCat("Atoms"),
    Molecules: byCat("Molecules"),
    Organisms: byCat("Organisms"),
    Templates: 8,
    Patterns: 6,
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.background }}
      contentContainerStyle={{ paddingTop: 24, paddingHorizontal: 28, paddingBottom: 80, gap: 28, width: "100%", maxWidth: 1400, alignSelf: "center" }}
    >
      <CatSubBar categories={CATEGORY_IDS} total={total} />

      <Text style={{ fontFamily: geist("400"), fontSize: 13, lineHeight: 20.8, maxWidth: 672, color: tokens["muted-foreground"], marginTop: -12 }}>
        A live catalog of every component in the Canvas design system. Each tile is the real component
        rendered with the current theme. Open a tile for its full reference.
      </Text>

      <CatGroup label="Tokens" count={counts.Tokens} tiles={TOKENS_TILES} />
      <CatGroup label="Atoms" count={counts.Atoms} tiles={ATOMS_TILES} />
      <CatGroup label="Molecules" count={counts.Molecules} tiles={MOLECULES_TILES} />
      <CatGroup label="Organisms" count={counts.Organisms} tiles={ORGANISMS_TILES} />
      <CatGroup label="Templates" count={counts.Templates} tiles={TEMPLATES_TILES} />
      <CatGroup label="Patterns" count={counts.Patterns} tiles={PATTERNS_TILES} />

      <View style={{ marginTop: 8 }}>
        <PageNav />
      </View>
    </ScrollView>
  );
}
