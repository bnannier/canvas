import type { ReactNode, Ref } from "react";
import { Platform } from "react-native";
import { View, Grid, Card, CardMedia, CardContent, CardSeparator, Column, Typography, InteractionOverride, CodeBlock } from "@nannier/canvas";
import type { DocExample, DocProse, ExampleScope } from "../../core/scope";
import type { DetailSpec } from "../../core/data/detail-specs";
import { ExampleErrorBoundary, FitStage } from "../stage";
import { Prose } from "../prose";
import { DetailSection, heldOpen, renderComponent, stageData, type SpecimenBase } from "./frame";
import { PINNED_STATES, isPinnedState, optionLabel, withOption, type PropDescriptors } from "./knobs";

// The detail page's specimen grids (Component.dc.html `#cv-var`, `#cv-sz`, `#cv-st`):
// every variant from the component's .md live on its own well over its label, note and
// source; then the Sizes and States rows, the playground's props at each size and in each
// state. Hover, focus and press are pinned through InteractionOverride, so each cell shows
// the state without a pointer or a key; disabled and loading are the real props.

/**
 * A live example on a specimen well, found by the web-only tooling attribute every example
 * on the page carries. The marker wraps the well rather than sitting in it: inside, a view
 * would be a hugging child of the well's centred column, and a fill example in it would
 * collapse instead of spanning the well.
 */
export function Well({ compact, tall, pinsRing, code, children }: { compact?: boolean; tall?: boolean; pinsRing?: boolean; code?: string; children: ReactNode }) {
  return (
    <View {...(Platform.OS === "web" ? ({ dataSet: stageData(pinsRing) } as object) : null)}>
      <CardMedia compact={compact} tall={tall}>
        <ExampleErrorBoundary>
          <FitStage code={code}>{children}</FitStage>
        </ExampleErrorBoundary>
      </CardMedia>
    </View>
  );
}

export function VariantsSection({ examples, path, note, scope, selected, sectionRef }: {
  /** The page's examples after the first (the Usage example, shown in Usage). */
  examples: readonly { example: DocExample; index: number }[];
  /** The .md the examples come from, for the note. */
  path: string;
  /** The .md's prose before its first variant: a note on every example. */
  note?: DocProse[];
  scope: ExampleScope;
  /** The example the Platform skins section shows, marked here. */
  selected: number;
  sectionRef?: Ref<View>;
}) {
  return (
    <DetailSection
      title="Variants"
      note={`${examples.length} examples from ${path}, each rendered live from its own JSX.`}
      sectionRef={sectionRef}
    >
      {note?.length ? <Prose blocks={note} small subtle /> : null}
      <Grid minTileWidth={340} roomy>
        {examples.map(({ example, index }) => (
          <Card key={example.label} flush selected={index === selected}>
            <Well code={example.code}>{example.render(scope)}</Well>
            <CardSeparator />
            <CardContent>
              <Column snug>
                <Typography small medium>{example.label}</Typography>
                {example.note?.length ? <Prose blocks={example.note} small subtle /> : null}
                <CodeBlock headerless code={example.code} language="tsx" compact />
              </Column>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </DetailSection>
  );
}

/** A Sizes or States cell: the specimen on a compact well over its mono caption. */
function SpecimenCard({ label, pinsRing, children }: { label: string; pinsRing?: boolean; children: ReactNode }) {
  return (
    <Card flush>
      <Well compact pinsRing={pinsRing}>{children}</Well>
      <CardSeparator />
      <CardContent>
        <Typography caption mono subtle>{label}</Typography>
      </CardContent>
    </Card>
  );
}

export function SizesSection({ spec, component, props, base, scope, sectionRef }: { spec: DetailSpec; component: string; props: PropDescriptors; base?: SpecimenBase; scope: ExampleScope; sectionRef?: Ref<View> }) {
  const sizes = spec.sizes;
  if (!sizes || sizes.options.length === 0) return null;
  return (
    <DetailSection title="Sizes" sectionRef={sectionRef}>
      {/* The hand-off's sizes share the row (each `flex: 1 1 200px`), so the grid takes as many columns as there are sizes. */}
      <Grid minTileWidth={200} columns={sizes.options.length} roomy>
        {sizes.options.map((option) => (
          <SpecimenCard key={option ?? "-"} pinsRing={heldOpen(props)} label={sizes.prop && option != null ? `${sizes.prop} ${option}` : optionLabel(option)}>
            {renderComponent(scope, component, withOption(props, sizes.options, option, sizes.prop), base)}
          </SpecimenCard>
        ))}
      </Grid>
    </DetailSection>
  );
}

export function StatesSection({ spec, component, props, base, scope, sectionRef }: { spec: DetailSpec; component: string; props: PropDescriptors; base?: SpecimenBase; scope: ExampleScope; sectionRef?: Ref<View> }) {
  const states = spec.states;
  if (!states || states.length === 0) return null;
  return (
    <DetailSection
      title="States"
      note="Hover, focus and press are pinned so they can be compared side by side; the rest are real props."
      sectionRef={sectionRef}
    >
      <Grid minTileWidth={200} roomy>
        {states.map((state) => {
          const pinned = isPinnedState(state) ? PINNED_STATES[state] : null;
          const element = renderComponent(scope, component, pinned || state == null ? props : { ...props, [state]: true }, base);
          return (
            <SpecimenCard key={state ?? "-"} label={optionLabel(state)} pinsRing={pinned === "focused" || state === "open" || heldOpen(props)}>
              <InteractionOverride hovered={pinned === "hovered"} focused={pinned === "focused"} pressed={pinned === "pressed"}>
                {element}
              </InteractionOverride>
            </SpecimenCard>
          );
        })}
      </Grid>
    </DetailSection>
  );
}
