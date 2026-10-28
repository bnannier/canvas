import { Component, type ReactNode, type RefObject, useEffect } from "react";
import { Platform } from "react-native";
import { View, Typography, Alert, Divider, Container, Row, Column, ButtonGroup, OverlayProvider, BreakpointOverride, type IconName, type BreakpointKey } from "@nannier/canvas";
import { useAuditProbe } from "../audit/probe-context";
import type { ExampleScope } from "../core/scope";

// The pieces of the comparison stage the Playground page (./playground.tsx) and the v4
// detail page's Platform skins section (./detail/platform-skins.tsx) share: the
// form-factor simulator, the error boundary every live example renders in, the definite
// box an example fits, the stage-level overlay host, the platform row of the stacked
// 3-up and the audit probe's card registration. The browser suite finds the stage, its
// card and its rows by the web-only tooling attributes these set (e2e/support/docs.ts),
// so each page mounts them exactly once.

// The form-factor simulator behind the icon switcher in the stage header (WEB
// docs only: on a device you ARE the form factor, so the native app never
// renders it). Selecting a tier does two things at once, so the container- and
// viewport-driven halves of the kit's responsive system tell the same story:
//   - constrains the preview card to the tier's width, which the
//     container-measured components (DataTable, Grid, Row stacks, Navbar,
//     DescriptionList) re-fit to, and
//   - pins the kit's viewport bucket via BreakpointOverride, which the
//     useBreakpoint / useResponsive / useFormFactor consumers (the Sidebar and
//     FilterPanel drawers, AnchoredOverlay's phone sheet) resolve as the
//     simulated tier, and which the container-measured components' first,
//     unmeasured frame follows. The override wraps the stage's OverlayProvider,
//     so portaled overlay content (menus, dialogs, the calendar peek) resolves
//     the simulated tier too; a sheet or drawer still lays out against the real
//     window, which BreakpointOverride does not simulate (it pins the tier, not
//     the geometry).
// The tiers walk the kit's own breakpoint scale (src/style/tokens.ts
// `breakpoints`: sm 640, md 768, lg 1024, xl 1280), one preview per bucket a
// component can switch on, plus a phone that sits well inside `sm`. Full width
// is the resting state: no width constraint, no override. In a stage narrower
// than the tier (a laptop tier in a mid-width window) the card clamps to the
// stage and the readout shows the MEASURED width, so it never overstates.
export const FORM_FACTORS: readonly { label: string; icon: IconName; width: number | null; bucket: BreakpointKey | "base" | null }[] = [
  { label: "Phone width (375px)", icon: "smartphone", width: 375, bucket: "sm" },
  { label: "Large phone width (640px)", icon: "phone", width: 640, bucket: "sm" },
  { label: "Tablet width (768px)", icon: "tablet", width: 768, bucket: "md" },
  { label: "Laptop width (1024px)", icon: "laptop", width: 1024, bucket: "lg" },
  { label: "Desktop width (1280px)", icon: "monitor", width: 1280, bucket: "xl" },
  { label: "Full width", icon: "maximize", width: null, bucket: null },
];

/** The resting form factor: full width, no constraint and no override. */
export const FULL_WIDTH = FORM_FACTORS.length - 1;

/** The tier at `index`, and whether it constrains the card (web only). */
export function formFactorAt(index: number): { factor: (typeof FORM_FACTORS)[number]; simulating: boolean } {
  const factor = FORM_FACTORS[index] ?? FORM_FACTORS[FULL_WIDTH];
  return { factor, simulating: Platform.OS === "web" && factor.width != null };
}

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
  return <Alert destructive title="Example failed to render" description={message} />;
}

// Holds a preview sized to the stage. The stage is a DEFINITE-width box that centers
// its children (`width:"100%"` + `alignItems:"center"`), which is the layout the kit's
// sizing natures (src/style/sizing.ts) are built for:
//   - a FILL example (a field, a card, a table, a chart) resolves `width:"100%"` against
//     the stage's real width, so it fills the stage and keeps resizing with it;
//   - a HUG example (a bare `<Button>`, a badge) is content-sized under `alignItems:
//     "center"` and stays centered, never stretched to full width;
//   - a wide example (a flex-wrap row of chips, the icon gallery) is shrink-to-fit
//     against the stage width, so it wraps onto more lines instead of running off the
//     edge.
// It used to be a content-sized `maxWidth` box instead. In a content-sized parent a
// `width:"100%"` child resolves to its own content (the `field-width.ts` post-mortem: a
// text field then re-sized on every keystroke), which is why every fill component once
// carried a fixed pixel width. The definite stage removes that root cause. The component
// is untouched: it renders within the width it is given and never learns the stage exists.
// No horizontal scroller, so the Carousel's horizontal FlatList is never nested in a
// same-orientation scroller. `align` (default "center") keeps the centering above;
// "start" pins the example to the leading edge and stretches it (a block-level,
// leading-aligned component such as Breadcrumb spans the row and reads from the left).
// An example whose fence opens on a Row or Column stretches the same way, whatever
// `align` says: the hand-off's specimen renderer (`row-column` in cv-kit-code.js) gives
// the fence's top-level Row or Column `width:100%`, so its fill and span children share
// the stage and its own justification places them, where a centered stage would let the
// Row hug its content and its fill children collapse to nothing.
export function FitStage({ children, align = "center", code }: { children: ReactNode; align?: "center" | "start"; code?: string }) {
  const stretch = align === "start" || (code != null && fenceRootIsLayout(code));
  return <Container><Column flush center alignCenter={!stretch}>{children}</Column></Container>;
}

