import { type ReactNode } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { View, Text, Icon, palette, useTheme } from "@nannier/canvas";
import { buildScopes } from "../core/build-scopes";
import type { DocDontPair, ExampleScope } from "../core/scope";
import { ExampleErrorBoundary } from "./playground";
import { DocsSurface } from "./surface";
import { geist } from "./fonts";

function ResultCard({ kind, caption, scope, render, resetKey }: {
  kind: "do" | "dont";
  caption: string;
  scope: ExampleScope;
  render: (s: ExampleScope) => ReactNode;
  resetKey: string;
}) {
  const { tokens, dark } = useTheme();
  const isDont = kind === "dont";
  const border = isDont ? "hsla(0, 70%, 60%, 0.3)" : "hsla(143, 70%, 45%, 0.3)";
  const bg = isDont ? "hsla(0, 70%, 60%, 0.05)" : "hsla(143, 70%, 45%, 0.05)";
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
      <View
        // Same preview-scrollbar suppression as the Playground stage (see web-scrollbar.tsx):
        // hide the browser scrollbar a scrollable demo would draw here. Web-only; no-op native.
        {...(Platform.OS === "web" ? ({ dataSet: { previewStage: "" } } as object) : null)}
        style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}
      >
        <ExampleErrorBoundary key={resetKey}>{render(scope)}</ExampleErrorBoundary>
      </View>
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
            <ResultCard kind="dont" caption={d.dont.caption} scope={scope} render={d.dont.render} resetKey={`dont-${i}`} />
            <ResultCard kind="do" caption={d.do.caption} scope={scope} render={d.do.render} resetKey={`do-${i}`} />
          </View>
        </View>
      ))}
    </View>
  );
}
