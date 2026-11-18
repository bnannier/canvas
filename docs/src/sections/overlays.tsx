import { SectionVignette } from "../ui/showcase/section-vignette";
import { useRef, useState, type ReactNode } from "react";
import Animated, { FadeInDown, FadeInRight, FadeOutDown, FadeOutRight } from "react-native-reanimated";
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
  Image,
  Input,
  MediaObject,
  OverlayProvider,
  Popover,
  Progress,
  Row,
  Select,
  Skeleton,
  Spinner,
  Swatch,
  Switch,
  ThemeProvider,
  Toast,
  Tooltip,
  Typography,
  View,
  Wizard,
  useFormFactor,
  useReducedMotion,
  useTheme,
} from "@nannier/canvas";
import { EscapeParticipation } from "../../../src/style/escape-layer";
import { COMPONENTS } from "../core/data/components";
import { useHydrated } from "../lib/hydrated";
import { ShowcaseCard, ShowcaseGrid } from "../ui/showcase";
import { useShowcaseDemo } from "../ui/showcase/demo";
import { ActionSheetScene, AlertDialogScene, CommandScene, DialogScene, DrawerScene, PopoverScene, WizardScene } from "../ui/showcase/stage-scene";

// The Overlays & feedback section page (`Canvas v4.0.0 Overlays.dc.html`): its hero
// vignette and its eleven cards. The hand-off draws seven of them as stages (the card IS the
// stage: a faux page and accent orbs behind the open overlay, decision OD-1), which
// ShowcaseCard's `stage` mode draws with the scenes in ui/showcase/stage-scene.tsx. Every
// overlay stays in place without becoming a live modal: the Dialog, AlertDialog,
// Wizard, Drawer and ActionSheet are `embedded` specimens (no focus trap, no Escape, a dim
// that passes touches through), the bare Command is its palette panel with no trigger, and
// Toast and Popover have in-flow forms, so the page keeps its focus and scroll position. The
// Dropdown and Tooltip stay pinned in the stage's local outlet during the demonstration.

/** The animated hero: the invite dialog at the point the loop holds it open. */
export function Vignette() {
  return <SectionVignette kind="overlays" />;
}

const RISE_IN = FadeInDown.duration(290);
const RISE_OUT = FadeOutDown.duration(200);
const SIDE_IN = FadeInRight.duration(310);
const SIDE_OUT = FadeOutRight.duration(220);

/** Move only the embedded specimen; the scene and its component links stay still. */
function StageMotion({ children, side = false, fill = false }: { children: ReactNode; side?: boolean; fill?: boolean }) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  // Reanimated hides an entering view in server markup, but a browser that
  // reduces motion skips the entrance that would make that markup visible.
  const animate = hydrated && !reduced;
  return (
    <Animated.View
      collapsable={false}
      entering={animate ? (side ? SIDE_IN : RISE_IN) : undefined}
      exiting={animate ? (side ? SIDE_OUT : RISE_OUT) : undefined}
      style={fill ? { flexGrow: 1 } : undefined}
    >
      {children}
    </Animated.View>
  );
}

function ReplayOverlay({ label, result, onPress }: { label: string; result: string; onPress: () => void }) {
  return (
    <Column grow center alignCenter cozy>
      {result ? <Typography small muted>{result}</Typography> : null}
      <Button small outline onPress={onPress}>{label}</Button>
    </Column>
  );
}

