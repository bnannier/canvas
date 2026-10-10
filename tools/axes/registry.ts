// Every axis resolver in the kit, as the characterization (test/axes.test.ts) calls it.
//
// An axis is a group of a component's semantic booleans that exclude each other: when a
// call site passes two, the component resolves one (CLAUDE.md, "Semantic prop styling",
// Conflicts). Each entry names the resolver that does it, the members it chooses between,
// and how to call it; tools/axes/characterize.ts records what it returns for no member,
// each member alone and each pair, and test/fixtures/axes.json holds that record. The
// record is what a migration to the declared tables (src/style/axis.ts) is held to: a
// component whose resolver becomes `pick(TABLE, props)` changes `resolve` here and
// nothing in the fixture.
//
// `members` lists every boolean on the axis, including a default the resolver never
// reads but a call site can spell out (AvatarGroup's `tight`), in the order the resolver
// tests them; the fixture records the precedence the calls show. A `rule` is not an axis
// but a cross-member rule a resolver also computes from booleans (Swatch's stretch), held
// the same way. `notes` carry the cross-axis rules that live outside the resolver; they
// are documentation for the axis tables and the generated Precedence section, not data
// the characterization checks.

import type { ColorTokens } from "../../src/style/tokens.ts";
import { widths } from "../../src/style/tokens.ts";
import type { BooleanProps } from "../../src/style/axis.ts";
import { stepOf, type MeasureProps } from "../../src/style/sizing.ts";
import { requestedSchemeOf, requestedSurfaceOf, type ThemeProviderProps } from "../../src/style/theme.tsx";
import { sizeOf as autocompleteSize } from "../../src/atoms/autocomplete/autocomplete.shared.tsx";
import { sizeOf as avatarSize, shapeOf as avatarShape, overlapOf } from "../../src/atoms/avatar/avatar.shared.tsx";
import { alignEndOf } from "../../src/atoms/avatar/avatar-menu.shared.tsx";
import { toneOf as badgeTone, statusOf as badgeStatus, badgeGapOf } from "../../src/atoms/badge/badge.shared.tsx";
import { separatorOf } from "../../src/atoms/breadcrumb/breadcrumb.shared.tsx";
import { intentOf as buttonIntent, sizeOf as buttonSize } from "../../src/atoms/button/button.shared.tsx";
import { kindOf, sizeOf as buttonGroupSize } from "../../src/atoms/button-group/button-group.shared.tsx";
import { sizeOf as checkboxSize } from "../../src/atoms/checkbox/checkbox.shared.tsx";
import { colorOf } from "../../src/atoms/chip/chip.shared.tsx";
import { measureOf, padOf as containerPad } from "../../src/atoms/container/container.shared.tsx";
import { orientationOf, emphasisOf } from "../../src/atoms/divider/divider.shared.tsx";
import { toneOf as emblemTone, sizeOf as emblemSize } from "../../src/atoms/emblem/emblem.shared.tsx";
import { nameOf, strokeOf, type IconProps } from "../../src/atoms/icon/icon.shared.tsx";
import { NAMES } from "../../src/atoms/icon/icon.glyphs.ts";
import { fitOf as imageFit } from "../../src/atoms/image/image.shared.tsx";
import { sizeOf as inputSize } from "../../src/atoms/input/input.shared.tsx";
import { sizeOf as inputOtpSize } from "../../src/atoms/input-otp/input-otp.shared.tsx";
import { gapOf, justifyOf, alignOf as flexAlign, padOf as flexPad } from "../../src/atoms/layout/layout.shared.tsx";
import { modeOf, sizeOf as listboxSize } from "../../src/atoms/listbox/listbox.shared.tsx";
import { sizeOf as paginationSize, variantOf as paginationVariant } from "../../src/atoms/pagination/pagination.shared.tsx";
import { placementOf as popoverPlacement } from "../../src/atoms/popover/popover.shared.tsx";
import { sizeOf as progressSize, toneOf as progressTone } from "../../src/atoms/progress/progress.shared.tsx";
import { sizeOf as qrcodeSize } from "../../src/atoms/qrcode/qrcode.shared.tsx";
import { sizeOf as radioSize } from "../../src/atoms/radio/radio.shared.tsx";
import { revealTravel, type RevealProps } from "../../src/atoms/reveal/reveal.shared.tsx";
import { sizeOf as selectSize } from "../../src/atoms/select/select.shared.tsx";
import { lineHeight, avatarDiameter, buttonSize as skeletonButton, shapeOf as skeletonShape, lengthOf } from "../../src/atoms/skeleton/skeleton.shared.tsx";
import { sizeOf as sliderSize } from "../../src/atoms/slider/slider.shared.tsx";
import { toneOf as spinnerTone, sizeOf as spinnerSize } from "../../src/atoms/spinner/spinner.shared.tsx";
import { sizeOf as stepperSize } from "../../src/atoms/stepper/stepper.shared.tsx";
import { sizeOf as swatchSize, stretchesOf } from "../../src/atoms/swatch/swatch.shared.tsx";
import { sizeOf as switchSize } from "../../src/atoms/switch/switch.shared.tsx";
import { sizeOf as textareaSize } from "../../src/atoms/textarea/textarea.shared.tsx";
import { placementOf as tooltipPlacement, triggerOf } from "../../src/atoms/tooltip/tooltip.shared.tsx";
import { roleOf, toneOf as typographyTone, weightOf, leadingOf, decorationOf } from "../../src/atoms/typography/typography.shared.tsx";
import { fitOf as videoFit } from "../../src/atoms/video/video.shared.tsx";
import { toneOf as actionPanelTone, layoutOf as actionPanelLayout } from "../../src/molecules/action-panels/action-panels.shared.tsx";
import { toneOf as alertTone } from "../../src/molecules/alert/alert.shared.tsx";
import { widthOf as alertDialogWidth } from "../../src/molecules/alert-dialog/alert-dialog.shared.tsx";
import { elevationOf, densityOf as cardDensity } from "../../src/molecules/card/card.shared.tsx";
import { variantOf as codeBlockVariant } from "../../src/molecules/code-block/code-block.shared.tsx";
import { layoutOf as descriptionLayout, valueFormOf } from "../../src/molecules/description-lists/description-lists.shared.tsx";
import { leadOf } from "../../src/molecules/feeds/feeds.shared.tsx";
import { columnsOf } from "../../src/molecules/grid-lists/grid-lists.shared.tsx";
import { alignOf as mediaAlign, directionOf } from "../../src/molecules/media-objects/media-objects.shared.tsx";
import { sizeOf as phoneInputSize } from "../../src/molecules/phone-input/phone-input.shared.tsx";
import { variantOf as stackedListVariant, badgeToneOf } from "../../src/molecules/stacked-lists/stacked-lists.shared.tsx";
import { surfaceOf as statsSurface, accentOf, deltaOf } from "../../src/molecules/stats/stats.shared.tsx";
import { densityOf as calendarDensity, viewOf } from "../../src/organisms/calendar/calendar.shared.tsx";
import { densityOf as dataTableDensity, columnAlignOf } from "../../src/organisms/data-table/data-table.shared.tsx";
import { sizeOf as dialogSize } from "../../src/organisms/dialog/dialog.shared.tsx";
import { edgeOf } from "../../src/organisms/drawer/drawer.shared.tsx";
import { densityOf as filterPanelDensity } from "../../src/organisms/filter-panel/filter-panel.shared.tsx";
import { surfaceOf as navbarSurface } from "../../src/organisms/navbars/navbars.shared.tsx";
import { densityOf as sidebarDensity, frameOf, drawerEdgeOf } from "../../src/organisms/sidebar/sidebar.shared.tsx";
import { layoutOf as stepsLayout } from "../../src/organisms/steps/steps.shared.tsx";
import { variantOf as tabsVariant, wrapsOf, type TabsProps } from "../../src/organisms/tabs/tabs.shared.tsx";
import { intentOf as toastIntent } from "../../src/organisms/toast/toast.shared.tsx";
import { toneOf as barListTone } from "../../src/charts/bar-list/bar-list.shared.tsx";
import { toneOf as boxPlotTone } from "../../src/charts/box-plot/box-plot.shared.tsx";
import { toneOf as bulletTone } from "../../src/charts/bullet-chart/bullet-chart.shared.tsx";
import { toneOf as chartTone } from "../../src/charts/chart/chart.shared.tsx";
import { markOf } from "../../src/charts/composed-chart/composed-chart.shared.tsx";
import { gaugeFill, type GaugeProps } from "../../src/charts/gauge/gauge.shared.tsx";
import { toneOf as histogramTone } from "../../src/charts/histogram/histogram.shared.tsx";
import { rateColor, type MetricBreakdownProps } from "../../src/charts/metric-breakdown/metric-breakdown.shared.tsx";
import { ringFill, type ProgressRingProps } from "../../src/charts/progress-ring/progress-ring.shared.tsx";
import { toneOf as radarTone } from "../../src/charts/radar-chart/radar-chart.shared.tsx";
import { toneOf as rangeAreaTone } from "../../src/charts/range-area-chart/range-area-chart.shared.tsx";
import { toneOf as scatterTone } from "../../src/charts/scatter-plot/scatter-plot.shared.tsx";
import { itemStatus } from "../../src/charts/service-health-list/service-health-list.shared.tsx";
import { slotOf } from "../../src/charts/shared/breakdown-rows.tsx";
import { toneOf as cartesianTone } from "../../src/charts/shared/cartesian-series.tsx";
import { seriesTone } from "../../src/charts/shared/charts.styles.ts";
import { periodStatus } from "../../src/charts/shared/status-strip.tsx";
import { toneOf as sparklineTone, sizeOf as sparklineSize } from "../../src/charts/sparkline/sparkline.shared.tsx";

