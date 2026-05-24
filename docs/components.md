# Component Catalog

Every component ships as a standalone CSS file in `styles/components/`.
Import via `styles/canvas.css` (all-in-one) or individually.

---

## Typography

**File:** `components/typography.css`

**Classes:** `.display`, `.h1`, `.h2`, `.h3`, `.h4`, `.h5`, `.p`, `.body`, `.small`, `.muted`, `.tiny`, `.caption`, `.mono`, `.code`, `.page-title`, `.card-title`

**Color helpers:** `.fg1`, `.fg2`, `.bg1`, `.bg2`, `.bg-card`, `.muted-fg`

```html
<h1 class="h2">Section Title</h1>
<p class="body">Body text content.</p>
<span class="small">Helper text</span>
```

---

## Button

**File:** `components/button.css`

**Base:** `.btn`
**Variants:** `.btn-default`, `.btn-outline`, `.btn-secondary`, `.btn-ghost`, `.btn-destructive`, `.btn-link`
**Sizes:** `.btn-sm`, `.btn-lg`, `.btn-icon`

```html
<button class="btn btn-default">Save</button>
<button class="btn btn-outline btn-sm">Cancel</button>
<button class="btn btn-ghost btn-icon">X</button>
```

---

## Input

**File:** `components/input.css`

**Classes:** `.input`, `.label`, `.field-helper`, `.input-icon`, `.input-icon.right`, `.input-with-icon`

```html
<label class="label">Email</label>
<input class="input" type="email" placeholder="you@example.com" />
<p class="field-helper">We will never share your email.</p>
```

---

## Card

**File:** `components/card.css`

**Classes:** `.card`, `.card-header`, `.card-content`, `.card-footer`, `.card-desc`, `.card-img`, `.card-toolbar`, `.card-actions`

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
  </div>
  <div class="card-content">Content here.</div>
</div>
```

---

## Badge

**File:** `components/badge.css`

**Badge:** `.badge`, `.badge-default`, `.badge-secondary`, `.badge-outline`, `.badge-destructive`
**Status badge:** `.status-badge`, `.sb-success`, `.sb-warning`, `.sb-error`, `.sb-info`, `.sb-neutral`
**Dot indicator:** `.dot` (inside `.status-badge`)

```html
<span class="badge badge-default">New</span>
<span class="status-badge sb-success">
  <span class="dot"></span> Active
</span>
```

---

## Separator

**File:** `components/separator.css`

**Classes:** `.sep` (horizontal), `.sep-v` (vertical), `.sep-label` (with text)

```html
<hr class="sep" />
<div class="sep-label">or continue with</div>
```

---

## Icon

**File:** `components/icon.css`

Styles `[data-lucide]` elements to 16x16 with `stroke-width: 2`.

```html
<i data-lucide="settings"></i>
```

---

## Avatar

**File:** `components/avatar.css`

**Class:** `.avatar`

```html
<span class="avatar">BN</span>
```

---

## Kbd

**File:** `components/kbd.css`

**Class:** `.kbd`

```html
<kbd class="kbd">Ctrl+K</kbd>
```

---

## Code Block

**File:** `components/code-block.css`

**Class:** `.codeblock`

```html
<pre class="codeblock">const x = 42;</pre>
```

---

## Sidebar

**File:** `components/sidebar.css`

**Classes:** `.sidebar`, `.sidebar.open`, `.sidebar.collapsed`, `.sidebar-brand`, `.sidebar-brand-name`, `.sidebar-collapse-btn`, `.sidebar-nav`, `.sidebar-group`, `.sidebar-group-label`, `.sidebar-item`, `.sidebar-item.active`

```html
<nav class="sidebar open">
  <div class="sidebar-brand">
    <span class="sidebar-brand-name">App</span>
  </div>
  <div class="sidebar-nav">
    <div class="sidebar-group">
      <div class="sidebar-group-label">Menu</div>
      <button class="sidebar-item active">Dashboard</button>
    </div>
  </div>
</nav>
```

---

## Topbar

**File:** `components/topbar.css`

**Class:** `.topbar`

```html
<header class="topbar">
  <h1 class="h5">Dashboard</h1>
