import { type ReactNode } from "react";
import { useWindowDimensions } from "react-native";
import { View, Text, useTheme } from "@olympusoss/canvas";
import { CircleX, CircleCheck } from "lucide-react-native";
import { buildScopes } from "../core/build-scopes";
import type { DocDontPair, ExampleScope } from "../core/scope";
import { ExampleErrorBoundary } from "./playground";
import { geist } from "./fonts";

function ResultCard({ kind, caption, scope, render, resetKey }: {
  kind: "do" | "dont";
  caption: string;
  scope: ExampleScope;
  render: (s: ExampleScope) => ReactNode;
  resetKey: string;
}) {
  const { tokens } = useTheme();
  const isDont = kind === "dont";
  const border = isDont ? "hsla(0, 70%, 60%, 0.3)" : "hsla(143, 70%, 45%, 0.3)";
  const bg = isDont ? "hsla(0, 70%, 60%, 0.05)" : "hsla(143, 70%, 45%, 0.05)";
  const labelColor = isDont ? "hsl(0, 84%, 60%)" : "hsl(143, 60%, 38%)";
  const Icon = isDont ? CircleX : CircleCheck;
  return (
    <View style={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: border, backgroundColor: bg, padding: 20, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Icon size={14} color={labelColor} />
        <Text style={{ fontFamily: geist("600"), fontSize: 13, color: labelColor }}>{isDont ? "Don’t" : "Do"}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <ExampleErrorBoundary key={resetKey}>{render(scope)}</ExampleErrorBoundary>
      </View>
      <Text style={{ fontFamily: geist("400"), fontSize: 12, lineHeight: 18, color: tokens["muted-foreground"] }}>{caption}</Text>
    </View>
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
