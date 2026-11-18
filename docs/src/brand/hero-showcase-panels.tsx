import { useContext, type ReactNode } from "react";
import {
  Alert, Autocomplete, Avatar, AvatarGroup, AvatarMenu, Badge, BadgeGroup, Breadcrumb,
  Button, ButtonGroup, Checkbox, Chip, Collapsible, Dropdown, Field, Icon, Image,
  Input, InputOTP, Kbd, Listbox, Pagination, PhoneInput, Progress, Radio, RadioGroup,
  Row, RowMenu, Select, Skeleton, Slider, Sparkline, StackedBar, Stepper, Steps,
  Switch, Tabs, Textarea, Toast, Typography, UptimeBar, View,
} from "@nannier/canvas";
import { resolvePhoto } from "../core/photos";
import { ShowcaseActivity, useDemonstrationStep } from "./hero-showcase-activity";
import { HERO_CHART_KINDS, HeroChartSpecimen } from "./hero-showcase-charts";
import { HERO_DATA_KINDS, HeroDataSpecimen } from "./hero-showcase-data";
import { HERO_OVERLAY_KINDS, HeroOverlaySpecimen } from "./hero-showcase-overlays";
import { HERO_FORM_NAV_CENTER, HeroFormNavigationSpecimen } from "./hero-showcase-forms-navigation";
import type { CollagePanelId } from "./library-hero-look";

type PanelPools = Record<CollagePanelId, ReactNode[]>;

export const HERO_SURROUNDING_KINDS = {
  segmented: ["input", "segments", "otp", "breadcrumb", "tabs", "select", "autocomplete", "pagination"],
  online: ["chip", "avatars", "badge", "badge-group", "kbd", "avatar", "image", "listbox"],
  glass: ["slider", "switch", "checkbox", "phone-input", "radio", "textarea", "collapsible", "field"],
  toast: ["progress", "stepper", "stacked", "sparkline", "toast", "alert", "steps", "uptime-bar"],
  ship: ["create", "favorite", "export", "launch", "avatar-menu", "dropdown", "row-menu", "bookmark"],
} as const satisfies Record<Exclude<CollagePanelId, "revenue">, readonly string[]>;

type SpecimenKind = typeof HERO_SURROUNDING_KINDS[keyof typeof HERO_SURROUNDING_KINDS][number];

const PORTRAITS = [
  { name: "Rachel Chen", path: "/rachel-chen.jpg", hue: 285 },
  { name: "Liang Bao", path: "/liang-bao.jpg", hue: 165 },
  { name: "Marcus Allen", path: "/marcus-allen.jpg", hue: 20 },
  { name: "Noor Park", path: "/noor-park.jpg", hue: 205 },
];

// The scene supplies definite bounds to fill-sized controls. This transparent
// wrapper paints no surface and leaves every specimen's actual kit skin intact.
function ShowcaseSlot({ width, children }: { width: number; children: ReactNode }) {
  return <View style={{ width }}>{children}</View>;
}

function HeroSkeletonSpecimen() {
  const active = useContext(ShowcaseActivity);
  return <Skeleton list small animate={active} accessibilityLabel="Loading recent files" testID="hero-control-skeleton" />;
}

