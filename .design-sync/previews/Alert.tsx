import { Alert, Button, Column, Icon } from "@nannier/canvas";

export const Tones = () => (
  <Column cozy>
    <Alert info title="Heads up" description="Maintenance window scheduled for Sunday 2:00 UTC." />
    <Alert success title="All set" description="Your changes have been saved successfully." />
    <Alert warning title="Action required" description="Your trial expires in 3 days." />
    <Alert destructive title="Something went wrong" description="Could not save your changes. Please try again." />
  </Column>
);

export const Neutral = () => (
  <Alert icon={<Icon bell />} title="Scheduled maintenance" description="The dashboard may be briefly unavailable on Sunday between 2:00 and 3:00 UTC." />
);

export const Dismissible = () => (
  <Alert info dismissible title="Heads up" description="Maintenance window scheduled for Sunday 2:00 UTC." />
);

export const WithActions = () => (
  <Alert
    warning
    title="Action required"
    description="Your trial expires in 3 days."
    actions={
      <>
        <Button small primary>Upgrade</Button>
        <Button small ghost>Remind me later</Button>
      </>
    }
  />
);

export const Announcement = () => (
  <Alert announcement title="Canvas 4.0 is here" action={{ label: "See what's new" }} />
);
