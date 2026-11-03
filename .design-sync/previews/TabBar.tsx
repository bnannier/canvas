import { Icon, TabBar } from "@nannier/canvas";

const items = (unread?: boolean) => [
  { key: "home", label: "Home", icon: (active: boolean) => <Icon home size={19} primary={active} muted={!active} /> },
  { key: "inbox", label: "Inbox", unread, icon: (active: boolean) => <Icon inbox size={19} primary={active} muted={!active} /> },
  { key: "search", label: "Search", icon: (active: boolean) => <Icon search size={19} primary={active} muted={!active} /> },
  { key: "profile", label: "Profile", icon: (active: boolean) => <Icon user size={19} primary={active} muted={!active} /> },
];

export const HomeActive = () => <TabBar active="home" onSelect={() => {}} items={items()} />;

export const WithUnread = () => <TabBar active="search" onSelect={() => {}} items={items(true)} />;
