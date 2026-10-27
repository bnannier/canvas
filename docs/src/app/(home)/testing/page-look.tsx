import { useState } from "react";
import { PixelRatio, useWindowDimensions } from "react-native";
import { ButtonGroup, Card, Column, Grid, Row, Typography, useTheme } from "@nannier/canvas";
import { Page } from "../../../ui/page";
import { useDocsTheme } from "../../../theme/docs-theme";
import { PageGrain } from "../../../shell/page-backdrop";
import { GRAIN, SCROLLBAR, grainOpacity, pageColor, shellTier } from "../../../shell/page-look";

// The page look's harness (the tuning-harness inner loop for the docs page): the real page
// the docs shell mounts behind every route, here with drivers for the look and a readout of
// what a recording is checked against. Its tiles fill the page with the inks a reader meets
// on it, the foreground and the muted line straight on the page and on a content card.
// The grain (`PageGrain`, the `v4-page` card) is drawn over the route's whole box here, with
// a driver to take it away, until the shell mounts it over the window.
const TILES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function PageLookFixture() {
  const { scheme, surface, palette, setScheme, setSurface, setPalette } = useDocsTheme();
  const { tokens } = useTheme();
  const { width, height } = useWindowDimensions();
  const tier = shellTier(width);
  const [grain, setGrain] = useState(true);
  return (
    <>
      <Page>
        <Column relaxed>
          <Typography h2>Page look</Typography>
          <Row snug wrap alignCenter>
            <ButtonGroup segmented small accessibilityLabel="Scheme" items={["Light", "Dark"]} active={scheme === "dark" ? 1 : 0} onSelect={(i) => setScheme(i === 1 ? "dark" : "light")} testID="page-look-scheme" />
            <ButtonGroup segmented small accessibilityLabel="Palette" items={["Violet", "Mint"]} active={palette === "mint" ? 1 : 0} onSelect={(i) => setPalette(i === 1 ? "mint" : "violet")} testID="page-look-palette" />
            <ButtonGroup segmented small accessibilityLabel="Grain" items={["Grain", "No grain"]} active={grain ? 0 : 1} onSelect={(i) => setGrain(i === 0)} testID="page-look-grain" />
            <ButtonGroup segmented small accessibilityLabel="Surface" items={["Solid", "Glass"]} active={surface === "glass" ? 1 : 0} onSelect={(i) => setSurface(i === 1 ? "glass" : "solid")} testID="page-look-surface" />
          </Row>
          <Typography small testID="page-look-readout">
            Page {pageColor(tokens)} ({scheme}, {palette}, {surface}); window {width} x {height} at {PixelRatio.get()}x, the {tier} tier
          </Typography>
          <Typography small testID="page-look-grain-readout">
            Grain {grain ? "on" : "off"}: a {GRAIN.tile} px tile at opacity {grainOpacity(scheme)}; scrollbar {SCROLLBAR.size} px, thumb {SCROLLBAR.thumb[scheme]}
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
      {grain ? <PageGrain /> : null}
    </>
  );
}
