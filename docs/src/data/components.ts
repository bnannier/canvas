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
  // ─── Atoms ────────────────────────────────────────────────────────────

  {
    slug: "avatar",
    name: "Avatars",
    description: "Initials on a brand gradient. No portrait photography; keeps the chrome consistent across seeded admin accounts. Sizes scale font proportionally (40% of diameter).",
    category: "Atoms",
    playground: {
      controls: [
        { type: "range", key: "size", label: "Size", min: 20, max: 96, step: 4, suffix: "px" },
        { type: "text", key: "initials", label: "Initials" },
        { type: "check", key: "stacked", label: "Stacked group" },
        { type: "check", key: "ring", label: "Ring outline" },
      ],
      defaults: { size: 40, initials: "AO", stacked: false, ring: false },
      render: (s) => {
        const sz = s.size as number;
        const ini = ((s.initials as string) || "AO").slice(0, 2).toUpperCase();
        const fs = Math.round(sz * 0.4);
        const ring = s.ring ? `outline:2px solid hsl(var(--card));` : "";
        if (s.stacked) {
          return ["AO","RC","LB","KT"].map((n, i) =>
            `<span class="avatar" style="width:${sz}px;height:${sz}px;font-size:${fs}px;${ring}${i > 0 ? "margin-left:-8px;" : ""}z-index:${10-i}">${n}</span>`
          ).join("");
        }
        return `<span class="avatar" style="width:${sz}px;height:${sz}px;font-size:${fs}px;${ring}">${ini}</span>`;
      },
      markup: (s) => {
        const sz = s.size as number;
        const ini = ((s.initials as string) || "AO").slice(0, 2).toUpperCase();
        return `<span class="avatar" style="width:${sz}px;height:${sz}px">${ini}</span>`;
      },
    },
    sections: [
      {
        title: "Sizes",
        examples: [{
          html: `<div style="display:flex;gap:0.75rem;align-items:end">
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span class="avatar" style="width:20px;height:20px;font-size:8px">AO</span><code style="font-size:10.5px;color:hsl(var(--muted-foreground))">20px</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span class="avatar" style="width:24px;height:24px;font-size:10px">AO</span><code style="font-size:10.5px;color:hsl(var(--muted-foreground))">24px</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span class="avatar">AO</span><code style="font-size:10.5px;color:hsl(var(--muted-foreground))">28px</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span class="avatar" style="width:32px;height:32px;font-size:13px">AO</span><code style="font-size:10.5px;color:hsl(var(--muted-foreground))">32px</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span class="avatar" style="width:40px;height:40px;font-size:16px">AO</span><code style="font-size:10.5px;color:hsl(var(--muted-foreground))">40px</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span class="avatar" style="width:56px;height:56px;font-size:22px">AO</span><code style="font-size:10.5px;color:hsl(var(--muted-foreground))">56px</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span class="avatar" style="width:80px;height:80px;font-size:32px">AO</span><code style="font-size:10.5px;color:hsl(var(--muted-foreground))">80px</code></div>
</div>`,
        }],
      },
      {
        title: "Default (.avatar class)",
        description: "The shared <code>.avatar</code> token renders the 28px default, used in topbars and table rows.",
        examples: [{
          html: `<div style="display:flex;gap:0.5rem">
  <span class="avatar">AO</span>
  <span class="avatar">RC</span>
  <span class="avatar">LB</span>
  <span class="avatar">KT</span>
  <span class="avatar">NP</span>
  <span class="avatar">GH</span>
</div>`,
        }],
      },
      {
        title: "In context",
        columns: 2,
        examples: [
          {
            label: "Topbar user pill",
            html: `<button style="display:inline-flex;align-items:center;gap:0.5rem;border:1px solid hsl(var(--border));padding:4px 10px 4px 4px;border-radius:9999px;background:hsl(var(--card));cursor:default;font-size:13px;font-weight:500">
  <span class="avatar">AO</span>
  <span>admin@example.com</span>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
</button>`,
          },
          {
            label: "Identity header card",
            html: `<div style="display:flex;align-items:center;gap:1rem">
  <span class="avatar" style="width:56px;height:56px;font-size:22px">RC</span>
  <div>
    <div style="font-size:16px;font-weight:600">Rachel Chen</div>
    <div style="font-size:13px;color:hsl(var(--muted-foreground))">rachel.chen@example.com</div>
  </div>
</div>`,
          },
          {
            label: "Stacked group",
            html: `<div style="display:flex;align-items:center">
  <span class="avatar" style="width:2rem;height:2rem;outline:2px solid hsl(var(--card));z-index:4">AO</span>
  <span class="avatar" style="width:2rem;height:2rem;outline:2px solid hsl(var(--card));margin-left:-8px;z-index:3">RC</span>
  <span class="avatar" style="width:2rem;height:2rem;outline:2px solid hsl(var(--card));margin-left:-8px;z-index:2">LB</span>
  <span class="avatar" style="width:2rem;height:2rem;outline:2px solid hsl(var(--card));margin-left:-8px;z-index:1">KT</span>
  <span style="margin-left:6px;display:inline-flex;align-items:center;font-size:12px;color:hsl(var(--muted-foreground))">+12</span>
</div>`,
          },
          {
            label: "User menu header",
            html: `<div style="display:flex;align-items:center;gap:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid hsl(var(--border))">
  <span class="avatar" style="width:40px;height:40px;font-size:16px">AO</span>
  <div>
    <div style="font-size:13px;font-weight:600">Ada Lovelace</div>
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">admin@example.com</div>
  </div>
</div>`,
          },
        ],
      },
    ],
  },

  {
    slug: "badge",
    name: "Badges",
    description: "Two families. <code>.badge</code> = rectangular pill for metadata (schema, role, tag). <code>.status-badge</code> = pill with dot for live state (active, pending, failed).",
    category: "Atoms",
    sections: [
      {
        title: ".badge – metadata",
        description: "Square corners, no dot. Use for static categorization (schema, type, scope).",
        examples: [{
          html: `<div style="display:flex;gap:0.5rem;flex-wrap:wrap">
  <span class="badge badge-default">default</span>
  <span class="badge badge-secondary">secondary</span>
  <span class="badge badge-outline">outline</span>
  <span class="badge badge-destructive">destructive</span>
</div>`,
        }],
      },
      {
        title: ".status-badge – live state",
        description: "Rounded full + leading dot. Use for transient or computed state.",
        examples: [{
          html: `<div style="display:flex;gap:0.5rem;flex-wrap:wrap">
  <span class="status-badge sb-success"><span class="dot"></span> Active</span>
  <span class="status-badge sb-warning"><span class="dot"></span> Unverified</span>
  <span class="status-badge sb-error"><span class="dot"></span> Failed</span>
  <span class="status-badge sb-info"><span class="dot"></span> Pending</span>
  <span class="status-badge sb-neutral"><span class="dot"></span> Inactive</span>
</div>`,
        }],
      },
      {
        title: "In context",
        columns: 2,
        examples: [
          {
            label: "Identity header card",
            html: `<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
  <span style="font-size:15px;font-weight:600">Rachel Chen</span>
  <span class="status-badge sb-success"><span class="dot"></span> active</span>
  <span class="status-badge sb-info"><span class="dot"></span> Verified</span>
  <span class="badge badge-secondary">employee</span>
</div>`,
          },
          {
            label: "Grant chips on a client row",
            html: `<div style="display:flex;gap:4px;flex-wrap:wrap">
  <span class="badge badge-secondary" style="font-family:var(--font-mono);font-size:10.5px">authorization_code</span>
  <span class="badge badge-secondary" style="font-family:var(--font-mono);font-size:10.5px">refresh_token</span>
  <span class="badge badge-secondary" style="font-family:var(--font-mono);font-size:10.5px">client_credentials</span>
</div>`,
          },
        ],
      },
      {
        title: "When to choose which",
        examples: [{
          full: true,
          html: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;font-size:13px">
  <div>
    <div style="font-weight:600;margin-bottom:8px">Use .badge if&hellip;</div>
    <ul style="margin:0;padding-left:1.25rem;color:hsl(var(--muted-foreground));line-height:1.8">
      <li>The value is categorical and static (schema name, scope, type).</li>
      <li>It's metadata you read, not state you act on.</li>
      <li>It's mono-spaced data (a token, an event name).</li>
    </ul>
  </div>
  <div>
    <div style="font-weight:600;margin-bottom:8px">Use .status-badge if&hellip;</div>
    <ul style="margin:0;padding-left:1.25rem;color:hsl(var(--muted-foreground));line-height:1.8">
      <li>The value changes over time (active &rarr; expired, queued &rarr; sent).</li>
      <li>It's a live indicator the user scans for at-a-glance.</li>
      <li>It carries a dot the user might watch for color shifts.</li>
    </ul>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "breadcrumb",
    name: "Breadcrumbs",
    description: "Hierarchical navigation showing where you are.",
    category: "Atoms",
    sections: [
      {
        title: "With chevrons",
        anatomy: "Each segment is a link except the current page. 11px chevron separator.",
        examples: [{
          html: `<nav class="breadcrumb">
  <span class="breadcrumb-item"><a href="#">Home</a></span>
  <span class="breadcrumb-sep">/</span>
  <span class="breadcrumb-item"><a href="#">Components</a></span>
  <span class="breadcrumb-sep">/</span>
  <span class="breadcrumb-item active">Button</span>
</nav>`,
        }],
      },
      {
        title: "With home icon",
        examples: [{
          html: `<nav class="breadcrumb">
  <span class="breadcrumb-item"><a href="#"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></a></span>
  <span class="breadcrumb-sep">/</span>
  <span class="breadcrumb-item"><a href="#">Components</a></span>
  <span class="breadcrumb-sep">/</span>
  <span class="breadcrumb-item active">Button</span>
</nav>`,
        }],
      },
      {
        title: "In a PageHeader",
        anatomy: "Most pages use the breadcrumb inside PageHeader instead of standalone.",
        examples: [{
          full: true,
          html: `<div class="page-header">
  <div>
    <nav class="breadcrumb" style="margin-bottom:0.5rem">
      <span class="breadcrumb-item"><a href="#">Users</a></span>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-item active">Rachel Chen</span>
    </nav>
    <div class="page-header-title"><h1>Rachel Chen</h1></div>
  </div>
  <div class="page-header-actions">
    <button class="btn btn-outline btn-sm">Edit</button>
    <button class="btn btn-default btn-sm">Save</button>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "button-group",
    name: "Button Groups",
    description: "Segmented controls, split buttons, attached groups.",
    category: "Atoms",
    sections: [
      {
        title: "Segmented control",
        anatomy: "A rounded container holding 2-4 buttons. The active one fills with primary; others are ghost. Use for mutually-exclusive view switching.",
        examples: [{
          html: `<div class="btn-group">
  <button class="btn btn-default btn-sm">All</button>
  <button class="btn btn-outline btn-sm">Active</button>
  <button class="btn btn-outline btn-sm">Archived</button>
</div>`,
        }],
      },
      {
        title: "Attached buttons",
        anatomy: "Adjacent buttons with shared borders. Use for groups of related actions (zoom, alignment).",
        examples: [{
          html: `<div class="btn-group">
  <button class="btn btn-outline">Left</button>
  <button class="btn btn-outline">Center</button>
  <button class="btn btn-outline">Right</button>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "button",
    name: "Buttons",
    description: "Six variants × four sizes × disabled / focus / hover states. Always semantic: variant communicates intent (default = primary action, destructive = irreversible, ghost = chrome).",
    category: "Atoms",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["default", "outline", "secondary", "ghost", "destructive", "link"], cols: 3 },
        { type: "pills", key: "size", label: "Size", options: ["sm", "default", "lg", "icon"], cols: 4 },
        { type: "check", key: "disabled", label: "Disabled" },
        { type: "check", key: "withIcon", label: "With icon" },
        { type: "text", key: "label", label: "Label", disabledWhen: (s) => s.size === "icon" },
      ],
      defaults: { variant: "default", size: "default", disabled: false, withIcon: false, label: "Save changes" },
      render: (s) => {
        const v = s.variant as string;
        const sz = s.size as string;
        const label = s.label as string;
        const sizeCls = sz === "default" ? "" : ` btn-${sz}`;
        const dis = s.disabled ? " disabled" : "";
        const icon = s.withIcon ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>` : "";
        if (sz === "icon") {
          return `<button class="btn btn-${v} btn-icon"${dis}>${icon || "+"}</button>`;
        }
        return `<button class="btn btn-${v}${sizeCls}"${dis}>${icon}${label}</button>`;
      },
      markup: (s) => {
        const v = s.variant as string;
        const sz = s.size as string;
        const sizeCls = sz === "default" ? "" : ` btn-${sz}`;
        const dis = s.disabled ? " disabled" : "";
        return `<button class="btn btn-${v}${sizeCls}"${dis}>`;
      },
    },
    sections: [
      {
        title: "Variants",
        description: "Six. Default is the only one that should dominate any given view: pair it with one or two ghosts/outlines, never two defaults.",
        anatomy: 'Class is <code>btn btn-&lt;variant&gt;</code>. Variants compose with size and icon modifiers.',
        examples: [{
          html: `<div style="display:flex;gap:0.5rem;flex-wrap:wrap">
  <button class="btn btn-default">Default</button>
  <button class="btn btn-outline">Outline</button>
  <button class="btn btn-secondary">Secondary</button>
  <button class="btn btn-ghost">Ghost</button>
  <button class="btn btn-destructive">Destructive</button>
  <button class="btn btn-link">Link</button>
</div>`,
        }],
      },
      {
        title: "Sizes",
        description: "Three heights: 32, 36, 40px, plus a square icon-only variant.",
        examples: [{
          html: `<div style="display:flex;gap:0.5rem;align-items:center">
  <button class="btn btn-default btn-sm">Small &middot; 32</button>
  <button class="btn btn-default">Default &middot; 36</button>
  <button class="btn btn-default btn-lg">Large &middot; 40</button>
  <button class="btn btn-default btn-icon">+</button>
  <button class="btn btn-ghost btn-icon">&hellip;</button>
  <button class="btn btn-outline btn-icon">&oast;</button>
</div>`,
        }],
      },
      {
        title: "With icons",
        description: "Leading icons are conventional. Trailing icons are reserved for affordances (chevrons on splits, etc.).",
        examples: [{
          html: `<div style="display:flex;gap:0.5rem;flex-wrap:wrap">
  <button class="btn btn-default"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Create</button>
  <button class="btn btn-outline"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export CSV</button>
  <button class="btn btn-ghost"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg> Refresh</button>
  <button class="btn btn-destructive"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete</button>
</div>`,
        }],
      },
      {
        title: "States",
        columns: 2,
        examples: [
          {
            label: "Rest / hover / focus / disabled",
            html: `<div style="display:flex;gap:0.5rem;flex-wrap:wrap">
  <button class="btn btn-default">Rest</button>
  <button class="btn btn-default" style="filter:brightness(0.9)">Hover</button>
  <button class="btn btn-default" style="box-shadow:0 0 0 2px hsl(var(--ring))">Focus</button>
  <button class="btn btn-default" disabled>Disabled</button>
</div>`,
          },
          {
            label: "Loading (consumer-side)",
            html: `<div style="display:flex;flex-direction:column;gap:0.75rem">
  <div style="display:flex;gap:0.5rem">
    <button class="btn btn-default" disabled><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving&hellip;</button>
    <button class="btn btn-outline" disabled><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Loading</button>
  </div>
  <div style="font-size:11.5px;color:hsl(var(--muted-foreground))">No built-in loading variant: consumers swap label + add a spinning icon.</div>
</div>`,
          },
        ],
      },
      {
        title: "Composition recipes",
        columns: 2,
        examples: [
          {
            label: "Page-header actions",
            html: `<div style="display:flex;gap:0.5rem">
  <button class="btn btn-outline btn-sm"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export CSV</button>
  <button class="btn btn-default btn-sm"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New identity</button>
</div>`,
          },
          {
            label: "Modal footer",
            html: `<div style="display:flex;gap:0.5rem">
  <button class="btn btn-outline btn-sm">Cancel</button>
  <button class="btn btn-destructive btn-sm">Delete permanently</button>
</div>`,
          },
          {
            label: "Row action menu trigger",
            html: `<div style="display:flex;justify-content:flex-end;flex:1">
  <button class="btn btn-ghost btn-sm" style="height:28px;padding:0 8px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
</div>`,
          },
          {
            label: "Toolbar filter pills",
            html: `<div style="display:flex;gap:0.25rem">
  <button class="btn btn-default btn-sm" style="text-transform:capitalize">all</button>
  <button class="btn btn-outline btn-sm" style="text-transform:capitalize">employee</button>
  <button class="btn btn-outline btn-sm" style="text-transform:capitalize">customer</button>
</div>`,
          },
        ],
      },
    ],
    donts: [{
      dont: {
        html: `<div style="display:flex;gap:0.5rem">
  <button class="btn btn-default">Save</button>
  <button class="btn btn-default">Apply</button>
  <button class="btn btn-default">Continue</button>
</div>`,
        caption: "Multiple primary buttons compete. Pick one default; downgrade the rest to outline/ghost.",
      },
      do: {
        html: `<div style="display:flex;gap:0.5rem">
  <button class="btn btn-default">Save</button>
  <button class="btn btn-outline">Cancel</button>
</div>`,
        caption: "One clear primary action; everything else is supporting.",
      },
    }],
  },

  {
    slug: "checkbox",
    name: "Checkboxes",
    description: "Multi-select option, single yes/no, grouped lists.",
    category: "Atoms",
    sections: [
      {
        title: "Variants",
        anatomy: "Native input with accent-color set to var(--primary). 16px square, 2px ring on focus.",
        examples: [{
          html: `<div style="display:flex;flex-direction:column;gap:0.5rem;font-size:13px">
  <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" style="accent-color:hsl(var(--primary))"> Default (unchecked)</label>
  <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" checked style="accent-color:hsl(var(--primary))"> Checked</label>
  <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" disabled style="accent-color:hsl(var(--primary))"> Disabled</label>
  <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" checked disabled style="accent-color:hsl(var(--primary))"> Disabled + checked</label>
</div>`,
        }],
      },
      {
        title: "With description",
        anatomy: "Block label + secondary description text. Description stays muted.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:400px;padding:1.25rem">
  <fieldset style="border:0;margin:0;padding:0">
    <legend style="font-size:14px;font-weight:600;margin-bottom:0.75rem">Notifications</legend>
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      <label style="display:flex;gap:0.5rem;cursor:pointer">
        <input type="checkbox" checked style="accent-color:hsl(var(--primary));margin-top:3px">
        <div>
          <div style="font-size:13px;font-weight:500">Comments</div>
          <div style="font-size:12px;color:hsl(var(--muted-foreground))">Get notified when someone comments on your posts.</div>
        </div>
      </label>
      <label style="display:flex;gap:0.5rem;cursor:pointer">
        <input type="checkbox" style="accent-color:hsl(var(--primary));margin-top:3px">
        <div>
          <div style="font-size:13px;font-weight:500">Candidates</div>
          <div style="font-size:12px;color:hsl(var(--muted-foreground))">Get notified when a candidate applies for a job.</div>
        </div>
      </label>
      <label style="display:flex;gap:0.5rem;cursor:pointer">
        <input type="checkbox" checked style="accent-color:hsl(var(--primary));margin-top:3px">
        <div>
          <div style="font-size:13px;font-weight:500">Offers</div>
          <div style="font-size:12px;color:hsl(var(--muted-foreground))">Get notified when a candidate accepts or rejects an offer.</div>
        </div>
      </label>
    </div>
  </fieldset>
</div>`,
        }],
      },
      {
        title: "As a list filter",
        anatomy: "Inline column of checkboxes in a filter panel.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:200px;padding:1rem">
  <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:hsl(var(--muted-foreground));font-weight:500;margin-bottom:0.5rem">Status</div>
  <div style="display:flex;flex-direction:column;gap:0.5rem;font-size:13px">
    <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" checked style="accent-color:hsl(var(--primary))"> Active</label>
    <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" style="accent-color:hsl(var(--primary))"> Pending</label>
    <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" style="accent-color:hsl(var(--primary))"> Archived</label>
    <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" style="accent-color:hsl(var(--primary))"> Deleted</label>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "combobox",
    name: "Comboboxes",
    description: "Text input + dropdown: searchable single-select.",
    category: "Atoms",
    sections: [
      {
        title: "Single-select",
        anatomy: "Input + chevron + dropdown list. Filter as you type, arrow/enter to pick.",
        examples: [{
          html: `<div class="combobox" style="max-width:280px">
  <input class="combobox-input" placeholder="Search or select..." />
  <div class="combobox-list">
    <div class="combobox-item">Apple</div>
    <div class="combobox-item selected">Banana</div>
    <div class="combobox-item">Cherry</div>
    <div class="combobox-item">Date</div>
    <div class="combobox-item">Elderberry</div>
  </div>
</div>`,
        }],
      },
      {
        title: "With label + helper",
        examples: [{
          html: `<div style="max-width:280px">
  <label class="label">Fruit</label>
  <div class="combobox">
    <input class="combobox-input" placeholder="Pick one..." />
    <div class="combobox-list">
      <div class="combobox-item selected">Banana</div>
      <div class="combobox-item">Cherry</div>
    </div>
  </div>
  <p class="field-helper">Start typing to filter.</p>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "separator",
    name: "Dividers",
    description: "Horizontal, vertical, with label, with action.",
    category: "Atoms",
    sections: [
      {
        title: "Horizontal",
        anatomy: "A simple 1px hairline using border-border. Use <code>.sep</code> utility class.",
        examples: [{
          full: true,
          html: `<div>
  <p class="body" style="margin-bottom:0.75rem">Content above</p>
  <hr class="sep" />
  <p class="body" style="margin-top:0.75rem">Content below</p>
</div>`,
        }],
      },
      {
        title: "With label",
        anatomy: "Hairline + centered label. Pad the label horizontally so the line breaks around it.",
        examples: [{
          html: `<div class="sep-label">or continue with</div>`,
        }],
      },
      {
        title: "With action",
        anatomy: "Trailing button replaces the centered label.",
        examples: [{
          full: true,
          html: `<div style="display:flex;align-items:center;gap:0.75rem">
  <hr class="sep" style="flex:1" />
  <button class="btn btn-ghost btn-sm">Show more</button>
  <hr class="sep" style="flex:1" />
</div>`,
        }],
      },
      {
        title: "Vertical",
        anatomy: "Inside a flex row, a 1px vertical line. <code>.sep-v</code> utility.",
        examples: [{
          html: `<div style="display:flex;align-items:center;gap:0.75rem;height:2rem">
  <span class="body">Left</span>
  <div class="sep-v" style="height:1.25rem"></div>
  <span class="body">Right</span>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "dropdown",
    name: "Dropdowns",
    description: "Floating menus triggered by a button: actions, options, navigation.",
    category: "Atoms",
    sections: [
      {
        title: "Simple",
        anatomy: "Menu of plain text items; one column.",
        examples: [{
          html: `<div class="dropdown" style="position:relative;display:inline-block;min-width:180px">
  <div class="dropdown-label">Actions</div>
  <button class="dropdown-item">Edit</button>
  <button class="dropdown-item">Duplicate</button>
  <div class="dropdown-sep"></div>
  <button class="dropdown-item">Archive</button>
  <button class="dropdown-item disabled">Delete (disabled)</button>
</div>`,
        }],
      },
      {
        title: "With shortcuts",
        anatomy: "Keyboard hint pinned to the right.",
        examples: [{
          html: `<div class="dropdown" style="position:relative;display:inline-block;min-width:220px">
  <button class="dropdown-item"><span>Undo</span><span class="command-shortcut">⌘Z</span></button>
  <button class="dropdown-item"><span>Redo</span><span class="command-shortcut">⌘⇧Z</span></button>
  <div class="dropdown-sep"></div>
  <button class="dropdown-item"><span>Cut</span><span class="command-shortcut">⌘X</span></button>
  <button class="dropdown-item"><span>Copy</span><span class="command-shortcut">⌘C</span></button>
  <button class="dropdown-item"><span>Paste</span><span class="command-shortcut">⌘V</span></button>
</div>`,
        }],
      },
      {
        title: "With destructive",
        examples: [{
          html: `<div class="dropdown" style="position:relative;display:inline-block;min-width:180px">
  <button class="dropdown-item">Edit profile</button>
  <button class="dropdown-item">Settings</button>
  <div class="dropdown-sep"></div>
  <button class="dropdown-item" style="color:hsl(0 84% 60%)">Delete account</button>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "icon",
    name: "Icons",
    description: "Lucide-style outline. 1.75 stroke width, rounded caps. Inherits currentColor, so the same icon adapts to any context: set the color on the parent.",
    category: "Atoms",
    sections: [
      {
        title: "Sizing convention",
        examples: [{
          full: true,
          html: `<div style="display:grid;grid-template-columns:auto 1fr;gap:0.5rem 1rem;align-items:center;font-size:13px">
  <code style="font-size:11px;color:hsl(var(--muted-foreground))">12px</code><span style="color:hsl(var(--muted-foreground))">Inline text</span>
  <code style="font-size:11px;color:hsl(var(--muted-foreground))">13px</code><span style="color:hsl(var(--muted-foreground))">Small buttons (btn-sm)</span>
  <code style="font-size:11px;color:hsl(var(--muted-foreground))">14px</code><span style="color:hsl(var(--muted-foreground))">Default buttons</span>
  <code style="font-size:11px;color:hsl(var(--muted-foreground))">16px</code><span style="color:hsl(var(--muted-foreground))">Section headers, sidebar items</span>
  <code style="font-size:11px;color:hsl(var(--muted-foreground))">20px</code><span style="color:hsl(var(--muted-foreground))">Page-header titles</span>
  <code style="font-size:11px;color:hsl(var(--muted-foreground))">24px</code><span style="color:hsl(var(--muted-foreground))">Empty-state illustrations</span>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "input-group",
    name: "Input Groups",
    description: "Inputs with leading/trailing addons, currency, action buttons.",
    category: "Atoms",
    sections: [
      {
        title: "Leading addon",
        examples: [{
          html: `<div class="input-group" style="max-width:320px">
  <span class="input-addon">https://</span>
  <input class="input" placeholder="example.com" />
</div>`,
        }],
      },
      {
        title: "Trailing addon",
        examples: [{
          html: `<div class="input-group" style="max-width:320px">
  <input class="input" placeholder="0.00" />
  <span class="input-addon">USD</span>
</div>`,
        }],
      },
      {
        title: "With icon",
        columns: 2,
        examples: [
          {
            label: "Search",
            html: `<div class="input-with-icon"><input class="input" style="padding-left:2rem" placeholder="Quick search..." /><div class="input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div></div>`,
          },
          {
            label: "Email",
            html: `<div class="input-with-icon"><input class="input" style="padding-left:2rem" placeholder="you@example.com" /><div class="input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></div></div>`,
          },
        ],
      },
      {
        title: "Currency",
        examples: [{
          html: `<div class="input-group" style="max-width:320px">
  <span class="input-addon">$</span>
  <input class="input" type="number" value="49.99" style="font-family:var(--font-mono)" />
  <span class="input-addon">USD</span>
</div>`,
        }],
      },
      {
        title: "With action button",
        examples: [{
          html: `<div class="input-group" style="max-width:400px">
  <input class="input" type="password" value="sk_live_abc123def456" style="font-family:var(--font-mono);font-size:12px" />
  <button class="btn btn-outline btn-sm" style="border-top-left-radius:0;border-bottom-left-radius:0;border-left:0">Copy</button>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "input",
    name: "Inputs & Forms",
    description: "One <code>.input</code> primitive drives text inputs, selects, textareas, and the search field. Every form composes <code>.label</code> + control + <code>.field-helper</code> in that order.",
    category: "Atoms",
    sections: [
      {
        title: "Anatomy",
        anatomy: "Label . 6px gap . Control . 6px gap . Helper text. Every form field follows this rhythm.",
        examples: [{
          html: `<div style="max-width:320px">
  <label class="label">Email</label>
  <input class="input" placeholder="ada@acme.dev" />
  <p class="field-helper">We'll never share your email.</p>
</div>`,
        }],
      },
      {
        title: "Variants",
        columns: 2,
        examples: [
          {
            label: "Text input",
            html: `<input class="input" placeholder="Placeholder text" />`,
          },
          {
            label: "With leading icon",
            html: `<div class="input-with-icon"><input class="input" style="padding-left:2rem" placeholder="Search identities…" /><div class="input-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div></div>`,
          },
          {
            label: "Select",
            html: `<select class="input"><option>Active</option><option>Inactive</option></select>`,
          },
          {
            label: "Textarea",
            html: `<textarea class="input" placeholder="Describe the change..." style="min-height:80px"></textarea>`,
          },
          {
            label: "Number",
            html: `<input class="input" type="number" value="1024" />`,
          },
          {
            label: "Disabled",
            html: `<input class="input" value="System managed" disabled />`,
          },
        ],
      },
      {
        title: "Checkboxes & radios",
        description: "Native controls inherit the accent via accent-color. No custom styling: the OS chrome is the design.",
        columns: 2,
        examples: [
          {
            label: "Checkboxes",
            html: `<div style="display:flex;flex-direction:column;gap:0.5rem;font-size:13px">
  <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" checked style="accent-color:hsl(var(--primary))"> Active identities only</label>
  <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" style="accent-color:hsl(var(--primary))"> Include archived</label>
  <label style="display:flex;align-items:center;gap:0.5rem"><input type="checkbox" disabled style="accent-color:hsl(var(--primary))"> Cannot toggle</label>
</div>`,
          },
          {
            label: "Radio group",
            html: `<div style="display:flex;flex-direction:column;gap:0.5rem;font-size:13px">
  <label style="display:flex;align-items:center;gap:0.5rem"><input type="radio" name="r1" checked style="accent-color:hsl(var(--primary))"> Send recovery email</label>
  <label style="display:flex;align-items:center;gap:0.5rem"><input type="radio" name="r1" style="accent-color:hsl(var(--primary))"> Generate temp password</label>
  <label style="display:flex;align-items:center;gap:0.5rem"><input type="radio" name="r1" style="accent-color:hsl(var(--primary))"> Magic link</label>
</div>`,
          },
        ],
      },
      {
        title: "Validation",
        description: "Errors are red-bordered + replace the helper text. The validation message replaces, never appends: keep the layout calm.",
        columns: 2,
        examples: [
          {
            html: `<div>
  <label class="label">Email <span style="color:hsl(0 84% 60%)">*</span></label>
  <input class="input" value="not-an-email" style="border-color:hsl(0 84% 60%)" />
  <p class="field-helper" style="color:hsl(0 84% 60%)">Must be a valid email address.</p>
</div>`,
          },
          {
            html: `<div>
  <label class="label">Password</label>
  <input class="input" type="password" value="correcthorse" />
  <p class="field-helper">12+ chars, one number, one symbol.</p>
</div>`,
          },
        ],
      },
      {
        title: "Real form (create-identity)",
        examples: [{
          full: true,
          html: `<div class="card" style="max-width:560px;padding:1.25rem">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
    <div><label class="label">First name</label><input class="input" placeholder="Ada" /></div>
    <div><label class="label">Last name</label><input class="input" placeholder="King" /></div>
  </div>
  <div style="margin-top:0.75rem"><label class="label">Email</label><input class="input" placeholder="ada.king@example.com" /></div>
  <div style="margin-top:0.75rem"><label class="label">Role</label><select class="input"><option>engineer</option><option>designer</option><option>principal</option></select></div>
  <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1.25rem">
    <button class="btn btn-outline btn-sm">Cancel</button>
    <button class="btn btn-default btn-sm">Create identity</button>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "pagination",
    name: "Pagination",
    description: "Page-of-N navigation for tables and lists.",
    category: "Atoms",
    sections: [
      {
        title: "Compact (used in DataTable)",
        anatomy: "Showing X of Y + Previous / Next buttons. The default everywhere in Canvas.",
        examples: [{
          html: `<div style="display:flex;align-items:center;gap:1rem;font-size:13px;color:hsl(var(--muted-foreground))">
  <span>Showing 1&ndash;10 of 142</span>
  <div style="display:flex;gap:0.25rem">
    <button class="btn btn-outline btn-sm" disabled>&laquo; Previous</button>
    <button class="btn btn-outline btn-sm">Next &raquo;</button>
  </div>
</div>`,
        }],
      },
      {
        title: "Numbered",
        anatomy: "Use when the user benefits from knowing absolute page count (e.g. paginated search results).",
        examples: [{
          html: `<nav class="pagination">
  <button class="page-btn" disabled>&laquo;</button>
  <button class="page-btn active">1</button>
  <button class="page-btn">2</button>
  <button class="page-btn">3</button>
  <span class="page-ellipsis">...</span>
  <button class="page-btn">12</button>
  <button class="page-btn">&raquo;</button>
</nav>`,
        }],
      },
      {
        title: "With page size selector",
        examples: [{
          full: true,
          html: `<div style="display:flex;align-items:center;justify-content:space-between;font-size:13px;color:hsl(var(--muted-foreground))">
  <div style="display:flex;align-items:center;gap:0.5rem">
    <span>Rows per page</span>
    <select class="input" style="width:auto;padding:0.25rem 0.5rem;font-size:12px"><option>10</option><option>25</option><option selected>50</option><option>100</option></select>
  </div>
  <div style="display:flex;align-items:center;gap:1rem">
    <span>Showing 1–50 of 142</span>
    <div style="display:flex;gap:0.25rem">
      <button class="btn btn-outline btn-sm" disabled>&laquo; Previous</button>
      <button class="btn btn-outline btn-sm">Next &raquo;</button>
    </div>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "radio",
    name: "Radios",
    description: "Single-pick selection: stacked, inline, card-style.",
    category: "Atoms",
    sections: [
      {
        title: "Stacked",
        anatomy: "Vertical column of label + description rows. Native input with accent-color.",
        examples: [{
          full: true,
          html: `<fieldset style="border:0;margin:0;padding:0;max-width:400px">
  <legend style="font-size:14px;font-weight:600;margin-bottom:0.75rem">Plan</legend>
  <div style="display:flex;flex-direction:column;gap:0.75rem">
    <label style="display:flex;gap:0.5rem;cursor:pointer">
      <input type="radio" name="plan2" checked style="accent-color:hsl(var(--primary));margin-top:3px">
      <div>
        <div style="font-size:13px;font-weight:500">Hobby</div>
        <div style="font-size:12px;color:hsl(var(--muted-foreground))">Get started for free with up to 3 projects.</div>
      </div>
    </label>
    <label style="display:flex;gap:0.5rem;cursor:pointer">
      <input type="radio" name="plan2" style="accent-color:hsl(var(--primary));margin-top:3px">
      <div>
        <div style="font-size:13px;font-weight:500">Freelancer</div>
        <div style="font-size:12px;color:hsl(var(--muted-foreground))">Unlimited projects + invoicing for one person.</div>
      </div>
    </label>
    <label style="display:flex;gap:0.5rem;cursor:pointer">
      <input type="radio" name="plan2" style="accent-color:hsl(var(--primary));margin-top:3px">
      <div>
        <div style="font-size:13px;font-weight:500">Startup</div>
        <div style="font-size:12px;color:hsl(var(--muted-foreground))">Up to 25 users + audit log.</div>
      </div>
    </label>
    <label style="display:flex;gap:0.5rem;cursor:pointer;opacity:0.5">
      <input type="radio" name="plan2" disabled style="accent-color:hsl(var(--primary));margin-top:3px">
      <div>
        <div style="font-size:13px;font-weight:500">Enterprise</div>
        <div style="font-size:12px;color:hsl(var(--muted-foreground))">Unlimited everything.</div>
      </div>
    </label>
  </div>
</fieldset>`,
        }],
      },
      {
        title: "Card-style",
        anatomy: "The whole card is the trigger. Selected card gets a primary border + tinted background.",
        examples: [{
          full: true,
          html: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;max-width:480px">
  <label style="display:flex;flex-direction:column;padding:1rem;border:1px solid hsl(var(--border));border-radius:8px;cursor:pointer">
    <input type="radio" name="plan3" style="accent-color:hsl(var(--primary));margin-bottom:8px">
    <span style="font-weight:600;font-size:13px">Hobby</span>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">Free forever</span>
  </label>
  <label style="display:flex;flex-direction:column;padding:1rem;border:2px solid hsl(var(--primary));border-radius:8px;background:hsl(var(--primary) / 0.05);cursor:pointer">
    <input type="radio" name="plan3" checked style="accent-color:hsl(var(--primary));margin-bottom:8px">
    <span style="font-weight:600;font-size:13px">Pro</span>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">$12/mo per user</span>
  </label>
  <label style="display:flex;flex-direction:column;padding:1rem;border:1px solid hsl(var(--border));border-radius:8px;cursor:pointer">
    <input type="radio" name="plan3" style="accent-color:hsl(var(--primary));margin-bottom:8px">
    <span style="font-weight:600;font-size:13px">Enterprise</span>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">Contact us</span>
  </label>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "select",
    name: "Selects",
    description: "Native select restyled to match Canvas inputs.",
    category: "Atoms",
    sections: [
      {
        title: "Variants",
        anatomy: "Native HTML select with the .input class. The OS chevron remains for accessibility.",
        columns: 2,
        examples: [
          {
            label: "Country",
            html: `<div><label class="label">Country</label><select class="input"><option>United States</option><option>Canada</option><option>Mexico</option><option>United Kingdom</option></select></div>`,
          },
          {
            label: "Currency",
            html: `<div><label class="label">Currency</label><select class="input"><option>USD - US Dollar</option><option>EUR - Euro</option><option>GBP - Pound Sterling</option><option>JPY - Yen</option></select></div>`,
          },
          {
            label: "Small size",
            html: `<div><label class="label">Size</label><select class="input" style="height:32px;font-size:12px"><option>Small</option><option>Medium</option><option>Large</option></select></div>`,
          },
          {
            label: "Disabled",
            html: `<div><label class="label">Disabled</label><select class="input" disabled><option>Pick one&hellip;</option></select></div>`,
          },
        ],
      },
      {
        title: "Inline",
        anatomy: "Use a select in a toolbar without a separate label. Keep the height to 32px (h-8).",
        examples: [{
          html: `<div style="display:flex;align-items:center;gap:0.5rem">
  <span style="font-size:13px;color:hsl(var(--muted-foreground))">Show:</span>
  <select class="input" style="width:140px;height:32px;font-size:12px"><option>All</option><option>Active only</option><option>Archived</option></select>
  <span style="font-size:13px;color:hsl(var(--muted-foreground))">Sort by:</span>
  <select class="input" style="width:140px;height:32px;font-size:12px"><option>Most recent</option><option>Oldest</option><option>Alphabetical</option></select>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "skeleton",
    name: "Skeletons",
    description: "Placeholders for loading content.",
    category: "Atoms",
    sections: [
      {
        title: "Shapes",
        anatomy: "Plain divs with bg-muted + animate-pulse. Sized to mimic the real content.",
        examples: [{
          html: `<div style="display:flex;gap:1.5rem;align-items:center">
  <div class="skeleton skeleton-circle" style="width:2.5rem;height:2.5rem"></div>
  <div style="display:flex;flex-direction:column;gap:0.5rem;flex:1">
    <div class="skeleton skeleton-text" style="width:60%"></div>
    <div class="skeleton skeleton-text" style="width:40%"></div>
  </div>
</div>`,
        }],
      },
      {
        title: "Stacked list row",
        anatomy: "One row of an avatar + two-line content + trailing meta.",
        examples: [{
          full: true,
          html: `<div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
  <div style="display:flex;gap:0.75rem;align-items:center">
    <div class="skeleton skeleton-circle" style="width:2rem;height:2rem"></div>
    <div style="flex:1"><div class="skeleton skeleton-text" style="width:70%;margin-bottom:6px"></div><div class="skeleton skeleton-text" style="width:50%"></div></div>
    <div class="skeleton skeleton-text" style="width:40px"></div>
  </div>
  <div style="display:flex;gap:0.75rem;align-items:center">
    <div class="skeleton skeleton-circle" style="width:2rem;height:2rem"></div>
    <div style="flex:1"><div class="skeleton skeleton-text" style="width:55%;margin-bottom:6px"></div><div class="skeleton skeleton-text" style="width:35%"></div></div>
    <div class="skeleton skeleton-text" style="width:40px"></div>
  </div>
</div>`,
        }],
      },
      {
        title: "Stat card placeholder",
        examples: [{
          html: `<div class="card" style="max-width:320px;padding:1.25rem">
  <div class="skeleton skeleton-text" style="width:40%;margin-bottom:0.75rem"></div>
  <div class="skeleton skeleton-text" style="width:60%;height:24px;margin-bottom:0.5rem"></div>
  <div class="skeleton skeleton-text" style="width:30%"></div>
</div>`,
        }],
      },
      {
        title: "Table placeholder",
        examples: [{
          full: true,
          html: `<div style="max-width:560px">
  <div style="display:grid;grid-template-columns:40px 1fr 1fr 80px;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid hsl(var(--border))">
    <div class="skeleton skeleton-text" style="width:100%"></div>
    <div class="skeleton skeleton-text" style="width:70%"></div>
    <div class="skeleton skeleton-text" style="width:50%"></div>
    <div class="skeleton skeleton-text" style="width:100%"></div>
  </div>
  <div style="display:grid;grid-template-columns:40px 1fr 1fr 80px;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid hsl(var(--border))">
    <div class="skeleton skeleton-text" style="width:100%"></div>
    <div class="skeleton skeleton-text" style="width:80%"></div>
    <div class="skeleton skeleton-text" style="width:60%"></div>
    <div class="skeleton skeleton-text" style="width:100%"></div>
  </div>
  <div style="display:grid;grid-template-columns:40px 1fr 1fr 80px;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid hsl(var(--border))">
    <div class="skeleton skeleton-text" style="width:100%"></div>
    <div class="skeleton skeleton-text" style="width:65%"></div>
    <div class="skeleton skeleton-text" style="width:45%"></div>
    <div class="skeleton skeleton-text" style="width:100%"></div>
  </div>
  <div style="display:grid;grid-template-columns:40px 1fr 1fr 80px;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid hsl(var(--border))">
    <div class="skeleton skeleton-text" style="width:100%"></div>
    <div class="skeleton skeleton-text" style="width:75%"></div>
    <div class="skeleton skeleton-text" style="width:55%"></div>
    <div class="skeleton skeleton-text" style="width:100%"></div>
  </div>
  <div style="display:grid;grid-template-columns:40px 1fr 1fr 80px;gap:0.75rem;padding:0.75rem 0">
    <div class="skeleton skeleton-text" style="width:100%"></div>
    <div class="skeleton skeleton-text" style="width:60%"></div>
    <div class="skeleton skeleton-text" style="width:40%"></div>
    <div class="skeleton skeleton-text" style="width:100%"></div>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "textarea",
    name: "Textareas",
    description: "Multi-line input, with character count, with toolbar.",
    category: "Atoms",
    sections: [
      {
        title: "Basic",
        anatomy: "<code>textarea.input</code> with min-height. Resize vertical only.",
        examples: [{
          full: true,
          html: `<div style="max-width:560px">
  <label class="label">Description</label>
  <textarea class="input" placeholder="A few words about this project…" style="min-height:80px;resize:vertical"></textarea>
  <p class="field-helper">Plain text only. Markdown not supported.</p>
</div>`,
        }],
      },
      {
        title: "With character count",
        anatomy: "Trailing counter turns red once max is exceeded.",
        examples: [{
          full: true,
          html: `<div style="max-width:560px">
  <label class="label">Bio</label>
  <textarea class="input" placeholder="Tell us about yourself…" style="min-height:80px;resize:vertical"></textarea>
  <div style="display:flex;justify-content:flex-end;margin-top:4px"><span style="font-size:11px;color:hsl(var(--muted-foreground))">0 / 280</span></div>
</div>`,
        }],
      },
      {
        title: "With toolbar",
        anatomy: "A simple toolbar above the textarea: usually formatting controls or an attach button.",
        examples: [{
          full: true,
          html: `<div style="max-width:560px;border:1px solid hsl(var(--border));border-radius:var(--radius-md,8px);overflow:hidden">
  <div style="display:flex;align-items:center;gap:0.25rem;padding:0.5rem 0.75rem;border-bottom:1px solid hsl(var(--border));background:hsl(var(--muted) / 0.3)">
    <button class="btn btn-ghost btn-sm" style="font-weight:700;min-width:32px">B</button>
    <button class="btn btn-ghost btn-sm" style="font-style:italic;min-width:32px">I</button>
    <button class="btn btn-ghost btn-sm" style="font-family:var(--font-mono);font-size:11px;min-width:32px">&lt;/&gt;</button>
    <div class="sep-v" style="height:1rem;margin:0 0.25rem"></div>
    <button class="btn btn-ghost btn-sm">Comment</button>
  </div>
  <textarea class="input" placeholder="Leave a comment…" style="min-height:80px;border:0;border-radius:0;resize:vertical"></textarea>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "switch",
    name: "Toggles",
    description: "On / off switch, isolated or grouped in a settings list.",
    category: "Atoms",
    sections: [
      {
        title: "Variants",
        anatomy: "44px wide, 24px tall pill. Thumb is 20px. Track switches between bg-muted and bg-primary.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:320px;padding:1.25rem">
  <div style="display:flex;flex-direction:column;gap:1rem">
    <div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:13px">Available to chat</span><input type="checkbox" role="switch" class="switch" checked /></div>
    <div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:13px">Public profile</span><input type="checkbox" role="switch" class="switch" /></div>
    <div style="display:flex;align-items:center;justify-content:space-between;opacity:0.5"><span style="font-size:13px">Disabled (off)</span><input type="checkbox" role="switch" class="switch" disabled /></div>
    <div style="display:flex;align-items:center;justify-content:space-between;opacity:0.5"><span style="font-size:13px">Disabled (on)</span><input type="checkbox" role="switch" class="switch" checked disabled /></div>
  </div>
</div>`,
        }],
      },
      {
        title: "With description",
        anatomy: "Settings rows: label + description on the left, toggle on the right.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:560px;padding:1.25rem">
  <div style="display:flex;flex-direction:column;gap:1rem">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">
      <div><div style="font-size:13px;font-weight:500">Email notifications</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">Get notified about activity on your account.</div></div>
      <input type="checkbox" role="switch" class="switch" checked />
    </div>
    <hr class="sep" />
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">
      <div><div style="font-size:13px;font-weight:500">Marketing emails</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">Receive emails about new products, features, and more.</div></div>
      <input type="checkbox" role="switch" class="switch" />
    </div>
    <hr class="sep" />
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">
      <div><div style="font-size:13px;font-weight:500">Push notifications</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">Get push notifications in-app when you receive new activity.</div></div>
      <input type="checkbox" role="switch" class="switch" checked />
    </div>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "tooltip",
    name: "Tooltips",
    description: "Small floating helper text on hover or focus.",
    category: "Atoms",
    sections: [
      {
        title: "Sides",
        anatomy: "Bottom of foreground color, foreground-inverted text. Use sparingly: only when the label can't fit in the trigger.",
        examples: [{
          html: `<div style="display:flex;gap:2rem;padding:1rem">
  <div class="tooltip" style="position:relative">Tooltip top<span class="tooltip-arrow bottom"></span></div>
  <div class="tooltip" style="position:relative">Tooltip bottom<span class="tooltip-arrow top"></span></div>
</div>`,
        }],
      },
      {
        title: "On icon buttons",
        examples: [{
          html: `<div style="display:flex;gap:0.5rem">
  <button class="btn btn-ghost btn-icon" title="Settings">&oast;</button>
  <button class="btn btn-ghost btn-icon" title="Notifications">&bell;</button>
</div>`,
        }],
      },
      {
        title: "Helper text on inputs",
        examples: [{
          full: true,
          html: `<div style="max-width:320px">
  <div class="form-group">
    <label class="label" style="display:flex;align-items:center;gap:4px">API Key <span class="tooltip" style="position:relative;cursor:help;font-size:11px;padding:2px 6px">?<span class="tooltip-arrow bottom"></span></span></label>
    <input class="input" placeholder="sk_live_..." />
    <span class="field-helper">Found in your dashboard under Settings &rarr; API.</span>
  </div>
</div>`,
        }],
      },
    ],
  },

  // ─── Molecules ────────────────────────────────────────────────────────

  {
    slug: "alert",
    name: "Alerts",
    description: "Inline messages: info, success, warning, error.",
    category: "Molecules",
    sections: [
      {
        title: "Variants",
        anatomy: "Tinted background + matching border + icon + content. Use sparingly: the page should not be full of alerts.",
        examples: [{
          full: true,
          html: `<div style="display:flex;flex-direction:column;gap:0.75rem;max-width:560px">
  <div class="alert alert-info"><div><div class="alert-title">Heads up</div><div class="alert-desc">Maintenance window scheduled for Sunday 2:00 UTC.</div></div></div>
  <div class="alert alert-success"><div><div class="alert-title">All set</div><div class="alert-desc">Your changes have been saved successfully.</div></div></div>
  <div class="alert alert-warning"><div><div class="alert-title">Action required</div><div class="alert-desc">Your trial expires in 3 days.</div></div></div>
  <div class="alert alert-destructive"><div><div class="alert-title">Something went wrong</div><div class="alert-desc">Could not save your changes. Please try again.</div></div></div>
</div>`,
        }],
      },
      {
        title: "With actions",
        examples: [{
          full: true,
          html: `<div style="max-width:560px">
  <div class="alert alert-warning">
    <div>
      <div class="alert-title">Your account is approaching the user limit</div>
      <div class="alert-desc">You have 9/10 seats in use. Upgrade to add more.</div>
      <div style="display:flex;gap:0.5rem;margin-top:0.75rem">
        <button class="btn btn-sm btn-default">Upgrade plan</button>
        <button class="btn btn-ghost btn-sm">Dismiss</button>
      </div>
    </div>
  </div>
</div>`,
        }],
      },
      {
        title: "Banner (full-width)",
        anatomy: "Top of page; for system-wide announcements. No rounded corners, no shadow.",
        examples: [{
          full: true,
          html: `<div style="display:flex;align-items:center;justify-content:center;gap:0.75rem;padding:0.625rem 1rem;background:hsl(var(--foreground));color:hsl(var(--background));font-size:13px">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  <span>We've shipped a new dashboard. <a href="#" style="color:inherit;text-decoration:underline">See what's new &rarr;</a></span>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "card",
    name: "Cards",
    description: "Three families. <code>StatCard</code> = a single metric, big number + delta. <code>SectionCard</code> = a labeled content surface with optional header and divider. Generic <code>.card</code> = bring your own structure.",
    category: "Molecules",
    sections: [
      {
        title: "StatCard variants",
        description: "Five icon tones. Pick by what the metric means: success for healthy, destructive for problems, etc.",
        columns: 3,
        examples: [
          {
            label: "Default (blue)",
            html: `<div class="stat-card"><div class="stat-card-row"><div><div class="stat-card-label">Active identities</div><div class="stat-card-value">12,348</div><div style="font-size:11px;color:hsl(var(--muted-foreground));margin-top:2px">+142 today</div></div><div class="stat-card-icon blue">U</div></div></div>`,
          },
          {
            label: "Success",
            html: `<div class="stat-card"><div class="stat-card-row"><div><div class="stat-card-label">Active sessions</div><div class="stat-card-value">1,204</div><div style="font-size:11px;color:hsl(var(--muted-foreground));margin-top:2px">+8% vs yesterday</div></div><div class="stat-card-icon success">S</div></div></div>`,
          },
          {
            label: "Purple",
            html: `<div class="stat-card"><div class="stat-card-row"><div><div class="stat-card-label">OAuth2 clients</div><div class="stat-card-value">38</div><div style="font-size:11px;color:hsl(var(--muted-foreground));margin-top:2px">6 M2M &middot; 32 user</div></div><div class="stat-card-icon purple">O</div></div></div>`,
          },
          {
            label: "Destructive",
            html: `<div class="stat-card"><div class="stat-card-row"><div><div class="stat-card-label">Locked accounts</div><div class="stat-card-value">6</div><div style="font-size:11px;color:hsl(var(--muted-foreground));margin-top:2px">&darr; 2 since 1h ago</div></div><div class="stat-card-icon destructive">!</div></div></div>`,
          },
          {
            label: "Amber",
            html: `<div class="stat-card"><div class="stat-card-row"><div><div class="stat-card-label">Token errors</div><div class="stat-card-value">0.21%</div><div style="font-size:11px;color:hsl(var(--muted-foreground));margin-top:2px">last 60m</div></div><div class="stat-card-icon amber">T</div></div></div>`,
          },
          {
            label: "No icon",
            html: `<div class="stat-card"><div class="stat-card-row"><div><div class="stat-card-label">Avg latency</div><div class="stat-card-value">42ms</div><div style="font-size:11px;color:hsl(var(--muted-foreground));margin-top:2px">p95 last hour</div></div></div></div>`,
          },
        ],
      },
      {
        title: "SectionCard",
        description: "Labeled block with optional title row + divider. Action slot on the right. Use for any module of content larger than a few lines.",
        anatomy: "Header (title + actions) &middot; 1px divider &middot; body. The divider is what visually anchors the title: don't skip it.",
        columns: 2,
        examples: [
          {
            label: "With action button",
            html: `<div class="section-card">
  <div class="section-card-header"><h3 class="h4">Recent activity</h3><button class="btn btn-ghost btn-sm">View all</button></div>
  <div class="section-card-divider"></div>
  <div class="section-card-body" style="padding:0">
    <div style="padding:0.625rem 1rem;font-size:13px"><span style="font-weight:500">rachel.chen@example.com</span> <span style="color:hsl(var(--muted-foreground))">signed in</span></div>
    <div style="padding:0.625rem 1rem;font-size:13px;border-top:1px solid hsl(var(--border))"><span style="font-weight:500">rachel.chen@example.com</span> <span style="color:hsl(var(--muted-foreground))">revoked session</span></div>
  </div>
</div>`,
          },
          {
            label: "With fields",
            html: `<div class="section-card">
  <div class="section-card-header"><h3 class="h4">Account Details</h3></div>
  <div class="section-card-divider"></div>
  <div class="section-card-body" style="display:flex;flex-direction:column;gap:0.5rem">
    <div class="field"><span class="field-label">Email</span><span class="field-value">user@example.com</span></div>
    <div class="field"><span class="field-label">Role</span><span class="field-value">Admin</span></div>
    <div class="field"><span class="field-label">Status</span><span class="field-value"><span class="status-badge sb-success"><span class="dot"></span> Active</span></span></div>
  </div>
</div>`,
          },
          {
            label: "Title only",
            html: `<div class="section-card">
  <div class="section-card-header"><h3 class="h4">Quick stats</h3></div>
  <div class="section-card-divider"></div>
  <div class="section-card-body">
    <p class="body" style="margin:0">Content without an action button in the header.</p>
  </div>
</div>`,
          },
          {
            label: "No header",
            html: `<div class="section-card">
  <div class="section-card-body">
    <p class="body" style="margin:0">A section card with just a body. Useful as a simple content surface.</p>
  </div>
</div>`,
          },
        ],
      },
      {
        title: "Generic .card primitive",
        description: "When neither StatCard nor SectionCard fits, drop down to the base class.",
        examples: [{
          html: `<div class="card" style="max-width:400px;padding:1.5rem">
  <div style="font-size:15px;font-weight:600;margin-bottom:4px">Anything goes here</div>
  <p style="margin:0;font-size:13.5px;color:hsl(var(--muted-foreground))">The .card class gives you the surface + border + radius + shadow. You bring the content.</p>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "code-block",
    name: "Code Block",
    description: "Preformatted code block with monospace font and padding.",
    category: "Molecules",
    sections: [{
      title: "Default",
      examples: [{
        html: `<pre class="codeblock">const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");</pre>`,
      }],
    }],
  },

  {
    slug: "empty-state",
    name: "Empty States",
    description: "Centered, calm, never blame the user. Always tell them what could be here, and ideally how to get there.",
    category: "Molecules",
    sections: [
      {
        title: "Standard EmptyState",
        description: "Icon disc, title, description. Used inside SectionCard or as a cell colspan in tables.",
        anatomy: "Round muted icon container (48x48) . 12px gap . semibold 15px title . 13px muted description.",
        examples: [{
          html: `<div class="empty-card">
  <div class="title">No results found</div>
  <p>Try adjusting your search filters.</p>
</div>`,
        }],
      },
      {
        title: "Inside a table",
        description: "When a query has no results, the empty state spans all columns.",
        examples: [{
          full: true,
          html: `<div class="dt-wrap">
  <table class="dt-table">
    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td colspan="4" style="padding:3rem 1rem">
        <div class="empty-card">
          <div class="title">No results</div>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      </td></tr>
    </tbody>
  </table>
</div>`,
        }],
      },
      {
        title: "With a single action",
        description: "If the user can do something about it, put one button.",
        examples: [{
          html: `<div class="empty-card">
  <div class="title">No identities yet</div>
  <p>Create your first identity to get started.</p>
  <button class="btn btn-default btn-sm" style="margin-top:1rem">Create identity</button>
</div>`,
        }],
      },
      {
        title: "Success-flavored ('all clear')",
        description: "When emptiness is good: no lockouts, no errors, no pending work.",
        examples: [{
          html: `<div class="empty-card">
  <div style="width:48px;height:48px;border-radius:50%;background:hsl(143 70% 45% / 0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(143 60% 38%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
  </div>
  <div class="title">All clear</div>
  <p>No locked accounts or pending reviews.</p>
</div>`,
        }],
      },
      {
        title: "Variants by icon",
        columns: 3,
        examples: [
          {
            label: "Users",
            html: `<div class="empty-card"><div class="title">No users</div><p>Invite your first team member.</p></div>`,
          },
          {
            label: "Search",
            html: `<div class="empty-card"><div class="title">No results</div><p>Try a different query.</p></div>`,
          },
          {
            label: "Files",
            html: `<div class="empty-card"><div class="title">No files</div><p>Upload or drag files here.</p></div>`,
          },
          {
            label: "Activity",
            html: `<div class="empty-card"><div class="title">No activity</div><p>Events will appear as they happen.</p></div>`,
          },
          {
            label: "Notifications",
            html: `<div class="empty-card"><div class="title">All caught up</div><p>No new notifications.</p></div>`,
          },
          {
            label: "Errors",
            html: `<div class="empty-card"><div class="title">No errors</div><p>Everything is running smoothly.</p></div>`,
          },
        ],
      },
    ],
  },

  {
    slug: "field",
    name: "Field Display",
    description: "Read-only key/value pairs. Used in detail views, modal previews, and audit screens. Optional mono mode for IDs, tokens, dates.",
    category: "Molecules",
    sections: [
      {
        title: "Basic",
        anatomy: "180px label column . 16px gap . value column. Aligns multiple fields to the same baseline for scanning.",
        examples: [{
          full: true,
          html: `<div style="display:flex;flex-direction:column;gap:0.75rem;max-width:400px">
  <div class="field"><span class="field-label">User ID</span><span class="field-value mono">usr_abc123</span></div>
  <div class="field"><span class="field-label">Name</span><span class="field-value">Rachel Chen</span></div>
  <div class="field"><span class="field-label">Role</span><span class="field-value">Admin</span></div>
  <div class="field"><span class="field-label">Status</span><span class="field-value"><span class="status-badge sb-success"><span class="dot"></span> Active</span></span></div>
</div>`,
        }],
      },
      {
        title: "Mono values",
        description: "Pass mono to use the JetBrains font for IDs, hashes, timestamps: anything copy-able.",
        examples: [{
          full: true,
          html: `<div style="display:flex;flex-direction:column;gap:0.75rem;max-width:400px">
  <div class="field"><span class="field-label">Client ID</span><span class="field-value mono">clt_8f2a9b4c7e1d</span></div>
  <div class="field"><span class="field-label">Created</span><span class="field-value mono">2026-05-24T14:32:00Z</span></div>
  <div class="field"><span class="field-label">Fingerprint</span><span class="field-value mono">sha256:xK9v...</span></div>
</div>`,
        }],
      },
      {
        title: "Composed values",
        description: "value can be any React node: a badge, a button, a small layout.",
        examples: [{
          full: true,
          html: `<div style="display:flex;flex-direction:column;gap:0.75rem;max-width:400px">
  <div class="field"><span class="field-label">Status</span><span class="field-value"><span class="status-badge sb-success"><span class="dot"></span> Active</span></span></div>
  <div class="field"><span class="field-label">Plan</span><span class="field-value"><span class="badge badge-secondary">Pro</span></span></div>
  <div class="field"><span class="field-label">Token</span><span class="field-value mono" style="display:flex;align-items:center;gap:0.5rem">sk_live_a8f2...c9e1 <button class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:11px">Copy</button></span></div>
  <div class="field"><span class="field-label">Members</span><span class="field-value" style="display:flex;gap:0.25rem"><span class="avatar avatar-sm">RC</span><span class="avatar avatar-sm">AJ</span><span class="avatar avatar-sm">+3</span></span></div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "form",
    name: "Form Layouts",
    description: "Stacked, two-column, with sidebar description.",
    category: "Molecules",
    sections: [
      {
        title: "Stacked",
        anatomy: "Single column, label above input. Easiest to scan, best for short forms and forms on mobile.",
        examples: [{
          full: true,
          html: `<div style="max-width:360px">
  <div class="form-group"><label class="label">Email</label><input class="input" type="email" placeholder="you@example.com" /></div>
  <div class="form-group"><label class="label">Password</label><input class="input" type="password" /></div>
  <div class="form-actions"><button class="btn btn-default" style="width:100%">Sign in</button></div>
</div>`,
        }],
      },
      {
        title: "Two-column",
        anatomy: "Use when adjacent fields are related (first/last name, city/state). Stacks to one column below sm.",
        examples: [{
          full: true,
          html: `<div style="max-width:560px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
    <div class="form-group"><label class="label">First name</label><input class="input" placeholder="Ada" /></div>
    <div class="form-group"><label class="label">Last name</label><input class="input" placeholder="King" /></div>
  </div>
  <div class="form-group"><label class="label">Email</label><input class="input" placeholder="ada@example.com" /></div>
  <div class="form-actions" style="justify-content:flex-end"><button class="btn btn-outline btn-sm">Cancel</button><button class="btn btn-default btn-sm">Create</button></div>
</div>`,
        }],
      },
      {
        title: "With sidebar description",
        anatomy: "Section headline + helper text on the left; the form fields on the right. Best for settings or long forms with multiple sections.",
        examples: [{
          full: true,
          html: `<div style="max-width:720px">
  <div style="display:grid;grid-template-columns:200px 1fr;gap:2rem;padding-bottom:1.5rem;border-bottom:1px solid hsl(var(--border))">
    <div>
      <div style="font-size:14px;font-weight:600">Personal info</div>
      <p style="margin:4px 0 0;font-size:12.5px;color:hsl(var(--muted-foreground))">This information will be displayed on your public profile.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      <div class="form-group"><label class="label">Full name</label><input class="input" value="Rachel Chen" /></div>
      <div class="form-group"><label class="label">Email</label><input class="input" value="rachel@example.com" /></div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:200px 1fr;gap:2rem;padding-top:1.5rem">
    <div>
      <div style="font-size:14px;font-weight:600">Notifications</div>
      <p style="margin:4px 0 0;font-size:12.5px;color:hsl(var(--muted-foreground))">Choose how you'd like to be notified.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      <label style="display:flex;align-items:center;gap:0.5rem;font-size:13px"><input type="checkbox" class="checkbox" checked /> Email notifications</label>
      <label style="display:flex;align-items:center;gap:0.5rem;font-size:13px"><input type="checkbox" class="checkbox" /> SMS alerts</label>
    </div>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "filter-panel",
    name: "Filter Panels",
    description: "Sidebar filter rail with chip pills for active filters.",
    category: "Organisms",
    sections: [
      {
        title: "Sidebar filter + chips",
        anatomy: "Left: categorical filters. Top: chip row showing active filters. Each chip is removable.",
        examples: [{
          full: true,
          html: `<div style="display:grid;grid-template-columns:200px 1fr;gap:1.5rem">
  <div class="filter-panel">
    <div class="filter-group">
      <span class="filter-group-label">Status</span>
      <div class="filter-group-content">
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:13px"><input type="checkbox" class="checkbox" checked /> Active</label>
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:13px"><input type="checkbox" class="checkbox" /> Pending</label>
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:13px"><input type="checkbox" class="checkbox" /> Archived</label>
      </div>
    </div>
    <div class="filter-group">
      <span class="filter-group-label">Schema</span>
      <div class="filter-group-content">
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:13px"><input type="checkbox" class="checkbox" checked /> Default</label>
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:13px"><input type="checkbox" class="checkbox" /> Custom</label>
      </div>
    </div>
    <div class="filter-group">
      <span class="filter-group-label">MFA</span>
      <div class="filter-group-content">
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:13px"><input type="checkbox" class="checkbox" /> Enabled</label>
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:13px"><input type="checkbox" class="checkbox" /> Disabled</label>
      </div>
    </div>
  </div>
  <div>
    <div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap">
      <span class="filter-chip active">Active &times;</span>
      <span class="filter-chip active">Default &times;</span>
    </div>
    <div style="font-size:13px;color:hsl(var(--muted-foreground))">Showing 24 of 142 identities</div>
  </div>
</div>`,
        }],
      },
      {
        title: "Inline filter bar",
        anatomy: "Compact horizontal filters: dropdowns above the table. Use when sidebar real estate is precious.",
        examples: [{
          full: true,
          html: `<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
  <button class="btn btn-outline btn-sm">Status <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
  <button class="btn btn-outline btn-sm">Role <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
  <button class="btn btn-outline btn-sm">Date range <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
  <button class="btn btn-ghost btn-sm" style="color:hsl(var(--primary))">+ Add filter</button>
</div>`,
        }],
      },
    ],
  },

  // ─── Organisms ────────────────────────────────────────────────────────

  {
    slug: "calendar",
    name: "Calendars",
    description: "Date picker, event list. Production: wrap react-day-picker.",
    category: "Organisms",
    sections: [
      {
        title: "Single date",
        anatomy: "Token-themed month grid. Selected day has primary background; today gets accent.",
        examples: [{
          html: `<div class="calendar">
  <div class="calendar-header">
    <button class="calendar-nav">&lt;</button>
    <span class="calendar-title">May 2026</span>
    <button class="calendar-nav">&gt;</button>
  </div>
  <div class="calendar-grid">
    <span class="calendar-head">Mo</span><span class="calendar-head">Tu</span><span class="calendar-head">We</span><span class="calendar-head">Th</span><span class="calendar-head">Fr</span><span class="calendar-head">Sa</span><span class="calendar-head">Su</span>
    <button class="calendar-cell outside">27</button><button class="calendar-cell outside">28</button><button class="calendar-cell outside">29</button><button class="calendar-cell outside">30</button><button class="calendar-cell">1</button><button class="calendar-cell">2</button><button class="calendar-cell">3</button>
    <button class="calendar-cell">4</button><button class="calendar-cell">5</button><button class="calendar-cell">6</button><button class="calendar-cell">7</button><button class="calendar-cell">8</button><button class="calendar-cell">9</button><button class="calendar-cell">10</button>
    <button class="calendar-cell">11</button><button class="calendar-cell">12</button><button class="calendar-cell">13</button><button class="calendar-cell">14</button><button class="calendar-cell">15</button><button class="calendar-cell">16</button><button class="calendar-cell">17</button>
    <button class="calendar-cell">18</button><button class="calendar-cell">19</button><button class="calendar-cell">20</button><button class="calendar-cell">21</button><button class="calendar-cell">22</button><button class="calendar-cell today">23</button><button class="calendar-cell selected">24</button>
    <button class="calendar-cell">25</button><button class="calendar-cell">26</button><button class="calendar-cell">27</button><button class="calendar-cell">28</button><button class="calendar-cell">29</button><button class="calendar-cell">30</button><button class="calendar-cell">31</button>
  </div>
</div>`,
        }],
      },
      {
        title: "With event list",
        anatomy: "Calendar on the left, day's events on the right.",
        examples: [{
          full: true,
          html: `<div style="display:grid;grid-template-columns:auto 1fr;gap:1.5rem;align-items:start">
  <div class="calendar">
    <div class="calendar-header">
      <button class="calendar-nav">&lt;</button>
      <span class="calendar-title">May 2026</span>
      <button class="calendar-nav">&gt;</button>
    </div>
    <div class="calendar-grid">
      <span class="calendar-head">Mo</span><span class="calendar-head">Tu</span><span class="calendar-head">We</span><span class="calendar-head">Th</span><span class="calendar-head">Fr</span><span class="calendar-head">Sa</span><span class="calendar-head">Su</span>
      <button class="calendar-cell outside">27</button><button class="calendar-cell outside">28</button><button class="calendar-cell outside">29</button><button class="calendar-cell outside">30</button><button class="calendar-cell">1</button><button class="calendar-cell">2</button><button class="calendar-cell">3</button>
      <button class="calendar-cell">4</button><button class="calendar-cell">5</button><button class="calendar-cell">6</button><button class="calendar-cell">7</button><button class="calendar-cell">8</button><button class="calendar-cell">9</button><button class="calendar-cell">10</button>
      <button class="calendar-cell">11</button><button class="calendar-cell">12</button><button class="calendar-cell">13</button><button class="calendar-cell">14</button><button class="calendar-cell">15</button><button class="calendar-cell">16</button><button class="calendar-cell">17</button>
      <button class="calendar-cell">18</button><button class="calendar-cell">19</button><button class="calendar-cell">20</button><button class="calendar-cell">21</button><button class="calendar-cell">22</button><button class="calendar-cell today">23</button><button class="calendar-cell selected">24</button>
      <button class="calendar-cell">25</button><button class="calendar-cell">26</button><button class="calendar-cell">27</button><button class="calendar-cell">28</button><button class="calendar-cell">29</button><button class="calendar-cell">30</button><button class="calendar-cell">31</button>
    </div>
  </div>
  <div class="section-card">
    <div class="section-card-header"><h3 class="h4">May 24</h3></div>
    <div class="section-card-divider"></div>
    <div class="section-card-body" style="padding:0">
      <div style="padding:0.625rem 1rem;font-size:13px;display:flex;justify-content:space-between;border-bottom:1px solid hsl(var(--border))"><span><span style="font-weight:500">Sprint planning</span></span><span style="color:hsl(var(--muted-foreground))">9:00 AM</span></div>
      <div style="padding:0.625rem 1rem;font-size:13px;display:flex;justify-content:space-between;border-bottom:1px solid hsl(var(--border))"><span><span style="font-weight:500">Design review</span></span><span style="color:hsl(var(--muted-foreground))">11:30 AM</span></div>
      <div style="padding:0.625rem 1rem;font-size:13px;display:flex;justify-content:space-between"><span><span style="font-weight:500">1:1 with manager</span></span><span style="color:hsl(var(--muted-foreground))">2:00 PM</span></div>
    </div>
  </div>
</div>`,
        }],
      },
      {
        title: "Production note",
        description: "In production, wrap <code>react-day-picker</code> (or your framework's equivalent) with Canvas token overrides. The examples on this page use a static HTML mock for illustration.",
        examples: [{
          full: true,
          html: `<div style="padding:1rem;border-radius:8px;background:hsl(var(--muted) / 0.4);border:1px solid hsl(var(--border));font-size:13px;color:hsl(var(--muted-foreground));line-height:1.6;max-width:560px">
  <span style="font-weight:600;color:hsl(var(--foreground))">Why not ship a full calendar?</span> Calendars need locale-aware date math, keyboard navigation, range selection, and accessibility: things a CSS-only system can't provide. Use <code>react-day-picker</code> or similar, then apply Canvas tokens for colors, radius, and typography.
</div>`,
        }],
      },
    ],
  },

  {
    slug: "command",
    name: "Command Palette",
    description: "Cmd+K search: navigation, actions, recent items.",
    category: "Organisms",
    sections: [
      {
        title: "Open it",
        anatomy: "Press &#x2318;K (or ctrl+K) anywhere. Click below to open it manually.",
        examples: [{
          html: `<button class="btn btn-outline btn-sm" style="display:flex;align-items:center;gap:0.5rem">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  Search...
  <kbd class="kbd" style="margin-left:auto">⌘K</kbd>
</button>`,
        }],
      },
      {
        title: "Anatomy",
        anatomy: "Centered overlay . 600px wide . search input + grouped results + footer with key hints.",
        examples: [{
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
        }],
      },
    ],
  },

  {
    slug: "data-table",
    name: "Data Tables",
    description: "Every table is the same composition: .dt-wrap &rarr; Toolbar &rarr; scrollable .dt-table &rarr; .dt-footer. Density tweaks affect padding live.",
    category: "Organisms",
    sections: [
      {
        title: "Anatomy",
        anatomy: "Toolbar (filters + bulk actions + count) . Header row (12px muted labels on tinted background) . Body rows (13px, clickable optional, hover background) . Footer (count + pagination)",
        examples: [{
          full: true,
          html: `<div class="dt-wrap">
  <div class="dt-toolbar">
    <input class="input" placeholder="Search users..." style="max-width:240px" />
    <div style="flex:1"></div>
    <button class="btn btn-outline btn-sm">Export</button>
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
        <tr class="clickable">
          <td>Rachel Chen</td>
          <td>rachel@example.com</td>
          <td>Admin</td>
          <td><span class="status-badge sb-success"><span class="dot"></span> Active</span></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="dt-footer">
    <span>Showing 1&ndash;3 of 142</span>
    <div style="display:flex;gap:0.25rem">
      <button class="btn btn-outline btn-sm" disabled>&laquo;</button>
      <button class="btn btn-outline btn-sm">&raquo;</button>
    </div>
  </div>
</div>`,
        }],
      },
      {
        title: "Toolbar variations",
        examples: [{
          full: true,
          html: `<div style="display:flex;flex-direction:column;gap:1rem">
  <div class="dt-toolbar">
    <input class="input" placeholder="Search..." style="max-width:200px" />
    <div style="flex:1"></div>
    <button class="btn btn-outline btn-sm">Export</button>
  </div>
  <div class="dt-toolbar">
    <input class="input" placeholder="Filter users..." style="max-width:200px" />
    <div style="flex:1"></div>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">3 selected</span>
    <button class="btn btn-outline btn-sm">Bulk edit</button>
    <button class="btn btn-destructive btn-sm">Delete</button>
  </div>
  <div class="dt-toolbar">
    <div style="display:flex;gap:0.5rem;align-items:center">
      <span style="font-size:12px;color:hsl(var(--muted-foreground))">Status:</span>
      <select class="input" style="height:32px;font-size:12px;width:120px"><option>All</option><option>Active</option></select>
    </div>
    <div style="flex:1"></div>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">142 results</span>
  </div>
</div>`,
        }],
      },
      {
        title: "States",
        columns: 2,
        examples: [
          {
            label: "Empty",
            html: `<div class="dt-wrap"><div class="dt-scroll"><table class="dt-table"><thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead><tbody><tr><td colspan="3" style="text-align:center;padding:2rem;color:hsl(var(--muted-foreground));font-size:13px">No results found.</td></tr></tbody></table></div></div>`,
          },
          {
            label: "Loading",
            html: `<div class="dt-wrap"><div class="dt-scroll"><table class="dt-table"><thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead><tbody><tr><td colspan="3" style="text-align:center;padding:2rem"><div style="display:inline-block;width:16px;height:16px;border:2px solid hsl(var(--muted));border-top-color:hsl(var(--primary));border-radius:50%;animation:spin 0.6s linear infinite"></div></td></tr></tbody></table></div></div>`,
          },
        ],
      },
    ],
  },

  {
    slug: "dialog",
    name: "Overlays",
    description: "Floating surfaces: drawers, modals, popovers, toasts.",
    category: "Organisms",
    sections: [
      {
        title: "Overview",
        description: "Overlay components share an elevated, blurred (in glass mode) surface, an explicit close affordance, and ESC-dismiss. They never block the rest of the app: non-destructive ones don't even darken the page.",
        columns: 2,
        examples: [
          {
            label: "SlideOver (drawer)",
            html: `<div style="position:relative;border:1px solid hsl(var(--border));border-radius:var(--radius-lg,12px);overflow:hidden;height:200px">
  <div class="sheet sheet-right" style="position:absolute;transform:none;animation:none;width:100%">
    <div class="sheet-header"><h2 class="sheet-title">Edit Identity</h2></div>
    <div class="sheet-body">
      <div class="form-group"><label class="label">Email</label><input class="input" value="user@example.com" /></div>
    </div>
  </div>
</div>`,
          },
          {
            label: "Confirm modal",
            html: `<div style="position:relative;border:1px solid hsl(var(--border));border-radius:var(--radius-lg,12px);padding:0">
  <div class="dialog" style="position:relative;transform:none;top:auto;left:auto;animation:none">
    <div class="dialog-header">
      <h2 class="dialog-title">Delete identity?</h2>
      <p class="dialog-desc">This cannot be undone.</p>
    </div>
    <div class="dialog-footer">
      <button class="btn btn-outline btn-sm">Cancel</button>
      <button class="btn btn-destructive btn-sm">Delete</button>
    </div>
  </div>
</div>`,
          },
          {
            label: "Toast",
            html: `<div class="toast" style="position:relative;animation:none">
  <div><div class="toast-title">Changes saved</div><div class="toast-desc">Your settings have been updated.</div></div>
  <button class="toast-close">&times;</button>
</div>`,
          },
          {
            label: "Row menu",
            html: `<div class="dropdown" style="position:relative;display:inline-block;min-width:160px">
  <button class="dropdown-item">Edit</button>
  <button class="dropdown-item">Duplicate</button>
  <div class="dropdown-sep"></div>
  <button class="dropdown-item" style="color:hsl(0 84% 60%)">Delete</button>
</div>`,
          },
        ],
      },
      {
        title: "When to use",
        anatomy: "Drawer = task with form fields the user might want to compare with the underlying page. Modal = critical decision blocking everything else. Toast = transient feedback. Popover = micro-menu attached to a trigger.",
        columns: 2,
        examples: [
          {
            label: "SlideOver / Drawer",
            html: `<div style="padding:0.75rem;font-size:13px;color:hsl(var(--muted-foreground));line-height:1.6">Identity detail edit, message preview, client config: anywhere the user benefits from seeing the parent page beneath the form.</div>`,
          },
          {
            label: "Confirm Modal",
            html: `<div style="padding:0.75rem;font-size:13px;color:hsl(var(--muted-foreground));line-height:1.6">Destructive or irreversible actions: delete identity, revoke all sessions, rotate client secret. Always uses the danger flag and an unambiguous confirm label.</div>`,
          },
          {
            label: "Toast",
            html: `<div style="padding:0.75rem;font-size:13px;color:hsl(var(--muted-foreground));line-height:1.6">After-the-fact feedback for completed actions, especially ones triggered far from the surface that needs updating.</div>`,
          },
          {
            label: "Row menu",
            html: `<div style="padding:0.75rem;font-size:13px;color:hsl(var(--muted-foreground));line-height:1.6">Per-row table actions. Hidden by default behind the &middot;&middot;&middot; button to reduce visual noise.</div>`,
          },
        ],
      },
      {
        title: "Z-index ladder",
        description: "Overlays compose. Be deliberate about ordering: confirm dialogs must beat toasts must beat drawers must beat the row menu.",
        examples: [{
          full: true,
          html: `<div class="dt-wrap" style="max-width:560px">
  <table class="dt-table">
    <thead><tr><th>Surface</th><th>z-index</th><th>Notes</th></tr></thead>
    <tbody>
      <tr><td>Row menu (popover)</td><td style="font-family:var(--font-mono);font-size:12px">50</td><td>In-flow, no backdrop.</td></tr>
      <tr><td>Sidebar drawer backdrop</td><td style="font-family:var(--font-mono);font-size:12px">30</td><td>Below sidebar (40), only on mobile.</td></tr>
      <tr><td>SlideOver</td><td style="font-family:var(--font-mono);font-size:12px">9000</td><td>Above all page content; below toasts and modals.</td></tr>
      <tr><td>Confirm Modal</td><td style="font-family:var(--font-mono);font-size:12px">99999</td><td>Blocks everything beneath it.</td></tr>
      <tr><td>Toast stack</td><td style="font-family:var(--font-mono);font-size:12px">100000</td><td>Highest: always visible so feedback isn't lost.</td></tr>
    </tbody>
  </table>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "sidebar",
    name: "Navigation",
    description: "Sidebar + Topbar + breadcrumbs + page header. The sidebar you see on the left of this very page is the production sidebar: same component, same width, same drawer behavior.",
    category: "Organisms",
    sections: [
      {
        title: "Sidebar",
        description: "240px expanded, 56px collapsed, drawer on mobile. Groups labeled with 11px uppercase headers.",
        anatomy: "Brand row (56px) . groups (label + items) . items are 32px tall, 13px medium, with leading icon. Active item gets accent background.",
        examples: [{
          html: `<nav class="sidebar open" style="position:relative;transform:none;height:300px">
  <div class="sidebar-brand"><span class="sidebar-brand-name">Acme</span></div>
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
        }],
      },
      {
        title: "Topbar",
        description: "Sticky, 56px tall. Holds the search trigger, glass/solid toggle, theme button, notifications, user menu.",
        examples: [{
          html: `<header class="topbar">
  <span class="h5">Dashboard</span>
  <div style="margin-left:auto;display:flex;gap:0.5rem">
    <button class="btn btn-ghost btn-sm">Search</button>
    <button class="btn btn-default btn-sm">New</button>
  </div>
</header>`,
        }],
      },
      {
        title: "Page header",
        description: "Title (22px semibold), optional subtitle, actions on the right. Stacks on mobile.",
        anatomy: "Title + sub on left, actions on right. Page-header h1 = 20-22px (smaller than Display h1): never compete with the topbar.",
        examples: [{
          full: true,
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
        }],
      },
    ],
  },

  {
    slug: "stepper",
    name: "Steppers",
    description: "Multi-step progress indicators: horizontal, vertical, with progress.",
    category: "Organisms",
    sections: [
      {
        title: "Horizontal",
        anatomy: "Numbered circles connected by lines. Completed steps get filled.",
        examples: [{
          full: true,
          html: `<div>
  <div class="stepper">
    <div class="step completed"><div class="step-indicator">&#10003;</div><span class="step-label">Account</span></div>
    <div class="step-connector completed"></div>
    <div class="step active"><div class="step-indicator">2</div><span class="step-label">Profile</span></div>
    <div class="step-connector"></div>
    <div class="step"><div class="step-indicator">3</div><span class="step-label">Review</span></div>
    <div class="step-connector"></div>
    <div class="step"><div class="step-indicator">4</div><span class="step-label">Done</span></div>
  </div>
  <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1.5rem">
    <button class="btn btn-outline btn-sm">Back</button>
    <button class="btn btn-default btn-sm">Next</button>
  </div>
</div>`,
        }],
      },
      {
        title: "Vertical",
        anatomy: "Each step has a circle + label + description, connected by a line. Use for forms with discrete sections.",
        examples: [{
          full: true,
          html: `<div class="stepper stepper-vertical" style="max-width:320px">
  <div class="step completed">
    <div class="step-indicator">&#10003;</div>
    <div class="step-content"><span class="step-label">Account created</span><span class="step-desc" style="font-size:12px;color:hsl(var(--muted-foreground))">Email verified and password set.</span></div>
  </div>
  <div class="step-connector-v completed"></div>
  <div class="step active">
    <div class="step-indicator">2</div>
    <div class="step-content"><span class="step-label">Profile setup</span><span class="step-desc" style="font-size:12px;color:hsl(var(--muted-foreground))">Add your name and avatar.</span></div>
  </div>
  <div class="step-connector-v"></div>
  <div class="step">
    <div class="step-indicator">3</div>
    <div class="step-content"><span class="step-label">Team invite</span><span class="step-desc" style="font-size:12px;color:hsl(var(--muted-foreground))">Invite collaborators to your workspace.</span></div>
  </div>
  <div class="step-connector-v"></div>
  <div class="step">
    <div class="step-indicator">4</div>
    <div class="step-content"><span class="step-label">Done</span><span class="step-desc" style="font-size:12px;color:hsl(var(--muted-foreground))">You're all set.</span></div>
  </div>
</div>`,
        }],
      },
      {
        title: "Progress bar",
        anatomy: "A single bar showing % complete: when individual steps don't matter, only progress.",
        examples: [{
          html: `<div style="max-width:320px">
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
    <span style="font-weight:500">Setup progress</span>
    <span style="color:hsl(var(--muted-foreground))">68%</span>
  </div>
  <div style="height:6px;border-radius:999px;background:hsl(var(--muted))">
    <div style="width:68%;height:100%;border-radius:999px;background:hsl(var(--primary))"></div>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "tabs",
    name: "Tabs",
    description: "Underline, pill, vertical, with badges.",
    category: "Organisms",
    sections: [
      {
        title: "Underline",
        anatomy: "Default tab style: underline beneath the active tab. Use for primary navigation between sibling views of a record (overview, settings, audit, etc.).",
        examples: [{
          html: `<div>
  <div class="tabs-list">
    <button class="tab active">General</button>
    <button class="tab">Security</button>
    <button class="tab">Notifications</button>
    <button class="tab">Billing</button>
    <button class="tab">Integrations</button>
  </div>
  <div class="tabs-content"><p class="body">General settings content goes here.</p></div>
</div>`,
        }],
      },
      {
        title: "Pill",
        anatomy: "Rounded background segment for the active tab. Use in toolbars and filter bars.",
        examples: [{
          html: `<div class="tabs-list tabs-pill">
  <button class="tab active">All</button>
  <button class="tab">Active</button>
  <button class="tab">Archived</button>
  <button class="tab">Deleted</button>
</div>`,
        }],
      },
      {
        title: "With badge counts",
        anatomy: "Tabs with a trailing count indicate the volume of each section.",
        examples: [{
          html: `<div class="tabs-list">
  <button class="tab active">All <span class="badge badge-secondary" style="margin-left:6px;font-size:10px">142</span></button>
  <button class="tab">Active <span class="badge badge-secondary" style="margin-left:6px;font-size:10px">89</span></button>
  <button class="tab">Pending <span class="badge badge-secondary" style="margin-left:6px;font-size:10px">12</span></button>
  <button class="tab">Archived <span class="badge badge-secondary" style="margin-left:6px;font-size:10px">53</span></button>
</div>`,
        }],
      },
      {
        title: "Vertical (sidebar tabs)",
        anatomy: "For settings panes: left rail tabs, right content. Mobile collapses to a top-row pill.",
        examples: [{
          full: true,
          html: `<div style="display:grid;grid-template-columns:180px 1fr;gap:1.5rem;min-height:200px">
  <div class="tabs-list tabs-vertical">
    <button class="tab active">General</button>
    <button class="tab">Security</button>
    <button class="tab">Notifications</button>
    <button class="tab">API Keys</button>
    <button class="tab">Billing</button>
  </div>
  <div class="section-card">
    <div class="section-card-header"><h3 class="h4">General Settings</h3></div>
    <div class="section-card-divider"></div>
    <div class="section-card-body">
      <div class="form-group"><label class="label">Display name</label><input class="input" value="Rachel Chen" /></div>
      <div class="form-group"><label class="label">Email</label><input class="input" value="rachel@example.com" /></div>
    </div>
  </div>
</div>`,
        }],
      },
    ],
  },

  // ─── Additional atoms from docs (not in handoff, kept for coverage) ──

  {
    slug: "kbd",
    name: "Kbd",
    description: "Keyboard shortcut indicator badge.",
    category: "Atoms",
    sections: [{
      title: "Default",
      examples: [
        { html: `<kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">K</kbd>` },
        { label: "In context", html: `<p class="body">Press <kbd class="kbd">⌘</kbd><kbd class="kbd">K</kbd> to search.</p>` },
      ],
    }],
  },

  {
    slug: "typography",
    name: "Typography",
    description: "Type scale classes for headings, body text, and helper styles.",
    category: "Atoms",
    sections: [
      {
        title: "Headings",
        examples: [{
          full: true,
          html: `<div style="display:flex;flex-direction:column;gap:0.25rem">
  <h1 class="display">Display</h1>
  <h1 class="h1">Heading 1</h1>
  <h2 class="h2">Heading 2</h2>
  <h3 class="h3">Heading 3</h3>
  <h4 class="h4">Heading 4</h4>
  <h5 class="h5">Heading 5</h5>
</div>`,
        }],
      },
      {
        title: "Body text",
        examples: [{
          full: true,
          html: `<div style="display:flex;flex-direction:column;gap:0.25rem">
  <p class="body">Body text for main content.</p>
  <p class="small">Small helper text.</p>
  <p class="tiny">Tiny label text.</p>
  <p class="muted">Muted secondary text.</p>
  <p class="caption">Caption for images or tables.</p>
</div>`,
        }],
      },
      {
        title: "Code and mono",
        examples: [{
          html: `<div><p class="body">Use the <span class="code">useState</span> hook for state.</p><p class="mono">monospace text for IDs</p></div>`,
        }],
      },
    ],
  },

  {
    slug: "spinner",
    name: "Spinner",
    description: "Animated loading spinner in three sizes.",
    category: "Atoms",
    sections: [{
      title: "Sizes",
      examples: [{
        html: `<div style="display:flex;gap:1rem;align-items:center">
  <div class="spinner spinner-sm"></div>
  <div class="spinner"></div>
  <div class="spinner spinner-lg"></div>
</div>`,
      }],
    }],
  },

  {
    slug: "popover",
    name: "Popover",
    description: "Floating panel for rich content triggered by a click.",
    category: "Atoms",
    sections: [{
      title: "Default",
      examples: [{
        html: `<div class="popover" style="position:relative;display:inline-block">
  <p class="body" style="margin-bottom:0.5rem">Popover content</p>
  <button class="btn btn-outline btn-sm">Action</button>
</div>`,
      }],
    }],
  },

  {
    slug: "row-menu",
    name: "Row Menu",
    description: "Vertical action menu items and navigation links.",
    category: "Organisms",
    sections: [{
      title: "Context menu",
      examples: [{
        html: `<div style="display:inline-flex;flex-direction:column;min-width:180px;border:1px solid hsl(var(--border));border-radius:var(--radius-lg,12px);padding:0.25rem;background:hsl(var(--popover))">
  <button class="rowmenu-item">Edit</button>
  <button class="rowmenu-item">Duplicate</button>
  <div class="rowmenu-sep"></div>
  <button class="rowmenu-item rowmenu-danger">Delete</button>
</div>`,
      }],
    }],
  },
];

export function getComponent(slug: string): ComponentDoc | undefined {
  return COMPONENTS.find((c) => c.slug === slug);
}

export function getComponentsByCategory(category: string): ComponentDoc[] {
  return COMPONENTS.filter((c) => c.category === category);
}
