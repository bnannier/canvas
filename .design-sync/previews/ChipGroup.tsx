import { Chip, ChipGroup } from "@nannier/canvas";

export const Default = () => (
  <ChipGroup label="Density" defaultValue="comfortable">
    <Chip value="compact">Compact</Chip>
    <Chip value="comfortable">Comfortable</Chip>
    <Chip value="spacious">Spacious</Chip>
    <Chip value="custom" disabled>Custom</Chip>
  </ChipGroup>
);

export const Option = () => (
  <ChipGroup option accessibilityLabel="Size" defaultValue="base">
    <Chip value="small">small</Chip>
    <Chip value="base">base</Chip>
    <Chip value="large">large</Chip>
  </ChipGroup>
);
