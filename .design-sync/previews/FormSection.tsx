import { Checkbox, Form, FormSection, Input, Switch } from "@nannier/canvas";

export const Stacked = () => (
  <Form submitLabel="Save">
    <FormSection title="Personal info" description="This information will be displayed on your public profile.">
      <Input label="Full name" defaultValue="Rachel Chen" />
      <Input label="Email" defaultValue="rachel@example.com" />
    </FormSection>
    <FormSection title="Notifications" description="Choose how you'd like to be notified.">
      <Checkbox defaultChecked>Email notifications</Checkbox>
      <Checkbox>SMS alerts</Checkbox>
    </FormSection>
  </Form>
);

export const Aside = () => (
  <Form submitLabel="Save changes" cancelLabel="Cancel">
    <FormSection aside title="Workspace" description="Shown to everyone you invite, on invoices and in the sidebar.">
      <Input label="Name" defaultValue="Northwind" />
      <Input label="URL" prefix="canvas.app/" defaultValue="northwind" />
    </FormSection>
    <FormSection aside title="Members" description="Defaults for people who join from an invite link.">
      <Switch defaultChecked description="Guests see only the boards they are added to.">Allow guests</Switch>
    </FormSection>
  </Form>
);
