import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Children, cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { Text, TextInput, View, type ViewStyle } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { GlassPane, paneStyle, PANE_SIBLING_INPUT } from "../src/style/glass-surface/glass-pane.tsx";
import { ButtonGroup } from "../src/atoms/button-group/button-group.tsx";
import { contrastBorderFor } from "../src/style/glass-surface/glass-surface.shared.tsx";
import { Radio, RadioGroup } from "../src/atoms/radio/radio.tsx";
import { Steps } from "../src/organisms/steps/steps.tsx";
import * as kit from "../src/index.ts";
import { PANE_HOSTS, type PaneHost } from "./fixtures/pane-hosts.tsx";
import { Autocomplete as IosAutocomplete } from "../src/atoms/autocomplete/autocomplete.ios.tsx";
import { Avatar as IosAvatar, AvatarGroup as IosAvatarGroup } from "../src/atoms/avatar/avatar.ios.tsx";
import { Badge as IosBadge } from "../src/atoms/badge/badge.ios.tsx";
import { Button as IosButton } from "../src/atoms/button/button.ios.tsx";
import { Checkbox as IosCheckbox } from "../src/atoms/checkbox/checkbox.ios.tsx";
import { Chip as IosChip } from "../src/atoms/chip/chip.ios.tsx";
import { Emblem as IosEmblem } from "../src/atoms/emblem/emblem.ios.tsx";
import { InputOTP as IosInputOTP } from "../src/atoms/input-otp/input-otp.ios.tsx";
import { Input as IosInput } from "../src/atoms/input/input.ios.tsx";
import { Kbd as IosKbd } from "../src/atoms/kbd/kbd.ios.tsx";
import { Listbox as IosListbox } from "../src/atoms/listbox/listbox.ios.tsx";
import { Pagination as IosPagination } from "../src/atoms/pagination/pagination.ios.tsx";
import { Progress as IosProgress } from "../src/atoms/progress/progress.ios.tsx";
import { Radio as IosRadio, RadioGroup as IosRadioGroup } from "../src/atoms/radio/radio.ios.tsx";
import { Select as IosSelect } from "../src/atoms/select/select.ios.tsx";
import { Skeleton as IosSkeleton } from "../src/atoms/skeleton/skeleton.ios.tsx";
import { Slider as IosSlider } from "../src/atoms/slider/slider.ios.tsx";
import { Stepper as IosStepper } from "../src/atoms/stepper/stepper.ios.tsx";
import { Switch as IosSwitch } from "../src/atoms/switch/switch.ios.tsx";
import { Textarea as IosTextarea } from "../src/atoms/textarea/textarea.ios.tsx";
import { Tooltip as IosTooltip } from "../src/atoms/tooltip/tooltip.ios.tsx";
import { Video as IosVideo } from "../src/atoms/video/video.ios.tsx";
import { BarList as IosBarList } from "../src/charts/bar-list/bar-list.ios.tsx";
import { BoxPlot as IosBoxPlot } from "../src/charts/box-plot/box-plot.ios.tsx";
import { BulletChart as IosBulletChart } from "../src/charts/bullet-chart/bullet-chart.ios.tsx";
import { CandlestickChart as IosCandlestickChart } from "../src/charts/candlestick-chart/candlestick-chart.ios.tsx";
import { Chart as IosChart } from "../src/charts/chart/chart.ios.tsx";
import { DepthChart as IosDepthChart } from "../src/charts/depth-chart/depth-chart.ios.tsx";
import { FunnelChart as IosFunnelChart } from "../src/charts/funnel-chart/funnel-chart.ios.tsx";
import { GeoMap as IosGeoMap } from "../src/charts/geo-map/geo-map.ios.tsx";
import { Histogram as IosHistogram } from "../src/charts/histogram/histogram.ios.tsx";
import { LineChart as IosLineChart } from "../src/charts/line-chart/line-chart.ios.tsx";
import { MetricBreakdown as IosMetricBreakdown } from "../src/charts/metric-breakdown/metric-breakdown.ios.tsx";
import { RadarChart as IosRadarChart } from "../src/charts/radar-chart/radar-chart.ios.tsx";
import { RangeAreaChart as IosRangeAreaChart } from "../src/charts/range-area-chart/range-area-chart.ios.tsx";
import { ScatterPlot as IosScatterPlot } from "../src/charts/scatter-plot/scatter-plot.ios.tsx";
import { ServiceHealthList as IosServiceHealthList } from "../src/charts/service-health-list/service-health-list.ios.tsx";
import { Treemap as IosTreemap } from "../src/charts/treemap/treemap.ios.tsx";
import { WaterfallChart as IosWaterfallChart } from "../src/charts/waterfall-chart/waterfall-chart.ios.tsx";
import { Alert as IosAlert } from "../src/molecules/alert/alert.ios.tsx";
import { Card as IosCard } from "../src/molecules/card/card.ios.tsx";
import { MediaObject as IosMediaObject } from "../src/molecules/media-objects/media-objects.ios.tsx";
import { PhoneInput as IosPhoneInput } from "../src/molecules/phone-input/phone-input.ios.tsx";
import { Stats as IosStats } from "../src/molecules/stats/stats.ios.tsx";
import { Calendar as IosCalendar } from "../src/organisms/calendar/calendar.ios.tsx";
import { Carousel as IosCarousel } from "../src/organisms/carousel/carousel.ios.tsx";
import { DataTable as IosDataTable } from "../src/organisms/data-table/data-table.ios.tsx";
import { FilterPanel as IosFilterPanel } from "../src/organisms/filter-panel/filter-panel.ios.tsx";
import { Navbar as IosNavbar } from "../src/organisms/navbars/navbars.ios.tsx";
import { Sidebar as IosSidebar } from "../src/organisms/sidebar/sidebar.ios.tsx";
import { Steps as IosSteps } from "../src/organisms/steps/steps.ios.tsx";
import { TabBar as IosTabBar } from "../src/organisms/tab-bar/tab-bar.ios.tsx";
import { Tabs as IosTabs } from "../src/organisms/tabs/tabs.ios.tsx";
import { Autocomplete as AndroidAutocomplete } from "../src/atoms/autocomplete/autocomplete.android.tsx";
import { Avatar as AndroidAvatar, AvatarGroup as AndroidAvatarGroup } from "../src/atoms/avatar/avatar.android.tsx";
import { Badge as AndroidBadge } from "../src/atoms/badge/badge.android.tsx";
import { Button as AndroidButton } from "../src/atoms/button/button.android.tsx";
import { Checkbox as AndroidCheckbox } from "../src/atoms/checkbox/checkbox.android.tsx";
import { Chip as AndroidChip } from "../src/atoms/chip/chip.android.tsx";
import { Emblem as AndroidEmblem } from "../src/atoms/emblem/emblem.android.tsx";
import { InputOTP as AndroidInputOTP } from "../src/atoms/input-otp/input-otp.android.tsx";
import { Input as AndroidInput } from "../src/atoms/input/input.android.tsx";
import { Kbd as AndroidKbd } from "../src/atoms/kbd/kbd.android.tsx";
import { Listbox as AndroidListbox } from "../src/atoms/listbox/listbox.android.tsx";
import { Pagination as AndroidPagination } from "../src/atoms/pagination/pagination.android.tsx";
import { Progress as AndroidProgress } from "../src/atoms/progress/progress.android.tsx";
import { Radio as AndroidRadio, RadioGroup as AndroidRadioGroup } from "../src/atoms/radio/radio.android.tsx";
import { Select as AndroidSelect } from "../src/atoms/select/select.android.tsx";
import { Skeleton as AndroidSkeleton } from "../src/atoms/skeleton/skeleton.android.tsx";
import { Slider as AndroidSlider } from "../src/atoms/slider/slider.android.tsx";
import { Stepper as AndroidStepper } from "../src/atoms/stepper/stepper.android.tsx";
import { Switch as AndroidSwitch } from "../src/atoms/switch/switch.android.tsx";
import { Textarea as AndroidTextarea } from "../src/atoms/textarea/textarea.android.tsx";
import { Tooltip as AndroidTooltip } from "../src/atoms/tooltip/tooltip.android.tsx";
import { Video as AndroidVideo } from "../src/atoms/video/video.android.tsx";
import { BarList as AndroidBarList } from "../src/charts/bar-list/bar-list.android.tsx";
import { BoxPlot as AndroidBoxPlot } from "../src/charts/box-plot/box-plot.android.tsx";
import { BulletChart as AndroidBulletChart } from "../src/charts/bullet-chart/bullet-chart.android.tsx";
import { CandlestickChart as AndroidCandlestickChart } from "../src/charts/candlestick-chart/candlestick-chart.android.tsx";
import { Chart as AndroidChart } from "../src/charts/chart/chart.android.tsx";
import { DepthChart as AndroidDepthChart } from "../src/charts/depth-chart/depth-chart.android.tsx";
import { FunnelChart as AndroidFunnelChart } from "../src/charts/funnel-chart/funnel-chart.android.tsx";
import { GeoMap as AndroidGeoMap } from "../src/charts/geo-map/geo-map.android.tsx";
import { Histogram as AndroidHistogram } from "../src/charts/histogram/histogram.android.tsx";
import { LineChart as AndroidLineChart } from "../src/charts/line-chart/line-chart.android.tsx";
import { MetricBreakdown as AndroidMetricBreakdown } from "../src/charts/metric-breakdown/metric-breakdown.android.tsx";
import { RadarChart as AndroidRadarChart } from "../src/charts/radar-chart/radar-chart.android.tsx";
import { RangeAreaChart as AndroidRangeAreaChart } from "../src/charts/range-area-chart/range-area-chart.android.tsx";
import { ScatterPlot as AndroidScatterPlot } from "../src/charts/scatter-plot/scatter-plot.android.tsx";
import { ServiceHealthList as AndroidServiceHealthList } from "../src/charts/service-health-list/service-health-list.android.tsx";
import { Treemap as AndroidTreemap } from "../src/charts/treemap/treemap.android.tsx";
import { WaterfallChart as AndroidWaterfallChart } from "../src/charts/waterfall-chart/waterfall-chart.android.tsx";
import { Alert as AndroidAlert } from "../src/molecules/alert/alert.android.tsx";
import { Card as AndroidCard } from "../src/molecules/card/card.android.tsx";
import { MediaObject as AndroidMediaObject } from "../src/molecules/media-objects/media-objects.android.tsx";
import { PhoneInput as AndroidPhoneInput } from "../src/molecules/phone-input/phone-input.android.tsx";
import { Stats as AndroidStats } from "../src/molecules/stats/stats.android.tsx";
import { Calendar as AndroidCalendar } from "../src/organisms/calendar/calendar.android.tsx";
import { Carousel as AndroidCarousel } from "../src/organisms/carousel/carousel.android.tsx";
import { DataTable as AndroidDataTable } from "../src/organisms/data-table/data-table.android.tsx";
import { FilterPanel as AndroidFilterPanel } from "../src/organisms/filter-panel/filter-panel.android.tsx";
import { Navbar as AndroidNavbar } from "../src/organisms/navbars/navbars.android.tsx";
import { Sidebar as AndroidSidebar } from "../src/organisms/sidebar/sidebar.android.tsx";
import { Steps as AndroidSteps } from "../src/organisms/steps/steps.android.tsx";
import { TabBar as AndroidTabBar } from "../src/organisms/tab-bar/tab-bar.android.tsx";
import { Tabs as AndroidTabs } from "../src/organisms/tabs/tabs.android.tsx";

