import type { ReactNode } from "react";
import { PLATFORM_COPY } from "../data/platform-copy";
import {
  Avatar,
  AvatarGroup,
  AvatarMenu,
  Badge,
  BadgeGroup,
  Button,
  ButtonGroup,
  Card,
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
import { ShowcaseCard, ShowcaseGrid, VignetteStage } from "../ui/showcase";

// The Controls section page (`Canvas v4.0.0 Controls.dc.html`): its hero vignette and its
// seven cards, composed of live kit controls with the hand-off's copy. Where the kit has
// no prop for something the hand-off draws (a rounded Button, a Slider's scale labels, a
// Radio card's icon, an avatar's presence dot) the card shows what the kit has, and the
// difference is recorded in the Phase 5 report rather than drawn by hand here.

/** A bundled sample photo, resolved for the platform (docs/src/core/photos.ts). */
const photo = (path: string) => resolvePhoto(path) as string | number | undefined;

/** The hero's still frame: the vignette's panel in the reference image's state. */
export function Vignette() {
  return (
    <VignetteStage>
      <Card raised>
        <Column cozy>
          <Switch description="Frost on every pane">Glass surfaces</Switch>
          <Divider />
          <Slider defaultValue={0}>Glass intensity</Slider>
          <Divider />
          <Row between alignCenter cozy>
            <Checkbox>Release notes</Checkbox>
            <Button primary small>Save</Button>
          </Row>
        </Column>
      </Card>
    </VignetteStage>
  );
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

function IntentButton({ intent, loading, disabled }: { intent: Intent; loading?: boolean; disabled?: boolean }) {
  const copy = LABELS[intent];
  return (
    <Button
      {...{ [intent]: true }}
      loading={loading}
      disabled={disabled}
      iconRight={intent === "link" && !loading ? <Icon arrowRight size={14} decorative /> : undefined}
    >
      {loading ? copy.loading : copy.label}
    </Button>
  );
}

/** The matrix's row label: the intent's prop name in the mono face. */
const rowLabel = (intent: Intent) => <Typography caption mono muted>{intent}</Typography>;

/** The pinned interaction columns: each cell pins its own state (InteractionOverride). */
function Pinned({ hovered, pressed, children }: { hovered?: boolean; pressed?: boolean; children: ReactNode }) {
  return <InteractionOverride hovered={hovered} pressed={pressed}>{children}</InteractionOverride>;
}

/** Button · Intents × states: every intent at rest, hovered, pressed, loading and disabled. */
function ButtonMatrix() {
  const column = (label: string) => ({ label, minWidth: 188 });
  return (
    <ShowcaseCard id="c-button" caption="<Button primary> · <Button secondary loading> · <Button destructive disabled> · <Button link>">
      <DataTable
        attached
        columns={[{ label: "", width: 124 }, column("default"), column("hover"), column("pressed"), column("loading"), column("disabled")]}
        rows={INTENTS.map((intent) => [
          rowLabel(intent),
          <IntentButton key="default" intent={intent} />,
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
function ButtonSizes() {
  return (
    <ShowcaseCard id="c-button-sizes" caption="<Button small> · <Button large> · <Button icon> · <ButtonGroup> · <Button block>">
      <Row wrap cozy alignCenter>
        <Button primary small>Small</Button>
        <Button primary>Default</Button>
        <Button primary large>Large</Button>
      </Row>
      <Row wrap cozy alignCenter>
        <Button outline small icon accessibilityLabel="Add" iconLeft={<Icon plus size={14} decorative />} />
        <Button outline icon accessibilityLabel="Add" iconLeft={<Icon plus size={16} decorative />} />
        <Button primary large icon accessibilityLabel="Add" iconLeft={<Icon plus primaryForeground size={18} decorative />} />
      </Row>
      <ButtonGroup defaultActive={-1} items={["Left", "Center", "Right"]} />
      <Button outline block>Block · full width</Button>
    </ShowcaseCard>
  );
}

/** Switch · Checkbox · Radio. */
function Toggles() {
  return (
    <ShowcaseCard id="c-switch" caption={"<Switch description=\"…\">Glass surfaces</Switch> · <Checkbox indeterminate> · <RadioGroup> + <Radio>"}>
      <Column cozy>
        <Switch defaultChecked description="Liquid Glass on iOS 26, frost elsewhere">Glass surfaces</Switch>
        <Divider />
        <Switch description="Zero every duration, keep spinners">Reduced motion</Switch>
        <Divider />
        <Switch defaultChecked>Haptics</Switch>
      </Column>
      <Divider />
      <Column snug>
        <Checkbox defaultChecked description="Get notified when activity happens.">Email notifications</Checkbox>
        <Checkbox>Weekly digest</Checkbox>
        <Checkbox indeterminate description="Indeterminate → off → mixed → on">Select all teams</Checkbox>
      </Column>
      <Divider />
      <RadioGroup defaultValue="stable">
        <Radio value="stable" description="3.0.0">Stable</Radio>
        <Radio value="beta" description="3.1.0-beta.2">Beta</Radio>
        <Radio value="canary" description="nightly">Canary</Radio>
      </RadioGroup>
    </ShowcaseCard>
  );
}

/** Slider · Stepper. */
function SliderStepper() {
  return (
    <ShowcaseCard id="c-slider" caption="<Slider value={62} step={1}> · <Stepper min={0} max={99}>">
      <Slider defaultValue={62} step={1} showValue>Glass intensity</Slider>
      <Stepper label="Spacing" description="× 4px" defaultValue={2} min={0} max={99} />
    </ShowcaseCard>
  );
}

const MENU_ITEMS = [
  { label: "Profile", icon: "user" as const },
  { label: "Settings", icon: "settings" as const },
  { label: "Sign out", icon: "logOut" as const, destructive: true, separatorBefore: true },
];

/** Avatar · Badge · Chip. */
function Identity() {
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
          <Chip selectable defaultSelected>iOS</Chip>
          <Chip selectable>{PLATFORM_COPY.samplePlatform}</Chip>
          <Chip selectable defaultSelected>Web</Chip>
        </Row>
        <Chip icon={<Avatar tiny src={photo("/noor-park.jpg")} name="Noor Park" />} onRemove={() => {}}>Noor Park</Chip>
      </Column>
      <Divider />
      <Column snug>
        <Row wrap relaxed alignCenter>
          <Kbd keys="⌘ K" />
          <Kbd keys="⇧ ⌘ P" />
          <Kbd>esc</Kbd>
          <Kbd>↵</Kbd>
        </Row>
        <Typography caption subtle right>Kbd · keycaps read as one unit</Typography>
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
        />
        <Typography caption mono subtle>AvatarMenu</Typography>
      </Column>
      <Row wrap cozy alignCenter>
        <Button outline icon count={3} accessibilityLabel="Notifications, 3 unread" iconLeft={<Icon bell size={16} decorative />} />
        <Button outline icon accessibilityLabel="Inbox" iconLeft={<Icon inbox size={16} decorative />} />
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
function Groups() {
  return (
    <ShowcaseCard id="c-button-group" caption="<ButtonGroup segmented> · <ButtonGroup split> · attached groups share one hairline and one recess">
      <ButtonGroup
        segmented
        block
        defaultActive={0}
        accessibilityLabel="View"
        items={[{ label: "List", icon: "layoutList" }, { label: "Grid", icon: "layoutGrid" }, { label: "Board", icon: "columns2" }]}
      />
      <Row wrap cozy alignCenter>
        <ButtonGroup split items={[{ label: "Deploy", icon: "rocket" }]} menu={["Deploy to preview", "Deploy to production", "Schedule…"]} />
        <ButtonGroup segmented defaultActive={0} accessibilityLabel="Text style" items={["B", "I", "U"]} />
      </Row>
      <ButtonGroup stepper active={1} items={["50%", "100%", "200%"]} />
    </ShowcaseCard>
  );
}

/** Radio · card style · inline. */
function Radios() {
  return (
    <ShowcaseCard id="c-radio" caption="<RadioGroup> stacked by default · card style for richer choices · inline for two to three short options">
      <RadioGroup row defaultValue="stable">
        <Radio card value="stable" description="3.0.0">Stable</Radio>
        <Radio card value="beta" description="3.1.0-beta.2">Beta</Radio>
        <Radio card value="canary" description="nightly">Canary</Radio>
      </RadioGroup>
      <Row wrap cozy alignCenter>
        <RadioGroup row label="Digest" defaultValue="weekly">
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
