import {
  Accordion, ActionPanel, Board, Calendar, Card, CardMedia, Carousel, Chat,
  CodeBlock, Column, DataTable, DescriptionList, DragDropProvider, DragHandle,
  Draggable, DropZone, Feed, FlowEditor, GridList, MediaObject, QRCode, Row,
  StackedList, Stats, Typography, Video, View,
} from "@nannier/canvas";
import { resolvePhoto } from "../core/photos";
import { useDemonstrationStep } from "./hero-showcase-activity";

export const HERO_DATA_KINDS = [
  "accordion", "action-panels", "board", "calendar", "card", "carousel", "chat",
  "code-block", "data-table", "description-lists", "drag-drop", "feeds",
  "flow-editor", "grid-lists", "media-objects", "qrcode", "stacked-lists", "stats", "video",
] as const;

export type HeroDataKind = typeof HERO_DATA_KINDS[number];

const REVIEWS = [
  { key: "inbox", title: "Intake", content: "New requests are assigned at the morning triage." },
  { key: "review", title: "Design review", content: "Share a preview for feedback from your team." },
  { key: "handoff", title: "Handoff", content: "Publish the changes and share the release notes." },
];
const PEOPLE = [
  { name: "Rachel Chen", role: "Product design", path: "/rachel-chen.jpg" },
  { name: "Marcus Allen", role: "Engineering", path: "/marcus-allen.jpg" },
  { name: "Noor Park", role: "Research", path: "/noor-park.jpg" },
  { name: "Kira Tanaka", role: "Developer experience", path: "/kira-tanaka.jpg" },
];
const TASKS = [
  { id: "notes", title: "Draft the release notes" },
  { id: "preview", title: "Review the preview" },
];
const CODE_TABS = [
  { label: "npm", code: "npm install @nannier/canvas" },
  { label: "Bun", code: "bun add @nannier/canvas" },
  { label: "pnpm", code: "pnpm add @nannier/canvas" },
];
const MILESTONES = [
  { id: "design", label: "Design", description: "Prepare the preview", x: 0, y: 0 },
  { id: "review", label: "Review", description: "Check the changes", x: 280, y: 120 },
];

function sampleAsset(path: string): string {
  const source = resolvePhoto(path);
  return typeof source === "string" ? source : path;
}

function WorkflowSpecimen({ phase, testID }: { phase: number; testID: string }) {
  // Keep the editor's minimum 360px viewport while fitting its entire drawing in the collage.
  return <View style={{ height: 288, overflow: "hidden" }}>
    <View style={{ width: 475, height: 360, transformOrigin: [0, 0, 0], transform: [{ scale: 0.8 }] }}>
      <FlowEditor readOnly label="Preview workflow" nodes={MILESTONES}
        edges={[{ id: "handoff", from: "design", to: "review", label: "Ready for review" }]}
        selected={{ kind: "node", id: phase < 2 ? "design" : "review" }} testID={testID} />
    </View>
  </View>;
}

