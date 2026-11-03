import { Reveal, Card, Typography, Column } from "@nannier/canvas";

export const FromBelow = () => (
  <Reveal>
    <Card>
      <Typography>Rises into place</Typography>
    </Card>
  </Reveal>
);

export const FromLeft = () => (
  <Reveal fromLeft>
    <Card>
      <Typography>Slides in from the left</Typography>
    </Card>
  </Reveal>
);

export const Pronounced = () => (
  <Reveal pronounced>
    <Card>
      <Typography>Travels further before settling</Typography>
    </Card>
  </Reveal>
);
