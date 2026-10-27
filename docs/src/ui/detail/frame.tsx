import { createElement, useId, type ReactNode, type Ref } from "react";
import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg";
import { View, Row, Column, Typography, useTheme } from "@nannier/canvas";
import type { ExampleScope } from "../../core/scope";
import type { PropDescriptors, PropValue } from "./knobs";

// The detail page's docs-only frame: a section's heading block, the hand-off's dotted
// staging ground, and the one place a knob state becomes a live element.

/**
 * One section of the detail page (the hand-off's `<section>`): its heading, drawn at the
 * h3 size and announced as a level-2 heading, a muted note under it, an optional control
 * opposite (the playground's platform switch), then the body a section's gap below. The
 * outer view is the node the jump strip scrolls to (`sectionRef`).
 */
export function DetailSection({ title, note, actions, sectionRef, children }: {
  title: string;
  note?: ReactNode;
  actions?: ReactNode;
  sectionRef?: Ref<View>;
  children: ReactNode;
}) {
  return (
    <View ref={sectionRef} collapsable={false}>
      <Column relaxed>
        <Row between alignEnd wrap relaxed>
          <Column compact shrink>
            <Typography h3 level={2}>{title}</Typography>
            {note == null ? null : <Typography small subtle>{note}</Typography>}
          </Column>
          {actions}
        </Row>
        {children}
      </Column>
    </View>
  );
}

/**
 * The hand-off's staging ground behind the playground and the anatomy figure: 1 px dots of
 * the `border` colour on a 16 px grid (its `radial-gradient(var(--ln) 1px, transparent 1px)`
 * at `16px 16px`, a dot centred in each tile), drawn as an SVG pattern so the same code
 * paints it on every platform. It fills the well it is placed in, under the specimen, and
 * takes no touches.
 */
export function DotGrid() {
  const { tokens } = useTheme();
  const id = `dots${useId().replace(/[^A-Za-z0-9]/g, "")}`;
  return (
    <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" }}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={id} x={0} y={0} width={16} height={16} patternUnits="userSpaceOnUse">
            <Circle cx={8} cy={8} r={1} fill={tokens.border} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** A filled default-intent Button paints its icon in the primary's contrast ink, as its docs examples do. */
const BUTTON_INTENTS = ["secondary", "outline", "ghost", "destructive", "link", "inverse", "quiet"];

/**
 * The tone an icon slot's glyph takes on the component the playground renders: the
 * caller colours an icon (Button's `iconLeft` docs), so on a filled default Button it is
 * `primaryForeground` and anywhere else the glyph's own foreground.
 */
export function iconTone(component: string, props: PropDescriptors): string | undefined {
  if (component !== "Button") return undefined;
  return BUTTON_INTENTS.some((intent) => props[intent] === true) ? undefined : "primaryForeground";
}

/** The descriptors with each icon slot's tone filled in, as the JSX prints and the element renders them. */
export function withIconTones(component: string, props: PropDescriptors): PropDescriptors {
  const tone = iconTone(component, props);
  if (!tone) return props;
  const out: Record<string, PropValue> = {};
  for (const [key, value] of Object.entries(props)) out[key] = typeof value === "object" && "icon" in value ? { ...value, tone } : value;
  return out;
}

/** A descriptor as the value the component receives: an icon slot's or anatomy slot's element, or the literal. */
function propValue(scope: ExampleScope, value: PropValue): unknown {
  if (typeof value !== "object") return value;
  if ("icon" in value) return createElement(scope.Icon, { [value.icon]: true, ...(value.tone ? { [value.tone]: true } : null), size: 16 });
  const element = (scope as unknown as Record<string, Parameters<typeof createElement>[0]>)[value.element];
  return element ? createElement(element, null, value.children) : null;
}

/**
 * Renders the export `name` of an example scope with the props a knob state describes:
 * the playground, the Sizes and States cells and the anatomy specimen all come from here,
 * through the scope a platform column builds (so the iOS and Android skins render too).
 */
export function renderComponent(scope: ExampleScope, name: string, props: PropDescriptors): ReactNode {
  const component = (scope as unknown as Record<string, Parameters<typeof createElement>[0]>)[name];
  if (!component) return null;
  const { children, ...rest } = props;
  const live: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) live[key] = propValue(scope, value);
  return createElement(component, live, children == null ? undefined : String(children));
}