const DIALOG_REST = { open: true, result: "" };
const DIALOG_FRAMES = [DIALOG_REST, DIALOG_REST, { open: false, result: "Tokens published" }, DIALOG_REST];
const INVITE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function DialogCard() {
  const demo = useShowcaseDemo("c-dialog", DIALOG_FRAMES, { interval: 1650 });
  return (
    <ShowcaseCard id="c-dialog" caption="Dialog · glass-tint-dense" stage={{ height: 460, scene: <DialogScene /> }}>
      {demo.value.open ? (
        <StageMotion fill>
          <Dialog
            open={demo.value.open}
            embedded
            testID="demo-publish-dialog"
            icon={<Icon arrowUpRight decorative />}
            title="Publish v4.0.0 tokens?"
            description="This regenerates DESIGN.md and pushes the web hand-off CSS to every consumer overlay. Native skins are unaffected."
            confirmLabel="Publish"
            cancelLabel="Cancel"
            onConfirm={() => demo.setValue({ open: false, result: "Tokens published" })}
            onCancel={() => demo.setValue({ open: false, result: "Publish canceled" })}
          />
        </StageMotion>
      ) : <ReplayOverlay label="Review publish" result={demo.value.result} onPress={() => demo.setValue(DIALOG_REST)} />}
    </ShowcaseCard>
  );
}

const DRAWER_REST = { open: true, email: "kira@ionize.io", role: "Editor", welcome: true, result: "" };
const DRAWER_FRAMES = [
  DRAWER_REST,
  { ...DRAWER_REST, email: "noor@ionize.io" },
  { ...DRAWER_REST, email: "noor@ionize.io", role: "Viewer", welcome: false },
  { ...DRAWER_REST, open: false, result: "Invitation sent to noor@ionize.io" },
];

function DrawerCard() {
  const demo = useShowcaseDemo("c-drawer", DRAWER_FRAMES, { interval: 1250 });
  const { open, email, role, welcome, result } = demo.value;
  const close = () => demo.setValue((current) => ({ ...current, open: false }));
  const valid = INVITE_EMAIL.test(email.trim());
  return (
    <ShowcaseCard id="c-drawer" caption="Drawer · right · 12px inset" stage={{ height: 460, scene: <DrawerScene /> }}>
      {open ? (
        <StageMotion fill side>
          <OverlayProvider viewport>
            <Drawer
              open={open}
              embedded
              right
              testID="demo-invite-drawer"
              accessibilityLabel="Invite member"
              header={(
                <Row between alignCenter>
                  <Typography panelTitle>Invite member</Typography>
                  <Button icon compactIcon ghost accessibilityLabel="Close" iconLeft={<Icon x size={16} decorative />} onPress={close} />
                </Row>
              )}
              footer={(
                <Row end snug wrap>
                  <Button ghost onPress={close}>Cancel</Button>
                  <Button primary raised disabled={!valid} onPress={() => demo.setValue((current) => ({
                    ...current, open: false, result: `Invitation sent to ${current.email.trim()}`,
                  }))}>Send invite</Button>
                </Row>
              )}
            >
              <Column padLoose relaxed>
                <Input label="Email" value={email} onChangeText={(next) => demo.setValue((current) => ({ ...current, email: next }))} />
                <Select label="Role" options={["Editor", "Viewer", "Admin"]} value={role} onSelect={(next) => demo.setValue((current) => ({ ...current, role: next }))} />
                <Switch checked={welcome} onChange={(next) => demo.setValue((current) => ({ ...current, welcome: next }))} description="Includes the workspace guide">Send welcome email</Switch>
              </Column>
            </Drawer>
          </OverlayProvider>
        </StageMotion>
      ) : <ReplayOverlay label="Invite member" result={result} onPress={() => demo.setValue((current) => ({ ...current, open: true, result: "" }))} />}
    </ShowcaseCard>
  );
}

const TOAST_REST = { syncing: false, dismissed: false, detail: "" };
const TOAST_FRAMES = [
  TOAST_REST,
  { ...TOAST_REST, syncing: true },
  { ...TOAST_REST, syncing: true },
  TOAST_REST,
];

