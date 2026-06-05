import type { ComponentType } from "react";
import {
  ActionPanel,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
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

// Maps a component slug to the real Canvas RN component, how to derive its props
// from the playground state, and how to render the JSX shown in the code panel.
// Registered slugs render the real component in the playground; the rest fall
// back to the legacy HTML-string render. This lets components migrate one by one.
export interface RegistryEntry {
  Component: ComponentType<Record<string, unknown>>;
  mapProps: (state: Record<string, unknown>) => Record<string, unknown>;
  toCode: (state: Record<string, unknown>) => string;
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

function buttonCode(s: Record<string, unknown>): string {
  const props = buttonProps(s);
  const flags = Object.keys(props).filter((k) => k !== "children" && props[k] === true);
  const attrs = flags.length ? " " + flags.join(" ") : "";
  return `<Button${attrs}>${String(props.children)}</Button>`;
}

const CRUMB_TRAIL = ["Projects", "Identity Platform", "Settings", "Profile", "Avatar", "Edit"];

export const registry: Record<string, RegistryEntry> = {
  button: {
    Component: Button as AnyComponent,
    mapProps: buttonProps,
    toCode: buttonCode,
  },

  "button-group": {
    Component: ButtonGroup as AnyComponent,
    mapProps: (s) => {
      const size = s.size === "sm" ? { small: true } : s.size === "lg" ? { large: true } : {};
      if (s.variant === "split") return { split: true, items: ["Save", "More"], ...size };
      if (s.variant === "attached") return { segmented: true, active: -1, items: ["‹", "Today", "›"], ...size };
      const n = (s.buttons as number) ?? 3;
      return { segmented: true, active: 0, items: ["Day", "Week", "Month", "Year", "All"].slice(0, n), ...size };
    },
    toCode: (s) => {
      const size = s.size === "sm" ? " small" : s.size === "lg" ? " large" : "";
      if (s.variant === "split") return `<ButtonGroup split${size} items={["Save", "More"]} />`;
      if (s.variant === "attached") return `<ButtonGroup segmented${size} active={-1} items={["‹", "Today", "›"]} />`;
      const n = (s.buttons as number) ?? 3;
      const items = ["Day", "Week", "Month", "Year", "All"].slice(0, n);
      return `<ButtonGroup segmented${size} items={${JSON.stringify(items)}} />`;
    },
  },

  badge: {
    Component: Badge as AnyComponent,
    mapProps: (s) =>
      s.kind === "status"
        ? { status: true, [s.statusVariant as string]: true, children: (s.label as string) ?? "active" }
        : { [s.variant as string]: true, mono: s.mono === true, children: (s.label as string) ?? "admin" },
    toCode: (s) =>
      s.kind === "status"
        ? `<Badge status ${s.statusVariant}>${(s.label as string) ?? "active"}</Badge>`
        : `<Badge ${s.variant}${s.mono ? " mono" : ""}>${(s.label as string) ?? "admin"}</Badge>`,
  },

  divider: {
    Component: Divider as AnyComponent,
    mapProps: (s) => ({
      vertical: s.orientation === "vertical",
      children: s.orientation !== "vertical" && s.variant === "label" ? s.label : undefined,
    }),
    toCode: (s) =>
      s.orientation === "vertical"
        ? `<Divider vertical />`
        : s.variant === "label"
          ? `<Divider>${s.label}</Divider>`
          : `<Divider />`,
  },

  kbd: {
    Component: Kbd as AnyComponent,
    mapProps: (s) => ({ children: ((s.keys as string) || "⌘ K").trim().split(/\s+/)[0] }),
    toCode: (s) => `<Kbd>${((s.keys as string) || "⌘ K").trim().split(/\s+/)[0]}</Kbd>`,
  },

  spinner: {
    Component: Spinner as AnyComponent,
    mapProps: (s) => ({ small: s.size === "sm", large: s.size === "lg" }),
    toCode: (s) => `<Spinner${s.size === "sm" ? " small" : s.size === "lg" ? " large" : ""} />`,
  },

  skeleton: {
    Component: Skeleton as AnyComponent,
    mapProps: (s) => ({
      [s.shape as string]: true,
      animate: s.animate as boolean,
      className:
        s.shape === "text" || s.shape === "button" || s.shape === "avatar" ? `w-[${s.width}%]` : undefined,
    }),
    toCode: (s) =>
      `<Skeleton ${s.shape}${s.animate ? " animate" : ""}${
        s.shape === "text" || s.shape === "button" || s.shape === "avatar"
          ? ` className="w-[${s.width}%]"`
          : ""
      } />`,
  },

  avatar: {
    Component: Avatar as AnyComponent,
    mapProps: (s) => ({
      large: (s.size as number) >= 48,
      small: (s.size as number) <= 28,
      ring: s.ring === true,
      src: s.variant === "single" ? undefined : "https://i.pravatar.cc/100",
      name: ((s.initials as string) || "AO").slice(0, 2).toUpperCase(),
    }),
    toCode: (s) => {
      const big = (s.size as number) >= 48;
      const sm = (s.size as number) <= 28;
      const sz = big ? " large" : sm ? " small" : "";
      const r = s.ring === true ? " ring" : "";
      const ini = ((s.initials as string) || "AO").slice(0, 2).toUpperCase();
      return s.variant === "single"
        ? `<Avatar${sz}${r}>${ini}</Avatar>`
        : `<Avatar${sz}${r} src="https://i.pravatar.cc/100" name="${ini}" />`;
    },
  },

  breadcrumb: {
    Component: Breadcrumb as AnyComponent,
    mapProps: (s) => ({
      items: CRUMB_TRAIL.slice(0, (s.depth as number) ?? 4),
      chevron: s.separator === "chevron",
      slash: s.separator === "slash",
      dot: s.separator === "dot",
    }),
    toCode: (s) => {
      const trail = CRUMB_TRAIL.slice(0, (s.depth as number) ?? 4);
      const sep = s.separator === "slash" ? " slash" : s.separator === "dot" ? " dot" : " chevron";
      return `<Breadcrumb${sep} items={${JSON.stringify(trail)}} />`;
    },
  },

  checkbox: {
    Component: Checkbox as AnyComponent,
    mapProps: (s) => ({
      checked: s.state === "checked",
      disabled: s.state === "disabled",
      children: s.withDesc
        ? `${s.label}: get notified when activity happens on your account.`
        : s.label,
    }),
    toCode: (s) =>
      `<Checkbox${s.state === "checked" ? " checked" : ""}${s.state === "disabled" ? " disabled" : ""}>${
        s.withDesc ? `${s.label}: get notified when activity happens on your account.` : s.label
      }</Checkbox>`,
  },

  radio: {
    Component: Radio as AnyComponent,
    mapProps: (s) => ({
      checked: true,
      small: s.variant === "inline",
      children: s.withDesc ? "Pro, for growing teams that need more control." : "Pro",
    }),
    toCode: (s) =>
      `<Radio checked${s.variant === "inline" ? " small" : ""}>${
        s.withDesc ? "Pro, for growing teams that need more control." : "Pro"
      }</Radio>`,
  },

  switch: {
    Component: Switch as AnyComponent,
    mapProps: (s) => ({ checked: s.state === "on", disabled: Boolean(s.disabled), children: s.label || undefined }),
    toCode: (s) => `<Switch${s.state === "on" ? " checked" : ""}${s.disabled ? " disabled" : ""}>${s.label ?? ""}</Switch>`,
  },

  input: {
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
    toCode: (s) => {
      const st = s.state as string;
      const p: string[] = [];
      if (s.type === "textarea") p.push("multiline");
      if (st === "error") p.push("error");
      if (st === "disabled") p.push("disabled");
      if (st === "readonly") p.push("readOnly");
      const ph =
        s.type === "textarea" ? "Describe the change" : s.type === "number" ? "1024" : "rachel.chen@example.com";
      return `<Input${p.length ? " " + p.join(" ") : ""} placeholder="${ph}" />`;
    },
  },

  textarea: {
    Component: Textarea as AnyComponent,
    mapProps: (s) => ({
      rows: s.rows as number,
      disabled: s.disabled as boolean,
      placeholder: "A few words about this project",
    }),
    toCode: (s) =>
      `<Textarea rows={${s.rows as number}}${s.disabled ? " disabled" : ""} placeholder="A few words about this project" />`,
  },

  "input-group": {
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
    toCode: (s) => {
      const v = s.variant as string;
      const sz = s.size === "sm" ? " small" : s.size === "lg" ? " large" : "";
      const dis = s.disabled ? " disabled" : "";
      const pfx =
        v === "lead-text" ? ' prefix="https://"' : v === "currency" ? ' prefix="$"' : v === "lead-icon" ? ' prefix="🔍"' : "";
      const sfx =
        v === "trail-text" ? ' suffix="@canvas.dev"'
          : v === "currency" ? ' suffix="USD"'
            : v === "trail-icon" ? ' suffix="✉"'
              : v === "action" ? ' suffix="Copy" action' : "";
      return `<InputGroup${pfx}${sfx}${sz}${dis} placeholder="..." />`;
    },
  },

  pagination: {
    Component: Pagination as AnyComponent,
    mapProps: (s) => {
      const total = s.totalPages as number;
      const page = Math.min(s.currentPage as number, total);
      return { page, total, compact: s.variant === "compact", onChange: () => {} };
    },
    toCode: (s) => {
      const total = s.totalPages as number;
      const page = Math.min(s.currentPage as number, total);
      const variantProp = s.variant === "compact" ? " compact" : "";
      return `<Pagination page={${page}} total={${total}}${variantProp} onChange={setPage} />`;
    },
  },

  typography: {
    Component: Typography as AnyComponent,
    mapProps: (s) => ({ [s.style as string]: true, children: (s.content as string) ?? "The quick brown fox" }),
    toCode: (s) => `<Typography ${s.style as string}>${(s.content as string) ?? ""}</Typography>`,
  },

  card: {
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
    toCode: (s) => {
      const type = s.type as string;
      if (type === "generic") return `<Card padded title="Anything goes here" body="The card surface gives you the border, radius, and shadow." />`;
      if (type === "section") return s.header ? `<Card title="Recent activity" body="A labeled content surface." />` : `<Card body="A labeled content surface." />`;
      return `<Card padded title="${s.label}" body="${s.value} (+142 today)" />`;
    },
  },

  alert: {
    Component: Alert as AnyComponent,
    mapProps: (s) => {
      const v = s.variant as string;
      const tone = v === "destructive" ? "error" : v;
      const titles: Record<string, string> = { info: "Heads up", success: "All set", warning: "Action required", destructive: "Something went wrong" };
      const descs: Record<string, string> = { info: "Maintenance window scheduled for Sunday 2:00 UTC.", success: "Your changes have been saved successfully.", warning: "Your trial expires in 3 days.", destructive: "Could not save your changes. Please try again." };
      const glyphs: Record<string, string> = { info: "ℹ", success: "✓", warning: "⚠", destructive: "✕" };
      return { [tone]: true, icon: glyphs[v], title: s.title ? titles[v] : undefined, description: descs[v] };
    },
    toCode: (s) => {
      const v = s.variant as string;
      const tone = v === "destructive" ? "error" : v;
      const descs: Record<string, string> = { info: "Maintenance window scheduled for Sunday 2:00 UTC.", success: "Your changes have been saved successfully.", warning: "Your trial expires in 3 days.", destructive: "Could not save your changes. Please try again." };
      const titles: Record<string, string> = { info: "Heads up", success: "All set", warning: "Action required", destructive: "Something went wrong" };
      const titleAttr = s.title ? ` title="${titles[v]}"` : "";
      return `<Alert ${tone}${titleAttr} description="${descs[v]}" />`;
    },
  },

  "empty-state": {
    Component: EmptyState as AnyComponent,
    mapProps: (s) => {
      const v = s.variant as string;
      const icons: Record<string, string> = { search: "🔍", users: "👥", files: "📄", activity: "📈", notifications: "🔔", errors: "✅", "all-clear": "✅" };
      const titles: Record<string, string> = { search: "No results found", users: "No users", files: "No files", activity: "No activity", notifications: "All caught up", errors: "No errors", "all-clear": "All clear" };
      const descs: Record<string, string> = { search: "Try adjusting your search filters.", users: "Invite your first team member.", files: "Upload or drag files here.", activity: "Events will appear as they happen.", notifications: "No new notifications.", errors: "Everything is running smoothly.", "all-clear": "No locked accounts or pending reviews." };
      const positive = v === "errors" || v === "all-clear";
      return { icon: icons[v], title: titles[v], description: descs[v], actionLabel: s.action ? "Create identity" : undefined, positive, bordered: true, compact: Boolean(s.inTable) };
    },
    toCode: (s) => {
      const v = s.variant as string;
      const positive = v === "errors" || v === "all-clear";
      const flags = [positive ? "positive" : null, "bordered", s.inTable ? "compact" : null].filter(Boolean).join(" ");
      return `<EmptyState icon="🔍" title="No results found" description="Try adjusting your search filters."${s.action ? ' actionLabel="Create identity"' : ""}${flags ? " " + flags : ""} />`;
    },
  },

  stats: {
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
    toCode: (s) => (s.variant === "plain" ? `<Stats plain title="Key metrics" items={metrics} />` : `<Stats items={metrics} />`),
  },

  "media-objects": {
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
    toCode: (s) => {
      if (s.variant === "icon") return `<MediaObject icon="S" title="Security first" description="End-to-end encryption with automatic key rotation." center bordered />`;
      if (s.variant === "action") return `<MediaObject avatar="AL" title="Ada Lovelace" description="ada@example.com" truncate center bordered />`;
      return `<MediaObject avatar="RC" title="Rachel Chen" description="Engineering Lead" body="Reviewed the latest pull request..." bordered />`;
    },
  },

  "stacked-lists": {
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
    toCode: (s) => {
      const propLine = s.variant === "clickable" ? " clickable" : s.variant === "card" ? " card" : s.divider === false ? " flush" : "";
      return `<StackedList${propLine} items={members} />`;
    },
  },

  "code-block": {
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
    toCode: (s) => {
      const variantProp = s.variant === "plain" ? "" : ` ${s.variant}`;
      const copyProp = s.copy && s.variant !== "inline" ? " copy" : "";
      const wrapProp = s.wrap && s.variant !== "inline" ? " wrap" : "";
      return `<CodeBlock${variantProp}${copyProp}${wrapProp} code={code} filename="theme.ts" language="ts" />`;
    },
  },

  field: {
    Component: Field as AnyComponent,
    mapProps: (s) => ({
      label: (s.mode === "basic" ? (s.label as string) : s.mode === "mono" ? "Client ID" : "Status") || "User ID",
      helper: s.mode === "mono" ? "Fixed-width value for IDs and hashes." : "Shown on the public profile.",
      placeholder: s.mode === "mono" ? "clt_8f2a9b4c7e1d" : "Rachel Chen",
      required: s.mode === "basic",
      className: "max-w-[400px]",
    }),
    toCode: (s) =>
      `<Field${s.mode === "basic" ? " required" : ""} label="${s.mode === "basic" ? (s.label as string) || "User ID" : s.mode === "mono" ? "Client ID" : "Status"}" placeholder="${s.mode === "mono" ? "clt_8f2a9b4c7e1d" : "Rachel Chen"}" />`,
  },

  form: {
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
    toCode: (s) => {
      const layout = s.layout === "two-column" ? "twoColumn" : s.layout === "sidebar" ? "sidebar" : "stacked";
      return `<Form ${layout} fields={fields} submitLabel="${s.layout === "two-column" ? "Create" : "Sign in"}" />`;
    },
  },

  fieldset: {
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
    toCode: (s) => {
      const flags = [
        s.content === "fields" && s.columns === "2" ? "twoColumn" : null,
        s.content === "fields" && s.error ? "error" : null,
        s.disabled ? "disabled" : null,
      ]
        .filter(Boolean)
        .join(" ");
      const legendAttr = s.legend ? ` legend="${s.content === "checkboxes" ? "Email notifications" : "Shipping details"}"` : "";
      return `<Fieldset${legendAttr}${flags ? " " + flags : ""} items={fields} />`;
    },
  },

  "action-panels": {
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
    toCode: (s) =>
      `<ActionPanel${s.destructive === true ? " destructive" : ""}${s.variant === "side-by-side" ? " inline" : ""} title="${(s.title as string) || (s.variant === "side-by-side" ? "Discard unsaved changes?" : "Delete this project")}" actionLabel="${s.destructive === true ? (s.variant === "side-by-side" ? "Discard" : "Delete project") : (s.variant === "side-by-side" ? "Save" : "Save changes")}" />`,
  },

  "description-lists": {
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
    toCode: (s) => `<DescriptionList items={details} card${s.variant === "stacked" ? "" : " inline divided"} />`,
  },

  tabs: {
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
    toCode: (s) => `<Tabs${s.variant === "pill" ? " pills" : ""} tabs={tabs} active={0} />`,
  },

  stepper: {
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
    toCode: (s) => `<Stepper${s.type === "Vertical" ? " vertical" : ""} current={1} steps={steps} />`,
  },

  feeds: {
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
    toCode: (s) => `<Feed ${s.variant === "avatar" ? "avatar" : "connector"} items={events} />`,
  },

  "grid-lists": {
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
    toCode: (s) => `<GridList${s.variant === "gallery" ? " cols3" : " cols2"} items={items} />`,
  },

  navbars: {
    Component: Navbar as AnyComponent,
    mapProps: (s) => ({
      brand: "Canvas",
      links: ["Dashboard", "Users", "Settings"],
      active: 0,
      actionLabel: s.layout === "search" ? undefined : "New",
      avatar: "RC",
      bordered: s.layout !== "mobile",
    }),
    toCode: (s) =>
      `<Navbar brand="Canvas" links={["Dashboard", "Users", "Settings"]} active={0}${s.layout === "search" ? "" : ' actionLabel="New"'} avatar="RC"${s.layout === "mobile" ? "" : " bordered"} />`,
  },

  "data-table": {
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
    toCode: (s) =>
      `<DataTable columns={columns} rows={rows} bordered${s.density === "compact" ? " compact" : ""}${s.variant === "bulk" ? " selectable" : ""} />`,
  },
};
