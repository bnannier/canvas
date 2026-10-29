import { useState, type Ref } from "react";
import { Platform } from "react-native";
import Svg, { Line } from "react-native-svg";
import { View, Row, Column, Card, CardMedia, Badge, Typography, AnatomyProvider, useTheme, type AnatomyRects } from "@nannier/canvas";
import type { ExampleScope } from "../../core/scope";
import type { DetailSpec } from "../../core/data/detail-specs";
import { ExampleErrorBoundary } from "../stage";
import { DetailSection, DotGrid, heldOpen, renderComponent, stageData, type SpecimenBase } from "./frame";
import { placeMarks } from "./anatomy-marks";
import type { PropDescriptors } from "./knobs";

// The detail page's Anatomy (Component.dc.html `#cv-an`): the component on the dotted
// ground with its demo props, each named part numbered on a leader line where the
// component itself reports the part to be (the kit's AnatomyProvider registry), and a
// legend listing the parts, a part this render does not draw dimmed.

const MARK = 22;

/** The numbered markers and their leader lines, drawn over the specimen. Docs-only illustration. */
function Marks({ parts, rects, box }: { parts: readonly string[]; rects: AnatomyRects; box: { width: number; height: number } }) {
  const { tokens } = useTheme();
  if (box.width === 0) return null;
  const marks = placeMarks(parts, rects, box);
  return (
    <>
      <Svg pointerEvents="none" width={box.width} height={box.height} style={{ position: "absolute", top: 0, left: 0 }}>
        {marks.map((m) => (
          <Line key={m.n} x1={m.x + 0.5} x2={m.x + 0.5} y1={m.lineTop} y2={m.lineTop + m.lineHeight} stroke={tokens.primary} strokeOpacity={0.7} strokeWidth={1} />
        ))}
      </Svg>
      {marks.map((m) => (
        <View key={m.n} style={{ pointerEvents: "none", position: "absolute", left: m.x - MARK / 2, top: m.y - MARK / 2, width: MARK, height: MARK, alignItems: "center", justifyContent: "center" }}>
          <Badge default mono small accessibilityLabel={`Part ${m.n}, ${parts[m.n - 1]}`}>{m.n}</Badge>
        </View>
      ))}
    </>
  );
}

export function AnatomySection({ spec, component, props, base, scope, sectionRef }: { spec: DetailSpec; component: string; props: PropDescriptors; base?: SpecimenBase; scope: ExampleScope; sectionRef?: Ref<View> }) {
  const parts = spec.anatomy.parts;
  const [rects, setRects] = useState<AnatomyRects>({});
  const [box, setBox] = useState({ width: 0, height: 0 });
  if (parts.length === 0) return null;
  const demo = { ...props, ...(spec.anatomy.props as PropDescriptors) };
  // The demo's own props replace the example's too.
  const demoBase = base && { ...base, controlled: new Set([...base.controlled, ...Object.keys(spec.anatomy.props)]) };
  return (
    <DetailSection id="an" title="Anatomy" sectionRef={sectionRef}>
      <Row stacks stackBreakpoint="md" roomy>
        <Column span={7}>
          {/* The hand-off's anatomy stage (line 217): `min-height:320px;padding:80px 40px;
              border-radius:20px;border:1px solid var(--ln);background-color:var(--bg2)` under
              the dot grid, no shadow: the stage well in a stage-cornered outlined frame. */}
          <Card flush clip stageCorners outlined>
            <CardMedia stage>
              <DotGrid />
              {/* A preview stage like every specimen well: the specimen's own headings are the
                  component's sample, not the page's outline. */}
              <View
                {...(Platform.OS === "web" ? ({ dataSet: stageData(heldOpen(demo)) } as object) : null)}
                onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
              >
                <AnatomyProvider onMeasure={setRects}>
                  {/* The specimen sits a marker's reach inside the measured box, so a
                      marker above or below a part lands on the ground, not off it. */}
                  <Column padLoose>
                    <Column padLoose center alignCenter>
                      <ExampleErrorBoundary>{renderComponent(scope, component, demo, demoBase)}</ExampleErrorBoundary>
                    </Column>
                  </Column>
                  <Marks parts={parts} rects={rects} box={box} />
                </AnatomyProvider>
              </View>
            </CardMedia>
          </Card>
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
