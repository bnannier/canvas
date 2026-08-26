import { Component, type ReactNode, useEffect, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { ScrollView, View, Text, Row, Column, Tabs, Input, ButtonGroup, BackdropHost, OverlayProvider, BreakpointOverride, useMeasuredWidth, useTheme, type IconName, type BreakpointKey } from "@nannier-com/canvas";
import { buildScopes } from "../core/build-scopes";
import { IconSearchContext } from "../core/live-state";
import type { DocExample, ExampleScope } from "../core/scope";
import { CodeBlock } from "./code-block";
import { DocsSurface } from "./surface";
import { geist } from "./fonts";

// Docs-only: example helpers whose fence renders a searchable catalog. When the selected
// example's code uses one, the Playground draws a SINGLE search field above the 3-up stage and
// publishes its text through IconSearchContext, so that one control filters every platform column
// at once (see IconGallery) instead of a separate box per column. The value is the placeholder.
const SEARCHABLE_EXAMPLES: Record<string, string> = { IconGallery: "Search icons" };

// The form-factor simulator behind the icon switcher in the stage header (WEB
// docs only: on a device you ARE the form factor, so the native app never
// renders it). Selecting a tier does two things at once, so the container- and
// viewport-driven halves of the kit's responsive system tell the same story:
//   - constrains the preview card to the tier's width, which the
//     container-measured components (DataTable, Grid, Row stacks, Navbar)
//     re-fit to, and
//   - pins the kit's viewport bucket via BreakpointOverride, which the
//     useBreakpoint / useResponsive / useFormFactor consumers (the Sidebar and
//     FilterPanel drawers, DescriptionList) resolve as the simulated tier. The
//     override wraps the stage's OverlayProvider, so portaled overlay content
//     (menus, dialogs, the calendar peek) simulates too.
// Desktop is the resting state: no width constraint, no override. In a stage
// narrower than the tier (tablet in a mid-width window) the card clamps to the
// stage and the readout shows the MEASURED width, so it never overstates.
const FORM_FACTORS: readonly { label: string; icon: IconName; width: number | null; bucket: BreakpointKey | "base" | null }[] = [
  { label: "Phone width (375px)", icon: "smartphone", width: 375, bucket: "sm" },
  { label: "Tablet width (768px)", icon: "tablet", width: 768, bucket: "md" },
  { label: "Desktop width (full)", icon: "monitor", width: null, bucket: null },
];

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
    <Column tight style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.destructive, padding: 10 }}>
      <Text style={{ fontFamily: geist("600"), fontSize: 12, color: tokens.destructive }}>Example failed to render</Text>
      <Text style={{ fontSize: 11, color: tokens["muted-foreground"] }}>{message}</Text>
    </Column>
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
// `align` (default "center") keeps the shrink-to-fit-and-center behavior above.
// "start" instead fills the stage width and pins the example to the leading edge:
// the outer row stretches its child and the inner wrapper takes the full width
// (no `maxWidth` cap), so a block-level, leading-aligned component (Breadcrumb)
// spans the row and reads from the left instead of floating in the center. The
// component is still untouched — it renders within the width it is given.
export function FitStage({ children, align = "center" }: { children: ReactNode; align?: "center" | "start" }) {
  const [avail, setAvail] = useState(0);
  const fill = align === "start";
  return (
    <View
      style={{ width: "100%", alignItems: fill ? "stretch" : "center", justifyContent: "center" }}
      onLayout={(e) => { const l = e.nativeEvent.layout; if (!l) return; const w = Math.round(l.width); setAvail((a) => (a !== w ? w : a)); }}
    >
      {/* A local BackdropHost so an example that mounts a <Backdrop> paints inside its
          own stage. A Backdrop claims the NEAREST host, so without this an example
          would publish to the app-root host and take over the whole page's backdrop.
          Costs nothing for every other example: a host with no claimant renders nothing. */}
      <View style={fill ? { width: "100%" } : { maxWidth: avail || "100%" }}>
        <BackdropHost>{children}</BackdropHost>
      </View>
    </View>
  );
}