</header>
```

---

## App Shell

**File:** `components/app-shell.css`

**Classes:** `.app-shell`, `.app-main`, `.app-main.collapsed`, `.app-main.expanded`, `.app-content`

```html
<div class="app-shell">
  <nav class="sidebar open">...</nav>
  <div class="app-main expanded">
    <header class="topbar">...</header>
    <main class="app-content">...</main>
  </div>
</div>
```

---

## Stat Card

**File:** `components/stat-card.css`

**Classes:** `.stat-card`, `.stat-card-row`, `.stat-card-label`, `.stat-card-value`, `.stat-card-icon`
**Icon colors:** `.blue`, `.success`, `.purple`, `.destructive`, `.amber`

```html
<div class="stat-card">
  <div class="stat-card-row">
    <div>
      <div class="stat-card-label">Revenue</div>
      <div class="stat-card-value">$12,400</div>
    </div>
    <div class="stat-card-icon blue">...</div>
  </div>
</div>
```

---

## Section Card

**File:** `components/section-card.css`

**Classes:** `.section-card`, `.section-card-header`, `.section-card-body`, `.section-card-divider`

```html
<div class="section-card">
  <div class="section-card-header"><h3>Details</h3></div>
  <div class="section-card-divider"></div>
  <div class="section-card-body">Content</div>
</div>
```

---

## Data Table

**File:** `components/data-table.css`

**Classes:** `.dt-wrap`, `.dt-scroll`, `.dt-toolbar`, `.dt-table`, `.dt-footer`, `.dt-sort-icon`, `.dt-expand-row`, `.dt-expand-content`
**Modifiers:** `th.sortable`, `th.sorted`, `td.wrap`, `td.sticky-col`, `th.sticky-col`, `tr.clickable`

```html
<div class="dt-wrap">
  <div class="dt-toolbar">
    <input class="input" placeholder="Search..." />
  </div>
  <div class="dt-scroll">
    <table class="dt-table">
      <thead><tr><th>Name</th><th>Status</th></tr></thead>
      <tbody><tr><td>Item</td><td>Active</td></tr></tbody>
    </table>
  </div>
  <div class="dt-footer">Showing 1-10 of 42</div>
</div>
```

---

## Field

**File:** `components/field.css`

**Classes:** `.field`, `.field-label`, `.field-value`, `.field-value.mono`

```html
<div class="field">
  <span class="field-label">ID</span>
  <span class="field-value mono">usr_abc123</span>
</div>
```

---

## Page Header

**File:** `components/page-header.css`

**Classes:** `.page-header`, `.page-header-title`, `.page-header h1`, `.page-header .sub`, `.page-header-actions`

```html
<div class="page-header">
  <div>
    <div class="page-header-title"><h1>Users</h1></div>
    <p class="sub">Manage your team members.</p>
  </div>
  <div class="page-header-actions">
    <button class="btn btn-default">Add User</button>
  </div>
</div>
```

---

## Empty State

**File:** `components/empty-state.css`

**Classes:** `.empty-card`, `.empty-card .title`

```html
<div class="empty-card">
  <div class="title">No results found</div>
  <p>Try adjusting your search filters.</p>
</div>
```

---

## Row Menu / Nav Link

**File:** `components/row-menu.css`

**Classes:** `.rowmenu-item`, `.rowmenu-danger`, `.rowmenu-sep`, `.navlink`, `.navlink.active`, `.nav-wrap`

```html
<button class="rowmenu-item">Edit</button>
<div class="rowmenu-sep"></div>
<button class="rowmenu-item rowmenu-danger">Delete</button>
```

---

## Tooltip

**File:** `components/tooltip.css`

**Classes:** `.tooltip`, `.tooltip-arrow`, `.tooltip-arrow.bottom`, `.tooltip-arrow.top`, `.tooltip-arrow.left`, `.tooltip-arrow.right`

```html
<div class="tooltip">
  Helpful tip
  <span class="tooltip-arrow bottom"></span>
