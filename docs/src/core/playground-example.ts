import { createElement, type ElementType, type ReactElement } from "react";
import type { PlaygroundInput } from "./scope";

/** Source ranges extracted from the exact JSX node the generated renderer wraps. */
export interface PlaygroundSource {
  code: string;
  start: number;
  end: number;
  component: string;
  attributes: readonly { name: string; source: string }[];
  children?: string;
}

/** Keep the original JSX closures and composition, replacing only its selected element. */
export function applyPlaygroundElement(element: ReactElement<Record<string, unknown>>, input: PlaygroundInput, component: ElementType): ReactElement {
  const props = { ...element.props };
  for (const name of input.omit) delete props[name];
  for (const [name, expression] of Object.entries(input.props)) props[name] = expression.value;
  if (element.key !== null) props.key = element.key;
  return createElement(component, props);
}

/** Materialize the same element replacement in the original, complete example source. */
export function playgroundCode(source: PlaygroundSource, input: PlaygroundInput): string {
  const original = source.code.slice(source.start, source.end);
  const hasEdits = input.omit.length > 0 || Object.keys(input.props).length > 0;
  if (!hasEdits && original.startsWith(`<${source.component}`)) return source.code;
  const lineStart = source.code.lastIndexOf("\n", source.start - 1) + 1;
  const indent = /^\s*$/.test(source.code.slice(lineStart, source.start)) ? source.code.slice(lineStart, source.start) : "";
  const relative = (fragment: string) => fragment.split("\n").map((line, index) => index > 0 && line.startsWith(indent) ? line.slice(indent.length) : line).join("\n");
  const overridden = new Set([...input.omit, ...Object.keys(input.props)]);
  const attributes = source.attributes.filter((attribute) => !overridden.has(attribute.name)).map((attribute) => relative(attribute.source));
  for (const [name, expression] of Object.entries(input.props)) {
    if (name === "children") continue;
    attributes.push(expression.code === "true" ? name : `${name}={${expression.code}}`);
  }
  const children = Object.prototype.hasOwnProperty.call(input.props, "children")
    ? `{${input.props.children.code}}`
    : overridden.has("children") || source.children === undefined ? undefined : relative(source.children);
  const oneLine = `<${source.component}${attributes.length ? ` ${attributes.join(" ")}` : ""}${children === undefined ? " />" : `>${children}</${source.component}>`}`;
  const replacement = oneLine.length <= 100 && !oneLine.includes("\n") ? oneLine
    : `<${source.component}${attributes.length ? `\n${attributes.map((attribute) => `  ${attribute}`).join("\n")}` : ""}${children === undefined ? "\n/>" : `\n>${children}</${source.component}>`}`;
  return source.code.slice(0, source.start) + replacement.split("\n").join(`\n${indent}`) + source.code.slice(source.end);
}