function ToastCard() {
  const demo = useShowcaseDemo("c-toast", TOAST_FRAMES, { interval: 1200 });
  const { syncing, dismissed, detail } = demo.value;
  const showDetail = (next: string) => demo.setValue((current) => ({ ...current, detail: next }));
  return (
    <ShowcaseCard id="c-toast" caption={"const { toast } = useToast() · toast({ title: \"Tokens published\" }) · <ToastProvider>"}>
      {dismissed ? (
        <Row><Button small outline onPress={() => demo.setValue(TOAST_REST)}>Show toast</Button></Row>
      ) : (
        <StageMotion key={syncing ? "syncing" : "published"}>
          <EscapeParticipation enabled={demo.manual}>
            <Toast
              testID="demo-publish-toast"
              success={!syncing}
              info={syncing}
              icon={syncing ? <Spinner small /> : undefined}
              message={syncing ? "Publishing tokens…" : "Tokens published"}
              description={syncing ? "Updating DESIGN.md and syncing consumers" : "DESIGN.md regenerated · 3 consumers synced"}
              action={syncing ? undefined : { label: "View", onPress: () => showDetail("All three consumers have the updated tokens.") }}
              onDismiss={() => demo.setValue((current) => ({ ...current, dismissed: true }))}
            />
          </EscapeParticipation>
        </StageMotion>
      )}
      <Column snug>
        <Toast info brief message="Syncing native builds…" icon={<Spinner small />} />
        <Toast warning brief message={`${PLATFORM_COPY.samplePlatform} blur module needs a rebuild`} action={{ label: "Rebuild", onPress: () => showDetail("Blur module rebuild queued.") }} />
        <Toast destructive brief message="Publish failed · contrast floor not met" action={{ label: "Details", onPress: () => showDetail("Two warning tokens failed the contrast check.") }} />
      </Column>
      {detail ? <Typography small muted>{detail}</Typography> : null}
    </ShowcaseCard>
  );
}

const ALERT_REST = { upload: 0.64, workspace: false };
const ALERT_FRAMES = [ALERT_REST, { ...ALERT_REST, upload: 0.82 }, { ...ALERT_REST, upload: 1 }, { ...ALERT_REST, upload: 0.24 }];

function AlertCard() {
  const demo = useShowcaseDemo("c-alert", ALERT_FRAMES, { interval: 1150 });
  const { upload, workspace } = demo.value;
  return (
    <ShowcaseCard id="c-alert" title="Alert · Empty state · Progress" meta="inline" caption="<Alert info dismissible> · <Alert destructive> · <EmptyState> · <Progress value={0.64}>">
      <Alert info dismissible title="Glass is a theming mode, not a prop" description="Use <ThemeProvider glass>; there is no per-component switch." />
      <Alert destructive title="2 tokens fail the contrast floor" description="warning-foreground on warning is 3.9:1 in light." />
      <EmptyState
        bordered
        compact
        icon={workspace ? <Icon check size={18} decorative /> : <Icon diamond size={18} decorative />}
        title={workspace ? "Workspace created" : "No workspaces yet"}
        description={workspace ? "This workspace is ready to sync tokens." : "Create one to start syncing tokens across your apps."}
        actionLabel={workspace ? "Reset workspace" : "New workspace"}
        onAction={() => demo.setValue((current) => ({ ...current, workspace: !current.workspace }))}
      />
      <Progress testID="demo-token-upload" value={upload} showValue>{upload === 1 ? "tokens.json uploaded" : "Uploading tokens.json"}</Progress>
    </ShowcaseCard>
  );
}

const ALERT_DIALOG_FRAMES = [DIALOG_REST, DIALOG_REST, { open: false, result: "Deletion canceled" }, DIALOG_REST];

function AlertDialogCard() {
  const demo = useShowcaseDemo("c-alert-dialog", ALERT_DIALOG_FRAMES, { interval: 1900 });
  return (
    <ShowcaseCard id="c-alert-dialog" caption="AlertDialog · blocks until answered" stage={{ height: 460, scene: <AlertDialogScene /> }}>
      {demo.value.open ? (
        <StageMotion fill>
          <AlertDialog
            open={demo.value.open}
            embedded
            destructive
            withInput
            testID="demo-delete-dialog"
            confirmText="riskora"
            title="Delete “Riskora”?"
            description="24 members lose access now. Boards, tokens and history are gone for good."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => demo.setValue({ open: false, result: "Sample workspace deleted" })}
            onCancel={() => demo.setValue({ open: false, result: "Deletion canceled" })}
          />
        </StageMotion>
      ) : <ReplayOverlay label="Review deletion" result={demo.value.result} onPress={() => demo.setValue(DIALOG_REST)} />}
    </ShowcaseCard>
  );
}

