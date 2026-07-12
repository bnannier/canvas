# FilterPanel

Sidebar filter rail of grouped checkbox options with counts.

## Usage

```tsx
<FilterPanel
  bordered
  groups={[
    { title: "Status", options: [
      { label: "Active", checked: true, count: "128" },
      { label: "Pending", count: "12", checked: false },
      { label: "Archived", count: "2", checked: false }
    ] },
    { title: "Schema", options: [
      { label: "Default", checked: true, count: "96" },
      { label: "Custom", count: "46", checked: false }
    ] },
    { title: "MFA", options: [
      { label: "Enabled", count: "84", checked: false },
      { label: "Disabled", count: "58", checked: false }
    ] }
  ]}
/>
```
