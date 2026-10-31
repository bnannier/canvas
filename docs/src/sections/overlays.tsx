import { SectionVignette } from "../ui/showcase/section-vignette";
import { useState } from "react";
import { PLATFORM_COPY } from "../data/platform-copy";
import {
  ActionSheet,
  Alert,
  AlertDialog,
  Button,
  Card,
  Chip,
  Column,
  Command,
  Dialog,
  Drawer,
  Dropdown,
  Emblem,
  EmptyState,
  Grid,
  GridItem,
  Icon,
  Input,
  OverlayProvider,
  Popover,
  Progress,
  Row,
  Select,
  Skeleton,
  Spinner,
  Swatch,
  Switch,
  Toast,
  Tooltip,
  Typography,
  View,
  Wizard,
  useFormFactor,
} from "@nannier/canvas";
import { COMPONENTS } from "../core/data/components";
import { ShowcaseCard, ShowcaseGrid } from "../ui/showcase";
import { ActionSheetScene, AlertDialogScene, CommandScene, DialogScene, DrawerScene, PopoverScene, WizardScene } from "../ui/showcase/stage-scene";

// The Overlays & feedback section page (`Canvas v4.0.0 Overlays.dc.html`): its hero
// vignette and its eleven cards. The hand-off draws seven of them as stages (the card IS the
// stage: a faux page and accent orbs behind the open overlay, decision OD-1), which
// ShowcaseCard's `stage` mode draws with the scenes in ui/showcase/stage-scene.tsx. Every
// overlay is shown open in place without becoming a live modal: the Dialog, AlertDialog,
// Wizard, Drawer and ActionSheet are `embedded` specimens (no focus trap, no Escape, a dim
// that passes touches through), the bare Command is its palette panel with no trigger, and
// Toast and Popover have in-flow forms, so the page keeps its focus and scroll position. The
// Dropdown and Tooltip specimen is shown open above the phone tier only: on a phone an
// anchored overlay becomes a sheet along the bottom of the window (the kit's AO-6
// presentation), so there it stays closed.

/** The animated hero: the invite dialog at the point the loop holds it open. */
export function Vignette() {
  return <SectionVignette kind="overlays" />;
}

function DialogCard() {
  return (
    <ShowcaseCard id="c-dialog" caption="Dialog · glass-tint-dense" stage={{ height: 460, scene: <DialogScene /> }}>
      <Dialog
        open
        embedded
        icon={<Icon arrowUpRight decorative />}
        title="Publish v4.0.0 tokens?"
        description="This regenerates DESIGN.md and pushes the web hand-off CSS to every consumer overlay. Native skins are unaffected."
        confirmLabel="Publish"
        cancelLabel="Cancel"
      />
    </ShowcaseCard>
  );
}

function DrawerCard() {
  return (
    <ShowcaseCard id="c-drawer" caption="Drawer · right · 12px inset" stage={{ height: 460, scene: <DrawerScene /> }}>
      {/* An embedded Drawer is a specimen open in place: a labelled region, not a modal. */}
      <Drawer
        open
        embedded
        right
        accessibilityLabel="Invite member"
        header={(
          <Row between alignCenter>
            <Typography panelTitle>Invite member</Typography>
            <Button icon compactIcon ghost accessibilityLabel="Close" iconLeft={<Icon x size={16} decorative />} />
          </Row>
        )}
        footer={(
          <Row end snug>
            <Button ghost>Cancel</Button>
            <Button primary raised>Send invite</Button>
          </Row>
        )}
      >
        <Column padLoose relaxed>
          <Input label="Email" defaultValue="kira@ionize.io" />
          <Select label="Role" options={["Editor", "Viewer", "Admin"]} defaultValue="Editor" />
          <Switch defaultChecked description="Includes the workspace guide">Send welcome email</Switch>
        </Column>
      </Drawer>
    </ShowcaseCard>
  );
}

const noop = () => {};

function ToastCard() {
  return (
    <ShowcaseCard id="c-toast" caption={"const { toast } = useToast() · toast({ title: \"Tokens published\" }) · <ToastProvider>"}>
      <Toast
        success
        message="Tokens published"
        description="DESIGN.md regenerated · 3 consumers synced"
        action={{ label: "View", onPress: noop }}
        onDismiss={noop}
      />
      <Column snug>
        <Toast info brief message="Syncing native builds…" icon={<Spinner small />} />
        <Toast warning brief message={`${PLATFORM_COPY.samplePlatform} blur module needs a rebuild`} action={{ label: "Rebuild", onPress: noop }} />
        <Toast destructive brief message="Publish failed · contrast floor not met" action={{ label: "Details", onPress: noop }} />
      </Column>
    </ShowcaseCard>
  );
}