const ACTION_SHEET_FRAMES = [DIALOG_REST, DIALOG_REST, { open: false, result: "Share link copied" }, DIALOG_REST];

function ActionSheetCard() {
  const demo = useShowcaseDemo("c-action-sheet", ACTION_SHEET_FRAMES, { interval: 1530 });
  const closeWith = (result: string) => demo.setValue({ open: false, result });
  return (
    <ShowcaseCard id="c-action-sheet" caption="ActionSheet · bottom sheet of choices" stage={{ height: 460, scene: <ActionSheetScene />, labelSubtle: true }}>
      {demo.value.open ? (
        <StageMotion fill>
          <ActionSheet
            open={demo.value.open}
            embedded
            testID="demo-share-sheet"
            onOpenChange={(open) => demo.setValue((current) => ({ ...current, open }))}
            title="Share “Q4 plan” with 3 people"
            actions={[
              { label: "Copy link", onPress: () => closeWith("Share link copied") },
              { label: "Export as PDF", onPress: () => closeWith("PDF export ready") },
              { label: "Remove access", onPress: () => closeWith("Shared access removed"), destructive: true },
            ]}
          />
        </StageMotion>
      ) : <ReplayOverlay label="Share Q4 plan" result={demo.value.result} onPress={() => demo.setValue(DIALOG_REST)} />}
    </ShowcaseCard>
  );
}

const FILTER_ITEMS = [
  { label: "Active", sectionBefore: "Status" },
  { label: "Invited" },
  { label: "Suspended" },
  { label: "Sort by", icon: "listOrdered" as const, separatorBefore: true },
];

const POPOVER_REST = { tip: true, filter: true, invite: true, selected: 0, email: "", sent: false };
const POPOVER_FRAMES = [
  POPOVER_REST,
  { ...POPOVER_REST, tip: false, filter: false, email: "kira@" },
  { ...POPOVER_REST, tip: false, selected: 1, email: "kira@ionize.io" },
  { ...POPOVER_REST, tip: false, filter: false, invite: false, email: "kira@ionize.io", sent: true },
];

