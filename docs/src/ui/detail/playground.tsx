import { useState, type Ref } from "react";
import { Platform } from "react-native";
import { View, ScrollView, Row, Column, Card, CardMedia, Divider, Typography, Button, ButtonGroup, Chip, ChipGroup, Switch, Input, Slider, Icon, useContainerBreakpoint, type ColorTokens } from "@nannier/canvas";
import { CodeBlock as KitCodeBlock } from "@nannier/canvas";
import { buildScopes } from "../../core/build-scopes";
import type { DetailSpec, Knob } from "../../core/data/detail-specs";
import type { PreviewScope } from "../../core/scope";
import { ExampleErrorBoundary, FitStage } from "../stage";
import { DetailSection, DotGrid, heldOpen, renderComponent, stageData, type SpecimenBase } from "./frame";
import { PLATFORMS_SHOWN, PLATFORM_LABELS } from "../../core/platforms-shown";
import { knobKey, optionLabel, type KnobState, type KnobValue, type PropDescriptors } from "./knobs";

// The detail page's Playground (Component.dc.html `#cv-pg`): the component live on the
// dotted staging ground, a 300 px knob panel beside it that drives a real prop of its
// props interface per control, and the JSX those props print, regenerated as the knobs
// move. On the web the platform switch above it renders the same props through the iOS
// or Android skins.

/** The glyphs an icon slot offers, in the hand-off's order ("" is none). */
const ICONS = ["", "plus", "sparkles", "chevronDown", "chevronRight", "arrowRight", "search", "settings", "bell", "check", "x", "copy", "send", "heart", "star", "zap", "globe", "lock", "user", "trash2", "download", "tag"] as const;

/** The platforms the switch offers: the web's three, a native app's own alone (../../core/platforms-shown). */
const PLATFORMS = PLATFORMS_SHOWN.map((platform) => ({ platform, label: PLATFORM_LABELS[platform]!.label }));

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

/** A pick-one set of options as the kit's option chips, the selected one the accent's soft wash. */
function OptionChips({ name, options, value, onPick }: { name: string; options: readonly (string | null)[]; value: KnobValue; onPick: (next: string | null) => void }) {
  return (
    // One tab stop per knob: a pick-one set is a radiogroup, its arrows move the choice.
    <ChipGroup option accessibilityLabel={name} value={typeof value === "string" ? value : NONE} onChange={(next) => onPick(next === NONE ? null : String(next))}>
      {options.map((option) => (
        <Chip key={option ?? NONE} value={option ?? NONE}>
          {optionLabel(option)}
        </Chip>
      ))}
    </ChipGroup>
  );
}

/**
 * An icon slot's glyphs as icon-only chips ("none" first). The "none" pick is the same
 * 30 px tile as its neighbours (Component.dc.html line 163 draws every pick of the ICONS
 * list, the empty glyph included, as the one square), its label the tile's mono type.
 */
function IconChips({ name, value, onPick }: { name: string; value: KnobValue; onPick: (next: string) => void }) {
  return (
    <ChipGroup option accessibilityLabel={name} value={typeof value === "string" ? value : ""} onChange={(next) => onPick(String(next))}>
      {ICONS.map((glyph) => (
        <Chip
          key={glyph || "none"}
          value={glyph}
          square={!glyph}
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

// The hand-off's knob column (Component.dc.html `minmax(0,1fr) 300px`, its 1 px rule
// included) and its 18 px padding. The playground is docs-only harness, so its frame
// carries the hand-off's own numbers rather than a kit step.
const KNOB_COLUMN = { width: 299 } as const;
const KNOB_PAD = { padding: 18 } as const;

/** The knob panel: the PROPS eyebrow with its Reset, then one labelled control per knob. */
function KnobPanel({ spec, state, onChange, onReset }: { spec: DetailSpec; state: KnobState; onChange: (key: string, value: KnobValue) => void; onReset: () => void }) {
  return (
    <ScrollView style={{ maxHeight: 560 }} contentContainerStyle={KNOB_PAD}>
      <Column relaxed>
        <Row between alignCenter>
          <Typography pageLabel mono>Props</Typography>
          <Button plainLink small onPress={onReset}>Reset</Button>
        </Row>
        {spec.knobs.map((knob) => {
          const key = knobKey(knob);
          return (
            <Column key={key} close>
              {/* The hand-off's label row (Component.dc.html line 161): the knob's name in the
                  secondary ink, its type hint in the subtle ink, a 12 px line. */}
              <Row between snug>
                <Typography knobLabel mono>{labelOf(knob)}</Typography>
                <Typography knobLabel mono muted>{hintOf(knob)}</Typography>
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
  const preview = scopeFor(tokens, (PLATFORMS[platform] ?? PLATFORMS[0]!).platform);
  const live = (
    <ExampleErrorBoundary key={`${preview.platform}:${code}`}>
      <FitStage>{renderComponent(preview.scope, component, props, base)}</FitStage>
    </ExampleErrorBoundary>
  );
  // The hand-off's stage (Component.dc.html line 156: `min-height:340px;padding:44px 28px;
  // ...;background-color:var(--bg2)` under the dot grid, a grid cell that stretches to the
  // knob panel's height): the playground well, which grows to the panel's height and the
  // width it leaves beside it, and stands alone over it when stacked.
  const stage = (
    <CardMedia playground>
      <DotGrid />
      <View
        // The live render is an example like every other on the page, found by the same
        // web-only tooling attribute (the e2e checks that hold examples to the kit's rules).
        {...(Platform.OS === "web" ? ({ dataSet: stageData(heldOpen(props)) } as object) : null)}
      >
        {live}
      </View>
    </CardMedia>
  );
  const panel = <KnobPanel spec={spec} state={state} onChange={onChange} onReset={onReset} />;
  return (
    <DetailSection
      id="pg"
      title="Playground"
      note={`Every control sets a real prop of ${spec.propsInterface.replace(/^react-native:/, "")}. The JSX below updates as you go.`}
      sectionRef={sectionRef}
      actions={PLATFORMS.length > 1 ? (
        // The hand-off's platform switch (Component.dc.html line 153): the default-height
        // track around 28 px segments of 12 px labels on a 12 px inset, the kit's compact density.
        <ButtonGroup segmented compact accessibilityLabel="Playground platform" items={PLATFORMS.map((p) => p.label)} active={platform} onSelect={setPlatform} />
      ) : null}
    >
      <View onLayout={onLayout}>
        {/* The hand-off's frame (line 155): `border:1px solid var(--ln);border-radius:20px;
            overflow:hidden;background:var(--sf)`, no shadow. */}
        <Card flush clip stageCorners outlined>
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
              <View style={KNOB_COLUMN}>{panel}</View>
            </Row>
          )}
        </Card>
      </View>
      {/* The hand-off's JSX card (lines 171 to 174) is the page's own card, not its CodeBlock
          renderer: the kit CodeBlock's `playground` density. */}
      <KitCodeBlock testID="playground-code" playground code={code} filename={`JSX · ${spec.propsInterface.replace(/^react-native:/, "")}`} language="tsx" unbadged copy />
    </DetailSection>
  );
}
