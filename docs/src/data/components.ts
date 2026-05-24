import type { ComponentDoc } from "./types";

const DONKEY = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="50" fill="#C4B5A5"/>' +
  '<ellipse cx="25" cy="4" rx="10" ry="26" fill="#8C7A68" transform="rotate(-15 25 4)"/>' +
  '<ellipse cx="26" cy="2" rx="6" ry="19" fill="#E0D3C6" transform="rotate(-15 26 2)"/>' +
  '<ellipse cx="75" cy="4" rx="10" ry="26" fill="#8C7A68" transform="rotate(15 75 4)"/>' +
  '<ellipse cx="74" cy="2" rx="6" ry="19" fill="#E0D3C6" transform="rotate(15 74 2)"/>' +
  '<circle cx="50" cy="56" r="33" fill="#8C7A68"/>' +
  '<ellipse cx="50" cy="73" rx="22" ry="17" fill="#E0D3C6"/>' +
  '<circle cx="36" cy="48" r="7" fill="#fff"/>' +
  '<circle cx="64" cy="48" r="7" fill="#fff"/>' +
  '<circle cx="38" cy="49.5" r="4" fill="#1A0A00"/>' +
  '<circle cx="66" cy="49.5" r="4" fill="#1A0A00"/>' +
  '<circle cx="39.2" cy="48" r="1.5" fill="#fff"/>' +
  '<circle cx="67.2" cy="48" r="1.5" fill="#fff"/>' +
  '<ellipse cx="42" cy="75" rx="3.5" ry="4" fill="#5C4E40"/>' +
  '<ellipse cx="58" cy="75" rx="3.5" ry="4" fill="#5C4E40"/>' +
  '<path d="M42 84 Q50 90 58 84" fill="none" stroke="#5C4E40" stroke-width="2.5" stroke-linecap="round"/>' +
  '</svg>',
);

