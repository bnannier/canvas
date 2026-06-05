import type { ComponentType } from "react";
import { Badge, Button, Divider, Kbd, Skeleton, Spinner } from "@olympusoss/canvas";

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

export const registry: Record<string, RegistryEntry> = {
  button: {
    Component: Button as AnyComponent,
    mapProps: buttonProps,
    toCode: buttonCode,
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
};
