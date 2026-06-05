import type { ComponentType } from "react";
import {
  ActionPanel,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  Chart,
  Checkbox,
  CodeBlock,
  DataTable,
  DescriptionList,
  Divider,
  EmptyState,
  Feed,
  Field,
  Fieldset,
  Form,
  GridList,
  Input,
  InputGroup,
  Kbd,
  MediaObject,
  Navbar,
  Pagination,
  Radio,
  Sidebar,
  Skeleton,
  Spinner,
  StackedList,
  Stats,
  Stepper,
  Switch,
  Tabs,
  Textarea,
  Typography,
} from "@olympusoss/canvas";

// Maps a component slug to the real Canvas component and how to derive its props
// from the playground state. The playground renders `<Component {...mapProps()}>`
// and serializes that SAME props object into the code panel (see jsx-code.ts), so
// the shown code always matches the render. `name` is the JSX tag used in the
// serialized code. Unregistered slugs fall back to the legacy HTML-string render.
export interface RegistryEntry {
  name: string;
  Component: ComponentType<Record<string, unknown>>;
  mapProps: (state: Record<string, unknown>) => Record<string, unknown>;
}

type AnyComponent = ComponentType<Record<string, unknown>>;

const BUTTON_VARIANT: Record<string, string> = {
  default: "primary",
  primary: "primary",
  secondary: "secondary",
  destructive: "destructive",
  outline: "outline",
  ghost: "ghost",
  link: "link",
};

const BUTTON_SIZE: Record<string, string | null> = {
  sm: "small",
  default: null,
  lg: "large",
  icon: "icon",
};

function buttonProps(s: Record<string, unknown>): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  props[BUTTON_VARIANT[String(s.variant)] ?? "primary"] = true;
  const size = BUTTON_SIZE[String(s.size)];
  if (size) props[size] = true;
  if (s.disabled) props.disabled = true;
  const label = (s.label as string) || "Button";
  props.children = s.size === "icon" ? "+" : s.withIcon ? `+  ${label}` : label;
  return props;
}

const CRUMB_TRAIL = ["Projects", "Identity Platform", "Settings", "Profile", "Avatar", "Edit"];

