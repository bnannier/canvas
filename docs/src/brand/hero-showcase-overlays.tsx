import { useContext } from "react";
import {
  ActionSheet, AlertDialog, Avatar, AvatarGroup, Button, Card, Column, Command, Dialog, Drawer,
  EmptyState, Icon, Input, OverlayProvider, Popover, Row, Select, Spinner, Switch, Tooltip, Typography, View, Wizard,
  type CommandGroup,
} from "@nannier/canvas";
import { SpinnerAnimationContext } from "../../../src/atoms/spinner/spinner.shared";
import { EscapeParticipation } from "../../../src/style/escape-layer";
import { ShowcaseActivity, useDemonstrationStep } from "./hero-showcase-activity";

export const HERO_OVERLAY_KINDS = [
  "action-sheet", "alert-dialog", "command", "dialog", "drawer", "empty-state",
  "popover", "spinner", "tooltip", "wizard",
] as const;

type OverlayKind = typeof HERO_OVERLAY_KINDS[number];

const ignore = () => {};

const COMMANDS: CommandGroup[] = [{
  heading: "Workspace",
  items: [
    { label: "Open project", icon: "folderOpen", shortcut: "⌘O" },
    { label: "New document", icon: "fileText", shortcut: "⌘N" },
    { label: "Invite teammate", icon: "userPlus", shortcut: "⌘I" },
  ],
}];

const WIZARD_STEPS = [{ label: "Details" }, { label: "Access" }, { label: "Review" }];
const PUBLISH_FIELDS = [
  { label: "Project name", value: "Studio handbook" },
  { label: "Who can view", value: "Workspace members" },
  { label: "Publish to", value: "Studio workspace" },
];

/** Use the components' in-place modes so the illustration never becomes a live overlay. */
export function HeroOverlaySpecimen({ kind }: { kind: OverlayKind }) {
  const active = useContext(ShowcaseActivity);
  const phase = useDemonstrationStep(1350) % 3;
  const testID = `hero-control-${kind}`;

  switch (kind) {
    case "action-sheet":
      return <Card flush>
        <View style={{ height: 244 }}>
          <ActionSheet embedded open title="Export project" message={["Design library", "Brand guidelines", "Release assets"][phase]}
            actions={[{ label: "Save a copy", onPress: ignore }, { label: "Copy share link", onPress: ignore }]}
            testID={testID} />
        </View>
      </Card>;
    case "alert-dialog":
      return <AlertDialog embedded open destructive title="Delete draft?"
        description={`“${["Homepage", "Pricing page", "Team page"][phase]}” will be permanently deleted.`}
        confirmLabel="Delete draft" testID={testID} />;
    case "command":
      return <Command placeholder="Search workspace" groups={COMMANDS} active={phase} footer testID={testID} />;
    case "dialog":
      return <Dialog embedded open title="Publish project?"
        description={`“${["Studio handbook", "Design patterns", "Release notes"][phase]}” will be visible to your team.`}
        confirmLabel="Publish" testID={testID} />;
    case "drawer":
      return <Card flush>
        <View style={{ height: 288 }}>
          <Drawer embedded open right width={340} accessibilityLabel="Share project"
            header={<Column tight>
              <Typography h5>Share project</Typography>
              <Typography small muted>Studio handbook</Typography>
            </Column>}
            footer={<Button primary small iconLeft={phase === 2 ? <Icon check /> : <Icon link />}>
              {phase === 2 ? "Link copied" : "Copy link"}
            </Button>} testID={testID}>
            <Column tight>
              <Row tight between alignCenter>
                <Typography small>Team access</Typography>
                <AvatarGroup small>
                  <Avatar name="Ari Nguyen" hue={285} />
                  <Avatar name="Jo Kim" hue={165} />
                  <Avatar name="Mara Reyes" hue={20} />
                </AvatarGroup>
              </Row>
              <Select small inline label="Link access" open={false} options={["Can view", "Can edit"]}
                value={phase === 0 ? "Can view" : "Can edit"} />
              <Switch small checked={phase !== 0}>Allow comments</Switch>
            </Column>
          </Drawer>
        </View>
      </Card>;
    case "empty-state":
      return <EmptyState bordered icon={phase === 2 ? <Icon check /> : <Icon inbox />} success={phase === 2}
        title={phase === 2 ? "All caught up" : "No review requests"}
        description={phase === 2 ? "Every request has been resolved." : "New requests from your team will appear here."}
        actionLabel="View projects" testID={testID} />;
    case "popover":
      return <Column center tight>
        <Button secondary small iconLeft={<Icon share />}>Share project</Button>
        <Popover inline bottom compact comfortable panelWidth={290} title="Link access"
          description={phase === 2 ? "Anyone with the link can view." : "Only teammates can view this project."}
          actionLabel="Copy link" testID={testID} />
      </Column>;
    case "spinner":
      return <Card comfortable>
        <SpinnerAnimationContext.Provider value={active}>
          <Spinner large stacked description={`${["Checking files", "Preparing images", "Packaging assets"][phase]}…`} testID={testID}>
            Exporting project
          </Spinner>
        </SpinnerAnimationContext.Provider>
      </Card>;
    case "tooltip":
      return <Card flush>
        <OverlayProvider separateWindow viewport style={{ minHeight: 144, justifyContent: "center" }}>
          <EscapeParticipation enabled={false}>
            <Column alignCenter>
              <Tooltip open label={["Copy the workspace link", "Copy the project link", "Copy the share link"][phase]} testID={testID}>
                <Button secondary small iconLeft={<Icon link />}>{["Workspace link", "Project link", "Share link"][phase]}</Button>
              </Tooltip>
            </Column>
          </EscapeParticipation>
        </OverlayProvider>
      </Card>;
    case "wizard": {
      const { label, value } = PUBLISH_FIELDS[phase]!;
      return <Wizard embedded open title="Publish project" steps={WIZARD_STEPS} current={phase} panelWidth={380}
        previous={{ label: "Back", disabled: phase === 0, onPress: ignore }}
        actions={<Button primary small>{phase === 2 ? "Publish" : "Continue"}</Button>}
        scrollBody={false} onOpenChange={ignore} testID={testID}>
        <Input small label={label} value={value} readOnly />
      </Wizard>;
    }
  }
}
