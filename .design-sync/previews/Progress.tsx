import { Progress, Column } from "@nannier/canvas";

export const Labeled = () => (
  <Progress value={0.64} showValue description="Uploading 3 of 5 files">Upload progress</Progress>
);

export const Tones = () => (
  <Column>
    <Progress value={0.4} accessibilityLabel="Storage used" />
    <Progress warning value={0.78} accessibilityLabel="Storage nearly full" />
    <Progress danger value={0.96} accessibilityLabel="Storage critical" />
  </Column>
);

export const Sizes = () => (
  <Column>
    <Progress small value={0.5} accessibilityLabel="Small" />
    <Progress value={0.5} accessibilityLabel="Default" />
    <Progress large value={0.5} accessibilityLabel="Large" />
  </Column>
);

export const Segments = () => <Progress segments={5} value={0.6} showValue>Setup steps</Progress>;

export const Status = () => <Progress value={0.85} status="strong">Password strength</Progress>;
