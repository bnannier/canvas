import type { ApiEntry, DocsRoute, EntryPointShape, PlannedRoute } from "./types";

// The public API of @nannier/canvas: every export of every package entry point, each
// with what it is and where the docs site documents it. Authored by hand, from the
// source: never derive an entry from a name. `bun run check:api` (tools/api/check.ts)
// fails when an export or a file appears or disappears without an entry here, when a
// kind disagrees with what the TypeScript checker sees, and when a docs claim is false.
//
// `docs` is the export's home page when that page names it: its own component page
// (the reference, the examples, the prop tables), or the guide page or section that
// presents it. A name met only in passing (another component's prop table, a list of
// names, an ordinary word in prose) is not documented there. A name with no home yet has
// no `docs` and waits in PENDING_DOCS (below) with the route planned for it.
// `internal-by-accident` records what the source says about a helper the style hub
// published before src/style/public.ts listed the surface; it deprecates nothing, and
// the owner retires those names as deprecated aliases (audit K12-2), each Foundations
// turn its own. A `deprecated-alias` carries `@deprecated` on its re-export (the
// specifier in src/style/public.ts, or a tier barrel's for a component's helpers), with
// a `replacement` where one public name replaces it; otherwise its tag names the kit
// components or props to use, or says that nothing replaces it.

/** Each subpath of package.json `exports`, by how the gate enumerates it. */
export const entryPoints: Readonly<Record<string, EntryPointShape>> = {
  ".": "module",
  "./styles/*": "files",
  "./package.json": "metadata",
};

