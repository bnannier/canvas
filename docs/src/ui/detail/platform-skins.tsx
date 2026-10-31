import { useRef, type Ref } from "react";
import { Platform } from "react-native";
import { View, Grid, Card, CardMedia, CardContent, CardSeparator, Column, Typography, type ColorTokens } from "@nannier/canvas";
import { buildScopes } from "../../core/build-scopes";
import { ExampleErrorBoundary, FitStage, StageHost, useAuditCard } from "../stage";
import { DetailSection, renderComponent, stageData, type SpecimenBase } from "./frame";
import { PLATFORMS_SHOWN, PLATFORM_LABELS } from "../../core/platforms-shown";
import type { DocExample } from "../../core/scope";
import type { PropDescriptors } from "./knobs";

// Component.dc.html #cv-pf renders the playground's current props on every platform.
// The build seam still limits a native app to its own real skin.
export function PlatformSkinsSection({ component, props, base, tokens, example, sectionRef }: {
  component: string;
  props: PropDescriptors;
  base?: SpecimenBase;
  tokens: ColorTokens;
  /** A deep-linked documented example; the bare route uses the hand-off playground. */
  example?: DocExample;
  sectionRef?: Ref<View>;
}) {
  const cardRef = useRef<View>(null);
  useAuditCard(cardRef, example?.label ?? "Playground");
  const previews = [...buildScopes(tokens)]
    .filter((p) => PLATFORMS_SHOWN.includes(p.platform))
    .sort((a, b) => PLATFORMS_SHOWN.indexOf(a.platform) - PLATFORMS_SHOWN.indexOf(b.platform));
  return (
    <DetailSection id="pf" title="Platform skins" note="The playground's props on each platform: same tree, native shapes, type and touch sizes." sectionRef={sectionRef}>
      <StageHost bucket={null}>
        <View {...(Platform.OS === "web" ? ({ dataSet: stageData(!example && component === "Autocomplete" && props.open === true) } as object) : null)}>
          <View ref={cardRef} {...(Platform.OS === "web" ? ({ dataSet: { previewCard: "", example: example?.label ?? "Playground" } } as object) : null)}>
            <Grid minTileWidth={300} roomy>
              {previews.map((p) => (
                <Card key={p.platform} flush clip largeCorners outlined>
                  <View {...(Platform.OS === "web" ? ({ dataSet: { platformRow: p.platform } } as object) : null)}>
                    <CardMedia tall>
                      <ExampleErrorBoundary key={`${p.platform}:${component}`}>
                        <FitStage code={example?.code}>{example ? example.render(p.scope) : renderComponent(p.scope, component, props, base)}</FitStage>
                      </ExampleErrorBoundary>
                    </CardMedia>
                  </View>
                  <CardSeparator />
                  <CardContent compact>
                    <Column style={{ gap: 3 }}>
                      <Typography small semibold style={{ fontSize: 14, lineHeight: 18 }}>{PLATFORM_LABELS[p.platform]?.label}</Typography>
                      <Typography tiny mono muted style={{ lineHeight: 15.4 }}>{PLATFORM_LABELS[p.platform]?.metrics}</Typography>
                    </Column>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </View>
        </View>
      </StageHost>
    </DetailSection>
  );
}