function AlertCard() {
  return (
    <ShowcaseCard id="c-alert" title="Alert · Empty state · Progress" meta="inline" caption="<Alert info dismissible> · <Alert destructive> · <EmptyState> · <Progress value={0.64}>">
      <Alert info dismissible title="Glass is a theming mode, not a prop" description="Use <ThemeProvider glass>; there is no per-component switch." />
      <Alert destructive title="2 tokens fail the contrast floor" description="warning-foreground on warning is 3.9:1 in light." />
      <EmptyState
        bordered
        compact
        icon={<Icon diamond size={18} decorative />}
        title="No workspaces yet"
        description="Create one to start syncing tokens across your apps."
        actionLabel="New workspace"
        onAction={noop}
      />
      <Progress value={0.64} showValue>Uploading tokens.json</Progress>
    </ShowcaseCard>
  );
}

function AlertDialogCard() {
  return (
    <ShowcaseCard id="c-alert-dialog" caption="AlertDialog · blocks until answered" stage={{ height: 460, scene: <AlertDialogScene /> }}>
      <AlertDialog
        open
        embedded
        destructive
        withInput
        confirmText="riskora"
        title="Delete “Riskora”?"
        description="24 members lose access now. Boards, tokens and history are gone for good."
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </ShowcaseCard>
  );
}

function ActionSheetCard() {
  return (
    <ShowcaseCard id="c-action-sheet" caption="ActionSheet · bottom sheet of choices" stage={{ height: 460, scene: <ActionSheetScene />, labelSubtle: true }}>
      {/* An embedded ActionSheet is a specimen open in place at the stage's foot. */}
      <ActionSheet
        open
        embedded
        title="Share “Q4 plan” with 3 people"
        actions={[
          { label: "Copy link", onPress: noop },
          { label: "Export as PDF", onPress: noop },
          { label: "Remove access", onPress: noop, destructive: true },
        ]}
      />
    </ShowcaseCard>
  );
}

const FILTER_ITEMS = [
  { label: "Active", sectionBefore: "Status", selected: true },
  { label: "Invited" },
  { label: "Suspended" },
  { label: "Sort by", icon: "listOrdered" as const, separatorBefore: true },
];

/**
 * Tooltip · Dropdown · Popover. On a phone the open Tooltip and Dropdown would present as
 * sheets over the page, so below the phone tier they stay closed.
 */
function PopoverCard() {
  const phone = useFormFactor() === "phone";
  return (
    <ShowcaseCard id="c-popover" caption="Tooltip · Dropdown · Popover" stage={{ height: 460, scene: <PopoverScene />, inset: [56, 20, 24, 20], noLabel: true }}>
      {/* The tip and menu are pinned open (no onOpenChange), so they are page content
          placed by this card-local outlet, inside the page's main landmark; a menu that
          closes on an outside tap would paint in the window's layer instead. */}
      <OverlayProvider>
        <Row grow relaxed>
          <Column fill between alignStart>
            <Row snug alignCenter>
              <Tooltip label="Filter rows" open={!phone}>
                <Dropdown
                  trigger="Filter"
                  items={FILTER_ITEMS}
                  open={!phone}
                  accessibilityLabel="Filter rows"
                />
              </Tooltip>
              <Button outline icon small accessibilityLabel="Share" iconLeft={<Icon share2 size={14} decorative />} />
            </Row>
            <Column tight>
              <Typography pageLabel mono muted>Tooltip · Dropdown</Typography>
              <Typography pageLabel mono muted>Popover</Typography>
            </Column>
          </Column>
          <Column fill end alignEnd roomy>
            <Popover inline top alignEnd title="Invite to Q4 plan" description="They get edit access to this board only.">
              <Column snug>
                <Input small placeholder="name@company.com" accessibilityLabel="Email" />
                <Button primary small block raised>Send invite</Button>
              </Column>
            </Popover>
            <Button outline small iconLeft={<Icon userPlus size={14} decorative />}>Invite</Button>
          </Column>
        </Row>
      </OverlayProvider>
    </ShowcaseCard>
  );
}

function SkeletonCard() {
  return (
    <ShowcaseCard id="c-skeleton" caption="<Skeleton> mirrors the shape it replaces · <Spinner small | large> · <Progress indeterminate> · segmented meter · spinners ignore reduced motion">
      <Card outlined well>
        <Row cozy alignCenter>
          <Skeleton avatar />
          <Column fill snug>
            <Skeleton text />
            <Skeleton text short />
          </Column>
        </Row>
        <Skeleton card />
        <Skeleton text long />
      </Card>
      <Row loose alignCenter wrap>
        <Spinner small description="small" />
        <Spinner description="default" />
        <Spinner large description="large" />
      </Row>
      <Progress indeterminate status="indeterminate">Indexing components</Progress>
      <Progress segments={8} value={0.75} status="strong">Password strength</Progress>
    </ShowcaseCard>
  );
}

