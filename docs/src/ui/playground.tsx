import { Component, type ReactNode, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { ScrollView, View, Text, Tabs, OverlayProvider, useTheme } from "@nannier/canvas";
import { buildScopes } from "../core/build-scopes";
import type { DocExample, ExampleScope } from "../core/scope";
import { CodeBlock } from "./code-block";
import { DocsSurface } from "./surface";
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

// Holds a preview sized to the stage. The stage measures its own width and CAPS the example at
// that width, so content that exceeds the stage WRAPS rather than overflowing or scrolling:
//   - a responsive (width:"100%") example resolves to the stage width and wraps to fit, so it
//     fills the stage and keeps resizing with it at every width;
//   - a wide example (a flex-wrap row of chips/avatars, the icon gallery) is bounded to the stage
//     width and wraps onto more lines instead of running off the edge;
//   - a small example shrinks to its natural size and stays centered.
// The inner wrapper is `maxWidth` (not a fixed `width`): capped at the stage but free to shrink to
// a small example's content, so it never stretches a bare `<Button>` to full width. Its stretch
// children (the RN column default) fill that capped width, which is what makes a wide flex-wrap
// example actually wrap. The component is untouched: it renders within the width it is given and
// never learns the stage exists. Recomputed on resize via the outer onLayout. No horizontal
// scroller, so the Carousel's horizontal FlatList is never nested in a same-orientation scroller.
function FitStage({ children }: { children: ReactNode }) {
  const [avail, setAvail] = useState(0);
  return (
    <View
      style={{ width: "100%", alignItems: "center", justifyContent: "center" }}
      onLayout={(e) => { const l = e.nativeEvent.layout; if (!l) return; const w = Math.round(l.width); setAvail((a) => (a !== w ? w : a)); }}
    >
      <View style={{ maxWidth: avail || "100%" }}>{children}</View>
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
      {/* The live render cell. The overlay host is ONE per stage (see Playground),
          not per cell: a per-cell host traps its outlet inside the cell's stacking
          context, so an open menu on an upper row is clipped by the cell and painted
          under lower rows. A single stage-level outlet floats overlays above every
          row instead. */}
      <View style={{ flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", paddingVertical: 24, paddingHorizontal: 24, minHeight: 84 }}>
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
  const { tokens } = useTheme();
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
    // ONE overlay host per stage (not per cell). A portaled overlay (an open
    // Dropdown / Select / Combobox / Popover / Row-menu menu) renders into this
    // stage-level outlet, which paints above ALL device rows AND the code block, so
    // it is neither clipped by the stage nor occluded by a lower row's trigger.
    // Anchoring stays correct: AnchoredOverlay measures the trigger relative to this
    // outlet. Because overlays no longer render inside the stage card, the card can
    // keep its clean `overflow: "hidden"` rounded corners.
    <OverlayProvider style={{ flex: 1, minWidth: 0 }}>
      <View
        // Marks the preview stage so web-scrollbar.tsx can hide the browser scrollbar that
        // react-native-web draws for a scrollable demo (a ScrollView/list/table) inside a
        // preview cell — a real iOS/Android device shows a transient indicator, not a
        // persistent bar. Web-only attribute; a no-op on native.
        {...(Platform.OS === "web" ? ({ dataSet: { previewStage: "" } } as object) : null)}
        style={{ flex: 1, minWidth: 0 }}
      >
        {/* The stage is a content surface: a solid card in solid mode, a frost in glass mode
            (DocsSurface routes through the kit GlassSurface), so the preview never reads as a
            clear hole. The cells below inherit it. */}
        <DocsSurface
          fill="card"
          style={{
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: tokens.border,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            overflow: "hidden",
          }}
        >
          {previews.map((p, i) => (
            <PlatformRow key={p.platform} label={p.label} scope={p.scope} render={ex.render} resetKey={`${p.platform}:${selected}`} first={i === 0} showLabel={showLabels} />
          ))}
        </DocsSurface>
        <CodeBlock code={ex.code} flush />
      </View>
    </OverlayProvider>
  );

  if (examples.length <= 1) return stage;

  // The example switcher is the kit Tabs component, so the docs dogfood a real
  // selectable control instead of a hand-rolled pill row (which read as loose,
  // affordance-less text). One label per example; controlled by `selected`.
  const labels = examples.map((e) => e.label);

  // Wide: Tabs' `vertical` rail (a settings-style side rail, active row filled)
  // beside the stage, in a fixed 200px scroller so many examples still scroll.
  // Narrow: the horizontal `underline` tab bar above the stage, in a horizontal
  // scroller so long/many labels overflow by scrolling rather than cramping.
  const rail = wide ? (
    <ScrollView style={{ width: 200, flexGrow: 0 }} showsVerticalScrollIndicator={false}>
      <Tabs vertical block tabs={labels} active={selected} onSelect={setSelected} />
    </ScrollView>
  ) : (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
      <Tabs underline tabs={labels} active={selected} onSelect={setSelected} />
    </ScrollView>
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
