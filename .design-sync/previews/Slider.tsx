import { Slider, Column } from "@nannier/canvas";

export const Labeled = () => (
  <Slider defaultValue={65} showValue percent description="Applies to all media on this page.">Volume</Slider>
);

export const Range = () => <Slider min={0} max={10} step={1} defaultValue={4} showValue scale>Brightness</Slider>;

export const Sizes = () => (
  <Column>
    <Slider small defaultValue={30} accessibilityLabel="Small" />
    <Slider defaultValue={50} accessibilityLabel="Default" />
    <Slider large defaultValue={70} accessibilityLabel="Large" />
  </Column>
);

export const Disabled = () => <Slider disabled defaultValue={40} showValue>Locked by admin</Slider>;