function ShowcaseSpecimen({ kind }: { kind: SpecimenKind }) {
  const active = useContext(ShowcaseActivity);
  const step = useDemonstrationStep(kind === "input" || kind === "otp" ? 280 : 1100);
  const phase = step % 4;
  const testID = `hero-control-${kind}`;
  switch (kind) {
    case "input": {
      const text = "Canvas components";
      const position = step % 24;
      const value = position === 0 ? text : text.slice(0, Math.min(text.length, position - 1));
      return <Input small accessibilityLabel="Search components" value={value} leadingIcon icon="search" />;
    }
    case "chip": return <Chip small selectable selected={phase % 2 === 0} primary icon={<Icon sparkles />} count={[12, 13, 16, 18][phase]}>Design</Chip>;
    case "slider": return <ShowcaseSlot width={286}><Slider small value={[72, 40, 90, 58][phase]}>Make it yours</Slider></ShowcaseSlot>;
    case "progress": return <Progress small value={[0.78, 0.88, 1, 0.4][phase]} showValue>Building something great</Progress>;
    case "create": return <Button primary small loading={active && phase === 1} iconLeft={phase === 1 ? <Icon clock /> : phase === 2 ? <Icon check /> : <Icon plus />}>{phase === 1 ? "Creating" : phase === 2 ? "Created" : "New idea"}</Button>;
    case "segments": return <ButtonGroup small compact block items={["Overview", "Activity", "Team"]} active={step % 3} />;
    case "avatars": return <AvatarGroup small max={4} total={phase + 3}><Avatar initials="AN" hue={285} /><Avatar initials="JK" hue={165} />{phase >= 1 ? <Avatar initials="MR" hue={20} /> : null}{phase >= 2 ? <Avatar initials="LP" hue={205} /> : null}</AvatarGroup>;
    case "switch": return <Switch small checked={phase % 2 === 0}>Keep me in the loop</Switch>;
    case "stepper": return <Stepper small value={[8, 9, 10, 9][phase]} min={1} max={24} suffix="team seats" />;
    case "favorite": return <Button secondary small selected={phase % 2 === 1} iconLeft={phase % 2 === 1 ? <Icon check /> : <Icon heart />}>{phase % 2 === 1 ? "Saved" : "Save"}</Button>;
    case "otp": return <InputOTP small length={6} groups={3} value={step % 12 === 0 ? "482916" : "482916".slice(0, Math.min(6, step % 12 - 1))} />;
    case "badge": return <Badge small status success={phase >= 2} warning={phase === 1} primary={phase === 0}>{["Draft saved", "In review", "Approved", "Published"][phase]}</Badge>;
    case "checkbox": return <Checkbox checked={phase !== 1} indeterminate={phase === 3}>Ready to publish</Checkbox>;
    case "stacked": return <StackedBar label="Project storage" max={100} segments={[{ label: "Images", value: 34 + phase * 4 }, { label: "Video", value: 22 + phase * 2 }, { label: "Files", value: 12 + phase }]} />;
    case "export": return <Button secondary small loading={active && phase === 1} iconLeft={phase === 1 ? <Icon clock /> : phase === 2 ? <Icon check /> : <Icon download />}>{phase === 1 ? "Exporting" : phase === 2 ? "Exported" : "Export"}</Button>;
    case "breadcrumb": return <Breadcrumb items={[["Studio", "Projects", "Canvas"], ["Studio", "Projects", "Orbit"], ["Studio", "Projects", "Atlas"], ["Studio", "Projects", "Canvas"]][phase]!} slash />;
    case "badge-group":
      return <BadgeGroup testID={testID} accessibilityLabel="Review status">
        <Badge small status success={phase >= 2} warning={phase < 2}>{phase >= 2 ? "Approved" : "In review"}</Badge>
        <Badge small secondary>{phase >= 2 ? "Resolved" : phase === 1 ? "2 notes" : "1 note"}</Badge>
      </BadgeGroup>;
    case "phone-input":
      return <ShowcaseSlot width={248}>
        <PhoneInput small readOnly label="Contact number" country={phase < 2 ? "CA" : "US"}
          value={["4165550134", "6135550157", "4155550112", "6175550140"][phase]} testID={testID} />
      </ShowcaseSlot>;
    case "sparkline": return <Sparkline tall line track values={[12, 18, 15, 29, 26, 35, 30, 48, 42, 56, 52, 70].map((value, i) => value + ((i * 3 + phase * 7) % 19))} accessibilityLabel="Visits trending upward" />;
    case "launch": return <Button primary small loading={active && phase === 1} iconRight={phase === 1 ? <Icon clock /> : phase === 2 ? <Icon check /> : <Icon arrowRight />}>{phase === 1 ? "Launching" : phase === 2 ? "Launched" : "Launch"}</Button>;
    case "tabs":
      return <Tabs block underline tabs={["Files", "People", "Activity"]} active={step % 3} testID={testID} />;
    case "select": {
      const densities = ["Compact", "Comfortable", "Spacious"];
      return <Select small inline label="Density" open={false} options={densities} value={densities[step % densities.length]} testID={testID} />;
    }
    case "autocomplete": {
      const locations = ["Toronto", "Montréal", "Vancouver", "Calgary"];
      return <Autocomplete small label="Assign a studio" options={locations} value={locations[phase]} open={false} testID={testID} />;
    }
    case "pagination":
      return <Pagination small total={4} page={phase + 1} testID={testID} />;
    case "kbd":
      return <Row tight alignCenter>
        <Typography small muted>{["Search", "New file", "Save", "Print"][phase]}</Typography>
        <Kbd keys={["⌘", ["K", "N", "S", "P"][phase]!]} testID={testID} />
      </Row>;
    case "avatar": {
      const { name, hue } = PORTRAITS[phase]!;
      return <Avatar name={name} hue={hue} online={phase < 3} rounded={phase % 2 === 1} testID={testID} />;
    }
    case "image": {
      const { name, path } = PORTRAITS[phase]!;
      const source = resolvePhoto(path);
      return <Image cover width={84} height={52} radius="lg" alt={name} source={{ uri: typeof source === "string" ? source : path }} testID={testID} />;
    }
    case "listbox":
      return <ShowcaseSlot width={140}>
        <Listbox small bordered accessibilityLabel="Presence" items={[{ label: "Available" }, { label: "Away" }]} selected={phase % 2} testID={testID} />
      </ShowcaseSlot>;
    case "radio":
      return <ShowcaseSlot width={226}>
        <RadioGroup row value={phase % 2 === 0 ? "daily" : "weekly"} label="Email digest" testID={testID}>
          <Radio small value="daily">Daily</Radio>
          <Radio small value="weekly">Weekly</Radio>
        </RadioGroup>
      </ShowcaseSlot>;
    case "textarea":
      return <ShowcaseSlot width={224}>
        <Textarea small readOnly label="Release notes" rows={2} value={["New preview modes", "Smoother charts", "Updated icons", "Polished previews"][phase]} testID={testID} />
      </ShowcaseSlot>;
    case "collapsible":
      return <ShowcaseSlot width={220}>
        <Collapsible title="Build details" open={phase > 0 && phase < 3} testID={testID}>All six checks passed.</Collapsible>
      </ShowcaseSlot>;
    case "field":
      return <ShowcaseSlot width={235}>
        <Field label="Workspace ID" helper="Used in the workspace URL" error={phase === 1 ? "Use lowercase letters" : undefined} required testID={testID}>
          <Input small readOnly value={["studio", "Studio", "studio", "workspace"][phase]} />
        </Field>
      </ShowcaseSlot>;
    case "toast":
      return <Toast brief success={phase >= 2} info={phase < 2} message={["Sync queued", "Syncing files", "Files synced", "All caught up"][phase]!} testID={testID} />;
    case "alert":
      return <Alert info={phase < 2} success={phase >= 2} title={["Review started", "Checking changes", "Checks passed", "Ready for review"][phase]} testID={testID} />;
    case "steps":
      return <Steps segmented steps={[{ label: "Draft" }, { label: "Review" }, { label: "Publish" }]} current={step % 3} testID={testID} />;
    case "uptime-bar":
      return <UptimeBar compact label="API uptime" caption="Last 30 days"
        periods={Array.from({ length: 30 }, (_, day) => ({ degraded: day === 8 + 5 * phase }))}
        testID={testID} />;
    case "avatar-menu":
      return <AvatarMenu name={PORTRAITS[phase]!.name} open={false}
        items={[{ label: "Account", icon: "user" }, { label: "Settings", icon: "settings" }]} testID={testID} />;
    case "dropdown":
      return <Dropdown compact open={false} trigger={phase % 2 === 0 ? "Share" : "Send to"} items={[{ label: "Copy link", icon: "link" }, { label: "Invite", icon: "userPlus" }]} testID={testID} />;
    case "row-menu":
      return <ShowcaseSlot width={142}>
        <RowMenu inline items={[phase % 2 === 0 ? { label: "Duplicate", icon: "copy" } : { label: "Rename", icon: "pencil" }]} testID={testID} />
      </ShowcaseSlot>;
    case "bookmark":
      return <Button small icon outline selected={phase % 2 === 1} iconLeft={phase % 2 === 1 ? <Icon check /> : <Icon bookmark />} accessibilityLabel={phase % 2 === 1 ? "Bookmarked" : "Bookmark"} testID={testID} />;
  }
}

