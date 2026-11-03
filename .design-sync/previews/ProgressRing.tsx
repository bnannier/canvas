import { Card, Column, ProgressRing, Row } from "@nannier/canvas";

export const Hero = () => <ProgressRing value={72} label="Complete" />;

export const Tones = () => (
  <Row loose>
    <ProgressRing value={92} success label="Healthy" />
    <ProgressRing value={81} warning label="Warning" />
    <ProgressRing value={23} destructive label="Critical" />
  </Row>
);

export const Compact = () => <ProgressRing value={72} compact />;

export const Stacked = () => <ProgressRing value={64} label="Storage" stacked />;

export const InsideCard = () => (
  <Card padded>
    <Column alignCenter>
      <ProgressRing value={72} label="Complete" />
    </Column>
  </Card>
);
