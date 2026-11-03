import { Command } from "@nannier/canvas";

const groups = [
  { heading: "Actions", items: [
    { label: "New File", icon: "file", shortcut: "Ctrl+N" },
    { label: "Open File", icon: "folder", shortcut: "Ctrl+O" },
    { label: "Save", icon: "save", shortcut: "Ctrl+S" },
  ] },
  { heading: "Navigation", items: [
    { label: "Go to Dashboard", icon: "arrowRight" },
    { label: "Go to Settings", icon: "arrowRight" },
  ] },
];

export const Palette = () => <Command open defaultActive={0} footer groups={groups} />;

export const Filtered = () => <Command open defaultQuery="go" groups={groups} />;

export const SearchTrigger = () => <Command trigger groups={groups} />;

export const EmptyResults = () => <Command open defaultQuery="zzz" emptyMessage="No results found." groups={groups} />;
