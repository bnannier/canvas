import { createElement, isValidElement, useId, type ReactNode, type Ref } from "react";
import { Platform } from "react-native";
import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg";
import { View, Row, Column, Typography, useTheme } from "@nannier/canvas";
import type { ExampleRender, ExampleScope } from "../../core/scope";
import type { PropDescriptors, PropValue } from "./knobs";
import { kitProps } from "./knobs";
import { referenceSpecimen } from "./reference-specimens";

// The detail page's docs-only frame: a section's heading block, the hand-off's dotted
// staging ground, and the one place a knob state becomes a live element.

/**
 * The hand-off's section ids: its `#cv-<id>` sections, its unlabelled header and its
 * previous/next grid, plus `dodont` for the repository's own section. On the web a section's
 * root carries `data-detail-section="<id>"` so tooling can photograph one section at a time:
 * lookout.config.ts's per-section parity routes read it, and tools/v4/capture-references.ts
 * writes the hand-off's crop of the same section under the same id.
 */
export type DetailSectionId = "header" | "pg" | "var" | "sz" | "st" | "an" | "props" | "a11y" | "pf" | "use" | "dodont" | "tok" | "prevnext";

/**
 * One section of the detail page (the hand-off's `<section>`): its heading, drawn at the
 * h3 size and announced as a level-2 heading, a muted note under it, an optional control
 * opposite (the playground's platform switch), then the body a section's gap below. The
 * outer view is the node the jump strip scrolls to (`sectionRef`) and, on the web, carries
 * the section's tooling id.
 */
export function DetailSection({ id, title, note, actions, sectionRef, children }: {
  id: DetailSectionId;
  title: string;
  note?: ReactNode;
  actions?: ReactNode;
  sectionRef?: Ref<View>;
  children: ReactNode;
}) {
  return (
    <View ref={sectionRef} collapsable={false} {...(Platform.OS === "web" ? ({ dataSet: { detailSection: id } } as object) : null)}>
      <Column relaxed>
        <Row between alignEnd wrap relaxed>
          <Column compact shrink>
            <Typography sectionTitle>{title}</Typography>
            {note == null ? null : <Typography sectionNote>{note}</Typography>}
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

/**
 * An icon slot's or element slot's descriptor as the element it describes. An icon slot's
 * glyph carries no tone: the host colours it (a Button hands its icon slots its label
 * ink, src/style/ink.tsx), so the knob's intent choice recolours the glyph with the label.
 */
function slotElement(scope: ExampleScope, value: Exclude<PropValue, string | number | boolean>): ReactNode {
  if ("icon" in value) return createElement(scope.Icon, { [value.icon]: true, size: 16 });
  const element = (scope as unknown as Record<string, Parameters<typeof createElement>[0]>)[value.element];
  return element ? createElement(element, null, value.children) : null;
}

/** A descriptor as the value the component receives: an icon slot's or anatomy slot's element, or the literal. */
function propValue(scope: ExampleScope, value: PropValue): unknown {
  return typeof value === "object" ? slotElement(scope, value) : value;
}

/**
 * The data a specimen starts from: the component's examples, the default first, whose
 * first element of the component carries the props no knob drives (a chart's series, a
 * list's items, a table's columns), and the props the page drives itself (knobs.ts
 * `controlledProps`).
 */
export interface SpecimenBase {
  examples: readonly ExampleRender[];
  controlled: ReadonlySet<string>;
  /** The props that show an overlay open in place (the spec's `specimen`), over the example's. */
  open?: PropDescriptors;
}

/** The props the first example that renders `component` gives it, through `scope`. */
function exampleProps(scope: ExampleScope, component: unknown, examples: readonly ExampleRender[]): Record<string, unknown> | undefined {
  for (const render of examples) {
    const found = firstPropsOf(render(scope), component, scope.Stateful);
    if (found) return found;
  }
  return undefined;
}

/** The docs' render-prop state helper (live-state.tsx), whose children are a function of its state. */
type StatefulProps = { initial: unknown; children: (value: unknown, set: (next: unknown) => void) => ReactNode };

/**
 * The props of the first element of `component` in an element tree, searched depth first
 * through every prop (children and slots alike) and into a `Stateful`'s children at its
 * initial state, or none when the tree renders it only inside a component of its own.
 */
function firstPropsOf(node: unknown, component: unknown, stateful: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = firstPropsOf(child, component, stateful);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  if (node.type === component) return props;
  if (node.type === stateful && typeof props.children === "function") {
    const { initial, children } = props as StatefulProps;
    return firstPropsOf(children(initial, () => {}), component, stateful);
  }
  for (const value of Object.values(props)) {
    const found = firstPropsOf(value, component, stateful);
    if (found) return found;
  }
  return undefined;
}

/**
 * The web-only tooling attribute every live specimen stage carries (`data-preview-stage`),
 * plus `data-pinned-ring` when the specimen pins a state that draws its ring-coloured edge
 * at rest: a States cell pinned to focus, or a specimen held open (an open field's edge is
 * the ring colour). Tab landing on such a stop brings no new cue, so the keyboard sweep
 * (e2e/support/focus-ring.ts) passes it over, as it does a Don't specimen.
 */
export function stageData(pinsRing = false): Record<string, string> {
  return pinsRing ? { previewStage: "", pinnedRing: "" } : { previewStage: "" };
}

/** Whether a specimen's props hold it open, which draws its edge in the ring colour. */
export function heldOpen(props: PropDescriptors | undefined): boolean {
  return props?.open === true;
}

/**
 * Renders the export `name` of an example scope with the props a knob state describes:
 * the playground, the Sizes and States cells and the anatomy specimen all come from here,
 * through the scope a platform column builds (so the iOS and Android skins render too).
 * With a `base`, the props the first example rendering the component gives it (built
 * through the same scope) lie under the page's own, less the ones the page drives, so a
 * component whose data no knob supplies renders the example's data.
 */
export function renderComponent(scope: ExampleScope, name: string, props: PropDescriptors, base?: SpecimenBase): ReactNode {
  const reference = referenceSpecimen(scope, name, props);
  if (reference !== undefined) return reference;
  const component = (scope as unknown as Record<string, Parameters<typeof createElement>[0]>)[name];
  if (!component) return null;
  const { children, ...rest } = props;
  const live: Record<string, unknown> = {};
  const example = base ? exampleProps(scope, component, base.examples) : undefined;
  if (example) for (const [key, value] of Object.entries(example)) if (key !== "children" && !base!.controlled.has(key)) live[key] = value;
  for (const [key, value] of Object.entries(kitProps(name, { ...base?.open, ...rest }))) live[key] = propValue(scope, value);
  const own = children == null ? undefined : typeof children === "object" ? slotElement(scope, children) : String(children);
  const content = own !== undefined ? own : base?.controlled.has("children") ? undefined : (example?.children as ReactNode);
  return createElement(component, live, content);
}
