import { Card, Column, Gauge, Row } from "@nannier/canvas";

export const Hero = () => <Gauge value={72} label="Uptime" />;

export const Tones = () => (
  <Row loose>
    <Gauge value={92} success label="Healthy" />
    <Gauge value={81} warning label="Degraded" />
    <Gauge value={34} destructive label="Failing" />
  </Row>
);

export const Large = () => <Gauge large value={72} label="of Q4 adoption goal" />;

export const InsideCard = () => (
  <Card padded>
    <Column alignCenter>
      <Gauge value={72} label="Uptime" />
    </Column>
  </Card>
);
