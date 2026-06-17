import { Component, type ReactNode, useState } from "react";
import { useWindowDimensions } from "react-native";
import { ScrollView, View, Text, Pressable, useTheme } from "@olympusoss/canvas";
import { buildScopes } from "docs-core/build-scopes";
import type { DocExample, ExampleScope } from "docs-core/scope";
import { CodeBlock } from "./code-block";
import { geist } from "./fonts";

export class ExampleErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  render() {
    if (this.state.error) return <ErrorNote message={this.state.error} />;
    return this.props.children;
  }
}

function ErrorNote({ message }: { message: string }) {
  const { tokens } = useTheme();
  return (
    <View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.destructive, padding: 10, gap: 4 }}>
      <Text style={{ fontFamily: geist("600"), fontSize: 12, color: tokens.destructive }}>Example failed to render</Text>
      <Text style={{ fontSize: 11, color: tokens["muted-foreground"] }}>{message}</Text>
    </View>
  );
}

// Holds a preview together when it is wider than the stage. The stage measures its own width and
// hands it to a horizontal scroller as a minWidth: a responsive (width:"100%") example fills the
// stage exactly (so it never scrolls and its own internal scroll still works), a small example is
// centered at its natural size, and only an example genuinely WIDER than the stage scrolls — so
// nothing is ever cropped or squished. The component is untouched: it renders at its own size and
// never learns the stage exists. Recomputed on resize via the outer onLayout.
function FitStage({ children }: { children: ReactNode }) {
  const [avail, setAvail] = useState(0);
  return (
    <View
      style={{ width: "100%" }}
      onLayout={(e) => { const w = Math.round(e.nativeEvent.layout.width); setAvail((a) => (a !== w ? w : a)); }}
    >
      <ScrollView
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ minWidth: avail || undefined, alignItems: "center", justifyContent: "center" }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

// One platform row in the stage: the centered live render, with a 96px platform-label column
// only when more than one platform is shown (the web 3-up). On a device there is a single
// preview and you ARE the platform, so the label is dropped and the render spans the full width.
function PlatformRow({ label, scope, render, resetKey, first, showLabel }: {
  label: string;
  scope: ExampleScope;
  render: (s: ExampleScope) => ReactNode;
  resetKey: string;
  first: boolean;
  showLabel: boolean;
}) {
  const { tokens } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "stretch", borderTopWidth: first ? 0 : 1, borderColor: tokens.border }}>
      {showLabel ? (
        <View style={{ width: 96, justifyContent: "center", paddingVertical: 12, paddingHorizontal: 14, borderRightWidth: 1, borderColor: tokens.border }}>
          <Text style={{ fontFamily: geist("600"), fontSize: 11, letterSpacing: 0.55, textTransform: "uppercase", color: tokens["muted-foreground"] }}>
            {label}
          </Text>
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", paddingVertical: 24, paddingHorizontal: 16, minHeight: 84 }}>
        <ExampleErrorBoundary key={resetKey}>
          <FitStage>{render(scope)}</FitStage>
        </ExampleErrorBoundary>
      </View>
    </View>
  );
}

// The component playground: the stacked iOS/Android/Web stage (one device row on
// native) + flush source, with the example rail to the right on wide viewports.
export function Playground({ examples }: { examples: DocExample[] }) {
  const { tokens, surface } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  const [selected, setSelected] = useState(0);
  const ex = examples[selected] ?? examples[0];
  if (!ex) return null;

  const previews = buildScopes(tokens);
  // The web build returns the iOS/Android/Web 3-up (labels help tell them apart); the native
  // build returns a single device preview, where the platform label is redundant.
  const showLabels = previews.length > 1;

  const stage = (
    <View style={{ flex: 1, minWidth: 0 }}>
      <View
        style={{
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: tokens.border,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          // The stage is a content card (tokens.card, distinct from the page bg in dark
          // mode); in glass it goes transparent so previewed glass overlays frost against
          // the aurora, matching the Vite `.live-example-stage`.
          backgroundColor: surface === "glass" ? "transparent" : tokens.card,
          overflow: "hidden",
        }}
      >
        {previews.map((p, i) => (
          <PlatformRow key={p.platform} label={p.label} scope={p.scope} render={ex.render} resetKey={`${p.platform}:${selected}`} first={i === 0} showLabel={showLabels} />
        ))}
      </View>
      <CodeBlock code={ex.code} flush />
    </View>
  );

  if (examples.length <= 1) return stage;

  const pills = examples.map((e, i) => {
    const active = i === selected;
    return (
      <Pressable
        key={e.label}
        onPress={() => setSelected(i)}
        style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: active ? tokens.foreground : "transparent" }}
      >
        <Text style={{ fontFamily: geist("500"), fontSize: 13, color: active ? tokens.background : tokens["muted-foreground"] }}>{e.label}</Text>
      </Pressable>
    );
  });

  // Wide: a fixed 200px vertical rail beside the stage. Narrow: a wrapping row of pills.
  // (A horizontal ScrollView here grows to the column's leftover height on react-native-web,
  // which stretched the active pill into a tall bar — so wrap instead of scroll.)
  const rail = wide ? (
    <ScrollView style={{ width: 200, flexGrow: 0 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 2 }}>
      {pills}
    </ScrollView>
  ) : (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 6 }}>{pills}</View>
  );

  return (
    <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 16 : 10 }}>
      {wide ? (
        <>
          {stage}
          {rail}
        </>
      ) : (
        <>
          {rail}
          {stage}
        </>
      )}
    </View>
  );
}
