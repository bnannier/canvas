import { SectionVignette } from "../ui/showcase/section-vignette";
import { useEffect, useState, type ReactNode } from "react";
import { PLATFORM_COPY } from "../data/platform-copy";
import {
  Avatar,
  AvatarGroup,
  AvatarMenu,
  Badge,
  BadgeGroup,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  Column,
  DataTable,
  Divider,
  GridItem,
  Icon,
  InteractionOverride,
  Kbd,
  Radio,
  RadioGroup,
  Row,
  Slider,
  Stepper,
  Switch,
  Typography,
} from "@nannier/canvas";
import { resolvePhoto } from "../core/photos";
import { ShowcaseCard, ShowcaseGrid } from "../ui/showcase";
import { useShowcaseDemo } from "../ui/showcase/demo";

// The Controls section page (`Canvas v4.0.0 Controls.dc.html`): its hero vignette and its
// seven cards, composed of live kit controls with the hand-off's copy. Where the kit has
// no prop for something the hand-off draws (a rounded Button, a Slider's scale labels, a
// Radio card's icon, an avatar's presence dot) the card shows what the kit has, and the
// difference is recorded in the Phase 5 report rather than drawn by hand here.

/** A bundled sample photo, resolved for the platform (docs/src/core/photos.ts). */
const photo = (path: string) => resolvePhoto(path) as string | number | undefined;

/** The animated hero: the vignette's panel in the reference image's state. */
export function Vignette() {
  return <SectionVignette kind="controls" />;
}

const INTENTS = ["primary", "secondary", "outline", "ghost", "destructive", "link"] as const;
type Intent = (typeof INTENTS)[number];

/** Each intent's label at rest and while loading (the hand-off's matrix copy). */
const LABELS: Record<Intent, { label: string; loading: string }> = {
  primary: { label: "Save changes", loading: "Saving…" },
  secondary: { label: "Duplicate", loading: "Duplicating…" },
  outline: { label: "Preview", loading: "Loading…" },
  ghost: { label: "Cancel", loading: "Cancelling…" },
  destructive: { label: "Delete workspace", loading: "Deleting…" },
  link: { label: "Learn more", loading: "Opening…" },
};

function IntentButton({ intent, loading, disabled, saved, onPress, testID }: {
  intent: Intent;
  loading?: boolean;
  disabled?: boolean;
  saved?: boolean;
  onPress?: () => void;
  testID?: string;
}) {
  const copy = LABELS[intent];
  const trailing = saved ? <Icon check size={14} decorative /> : intent === "link" && !loading ? <Icon arrowRight size={14} decorative /> : undefined;
  return (
    <Button
      {...{ [intent]: true }}
      loading={loading}
      disabled={disabled}
      iconRight={trailing}
      onPress={onPress}
      testID={testID}
    >
      {loading ? copy.loading : saved ? "Saved" : copy.label}
    </Button>
  );
}

/** The matrix's row label: the intent's prop name in the mono face. */
const rowLabel = (intent: Intent) => <Typography codeLabel mono>{intent}</Typography>;

/** The pinned interaction columns: each cell pins its own state (InteractionOverride). */
function Pinned({ hovered, pressed, children }: { hovered?: boolean; pressed?: boolean; children: ReactNode }) {
  return <InteractionOverride hovered={hovered} pressed={pressed}>{children}</InteractionOverride>;
}

/** Button · Intents × states: every intent at rest, hovered, pressed, loading and disabled. */
const SAVE_FRAMES = ["idle", "idle", "saving", "saved", "saved"] as const;
type SavePhase = (typeof SAVE_FRAMES)[number];

