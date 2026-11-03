import { Kbd, Row, Column, Typography } from "@nannier/canvas";

export const SingleKey = () => (
  <Row>
    <Kbd>Esc</Kbd>
  </Row>
);

export const Combo = () => <Kbd keys="⌘ K" />;

export const Sequence = () => <Kbd keys="G I" sequence />;

export const Sizes = () => (
  <Row alignCenter>
    <Kbd tiny keys="⌘ S" />
    <Kbd small keys="⌘ S" />
    <Kbd keys="⌘ S" />
    <Kbd comfortable keys="⌘ S" />
  </Row>
);

export const Flat = () => (
  <Column>
    <Typography small muted>Search shortcuts</Typography>
    <Row alignCenter>
      <Kbd flat keys="⌘ K" />
      <Kbd flat>/</Kbd>
    </Row>
  </Column>
);