function specimens(kinds: readonly SpecimenKind[]): ReactNode[] {
  return kinds.map(kind => <ShowcaseSpecimen key={kind} kind={kind} />);
}

/** The center accepts large specimens and each surrounding slot has its own pool. */
export function useHeroShowcasePanels(): PanelPools {
  return {
    revenue: [
      ...HERO_CHART_KINDS.map(kind => <HeroChartSpecimen key={kind} kind={kind} />),
      <HeroSkeletonSpecimen key="skeleton" />,
      ...HERO_DATA_KINDS.map(kind => <HeroDataSpecimen key={kind} kind={kind} />),
      ...HERO_OVERLAY_KINDS.map(kind => <HeroOverlaySpecimen key={kind} kind={kind} />),
      ...HERO_FORM_NAV_CENTER.map(kind => <HeroFormNavigationSpecimen key={kind} kind={kind} />),
    ],
    segmented: specimens(HERO_SURROUNDING_KINDS.segmented),
    online: specimens(HERO_SURROUNDING_KINDS.online),
    glass: [...specimens(HERO_SURROUNDING_KINDS.glass), <HeroFormNavigationSpecimen key="text-input" kind="text-input" />],
    toast: [...specimens(HERO_SURROUNDING_KINDS.toast), <HeroFormNavigationSpecimen key="navbars" kind="navbars" />, <HeroFormNavigationSpecimen key="tab-bar" kind="tab-bar" />],
    ship: specimens(HERO_SURROUNDING_KINDS.ship),
  };
}
