import { useContext, useEffect, useState, type ReactNode } from "react";
import {
  AreaChart, Avatar, AvatarGroup, Badge, BarList, Breadcrumb, Button, ButtonGroup,
  Checkbox, Chip, Emblem, Gauge, Heatmap, Icon, Input, InputOTP,
  Progress, Slider, Sparkline, StackedBar, Stepper, Swatch,
  Switch, View, useTheme,
} from "@nannier/canvas";
import { ShowcaseActivity } from "./hero-showcase-activity";
import type { CollagePanelId } from "./library-hero-look";

type PanelSet = Record<CollagePanelId, ReactNode>;
type SpecimenKind = "area" | "input" | "chip" | "slider" | "progress" | "create"
  | "bars" | "segments" | "avatars" | "switch" | "stepper" | "favorite"
  | "gauge" | "otp" | "badge" | "checkbox" | "stacked" | "export"
  | "heatmap" | "breadcrumb" | "emblem" | "swatch" | "sparkline" | "launch";

// The scene supplies definite bounds to fill-sized controls. This transparent
// wrapper paints no surface and leaves every specimen's actual kit skin intact.
function ShowcaseSlot({ width, children }: { width: number; children: ReactNode }) {
  return <View style={{ width }}>{children}</View>;
}

// Only visible specimens run a clock. Pausing or hiding a specimen freezes its
// current demonstration; resuming continues from that frame. Reduced Motion
// starts with the meaningful static first frame, without leaving a timer behind.
function useDemonstrationStep(period: number) {
  const active = useContext(ShowcaseActivity);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setStep(previous => (previous + 1) % 120), period);
    return () => clearInterval(timer);
  }, [active, period]);
  return step;
}

