import { QRCode, Row, Column, Typography } from "@nannier/canvas";

export const Default = () => <QRCode value="https://nannier.com/invite/identity-platform" accessibilityLabel="Invite link" />;

export const Sizes = () => (
  <Row alignCenter>
    <QRCode small value="https://nannier.com/app" accessibilityLabel="Small" />
    <QRCode value="https://nannier.com/app" accessibilityLabel="Default" />
    <QRCode large value="https://nannier.com/app" accessibilityLabel="Large" />
  </Row>
);

export const Captioned = () => (
  <Column alignCenter>
    <QRCode value="otpauth://totp/Canvas:ada@example.com?secret=JBSWY3DPEHPK3PXP" accessibilityLabel="Authenticator setup" />
    <Typography small muted>Scan with your authenticator app</Typography>
  </Column>
);
