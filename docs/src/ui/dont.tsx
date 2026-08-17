import { type ReactNode } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { View, Text, Icon, alpha, palette, useTheme } from "@nannier/canvas";
import { buildScopes } from "../core/build-scopes";
import type { DocDontPair } from "../core/scope";
import { CodeBlock } from "./code-block";
import { ExampleErrorBoundary } from "./playground";
import { DocsSurface } from "./surface";
import { geist } from "./fonts";

export interface DoDontCardProps {
  // Treatment axis: `dont` is the red card, and everything else is the green Do card.
  // `do` is nameable at the call site for symmetry in a pair, but it is inert: `dont`
  // is the only member that changes the render, and it wins when both are passed.
  do?: boolean;
  dont?: boolean;
  // The muted line under the body, saying why this side is right or wrong.
  caption: string;
  // Body, pick one. `children` is a LIVE preview: pass the rendered example and the card
  // frames it exactly as a component page does. `code` shows the source through the docs
  // CodeBlock instead, which is what a Don't that cannot compile needs (the colors page
  // demonstrates string-enum props the kit deliberately does not have, so those fences
  // exist as text only).
  code?: string;
  children?: ReactNode;
}

// One side of a Do/Don't pair: the red Don't card or the green Do card, carrying a body
// (live preview or code) above its caption.
export function DoDontCard(props: DoDontCardProps) {
  const { caption, code, children } = props;
  const { tokens, dark } = useTheme();
  // `dont` alone decides the treatment. `do` is accepted so a call site can NAME the
  // side it means (`<DoDontCard do>` reads better in a pair than a bare tag), but it
  // does not participate in resolution: with only two states, the absence of `dont`
  // already is the Do side, so reading `do` could not change any outcome.
  const isDont = props.dont === true;
  // The wash reads from the kit palette rather than a hand-written color, so the do/don't
  // red and green track the token layer: palette red-500 / green-500 at the border and
  // fill alphas.
  const tone = isDont ? palette["red-500"] : palette["green-500"];
  const border = alpha(tone, 0.3);
  const bg = alpha(tone, 0.05);
  // Label and glyph share the kit tone colors so they match exactly: the
  // destructive token for Don't, the palette green (Alert's success shade) for Do.
  const labelColor = isDont ? tokens.destructive : dark ? palette["green-400"] : palette["green-600"];
  return (
    // Solid card in solid mode, frost in glass mode (DocsSurface), with the do/don't
    // red/green wash laid over it as an overlay so the card never reads as a clear hole.
    <DocsSurface style={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: border, padding: 20, gap: 8 }}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: bg, pointerEvents: "none" }} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {isDont ? <Icon circleX destructive size={14} /> : <Icon circleCheck success size={14} />}
        <Text style={{ fontFamily: geist("600"), fontSize: 13, color: labelColor }}>{isDont ? "Don’t" : "Do"}</Text>
      </View>
      {children === undefined ? null : (
        <View
          // Same preview-scrollbar suppression as the Playground stage (see web-scrollbar.tsx):
          // hide the browser scrollbar a scrollable demo would draw here. Web-only; no-op native.
          {...(Platform.OS === "web" ? ({ dataSet: { previewStage: "" } } as object) : null)}
          style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}
        >
          <ExampleErrorBoundary>{children}</ExampleErrorBoundary>
        </View>
      )}
      {code === undefined ? null : <CodeBlock code={code} />}
      <Text style={{ fontFamily: geist("400"), fontSize: 12, lineHeight: 18, color: tokens["muted-foreground"] }}>{caption}</Text>
    </DocsSurface>
  );
}

// The Do/Don't section: each pair is the red Don't card beside the green Do card
// (stacked on a phone), matching the component page's donts-grid.
export function Donts({ donts }: { donts: DocDontPair[] }) {
  const { tokens } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const previews = buildScopes(tokens);
  const scope = previews[previews.length - 1].scope;

  return (
    <View style={{ gap: 16 }}>
      <Text style={{ fontFamily: geist("600"), fontSize: 20, letterSpacing: -0.3, color: tokens.foreground }}>Don’ts</Text>
      {donts.map((d, i) => (
        <View key={i} style={{ gap: 8 }}>
          {d.title ? (
            <Text style={{ fontFamily: geist("600"), fontSize: 13, color: tokens.foreground }}>{d.title}</Text>
          ) : null}
          <View style={{ flexDirection: wide ? "row" : "column", gap: 16 }}>
            <DoDontCard dont caption={d.dont.caption}>{d.dont.render(scope)}</DoDontCard>
            <DoDontCard do caption={d.do.caption}>{d.do.render(scope)}</DoDontCard>
          </View>
        </View>
      ))}
    </View>
  );
}