// One platform row in the stage: the centered live render, tagged with a small platform
// watermark in the cell's top-left corner (only on the web 3-up, where three platforms stack
// and need telling apart). The tag floats over the render and is non-interactive, so it never
// intercepts a press, and it costs no layout width: dropping the old 96px label column hands
// that space back to the preview. On a device there is a single preview and you ARE the
// platform, so the tag is dropped and the render spans the full width.
function PlatformRow({ label, scope, render, resetKey, first, showLabel, stageAlign }: {
  label: string;
  scope: ExampleScope;
  render: (s: ExampleScope) => ReactNode;
  resetKey: string;
  first: boolean;
  showLabel: boolean;
  stageAlign?: "center" | "start";
}) {
  const { tokens } = useTheme();
  return (
    <View
      // Marks the row with its platform for tooling (element crops, row-level
      // assertions). Web-only attribute; a no-op on native, where a single
      // unlabeled preview renders. Same dataSet pattern as previewStage below.
      {...(Platform.OS === "web" ? ({ dataSet: { platformRow: label.toLowerCase() } } as object) : null)}
      style={{ borderTopWidth: first ? 0 : 1, borderColor: tokens.border }}
    >
      {/* The live render cell. The overlay host is ONE per stage (see Playground),
          not per cell: a per-cell host traps its outlet inside the cell's stacking
          context, so an open menu on an upper row is clipped by the cell and painted
          under lower rows. A single stage-level outlet floats overlays above every
          row instead. */}
      <Column flush center alignCenter padLoose style={{ minWidth: 0, minHeight: 84 }}>
        <ExampleErrorBoundary key={resetKey}>
          <FitStage align={stageAlign}>{render(scope)}</FitStage>
        </ExampleErrorBoundary>
      </Column>
      {showLabel ? (
        <View pointerEvents="none" style={{ position: "absolute", top: 8, left: 12 }}>
          <Text style={{ fontFamily: geist("600"), fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", color: tokens["muted-foreground"], opacity: 0.55 }}>
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// The component playground: the stacked iOS/Android/Web stage (one device row on
// native) + flush source, with the example rail to the right on wide viewports.
// Selection is optionally controlled: pass `selected` + `onSelect` to drive the active
// example from the URL variant (see ComponentReference); omit them and the rail manages
// its own state.
export function Playground({ examples, stageAlign, singlePreview, selected: selectedProp, onSelect: onSelectProp }: {
  examples: DocExample[];
  stageAlign?: "center" | "start";
  singlePreview?: boolean;
  selected?: number;
  onSelect?: (index: number) => void;
}) {
  const { tokens } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  const [selectedState, setSelectedState] = useState(0);
  const selected = selectedProp ?? selectedState;
  const setSelected = onSelectProp ?? setSelectedState;
  // One search field above the stage for catalog examples (see SEARCHABLE_EXAMPLES): its query
  // flows to every platform column through IconSearchContext, so a single control filters all
  // three previews. Reset when the selected example changes so a stale query never carries over.
  const [query, setQuery] = useState("");
  useEffect(() => { setQuery(""); }, [selected]);
  // The simulated form factor (see FORM_FACTORS). Desktop (the last entry) is
  // the resting state; the choice survives example switches on purpose, so a
  // breakpoint sweep can walk every variant at one tier.
  const [factorIndex, setFactorIndex] = useState(FORM_FACTORS.length - 1);
  const simulated = FORM_FACTORS[factorIndex] ?? FORM_FACTORS[FORM_FACTORS.length - 1];
  const simulating = Platform.OS === "web" && simulated.width != null;
  // The simulated card's REAL width: in a stage narrower than the tier the
  // card clamps (maxWidth 100%), and the readout follows this measurement so
  // it never overstates the frame.
  const { width: cardWidth, onLayout: onCardLayout } = useMeasuredWidth();
  const ex = examples[selected] ?? examples[0];
  if (!ex) return null;

  const allPreviews = buildScopes(tokens);
  // `singlePreview` components (full app chrome, e.g. Sidebar) show ONE preview instead of the
  // stacked iOS/Android/Web 3-up: keep the last column (the web skin on web) and drop the rest.
  // On native the build already returns a single device preview, so this is a no-op there.
  const previews = singlePreview && allPreviews.length > 1 ? [allPreviews[allPreviews.length - 1]] : allPreviews;
  // The web build returns the iOS/Android/Web 3-up (labels help tell them apart); the native
  // build returns a single device preview, where the platform label is redundant.
  const showLabels = previews.length > 1;
  // The single-search placeholder for this example, if its fence renders a searchable catalog.
  const searchPlaceholder = Object.entries(SEARCHABLE_EXAMPLES).find(([tag]) => ex.code.includes(tag))?.[1];

  const stage = (
    // The form-factor override wraps the WHOLE stage, OverlayProvider included:
    // the kit Portal renders overlay children at the provider's outlet (a React
    // sibling of the provider's children), so an override mounted below the
    // provider would never reach portaled overlay content. Above it, an open
    // menu / dialog / peek simulates the same tier as the inline preview.
    <BreakpointOverride value={simulating ? simulated.bucket : null}>
    {/* ONE overlay host per stage (not per cell). A portaled overlay (an open
        Dropdown / Select / Autocomplete / Popover / Row-menu menu) renders into this
        stage-level outlet, which paints above ALL device rows AND the code block, so
        it is neither clipped by the stage nor occluded by a lower row's trigger.
        Anchoring stays correct: AnchoredOverlay measures the trigger relative to this
        outlet. Because overlays no longer render inside the stage card, the card can
        keep its clean `overflow: "hidden"` rounded corners. */}
    <OverlayProvider style={{ flex: 1, minWidth: 0 }}>
      <IconSearchContext.Provider value={query}>
      <View
        // Marks the preview stage so web-scrollbar.tsx can hide the browser scrollbar that
        // react-native-web draws for a scrollable demo (a ScrollView/list/table) inside a
        // preview cell — a real iOS/Android device shows a transient indicator, not a
        // persistent bar. Web-only attribute; a no-op on native.
        {...(Platform.OS === "web" ? ({ dataSet: { previewStage: "" } } as object) : null)}
        style={{ flex: 1, minWidth: 0 }}
      >
        {/* A single search field above the stage for catalog examples (SEARCHABLE_EXAMPLES): its
            query flows to every platform column via IconSearchContext, so one control filters all
            three previews at once. Absent for every other example. */}
        {searchPlaceholder ? (
          <View style={{ marginBottom: 12 }}>
            <Input
              block
              leadingIcon
              icon="search"
              placeholder={searchPlaceholder}
              accessibilityLabel={searchPlaceholder}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        ) : null}
        {/* The form-factor switcher (web only; see FORM_FACTORS): icon segments
            depicting each tier, the simulated width read out beside them. */}
        {Platform.OS === "web" ? (
          <View style={{ marginBottom: 8 }}>
            <Row tight end alignCenter>
              {simulating ? (
                <Text style={{ fontFamily: geist("500"), fontSize: 11, color: tokens["muted-foreground"] }}>
                  {`${cardWidth || simulated.width}px`}
                </Text>
              ) : null}
              <ButtonGroup
                segmented
                small
                iconsOnly
                accessibilityLabel="Preview form factor"
                items={FORM_FACTORS.map(({ label, icon }) => ({ label, icon }))}
                active={factorIndex}
                onSelect={setFactorIndex}
              />
            </Row>
          </View>
        ) : null}
        {/* The stage is a content surface: a solid card in solid mode, a frost in glass mode
            (DocsSurface routes through the kit GlassSurface), so the preview never reads as a
            clear hole. The cells below inherit it. When simulating, the card narrows to the
            tier's width as a centered, fully-rounded frame detached from the code block
            (which stays full width), and the kit's viewport bucket is pinned to match. */}
        {/* onLayout attaches UNCONDITIONALLY: react-native-web registers its
            ResizeObserver in a mount-once effect, so toggling the prop from
            undefined to a handler on a live View never observes it (the
            measurement would sit at 0 forever). Measuring while not simulating
            is free; the readout only shows during simulation. */}
        <View
          // Marks the preview card (the platform-rows surface, without the
          // switcher row or the code block) for tooling screenshots.
          {...(Platform.OS === "web" ? ({ dataSet: { previewCard: "" } } as object) : null)}
          onLayout={onCardLayout}
          style={simulating ? { width: simulated.width ?? undefined, maxWidth: "100%", alignSelf: "center", marginBottom: 10 } : null}
        >
          <DocsSurface
            fill="card"
            style={{
              borderWidth: 1,
              borderBottomWidth: simulating ? 1 : 0,
              borderColor: tokens.border,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              borderBottomLeftRadius: simulating ? 12 : 0,
              borderBottomRightRadius: simulating ? 12 : 0,
              overflow: "hidden",
            }}
          >
            {previews.map((p, i) => (
              <PlatformRow key={p.platform} label={p.label} scope={p.scope} render={ex.render} resetKey={`${p.platform}:${selected}`} first={i === 0} showLabel={showLabels} stageAlign={stageAlign} />
            ))}
          </DocsSurface>
        </View>
        {/* The block attaches to the card's flush bottom edge normally; a
            simulated card is a detached rounded frame, so the block reverts to
            its standalone rounded look instead of squaring up to nothing. */}
        <CodeBlock code={ex.code} flush={!simulating} />
      </View>
      </IconSearchContext.Provider>
    </OverlayProvider>
    </BreakpointOverride>
  );

  if (examples.length <= 1) return stage;

  // The example switcher is the kit Tabs component, so the docs dogfood a real
  // selectable control instead of a hand-rolled pill row (which read as loose,
  // affordance-less text). One label per example; controlled by `selected`.
  const labels = examples.map((e) => e.label);

  // Wide: Tabs' `vertical` rail (a settings-style side rail, active row filled)
  // beside the stage, in a fixed 200px scroller so many examples still scroll.
  // Narrow: the horizontal `underline` tab bar above the stage, bare — the kit's
  // own overflow scroller pans long/many labels and keeps the selected tab in
  // view, so the docs-side horizontal ScrollView wrapper this once needed is
  // gone (it also blocked the kit scroller from capping, being content-sized).
  const rail = wide ? (
    <ScrollView style={{ width: 200, flexGrow: 0 }} showsVerticalScrollIndicator={false}>
      <Tabs vertical block testID="playground-examples" tabs={labels} active={selected} onSelect={setSelected} />
    </ScrollView>
  ) : (
    <Tabs underline testID="playground-examples" tabs={labels} active={selected} onSelect={setSelected} />
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
