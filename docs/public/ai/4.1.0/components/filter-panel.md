# FilterPanel

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 4142cc0e5e2e3b6d409e4f7eb0338822b95078cff8102a18cf5c33a42834366a

Source: `src/organisms/filter-panel/filter-panel.md`
Human reference: https://canvas.nannier.com/components/filter-panel

## Public imports

```tsx
import { FilterPanel } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Sidebar filter rail: grouped checkbox options under mono group headings, each
with its count, and a "Clear N" action in the header while any filter is on (a plain
accent text action). On the web an option's label is the 400 14px row label, 10px from its box.

Add `responsive` and at and below `drawerBreakpoint` (default `sm` = 640) the
docked panel collapses to a small secondary "Filters" button, carrying the live
count, that opens the same
panel inside a start-edge drawer, so a phone keeps its width for the results;
`open` / `defaultOpen` / `onOpenChange` drive the drawer for controlled use.

On iOS an option row marks a chosen filter the way an iOS list does: the label
leads, the count follows, and a trailing check closes the row. The web and
Android lead each row with the platform's selection checkbox. The native rows
keep the platform's touch height (44 pt, 48 dp).

## Usage

```tsx
<FilterPanel
  bordered
  groups={[
    { title: "Status", options: [
      { label: "Active", checked: true, count: "128" },
      { label: "Pending", count: "12" },
      { label: "Archived", count: "2" }
    ] },
    { title: "Schema", options: [
      { label: "Default", count: "96" },
      { label: "Custom", count: "46" }
    ] }
  ]}
/>
```

## Variants

### Responsive drawer

At desktop widths this renders the docked panel unchanged; at and below the
`sm` breakpoint it renders the "Filters" trigger with its count and the panel opens in a
drawer.

```tsx
<FilterPanel
  responsive
  groups={[
    { title: "Status", options: [
      { label: "Active", checked: true },
      { label: "Archived" }
    ] },
    { title: "Schema", options: [
      { label: "Default" },
      { label: "Custom" }
    ] }
  ]}
/>
```

## Do & Don't

### Group by facet

**Do**: Give each facet its own titled group, so a reader sees which options narrow the same field.

```tsx
<FilterPanel
  groups={[
    { title: "Status", options: [
      { label: "Active", checked: true, count: "128" },
      { label: "Archived", count: "14" }
    ] },
    { title: "Region", options: [
      { label: "North America", count: "86" },
      { label: "Europe", count: "56" }
    ] }
  ]}
/>
```

**Don't**: Pour every option into one group; statuses and regions run together, and nothing says which choices narrow the same field.

```tsx
<FilterPanel
  groups={[
    { title: "Filters", options: [
      { label: "Active", checked: true, count: "128" },
      { label: "North America", count: "86" },
      { label: "Archived", count: "14" },
      { label: "Europe", count: "56" }
    ] }
  ]}
/>
```

## Supported props

### FilterPanelProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| groups | FilterGroup[] | yes |  | Filter groups, each a heading plus its checkbox options. |
| value | string[] \| undefined | no |  | Controlled selection: the keys of the checked options (each option's `value`, falling back to `"groupIndex:optionIndex"`). Provide it with `onSelectionChange` to drive or reset selection from a parent (e.g. from a URL query). |
| defaultValue | string[] \| undefined | no |  | Initial selection for uncontrolled use. When omitted, the panel seeds from each option's `checked` flag. |
| activeCount | number \| undefined | no |  | Active-filter count shown in the header's "Clear N" action. Omit to derive it from the checked options. |
| onClear | (() => void) \| undefined | no |  | Fired when the header "Clear N" action is pressed (it shows while a filter is on). |
| onSelectionChange | ((selected: string[]) => void) \| undefined | no |  | Fired with the full set of checked keys whenever the selection changes (both modes) — the controlled signal a parent mirrors into `value`. |
| onChange | ((groupIndex: number, optionIndex: number, next: boolean) => void) \| undefined | no |  | Fired when a single option row toggles, with its group/option indexes and next value. Fires alongside `onSelectionChange`. |
| bordered | boolean \| undefined | no | false | Surface (pick one path): a rounded, bordered card vs. a bare panel. |
| compact | boolean \| undefined | no | false | Density (pick one): tighten the panel's padding and row spacing. |
| responsive | boolean \| undefined | no | false | Opt in to the responsive panel->drawer behavior. Off by default: a bare panel is the docked column at every width, exactly as before. |
| drawerBreakpoint | BreakpointKey \| undefined | no |  | The width at and below which `responsive` collapses to the drawer (default `sm` = 640). |
| open | boolean \| undefined | no | false | The responsive drawer's open state (CONTROLLED). Omit for the self-managed trigger button. |
| defaultOpen | boolean \| undefined | no | false | Initial open state for the uncontrolled responsive drawer (default closed). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the responsive drawer opens or closes (trigger, scrim, back). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
