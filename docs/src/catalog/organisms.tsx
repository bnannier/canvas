import { Calendar, Command, DataTable, Dialog, FilterPanel, Navbar, Steps, Tabs, useToast } from "@nannier/canvas";
import type { CatTile } from "./tile";

function CalendarsPreview() {
  return (
    <Calendar
      month="May 2026"
      today={23}
      defaultSelected={24}
      daysInMonth={31}
      startWeekday={4}
    />
  );
}

function CommandPalettePreview() {
  const { toast } = useToast();
  return (
    <Command
      trigger
      onSelect={(item) => toast({ message: item.label })}
      groups={[
        { heading: "Actions", items: [
          { label: "New File", icon: "file", shortcut: "Ctrl+N" },
          { label: "Open File", icon: "folder", shortcut: "Ctrl+O" },
          { label: "Save", icon: "save", shortcut: "Ctrl+S" }
        ] },
        { heading: "Navigation", items: [
          { label: "Go to Dashboard", icon: "arrowRight" },
          { label: "Go to Settings", icon: "arrowRight" }
        ] }
      ]}
    />
  );
}

function DataTablesPreview() {
  return (
    <DataTable
      columns={["Name", "Email", "Role"]}
      rows={[
        ["Alice Johnson", "alice@example.com", "Admin"],
        ["Bob Smith", "bob@example.com", "Editor"],
        ["Rachel Chen", "rachel@example.com", "Admin"]
      ]}
    />
  );
}

function FilterPanelsPreview() {
  return (
    <FilterPanel
      groups={[
        { title: "Status", options: [
          { label: "Active", checked: true, count: "128" },
          { label: "Pending", count: "12" },
          { label: "Archived", count: "2" }
        ] },
        { title: "Schema", options: [
          { label: "Default", count: "96" },
          { label: "Custom", count: "46" }
        ] }
      ]}
    />
  );
}

function NavbarsPreview() {
  const { toast } = useToast();
  return (
    <Navbar
      brand="Canvas"
      links={["Dashboard", "Users", "Settings"]}
      actionLabel="New"
      onAction={() => toast({ message: "New project requested" })}
      avatar="RC"
    />
  );
}

function DialogPreview() {
  return (
    <Dialog
      trigger="Open dialog"
      title="Refund payment"
      description="The refund posts to the original card in 2 to 3 business days."
      withBody
    />
  );
}

function StepsPreview() {
  return (
    <Steps
      steps={[{ label: "Account" }, { label: "Profile" }, { label: "Review" }]}
      defaultCurrent={1}
    />
  );
}

function TabsPreview() {
  return (
    <Tabs tabs={["General", "Security", "Notifications"]} />
  );
}

export const ORGANISMS_TILES: CatTile[] = [
  { title: "Calendar", href: "/components/calendar", Preview: CalendarsPreview },
  { title: "Command", href: "/components/command", Preview: CommandPalettePreview },
  { title: "DataTable", href: "/components/data-table", span: true, Preview: DataTablesPreview },
  { title: "FilterPanel", href: "/components/filter-panel", Preview: FilterPanelsPreview },
  { title: "Navbar", href: "/components/navbars", Preview: NavbarsPreview },
  { title: "Dialog", href: "/components/dialog", Preview: DialogPreview },
  { title: "Steps", href: "/components/steps", Preview: StepsPreview },
  { title: "Tabs", href: "/components/tabs", Preview: TabsPreview },
];
