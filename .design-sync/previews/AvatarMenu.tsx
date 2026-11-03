import { AvatarMenu, Column } from "@nannier/canvas";

const items = [
  { label: "Profile", icon: "user" },
  { label: "Settings", icon: "settings" },
  { label: "Sign out", icon: "logOut", destructive: true, separatorBefore: true },
];

export const Default = () => (
  <AvatarMenu name="Rachel Chen" email="rachel.chen@example.com" items={items} />
);

export const Inline = () => (
  <AvatarMenu inline name="Rachel Chen" email="rachel.chen@example.com" menuWidth={240} items={items} />
);

export const Compact = () => (
  <AvatarMenu compact name="Marcus Allen" email="admin@example.com" items={items} />
);

export const RoleSwitcher = () => (
  <Column>
    <AvatarMenu
      account
      name="Bobby"
      email="Principal Engineer"
      initials="B"
      triggerLabel="Viewing as Principal Engineer. Switch role"
      menuLabel="View as role"
      menuWidth={300}
      items={[{ label: "Principal Engineer", selected: true }, { label: "Architect" }]}
    />
  </Column>
);
