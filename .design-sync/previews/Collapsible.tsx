import { Collapsible, Column, Typography } from "@nannier/canvas";

export const Open = () => (
  <Collapsible defaultOpen title="Advanced settings" description="Rate limits and retry behavior.">
    <Typography small>Requests are retried up to three times with exponential backoff.</Typography>
  </Collapsible>
);

export const Closed = () => (
  <Collapsible title="Show 4 more reviewers">
    <Typography small>Ada Lovelace, Kevin Turner, Grace Hopper and Alan Turing.</Typography>
  </Collapsible>
);

export const CardSurface = () => (
  <Column cozy>
    <Collapsible card defaultOpen title="Deployment details" description="Production, us-east-1">
      <Typography small>Deployed 12 minutes ago by Rachel Chen from the main branch.</Typography>
    </Collapsible>
    <Collapsible card disabled title="Audit log" description="Available on the Business plan">
      <Typography small>Every change to this workspace.</Typography>
    </Collapsible>
  </Column>
);
