import type { ComponentType } from "react";
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  Input,
  InputGroup,
  Kbd,
  Pagination,
  Radio,
  Skeleton,
  Spinner,
  Switch,
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
};
