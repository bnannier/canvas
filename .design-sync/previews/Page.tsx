import { Button, Card, Input, Page, Select, Switch, Typography } from "@nannier/canvas";

export const Overview = () => (
  <Page>
    <Typography h2>Overview</Typography>
    <Card title="Revenue" description="$48,250 this week" />
  </Page>
);

export const ProfileForm = () => (
  <Page md>
    <Typography h2>Profile</Typography>
    <Input label="Display name" defaultValue="Rachel Chen" />
    <Select label="Plan" defaultValue="Team" options={["Starter", "Team", "Enterprise"]} />
    <Button primary>Save</Button>
  </Page>
);

export const Settings = () => (
  <Page md start>
    <Typography h2>Notifications</Typography>
    <Switch defaultChecked description="A daily summary of your projects.">Email digest</Switch>
  </Page>
);
