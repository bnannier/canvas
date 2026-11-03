import { Column, PhoneInput } from "@nannier/canvas";

export const Default = () => (
  <PhoneInput label="Phone number" defaultCountry="US" defaultValue="415 555 0148" />
);

export const Sizes = () => (
  <Column cozy>
    <PhoneInput small label="Small" defaultCountry="GB" defaultValue="20 7946 0958" />
    <PhoneInput large label="Large" defaultCountry="FR" defaultValue="6 12 34 56 78" />
  </Column>
);

export const Required = () => (
  <PhoneInput required label="Mobile" placeholder="Enter your number" />
);

export const Error = () => (
  <PhoneInput error label="Phone number" defaultCountry="US" defaultValue="415 555" />
);

export const Disabled = () => (
  <PhoneInput disabled label="Phone number" defaultCountry="US" defaultValue="415 555 0148" />
);
