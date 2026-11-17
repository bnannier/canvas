import { createElement, type ElementType } from "react";
import type { ExampleScope, PlaygroundInput, PlaygroundValue } from "../../core/scope";
import { kitProps, type PropDescriptors, type PropValue } from "./knobs";

/** One conversion supplies both the evaluated slot and its displayed expression. */
function expression(scope: ExampleScope, value: PropValue): PlaygroundValue {
  if (typeof value !== "object") return { value, code: JSON.stringify(value) };
  if ("actionLabel" in value) return {
    value: { label: value.actionLabel, onPress: () => {} },
    code: `{ label: ${JSON.stringify(value.actionLabel)}, onPress: () => {} }`,
  };
  if ("icon" in value) return {
    value: createElement(scope.Icon, { [value.icon]: true, size: 16 }),
    code: `<Icon ${value.icon} size={16} />`,
  };
  const component = (scope as unknown as Record<string, ElementType>)[value.element];
  return {
    value: createElement(component, null, value.children),
    code: value.children == null ? `<${value.element} />` : `<${value.element}>{${JSON.stringify(value.children)}}</${value.element}>`,
  };
}

export function playgroundInput(scope: ExampleScope, component: string, props: PropDescriptors, omit: ReadonlySet<string>, context: PropDescriptors = {}): PlaygroundInput {
  const active = new Set(Object.keys(kitProps(component, props)));
  const converted = kitProps(component, { ...context, ...props });
  const expressions = Object.fromEntries(Object.entries(converted).filter(([name]) => active.has(name)).map(([name, value]) => [name, expression(scope, value)]));
  const omitted = new Set(omit);
  // Icon size needs the documented icon-only composition, not a text label squeezed
  // into a square. Keep that label as the accessible name in BOTH render and source.
  if (component === "Button" && converted.icon === true) {
    omitted.add("children");
    delete expressions.children;
    expressions.accessibilityLabel = expression(scope, typeof converted.children === "string" && converted.children.trim() ? converted.children : "Button");
  }
  return {
    props: expressions,
    omit: [...omitted],
  };
}
