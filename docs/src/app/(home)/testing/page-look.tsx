import { useWindowDimensions } from "react-native";
import { ButtonGroup, Card, Column, Grid, Row, Typography } from "@nannier/canvas";
import { Page } from "../../../ui/page";
import { useDocsTheme } from "../../../theme/docs-theme";
import { lookFor, shellBox, shellTier } from "../../../shell/page-look";

// The page look's harness (the tuning-harness inner loop for the df-argus-shell card): the
// real page look the docs shell mounts behind every route, here with drivers for the look
// and a readout of the geometry a recording is checked against. Its tiles fill the page
// with the inks a reader meets on it, the foreground and the muted line straight on the
// page and on a content card, so a capture judges their legibility over the orbs.
const TILES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function PageLookFixture() {
  const { scheme, surface, palette, setScheme, setSurface, setPalette } = useDocsTheme();
  const { width, height } = useWindowDimensions();
  const tier = shellTier(width);
  const shell = shellBox(tier, width);
  return (
    <Page>
      <Column relaxed>
        <Typography h2>Page look</Typography>
        <Row snug wrap alignCenter>
          <ButtonGroup segmented small accessibilityLabel="Scheme" items={["Light", "Dark"]} active={scheme === "dark" ? 1 : 0} onSelect={(i) => setScheme(i === 1 ? "dark" : "light")} testID="page-look-scheme" />
          <ButtonGroup segmented small accessibilityLabel="Palette" items={["Blush", "Mint"]} active={palette === "mint" ? 1 : 0} onSelect={(i) => setPalette(i === 1 ? "mint" : "blush")} testID="page-look-palette" />
          <ButtonGroup segmented small accessibilityLabel="Surface" items={["Solid", "Glass"]} active={surface === "glass" ? 1 : 0} onSelect={(i) => setSurface(i === 1 ? "glass" : "solid")} testID="page-look-surface" />
        </Row>
        <Typography small testID="page-look-readout">
          Look {lookFor(scheme, palette)}, {surface}; window {width} x {height}, the {tier} tier; shell at {shell.left}, {shell.top}, {shell.width} wide
        </Typography>
        <Grid minTileWidth={220} relaxed>
          {TILES.map((n) => (
            <Column key={n} snug>
              <Typography small>Foreground on the page, tile {n}</Typography>
              <Typography small subtle>Muted on the page, tile {n}</Typography>
              <Card>
                <Typography small>Foreground on a card</Typography>
                <Typography small subtle>Muted on a card</Typography>
              </Card>
            </Column>
          ))}
        </Grid>
      </Column>
    </Page>
  );
}