function ShowcaseSpecimen({ kind }: { kind: SpecimenKind }) {
  const active = useContext(ShowcaseActivity);
  const step = useDemonstrationStep(kind === "input" || kind === "otp" ? 280 : 1100);
  const phase = step % 4;
  const { tokens } = useTheme();
  switch (kind) {
    case "area": return <AreaChart title="Growing together" curved hideLegend labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]} series={[
      { label: "Projects", values: [24, 38, 32, 51, 62, 76].map((value, i) => value + ((i * 3 + phase * 5) % 15)) },
      { label: "Teams", values: [12, 19, 24, 28, 42, 48].map((value, i) => value + ((i * 2 + phase * 3) % 10)) },
    ]} />;
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
    case "bars": return <BarList title="Top projects" items={[{ label: "Studio", value: 18400 + phase * 1200, delta: "+12%" }, { label: "Workspace", value: 12100 + phase * 1800, delta: "+8%" }, { label: "Launchpad", value: 8700 + phase * 2200, delta: "+24%" }]} />;
    case "segments": return <ButtonGroup small compact block items={["Overview", "Activity", "Team"]} active={step % 3} />;
    case "avatars": return <AvatarGroup small max={4} total={phase + 3}><Avatar initials="AN" hue={285} /><Avatar initials="JK" hue={165} />{phase >= 1 ? <Avatar initials="MR" hue={20} /> : null}{phase >= 2 ? <Avatar initials="LP" hue={205} /> : null}</AvatarGroup>;
    case "switch": return <Switch small checked={phase % 2 === 0}>Keep me in the loop</Switch>;
    case "stepper": return <Stepper small value={[8, 9, 10, 9][phase]} min={1} max={24} suffix="team seats" />;
    case "favorite": return <Button secondary small selected={phase % 2 === 1} iconLeft={phase % 2 === 1 ? <Icon check /> : <Icon heart />}>{phase % 2 === 1 ? "Saved" : "Save"}</Button>;
    case "gauge": return <Gauge large success value={[92, 78, 86, 100][phase]!} label="Ready for launch" />;
    case "otp": return <InputOTP small length={6} groups={3} value={step % 12 === 0 ? "482916" : "482916".slice(0, Math.min(6, step % 12 - 1))} />;
    case "badge": return <Badge small status success={phase >= 2} warning={phase === 1} primary={phase === 0}>{["Draft saved", "In review", "Approved", "Published"][phase]}</Badge>;
    case "checkbox": return <Checkbox checked={phase !== 1} indeterminate={phase === 3}>Ready to publish</Checkbox>;
    case "stacked": return <StackedBar label="Project storage" max={100} segments={[{ label: "Images", value: 34 + phase * 4 }, { label: "Video", value: 22 + phase * 2 }, { label: "Files", value: 12 + phase }]} />;
    case "export": return <Button secondary small loading={active && phase === 1} iconLeft={phase === 1 ? <Icon clock /> : phase === 2 ? <Icon check /> : <Icon download />}>{phase === 1 ? "Exporting" : phase === 2 ? "Exported" : "Export"}</Button>;
    case "heatmap": return <Heatmap label="A little progress, every day" values={Array.from({ length: 182 }, (_, i) => ((i * 17 + i * i + phase * 7) % 29) / 28)} />;
    case "breadcrumb": return <Breadcrumb items={[["Studio", "Projects", "Canvas"], ["Studio", "Projects", "Orbit"], ["Studio", "Projects", "Atlas"], ["Studio", "Projects", "Canvas"]][phase]!} slash />;
    case "emblem": return <Emblem small cyan={phase < 2} success={phase >= 2}>{phase < 2 ? <Icon shield /> : <Icon check />}</Emblem>;
    case "swatch": {
      const colors = [tokens.primary, tokens["chart-2"], tokens["chart-3"], tokens["chart-4"], tokens["chart-5"]];
      return <ShowcaseSlot width={286}><Swatch small steps={colors.map((_, i) => colors[(i + phase) % colors.length]!)} segmented>Your palette. Your personality.</Swatch></ShowcaseSlot>;
    }
    case "sparkline": return <Sparkline compact line track values={[12, 18, 15, 29, 26, 35, 30, 48, 42, 56, 52, 70].map((value, i) => value + ((i * 3 + phase * 7) % 19))} accessibilityLabel="Visits trending upward" />;
    case "launch": return <Button primary small loading={active && phase === 1} iconRight={phase === 1 ? <Icon clock /> : phase === 2 ? <Icon check /> : <Icon arrowRight />}>{phase === 1 ? "Launching" : phase === 2 ? "Launched" : "Launch"}</Button>;
  }
}

/** Individual specimens grouped by compatible scene slot, not by transition.
 * The collage independently chooses one slot and one replacement at a time. */
export function useHeroShowcasePanels(): PanelSet[] {
  return [
    { revenue: <ShowcaseSpecimen kind="area" />, segmented: <ShowcaseSpecimen kind="input" />, online: <ShowcaseSpecimen kind="chip" />, glass: <ShowcaseSpecimen kind="slider" />, toast: <ShowcaseSpecimen kind="progress" />, ship: <ShowcaseSpecimen kind="create" /> },
    { revenue: <ShowcaseSpecimen kind="bars" />, segmented: <ShowcaseSpecimen kind="segments" />, online: <ShowcaseSpecimen kind="avatars" />, glass: <ShowcaseSpecimen kind="switch" />, toast: <ShowcaseSpecimen kind="stepper" />, ship: <ShowcaseSpecimen kind="favorite" /> },
    { revenue: <ShowcaseSpecimen kind="gauge" />, segmented: <ShowcaseSpecimen kind="otp" />, online: <ShowcaseSpecimen kind="badge" />, glass: <ShowcaseSpecimen kind="checkbox" />, toast: <ShowcaseSpecimen kind="stacked" />, ship: <ShowcaseSpecimen kind="export" /> },
    { revenue: <ShowcaseSpecimen kind="heatmap" />, segmented: <ShowcaseSpecimen kind="breadcrumb" />, online: <ShowcaseSpecimen kind="emblem" />, glass: <ShowcaseSpecimen kind="swatch" />, toast: <ShowcaseSpecimen kind="sparkline" />, ship: <ShowcaseSpecimen kind="launch" /> },
  ];
}
