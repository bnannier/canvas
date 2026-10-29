import { useCallback, useState, type Ref } from "react";
import { Platform } from "react-native";
import Svg, { Line } from "react-native-svg";
import { View, Row, Column, Card, CardMedia, Badge, Typography, AnatomyProvider, useTheme, type AnatomyRect, type AnatomyRects } from "@nannier/canvas";
import type { ExampleScope } from "../../core/scope";
import type { DetailSpec } from "../../core/data/detail-specs";
import { ExampleErrorBoundary } from "../stage";
import { DetailSection, DotGrid, heldOpen, renderComponent, stageData, type SpecimenBase } from "./frame";
import { inStage, placeMarks } from "./anatomy-marks";
import type { PropDescriptors } from "./knobs";

// The detail page's Anatomy (Component.dc.html `#cv-an`): the component on the dotted
// ground with its demo props, drawn at the hand-off's anatomy zoom unless it fills its
// stage (line 412, `anZoom:fill?'1':'1.6'`, the kit AnatomyProvider's `zoomed`), each
// named part numbered on a leader line where the component itself reports the part to be
// (the provider's registry), and a legend listing the parts, a part this render does not
// draw dimmed.

// The marker disc, line 220: `width:22px;height:22px;margin:-11px 0 0 -11px` (the Badge
// `marker` metric; the margin centres the disc on its point).
const MARK = 22;
const NO_BOX: AnatomyRect = { x: 0, y: 0, width: 0, height: 0 };

/**
 * The numbered markers and their leader lines, drawn over the stage (the hand-off places
 * them against the padded figure well, line 217, and clamps them inside it): a layer
 * filling the well, beside the specimen so the zoom never touches a marker, measuring
 * itself for the stage's size. The part rectangles come against the provider's box, which
 * the provider reports beside them, so both are carried into the well before the markers
 * are placed. Docs-only illustration.
 */
function Marks({ parts, rects, box }: { parts: readonly string[]; rects: AnatomyRects; box: AnatomyRect }) {
  const { tokens } = useTheme();
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const marks = stage.width > 0 && box.width > 0 ? placeMarks(parts, inStage(rects, box), stage) : [];
  return (
    <View
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" }}
      onLayout={(e) => setStage({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {/* Line 219: a 1 px line in the accent at opacity .7. */}
      {marks.length > 0 ? (
        <Svg width={stage.width} height={stage.height} style={{ position: "absolute", top: 0, left: 0 }}>
          {marks.map((m) => (
            <Line key={m.n} x1={m.x + 0.5} x2={m.x + 0.5} y1={m.lineTop} y2={m.lineTop + m.lineHeight} stroke={tokens.primary} strokeOpacity={0.7} strokeWidth={1} />
          ))}
        </Svg>
      ) : null}
      {marks.map((m) => (
        <View key={m.n} style={{ pointerEvents: "none", position: "absolute", left: m.x - MARK / 2, top: m.y - MARK / 2, width: MARK, height: MARK, alignItems: "center", justifyContent: "center" }}>
          <Badge marker accessibilityLabel={`Part ${m.n}, ${parts[m.n - 1]}`}>{m.n}</Badge>
        </View>
      ))}
    </View>
  );
}

export function AnatomySection({ spec, component, props, base, scope, sectionRef }: { spec: DetailSpec; component: string; props: PropDescriptors; base?: SpecimenBase; scope: ExampleScope; sectionRef?: Ref<View> }) {
  const parts = spec.anatomy.parts;
  const [rects, setRects] = useState<AnatomyRects>({});
  const [box, setBox] = useState<AnatomyRect>(NO_BOX);
  const onMeasure = useCallback((next: AnatomyRects, root: AnatomyRect) => {
    setRects(next);
    setBox(root);
  }, []);
  if (parts.length === 0) return null;
  const demo = { ...props, ...(spec.anatomy.props as PropDescriptors) };
  // The demo's own props replace the example's too.
  const demoBase = base && { ...base, controlled: new Set([...base.controlled, ...Object.keys(spec.anatomy.props)]) };
  return (
    <DetailSection id="an" title="Anatomy" sectionRef={sectionRef}>
      <Row stacks stackBreakpoint="md" roomy>
        <Column span={7}>
          {/* A preview stage like every specimen well (the tooling attribute on a wrapper
              the figure alone sits in): the specimen's own headings are the component's
              sample, not the page's outline. */}
          <View {...(Platform.OS === "web" ? ({ dataSet: stageData(heldOpen(demo)) } as object) : null)}>
            {/* The hand-off's anatomy stage (line 217): `min-height:320px;padding:80px 40px;
                border-radius:20px;border:1px solid var(--ln);background-color:var(--bg2)` under
                the dot grid, no shadow: the stage well in a stage-cornered outlined frame. The
                well's inset is the hand-off's, so the provider is its only child in flow. */}
            <Card flush clip stageCorners outlined>
              <CardMedia stage>
                <DotGrid />
                <AnatomyProvider zoomed={!spec.fill} onMeasure={onMeasure}>
                  <ExampleErrorBoundary>{renderComponent(scope, component, demo, demoBase)}</ExampleErrorBoundary>
                </AnatomyProvider>
                <Marks parts={parts} rects={rects} box={box} />
              </CardMedia>
            </Card>
          </View>
        </Column>
        <Column span={5}>
          {/* The hand-off's legend (line 221): `padding:18px;border:1px solid var(--ln);
              border-radius:20px;background:var(--sf);...;gap:12px`, no shadow; the card owns the rhythm. */}
          <Card panel stageCorners outlined>
            {parts.map((part, i) => {
              const shown = rects[part] != null;
              return (
                <Row key={part} cozy alignCenter>
                  {shown ? <Badge default mono small>{i + 1}</Badge> : <Badge secondary mono small>{i + 1}</Badge>}
                  <Typography muted={!shown}>{part}</Typography>
                </Row>
              );
            })}
            <Typography caption muted>Dimmed parts appear only in some states or variants.</Typography>
          </Card>
        </Column>
      </Row>
    </DetailSection>
  );
}
