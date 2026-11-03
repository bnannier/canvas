import { ActionPanel, Column, Input } from "@nannier/canvas";

export const Export = () => (
  <ActionPanel title="Export your data" description="Download everything in this workspace as a ZIP archive." actionLabel="Export" />
);

export const Destructive = () => (
  <ActionPanel destructive title="Delete this project" description="Once you delete a project, there is no going back." actionLabel="Delete project" />
);

export const Inline = () => (
  <ActionPanel inline title="Weekly digest" description="A summary of workspace activity, sent every Monday." actionLabel="Subscribe" />
);

export const Toggle = () => (
  <ActionPanel toggle defaultChecked title="Two-factor authentication" description="Require a verification code on every login." />
);

export const EmbeddedFields = () => (
  <ActionPanel title="Workspace profile" description="These details appear on every invoice." actionLabel="Save changes">
    <Column cozy>
      <Input label="Workspace name" defaultValue="Northwind" />
      <Input label="Billing email" defaultValue="billing@northwind.com" />
    </Column>
  </ActionPanel>
);
