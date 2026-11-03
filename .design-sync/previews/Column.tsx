import { Column, Row, Button, Card, Typography } from "@nannier/canvas";

export const Default = () => (
  <Column>
    <Button>Save changes</Button>
    <Button secondary>Save draft</Button>
    <Button ghost>Cancel</Button>
  </Column>
);

export const Gaps = () => (
  <Row relaxed alignStart>
    <Column tight>
      <Typography small muted>tight</Typography>
      <Button small>Edit</Button>
      <Button small>Share</Button>
    </Column>
    <Column snug>
      <Typography small muted>snug</Typography>
      <Button small>Edit</Button>
      <Button small>Share</Button>
    </Column>
    <Column loose>
      <Typography small muted>loose</Typography>
      <Button small>Edit</Button>
      <Button small>Share</Button>
    </Column>
  </Row>
);

export const InCard = () => (
  <Card padded>
    <Column snug>
      <Typography medium>Billing</Typography>
      <Typography small muted>Plan, invoices, and payment method.</Typography>
      <Button outline>Manage plan</Button>
    </Column>
  </Card>
);
