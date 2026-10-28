import { useState, type Ref } from "react";
import { Platform } from "react-native";
import { View, ScrollView, Row, Column, Container, Card, CardMedia, Divider, Typography, Button, ButtonGroup, Chip, ChipGroup, Switch, Input, Slider, Icon, useContainerBreakpoint, type ColorTokens } from "@nannier/canvas";
import { CodeBlock as KitCodeBlock } from "@nannier/canvas";
import { buildScopes } from "../../core/build-scopes";
import type { DetailSpec, Knob } from "../../core/data/detail-specs";
import type { PreviewScope } from "../../core/scope";
import { ExampleErrorBoundary, FitStage } from "../stage";
import { DetailSection, DotGrid, heldOpen, renderComponent, stageData, type SpecimenBase } from "./frame";
import { knobKey, optionLabel, type KnobState, type KnobValue, type PropDescriptors } from "./knobs";

// The detail page's Playground (Component.dc.html `#cv-pg`): the component live on the
// dotted staging ground, a 300 px knob panel beside it that drives a real prop of its
// props interface per control, and the JSX those props print, regenerated as the knobs
// move. On the web the platform switch above it renders the same props through the iOS
// or Android skins.

/** The glyphs an icon slot offers, in the hand-off's order ("" is none). */
const ICONS = ["", "plus", "sparkles", "chevronDown", "chevronRight", "arrowRight", "search", "settings", "bell", "check", "x", "copy", "send", "heart", "star", "zap", "globe", "lock", "user", "trash2", "download", "tag"] as const;

const PLATFORMS = [
  { label: "Web", platform: "web" },
  { label: "iOS", platform: "ios" },
  { label: "Android", platform: "android" },
] as const;

/** The scope a platform's column renders through: the web skin, or the iOS or Android skins swapped in. */
export function scopeFor(tokens: ColorTokens, platform: PreviewScope["platform"]): PreviewScope {
  const scopes = buildScopes(tokens);
  return scopes.find((s) => s.platform === platform) ?? scopes[scopes.length - 1];
}

function hintOf(knob: Knob): string {
  switch (knob.kind) {
    case "axis":
      return "pick one";
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "icon":
    case "glyph":
      return "icon";
    case "enum":
    case "component":
      return "one of";
    default:
      return "string";
  }
}

function labelOf(knob: Knob): string {
  if (knob.kind === "axis") return knob.label;
  if (knob.kind === "glyph") return "glyph";
  if (knob.kind === "component") return "component";
  return knob.prop;
}

// The chip value of an unset option (the knob's "none"): no option label can collide with it.
const NONE = "\u0000none";

/** A pick-one set of options as selectable chips, the selected one the accent's soft pill. */
function OptionChips({ name, options, value, onPick }: { name: string; options: readonly (string | null)[]; value: KnobValue; onPick: (next: string | null) => void }) {
  return (
    // One tab stop per knob: a pick-one set is a radiogroup, its arrows move the choice.
    <ChipGroup accessibilityLabel={name} value={typeof value === "string" ? value : NONE} onChange={(next) => onPick(next === NONE ? null : String(next))}>
      {options.map((option) => (
        <Chip key={option ?? NONE} value={option ?? NONE}>
          {optionLabel(option)}
        </Chip>
      ))}
    </ChipGroup>
  );
}

/** An icon slot's glyphs as icon-only chips ("none" first). */
function IconChips({ name, value, onPick }: { name: string; value: KnobValue; onPick: (next: string) => void }) {
  return (
    <ChipGroup accessibilityLabel={name} value={typeof value === "string" ? value : ""} onChange={(next) => onPick(String(next))}>
      {ICONS.map((glyph) => (
        <Chip
          key={glyph || "none"}
          value={glyph}
          accessibilityLabel={glyph || "none"}
          icon={glyph ? <Icon {...{ [glyph]: true }} size={14} decorative /> : undefined}
        >
          {glyph ? undefined : "none"}
        </Chip>
      ))}
    </ChipGroup>
  );
}

function KnobControl({ knob, value, onChange }: { knob: Knob; value: KnobValue; onChange: (next: KnobValue) => void }) {
  const name = labelOf(knob);
  switch (knob.kind) {
    case "axis":
      return <OptionChips name={name} options={knob.options} value={value} onPick={onChange} />;
    case "enum":
    case "component":
      return <OptionChips name={name} options={knob.options} value={value} onPick={onChange} />;
    case "icon":
    case "glyph":
      return <IconChips name={name} value={value} onPick={onChange} />;
    case "boolean":
      return <Switch small checked={value === true} onChange={onChange} accessibilityLabel={name} />;
    case "number":
      return <Slider small showValue min={knob.min} max={knob.max} step={1} value={typeof value === "number" ? value : knob.value} onChange={onChange} accessibilityLabel={name} />;
    default:
      return <Input small value={typeof value === "string" ? value : ""} onChangeText={onChange} accessibilityLabel={name} autoCapitalize="none" autoCorrect={false} />;
  }
}

