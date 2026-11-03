import { Button, Icon, Navbar } from "@nannier/canvas";

export const Default = () => (
  <Navbar bordered brand="Canvas" defaultActive={0} links={["Dashboard", "Users", "Settings"]} actionLabel="New" avatar="RC" />
);

export const Floating = () => <Navbar floating compact brand="Canvas" defaultActive={1} links={["Docs", "Components", "Templates"]} />;

export const WithBrandIcon = () => (
  <Navbar bordered brandContent={<Icon layers size={20} />} brand="Console" defaultActive={0} links={["Overview", "Access", "Audit"]} avatar="RC" />
);

export const WithActions = () => (
  <Navbar
    bordered
    brand="Catalog"
    actions={<Button ghost small icon accessibilityLabel="Search" iconLeft={<Icon search size={16} />} />}
    avatar="RC"
  />
);