export function HeroDataSpecimen({ kind }: { kind: HeroDataKind }) {
  const step = useDemonstrationStep(1200);
  const phase = step % 4;
  const testID = `hero-data-${kind}`;

  switch (kind) {
    case "accordion":
      return <Accordion compact card items={REVIEWS} value={REVIEWS[step % REVIEWS.length]!.key} testID={testID} />;
    case "action-panels":
      return <ActionPanel toggle checked={phase < 2} title="Weekly project digest"
        description="A summary of new tasks and recent decisions every Friday." testID={testID} />;
    case "board":
      return <Board compact columnWidth={172} columns={[{ id: "ready", label: "Ready" }, { id: "review", label: "In review" }]} items={[
        { id: "chart", title: "Chart labels", columnId: "ready", badge: "2" },
        { id: "examples", title: "New examples", columnId: phase < 2 ? "ready" : "review", badge: "3" },
        { id: "keyboard", title: "Keyboard tests", columnId: "review", badge: "1" },
      ]} testID={testID} />;
    case "calendar":
      return <Column alignCenter>
        <Calendar compact month="February 2027" daysInMonth={28} startWeekday={1} today={9}
          selected={[9, 11, 17, 23][phase]} events={[
            { day: 9, title: "Studio check-in" }, { day: 11, title: "Preview review" },
            { day: 17, title: "Design handoff" }, { day: 23, title: "Release" },
          ]} testID={testID} />
      </Column>;
    case "card":
      return <Card raised selected={phase >= 2} title="Design review" eyebrow="Studio workspace"
        badge={phase >= 2 ? "Approved" : "In review"}
        description="Check typography, color and keyboard navigation before publishing the preview."
        footer={phase >= 2 ? "Ready to publish" : "Review requested today"} testID={testID} />;
    case "carousel":
      return <Carousel loop showArrows showDots index={step % 3} items={PEOPLE.slice(0, 3).map(person => ({
        key: person.name,
        content: <Card compact title={person.name} description={person.role}>
          <CardMedia compact height={106} src={sampleAsset(person.path)} alt={person.name} />
        </Card>,
      }))} testID={testID} />;
    case "chat":
      return <Chat autoFocus={false} label="Preview handoff" value={phase >= 2 ? "I’ll share the preview." : ""}
        onChangeText={() => {}} onSend={() => {}} messages={[
          { id: "question", role: "user", content: "Is the preview ready for review?" },
          { id: "answer", role: "assistant", content: phase >= 2 ? "Yes. The keyboard checks passed." : "The new preview is ready. I’m checking keyboard navigation now." },
        ]} testID={testID} />;
    case "code-block":
      return <CodeBlock compact language="bash" filename="Install Canvas" tabs={CODE_TABS}
        active={step % CODE_TABS.length} copy testID={testID} />;
    case "data-table":
      return <DataTable compact striped columns={["Template", "Status", { label: "Uses", numeric: true }]} rows={[
        ["Launch plan", "Ready", 940 + 3 * phase],
        ["Review notes", phase >= 2 ? "Ready" : "Draft", 781],
        ["Roadmap", "Ready", 512 + 10 * phase],
      ]} testID={testID} />;
    case "description-lists":
      return <DescriptionList card compact inline ruled title="Workspace overview" items={[
        { term: "Workspace", value: "Studio" },
        { term: "Channel", value: "Preview", badge: true },
        { term: "Checks", value: phase >= 2 ? "Passed" : "Running", status: true },
        { term: "Build", value: `rev-${248 + phase}`, mono: true },
      ]} testID={testID} />;
    case "drag-drop": {
      const order = phase >= 2 ? [...TASKS].reverse() : TASKS;
      return <DragDropProvider testID={testID}>
        <DropZone bordered id="tasks" label="Release tasks">
          <Column snug>
            {order.map(task => <Draggable key={task.id} id={task.id} data={task} label={task.title}>
              <Card compact>
                <Row between alignCenter>
                  <Typography small>{task.title}</Typography>
                  <DragHandle label={`Reorder ${task.title}`} />
                </Row>
              </Card>
            </Draggable>)}
          </Column>
        </DropZone>
      </DragDropProvider>;
    }
    case "feeds":
      return <Feed avatar compact label="Workspace activity" items={[
        { id: "review", actor: "Noor Park", action: phase >= 2 ? "approved" : "opened", target: "the preview", time: "Just now" },
        { id: "ready", actor: "Rachel Chen", action: "requested review on", target: "Chart updates", time: "9 min ago" },
        { id: "build", actor: "Marcus Allen", action: "published", target: "a new build", time: "25 min ago" },
      ]} testID={testID} />;
    case "flow-editor":
      return <WorkflowSpecimen phase={phase} testID={testID} />;
    case "grid-lists":
      return <GridList cols2 compact label="Project templates" items={[
        { title: "Launch plan", subtitle: "Release template", badge: phase >= 2 ? "Updated" : "Popular" },
        { title: "Review notes", subtitle: "Feedback template", badge: "New" },
        { title: "Roadmap", subtitle: "Planning template" },
        { title: "Research brief", subtitle: "Discovery template" },
      ]} testID={testID} />;
    case "media-objects": {
      const person = PEOPLE[phase]!;
      return <MediaObject bordered title={person.name} description={person.role} meta="Studio team"
        src={sampleAsset(person.path)} testID={testID} />;
    }
    case "qrcode":
      return <Column alignCenter pad>
        <QRCode value={`demo-workspace-invite:${["studio", "design", "research", "engineering"][phase]}`}
          accessibilityLabel="Sample workspace invite" testID={testID} />
        <Typography small muted>Sample workspace invite</Typography>
      </Column>;
    case "stacked-lists":
      return <StackedList card title="Recent projects" items={[
        { id: "library", name: "Component library", detail: "Design system", initials: "CL", badge: phase >= 2 ? "Published" : "Preview", success: phase >= 2 },
        { id: "workshop", name: "Design workshop", detail: "Team learning", initials: "DW", badge: "Scheduled", info: true },
        { id: "notes", name: "Release notes", detail: "Documentation", initials: "RN", badge: "Draft", neutral: true },
      ]} testID={testID} />;
    case "stats":
      return <Stats compact items={[
        { label: "Components", value: `${108 + phase}`, delta: `+${4 + phase}`, chart1: true, spark: [5, 9, 8, 12, 13 + phase] },
        { label: "Weekly installs", value: `${(8.2 + phase / 10).toFixed(1)}k`, delta: "+12%", chart2: true, spark: [8, 6, 8, 11, 14 + phase] },
      ]} testID={testID} />;
    case "video":
      return <Video source={{ uri: sampleAsset("/video-sample.mp4") }} poster={{ uri: sampleAsset("/video-sample.jpg") }}
        cover muted controls accessibilityLabel="Canvas motion preview" testID={testID} />;
  }
}