</div>
```

---

## Skeleton

**File:** `components/skeleton.css`

**Classes:** `.skeleton`, `.skeleton-text`, `.skeleton-circle`, `.skeleton-rect`

```html
<div class="skeleton skeleton-text" style="width:60%"></div>
<div class="skeleton skeleton-circle" style="width:2rem;height:2rem"></div>
```

---

## Spinner

**File:** `components/spinner.css`

**Classes:** `.spinner`, `.spinner-sm`, `.spinner-lg`

```html
<div class="spinner"></div>
<div class="spinner spinner-lg"></div>
```

---

## Checkbox

**File:** `components/checkbox.css`

**Classes:** `.checkbox`, `.checkbox-label`

```html
<label class="checkbox-label">
  <input type="checkbox" class="checkbox" />
  Accept terms
</label>
```

---

## Radio

**File:** `components/radio.css`

**Class:** `.radio`

```html
<label class="checkbox-label">
  <input type="radio" name="plan" class="radio" />
  Free
</label>
```

---

## Switch

**File:** `components/switch.css`

**Class:** `.switch`

```html
<input type="checkbox" role="switch" class="switch" />
```

---

## Select

**File:** `components/select.css`

**Classes:** `.select`, `.select-trigger`

```html
<select class="select">
  <option>Option A</option>
  <option>Option B</option>
</select>
```

---

## Textarea

**File:** `components/textarea.css`

**Class:** `.textarea`

```html
<textarea class="textarea" placeholder="Write something..."></textarea>
```

---

## Combobox

**File:** `components/combobox.css`

**Classes:** `.combobox`, `.combobox-input`, `.combobox-list`, `.combobox-item`, `.combobox-item.selected`, `.combobox-empty`

```html
<div class="combobox">
  <input class="combobox-input" placeholder="Search..." />
  <div class="combobox-list">
    <div class="combobox-item">Option 1</div>
    <div class="combobox-item selected">Option 2</div>
  </div>
</div>
```

---

## Alert

**File:** `components/alert.css`

**Classes:** `.alert`, `.alert-title`, `.alert-desc`
**Variants:** `.alert-default`, `.alert-destructive`, `.alert-warning`, `.alert-success`, `.alert-info`

```html
<div class="alert alert-warning">
  <div>
    <div class="alert-title">Warning</div>
    <div class="alert-desc">Check your input.</div>
  </div>
</div>
```

---

## Toast

**File:** `components/toast.css`

**Classes:** `.toast-viewport`, `.toast`, `.toast-title`, `.toast-desc`, `.toast-close`, `.toast-action`, `.toast-destructive`

```html
<div class="toast-viewport">
  <div class="toast">
    <div class="toast-title">Saved</div>
    <div class="toast-desc">Your changes were saved.</div>
    <button class="toast-close">x</button>
  </div>
</div>
```

---

## Dialog

**File:** `components/dialog.css`

**Classes:** `.dialog-overlay`, `.dialog`, `.dialog-header`, `.dialog-title`, `.dialog-desc`, `.dialog-footer`, `.dialog-close`

```html
<div class="dialog-overlay"></div>
<div class="dialog">
  <div class="dialog-header">
    <h2 class="dialog-title">Confirm</h2>
  </div>
  <div class="dialog-footer">
    <button class="btn btn-outline">Cancel</button>
    <button class="btn btn-default">OK</button>
  </div>
</div>
```

---

## Sheet

**File:** `components/sheet.css`

**Classes:** `.sheet-overlay`, `.sheet`, `.sheet-right`, `.sheet-left`, `.sheet-header`, `.sheet-title`, `.sheet-body`, `.sheet-footer`

```html
<div class="sheet-overlay"></div>
<div class="sheet sheet-right">
  <div class="sheet-header">
    <h2 class="sheet-title">Details</h2>
  </div>
  <div class="sheet-body">Content here.</div>
</div>
```

---

## Popover

**File:** `components/popover.css`

**Class:** `.popover`

```html
<div class="popover">Popover content</div>
```

---

## Dropdown

**File:** `components/dropdown.css`

**Classes:** `.dropdown`, `.dropdown-item`, `.dropdown-item.disabled`, `.dropdown-sep`, `.dropdown-label`

```html
<div class="dropdown">
  <div class="dropdown-label">Actions</div>
  <button class="dropdown-item">Edit</button>
  <div class="dropdown-sep"></div>
  <button class="dropdown-item">Delete</button>
