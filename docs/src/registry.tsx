import { createElement, type ComponentType, type ReactNode } from "react";
import { isElLike, type ElChild } from "@/jsx-code";
import {
  Box,
  Text,
  ActionPanel,
  Alert,
  AlertDialog,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  CardSeparator,
  Chart,
  Checkbox,
  CodeBlock,
  Combobox,
  Command,
  DataTable,
  DescriptionList,
  Dialog,
  Divider,
  Dropdown,
  EmptyState,
  Feed,
  Field,
  Fieldset,
  FilterPanel,
  Form,
  GridList,
  Icon,
  Input,
  InputGroup,
  Kbd,
  Listbox,
  MediaObject,
  Navbar,
  Overlay,
  Pagination,
  Popover,
  Radio,
  RowMenu,
  Select,
  Sidebar,
  Skeleton,
  Spinner,
  StackedList,
  Stats,
  Stepper,
  Switch,
  Tabs,
  Textarea,
  Tooltip,
  Typography,
} from "@olympusoss/canvas";

// Maps a component slug to the real Canvas component and how to derive its props
// from the playground state. The playground renders `<Component {...mapProps()}>`
// and serializes that SAME props object into the code panel (see jsx-code.ts), so
// the shown code always matches the render. `name` is the JSX tag used in the
// serialized code. Unregistered slugs fall back to the legacy HTML-string render.
// A small controller the playground passes to mapProps/treeFn so a preview can
// wire demo-only handlers (toggle state, open overlays, flash feedback). These
// are function-valued props, which jsx-code.ts strips from the code panel, so
// demo wiring never changes the shown code.
export interface DemoApi {
  /** The same setter the controls use; lets a preview drive demo-only state. */
  set: (key: string, value: unknown) => void;
  /** Flash the muted "Fired:" line under the preview, for clicks with no other visible result. */
  fire: (label: string) => void;
  /** Current playground state, for read-back convenience. */
  state: Record<string, unknown>;
}

export interface RegistryEntry {
  name: string;
  Component: ComponentType<Record<string, unknown>>;
  mapProps: (state: Record<string, unknown>, demo?: DemoApi) => Record<string, unknown>;
}

type AnyComponent = ComponentType<Record<string, unknown>>;

// Components a composite `tree` may reference by name. Layout containers are
// Box/Text from the engine; the rest are real Canvas components. serializeTree
// (jsx-code.ts) emits these same names, so preview and code stay identical.
const COMPONENT_MAP: Record<string, AnyComponent> = {
  Box: Box as AnyComponent,
  Text: Text as AnyComponent,
  Avatar: Avatar as AnyComponent,
  Badge: Badge as AnyComponent,
  Breadcrumb: Breadcrumb as AnyComponent,
  Button: Button as AnyComponent,
  Calendar: Calendar as AnyComponent,
  Card: Card as AnyComponent,
  CardContent: CardContent as AnyComponent,
  CardHeader: CardHeader as AnyComponent,
  CardSeparator: CardSeparator as AnyComponent,
  Checkbox: Checkbox as AnyComponent,
  Divider: Divider as AnyComponent,
  Dropdown: Dropdown as AnyComponent,
  EmptyState: EmptyState as AnyComponent,
  Field: Field as AnyComponent,
  Icon: Icon as AnyComponent,
  Input: Input as AnyComponent,
  InputGroup: InputGroup as AnyComponent,
  Kbd: Kbd as AnyComponent,
  MediaObject: MediaObject as AnyComponent,
  Radio: Radio as AnyComponent,
  Select: Select as AnyComponent,
  Spinner: Spinner as AnyComponent,
  Switch: Switch as AnyComponent,
  Textarea: Textarea as AnyComponent,
};

/** Render a composite element tree (a registry entry's `tree`) into React
 *  elements via COMPONENT_MAP. Strings/numbers pass through as text nodes. */
export function renderTree(node: ElChild, key?: number): ReactNode {
  if (typeof node === "string" || typeof node === "number") return node;
  const Comp = COMPONENT_MAP[node.type];
  if (!Comp) {
    if (typeof console !== "undefined") console.warn(`renderTree: unknown component "${node.type}"`);
    return null;
  }
  const kids =
    node.children == null
      ? undefined
      : Array.isArray(node.children)
        ? node.children.map((c, i) => renderTree(c, i))
        : renderTree(node.children, 0);
  // Element-valued props are slots (e.g. action={<Button/>}); render them too.
  const props: Record<string, unknown> = { key };
  if (node.props) {
    for (const [k, v] of Object.entries(node.props)) props[k] = isElLike(v) ? renderTree(v) : v;
  }
  return createElement(Comp, props, kids);
}

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