export const registry: Record<string, RegistryEntry> = {
  button: {
    name: "Button",
    Component: Button as AnyComponent,
    mapProps: buttonProps,
  },

  "button-group": {
    name: "ButtonGroup",
    Component: ButtonGroup as AnyComponent,
    mapProps: (s) => {
      const size = s.size === "sm" ? { small: true } : s.size === "lg" ? { large: true } : {};
      if (s.variant === "split") return { split: true, items: ["Save", "More"], ...size };
      if (s.variant === "attached") return { segmented: true, active: -1, items: ["‹", "Today", "›"], ...size };
      const n = (s.buttons as number) ?? 3;
      return { segmented: true, active: 0, items: ["Day", "Week", "Month", "Year", "All"].slice(0, n), ...size };
    },
  },

  badge: {
    name: "Badge",
    Component: Badge as AnyComponent,
    mapProps: (s) =>
      s.kind === "status"
        ? { status: true, [s.statusVariant as string]: true, children: (s.label as string) ?? "active" }
        : { [s.variant as string]: true, mono: s.mono === true, children: (s.label as string) ?? "admin" },
  },

  divider: {
    name: "Divider",
    Component: Divider as AnyComponent,
    mapProps: (s) => ({
      vertical: s.orientation === "vertical",
      children: s.orientation !== "vertical" && s.variant === "label" ? s.label : undefined,
    }),
  },

  kbd: {
    name: "Kbd",
    Component: Kbd as AnyComponent,
    mapProps: (s) => ({ children: ((s.keys as string) || "⌘ K").trim().split(/\s+/)[0] }),
  },

  spinner: {
    name: "Spinner",
    Component: Spinner as AnyComponent,
    mapProps: (s) => ({ small: s.size === "sm", large: s.size === "lg" }),
  },

  skeleton: {
    name: "Skeleton",
    Component: Skeleton as AnyComponent,
    mapProps: (s) => ({
      [s.shape as string]: true,
      animate: s.animate as boolean,
      className:
        s.shape === "text" || s.shape === "button" || s.shape === "avatar" ? `w-[${s.width}%]` : undefined,
    }),
  },

  avatar: {
    name: "Avatar",
    Component: Avatar as AnyComponent,
    mapProps: (s) => ({
      large: (s.size as number) >= 48,
      small: (s.size as number) <= 28,
      ring: s.ring === true,
      src: s.variant === "single" ? undefined : "https://i.pravatar.cc/100",
      name: ((s.initials as string) || "AO").slice(0, 2).toUpperCase(),
    }),
  },

  breadcrumb: {
    name: "Breadcrumb",
    Component: Breadcrumb as AnyComponent,
    mapProps: (s) => ({
      items: CRUMB_TRAIL.slice(0, (s.depth as number) ?? 4),
      chevron: s.separator === "chevron",
      slash: s.separator === "slash",
      dot: s.separator === "dot",
    }),
  },

  checkbox: {
    name: "Checkbox",
    Component: Checkbox as AnyComponent,
    mapProps: (s) => ({
      checked: s.state === "checked",
      disabled: s.state === "disabled",
      children: s.withDesc
        ? `${s.label}: get notified when activity happens on your account.`
        : s.label,
    }),
  },

  radio: {
    name: "Radio",
    Component: Radio as AnyComponent,
    mapProps: (s) => ({
      checked: true,
      small: s.variant === "inline",
      children: s.withDesc ? "Pro, for growing teams that need more control." : "Pro",
    }),
  },

  switch: {
    name: "Switch",
    Component: Switch as AnyComponent,
    mapProps: (s) => ({ checked: s.state === "on", disabled: Boolean(s.disabled), children: s.label || undefined }),
  },

  input: {
    name: "Input",
    Component: Input as AnyComponent,
    mapProps: (s) => {
      const st = s.state as string;
      return {
        multiline: s.type === "textarea",
        error: st === "error",
        disabled: st === "disabled",
        readOnly: st === "readonly",
        placeholder:
          s.type === "textarea" ? "Describe the change" : s.type === "number" ? "1024" : "rachel.chen@example.com",
        className: "max-w-[320px]",
      };
    },
  },

  textarea: {
    name: "Textarea",
    Component: Textarea as AnyComponent,
    mapProps: (s) => ({
      rows: s.rows as number,
      disabled: s.disabled as boolean,
      placeholder: "A few words about this project",
    }),
  },

  "input-group": {
    name: "InputGroup",
    Component: InputGroup as AnyComponent,
    mapProps: (s) => {
      const v = s.variant as string;
      return {
        small: s.size === "sm",
        large: s.size === "lg",
        disabled: Boolean(s.disabled),
        prefix: v === "lead-text" ? "https://" : v === "lead-icon" ? "🔍" : v === "currency" ? "$" : undefined,
        suffix:
          v === "trail-text" ? "@canvas.dev"
            : v === "trail-icon" ? "✉"
              : v === "currency" ? "USD"
                : v === "action" ? "Copy"
                  : undefined,
        action: v === "action",
        placeholder:
          v === "lead-text" ? "example.com"
            : v === "trail-text" ? "ada"
              : v === "lead-icon" ? "Quick search"
                : v === "trail-icon" ? "you@example.com"
                  : v === "currency" ? "0.00"
                    : "sk_live_4242",
        className: "max-w-[320px]",
      };
    },
  },

  pagination: {
    name: "Pagination",
    Component: Pagination as AnyComponent,
    mapProps: (s) => {
      const total = s.totalPages as number;
      const page = Math.min(s.currentPage as number, total);
      return { page, total, compact: s.variant === "compact", onChange: () => {} };
    },
  },

  typography: {
    name: "Typography",
    Component: Typography as AnyComponent,
    mapProps: (s) => ({ [s.style as string]: true, children: (s.content as string) ?? "The quick brown fox" }),
  },

  card: {
    name: "Card",
    Component: Card as AnyComponent,
    mapProps: (s) => {
      const type = s.type as string;
      if (type === "generic") {
        return { padded: true, title: "Anything goes here", body: "The card surface gives you the border, radius, and shadow. You bring the content." };
      }
      if (type === "section") {
        return s.header
          ? { title: "Recent activity", body: "A labeled content surface. Drop fields, a list, or any module of content here." }
          : { body: "A labeled content surface. Drop fields, a list, or any module of content here." };
      }
      return { padded: true, title: s.label as string, body: `${s.value} (+142 today)` };
    },
  },

  alert: {
    name: "Alert",
    Component: Alert as AnyComponent,
    mapProps: (s) => {
      const v = s.variant as string;
      const tone = v === "destructive" ? "error" : v;
      const titles: Record<string, string> = { info: "Heads up", success: "All set", warning: "Action required", destructive: "Something went wrong" };
      const descs: Record<string, string> = { info: "Maintenance window scheduled for Sunday 2:00 UTC.", success: "Your changes have been saved successfully.", warning: "Your trial expires in 3 days.", destructive: "Could not save your changes. Please try again." };
      const glyphs: Record<string, string> = { info: "ℹ", success: "✓", warning: "⚠", destructive: "✕" };
      return { [tone]: true, icon: glyphs[v], title: s.title ? titles[v] : undefined, description: descs[v] };
    },
  },

  "empty-state": {
    name: "EmptyState",
    Component: EmptyState as AnyComponent,
    mapProps: (s) => {
      const v = s.variant as string;
      const icons: Record<string, string> = { search: "🔍", users: "👥", files: "📄", activity: "📈", notifications: "🔔", errors: "✅", "all-clear": "✅" };
      const titles: Record<string, string> = { search: "No results found", users: "No users", files: "No files", activity: "No activity", notifications: "All caught up", errors: "No errors", "all-clear": "All clear" };
      const descs: Record<string, string> = { search: "Try adjusting your search filters.", users: "Invite your first team member.", files: "Upload or drag files here.", activity: "Events will appear as they happen.", notifications: "No new notifications.", errors: "Everything is running smoothly.", "all-clear": "No locked accounts or pending reviews." };
      const positive = v === "errors" || v === "all-clear";
      return { icon: icons[v], title: titles[v], description: descs[v], actionLabel: s.action ? "Create identity" : undefined, positive, bordered: true, compact: Boolean(s.inTable) };
    },
  },

  stats: {
    name: "Stats",
    Component: Stats as AnyComponent,
    mapProps: (s) => {
      const showDelta = s.delta !== false;
      if (s.variant === "group") {
        return { items: [
          { label: "Total users", value: "12,847", delta: showDelta ? "+12.5%" : undefined },
          { label: "Active sessions", value: "1,024", delta: showDelta ? "+3.2%" : undefined },
          { label: "Error rate", value: "0.12%", delta: showDelta ? "+0.03%" : undefined, down: true },
        ] };
      }
      if (s.variant === "plain") {
        return { plain: true, title: "Key metrics", items: [
          { label: "Revenue", value: "$48.2k" },
          { label: "Orders", value: "842" },
          { label: "Avg. value", value: "$57.24" },
          { label: "Conversion", value: "3.6%" },
        ] };
      }
      if (s.variant === "sparkline") {
        return { items: [
          { label: "Requests", value: "24.5k", delta: "+8.2%" },
          { label: "Latency", value: "142ms", delta: "+12ms", down: true },
        ] };
      }
      return { items: [{ label: "Active users", value: "71,897", delta: showDelta ? "+12.3% vs. last 30 days" : undefined }] };
    },
  },

  "media-objects": {
    name: "MediaObject",
    Component: MediaObject as AnyComponent,
    mapProps: (s) => ({
      avatar: s.variant === "icon" ? undefined : s.variant === "action" ? "AL" : "RC",
      icon: s.variant === "icon" ? "S" : undefined,
      title: s.variant === "action" ? "Ada Lovelace" : s.variant === "icon" ? "Security first" : "Rachel Chen",
      description: s.variant === "action" ? "ada@example.com" : s.variant === "icon" ? "End-to-end encryption with automatic key rotation." : "Engineering Lead",
      body: s.variant === "avatar" ? "Reviewed the latest pull request and left comments on the auth middleware changes." : undefined,
      center: s.variant !== "avatar",
      start: s.variant === "avatar",
      truncate: s.variant === "action",
      bordered: true,
    }),
  },

  "stacked-lists": {
    name: "StackedList",
    Component: StackedList as AnyComponent,
    mapProps: (s) => {
      const twoLine = [
        { name: "Rachel Chen", detail: "rachel.chen@example.com", meta: "admin" },
        { name: "Ada Lovelace", detail: "ada@example.com", meta: "editor" },
        { name: "Kevin Turner", detail: "kevin@example.com", meta: "viewer" },
      ];
      const clickable = [
        { name: "Rachel Chen", detail: "rachel.chen@example.com", meta: "2h ago" },
        { name: "Ada Lovelace", detail: "ada@example.com", meta: "5h ago" },
        { name: "Kevin Turner", detail: "kevin@example.com", meta: "1d ago" },
      ];
      const card = [
        { name: "Rachel Chen", detail: "Engineering Lead" },
        { name: "Ada Lovelace", detail: "Staff Engineer" },
      ];
      const items = s.variant === "clickable" ? clickable : s.variant === "card" ? card : twoLine;
      return {
        items,
        clickable: s.variant === "clickable",
        card: s.variant === "card",
        flush: s.variant === "card" ? false : s.divider === false,
        title: s.variant === "card" ? "Team members" : undefined,
      };
    },
  },

  "code-block": {
    name: "CodeBlock",
    Component: CodeBlock as AnyComponent,
    mapProps: (s) => ({
      code: 'const theme = getTheme();\nsetTheme(theme === "dark" ? "light" : "dark");',
      filename: "theme.ts",
      language: "ts",
      terminal: s.variant === "terminal",
      numbered: s.variant === "numbered",
      inline: s.variant === "inline",
      copy: !!s.copy,
      wrap: !!s.wrap,
    }),
  },

  field: {
    name: "Field",
    Component: Field as AnyComponent,
    mapProps: (s) => ({
      label: (s.mode === "basic" ? (s.label as string) : s.mode === "mono" ? "Client ID" : "Status") || "User ID",
      helper: s.mode === "mono" ? "Fixed-width value for IDs and hashes." : "Shown on the public profile.",
      placeholder: s.mode === "mono" ? "clt_8f2a9b4c7e1d" : "Rachel Chen",
      required: s.mode === "basic",
      className: "max-w-[400px]",
    }),
  },

  form: {
    name: "Form",
    Component: Form as AnyComponent,
    mapProps: (s) => ({
      stacked: s.layout === "stacked",
      twoColumn: s.layout === "two-column",
      sidebar: s.layout === "sidebar",
      fields:
        s.layout === "two-column"
          ? [
              { label: "First name", placeholder: "Ada" },
              { label: "Last name", placeholder: "King" },
              { label: "Email", placeholder: "ada@example.com" },
            ]
          : s.layout === "sidebar"
            ? [
                { label: "Full name", placeholder: "Rachel Chen", helper: "Displayed on your public profile." },
                { label: "Email", placeholder: "rachel@example.com", helper: "Used for sign-in and receipts." },
              ]
            : [
                { label: "Email", placeholder: "you@example.com" },
                { label: "Password" },
              ],
      submitLabel: s.layout === "two-column" ? "Create" : "Sign in",
      cancelLabel: s.layout === "two-column" ? "Cancel" : undefined,
      className: s.layout === "two-column" ? "max-w-[560px]" : s.layout === "sidebar" ? "max-w-[720px]" : "max-w-[360px]",
    }),
  },

  fieldset: {
    name: "Fieldset",
    Component: Fieldset as AnyComponent,
    mapProps: (s) => ({
      legend: s.legend ? (s.content === "checkboxes" ? "Email notifications" : "Shipping details") : undefined,
      description: s.description
        ? s.content === "checkboxes"
          ? "Choose what we email you about."
          : "Where should we send your order?"
        : undefined,
      disabled: s.disabled,
      error: s.content === "fields" && s.error,
      twoColumn: s.content === "fields" && s.columns === "2",
      checkboxes:
        s.content === "checkboxes"
          ? [
              { label: "Product updates", checked: true },
              { label: "Security alerts", checked: true },
              { label: "Weekly digest", checked: false },
            ]
          : undefined,
      items:
        s.content === "fields"
          ? [
              { label: "Full name", placeholder: "Ada Lovelace" },
              { label: "Email", placeholder: "ada@example.com", helper: "We'll only use this for order updates." },
              { label: "Country", placeholder: "United States" },
            ]
          : undefined,
    }),
  },

  "action-panels": {
    name: "ActionPanel",
    Component: ActionPanel as AnyComponent,
    mapProps: (s) => ({
      title: (s.title as string) || (s.variant === "side-by-side" ? "Discard unsaved changes?" : "Delete this project"),
      description:
        s.variant === "side-by-side"
          ? "You have unsaved edits in this form. Leaving now will lose all progress."
          : "Once you delete a project, there is no going back. Please be certain.",
      actionLabel:
        s.destructive === true
          ? s.variant === "side-by-side"
            ? "Discard"
            : "Delete project"
          : s.variant === "side-by-side"
            ? "Save"
            : "Save changes",
      destructive: s.destructive === true,
      inline: s.variant === "side-by-side",
    }),
  },

  "description-lists": {
    name: "DescriptionList",
    Component: DescriptionList as AnyComponent,
    mapProps: (s) => ({
      items: [
        { term: "Full name", value: "Rachel Chen" },
        { term: "Email", value: "rachel.chen@example.com" },
        { term: "Role", value: "admin" },
        { term: "Status", value: "Active" },
      ],
      card: true,
      inline: s.variant === "two-column" || s.variant === "inline-edit",
      divided: s.variant === "two-column" || s.variant === "inline-edit",
    }),
  },

  tabs: {
    name: "Tabs",
    Component: Tabs as AnyComponent,
    mapProps: (s) => {
      const labelled = [
        { label: "All", badge: "142" },
        { label: "Active", badge: "89" },
        { label: "Pending", badge: "12" },
        { label: "Archived", badge: "53" },
      ];
      const plain = ["General", "Security", "Notifications", "Billing", "Integrations"];
      const pills = ["All", "Active", "Archived", "Deleted"];
      const isPill = s.variant === "pill";
      const useBadges = s.variant === "underline" && !!s.badges;
      return { pills: isPill, tabs: isPill ? pills : useBadges ? labelled : plain, active: 0, onChange: () => {} };
    },
  },

  stepper: {
    name: "Stepper",
    Component: Stepper as AnyComponent,
    mapProps: (s) => ({
      steps: [
        { label: "Account", description: "Email verified and password set." },
        { label: "Profile", description: "Add your name and avatar." },
        { label: "Review", description: "Invite collaborators to your workspace." },
        { label: "Done", description: "You're all set." },
      ],
      current: 1,
      vertical: s.type === "Vertical",
    }),
  },

  feeds: {
    name: "Feed",
    Component: Feed as AnyComponent,
    mapProps: (s) => {
      const items =
        s.variant === "avatar"
          ? [
              { actor: "Rachel Chen", action: "commented on the pull request", time: "2 hours ago" },
              { actor: "Ada Lovelace", action: "pushed 3 commits", time: "5 hours ago" },
              { actor: "Kevin Turner", action: "opened the pull request", time: "1 day ago" },
            ]
          : [
              { actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" },
              { actor: "Ada Lovelace", action: "updated the description", time: "5 hours ago" },
              { actor: "System", action: "created the project", time: "3 days ago" },
            ];
      return { connector: s.variant === "connector", avatar: s.variant === "avatar", items };
    },
  },

  "grid-lists": {
    name: "GridList",
    Component: GridList as AnyComponent,
    mapProps: (s) => {
      const gallery = s.variant === "gallery";
      const people = [
        { title: "Rachel Chen", subtitle: "Engineering Lead", avatar: "RC" },
        { title: "Ada Lovelace", subtitle: "Staff Engineer", avatar: "AL" },
        { title: "Kevin Turner", subtitle: "Product Designer", avatar: "KT" },
      ];
      const files = [
        { title: "hero-banner.png", subtitle: "1.2 MB", avatar: "HB" },
        { title: "icon-set.svg", subtitle: "340 KB", avatar: "IS" },
        { title: "product-shot.jpg", subtitle: "2.8 MB", avatar: "PS" },
        { title: "avatar-default.png", subtitle: "96 KB", avatar: "AD" },
      ];
      return { items: gallery ? files : people, cols3: gallery, cols2: !gallery };
    },
  },

  navbars: {
    name: "Navbar",
    Component: Navbar as AnyComponent,
    mapProps: (s) => ({
      brand: "Canvas",
      links: ["Dashboard", "Users", "Settings"],
      active: 0,
      actionLabel: s.layout === "search" ? undefined : "New",
      avatar: "RC",
      bordered: s.layout !== "mobile",
    }),
  },

  "data-table": {
    name: "DataTable",
    Component: DataTable as AnyComponent,
    mapProps: (s) => ({
      columns: ["Name", "Email", "Role", "Status"],
      rows: [
        ["Alice Johnson", "alice@example.com", "Admin", "Active"],
        ["Bob Smith", "bob@example.com", "Editor", "Inactive"],
        ["Rachel Chen", "rachel@example.com", "Admin", "Active"],
      ],
      bordered: true,
      compact: s.density === "compact",
      selectable: s.variant === "bulk",
    }),
  },

  calendar: {
    name: "Calendar",
    Component: Calendar as AnyComponent,
    mapProps: () => ({ month: "May 2026", today: 23, selected: 24, daysInMonth: 31, startWeekday: 4 }),
  },

  sidebar: {
    name: "Sidebar",
    Component: Sidebar as AnyComponent,
    mapProps: (s) => ({
      active: "Dashboard",
      sections: [
        {
          title: s.groupLabels ? "Main" : undefined,
          items: [
            { label: "Dashboard", icon: "◉" },
            { label: "Users", icon: "○", badge: "12" },
            { label: "Settings", icon: "◇" },
          ],
        },
        {
          title: s.groupLabels ? "Reports" : undefined,
          items: [{ label: "Analytics", icon: "△" }],
        },
      ],
    }),
  },

  charts: {
    name: "Chart",
    Component: Chart as AnyComponent,
    mapProps: (s) => ({
      title: "Signups",
      data: [
        { label: "Mon", value: 45 },
        { label: "Tue", value: 60 },
        { label: "Wed", value: 35 },
        { label: "Thu", value: 70 },
        { label: "Fri", value: 55 },
        { label: "Sat", value: 80 },
        { label: "Sun", value: 95 },
      ],
      max: 100,
      success: s.type === "stacked" || s.type === "gauge",
      destructive: s.type === "heatmap",
      horizontal: s.type === "sparkline" || s.type === "gauge",
    }),
  },
};
