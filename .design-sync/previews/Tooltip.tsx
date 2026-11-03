import { Tooltip, Column } from "@nannier/canvas";

export const Default = () => (
  <Column padLoose alignCenter>
    <Tooltip label="Open settings" trigger="Settings" open />
  </Column>
);

export const Bottom = () => (
  <Column padLoose alignCenter>
    <Tooltip label="Open settings" trigger="Settings" open bottom />
  </Column>
);

export const Right = () => (
  <Column padLoose alignCenter>
    <Tooltip label="Open settings" trigger="Settings" open right />
  </Column>
);

export const Left = () => (
  <Column padLoose alignCenter>
    <Tooltip label="Open settings" trigger="Settings" open left />
  </Column>
);

export const Icon = () => (
  <Column padLoose alignCenter>
    <Tooltip label="More information" iconTrigger open />
  </Column>
);
