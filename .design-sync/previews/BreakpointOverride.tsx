import { BreakpointOverride, Sidebar, Typography } from "@nannier/canvas";

// A responsive Sidebar is window-level chrome: it reads the viewport tier, so the
// override changes what it renders (the inline rail on desktop, the drill-down drawer
// at or below lg).
const Nav = ({ open }: { open?: boolean }) => (
  <Sidebar
    responsive
    defaultActive="Dashboard"
    open={open}
    header={() => <Typography body semibold>Acme</Typography>}
    sections={[
      { items: [
        { label: "Dashboard", icon: "layoutGrid" },
        { label: "Inbox", icon: "inbox", badge: "3" },
      ] },
      { title: "Reports", icon: "barChart2", collapsible: true, items: [
        { label: "Analytics", icon: "barChart2" },
        { label: "Traffic", icon: "activity" },
      ] },
    ]}
  />
);

export const DesktopRail = () => (
  <BreakpointOverride value="xl">
    <Nav />
  </BreakpointOverride>
);

export const PhoneDrawer = () => (
  <BreakpointOverride value="sm">
    <Nav open />
  </BreakpointOverride>
);