function PopoverCard() {
  const phone = useFormFactor() === "phone";
  const demo = useShowcaseDemo("c-popover", POPOVER_FRAMES, { interval: 1500 });
  const { tip, filter, invite, selected, email, sent } = demo.value;
  const anchor = useRef<View>(null);
  const [manualFilter, setManualFilter] = useState(false);
  const filterOpen = filter && (!phone || manualFilter);
  const setFilter = (next: boolean) => demo.setValue((current) => ({ ...current, tip: false, filter: next }));
  return (
    <ShowcaseCard id="c-popover" caption="Tooltip · Dropdown · Popover" stage={{ height: 460, scene: <PopoverScene />, inset: [56, 20, 24, 20], noLabel: true }}>
      {/* The stage already clips its local outlet. Inherit the window's placement
          bounds so scrolling the stage offscreen cannot collapse its pinned cards. */}
      <OverlayProvider>
        <Row stacks grow relaxed>
          <Column grow shrink between alignStart>
            <Row snug alignCenter>
              <EscapeParticipation enabled={demo.manual}>
                <Tooltip label="Filter rows" open={!phone && tip} onOpenChange={phone ? undefined : (next) => demo.setValue((current) => ({ ...current, tip: next }))}>
                  <Button
                    ref={anchor}
                    small
                    outline
                    expanded={filterOpen}
                    haspopup="menu"
                    onPress={() => {
                      setManualFilter(true);
                      setFilter(!filterOpen);
                    }}
                  >
                    Filter
                  </Button>
                </Tooltip>
              </EscapeParticipation>
              {/* A pinned menu uses the local outlet and never focuses itself. The Filter
                  button enables the regular dismissal and keyboard behavior when pressed. */}
              <EscapeParticipation enabled={manualFilter}>
                <Dropdown
                  anchorRef={anchor}
                  items={FILTER_ITEMS.map((item, index) => ({ ...item, selected: index === selected }))}
                  open={filterOpen}
                  onOpenChange={manualFilter ? setFilter : undefined}
                  onSelect={(_, index) => demo.setValue((current) => ({ ...current, filter: false, selected: index }))}
                  accessibilityLabel="Filter rows"
                />
              </EscapeParticipation>
              <Button outline icon small accessibilityLabel="Share" iconLeft={<Icon share2 size={14} decorative />} onPress={() => demo.setValue((current) => ({ ...current, invite: true, sent: false }))} />
            </Row>
            <Column tight>
              <Typography pageLabel mono muted>Tooltip · Dropdown</Typography>
              <Typography pageLabel mono muted>Popover</Typography>
            </Column>
          </Column>
          <Column shrink end alignEnd={!phone} roomy>
            {invite ? (
              <StageMotion>
                <Popover inline top alignEnd title="Invite to Q4 plan" description="They get edit access to this board only.">
                  <Column snug>
                    <Input small placeholder="name@company.com" accessibilityLabel="Email" value={email} onChangeText={(next) => demo.setValue((current) => ({ ...current, email: next }))} />
                    <Button primary small block raised disabled={!INVITE_EMAIL.test(email.trim())} onPress={() => demo.setValue((current) => ({ ...current, invite: false, sent: true }))}>Send invite</Button>
                  </Column>
                </Popover>
              </StageMotion>
            ) : sent ? <Typography small muted>Invitation sent</Typography> : null}
            <Row end>
              <Button outline small expanded={invite} iconLeft={<Icon userPlus size={14} decorative />} onPress={() => demo.setValue((current) => ({ ...current, invite: !current.invite, sent: false }))}>Invite</Button>
            </Row>
          </Column>
        </Row>
      </OverlayProvider>
    </ShowcaseCard>
  );
}

const SKELETON_REST = { loaded: false, strength: 0.75 };
const SKELETON_FRAMES = [
  SKELETON_REST,
  { ...SKELETON_REST, strength: 0.25 },
  { ...SKELETON_REST, loaded: true, strength: 0.5 },
  { ...SKELETON_REST, loaded: true, strength: 1 },
];

function SkeletonCard() {
  const demo = useShowcaseDemo("c-skeleton", SKELETON_FRAMES, { interval: 1400 });
  const { loaded, strength } = demo.value;
  return (
    <ShowcaseCard id="c-skeleton" caption="<Skeleton> mirrors the shape it replaces · <Spinner small | large> · <Progress indeterminate> · segmented meter · spinners ignore reduced motion">
      <StageMotion key={loaded ? "loaded" : "loading"}>
        <Card outlined well testID={loaded ? "demo-index-loaded" : "demo-index-loading"}>
          {loaded ? (
            <>
              <MediaObject center avatar="NP" title="Noor Park" description="Workspace activity" />
              <Card outlined well>
                <Image cover width="100%" height={120} radius="lg" source={require("../../public/video-sample.jpg")} accessibilityLabel="Workspace walkthrough" />
                <Typography small semibold>Workspace walkthrough</Typography>
                <Typography caption muted>Component index ready</Typography>
              </Card>
              <Typography small muted>{COMPONENTS.length} components indexed</Typography>
            </>
          ) : (
            <>
              <Row cozy alignCenter>
                <Skeleton avatar />
                <Column fill snug>
                  <Skeleton text />
                  <Skeleton text short />
                </Column>
              </Row>
              <Skeleton card />
              <Skeleton text long />
            </>
          )}
        </Card>
      </StageMotion>
      <Row loose alignCenter wrap>
        <Spinner small description="small" />
        <Spinner description="default" />
        <Spinner large description="large" />
      </Row>
      <Progress indeterminate={!loaded} value={1} status={loaded ? "complete" : "indeterminate"}>{loaded ? "Component index ready" : "Indexing components"}</Progress>
      <Progress segments={8} value={strength} status={strength < 0.5 ? "weak" : strength < 0.75 ? "fair" : "strong"}>Password strength</Progress>
    </ShowcaseCard>
  );
}

