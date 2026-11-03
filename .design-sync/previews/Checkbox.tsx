import { Checkbox, Column } from "@nannier/canvas";

export const Default = () => (
  <Column>
    <Checkbox defaultChecked>Email notifications</Checkbox>
    <Checkbox>Email notifications</Checkbox>
    <Checkbox disabled>Email notifications</Checkbox>
  </Column>
);

export const Sizes = () => (
  <Column>
    <Checkbox small defaultChecked>Small</Checkbox>
    <Checkbox defaultChecked>Default</Checkbox>
    <Checkbox large defaultChecked>Large</Checkbox>
  </Column>
);

export const WithDescription = () => (
  <Checkbox defaultChecked description="Get notified when activity happens on your account.">
    Email notifications
  </Checkbox>
);

export const Indeterminate = () => (
  <Column>
    <Checkbox selection indeterminate>Select all</Checkbox>
    <Column indent>
      <Checkbox selection checked>Read</Checkbox>
      <Checkbox selection>Write</Checkbox>
      <Checkbox selection>Delete</Checkbox>
    </Column>
  </Column>
);
