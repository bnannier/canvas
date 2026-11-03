import { Grid, GridItem, Card } from "@nannier/canvas";

export const Default = () => (
  <Grid minTileWidth={200} columns={3}>
    <Card title="Uptime" description="99.98% over the last 30 days." />
    <Card title="Incidents" description="One partial outage on the EU edge, resolved in 14 minutes." />
    <Card title="On call" description="Priya, until 09:00." />
  </Grid>
);

export const WideTile = () => (
  <Grid minTileWidth={200} columns={3}>
    <GridItem wide>
      <Card title="Latency" description="p95 under 180 ms." />
    </GridItem>
    <Card title="Errors" description="0.02% of requests." />
    <Card title="Throughput" description="4.2k req/s." />
  </Grid>
);

export const Tight = () => (
  <Grid minTileWidth={160} tight>
    <Card title="CPU" description="42%" />
    <Card title="Memory" description="61%" />
    <Card title="Disk" description="78%" />
  </Grid>
);