export const COMPONENTS: ComponentDoc[] = [
  {
    slug: "app-shell",
    name: "App Shell",
    description: "Top-level layout wrapper that combines sidebar and main content area.",
    cssFile: "components/app-shell.css",
    category: "Organisms",
    classes: [
      { name: ".app-shell", description: "Root layout container with min-height 100vh", type: "base" },
      { name: ".app-main", description: "Main content column beside the sidebar", type: "sub-element" },
      { name: ".app-main.expanded", description: "Full sidebar width offset (15rem left margin)", type: "state" },
      { name: ".app-main.collapsed", description: "Collapsed sidebar width offset (3.5rem left margin)", type: "state" },
      { name: ".app-content", description: "Inner content wrapper with max-width and padding", type: "sub-element" },
    ],
    examples: [
      {
        title: "Basic shell",
        html: `<div class="app-shell" style="min-height:300px;position:relative">
  <nav class="sidebar open" style="position:absolute">
    <div class="sidebar-brand">
      <span class="sidebar-brand-name">MyApp</span>
    </div>
    <div class="sidebar-nav">
      <a class="sidebar-item active">Dashboard</a>
      <a class="sidebar-item">Settings</a>
    </div>
  </nav>
  <div class="app-main expanded">
    <header class="topbar">
      <span class="h5">Dashboard</span>
    </header>
    <main class="app-content">
      <p class="body">Main content goes here.</p>
    </main>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "sidebar",
    name: "Sidebar",
    description: "Fixed navigation sidebar with brand header, grouped items, and collapsible state.",
    cssFile: "components/sidebar.css",
    category: "Organisms",
    classes: [
      { name: ".sidebar", description: "Fixed left sidebar container", type: "base" },
      { name: ".sidebar.open", description: "Visible on mobile (translateX(0))", type: "state" },
      { name: ".sidebar.collapsed", description: "Narrow rail mode (3.5rem wide)", type: "state" },
      { name: ".sidebar-brand", description: "Header area with logo/name", type: "sub-element" },
      { name: ".sidebar-brand-name", description: "Brand text label", type: "sub-element" },
      { name: ".sidebar-collapse-btn", description: "Toggle button for collapse", type: "sub-element" },
      { name: ".sidebar-nav", description: "Navigation list container", type: "sub-element" },
      { name: ".sidebar-group", description: "Grouping wrapper for related items", type: "sub-element" },
      { name: ".sidebar-group-label", description: "Category heading for a group", type: "sub-element" },
      { name: ".sidebar-item", description: "Individual navigation item", type: "sub-element" },
      { name: ".sidebar-item.active", description: "Currently active navigation item", type: "state" },
    ],
    examples: [
      {
        title: "Sidebar with groups",
        html: `<nav class="sidebar open" style="position:relative;transform:none;height:300px">
  <div class="sidebar-brand">
    <span class="sidebar-brand-name">Acme</span>
  </div>
  <div class="sidebar-nav">
    <div class="sidebar-group">
      <div class="sidebar-group-label">Main</div>
      <button class="sidebar-item active">Dashboard</button>
      <button class="sidebar-item">Users</button>
      <button class="sidebar-item">Settings</button>
    </div>
    <div class="sidebar-group">
      <div class="sidebar-group-label">Reports</div>
      <button class="sidebar-item">Analytics</button>
    </div>
  </div>
</nav>`,
      },
    ],
  },
  {
    slug: "topbar",
    name: "Topbar",
    description: "Sticky top header bar with backdrop blur, typically holds breadcrumb and actions.",
    cssFile: "components/topbar.css",
    category: "Organisms",
    classes: [
      { name: ".topbar", description: "Sticky top bar with blur backdrop", type: "base" },
    ],
    examples: [
      {
        title: "Default",
        html: `<header class="topbar">
  <span class="h5">Dashboard</span>
  <div style="margin-left:auto;display:flex;gap:0.5rem">
    <button class="btn btn-ghost btn-sm">Search</button>
    <button class="btn btn-default btn-sm">New</button>
  </div>
</header>`,
      },
    ],
  },
  {
    slug: "page-header",
    name: "Page Header",
    description: "Page title with optional subtitle and action buttons.",
    cssFile: "components/page-header.css",
    category: "Organisms",
    classes: [
      { name: ".page-header", description: "Flex container for title and actions", type: "base" },
      { name: ".page-header-title", description: "Title wrapper", type: "sub-element" },
      { name: ".page-header h1", description: "Main heading", type: "sub-element" },
      { name: ".page-header .sub", description: "Subtitle text", type: "sub-element" },
      { name: ".page-header-actions", description: "Right-aligned action buttons", type: "sub-element" },
    ],
    examples: [
      {
        title: "With subtitle and actions",
        html: `<div class="page-header">
  <div>
    <div class="page-header-title"><h1>Users</h1></div>
    <p class="sub">Manage your team members.</p>
  </div>
  <div class="page-header-actions">
    <button class="btn btn-outline">Export</button>
    <button class="btn btn-default">Add User</button>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "separator",
    name: "Separator",
    description: "Horizontal or vertical divider line, optionally with a text label.",
    cssFile: "components/separator.css",
    category: "Atoms",
    classes: [
      { name: ".sep", description: "Horizontal divider", type: "base" },
      { name: ".sep-v", description: "Vertical divider", type: "variant" },
      { name: ".sep-label", description: "Divider with centered text label", type: "variant" },
    ],
    examples: [
      {
        title: "Horizontal",
        html: `<p class="body">Content above</p>
<hr class="sep" />
<p class="body">Content below</p>`,
      },
      {
        title: "With label",
        html: `<div class="sep-label">or continue with</div>`,
      },
      {
        title: "Vertical",
        html: `<div style="display:flex;align-items:center;gap:0.75rem;height:2rem">
  <span class="body">Left</span>
  <div class="sep-v" style="height:1.25rem"></div>
  <span class="body">Right</span>
</div>`,
      },
    ],
  },

  {
    slug: "typography",
    name: "Typography",
    description: "Type scale classes for headings, body text, and helper styles.",
    cssFile: "components/typography.css",
    category: "Atoms",
    classes: [
      { name: ".display", description: "Largest display heading", type: "base" },
      { name: ".h1", description: "Heading level 1", type: "base" },
      { name: ".h2", description: "Heading level 2", type: "base" },
      { name: ".h3", description: "Heading level 3", type: "base" },
      { name: ".h4", description: "Heading level 4", type: "base" },
      { name: ".h5", description: "Heading level 5", type: "base" },
      { name: ".p", description: "Paragraph text", type: "base" },
      { name: ".body", description: "Body text (same as .p)", type: "base" },
      { name: ".small", description: "Small text (0.875rem)", type: "base" },
      { name: ".muted", description: "Muted foreground color", type: "variant" },
      { name: ".tiny", description: "Extra-small text (0.75rem)", type: "base" },
      { name: ".caption", description: "Caption text", type: "base" },
      { name: ".mono", description: "Monospace font family", type: "variant" },
      { name: ".code", description: "Inline code style", type: "variant" },
      { name: ".page-title", description: "Large page title", type: "base" },
      { name: ".card-title", description: "Card heading style", type: "base" },
      { name: ".fg1", description: "Primary foreground color", type: "variant" },
      { name: ".fg2", description: "Secondary foreground color", type: "variant" },
      { name: ".bg1", description: "Primary background color", type: "variant" },
      { name: ".bg2", description: "Secondary background color", type: "variant" },
      { name: ".bg-card", description: "Card background color", type: "variant" },
      { name: ".muted-fg", description: "Muted foreground helper", type: "variant" },
    ],
    examples: [
      {
        title: "Headings",
        html: `<h1 class="display">Display</h1>
<h1 class="h1">Heading 1</h1>
<h2 class="h2">Heading 2</h2>
<h3 class="h3">Heading 3</h3>
<h4 class="h4">Heading 4</h4>
<h5 class="h5">Heading 5</h5>`,
      },
      {
        title: "Body text",
        html: `<p class="body">Body text for main content.</p>
<p class="small">Small helper text.</p>
<p class="tiny">Tiny label text.</p>
<p class="muted">Muted secondary text.</p>
<p class="caption">Caption for images or tables.</p>`,
      },
      {
        title: "Code and mono",
        html: `<p class="body">Use the <span class="code">useState</span> hook for state.</p>
<p class="mono">monospace text for IDs</p>`,
      },
    ],
  },
  {
    slug: "kbd",
    name: "Kbd",
    description: "Keyboard shortcut indicator badge.",
    cssFile: "components/kbd.css",
    category: "Atoms",
    classes: [
      { name: ".kbd", description: "Keyboard key indicator", type: "base" },
    ],
    examples: [
      {
        title: "Default",
        html: `<kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">K</kbd>`,
      },
      {
        title: "In context",
        html: `<p class="body">Press <kbd class="kbd">⌘</kbd><kbd class="kbd">K</kbd> to search.</p>`,
      },
    ],
  },
  {
    slug: "code-block",
    name: "Code Block",
    description: "Preformatted code block with monospace font and padding.",
    cssFile: "components/code-block.css",
    category: "Molecules",
    classes: [
      { name: ".codeblock", description: "Pre-formatted code container", type: "base" },
    ],
    examples: [
      {
        title: "Default",
        html: `<pre class="codeblock">const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");</pre>`,
      },
    ],
  },
  {
    slug: "icon",
    name: "Icon",
    description: "Default styles for Lucide icons (data-lucide attribute).",
    cssFile: "components/icon.css",
    category: "Atoms",
    classes: [
      { name: "[data-lucide]", description: "16x16 icon with stroke-width 2", type: "base" },
    ],
    examples: [
      {
        title: "Usage",
        html: `<p class="body">Icons are styled via the <span class="code">[data-lucide]</span> attribute selector. Use any Lucide icon library that renders SVG elements with this attribute.</p>`,
      },
    ],
  },

  {
    slug: "button",
    name: "Button",
    description: "Clickable action triggers with multiple visual variants and sizes.",
    cssFile: "components/button.css",
    category: "Atoms",
    classes: [
      { name: ".btn", description: "Base button class (required)", type: "base" },
      { name: ".btn-default", description: "Primary filled button", type: "variant" },
      { name: ".btn-outline", description: "Bordered with transparent background", type: "variant" },
      { name: ".btn-secondary", description: "Muted background button", type: "variant" },
      { name: ".btn-ghost", description: "No background, hover reveals fill", type: "variant" },
      { name: ".btn-destructive", description: "Red/danger action button", type: "variant" },
      { name: ".btn-link", description: "Styled as a text link", type: "variant" },
      { name: ".btn-sm", description: "Small size (h-8)", type: "size" },
      { name: ".btn-lg", description: "Large size (h-11)", type: "size" },
      { name: ".btn-icon", description: "Square icon-only button", type: "size" },
    ],
    examples: [
      {
        title: "Variants",
        html: `<div style="display:flex;gap:0.5rem;flex-wrap:wrap">
  <button class="btn btn-default">Default</button>
  <button class="btn btn-outline">Outline</button>
  <button class="btn btn-secondary">Secondary</button>
  <button class="btn btn-ghost">Ghost</button>
  <button class="btn btn-destructive">Destructive</button>
  <button class="btn btn-link">Link</button>
</div>`,
      },
      {
        title: "Sizes",
        html: `<div style="display:flex;gap:0.5rem;align-items:center">
  <button class="btn btn-default btn-sm">Small</button>
  <button class="btn btn-default">Default</button>
  <button class="btn btn-default btn-lg">Large</button>
  <button class="btn btn-outline btn-icon">+</button>
</div>`,
      },
      {
        title: "Disabled",
        html: `<div style="display:flex;gap:0.5rem">
  <button class="btn btn-default" disabled>Disabled</button>
  <button class="btn btn-outline" disabled>Disabled</button>
</div>`,
      },
    ],
  },
  {
    slug: "button-group",
    name: "Button Group",
    description: "Groups buttons together with connected borders.",
    cssFile: "components/button-group.css",
    category: "Atoms",
    classes: [
      { name: ".btn-group", description: "Container that joins child buttons", type: "base" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div class="btn-group">
  <button class="btn btn-outline">Left</button>
  <button class="btn btn-outline">Center</button>
  <button class="btn btn-outline">Right</button>
</div>`,
      },
    ],
  },
  {
    slug: "input",
    name: "Input",
    description: "Text input field with label and helper text support.",
    cssFile: "components/input.css",
    category: "Atoms",
    classes: [
      { name: ".input", description: "Text input field", type: "base" },
      { name: ".label", description: "Form label", type: "sub-element" },
      { name: ".field-helper", description: "Helper text below input", type: "sub-element" },
      { name: ".input-icon", description: "Icon positioned inside input", type: "sub-element" },
      { name: ".input-icon.right", description: "Icon on the right side", type: "state" },
      { name: ".input-with-icon", description: "Input with left padding for icon", type: "variant" },
    ],
    examples: [
      {
        title: "With label and helper",
        html: `<div style="max-width:320px">
  <label class="label">Email</label>
  <input class="input" type="email" placeholder="you@example.com" />
  <p class="field-helper">We will never share your email.</p>
</div>`,
      },
      {
        title: "Disabled",
        html: `<input class="input" value="Read only" disabled style="max-width:320px" />`,
      },
    ],
  },
  {
    slug: "textarea",
    name: "Textarea",
    description: "Multi-line text input area.",
    cssFile: "components/textarea.css",
    category: "Atoms",
    classes: [
      { name: ".textarea", description: "Multi-line text input", type: "base" },
    ],
    examples: [
      {
        title: "Default",
        html: `<textarea class="textarea" placeholder="Write something..." style="max-width:400px"></textarea>`,
      },
    ],
  },
  {
    slug: "select",
    name: "Select",
    description: "Native HTML select dropdown with consistent styling.",
    cssFile: "components/select.css",
    category: "Atoms",
    classes: [
      { name: ".select", description: "Styled native select element", type: "base" },
      { name: ".select-trigger", description: "Custom trigger button style", type: "variant" },
    ],
    examples: [
      {
        title: "Default",
        html: `<select class="select" style="max-width:240px">
  <option>Option A</option>
  <option>Option B</option>
  <option>Option C</option>
</select>`,
      },
    ],
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    description: "Styled checkbox input with label wrapper.",
    cssFile: "components/checkbox.css",
    category: "Atoms",
    classes: [
      { name: ".checkbox", description: "Styled checkbox input", type: "base" },
      { name: ".checkbox-label", description: "Label wrapper for checkbox + text", type: "sub-element" },
    ],
    examples: [
      {
        title: "Default",
        html: `<label class="checkbox-label">
  <input type="checkbox" class="checkbox" checked />
  Accept terms and conditions
</label>`,
      },
      {
        title: "Multiple",
        html: `<div style="display:flex;flex-direction:column;gap:0.5rem">
  <label class="checkbox-label">
    <input type="checkbox" class="checkbox" checked /> Email notifications
  </label>
  <label class="checkbox-label">
    <input type="checkbox" class="checkbox" /> SMS notifications
  </label>
  <label class="checkbox-label">
    <input type="checkbox" class="checkbox" disabled /> Push notifications (coming soon)
  </label>
</div>`,
      },
    ],
  },
  {
    slug: "radio",
    name: "Radio",
    description: "Styled radio button input.",
    cssFile: "components/radio.css",
    category: "Atoms",
    classes: [
      { name: ".radio", description: "Styled radio input", type: "base" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div style="display:flex;flex-direction:column;gap:0.5rem">
  <label class="checkbox-label">
    <input type="radio" name="plan" class="radio" checked /> Free
  </label>
  <label class="checkbox-label">
    <input type="radio" name="plan" class="radio" /> Pro
  </label>
  <label class="checkbox-label">
    <input type="radio" name="plan" class="radio" /> Enterprise
  </label>
</div>`,
      },
    ],
  },
  {
    slug: "switch",
    name: "Switch",
    description: "Toggle switch input styled as a sliding pill.",
    cssFile: "components/switch.css",
    category: "Atoms",
    classes: [
      { name: ".switch", description: "Toggle switch input", type: "base" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div style="display:flex;align-items:center;gap:0.75rem">
  <input type="checkbox" role="switch" class="switch" checked />
  <span class="body">Dark mode</span>
</div>`,
      },
    ],
  },
  {
    slug: "combobox",
    name: "Combobox",
    description: "Searchable dropdown list with text input filtering.",
    cssFile: "components/combobox.css",
    category: "Atoms",
    classes: [
      { name: ".combobox", description: "Container wrapper", type: "base" },
      { name: ".combobox-input", description: "Search text input", type: "sub-element" },
      { name: ".combobox-list", description: "Options dropdown list", type: "sub-element" },
      { name: ".combobox-item", description: "Individual option", type: "sub-element" },
      { name: ".combobox-item.selected", description: "Currently selected option", type: "state" },
      { name: ".combobox-empty", description: "Empty state message", type: "sub-element" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div class="combobox" style="max-width:280px">
  <input class="combobox-input" placeholder="Search or select..." />
  <div class="combobox-list">
    <div class="combobox-item">Apple</div>
    <div class="combobox-item selected">Banana</div>
    <div class="combobox-item">Cherry</div>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "input-group",
    name: "Input Group",
    description: "Input with attached addon (prefix or suffix text).",
    cssFile: "components/input-group.css",
    category: "Atoms",
    classes: [
      { name: ".input-group", description: "Flex container for input + addon", type: "base" },
      { name: ".input-addon", description: "Attached prefix or suffix label", type: "sub-element" },
    ],
    examples: [
      {
        title: "With prefix",
        html: `<div class="input-group" style="max-width:320px">
  <span class="input-addon">https://</span>
  <input class="input" placeholder="example.com" />
</div>`,
      },
    ],
  },
  {
    slug: "form",
    name: "Form",
    description: "Form layout helpers for groups, rows, actions, and error messages.",
    cssFile: "components/form.css",
    category: "Molecules",
    classes: [
      { name: ".form-group", description: "Vertical field group (label + input + error)", type: "base" },
      { name: ".form-row", description: "Horizontal row of form groups", type: "variant" },
      { name: ".form-actions", description: "Button row at form bottom", type: "sub-element" },
      { name: ".form-error", description: "Error message text", type: "sub-element" },
    ],
    examples: [
      {
        title: "Login form",
        html: `<div style="max-width:360px">
  <div class="form-group">
    <label class="label">Email</label>
    <input class="input" type="email" placeholder="you@example.com" />
  </div>
  <div class="form-group">
    <label class="label">Password</label>
    <input class="input" type="password" />
    <span class="form-error">Password is required.</span>
  </div>
  <div class="form-actions">
    <button class="btn btn-default" style="width:100%">Sign in</button>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "field",
    name: "Field",
    description: "Read-only label/value pair for displaying data.",
    cssFile: "components/field.css",
    category: "Molecules",
    classes: [
      { name: ".field", description: "Container for label + value pair", type: "base" },
      { name: ".field-label", description: "Label text", type: "sub-element" },
      { name: ".field-value", description: "Value text", type: "sub-element" },
      { name: ".field-value.mono", description: "Monospace value (IDs, codes)", type: "state" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div style="display:flex;flex-direction:column;gap:0.75rem;max-width:300px">
  <div class="field">
    <span class="field-label">User ID</span>
    <span class="field-value mono">usr_abc123</span>
  </div>
  <div class="field">
    <span class="field-label">Name</span>
    <span class="field-value">Bobby Nannier</span>
  </div>
  <div class="field">
    <span class="field-label">Role</span>
    <span class="field-value">Admin</span>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "filter-panel",
    name: "Filter Panel",
    description: "Grouped filter chips for multi-facet filtering interfaces.",
    cssFile: "components/filter-panel.css",
    category: "Organisms",
    classes: [
      { name: ".filter-panel", description: "Panel container", type: "base" },
      { name: ".filter-group", description: "Group of related filters", type: "sub-element" },
      { name: ".filter-group-label", description: "Group heading", type: "sub-element" },
      { name: ".filter-group-content", description: "Chip container", type: "sub-element" },
      { name: ".filter-chip", description: "Individual filter option", type: "sub-element" },
      { name: ".filter-chip.active", description: "Selected filter", type: "state" },
      { name: ".filter-chip-remove", description: "Remove button on active chip", type: "sub-element" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div class="filter-panel">
  <div class="filter-group">
    <span class="filter-group-label">Status</span>
    <div class="filter-group-content">
      <button class="filter-chip active">Active</button>
      <button class="filter-chip">Inactive</button>
    </div>
  </div>
  <div class="filter-group">
    <span class="filter-group-label">Role</span>
    <div class="filter-group-content">
      <button class="filter-chip">Admin</button>
      <button class="filter-chip active">Editor</button>
      <button class="filter-chip">Viewer</button>
    </div>
  </div>
</div>`,
      },
    ],
  },

  {
    slug: "card",
    name: "Card",
    description: "Bordered container with header, content, and footer sections.",
    cssFile: "components/card.css",
    category: "Molecules",
    classes: [
      { name: ".card", description: "Card container with border and radius", type: "base" },
      { name: ".card-header", description: "Header section with padding", type: "sub-element" },
      { name: ".card-content", description: "Main content area", type: "sub-element" },
      { name: ".card-footer", description: "Footer with top border", type: "sub-element" },
      { name: ".card-desc", description: "Description text in header", type: "sub-element" },
      { name: ".card-img", description: "Full-bleed image at top", type: "sub-element" },
      { name: ".card-toolbar", description: "Toolbar row in header", type: "sub-element" },
      { name: ".card-actions", description: "Action buttons area", type: "sub-element" },
    ],
    examples: [
      {
        title: "Basic",
        html: `<div class="card" style="max-width:360px">
  <div class="card-header">
    <h3 class="card-title">Project Settings</h3>
    <p class="card-desc">Manage your project configuration.</p>
  </div>
  <div class="card-content">
    <div class="form-group">
      <label class="label">Project name</label>
      <input class="input" value="Canvas" />
    </div>
  </div>
  <div class="card-footer">
    <button class="btn btn-default btn-sm">Save</button>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "stat-card",
    name: "Stat Card",
    description: "Metric display card with label, value, and colored icon.",
    cssFile: "components/stat-card.css",
    category: "Molecules",
    classes: [
      { name: ".stat-card", description: "Card container", type: "base" },
      { name: ".stat-card-row", description: "Flex row for content and icon", type: "sub-element" },
      { name: ".stat-card-label", description: "Metric label", type: "sub-element" },
      { name: ".stat-card-value", description: "Metric value", type: "sub-element" },
      { name: ".stat-card-icon", description: "Icon circle", type: "sub-element" },
      { name: ".blue", description: "Blue icon color", type: "variant" },
      { name: ".success", description: "Green icon color", type: "variant" },
      { name: ".purple", description: "Purple icon color", type: "variant" },
      { name: ".destructive", description: "Red icon color", type: "variant" },
      { name: ".amber", description: "Amber icon color", type: "variant" },
    ],
    examples: [
      {
        title: "Colored variants",
        html: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem">
  <div class="stat-card">
    <div class="stat-card-row">
      <div>
        <div class="stat-card-label">Revenue</div>
        <div class="stat-card-value">$12,400</div>
      </div>
      <div class="stat-card-icon blue">$</div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-card-row">
      <div>
        <div class="stat-card-label">Users</div>
        <div class="stat-card-value">1,234</div>
      </div>
      <div class="stat-card-icon success">U</div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-card-row">
      <div>
        <div class="stat-card-label">Errors</div>
        <div class="stat-card-value">23</div>
      </div>
      <div class="stat-card-icon destructive">!</div>
    </div>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "section-card",
    name: "Section Card",
    description: "Card variant with distinct header and body sections divided by a line.",
    cssFile: "components/section-card.css",
    category: "Molecules",
    classes: [
      { name: ".section-card", description: "Container", type: "base" },
      { name: ".section-card-header", description: "Header with title", type: "sub-element" },
      { name: ".section-card-body", description: "Body content area", type: "sub-element" },
      { name: ".section-card-divider", description: "Horizontal line between sections", type: "sub-element" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div class="section-card" style="max-width:400px">
  <div class="section-card-header"><h3 class="h4">Account Details</h3></div>
  <div class="section-card-divider"></div>
  <div class="section-card-body">
    <div class="field">
      <span class="field-label">Email</span>
      <span class="field-value">user@example.com</span>
    </div>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "data-table",
    name: "Data Table",
    description: "Full-featured table with toolbar, sorting, scrolling, and footer.",
    cssFile: "components/data-table.css",
    category: "Organisms",
    classes: [
      { name: ".dt-wrap", description: "Outer table container", type: "base" },
      { name: ".dt-scroll", description: "Horizontal scroll wrapper", type: "sub-element" },
      { name: ".dt-toolbar", description: "Toolbar above table (search, filters)", type: "sub-element" },
      { name: ".dt-table", description: "The table element", type: "sub-element" },
      { name: ".dt-footer", description: "Footer below table (pagination info)", type: "sub-element" },
      { name: "th.sortable", description: "Sortable column header", type: "state" },
      { name: "th.sorted", description: "Currently sorted column", type: "state" },
      { name: "td.wrap", description: "Cell with text wrapping", type: "state" },
      { name: "tr.clickable", description: "Clickable row with hover effect", type: "state" },
      { name: ".dt-sort-icon", description: "Sort direction indicator", type: "sub-element" },
    ],
    examples: [
      {
        title: "With toolbar and footer",
        html: `<div class="dt-wrap">
  <div class="dt-toolbar">
    <input class="input" placeholder="Search users..." style="max-width:240px" />
  </div>
  <div class="dt-scroll">
    <table class="dt-table">
      <thead>
        <tr>
          <th class="sortable sorted">Name <span class="dt-sort-icon">&#9650;</span></th>
          <th class="sortable">Email</th>
          <th>Role</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr class="clickable">
          <td>Alice Johnson</td>
          <td>alice@example.com</td>
          <td>Admin</td>
          <td><span class="status-badge sb-success"><span class="dot"></span> Active</span></td>
        </tr>
        <tr class="clickable">
          <td>Bob Smith</td>
          <td>bob@example.com</td>
          <td>Editor</td>
          <td><span class="status-badge sb-neutral"><span class="dot"></span> Inactive</span></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="dt-footer">Showing 1-2 of 2</div>
</div>`,
      },
    ],
  },
  {
    slug: "badge",
    name: "Badge",
    description: "Small label for status, counts, or tags. Includes dot-status variants.",
    cssFile: "components/badge.css",
    category: "Atoms",
    classes: [
      { name: ".badge", description: "Base badge", type: "base" },
      { name: ".badge-default", description: "Primary filled badge", type: "variant" },
      { name: ".badge-secondary", description: "Muted background badge", type: "variant" },
      { name: ".badge-outline", description: "Bordered badge", type: "variant" },
      { name: ".badge-destructive", description: "Red/danger badge", type: "variant" },
      { name: ".status-badge", description: "Status indicator with dot", type: "variant" },
      { name: ".sb-success", description: "Green status", type: "variant" },
      { name: ".sb-warning", description: "Yellow status", type: "variant" },
      { name: ".sb-error", description: "Red status", type: "variant" },
      { name: ".sb-info", description: "Blue status", type: "variant" },
      { name: ".sb-neutral", description: "Gray status", type: "variant" },
      { name: ".dot", description: "Colored dot inside status badge", type: "sub-element" },
    ],
    examples: [
      {
        title: "Badge variants",
        html: `<div style="display:flex;gap:0.5rem;flex-wrap:wrap">
  <span class="badge badge-default">Default</span>
  <span class="badge badge-secondary">Secondary</span>
  <span class="badge badge-outline">Outline</span>
  <span class="badge badge-destructive">Destructive</span>
</div>`,
      },
      {
        title: "Status badges",
        html: `<div style="display:flex;gap:0.5rem;flex-wrap:wrap">
  <span class="status-badge sb-success"><span class="dot"></span> Active</span>
  <span class="status-badge sb-warning"><span class="dot"></span> Pending</span>
  <span class="status-badge sb-error"><span class="dot"></span> Failed</span>
  <span class="status-badge sb-info"><span class="dot"></span> Processing</span>
  <span class="status-badge sb-neutral"><span class="dot"></span> Inactive</span>
</div>`,
      },
    ],
  },
  {
    slug: "avatar",
    name: "Avatar",
    description: "Circular user avatar displaying initials or images.",
    cssFile: "components/avatar.css",
    category: "Atoms",
    classes: [
      { name: ".avatar", description: "Circular avatar with initials or image", type: "base" },
      { name: ".avatar img", description: "Image fills and clips to circle", type: "sub-element" },
    ],
    examples: [
      {
        title: "Initials",
        html: `<div style="display:flex;gap:0.5rem">
  <span class="avatar">BN</span>
  <span class="avatar">AJ</span>
  <span class="avatar">KM</span>
</div>`,
      },
      {
        title: "With photos",
        description: "Wrap an <img> inside .avatar. The image clips to a circle.",
        html: `<div style="display:flex;gap:0.75rem;align-items:center">
  <span class="avatar" style="width:2.5rem;height:2.5rem">
    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Ada Lovelace">
  </span>
  <span class="avatar" style="width:2.5rem;height:2.5rem">
    <img src="https://randomuser.me/api/portraits/women/78.jpg" alt="Rachel Chen">
  </span>
  <span class="avatar" style="width:2.5rem;height:2.5rem">
    <img src="https://randomuser.me/api/portraits/men/22.jpg" alt="Linus Berg">
  </span>
  <span class="avatar" style="width:2.5rem;height:2.5rem">
    <img src="${DONKEY}" alt="Donkey">
  </span>
</div>`,
      },
      {
        title: "Company logos",
        html: `<div style="display:flex;gap:0.75rem;align-items:center">
  <span class="avatar" style="width:2.5rem;height:2.5rem">
    <img src="https://github.com/github.png?size=128" alt="GitHub">
  </span>
  <span class="avatar" style="width:2.5rem;height:2.5rem">
    <img src="https://github.com/slackapi.png?size=128" alt="Slack">
  </span>
  <span class="avatar" style="width:2.5rem;height:2.5rem">
    <img src="https://github.com/figma.png?size=128" alt="Figma">
  </span>
  <span class="avatar" style="width:2.5rem;height:2.5rem">
    <img src="https://github.com/stripe.png?size=128" alt="Stripe">
  </span>
</div>`,
      },
      {
        title: "Sizes",
        html: `<div style="display:flex;gap:0.75rem;align-items:end">
  <span class="avatar" style="width:1.25rem;height:1.25rem;font-size:8px">AO</span>
  <span class="avatar">AO</span>
  <span class="avatar" style="width:2.5rem;height:2.5rem;font-size:14px">AO</span>
  <span class="avatar" style="width:3.5rem;height:3.5rem;font-size:18px">AO</span>
  <span class="avatar" style="width:5rem;height:5rem;font-size:24px">AO</span>
</div>`,
      },
      {
        title: "Stacked group",
        description: "Overlap avatars with negative margin. Use outline to create visual separation.",
        html: `<div style="display:flex;align-items:center">
  <span class="avatar" style="width:2rem;height:2rem;outline:2px solid hsl(var(--card))">
    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="">
  </span>
  <span class="avatar" style="width:2rem;height:2rem;outline:2px solid hsl(var(--card));margin-left:-8px">
    <img src="https://randomuser.me/api/portraits/women/78.jpg" alt="">
  </span>
  <span class="avatar" style="width:2rem;height:2rem;outline:2px solid hsl(var(--card));margin-left:-8px">
    <img src="https://randomuser.me/api/portraits/men/22.jpg" alt="">
  </span>
  <span class="avatar" style="width:2rem;height:2rem;outline:2px solid hsl(var(--card));margin-left:-8px">
    <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="">
  </span>
  <span style="margin-left:6px;display:inline-flex;align-items:center;font-size:12px;color:hsl(var(--muted-foreground))">+12</span>
</div>`,
      },
      {
        title: "Ring outline",
        description: "Use box-shadow to add a visible ring around an avatar.",
        html: `<div style="display:flex;gap:1.5rem;align-items:center">
  <span class="avatar" style="width:2.5rem;height:2.5rem;box-shadow:0 0 0 2px hsl(var(--card)),0 0 0 4px hsl(var(--border))">
    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Ada Lovelace">
  </span>
  <span class="avatar" style="width:2.5rem;height:2.5rem;font-size:14px;box-shadow:0 0 0 2px hsl(var(--card)),0 0 0 4px hsl(var(--border))">RC</span>
</div>`,
      },
      {
        title: "Topbar user pill",
        html: `<button style="display:inline-flex;align-items:center;gap:0.5rem;border:1px solid hsl(var(--border));padding:4px 10px 4px 4px;border-radius:9999px;background:hsl(var(--card));cursor:default;font-size:13px;font-weight:500">
  <span class="avatar">
    <img src="${DONKEY}" alt="Donkey">
  </span>
  <span>donkey@example.com</span>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
</button>`,
      },
    ],
  },
  {
    slug: "empty-state",
    name: "Empty State",
    description: "Centered placeholder for pages or sections with no data.",
    cssFile: "components/empty-state.css",
    category: "Molecules",
    classes: [
      { name: ".empty-card", description: "Centered empty state container", type: "base" },
      { name: ".empty-card .title", description: "Heading inside empty state", type: "sub-element" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div class="empty-card">
  <div class="title">No results found</div>
  <p>Try adjusting your search filters.</p>
  <button class="btn btn-outline btn-sm" style="margin-top:1rem">Clear filters</button>
</div>`,
      },
    ],
  },
  {
    slug: "skeleton",
    name: "Skeleton",
    description: "Loading placeholder shapes with a shimmer animation.",
    cssFile: "components/skeleton.css",
    category: "Atoms",
    classes: [
      { name: ".skeleton", description: "Base shimmer animation", type: "base" },
      { name: ".skeleton-text", description: "Text line placeholder", type: "variant" },
      { name: ".skeleton-circle", description: "Circular placeholder (avatars)", type: "variant" },
      { name: ".skeleton-rect", description: "Rectangular placeholder (images)", type: "variant" },
    ],
    examples: [
      {
        title: "Loading card",
        html: `<div class="card" style="max-width:320px;padding:1.25rem">
  <div style="display:flex;gap:0.75rem;align-items:center;margin-bottom:1rem">
    <div class="skeleton skeleton-circle" style="width:2.5rem;height:2.5rem"></div>
    <div style="flex:1">
      <div class="skeleton skeleton-text" style="width:60%;margin-bottom:0.5rem"></div>
      <div class="skeleton skeleton-text" style="width:40%"></div>
    </div>
  </div>
  <div class="skeleton skeleton-rect" style="width:100%;height:120px"></div>
</div>`,
      },
    ],
  },
  {
    slug: "spinner",
    name: "Spinner",
    description: "Animated loading spinner in three sizes.",
    cssFile: "components/spinner.css",
    category: "Atoms",
    classes: [
      { name: ".spinner", description: "Default size spinner", type: "base" },
      { name: ".spinner-sm", description: "Small spinner", type: "size" },
      { name: ".spinner-lg", description: "Large spinner", type: "size" },
    ],
    examples: [
      {
        title: "Sizes",
        html: `<div style="display:flex;gap:1rem;align-items:center">
  <div class="spinner spinner-sm"></div>
  <div class="spinner"></div>
  <div class="spinner spinner-lg"></div>
</div>`,
      },
    ],
  },
  {
    slug: "calendar",
    name: "Calendar",
    description: "Date picker grid with header, navigation, and cell states.",
    cssFile: "components/calendar.css",
    category: "Organisms",
    classes: [
      { name: ".calendar", description: "Calendar container", type: "base" },
      { name: ".calendar-header", description: "Month/year header row", type: "sub-element" },
      { name: ".calendar-title", description: "Month/year text", type: "sub-element" },
      { name: ".calendar-nav", description: "Navigation button", type: "sub-element" },
      { name: ".calendar-grid", description: "Day grid container", type: "sub-element" },
      { name: ".calendar-head", description: "Day-of-week header cell", type: "sub-element" },
      { name: ".calendar-cell", description: "Individual day cell", type: "sub-element" },
      { name: ".calendar-cell.today", description: "Current day highlight", type: "state" },
      { name: ".calendar-cell.selected", description: "Selected day", type: "state" },
      { name: ".calendar-cell.outside", description: "Day outside current month", type: "state" },
      { name: ".calendar-cell.disabled", description: "Disabled/unavailable day", type: "state" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div class="calendar">
  <div class="calendar-header">
    <button class="calendar-nav">&lt;</button>
    <span class="calendar-title">May 2026</span>
    <button class="calendar-nav">&gt;</button>
  </div>
  <div class="calendar-grid">
    <span class="calendar-head">Mo</span>
    <span class="calendar-head">Tu</span>
    <span class="calendar-head">We</span>
    <span class="calendar-head">Th</span>
    <span class="calendar-head">Fr</span>
    <span class="calendar-head">Sa</span>
    <span class="calendar-head">Su</span>
    <button class="calendar-cell outside">27</button>
    <button class="calendar-cell outside">28</button>
    <button class="calendar-cell outside">29</button>
    <button class="calendar-cell outside">30</button>
    <button class="calendar-cell">1</button>
    <button class="calendar-cell">2</button>
    <button class="calendar-cell">3</button>
    <button class="calendar-cell">4</button>
    <button class="calendar-cell">5</button>
    <button class="calendar-cell">6</button>
    <button class="calendar-cell">7</button>
    <button class="calendar-cell">8</button>
    <button class="calendar-cell">9</button>
    <button class="calendar-cell">10</button>
    <button class="calendar-cell">11</button>
    <button class="calendar-cell">12</button>
    <button class="calendar-cell">13</button>
    <button class="calendar-cell">14</button>
    <button class="calendar-cell">15</button>
    <button class="calendar-cell">16</button>
    <button class="calendar-cell">17</button>
    <button class="calendar-cell">18</button>
    <button class="calendar-cell">19</button>
    <button class="calendar-cell">20</button>
    <button class="calendar-cell">21</button>
    <button class="calendar-cell">22</button>
    <button class="calendar-cell today">23</button>
    <button class="calendar-cell selected">24</button>
    <button class="calendar-cell">25</button>
  </div>
</div>`,
      },
    ],
  },

  {
    slug: "alert",
    name: "Alert",
    description: "Contextual message box with variant colors for status communication.",
    cssFile: "components/alert.css",
    category: "Molecules",
    classes: [
      { name: ".alert", description: "Alert container", type: "base" },
      { name: ".alert-title", description: "Bold alert heading", type: "sub-element" },
      { name: ".alert-desc", description: "Alert description text", type: "sub-element" },
      { name: ".alert-default", description: "Neutral/info style", type: "variant" },
      { name: ".alert-destructive", description: "Red/error style", type: "variant" },
      { name: ".alert-warning", description: "Yellow/warning style", type: "variant" },
      { name: ".alert-success", description: "Green/success style", type: "variant" },
      { name: ".alert-info", description: "Blue/info style", type: "variant" },
    ],
    examples: [
      {
        title: "All variants",
        html: `<div style="display:flex;flex-direction:column;gap:0.75rem">
  <div class="alert alert-default">
    <div><div class="alert-title">Note</div><div class="alert-desc">This is a default alert.</div></div>
  </div>
  <div class="alert alert-success">
    <div><div class="alert-title">Success</div><div class="alert-desc">Operation completed.</div></div>
  </div>
  <div class="alert alert-warning">
    <div><div class="alert-title">Warning</div><div class="alert-desc">Check your input.</div></div>
  </div>
  <div class="alert alert-destructive">
    <div><div class="alert-title">Error</div><div class="alert-desc">Something went wrong.</div></div>
  </div>
  <div class="alert alert-info">
    <div><div class="alert-title">Info</div><div class="alert-desc">Here is some information.</div></div>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "dialog",
    name: "Dialog",
    description: "Modal dialog overlay for confirmations and focused tasks.",
    cssFile: "components/dialog.css",
    category: "Organisms",
    classes: [
      { name: ".dialog-overlay", description: "Semi-transparent backdrop", type: "sub-element" },
      { name: ".dialog", description: "Dialog panel", type: "base" },
      { name: ".dialog-header", description: "Header section", type: "sub-element" },
      { name: ".dialog-title", description: "Dialog heading", type: "sub-element" },
      { name: ".dialog-desc", description: "Description text", type: "sub-element" },
      { name: ".dialog-footer", description: "Footer with action buttons", type: "sub-element" },
      { name: ".dialog-close", description: "Close button", type: "sub-element" },
    ],
    examples: [
      {
        title: "Inline preview",
        description: "Dialog shown inline (normally centered over an overlay).",
        html: `<div style="position:relative;border:1px solid hsl(var(--border));border-radius:var(--radius-lg,12px);padding:0">
  <div class="dialog" style="position:relative;transform:none;top:auto;left:auto;animation:none">
    <div class="dialog-header">
      <h2 class="dialog-title">Confirm Action</h2>
      <p class="dialog-desc">Are you sure you want to proceed? This action cannot be undone.</p>
    </div>
    <div class="dialog-footer">
      <button class="btn btn-outline">Cancel</button>
      <button class="btn btn-default">Confirm</button>
    </div>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "sheet",
    name: "Sheet",
    description: "Slide-in panel from the left or right edge of the viewport.",
    cssFile: "components/sheet.css",
    category: "Organisms",
    classes: [
      { name: ".sheet-overlay", description: "Backdrop overlay", type: "sub-element" },
      { name: ".sheet", description: "Sheet panel container", type: "base" },
      { name: ".sheet-right", description: "Slides in from the right", type: "variant" },
      { name: ".sheet-left", description: "Slides in from the left", type: "variant" },
      { name: ".sheet-header", description: "Header section", type: "sub-element" },
      { name: ".sheet-title", description: "Sheet heading", type: "sub-element" },
      { name: ".sheet-body", description: "Scrollable body content", type: "sub-element" },
      { name: ".sheet-footer", description: "Footer with actions", type: "sub-element" },
    ],
    examples: [
      {
        title: "Inline preview",
        description: "Sheet shown inline (normally slides in from viewport edge).",
        html: `<div style="position:relative;border:1px solid hsl(var(--border));border-radius:var(--radius-lg,12px);overflow:hidden;height:250px">
  <div class="sheet sheet-right" style="position:absolute;transform:none;animation:none;width:300px">
    <div class="sheet-header">
      <h2 class="sheet-title">User Details</h2>
    </div>
    <div class="sheet-body">
      <div class="field">
        <span class="field-label">Name</span>
        <span class="field-value">Alice Johnson</span>
      </div>
      <div class="field" style="margin-top:0.5rem">
        <span class="field-label">Email</span>
        <span class="field-value">alice@example.com</span>
      </div>
    </div>
    <div class="sheet-footer">
      <button class="btn btn-outline btn-sm">Close</button>
    </div>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "toast",
    name: "Toast",
    description: "Non-blocking notification that appears temporarily.",
    cssFile: "components/toast.css",
    category: "Organisms",
    classes: [
      { name: ".toast-viewport", description: "Fixed container for toast stack", type: "sub-element" },
      { name: ".toast", description: "Individual toast notification", type: "base" },
      { name: ".toast-title", description: "Toast heading", type: "sub-element" },
      { name: ".toast-desc", description: "Toast description", type: "sub-element" },
      { name: ".toast-close", description: "Dismiss button", type: "sub-element" },
      { name: ".toast-action", description: "Action button inside toast", type: "sub-element" },
      { name: ".toast-destructive", description: "Error/destructive variant", type: "variant" },
    ],
    examples: [
      {
        title: "Default and destructive",
        html: `<div style="display:flex;flex-direction:column;gap:0.5rem">
  <div class="toast" style="position:relative;animation:none">
    <div>
      <div class="toast-title">Changes saved</div>
      <div class="toast-desc">Your settings have been updated.</div>
    </div>
    <button class="toast-close">&times;</button>
  </div>
  <div class="toast toast-destructive" style="position:relative;animation:none">
    <div>
      <div class="toast-title">Error</div>
      <div class="toast-desc">Failed to save changes.</div>
    </div>
    <button class="toast-action">Retry</button>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    description: "Small floating label for supplementary information on hover.",
    cssFile: "components/tooltip.css",
    category: "Atoms",
    classes: [
      { name: ".tooltip", description: "Tooltip container", type: "base" },
      { name: ".tooltip-arrow", description: "Arrow pointer element", type: "sub-element" },
      { name: ".tooltip-arrow.bottom", description: "Arrow pointing down", type: "state" },
      { name: ".tooltip-arrow.top", description: "Arrow pointing up", type: "state" },
      { name: ".tooltip-arrow.left", description: "Arrow pointing left", type: "state" },
      { name: ".tooltip-arrow.right", description: "Arrow pointing right", type: "state" },
    ],
    examples: [
      {
        title: "Arrow positions",
        html: `<div style="display:flex;gap:2rem;padding:1rem">
  <div class="tooltip" style="position:relative">
    Tooltip top
    <span class="tooltip-arrow bottom"></span>
  </div>
  <div class="tooltip" style="position:relative">
    Tooltip bottom
    <span class="tooltip-arrow top"></span>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "popover",
    name: "Popover",
    description: "Floating panel for rich content triggered by a click.",
    cssFile: "components/popover.css",
    category: "Atoms",
    classes: [
      { name: ".popover", description: "Floating popover container", type: "base" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div class="popover" style="position:relative;display:inline-block">
  <p class="body" style="margin-bottom:0.5rem">Popover content</p>
  <button class="btn btn-outline btn-sm">Action</button>
</div>`,
      },
    ],
  },
  {
    slug: "dropdown",
    name: "Dropdown",
    description: "Action menu with items, labels, and separators.",
    cssFile: "components/dropdown.css",
    category: "Atoms",
    classes: [
      { name: ".dropdown", description: "Dropdown menu container", type: "base" },
      { name: ".dropdown-item", description: "Clickable menu item", type: "sub-element" },
      { name: ".dropdown-item.disabled", description: "Disabled item", type: "state" },
      { name: ".dropdown-sep", description: "Separator line", type: "sub-element" },
      { name: ".dropdown-label", description: "Non-interactive group label", type: "sub-element" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div class="dropdown" style="position:relative;display:inline-block;min-width:180px">
  <div class="dropdown-label">Actions</div>
  <button class="dropdown-item">Edit</button>
  <button class="dropdown-item">Duplicate</button>
  <div class="dropdown-sep"></div>
  <button class="dropdown-item">Archive</button>
  <button class="dropdown-item disabled">Delete (disabled)</button>
</div>`,
      },
    ],
  },
  {
    slug: "command",
    name: "Command",
    description: "Command palette / Cmd+K dialog with searchable grouped actions.",
    cssFile: "components/command.css",
    category: "Organisms",
    classes: [
      { name: ".command-overlay", description: "Backdrop overlay", type: "sub-element" },
      { name: ".command-dialog", description: "Dialog container", type: "base" },
      { name: ".command-input", description: "Search input field", type: "sub-element" },
      { name: ".command-list", description: "Scrollable results list", type: "sub-element" },
      { name: ".command-group", description: "Result group wrapper", type: "sub-element" },
      { name: ".command-group-label", description: "Group heading", type: "sub-element" },
      { name: ".command-item", description: "Individual result item", type: "sub-element" },
      { name: ".command-item.selected", description: "Highlighted/selected item", type: "state" },
      { name: ".command-sep", description: "Separator between groups", type: "sub-element" },
      { name: ".command-empty", description: "No results message", type: "sub-element" },
      { name: ".command-shortcut", description: "Keyboard shortcut label", type: "sub-element" },
    ],
    examples: [
      {
        title: "Inline preview",
        html: `<div class="command-dialog" style="position:relative;transform:none;top:auto;left:auto;animation:none;max-width:480px">
  <input class="command-input" placeholder="Type a command..." />
  <div class="command-list">
    <div class="command-group">
      <div class="command-group-label">Actions</div>
      <div class="command-item selected">New File <span class="command-shortcut">Ctrl+N</span></div>
      <div class="command-item">Open File <span class="command-shortcut">Ctrl+O</span></div>
      <div class="command-item">Save <span class="command-shortcut">Ctrl+S</span></div>
    </div>
    <div class="command-sep"></div>
    <div class="command-group">
      <div class="command-group-label">Navigation</div>
      <div class="command-item">Go to Dashboard</div>
      <div class="command-item">Go to Settings</div>
    </div>
  </div>
</div>`,
      },
    ],
  },

  {
    slug: "tabs",
    name: "Tabs",
    description: "Tab navigation for switching between content panels.",
    cssFile: "components/tabs.css",
    category: "Organisms",
    classes: [
      { name: ".tabs-list", description: "Tab button container", type: "base" },
      { name: ".tab", description: "Individual tab button", type: "sub-element" },
      { name: ".tab.active", description: "Currently active tab", type: "state" },
      { name: ".tabs-content", description: "Tab panel content area", type: "sub-element" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div>
  <div class="tabs-list">
    <button class="tab active">General</button>
    <button class="tab">Security</button>
    <button class="tab">Notifications</button>
  </div>
  <div class="tabs-content">
    <p class="body">General settings content goes here.</p>
  </div>
</div>`,
      },
    ],
  },
  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    description: "Navigation trail showing the current page's location in the hierarchy.",
    cssFile: "components/breadcrumb.css",
    category: "Atoms",
    classes: [
      { name: ".breadcrumb", description: "Breadcrumb container", type: "base" },
      { name: ".breadcrumb-item", description: "Individual breadcrumb link", type: "sub-element" },
      { name: ".breadcrumb-item.active", description: "Current page (non-linked)", type: "state" },
      { name: ".breadcrumb-sep", description: "Separator character", type: "sub-element" },
    ],
    examples: [
      {
        title: "Default",
        html: `<nav class="breadcrumb">
  <span class="breadcrumb-item"><a href="#">Home</a></span>
  <span class="breadcrumb-sep">/</span>
  <span class="breadcrumb-item"><a href="#">Components</a></span>
  <span class="breadcrumb-sep">/</span>
  <span class="breadcrumb-item active">Button</span>
</nav>`,
      },
    ],
  },
  {
    slug: "pagination",
    name: "Pagination",
    description: "Page navigation with numbered buttons and ellipsis.",
    cssFile: "components/pagination.css",
    category: "Atoms",
    classes: [
      { name: ".pagination", description: "Pagination container", type: "base" },
      { name: ".page-btn", description: "Page number button", type: "sub-element" },
      { name: ".page-btn.active", description: "Current page", type: "state" },
      { name: ".page-ellipsis", description: "Ellipsis gap indicator", type: "sub-element" },
    ],
    examples: [
      {
        title: "Default",
        html: `<nav class="pagination">
  <button class="page-btn" disabled>&laquo;</button>
  <button class="page-btn active">1</button>
  <button class="page-btn">2</button>
  <button class="page-btn">3</button>
  <span class="page-ellipsis">...</span>
  <button class="page-btn">12</button>
  <button class="page-btn">&raquo;</button>
</nav>`,
      },
    ],
  },
  {
    slug: "row-menu",
    name: "Row Menu",
    description: "Vertical action menu items and navigation links.",
    cssFile: "components/row-menu.css",
    category: "Organisms",
    classes: [
      { name: ".rowmenu-item", description: "Menu item button", type: "base" },
      { name: ".rowmenu-danger", description: "Destructive/danger item", type: "variant" },
      { name: ".rowmenu-sep", description: "Separator line", type: "sub-element" },
      { name: ".navlink", description: "Navigation link item", type: "base" },
      { name: ".navlink.active", description: "Active navigation link", type: "state" },
      { name: ".nav-wrap", description: "Navigation container", type: "sub-element" },
    ],
    examples: [
      {
        title: "Context menu",
        html: `<div style="display:inline-flex;flex-direction:column;min-width:180px;border:1px solid hsl(var(--border));border-radius:var(--radius-lg,12px);padding:0.25rem;background:hsl(var(--popover))">
  <button class="rowmenu-item">Edit</button>
  <button class="rowmenu-item">Duplicate</button>
  <div class="rowmenu-sep"></div>
  <button class="rowmenu-item rowmenu-danger">Delete</button>
</div>`,
      },
    ],
  },
  {
    slug: "stepper",
    name: "Stepper",
    description: "Multi-step progress indicator with completed, active, and pending states.",
    cssFile: "components/stepper.css",
    category: "Organisms",
    classes: [
      { name: ".stepper", description: "Stepper container", type: "base" },
      { name: ".step", description: "Individual step", type: "sub-element" },
      { name: ".step.active", description: "Currently active step", type: "state" },
      { name: ".step.completed", description: "Completed step", type: "state" },
      { name: ".step-indicator", description: "Step number/icon circle", type: "sub-element" },
      { name: ".step-label", description: "Step text label", type: "sub-element" },
      { name: ".step-connector", description: "Line between steps", type: "sub-element" },
    ],
    examples: [
      {
        title: "Default",
        html: `<div class="stepper">
  <div class="step completed">
    <div class="step-indicator">&#10003;</div>
    <span class="step-label">Account</span>
  </div>
  <div class="step-connector"></div>
  <div class="step active">
    <div class="step-indicator">2</div>
    <span class="step-label">Profile</span>
  </div>
  <div class="step-connector"></div>
  <div class="step">
    <div class="step-indicator">3</div>
    <span class="step-label">Review</span>
  </div>
</div>`,
      },
    ],
  },
];

export function getComponent(slug: string): ComponentDoc | undefined {
  return COMPONENTS.find((c) => c.slug === slug);
}

export function getComponentsByCategory(category: string): ComponentDoc[] {
  return COMPONENTS.filter((c) => c.category === category);
}
