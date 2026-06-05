import type { ComponentType } from "react";
import { Button } from "@olympusoss/canvas";

// Maps a component slug to the real Canvas RN component, how to derive its props
// from the playground state, and how to render the JSX shown in the code panel.
// Registered slugs render the real component in the playground; the rest fall
// back to the legacy HTML-string render. This lets components migrate one by one.
export interface RegistryEntry {
  Component: ComponentType<Record<string, unknown>>;
  mapProps: (state: Record<string, unknown>) => Record<string, unknown>;
  toCode: (state: Record<string, unknown>) => string;
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
    Component: Button as ComponentType<Record<string, unknown>>,
    mapProps: buttonProps,
    toCode: buttonCode,
  },
};