/** The knob panel: the PROPS eyebrow with its Reset, then one labelled control per knob. */
function KnobPanel({ spec, state, onChange, onReset }: { spec: DetailSpec; state: KnobState; onChange: (key: string, value: KnobValue) => void; onReset: () => void }) {
  return (
    <ScrollView style={{ maxHeight: 560 }}>
      <Column relaxed pad>
        <Row between alignCenter>
          <Typography eyebrow subtle>Props</Typography>
          <Button link small onPress={onReset}>Reset</Button>
        </Row>
        {spec.knobs.map((knob) => {
          const key = knobKey(knob);
          return (
            <Column key={key} close>
              <Row between snug>
                <Typography caption mono subtle>{labelOf(knob)}</Typography>
                <Typography caption mono muted>{hintOf(knob)}</Typography>
              </Row>
              <KnobControl knob={knob} value={state[key] ?? null} onChange={(next) => onChange(key, next)} />
            </Column>
          );
        })}
      </Column>
    </ScrollView>
  );
}

export function PlaygroundSection({ spec, component, props, code, state, onChange, onReset, tokens, base, sectionRef }: {
  spec: DetailSpec;
  component: string;
  props: PropDescriptors;
  code: string;
  state: KnobState;
  onChange: (key: string, value: KnobValue) => void;
  onReset: () => void;
  tokens: ColorTokens;
  base?: SpecimenBase;
  sectionRef?: Ref<View>;
}) {
  const [platform, setPlatform] = useState(0);
  // The knob panel sits beside the stage while the frame is wider than the kit's `lg` step
  // (the hand-off's 1180 px window, about 900 px of content) and under it below that.
  const { value: stacked, onLayout } = useContainerBreakpoint({ base: false, lg: true });
  const preview = scopeFor(tokens, PLATFORMS[platform].platform);
  // The stage is the frame's own ground under the dot grid, not a CardMedia well: a well
  // is as tall as what it holds and cannot grow to the knob panel's height beside it, so
  // its sunken fill would stop short of the frame's floor. (A recorded difference: the
  // hand-off's stage is the sunken bg2, a step darker than its panel.)
  const live = (
    <ExampleErrorBoundary key={`${preview.platform}:${code}`}>
      <FitStage>{renderComponent(preview.scope, component, props, base)}</FitStage>
    </ExampleErrorBoundary>
  );
  // Beside the knob panel the stage is the frame's own ground under the dot grid, not a
  // CardMedia well: a well is as tall as what it holds and cannot grow to the panel's
  // height, so its sunken fill would stop short of the frame's floor (a recorded
  // difference: the hand-off's stage is the sunken bg2, a step darker than its panel).
  // Stacked, nothing stands beside it, and it is the tall sunken well.
  const stage = stacked ? (
    <View {...(Platform.OS === "web" ? ({ dataSet: stageData(heldOpen(props)) } as object) : null)}>
      <CardMedia tall>
        <DotGrid />
        {live}
      </CardMedia>
    </View>
  ) : (
    <Column fill center padLoose>
      <DotGrid />
      <View
        // The live render is an example like every other on the page, found by the same
        // web-only tooling attribute (the e2e checks that hold examples to the kit's rules).
        {...(Platform.OS === "web" ? ({ dataSet: stageData(heldOpen(props)) } as object) : null)}
      >
        {live}
      </View>
    </Column>
  );
  const panel = <KnobPanel spec={spec} state={state} onChange={onChange} onReset={onReset} />;
  return (
    <DetailSection
      title="Playground"
      note={`Every control sets a real prop of ${spec.propsInterface.replace(/^react-native:/, "")}. The JSX below updates as you go.`}
      sectionRef={sectionRef}
      actions={Platform.OS === "web" ? (
        <ButtonGroup segmented small accessibilityLabel="Playground platform" items={PLATFORMS.map((p) => p.label)} active={platform} onSelect={setPlatform} />
      ) : null}
    >
      <View onLayout={onLayout}>
        <Card flush clip>
          {stacked ? (
            <Column flush>
              {stage}
              <Divider />
              {panel}
            </Column>
          ) : (
            <Row flush>
              {stage}
              <Divider vertical />
              <Container xs>{panel}</Container>
            </Row>
          )}
        </Card>
      </View>
      <KitCodeBlock testID="playground-code" code={code} filename={`JSX · ${spec.propsInterface.replace(/^react-native:/, "")}`} language="tsx" copy />
    </DetailSection>
  );
}