function ButtonMatrix() {
  const { value, stop } = useShowcaseDemo("c-button", SAVE_FRAMES, { interval: 780 });
  const [manualSave, setManualSave] = useState<SavePhase>();
  const save = manualSave ?? value;
  useEffect(() => {
    if (manualSave !== "saving") return;
    const timer = setTimeout(() => setManualSave("saved"), 700);
    return () => clearTimeout(timer);
  }, [manualSave]);
  const column = (label: string) => ({ label, minWidth: 188 });
  return (
    <ShowcaseCard id="c-button" caption="<Button primary> · <Button secondary loading> · <Button destructive disabled> · <Button link>">
      <DataTable
        attached
        columns={[{ label: "", width: 124 }, column("default"), column("hover"), column("pressed"), column("loading"), column("disabled")]}
        rows={INTENTS.map((intent) => [
          rowLabel(intent),
          <IntentButton key="default" intent={intent} loading={intent === "primary" && save === "saving"}
            saved={intent === "primary" && save === "saved"}
            testID={intent === "primary" ? "section-demo-save-button" : undefined}
            onPress={intent === "primary" ? () => { stop(); setManualSave("saving"); } : stop} />,
          <Pinned key="hover" hovered><IntentButton intent={intent} /></Pinned>,
          <Pinned key="pressed" pressed><IntentButton intent={intent} /></Pinned>,
          <IntentButton key="loading" intent={intent} loading />,
          <IntentButton key="disabled" intent={intent} disabled />,
        ])}
      />
    </ShowcaseCard>
  );
}

/** Button · Sizes & shapes. */
const SIZE_FRAMES = [-1, 0, 1, 2, 1] as const;

function ButtonSizes() {
  const { value, setValue, stop } = useShowcaseDemo<number>("c-button-sizes", SIZE_FRAMES, { interval: 1050 });
  return (
    <ShowcaseCard id="c-button-sizes" caption="<Button small> · <Button large> · <Button icon> · <ButtonGroup> · <Button block>">
      <Row wrap cozy alignCenter>
        <Button primary small onPress={stop}>Small</Button>
        <Button primary onPress={stop}>Default</Button>
        <Button primary large onPress={stop}>Large</Button>
      </Row>
      <Row wrap cozy alignCenter>
        <Button outline small icon accessibilityLabel="Add" iconLeft={<Icon plus size={14} decorative />} onPress={stop} />
        <Button outline icon accessibilityLabel="Add" iconLeft={<Icon plus size={16} decorative />} onPress={stop} />
        <Button primary large icon accessibilityLabel="Add" iconLeft={<Icon plus primaryForeground size={18} decorative />} onPress={stop} />
      </Row>
      <ButtonGroup active={value} onSelect={setValue} items={["Left", "Center", "Right"]} accessibilityLabel="Alignment" testID="section-demo-alignment" />
      <Button outline block onPress={stop}>Block · full width</Button>
    </ShowcaseCard>
  );
}

/** Switch · Checkbox · Radio. */
type ToggleFrame = {
  glass: boolean;
  reducedMotion: boolean;
  haptics: boolean;
  email: boolean;
  digest: boolean;
  teams: boolean | "mixed";
  channel: string | number;
};
const TOGGLE_FRAMES: ToggleFrame[] = [
  { glass: true, reducedMotion: false, haptics: true, email: true, digest: false, teams: "mixed", channel: "stable" },
  { glass: false, reducedMotion: false, haptics: true, email: true, digest: true, teams: false, channel: "beta" },
  { glass: false, reducedMotion: true, haptics: false, email: false, digest: true, teams: "mixed", channel: "beta" },
  { glass: true, reducedMotion: true, haptics: false, email: true, digest: true, teams: true, channel: "canary" },
  { glass: true, reducedMotion: false, haptics: true, email: true, digest: false, teams: true, channel: "stable" },
];

