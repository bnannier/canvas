# Canvas v2 → v3 component comparison matrix

Baseline: **v2.20.2** (last v2 React-component release) vs **current `main`** (the
v3 CSS-first line). Sources of truth are each version's documented catalogue
(`docs/src/core/data/components.ts`) cross-checked against the shipped style/source files.

v2 documented **102** components across four tiers (atoms, molecules, organisms,
charts). v3 documents **47** entries. The drop in count is mostly *consolidation
and re-tiering*, not deletion: many v2 components were folded into broader v3 pages
or replaced by CSS primitives. The genuinely-absent set is smaller than the raw
count gap suggests.

## Status legend

| Symbol | Meaning |
| --- | --- |
| ✅ Carried over | Exists as its own component/page in v3 (sometimes renamed) |
| 🔀 Folded | Capability still present, absorbed into a broader v3 page |
| 🧩 Primitive | Superseded by a CSS utility, pattern, or native CSS feature |
| ❌ Dropped (gap) | No equivalent in v3, but pure-CSS-feasible — a real gap |
| 🚫 Out of scope | Intentionally not in CSS-first core (JS/React); belongs downstream (`canvas-react`, etc.) |

## Summary

| Tier | v2 count | ✅ Carried | 🔀 Folded | 🧩 Primitive | ❌ Dropped | 🚫 Out of scope |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Atoms | 20 | 11 | 2 | 4 | 3 | 0 |
| Molecules | 33 | 12 | 14 | 0 | 7 | 0 |
| Organisms | 29 | 10 | 7 | 0 | 5 | 7 |
| Charts | 20 | 1 | 7 | 0 | 0 | 12 |
| **Total** | **102** | **34** | **30** | **4** | **15** | **19** |

**Reading of the user's premise ("v2 had a lot v3 doesn't"):**
- **64 of 102** are still available in v3 (34 carried over + 30 folded). "Folded"
  means renamed/absorbed, not removed.
- **4** were replaced by CSS primitives/utilities.
- **19** are intentionally out of the CSS-first core (rich editors, the charting
  library, React-only glue) and are expected to live in downstream framework packages.
- **15** are genuine gaps: pure-CSS-feasible components that simply aren't in v3 yet.

## Atoms (20)

| v2 component | Status | v3 equivalent / note |
| --- | --- | --- |
| AspectRatio | 🧩 Primitive | native CSS `aspect-ratio` only — no Canvas class/utility ships |
| Avatar | ✅ Carried | Avatars (`avatar`) |
| Badge | ✅ Carried | Badges (`badge`) — also absorbs StatusBadge, NumberBadge |
| BrandMark | ❌ Dropped | branding atom; no equivalent |
| Button | ✅ Carried | Buttons (`button`) |
| Checkbox | ✅ Carried | Checkboxes (`checkbox`) |
| FlexBox | 🧩 Primitive | `utilities/flexbox.css` + `utilities/display.css` |
| Icon | ✅ Carried | Icons (`icon`) |
| Input | ✅ Carried | Inputs & Forms (`input`) |
| Label | 🔀 Folded | Inputs & Forms — `.label` sub-element |
| Progress | ❌ Dropped | no progress bar in v3 |
| RadioGroup | ✅ Carried | Radios (`radio`) |
| ScrollArea | 🧩 Primitive | `patterns/scrollbar.css` via native `scrollbar-width`/`scrollbar-color` (no class) |
| Section | 🧩 Primitive | vertical-rhythm `space-y` → `utilities/flexbox.css` `.flex-col` + `utilities/gap.css` `.gap-y-*` |
| Separator | ✅ Carried | Dividers (`separator`) — renamed |
| Skeleton | ✅ Carried | Skeletons (`skeleton`) |
| Slider | ❌ Dropped | no range slider in v3 |
| Switch | ✅ Carried | Toggles (`switch`) |
| Textarea | ✅ Carried | Textareas (`textarea`) |
| Toggle | 🔀 Folded | Button Groups (segmented control) |

## Molecules (33)