/** One resolver the characterization calls. */
export interface AxisSubject<P> {
  /** `Component.axis`: the key of the resolver's record in test/fixtures/axes.json. */
  readonly id: string;
  /** The exported components that resolve through it. */
  readonly components: readonly string[];
  /** The docs pages (component slugs) those components are documented on. */
  readonly pages: readonly string[];
  /** The resolver, `file#name`, as tools/axes/resolver-sites.ts names a hand-rolled one. */
  readonly resolver: string;
  /** A cross-member rule rather than an axis (see the header). */
  readonly rule?: true;
  /**
   * The axis is a generated catalog (Icon's glyphs): too large to record pair by pair,
   * so the record states its rule (first in `members` order) and the test proves it for
   * every pair.
   */
  readonly catalog?: true;
  /** Every boolean on the axis, in the order the resolver tests them. */
  readonly members: readonly BooleanProps<P>[];
  /** Calls the resolver. */
  readonly resolve: (p: P) => unknown;
  /** Cross-axis rules that live outside the resolver. */
  readonly notes?: readonly string[];
}

/** An entry with its props type erased, as the characterization reads it. */
export type AnySubject = AxisSubject<Record<string, unknown>>;

const subject = <P>(entry: AxisSubject<P>): AnySubject => entry as unknown as AnySubject;

/**
 * A token map whose every color is its own role name, so a resolver that returns a color
 * records the role it read (`"success"`, `"destructive-text"`) and the record does not
 * move when a palette value does.
 */
