import { Checkbox, Form, FormSection, Input, Row, Switch, Kbd, Typography } from "@nannier/canvas";

export const SignIn = () => (
  <Form accessibilityLabel="Sign in" submitLabel="Sign in" cancelLabel="Cancel">
    <Input label="Email" defaultValue="rachel@example.com" />
    <Input label="Password" secureTextEntry defaultValue="hunter2hunter2" />
    <Checkbox defaultChecked>Keep me signed in</Checkbox>
  </Form>
);

export const TwoColumn = () => (
  <Form twoColumn submitLabel="Save">
    <Input label="First name" defaultValue="Rachel" />
    <Input label="Last name" defaultValue="Chen" />
    <Input label="Email" defaultValue="rachel@example.com" />
    <Input label="Job title" defaultValue="Engineering Lead" />
  </Form>
);

export const Sections = () => (
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

export const AsideSections = () => (
  <Form
    submitLabel="Save changes"
    cancelLabel="Cancel"
    hints={<Row snug><Kbd>Enter</Kbd><Typography caption muted>to save</Typography></Row>}
  >
    <FormSection aside title="Workspace" description="Shown to everyone you invite, on invoices and in the sidebar.">
      <Input label="Name" defaultValue="Northwind" />
    </FormSection>
    <FormSection aside title="Members" description="Defaults for people who join from an invite link.">
      <Switch defaultChecked description="Guests see only the boards they are added to.">Allow guests</Switch>
    </FormSection>
  </Form>
);

export const Disabled = () => (
  <Form disabled submitLabel="Save">
    <Input label="Email" defaultValue="rachel@example.com" />
  </Form>
);