// GlassPane's geometry (the owner's GP-1 decision, audit/DECISIONS.md): under glass the
// material covers a control's whole solid footprint, as Dark Factory's glass does. The pane
// fills its host's padding box and copies no border of its own; `paneStyle` turns the host's
// resting border into padding of the same width, so the layout does not move and the padding
// box is the footprint. A state border stays a border over the pane, which sits flush inside
// it with concentric corners. A pane beside a text field covers the borderless wrapper the
// field fills, and the field's own state border paints over it. In solid mode none of it
// exists: the pane renders nothing and the host keeps its style untouched.
//
// happy-dom computes no layout, so the boxes are read the way the browser resolves them: an
// absolutely filled child lies on its parent's padding box, so a box is its parent's box
// less the parent's border on each side.

afterEach(cleanup);

// Every platform entry's component for each kit component the pane hosts render: a tree
// renders again on the iOS and the Android skins with each swapped for its platform part.
const pairs = (list: readonly (readonly [unknown, unknown])[]) => new Map<unknown, unknown>(list);
const PLATFORM_PARTS = {
  ios: pairs([
    [kit.Alert, IosAlert], [kit.Autocomplete, IosAutocomplete], [kit.Avatar, IosAvatar], [kit.AvatarGroup, IosAvatarGroup],
    [kit.Badge, IosBadge], [kit.BarList, IosBarList], [kit.BoxPlot, IosBoxPlot], [kit.BulletChart, IosBulletChart],
    [kit.Button, IosButton], [kit.Calendar, IosCalendar], [kit.CandlestickChart, IosCandlestickChart], [kit.Card, IosCard],
    [kit.Carousel, IosCarousel], [kit.Chart, IosChart], [kit.Checkbox, IosCheckbox], [kit.Chip, IosChip],
    [kit.DataTable, IosDataTable], [kit.DepthChart, IosDepthChart], [kit.Emblem, IosEmblem], [kit.FilterPanel, IosFilterPanel],
    [kit.FunnelChart, IosFunnelChart], [kit.GeoMap, IosGeoMap], [kit.Histogram, IosHistogram], [kit.Input, IosInput],
    [kit.InputOTP, IosInputOTP], [kit.Kbd, IosKbd], [kit.LineChart, IosLineChart], [kit.Listbox, IosListbox],
    [kit.MediaObject, IosMediaObject], [kit.MetricBreakdown, IosMetricBreakdown], [kit.Navbar, IosNavbar], [kit.Pagination, IosPagination],
    [kit.PhoneInput, IosPhoneInput], [kit.Progress, IosProgress], [kit.RadarChart, IosRadarChart], [kit.Radio, IosRadio],
    [kit.RadioGroup, IosRadioGroup], [kit.RangeAreaChart, IosRangeAreaChart], [kit.ScatterPlot, IosScatterPlot], [kit.Select, IosSelect],
    [kit.ServiceHealthList, IosServiceHealthList], [kit.Sidebar, IosSidebar], [kit.Skeleton, IosSkeleton], [kit.Slider, IosSlider],
    [kit.Stats, IosStats], [kit.Stepper, IosStepper], [kit.Steps, IosSteps], [kit.Switch, IosSwitch],
    [kit.TabBar, IosTabBar], [kit.Tabs, IosTabs], [kit.Textarea, IosTextarea], [kit.Tooltip, IosTooltip],
    [kit.Treemap, IosTreemap], [kit.Video, IosVideo], [kit.WaterfallChart, IosWaterfallChart],
  ]),
  android: pairs([
    [kit.Alert, AndroidAlert], [kit.Autocomplete, AndroidAutocomplete], [kit.Avatar, AndroidAvatar], [kit.AvatarGroup, AndroidAvatarGroup],
    [kit.Badge, AndroidBadge], [kit.BarList, AndroidBarList], [kit.BoxPlot, AndroidBoxPlot], [kit.BulletChart, AndroidBulletChart],
    [kit.Button, AndroidButton], [kit.Calendar, AndroidCalendar], [kit.CandlestickChart, AndroidCandlestickChart], [kit.Card, AndroidCard],
    [kit.Carousel, AndroidCarousel], [kit.Chart, AndroidChart], [kit.Checkbox, AndroidCheckbox], [kit.Chip, AndroidChip],
    [kit.DataTable, AndroidDataTable], [kit.DepthChart, AndroidDepthChart], [kit.Emblem, AndroidEmblem], [kit.FilterPanel, AndroidFilterPanel],
    [kit.FunnelChart, AndroidFunnelChart], [kit.GeoMap, AndroidGeoMap], [kit.Histogram, AndroidHistogram], [kit.Input, AndroidInput],
    [kit.InputOTP, AndroidInputOTP], [kit.Kbd, AndroidKbd], [kit.LineChart, AndroidLineChart], [kit.Listbox, AndroidListbox],
    [kit.MediaObject, AndroidMediaObject], [kit.MetricBreakdown, AndroidMetricBreakdown], [kit.Navbar, AndroidNavbar], [kit.Pagination, AndroidPagination],
    [kit.PhoneInput, AndroidPhoneInput], [kit.Progress, AndroidProgress], [kit.RadarChart, AndroidRadarChart], [kit.Radio, AndroidRadio],
    [kit.RadioGroup, AndroidRadioGroup], [kit.RangeAreaChart, AndroidRangeAreaChart], [kit.ScatterPlot, AndroidScatterPlot], [kit.Select, AndroidSelect],
    [kit.ServiceHealthList, AndroidServiceHealthList], [kit.Sidebar, AndroidSidebar], [kit.Skeleton, AndroidSkeleton], [kit.Slider, AndroidSlider],
    [kit.Stats, AndroidStats], [kit.Stepper, AndroidStepper], [kit.Steps, AndroidSteps], [kit.Switch, AndroidSwitch],
    [kit.TabBar, AndroidTabBar], [kit.Tabs, AndroidTabs], [kit.Textarea, AndroidTextarea], [kit.Tooltip, AndroidTooltip],
    [kit.Treemap, AndroidTreemap], [kit.Video, AndroidVideo], [kit.WaterfallChart, AndroidWaterfallChart],
  ]),
};