const VARIANT_REST = { checking: false, warningDismissed: false, checklist: false };
const VARIANT_FRAMES = [VARIANT_REST, { ...VARIANT_REST, checking: true }, { ...VARIANT_REST, checking: true }, VARIANT_REST];

function AlertVariantsCard() {
  const demo = useShowcaseDemo("c-alert-variants", VARIANT_FRAMES, { interval: 1450 });
  const { checking, warningDismissed, checklist } = demo.value;
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
        action={{ label: "See what moved", onPress: () => demo.setValue((current) => ({ ...current, checklist: true, warningDismissed: false })) }}
      />
      <Alert
        info={checking}
        success={!checking}
        icon={checking ? <Spinner small /> : undefined}
        title={checking ? "Checking contrast…" : "Contrast checks pass"}
        description={checking ? "Checking text tokens on solid and tonal surfaces." : "Every text token holds 4.5:1 on solid and tonal surfaces."}
      />
      {warningDismissed ? null : (
        <Alert
          warning
          title={checklist ? "Glass verification checklist" : "Glass needs verifying in the app"}
          description={checklist ? "Check each text and control color against the backgrounds used in your app." : "Contrast over glass depends on what sits behind it."}
          actions={(
            <Row cozy>
              <Button plainLink onPress={() => demo.setValue((current) => ({ ...current, checklist: !current.checklist }))}>{checklist ? "Close checklist" : "Open checklist"}</Button>
              <Button plainLink onPress={() => demo.setValue((current) => ({ ...current, warningDismissed: true }))}>Dismiss</Button>
            </Row>
          )}
        />
      )}
    </ShowcaseCard>
  );
}

const HUES = ["violet", "cyan", "mint", "rose", "amber"] as const;
type WizardFrame = {
  current: number;
  hue: (typeof HUES)[number] | null;
  workspace: string;
  email: string;
  selected: boolean;
  done: boolean;
};

const WIZARD_REST: WizardFrame = { current: 1, hue: null, workspace: "Riskora", email: "", selected: true, done: false };
const WIZARD_FRAMES: readonly WizardFrame[] = [
  WIZARD_REST,
  { ...WIZARD_REST, hue: "mint", selected: false },
  { ...WIZARD_REST, current: 2, hue: "mint", email: "kira@ionize.io" },
  { ...WIZARD_REST, current: 2, hue: "mint", email: "kira@ionize.io", done: true },
  { ...WIZARD_REST, current: 0 },
];