function AlertVariantsCard() {
  return (
    <ShowcaseCard
      id="c-alert-variants"
      title="Alert · intents · announcement"
      meta="inline"
      caption="<Alert success> · <Alert warning> · announcement bar spans the page · for blocking prompts use AlertDialog"
    >
      <Alert
        announcement
        dismissible
        title={`Canvas v4.0.0 is live: all ${COMPONENTS.length} components on lit glass.`}
        action={{ label: "See what moved" }}
      />
      <Alert success title="Contrast checks pass" description="Every text token holds 4.5:1 on solid and tonal surfaces." />
      <Alert
        warning
        title="Glass needs verifying in the app"
        description="Contrast over glass depends on what sits behind it."
        actions={(
          <Row cozy>
            <Button plainLink>Open checklist</Button>
            <Button plainLink>Dismiss</Button>
          </Row>
        )}
      />
    </ShowcaseCard>
  );
}

const HUES = ["violet", "cyan", "mint", "rose", "amber"] as const;

function WizardCard() {
  const [hue, setHue] = useState<(typeof HUES)[number]>("violet");
  return (
    <ShowcaseCard
      id="c-wizard"
      caption="Wizard · Dialog + Steps + Button, fixed chrome around a scrolling body"
      stage={{ height: 540, grows: true, scene: <WizardScene />, chipsAt: 57, labelSubtle: true }}
    >
      {/* An embedded Wizard is a specimen open in place, non-modal; its own dim fills the stage. */}
      <Wizard
        open
        embedded
        onOpenChange={noop}
        title="New workspace"
        steps={[{ label: "Basics" }, { label: "Brand" }, { label: "Invite" }]}
        current={1}
        status="Step 2 of 3"
        previous={{ label: "Back", onPress: noop }}
        actions={<Button primary raised iconRight={<Icon arrowRight size={15} decorative />}>Continue</Button>}
      >
        <Grid minTileWidth={260} columns={2} spacious>
          <Column>
            <Column relaxed>
              <Column snug>
                <Typography label subtle>Accent hue · repaints this whole page</Typography>
                <View role="radiogroup" aria-label="Accent hue">
                  <Row comfortable alignCenter>
                    {HUES.map((name) => (
                      <Swatch key={name} small circle {...{ [name]: true }} selected={hue === name} onPress={() => setHue(name)} />
                    ))}
                  </Row>
                </View>
              </Column>
              <Column compact>
                <Typography label subtle>Workspace mark</Typography>
                <Row snug>
                  <Emblem primary label="Rk" />
                  <Emblem muted><Icon sparkles size={18} decorative /></Emblem>
                  <Emblem muted><Icon upload size={18} decorative /></Emblem>
                </Row>
              </Column>
            </Column>
          </Column>
          <Column>
            <Card sunken well>
              <Typography pageLabel mono muted>Preview</Typography>
              <Row snug alignCenter>
                <Button primary small raised>Primary</Button>
                <Chip selectable defaultSelected>Selected</Chip>
              </Row>
              <Progress value={0.62} />
            </Card>
          </Column>
        </Grid>
      </Wizard>
    </ShowcaseCard>
  );
}

function CommandCard() {
  return (
    <ShowcaseCard id="c-command" caption="<Command /> · glass-tint-dense" stage={{ minHeight: 560, pad: [48, 24], scene: <CommandScene />, scrim: true, noLabel: true }}>
      {/* The palette open in place: the bare Command is its glass panel with no trigger and
          no modal, so the page keeps its focus and scroll. */}
      <Command
        footer
        defaultActive={1}
        placeholder="Type a command or search…"
        groups={[
          {
            heading: "Navigate",
            items: [
              { label: "Go to Components", icon: "layoutGrid", shortcut: "G C" },
              { label: "Go to Foundations", icon: "layers", shortcut: "G F" },
              { label: "Open platform skins", icon: "smartphone", shortcut: "G P" },
            ],
          },
          {
            heading: "Actions",
            items: [
              { label: "Toggle color scheme", icon: "moon", shortcut: "⌘ J" },
              { label: "Shift ion hue", icon: "palette", shortcut: "⌘ H" },
              { label: "Copy component snippet", icon: "copy", shortcut: "⌘ C" },
              { label: "New workspace…", icon: "plus", shortcut: "⌘ N" },
            ],
          },
        ]}
    />
    </ShowcaseCard>
  );
}

export function Cards() {
  return (
    <ShowcaseGrid minTileWidth={420}>
      <DialogCard />
      <DrawerCard />
      <ToastCard />
      <AlertCard />
      <AlertDialogCard />
      <ActionSheetCard />
      <PopoverCard />
      <SkeletonCard />
      <AlertVariantsCard />
      <GridItem full><WizardCard /></GridItem>
      <GridItem full><CommandCard /></GridItem>
    </ShowcaseGrid>
  );
}