/** A tree with each kit component swapped for its platform part (the same tree when none is). */
function onPlatform(node: ReactNode, parts: Map<unknown, unknown>): ReactNode {
  if (Array.isArray(node)) {
    const swapped = node.map((child) => onPlatform(child, parts));
    return swapped.some((child, i) => child !== node[i]) ? swapped : node;
  }
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ children?: ReactNode }>;
  const children = element.props.children;
  const nextChildren = children === undefined ? undefined : onPlatform(Children.toArray(children).length > 1 || Array.isArray(children) ? Children.toArray(children) : children, parts);
  const type = element.type === Fragment ? Fragment : (parts.get(element.type) ?? element.type);
  if (type === element.type && nextChildren === children) return node;
  return cloneElement({ ...element, type } as ReactElement<{ children?: ReactNode }>, undefined, ...(nextChildren === undefined ? [] : Array.isArray(nextChildren) ? nextChildren : [nextChildren]));
}

type Side = "top" | "right" | "bottom" | "left";
const SIDES: readonly Side[] = ["top", "right", "bottom", "left"];
const px = (value: string) => (value === "" ? 0 : Number.parseFloat(value));
const borderOf = (node: Element, side: Side) => px(getComputedStyle(node).getPropertyValue(`border-${side}-width`));
const paddingOf = (node: Element, side: Side) => px(getComputedStyle(node).getPropertyValue(`padding-${side}`));
const insetsOf = (node: Element) => Object.fromEntries(SIDES.map((side) => [side, borderOf(node, side) + paddingOf(node, side)])) as Record<Side, number>;
const bordersOf = (node: Element) => Object.fromEntries(SIDES.map((side) => [side, borderOf(node, side)])) as Record<Side, number>;
const radiusOf = (node: Element) => getComputedStyle(node).getPropertyValue("border-top-left-radius");