function WizardCard() {
  const { palette, dark, surface } = useTheme();
  const demo = useShowcaseDemo("c-wizard", WIZARD_FRAMES, { interval: 1750 });
  const { current, hue, workspace, email, selected, done } = demo.value;
  const previewHue = hue ?? palette;
  const previous = () => demo.setValue((value) => ({ ...value, current: Math.max(0, value.current - 1), done: false }));
  const next = () => demo.setValue((value) => {
    if (value.done) return { ...WIZARD_REST, current: 0 };
    if (value.current === 2) return { ...value, done: true };
    return { ...value, current: value.current + 1 };
  });
  return (
    <ShowcaseCard
      id="c-wizard"
      caption="Wizard · Dialog + Steps + Button, fixed chrome around a scrolling body"
      stage={{ height: 540, grows: true, scene: <WizardScene />, chipsAt: 57, labelSubtle: true }}
    >
      <Wizard
        open
        embedded
        testID="demo-workspace-wizard"
        onOpenChange={demo.stop}
        title="New workspace"
        steps={[{ label: "Basics" }, { label: "Brand" }, { label: "Invite" }]}
        current={current}
        status={done ? "Workspace created" : `Step ${current + 1} of 3`}
        previous={{ label: "Back", onPress: previous, disabled: current === 0 }}
        actions={(
          <Button primary raised disabled={current === 0 && !workspace.trim()} iconRight={<Icon arrowRight size={15} decorative />} onPress={next}>
            {done ? "Start over" : current === 2 ? "Create workspace" : "Continue"}
          </Button>
        )}
      >
        <StageMotion key={done ? "created" : current}>
          {current === 0 ? (
            <Input label="Workspace name" value={workspace} onChangeText={(name) => demo.setValue((value) => ({ ...value, workspace: name }))} />
          ) : current === 1 ? (
            <Grid minTileWidth={260} columns={2} spacious>
              <Column>
                <Column relaxed>
                  <Column snug>
                    <Typography label subtle>Accent hue · repaints this whole page</Typography>
                    <View role="radiogroup" accessibilityLabel="Accent hue" aria-label="Accent hue">
                      <Row comfortable alignCenter>
                        {HUES.map((name) => (
                          <Swatch key={name} small circle {...{ [name]: true }} selected={previewHue === name} onPress={() => demo.setValue((value) => ({ ...value, hue: name }))} />
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
                <ThemeProvider dark={dark} light={!dark} glass={surface === "glass"} solid={surface === "solid"} {...{ [previewHue]: true }}>
                  <Card sunken well>
                    <Typography pageLabel mono muted>Preview</Typography>
                    <Row snug alignCenter>
                      <Button primary small raised onPress={() => demo.setValue((value) => ({ ...value, selected: true }))}>Primary</Button>
                      <Chip selectable selected={selected} onSelectedChange={(checked) => demo.setValue((value) => ({ ...value, selected: checked }))}>Selected</Chip>
                    </Row>
                    <Progress value={selected ? 0.62 : 0.34} />
                  </Card>
                </ThemeProvider>
              </Column>
            </Grid>
          ) : done ? (
            <Alert success title={`${workspace} is ready`} description={email ? `Invitation sent to ${email}.` : "You can invite members from your workspace settings."} />
          ) : (
            <Input label="Invite a teammate" placeholder="name@company.com" value={email} onChangeText={(nextEmail) => demo.setValue((value) => ({ ...value, email: nextEmail }))} />
          )}
        </StageMotion>
      </Wizard>
    </ShowcaseCard>
  );
}

const COMMAND_REST = { query: "", selected: "" };
const COMMAND_FRAMES = [
  COMMAND_REST,
  { ...COMMAND_REST, query: "s" },
  { ...COMMAND_REST, query: "ski" },
  { ...COMMAND_REST, query: "skins" },
  { ...COMMAND_REST, query: "preview" },
];

function CommandCard() {
  const demo = useShowcaseDemo("c-command", COMMAND_FRAMES, { interval: 1150 });
  return (
    <ShowcaseCard id="c-command" caption="<Command /> · glass-tint-dense" stage={{ minHeight: 560, pad: [48, 24], scene: <CommandScene />, scrim: true, noLabel: true }}>
      {/* The palette open in place: the bare Command is its glass panel with no trigger and
          no modal, so the page keeps its focus and scroll. */}
      <Command
        open
        footer
        defaultActive={1}
        testID="demo-command"
        query={demo.value.query}
        onQueryChange={(query) => demo.setValue({ query, selected: "" })}
        onSelect={(item) => demo.setValue((value) => ({ ...value, selected: item.label }))}
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
      {demo.value.selected ? <Typography small muted>{demo.value.selected} selected</Typography> : null}
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
