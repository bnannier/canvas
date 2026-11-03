import { Sidebar } from "@nannier/canvas";

export const Default = () => (
  <Sidebar
    bordered
    defaultActive="Dashboard"
    items={[
      { label: "Dashboard", icon: "layoutGrid" },
      { label: "Members", icon: "users" },
      { label: "Security", icon: "shield", badge: "3", badgeError: true },
    ]}
  />
);

export const Sections = () => (
  <Sidebar
    defaultActive="overview"
    sections={[
      {
        title: "Workspace",
        items: [
          { id: "overview", label: "Overview", icon: "layoutDashboard" },
          { id: "members", label: "Members", icon: "users", meta: "24" },
          { id: "tokens", label: "Tokens", icon: "palette", badge: "New", badgeAccent: true },
        ],
      },
    ]}
    account={{ name: "Northwind", detail: "24 members" }}
  />
);

export const Collapsed = () => (
  <Sidebar
    bordered
    collapsed
    defaultActive="Dashboard"
    items={[
      { label: "Dashboard", icon: "layoutGrid" },
      { label: "Inbox", icon: "inbox" },
      { label: "Settings", icon: "settings" },
    ]}
  />
);