function Toggles() {
  const { value, setValue } = useShowcaseDemo("c-switch", TOGGLE_FRAMES, { interval: 1150 });
  const update = <K extends keyof ToggleFrame>(key: K) => (next: ToggleFrame[K]) => setValue((current) => ({ ...current, [key]: next }));
  return (
    <ShowcaseCard id="c-switch" caption={"<Switch description=\"…\">Glass surfaces</Switch> · <Checkbox indeterminate> · <RadioGroup> + <Radio>"}>
      <Column cozy>
        <Switch checked={value.glass} onChange={update("glass")} testID="section-demo-glass-switch" description="Liquid Glass on iOS 26, frost elsewhere">Glass surfaces</Switch>
        <Divider />
        <Switch checked={value.reducedMotion} onChange={update("reducedMotion")} description="Zero every duration, keep spinners">Reduced motion</Switch>
        <Divider />
        <Switch checked={value.haptics} onChange={update("haptics")}>Haptics</Switch>
      </Column>
      <Divider />
      <Column snug>
        <Checkbox checked={value.email} onChange={update("email")} description="Get notified when activity happens.">Email notifications</Checkbox>
        <Checkbox checked={value.digest} onChange={update("digest")}>Weekly digest</Checkbox>
        <Checkbox selection indeterminate={value.teams === "mixed"} checked={value.teams === true} onChange={update("teams")} description="Indeterminate → off → mixed → on">Select all teams</Checkbox>
      </Column>
      <Divider />
      <RadioGroup value={value.channel} onChange={update("channel")}>
        <Radio value="stable" description="3.0.0">Stable</Radio>
        <Radio value="beta" description="3.1.0-beta.2">Beta</Radio>
        <Radio value="canary" description="nightly">Canary</Radio>
      </RadioGroup>
    </ShowcaseCard>
  );
}

/** Slider · Stepper. */
const SLIDER_FRAMES = [
  { intensity: 62, spacing: 2 }, { intensity: 62, spacing: 2 },
  { intensity: 68, spacing: 2 }, { intensity: 78, spacing: 3 }, { intensity: 88, spacing: 4 },
  { intensity: 92, spacing: 5 }, { intensity: 92, spacing: 6 }, { intensity: 92, spacing: 6 },
  { intensity: 86, spacing: 6 }, { intensity: 72, spacing: 5 }, { intensity: 56, spacing: 4 },
  { intensity: 42, spacing: 3 }, { intensity: 36, spacing: 2 }, { intensity: 36, spacing: 2 },
  { intensity: 42, spacing: 2 }, { intensity: 54, spacing: 2 },
];

function SliderStepper() {
  const { value, setValue } = useShowcaseDemo("c-slider", SLIDER_FRAMES, { interval: 310 });
  return (
    <ShowcaseCard id="c-slider" caption="<Slider value={62} step={1}> · <Stepper min={0} max={99}>">
      <Slider value={value.intensity} onChange={(intensity) => setValue((current) => ({ ...current, intensity }))} step={1} showValue testID="section-demo-glass-intensity">Glass intensity</Slider>
      <Stepper label="Spacing" description="× 4px" value={value.spacing} onChange={(spacing) => setValue((current) => ({ ...current, spacing }))} min={0} max={99} testID="section-demo-spacing" />
    </ShowcaseCard>
  );
}

const MENU_ITEMS = [
  { label: "Profile", icon: "user" as const },
  { label: "Settings", icon: "settings" as const },
  { label: "Sign out", icon: "logOut" as const, destructive: true, separatorBefore: true },
];

/** Avatar · Badge · Chip. */
const IDENTITY_FRAMES = [
  { ios: true, mobile: false, web: true, member: true, unread: 3 },
  { ios: true, mobile: true, web: true, member: true, unread: 4 },
  { ios: false, mobile: true, web: true, member: true, unread: 5 },
  { ios: false, mobile: true, web: false, member: false, unread: 5 },
  { ios: true, mobile: false, web: true, member: false, unread: 0 },
];

