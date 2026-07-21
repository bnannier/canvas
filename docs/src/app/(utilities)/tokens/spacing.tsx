import { View } from "@nannier/canvas";
import { Page } from "../../../ui/page";
import { PageNav } from "../../../ui/page-nav";
import { Playground } from "../../../ui/playground";
import type { DocExample } from "../../../core/scope";
import { TokenH1, TokenLede, TokenSection } from "../../../ui/tokens-kit";

const SPACING = [
  { tw: "p-1", px: 4 }, { tw: "p-2", px: 8 }, { tw: "p-3", px: 12 }, { tw: "p-4", px: 16 },
  { tw: "p-5", px: 20 }, { tw: "p-6", px: 24 }, { tw: "p-8", px: 32 }, { tw: "p-10", px: 40 }, { tw: "p-12", px: 48 },
];

const RADII = [
  { name: "sm", px: 4 }, { name: "md", px: 6 }, { name: "lg", px: 8 }, { name: "xl", px: 12 }, { name: "full", px: 9999 },
];

// The six-level shadow() preset (src/style/shadow.ts). "DEFAULT" is the unnamed
// `shadow`; there is no "2xl".
const SHADOW_LEVELS = [
  { key: "none", label: "shadow-none" }, { key: "sm", label: "shadow-sm" }, { key: "DEFAULT", label: "shadow" },
  { key: "md", label: "shadow-md" }, { key: "lg", label: "shadow-lg" }, { key: "xl", label: "shadow-xl" },
] as const;

// Spacing scale as live padding demos: the outer box is padded by the step, so the
// inset between it and the inner box IS the spacing value.
const spacingExamples: DocExample[] = SPACING.map((s) => ({
  label: `${s.tw} · ${s.px}px`,
  code: `<View style={{ alignSelf: "center", padding: ${s.px}, borderRadius: 8, backgroundColor: alpha(tokens.primary, 0.2) }}>
  <View style={{ width: 96, height: 48, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.4) }} />
</View>`,
  render: (scope) => {
    const { View, tokens, alpha } = scope;
    return (
      <View style={{ alignSelf: "center", padding: s.px, borderRadius: 8, backgroundColor: alpha(tokens.primary, 0.2) }}>
        <View style={{ width: 96, height: 48, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.4) }} />
      </View>
    );
  },
}));

const radiusExamples: DocExample[] = RADII.map((r) => ({
  label: r.name === "full" ? "rounded-full" : `rounded-${r.name} · ${r.px}px`,
  code: `<View style={{ width: 96, height: 96, borderRadius: ${r.px}, backgroundColor: alpha(tokens.primary, 0.2), borderWidth: 1, borderColor: alpha(tokens.primary, 0.4) }} />`,
  render: (scope) => {
    const { View, tokens, alpha } = scope;
    return (
      <View style={{ width: 96, height: 96, borderRadius: r.px, backgroundColor: alpha(tokens.primary, 0.2), borderWidth: 1, borderColor: alpha(tokens.primary, 0.4) }} />
    );
  },
}));

// Each level renders the real shadow() helper, so the iOS / Android / Web rows show
// the actual iOS shadow vs Android elevation the preset ships.
const shadowExamples: DocExample[] = SHADOW_LEVELS.map((s) => ({
  label: s.label,
  code: `<View style={[{ width: 96, height: 96, borderRadius: 12, backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border }, shadow("${s.key}")]} />`,
  render: (scope) => {
    const { View, tokens, shadow } = scope;
    return (
      <View style={[{ width: 96, height: 96, borderRadius: 12, backgroundColor: tokens.card, borderWidth: 1, borderColor: tokens.border }, shadow(s.key)]} />
    );
  },
}));

// Three overlapping cards at the real reserve levels: the higher zIndex paints on
// top, so z-50 covers z-40 covers z-10.
const zIndexExamples: DocExample[] = [
  {
    label: "Stacking",
    code: `<View style={{ width: 230, height: 116 }}>
  <View style={{ position: "absolute", left: 0, top: 6, width: 100, height: 68, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: tokens.card, borderWidth: 1, borderColor: alpha(tokens.primary, 0.5), zIndex: 10 }}>
    <Text style={{ fontSize: 12, fontWeight: "600", color: tokens.primary }}>z-10</Text>
  </View>
  <View style={{ position: "absolute", left: 64, top: 24, width: 100, height: 68, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: tokens.card, borderWidth: 1, borderColor: alpha(tokens.primary, 0.5), zIndex: 40 }}>
    <Text style={{ fontSize: 12, fontWeight: "600", color: tokens.primary }}>z-40</Text>
  </View>
  <View style={{ position: "absolute", left: 128, top: 42, width: 100, height: 68, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: tokens.card, borderWidth: 1, borderColor: alpha(tokens.primary, 0.5), zIndex: 50 }}>
    <Text style={{ fontSize: 12, fontWeight: "600", color: tokens.primary }}>z-50</Text>
  </View>
</View>`,
    render: (scope) => {
      const { View, Text, tokens, alpha } = scope;
      return (
        <View style={{ width: 230, height: 116 }}>
          <View style={{ position: "absolute", left: 0, top: 6, width: 100, height: 68, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: tokens.card, borderWidth: 1, borderColor: alpha(tokens.primary, 0.5), zIndex: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: tokens.primary }}>z-10</Text>
          </View>
          <View style={{ position: "absolute", left: 64, top: 24, width: 100, height: 68, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: tokens.card, borderWidth: 1, borderColor: alpha(tokens.primary, 0.5), zIndex: 40 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: tokens.primary }}>z-40</Text>
          </View>
          <View style={{ position: "absolute", left: 128, top: 42, width: 100, height: 68, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: tokens.card, borderWidth: 1, borderColor: alpha(tokens.primary, 0.5), zIndex: 50 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: tokens.primary }}>z-50</Text>
          </View>
        </View>
      );
    },
  },
];

