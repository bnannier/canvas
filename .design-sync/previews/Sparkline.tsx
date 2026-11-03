import { Column, Container, Sparkline, Stats } from "@nannier/canvas";

const up = [4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24];
const down = [24, 20, 16, 18, 14, 16, 10, 12, 6, 8, 4];

export const Hero = () => (
  <Container xxxs>
    <Sparkline values={up} />
  </Container>
);

export const Tones = () => (
  <Container xxxs>
    <Column>
      <Sparkline primary values={up} />
      <Sparkline success values={up} />
      <Sparkline destructive values={down} />
      <Sparkline muted values={up} />
    </Column>
  </Container>
);

export const Heights = () => (
  <Container xxxs>
    <Column>
      <Sparkline compact values={up} />
      <Sparkline values={up} />
      <Sparkline tall values={up} />
    </Column>
  </Container>
);

export const Line = () => (
  <Container xxxs>
    <Sparkline line values={up} />
  </Container>
);

export const EmptyTrack = () => (
  <Container xxxs>
    <Sparkline track values={[0, 0, 0, 0, 0, 0, 0, 0]} />
  </Container>
);

export const InStats = () => (
  <Container xxxs>
    <Stats items={[{ label: "Requests", value: "24.5k", delta: "+8.2%", spark: up }]} />
  </Container>
);