/** Whether a fence's first element is a Row or Column (the hand-off's top-level layout box). */
export function fenceRootIsLayout(code: string): boolean {
  return /^\s*(?:\{\/\*[\s\S]*?\*\/\}\s*)*<(?:Row|Column)[\s>/]/.test(code);
}

/**
 * The stage's hosts: the form-factor override around ONE overlay outlet for the whole
 * stage. The override wraps the provider because the kit Portal renders overlay children
 * at the provider's outlet (a React sibling of the provider's children), so an override
 * mounted below it would never reach portaled overlay content. One outlet per stage, not
 * per platform cell: a per-cell host traps its outlet inside the cell's stacking context,
 * so an open menu on one cell is clipped by it and painted under the next.
 */
export function StageHost({ bucket, children }: { bucket: BreakpointKey | "base" | null; children: ReactNode }) {
  return (
    <BreakpointOverride value={bucket}>
      <OverlayProvider style={{ flex: 1, minWidth: 0 }}>{children}</OverlayProvider>
    </BreakpointOverride>
  );
}

/** The form-factor switcher (web only; see FORM_FACTORS): icon segments, the simulated width read out beside them. */
export function FormFactorSwitcher({ index, onSelect, measuredWidth }: { index: number; onSelect: (index: number) => void; measuredWidth: number }) {
  if (Platform.OS !== "web") return null;
  const { factor, simulating } = formFactorAt(index);
  return (
    <Row tight end alignCenter>
      {simulating ? <Typography tiny>{`${measuredWidth || factor.width}px`}</Typography> : null}
      <ButtonGroup
        segmented
        small
        iconsOnly
        accessibilityLabel="Preview form factor"
        items={FORM_FACTORS.map(({ label, icon }) => ({ label, icon }))}
        active={index}
        onSelect={onSelect}
      />
    </Row>
  );
}

/**
 * Publishes the preview card and the example it shows to the native audit driver
 * (docs/src/audit/probe-context.tsx): it waits for this label before photographing the
 * card, so a route that landed on another example is caught, not captured. The probe is
 * null outside the audit build, where this registers nothing.
 */
export function useAuditCard(cardRef: RefObject<View | null>, label: string | undefined): void {
  const probe = useAuditProbe();
  useEffect(() => (probe && label !== undefined ? probe.card({ ref: cardRef as RefObject<View>, label }) : undefined), [probe, label, cardRef]);
}

// One platform row in the stacked stage: the centered live render, tagged with a small platform
// watermark in the cell's top-left corner (only on the web 3-up, where three platforms stack
// and need telling apart). The tag floats over the render and is non-interactive, so it never
// intercepts a press, and it costs no layout width: dropping the old 96px label column hands
// that space back to the preview. On a device there is a single preview and you ARE the
// platform, so the tag is dropped and the render spans the full width.
export function PlatformRow({ label, scope, render, code, resetKey, first, showLabel, stageAlign }: {
  label: string;
  /** The example's fence source, which decides whether its root stretches (FitStage). */
  code?: string;
  scope: ExampleScope;
  render: (s: ExampleScope) => ReactNode;
  resetKey: string;
  first: boolean;
  showLabel: boolean;
  stageAlign?: "center" | "start";
}) {
  return (
    <View
      // Marks the row with its platform for tooling (element crops, row-level
      // assertions). Web-only attribute; a no-op on native, where a single
      // unlabeled preview renders.
      {...(Platform.OS === "web" ? ({ dataSet: { platformRow: label.toLowerCase() } } as object) : null)}
    >
      {first ? null : <Divider />}
      <Column flush center alignCenter padLoose>
        <ExampleErrorBoundary key={resetKey}>
          <FitStage align={stageAlign} code={code}>{render(scope)}</FitStage>
        </ExampleErrorBoundary>
      </Column>
      {showLabel ? (
        <View pointerEvents="none" style={{ position: "absolute", top: 8, left: 12 }}>
          <Typography caption subtle>
            {label}
          </Typography>
        </View>
      ) : null}
    </View>
  );
}
