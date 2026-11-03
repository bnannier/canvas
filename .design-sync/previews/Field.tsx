import { Checkbox, Column, Field, Input, Select, Textarea } from "@nannier/canvas";

export const WithHelper = () => (
  <Field label="Email" helper="We will send a receipt to this address.">
    <Input defaultValue="rachel.chen@example.com" />
  </Field>
);

export const Required = () => (
  <Field required label="Workspace name" helper="Shown on invoices and in the sidebar.">
    <Input placeholder="Northwind" />
  </Field>
);

export const WithError = () => (
  <Field label="Username" error="That username is already taken.">
    <Input defaultValue="rachel" />
  </Field>
);

export const Controls = () => (
  <Column cozy>
    <Field label="Bio" helper="Up to 200 characters.">
      <Textarea placeholder="Tell us about yourself" />
    </Field>
    <Field label="Role">
      <Select defaultValue="admin" options={[{ value: "admin", label: "Admin" }, { value: "editor", label: "Editor" }, { value: "viewer", label: "Viewer" }]} />
    </Field>
    <Field label="Notifications">
      <Checkbox defaultChecked>Email me about activity</Checkbox>
    </Field>
  </Column>
);
