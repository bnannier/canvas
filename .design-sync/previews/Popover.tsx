import { Popover, Input, Typography } from "@nannier/canvas";

export const Inline = () => (
  <Popover inline title="Rename project" description="Choose a name your team will recognize." actionLabel="Rename">
    <Input label="Project name" defaultValue="Identity Platform" />
  </Popover>
);

export const InlineBeak = () => (
  <Popover inline top title="Share link" description="Anyone with the link can view." actionLabel="Copy link" />
);

export const DescriptionOnly = () => (
  <Popover inline description="A workspace groups your projects, members, and billing under one plan." />
);

export const Compact = () => (
  <Popover inline compact comfortable anchored panelWidth={320} accessibilityLabel="Filters">
    <Typography small muted>Choose the roles and pods to include.</Typography>
  </Popover>
);
