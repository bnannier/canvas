# FilterPanel

Sidebar filter rail of grouped checkbox options with counts. Add `responsive`
and at and below `drawerBreakpoint` (default `sm` = 640) the docked panel
collapses to a "Filters (n)" outline button that opens the same panel inside a
start-edge drawer, so a phone keeps its width for the results; `open` /
`defaultOpen` / `onOpenChange` drive the drawer for controlled use.

On iOS an option row marks a chosen filter the way an iOS list does: the label
leads, the count follows, and a trailing check closes the row. The web and
Android lead each row with the platform's selection checkbox.

## Usage

```tsx
<FilterPanel
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
`sm` breakpoint it renders the "Filters (n)" trigger and the panel opens in a
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
