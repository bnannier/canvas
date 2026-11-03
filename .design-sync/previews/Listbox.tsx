import { Listbox } from "@nannier/canvas";

const regions = [
  { label: "US East", detail: "Virginia, 12 ms" },
  { label: "EU West", detail: "Ireland, 84 ms" },
  { label: "Asia Pacific", detail: "Singapore, 192 ms" },
];

export const SingleSelect = () => <Listbox items={regions} defaultSelected={0} accessibilityLabel="Deployment region" />;

export const Bordered = () => <Listbox bordered items={regions} defaultSelected={1} accessibilityLabel="Deployment region" />;

export const Multi = () => (
  <Listbox
    multi
    bordered
    items={[{ label: "Email" }, { label: "Push notifications" }, { label: "SMS" }, { label: "Slack" }]}
    defaultSelected={[0, 1]}
    accessibilityLabel="Notification channels"
  />
);

export const Small = () => <Listbox small items={[{ label: "Daily digest" }, { label: "Weekly summary" }, { label: "Monthly report" }]} defaultSelected={1} />;

export const Disabled = () => <Listbox disabled bordered items={regions} defaultSelected={0} accessibilityLabel="Deployment region" />;
