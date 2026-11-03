import { InputOTP, Column, Typography } from "@nannier/canvas";

export const SixDigit = () => <InputOTP defaultValue="428" />;

export const Grouped = () => <InputOTP length={6} groups={3} defaultValue="428193" />;

export const Masked = () => <InputOTP length={4} masked defaultValue="73" />;

export const Sizes = () => (
  <Column>
    <InputOTP small length={4} defaultValue="12" />
    <InputOTP length={4} defaultValue="12" />
    <InputOTP large length={4} defaultValue="12" />
  </Column>
);

export const Disabled = () => (
  <Column>
    <Typography small muted>Verification locked after too many attempts</Typography>
    <InputOTP disabled defaultValue="9051" length={4} />
  </Column>
);