/** Every named export of the package entry `.` (src/index.ts), values and types. */
export const publicApi: Readonly<Record<string, ApiEntry>> = {
  // src/atoms
  Autocomplete: { kind: "component", docs: "components/autocomplete" },
  AutocompleteProps: { kind: "type", docs: "components/autocomplete" },
  Avatar: { kind: "component", docs: "components/avatar" },
  AvatarGroup: { kind: "component", docs: "components/avatar" },
  AvatarGroupProps: { kind: "type", docs: "components/avatar" },
  AvatarMenu: { kind: "component", docs: "components/avatar" },
  AvatarMenuProps: { kind: "type", docs: "components/avatar" },
  AvatarProps: { kind: "type", docs: "components/avatar" },
  Badge: { kind: "component", docs: "components/badge" },
  BadgeGroup: { kind: "component", docs: "components/badge" },
  BadgeGroupProps: { kind: "type", docs: "components/badge" },
  BadgeProps: { kind: "type", docs: "components/badge" },
  Breadcrumb: { kind: "component", docs: "components/breadcrumb" },
  BreadcrumbItem: { kind: "part" },
  BreadcrumbItemProps: { kind: "type", docs: "components/breadcrumb" },
  BreadcrumbProps: { kind: "type", docs: "components/breadcrumb" },
  Button: { kind: "component", docs: "components/button" },
  ButtonProps: { kind: "type", docs: "components/button" },
  ButtonGroup: { kind: "component", docs: "components/button-group" },
  ButtonGroupItem: { kind: "type", docs: "components/button-group" },
  ButtonGroupProps: { kind: "type", docs: "components/button-group" },
  Checkbox: { kind: "component", docs: "components/checkbox" },
  CheckboxProps: { kind: "type", docs: "components/checkbox" },
  Chip: { kind: "component", docs: "components/chip" },
  ChipProps: { kind: "type", docs: "components/chip" },
  Container: { kind: "component", docs: "components/container" },
  ContainerProps: { kind: "type", docs: "components/container" },
  containerStyle: { kind: "deprecated-alias", replacement: "Container" },
  FLUID: { kind: "deprecated-alias", replacement: "Container" },
  Measure: { kind: "deprecated-alias", replacement: "MeasureProps" },
  measureOf: { kind: "deprecated-alias", replacement: "Container" },
  Divider: { kind: "component", docs: "components/divider" },
  DividerProps: { kind: "type", docs: "components/divider" },
  Dropdown: { kind: "component", docs: "components/dropdown" },
  DropdownItem: { kind: "type", docs: "components/dropdown" },
  DropdownProps: { kind: "type", docs: "components/dropdown" },
  Emblem: { kind: "component", docs: "components/emblem" },
  EmblemProps: { kind: "type", docs: "components/emblem" },
  Grid: { kind: "component", docs: "components/grid" },
  gridCellWidth: { kind: "deprecated-alias", replacement: "Grid" },
  gridColumns: { kind: "deprecated-alias", replacement: "Grid" },
  GridItem: { kind: "part", docs: "components/grid" },
  GridItemProps: { kind: "type", docs: "components/grid" },
  GridProps: { kind: "type", docs: "components/grid" },
  Icon: { kind: "component", docs: "components/icon" },
  IconName: { kind: "type" },
  IconProps: { kind: "type", docs: "components/icon" },
  Image: { kind: "component", docs: "components/image" },
  ImageProps: { kind: "type", docs: "components/image" },
  Input: { kind: "component", docs: "components/input" },
  InputProps: { kind: "type", docs: "components/input" },
  InputOTP: { kind: "component", docs: "components/input-otp" },
  InputOTPProps: { kind: "type", docs: "components/input-otp" },
  Kbd: { kind: "component", docs: "components/kbd" },
  KbdProps: { kind: "type", docs: "components/kbd" },
  Column: { kind: "component", docs: "components/row-column" },
  FlexProps: { kind: "type", docs: "components/row-column" },
  Row: { kind: "component", docs: "components/row-column" },
  Listbox: { kind: "component", docs: "components/listbox" },
  ListboxItem: { kind: "type", docs: "components/listbox" },
  ListboxProps: { kind: "type", docs: "components/listbox" },
  Pagination: { kind: "component", docs: "components/pagination" },
  PaginationProps: { kind: "type", docs: "components/pagination" },
  Popover: { kind: "component", docs: "components/popover" },
  PopoverProps: { kind: "type", docs: "components/popover" },
  Progress: { kind: "component", docs: "components/progress" },
  ProgressProps: { kind: "type", docs: "components/progress" },
  QRCode: { kind: "component", docs: "components/qrcode" },
  QRCodeProps: { kind: "type", docs: "components/qrcode" },
  Radio: { kind: "component", docs: "components/radio" },
  RadioGroup: { kind: "component", docs: "components/radio" },
  RadioGroupProps: { kind: "type", docs: "components/radio" },
  RadioProps: { kind: "type", docs: "components/radio" },
  Reveal: { kind: "component", docs: "components/reveal" },
  RevealGroup: { kind: "component", docs: "components/reveal" },
  RevealGroupProps: { kind: "type", docs: "components/reveal" },
  RevealProps: { kind: "type", docs: "components/reveal" },
  Select: { kind: "component", docs: "components/select" },
  SelectProps: { kind: "type", docs: "components/select" },
  Skeleton: { kind: "component", docs: "components/skeleton" },
  SkeletonProps: { kind: "type", docs: "components/skeleton" },
  Slider: { kind: "component", docs: "components/slider" },
  SliderProps: { kind: "type", docs: "components/slider" },
  Spinner: { kind: "component", docs: "components/spinner" },
  SpinnerProps: { kind: "type", docs: "components/spinner" },
  Stepper: { kind: "component", docs: "components/stepper" },
  StepperProps: { kind: "type", docs: "components/stepper" },
  Swatch: { kind: "component", docs: "components/swatch" },
  SwatchProps: { kind: "type", docs: "components/swatch" },
  Switch: { kind: "component", docs: "components/switch" },
  SwitchProps: { kind: "type", docs: "components/switch" },
  Textarea: { kind: "component", docs: "components/textarea" },
  TextareaProps: { kind: "type", docs: "components/textarea" },
  Tooltip: { kind: "component", docs: "components/tooltip" },
  TooltipProps: { kind: "type", docs: "components/tooltip" },
  Typography: { kind: "component", docs: "components/typography" },
  TypographyProps: { kind: "type", docs: "components/typography" },
  Video: { kind: "component", docs: "components/video" },
  VideoProps: { kind: "type", docs: "components/video" },
  VideoRadius: { kind: "type", docs: "components/video" },
  VideoSource: { kind: "type", docs: "components/video" },

  // src/charts
  AreaChart: { kind: "component", docs: "components/area-chart" },
  AreaChartProps: { kind: "type", docs: "components/area-chart" },
  BarList: { kind: "component", docs: "components/bar-list" },
  BarListProps: { kind: "type", docs: "components/bar-list" },
  BoxPlot: { kind: "component", docs: "components/box-plot" },
  BoxPlotProps: { kind: "type", docs: "components/box-plot" },
  BoxSample: { kind: "type", docs: "components/box-plot" },
  BulletChart: { kind: "component", docs: "components/bullet-chart" },
  BulletChartProps: { kind: "type", docs: "components/bullet-chart" },
  BulletDatum: { kind: "type", docs: "components/bullet-chart" },
  Candle: { kind: "type", docs: "components/candlestick-chart" },
  CandlestickChart: { kind: "component", docs: "components/candlestick-chart" },
  CandlestickChartProps: { kind: "type", docs: "components/candlestick-chart" },
  Chart: { kind: "component", docs: "components/chart" },
  ChartDatum: { kind: "type", docs: "components/chart" },
  ChartProps: { kind: "type", docs: "components/chart" },
  ComposedChart: { kind: "component", docs: "components/composed-chart" },
  ComposedChartProps: { kind: "type", docs: "components/composed-chart" },
  ComposedSeries: { kind: "type", docs: "components/composed-chart" },
  DepthChart: { kind: "component", docs: "components/depth-chart" },
  DepthChartProps: { kind: "type", docs: "components/depth-chart" },
  FunnelChart: { kind: "component", docs: "components/funnel-chart" },
  FunnelChartProps: { kind: "type", docs: "components/funnel-chart" },
  Gauge: { kind: "component", docs: "components/gauge" },
  GaugeProps: { kind: "type", docs: "components/gauge" },
  GeoMap: { kind: "component", docs: "components/geo-map" },
  GeoMapPoint: { kind: "type", docs: "components/geo-map" },
  GeoMapProps: { kind: "type", docs: "components/geo-map" },
  Heatmap: { kind: "component", docs: "components/heatmap" },
  HeatmapProps: { kind: "type", docs: "components/heatmap" },
  Histogram: { kind: "component", docs: "components/histogram" },
  HistogramProps: { kind: "type", docs: "components/histogram" },
  LineChart: { kind: "component", docs: "components/line-chart" },
  LineChartProps: { kind: "type", docs: "components/line-chart" },
  MetricBreakdown: { kind: "component", docs: "components/metric-breakdown" },
  MetricBreakdownChip: { kind: "type", docs: "components/metric-breakdown" },
  MetricBreakdownProps: { kind: "type", docs: "components/metric-breakdown" },
  PieChart: { kind: "component", docs: "components/pie-chart" },
  PieChartProps: { kind: "type", docs: "components/pie-chart" },
  ProgressRing: { kind: "component", docs: "components/progress-ring" },
  ProgressRingProps: { kind: "type", docs: "components/progress-ring" },
  RadarChart: { kind: "component", docs: "components/radar-chart" },
  RadarChartProps: { kind: "type", docs: "components/radar-chart" },
  RadialBarChart: { kind: "component", docs: "components/radial-bar-chart" },
  RadialBarChartProps: { kind: "type", docs: "components/radial-bar-chart" },
  RangeAreaChart: { kind: "component", docs: "components/range-area-chart" },
  RangeAreaChartProps: { kind: "type", docs: "components/range-area-chart" },
  RangePoint: { kind: "type", docs: "components/range-area-chart" },
  ScatterPlot: { kind: "component", docs: "components/scatter-plot" },
  ScatterPlotProps: { kind: "type", docs: "components/scatter-plot" },
  ScatterPoint: { kind: "type" },
  ScatterSelection: { kind: "type", docs: "components/scatter-plot" },
  ScatterSeries: { kind: "type", docs: "components/scatter-plot" },
  ServiceHealthItem: { kind: "type", docs: "components/service-health-list" },
  ServiceHealthList: { kind: "component", docs: "components/service-health-list" },
  ServiceHealthListProps: { kind: "type", docs: "components/service-health-list" },
  BreakdownRow: { kind: "type", docs: "components/bar-list" },
  ChartSeries: { kind: "type", docs: "components/chart" },
  DepthLevel: { kind: "type", docs: "components/depth-chart" },
  StackedSegment: { kind: "type", docs: "components/pie-chart" },
  UptimePeriod: { kind: "type", docs: "components/uptime-bar" },
  Sparkline: { kind: "component", docs: "components/sparkline" },
  SparklineProps: { kind: "type", docs: "components/sparkline" },
  StackedBar: { kind: "component", docs: "components/stacked-bar" },
  StackedBarProps: { kind: "type", docs: "components/stacked-bar" },
  Treemap: { kind: "component", docs: "components/treemap" },
  TreemapDatum: { kind: "type", docs: "components/treemap" },
  TreemapProps: { kind: "type", docs: "components/treemap" },
  UptimeBar: { kind: "component", docs: "components/uptime-bar" },
  UptimeBarProps: { kind: "type", docs: "components/uptime-bar" },
  WaterfallChart: { kind: "component", docs: "components/waterfall-chart" },
  WaterfallChartProps: { kind: "type", docs: "components/waterfall-chart" },
  WaterfallStep: { kind: "type", docs: "components/waterfall-chart" },

  // src/molecules
  Accordion: { kind: "component", docs: "components/accordion" },
  AccordionItem: { kind: "type", docs: "components/accordion" },
  AccordionProps: { kind: "type", docs: "components/accordion" },
  ActionPanel: { kind: "component", docs: "components/action-panels" },
  ActionPanelProps: { kind: "type", docs: "components/action-panels" },
  Alert: { kind: "component", docs: "components/alert" },
  AlertProps: { kind: "type", docs: "components/alert" },
  AlertDialog: { kind: "component", docs: "components/alert-dialog" },
  AlertDialogProps: { kind: "type", docs: "components/alert-dialog" },
  Card: { kind: "component", docs: "components/card" },
  CardContent: { kind: "part", docs: "components/card" },
  CardDescription: { kind: "part" },
  CardFooter: { kind: "part", docs: "components/card" },
  CardHeader: { kind: "part", docs: "components/card" },
  CardMedia: { kind: "part", docs: "components/card" },
  CardMediaProps: { kind: "type", docs: "components/card" },
  CardProps: { kind: "type", docs: "components/card" },
  CardSectionProps: { kind: "type", docs: "components/card" },
  CardSeparator: { kind: "part", docs: "components/card" },
  CardTextProps: { kind: "type", docs: "components/card" },
  CardTitle: { kind: "part", docs: "components/card" },
  CodeBlock: { kind: "component", docs: "components/code-block" },
  CodeBlockProps: { kind: "type", docs: "components/code-block" },
  CodeBlockTab: { kind: "type", docs: "components/code-block" },
  CodeToken: { kind: "deprecated-alias", replacement: "CodeBlock" },
  syntaxColor: { kind: "deprecated-alias", replacement: "CodeBlock" },
  tokenize: { kind: "deprecated-alias", replacement: "CodeBlock" },
  TokenKind: { kind: "deprecated-alias", replacement: "CodeBlock" },
  Collapsible: { kind: "component", docs: "components/collapsible" },
  CollapsibleProps: { kind: "type", docs: "components/collapsible" },
  DescriptionList: { kind: "component", docs: "components/description-lists" },
  DescriptionListAvatar: { kind: "type" },
  DescriptionListItem: { kind: "type", docs: "components/description-lists" },
  DescriptionListProps: { kind: "type", docs: "components/description-lists" },
  EmptyState: { kind: "component", docs: "components/empty-state" },
  EmptyStateProps: { kind: "type", docs: "components/empty-state" },
  Feed: { kind: "component", docs: "components/feeds" },
  FeedItem: { kind: "type", docs: "components/feeds" },
  FeedProps: { kind: "type", docs: "components/feeds" },
  Field: { kind: "component", docs: "components/field" },
  FieldProps: { kind: "type", docs: "components/field" },
  Form: { kind: "component", docs: "components/form" },
  FormProps: { kind: "type", docs: "components/form" },
  FormSection: { kind: "part", docs: "components/form" },
  FormSectionProps: { kind: "type", docs: "components/form" },
  GridList: { kind: "component", docs: "components/grid-lists" },
  GridListAction: { kind: "type" },
  GridListItem: { kind: "type", docs: "components/grid-lists" },
  GridListProps: { kind: "type", docs: "components/grid-lists" },
  MediaObject: { kind: "component", docs: "components/media-objects" },
  MediaObjectProps: { kind: "type", docs: "components/media-objects" },
  flagOf: { kind: "utility" },
  PHONE_COUNTRIES: { kind: "utility", docs: "components/phone-input" },
  PhoneCountry: { kind: "type", docs: "components/phone-input" },
  PhoneEntryProps: { kind: "type", docs: "components/phone-input" },
  PhoneInput: { kind: "component", docs: "components/phone-input" },
  PhoneInputProps: { kind: "type", docs: "components/phone-input" },
  StackedList: { kind: "component", docs: "components/stacked-lists" },
  StackedListItem: { kind: "type", docs: "components/stacked-lists" },
  StackedListMove: { kind: "type", docs: "components/stacked-lists" },
  StackedListProps: { kind: "type", docs: "components/stacked-lists" },
  StatItem: { kind: "type", docs: "components/stats" },
  Stats: { kind: "component", docs: "components/stats" },
  StatsProps: { kind: "type", docs: "components/stats" },

  // src/organisms
  ActionSheet: { kind: "component", docs: "components/action-sheet" },
  ActionSheetAction: { kind: "type", docs: "components/action-sheet" },
  ActionSheetProps: { kind: "type", docs: "components/action-sheet" },
  applyBoardMove: { kind: "utility", docs: "components/board" },
  Board: { kind: "component", docs: "components/board" },
  BoardColumn: { kind: "type", docs: "components/board" },
  BoardItem: { kind: "type", docs: "components/board" },
  BoardMove: { kind: "type", docs: "components/board" },
  BoardProps: { kind: "type", docs: "components/board" },
  Calendar: { kind: "component", docs: "components/calendar" },
  CalendarProps: { kind: "type", docs: "components/calendar" },
  Carousel: { kind: "component", docs: "components/carousel" },
  CarouselProps: { kind: "type", docs: "components/carousel" },
  Command: { kind: "component", docs: "components/command" },
  CommandGroup: { kind: "type", docs: "components/command" },
  CommandItem: { kind: "type", docs: "components/command" },
  CommandProps: { kind: "type", docs: "components/command" },
  clearStoredDashboardOrder: { kind: "utility", docs: "components/dashboard-grid" },
  DASHBOARD_COLUMNS: { kind: "deprecated-alias", replacement: "DashboardGrid" },
  DashboardGrid: { kind: "component", docs: "components/dashboard-grid" },
  DashboardGridProps: { kind: "type", docs: "components/dashboard-grid" },
  DashboardTier: { kind: "deprecated-alias", replacement: "DashboardGrid" },
  DashboardWidget: { kind: "type", docs: "components/dashboard-grid" },
  effectiveSpan: { kind: "deprecated-alias", replacement: "DashboardGrid" },
  moveWidget: { kind: "deprecated-alias", replacement: "DashboardGrid" },
  orderedWidgets: { kind: "deprecated-alias", replacement: "DashboardGrid" },
  DataTable: { kind: "component", docs: "components/data-table" },
  DataTableColumn: { kind: "type", docs: "components/data-table" },
  DataTableProps: { kind: "type", docs: "components/data-table" },
  DataTableSort: { kind: "type", docs: "components/data-table" },
  Dialog: { kind: "component", docs: "components/dialog" },
  DialogProps: { kind: "type", docs: "components/dialog" },
  DragDropProvider: { kind: "component", docs: "components/drag-drop" },
  DragDropProviderProps: { kind: "type", docs: "components/drag-drop" },
  Draggable: { kind: "part", docs: "components/drag-drop" },
  DraggableProps: { kind: "type", docs: "components/drag-drop" },
  DragHandle: { kind: "part", docs: "components/drag-drop" },
  DragHandleProps: { kind: "type", docs: "components/drag-drop" },
  DropEvent: { kind: "type", docs: "components/drag-drop" },
  DropZone: { kind: "part", docs: "components/drag-drop" },
  DropZoneProps: { kind: "type", docs: "components/drag-drop" },
  Drawer: { kind: "component", docs: "components/drawer" },
  DrawerProps: { kind: "type", docs: "components/drawer" },
  FilterGroup: { kind: "type", docs: "components/filter-panel" },
  FilterOption: { kind: "type" },
  FilterPanel: { kind: "component", docs: "components/filter-panel" },
  FilterPanelProps: { kind: "type", docs: "components/filter-panel" },
  Navbar: { kind: "component", docs: "components/navbars" },
  NavbarProps: { kind: "type", docs: "components/navbars" },
  RowMenu: { kind: "component", docs: "components/row-menu" },
  RowMenuItem: { kind: "type", docs: "components/row-menu" },
  RowMenuProps: { kind: "type", docs: "components/row-menu" },
  Sidebar: { kind: "component", docs: "components/sidebar" },
  SidebarItem: { kind: "type", docs: "components/sidebar" },
  SidebarProps: { kind: "type", docs: "components/sidebar" },
  SidebarSection: { kind: "type", docs: "components/sidebar" },
  Step: { kind: "type", docs: "components/steps" },
  Steps: { kind: "component", docs: "components/steps" },
  StepsProps: { kind: "type", docs: "components/steps" },
  TabBar: { kind: "component", docs: "components/tab-bar" },
  TabBarItem: { kind: "type", docs: "components/tab-bar" },
  TabBarProps: { kind: "type", docs: "components/tab-bar" },
  TabItem: { kind: "type", docs: "components/tabs" },
  Tabs: { kind: "component", docs: "components/tabs" },
  TabsProps: { kind: "type", docs: "components/tabs" },
  Toast: { kind: "component", docs: "components/toast" },
  ToastAction: { kind: "type", docs: "components/toast" },
  ToastHandle: { kind: "type" },
  ToastOptions: { kind: "type" },
  ToastProps: { kind: "type", docs: "components/toast" },
  ToastProvider: { kind: "part", docs: "components/toast" },
  useToast: { kind: "hook", docs: "components/toast" },

  // src/style/a11y-preferences.ts
  useIncreasedContrast: { kind: "hook" },
  useReducedTransparency: { kind: "hook" },

  // src/style/active-indicator.ts
  activeIndicator: { kind: "deprecated-alias" },
  ActiveIndicatorOptions: { kind: "deprecated-alias" },

  // src/style/anchored-overlay.tsx (deprecated aliases since the AnchoredOverlay audit
  // turn, K12-2)
  AnchoredOverlay: { kind: "deprecated-alias", replacement: "Popover" },
  AnchoredOverlayProps: { kind: "deprecated-alias", replacement: "PopoverProps" },
  placeOverlay: { kind: "deprecated-alias" },
  useOverlayAnchor: { kind: "deprecated-alias" },
  useOverlaySide: { kind: "deprecated-alias" },

  // src/style/color.ts
  alpha: { kind: "utility" },
  channelsOf: { kind: "utility" },
  composite: { kind: "utility" },
  contrastRatio: { kind: "utility" },
  inkOn: { kind: "utility" },
  mixOklab: { kind: "utility" },
  relativeLuminance: { kind: "utility" },

  // src/style/container.ts
  ContainerBreakpoint: { kind: "type" },
  ContainerBreakpointOptions: { kind: "type" },
  containerProbe: { kind: "internal-by-accident" },
  MeasuredWidth: { kind: "type" },
  useContainerBreakpoint: { kind: "hook" },
  useContainerWidth: { kind: "hook" },
  useMeasuredWidth: { kind: "hook" },

  // src/style/dev-warn.ts
  devWarn: { kind: "deprecated-alias" },
  resetDevWarnings: { kind: "deprecated-alias" },

  // src/style/entrance.tsx (deprecated aliases since the Entrance audit turn, K12-2). No
  // single public name replaces either one: every anchored card applies the hold to its
  // own card, so their `@deprecated` text names those components.
  Entrance: { kind: "deprecated-alias" },
  EntranceProps: { kind: "deprecated-alias" },

  // src/style/floating-label.tsx (deprecated aliases since the FloatingLabel audit turn,
  // K12-2). No single public name replaces any of them: Input, Textarea, Select and
  // Autocomplete float the label, and every field family renders its label and required
  // marker, from their own `label` and `required` props, so the `@deprecated` text names
  // those components.
  FloatingLabel: { kind: "deprecated-alias" },
  FloatingLabelStyles: { kind: "deprecated-alias" },
  HIDDEN_FROM_A11Y: { kind: "deprecated-alias" },
  LabelContent: { kind: "deprecated-alias" },

  // src/style/focus-reset.ts
  FOCUS_RESET: { kind: "deprecated-alias" },

  // src/style/fonts.ts
  FontFaces: { kind: "type" },
  FontWeightKey: { kind: "type" },
  ResolvedFace: { kind: "internal-by-accident" },
  resolveFontFace: { kind: "internal-by-accident" },
  ThemeFonts: { kind: "type" },
  typeface: { kind: "token" },
  weightKey: { kind: "internal-by-accident" },

  // src/style/gesture-surface.ts
  GESTURE_SURFACE: { kind: "deprecated-alias" },

  // src/style/glass-fill.ts
  innerFill: { kind: "deprecated-alias" },
  InnerFillRole: { kind: "deprecated-alias" },
  InnerFillStrength: { kind: "deprecated-alias" },
  inverseDenseTint: { kind: "deprecated-alias" },
  isGlass: { kind: "deprecated-alias", replacement: "useTheme" },
  withInnerFill: { kind: "deprecated-alias" },

  // src/style/glass-surface/glass-pane.tsx
  GlassPane: { kind: "internal-by-accident" },
  GlassPaneProps: { kind: "internal-by-accident" },
  PANE_SIBLING_INPUT: { kind: "internal-by-accident" },
  paneStyle: { kind: "internal-by-accident" },

  // src/style/glass-surface/glass-surface.shared.tsx
  GlassModalBlurTarget: { kind: "component" },

  // src/style/glass-surface/glass-surface.tsx
  GlassSurface: { kind: "internal-by-accident" },

  // src/style/glass-surface/liquid-glass.ts
  liquidGlassAvailable: { kind: "utility", docs: "patterns/glass" },

  // src/style/loop.tsx
  createLoopChannel: { kind: "internal-by-accident" },
  LoopChannel: { kind: "internal-by-accident" },
  LoopChannelOptions: { kind: "internal-by-accident" },
  LoopChannelState: { kind: "internal-by-accident" },
  LoopTrack: { kind: "internal-by-accident" },
  LoopView: { kind: "internal-by-accident" },
  LoopViewProps: { kind: "internal-by-accident" },
  trackAt: { kind: "internal-by-accident" },
  trackSamples: { kind: "internal-by-accident" },
  trackValueAt: { kind: "internal-by-accident" },

  // src/style/mono.ts
  MONO_FONT: { kind: "deprecated-alias", replacement: "Typography" },

  // src/style/motion.ts
  enableAndroidLayoutAnimations: { kind: "deprecated-alias" },
  holdThen: { kind: "deprecated-alias" },
  keyframes: { kind: "deprecated-alias" },
  supportsNativeDriver: { kind: "deprecated-alias" },
  thereAndBack: { kind: "deprecated-alias" },
  useReducedMotion: { kind: "hook" },

  // src/style/numerals.ts (a deprecated alias since Typography took `tabular`, the
  // FoundationReference audit turn's K12-2 tabular)
  tabularNums: { kind: "deprecated-alias", replacement: "Typography" },

  // src/style/pointer.ts
  useHoverCapable: { kind: "hook", docs: "patterns/responsive" },
  usePointerCoarse: { kind: "hook", docs: "patterns/responsive" },

  // src/style/portal.tsx
  insetOverlayBounds: { kind: "internal-by-accident" },
  intersectOverlayBounds: { kind: "internal-by-accident" },
  OverlayBounds: { kind: "internal-by-accident" },
  OverlayHost: { kind: "internal-by-accident" },
  OverlayProvider: { kind: "component" },
  OverlayProviderProps: { kind: "type" },
  OverlayViewportInsets: { kind: "type" },
  Portal: { kind: "internal-by-accident" },
  PortalProps: { kind: "internal-by-accident" },
  useOverlayHost: { kind: "internal-by-accident" },

  // src/style/pressable.tsx
  Pressable: { kind: "component", docs: "components/pressable" },

  // src/style/responsive.tsx (SsrBreakpointContext and the useWindowDimensions
  // pass-through are deprecated aliases since the BreakpointOverride audit turn, K12-2
  // and its OD5)
  BreakpointOverride: { kind: "component", docs: "tokens/layout" },
  FormFactor: { kind: "type", docs: "tokens/layout" },
  formFactor: { kind: "utility", docs: "tokens/layout" },
  Responsive: { kind: "type", docs: "tokens/layout" },
  responsive: { kind: "utility", docs: "tokens/layout" },
  SsrBreakpointContext: { kind: "deprecated-alias", replacement: "ThemeProvider" },
  useBreakpoint: { kind: "hook", docs: "patterns/responsive" },
  useFormFactor: { kind: "hook", docs: "patterns/responsive" },
  useResponsive: { kind: "hook", docs: "patterns/responsive" },
  // React Native's own hook, passed through. No single kit export replaces it (the viewport
  // tier for window-level chrome, a container hook inside a component, React Native's own
  // hook for raw pixels), so its `@deprecated` text names the three.
  useWindowDimensions: { kind: "deprecated-alias" },

  // src/style/ripple-clip.tsx
  cornerRadii: { kind: "internal-by-accident" },
  RippleClip: { kind: "internal-by-accident" },
  RippleClipProps: { kind: "internal-by-accident" },
  rippleClipWrapperStyle: { kind: "internal-by-accident" },
  splitElevation: { kind: "internal-by-accident" },

  // src/style/ripple.ts and src/style/touch-target.ts (deprecated aliases since the
  // FoundationReference audit turn, K12-2). No public name replaces any of them: the kit's
  // controls show their own press feedback and meet the platform minimum touch target
  // themselves, and a control the kit lacks belongs in the kit, so their `@deprecated`
  // text names those controls.
  controlRipple: { kind: "deprecated-alias" },
  platformDisabledDim: { kind: "deprecated-alias" },
  pressDim: { kind: "deprecated-alias" },
  rippleClip: { kind: "deprecated-alias" },
  surfaceRipple: { kind: "deprecated-alias" },

  // src/style/rtl.ts
  isRTL: { kind: "deprecated-alias" },

  // src/style/shadow.ts
  customShadow: { kind: "internal-by-accident" },
  shadow: { kind: "utility" },
  ShadowLevel: { kind: "type" },

  // src/style/sizing.ts
  CELL_AXIS: { kind: "internal-by-accident" },
  clampSpan: { kind: "internal-by-accident" },
  columnAxis: { kind: "internal-by-accident" },
  FILL: { kind: "internal-by-accident" },
  FillOptions: { kind: "internal-by-accident" },
  GRID_CELL_AXIS: { kind: "internal-by-accident" },
  GRID_COLUMNS: { kind: "internal-by-accident" },
  HUG_IN_STRETCH_COLUMN: { kind: "internal-by-accident" },
  layoutAxis: { kind: "internal-by-accident" },
  LayoutAxis: { kind: "internal-by-accident" },
  LayoutAxisProvider: { kind: "internal-by-accident" },
  LayoutStyle: { kind: "type" },
  MeasureProps: { kind: "type" },
  measureStyle: { kind: "internal-by-accident" },
  ROW_AXIS: { kind: "internal-by-accident" },
  SizingKey: { kind: "type" },
  spanWidth: { kind: "internal-by-accident" },
  stepOf: { kind: "internal-by-accident" },
  useFillStyle: { kind: "internal-by-accident" },
  useHugStyle: { kind: "internal-by-accident" },
  useLayoutAxis: { kind: "internal-by-accident" },
  useMeasureStyle: { kind: "internal-by-accident" },
  useSizing: { kind: "internal-by-accident" },

  // src/style/status-hue.ts
  HUE_WASH: { kind: "deprecated-alias", replacement: "statusColors" },
  Hue: { kind: "type" },
  statusHues: { kind: "token", docs: "tokens/colors", section: "Status surfaces" },
  StatusTone: { kind: "type" },

  // src/style/status.ts
  StatusColors: { kind: "type" },
  statusColors: { kind: "utility" },
  StatusColorTone: { kind: "type" },

  // src/style/text.tsx
  fontStyle: { kind: "deprecated-alias", replacement: "Text" },
  Text: { kind: "component", docs: "components/text" },
  TextInput: { kind: "component", docs: "components/text-input" },

  // src/style/theme.tsx
  Surface: { kind: "type" },
  ThemeProvider: { kind: "component", docs: "theming", section: "Native (ThemeProvider)" },
  ThemeProviderProps: { kind: "type" },
  ThemeTokenOverrides: { kind: "type" },
  ThemeValue: { kind: "type" },
  useTheme: { kind: "hook", docs: "theming", section: "Native (ThemeProvider)" },

  // src/style/tokens.ts
  baseColors: { kind: "token" },
  brandColors: { kind: "deprecated-alias" },
  BrandColors: { kind: "type" },
  BreakpointKey: { kind: "type" },
  breakpoints: { kind: "token" },
  colorsByScheme: { kind: "token" },
  ColorScheme: { kind: "type" },
  colorsFor: { kind: "utility", docs: "theming", section: "Palettes" },
  ColorTokens: { kind: "type" },
  darkColors: { kind: "token", docs: "tokens/colors" },
  darkGlass: { kind: "token" },
  fontSize: { kind: "token" },
  fontWeight: { kind: "token" },
  glassByScheme: { kind: "token", docs: "tokens/colors", section: "Glass" },
  GlassTokens: { kind: "type" },
  letterSpacing: { kind: "token" },
  lightColors: { kind: "token", docs: "tokens/colors" },
  lightGlass: { kind: "token" },
  lineHeight: { kind: "token" },
  mintColors: { kind: "token", docs: "tokens/colors" },
  palette: { kind: "token" },
  Palette: { kind: "type" },
  PlatformKey: { kind: "type" },
  radius: { kind: "token" },
  shape: { kind: "token" },
  ShapeTokens: { kind: "type" },
  spacing: { kind: "token" },
  WidthKey: { kind: "type" },
  widths: { kind: "token" },

  // src/style/touch-target-seed.ts
  MinTargetOptions: { kind: "deprecated-alias" },
  minTargetSlop: { kind: "deprecated-alias" },

  // src/style/touch-target.ts
  platformMinTarget: { kind: "deprecated-alias" },
  TOUCH_TARGET: { kind: "deprecated-alias" },
  TouchTargetSkin: { kind: "deprecated-alias" },
  useMinTargetSlop: { kind: "deprecated-alias" },

  // src/style/use-controllable-state.ts
  useControllableState: { kind: "deprecated-alias" },

  // src/style/use-dialog-focus.ts
  useDialogFocus: { kind: "deprecated-alias", replacement: "Dialog" },
  usePopoverFocus: { kind: "deprecated-alias", replacement: "Popover" },

  // src/style/use-escape-key.ts
  useEscapeKey: { kind: "deprecated-alias" },

  // src/style/use-hardware-back.ts
  useHardwareBack: { kind: "deprecated-alias" },

  // src/style/use-roving-focus.ts
  RovingFocusOptions: { kind: "deprecated-alias" },
  RovingItemProps: { kind: "deprecated-alias" },
  useRovingFocus: { kind: "deprecated-alias" },

  // src/style/use-wheel.ts
  normalizeWheelDelta: { kind: "deprecated-alias" },
  useWheel: { kind: "deprecated-alias" },
  WheelGesture: { kind: "deprecated-alias" },

  // src/theme.ts
  Density: { kind: "type" },
  getDensity: { kind: "utility", docs: "theming", section: "Density" },
  getPalette: { kind: "utility", docs: "theming", section: "Palettes" },
  getSurface: { kind: "utility", docs: "theming", section: "Glass Surface" },
  getTheme: { kind: "utility", docs: "theming", section: "Light / Dark Mode" },
  setDensity: { kind: "utility", docs: "theming", section: "Density" },
  setPalette: { kind: "utility", docs: "theming", section: "Palettes" },
  setSurface: { kind: "utility", docs: "theming", section: "Glass Surface" },
  setTheme: { kind: "utility", docs: "theming", section: "Light / Dark Mode" },
  Theme: { kind: "type" },
  toggleTheme: { kind: "utility", docs: "theming", section: "Light / Dark Mode" },

  // src/tokens.ts
  hsl: { kind: "utility", docs: "integration", section: "Reading tokens (web)" },
  token: { kind: "utility", docs: "integration", section: "Reading tokens (web)" },

  // react-native, re-exported by src/style/primitives.ts. The StyleSheet pass-through is a
  // deprecated alias since the FoundationReference audit turn (K12-2 OD5): it invites raw
  // styling, and nothing in the kit replaces it.
  ImageStyle: { kind: "type" },
  LayoutChangeEvent: { kind: "type" },
  NativeScrollEvent: { kind: "type" },
  NativeSyntheticEvent: { kind: "type" },
  PressableProps: { kind: "type" },
  PressableStateCallbackType: { kind: "type" },
  ScrollView: { kind: "component", docs: "components/scroll-view" },
  ScrollViewProps: { kind: "type" },
  StyleProp: { kind: "type" },
  StyleSheet: { kind: "deprecated-alias" },
  TextInputProps: { kind: "type" },
  TextProps: { kind: "type" },
  TextStyle: { kind: "type" },
  View: { kind: "component", docs: "components/view" },
  ViewProps: { kind: "type" },
  ViewStyle: { kind: "type" },
};

