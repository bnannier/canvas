import { Tabs } from "@nannier/canvas";

export const Underline = () => <Tabs tabs={["General", "Security", "Notifications"]} defaultActive={0} />;

export const Pills = () => <Tabs pills tabs={["All", "Active", "Archived"]} defaultActive={0} />;

export const WithBadges = () => (
  <Tabs tabs={[{ label: "All", badge: "142" }, { label: "Active", badge: "89" }, { label: "Archived", badge: "53" }]} defaultActive={1} />
);

export const DisabledTab = () => <Tabs tabs={["Overview", { label: "Billing", disabled: true }, "Settings"]} defaultActive={0} />;

export const Vertical = () => (
  <Tabs
    vertical
    tabs={[{ label: "General", icon: "settings2" }, { label: "Members", icon: "users" }, { label: "Security", icon: "shieldCheck" }]}
    defaultActive={0}
  />
);
