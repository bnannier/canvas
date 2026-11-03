import { Row, Column, Button, Badge, Typography, Card } from "@nannier/canvas";

export const Actions = () => (
  <Row>
    <Button primary>Save</Button>
    <Button outline>Cancel</Button>
    <Button ghost>Discard</Button>
  </Row>
);

export const Between = () => (
  <Row between alignCenter>
    <Typography medium>Billing</Typography>
    <Badge>Paid</Badge>
  </Row>
);

export const Gaps = () => (
  <Column>
    <Row tight><Badge>Design</Badge><Badge>Code</Badge><Badge>Docs</Badge></Row>
    <Row relaxed><Badge>Design</Badge><Badge>Code</Badge><Badge>Docs</Badge></Row>
    <Row loose><Badge>Design</Badge><Badge>Code</Badge><Badge>Docs</Badge></Row>
  </Column>
);

export const Wrapping = () => (
  <Row wrap>
    <Badge>Accessibility</Badge><Badge>Animation</Badge><Badge>Charts</Badge><Badge>Forms</Badge>
    <Badge>Navigation</Badge><Badge>Overlays</Badge><Badge>Theming</Badge><Badge>Typography</Badge>
  </Row>
);