/** A pane's root: the absolutely filled GlassBox behind its host's content. */
const isPane = (node: Element) => (node as HTMLElement).style?.zIndex === "-1" && node.querySelector(':scope > [data-testid="glass-material"]') != null;
const panesIn = (root: Element) => Array.from(root.querySelectorAll("*")).filter(isPane) as HTMLElement[];
const materialOf = (pane: Element) => pane.querySelector(':scope > [data-testid="glass-material"]') as HTMLElement;
/** The elements only glass renders: a pane, a surface's material, the clear well's state stroke. */
const glassOnly = (node: Element) => isPane(node) || node.getAttribute("data-testid") === "glass-material" || node.getAttribute("data-testid") === "text-entry-state-border";

/** A box inside a w x h host: where an absolutely filled child of `host` lies. */
function paddingBox(host: Element, width: number, height: number) {
  const b = bordersOf(host);
  return { x: b.left, y: b.top, width: width - b.left - b.right, height: height - b.top - b.bottom };
}

const SHAPE: ViewStyle = { width: 120, height: 40, borderRadius: 12, borderWidth: 2, borderColor: "#7262e5", backgroundColor: "#ffffff", paddingHorizontal: 10, paddingVertical: 4 };

async function renderGlass(ui: React.ReactElement, solid = false) {
  const result = render(<ThemeProvider light glass={!solid} solid={solid}>{ui}</ThemeProvider>);
  if (!solid) await waitFor(() => expect(result.container.querySelector('[data-testid="glass-material"]')).not.toBeNull());
  return result;
}

