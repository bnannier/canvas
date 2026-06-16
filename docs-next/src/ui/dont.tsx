import { type ReactNode } from "react";
import { View, Text, useTheme, alpha, palette } from "@olympusoss/canvas";
import { buildScopes } from "docs-core/build-scopes";
import type { DocDontPair, ExampleScope } from "docs-core/scope";
import { ExampleErrorBoundary } from "./playground";
import { H2 } from "./prose";

function ResultCard({
  kind,
  caption,
  scope,
  render,
  resetKey,
}: {
  kind: "do" | "dont";
  caption: string;
  scope: ExampleScope;
  render: (s: ExampleScope) => ReactNode;
  resetKey: string;
}) {
  const { tokens } = useTheme();
  const accent = kind === "dont" ? palette["red-500"] : palette["green-600"];
  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: alpha(accent, 0.3),
        backgroundColor: alpha(accent, 0.05),
        padding: 16,
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color: accent }}>{kind === "dont" ? "Don’t" : "Do"}</Text>
      <View style={{ alignItems: "flex-start", paddingVertical: 4 }}>
        <ExampleErrorBoundary key={resetKey}>{render(scope)}</ExampleErrorBoundary>
      </View>
      <Text style={{ fontSize: 12, lineHeight: 18, color: tokens["muted-foreground"] }}>{caption}</Text>
    </View>
  );
}

// The Do/Don't section: each pair is a red Don't card over a green Do card (stacked for
// the phone's narrow column). Examples render in the device skin on native (the neutral
// Web look on the web build) — these are about correct usage, not platform comparison.
export function Donts({ donts }: { donts: DocDontPair[] }) {
  const { tokens } = useTheme();
  const previews = buildScopes(tokens);
  const scope = previews[previews.length - 1].scope;

  return (
    <View style={{ gap: 18 }}>
      <H2>Don’ts</H2>
      {donts.map((d, i) => (
        <View key={i} style={{ gap: 10 }}>
          {d.title ? (
            <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>{d.title}</Text>
          ) : null}
          <ResultCard kind="dont" caption={d.dont.caption} scope={scope} render={d.dont.render} resetKey={`dont-${i}`} />
          <ResultCard kind="do" caption={d.do.caption} scope={scope} render={d.do.render} resetKey={`do-${i}`} />
        </View>
      ))}
    </View>
  );
}
