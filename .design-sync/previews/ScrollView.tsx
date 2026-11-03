import { Badge, Card, Column, Row, ScrollView, Typography } from "@nannier/canvas";

export const Vertical = () => (
  <Card>
    <ScrollView>
      <Column cozy>
        <Typography small>Deploy started</Typography>
        <Typography small>Dependencies restored from cache</Typography>
        <Typography small>Tests passed</Typography>
        <Typography small>Image pushed to the registry</Typography>
        <Typography small>Rollout reached half the fleet</Typography>
        <Typography small>Rollout complete</Typography>
      </Column>
    </ScrollView>
  </Card>
);

export const Horizontal = () => (
  <ScrollView horizontal>
    <Row cozy>
      <Badge>Design</Badge>
      <Badge>Engineering</Badge>
      <Badge>Marketing</Badge>
      <Badge>Support</Badge>
      <Badge>Finance</Badge>
      <Badge>People</Badge>
      <Badge>Legal</Badge>
      <Badge>Operations</Badge>
    </Row>
  </ScrollView>
);
