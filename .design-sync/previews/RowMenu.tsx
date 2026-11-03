import { RowMenu } from "@nannier/canvas";

export const Actions = () => (
  <RowMenu
    open
    sectionLabel="Actions"
    items={[
      { label: "Edit", icon: "pencil" },
      { label: "Duplicate", icon: "copy" },
      { label: "Delete", icon: "trash", destructive: true, separatorBefore: true },
    ]}
  />
);

export const WithShortcuts = () => (
  <RowMenu
    inline
    items={[
      { label: "Edit details", icon: "pencil", shortcut: "⌘E" },
      { label: "Move to…", icon: "folderOpen", submenu: true },
      { label: "Delete", icon: "trash2", destructive: true, separatorBefore: true, shortcut: "⌘⌫" },
    ]}
  />
);

export const Links = () => (
  <RowMenu
    inline
    links
    items={[
      { label: "Profile", icon: "userRound" },
      { label: "Notifications", icon: "bell", badge: "3 new" },
      { label: "Integrations", icon: "plug", meta: "3" },
    ]}
  />
);

export const DisabledItem = () => (
  <RowMenu inline items={[{ label: "Edit" }, { label: "Duplicate" }, { label: "Clear column", disabled: true }]} />
);