/** Every file the `./styles/*` entry point reaches, by repo-relative path. */
export const files: Readonly<Record<string, ApiEntry>> = {
  // The supported CSS entry: the web token hand-off, one file to link.
  "styles/canvas.css": { kind: "token", docs: "integration", section: "Package exports" },
  // The per-concern files canvas.css imports. Each is reachable on its own through the
  // wildcard, and no page names one as an entry point.
  "styles/tokens/base.css": { kind: "part" },
  "styles/tokens/colors.css": { kind: "part" },
  "styles/tokens/density.css": { kind: "part" },
  "styles/tokens/motion.css": { kind: "part" },
  "styles/tokens/palette.css": { kind: "part" },
  "styles/tokens/platforms.css": { kind: "part" },
  "styles/tokens/radius.css": { kind: "part" },
  "styles/tokens/shadows.css": { kind: "part" },
  "styles/tokens/spacing.css": { kind: "part" },
  "styles/tokens/surface.css": { kind: "part" },
  "styles/tokens/typography.css": { kind: "part" },
};

/**
 * The staged docs migration (audit K12): every export and file with no docs route yet,
 * each with the route planned for it. It is not a waiver. check:api fails when a
 * listed name is also given a docs route, when its planned page already names it (move
 * it to `docs` then), when its route is closed (PLANNED_ROUTES, below), and when a
 * deprecated alias waits here once the foundation reference (K12-10) exists. The list
 * empties route by route, as each route's turn lands its docs.
 */
