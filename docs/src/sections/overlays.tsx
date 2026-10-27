import { useState } from "react";
import {
  ActionSheet,
  Alert,
  AlertDialog,
  Button,
  Card,
  Chip,
  Column,
  Command,
  Container,
  Dialog,
  Drawer,
  Dropdown,
  Emblem,
  EmptyState,
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
  Wizard,
  useFormFactor,
} from "@nannier/canvas";
import { COMPONENTS } from "../core/data/components";
import { PreviewViewport } from "../ui/preview-viewport";
import { ShowcaseCard, ShowcaseGrid, VignetteStage } from "../ui/showcase";

// The Overlays & feedback section page (`Canvas v4.0.0 Overlays.dc.html`): its hero
// vignette and its eleven cards. The hand-off draws every overlay open inside its card.
// Here the ones the kit can contain are shown open in place: Dialog and AlertDialog are
// contained overlays by default, Command has an embedded card, Toast and Popover have
// in-flow forms, and the Wizard opens into a docs-only overlay host the size of its card.
// The dialogs are `embedded` specimens, so the page keeps its focus and scroll position.
// Drawer and ActionSheet present through a native Modal over the whole window, so their
// cards show the trigger that opens them. The Dropdown and Tooltip specimen is shown open
// above the phone tier only: on a phone an anchored overlay becomes a sheet along the
// bottom of the window (the kit's AO-6 presentation), so there it stays closed.

/** The hero's still frame: the invite dialog at the point the loop holds it open. */
export function Vignette() {
  return (
    <VignetteStage testID="vignette-overlays">
      <Dialog
        form
        open
        embedded
        title="Invite teammates"
        description="They get edit access to this board only."
        footer={(
          <Row end snug>
            <Button ghost small>Cancel</Button>
            <Button primary small>Send invites</Button>
          </Row>
        )}
      >
        <Input label="Email" defaultValue="noor@nannier.com" />
      </Dialog>
    </VignetteStage>
  );
}

function DialogCard() {
  return (
    <ShowcaseCard id="c-dialog" caption="Dialog · glass-tint-dense">
      <Dialog
        open
        embedded
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
    <ShowcaseCard id="c-drawer" caption="Drawer · right · 12px inset">
      {/* The Drawer presents in a native Modal over the whole window, so the card holds
          its trigger rather than the open panel. */}
      <Drawer
        right
        trigger="Invite member"
        header={<Typography subheading semibold>Invite member</Typography>}
        footer={(
          <Row end snug>
            <Button ghost>Cancel</Button>
            <Button primary>Send invite</Button>
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
        <Toast warning brief message="Android blur module needs a rebuild" action={{ label: "Rebuild", onPress: noop }} />
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
    <ShowcaseCard id="c-alert-dialog" caption="AlertDialog · blocks until answered">
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
    <ShowcaseCard id="c-action-sheet" caption="ActionSheet · bottom sheet of choices">
      {/* The ActionSheet presents in a native Modal along the bottom of the window, so
          the card holds its trigger rather than the open sheet. */}
      <ActionSheet
        trigger="Share “Q4 plan”"
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
    <ShowcaseCard id="c-popover" caption="Tooltip · Dropdown · Popover">
      {/* The tip and menu are pinned open (no onOpenChange), so they are page content
          placed by this card-local outlet, inside the page's main landmark; a menu that
          closes on an outside tap would paint in the window's layer instead. */}
      <OverlayProvider>
      <Row between alignCenter>
        <Tooltip label="Filter rows" open={!phone} right>
          <Dropdown
            trigger="Filter"
            items={FILTER_ITEMS}
            open={!phone}
            accessibilityLabel="Filter rows"
          />
        </Tooltip>
        <Button outline icon small accessibilityLabel="Share" iconLeft={<Icon share2 size={14} decorative />} />
      </Row>
      <Column alignEnd>
        <Popover inline title="Invite to Q4 plan" description="They get edit access to this board only.">
          <Column snug>
            <Input placeholder="name@company.com" accessibilityLabel="Email" />
            <Button primary block>Send invite</Button>
          </Column>
        </Popover>
        <Button outline small iconLeft={<Icon userPlus size={14} decorative />}>Invite</Button>
      </Column>
      </OverlayProvider>
    </ShowcaseCard>
  );
}

function SkeletonCard() {
  return (
    <ShowcaseCard id="c-skeleton" caption="<Skeleton> mirrors the shape it replaces · <Spinner small | large> · <Progress indeterminate> · segmented meter · spinners ignore reduced motion">
      <Card flat>
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
      <Row relaxed alignCenter wrap>
        <Spinner small description="small" />
        <Spinner description="default" />
        <Spinner large description="large" />
      </Row>
      <Progress indeterminate description="indeterminate">Indexing components</Progress>
      <Progress segments={8} value={0.75} description="strong">Password strength</Progress>
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
        info
        dismissible
        icon={<Icon sparkles size={16} decorative />}
        title={`Canvas v4.0.0 is live: all ${COMPONENTS.length} components on lit glass.`}
        actions={<Button link small>See what moved</Button>}
      />
      <Alert success title="Contrast checks pass" description="Every text token holds 4.5:1 on solid and tonal surfaces." />
      <Alert
        warning
        title="Glass needs verifying in the app"
        description="Contrast over glass depends on what sits behind it."
        actions={(
          <Row snug>
            <Button ghost small>Open checklist</Button>
            <Button ghost small>Dismiss</Button>
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
    <ShowcaseCard id="c-wizard" caption="Wizard · Dialog + Steps + Button, fixed chrome around a scrolling body">
      {/* The Wizard is an overlay form: a docs-only host the card's size keeps it here. */}
      <PreviewViewport height={460}>
        <OverlayProvider>
          <Wizard
            open
            embedded
            onOpenChange={noop}
            title="New workspace"
            steps={[{ label: "Basics" }, { label: "Brand" }, { label: "Invite" }]}
            current={1}
            status="Step 2 of 3"
            previous={{ label: "Back", onPress: noop }}
            actions={<Button primary iconRight={<Icon arrowRight size={16} decorative />}>Continue</Button>}
          >
            <Row stacks stackBreakpoint="sm" relaxed>
              <Column span={6}>
                <Column relaxed>
                  <Column snug>
                    <Typography small medium>Accent hue · repaints this whole page</Typography>
                    <Row snug>
                      {HUES.map((name) => (
                        <Swatch key={name} circle large {...{ [name]: true }} selected={hue === name} onPress={() => setHue(name)} />
                      ))}
                    </Row>
                  </Column>
                  <Column snug>
                    <Typography small medium>Workspace mark</Typography>
                    <Row snug>
                      <Emblem primary label="Rk" />
                      <Emblem muted><Icon sparkles size={18} decorative /></Emblem>
                      <Emblem muted><Icon upload size={18} decorative /></Emblem>
                    </Row>
                  </Column>
                </Column>
              </Column>
              <Column span={6}>
                <Card flat>
                  <Typography eyebrow subtle>Preview</Typography>
                  <Row snug alignCenter>
                    <Button primary small>Primary</Button>
                    <Chip selectable defaultSelected>Selected</Chip>
                  </Row>
                  <Progress value={0.62} />
                </Card>
              </Column>
            </Row>
          </Wizard>
        </OverlayProvider>
      </PreviewViewport>
    </ShowcaseCard>
  );
}

function CommandCard() {
  return (
    <ShowcaseCard id="c-command" caption="<Command /> · glass-tint-dense">
      <Container md>
        <Command
          embedded
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
      </Container>
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
