import { RevealGroup, Reveal, Card, Typography, Column } from "@nannier/canvas";

export const Staggered = () => (
  <RevealGroup>
    <Column>
      <Reveal>
        <Card><Typography>Create a workspace</Typography></Card>
      </Reveal>
      <Reveal>
        <Card><Typography>Invite your team</Typography></Card>
      </Reveal>
      <Reveal>
        <Card><Typography>Ship your first release</Typography></Card>
      </Reveal>
    </Column>
  </RevealGroup>
);