function Identity() {
  const { value, setValue, stop } = useShowcaseDemo("c-avatar", IDENTITY_FRAMES, { interval: 1180 });
  const markRead = () => setValue((current) => ({ ...current, unread: 0 }));
  return (
    <ShowcaseCard
      id="c-avatar"
      caption="<Avatar large> · <AvatarGroup> · <AvatarMenu> · <BadgeGroup> · <NotificationBadge> · <Badge status success> · <Badge outline> · <Badge mono> · <Chip onPress> · <Chip onRemove> · <Kbd>"
    >
      <Row wrap relaxed alignCenter>
        <Avatar tiny src={photo("/ada-lovelace.jpg")} name="Ada Lovelace" />
        <Avatar small src={photo("/grace-hopper.jpg")} name="Grace Hopper" />
        <Avatar src={photo("/liang-bao.jpg")} name="Liang Bao" />
        <Avatar large name="BN" />
        <Avatar rounded name="KT" />
      </Row>
      <AvatarGroup max={3} total={12}>
        <Avatar src={photo("/kira-tanaka.jpg")} name="Kira Tanaka" />
        <Avatar src={photo("/noor-park.jpg")} name="Noor Park" />
        <Avatar src={photo("/marcus-allen.jpg")} name="Marcus Allen" />
      </AvatarGroup>
      <Divider />
      <BadgeGroup>
        <Badge secondary>Neutral</Badge>
        <Badge soft>Beta</Badge>
        <Badge status success>Active</Badge>
        <Badge status warning>Pending</Badge>
        <Badge status error>Failed</Badge>
        <Badge default>New</Badge>
        <Badge notification solid>12</Badge>
        <Badge outline>Outline</Badge>
        <Badge mono>--ion-soft</Badge>
      </BadgeGroup>
      <Divider />
      <Column snug>
        <Row wrap snug>
          <Chip selectable selected={value.ios} onSelectedChange={(ios) => setValue((current) => ({ ...current, ios }))}>iOS</Chip>
          <Chip selectable selected={value.mobile} onSelectedChange={(mobile) => setValue((current) => ({ ...current, mobile }))}>{PLATFORM_COPY.samplePlatform}</Chip>
          <Chip selectable selected={value.web} onSelectedChange={(web) => setValue((current) => ({ ...current, web }))}>Web</Chip>
        </Row>
        {value.member ? (
          <Chip icon={<Avatar tiny src={photo("/noor-park.jpg")} name="Noor Park" />} onRemove={() => setValue((current) => ({ ...current, member: false }))}>Noor Park</Chip>
        ) : (
          <Chip icon={<Icon plus size={14} decorative />} onPress={() => setValue((current) => ({ ...current, member: true }))}>Restore Noor Park</Chip>
        )}
      </Column>
      <Divider />
      <Column snug>
        <Row wrap relaxed alignCenter>
          <Kbd keys="⌘ K" />
          <Kbd keys="⇧ ⌘ P" />
          <Kbd>esc</Kbd>
          <Kbd>↵</Kbd>
        </Row>
        <Typography inlineNote right>Kbd · keycaps read as one unit</Typography>
      </Column>
      <Divider />
      <Column snug>
        {/* Shown closed: the kit's open menu is an anchored overlay, which would cover the
            card's next rows (and present as a sheet on a phone). */}
        <AvatarMenu
          compact
          alignStart
          name="Liang Bao"
          email="liang@ionize.io"
          src={photo("/liang-bao.jpg") as string | undefined}
          items={MENU_ITEMS}
          onOpenChange={stop}
        />
        <Typography caption mono subtle>AvatarMenu</Typography>
      </Column>
      <Row wrap cozy alignCenter>
        <Button outline icon count={value.unread} accessibilityLabel={`Notifications, ${value.unread} unread`} iconLeft={<Icon bell size={16} decorative />} onPress={markRead} testID="section-demo-notification-count" />
        <Button outline icon accessibilityLabel="Inbox" iconLeft={<Icon inbox size={16} decorative />} onPress={markRead} />
        <Typography caption mono subtle>NotificationBadge</Typography>
      </Row>
      <Row wrap cozy alignCenter>
        <BadgeGroup>
          <Badge secondary>iOS</Badge>
          <Badge secondary>{PLATFORM_COPY.samplePlatform}</Badge>
          <Badge secondary>Web</Badge>
        </BadgeGroup>
        <Typography caption mono subtle>BadgeGroup</Typography>
      </Row>
    </ShowcaseCard>
  );
}