function buttonProps(s: Record<string, unknown>, demo?: DemoApi): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  props[BUTTON_VARIANT[String(s.variant)] ?? "primary"] = true;
  const size = BUTTON_SIZE[String(s.size)];
  if (size) props[size] = true;
  if (s.disabled) props.disabled = true;
  const label = (s.label as string) || "Button";
  props.children = s.size === "icon" ? "+" : s.withIcon ? `+  ${label}` : label;
  // Demo: pressing flashes the real loading spinner for ~700ms.
  props.loading = s.demoBusy === true;
  props.onPress = () => {
    if (s.disabled) return;
    demo?.set("demoBusy", true);
    demo?.fire("Button pressed");
    setTimeout(() => demo?.set("demoBusy", false), 700);
  };
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
    mapProps: (s, demo) => {
      const size = s.size === "sm" ? { small: true } : s.size === "lg" ? { large: true } : {};
      const fireItem = (_i: number, item: string) => demo?.fire(item);
      if (s.variant === "split") return { split: true, items: ["Save", "More"], onSelect: fireItem, ...size };
      if (s.variant === "attached") return { segmented: true, active: -1, items: ["‹", "Today", "›"], onSelect: fireItem, ...size };
      const n = (s.buttons as number) ?? 3;
      return { segmented: true, active: (s.demoSeg as number) ?? 0, items: ["Day", "Week", "Month", "Year", "All"].slice(0, n), onSelect: (i: number) => demo?.set("demoSeg", i), ...size };
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
    mapProps: (s) => {
      const shape = s.shape as string;
      const width = s.width as number;
      return {
        [shape]: true,
        animate: s.animate as boolean,
        // Avatar has no pixel-diameter prop; map the width slider onto the real
        // small/large size axis so it stays a circle that scales (emitting a
        // w-[%] className would override only width and produce an oval).
        small: shape === "avatar" && width <= 33,
        large: shape === "avatar" && width >= 66,
        // Text and button widen by percentage; last-wins lets w-[%] win while
        // the button keeps its fixed height.
        className: shape === "text" || shape === "button" ? `w-[${width}%]` : undefined,
      };
    },
  },

  avatar: {
    name: "Avatar",
    Component: Avatar as AnyComponent,
    mapProps: (s, demo) => ({
      large: (s.size as number) >= 48,
      small: (s.size as number) <= 28,
      ring: s.ring === true,
      src: s.variant === "single" ? undefined : "https://i.pravatar.cc/100",
      name: ((s.initials as string) || "AO").slice(0, 2).toUpperCase(),
      onPress: () => demo?.fire("Avatar"),
    }),
  },

  breadcrumb: {
    name: "Breadcrumb",
    Component: Breadcrumb as AnyComponent,
    mapProps: (s, demo) => ({
      items: CRUMB_TRAIL.slice(0, (s.depth as number) ?? 4),
      chevron: s.separator === "chevron",
      slash: s.separator === "slash",
      dot: s.separator === "dot",
      homeIcon: Boolean(s.homeIcon),
      // Demo: clicking a crumb flashes where it would navigate.
      onItemPress: (label: string) => demo?.fire("→ " + label),
    }),
  },

  checkbox: {
    name: "Checkbox",
    Component: Checkbox as AnyComponent,
    mapProps: (s, demo) => ({
      checked: s.state === "checked",
      disabled: s.state === "disabled",
      // Demo: clicking toggles the State control between checked and unchecked.
      onChange: (next: boolean) => demo?.set("state", next ? "checked" : "unchecked"),
      children: s.withDesc
        ? `${s.label}: get notified when activity happens on your account.`
        : s.label,
    }),
  },

  radio: {
    name: "Radio",
    Component: Radio as AnyComponent,
    mapProps: (s, demo) => ({
      checked: true,
      small: s.variant === "inline",
      // Demo: a single radio is always selected; clicking flashes feedback.
      onChange: () => demo?.fire("Selected Pro"),
      children: s.withDesc ? "Pro, for growing teams that need more control." : "Pro",
    }),
  },

  switch: {
    name: "Switch",
    Component: Switch as AnyComponent,
    mapProps: (s, demo) => ({
      checked: s.state === "on",
      disabled: Boolean(s.disabled),
      // Demo: clicking flips the State control between on and off.
      onChange: (next: boolean) => demo?.set("state", next ? "on" : "off"),
      children: s.label || undefined,
      description: s.withDesc ? "Show your availability to teammates." : undefined,
    }),
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
      const isAction = v === "action";
      return {
        small: s.size === "sm",
        large: s.size === "lg",
        disabled: Boolean(s.disabled),
        prefix: v === "lead-text" ? "https://" : v === "currency" ? "$" : undefined,
        suffix:
          v === "trail-text" ? "@canvas.dev"
            : v === "currency" ? "USD"
              : isAction ? "Copy"
                : undefined,
        action: isAction,
        readOnly: isAction,
        leadingIcon: v === "lead-icon",
        trailingIcon: v === "trail-icon",
        icon: v === "lead-icon" ? "search" : v === "trail-icon" ? "mail" : undefined,
        value: isAction ? "sk_live_••••••••4242" : undefined,
        placeholder:
          v === "lead-text" ? "example.com"
            : v === "trail-text" ? "ada"
              : v === "lead-icon" ? "Quick search…"
                : v === "trail-icon" ? "you@example.com"
                  : v === "currency" ? "0.00"
                    : undefined,
        className: "max-w-[320px]",
      };
    },
  },

  pagination: {
    name: "Pagination",
    Component: Pagination as AnyComponent,
    mapProps: (s, demo) => {
      const total = s.totalPages as number;
      const page = Math.min(((s.demoPage as number) ?? (s.currentPage as number)), total);
      const variant = s.variant as string;
      return {
        page,
        total,
        compact: variant === "compact",
        withSize: variant === "with-size",
        pageSize: 10,
        pageSizes: [10, 25, 50],
        onChange: (p: number) => demo?.set("demoPage", p),
        onPageSizeChange: (sz: number) => demo?.fire("Rows per page: " + sz),
      };
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
    mapProps: (s, demo) => {
      const type = s.type as string;
      const onPress = () => demo?.fire("Card pressed");
      if (type === "generic") {
        return { padded: true, onPress, title: "Anything goes here", body: "The card surface gives you the border, radius, and shadow. You bring the content." };
      }
      if (type === "section") {
        return s.header
          ? { onPress, title: "Recent activity", body: "A labeled content surface. Drop fields, a list, or any module of content here." }
          : { onPress, body: "A labeled content surface. Drop fields, a list, or any module of content here." };
      }
      return { padded: true, onPress, title: s.label as string, body: `${s.value} (+142 today)` };
    },
  },

  alert: {
    name: "Alert",
    Component: Alert as AnyComponent,
    mapProps: (s, demo) => {
      const v = s.variant as string;
      const tone = v === "destructive" ? "error" : v;
      const titles: Record<string, string> = { info: "Heads up", success: "All set", warning: "Action required", destructive: "Something went wrong" };
      const descs: Record<string, string> = { info: "Maintenance window scheduled for Sunday 2:00 UTC.", success: "Your changes have been saved successfully.", warning: "Your trial expires in 3 days.", destructive: "Could not save your changes. Please try again." };
      const glyphs: Record<string, string> = { info: "ℹ", success: "✓", warning: "⚠", destructive: "✕" };
      return { [tone]: true, icon: glyphs[v], title: s.title ? titles[v] : undefined, description: descs[v], dismissible: true, onDismiss: () => demo?.fire("Dismissed") };
    },
  },

  "empty-state": {
    name: "EmptyState",
    Component: EmptyState as AnyComponent,
    mapProps: (s, demo) => {
      const v = s.variant as string;
      const icons: Record<string, string> = { search: "🔍", users: "👥", files: "📄", activity: "📈", notifications: "🔔", errors: "✅", "all-clear": "✅" };
      const titles: Record<string, string> = { search: "No results found", users: "No users", files: "No files", activity: "No activity", notifications: "All caught up", errors: "No errors", "all-clear": "All clear" };
      const descs: Record<string, string> = { search: "Try adjusting your search filters.", users: "Invite your first team member.", files: "Upload or drag files here.", activity: "Events will appear as they happen.", notifications: "No new notifications.", errors: "Everything is running smoothly.", "all-clear": "No locked accounts or pending reviews." };
      const positive = v === "errors" || v === "all-clear";
      return { icon: icons[v], title: titles[v], description: descs[v], actionLabel: s.action ? "Create identity" : undefined, onAction: () => demo?.fire("Create identity"), positive, bordered: true, compact: Boolean(s.inTable) };
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
    mapProps: (s, demo) => {
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
      const isCard = s.variant === "card";
      const items = s.variant === "clickable" ? clickable : isCard ? card : twoLine;
      return {
        items,
        clickable: s.variant === "clickable",
        card: isCard,
        flush: isCard ? false : s.divider === false,
        title: isCard ? "Team members" : undefined,
        addAction: isCard ? "Add" : undefined,
        rowMenu: isCard,
        onPressItem: (i: number) => demo?.fire("Row " + (i + 1)),
        onPressItemMenu: (i: number) => demo?.fire("Row menu " + (i + 1)),
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
    mapProps: (s) => {
      if (s.mode === "mono") {
        return {
          rows: [
            { label: "Client ID", value: "clt_8f2a9b4c7e1d", mono: true },
            { label: "Created", value: "2026-05-24T14:32:00Z", mono: true },
            { label: "Fingerprint", value: "sha256:xK9v...", mono: true },
          ],
          className: "max-w-[400px]",
        };
      }
      if (s.mode === "composed") {
        return {
          rows: [
            { label: "Status", status: "Active" },
            { label: "Plan", badge: "Pro" },
            { label: "Token", value: "sk_live_a8f2...c9e1", mono: true, copyValue: "sk_live_a8f2c9e1" },
            {
              label: "Members",
              avatars: [{ src: "/rachel-chen.jpg", name: "RC" }, { name: "AJ" }],
              overflow: 3,
            },
          ],
          className: "max-w-[400px]",
        };
      }
      return {
        rows: [
          { label: (s.label as string) || "User ID", value: "usr_abc123", mono: true },
          { label: "Name", value: "Rachel Chen" },
          { label: "Role", value: "Admin" },
          { label: "Status", status: "Active" },
        ],
        className: "max-w-[400px]",
      };
    },
  },

  form: {
    name: "Form",
    Component: Form as AnyComponent,
    mapProps: (s) => {
      // Sidebar uses the sectioned layout: a Personal-info section spanning two
      // pre-filled inputs and a Notifications checkbox-group section.
      if (s.layout === "sidebar") {
        return {
          sidebar: true,
          sections: [
            {
              title: "Personal info",
              description: "This information will be displayed on your public profile.",
              fields: [
                { label: "Full name", value: "Rachel Chen" },
                { label: "Email", value: "rachel@example.com" },
              ],
            },
            {
              title: "Notifications",
              description: "Choose how you'd like to be notified.",
              checkboxes: [
                { label: "Email notifications", checked: true },
                { label: "SMS alerts" },
              ],
            },
          ],
          submitLabel: "Save",
          className: "max-w-[720px]",
        };
      }
      return {
        stacked: s.layout === "stacked",
        twoColumn: s.layout === "two-column",
        fields:
          s.layout === "two-column"
            ? [
                { label: "First name", placeholder: "Ada" },
                { label: "Last name", placeholder: "King" },
                { label: "Email", placeholder: "ada@example.com" },
              ]
            : [
                { label: "Email", placeholder: "you@example.com" },
                { label: "Password" },
              ],
        submitLabel: s.layout === "two-column" ? "Create" : "Sign in",
        cancelLabel: s.layout === "two-column" ? "Cancel" : undefined,
        className: s.layout === "two-column" ? "max-w-[560px]" : "max-w-[360px]",
      };
    },
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
      twoColumn: s.content === "fields" && s.columns === "2",
      checkboxes:
        s.content === "checkboxes"
          ? [
              { label: "Product updates", checked: true },
              { label: "Security alerts", checked: true },
              { label: "Weekly digest", checked: false },
            ]
          : undefined,
      // The validation error belongs on the Email item (FieldsetItem.error),
      // not the group (group-level error fans the same message onto every row).
      // The item help key is `help`, not `helper`, and value pre-fills the input.
      items:
        s.content === "fields"
          ? [
              { label: "Full name", placeholder: "Ada Lovelace" },
              {
                label: "Email",
                placeholder: "ada@example.com",
                value: "ada@",
                help: "We'll only use this for order updates.",
                error: s.error ? "Enter a valid email address" : undefined,
              },
              { label: "Country", placeholder: "United States" },
            ]
          : undefined,
    }),
  },

  "action-panels": {
    name: "ActionPanel",
    Component: ActionPanel as AnyComponent,
    mapProps: (s) => {
      if (s.variant === "toggle") {
        return {
          title: (s.title as string) || "Two-factor authentication",
          description:
            "Add an extra layer of security to your account by requiring a verification code on login.",
          toggle: true,
          checked: s.on === true,
        };
      }
      return {
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
      };
    },
  },

  "description-lists": {
    name: "DescriptionList",
    Component: DescriptionList as AnyComponent,
    mapProps: (s) => {
      if (s.variant === "inline-edit") {
        return {
          card: true,
          twoColumn: true,
          divided: true,
          title: "Profile",
          items: [
            { term: "Name", value: "Rachel Chen", update: true },
            { term: "Email", value: "rachel.chen@example.com", update: true },
            { term: "Title", value: "Senior Engineer", update: true },
          ],
        };
      }
      if (s.variant === "stacked") {
        return {
          card: true,
          stacked: true,
          items: [
            { term: "Full name", value: "Rachel Chen" },
            { term: "Email", value: "rachel.chen@example.com" },
            { term: "Client ID", value: "clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF", mono: true },
          ],
        };
      }
      // Default: two-column read-only detail card with a header band and badges.
      return {
        card: true,
        twoColumn: true,
        divided: true,
        title: "Application details",
        subtitle: "Personal information and credentials.",
        items: [
          { term: "Full name", value: "Rachel Chen" },
          { term: "Email", value: "rachel.chen@example.com" },
          { term: "Role", value: "admin", badge: true },
          { term: "Status", value: "Active", status: true },
        ],
      };
    },
  },

  tabs: {
    name: "Tabs",
    Component: Tabs as AnyComponent,
    mapProps: (s, demo) => {
      const labelled = [
        { label: "All", badge: "142" },
        { label: "Active", badge: "89" },
        { label: "Pending", badge: "12" },
        { label: "Archived", badge: "53" },
      ];
      const plain = ["General", "Security", "Notifications", "Billing", "Integrations"];
      const pills = ["All", "Active", "Archived", "Deleted"];
      const verticalTabs = ["General", "Security", "Notifications", "API Keys", "Billing"];
      const isPill = s.variant === "pill";
      const isVertical = s.variant === "vertical";
      const useBadges = s.variant === "underline" && !!s.badges;
      return {
        pills: isPill,
        vertical: isVertical,
        tabs: isPill ? pills : isVertical ? verticalTabs : useBadges ? labelled : plain,
        active: (s.demoTab as number) ?? 0,
        onChange: (i: number) => demo?.set("demoTab", i),
      };
    },
  },

  stepper: {
    name: "Stepper",
    Component: Stepper as AnyComponent,
    mapProps: (s, demo) => ({
      steps: [
        { label: "Account", description: "Email verified and password set." },
        { label: "Profile", description: "Add your name and avatar." },
        { label: "Review", description: "Invite collaborators to your workspace." },
        { label: "Done", description: "You're all set." },
      ],
      current: (s.demoStep as number) ?? 1,
      onStepPress: (i: number) => demo?.set("demoStep", i),
      vertical: s.type === "Vertical",
      progress: s.type === "Progress bar",
      value: s.progress as number,
      label: "Setup progress",
    }),
  },

  feeds: {
    name: "Feed",
    Component: Feed as AnyComponent,
    mapProps: (s, demo) => {
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
      return { connector: s.variant === "connector", avatar: s.variant === "avatar", items, onItemPress: (i: number) => demo?.fire("Event " + (i + 1)) };
    },
  },

  "grid-lists": {
    name: "GridList",
    Component: GridList as AnyComponent,
    mapProps: (s) => {
      const gallery = s.variant === "gallery";
      const actions = [
        { label: "Message", outline: true },
        { label: "View", ghost: true },
      ];
      const people = [
        { title: "Rachel Chen", subtitle: "Engineering Lead", avatar: "/rachel-chen.jpg", actions },
        { title: "Ada Lovelace", subtitle: "Staff Engineer", avatar: "/ada-lovelace.jpg", actions },
        { title: "Kevin Turner", subtitle: "Product Designer", avatar: "KT", actions },
      ];
      const files = [
        { title: "hero-banner.png", subtitle: "1.2 MB", color: "primary" },
        { title: "icon-set.svg", subtitle: "340 KB", color: "blue-500" },
        { title: "product-shot.jpg", subtitle: "2.8 MB", color: "emerald-500" },
        { title: "avatar-default.png", subtitle: "96 KB", color: "amber-500" },
      ];
      return { items: gallery ? files : people, gallery, cols3: gallery, cols2: !gallery };
    },
  },

  navbars: {
    name: "Navbar",
    Component: Navbar as AnyComponent,
    mapProps: (s, demo) => ({
      brand: "Canvas",
      links: ["Dashboard", "Users", "Settings"],
      active: (s.demoNav as number) ?? 0,
      onSelect: (i: number) => demo?.set("demoNav", i),
      onAction: () => demo?.fire("New"),
      actionLabel: s.layout === "search" ? undefined : "New",
      avatar: "RC",
      bordered: s.layout !== "mobile",
    }),
  },

  "data-table": {
    name: "DataTable",
    Component: DataTable as AnyComponent,
    mapProps: (s, demo) => ({
      columns: ["Name", "Email", "Role", "Status"],
      rows: [
        ["Alice Johnson", "alice@example.com", "Admin", "Active"],
        ["Bob Smith", "bob@example.com", "Editor", "Inactive"],
        ["Rachel Chen", "rachel@example.com", "Admin", "Active"],
      ],
      bordered: true,
      compact: s.density === "compact",
      selectable: s.variant === "bulk",
      onRowPress: (row: string[]) => demo?.fire("Row: " + row[0]),
    }),
  },

  calendar: {
    name: "Calendar",
    Component: Calendar as AnyComponent,
    mapProps: (s, demo) => ({ month: "May 2026", today: 23, selected: (s.demoDay as number) ?? 24, onSelect: (d: number) => demo?.set("demoDay", d), daysInMonth: 31, startWeekday: 4 }),
  },

  sidebar: {
    name: "Sidebar",
    Component: Sidebar as AnyComponent,
    mapProps: (s, demo) => ({
      active: (s.demoSide as string) ?? "Dashboard",
      onSelect: (item: { label: string }) => demo?.set("demoSide", item.label),
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

  dropdown: {
    name: "Dropdown",
    Component: Dropdown as AnyComponent,
    mapProps: (s, demo) => ({
      trigger: "Actions",
      // Uncontrolled: the trigger opens the menu (closed by default); selecting a
      // row closes it and flashes feedback.
      onSelect: (item: { label: string }) => demo?.fire(item.label),
      // Section heading above the rows when "Section label" is on.
      label: s.label ? "Actions" : undefined,
      items: [
        { label: "Edit profile", icon: s.icons ? "✎" : undefined, shortcut: s.shortcuts ? "⌘E" : undefined },
        { label: "Duplicate", icon: s.icons ? "⧉" : undefined, shortcut: s.shortcuts ? "⌘D" : undefined },
        { label: "Settings", icon: s.icons ? "⚙" : undefined, shortcut: s.shortcuts ? "⌘," : undefined },
        ...(s.disabledItem ? [{ label: "Archive", icon: s.icons ? "📦" : undefined, disabled: true }] : []),
        ...(s.destructive
          ? [{ label: "Delete…", icon: s.icons ? "🗑" : undefined, destructive: true, separatorBefore: true }]
          : []),
      ],
    }),
  },

  select: {
    name: "Select",
    Component: Select as AnyComponent,
    mapProps: (s, demo) => ({
      small: s.size === "sm",
      large: s.size === "lg",
      disabled: Boolean(s.disabled),
      label: s.withLabel ? "Country" : undefined,
      icon: Boolean(s.withIcon),
      // Uncontrolled: the trigger opens the list (closed by default); selecting
      // updates the value and flashes feedback.
      value: (s.demoCountry as string) ?? "United States",
      onSelect: (option: string) => { demo?.set("demoCountry", option); demo?.fire(option); },
      options: ["United States", "Canada", "Mexico", "United Kingdom"],
      placeholder: "Select a country",
      className: "max-w-[280px]",
    }),
  },

  popover: {
    name: "Popover",
    Component: Popover as AnyComponent,
    mapProps: (s) => ({
      // Trigger on -> show the trigger button + anchored card; trigger off ->
      // a static inline panel with no trigger button.
      inline: !s.trigger,
      trigger: "Open popover",
      title: "Popover",
      description: (s.content as string) ?? "Place your rich content, form fields, or secondary actions here.",
      actionLabel: s.trigger ? "Close" : "Action",
    }),
  },

  tooltip: {
    name: "Tooltip",
    Component: Tooltip as AnyComponent,
    mapProps: (s) => ({
      label: (s.label as string) || "Open settings",
      // Icon trigger renders the settings glyph; text/button triggers use a label.
      iconTrigger: s.trigger === "icon",
      trigger: s.trigger === "text" ? "hover this text" : "Hover me",
      // "always" keeps the bubble shown (controlled); otherwise it is
      // uncontrolled and tapping the trigger toggles it.
      open: s.reveal === "always" ? true : undefined,
      top: s.side === "top",
      bottom: s.side === "bottom",
      left: s.side === "left",
      right: s.side === "right",
    }),
  },

  dialog: {
    name: "Dialog",
    Component: Dialog as AnyComponent,
    mapProps: (s, demo) => ({
      trigger: "Open dialog",
      onConfirm: () => demo?.fire("Confirmed"),
      title: "Refund payment",
      description: s.withDescription
        ? "The refund will be reflected in the customer's bank account within 2 to 3 business days."
        : undefined,
      // Body form: render the Amount + Reason fields inside the panel.
      withBody: s.withBody === true,
      confirmLabel: s.destructive ? "Refund" : "Confirm",
      cancelLabel: "Cancel",
      destructive: s.destructive === true,
      // Width axis: map each size pill to its boolean prop (lg is the default,
      // so it sets no width prop). xs/sm/md/xl/2xl -> xs/small/medium/large/wide.
      xs: s.size === "xs",
      small: s.size === "sm",
      medium: s.size === "md",
      large: s.size === "xl",
      wide: s.size === "2xl",
    }),
  },

  command: {
    name: "Command",
    Component: Command as AnyComponent,
    mapProps: (s, demo) => {
      const sc = s.shortcuts === true;
      return {
        active: 0,
        placeholder: "Type a command...",
        trigger: s.mode === "trigger",
        footer: s.footer === true,
        groups: [
          {
            heading: "Actions",
            items: [
              { label: "New File", icon: "📄", shortcut: sc ? "Ctrl+N" : undefined },
              { label: "Open File", icon: "📂", shortcut: sc ? "Ctrl+O" : undefined },
              { label: "Save", icon: "💾", shortcut: sc ? "Ctrl+S" : undefined },
            ],
          },
          {
            heading: "Navigation",
            items: [
              { label: "Go to Dashboard", icon: "▸" },
              { label: "Go to Settings", icon: "▸" },
            ],
          },
        ],
        onSelect: (item: { label: string }) => demo?.fire(item.label),
      };
    },
  },

  combobox: {
    name: "Combobox",
    Component: Combobox as AnyComponent,
    // A hardcoded query/value used to mask the Placeholder control (the
    // placeholder only shows when the field is empty); drop them so the control
    // works.
    mapProps: (s, demo) => ({
      options: ["Ada Lovelace", "Grace Hopper", "Kira Tanaka", "Liang Bao", "Marcus Allen", "Noor Park", "Rachel Chen"],
      label: s.withLabel ? "Assigned to" : undefined,
      helperText: s.withHelper ? "The person responsible for this account." : undefined,
      placeholder: (s.placeholder as string) || "Search a person…",
      disabled: Boolean(s.disabled),
      value: s.demoPerson as string,
      onSelect: (option: string) => { demo?.set("demoPerson", option); demo?.fire(option); },
      className: "max-w-[300px]",
    }),
  },

  "row-menu": {
    name: "RowMenu",
    Component: RowMenu as AnyComponent,
    mapProps: (s, demo) => {
      const isLinks = s.kind === "links";
      const ico = (g: string) => (s.icons ? g : undefined);
      const items = isLinks
        ? [
            { label: "Profile", icon: ico("●") },
            { label: "Billing", icon: ico("●") },
            { label: "Members", icon: ico("●") },
            { label: "Settings", icon: ico("●") },
          ]
        : [
            { label: "Edit", icon: ico("✎") },
            { label: "Duplicate", icon: ico("⧉") },
            ...(s.destructive ? [{ label: "Delete", icon: ico("🗑"), destructive: true, separatorBefore: true }] : []),
          ];
      return { links: isLinks, sectionLabel: s.label ? (isLinks ? "Account" : "Actions") : undefined, items, onSelect: (item: { label: string }) => demo?.fire(item.label) };
    },
  },

  "alert-dialog": {
    name: "AlertDialog",
    Component: AlertDialog as AnyComponent,
    mapProps: (s, demo) => ({
      title: "Delete this identity?",
      description: s.withDescription
        ? "This permanently removes the identity and revokes any active sessions. This action cannot be undone."
        : undefined,
      confirmLabel: s.destructive ? "Delete" : "Continue",
      destructive: !!s.destructive,
      narrow: s.size === "xs",
      small: s.size === "sm",
      large: s.size === "lg",
      withInput: !!s.withInput,
      trigger: "Delete identity…",
      onConfirm: () => demo?.fire("Confirmed"),
    }),
  },

  listbox: {
    name: "Listbox",
    Component: Listbox as AnyComponent,
    mapProps: (s, demo) => {
      const items = s.withIcon
        ? [
            { label: "Rachel Chen", detail: "rachel@acme.io", selected: true },
            { label: "Ada Lovelace", detail: "ada@acme.io" },
            { label: "Kevin Turner", detail: "kevin@acme.io" },
            { label: "Linus Berg", detail: "linus@acme.io" },
          ]
        : [
            { label: "Backend", selected: true },
            { label: "Frontend" },
            { label: "Design" },
            { label: "Platform" },
            { label: "Security" },
          ];
      const multi = s.mode === "multi";
      let selectedItems;
      if (multi) {
        const picks = (s.demoMulti as number[]) ?? [0, 2];
        selectedItems = items.map((it, i) => ({ ...it, selected: picks.includes(i) }));
      } else {
        const fallback = items.findIndex((it) => it.selected);
        const sel = (s.demoSel as number) ?? (fallback < 0 ? 0 : fallback);
        selectedItems = items.map((it, i) => ({ ...it, selected: i === sel }));
      }
      // Demo: clicking a row moves the selection (single) or toggles it (multi).
      const onSelect = (i: number) => {
        if (multi) {
          const cur = (demo?.state.demoMulti as number[]) ?? [0, 2];
          demo?.set("demoMulti", cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]);
        } else {
          demo?.set("demoSel", i);
        }
      };
      return {
        items: selectedItems,
        multi,
        onSelect,
        bordered: true,
        small: s.size === "sm",
        large: s.size === "lg",
        disabled: !!s.disabled,
      };
    },
  },

  "filter-panel": {
    name: "FilterPanel",
    Component: FilterPanel as AnyComponent,
    mapProps: (s, demo) => {
      const base = [
        {
          title: "Status",
          options: [
            { label: "Active", checked: true, count: "128" },
            { label: "Pending", count: "12" },
            { label: "Archived", count: "2" },
          ],
        },
        {
          title: "Schema",
          options: [
            { label: "Default", checked: true, count: "96" },
            { label: "Custom", count: "46" },
          ],
        },
        {
          title: "MFA",
          options: [
            { label: "Enabled", count: "84" },
            { label: "Disabled", count: "58" },
          ],
        },
      ];
      // Demo: clicking an option toggles its checkbox (controlled via demo state).
      let activeCount = 0;
      const groups = base.map((g, gi) => ({
        ...g,
        options: g.options.map((o, oi) => {
          const checked = (s[`flt-${gi}-${oi}`] as boolean) ?? Boolean((o as { checked?: boolean }).checked);
          if (checked) activeCount++;
          return { ...o, checked };
        }),
      }));
      return {
        bordered: true,
        activeCount,
        groups,
        onChange: (gi: number, oi: number, next: boolean) => demo?.set(`flt-${gi}-${oi}`, next),
      };
    },
  },

  overlays: {
    name: "Overlay",
    Component: Overlay as AnyComponent,
    mapProps: (s, demo) => {
      const placement =
        s.kind === "modal" ? { modal: true } : s.kind === "toast" || s.kind === "menu" ? { sheet: true } : { drawer: true };
      return {
        trigger: "Open panel",
        onDone: () => demo?.fire("Done"),
        title: (s.title as string) || "Edit Identity",
        description: s.withDescription ? "Visible above the parent page so the user can compare." : undefined,
        ...placement,
      };
    },
  },

  icon: {
    name: "Icon",
    Component: Icon as AnyComponent,
    mapProps: (s) => {
      if (s.view === "set") return { set: true };
      const color = s.color as string;
      return {
        shield: true,
        size: s.size as number,
        ...(color === "primary"
          ? { primary: true }
          : color === "destructive"
            ? { destructive: true }
            : color === "muted"
              ? { muted: true }
              : {}),
      };
    },
  },
};
