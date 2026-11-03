import { Divider, Column, Row, Typography, Button } from "@nannier/canvas";

export const Horizontal = () => (
  <Column>
    <Typography>Profile</Typography>
    <Divider />
    <Typography>Account</Typography>
  </Column>
);

export const Weights = () => (
  <Column>
    <Typography small muted>Soft</Typography>
    <Divider soft />
    <Typography small muted>Default</Typography>
    <Divider />
    <Typography small muted>Strong</Typography>
    <Divider strong />
  </Column>
);

export const Vertical = () => (
  <Row alignCenter flush>
    <Button ghost small>Bold</Button>
    <Button ghost small>Italic</Button>
    <Divider vertical inset />
    <Button ghost small>Link</Button>
  </Row>
);

export const WithLabel = () => (
  <Column snug>
    <Button primary block>Sign in</Button>
    <Divider>or continue with</Divider>
    <Button outline block>Continue with SSO</Button>
  </Column>
);
