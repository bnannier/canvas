import { SectionVignette } from "../ui/showcase/section-vignette";
import { useTheme, Card, Column, Grid, Icon, Row, Typography } from "@nannier/canvas";
import { buildScopes } from "../core/build-scopes";
import type { ExampleScope, PreviewScope } from "../core/scope";
import { PLATFORM_LABELS, shows } from "../core/platforms-shown";

// The Skins page (`Canvas v4.0.0 Skins.dc.html`): its hero vignette and its three device
// columns. Each column renders ONE tree (<Button primary>, <Field><Input>, <ButtonGroup
// segmented>, a Card of settings rows) through that platform's kit skins, taken from the
// same per-platform example scope the detail page's Platform skins section uses
// (docs/src/core/build-scopes), so every control is the real iOS, Material 3 or web skin
// and none is drawn by hand. The device chrome above each column (the status bar, the
// browser's address) and the mono captions are the hand-off's page copy.

type Platform = PreviewScope["platform"];

// Each column's title, metrics line and foot caption are the hand-off's copy, kept per
// platform in ../core/platforms-shown so a native app carries only its own column's.

/** The hand-off's column order: iOS, Android, Web (filtered to the platforms this build shows). */
const ORDER: readonly Platform[] = (["ios", "android", "web"] as const).filter(shows);

/** The animated hero: the platform switcher on Web, the morphing button and switch. */
export function Vignette() {
  return <SectionVignette kind="skins" />;
}

/** The device chrome over a column: a phone's status bar, or a browser's address. */
function DeviceBar({ platform }: { platform: Platform }) {
  if (platform === "web") {
    return (
      <Row between alignCenter>
        <Row tight alignCenter>
          <Icon circle size={10} muted decorative />
          <Icon circle size={10} muted decorative />
          <Icon circle size={10} muted decorative />
        </Row>
        <Typography tiny mono subtle>canvas.nannier.com</Typography>
        <Icon globe size={14} muted decorative />
      </Row>
    );
  }
  return (
    <Row between alignCenter>
      <Typography small semibold>9:41</Typography>
      <Row tight alignCenter>
        <Icon wifi size={14} muted decorative />
        <Icon batteryFull size={16} muted decorative />
      </Row>
    </Row>
  );
}

/**
 * The settings card: the glass switch over each platform's own rows. iOS lists plain
 * drill-down rows inset in the grouped section (a MediaObject per row, its trailing slot
 * the disclosure chevron, since a StackedList row always leads with an avatar); Android
 * and the web list a person under a full-width hairline.
 */
function SettingsCard({ platform, scope }: { platform: Platform; scope: ExampleScope }) {
  const { Card: SkinCard, Divider, MediaObject, StackedList, Switch: SkinSwitch } = scope;
  const glass = <SkinSwitch defaultChecked>Glass surfaces</SkinSwitch>;
  if (platform === "ios") {
    const chevron = <Icon chevronRight size={16} muted decorative />;
    return (
      <SkinCard flush>
        <Column pad>
          {glass}
          <Divider />
          <MediaObject center title="Members" meta="24" action={chevron} onPress={() => {}} />
          <Divider />
          <MediaObject center title="Integrations" action={chevron} onPress={() => {}} />
        </Column>
      </SkinCard>
    );
  }
  const person = platform === "android"
    ? { name: "Noor Park", detail: "Mobile · Active", avatar: "/noor-park.jpg" }
    : { name: "Noor Park", detail: "Mobile", avatar: "/noor-park.jpg", badge: "Active", success: true };
  return (
    <SkinCard flush>
      <Column>
        <Column pad>{glass}</Column>
        <Divider />
        <StackedList flush clickable={platform === "android"} label="People" items={[person]} />
      </Column>
    </SkinCard>
  );
}

/** One device column: the same tree rendered through one platform's skins. */
function SkinColumn({ platform, scope }: { platform: Platform; scope: ExampleScope }) {
  const { Button: SkinButton, ButtonGroup: SkinButtonGroup, Field, Input } = scope;
  const copy = PLATFORM_LABELS[platform]!.skin;
  return (
    <Card raised testID={`skins-${platform}`}>
      <Column spacious>
        <DeviceBar platform={platform} />
        <Row between alignEnd cozy wrap>
          <Typography h3 level={2}>{copy.title}</Typography>
          <Typography tiny mono subtle>{copy.meta}</Typography>
        </Row>
        <Column cozy>
          <SkinButton primary block>Save</SkinButton>
          <SkinButton secondary block>Duplicate</SkinButton>
        </Column>
        <Field label="Workspace name" helper="Shown in the sidebar and on invoices.">
          <Input placeholder="Riskora" accessibilityLabel="Workspace name" />
        </Field>
        <SkinButtonGroup segmented block defaultActive={1} items={["Day", "Week", "Month"]} accessibilityLabel="Range" />
        <SettingsCard platform={platform} scope={scope} />
        <Typography tiny mono subtle>{copy.foot}</Typography>
      </Column>
    </Card>
  );
}

/** The page's three device columns, iOS, Android and Web, side by side until they stack. */
export function Cards() {
  const { tokens } = useTheme();
  const scopes = [...buildScopes(tokens)].filter((p) => ORDER.includes(p.platform)).sort((a, b) => ORDER.indexOf(a.platform) - ORDER.indexOf(b.platform));
  return (
    <Grid minTileWidth={320} columns={3} spacious>
      {/* Each column keeps its own height (the hand-off's `align-items:start`): the bare
          Column fills the stretched cell, and the card inside it hugs its content. */}
      {scopes.map((p) => (
        <Column key={p.platform}>
          <SkinColumn platform={p.platform} scope={p.scope} />
        </Column>
      ))}
    </Grid>
  );
}