</div>
```

---

## Breadcrumb

**File:** `components/breadcrumb.css`

**Classes:** `.breadcrumb`, `.breadcrumb-item`, `.breadcrumb-item.active`, `.breadcrumb-sep`

```html
<nav class="breadcrumb">
  <span class="breadcrumb-item"><a href="/">Home</a></span>
  <span class="breadcrumb-sep">/</span>
  <span class="breadcrumb-item active">Users</span>
</nav>
```

---

## Pagination

**File:** `components/pagination.css`

**Classes:** `.pagination`, `.page-btn`, `.page-btn.active`, `.page-ellipsis`

```html
<nav class="pagination">
  <button class="page-btn" disabled>&lt;</button>
  <button class="page-btn active">1</button>
  <button class="page-btn">2</button>
  <span class="page-ellipsis">...</span>
  <button class="page-btn">&gt;</button>
</nav>
```

---

## Tabs

**File:** `components/tabs.css`

**Classes:** `.tabs-list`, `.tab`, `.tab.active`, `.tabs-content`

```html
<div class="tabs-list">
  <button class="tab active">General</button>
  <button class="tab">Security</button>
</div>
<div class="tabs-content">Tab panel content.</div>
```

---

## Button Group

**File:** `components/button-group.css`

**Class:** `.btn-group`

```html
<div class="btn-group">
  <button class="btn btn-outline">Left</button>
  <button class="btn btn-outline">Center</button>
  <button class="btn btn-outline">Right</button>
</div>
```

---

## Form

**File:** `components/form.css`

**Classes:** `.form-group`, `.form-row`, `.form-actions`, `.form-error`

```html
<div class="form-group">
  <label class="label">Name</label>
  <input class="input" />
  <span class="form-error">Name is required.</span>
</div>
<div class="form-actions">
  <button class="btn btn-default">Submit</button>
</div>
```

---

## Input Group

**File:** `components/input-group.css`

**Classes:** `.input-group`, `.input-addon`

```html
<div class="input-group">
  <span class="input-addon">https://</span>
  <input class="input" placeholder="example.com" />
</div>
```

---

## Command (Cmd+K)

**File:** `components/command.css`

**Classes:** `.command-overlay`, `.command-dialog`, `.command-input`, `.command-list`, `.command-group`, `.command-group-label`, `.command-item`, `.command-item.selected`, `.command-sep`, `.command-empty`, `.command-shortcut`

```html
<div class="command-overlay"></div>
<div class="command-dialog">
  <input class="command-input" placeholder="Type a command..." />
  <div class="command-list">
    <div class="command-group">
      <div class="command-group-label">Actions</div>
      <div class="command-item">New File</div>
    </div>
  </div>
</div>
```

---

## Stepper

**File:** `components/stepper.css`

**Classes:** `.stepper`, `.step`, `.step.active`, `.step.completed`, `.step-indicator`, `.step-label`, `.step-connector`

```html
<div class="stepper">
  <div class="step completed">
    <div class="step-indicator">1</div>
    <span class="step-label">Account</span>
  </div>
  <div class="step-connector"></div>
  <div class="step active">
    <div class="step-indicator">2</div>
    <span class="step-label">Profile</span>
  </div>
</div>
```

---

## Calendar

**File:** `components/calendar.css`

**Classes:** `.calendar`, `.calendar-header`, `.calendar-title`, `.calendar-nav`, `.calendar-grid`, `.calendar-head`, `.calendar-cell`, `.calendar-cell.today`, `.calendar-cell.selected`, `.calendar-cell.outside`, `.calendar-cell.disabled`

```html
<div class="calendar">
  <div class="calendar-header">
    <span class="calendar-title">May 2026</span>
  </div>
  <div class="calendar-grid">
    <span class="calendar-head">Mo</span>
    <button class="calendar-cell today">23</button>
  </div>
</div>
```

---

## Filter Panel

**File:** `components/filter-panel.css`

**Classes:** `.filter-panel`, `.filter-group`, `.filter-group-label`, `.filter-group-content`, `.filter-chip`, `.filter-chip.active`, `.filter-chip-remove`

```html
<div class="filter-panel">
  <div class="filter-group">
    <span class="filter-group-label">Status</span>
    <div class="filter-group-content">
      <button class="filter-chip active">Active</button>
      <button class="filter-chip">Inactive</button>
    </div>
  </div>
</div>
```
