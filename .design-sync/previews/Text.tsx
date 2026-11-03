import { Column, Container, Text, Typography } from "@nannier/canvas";

export const Plain = () => (
  <Column cozy>
    <Typography caption medium muted>Release notes</Typography>
    <Text>Canvas 4.1 ships the new glass materials and faster list rendering.</Text>
  </Column>
);

export const Truncated = () => (
  <Container xxs>
    <Column cozy>
      <Typography caption medium muted>Subject (one line)</Typography>
      <Text numberOfLines={1}>Your quarterly invoice for the Platform team is now available to download</Text>
    </Column>
  </Container>
);

export const TwoLines = () => (
  <Container xxs>
    <Column cozy>
      <Typography caption medium muted>Preview (two lines)</Typography>
      <Text numberOfLines={2}>The migration finished without errors. All 14 services were moved to the new cluster and health checks are passing in every region.</Text>
    </Column>
  </Container>
);

export const NestedRuns = () => (
  <Text>
    Deploy <Text>#4821</Text> finished in 3m 12s on the main branch.
  </Text>
);
