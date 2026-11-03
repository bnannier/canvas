import { Badge, BadgeGroup, Row, Typography } from "@nannier/canvas";

export const Default = () => (
  <BadgeGroup>
    <Badge>admin</Badge>
    <Badge secondary>employee</Badge>
    <Badge outline>engineering</Badge>
    <Badge destructive>revoked</Badge>
    <Badge mono>refresh_token</Badge>
  </BadgeGroup>
);

export const Status = () => (
  <BadgeGroup>
    <Badge status success>active</Badge>
    <Badge status warning>degraded</Badge>
    <Badge status error>failed</Badge>
    <Badge status info>syncing</Badge>
    <Badge status neutral>archived</Badge>
  </BadgeGroup>
);

export const Hues = () => (
  <BadgeGroup>
    <Badge mint mono>compact</Badge>
    <Badge cyan mono>regular</Badge>
    <Badge mono>wide</Badge>
  </BadgeGroup>
);

export const Notification = () => (
  <Row snug alignCenter>
    <Badge notification solid action>3</Badge>
    <Badge dot />
    <Typography small>Live</Typography>
  </Row>
);

export const Reference = () => (
  <Badge reference href="https://example.com">CORE-1842</Badge>
);