| v2 component | Status | v3 equivalent / note |
| --- | --- | --- |
| ActionBar | ❌ Dropped | bulk-selection bar; closest is the Data Table toolbar |
| ActivityItem | 🔀 Folded | Feeds (`feeds`) |
| Alert | ✅ Carried | Alerts (`alert`) |
| AnimatedBackground | ❌ Dropped | decorative auth-screen background |
| BrandLockup | ❌ Dropped | branding |
| Breadcrumb | ✅ Carried | Breadcrumbs (`breadcrumb`) — re-tiered to Atom |
| ButtonGroup | ✅ Carried | Button Groups (`button-group`) — re-tiered to Atom |
| Calendar | ✅ Carried | Calendars (`calendar`) — re-tiered to Organism |
| Card | ✅ Carried | Cards (`card`) |
| CodeBlock | ✅ Carried | Code Block (`code-block`) |
| EmptyState | ✅ Carried | Empty States (`empty-state`) |
| ErrorState | 🔀 Folded | Empty States / Alerts |
| FieldDisplay | ✅ Carried | Field Display (`field`) — also Description Lists |
| InputOTP | ❌ Dropped | one-time-code input |
| LauncherCard | 🔀 Folded | Grid Lists (`grid-lists`) |
| LoadingState | 🔀 Folded | Skeletons / Spinner |
| NotificationList | 🔀 Folded | Feeds / Stacked Lists |
| NumberBadge | 🔀 Folded | Badges |
| PageHeader | 🔀 Folded | Navigation (`page-header.css`) |
| PageTabs | ✅ Carried | Tabs (`tabs`) |
| Pagination | ✅ Carried | Pagination (`pagination`) — re-tiered to Atom |
| PhoneInput | ❌ Dropped | phone input with country code |
| SearchBar | 🔀 Folded | Inputs & Forms / Command Palette |
| SecretField | ❌ Dropped | masked/reveal secret field |
| SectionCard | 🔀 Folded | Cards (`section-card.css`) |
| StatCard | 🔀 Folded | Cards / Stats (`stat-card.css`) |
| StatusBadge | 🔀 Folded | Badges — `.status-badge` |
| Steps | ✅ Carried | Steppers (`steps`); re-tiered to Organism, renamed Stepper to Steps |
| Table | 🔀 Folded | Data Tables (`data-table`) |
| Terminal | ❌ Dropped | terminal/console display |
| ToggleGroup | 🔀 Folded | Button Groups |
| Tooltip | ✅ Carried | Tooltips (`tooltip`) — re-tiered to Atom |
| UserAvatarChip | 🔀 Folded | Avatars / Stacked Lists |

## Organisms (29)

| v2 component | Status | v3 equivalent / note |
| --- | --- | --- |
| Accordion | ❌ Dropped | pure-CSS-feasible (`details`/`summary`) but absent |
| AlertDialog | 🔀 Folded | Overlays (`dialog`) |
| Carousel | ❌ Dropped | CSS scroll-snap feasible but absent |
| CodeEditor | 🚫 Out of scope | CodeMirror/JS → downstream package |
| Collapsible | ❌ Dropped | pure-CSS-feasible but absent |
| Command | ✅ Carried | Command Palette (`command`) |
| ContextMenu | 🔀 Folded | Row Menu (`row-menu`) / Dropdowns |
| DashboardGrid | ❌ Dropped | draggable dashboard; Grid Lists is static-only |
| DataTable | ✅ Carried | Data Tables (`data-table`) |
| Dialog | ✅ Carried | Overlays (`dialog`) |
| Drawer | 🔀 Folded | Overlays (`sheet.css`) |
| DropdownMenu | ✅ Carried | Dropdowns (`dropdown`) — re-tiered to Atom |
| ErrorBoundary | 🚫 Out of scope | React-only → downstream package |
| Form | ✅ Carried | Form Layouts (`form`) |
| HoverCard | 🔀 Folded | Overlays / Popover |
| MarkdownEditor | 🚫 Out of scope | JS editor → downstream package |
| Menubar | ❌ Dropped | application menubar |
| NavBar | ✅ Carried | Navbars (`navbars`) |
| NavigationMenu | 🔀 Folded | Navbars / Navigation |
| Popover | ✅ Carried | Popover (`popover`) — re-tiered to Atom |
| Resizable | 🚫 Out of scope | JS resize panels → downstream package |
| RichTextEditor | 🚫 Out of scope | JS editor → downstream package |
| SchemaForm | 🚫 Out of scope | JS schema-driven form → downstream package |
| Select | ✅ Carried | Selects (`select`) — re-tiered to Atom |
| Sheet | 🔀 Folded | Overlays (`sheet.css`) |
| Sidebar | ✅ Carried | Navigation (`sidebar`) |
| Tabs | ✅ Carried | Tabs (`tabs`) |
| ThemeProvider | 🚫 Out of scope | replaced by CSS `.dark` + `src/theme.ts` |
| Toaster (Sonner) | 🔀 Folded | Overlays (`toast.css`) |