export const NAMED_TOKENS = new Proxy({}, { get: (_target, key) => String(key) }) as ColorTokens;

const SIZES = ["small", "large"] as const;
const SIZES_LARGE_FIRST = ["large", "small"] as const;
const CHART_TONES = ["success", "destructive"] as const;
const SLOTS = ["chart1", "chart2", "chart3", "chart4", "chart5", "chart6", "chart7", "chart8"] as const;
const STEPS = Object.keys(widths) as (keyof typeof widths)[];

const MEASURE_COMPONENTS: [string, string][] = [
  ["Autocomplete", "autocomplete"],
  ["Button", "button"],
  ["ButtonGroup", "button-group"],
  ["Field", "field"],
  ["Form", "form"],
  ["Input", "input"],
  ["Listbox", "listbox"],
  ["PhoneInput", "phone-input"],
  ["Progress", "progress"],
  ["Select", "select"],
  ["Slider", "slider"],
  ["Textarea", "textarea"],
];

export const SUBJECTS: readonly AnySubject[] = [
  // The style foundation.
  subject<MeasureProps>({
    id: "Measure.step",
    components: MEASURE_COMPONENTS.map(([name]) => name),
    pages: MEASURE_COMPONENTS.map(([, page]) => page),
    resolver: "src/style/sizing.ts#stepOf",
    members: STEPS,
    resolve: stepOf,
    notes: ["`start` pins a capped component to the leading edge instead of centering it.", "On Button and ButtonGroup a step wins over `block`."],
  }),
  subject<Pick<ThemeProviderProps, "dark" | "light" | "scheme">>({
    id: "ThemeProvider.scheme",
    components: ["ThemeProvider"],
    pages: [],
    resolver: "src/style/theme.tsx#requestedSchemeOf",
    members: ["dark", "light"],
    resolve: (p) => requestedSchemeOf(p, "light"),
    notes: ["With neither, the legacy `scheme` value, then the OS appearance.", "`dark` also wins over the `mint` palette, which paints only the light scheme."],
  }),
  subject<Pick<ThemeProviderProps, "glass" | "solid" | "surface">>({
    id: "ThemeProvider.surface",
    components: ["ThemeProvider"],
    pages: [],
    resolver: "src/style/theme.tsx#requestedSurfaceOf",
    members: ["glass", "solid"],
    resolve: (p) => requestedSurfaceOf(p, () => "solid"),
    notes: ["With neither, the legacy `surface` value, then the platform default (glass on iOS 26 and later, solid elsewhere)."],
  }),

  // Atoms.
  subject({ id: "Autocomplete.size", components: ["Autocomplete"], pages: ["autocomplete"], resolver: "src/atoms/autocomplete/autocomplete.shared.tsx#sizeOf", members: SIZES, resolve: autocompleteSize }),
  subject({ id: "Avatar.size", components: ["Avatar", "AvatarGroup"], pages: ["avatar"], resolver: "src/atoms/avatar/avatar.shared.tsx#sizeOf", members: ["tiny", "small", "large"], resolve: avatarSize }),
  subject({ id: "Avatar.shape", components: ["Avatar"], pages: ["avatar"], resolver: "src/atoms/avatar/avatar.shared.tsx#shapeOf", members: ["circle", "rounded"], resolve: avatarShape }),
  subject({ id: "AvatarGroup.overlap", components: ["AvatarGroup"], pages: ["avatar"], resolver: "src/atoms/avatar/avatar.shared.tsx#overlapOf", members: ["loose", "snug", "tight"], resolve: overlapOf }),
  subject({ id: "AvatarMenu.edge", components: ["AvatarMenu"], pages: ["avatar"], resolver: "src/atoms/avatar/avatar-menu.shared.tsx#alignEndOf", members: ["alignEnd", "alignStart"], resolve: alignEndOf }),
  subject({
    id: "Badge.tone",
    components: ["Badge"],
    pages: ["badge"],
    resolver: "src/atoms/badge/badge.shared.tsx#toneOf",
    members: ["default", "destructive", "secondary", "outline"],
    resolve: badgeTone,
    notes: ["`status` switches the badge to its status form, where this axis is ignored."],
  }),
  subject({
    id: "Badge.status",
    components: ["Badge"],
    pages: ["badge"],
    resolver: "src/atoms/badge/badge.shared.tsx#statusOf",
    members: ["success", "error", "warning", "info", "neutral"],
    resolve: badgeStatus,
    notes: ["Applies only with `status`.", "Has no `destructive` alias, where Alert, Toast and Chip accept `destructive` for `error`."],
  }),
  subject({ id: "BadgeGroup.gap", components: ["BadgeGroup"], pages: ["badge"], resolver: "src/atoms/badge/badge.shared.tsx#badgeGapOf", members: ["cozy", "snug", "tight"], resolve: badgeGapOf }),
  subject({ id: "Breadcrumb.separator", components: ["Breadcrumb"], pages: ["breadcrumb"], resolver: "src/atoms/breadcrumb/breadcrumb.shared.tsx#separatorOf", members: ["chevron", "slash", "dot"], resolve: separatorOf }),
  subject({
    id: "Button.intent",
    components: ["Button"],
    pages: ["button"],
    resolver: "src/atoms/button/button.shared.tsx#intentOf",
    members: ["primary", "destructive", "secondary", "outline", "ghost", "link"],
    resolve: buttonIntent,
    notes: ["`raised` applies to the primary intent only."],
  }),
  subject({ id: "Button.size", components: ["Button"], pages: ["button"], resolver: "src/atoms/button/button.shared.tsx#sizeOf", members: SIZES, resolve: buttonSize }),
  subject({ id: "ButtonGroup.kind", components: ["ButtonGroup"], pages: ["button-group"], resolver: "src/atoms/button-group/button-group.shared.tsx#kindOf", members: ["segmented", "split", "stepper", "spaced"], resolve: kindOf }),
  subject({ id: "ButtonGroup.size", components: ["ButtonGroup"], pages: ["button-group"], resolver: "src/atoms/button-group/button-group.shared.tsx#sizeOf", members: SIZES, resolve: buttonGroupSize }),
  subject({
    id: "Checkbox.size",
    components: ["Checkbox"],
    pages: ["checkbox"],
    resolver: "src/atoms/checkbox/checkbox.shared.tsx#sizeOf",
    members: SIZES_LARGE_FIRST,
    resolve: checkboxSize,
    notes: ["`indeterminate` shows over `checked` (a state, not a style axis)."],
  }),
  subject({
    id: "Chip.color",
    components: ["Chip"],
    pages: ["chip"],
    resolver: "src/atoms/chip/chip.shared.tsx#colorOf",
    members: [
      "success", "warning", "destructive", "error", "info", "neutral",
      "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan",
      "sky", "blue", "indigo", "violet", "fuchsia", "purple", "pink", "rose", "gray",
    ],
    resolve: colorOf,
    notes: [
      "`outline` composes with every color.",
      "`primary` paints only when no status tone or palette hue resolves (`neutral` and `gray` leave it in effect).",
      "A selected filter chip's paint overrides both.",
    ],
  }),
  subject({
    id: "Container.measure",
    components: ["Container"],
    pages: ["container"],
    resolver: "src/atoms/container/container.shared.tsx#measureOf",
    members: ["fluid", ...STEPS],
    resolve: measureOf,
    notes: ["`start` pins a capped container to the leading edge."],
  }),
  subject({ id: "Container.pad", components: ["Container"], pages: ["container"], resolver: "src/atoms/container/container.shared.tsx#padOf", members: ["padLoose", "pad", "padTight"], resolve: containerPad }),
  subject({ id: "Divider.orientation", components: ["Divider"], pages: ["divider"], resolver: "src/atoms/divider/divider.shared.tsx#orientationOf", members: ["vertical", "horizontal"], resolve: orientationOf }),
  subject({ id: "Divider.emphasis", components: ["Divider"], pages: ["divider"], resolver: "src/atoms/divider/divider.shared.tsx#emphasisOf", members: ["soft", "strong"], resolve: emphasisOf }),
  subject({ id: "Emblem.tone", components: ["Emblem"], pages: ["emblem"], resolver: "src/atoms/emblem/emblem.shared.tsx#toneOf", members: ["primary", "destructive", "success", "warning", "muted"], resolve: emblemTone }),
  subject({ id: "Emblem.size", components: ["Emblem"], pages: ["emblem"], resolver: "src/atoms/emblem/emblem.shared.tsx#sizeOf", members: SIZES, resolve: emblemSize }),
  subject<IconProps>({
    id: "Icon.color",
    components: ["Icon"],
    pages: ["icon"],
    resolver: "src/atoms/icon/icon.shared.tsx#strokeOf",
    members: ["primary", "primaryForeground", "destructive", "success", "warning", "muted"],
    resolve: (p) => strokeOf(p, NAMED_TOKENS),
    notes: ["With none, the `color` value, then the foreground."],
  }),
  subject<IconProps>({
    id: "Icon.glyph",
    components: ["Icon"],
    pages: ["icon"],
    resolver: "src/atoms/icon/icon.shared.tsx#nameOf",
    catalog: true,
    members: NAMES.map((name) => name.key) as BooleanProps<IconProps>[],
    resolve: nameOf,
  }),
  subject({ id: "Image.fit", components: ["Image"], pages: ["image"], resolver: "src/atoms/image/image.shared.tsx#fitOf", members: ["contain", "cover", "stretch", "center", "repeat", "none"], resolve: imageFit }),
  subject({ id: "Input.size", components: ["Input"], pages: ["input"], resolver: "src/atoms/input/input.shared.tsx#sizeOf", members: SIZES_LARGE_FIRST, resolve: inputSize }),
  subject({ id: "InputOTP.size", components: ["InputOTP"], pages: ["input-otp"], resolver: "src/atoms/input-otp/input-otp.shared.tsx#sizeOf", members: SIZES_LARGE_FIRST, resolve: inputOtpSize }),
  subject({
    id: "Layout.gap",
    components: ["Row", "Column", "Grid"],
    pages: ["row-column", "grid"],
    resolver: "src/atoms/layout/layout.shared.tsx#gapOf",
    members: ["loose", "relaxed", "cozy", "snug", "tight", "flush"],
    resolve: gapOf,
  }),
  subject({ id: "Layout.justify", components: ["Row", "Column"], pages: ["row-column"], resolver: "src/atoms/layout/layout.shared.tsx#justifyOf", members: ["between", "around", "evenly", "center", "end", "start"], resolve: justifyOf }),
  subject({ id: "Layout.align", components: ["Row", "Column"], pages: ["row-column"], resolver: "src/atoms/layout/layout.shared.tsx#alignOf", members: ["stretch", "baseline", "alignCenter", "alignEnd", "alignStart"], resolve: flexAlign }),
  subject({ id: "Layout.pad", components: ["Row", "Column"], pages: ["row-column"], resolver: "src/atoms/layout/layout.shared.tsx#padOf", members: ["padLoose", "pad", "padTight"], resolve: flexPad }),
  subject({ id: "Listbox.mode", components: ["Listbox"], pages: ["listbox"], resolver: "src/atoms/listbox/listbox.shared.tsx#modeOf", members: ["multi"], resolve: modeOf }),
  subject({ id: "Listbox.size", components: ["Listbox"], pages: ["listbox"], resolver: "src/atoms/listbox/listbox.shared.tsx#sizeOf", members: SIZES, resolve: listboxSize }),
  subject({ id: "Pagination.size", components: ["Pagination"], pages: ["pagination"], resolver: "src/atoms/pagination/pagination.shared.tsx#sizeOf", members: SIZES, resolve: paginationSize }),
  subject({ id: "Pagination.variant", components: ["Pagination"], pages: ["pagination"], resolver: "src/atoms/pagination/pagination.shared.tsx#variantOf", members: ["withSize", "compact"], resolve: paginationVariant }),
  subject({
    id: "Popover.placement",
    components: ["Popover"],
    pages: ["popover"],
    resolver: "src/atoms/popover/popover.shared.tsx#placementOf",
    members: ["top", "bottom"],
    resolve: popoverPlacement,
    notes: ["`inline` overrides the open state and the placement.", "The card anchors below the trigger in either placement; `top` moves only the iOS arrow."],
  }),
  subject({ id: "Progress.size", components: ["Progress"], pages: ["progress"], resolver: "src/atoms/progress/progress.shared.tsx#sizeOf", members: SIZES_LARGE_FIRST, resolve: progressSize }),
  subject({ id: "Progress.tone", components: ["Progress"], pages: ["progress"], resolver: "src/atoms/progress/progress.shared.tsx#toneOf", members: ["danger", "warning"], resolve: progressTone }),
  subject({ id: "QRCode.size", components: ["QRCode"], pages: ["qrcode"], resolver: "src/atoms/qrcode/qrcode.shared.tsx#sizeOf", members: SIZES, resolve: qrcodeSize }),
  subject({ id: "Radio.size", components: ["Radio"], pages: ["radio"], resolver: "src/atoms/radio/radio.shared.tsx#sizeOf", members: SIZES, resolve: radioSize }),
  subject<Pick<RevealProps, "fromBelow" | "fromAbove" | "fromLeft" | "fromRight">>({
    id: "Reveal.direction",
    components: ["Reveal"],
    pages: ["reveal"],
    resolver: "src/atoms/reveal/reveal.shared.tsx#revealTravel",
    members: ["fromBelow", "fromAbove", "fromLeft", "fromRight"],
    resolve: (p) => revealTravel(p, 12),
  }),
  subject({ id: "Select.size", components: ["Select"], pages: ["select"], resolver: "src/atoms/select/select.shared.tsx#sizeOf", members: SIZES, resolve: selectSize }),
  subject({ id: "Skeleton.shape", components: ["Skeleton"], pages: ["skeleton"], resolver: "src/atoms/skeleton/skeleton.shared.tsx#shapeOf", members: ["text", "avatar", "button", "card", "list", "table"], resolve: skeletonShape }),
  subject({ id: "Skeleton.size (line)", components: ["Skeleton"], pages: ["skeleton"], resolver: "src/atoms/skeleton/skeleton.shared.tsx#lineHeight", members: SIZES_LARGE_FIRST, resolve: lineHeight }),
  subject({ id: "Skeleton.size (avatar)", components: ["Skeleton"], pages: ["skeleton"], resolver: "src/atoms/skeleton/skeleton.shared.tsx#avatarDiameter", members: SIZES_LARGE_FIRST, resolve: avatarDiameter }),
  subject({ id: "Skeleton.size (button)", components: ["Skeleton"], pages: ["skeleton"], resolver: "src/atoms/skeleton/skeleton.shared.tsx#buttonSize", members: SIZES_LARGE_FIRST, resolve: skeletonButton }),
  subject({ id: "Skeleton.length", components: ["Skeleton"], pages: ["skeleton"], resolver: "src/atoms/skeleton/skeleton.shared.tsx#lengthOf", members: ["short", "long"], resolve: lengthOf, notes: ["Applies to the text shape only."] }),
  subject({ id: "Slider.size", components: ["Slider"], pages: ["slider"], resolver: "src/atoms/slider/slider.shared.tsx#sizeOf", members: SIZES_LARGE_FIRST, resolve: sliderSize }),
  subject({ id: "Spinner.tone", components: ["Spinner"], pages: ["spinner"], resolver: "src/atoms/spinner/spinner.shared.tsx#toneOf", members: ["primary", "muted", "foreground"], resolve: spinnerTone }),
  subject({ id: "Spinner.size", components: ["Spinner"], pages: ["spinner"], resolver: "src/atoms/spinner/spinner.shared.tsx#sizeOf", members: SIZES_LARGE_FIRST, resolve: spinnerSize }),
  subject({ id: "Stepper.size", components: ["Stepper"], pages: ["stepper"], resolver: "src/atoms/stepper/stepper.shared.tsx#sizeOf", members: SIZES_LARGE_FIRST, resolve: stepperSize }),
  subject({ id: "Swatch.size", components: ["Swatch"], pages: ["swatch"], resolver: "src/atoms/swatch/swatch.shared.tsx#sizeOf", members: SIZES, resolve: swatchSize }),
  subject({ id: "Swatch.stretch", components: ["Swatch"], pages: ["swatch"], resolver: "src/atoms/swatch/swatch.shared.tsx#stretchesOf", rule: true, members: ["block", "circle", "inline"], resolve: stretchesOf }),
  subject({ id: "Switch.size", components: ["Switch"], pages: ["switch"], resolver: "src/atoms/switch/switch.shared.tsx#sizeOf", members: SIZES_LARGE_FIRST, resolve: switchSize }),
  subject({ id: "Textarea.size", components: ["Textarea"], pages: ["textarea"], resolver: "src/atoms/textarea/textarea.shared.tsx#sizeOf", members: SIZES_LARGE_FIRST, resolve: textareaSize }),
  subject({ id: "Tooltip.placement", components: ["Tooltip"], pages: ["tooltip"], resolver: "src/atoms/tooltip/tooltip.shared.tsx#placementOf", members: ["top", "bottom", "left", "right"], resolve: tooltipPlacement }),
  subject({
    id: "Tooltip.trigger",
    components: ["Tooltip"],
    pages: ["tooltip"],
    resolver: "src/atoms/tooltip/tooltip.shared.tsx#triggerOf",
    members: ["iconTrigger", "textTrigger"],
    resolve: triggerOf,
    notes: ["`children` (an element) wins over both."],
  }),
  subject({
    id: "Typography.role",
    components: ["Typography"],
    pages: ["typography"],
    resolver: "src/atoms/typography/typography.shared.tsx#roleOf",
    members: ["display", "h1", "h2", "h3", "h4", "h5", "lead", "code", "mono", "caption", "muted", "small", "tiny", "body"],
    resolve: roleOf,
    notes: ["`muted` is both a role and a tone."],
  }),
  subject({ id: "Typography.tone", components: ["Typography"], pages: ["typography"], resolver: "src/atoms/typography/typography.shared.tsx#toneOf", members: ["destructive", "warning", "success", "primary", "subtle", "muted"], resolve: typographyTone }),
  subject({ id: "Typography.weight", components: ["Typography"], pages: ["typography"], resolver: "src/atoms/typography/typography.shared.tsx#weightOf", members: ["bold", "semibold", "medium", "regular"], resolve: weightOf }),
  subject({ id: "Typography.leading", components: ["Typography"], pages: ["typography"], resolver: "src/atoms/typography/typography.shared.tsx#leadingOf", members: ["tightLeading"], resolve: leadingOf }),
  subject({ id: "Typography.decoration", components: ["Typography"], pages: ["typography"], resolver: "src/atoms/typography/typography.shared.tsx#decorationOf", members: ["underline"], resolve: decorationOf }),
  subject({ id: "Video.fit", components: ["Video"], pages: ["video"], resolver: "src/atoms/video/video.shared.tsx#fitOf", members: ["contain", "cover", "stretch"], resolve: videoFit }),

  // Molecules.
  subject({ id: "ActionPanel.tone", components: ["ActionPanel"], pages: ["action-panels"], resolver: "src/molecules/action-panels/action-panels.shared.tsx#toneOf", members: ["destructive"], resolve: actionPanelTone }),
  subject({ id: "ActionPanel.layout", components: ["ActionPanel"], pages: ["action-panels"], resolver: "src/molecules/action-panels/action-panels.shared.tsx#layoutOf", members: ["inline"], resolve: actionPanelLayout }),
  subject({ id: "Alert.tone", components: ["Alert"], pages: ["alert"], resolver: "src/molecules/alert/alert.shared.tsx#toneOf", members: ["destructive", "error", "warning", "success", "info"], resolve: alertTone }),
  subject({ id: "AlertDialog.width", components: ["AlertDialog"], pages: ["alert-dialog"], resolver: "src/molecules/alert-dialog/alert-dialog.shared.tsx#widthOf", members: ["narrow", "small", "large"], resolve: alertDialogWidth }),
  subject({ id: "Card.elevation", components: ["Card"], pages: ["card"], resolver: "src/molecules/card/card.shared.tsx#elevationOf", members: ["raised", "flat"], resolve: elevationOf }),
  subject({
    id: "Card.density",
    components: ["Card"],
    pages: ["card"],
    resolver: "src/molecules/card/card.shared.tsx#densityOf",
    members: ["compact", "comfortable"],
    resolve: cardDensity,
    notes: ["A density pads the surface on its own and wins over `padded` and `flush`."],
  }),
  subject({ id: "CodeBlock.variant", components: ["CodeBlock"], pages: ["code-block"], resolver: "src/molecules/code-block/code-block.shared.tsx#variantOf", members: ["terminal", "numbered", "inline"], resolve: codeBlockVariant }),
  subject({ id: "DescriptionList.layout", components: ["DescriptionList"], pages: ["description-lists"], resolver: "src/molecules/description-lists/description-lists.shared.tsx#layoutOf", members: ["inline", "twoColumn", "stacked"], resolve: descriptionLayout }),
  subject({
    id: "DescriptionList.item value",
    components: ["DescriptionList"],
    pages: ["description-lists"],
    resolver: "src/molecules/description-lists/description-lists.shared.tsx#valueFormOf",
    members: ["status", "badge", "mono"],
    resolve: valueFormOf,
    notes: ["An item's `avatars` or `copyValue` take the value before any of these."],
  }),
  subject({ id: "Feed.lead", components: ["Feed"], pages: ["feeds"], resolver: "src/molecules/feeds/feeds.shared.tsx#leadOf", members: ["connector", "avatar"], resolve: leadOf }),
  subject({
    id: "GridList.columns",
    components: ["GridList"],
    pages: ["grid-lists"],
    resolver: "src/molecules/grid-lists/grid-lists.shared.tsx#columnsOf",
    members: ["cols3", "cols2"],
    resolve: columnsOf,
    notes: ["Gallery tiles ignore `compact`."],
  }),
  subject({ id: "MediaObject.align", components: ["MediaObject"], pages: ["media-objects"], resolver: "src/molecules/media-objects/media-objects.shared.tsx#alignOf", members: ["center", "start"], resolve: mediaAlign }),
  subject({ id: "MediaObject.direction", components: ["MediaObject"], pages: ["media-objects"], resolver: "src/molecules/media-objects/media-objects.shared.tsx#directionOf", members: ["reversed", "leading"], resolve: directionOf }),
  subject({ id: "PhoneInput.size", components: ["PhoneInput"], pages: ["phone-input"], resolver: "src/molecules/phone-input/phone-input.shared.tsx#sizeOf", members: SIZES_LARGE_FIRST, resolve: phoneInputSize }),
  subject({ id: "StackedList.variant", components: ["StackedList"], pages: ["stacked-lists"], resolver: "src/molecules/stacked-lists/stacked-lists.shared.tsx#variantOf", members: ["clickable", "card"], resolve: stackedListVariant }),
  subject({ id: "StackedList.item badge", components: ["StackedList"], pages: ["stacked-lists"], resolver: "src/molecules/stacked-lists/stacked-lists.shared.tsx#badgeToneOf", members: ["success", "error", "warning", "info", "neutral"], resolve: badgeToneOf }),
  subject({ id: "Stats.surface", components: ["Stats"], pages: ["stats"], resolver: "src/molecules/stats/stats.shared.tsx#surfaceOf", members: ["plain"], resolve: statsSurface }),
  subject({ id: "Stats.item accent", components: ["Stats"], pages: ["stats"], resolver: "src/molecules/stats/stats.shared.tsx#accentOf", members: SLOTS, resolve: accentOf }),
  subject({ id: "Stats.item delta", components: ["Stats"], pages: ["stats"], resolver: "src/molecules/stats/stats.shared.tsx#deltaOf", members: ["steady", "down"], resolve: deltaOf }),

  // Organisms.
  subject({ id: "Calendar.density", components: ["Calendar"], pages: ["calendar"], resolver: "src/organisms/calendar/calendar.shared.tsx#densityOf", members: ["compact"], resolve: calendarDensity }),
  subject({ id: "Calendar.view", components: ["Calendar"], pages: ["calendar"], resolver: "src/organisms/calendar/calendar.shared.tsx#viewOf", members: ["day", "week"], resolve: viewOf }),
  subject({ id: "DataTable.density", components: ["DataTable"], pages: ["data-table"], resolver: "src/organisms/data-table/data-table.shared.tsx#densityOf", members: ["compact", "comfortable"], resolve: dataTableDensity }),
  subject({ id: "DataTable.column align", components: ["DataTable"], pages: ["data-table"], resolver: "src/organisms/data-table/data-table.shared.tsx#columnAlignOf", members: ["numeric", "centered"], resolve: columnAlignOf }),
  subject({ id: "Dialog.size", components: ["Dialog"], pages: ["dialog"], resolver: "src/organisms/dialog/dialog.shared.tsx#sizeOf", members: ["xs", "small", "medium", "large", "wide"], resolve: dialogSize }),
  subject({ id: "Drawer.edge", components: ["Drawer"], pages: ["drawer"], resolver: "src/organisms/drawer/drawer.shared.tsx#edgeOf", members: ["right", "bottom", "top", "left"], resolve: edgeOf }),
  subject({ id: "FilterPanel.density", components: ["FilterPanel"], pages: ["filter-panel"], resolver: "src/organisms/filter-panel/filter-panel.shared.tsx#densityOf", members: ["compact"], resolve: filterPanelDensity }),
  subject({ id: "Navbar.surface", components: ["Navbar"], pages: ["navbars"], resolver: "src/organisms/navbars/navbars.shared.tsx#surfaceOf", members: ["bordered", "floating"], resolve: navbarSurface }),
  subject({ id: "Sidebar.density", components: ["Sidebar"], pages: ["sidebar"], resolver: "src/organisms/sidebar/sidebar.shared.tsx#densityOf", members: ["compact"], resolve: sidebarDensity }),
  subject({ id: "Sidebar.frame", components: ["Sidebar"], pages: ["sidebar"], resolver: "src/organisms/sidebar/sidebar.shared.tsx#frameOf", members: ["bordered", "floating"], resolve: frameOf }),
  subject({
    id: "Sidebar.drawer edge",
    components: ["Sidebar"],
    pages: ["sidebar"],
    resolver: "src/organisms/sidebar/sidebar.shared.tsx#drawerEdgeOf",
    members: ["drawerRight", "drawerTop", "drawerBottom"],
    resolve: drawerEdgeOf,
    notes: ["Applies in drawer mode only.", "The Drawer it renders resolves its own edges `right` > `bottom` > `top`."],
  }),
  subject({ id: "Steps.layout", components: ["Steps"], pages: ["steps"], resolver: "src/organisms/steps/steps.shared.tsx#layoutOf", members: ["progress", "vertical"], resolve: stepsLayout }),
  subject({ id: "Tabs.variant", components: ["Tabs"], pages: ["tabs"], resolver: "src/organisms/tabs/tabs.shared.tsx#variantOf", members: ["pills", "vertical", "underline"], resolve: tabsVariant }),
  subject<TabsProps>({
    id: "Tabs.wrap",
    components: ["Tabs"],
    pages: ["tabs"],
    resolver: "src/organisms/tabs/tabs.shared.tsx#wrapsOf",
    rule: true,
    members: ["block", "wrap", "vertical"],
    resolve: (p) => wrapsOf(p, tabsVariant(p)),
    notes: ["A `responsive` vertical rail that flattens to a row honors `wrap`."],
  }),
  subject({ id: "Toast.intent", components: ["Toast"], pages: ["toast"], resolver: "src/organisms/toast/toast.shared.tsx#intentOf", members: ["destructive", "error", "warning", "success", "info"], resolve: toastIntent }),

  // Charts.
  subject({
    id: "Cartesian.tone",
    components: ["AreaChart", "ComposedChart", "LineChart"],
    pages: ["area-chart", "composed-chart", "line-chart"],
    resolver: "src/charts/shared/cartesian-series.tsx#toneOf",
    members: CHART_TONES,
    resolve: cartesianTone,
    notes: ["Single-series only.", "An explicit tone wins over LineChart's gain or loss tone from `baseline`."],
  }),
  subject({
    id: "Chart series.tone",
    components: ["AreaChart", "CandlestickChart", "Chart", "ComposedChart", "LineChart", "RadarChart"],
    pages: ["area-chart", "candlestick-chart", "chart", "composed-chart", "line-chart", "radar-chart"],
    resolver: "src/charts/shared/charts.styles.ts#seriesTone",
    members: CHART_TONES,
    resolve: seriesTone,
    notes: ["A series' own tone wins over the chart's."],
  }),
  subject({ id: "ComposedChart.series mark", components: ["ComposedChart"], pages: ["composed-chart"], resolver: "src/charts/composed-chart/composed-chart.shared.tsx#markOf", members: ["line", "area"], resolve: markOf }),
  subject({
    id: "BarList.tone",
    components: ["BarList"],
    pages: ["bar-list"],
    resolver: "src/charts/bar-list/bar-list.shared.tsx#toneOf",
    members: CHART_TONES,
    resolve: barListTone,
    notes: ["A row's chart slot wins over the tone; with neither, the ramp by index."],
  }),
  subject({ id: "Breakdown row.slot", components: ["BarList", "MetricBreakdown"], pages: ["bar-list", "metric-breakdown"], resolver: "src/charts/shared/breakdown-rows.tsx#slotOf", members: SLOTS, resolve: slotOf }),
  subject({ id: "BoxPlot.tone", components: ["BoxPlot"], pages: ["box-plot"], resolver: "src/charts/box-plot/box-plot.shared.tsx#toneOf", members: CHART_TONES, resolve: boxPlotTone }),
  subject({ id: "BulletChart.tone", components: ["BulletChart"], pages: ["bullet-chart"], resolver: "src/charts/bullet-chart/bullet-chart.shared.tsx#toneOf", members: CHART_TONES, resolve: bulletTone }),
  subject({
    id: "Chart.tone",
    components: ["Chart"],
    pages: ["chart"],
    resolver: "src/charts/chart/chart.shared.tsx#toneOf",
    members: CHART_TONES,
    resolve: chartTone,
    notes: ["`horizontal` is ignored with grouped series, and `stacked` needs them."],
  }),
  subject<GaugeProps>({ id: "Gauge.tone", components: ["Gauge"], pages: ["gauge"], resolver: "src/charts/gauge/gauge.shared.tsx#gaugeFill", members: ["success", "warning", "destructive"], resolve: (p) => gaugeFill(NAMED_TOKENS, p) }),
  subject({ id: "Histogram.tone", components: ["Histogram"], pages: ["histogram"], resolver: "src/charts/histogram/histogram.shared.tsx#toneOf", members: CHART_TONES, resolve: histogramTone }),
  subject<MetricBreakdownProps>({
    id: "MetricBreakdown.rate",
    components: ["MetricBreakdown"],
    pages: ["metric-breakdown"],
    resolver: "src/charts/metric-breakdown/metric-breakdown.shared.tsx#rateColor",
    members: ["rateSuccess", "rateWarning", "rateDestructive"],
    resolve: (p) => rateColor(NAMED_TOKENS, p),
  }),
  subject<ProgressRingProps>({ id: "ProgressRing.tone", components: ["ProgressRing"], pages: ["progress-ring"], resolver: "src/charts/progress-ring/progress-ring.shared.tsx#ringFill", members: ["success", "warning", "destructive"], resolve: (p) => ringFill(NAMED_TOKENS, p) }),
  subject({ id: "RadarChart.tone", components: ["RadarChart"], pages: ["radar-chart"], resolver: "src/charts/radar-chart/radar-chart.shared.tsx#toneOf", members: CHART_TONES, resolve: radarTone, notes: ["Single-series only."] }),
  subject({ id: "RangeAreaChart.tone", components: ["RangeAreaChart"], pages: ["range-area-chart"], resolver: "src/charts/range-area-chart/range-area-chart.shared.tsx#toneOf", members: CHART_TONES, resolve: rangeAreaTone }),
  subject({ id: "ScatterPlot.tone", components: ["ScatterPlot"], pages: ["scatter-plot"], resolver: "src/charts/scatter-plot/scatter-plot.shared.tsx#toneOf", members: CHART_TONES, resolve: scatterTone, notes: ["Single-series only."] }),
  subject({ id: "ServiceHealthList.item status", components: ["ServiceHealthList"], pages: ["service-health-list"], resolver: "src/charts/service-health-list/service-health-list.shared.tsx#itemStatus", members: ["down", "degraded"], resolve: itemStatus }),
  subject({ id: "Status strip.period", components: ["ServiceHealthList", "UptimeBar"], pages: ["service-health-list", "uptime-bar"], resolver: "src/charts/shared/status-strip.tsx#periodStatus", members: ["down", "degraded", "unknown"], resolve: periodStatus }),
  subject({ id: "Sparkline.tone", components: ["Sparkline"], pages: ["sparkline"], resolver: "src/charts/sparkline/sparkline.shared.tsx#toneOf", members: ["success", "destructive", "muted", "primary"], resolve: sparklineTone }),
  subject({ id: "Sparkline.size", components: ["Sparkline"], pages: ["sparkline"], resolver: "src/charts/sparkline/sparkline.shared.tsx#sizeOf", members: ["compact", "tall"], resolve: sparklineSize }),
];
