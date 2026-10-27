import { useRef, useState, type Ref } from "react";
import { Platform } from "react-native";
import { View, Grid, Card, CardMedia, CardContent, CardSeparator, Column, Row, Typography, Select, Button, useMeasuredWidth, type ColorTokens } from "@nannier/canvas";
import { buildScopes } from "../../core/build-scopes";
import type { DocExample, PreviewScope } from "../../core/scope";
import { CodeBlock } from "../code-block";
import { ExampleErrorBoundary, FitStage, FormFactorSwitcher, FULL_WIDTH, StageHost, formFactorAt, useAuditCard } from "../stage";
import { DetailSection } from "./frame";

// The detail page's Platform skins (Component.dc.html `#cv-pf`): one example rendered
// through the web, iOS and Android skins side by side, each over its platform's metrics.
// It is the page's comparison stage, so it carries the hooks the Playground page's stage
// carried (one `data-preview-stage`, one `data-preview-card` naming its example in
// `data-example`, one `data-platform-row` per platform), the form-factor switcher and the
// audit probe's card. The example is the page's selected one: the bare URL shows the
// first (Usage) example, a variant URL its own, and the picker here moves between them
// and rewrites the address the way the Playground page's rail did.

/** Each platform's caption: its name and the metrics its skin draws (the hand-off's `PFL`). */
const METRICS: Record<PreviewScope["platform"], { label: string; metrics: string }> = {
  web: { label: "Web", metrics: "control 10 · field 10 · card 16 · Instrument Sans" },
  ios: { label: "iOS", metrics: "capsule controls · field 8 · card 12 · SF Pro · 44 pt" },
  android: { label: "Android", metrics: "Material 3 stadium · field 4 · card 12 · Roboto · 48 dp" },
};

const ORDER: readonly PreviewScope["platform"][] = ["web", "ios", "android"];

export function PlatformSkinsSection({ examples, selected, onSelect, tokens, stageAlign, singlePreview, sectionRef }: {
  examples: readonly DocExample[];
  selected: number;
  onSelect: (index: number) => void;
  tokens: ColorTokens;
  stageAlign?: "center" | "start";
  singlePreview?: boolean;
  sectionRef?: Ref<View>;
}) {
  const [factorIndex, setFactorIndex] = useState(FULL_WIDTH);
  const { factor, simulating } = formFactorAt(factorIndex);
  const { width: cardWidth, onLayout: onCardLayout } = useMeasuredWidth();
  const cardRef = useRef<View>(null);
  const example = examples[selected] ?? examples[0];
  useAuditCard(cardRef, example?.label);
  if (!example) return null;
  const all = [...buildScopes(tokens)].sort((a, b) => ORDER.indexOf(a.platform) - ORDER.indexOf(b.platform));
  // A component that IS app chrome (the Sidebar's whole app shell) shows the web skin alone.
  const previews = singlePreview && all.length > 1 ? all.filter((p) => p.platform === "web") : all;
  const labels = examples.map((e) => e.label);
  return (
    <DetailSection
      title="Platform skins"
      note="Each example on each platform: same tree, native shapes, type and touch sizes."
      sectionRef={sectionRef}
    >
      <StageHost bucket={simulating ? factor.bucket : null}>
        <View
          // The page's one comparison stage (e2e/support/docs.ts `stage`), and the marker
          // web-scrollbar.tsx hides a scrollable demo's browser scrollbar by. Web-only.
          {...(Platform.OS === "web" ? ({ dataSet: { previewStage: "" } } as object) : null)}
        >
          <Column cozy>
            {examples.length > 1 ? (
              <Row between alignCenter wrap snug>
                <Row snug alignCenter>
                  <Select small xs start accessibilityLabel="Platform example" options={labels} value={example.label} onSelect={(label) => onSelect(Math.max(0, labels.indexOf(label)))} />
                  {selected > 0 ? <Button link small onPress={() => onSelect(0)}>Reset</Button> : null}
                </Row>
                <FormFactorSwitcher index={factorIndex} onSelect={setFactorIndex} measuredWidth={cardWidth} />
              </Row>
            ) : (
              <FormFactorSwitcher index={factorIndex} onSelect={setFactorIndex} measuredWidth={cardWidth} />
            )}
            {/* onLayout attaches unconditionally: react-native-web registers its
                ResizeObserver in a mount-once effect, so a handler added later is never
                observed. When simulating, the card narrows to the tier, centered. */}
            <View
              {...(Platform.OS === "web" ? ({ dataSet: { previewCard: "", example: example.label } } as object) : null)}
              ref={cardRef}
              onLayout={onCardLayout}
              style={simulating ? { width: factor.width ?? undefined, maxWidth: "100%", alignSelf: "center" } : undefined}
            >
              <Grid minTileWidth={300} roomy>
                {previews.map((p) => (
                  <Card key={p.platform} flush>
                    <View {...(Platform.OS === "web" ? ({ dataSet: { platformRow: p.platform } } as object) : null)}>
                      <CardMedia tall>
                        <ExampleErrorBoundary key={`${p.platform}:${selected}`}>
                          <FitStage align={stageAlign}>{example.render(p.scope)}</FitStage>
                        </ExampleErrorBoundary>
                      </CardMedia>
                    </View>
                    <CardSeparator />
                    <CardContent>
                      <Column tight>
                        <Typography small semibold>{METRICS[p.platform].label}</Typography>
                        <Typography tiny mono muted>{METRICS[p.platform].metrics}</Typography>
                      </Column>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </View>
            <CodeBlock headerless code={example.code} />
          </Column>
        </View>
      </StageHost>
    </DetailSection>
  );
}
