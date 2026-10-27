import { useWindowDimensions } from "react-native";
import { ButtonGroup, Column, Row, Typography, useTheme } from "@nannier/canvas";
import { Page } from "../../../ui/page";
import { useDocsTheme } from "../../../theme/docs-theme";
import { LibraryHero } from "../../../shell/home";
import { AURORA, COLLAGE, DISPLAY_TYPE, baselineOffset } from "../../../brand/library-hero-look";

// The Library hero's harness (the tuning-harness inner loop for the `v4-library-hero` card):
// the shipped hero itself (`LibraryHero`, the docs home's), under drivers for the scheme,
// the palette and the surface, with a readout of the values a recording is checked against.
// The fixture body stays here rather than in smoke/src/testing: the hero is docs brand
// illustration (docs/src/brand), which the sealed smoke app's Metro does not watch.
const PALETTES = ["violet", "cyan", "mint", "rose", "amber"] as const;

export default function LibraryHeroFixture() {
  const { scheme, surface, palette, setScheme, setSurface, setPalette } = useDocsTheme();
  const { tokens, dark } = useTheme();
  const { width } = useWindowDimensions();
  return (
    <Page>
      <Column relaxed>
        <Typography h2>Library hero</Typography>
        <Row snug wrap alignCenter>
          <ButtonGroup segmented small accessibilityLabel="Scheme" items={["Light", "Dark"]} active={scheme === "dark" ? 1 : 0} onSelect={(i) => setScheme(i === 1 ? "dark" : "light")} testID="library-hero-scheme" />
          <ButtonGroup segmented small accessibilityLabel="Surface" items={["Solid", "Glass"]} active={surface === "glass" ? 1 : 0} onSelect={(i) => setSurface(i === 1 ? "glass" : "solid")} testID="library-hero-surface" />
          <ButtonGroup segmented small accessibilityLabel="Palette" items={PALETTES.map((p) => p[0]!.toUpperCase() + p.slice(1))} active={PALETTES.indexOf(palette)} onSelect={(i) => setPalette(PALETTES[i]!)} testID="library-hero-palette" />
        </Row>
        <Typography small testID="library-hero-readout">
          Window {width}; {scheme}, {surface}, {palette}. Sweep {tokens["featured-start"]} / {tokens["featured-middle"]} / {tokens["featured-end"]}; aurora layer {dark ? AURORA.opacity.dark : AURORA.opacity.light}; headline {DISPLAY_TYPE.fontSize} px, baseline {baselineOffset(DISPLAY_TYPE.fontSize, DISPLAY_TYPE.lineHeight).toFixed(2)}; collage {COLLAGE.height} px, perspective {COLLAGE.perspective}, rotate {COLLAGE.rotate.join(" / ")}
        </Typography>
      </Column>
      <LibraryHero />
    </Page>
  );
}
