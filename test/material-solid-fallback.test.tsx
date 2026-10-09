import { afterEach, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Glob } from "bun";
import { cleanup, fireEvent, render, type RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import {
  Alert, Autocomplete, Avatar, AvatarGroup, Badge, BarList, BoxPlot, BulletChart, Button, Calendar, CandlestickChart, Card,
  Carousel, Chart, Checkbox, Chip, DataTable, DepthChart, Emblem, FilterPanel, FunnelChart, GeoMap, Histogram, Icon, Input,
  InputOTP, Kbd, LineChart, Listbox, MediaObject, MetricBreakdown, Navbar, Pagination, PhoneInput, Progress, RadarChart, Radio,
  RadioGroup, RangeAreaChart, ScatterPlot, Select, ServiceHealthList, Sidebar, Skeleton, Slider, Stats, Stepper, Steps, Switch,
  TabBar, Tabs, Textarea, Tooltip, Treemap, Video, WaterfallChart,
} from "../src/index.ts";
import { Chip as AndroidChip } from "../src/atoms/chip/chip.android.tsx";
import { Badge as AndroidBadge } from "../src/atoms/badge/badge.android.tsx";
import { Kbd as AndroidKbd } from "../src/atoms/kbd/kbd.android.tsx";
import { ChartValueFlag } from "../src/charts/shared/chart-inspect.tsx";
import { LOOKS, lookProps } from "./fixtures/looks.ts";

// Missing material restores the complete solid treatment (CLAUDE.md, the glass model).
// Wherever glass is requested but cannot render, every surface that paints a GlassPane
// behind its content must render exactly what `<ThemeProvider solid>` renders: its own
// fill and border, and no pane. The web reproduces the state with a browser that has no
// backdrop filter; Android reaches the same resolution for every surface in the page,
// which has no capture plane it may safely sample (missing-target), and iOS for a static
// surface without expo-blur. A pane that still mounted there painted a raw copy of its
// shape inside the host: Android's default black ring where the shape names a border
// width and no colour (Chip, Badge, Kbd), a doubled hairline where it names one.
//
// Every kit file that renders a GlassPane has a host here, so a new one is held to the
// rule from its first commit.

afterEach(cleanup);

const ROOT = join(import.meta.dir, "..");

// The browser's one material question: does it render a CSS backdrop filter?
function browserSupport(enabled: boolean) {
  const css = Object.getOwnPropertyDescriptor(globalThis, "CSS");
  Object.defineProperty(globalThis, "CSS", { value: { supports: () => enabled }, configurable: true });
  return () => {
    if (css) Object.defineProperty(globalThis, "CSS", css);
    else delete (globalThis as Record<string, unknown>).CSS;
  };
}

interface Host {
  /** The kit file whose GlassPane this host mounts. */
  file: string;
  name: string;
  node: ReactNode;
  /** Brings the pane on screen (an editor opened by a click). */
  act?: (result: RenderResult) => void;
}

const days = Array.from({ length: 45 }, () => ({}));
const HOSTS: Host[] = [
  { file: "src/atoms/autocomplete/autocomplete.shared.tsx", name: "Autocomplete", node: <Autocomplete label="Assigned to" options={["Ada Lovelace", "Grace Hopper"]} /> },
  { file: "src/atoms/avatar/avatar.shared.tsx", name: "Avatar tile and group overflow", node: <><Avatar /><AvatarGroup max={1}><Avatar name="Ada Lovelace" /><Avatar name="Grace Hopper" /></AvatarGroup></> },
  { file: "src/atoms/badge/badge.shared.tsx", name: "Badge", node: <><Badge>admin</Badge><Badge success>Live</Badge><Badge status success>Healthy</Badge></> },
  { file: "src/atoms/badge/badge.shared.tsx", name: "Android Badge", node: <><AndroidBadge>admin</AndroidBadge><AndroidBadge success>Live</AndroidBadge></> },
  { file: "src/atoms/button/button.shared.tsx", name: "Button", node: <><Button primary>Save</Button><Button secondary>Cancel</Button></> },
  { file: "src/atoms/checkbox/indicator/shared.tsx", name: "Checkbox", node: <><Checkbox defaultChecked>Email</Checkbox><Checkbox>SMS</Checkbox></> },
  { file: "src/atoms/chip/chip.shared.tsx", name: "Chip", node: <><Chip>Neutral</Chip><Chip success>Healthy</Chip></> },
  { file: "src/atoms/chip/chip.shared.tsx", name: "Android Chip", node: <><AndroidChip>Neutral</AndroidChip><AndroidChip success>Healthy</AndroidChip></> },
  { file: "src/atoms/emblem/emblem.shared.tsx", name: "Emblem", node: <Emblem><Icon shield /></Emblem> },
  { file: "src/atoms/input-otp/input-otp.shared.tsx", name: "InputOTP", node: <InputOTP /> },
  { file: "src/atoms/input/input.shared.tsx", name: "Input", node: <><Input label="Name" /><Input label="Price" prefix="$" /></> },
  { file: "src/atoms/kbd/kbd.shared.tsx", name: "Kbd", node: <Kbd keys="⌘ K" /> },
  { file: "src/atoms/kbd/kbd.shared.tsx", name: "Android Kbd", node: <AndroidKbd keys="⌘ K" /> },
  { file: "src/atoms/listbox/listbox.shared.tsx", name: "Listbox", node: <Listbox bordered accessibilityLabel="Teams" items={[{ label: "Backend", selected: true }, { label: "Design" }]} /> },
  { file: "src/atoms/pagination/pagination.shared.tsx", name: "Pagination", node: <Pagination defaultPage={2} total={5} /> },
  { file: "src/atoms/progress/progress.shared.tsx", name: "Progress", node: <Progress accessibilityLabel="Upload" value={0.6} /> },
  { file: "src/atoms/radio/radio.shared.tsx", name: "Radio", node: <RadioGroup defaultValue="pro"><Radio value="hobby">Hobby</Radio><Radio value="pro" card>Pro</Radio></RadioGroup> },
  { file: "src/atoms/select/select.shared.tsx", name: "Select", node: <Select label="Country" defaultValue="Canada" options={["Canada", "Mexico"]} /> },
  { file: "src/atoms/skeleton/skeleton.shared.tsx", name: "Skeleton", node: <Skeleton card /> },
  { file: "src/atoms/slider/slider.shared.tsx", name: "Slider", node: <Slider defaultValue={40} accessibilityLabel="Volume" /> },
  { file: "src/atoms/stepper/stepper.shared.tsx", name: "Stepper", node: <Stepper defaultValue={3} max={10} /> },
  { file: "src/atoms/switch/switch.shared.tsx", name: "Switch", node: <><Switch defaultChecked>Live</Switch><Switch>Muted</Switch></> },
  { file: "src/atoms/textarea/textarea.shared.tsx", name: "Textarea", node: <Textarea label="Notes" /> },
  { file: "src/atoms/tooltip/tooltip.shared.tsx", name: "Tooltip", node: <Tooltip label="Open settings" trigger="Settings" open /> },
  { file: "src/atoms/video/video.controls.tsx", name: "Video controls", node: <Video source={{ uri: "/clip.mp4" }} accessibilityLabel="Clip" controls /> },
  { file: "src/charts/bar-list/bar-list.shared.tsx", name: "BarList", node: <BarList title="Top pages" items={[{ label: "/pricing", value: 18400 }, { label: "/docs", value: 12100 }]} /> },
  { file: "src/charts/box-plot/box-plot.shared.tsx", name: "BoxPlot", node: <BoxPlot title="Latency" data={[{ label: "us-east", values: [42, 38, 51, 44, 47] }]} /> },
  { file: "src/charts/bullet-chart/bullet-chart.shared.tsx", name: "BulletChart", node: <BulletChart title="Targets" data={[{ label: "Revenue", value: 275, target: 300, ranges: [200, 350, 500] }]} /> },
  { file: "src/charts/candlestick-chart/candlestick-chart.shared.tsx", name: "CandlestickChart", node: <CandlestickChart title="OLY" labels={["D1", "D2"]} candles={[{ open: 64, high: 64.3, low: 62.7, close: 63.5 }, { open: 63.5, high: 64.6, low: 63.2, close: 63.9 }]} /> },
  { file: "src/charts/chart/chart.shared.tsx", name: "Chart", node: <Chart title="Signups" data={[{ label: "Mon", value: 45 }, { label: "Tue", value: 60 }]} max={100} /> },
  { file: "src/charts/depth-chart/depth-chart.shared.tsx", name: "DepthChart", node: <DepthChart title="Book" bids={[{ price: 191.3, size: 80 }, { price: 191.15, size: 120 }]} asks={[{ price: 191.6, size: 90 }, { price: 191.75, size: 122 }]} /> },
  { file: "src/charts/funnel-chart/funnel-chart.shared.tsx", name: "FunnelChart", node: <FunnelChart stages={[{ label: "Visits", value: 12400 }, { label: "Paid", value: 480 }]} /> },
  { file: "src/charts/geo-map/geo-map.shared.tsx", name: "GeoMap", node: <GeoMap title="Installs" points={[{ label: "London", lat: 51.5072, lng: -0.1276, count: 5170 }]} /> },
  { file: "src/charts/histogram/histogram.shared.tsx", name: "Histogram", node: <Histogram title="Response times" label="Latency ms" values={[42, 38, 51, 44, 47, 39]} /> },
  { file: "src/charts/metric-breakdown/metric-breakdown.shared.tsx", name: "MetricBreakdown", node: <MetricBreakdown value="3,771" label="Tokens" breakdown={[{ label: "code", value: 1842 }, { label: "refresh", value: 1264 }]} /> },
  { file: "src/charts/radar-chart/radar-chart.shared.tsx", name: "RadarChart", node: <RadarChart title="Skills" axes={["A", "B", "C"]} series={[{ label: "Casey", values: [8, 6, 9] }]} /> },
  { file: "src/charts/range-area-chart/range-area-chart.shared.tsx", name: "RangeAreaChart", node: <RangeAreaChart label="p50 to p99" labels={["Mon", "Tue"]} data={[{ low: 42, high: 118, mid: 61 }, { low: 38, high: 102, mid: 55 }]} /> },
  { file: "src/charts/scatter-plot/scatter-plot.shared.tsx", name: "ScatterPlot", node: <ScatterPlot title="Load" series={[{ label: "us-east", points: [{ x: 94, y: 20 }, { x: 220, y: 37 }] }]} /> },
  { file: "src/charts/service-health-list/service-health-list.shared.tsx", name: "ServiceHealthList", node: <ServiceHealthList title="Status" items={[{ label: "API", detail: "99.98%", periods: days }]} /> },
  { file: "src/charts/shared/cartesian-series.tsx", name: "LineChart", node: <LineChart title="Users" labels={["Jan", "Feb"]} series={[{ label: "Web", values: [119, 122] }]} /> },
  { file: "src/charts/shared/chart-inspect.tsx", name: "Chart value flag", node: <ChartValueFlag title="May" rows={[{ label: "Web", value: "182" }]} x={40} plotW={320} /> },
  { file: "src/charts/treemap/treemap.shared.tsx", name: "Treemap", node: <Treemap title="Storage" data={[{ label: "Media", value: 620 }, { label: "Logs", value: 180 }]} /> },
  { file: "src/charts/waterfall-chart/waterfall-chart.shared.tsx", name: "WaterfallChart", node: <WaterfallChart title="Bridge" steps={[{ label: "Q2", value: 4200, total: true }, { label: "New", value: 980 }, { label: "Q3", total: true }]} /> },
  { file: "src/molecules/alert/alert.shared.tsx", name: "Alert", node: <><Alert title="Heads up" description="Maintenance on Sunday." /><Alert success title="Saved" description="All changes stored." /></> },
  { file: "src/molecules/card/card.shared.tsx", name: "Card", node: <><Card onPress={() => {}}><Text>Content</Text></Card><Card selected onPress={() => {}}><Text>Picked</Text></Card></> },
  { file: "src/molecules/media-objects/media-objects.shared.tsx", name: "MediaObject", node: <MediaObject avatar="RC" title="Rachel Chen" description="Lead" body="Reviewed the change." bordered onPress={() => {}} /> },
  { file: "src/molecules/phone-input/phone-input.shared.tsx", name: "PhoneInput", node: <PhoneInput label="Phone number" /> },
  { file: "src/molecules/stats/stats.shared.tsx", name: "Stats", node: <Stats onPressItem={() => {}} items={[{ label: "Active users", value: "71,897" }]} /> },
  { file: "src/organisms/calendar/calendar.shared.tsx", name: "Calendar", node: <Calendar month="May 2026" today={23} defaultSelected={24} daysInMonth={31} startWeekday={4} /> },
  { file: "src/organisms/carousel/carousel.shared.tsx", name: "Carousel", node: <Carousel showArrows items={[{ key: "one", content: "Slide 1" }, { key: "two", content: "Slide 2" }]} /> },
  {
    file: "src/organisms/data-table/data-table.shared.tsx",
    name: "DataTable editor",
    node: <DataTable columns={["Name", "Role"]} rows={[["Ada", "Engineer"]]} inlineEdit onCellCommit={() => {}} />,
    act: (result) => { fireEvent.click(result.getByText("Ada")); },
  },
  { file: "src/organisms/filter-panel/filter-panel.shared.tsx", name: "FilterPanel", node: <FilterPanel bordered groups={[{ title: "Status", options: [{ label: "Active", checked: true }, { label: "Archived" }] }]} /> },
  { file: "src/organisms/navbars/navbars.shared.tsx", name: "Navbar", node: <Navbar brand="Canvas" links={["Dashboard", "Users"]} actionLabel="New" /> },
  { file: "src/organisms/sidebar/sidebar.shared.tsx", name: "Sidebar", node: <Sidebar defaultActive="Dashboard" items={[{ label: "Dashboard" }, { label: "Inbox" }]} /> },
  { file: "src/organisms/steps/steps.shared.tsx", name: "Steps", node: <Steps steps={[{ label: "Account" }, { label: "Profile" }, { label: "Review" }]} defaultCurrent={1} /> },
  { file: "src/organisms/tab-bar/tab-bar.shared.tsx", name: "TabBar", node: <TabBar items={[{ key: "home", label: "Home", icon: () => <Icon home size={22} /> }, { key: "search", label: "Search", icon: () => <Icon search size={22} /> }]} /> },
  { file: "src/organisms/tabs/tabs.shared.tsx", name: "Tabs", node: <Tabs tabs={["General", "Security"]} /> },
];

// React's ids (useId) count up across mounts, so two renders of one tree differ only in
// them; number each distinct id by its first appearance before comparing.
function normalized(html: string): string {
  const ids = new Map<string, string>();
  return html.replace(/«[^»]*»|:r[0-9a-z]+:|_r_[0-9a-z]+_/g, (id) => {
    if (!ids.has(id)) ids.set(id, `id${ids.size}`);
    return ids.get(id)!;
  });
}

function markup(host: Host, look: (typeof LOOKS)[number], glass: boolean): { html: string; materials: number } {
  const result = render(<ThemeProvider {...lookProps(look)} glass={glass} solid={!glass}>{host.node}</ThemeProvider>);
  host.act?.(result);
  const out = { html: normalized(result.container.innerHTML), materials: result.container.querySelectorAll('[data-testid="glass-material"]').length };
  result.unmount();
  return out;
}

describe("a requested glass that cannot render restores the complete solid skin", () => {
  it("has a host for every kit file that renders a GlassPane", () => {
    const panes = [...new Glob("src/**/*.tsx").scanSync(ROOT)]
      .filter((file) => !file.endsWith("glass-pane.tsx") && readFileSync(join(ROOT, file), "utf8").includes("<GlassPane"))
      .sort();
    expect(panes.length).toBeGreaterThan(40);
    expect(panes.filter((file) => !HOSTS.some((host) => host.file === file))).toEqual([]);
  });

  for (const host of HOSTS) {
    for (const look of LOOKS) {
      it(`${host.name} in ${look.name}`, () => {
        const solid = markup(host, look, false);
        const restore = browserSupport(false);
        try {
          const fallback = markup(host, look, true);
          expect(fallback.materials).toBe(0);
          expect(fallback.html).toBe(solid.html);
        } finally { restore(); }
      });
    }
  }

  it("still mounts the material where it renders, so the comparison is not vacuous", () => {
    const restore = browserSupport(true);
    try {
      for (const host of HOSTS.filter((h) => /^(Chip|Android Chip|Badge|Kbd|Input|Card|MediaObject|Stats)$/.test(h.name))) {
        expect(markup(host, LOOKS[0]!, true).materials, host.name).toBeGreaterThan(0);
      }
    } finally { restore(); }
  });
});