/** ButtonGroup · segmented · split. */
const GROUP_FRAMES = [
  { view: 0, format: 0 }, { view: 1, format: 0 },
  { view: 1, format: 1 }, { view: 2, format: 1 },
  { view: 2, format: 2 }, { view: 0, format: 2 },
];

function Groups() {
  const { value, setValue, stop } = useShowcaseDemo("c-button-group", GROUP_FRAMES, { interval: 975 });
  const [deployment, setDeployment] = useState("");
  const deploy = (_index: number, action: string) => {
    stop();
    setDeployment(action === "Schedule…" ? "Scheduled" : "Deployed");
  };
  return (
    <ShowcaseCard id="c-button-group" caption="<ButtonGroup segmented> · <ButtonGroup split> · attached groups share one hairline and one recess">
      <ButtonGroup
        segmented
        block
        active={value.view}
        onSelect={(view) => setValue((current) => ({ ...current, view }))}
        accessibilityLabel="View"
        testID="section-demo-view-group"
        items={[{ label: "List", icon: "layoutList" }, { label: "Grid", icon: "layoutGrid" }, { label: "Board", icon: "columns2" }]}
      />
      <Row wrap cozy alignCenter>
        <ButtonGroup split items={[{ label: deployment || "Deploy", icon: deployment ? "check" : "rocket" }]} menu={["Deploy to preview", "Deploy to production", "Schedule…"]} onSelect={deploy} />
        <ButtonGroup segmented active={value.format} onSelect={(format) => setValue((current) => ({ ...current, format }))} accessibilityLabel="Text style" items={["B", "I", "U"]} />
      </Row>
      <ButtonGroup stepper defaultActive={1} items={["50%", "100%", "200%"]} onSelect={stop} />
    </ShowcaseCard>
  );
}

/** Radio · card style · inline. */
const RADIO_FRAMES: { channel: string | number; digest: string | number }[] = [
  { channel: "stable", digest: "weekly" },
  { channel: "beta", digest: "weekly" },
  { channel: "canary", digest: "daily" },
  { channel: "stable", digest: "daily" },
];

function Radios() {
  const { value, setValue } = useShowcaseDemo("c-radio", RADIO_FRAMES, { interval: 1350 });
  return (
    <ShowcaseCard id="c-radio" caption="<RadioGroup> stacked by default · card style for richer choices · inline for two to three short options">
      <RadioGroup row value={value.channel} onChange={(channel) => setValue((current) => ({ ...current, channel }))}>
        <Radio card value="stable" description="3.0.0">Stable</Radio>
        <Radio card value="beta" description="3.1.0-beta.2">Beta</Radio>
        <Radio card value="canary" description="nightly">Canary</Radio>
      </RadioGroup>
      <Row wrap cozy alignCenter>
        <RadioGroup row label="Digest" value={value.digest} onChange={(digest) => setValue((current) => ({ ...current, digest }))}>
          <Radio value="daily">Daily</Radio>
          <Radio value="weekly">Weekly</Radio>
        </RadioGroup>
        <Badge status success>default</Badge>
      </Row>
    </ShowcaseCard>
  );
}

export function Cards() {
  return (
    <ShowcaseGrid minTileWidth={340}>
      {/* The full-width card (the hand-off's `grid-column: 1 / -1`). */}
      <GridItem full><ButtonMatrix /></GridItem>
      <ButtonSizes />
      <Toggles />
      <SliderStepper />
      <Identity />
      <Groups />
      <Radios />
    </ShowcaseGrid>
  );
}
