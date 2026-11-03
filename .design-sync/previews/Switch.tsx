import { Switch, Column } from "@nannier/canvas";

export const Notifications = () => (
  <Switch defaultChecked description="Get notified when activity happens.">Email notifications</Switch>
);

export const States = () => (
  <Column>
    <Switch defaultChecked>Dark mode</Switch>
    <Switch>Auto-save drafts</Switch>
    <Switch disabled>Managed by your admin</Switch>
    <Switch disabled defaultChecked>Required by policy</Switch>
  </Column>
);

export const Sizes = () => (
  <Column>
    <Switch small defaultChecked>Small</Switch>
    <Switch defaultChecked>Medium</Switch>
    <Switch large defaultChecked>Large</Switch>
  </Column>
);

export const Listed = () => (
  <Column>
    <Switch listed divided defaultChecked description="Weekly product news.">Newsletter</Switch>
    <Switch listed divided description="Security and billing alerts.">Alerts</Switch>
  </Column>
);