export const PENDING_DOCS: Readonly<Record<string, DocsRoute>> = {
  // K12-3 and K12-4: the ThemeProvider reference, reading the theme, the palette axis and
  // the accessibility preferences.
  Density: "theming",
  Palette: "theming",
  Surface: "theming",
  Theme: "theming",
  ThemeProviderProps: "theming",
  ThemeTokenOverrides: "theming",
  ThemeValue: "theming",
  useIncreasedContrast: "theming",
  useReducedMotion: "theming",
  useReducedTransparency: "theming",

  // K12-5 and K12-7: overlay hosting (OverlayProvider, the Modal blur bridge), and the
  // token files canvas.css imports.
  GlassModalBlurTarget: "integration",
  OverlayProvider: "integration",
  OverlayProviderProps: "integration",
  OverlayViewportInsets: "integration",
  "styles/tokens/base.css": "integration",
  "styles/tokens/colors.css": "integration",
  "styles/tokens/density.css": "integration",
  "styles/tokens/motion.css": "integration",
  "styles/tokens/palette.css": "integration",
  "styles/tokens/platforms.css": "integration",
  "styles/tokens/radius.css": "integration",
  "styles/tokens/shadows.css": "integration",
  "styles/tokens/spacing.css": "integration",
  "styles/tokens/surface.css": "integration",
  "styles/tokens/typography.css": "integration",

  // K12-6: the container hooks and the sizing and width vocabulary (the viewport tier and
  // BreakpointOverride are documented there since the BreakpointOverride audit turn).
  BreakpointKey: "tokens/layout",
  breakpoints: "tokens/layout",
  ContainerBreakpoint: "tokens/layout",
  ContainerBreakpointOptions: "tokens/layout",
  LayoutStyle: "tokens/layout",
  MeasuredWidth: "tokens/layout",
  MeasureProps: "tokens/layout",
  SizingKey: "tokens/layout",
  useContainerBreakpoint: "tokens/layout",
  useContainerWidth: "tokens/layout",
  useMeasuredWidth: "tokens/layout",
  WidthKey: "tokens/layout",
  widths: "tokens/layout",

  // K12-7: the color sets, glass tints, status colors and hues, the Tailwind palette and
  // the color utilities.
  alpha: "tokens/colors",
  baseColors: "tokens/colors",
  channelsOf: "tokens/colors",
  colorsByScheme: "tokens/colors",
  ColorScheme: "tokens/colors",
  ColorTokens: "tokens/colors",
  composite: "tokens/colors",
  contrastRatio: "tokens/colors",
  darkGlass: "tokens/colors",
  GlassTokens: "tokens/colors",
  Hue: "tokens/colors",
  inkOn: "tokens/colors",
  lightGlass: "tokens/colors",
  mixOklab: "tokens/colors",
  palette: "tokens/colors",
  relativeLuminance: "tokens/colors",
  StatusColors: "tokens/colors",
  statusColors: "tokens/colors",
  StatusColorTone: "tokens/colors",
  StatusTone: "tokens/colors",

  // K12-7: the spacing, radius and shape references.
  PlatformKey: "tokens/spacing",
  radius: "tokens/spacing",
  shape: "tokens/spacing",
  ShapeTokens: "tokens/spacing",
  spacing: "tokens/spacing",

  // K12-7: the typeface and its font types.
  FontFaces: "tokens/typography",
  FontWeightKey: "tokens/typography",
  ThemeFonts: "tokens/typography",
  typeface: "tokens/typography",

  // K12-7: the re-exported React Native types, linked to React Native's docs.
  ImageStyle: "rn-primitives",
  LayoutChangeEvent: "rn-primitives",
  NativeScrollEvent: "rn-primitives",
  NativeSyntheticEvent: "rn-primitives",
  PressableProps: "rn-primitives",
  PressableStateCallbackType: "rn-primitives",
  ScrollViewProps: "rn-primitives",
  StyleProp: "rn-primitives",
  TextInputProps: "rn-primitives",
  TextProps: "rn-primitives",
  TextStyle: "rn-primitives",
  ViewProps: "rn-primitives",
  ViewStyle: "rn-primitives",

  // K12-8 and a component's own types: the anatomy parts and helpers on their family page.
  BreadcrumbItem: "components/breadcrumb",
  CardDescription: "components/card",
  DescriptionListAvatar: "components/description-lists",
  FilterOption: "components/filter-panel",
  GridListAction: "components/grid-lists",
  IconName: "components/icon",
  flagOf: "components/phone-input",
  ScatterPoint: "components/scatter-plot",
  ToastHandle: "components/toast",
  ToastOptions: "components/toast",

  // K12-10: the generated foundation reference, home of every deprecated name (K12-2
  // retires the internal helpers, the Riskora type ladder, the shadow helpers and the
  // React Native pass-throughs as aliases) and of public names no narrative page takes.
  activeIndicator: "foundation",
  ActiveIndicatorOptions: "foundation",
  AnchoredOverlay: "foundation",
  AnchoredOverlayProps: "foundation",
  BrandColors: "foundation",
  brandColors: "foundation",
  CELL_AXIS: "foundation",
  clampSpan: "foundation",
  CodeToken: "foundation",
  columnAxis: "foundation",
  containerProbe: "foundation",
  containerStyle: "foundation",
  controlRipple: "foundation",
  cornerRadii: "foundation",
  createLoopChannel: "foundation",
  customShadow: "foundation",
  DASHBOARD_COLUMNS: "foundation",
  DashboardTier: "foundation",
  devWarn: "foundation",
  effectiveSpan: "foundation",
  enableAndroidLayoutAnimations: "foundation",
  Entrance: "foundation",
  EntranceProps: "foundation",
  FILL: "foundation",
  FillOptions: "foundation",
  FloatingLabel: "foundation",
  FloatingLabelStyles: "foundation",
  FLUID: "foundation",
  FOCUS_RESET: "foundation",
  fontSize: "foundation",
  fontStyle: "foundation",
  fontWeight: "foundation",
  GESTURE_SURFACE: "foundation",
  GlassPane: "foundation",
  GlassPaneProps: "foundation",
  GlassSurface: "foundation",
  GRID_CELL_AXIS: "foundation",
  GRID_COLUMNS: "foundation",
  gridCellWidth: "foundation",
  gridColumns: "foundation",
  HIDDEN_FROM_A11Y: "foundation",
  holdThen: "foundation",
  HUE_WASH: "foundation",
  HUG_IN_STRETCH_COLUMN: "foundation",
  innerFill: "foundation",
  InnerFillRole: "foundation",
  InnerFillStrength: "foundation",
  insetOverlayBounds: "foundation",
  intersectOverlayBounds: "foundation",
  inverseDenseTint: "foundation",
  isGlass: "foundation",
  isRTL: "foundation",
  keyframes: "foundation",
  LabelContent: "foundation",
  LayoutAxis: "foundation",
  layoutAxis: "foundation",
  LayoutAxisProvider: "foundation",
  letterSpacing: "foundation",
  lineHeight: "foundation",
  LoopChannel: "foundation",
  LoopChannelOptions: "foundation",
  LoopChannelState: "foundation",
  LoopTrack: "foundation",
  LoopView: "foundation",
  LoopViewProps: "foundation",
  Measure: "foundation",
  measureOf: "foundation",
  measureStyle: "foundation",
  MinTargetOptions: "foundation",
  minTargetSlop: "foundation",
  MONO_FONT: "foundation",
  moveWidget: "foundation",
  normalizeWheelDelta: "foundation",
  orderedWidgets: "foundation",
  OverlayBounds: "foundation",
  OverlayHost: "foundation",
  PANE_SIBLING_INPUT: "foundation",
  paneStyle: "foundation",
  placeOverlay: "foundation",
  platformDisabledDim: "foundation",
  platformMinTarget: "foundation",
  Portal: "foundation",
  PortalProps: "foundation",
  pressDim: "foundation",
  resetDevWarnings: "foundation",
  ResolvedFace: "foundation",
  resolveFontFace: "foundation",
  RippleClip: "foundation",
  rippleClip: "foundation",
  RippleClipProps: "foundation",
  rippleClipWrapperStyle: "foundation",
  RovingFocusOptions: "foundation",
  RovingItemProps: "foundation",
  ROW_AXIS: "foundation",
  shadow: "foundation",
  ShadowLevel: "foundation",
  spanWidth: "foundation",
  splitElevation: "foundation",
  SsrBreakpointContext: "foundation",
  stepOf: "foundation",
  StyleSheet: "foundation",
  supportsNativeDriver: "foundation",
  surfaceRipple: "foundation",
  syntaxColor: "foundation",
  tabularNums: "foundation",
  thereAndBack: "foundation",
  tokenize: "foundation",
  TokenKind: "foundation",
  TOUCH_TARGET: "foundation",
  TouchTargetSkin: "foundation",
  trackAt: "foundation",
  trackSamples: "foundation",
  trackValueAt: "foundation",
  useControllableState: "foundation",
  useDialogFocus: "foundation",
  useEscapeKey: "foundation",
  useFillStyle: "foundation",
  useHardwareBack: "foundation",
  useHugStyle: "foundation",
  useLayoutAxis: "foundation",
  useMeasureStyle: "foundation",
  useMinTargetSlop: "foundation",
  useOverlayAnchor: "foundation",
  useOverlayHost: "foundation",
  useOverlaySide: "foundation",
  usePopoverFocus: "foundation",
  useRovingFocus: "foundation",
  useSizing: "foundation",
  useWheel: "foundation",
  useWindowDimensions: "foundation",
  weightKey: "foundation",
  WheelGesture: "foundation",
  withInnerFill: "foundation",
};

