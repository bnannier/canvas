import { Grid, GridItem, Card } from "@nannier/canvas";

export const Wide = () => (
  <Grid minTileWidth={200} columns={3}>
    <GridItem wide>
      <Card title="Latency" description="p95 under 180 ms." />
    </GridItem>
    <Card title="Errors" description="0.02% of requests." />
    <Card title="Throughput" description="4.2k req/s." />
    <Card title="Saturation" description="CPU at 42%." />
  </Grid>
);
