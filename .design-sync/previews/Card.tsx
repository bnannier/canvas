import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Column, Typography } from "@nannier/canvas";

export const Metric = () => (
  <Card>
    <Typography caption medium>Active identities</Typography>
    <Typography h3 bold>12,348</Typography>
    <Typography tiny muted>+142 today</Typography>
  </Card>
);

export const WithHeader = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent activity</CardTitle>
      <CardDescription>Events from the last 24 hours.</CardDescription>
    </CardHeader>
    <CardContent>
      <Typography small>Two deploys finished and one review is waiting on you.</Typography>
    </CardContent>
  </Card>
);

export const Surfaces = () => (
  <Column cozy>
    <Card flat>
      <Typography lead semibold>Flat: outlined and quiet</Typography>
    </Card>
    <Card raised>
      <Typography lead semibold>Raised: lifted above the page</Typography>
    </Card>
    <Card sunken>
      <Typography lead semibold>Sunken: a well beneath the page</Typography>
    </Card>
  </Column>
);

export const Featured = () => (
  <Card
    featured
    stacked
    hue={285}
    initials="B"
    title="Blueprint"
    description="v3.0"
    eyebrow="Awaiting approval · Architect gate"
    badge="Architecture"
    body="Proposes service boundaries for pricing and money paths."
    caption="A human signs every money path."
    metadata="Commerce · $2.1k / 30d"
    actions={<Button primary small>Approve</Button>}
  />
);

export const Promo = () => (
  <Card
    promo
    title="Gates come down only with receipts."
    body="Autonomy charter, circuit breakers, all as code."
    actions={<Button inlineLink link small>Read the charter</Button>}
  />
);
