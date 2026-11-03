import { Stepper } from "@nannier/canvas";

export const Seats = () => <Stepper label="Seats" defaultValue={5} min={1} max={50} description="Billed monthly per seat." />;

export const WithSuffix = () => <Stepper label="Session timeout" defaultValue={30} min={5} max={120} step={5} suffix="min" />;

export const Sizes = () => (
  <>
    <Stepper small defaultValue={2} />
    <Stepper large defaultValue={2} />
  </>
);

export const Disabled = () => <Stepper disabled label="Seats" defaultValue={10} />;
