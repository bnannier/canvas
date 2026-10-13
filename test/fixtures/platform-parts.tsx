// Every platform entry's component for each kit component the pane hosts render
// (test/fixtures/pane-hosts.tsx), so a host tree renders again on the iOS and the Android
// skins: test/glass-pane.test.tsx holds each skin to the pane's geometry, and
// test/glass-pane-ripple.test.tsx holds the Android skins' press feedback over a pane.
import { Children, cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import * as kit from "../../src/index.ts";
import { Autocomplete as IosAutocomplete } from "../../src/atoms/autocomplete/autocomplete.ios.tsx";
import { Avatar as IosAvatar, AvatarGroup as IosAvatarGroup } from "../../src/atoms/avatar/avatar.ios.tsx";
import { Badge as IosBadge } from "../../src/atoms/badge/badge.ios.tsx";
import { Button as IosButton } from "../../src/atoms/button/button.ios.tsx";
import { Checkbox as IosCheckbox } from "../../src/atoms/checkbox/checkbox.ios.tsx";
import { Chip as IosChip } from "../../src/atoms/chip/chip.ios.tsx";
import { Emblem as IosEmblem } from "../../src/atoms/emblem/emblem.ios.tsx";
import { InputOTP as IosInputOTP } from "../../src/atoms/input-otp/input-otp.ios.tsx";
import { Input as IosInput } from "../../src/atoms/input/input.ios.tsx";
import { Kbd as IosKbd } from "../../src/atoms/kbd/kbd.ios.tsx";
import { Listbox as IosListbox } from "../../src/atoms/listbox/listbox.ios.tsx";
import { Pagination as IosPagination } from "../../src/atoms/pagination/pagination.ios.tsx";
import { Progress as IosProgress } from "../../src/atoms/progress/progress.ios.tsx";
import { Radio as IosRadio, RadioGroup as IosRadioGroup } from "../../src/atoms/radio/radio.ios.tsx";
import { Select as IosSelect } from "../../src/atoms/select/select.ios.tsx";
import { Skeleton as IosSkeleton } from "../../src/atoms/skeleton/skeleton.ios.tsx";
import { Slider as IosSlider } from "../../src/atoms/slider/slider.ios.tsx";
import { Stepper as IosStepper } from "../../src/atoms/stepper/stepper.ios.tsx";
import { Switch as IosSwitch } from "../../src/atoms/switch/switch.ios.tsx";
import { Textarea as IosTextarea } from "../../src/atoms/textarea/textarea.ios.tsx";
import { Tooltip as IosTooltip } from "../../src/atoms/tooltip/tooltip.ios.tsx";
import { Video as IosVideo } from "../../src/atoms/video/video.ios.tsx";
import { BarList as IosBarList } from "../../src/charts/bar-list/bar-list.ios.tsx";
import { BoxPlot as IosBoxPlot } from "../../src/charts/box-plot/box-plot.ios.tsx";
import { BulletChart as IosBulletChart } from "../../src/charts/bullet-chart/bullet-chart.ios.tsx";
import { CandlestickChart as IosCandlestickChart } from "../../src/charts/candlestick-chart/candlestick-chart.ios.tsx";
import { Chart as IosChart } from "../../src/charts/chart/chart.ios.tsx";
import { DepthChart as IosDepthChart } from "../../src/charts/depth-chart/depth-chart.ios.tsx";
import { FunnelChart as IosFunnelChart } from "../../src/charts/funnel-chart/funnel-chart.ios.tsx";
import { GeoMap as IosGeoMap } from "../../src/charts/geo-map/geo-map.ios.tsx";
import { Histogram as IosHistogram } from "../../src/charts/histogram/histogram.ios.tsx";
import { LineChart as IosLineChart } from "../../src/charts/line-chart/line-chart.ios.tsx";
import { MetricBreakdown as IosMetricBreakdown } from "../../src/charts/metric-breakdown/metric-breakdown.ios.tsx";
import { RadarChart as IosRadarChart } from "../../src/charts/radar-chart/radar-chart.ios.tsx";
import { RangeAreaChart as IosRangeAreaChart } from "../../src/charts/range-area-chart/range-area-chart.ios.tsx";
import { ScatterPlot as IosScatterPlot } from "../../src/charts/scatter-plot/scatter-plot.ios.tsx";
import { ServiceHealthList as IosServiceHealthList } from "../../src/charts/service-health-list/service-health-list.ios.tsx";
import { Treemap as IosTreemap } from "../../src/charts/treemap/treemap.ios.tsx";
import { WaterfallChart as IosWaterfallChart } from "../../src/charts/waterfall-chart/waterfall-chart.ios.tsx";
import { Alert as IosAlert } from "../../src/molecules/alert/alert.ios.tsx";
import { Card as IosCard } from "../../src/molecules/card/card.ios.tsx";
import { MediaObject as IosMediaObject } from "../../src/molecules/media-objects/media-objects.ios.tsx";
import { PhoneInput as IosPhoneInput } from "../../src/molecules/phone-input/phone-input.ios.tsx";
import { Stats as IosStats } from "../../src/molecules/stats/stats.ios.tsx";
import { Calendar as IosCalendar } from "../../src/organisms/calendar/calendar.ios.tsx";
import { Carousel as IosCarousel } from "../../src/organisms/carousel/carousel.ios.tsx";
import { DataTable as IosDataTable } from "../../src/organisms/data-table/data-table.ios.tsx";
import { FilterPanel as IosFilterPanel } from "../../src/organisms/filter-panel/filter-panel.ios.tsx";
import { Navbar as IosNavbar } from "../../src/organisms/navbars/navbars.ios.tsx";
import { Sidebar as IosSidebar } from "../../src/organisms/sidebar/sidebar.ios.tsx";
import { Steps as IosSteps } from "../../src/organisms/steps/steps.ios.tsx";
import { TabBar as IosTabBar } from "../../src/organisms/tab-bar/tab-bar.ios.tsx";
import { Tabs as IosTabs } from "../../src/organisms/tabs/tabs.ios.tsx";
import { Autocomplete as AndroidAutocomplete } from "../../src/atoms/autocomplete/autocomplete.android.tsx";
import { Avatar as AndroidAvatar, AvatarGroup as AndroidAvatarGroup } from "../../src/atoms/avatar/avatar.android.tsx";
import { Badge as AndroidBadge } from "../../src/atoms/badge/badge.android.tsx";
import { Button as AndroidButton } from "../../src/atoms/button/button.android.tsx";
import { Checkbox as AndroidCheckbox } from "../../src/atoms/checkbox/checkbox.android.tsx";
import { Chip as AndroidChip } from "../../src/atoms/chip/chip.android.tsx";
import { Emblem as AndroidEmblem } from "../../src/atoms/emblem/emblem.android.tsx";
import { InputOTP as AndroidInputOTP } from "../../src/atoms/input-otp/input-otp.android.tsx";
import { Input as AndroidInput } from "../../src/atoms/input/input.android.tsx";
import { Kbd as AndroidKbd } from "../../src/atoms/kbd/kbd.android.tsx";
import { Listbox as AndroidListbox } from "../../src/atoms/listbox/listbox.android.tsx";
import { Pagination as AndroidPagination } from "../../src/atoms/pagination/pagination.android.tsx";
import { Progress as AndroidProgress } from "../../src/atoms/progress/progress.android.tsx";
import { Radio as AndroidRadio, RadioGroup as AndroidRadioGroup } from "../../src/atoms/radio/radio.android.tsx";
import { Select as AndroidSelect } from "../../src/atoms/select/select.android.tsx";
import { Skeleton as AndroidSkeleton } from "../../src/atoms/skeleton/skeleton.android.tsx";
import { Slider as AndroidSlider } from "../../src/atoms/slider/slider.android.tsx";
import { Stepper as AndroidStepper } from "../../src/atoms/stepper/stepper.android.tsx";
import { Switch as AndroidSwitch } from "../../src/atoms/switch/switch.android.tsx";
import { Textarea as AndroidTextarea } from "../../src/atoms/textarea/textarea.android.tsx";
import { Tooltip as AndroidTooltip } from "../../src/atoms/tooltip/tooltip.android.tsx";
import { Video as AndroidVideo } from "../../src/atoms/video/video.android.tsx";
import { BarList as AndroidBarList } from "../../src/charts/bar-list/bar-list.android.tsx";
import { BoxPlot as AndroidBoxPlot } from "../../src/charts/box-plot/box-plot.android.tsx";
import { BulletChart as AndroidBulletChart } from "../../src/charts/bullet-chart/bullet-chart.android.tsx";
import { CandlestickChart as AndroidCandlestickChart } from "../../src/charts/candlestick-chart/candlestick-chart.android.tsx";
import { Chart as AndroidChart } from "../../src/charts/chart/chart.android.tsx";
import { DepthChart as AndroidDepthChart } from "../../src/charts/depth-chart/depth-chart.android.tsx";
import { FunnelChart as AndroidFunnelChart } from "../../src/charts/funnel-chart/funnel-chart.android.tsx";
import { GeoMap as AndroidGeoMap } from "../../src/charts/geo-map/geo-map.android.tsx";
import { Histogram as AndroidHistogram } from "../../src/charts/histogram/histogram.android.tsx";
import { LineChart as AndroidLineChart } from "../../src/charts/line-chart/line-chart.android.tsx";
import { MetricBreakdown as AndroidMetricBreakdown } from "../../src/charts/metric-breakdown/metric-breakdown.android.tsx";
import { RadarChart as AndroidRadarChart } from "../../src/charts/radar-chart/radar-chart.android.tsx";
import { RangeAreaChart as AndroidRangeAreaChart } from "../../src/charts/range-area-chart/range-area-chart.android.tsx";
import { ScatterPlot as AndroidScatterPlot } from "../../src/charts/scatter-plot/scatter-plot.android.tsx";
import { ServiceHealthList as AndroidServiceHealthList } from "../../src/charts/service-health-list/service-health-list.android.tsx";
import { Treemap as AndroidTreemap } from "../../src/charts/treemap/treemap.android.tsx";
import { WaterfallChart as AndroidWaterfallChart } from "../../src/charts/waterfall-chart/waterfall-chart.android.tsx";
import { Alert as AndroidAlert } from "../../src/molecules/alert/alert.android.tsx";
import { Card as AndroidCard } from "../../src/molecules/card/card.android.tsx";
import { MediaObject as AndroidMediaObject } from "../../src/molecules/media-objects/media-objects.android.tsx";
import { PhoneInput as AndroidPhoneInput } from "../../src/molecules/phone-input/phone-input.android.tsx";
import { Stats as AndroidStats } from "../../src/molecules/stats/stats.android.tsx";
import { Calendar as AndroidCalendar } from "../../src/organisms/calendar/calendar.android.tsx";
import { Carousel as AndroidCarousel } from "../../src/organisms/carousel/carousel.android.tsx";
import { DataTable as AndroidDataTable } from "../../src/organisms/data-table/data-table.android.tsx";
import { FilterPanel as AndroidFilterPanel } from "../../src/organisms/filter-panel/filter-panel.android.tsx";
import { Navbar as AndroidNavbar } from "../../src/organisms/navbars/navbars.android.tsx";
import { Sidebar as AndroidSidebar } from "../../src/organisms/sidebar/sidebar.android.tsx";
import { Steps as AndroidSteps } from "../../src/organisms/steps/steps.android.tsx";
import { TabBar as AndroidTabBar } from "../../src/organisms/tab-bar/tab-bar.android.tsx";
import { Tabs as AndroidTabs } from "../../src/organisms/tabs/tabs.android.tsx";

const pairs = (list: readonly (readonly [unknown, unknown])[]) => new Map<unknown, unknown>(list);
export const PLATFORM_PARTS = {
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
export function onPlatform(node: ReactNode, parts: Map<unknown, unknown>): ReactNode {
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
