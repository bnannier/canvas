import { AppFrame, Button, Card, Input, Navbar, Page, Switch, Typography } from "@nannier/canvas";

export const Dashboard = () => (
  <AppFrame header={<Navbar bordered brand="Acme" defaultActive={0} links={["Overview", "Reports"]} />}>
    <Page>
      <Typography h2>Overview</Typography>
      <Card title="Revenue" description="$48,250 this week" />
    </Page>
  </AppFrame>
);

export const ProfilePage = () => (
  <AppFrame header={<Navbar bordered brand="Acme" />}>
    <Page md>
      <Typography h2>Profile</Typography>
      <Input label="Display name" defaultValue="Rachel Chen" />
      <Button primary>Save</Button>
    </Page>
  </AppFrame>
);

export const Notifications = () => (
  <AppFrame header={<Navbar bordered brand="Acme" />}>
    <Page md start>
      <Typography h2>Notifications</Typography>
      <Switch defaultChecked description="A daily summary of your projects.">Email digest</Switch>
    </Page>
  </AppFrame>
);