// Card carries a real density axis (compact / default / comfortable), so it shows
// the spacing change on an actual component.
// The inner text column is identical in all three; only the card's own density
// changes, so the surface inset (16 / 24 / 32) is the whole visual difference.
// Density retunes the surface inset on the raw-children path only (the string
// form's sections pad themselves), hence the composed children here.
const densityExamples: DocExample[] = [
  {
    label: "compact",
    code: `<Card compact style={{ width: 260 }}>
  <Column tight>
    <Typography lead semibold>Storage</Typography>
    <Typography small muted>84% of 512 GB used.</Typography>
  </Column>
</Card>`,
    render: (scope) => {
      const { Card, Column, Typography } = scope;
      return (
        <Card compact style={{ width: 260 }}>
          <Column tight>
            <Typography lead semibold>Storage</Typography>
            <Typography small muted>84% of 512 GB used.</Typography>
          </Column>
        </Card>
      );
    },
  },
  {
    label: "regular",
    code: `<Card style={{ width: 260 }}>
  <Column tight>
    <Typography lead semibold>Storage</Typography>
    <Typography small muted>84% of 512 GB used.</Typography>
  </Column>
</Card>`,
    render: (scope) => {
      const { Card, Column, Typography } = scope;
      return (
        <Card style={{ width: 260 }}>
          <Column tight>
            <Typography lead semibold>Storage</Typography>
            <Typography small muted>84% of 512 GB used.</Typography>
          </Column>
        </Card>
      );
    },
  },
  {
    label: "comfortable",
    code: `<Card comfortable style={{ width: 260 }}>
  <Column tight>
    <Typography lead semibold>Storage</Typography>
    <Typography small muted>84% of 512 GB used.</Typography>
  </Column>
</Card>`,
    render: (scope) => {
      const { Card, Column, Typography } = scope;
      return (
        <Card comfortable style={{ width: 260 }}>
          <Column tight>
            <Typography lead semibold>Storage</Typography>
            <Typography small muted>84% of 512 GB used.</Typography>
          </Column>
        </Card>
      );
    },
  },
];

export default function SpacingScreen() {
  return (
    <Page>
      <View style={{ gap: 40 }}>
        {/* Intro */}
        <View style={{ gap: 12 }}>
          <TokenH1>Spacing & Shape</TokenH1>
          <TokenLede>
            The 4px grid governs all of Canvas. Every padding, margin, gap, width, and height is a multiple of 4. Radii follow a fixed four-tier scale (sm, md, lg, xl) plus full for pills; components reference rounded-sm/md/lg/xl, which map to the radius tokens. Shadows are a fixed elevation preset (none, sm, the default, md, lg, xl), shipped by the shadow() helper rather than Tailwind.
          </TokenLede>
        </View>

        <TokenSection
          title="Spacing ramp"
          description="Tailwind's default 4px-based scale (here applied as padding; the same numbers back margin and gap). We use 1-12 in practice; anything larger should probably be a layout decision instead of an in-component value. Switch the rail to compare the steps."
        >
          <Playground examples={spacingExamples} />
        </TokenSection>

        <TokenSection
          title="Radius scale"
          description="Four fixed tiers, sm through xl, plus full for pills. Components reference the rounded-sm/md/lg/xl utilities, which map to the --radius-* tokens, so radii stay consistent across the kit. Native and web agree on md/lg/xl (6/8/12px); they diverge only at sm, which is 4px via the web --radius-sm var but 2px in the native radius scale."
          anatomy="Components pin to a relative tier (sm/md/lg/xl/full) rather than hardcoding pixels, so radii stay proportional across the kit. The tiers are fixed tokens, not a runtime-adjustable knob."
        >
          <Playground examples={radiusExamples} />
        </TokenSection>

        <TokenSection
          title="Shadows"
          description="A fixed elevation preset, low to high, from the shadow() helper. Each level ships matching iOS shadow values and an Android elevation, so the three platform rows show the real per-OS rendering; choose by elevation, not by style."
        >
          <Playground examples={shadowExamples} />
        </TokenSection>

        <TokenSection
          title="Z-index reserves"
          description="Canvas keeps a deliberately shallow z-index scale. Components reach for just three levels; every overlay shares the top one rather than escalating into magic numbers. The higher zIndex paints on top, so z-50 covers z-40 covers z-10."
          anatomy="The reserves: 10 for in-component layering (input addons, button-group overlaps), 40 for an open dropdown, and 50 for every overlay (popovers, menus, selects, dialogs, command). Nothing escalates beyond 50."
        >
          <Playground examples={zIndexExamples} />
        </TokenSection>

        <TokenSection
          title="Component density"
          description="Density is a theme-level setting (compact, regular, comfy) that each component maps to its own metrics; there is no single global padding token. The Card below shows the levels: compact tightens to 16px padding and comfortable opens to 32px, bracketing the default. Set it with setDensity() on the web, or per-component density props like Card compact on native."
        >
          <Playground examples={densityExamples} />
        </TokenSection>

        <PageNav />
      </View>
    </Page>
  );
}
