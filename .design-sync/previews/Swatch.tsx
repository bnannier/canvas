import { Swatch, Row, Column } from "@nannier/canvas";

export const Hero = () => (
  <Swatch block color="#5b3fd4" value="--primary">primary</Swatch>
);

export const Palettes = () => (
  <Row>
    <Swatch circle violet accessibilityLabel="Violet" />
    <Swatch circle cyan accessibilityLabel="Cyan" />
    <Swatch circle mint accessibilityLabel="Mint" />
    <Swatch circle rose accessibilityLabel="Rose" />
    <Swatch circle amber accessibilityLabel="Amber" />
  </Row>
);

export const Selected = () => (
  <Row>
    <Swatch circle violet selected accessibilityLabel="Violet" />
    <Swatch circle mint accessibilityLabel="Mint" />
    <Swatch circle rose accessibilityLabel="Rose" />
  </Row>
);

export const Sizes = () => (
  <Column>
    <Swatch tiny inline color="#e5484d">destructive</Swatch>
    <Swatch small inline color="#12a594">success</Swatch>
    <Swatch inline color="#0091ff">info</Swatch>
    <Swatch large inline color="#f5a524">warning</Swatch>
  </Column>
);