## Charts (20)

v3 collapses all charts into a single **Charts** page (Organism). Its own
description: *"Sparklines, bars, gauges, heatmaps. All SVG, all token-themed. No
charting library required... for dozens of series or interactive brushing, reach
for d3/recharts and theme it with the same tokens."* So the SVG-able subset is
folded in; everything needing a data/interaction layer is explicitly delegated
out. Note v3 ships these as documented SVG patterns, not as shipped CSS modules.

| v2 component | Status | v3 equivalent / note |
| --- | --- | --- |
| ActivityHeatmap | 🔀 Folded | Charts — heatmap pattern |
| AreaChart | 🚫 Out of scope | use recharts/d3 + Canvas tokens |
| BarChart | 🔀 Folded | Charts — bars |
| ComposedChart | 🚫 Out of scope | recharts/d3 |
| FunnelChart | 🚫 Out of scope | recharts/d3 |
| Gauge | 🔀 Folded | Charts — gauge |
| LabeledBarList | 🔀 Folded | Charts |
| LineChart | 🚫 Out of scope | recharts/d3 (Sparkline ≈ mini line) |
| MetricBreakdown | 🔀 Folded | Charts / Stats |
| PieChart | 🚫 Out of scope | recharts/d3 |
| RadarChart | 🚫 Out of scope | recharts/d3 |
| RadialBarChart | 🚫 Out of scope | recharts/d3 |
| Sankey | 🚫 Out of scope | recharts/d3 |
| ScatterChart | 🚫 Out of scope | recharts/d3 |
| ServiceHealthList | 🔀 Folded | Charts |
| Sparkline | ✅ Carried | Charts — sparkline |
| StackedBar | 🔀 Folded | Charts — bars |
| SunburstChart | 🚫 Out of scope | recharts/d3 |
| Treemap | 🚫 Out of scope | recharts/d3 |
| WorldHeatMap | 🚫 Out of scope | geographic map; recharts/d3 |

## The actionable gap list (15 — pure-CSS-feasible, currently absent)

These are the only items that are genuinely missing *and* in-scope for a CSS-first
system (i.e. not delegated to a JS/React downstream package):

- **Atoms:** Progress, Slider, BrandMark
- **Molecules:** ActionBar, AnimatedBackground, BrandLockup, InputOTP, PhoneInput, SecretField, Terminal
- **Organisms:** Accordion, Carousel, Collapsible, DashboardGrid, Menubar

Notes:
- **Accordion / Collapsible** are the most clear-cut: both are trivially pure-CSS
  (`<details>`/`<summary>`) and are common enough to be surprising omissions.
- **Slider, Progress** are native form/feedback primitives that fit the atom tier.
- **BrandMark / BrandLockup / AnimatedBackground** may be *deliberately* excluded as
  app-specific branding rather than design-system primitives — worth confirming intent.
- **InputOTP, PhoneInput, SecretField** are specialized inputs; feasible in CSS +
  a thin JS helper (Canvas already ships `src/` helpers).

## New in v3 (no v2 ancestor)

For completeness, v3 added entries with no direct v2 predecessor (several others
are v2 concepts re-cut, e.g. Stats←StatCard, Feeds←ActivityItem, Description
Lists←FieldDisplay, Stacked Lists←NotificationList, Row Menu←ContextMenu):

- **Atoms:** Combobox, Input Group, Kbd, Typography, Spinner (was v2 code-only)
- **Molecules:** Media Objects, Grid Lists, Action Panels
- **Organisms:** Filter Panels
