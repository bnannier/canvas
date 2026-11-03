import { Radio, RadioGroup } from "@nannier/canvas";

export const Plans = () => (
  <RadioGroup defaultValue="pro" label="Plan">
    <Radio value="free" description="For personal projects.">Free</Radio>
    <Radio value="pro" description="Unlimited projects and priority support.">Pro</Radio>
    <Radio value="team" description="Shared workspaces and SSO.">Team</Radio>
  </RadioGroup>
);

export const Cards = () => (
  <RadioGroup defaultValue="monthly" card row>
    <Radio card value="monthly" description="$12 per seat">Monthly</Radio>
    <Radio card value="yearly" description="$120 per seat, save 17%">Yearly</Radio>
  </RadioGroup>
);

export const Disabled = () => (
  <RadioGroup defaultValue="email" disabled label="Contact method">
    <Radio value="email">Email</Radio>
    <Radio value="phone">Phone</Radio>
  </RadioGroup>
);

export const Sizes = () => (
  <RadioGroup defaultValue="a" row>
    <Radio small value="a">Small</Radio>
    <Radio value="b">Medium</Radio>
    <Radio large value="c">Large</Radio>
  </RadioGroup>
);