/**
 * Where the staged migration ends, route by route: every route PENDING_DOCS plans names
 * for, with the audit turn that lands its docs (the checklist under audit/ that carries
 * them). That turn closes the route (`closed: true`) once it has moved the last of its
 * names to `docs`; check:api fails when a name is staged for a closed route, when a
 * planned route has no entry here, and when a route nothing is staged for is still open.
 * A route shared by several turns names the last of them, which closes it.
 */
export const PLANNED_ROUTES: Readonly<Record<DocsRoute, PlannedRoute>> = {
  // K12-3 and K12-4: the ThemeProvider reference.
  theming: { turn: "foundation/theme-provider" },
  // K12-5 and K12-7: GlassModalBlurTarget's and OverlayProvider's turns land the overlay
  // hosting names, then the Tokens turn lands the token files and closes the route.
  integration: { turn: "foundation/tokens" },
  // K12-6 and K12-7: the token pages.
  "tokens/colors": { turn: "foundation/tokens" },
  "tokens/layout": { turn: "foundation/tokens" },
  "tokens/spacing": { turn: "foundation/tokens" },
  "tokens/typography": { turn: "foundation/tokens" },
  // K12-7: React Native's types, re-exported beside the five primitives. View's turn, the
  // last of the primitive atoms (Pressable, ScrollView, Text, TextInput, View), lands them.
  "rn-primitives": { turn: "components/view" },
  // K12-8: each component's own parts, helpers and types, on its own page in its own turn.
  "components/breadcrumb": { turn: "components/breadcrumb" },
  "components/card": { turn: "components/card" },
  "components/description-lists": { turn: "components/description-lists" },
  "components/filter-panel": { turn: "components/filter-panel" },
  "components/grid-lists": { turn: "components/grid-lists" },
  "components/icon": { turn: "components/icon" },
  "components/phone-input": { turn: "components/phone-input" },
  "components/scatter-plot": { turn: "components/scatter-plot" },
  "components/toast": { turn: "components/toast" },
  // K12-10: the generated foundation reference. Each Foundations turn moves its names there
  // as it deprecates them (GlassPane, GlassSurface, LayoutAxisProvider, LoopView,
  // OverlayProvider, Portal, RippleClip, the Riskora type ladder and the shadow helpers);
  // Tokens, the last, closes it.
  foundation: { turn: "foundation/tokens" },
};
