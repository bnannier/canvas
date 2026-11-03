import { Container, Column, Card, Typography } from "@nannier/canvas";

export const Default = () => (
  <Container md>
    <Card padded>
      <Typography medium>Billing</Typography>
      <Typography small muted>Plan, invoices, and payment method.</Typography>
    </Card>
  </Container>
);

export const Steps = () => (
  <Column>
    <Container xs><Card padded><Typography small>xs, 320</Typography></Card></Container>
    <Container md><Card padded><Typography small>md, 448</Typography></Card></Container>
    <Container xl><Card padded><Typography small>xl, 576</Typography></Card></Container>
  </Column>
);

export const StartPinned = () => (
  <Container sm start>
    <Card padded>
      <Typography small>Settings, pinned to the start</Typography>
    </Card>
  </Container>
);