describe("the pane covers the host's whole solid footprint", () => {
  it("a resting bordered host: its border becomes padding, and the pane and its material fill the host's box", async () => {
    const { getByTestId } = await renderGlass(
      <View testID="host" style={paneStyle(true, SHAPE)}>
        <GlassPane shape={SHAPE} testID="pane" />
        <Text>Label</Text>
      </View>,
    );
    const host = getByTestId("host");
    // The content keeps its place: 2 of border and 10 / 4 of padding become 12 / 6 of padding.
    expect(bordersOf(host)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(insetsOf(host)).toEqual({ top: 6, right: 12, bottom: 6, left: 12 });
    const pane = getByTestId("pane");
    expect(pane.parentElement).toBe(host);
    // The pane takes the shape's radius and no border: it lies on the host's padding box, the footprint.
    expect(paddingBox(host, 120, 40)).toEqual({ x: 0, y: 0, width: 120, height: 40 });
    expect(bordersOf(pane)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(radiusOf(pane)).toBe("12px");
    expect(pane.style.backgroundColor).toBe("rgba(0, 0, 0, 0.00)");
    // The material fills the pane: the pane has no border for it to sit inside.
    const material = materialOf(pane);
    expect(paddingBox(pane, 120, 40)).toEqual({ x: 0, y: 0, width: 120, height: 40 });
    expect(SIDES.map((side) => material.style.getPropertyValue(side))).toEqual(["0px", "0px", "0px", "0px"]);
    expect(radiusOf(material)).toBe("12px");
  });

  it("a host that keeps a state border: the border stays in its colour and the pane sits flush inside it with concentric corners", async () => {
    const { getByTestId } = await renderGlass(
      <View testID="host" style={paneStyle(true, SHAPE, true)}>
        <GlassPane shape={SHAPE} stateBorder testID="pane" />
        <Text>Label</Text>
      </View>,
    );
    const host = getByTestId("host");
    expect(bordersOf(host)).toEqual({ top: 2, right: 2, bottom: 2, left: 2 });
    expect(host.style.borderTopColor || host.style.borderColor).toMatch(/114, ?98, ?229/);
    expect(insetsOf(host)).toEqual({ top: 6, right: 12, bottom: 6, left: 12 });
    const pane = getByTestId("pane");
    // Inside the 2 px border, with no gap: no border of its own, the radius less the border.
    expect(paddingBox(host, 120, 40)).toEqual({ x: 2, y: 2, width: 116, height: 36 });
    expect(bordersOf(pane)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(radiusOf(pane)).toBe("10px");
    expect(radiusOf(materialOf(pane))).toBe("10px");
  });

  it("a pane beside a text field covers the field's footprint, and the field's state border paints over it", async () => {
    const field: ViewStyle = { height: 44, borderWidth: 1, borderRadius: 10, borderColor: lightColors.input, backgroundColor: lightColors.card, paddingHorizontal: 12 };
    const Field = ({ focused }: { focused: boolean }) => (
      <View testID={focused ? "focused-wrap" : "resting-wrap"}>
        <GlassPane shape={field} clear testID={focused ? "focused-pane" : "resting-pane"} />
        <TextInput testID={focused ? "focused" : "resting"} style={[paneStyle(true, field, focused), focused ? { borderColor: lightColors.ring } : null, PANE_SIBLING_INPUT]} />
      </View>
    );
    const { getByTestId } = await renderGlass(<><Field focused={false} /><Field focused /></>);
    for (const state of ["resting", "focused"] as const) {
      const wrap = getByTestId(`${state}-wrap`);
      const pane = getByTestId(`${state}-pane`);
      // The wrapper has no border: the pane lies on its whole box, the field's footprint.
      expect(pane.parentElement).toBe(wrap);
      expect(bordersOf(wrap)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
      expect(bordersOf(pane)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
      expect(radiusOf(pane)).toBe("10px");
      // The field's text stays where solid puts it, 1 of border plus 12 of padding in.
      const input = getByTestId(state);
      expect(insetsOf(input)).toEqual({ top: 1, right: 13, bottom: 1, left: 13 });
      expect(bordersOf(input)).toEqual(state === "focused" ? { top: 1, right: 1, bottom: 1, left: 1 } : { top: 0, right: 0, bottom: 0, left: 0 });
    }
  });

  it("leaves the solid tree untouched: paneStyle returns the style itself and the pane renders nothing", async () => {
    const solid = { surface: "solid", increasedContrast: false, reducedTransparency: false, tokens: lightColors } as Parameters<typeof paneStyle>[0];
    expect(paneStyle(false, SHAPE)).toBe(SHAPE);
    expect(paneStyle(solid, SHAPE)).toBe(SHAPE);
    expect(paneStyle(solid, SHAPE, true)).toBe(SHAPE);
    const withPane = (await renderGlass(<View style={paneStyle(solid, SHAPE)}><GlassPane shape={SHAPE} stateBorder /><Text>Label</Text></View>, true)).container.innerHTML;
    cleanup();
    const plain = (await renderGlass(<View style={SHAPE}><Text>Label</Text></View>, true)).container.innerHTML;
    expect(withPane).toBe(plain);
  });

  it("reads the logical and physical sides as React Native does, and keeps a side whose padding cannot be summed", () => {
    const flat = (style: ReturnType<typeof paneStyle>) => Object.assign({}, ...[style].flat(3).filter(Boolean)) as Record<string, unknown>;
    // A start-only border (the input addon's seam) pads the start side alone.
    expect(flat(paneStyle(true, { borderStartWidth: 1, borderColor: "#000", paddingHorizontal: 8 }))).toMatchObject({ borderWidth: 0, borderStartWidth: 0, paddingStart: 9 });
    expect(flat(paneStyle(true, { borderStartWidth: 1, borderColor: "#000", paddingHorizontal: 8 })).paddingEnd).toBeUndefined();
    // A physical side key is restated physically too, so it cannot outrank the logical one on the web.
    expect(flat(paneStyle(true, { borderWidth: 1, paddingLeft: 4, paddingRight: 6 }))).toMatchObject({ paddingStart: 5, paddingLeft: 5, paddingEnd: 7, paddingRight: 7, borderLeftWidth: 0, borderRightWidth: 0 });
    // A percentage padding cannot take a border's width: that side keeps its border, cleared.
    expect(flat(paneStyle(true, { borderWidth: 1, borderColor: "#000", paddingTop: "5%", padding: 4 }))).toMatchObject({ borderTopWidth: 1, borderColor: "transparent", paddingTop: "5%", paddingBottom: 5, paddingStart: 5 });
  });
});

describe("every pane host keeps its solid layout under glass", () => {
  // The same tree renders in solid and in glass; with the glass-only elements left out the
  // two trees line up node for node, so each pane host has its solid twin.
  function twinOf(node: Element, glassRoot: Element, solidRoot: Element): Element | null {
    const path: number[] = [];
    for (let at: Element = node; at !== glassRoot; at = at.parentElement!) {
      path.unshift(Array.from(at.parentElement!.children).filter((child) => !glassOnly(child)).indexOf(at));
    }
    let twin: Element | undefined = solidRoot;
    for (const index of path) twin = twin?.children[index];
    return twin ?? null;
  }

  /** A placed child's offsets on one axis from its parent's outer edge: the pinned side, or the centre when both are. */
  function placement(child: Element, parent: Element, start: Side, end: Side): number | null {
    const at = (side: Side) => {
      const value = getComputedStyle(child).getPropertyValue(side);
      return value === "" || value === "auto" ? null : px(value) + borderOf(parent, side);
    };
    const [a, b] = [at(start), at(end)];
    if (a != null && b != null) return a - b;
    return a ?? (b == null ? null : -b);
  }

  async function holdsSolidLayout(name: string, node: ReactNode, act: PaneHost["act"], indicatorReplaced: boolean, optional = false) {
    const solid = render(<ThemeProvider light solid>{node}</ThemeProvider>);
    act?.(solid);
    const glass = render(<ThemeProvider light glass>{node}</ThemeProvider>);
    act?.(glass);
    // A platform skin may paint no pane for a host the web paints one for (Android's
    // segmented Progress, its Tabs, a native Video): nothing to hold there.
    if (optional) await new Promise((resolve) => setTimeout(resolve, 20));
    else await waitFor(() => expect(panesIn(glass.container).length).toBeGreaterThan(0));
    for (const pane of panesIn(glass.container)) {
      const host = pane.parentElement!;
      const twin = twinOf(host, glass.container, solid.container);
      expect(twin, `${name}: the pane host has a solid twin`).not.toBeNull();
      // The content stays where solid puts it: each side's border plus padding is solid's.
      expect(insetsOf(host), `${name}: insets`).toEqual(insetsOf(twin!));
      // Absolutely placed content (a switch thumb, a slider tick) keeps its place too: its
      // offset from the host's outer edge is solid's, and a layer pinned to both sides of an
      // axis (a centred glyph layer) keeps its centre.
      const placed = Array.from(host.children).filter((child) => !glassOnly(child) && getComputedStyle(child).position === "absolute");
      const solidPlaced = Array.from(twin!.children).filter((child) => getComputedStyle(child).position === "absolute");
      if (indicatorReplaced) expect(placed.length, `${name}: the pane replaces solid's indicator view`).toBe(solidPlaced.length - 1);
      else expect(placed.length, `${name}: absolutely placed children`).toBe(solidPlaced.length);
      if (placed.length === solidPlaced.length) {
        placed.forEach((child, i) => {
          for (const [start, end] of [["top", "bottom"], ["left", "right"]] as const) {
            expect(placement(child, host, start, end), `${name}: placed child ${i} ${start}-${end}`).toEqual(placement(solidPlaced[i]!, twin!, start, end));
          }
        });
      }
      // The pane paints no border of its own, and the material fills it.
      expect(bordersOf(pane), `${name}: pane border`).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
      expect(SIDES.map((side) => materialOf(pane).style.getPropertyValue(side))).toEqual(["0px", "0px", "0px", "0px"]);
      // A host with no border left lends the pane its own corners (a pane beside a field, in
      // a wrapper with none, the field's); one that kept a state border, its inner curve.
      const kept = bordersOf(host);
      const corner = radiusOf(twin!) || radiusOf(pane.nextElementSibling!);
      if (SIDES.every((side) => kept[side] === 0)) expect(radiusOf(pane), `${name}: pane radius`).toBe(corner);
      else expect(px(radiusOf(pane)), `${name}: concentric pane radius`).toBe(Math.max(0, px(corner) - Math.min(kept.top, kept.left)));
    }
    glass.unmount();
    solid.unmount();
  }

  // Where solid paints the active indicator as a view of its own and glass paints the pane
  // in its place (TabBar's cell capsule), solid has the one placed child more.
  const REPLACED_INDICATOR = new Set(["TabBar"]);
  for (const host of PANE_HOSTS) {
    it(host.name, () => holdsSolidLayout(host.name, host.node, host.act, REPLACED_INDICATOR.has(host.name)));
  }

  // The iOS and Android skins draw their own borders (Android's 2 dp switch track and radio
  // ring, the M3 field's indicator, the iOS cell) through the same shells: each host renders
  // again with every kit component swapped for its platform entry's.
  for (const platform of ["ios", "android"] as const) {
    for (const host of PANE_HOSTS) {
      const node = onPlatform(host.node, PLATFORM_PARTS[platform]);
      if (node === host.node) continue;
      it(`${host.name} (${platform} skin)`, () => holdsSolidLayout(`${host.name} (${platform})`, node, host.act, REPLACED_INDICATOR.has(host.name) && platform === "ios", true));
    }
  }

  it("ButtonGroup: a cell paneStyle clears keeps solid's insets", async () => {
    const node = <ButtonGroup items={["Day", "Week", "Month"]} accessibilityLabel="Range" testID="range" />;
    const solid = render(<ThemeProvider light solid>{node}</ThemeProvider>);
    const glass = await renderGlass(node);
    const cells = (root: Element) => Array.from(root.querySelectorAll('[role="tab"], [role="button"]'));
    const [glassCells, solidCells] = [cells(glass.container), cells(solid.container)];
    expect(glassCells.length).toBe(3);
    glassCells.forEach((cell, i) => expect(insetsOf(cell)).toEqual(insetsOf(solidCells[i]!)));
  });
});

describe("Increase Contrast only ever adds weight", () => {
  // Under Increase Contrast every material resolves solid and a pane host takes the
  // contrasting border (contrastBorderFor, through paneStyle): `foreground` on every side,
  // at least the hairline and never thinner than the host's own border, so a 2 px ring stays
  // 2 px. A border that shows a state keeps its colour.
  const fg = lightColors.foreground;

  it("contrastBorderFor keeps each side's own width when it is wider than the hairline", () => {
    expect(contrastBorderFor(lightColors, {})).toEqual({ borderWidth: 1, borderColor: fg });
    expect(contrastBorderFor(lightColors, { borderWidth: 1, borderColor: "#ccc" })).toEqual({ borderWidth: 1, borderColor: fg });
    expect(contrastBorderFor(lightColors, { borderWidth: 2, borderColor: "#ccc" })).toEqual({ borderWidth: 2, borderColor: fg });
    // An underline field: the hairline all round, its 2 px indicator kept, every side in foreground.
    expect(contrastBorderFor(lightColors, { borderBottomWidth: 2, borderBottomColor: "#888" })).toEqual({
      borderWidth: 1, borderColor: fg, borderTopWidth: 1, borderBottomWidth: 2, borderStartWidth: 1, borderEndWidth: 1, borderBottomColor: fg,
    });
    // A state border keeps its colour and its width.
    expect(contrastBorderFor(lightColors, { borderWidth: 2, borderColor: lightColors.ring }, true)).toEqual({ borderWidth: 2, borderColor: lightColors.ring });
    // A Material 3 underline field's state is its bottom edge, the active indicator: that edge
    // keeps its colour, and the sides it names no colour for take the contrasting hairline.
    expect(contrastBorderFor(lightColors, { borderBottomWidth: 2, borderBottomColor: lightColors.destructive }, true)).toEqual({
      borderWidth: 1, borderColor: fg, borderTopWidth: 1, borderBottomWidth: 2, borderStartWidth: 1, borderEndWidth: 1, borderBottomColor: lightColors.destructive,
    });
    // A state style that names no border colour has no state border to keep.
    expect(contrastBorderFor(lightColors, { borderWidth: 2 }, true)).toEqual({ borderWidth: 2, borderColor: fg });
  });

  function contrastMore() {
    return spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("prefers-contrast"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          onchange: null,
          dispatchEvent: () => true,
        }) as unknown as MediaQueryList,
    );
  }
  const channels = (color: string) => (/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color) ?? []).slice(1, 4).join(",");
  const hex = (color: string) => { const n = Number.parseInt(color.slice(1, 7), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };
  const ring = (node: Element) => ({ width: borderOf(node, "top"), color: channels(getComputedStyle(node).getPropertyValue("border-top-color") || (node as HTMLElement).style.borderColor) });

  it("a 2 px radio ring stays 2 px, in foreground, checked or not", async () => {
    const spy = contrastMore();
    try {
      render(<ThemeProvider light solid><RadioGroup defaultValue="pro" label="Plan"><Radio value="hobby">Hobby</Radio><Radio value="pro">Pro</Radio></RadioGroup></ThemeProvider>);
      await waitFor(() => expect(ring(screen.getAllByRole("radio")[0]!.firstElementChild!).color).toBe(hex(fg)));
      for (const radio of screen.getAllByRole("radio")) expect(ring(radio.firstElementChild!)).toEqual({ width: 2, color: hex(fg) });
    } finally { spy.mockRestore(); }
  });

  it("a Material 3 underline field keeps its state colour on its active indicator", async () => {
    // The Android Input, Textarea, Select and Autocomplete draw their state on the bottom edge
    // alone (activeIndicator): an error in destructive, focus in ring, an open trigger in
    // primary, each 2 dp. Increase Contrast keeps that colour and width; a resting field's
    // 1 dp indicator takes the foreground.
    const spy = contrastMore();
    try {
      render(
        <ThemeProvider light solid>
          <AndroidInput label="Name" error />
          <AndroidTextarea label="Notes" error />
          <AndroidInput label="Email" />
          <AndroidInput label="Phone" />
          <AndroidSelect label="Country" options={["Canada", "Mexico"]} />
          <AndroidAutocomplete label="Assigned to" options={["Ada Lovelace", "Grace Hopper"]} />
        </ThemeProvider>,
      );
      const indicator = (node: Element) => {
        let at: Element | null = node;
        while (at && borderOf(at, "bottom") === 0) at = at.parentElement;
        return at ? { width: borderOf(at, "bottom"), color: channels(getComputedStyle(at).getPropertyValue("border-bottom-color")) } : null;
      };
      const [name, email, phone, assigned] = Array.from(document.querySelectorAll("input"));
      const notes = document.querySelector("textarea")!;
      await waitFor(() => expect(indicator(phone!)).toEqual({ width: 1, color: hex(fg) }));
      expect(indicator(name!)).toEqual({ width: 2, color: hex(lightColors.destructive) });
      expect(indicator(notes)).toEqual({ width: 2, color: hex(lightColors.destructive) });
      fireEvent.focus(email!);
      await waitFor(() => expect(indicator(email!)).toEqual({ width: 2, color: hex(lightColors.ring) }));
      fireEvent.focus(assigned!);
      await waitFor(() => expect(indicator(assigned!)).toEqual({ width: 2, color: hex(lightColors.ring) }));
      const trigger = screen.getAllByRole("button").find((node) => node.textContent?.includes("Country"))!;
      expect(indicator(trigger)).toEqual({ width: 1, color: hex(fg) });
      fireEvent.click(trigger);
      await waitFor(() => expect(indicator(trigger)).toEqual({ width: 2, color: hex(lightColors.primary) }));
    } finally { spy.mockRestore(); }
  });

  it("the Android switch's 2 dp unchecked track stays 2 dp", async () => {
    const spy = contrastMore();
    try {
      render(<ThemeProvider light solid><AndroidSwitch accessibilityLabel="Wi-Fi" /></ThemeProvider>);
      const track = () => screen.getByRole("switch").lastElementChild!;
      await waitFor(() => expect(ring(track()).color).toBe(hex(fg)));
      expect(ring(track())).toEqual({ width: 2, color: hex(fg) });
    } finally { spy.mockRestore(); }
  });

  it("Steps: the completed and upcoming discs keep 2 px in foreground, and Android's current ring keeps its 2 dp primary", async () => {
    const spy = contrastMore();
    try {
      const steps = [{ label: "Account" }, { label: "Profile" }, { label: "Review" }];
      render(<ThemeProvider light solid><Steps steps={steps} defaultCurrent={1} /><AndroidSteps steps={steps} defaultCurrent={1} /></ThemeProvider>);
      await waitFor(() => expect(ring(screen.getAllByText("3")[0]!.parentElement!).color).toBe(hex(fg)));
      const [web, android] = [0, 1].map((i) => ({ done: screen.getAllByText("✓")[i]!.parentElement!, current: screen.getAllByText("2")[i]!.parentElement!, next: screen.getAllByText("3")[i]!.parentElement! }));
      for (const platform of [web, android]) {
        expect(ring(platform.done).width).toBe(2);
        expect(ring(platform.next)).toEqual({ width: 2, color: hex(fg) });
      }
      // The current step's ring is its state: it keeps its colour (the web ring paints no surface and never changed).
      expect(ring(android.current)).toEqual({ width: 2, color: hex(lightColors.primary) });
      expect(ring(web.current)).toEqual({ width: 2, color: hex(lightColors.primary) });
    } finally { spy.mockRestore(); }
  });
});
