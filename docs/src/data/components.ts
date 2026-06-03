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
    description: "A photo when the account has one, falling back to two initials on a brand gradient (seeded admin accounts). Sizes scale font proportionally (40% of diameter).",
    category: "Atoms",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["single", "stacked", "topbar", "identity", "menu"], cols: 3 },
        { type: "range", key: "size", label: "Size", min: 20, max: 96, step: 4, suffix: "px", disabledWhen: (s) => s.variant !== "single" && s.variant !== "stacked" },
        { type: "text", key: "initials", label: "Initials", disabledWhen: (s) => s.variant !== "single" },
        { type: "check", key: "overflow", label: "Overflow +N", disabledWhen: (s) => s.variant !== "stacked" },
        { type: "check", key: "ring", label: "Ring outline", disabledWhen: (s) => s.variant !== "single" },
      ],
      defaults: { variant: "single", size: 40, initials: "AO", ring: false, overflow: false },
      render: (s) => {
        const sz = s.size as number;
        const ini = ((s.initials as string) || "AO").slice(0, 2).toUpperCase();
        const fs = Math.round(sz * 0.4);
        const ring = s.ring ? `outline:2px solid hsl(var(--card));` : "";
        if (s.variant === "stacked") {
          const overlap = Math.round(sz * 0.3);
          const photos: Record<string, string> = {
            RC: "/rachel-chen.jpg", LB: "/liang-bao.jpg", KT: "/kira-tanaka.jpg",
          };
          const items = ["RC", "LB", "AO", "KT"];
          const stack = items.map((n, i) => {
            const content = photos[n] ? `<img src="${photos[n]}" alt="${n}">` : n;
            return `<span class="avatar" style="width:${sz}px;height:${sz}px;outline:2px solid hsl(var(--card));${i > 0 ? `margin-left:-${overlap}px;` : ""}z-index:${items.length - i}">${content}</span>`;
          }).join("");
          const overflow = s.overflow ? `<span style="margin-left:6px;display:inline-flex;align-items:center;font-size:12px;color:hsl(var(--muted-foreground))">+12</span>` : "";
          return `<div style="display:flex;align-items:center">${stack}${overflow}</div>`;
        }
        if (s.variant === "topbar") {
          return `<div style="display:inline-flex;flex-direction:column;align-items:flex-start;gap:6px">
  <button type="button" aria-haspopup="menu" aria-expanded="false" onclick="var m=this.nextElementSibling;var open=m.style.display!=='block';m.style.display=open?'block':'none';this.setAttribute('aria-expanded',open);this.querySelector('svg').style.transform=open?'rotate(180deg)':'';" style="display:inline-flex;align-items:center;gap:0.5rem;border:1px solid hsl(var(--border));padding:4px 10px 4px 4px;border-radius:9999px;background:hsl(var(--card));cursor:pointer;font-size:13px;font-weight:500">
    <span class="avatar"><img src="/marcus-allen.jpg" alt="MA"></span>
    <span>admin@example.com</span>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 150ms ease"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="dropdown" role="menu" style="position:static;display:none;min-width:200px" onclick="var t=event.target.closest('.dropdown-item');if(!t)return;this.style.display='none';var b=this.previousElementSibling;b.setAttribute('aria-expanded','false');b.querySelector('svg').style.transform='';">
    <div class="dropdown-label">admin@example.com</div>
    <button class="dropdown-item">Profile</button>
    <button class="dropdown-item">Settings</button>
    <div class="dropdown-sep"></div>
    <button class="dropdown-item">Sign out</button>
  </div>
</div>`;
        }
        if (s.variant === "identity") {
          return `<div style="display:flex;align-items:center;gap:1rem">
  <span class="avatar" style="width:40px;height:40px;font-size:16px"><img src="/rachel-chen.jpg" alt="RC"></span>
  <div>
    <div style="font-size:16px;font-weight:600">Rachel Chen</div>
    <div style="font-size:13px;color:hsl(var(--muted-foreground))">rachel.chen@example.com</div>
  </div>
</div>`;
        }
        if (s.variant === "menu") {
          return `<div style="display:flex;align-items:center;gap:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid hsl(var(--border))">
  <span class="avatar" style="width:40px;height:40px;font-size:16px"><img src="/ada-lovelace.jpg" alt="AL"></span>
  <div>
    <div style="font-size:13px;font-weight:600">Ada Lovelace</div>
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">admin@example.com</div>
  </div>
</div>`;
        }
        return `<span class="avatar" style="width:${sz}px;height:${sz}px;font-size:${fs}px;${ring}">${ini}</span>`;
      },
    },
    sections: [],
  },

  {
    slug: "badge",
    name: "Badges",
    description: "Two families. <code>.badge</code> = rectangular pill for metadata (schema, role, tag). <code>.status-badge</code> = pill with dot for live state (active, pending, failed).",
    category: "Atoms",
    playground: {
      controls: [
        { type: "pills", key: "kind", label: "Type", options: ["badge", "status", "identity", "grants"], cols: 4 },
        { type: "pills", key: "variant", label: "Badge variant", options: ["default", "secondary", "outline", "destructive"], cols: 4, disabledWhen: (s) => s.kind !== "badge" },
        { type: "check", key: "mono", label: "Mono (token / event names)", disabledWhen: (s) => s.kind !== "badge" },
        { type: "pills", key: "statusVariant", label: "Status variant", options: ["success", "warning", "error", "info", "neutral"], cols: 3, disabledWhen: (s) => s.kind !== "status" },
        { type: "text", key: "label", label: "Label", disabledWhen: (s) => s.kind === "identity" || s.kind === "grants" },
      ],
      defaults: { kind: "badge", variant: "secondary", statusVariant: "success", label: "admin", mono: false },
      render: (s) => {
        if (s.kind === "identity") {
          return `<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
  <span style="font-size:15px;font-weight:600">Rachel Chen</span>
  <span class="status-badge sb-success"><span class="dot"></span> active</span>
  <span class="status-badge sb-info"><span class="dot"></span> Verified</span>
  <span class="badge badge-secondary">employee</span>
</div>`;
        }
        if (s.kind === "grants") {
          return `<div style="display:flex;gap:4px;flex-wrap:wrap">
  <span class="badge badge-secondary" style="font-family:var(--font-mono);font-size:10.5px">authorization_code</span>
  <span class="badge badge-secondary" style="font-family:var(--font-mono);font-size:10.5px">refresh_token</span>
  <span class="badge badge-secondary" style="font-family:var(--font-mono);font-size:10.5px">client_credentials</span>
</div>`;
        }
        if (s.kind === "status") return `<span class="status-badge sb-${s.statusVariant}"><span class="dot"></span> ${s.label}</span>`;
        const mono = s.mono ? ` style="font-family:var(--font-mono);font-size:10.5px"` : "";
        return `<span class="badge badge-${s.variant}"${mono}>${s.label}</span>`;
      },
    },
    sections: [
      {
        title: ".badge - metadata",
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
        title: ".status-badge - live state",
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
    playground: {
      controls: [
        { type: "range", key: "depth", label: "Depth", min: 2, max: 6, step: 1 },
        { type: "pills", key: "separator", label: "Separator", options: ["chevron", "slash", "dot"], cols: 3 },
        { type: "check", key: "homeIcon", label: "Leading home icon" },
      ],
      defaults: { depth: 4, separator: "chevron", homeIcon: false },
      render: (s) => {
        const crumbs = ["Projects", "Identity Platform", "Settings", "Profile", "Avatar", "Edit"].slice(0, s.depth as number);
        const sepHtml = s.separator === "chevron"
          ? `<span class="breadcrumb-sep"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5"><path d="m9 18 6-6-6-6"/></svg></span>`
          : `<span class="breadcrumb-sep">${s.separator === "dot" ? "·" : "/"}</span>`;
        const homeHtml = s.homeIcon
          ? `<span class="breadcrumb-item"><a href="#"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></a></span>${sepHtml}`
          : "";
        const items = crumbs.map((c, i) => i === crumbs.length - 1
          ? `<span class="breadcrumb-item active">${c}</span>`
          : `<span class="breadcrumb-item"><a href="#">${c}</a></span>${sepHtml}`).join("");
        return `<nav class="breadcrumb">${homeHtml}${items}</nav>`;
      },
    },
    sections: [
      {
        title: "With chevrons",
        anatomy: "Each segment is a link except the current page. 11px chevron separator.",
        examples: [{
          html: `<nav class="breadcrumb" onclick="var a=event.target.closest('a');if(a){event.preventDefault();this.querySelectorAll('.breadcrumb-item').forEach(function(s){s.classList.remove('active')});a.closest('.breadcrumb-item').classList.add('active')}">
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
          html: `<nav class="breadcrumb" onclick="var a=event.target.closest('a');if(a){event.preventDefault();this.querySelectorAll('.breadcrumb-item').forEach(function(s){s.classList.remove('active')});a.closest('.breadcrumb-item').classList.add('active')}">
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
    <nav class="breadcrumb" style="margin-bottom:0.5rem" onclick="var a=event.target.closest('a');if(a){event.preventDefault();this.querySelectorAll('.breadcrumb-item').forEach(function(s){s.classList.remove('active')});a.closest('.breadcrumb-item').classList.add('active')}">
      <span class="breadcrumb-item"><a href="#">Users</a></span>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-item active">Rachel Chen</span>
    </nav>
    <div class="page-header-title"><h1>Rachel Chen</h1></div>
  </div>
  <div class="page-header-actions">
    <button class="btn btn-outline btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Editing…';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Edit</button>
    <button class="btn btn-default btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Saved!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Save</button>
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
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["segmented", "attached", "split"], cols: 3 },
        { type: "pills", key: "size", label: "Size", options: ["sm", "default", "lg"], cols: 3 },
        { type: "range", key: "buttons", label: "Buttons", min: 2, max: 5, step: 1, disabledWhen: (s) => s.variant === "split" },
      ],
      defaults: { variant: "segmented", size: "sm", buttons: 3 },
      render: (s) => {
        const sz = s.size === "default" ? "" : ` btn-${s.size}`;
        const labels = ["Day", "Week", "Month", "Year", "All"].slice(0, s.buttons as number);
        if (s.variant === "split") {
          return `<div data-split style="position:relative;display:inline-block"><span data-saved style="position:absolute;bottom:100%;left:0;margin-bottom:6px;padding:4px 10px;background:hsl(var(--foreground));color:hsl(var(--background));border-radius:6px;font-size:12px;font-weight:500;white-space:nowrap;opacity:0;transform:translateY(4px);transition:opacity 150ms,transform 150ms;pointer-events:none">Saved ✓</span><div class="btn-group"><button class="btn btn-default${sz}" style="border-top-right-radius:0;border-bottom-right-radius:0" onclick="var t=this.closest('[data-split]').querySelector('[data-saved]');t.textContent='Saved ✓';t.style.opacity='1';t.style.transform='translateY(0)';setTimeout(function(){t.style.opacity='0';t.style.transform='translateY(4px)'},1400)">Save</button><button class="btn btn-default${sz}" aria-label="More save options" style="border-top-left-radius:0;border-bottom-left-radius:0;border-left:1px solid hsl(var(--primary-foreground)/0.2);padding-inline:0.5rem" onclick="var m=this.closest('[data-split]').querySelector('[data-menu]');m.style.display=m.style.display==='block'?'none':'block'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button></div><div data-menu class="dropdown" style="position:absolute;top:100%;right:0;margin-top:4px;display:none;min-width:184px;z-index:10" onclick="var t=event.target.closest('.dropdown-item');if(!t)return;this.style.display='none';var s=this.closest('[data-split]').querySelector('[data-saved]');s.textContent='Saved ('+t.textContent.trim()+')';s.style.opacity='1';s.style.transform='translateY(0)';setTimeout(function(){s.style.opacity='0';s.style.transform='translateY(4px)'},1600)"><button class="dropdown-item">Save as draft</button><button class="dropdown-item">Save and close</button><button class="dropdown-item">Save a copy</button></div></div>`;
        }
        if (s.variant === "attached") {
          return `<div class="btn-group">${labels.map((l) =>
            `<button class="btn btn-outline${sz}">${l}</button>`
          ).join("")}</div>`;
        }
        return `<div class="btn-group" onclick="var b=event.target.closest('.btn');if(!b)return;this.querySelectorAll('.btn').forEach(function(x){x.classList.remove('btn-default');x.classList.add('btn-outline')});b.classList.remove('btn-outline');b.classList.add('btn-default')">${labels.map((l, i) =>
          `<button class="btn btn-${i === 0 ? "default" : "outline"}${sz}">${l}</button>`
        ).join("")}</div>`;
      },
    },
    sections: [
      {
        title: "Segmented control",
        anatomy: "An attached .btn-group of 2-4 buttons: the active one fills with primary, the rest are outline. Use for mutually-exclusive view switching.",
        examples: [{
          html: `<div class="btn-group">
  <button class="btn btn-default btn-sm" onclick="this.parentElement.querySelectorAll('.btn').forEach(b=>b.classList.replace('btn-default','btn-outline'));this.classList.replace('btn-outline','btn-default')">All</button>
  <button class="btn btn-outline btn-sm" onclick="this.parentElement.querySelectorAll('.btn').forEach(b=>b.classList.replace('btn-default','btn-outline'));this.classList.replace('btn-outline','btn-default')">Active</button>
  <button class="btn btn-outline btn-sm" onclick="this.parentElement.querySelectorAll('.btn').forEach(b=>b.classList.replace('btn-default','btn-outline'));this.classList.replace('btn-outline','btn-default')">Archived</button>
</div>`,
        }],
      },
      {
        title: "Attached buttons",
        anatomy: "Adjacent buttons with shared borders. Use for groups of related actions (zoom, alignment).",
        examples: [{
          html: `<div class="btn-group" data-idx="3">
  <button class="btn btn-outline" onclick="const g=this.parentElement,d=['May 23','May 24','May 25','Today','May 27','May 28','May 29'];let i=Math.max(0,+(g.dataset.idx)-1);g.dataset.idx=i;g.querySelector('[data-lbl]').textContent=d[i]"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
  <button class="btn btn-outline" data-lbl style="min-width:5.5rem;pointer-events:none">Today</button>
  <button class="btn btn-outline" onclick="const g=this.parentElement,d=['May 23','May 24','May 25','Today','May 27','May 28','May 29'];let i=Math.min(d.length-1,+(g.dataset.idx)+1);g.dataset.idx=i;g.querySelector('[data-lbl]').textContent=d[i]"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
</div>`,
        }],
      },
      {
        title: "Split button",
        anatomy: "A primary action with a chevron that opens a menu of secondary actions.",
        examples: [{
          html: `<div style="position:relative;display:inline-flex">
  <div class="btn-group">
    <button class="btn btn-default" style="border-top-right-radius:0;border-bottom-right-radius:0" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Saved!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Save</button>
    <button class="btn btn-default" style="border-top-left-radius:0;border-bottom-left-radius:0;border-left:1px solid hsl(var(--primary-foreground)/0.2);padding-inline:0.5rem" onclick="const d=this.parentElement.nextElementSibling;d.style.display=d.style.display==='none'?'block':'none'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
  </div>
  <div class="dropdown" style="display:none;position:absolute;top:100%;right:0;margin-top:4px;min-width:160px">
    <button class="dropdown-item" onclick="var b=this;var o=b.textContent;b.textContent='Draft saved!';b.style.background='hsl(var(--accent))';setTimeout(function(){b.textContent=o;b.style.background=''},1500)">Save as draft</button>
    <button class="dropdown-item" onclick="var b=this;var o=b.textContent;b.textContent='Published!';b.style.background='hsl(var(--accent))';setTimeout(function(){b.textContent=o;b.style.background=''},1500)">Save and publish</button>
  </div>
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
    <button class="btn btn-default" onclick="var b=this;var orig=b.innerHTML;b.disabled=true;b.innerHTML='<svg width=&quot;14&quot; height=&quot;14&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; style=&quot;animation:spin 1s linear infinite&quot;><path d=&quot;M21 12a9 9 0 1 1-6.219-8.56&quot;/></svg> Saving&hellip;';setTimeout(function(){b.innerHTML=orig;b.disabled=false},2000)">Save changes</button>
    <button class="btn btn-outline" onclick="var b=this;var orig=b.innerHTML;b.disabled=true;b.innerHTML='<svg width=&quot;14&quot; height=&quot;14&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; style=&quot;animation:spin 1s linear infinite&quot;><path d=&quot;M21 12a9 9 0 1 1-6.219-8.56&quot;/></svg> Loading';setTimeout(function(){b.innerHTML=orig;b.disabled=false},2000)">Load more</button>
  </div>
  <div style="font-size:11.5px;color:hsl(var(--muted-foreground))">Click to see the loading state. No built-in variant: consumers swap label + add a spinning icon.</div>
</div>`,
            code: `<button class="btn btn-default" disabled>
  <svg class="spinner">...</svg> Saving…
</button>
<button class="btn btn-outline" disabled>
  <svg class="spinner">...</svg> Loading
</button>`,
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
  <button class="btn btn-outline btn-sm" onclick="var b=this;var o=b.innerHTML;b.disabled=true;b.textContent='Exporting…';setTimeout(function(){b.innerHTML=o;b.disabled=false},2000)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export CSV</button>
  <button class="btn btn-default btn-sm" onclick="var b=this;var o=b.innerHTML;b.disabled=true;b.textContent='Creating…';setTimeout(function(){b.innerHTML=o;b.disabled=false},2000)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New identity</button>
</div>`,
          },
          {
            label: "Modal footer",
            html: `<div style="display:flex;gap:0.5rem">
  <button class="btn btn-outline btn-sm" onclick="this.style.opacity='0.5';var b=this;setTimeout(function(){b.style.opacity='1'},800)">Cancel</button>
  <button class="btn btn-destructive btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Deleting…';setTimeout(function(){b.textContent='Deleted!';setTimeout(function(){b.textContent=o;b.disabled=false},1200)},800)">Delete permanently</button>
</div>`,
          },
          {
            label: "Row action menu trigger",
            html: `<div style="display:flex;justify-content:flex-end;flex:1">
  <button class="btn btn-ghost btn-sm" style="height:28px;padding:0 8px" onclick="var b=this;b.style.background='hsl(var(--accent))';setTimeout(function(){b.style.background=''},300)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
</div>`,
          },
          {
            label: "Toolbar filter pills",
            html: `<div style="display:flex;gap:0.25rem" onclick="if(!event.target.classList.contains('btn'))return;this.querySelectorAll('.btn').forEach(function(b){b.className=b.className.replace('btn-default','btn-outline')});event.target.className=event.target.className.replace('btn-outline','btn-default')">
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
    playground: {
      controls: [
        { type: "pills", key: "state", label: "State", options: ["unchecked", "checked", "disabled"], cols: 3 },
        { type: "text", key: "label", label: "Label" },
        { type: "check", key: "withDesc", label: "With description" },
      ],
      defaults: { state: "checked", label: "Email notifications", withDesc: true },
      render: (s) => {
        const checked = s.state === "checked" ? " checked" : "";
        const disabled = s.state === "disabled" ? " disabled" : "";
        const desc = s.withDesc ? `<div style="font-size:12px;color:hsl(var(--muted-foreground))">Get notified when activity happens on your account.</div>` : "";
        return `<label style="display:flex;gap:0.5rem;cursor:pointer"><input type="checkbox"${checked}${disabled} style="accent-color:hsl(var(--primary));margin-top:3px"><div><div style="font-size:13px;font-weight:500">${s.label}</div>${desc}</div></label>`;
      },
    },
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
    playground: {
      controls: [
        { type: "text", key: "placeholder", label: "Placeholder" },
        { type: "check", key: "withLabel", label: "With label" },
        { type: "check", key: "withHelper", label: "With helper text" },
        { type: "check", key: "disabled", label: "Disabled" },
      ],
      defaults: { placeholder: "Search a person…", withLabel: true, withHelper: false, disabled: false },
      render: (s) => {
        const dis = s.disabled ? " disabled" : "";
        const label = s.withLabel ? `<label class="label">Assigned to</label>` : "";
        const helper = s.withHelper ? `<p class="field-helper">The person responsible for this account.</p>` : "";
        return `<div style="max-width:280px">${label}<div class="combobox"><input class="combobox-input" placeholder="${s.placeholder}"${dis} oninput="var v=this.value.toLowerCase();this.parentElement.querySelectorAll('.combobox-item').forEach(function(i){i.style.display=i.textContent.toLowerCase().includes(v)?'':'none'})" /><div class="combobox-list" style="position:static" onclick="var t=event.target;if(!t.classList.contains('combobox-item'))return;this.querySelectorAll('.combobox-item').forEach(function(i){i.classList.remove('selected')});t.classList.add('selected');this.parentElement.querySelector('.combobox-input').value=t.textContent"><div class="combobox-item selected">Wade Cooper</div><div class="combobox-item">Arlene Mccoy</div><div class="combobox-item">Devon Webb</div></div></div>${helper}</div>`;
      },
    },
    sections: [
      {
        title: "Single-select",
        anatomy: "Input + chevron + dropdown list. Filter as you type, arrow/enter to pick.",
        examples: [{
          html: `<div class="combobox" style="max-width:280px">
  <input class="combobox-input" placeholder="Search or select..." oninput="var v=this.value.toLowerCase();this.parentElement.querySelectorAll('.combobox-item').forEach(function(i){i.style.display=i.textContent.toLowerCase().includes(v)?'':'none'})">
  <div class="combobox-list" onclick="var t=event.target;if(!t.classList.contains('combobox-item'))return;this.querySelectorAll('.combobox-item').forEach(i=>i.classList.remove('selected'));t.classList.add('selected');this.parentElement.querySelector('.combobox-input').value=t.textContent">
    <div class="combobox-item">Apple</div>
    <div class="combobox-item selected">Banana</div>
    <div class="combobox-item">Cherry</div>
    <div class="combobox-item">Date</div>
    <div class="combobox-item">Elderberry</div>
  </div>
</div>`,
          code: `<div class="combobox">
  <input class="combobox-input" placeholder="Search or select..." />
  <div class="combobox-list">
    <div class="combobox-item">Apple</div>
    <div class="combobox-item selected">Banana</div>
    <div class="combobox-item">Cherry</div>
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
    <input class="combobox-input" placeholder="Pick one..." oninput="var v=this.value.toLowerCase();this.parentElement.querySelectorAll('.combobox-item').forEach(function(i){i.style.display=i.textContent.toLowerCase().includes(v)?'':'none'})">
    <div class="combobox-list" style="position:static" onclick="var t=event.target;if(!t.classList.contains('combobox-item'))return;this.querySelectorAll('.combobox-item').forEach(i=>i.classList.remove('selected'));t.classList.add('selected');this.parentElement.querySelector('.combobox-input').value=t.textContent">
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
    playground: {
      controls: [
        { type: "pills", key: "orientation", label: "Orientation", options: ["horizontal", "vertical"], cols: 2 },
        { type: "pills", key: "variant", label: "Variant", options: ["plain", "label", "action"], cols: 3, disabledWhen: (s) => s.orientation === "vertical" },
        { type: "text", key: "label", label: "Label", disabledWhen: (s) => s.orientation === "vertical" || s.variant !== "label" },
      ],
      defaults: { orientation: "horizontal", variant: "plain", label: "Or continue with" },
      render: (s) => {
        if (s.orientation === "vertical") {
          return `<div style="display:flex;align-items:center;gap:0.75rem;height:2rem"><span>Left</span><div class="sep-v" style="height:1.25rem"></div><span>Right</span></div>`;
        }
        if (s.variant === "label") return `<div class="sep-label">${s.label}</div>`;
        if (s.variant === "action") {
          return `<div style="display:flex;align-items:center;gap:0.75rem"><hr class="sep" style="flex:1" /><button class="btn btn-ghost btn-sm">Add</button><hr class="sep" style="flex:1" /></div>`;
        }
        return `<hr class="sep" />`;
      },
    },
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
  <button class="btn btn-ghost btn-sm" onclick="this.textContent=this.textContent==='Show more'?'Show less':'Show more'">Show more</button>
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
    playground: {
      controls: [
        { type: "check", key: "icons", label: "Leading icons" },
        { type: "check", key: "shortcuts", label: "Keyboard shortcuts" },
        { type: "check", key: "destructive", label: "Destructive item" },
      ],
      defaults: { icons: true, shortcuts: false, destructive: false },
      render: (s) => {
        const ico = (d: string) => s.icons ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">${d}</svg> ` : "";
        const sc = (k: string) => s.shortcuts ? `<span class="command-shortcut">${k}</span>` : "";
        let items = `<button class="dropdown-item">${ico(`<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>`)}<span>Edit profile</span>${sc("⌘E")}</button>`;
        items += `<button class="dropdown-item">${ico(`<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`)}<span>Duplicate</span>${sc("⌘D")}</button>`;
        items += `<button class="dropdown-item">${ico(`<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`)}<span>Settings</span>${sc("⌘,")}</button>`;
        if (s.destructive) {
          items += `<div class="dropdown-sep"></div><button class="dropdown-item" style="color:hsl(0 84% 60%)">${ico(`<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`)}<span>Delete…</span></button>`;
        }
        return `<div class="dropdown" style="position:relative;display:inline-block;min-width:200px" onclick="var t=event.target.closest('.dropdown-item');if(!t||t.classList.contains('disabled'))return;t.style.background='hsl(var(--accent))';setTimeout(function(){t.style.background=''},300)">${items}</div>`;
      },
    },
    sections: [
      {
        title: "Simple",
        anatomy: "Menu of plain text items; one column.",
        examples: [{
          html: `<div class="dropdown" style="position:relative;display:inline-block;min-width:180px" onclick="var t=event.target.closest('.dropdown-item');if(!t||t.classList.contains('disabled'))return;t.style.background='hsl(var(--accent))';setTimeout(function(){t.style.background=''},300)">
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
          html: `<div class="dropdown" style="position:relative;display:inline-block;min-width:220px" onclick="var t=event.target.closest('.dropdown-item');if(!t)return;t.style.background='hsl(var(--accent))';setTimeout(function(){t.style.background=''},300)">
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
          html: `<div class="dropdown" style="position:relative;display:inline-block;min-width:180px" onclick="var t=event.target.closest('.dropdown-item');if(!t)return;t.style.background='hsl(var(--accent))';setTimeout(function(){t.style.background=''},300)">
  <button class="dropdown-item">Edit profile</button>
  <button class="dropdown-item">Settings</button>
  <div class="dropdown-sep"></div>
  <button class="dropdown-item" style="color:hsl(0 84% 60%)">Delete account</button>
</div>`,
        }],
      },
      {
        title: "With trigger",
        anatomy: "Button click toggles the menu. Click outside or press Escape to close.",
        examples: [{
          allowOverflow: true,
          html: `<div style="position:relative;display:inline-block" onclick="event.stopPropagation()">
  <button class="btn btn-outline btn-sm" onclick="var d=this.nextElementSibling;if(d.style.display==='none'){d.style.display='block';var close=function(e){if(!d.contains(e.target)){d.style.display='none';document.removeEventListener('click',close)}};setTimeout(function(){document.addEventListener('click',close)},0)}else{d.style.display='none'}">Actions <span style="margin-left:2px;font-size:10px">▾</span></button>
  <div class="dropdown" style="position:absolute;top:100%;left:0;margin-top:4px;min-width:180px;display:none;z-index:10">
    <button class="dropdown-item">Edit</button>
    <button class="dropdown-item">Duplicate</button>
    <div class="dropdown-sep"></div>
    <button class="dropdown-item">Archive</button>
  </div>
</div>`,
          code: `<div style="position:relative;display:inline-block">
  <button class="btn btn-outline btn-sm" onclick="toggleDropdown(this)">Actions ▾</button>
  <div class="dropdown" style="position:absolute;top:100%;left:0;margin-top:4px;min-width:180px;display:none">
    <button class="dropdown-item">Edit</button>
    <button class="dropdown-item">Duplicate</button>
    <div class="dropdown-sep"></div>
    <button class="dropdown-item">Archive</button>
  </div>
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
    playground: {
      controls: [
        { type: "range", key: "size", label: "Size", min: 12, max: 64, step: 2, suffix: "px" },
        { type: "pills", key: "color", label: "Color", options: ["foreground", "primary", "destructive", "muted"], cols: 4 },
      ],
      defaults: { size: 20, color: "foreground" },
      render: (s) => {
        const sz = s.size as number;
        const col = s.color === "foreground" ? "currentColor" : `hsl(var(--${s.color}))`;
        return `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      },
    },
    sections: [
      {
        title: "Full set",
        description: "90+ icons currently in the set. All Lucide-style outline with 1.75 stroke weight.",
        examples: [{
          full: true,
          html: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:2px;font-size:10px">
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><code style="color:hsl(var(--muted-foreground))">activity</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><code style="color:hsl(var(--muted-foreground))">alert-tri</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 3v4M8 3v4"/></svg><code style="color:hsl(var(--muted-foreground))">archive</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><code style="color:hsl(var(--muted-foreground))">bell</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><code style="color:hsl(var(--muted-foreground))">calendar</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><code style="color:hsl(var(--muted-foreground))">check</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg><code style="color:hsl(var(--muted-foreground))">chevron-down</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><code style="color:hsl(var(--muted-foreground))">clock</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg><code style="color:hsl(var(--muted-foreground))">code</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><code style="color:hsl(var(--muted-foreground))">copy</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg><code style="color:hsl(var(--muted-foreground))">database</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><code style="color:hsl(var(--muted-foreground))">download</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><code style="color:hsl(var(--muted-foreground))">eye</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg><code style="color:hsl(var(--muted-foreground))">file</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg><code style="color:hsl(var(--muted-foreground))">filter</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><code style="color:hsl(var(--muted-foreground))">globe</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><code style="color:hsl(var(--muted-foreground))">home</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><code style="color:hsl(var(--muted-foreground))">info</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg><code style="color:hsl(var(--muted-foreground))">key</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><code style="color:hsl(var(--muted-foreground))">lock</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><code style="color:hsl(var(--muted-foreground))">mail</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><code style="color:hsl(var(--muted-foreground))">plus</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><code style="color:hsl(var(--muted-foreground))">search</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><code style="color:hsl(var(--muted-foreground))">settings</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><code style="color:hsl(var(--muted-foreground))">shield</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><code style="color:hsl(var(--muted-foreground))">star</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg><code style="color:hsl(var(--muted-foreground))">trash</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><code style="color:hsl(var(--muted-foreground))">upload</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><code style="color:hsl(var(--muted-foreground))">user</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><code style="color:hsl(var(--muted-foreground))">users</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><code style="color:hsl(var(--muted-foreground))">x</code></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border-radius:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><code style="color:hsl(var(--muted-foreground))">zap</code></div>
</div>`,
        }],
      },
      {
        title: "Sizing convention",
        examples: [{
          full: true,
          html: `<div class="section-card" style="overflow:hidden;padding:0">
  <div style="display:flex;align-items:center;gap:1.5rem;padding:0.75rem 1.25rem">
    <div style="width:4rem;flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
    <code style="font-size:12px;font-family:var(--font-mono);color:hsl(var(--muted-foreground));width:60px">12px</code>
    <div style="font-size:12.5px;flex:1">Inline within text, kbd, dt-table cell chevrons</div>
  </div>
  <div style="display:flex;align-items:center;gap:1.5rem;padding:0.75rem 1.25rem;border-top:1px solid hsl(var(--border))">
    <div style="width:4rem;flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
    <code style="font-size:12px;font-family:var(--font-mono);color:hsl(var(--muted-foreground));width:60px">13px</code>
    <div style="font-size:12.5px;flex:1">Small buttons (.btn-sm), inline meta</div>
  </div>
  <div style="display:flex;align-items:center;gap:1.5rem;padding:0.75rem 1.25rem;border-top:1px solid hsl(var(--border))">
    <div style="width:4rem;flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
    <code style="font-size:12px;font-family:var(--font-mono);color:hsl(var(--muted-foreground));width:60px">14px</code>
    <div style="font-size:12.5px;flex:1">Default buttons, sidebar items</div>
  </div>
  <div style="display:flex;align-items:center;gap:1.5rem;padding:0.75rem 1.25rem;border-top:1px solid hsl(var(--border))">
    <div style="width:4rem;flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
    <code style="font-size:12px;font-family:var(--font-mono);color:hsl(var(--muted-foreground));width:60px">16px</code>
    <div style="font-size:12.5px;flex:1">Section headers, dropdown items</div>
  </div>
  <div style="display:flex;align-items:center;gap:1.5rem;padding:0.75rem 1.25rem;border-top:1px solid hsl(var(--border))">
    <div style="width:4rem;flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
    <code style="font-size:12px;font-family:var(--font-mono);color:hsl(var(--muted-foreground));width:60px">20px</code>
    <div style="font-size:12.5px;flex:1">Page-header titles, hero callouts</div>
  </div>
  <div style="display:flex;align-items:center;gap:1.5rem;padding:0.75rem 1.25rem;border-top:1px solid hsl(var(--border))">
    <div style="width:4rem;flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
    <code style="font-size:12px;font-family:var(--font-mono);color:hsl(var(--muted-foreground));width:60px">24px</code>
    <div style="font-size:12.5px;flex:1">Empty-state illustrations, large action affordances</div>
  </div>
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
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["lead-text", "trail-text", "lead-icon", "trail-icon", "currency", "action"], cols: 3 },
        { type: "pills", key: "size", label: "Size", options: ["sm", "default", "lg"], cols: 3 },
        { type: "check", key: "disabled", label: "Disabled" },
      ],
      defaults: { variant: "lead-icon", size: "default", disabled: false },
      render: (s) => {
        const dis = s.disabled ? " disabled" : "";
        const szCls = s.size === "default" ? "" : s.size === "sm" ? " input-sm" : " input-lg";
        const searchIco = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
        const mailIco = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
        if (s.variant === "lead-text") return `<div class="input-group"><span class="input-addon">https://</span><input class="input${szCls}" placeholder="example.com"${dis} /></div>`;
        if (s.variant === "trail-text") return `<div class="input-group"><input class="input${szCls}" placeholder="ada"${dis} /><span class="input-addon">@canvas.dev</span></div>`;
        if (s.variant === "lead-icon") return `<div class="input-group"><span class="input-icon">${searchIco}</span><input class="input${szCls}" placeholder="Quick search…"${dis} /></div>`;
        if (s.variant === "trail-icon") return `<div class="input-group"><input class="input${szCls}" placeholder="you@example.com"${dis} /><span class="input-icon">${mailIco}</span></div>`;
        if (s.variant === "currency") return `<div class="input-group"><span class="input-addon">$</span><input class="input${szCls}" type="number" placeholder="0.00"${dis} /><span class="input-addon">USD</span></div>`;
        return `<div class="input-group"><input class="input${szCls}" value="sk_live_••••••••4242" readonly${dis} /><button class="btn btn-outline btn-sm">Copy</button></div>`;
      },
    },
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
  <button class="btn btn-outline btn-sm" style="border-top-left-radius:0;border-bottom-left-radius:0;border-left:0" onclick="var b=this;var inp=b.previousElementSibling;navigator.clipboard.writeText(inp.value);var o=b.textContent;b.textContent='Copied!';setTimeout(function(){b.textContent=o},1500)">Copy</button>
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
    playground: {
      controls: [
        { type: "pills", key: "state", label: "State", options: ["default", "focus", "error", "disabled", "readonly"], cols: 3 },
        { type: "check", key: "icon", label: "With leading icon" },
        { type: "check", key: "helper", label: "Show helper" },
      ],
      defaults: { state: "default", icon: true, helper: true },
      render: (s) => {
        const st = s.state as string;
        const mailIco = s.icon ? `<span class="input-icon" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;color:hsl(var(--muted-foreground))"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>` : "";
        const pad = s.icon ? "padding-left:34px;" : "";
        const errStyle = st === "error" ? "border-color:hsl(0 84% 60%);" : "";
        const focusStyle = st === "focus" ? "box-shadow:0 0 0 2px hsl(var(--ring));" : "";
        const dis = st === "disabled" ? " disabled" : "";
        const ro = st === "readonly" ? " readonly" : "";
        const helperText = st === "error" ? "Please enter a valid email address." : "We'll use this for account recovery.";
        const helperColor = st === "error" ? "color:hsl(0 84% 60%)" : "";
        const helper = s.helper ? `<p class="field-helper" style="${helperColor}">${helperText}</p>` : "";
        return `<div style="max-width:320px"><label class="label">Email</label><div style="position:relative">${mailIco}<input class="input" value="rachel.chen@example.com" style="${pad}${errStyle}${focusStyle}"${dis}${ro} /></div>${helper}</div>`;
      },
    },
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
    <button class="btn btn-outline btn-sm" onclick="var c=this.closest('.card');c.style.opacity='0.5';setTimeout(function(){c.style.opacity='1'},800)">Cancel</button>
    <button class="btn btn-default btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Creating…';setTimeout(function(){b.textContent='Created!';setTimeout(function(){b.textContent=o;b.disabled=false},1200)},800)">Create identity</button>
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
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["compact", "numbered", "with-size"], cols: 3 },
        { type: "range", key: "totalPages", label: "Total pages", min: 3, max: 50, step: 1 },
        { type: "range", key: "currentPage", label: "Current page", min: 1, max: 50, step: 1 },
      ],
      defaults: { variant: "compact", totalPages: 12, currentPage: 2 },
      render: (s) => {
        const total = s.totalPages as number;
        const cur = Math.min(s.currentPage as number, total);
        const perPage = 10;
        const showFrom = (cur - 1) * perPage + 1;
        const showTo = Math.min(cur * perPage, total * perPage);
        const prevDis = cur <= 1 ? " disabled" : "";
        const nextDis = cur >= total ? " disabled" : "";
        if (s.variant === "compact") {
          return `<div style="display:flex;align-items:center;justify-content:space-between;font-size:13px"><span style="color:hsl(var(--muted-foreground))">Showing ${showFrom}–${showTo} of ${total * perPage}</span><div style="display:flex;gap:0.25rem"><button class="btn btn-outline btn-sm"${prevDis}>Previous</button><button class="btn btn-outline btn-sm"${nextDis}>Next</button></div></div>`;
        }
        if (s.variant === "numbered") {
          const list: number[] = [];
          const add = (p: number) => { if (!list.includes(p)) list.push(p); };
          if (total <= 7) {
            for (let p = 1; p <= total; p++) add(p);
          } else {
            add(1);
            if (cur > 3) list.push(-1);
            for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) add(p);
            if (cur < total - 2) list.push(-1);
            add(total);
          }
          const pages = list.map((p) => {
            if (p === -1) return `<span style="padding:0 4px;color:hsl(var(--muted-foreground))">…</span>`;
            const active = p === cur ? "background:hsl(var(--foreground));color:hsl(var(--background));" : "";
            return `<button class="btn btn-ghost btn-sm" style="min-width:32px;${active}">${p}</button>`;
          }).join("");
          return `<div onclick="var b=event.target.closest('.btn-ghost');if(!b)return;this.querySelectorAll('.btn-ghost').forEach(function(x){x.style.background='';x.style.color=''});b.style.background='hsl(var(--foreground))';b.style.color='hsl(var(--background))'" style="display:flex;align-items:center;gap:0.25rem"><button class="btn btn-outline btn-sm"${prevDis}>Previous</button>${pages}<button class="btn btn-outline btn-sm"${nextDis}>Next</button></div>`;
        }
        return `<div style="display:flex;align-items:center;gap:1rem;font-size:13px"><div style="display:flex;align-items:center;gap:0.5rem"><span style="color:hsl(var(--muted-foreground))">Rows per page</span><select class="input" style="width:64px;height:28px;font-size:12px"><option>10</option><option>25</option><option>50</option></select></div><span style="color:hsl(var(--muted-foreground))">Page ${cur} of ${total}</span><div style="display:flex;gap:0.25rem"><button class="btn btn-outline btn-sm btn-icon" style="width:28px;height:28px"${prevDis}>&lt;</button><button class="btn btn-outline btn-sm btn-icon" style="width:28px;height:28px"${nextDis}>&gt;</button></div></div>`;
      },
    },
    sections: [
      {
        title: "Compact (used in DataTable)",
        anatomy: "Showing X of Y + Previous / Next buttons. The default everywhere in Canvas.",
        examples: [{
          html: `<div style="display:flex;align-items:center;gap:1rem;font-size:13px;color:hsl(var(--muted-foreground))" data-page="1" onclick="var c=this;var p=parseInt(c.dataset.page);var t=event.target;if(t.textContent.includes('Next')&&p<15){p++}else if(t.textContent.includes('Previous')&&p>1){p--}else{return}c.dataset.page=p;c.querySelector('span').innerHTML='Showing '+(((p-1)*10)+1)+'&ndash;'+Math.min(p*10,142)+' of 142';var bs=c.querySelectorAll('button');bs[0].disabled=p<=1;bs[1].disabled=p>=15">
  <span>Showing 1&ndash;10 of 142</span>
  <div style="display:flex;gap:0.25rem">
    <button class="btn btn-outline btn-sm" disabled>&laquo; Previous</button>
    <button class="btn btn-outline btn-sm">Next &raquo;</button>
  </div>
</div>`,
          code: `<div style="display:flex;align-items:center;gap:1rem;font-size:13px">
  <span>Showing 1–10 of 142</span>
  <button class="btn btn-outline btn-sm" disabled>« Previous</button>
  <button class="btn btn-outline btn-sm">Next »</button>
</div>`,
        }],
      },
      {
        title: "Numbered",
        anatomy: "Use when the user benefits from knowing absolute page count (e.g. paginated search results).",
        examples: [{
          html: `<nav class="pagination" onclick="var t=event.target;if(!t.classList.contains('page-btn')||t.disabled)return;var bs=this.querySelectorAll('.page-btn:not(:first-child):not(:last-child)');var arr=this.querySelector('.page-btn:first-child');var nxt=this.querySelector('.page-btn:last-child');if(t===arr||t===nxt){var cur=this.querySelector('.page-btn.active');var idx=[].indexOf.call(bs,cur);var ni=t===nxt?idx+1:idx-1;if(ni>=0&&ni<bs.length){bs.forEach(b=>b.classList.remove('active'));bs[ni].classList.add('active');arr.disabled=ni<=0;nxt.disabled=ni>=bs.length-1}}else{bs.forEach(b=>b.classList.remove('active'));t.classList.add('active');arr.disabled=t===bs[0];nxt.disabled=t===bs[bs.length-1]}">
  <button class="page-btn" disabled>&laquo;</button>
  <button class="page-btn active">1</button>
  <button class="page-btn">2</button>
  <button class="page-btn">3</button>
  <span class="page-ellipsis">...</span>
  <button class="page-btn">12</button>
  <button class="page-btn">&raquo;</button>
</nav>`,
          code: `<nav class="pagination">
  <button class="page-btn" disabled>«</button>
  <button class="page-btn active">1</button>
  <button class="page-btn">2</button>
  <button class="page-btn">3</button>
  <span class="page-ellipsis">...</span>
  <button class="page-btn">12</button>
  <button class="page-btn">»</button>
</nav>`,
        }],
      },
      {
        title: "With page size selector",
        examples: [{
          full: true,
          html: `<div style="display:flex;align-items:center;justify-content:space-between;font-size:13px;color:hsl(var(--muted-foreground))" data-page="1" data-per="50">
  <div style="display:flex;align-items:center;gap:0.5rem">
    <span>Rows per page</span>
    <select class="input" style="width:auto;padding:0.25rem 0.5rem;font-size:12px" onchange="var c=this.closest('[data-page]');c.dataset.per=this.value;c.dataset.page='1';var per=parseInt(this.value);var tp=Math.ceil(142/per);c.querySelector('[data-info]').textContent='Showing 1–'+Math.min(per,142)+' of 142';var bs=c.querySelectorAll('button');bs[0].disabled=true;bs[1].disabled=tp<=1"><option>10</option><option>25</option><option selected>50</option><option>100</option></select>
  </div>
  <div style="display:flex;align-items:center;gap:1rem">
    <span data-info>Showing 1–50 of 142</span>
    <div style="display:flex;gap:0.25rem" onclick="var c=this.closest('[data-page]');var p=parseInt(c.dataset.page);var per=parseInt(c.dataset.per);var tp=Math.ceil(142/per);var t=event.target;if(t.textContent.includes('Next')&&p<tp){p++}else if(t.textContent.includes('Previous')&&p>1){p--}else{return}c.dataset.page=p;c.querySelector('[data-info]').textContent='Showing '+(((p-1)*per)+1)+'–'+Math.min(p*per,142)+' of 142';var bs=c.querySelectorAll('button');bs[0].disabled=p<=1;bs[1].disabled=p>=tp">
      <button class="btn btn-outline btn-sm" disabled>&laquo; Previous</button>
      <button class="btn btn-outline btn-sm">Next &raquo;</button>
    </div>
  </div>
</div>`,
          code: `<div style="display:flex;align-items:center;justify-content:space-between;font-size:13px">
  <span>Rows per page</span>
  <select class="input"><option>10</option><option>25</option><option selected>50</option><option>100</option></select>
  <span>Showing 1–50 of 142</span>
  <button class="btn btn-outline btn-sm" disabled>« Previous</button>
  <button class="btn btn-outline btn-sm">Next »</button>
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
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["stacked", "inline", "card"], cols: 3 },
        { type: "check", key: "withDesc", label: "With description" },
      ],
      defaults: { variant: "stacked", withDesc: true },
      render: (s) => {
        const opts = [
          { val: "hobby", label: "Hobby", desc: "For personal projects and experiments." },
          { val: "pro", label: "Pro", desc: "For growing teams that need more control." },
          { val: "enterprise", label: "Enterprise", desc: "Advanced security, compliance, and support." },
        ];
        if (s.variant === "card") {
          return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem">${opts.map(o =>
            `<label style="display:flex;align-items:flex-start;gap:0.625rem;padding:0.875rem;border-radius:var(--radius-md);border:1px solid ${o.val === "pro" ? "hsl(var(--primary))" : "hsl(var(--border))"};cursor:pointer;${o.val === "pro" ? "background:hsl(var(--primary)/0.05);" : ""}"><span style="width:16px;height:16px;border-radius:50%;border:2px solid ${o.val === "pro" ? "hsl(var(--primary))" : "hsl(var(--border))"};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${o.val === "pro" ? `<span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--primary))"></span>` : ""}</span><div><div style="font-size:13px;font-weight:500">${o.label}</div>${s.withDesc ? `<div style="font-size:12px;color:hsl(var(--muted-foreground))">${o.desc}</div>` : ""}</div></label>`
          ).join("")}</div>`;
        }
        if (s.variant === "inline") {
          return `<div style="display:flex;gap:1.5rem">${opts.map(o =>
            `<label style="display:flex;align-items:center;gap:0.5rem;font-size:13px;cursor:pointer"><input type="radio" name="pg-radio"${o.val === "pro" ? " checked" : ""} style="accent-color:hsl(var(--primary))">${o.label}</label>`
          ).join("")}</div>`;
        }
        return `<div style="display:flex;flex-direction:column;gap:0.625rem">${opts.map(o =>
          `<label style="display:flex;gap:0.5rem;cursor:pointer"><input type="radio" name="pg-radio"${o.val === "pro" ? " checked" : ""} style="accent-color:hsl(var(--primary));margin-top:3px"><div><div style="font-size:13px;font-weight:500">${o.label}</div>${s.withDesc ? `<div style="font-size:12px;color:hsl(var(--muted-foreground))">${o.desc}</div>` : ""}</div></label>`
        ).join("")}</div>`;
      },
    },
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
    <input type="radio" name="plan3" style="accent-color:hsl(var(--primary));margin-bottom:8px" onchange="this.closest('div[style*=grid]').querySelectorAll('label').forEach(l=>{l.style.border='1px solid hsl(var(--border))';l.style.background=''});this.parentElement.style.border='2px solid hsl(var(--primary))';this.parentElement.style.background='hsl(var(--primary) / 0.05)'">
    <span style="font-weight:600;font-size:13px">Hobby</span>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">Free forever</span>
  </label>
  <label style="display:flex;flex-direction:column;padding:1rem;border:2px solid hsl(var(--primary));border-radius:8px;background:hsl(var(--primary) / 0.05);cursor:pointer">
    <input type="radio" name="plan3" checked style="accent-color:hsl(var(--primary));margin-bottom:8px" onchange="this.closest('div[style*=grid]').querySelectorAll('label').forEach(l=>{l.style.border='1px solid hsl(var(--border))';l.style.background=''});this.parentElement.style.border='2px solid hsl(var(--primary))';this.parentElement.style.background='hsl(var(--primary) / 0.05)'">
    <span style="font-weight:600;font-size:13px">Pro</span>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">$12/mo per user</span>
  </label>
  <label style="display:flex;flex-direction:column;padding:1rem;border:1px solid hsl(var(--border));border-radius:8px;cursor:pointer">
    <input type="radio" name="plan3" style="accent-color:hsl(var(--primary));margin-bottom:8px" onchange="this.closest('div[style*=grid]').querySelectorAll('label').forEach(l=>{l.style.border='1px solid hsl(var(--border))';l.style.background=''});this.parentElement.style.border='2px solid hsl(var(--primary))';this.parentElement.style.background='hsl(var(--primary) / 0.05)'">
    <span style="font-weight:600;font-size:13px">Enterprise</span>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">Contact us</span>
  </label>
</div>`,
          code: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem">
  <label class="radio-card">
    <input type="radio" name="plan">
    <span class="font-weight:600">Hobby</span>
    <span>Free forever</span>
  </label>
  <label class="radio-card selected">
    <input type="radio" name="plan" checked>
    <span>Pro</span>
    <span>$12/mo per user</span>
  </label>
  <label class="radio-card">
    <input type="radio" name="plan">
    <span>Enterprise</span>
    <span>Contact us</span>
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
    playground: {
      controls: [
        { type: "pills", key: "size", label: "Size", options: ["sm", "default", "lg"], cols: 3 },
        { type: "check", key: "withLabel", label: "With label" },
        { type: "check", key: "withIcon", label: "With leading icon" },
        { type: "check", key: "disabled", label: "Disabled" },
      ],
      defaults: { size: "default", withLabel: true, withIcon: false, disabled: false },
      render: (s) => {
        const szCls = s.size === "default" ? "" : s.size === "sm" ? " input-sm" : " input-lg";
        const dis = s.disabled ? " disabled" : "";
        const label = s.withLabel ? `<label class="label">Country</label>` : "";
        const globe = s.withIcon ? `<span class="input-icon" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;color:hsl(var(--muted-foreground))"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>` : "";
        const pad = s.withIcon ? "padding-left:34px;" : "";
        return `<div style="max-width:280px">${label}<div style="position:relative">${globe}<select class="input${szCls}" style="${pad}"${dis}><option>United States</option><option>Canada</option><option>Mexico</option><option>United Kingdom</option></select></div></div>`;
      },
    },
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
    playground: {
      controls: [
        { type: "pills", key: "shape", label: "Shape", options: ["text", "avatar", "button", "card"], cols: 4 },
        { type: "range", key: "width", label: "Width", min: 10, max: 100, step: 5, suffix: "%" },
        { type: "check", key: "animate", label: "Animate pulse" },
      ],
      defaults: { shape: "text", width: 60, animate: true },
      render: (s) => {
        const pulse = s.animate ? " skeleton-pulse" : "";
        const w = s.width as number;
        if (s.shape === "avatar") {
          const sz = Math.round(w * 0.8);
          return `<div class="skeleton${pulse}" style="width:${sz}px;height:${sz}px;border-radius:9999px"></div>`;
        }
        if (s.shape === "button") {
          return `<div class="skeleton${pulse}" style="width:${Math.round(w * 1.6)}px;height:36px;border-radius:var(--radius-md)"></div>`;
        }
        if (s.shape === "card") {
          return `<div class="section-card" style="max-width:320px;padding:1rem"><div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem"><div class="skeleton${pulse}" style="width:40px;height:40px;border-radius:9999px;flex-shrink:0"></div><div style="flex:1"><div class="skeleton skeleton-text${pulse}" style="width:70%"></div><div class="skeleton skeleton-text${pulse}" style="width:40%;margin-top:6px"></div></div></div><div class="skeleton skeleton-text${pulse}" style="width:100%"></div><div class="skeleton skeleton-text${pulse}" style="width:80%;margin-top:6px"></div></div>`;
        }
        return `<div class="skeleton skeleton-text${pulse}" style="width:${w}%"></div>`;
      },
    },
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
    playground: {
      controls: [
        { type: "range", key: "rows", label: "Rows", min: 2, max: 10, step: 1 },
        { type: "check", key: "withLabel", label: "With label" },
        { type: "check", key: "charCounter", label: "Character counter" },
        { type: "check", key: "disabled", label: "Disabled" },
      ],
      defaults: { rows: 4, withLabel: true, charCounter: false, disabled: false },
      render: (s) => {
        const dis = s.disabled ? " disabled" : "";
        const label = s.withLabel ? `<label class="label">Description</label>` : "";
        const h = (s.rows as number) * 22 + 16;
        const counter = s.charCounter ? `<div style="display:flex;justify-content:flex-end;margin-top:4px"><span style="font-size:11px;color:hsl(var(--muted-foreground))">0 / 280</span></div>` : "";
        return `<div style="max-width:400px">${label}<textarea class="input" placeholder="A few words about this project…" style="min-height:${h}px;resize:vertical"${dis}></textarea>${counter}</div>`;
      },
    },
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
  <textarea class="input" placeholder="Tell us about yourself…" style="min-height:80px;resize:vertical" oninput="var c=this.value.length;var s=this.nextElementSibling.querySelector('span');s.textContent=c+' / 280';s.style.color=c>280?'hsl(0 84% 60%)':'hsl(var(--muted-foreground))'"></textarea>
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
    <button class="btn btn-ghost btn-sm" style="font-weight:700;min-width:32px" onclick="this.classList.toggle('active');this.style.background=this.classList.contains('active')?'hsl(var(--accent))':''">B</button>
    <button class="btn btn-ghost btn-sm" style="font-style:italic;min-width:32px" onclick="this.classList.toggle('active');this.style.background=this.classList.contains('active')?'hsl(var(--accent))':''">I</button>
    <button class="btn btn-ghost btn-sm" style="font-family:var(--font-mono);font-size:11px;min-width:32px" onclick="this.classList.toggle('active');this.style.background=this.classList.contains('active')?'hsl(var(--accent))':''"><span>&lt;/&gt;</span></button>
    <div class="sep-v" style="height:1rem;margin:0 0.25rem"></div>
    <button class="btn btn-ghost btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Posted!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Comment</button>
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
    playground: {
      controls: [
        { type: "pills", key: "state", label: "State", options: ["off", "on"], cols: 2 },
        { type: "text", key: "label", label: "Label" },
        { type: "check", key: "withDesc", label: "With description" },
        { type: "check", key: "disabled", label: "Disabled" },
      ],
      defaults: { state: "on", label: "Available to chat", withDesc: false, disabled: false },
      render: (s) => {
        const on = s.state === "on";
        const dis = s.disabled ? " disabled" : "";
        const desc = s.withDesc ? `<div style="font-size:12px;color:hsl(var(--muted-foreground))">Show your availability to teammates.</div>` : "";
        return `<label style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;cursor:pointer"><div><div style="font-size:13px;font-weight:500">${s.label}</div>${desc}</div><input type="checkbox" role="switch" class="switch"${on ? " checked" : ""}${dis}></label>`;
      },
    },
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
    playground: {
      controls: [
        { type: "pills", key: "side", label: "Side", options: ["top", "right", "bottom", "left"], cols: 4 },
        { type: "pills", key: "trigger", label: "Trigger", options: ["icon", "button", "text"], cols: 3 },
        { type: "text", key: "label", label: "Label" },
      ],
      defaults: { side: "top", trigger: "icon", label: "Open settings" },
      render: (s) => {
        const side = s.side as string;
        const lbl = s.label as string;
        let triggerHtml = "";
        if (s.trigger === "icon") {
          triggerHtml = `<button class="btn btn-ghost btn-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg></button>`;
        } else if (s.trigger === "button") {
          triggerHtml = `<button class="btn btn-outline btn-sm">Hover me</button>`;
        } else {
          triggerHtml = `<span style="text-decoration:underline;text-decoration-style:dotted;cursor:help;font-size:13px">hover this text</span>`;
        }
        const tipStyle = `position:absolute;padding:6px 10px;border-radius:var(--radius-sm);background:hsl(var(--foreground));color:hsl(var(--background));font-size:12px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px hsl(var(--foreground)/0.12)`;
        let pos = "";
        if (side === "top") pos = "bottom:calc(100% + 8px);left:50%;transform:translateX(-50%)";
        if (side === "bottom") pos = "top:calc(100% + 8px);left:50%;transform:translateX(-50%)";
        if (side === "left") pos = "right:calc(100% + 8px);top:50%;transform:translateY(-50%)";
        if (side === "right") pos = "left:calc(100% + 8px);top:50%;transform:translateY(-50%)";
        return `<div style="position:relative;display:inline-flex">${triggerHtml}<div style="${tipStyle};${pos}">${lbl}</div></div>`;
      },
    },
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
        anatomy: "Hover (or focus) the icon to see the tooltip appear.",
        examples: [{
          allowOverflow: true,
          html: `<div style="display:flex;gap:1.5rem;padding:1rem">
  <div style="position:relative;display:inline-flex" onmouseenter="this.querySelector('.tooltip').style.display='block'" onmouseleave="this.querySelector('.tooltip').style.display='none'">
    <button class="btn btn-ghost btn-icon" onfocus="this.parentElement.querySelector('.tooltip').style.display='block'" onblur="this.parentElement.querySelector('.tooltip').style.display='none'">&oast;</button>
    <div class="tooltip" style="display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap">Settings</div>
  </div>
  <div style="position:relative;display:inline-flex" onmouseenter="this.querySelector('.tooltip').style.display='block'" onmouseleave="this.querySelector('.tooltip').style.display='none'">
    <button class="btn btn-ghost btn-icon" onfocus="this.parentElement.querySelector('.tooltip').style.display='block'" onblur="this.parentElement.querySelector('.tooltip').style.display='none'">&#9993;</button>
    <div class="tooltip" style="display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap">Notifications</div>
  </div>
</div>`,
          code: `<div style="position:relative;display:inline-flex">
  <button class="btn btn-ghost btn-icon">&oast;</button>
  <div class="tooltip" style="position:absolute;bottom:calc(100% + 8px)">Settings</div>
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
        <button class="btn btn-sm btn-default" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Upgrading…';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Upgrade plan</button>
        <button class="btn btn-ghost btn-sm" onclick="var a=this.closest('.alert');a.style.opacity='0';a.style.transition='opacity 300ms';setTimeout(function(){a.style.display='none';var btn=document.createElement('button');btn.className='btn btn-outline btn-sm';btn.textContent='Show alert';btn.onclick=function(){a.style.display='';a.style.opacity='1';btn.remove()};a.parentElement.appendChild(btn)},300)">Dismiss</button>
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
  <span>We've shipped a new dashboard. <a href="#" style="color:inherit;text-decoration:underline" onclick="event.preventDefault();this.style.opacity='0.6';var a=this;setTimeout(function(){a.style.opacity='1'},400)">See what's new &rarr;</a></span>
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
        title: "StatCard playground",
        anatomy: "The tiny metric card primitive: title, value, icon, and an optional delta. Compose these into a stat row.",
        examples: [{
          full: true,
          html: `<div class="stat-card" style="max-width:280px"><div class="stat-card-row"><div><div class="stat-card-label">Active identities</div><div class="stat-card-value">12,348</div><div style="font-size:11px;color:hsl(142 71% 45%);margin-top:2px">+142 today</div></div><div class="stat-card-icon blue">U</div></div></div>`,
        }],
      },
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
  <div class="section-card-header"><h3 class="h4">Recent activity</h3><button class="btn btn-ghost btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Loading…';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">View all</button></div>
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
  <button class="btn btn-default btn-sm" style="margin-top:1rem" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Creating…';setTimeout(function(){b.textContent='Created!';setTimeout(function(){b.textContent=o;b.disabled=false},1200)},800)">Create identity</button>
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
  <div class="field"><span class="field-label">Token</span><span class="field-value mono" style="display:flex;align-items:center;gap:0.5rem">sk_live_a8f2...c9e1 <button class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:11px" onclick="var b=this;navigator.clipboard.writeText('sk_live_a8f2c9e1');var o=b.textContent;b.textContent='Copied!';setTimeout(function(){b.textContent=o},1500)">Copy</button></span></div>
  <div class="field"><span class="field-label">Members</span><span class="field-value" style="display:flex;gap:0.25rem"><span class="avatar avatar-sm"><img src="/rachel-chen.jpg" alt="RC"></span><span class="avatar avatar-sm">AJ</span><span class="avatar avatar-sm">+3</span></span></div>
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
  <div class="form-actions"><button class="btn btn-default" style="width:100%" onclick="var form=this.closest('div[style*=max-width]');var email=form.querySelector('input[type=email]');var pw=form.querySelector('input[type=password]');var err=form.querySelector('[data-error]');if(err)err.remove();if(!email.value){email.style.borderColor='hsl(0 84% 60%)';var e=document.createElement('div');e.dataset.error='';e.style.cssText='font-size:12px;color:hsl(0 84% 60%);margin-top:4px';e.textContent='Email is required';email.parentElement.appendChild(e);setTimeout(function(){email.style.borderColor='';if(e.parentElement)e.remove()},2500);return}email.style.borderColor='hsl(143 70% 45%)';pw.style.borderColor='hsl(143 70% 45%)';var b=this;b.disabled=true;b.textContent='Signing in…';setTimeout(function(){b.textContent='Sign in';b.disabled=false;email.style.borderColor='';pw.style.borderColor=''},2000)">Sign in</button></div>
</div>`,
          code: `<div style="max-width:360px">
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
  <div class="form-actions" style="justify-content:flex-end"><button class="btn btn-outline btn-sm" onclick="var c=this.closest('div[style*=max-width]');c.style.opacity='0.5';setTimeout(function(){c.style.opacity='1'},800)">Cancel</button><button class="btn btn-default btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Creating…';setTimeout(function(){b.textContent='Created!';setTimeout(function(){b.textContent=o;b.disabled=false},1200)},800)">Create</button></div>
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
          html: `<div style="display:grid;grid-template-columns:200px 1fr;gap:1.5rem" onclick="var chip=event.target.closest('[data-filter]');if(!chip)return;var n=chip.dataset.filter;this.querySelectorAll('input[type=checkbox]').forEach(function(c){if(c.parentElement.textContent.trim()===n)c.click()})">
  <div class="filter-panel" onchange="var wrap=this.closest('div[style*=grid]');var chips=wrap.querySelector('[data-chips]');while(chips.firstChild)chips.removeChild(chips.firstChild);this.querySelectorAll('input[type=checkbox]:checked').forEach(function(cb){var name=cb.parentElement.textContent.trim();var s=document.createElement('span');s.className='filter-chip active';s.style.cursor='pointer';s.dataset.filter=name;s.textContent=name+' ×';chips.appendChild(s)});var count=chips.children.length;wrap.querySelector('[data-count]').textContent='Showing '+(count*12)+' of 142 identities'">
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
    <div data-chips style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap">
      <span class="filter-chip active" style="cursor:pointer" data-filter="Active">Active ×</span>
      <span class="filter-chip active" style="cursor:pointer" data-filter="Default">Default ×</span>
    </div>
    <div data-count style="font-size:13px;color:hsl(var(--muted-foreground))">Showing 24 of 142 identities</div>
  </div>
</div>`,
          code: `<div style="display:grid;grid-template-columns:200px 1fr;gap:1.5rem">
  <div class="filter-panel">
    <div class="filter-group">
      <span class="filter-group-label">Status</span>
      <label><input type="checkbox" checked /> Active</label>
      <label><input type="checkbox" /> Pending</label>
    </div>
  </div>
  <div>
    <div class="filter-chip active">Active &times;</div>
    <div>Showing 24 of 142 identities</div>
  </div>
</div>`,
        }],
      },
      {
        title: "Inline filter bar",
        anatomy: "Compact horizontal filters: dropdowns above the table. Use when sidebar real estate is precious.",
        examples: [{
          full: true,
          html: `<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap" onclick="var b=event.target.closest('.btn');if(!b)return;if(b.textContent.includes('Add filter')){var o=b.textContent;b.disabled=true;b.textContent='Added!';setTimeout(function(){b.textContent=o;b.disabled=false},1500);return}b.classList.toggle('active');if(b.classList.contains('active')){b.className=b.className.replace('btn-outline','btn-default')}else{b.className=b.className.replace('btn-default','btn-outline')}">
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
  <div class="calendar-grid" onclick="var t=event.target;if(!t.classList.contains('calendar-cell')||t.classList.contains('outside'))return;this.querySelectorAll('.calendar-cell').forEach(c=>c.classList.remove('selected'));t.classList.add('selected')">
    <span class="calendar-head">Mo</span><span class="calendar-head">Tu</span><span class="calendar-head">We</span><span class="calendar-head">Th</span><span class="calendar-head">Fr</span><span class="calendar-head">Sa</span><span class="calendar-head">Su</span>
    <button class="calendar-cell outside">27</button><button class="calendar-cell outside">28</button><button class="calendar-cell outside">29</button><button class="calendar-cell outside">30</button><button class="calendar-cell">1</button><button class="calendar-cell">2</button><button class="calendar-cell">3</button>
    <button class="calendar-cell">4</button><button class="calendar-cell">5</button><button class="calendar-cell">6</button><button class="calendar-cell">7</button><button class="calendar-cell">8</button><button class="calendar-cell">9</button><button class="calendar-cell">10</button>
    <button class="calendar-cell">11</button><button class="calendar-cell">12</button><button class="calendar-cell">13</button><button class="calendar-cell">14</button><button class="calendar-cell">15</button><button class="calendar-cell">16</button><button class="calendar-cell">17</button>
    <button class="calendar-cell">18</button><button class="calendar-cell">19</button><button class="calendar-cell">20</button><button class="calendar-cell">21</button><button class="calendar-cell">22</button><button class="calendar-cell today">23</button><button class="calendar-cell selected">24</button>
    <button class="calendar-cell">25</button><button class="calendar-cell">26</button><button class="calendar-cell">27</button><button class="calendar-cell">28</button><button class="calendar-cell">29</button><button class="calendar-cell">30</button><button class="calendar-cell">31</button>
  </div>
</div>`,
          code: `<div class="calendar">
  <div class="calendar-header">
    <button class="calendar-nav">&lt;</button>
    <span class="calendar-title">May 2026</span>
    <button class="calendar-nav">&gt;</button>
  </div>
  <div class="calendar-grid">
    <span class="calendar-head">Mo</span>...
    <button class="calendar-cell">1</button>...
    <button class="calendar-cell selected">24</button>...
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
    <div class="calendar-grid" onclick="var t=event.target;if(!t.classList.contains('calendar-cell')||t.classList.contains('outside'))return;this.querySelectorAll('.calendar-cell').forEach(c=>c.classList.remove('selected'));t.classList.add('selected');var d=t.textContent;var wrap=this.closest('div[style*=grid-template]');wrap.querySelector('.h4').textContent='May '+d;var ev={'1':'Sprint kickoff|10:00 AM','8':'Retrospective|3:00 PM','15':'All-hands|11:00 AM','22':'Demo day|2:00 PM','23':'Team lunch|12:00 PM~Code review|4:00 PM','24':'Sprint planning|9:00 AM~Design review|11:30 AM~1:1 with manager|2:00 PM','25':'Standup|9:30 AM','26':'Deploy window|6:00 PM'};var items=(ev[d]||'No events').split('~');var bd=wrap.querySelector('.section-card-body');bd.innerHTML=items[0]==='No events'?'<div style=\\'padding:1rem;font-size:13px;color:hsl(var(--muted-foreground))\\'>No events scheduled.</div>':items.map(function(e,i){var p=e.split('|');return '<div style=\\'padding:0.625rem 1rem;font-size:13px;display:flex;justify-content:space-between'+(i<items.length-1?';border-bottom:1px solid hsl(var(--border))':'')+'\\'><span><span style=\\'font-weight:500\\'>'+p[0]+'</span></span><span style=\\'color:hsl(var(--muted-foreground))\\'>'+p[1]+'</span></div>'}).join('')">
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
          code: `<div style="display:grid;grid-template-columns:auto 1fr;gap:1.5rem">
  <div class="calendar">...</div>
  <div class="section-card">
    <div class="section-card-header"><h3 class="h4">May 24</h3></div>
    <div class="section-card-divider"></div>
    <div class="section-card-body">
      <!-- Event rows -->
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
          html: `<div>
  <button class="btn btn-outline btn-sm" style="display:flex;align-items:center;gap:0.5rem" onclick="var d=this.nextElementSibling;if(d.style.display==='none'){d.style.display='block';d.querySelector('.command-input').focus();var close=function(e){if(!d.contains(e.target)&&e.target!==this){d.style.display='none';document.removeEventListener('click',close)}}.bind(this);setTimeout(function(){document.addEventListener('click',close)},0)}else{d.style.display='none'}">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    Search...
    <kbd class="kbd" style="margin-left:auto">⌘K</kbd>
  </button>
  <div class="command-dialog" style="display:none;position:relative;transform:none;top:auto;left:auto;animation:none;margin-top:0.75rem;max-width:480px">
    <input class="command-input" placeholder="Type a command..." oninput="var v=this.value.toLowerCase();var items=this.parentElement.querySelectorAll('.command-item');items.forEach(function(i){i.style.display=i.textContent.toLowerCase().includes(v)?'':'none'})">
    <div class="command-list">
      <div class="command-group"><div class="command-group-label">Actions</div><div class="command-item selected">New File</div><div class="command-item">Open File</div><div class="command-item">Save</div></div>
      <div class="command-sep"></div>
      <div class="command-group"><div class="command-group-label">Navigation</div><div class="command-item">Go to Dashboard</div><div class="command-item">Go to Settings</div></div>
    </div>
  </div>
</div>`,
          code: `<button class="btn btn-outline btn-sm" onclick="openCommandPalette()">
  <svg><!-- search icon --></svg> Search... <kbd class="kbd">⌘K</kbd>
</button>`,
        }],
      },
      {
        title: "Anatomy",
        anatomy: "Centered overlay . 600px wide . search input + grouped results + footer with key hints.",
        examples: [{
          html: `<div class="command-dialog" style="position:relative;transform:none;top:auto;left:auto;animation:none;max-width:480px">
  <input class="command-input" placeholder="Type a command..." oninput="var v=this.value.toLowerCase();var items=this.parentElement.querySelectorAll('.command-item');var first=true;items.forEach(function(i){var txt=i.textContent.toLowerCase();var show=txt.includes(v);i.style.display=show?'':'none';i.classList.remove('selected');if(show&&first){i.classList.add('selected');first=false}});this.parentElement.querySelectorAll('.command-group').forEach(function(g){var vis=g.querySelectorAll('.command-item:not([style*=none])');g.style.display=vis.length?'':'none'});this.parentElement.querySelectorAll('.command-sep').forEach(function(s){s.style.display=v?'none':''})">
  <div class="command-list" onclick="var t=event.target.closest('.command-item');if(!t)return;this.querySelectorAll('.command-item').forEach(i=>i.classList.remove('selected'));t.classList.add('selected')">
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
          code: `<div class="command-dialog">
  <input class="command-input" placeholder="Type a command..." />
  <div class="command-list">
    <div class="command-group">
      <div class="command-group-label">Actions</div>
      <div class="command-item selected">New File</div>
      <div class="command-item">Open File</div>
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
    <input class="input" placeholder="Search users..." style="max-width:240px" oninput="var v=this.value.toLowerCase();var rows=this.closest('.dt-wrap').querySelectorAll('tbody tr');var count=0;rows.forEach(function(r){var txt=r.textContent.toLowerCase();var show=txt.includes(v);r.style.display=show?'':'none';if(show)count++});this.closest('.dt-wrap').querySelector('.dt-footer span').innerHTML='Showing 1&ndash;'+count+' of '+count" />
    <div style="flex:1"></div>
    <button class="btn btn-outline btn-sm">Export</button>
  </div>
  <div class="dt-scroll">
    <table class="dt-table">
      <thead>
        <tr onclick="var th=event.target.closest('.sortable');if(!th)return;var ths=this.querySelectorAll('.sortable');ths.forEach(function(h){if(h!==th){h.classList.remove('sorted');var ic=h.querySelector('.dt-sort-icon');if(ic)ic.remove()}});th.classList.add('sorted');var ico=th.querySelector('.dt-sort-icon');if(ico){var up=ico.innerHTML==='▲';ico.innerHTML=up?'▼':'▲'}else{var s=document.createElement('span');s.className='dt-sort-icon';s.innerHTML='▲';th.appendChild(s)}">
          <th class="sortable sorted">Name <span class="dt-sort-icon">&#9650;</span></th>
          <th class="sortable">Email</th>
          <th>Role</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody onclick="var tr=event.target.closest('tr');if(!tr)return;tr.classList.toggle('active')">
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
          code: `<div class="dt-wrap">
  <div class="dt-toolbar">
    <input class="input" placeholder="Search users..." />
    <button class="btn btn-outline btn-sm">Export</button>
  </div>
  <table class="dt-table">
    <thead><tr>
      <th class="sortable sorted">Name <span class="dt-sort-icon">▲</span></th>
      <th class="sortable">Email</th>
      <th>Role</th>
      <th>Status</th>
    </tr></thead>
    <tbody>
      <tr class="clickable"><td>...</td></tr>
    </tbody>
  </table>
  <div class="dt-footer">...</div>
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
    <button class="btn btn-outline btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Exporting…';setTimeout(function(){b.textContent='Exported!';setTimeout(function(){b.textContent=o;b.disabled=false},1000)},800)">Export</button>
  </div>
  <div class="dt-toolbar">
    <input class="input" placeholder="Filter users..." style="max-width:200px" />
    <div style="flex:1"></div>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">3 selected</span>
    <button class="btn btn-outline btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Editing…';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Bulk edit</button>
    <button class="btn btn-destructive btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Deleting…';setTimeout(function(){b.textContent='Deleted!';setTimeout(function(){b.textContent=o;b.disabled=false},1000)},800)">Delete</button>
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
        title: "Density modes",
        anatomy: "Switch via the density toggle. Affects all .dt-table th, td, and .dt-toolbar padding and font size.",
        examples: [{
          full: true,
          html: `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.75rem">
  <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:hsl(var(--muted-foreground));font-weight:500;margin-bottom:0.5rem">compact</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">8px padding, 12.5px font</div></div>
  <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:hsl(var(--muted-foreground));font-weight:500;margin-bottom:0.5rem">regular</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">12px padding, 13px font</div></div>
  <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:hsl(var(--muted-foreground));font-weight:500;margin-bottom:0.5rem">comfy</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">16px padding, 13.5px font</div></div>
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
    <div class="sheet-header"><h2 class="sheet-title">Edit Identity</h2><button class="btn btn-ghost btn-sm" style="margin-left:auto;padding:2px 6px" onclick="var s=this.closest('.sheet');s.style.opacity='0.3';s.style.transition='opacity 300ms';setTimeout(function(){s.style.opacity='1'},1000)">&times;</button></div>
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
      <button class="btn btn-outline btn-sm" onclick="var d=this.closest('.dialog');d.style.opacity='0.5';setTimeout(function(){d.style.opacity='1'},1000)">Cancel</button>
      <button class="btn btn-destructive btn-sm" onclick="var b=this;b.disabled=true;b.textContent='Deleting…';setTimeout(function(){b.textContent='Deleted!';setTimeout(function(){b.textContent='Delete';b.disabled=false},1500)},800)">Delete</button>
    </div>
  </div>
</div>`,
          },
          {
            label: "Toast",
            html: `<div>
  <div class="toast" style="position:relative;animation:none" data-toast>
    <div><div class="toast-title">Changes saved</div><div class="toast-desc">Your settings have been updated.</div></div>
    <button class="toast-close" onclick="var t=this.closest('[data-toast]');t.style.display='none';t.nextElementSibling.style.display='inline-block'">&times;</button>
  </div>
  <button class="btn btn-outline btn-sm" style="display:none;margin-top:0.5rem" onclick="var t=this.previousElementSibling;t.style.display='';this.style.display='none'">Show toast again</button>
</div>`,
          },
          {
            label: "Row menu",
            html: `<div class="dropdown" style="position:relative;display:inline-block;min-width:160px" onclick="var t=event.target.closest('.dropdown-item');if(!t)return;t.style.background='hsl(var(--accent))';setTimeout(function(){t.style.background=''},300)">
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
  <div class="sidebar-nav" onclick="if(!event.target.classList.contains('sidebar-item'))return;this.querySelectorAll('.sidebar-item').forEach(i=>i.classList.remove('active'));event.target.classList.add('active')">
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
          code: `<nav class="sidebar open">
  <div class="sidebar-brand"><span class="sidebar-brand-name">Acme</span></div>
  <div class="sidebar-nav">
    <div class="sidebar-group">
      <div class="sidebar-group-label">Main</div>
      <button class="sidebar-item active">Dashboard</button>
      <button class="sidebar-item">Users</button>
      <button class="sidebar-item">Settings</button>
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
    <button class="btn btn-ghost btn-sm" onclick="var b=this;b.style.background='hsl(var(--accent))';setTimeout(function(){b.style.background=''},300)">Search</button>
    <button class="btn btn-default btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Created!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">New</button>
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
    <button class="btn btn-outline" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Exporting…';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Export</button>
    <button class="btn btn-default" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Added!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Add User</button>
  </div>
</div>`,
        }],
      },
      {
        title: "Breadcrumbs",
        description: "Where am I in the hierarchy. Chevron separators; the last crumb is the current page, not a link. See the dedicated Breadcrumbs page for full options.",
        examples: [{
          html: `<nav class="breadcrumb"><a class="breadcrumb-item" href="#">Home</a><span class="breadcrumb-sep">/</span><a class="breadcrumb-item" href="#">Team</a><span class="breadcrumb-sep">/</span><span class="breadcrumb-item active">Rachel Chen</span></nav>`,
        }],
      },
      {
        title: "Tabs",
        description: "Switch between facets of one record without leaving the page. See the dedicated Tabs page for pill, underline, and vertical variants.",
        examples: [{
          full: true,
          html: `<div style="display:flex;gap:0;border-bottom:1px solid hsl(var(--border))" onclick="if(!event.target.dataset.tab)return;this.querySelectorAll('[data-tab]').forEach(t=>{t.style.borderBottomColor='transparent';t.style.color='hsl(var(--muted-foreground))'});event.target.style.borderBottomColor='hsl(var(--primary))';event.target.style.color='hsl(var(--foreground))'">
  <button data-tab="1" style="padding:10px 16px;font-size:13px;font-weight:500;border:none;background:none;cursor:pointer;border-bottom:2px solid hsl(var(--primary));color:hsl(var(--foreground))">Overview</button>
  <button data-tab="2" style="padding:10px 16px;font-size:13px;font-weight:500;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;color:hsl(var(--muted-foreground))">Sessions</button>
  <button data-tab="3" style="padding:10px 16px;font-size:13px;font-weight:500;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;color:hsl(var(--muted-foreground))">Audit log</button>
</div>`,
        }],
      },
      {
        title: "Command palette (⌘K)",
        description: "Global fuzzy launcher. Cmd+K opens it from anywhere. See the dedicated Command Palette page for the full anatomy.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:480px;padding:0;overflow:hidden">
  <div style="display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid hsl(var(--border))">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <span style="font-size:13px;color:hsl(var(--muted-foreground))">Type a command or search...</span>
    <kbd class="kbd" style="margin-left:auto">esc</kbd>
  </div>
  <div style="padding:6px">
    <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:0.06em;color:hsl(var(--muted-foreground));padding:6px 10px">Actions</div>
    <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;background:hsl(var(--accent));font-size:13px">Create identity <kbd class="kbd" style="margin-left:auto">C</kbd></div>
    <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;font-size:13px">Invite teammate</div>
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
  <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1.5rem" onclick="var wrap=this.parentElement;var steps=[].slice.call(wrap.querySelectorAll('.step'));var cons=[].slice.call(wrap.querySelectorAll('.step-connector'));var cur=steps.findIndex(function(s){return s.classList.contains('active')});var t=event.target.closest('button');if(!t)return;var isNext=t.textContent.trim()==='Next';var ni=isNext?cur+1:cur-1;if(ni<0||ni>=steps.length)return;steps.forEach(function(s,i){s.classList.remove('active','completed');var ind=s.querySelector('.step-indicator');if(i<ni){s.classList.add('completed');ind.innerHTML='&#10003;'}else if(i===ni){s.classList.add('active');ind.textContent=''+(i+1)}else{ind.textContent=''+(i+1)}});cons.forEach(function(c,i){if(i<ni)c.classList.add('completed');else c.classList.remove('completed')});var bs=this.querySelectorAll('button');bs[0].disabled=ni<=0;bs[1].textContent=ni>=steps.length-1?'Finish':'Next';if(ni>=steps.length-1)bs[1].disabled=true">
    <button class="btn btn-outline btn-sm" disabled>Back</button>
    <button class="btn btn-default btn-sm">Next</button>
  </div>
</div>`,
          code: `<div>
  <div class="stepper">
    <div class="step completed"><div class="step-indicator">✓</div><span class="step-label">Account</span></div>
    <div class="step-connector completed"></div>
    <div class="step active"><div class="step-indicator">2</div><span class="step-label">Profile</span></div>
    <div class="step-connector"></div>
    <div class="step"><div class="step-indicator">3</div><span class="step-label">Review</span></div>
  </div>
  <button class="btn btn-outline btn-sm">Back</button>
  <button class="btn btn-default btn-sm">Next</button>
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
  <div class="tabs-list" onclick="if(!event.target.classList.contains('tab'))return;this.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));event.target.classList.add('active');var m={'General':'General settings content goes here.','Security':'Security preferences and two-factor authentication.','Notifications':'Email and push notification preferences.','Billing':'Payment methods and subscription plan.','Integrations':'Connected apps and API configuration.'};this.nextElementSibling.querySelector('p').textContent=m[event.target.textContent]||''">
    <button class="tab active">General</button>
    <button class="tab">Security</button>
    <button class="tab">Notifications</button>
    <button class="tab">Billing</button>
    <button class="tab">Integrations</button>
  </div>
  <div class="tabs-content"><p class="body">General settings content goes here.</p></div>
</div>`,
          code: `<div>
  <div class="tabs-list">
    <button class="tab active">General</button>
    <button class="tab">Security</button>
    <button class="tab">Notifications</button>
    <button class="tab">Billing</button>
    <button class="tab">Integrations</button>
  </div>
  <div class="tabs-content">...</div>
</div>`,
        }],
      },
      {
        title: "Pill",
        anatomy: "Rounded background segment for the active tab. Use in toolbars and filter bars.",
        examples: [{
          html: `<div class="tabs-list tabs-pill" onclick="if(!event.target.classList.contains('tab'))return;this.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));event.target.classList.add('active')">
  <button class="tab active">All</button>
  <button class="tab">Active</button>
  <button class="tab">Archived</button>
  <button class="tab">Deleted</button>
</div>`,
          code: `<div class="tabs-list tabs-pill">
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
          html: `<div class="tabs-list" onclick="var t=event.target.closest('.tab');if(!t)return;this.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));t.classList.add('active')">
  <button class="tab active">All <span class="badge badge-secondary" style="margin-left:6px;font-size:10px">142</span></button>
  <button class="tab">Active <span class="badge badge-secondary" style="margin-left:6px;font-size:10px">89</span></button>
  <button class="tab">Pending <span class="badge badge-secondary" style="margin-left:6px;font-size:10px">12</span></button>
  <button class="tab">Archived <span class="badge badge-secondary" style="margin-left:6px;font-size:10px">53</span></button>
</div>`,
          code: `<div class="tabs-list">
  <button class="tab active">All <span class="badge badge-secondary">142</span></button>
  <button class="tab">Active <span class="badge badge-secondary">89</span></button>
  <button class="tab">Pending <span class="badge badge-secondary">12</span></button>
  <button class="tab">Archived <span class="badge badge-secondary">53</span></button>
</div>`,
        }],
      },
      {
        title: "Vertical (sidebar tabs)",
        anatomy: "For settings panes: left rail tabs, right content. Mobile collapses to a top-row pill.",
        examples: [{
          full: true,
          html: `<div style="display:grid;grid-template-columns:180px 1fr;gap:1.5rem;min-height:200px">
  <div class="tabs-list tabs-vertical" onclick="if(!event.target.classList.contains('tab'))return;this.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));event.target.classList.add('active');var p=this.nextElementSibling;p.querySelector('.h4').textContent=event.target.textContent+' Settings';var b=p.querySelector('.section-card-body');var f={'General':'<div class=\\'form-group\\'><label class=\\'label\\'>Display name</label><input class=\\'input\\' value=\\'Rachel Chen\\' /></div><div class=\\'form-group\\'><label class=\\'label\\'>Email</label><input class=\\'input\\' value=\\'rachel@example.com\\' /></div>','Security':'<div class=\\'form-group\\'><label class=\\'label\\'>Password</label><input class=\\'input\\' type=\\'password\\' value=\\'secretpass\\' /></div><div class=\\'form-group\\' style=\\'display:flex;align-items:center;gap:0.75rem\\'><label class=\\'label\\' style=\\'margin:0\\'>Two-factor auth</label><input type=\\'checkbox\\' role=\\'switch\\' class=\\'switch\\'></div>','Notifications':'<div class=\\'form-group\\' style=\\'display:flex;align-items:center;gap:0.75rem\\'><label class=\\'label\\' style=\\'margin:0\\'>Email notifications</label><input type=\\'checkbox\\' role=\\'switch\\' class=\\'switch\\' checked></div><div class=\\'form-group\\' style=\\'display:flex;align-items:center;gap:0.75rem\\'><label class=\\'label\\' style=\\'margin:0\\'>Push notifications</label><input type=\\'checkbox\\' role=\\'switch\\' class=\\'switch\\'></div>','API Keys':'<div class=\\'form-group\\'><label class=\\'label\\'>API Key</label><input class=\\'input\\' value=\\'sk-proj-abc123\\' readonly style=\\'font-family:var(--font-mono)\\' /></div>','Billing':'<div class=\\'form-group\\'><label class=\\'label\\'>Plan</label><input class=\\'input\\' value=\\'Pro ($12/mo)\\' readonly /></div>'};b.innerHTML=f[event.target.textContent]||''">
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
          code: `<div style="display:grid;grid-template-columns:180px 1fr;gap:1.5rem">
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
    <div class="section-card-body">...</div>
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
    sections: [
      {
        title: "Default",
        examples: [{
          html: `<div class="popover" style="position:relative;display:inline-block">
  <p class="body" style="margin-bottom:0.5rem">Popover content</p>
  <button class="btn btn-outline btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Done!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Action</button>
</div>`,
        }],
      },
      {
        title: "With trigger",
        anatomy: "Click the button to toggle the panel.",
        examples: [{
          allowOverflow: true,
          html: `<div style="position:relative;display:inline-block" onclick="event.stopPropagation()">
  <button class="btn btn-outline btn-sm" onclick="var p=this.nextElementSibling;if(p.style.display==='none'){p.style.display='block';var close=function(e){if(!p.contains(e.target)){p.style.display='none';document.removeEventListener('click',close)}};setTimeout(function(){document.addEventListener('click',close)},0)}else{p.style.display='none'}">Open popover</button>
  <div class="popover" style="position:absolute;top:100%;left:0;margin-top:8px;min-width:260px;display:none;z-index:10">
    <p class="body" style="margin-bottom:0.5rem">Place your rich content, form fields, or secondary actions here.</p>
    <button class="btn btn-outline btn-sm" onclick="this.closest('.popover').style.display='none'">Close</button>
  </div>
</div>`,
          code: `<div style="position:relative;display:inline-block">
  <button class="btn btn-outline btn-sm" onclick="togglePopover(this)">Open popover</button>
  <div class="popover" style="position:absolute;top:100%;left:0;margin-top:8px;display:none">
    <p class="body">Popover content</p>
    <button class="btn btn-outline btn-sm">Close</button>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "row-menu",
    name: "Row Menu",
    description: "Vertical action menu items and navigation links.",
    category: "Organisms",
    sections: [{
      title: "Context menu",
      examples: [{
        html: `<div style="display:inline-flex;flex-direction:column;min-width:180px;border:1px solid hsl(var(--border));border-radius:var(--radius-lg,12px);padding:0.25rem;background:hsl(var(--popover));box-shadow:var(--shadow-md)" onclick="var t=event.target.closest('.rowmenu-item');if(!t)return;var o=t.textContent;t.style.background='hsl(var(--accent))';t.textContent=t.classList.contains('rowmenu-danger')?'Deleted!':o==='Edit'?'Editing…':'Duplicated!';setTimeout(function(){t.textContent=o;t.style.background=''},1500)">
  <button class="rowmenu-item">Edit</button>
  <button class="rowmenu-item">Duplicate</button>
  <div class="rowmenu-sep"></div>
  <button class="rowmenu-item rowmenu-danger">Delete</button>
</div>`,
      }],
    }],
  },

  // ─── New Molecules ─────────────────────────────────────────────────────

  {
    slug: "action-panels",
    name: "Action Panels",
    description: "Section card with headline, body text, and a primary action. Used to surface a single decision or call-to-action.",
    category: "Molecules",
    sections: [
      {
        title: "Simple",
        anatomy: "Title + supporting text + trailing button. Use for single-decision prompts (delete zone, billing alert).",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.5rem;max-width:560px">
  <div style="font-size:15px;font-weight:600;margin-bottom:4px">Delete this project</div>
  <div style="font-size:13px;color:hsl(var(--muted-foreground));margin-bottom:1rem">Once you delete a project, there is no going back. Please be certain.</div>
  <button class="btn btn-destructive btn-sm" onclick="var b=this;var orig=b.textContent;b.disabled=true;b.textContent='Deleted!';setTimeout(function(){b.textContent=orig;b.disabled=false},2000)">Delete project</button>
</div>`,
        }],
      },
      {
        title: "With form inline",
        anatomy: "Title + text + inline form (input + button). Newsletter, invite, or quick-add patterns.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.5rem;max-width:560px">
  <div style="font-size:15px;font-weight:600;margin-bottom:4px">Subscribe to updates</div>
  <div style="font-size:13px;color:hsl(var(--muted-foreground));margin-bottom:1rem">We'll send you a weekly digest of what changed.</div>
  <div style="display:flex;gap:0.5rem;max-width:360px">
    <input class="input" type="email" placeholder="you@example.com" style="flex:1" />
    <button class="btn btn-default" onclick="var b=this;var inp=b.parentElement.querySelector('input');if(!inp.value){inp.style.borderColor='hsl(0 84% 60%)';inp.placeholder='Enter your email';setTimeout(function(){inp.style.borderColor='';inp.placeholder='you@example.com'},2000);return}b.disabled=true;b.textContent='Subscribed!';inp.disabled=true;setTimeout(function(){b.textContent='Subscribe';b.disabled=false;inp.disabled=false;inp.value=''},2000)">Subscribe</button>
  </div>
</div>`,
        }],
      },
      {
        title: "Side-by-side",
        anatomy: "Text on the left, actions on the right. For confirming destructive or irreversible operations.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.5rem;max-width:560px;display:flex;align-items:flex-start;gap:1.5rem">
  <div style="flex:1">
    <div style="font-size:15px;font-weight:600;margin-bottom:4px">Discard unsaved changes?</div>
    <div style="font-size:13px;color:hsl(var(--muted-foreground))">You have unsaved edits in this form. Leaving now will lose all progress.</div>
  </div>
  <div style="display:flex;gap:0.5rem;flex-shrink:0">
    <button class="btn btn-outline btn-sm" onclick="var card=this.closest('.section-card');card.style.opacity='0.5';setTimeout(function(){card.style.opacity='1'},1000)">Cancel</button>
    <button class="btn btn-destructive btn-sm" onclick="var b=this;b.disabled=true;b.textContent='Discarded!';setTimeout(function(){b.textContent='Discard';b.disabled=false},2000)">Discard</button>
  </div>
</div>`,
        }],
      },
      {
        title: "With toggle",
        anatomy: "Text on the left, toggle switch on the right. For feature flags, notification opt-ins.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.5rem;max-width:560px;display:flex;align-items:flex-start;justify-content:space-between;gap:1.5rem">
  <div style="flex:1">
    <div style="font-size:15px;font-weight:600;margin-bottom:4px">Two-factor authentication</div>
    <div style="font-size:13px;color:hsl(var(--muted-foreground))">Add an extra layer of security to your account by requiring a verification code on login.</div>
  </div>
  <button role="switch" aria-checked="true" onclick="var on=this.getAttribute('aria-checked')==='true';this.setAttribute('aria-checked',on?'false':'true');this.style.background=on?'hsl(var(--muted))':'hsl(var(--primary))';this.querySelector('span').style.transform=on?'translateX(0)':'translateX(20px)'" style="width:44px;height:24px;border-radius:9999px;border:none;background:hsl(var(--primary));cursor:pointer;position:relative;flex-shrink:0"><span style="position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:9999px;background:white;transform:translateX(20px);transition:transform 200ms;box-shadow:0 1px 3px hsl(var(--foreground)/0.15)"></span></button>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "description-lists",
    name: "Description Lists",
    description: "Key-value pairs in stacked, two-column, or inline-edit layouts. Used for detail panels, settings, and profile views.",
    category: "Molecules",
    sections: [
      {
        title: "Two-column",
        anatomy: "Fixed-width label (left), value (right). Best for dense reference data.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:640px">
  <div style="padding:1rem 1.5rem;border-bottom:1px solid hsl(var(--border))">
    <div style="font-size:15px;font-weight:600">Application details</div>
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">Personal information and credentials.</div>
  </div>
  <dl style="padding:0 1.5rem">
    <div style="display:grid;grid-template-columns:160px 1fr;gap:1rem;padding:0.875rem 0;border-bottom:1px solid hsl(var(--border));font-size:13.5px">
      <dt style="color:hsl(var(--muted-foreground))">Full name</dt>
      <dd>Rachel Chen</dd>
    </div>
    <div style="display:grid;grid-template-columns:160px 1fr;gap:1rem;padding:0.875rem 0;border-bottom:1px solid hsl(var(--border));font-size:13.5px">
      <dt style="color:hsl(var(--muted-foreground))">Email</dt>
      <dd>rachel.chen@example.com</dd>
    </div>
    <div style="display:grid;grid-template-columns:160px 1fr;gap:1rem;padding:0.875rem 0;border-bottom:1px solid hsl(var(--border));font-size:13.5px">
      <dt style="color:hsl(var(--muted-foreground))">Role</dt>
      <dd><span class="badge badge-secondary">admin</span></dd>
    </div>
    <div style="display:grid;grid-template-columns:160px 1fr;gap:1rem;padding:0.875rem 0;font-size:13.5px">
      <dt style="color:hsl(var(--muted-foreground))">Status</dt>
      <dd><span class="status-badge sb-success"><span class="dot"></span> Active</span></dd>
    </div>
  </dl>
</div>`,
        }],
      },
      {
        title: "With inline edit",
        anatomy: "Each row has a trailing 'Update' link. Clicking reveals an inline editor.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:640px">
  <div style="padding:1rem 1.5rem;border-bottom:1px solid hsl(var(--border))">
    <div style="font-size:15px;font-weight:600">Profile</div>
  </div>
  <dl style="padding:0 1.5rem" onclick="var btn=event.target.closest('button');if(!btn)return;var row=btn.closest('div[style*=grid]');var dd=row.querySelector('dd');if(btn.textContent==='Update'){var inp=document.createElement('input');inp.className='input';inp.style.cssText='font-size:13.5px;height:32px;padding:4px 8px';inp.value=dd.textContent;dd.textContent='';dd.appendChild(inp);inp.focus();btn.textContent='Save';btn.style.color='hsl(143 60% 38%)'}else{var inp=dd.querySelector('input');dd.textContent=inp?inp.value:dd.textContent;btn.textContent='Update';btn.style.color='hsl(var(--primary))'}">
    <div style="display:grid;grid-template-columns:160px 1fr auto;gap:1rem;padding:0.875rem 0;border-bottom:1px solid hsl(var(--border));font-size:13.5px;align-items:baseline">
      <dt style="color:hsl(var(--muted-foreground))">Name</dt>
      <dd>Rachel Chen</dd>
      <button class="btn btn-link btn-sm" style="color:hsl(var(--primary))">Update</button>
    </div>
    <div style="display:grid;grid-template-columns:160px 1fr auto;gap:1rem;padding:0.875rem 0;border-bottom:1px solid hsl(var(--border));font-size:13.5px;align-items:baseline">
      <dt style="color:hsl(var(--muted-foreground))">Email</dt>
      <dd>rachel.chen@example.com</dd>
      <button class="btn btn-link btn-sm" style="color:hsl(var(--primary))">Update</button>
    </div>
    <div style="display:grid;grid-template-columns:160px 1fr auto;gap:1rem;padding:0.875rem 0;font-size:13.5px;align-items:baseline">
      <dt style="color:hsl(var(--muted-foreground))">Title</dt>
      <dd>Senior Engineer</dd>
      <button class="btn btn-link btn-sm" style="color:hsl(var(--primary))">Update</button>
    </div>
  </dl>
</div>`,
          code: `<dl>
  <div style="display:grid;grid-template-columns:160px 1fr auto">
    <dt>Name</dt>
    <dd>Rachel Chen</dd>
    <button class="btn btn-link btn-sm">Update</button>
  </div>
  <!-- Click "Update" to toggle inline edit -->
</dl>`,
        }],
      },
      {
        title: "Stacked",
        anatomy: "Label above value. For narrow surfaces (sidebars, mobile views).",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:320px;padding:1.5rem">
  <dl style="display:flex;flex-direction:column;gap:1rem">
    <div>
      <dt style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:hsl(var(--muted-foreground));font-weight:500;margin-bottom:4px">Full name</dt>
      <dd style="font-size:13.5px">Rachel Chen</dd>
    </div>
    <div>
      <dt style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:hsl(var(--muted-foreground));font-weight:500;margin-bottom:4px">Email</dt>
      <dd style="font-size:13.5px">rachel.chen@example.com</dd>
    </div>
    <div>
      <dt style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:hsl(var(--muted-foreground));font-weight:500;margin-bottom:4px">Client ID</dt>
      <dd style="font-size:12.5px;font-family:var(--font-mono);word-break:break-all">clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF</dd>
    </div>
  </dl>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "feeds",
    name: "Feeds",
    description: "Vertical activity streams with icons and timestamps. Used for audit logs, change history, and notification lists.",
    category: "Molecules",
    sections: [
      {
        title: "With connector line",
        anatomy: "Chronological events connected by a vertical line. Icon circles indicate event type.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.5rem;max-width:560px">
  <ul style="list-style:none;padding:0;margin:0">
    <li style="position:relative;display:flex;gap:0.75rem;padding-bottom:1.5rem">
      <div style="position:absolute;left:13px;top:28px;bottom:0;width:1px;background:hsl(var(--border))"></div>
      <div style="width:28px;height:28px;border-radius:50%;background:hsl(var(--card));border:1px solid hsl(var(--border));display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div style="flex:1;padding-top:3px"><div style="font-size:13px"><span style="font-weight:600">Rachel Chen</span> <span style="color:hsl(var(--muted-foreground))">approved the request</span></div><div style="font-size:11.5px;color:hsl(var(--muted-foreground));margin-top:2px">2 hours ago</div></div>
    </li>
    <li style="position:relative;display:flex;gap:0.75rem;padding-bottom:1.5rem">
      <div style="position:absolute;left:13px;top:28px;bottom:0;width:1px;background:hsl(var(--border))"></div>
      <div style="width:28px;height:28px;border-radius:50%;background:hsl(var(--card));border:1px solid hsl(var(--border));display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></div>
      <div style="flex:1;padding-top:3px"><div style="font-size:13px"><span style="font-weight:600">Ada Lovelace</span> <span style="color:hsl(var(--muted-foreground))">updated the description</span></div><div style="font-size:11.5px;color:hsl(var(--muted-foreground));margin-top:2px">5 hours ago</div></div>
    </li>
    <li style="display:flex;gap:0.75rem">
      <div style="width:28px;height:28px;border-radius:50%;background:hsl(var(--card));border:1px solid hsl(var(--border));display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
      <div style="flex:1;padding-top:3px"><div style="font-size:13px"><span style="font-weight:600">System</span> <span style="color:hsl(var(--muted-foreground))">created the project</span></div><div style="font-size:11.5px;color:hsl(var(--muted-foreground));margin-top:2px">3 days ago</div></div>
    </li>
  </ul>
</div>`,
        }],
      },
      {
        title: "With avatar",
        anatomy: "Avatar replaces the icon circle for a more personal feel. Used in comment threads and team activity.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:560px">
  <div style="padding:1rem 1.25rem;border-bottom:1px solid hsl(var(--border));display:flex;align-items:flex-start;gap:0.75rem">
    <span class="avatar" style="flex-shrink:0"><img src="/rachel-chen.jpg" alt="RC"></span>
    <div style="flex:1;min-width:0"><div style="font-size:13px"><span style="font-weight:600">Rachel Chen</span> <span style="color:hsl(var(--muted-foreground))">commented on the pull request</span></div><div style="font-size:11.5px;color:hsl(var(--muted-foreground));margin-top:2px">2 hours ago</div></div>
  </div>
  <div style="padding:1rem 1.25rem;border-bottom:1px solid hsl(var(--border));display:flex;align-items:flex-start;gap:0.75rem">
    <span class="avatar" style="flex-shrink:0"><img src="/ada-lovelace.jpg" alt="AL"></span>
    <div style="flex:1;min-width:0"><div style="font-size:13px"><span style="font-weight:600">Ada Lovelace</span> <span style="color:hsl(var(--muted-foreground))">pushed 3 commits</span></div><div style="font-size:11.5px;color:hsl(var(--muted-foreground));margin-top:2px">5 hours ago</div></div>
  </div>
  <div style="padding:1rem 1.25rem;display:flex;align-items:flex-start;gap:0.75rem">
    <span class="avatar" style="flex-shrink:0">KT</span>
    <div style="flex:1;min-width:0"><div style="font-size:13px"><span style="font-weight:600">Kevin Turner</span> <span style="color:hsl(var(--muted-foreground))">opened the pull request</span></div><div style="font-size:11.5px;color:hsl(var(--muted-foreground));margin-top:2px">1 day ago</div></div>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "grid-lists",
    name: "Grid Lists",
    description: "Tiled card grids for people directories, item collections, and image galleries.",
    category: "Molecules",
    sections: [
      {
        title: "People (card grid)",
        anatomy: "Avatar + name + role + action buttons per card. Auto-fills columns based on available width.",
        examples: [{
          full: true,
          html: `<div style="display:grid;gap:0.875rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">
  <div class="section-card" style="padding:1.25rem;display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.5rem">
    <span class="avatar" style="width:64px;height:64px;font-size:24px"><img src="/rachel-chen.jpg" alt="RC"></span>
    <div style="font-size:14px;font-weight:600">Rachel Chen</div>
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">Engineering Lead</div>
    <div style="margin-top:0.75rem;display:flex;gap:0.5rem">
      <button class="btn btn-outline btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Sent!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Message</button>
      <button class="btn btn-ghost btn-sm" onclick="var b=this;b.style.background='hsl(var(--accent))';setTimeout(function(){b.style.background=''},300)">View</button>
    </div>
  </div>
  <div class="section-card" style="padding:1.25rem;display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.5rem">
    <span class="avatar" style="width:64px;height:64px;font-size:24px"><img src="/ada-lovelace.jpg" alt="AL"></span>
    <div style="font-size:14px;font-weight:600">Ada Lovelace</div>
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">Staff Engineer</div>
    <div style="margin-top:0.75rem;display:flex;gap:0.5rem">
      <button class="btn btn-outline btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Sent!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Message</button>
      <button class="btn btn-ghost btn-sm" onclick="var b=this;b.style.background='hsl(var(--accent))';setTimeout(function(){b.style.background=''},300)">View</button>
    </div>
  </div>
  <div class="section-card" style="padding:1.25rem;display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.5rem">
    <span class="avatar" style="width:64px;height:64px;font-size:24px">KT</span>
    <div style="font-size:14px;font-weight:600">Kevin Turner</div>
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">Product Designer</div>
    <div style="margin-top:0.75rem;display:flex;gap:0.5rem">
      <button class="btn btn-outline btn-sm" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Sent!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Message</button>
      <button class="btn btn-ghost btn-sm" onclick="var b=this;b.style.background='hsl(var(--accent))';setTimeout(function(){b.style.background=''},300)">View</button>
    </div>
  </div>
</div>`,
        }],
      },
      {
        title: "Image gallery",
        anatomy: "Aspect-ratio thumbnails with captions. Locked aspect ratio prevents layout shift.",
        examples: [{
          full: true,
          html: `<div style="display:grid;gap:0.75rem;grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">
  <div><div style="aspect-ratio:1;border-radius:var(--radius-md);overflow:hidden;background:linear-gradient(135deg,hsl(var(--primary)/0.3),hsl(var(--primary)/0.1))"></div><div style="margin-top:0.5rem"><div style="font-size:12.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">hero-banner.png</div><div style="font-size:11px;color:hsl(var(--muted-foreground))">1.2 MB</div></div></div>
  <div><div style="aspect-ratio:1;border-radius:var(--radius-md);overflow:hidden;background:linear-gradient(135deg,hsl(var(--chart-2)/0.3),hsl(var(--chart-2)/0.1))"></div><div style="margin-top:0.5rem"><div style="font-size:12.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">icon-set.svg</div><div style="font-size:11px;color:hsl(var(--muted-foreground))">340 KB</div></div></div>
  <div><div style="aspect-ratio:1;border-radius:var(--radius-md);overflow:hidden;background:linear-gradient(135deg,hsl(var(--chart-3)/0.3),hsl(var(--chart-3)/0.1))"></div><div style="margin-top:0.5rem"><div style="font-size:12.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">product-shot.jpg</div><div style="font-size:11px;color:hsl(var(--muted-foreground))">2.8 MB</div></div></div>
  <div><div style="aspect-ratio:1;border-radius:var(--radius-md);overflow:hidden;background:linear-gradient(135deg,hsl(var(--chart-4)/0.3),hsl(var(--chart-4)/0.1))"></div><div style="margin-top:0.5rem"><div style="font-size:12.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">avatar-default.png</div><div style="font-size:11px;color:hsl(var(--muted-foreground))">96 KB</div></div></div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "media-objects",
    name: "Media Objects",
    description: "Image or icon paired with text content. The fundamental building block for list items, notifications, and comment layouts.",
    category: "Molecules",
    sections: [
      {
        title: "With avatar",
        anatomy: "Avatar left, title + subtitle + body right. Independent heights.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.25rem;max-width:480px;display:flex;align-items:flex-start;gap:1rem">
  <span class="avatar" style="width:48px;height:48px;font-size:18px;flex-shrink:0"><img src="/rachel-chen.jpg" alt="RC"></span>
  <div style="flex:1;min-width:0">
    <div style="font-size:14.5px;font-weight:600">Rachel Chen</div>
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">Engineering Lead</div>
    <div style="margin-top:0.5rem;font-size:13px;line-height:1.6">Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging.</div>
  </div>
</div>`,
        }],
      },
      {
        title: "With icon",
        anatomy: "Colored icon box + title + description. Used for feature grids and benefits sections.",
        columns: 2,
        examples: [
          {
            html: `<div class="section-card" style="padding:1rem;display:flex;align-items:flex-start;gap:0.75rem">
  <div style="width:36px;height:36px;border-radius:var(--radius-md);background:hsl(var(--primary)/0.15);color:hsl(var(--primary));display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
  <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">Security first</div><div style="font-size:12px;color:hsl(var(--muted-foreground));margin-top:2px;line-height:1.5">End-to-end encryption with automatic key rotation.</div></div>
</div>`,
          },
          {
            html: `<div class="section-card" style="padding:1rem;display:flex;align-items:flex-start;gap:0.75rem">
  <div style="width:36px;height:36px;border-radius:var(--radius-md);background:hsl(var(--chart-2)/0.15);color:hsl(var(--chart-2));display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
  <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">Real-time analytics</div><div style="font-size:12px;color:hsl(var(--muted-foreground));margin-top:2px;line-height:1.5">Live dashboards with sub-second refresh latency.</div></div>
</div>`,
          },
        ],
      },
      {
        title: "With trailing action",
        anatomy: "Avatar (left), text (middle), action button (right). Common in team lists and notification rows.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1rem;max-width:480px;display:flex;align-items:center;gap:0.75rem">
  <span class="avatar" style="width:40px;height:40px;font-size:16px;flex-shrink:0"><img src="/ada-lovelace.jpg" alt="AL"></span>
  <div style="flex:1;min-width:0">
    <div style="font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Ada Lovelace</div>
    <div style="font-size:12px;color:hsl(var(--muted-foreground));overflow:hidden;text-overflow:ellipsis;white-space:nowrap">ada@example.com</div>
  </div>
  <button class="btn btn-outline btn-sm" style="flex-shrink:0" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Invited!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Invite</button>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "stacked-lists",
    name: "Stacked Lists",
    description: "Vertical lists with avatar, two-line items, and trailing metadata. Used for contacts, activity feeds, and data previews.",
    category: "Molecules",
    sections: [
      {
        title: "Two-line with avatar",
        anatomy: "Avatar + primary text over secondary text, divider between rows.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:560px">
  <div style="padding:0.75rem 1.25rem;display:flex;align-items:center;gap:0.75rem;border-bottom:1px solid hsl(var(--border))">
    <span class="avatar" style="flex-shrink:0"><img src="/rachel-chen.jpg" alt="RC"></span>
    <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Rachel Chen</div><div style="font-size:12px;color:hsl(var(--muted-foreground));overflow:hidden;text-overflow:ellipsis;white-space:nowrap">rachel.chen@example.com</div></div>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">admin</span>
  </div>
  <div style="padding:0.75rem 1.25rem;display:flex;align-items:center;gap:0.75rem;border-bottom:1px solid hsl(var(--border))">
    <span class="avatar" style="flex-shrink:0"><img src="/ada-lovelace.jpg" alt="AL"></span>
    <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Ada Lovelace</div><div style="font-size:12px;color:hsl(var(--muted-foreground));overflow:hidden;text-overflow:ellipsis;white-space:nowrap">ada@example.com</div></div>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">editor</span>
  </div>
  <div style="padding:0.75rem 1.25rem;display:flex;align-items:center;gap:0.75rem">
    <span class="avatar" style="flex-shrink:0">KT</span>
    <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Kevin Turner</div><div style="font-size:12px;color:hsl(var(--muted-foreground));overflow:hidden;text-overflow:ellipsis;white-space:nowrap">kevin@example.com</div></div>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">viewer</span>
  </div>
</div>`,
        }],
      },
      {
        title: "With trailing meta + chevron",
        anatomy: "Clickable rows: hover background, trailing chevron indicates drilldown.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:560px">
  <a href="#" style="padding:0.75rem 1.25rem;display:flex;align-items:center;gap:0.75rem;border-bottom:1px solid hsl(var(--border));text-decoration:none;color:inherit" onmouseover="this.style.background='hsl(var(--accent))'" onmouseout="this.style.background=''">
    <span class="avatar" style="flex-shrink:0"><img src="/rachel-chen.jpg" alt="RC"></span>
    <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Rachel Chen</div><div style="font-size:12px;color:hsl(var(--muted-foreground));overflow:hidden;text-overflow:ellipsis;white-space:nowrap">rachel.chen@example.com</div></div>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">2h ago</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  </a>
  <a href="#" style="padding:0.75rem 1.25rem;display:flex;align-items:center;gap:0.75rem;border-bottom:1px solid hsl(var(--border));text-decoration:none;color:inherit" onmouseover="this.style.background='hsl(var(--accent))'" onmouseout="this.style.background=''">
    <span class="avatar" style="flex-shrink:0"><img src="/ada-lovelace.jpg" alt="AL"></span>
    <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Ada Lovelace</div><div style="font-size:12px;color:hsl(var(--muted-foreground));overflow:hidden;text-overflow:ellipsis;white-space:nowrap">ada@example.com</div></div>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">5h ago</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  </a>
  <a href="#" style="padding:0.75rem 1.25rem;display:flex;align-items:center;gap:0.75rem;text-decoration:none;color:inherit" onmouseover="this.style.background='hsl(var(--accent))'" onmouseout="this.style.background=''">
    <span class="avatar" style="flex-shrink:0">KT</span>
    <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Kevin Turner</div><div style="font-size:12px;color:hsl(var(--muted-foreground));overflow:hidden;text-overflow:ellipsis;white-space:nowrap">kevin@example.com</div></div>
    <span style="font-size:12px;color:hsl(var(--muted-foreground))">1d ago</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  </a>
</div>`,
        }],
      },
      {
        title: "Card surface group",
        anatomy: "Header with title + action button, list items inside card surface.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="max-width:560px">
  <div style="padding:0.75rem 1.25rem;border-bottom:1px solid hsl(var(--border));display:flex;align-items:center;justify-content:space-between">
    <span style="font-size:13px;font-weight:600">Team members</span>
    <button class="btn btn-outline btn-sm" onclick="var b=this;var o=b.innerHTML;b.disabled=true;b.textContent='Added!';setTimeout(function(){b.innerHTML=o;b.disabled=false},2000)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add</button>
  </div>
  <div style="padding:0.75rem 1.25rem;display:flex;align-items:center;gap:0.75rem;border-bottom:1px solid hsl(var(--border))">
    <span class="avatar" style="flex-shrink:0"><img src="/rachel-chen.jpg" alt="RC"></span>
    <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">Rachel Chen</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">Engineering Lead</div></div>
    <button class="btn btn-ghost btn-sm" style="height:28px;padding:0 8px" onclick="var b=this;b.style.background='hsl(var(--accent))';setTimeout(function(){b.style.background=''},300)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
  </div>
  <div style="padding:0.75rem 1.25rem;display:flex;align-items:center;gap:0.75rem">
    <span class="avatar" style="flex-shrink:0"><img src="/ada-lovelace.jpg" alt="AL"></span>
    <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:600">Ada Lovelace</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">Staff Engineer</div></div>
    <button class="btn btn-ghost btn-sm" style="height:28px;padding:0 8px" onclick="var b=this;b.style.background='hsl(var(--accent))';setTimeout(function(){b.style.background=''},300)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
  </div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "stats",
    name: "Stats",
    description: "Single value, grouped row, with sparkline, with comparison. Used for dashboards and overview pages.",
    category: "Molecules",
    sections: [
      {
        title: "Single",
        anatomy: "One metric card: title, value, and a delta with a comparison label.",
        examples: [{
          full: true,
          html: `<div class="stat-card" style="max-width:280px">
  <div class="stat-card-label">Active users</div>
  <div class="stat-card-value">71,897</div>
  <div class="stat-card-delta" style="color:hsl(142 71% 45%)">+12.3% <span style="color:hsl(var(--muted-foreground));font-weight:400">vs. last 30 days</span></div>
</div>`,
        }],
      },
      {
        title: "Group",
        anatomy: "Three or four metric cards in a responsive row. Auto-fit layout with 220px minimum.",
        examples: [{
          full: true,
          html: `<div style="display:grid;gap:0.875rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
  <div class="stat-card">
    <div class="stat-card-label">Total users</div>
    <div class="stat-card-value">12,847</div>
    <div class="stat-card-delta" style="color:hsl(142 71% 45%)">+12.5%</div>
  </div>
  <div class="stat-card">
    <div class="stat-card-label">Active sessions</div>
    <div class="stat-card-value">1,024</div>
    <div class="stat-card-delta" style="color:hsl(142 71% 45%)">+3.2%</div>
  </div>
  <div class="stat-card">
    <div class="stat-card-label">Error rate</div>
    <div class="stat-card-value">0.12%</div>
    <div class="stat-card-delta" style="color:hsl(0 84% 60%)">+0.03%</div>
  </div>
</div>`,
        }],
      },
      {
        title: "Plain (no border)",
        anatomy: "When stats live inside a parent surface, drop border and radius. Just number stacks.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.5rem">
  <div style="font-size:15px;font-weight:600;margin-bottom:1rem">Key metrics</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:1.5rem">
    <div><div style="font-size:12px;color:hsl(var(--muted-foreground));margin-bottom:4px">Revenue</div><div style="font-size:24px;font-weight:600;letter-spacing:-0.02em">$48.2k</div></div>
    <div><div style="font-size:12px;color:hsl(var(--muted-foreground));margin-bottom:4px">Orders</div><div style="font-size:24px;font-weight:600;letter-spacing:-0.02em">842</div></div>
    <div><div style="font-size:12px;color:hsl(var(--muted-foreground));margin-bottom:4px">Avg. value</div><div style="font-size:24px;font-weight:600;letter-spacing:-0.02em">$57.24</div></div>
    <div><div style="font-size:12px;color:hsl(var(--muted-foreground));margin-bottom:4px">Conversion</div><div style="font-size:24px;font-weight:600;letter-spacing:-0.02em">3.6%</div></div>
  </div>
</div>`,
        }],
      },
      {
        title: "With sparkline",
        anatomy: "Value + inline SVG sparkline with gradient fill. Shows trend direction at a glance.",
        examples: [{
          full: true,
          html: `<div style="display:grid;gap:0.875rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
  <div class="stat-card">
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">Requests</div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;margin-top:4px"><span style="font-size:24px;font-weight:600">24.5k</span><span style="font-size:11px;font-family:var(--font-mono);color:hsl(142 71% 45%)">+8.2%</span></div>
    <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none" style="margin-top:8px;display:block"><defs><linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(var(--primary))" stop-opacity="0.3"/><stop offset="100%" stop-color="hsl(var(--primary))" stop-opacity="0"/></linearGradient></defs><polygon points="0,20 20,16 40,18 60,12 80,14 100,8 120,10 140,6 160,8 180,4 200,2 200,24 0,24" fill="url(#sg1)"/><polyline points="0,20 20,16 40,18 60,12 80,14 100,8 120,10 140,6 160,8 180,4 200,2" fill="none" stroke="hsl(var(--primary))" stroke-width="1.5"/></svg>
  </div>
  <div class="stat-card">
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">Latency</div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;margin-top:4px"><span style="font-size:24px;font-weight:600">142ms</span><span style="font-size:11px;font-family:var(--font-mono);color:hsl(0 84% 60%)">+12ms</span></div>
    <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none" style="margin-top:8px;display:block"><defs><linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(0 84% 60%)" stop-opacity="0.3"/><stop offset="100%" stop-color="hsl(0 84% 60%)" stop-opacity="0"/></linearGradient></defs><polygon points="0,18 20,16 40,14 60,12 80,10 100,12 120,8 140,6 160,4 180,2 200,4 200,24 0,24" fill="url(#sg2)"/><polyline points="0,18 20,16 40,14 60,12 80,10 100,12 120,8 140,6 160,4 180,2 200,4" fill="none" stroke="hsl(0 84% 60%)" stroke-width="1.5"/></svg>
  </div>
</div>`,
        }],
      },
    ],
  },

  // ─── New Organisms ─────────────────────────────────────────────────────

  {
    slug: "charts",
    name: "Charts",
    description: "Sparklines, bars, gauges, heatmaps. All SVG, all token-themed. No charting library required.",
    category: "Organisms",
    sections: [
      {
        title: "Overview",
        description: "Every chart in Canvas is plain SVG or CSS using the same color tokens as the rest of the system. No charting library: visuals respond to accent, dark mode, and glass without any data layer. Use them when your data is small enough to inline; for dozens of series or interactive brushing, reach for d3/recharts and theme it with the same tokens.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.25rem;max-width:680px">
  <p style="margin:0;font-size:13.5px;color:hsl(var(--muted-foreground));line-height:1.6">The charts below are derived from real dashboard widgets, pulled out and isolated so the patterns are obvious. Each is themed entirely by Canvas tokens, so the same markup adapts to light, dark, and glass surfaces.</p>
</div>`,
        }],
      },
      {
        title: "Bar chart - discrete buckets",
        anatomy: "Each bar is a flex item; the last bar gets a brighter fill to highlight 'now'. Axis labels are a separate flex row below.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.25rem;max-width:560px">
  <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:0.75rem"><span style="font-size:15px;font-weight:600">Signups</span><span style="font-size:12px;color:hsl(var(--muted-foreground))">642 total</span></div>
  <div style="display:flex;align-items:flex-end;gap:3px;height:140px">
    <div style="flex:1;border-radius:2px;background:hsl(var(--primary)/0.3);height:45%"></div>
    <div style="flex:1;border-radius:2px;background:hsl(var(--primary)/0.3);height:60%"></div>
    <div style="flex:1;border-radius:2px;background:hsl(var(--primary)/0.3);height:35%"></div>
    <div style="flex:1;border-radius:2px;background:hsl(var(--primary)/0.3);height:70%"></div>
    <div style="flex:1;border-radius:2px;background:hsl(var(--primary)/0.3);height:55%"></div>
    <div style="flex:1;border-radius:2px;background:hsl(var(--primary)/0.3);height:80%"></div>
    <div style="flex:1;border-radius:2px;background:hsl(var(--primary));height:95%"></div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:0.5rem;font-size:11px;color:hsl(var(--muted-foreground));font-family:var(--font-mono)"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
</div>`,
        }],
      },
      {
        title: "Sparkline - direction + magnitude",
        anatomy: "Polyline + gradient-filled polygon. The last value gets a dot. Use for stat cards or row-level trends where space is tight.",
        examples: [{
          full: true,
          html: `<div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
  <div class="stat-card">
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">Tokens issued</div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;margin-top:4px"><span style="font-size:22px;font-weight:600">4,847</span><span style="font-size:11px;font-family:var(--font-mono);color:hsl(var(--primary))">+12%</span></div>
    <svg width="100%" height="34" viewBox="0 0 200 34" preserveAspectRatio="none" style="margin-top:8px;display:block;overflow:visible"><defs><linearGradient id="spk1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(var(--primary))" stop-opacity="0.3"/><stop offset="100%" stop-color="hsl(var(--primary))" stop-opacity="0"/></linearGradient></defs><polygon points="0,28 20,26 40,22 60,24 80,18 100,14 120,16 140,9 160,11 180,5 200,3 200,34 0,34" fill="url(#spk1)"/><polyline points="0,28 20,26 40,22 60,24 80,18 100,14 120,16 140,9 160,11 180,5 200,3" fill="none" stroke="hsl(var(--primary))" stroke-width="1.5"/><circle cx="200" cy="3" r="2.5" fill="hsl(var(--primary))"/></svg>
  </div>
  <div class="stat-card">
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">Active sessions</div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;margin-top:4px"><span style="font-size:22px;font-weight:600">1,204</span><span style="font-size:11px;font-family:var(--font-mono);color:hsl(173 70% 42%)">+8%</span></div>
    <svg width="100%" height="34" viewBox="0 0 200 34" preserveAspectRatio="none" style="margin-top:8px;display:block;overflow:visible"><defs><linearGradient id="spk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(173 70% 42%)" stop-opacity="0.3"/><stop offset="100%" stop-color="hsl(173 70% 42%)" stop-opacity="0"/></linearGradient></defs><polygon points="0,22 20,24 40,18 60,20 80,15 100,17 120,11 140,13 160,8 180,10 200,6 200,34 0,34" fill="url(#spk2)"/><polyline points="0,22 20,24 40,18 60,20 80,15 100,17 120,11 140,13 160,8 180,10 200,6" fill="none" stroke="hsl(173 70% 42%)" stroke-width="1.5"/><circle cx="200" cy="6" r="2.5" fill="hsl(173 70% 42%)"/></svg>
  </div>
  <div class="stat-card">
    <div style="font-size:12px;color:hsl(var(--muted-foreground))">Error rate</div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;margin-top:4px"><span style="font-size:22px;font-weight:600">0.42%</span><span style="font-size:11px;font-family:var(--font-mono);color:hsl(0 80% 60%)">-3%</span></div>
    <svg width="100%" height="34" viewBox="0 0 200 34" preserveAspectRatio="none" style="margin-top:8px;display:block;overflow:visible"><defs><linearGradient id="spk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(0 80% 60%)" stop-opacity="0.3"/><stop offset="100%" stop-color="hsl(0 80% 60%)" stop-opacity="0"/></linearGradient></defs><polygon points="0,8 20,10 40,9 60,14 80,12 100,16 120,15 140,19 160,17 180,21 200,24 200,34 0,34" fill="url(#spk3)"/><polyline points="0,8 20,10 40,9 60,14 80,12 100,16 120,15 140,19 160,17 180,21 200,24" fill="none" stroke="hsl(0 80% 60%)" stroke-width="1.5"/><circle cx="200" cy="24" r="2.5" fill="hsl(0 80% 60%)"/></svg>
  </div>
</div>`,
        }],
      },
      {
        title: "Stacked bar - proportional breakdown",
        anatomy: "Single thin bar divided by percentage. Legend below with colored dots. Use when you want a quick visual sense of distribution.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.25rem;max-width:560px">
  <div style="font-size:15px;font-weight:600;margin-bottom:4px">Traffic sources</div>
  <div style="font-size:12px;color:hsl(var(--muted-foreground));margin-bottom:1rem">Breakdown by channel</div>
  <div style="display:flex;height:10px;border-radius:9999px;overflow:hidden;margin-bottom:0.875rem;background:hsl(var(--muted))">
    <div style="width:42%;background:hsl(var(--primary))"></div>
    <div style="width:28%;background:hsl(var(--chart-2))"></div>
    <div style="width:18%;background:hsl(var(--chart-3))"></div>
    <div style="width:12%;background:hsl(var(--chart-4))"></div>
  </div>
  <div style="display:flex;flex-direction:column;gap:0.5rem">
    <div style="display:flex;align-items:center;gap:0.625rem;font-size:13px"><span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--primary));flex-shrink:0"></span><span style="flex:1">Direct</span><span style="font-family:var(--font-mono);font-size:12px;color:hsl(var(--muted-foreground))">42%</span></div>
    <div style="display:flex;align-items:center;gap:0.625rem;font-size:13px"><span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--chart-2));flex-shrink:0"></span><span style="flex:1">Organic search</span><span style="font-family:var(--font-mono);font-size:12px;color:hsl(var(--muted-foreground))">28%</span></div>
    <div style="display:flex;align-items:center;gap:0.625rem;font-size:13px"><span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--chart-3));flex-shrink:0"></span><span style="flex:1">Social</span><span style="font-family:var(--font-mono);font-size:12px;color:hsl(var(--muted-foreground))">18%</span></div>
    <div style="display:flex;align-items:center;gap:0.625rem;font-size:13px"><span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--chart-4));flex-shrink:0"></span><span style="flex:1">Referral</span><span style="font-family:var(--font-mono);font-size:12px;color:hsl(var(--muted-foreground))">12%</span></div>
  </div>
</div>`,
        }],
      },
      {
        title: "Gauge - single percentage",
        anatomy: "Two concentric arcs (track + fill). Big numeric in the middle, label below.",
        examples: [{
          full: true,
          html: `<div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
  <div class="section-card" style="padding:1.25rem;display:flex;align-items:center;justify-content:center">
    <svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="56" fill="none" stroke="hsl(var(--muted))" stroke-width="12"/><circle cx="70" cy="70" r="56" fill="none" stroke="hsl(var(--primary))" stroke-width="12" stroke-dasharray="${56*2*Math.PI}" stroke-dashoffset="${56*2*Math.PI*(1-0.73)}" stroke-linecap="round" transform="rotate(-90 70 70)"/><text x="70" y="66" text-anchor="middle" font-size="28" font-weight="700" fill="hsl(var(--foreground))">73%</text><text x="70" y="84" text-anchor="middle" font-size="11" fill="hsl(var(--muted-foreground))">Uptime</text></svg>
  </div>
  <div class="section-card" style="padding:1.25rem;display:flex;align-items:center;justify-content:center">
    <svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="56" fill="none" stroke="hsl(var(--muted))" stroke-width="12"/><circle cx="70" cy="70" r="56" fill="none" stroke="hsl(var(--chart-2))" stroke-width="12" stroke-dasharray="${56*2*Math.PI}" stroke-dashoffset="${56*2*Math.PI*(1-0.45)}" stroke-linecap="round" transform="rotate(-90 70 70)"/><text x="70" y="66" text-anchor="middle" font-size="28" font-weight="700" fill="hsl(var(--foreground))">45%</text><text x="70" y="84" text-anchor="middle" font-size="11" fill="hsl(var(--muted-foreground))">Storage</text></svg>
  </div>
  <div class="section-card" style="padding:1.25rem;display:flex;align-items:center;justify-content:center">
    <svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="56" fill="none" stroke="hsl(var(--muted))" stroke-width="12"/><circle cx="70" cy="70" r="56" fill="none" stroke="hsl(0 84% 60%)" stroke-width="12" stroke-dasharray="${56*2*Math.PI}" stroke-dashoffset="${56*2*Math.PI*(1-0.89)}" stroke-linecap="round" transform="rotate(-90 70 70)"/><text x="70" y="66" text-anchor="middle" font-size="28" font-weight="700" fill="hsl(var(--foreground))">89%</text><text x="70" y="84" text-anchor="middle" font-size="11" fill="hsl(var(--muted-foreground))">CPU</text></svg>
  </div>
</div>`,
        }],
      },
      {
        title: "Heatmap - density grid",
        anatomy: "2D grid of cells, alpha mapped to value. Use for activity over time (day x hour, week x day). Always ship with a discrete legend.",
        examples: [{
          full: true,
          html: `<div class="section-card" style="padding:1.25rem;max-width:480px">
  <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:1rem"><div><div style="font-size:15px;font-weight:600">Token issuance</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">14 days, darker = more</div></div></div>
  <div style="display:grid;grid-template-columns:repeat(14,1fr);gap:3px"><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.31)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.54)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.77)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.89)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.85)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.68)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.47)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.30)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.20)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.17)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.17)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.20)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.25)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.29)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.21)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.36)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.59)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.82)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.95)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.89)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.69)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.45)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.25)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.15)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.12)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.11)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.13)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.18)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.19)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.26)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.39)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.58)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.77)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.87)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.81)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.63)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.39)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.21)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.12)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.10)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.10)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.11)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.29)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.27)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.30)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.38)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.49)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.62)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.69)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.65)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.51)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.33)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.19)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.12)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.10)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.10)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.52)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.43)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.35)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.31)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.32)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.36)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.42)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.48)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.48)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.41)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.29)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.19)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.13)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.11)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.79)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.70)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.54)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.39)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.28)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.23)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.23)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.25)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.30)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.33)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.33)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.29)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.22)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.17)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.87)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.92)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.81)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.60)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.38)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.23)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.16)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.14)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.15)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.19)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.24)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.30)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.33)"></span><span style="aspect-ratio:1;border-radius:2px;background:hsl(var(--primary)/0.31)"></span></div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.75rem;font-size:11.5px;color:hsl(var(--muted-foreground));font-family:var(--font-mono)"><span>14d ago</span><span style="display:inline-flex;align-items:center;gap:6px"><span>less</span><span style="width:12px;height:12px;border-radius:3px;background:hsl(var(--primary)/0.1)"></span><span style="width:12px;height:12px;border-radius:3px;background:hsl(var(--primary)/0.3)"></span><span style="width:12px;height:12px;border-radius:3px;background:hsl(var(--primary)/0.55)"></span><span style="width:12px;height:12px;border-radius:3px;background:hsl(var(--primary)/0.8)"></span><span style="width:12px;height:12px;border-radius:3px;background:hsl(var(--primary))"></span><span>more</span></span></div>
</div>`,
        }],
      },
    ],
  },

  {
    slug: "navbars",
    name: "Navbars",
    description: "Topbars with navigation links, search, and action buttons. Used as the primary app-level navigation.",
    category: "Organisms",
    sections: [
      {
        title: "Standard topbar",
        anatomy: "Logo + nav links + actions. The canonical Canvas navigation bar.",
        examples: [{
          full: true,
          html: `<div style="border:1px solid hsl(var(--border));border-radius:var(--radius-lg);overflow:hidden">
  <header class="topbar" style="position:static">
    <div style="display:flex;align-items:center;gap:0.5rem">
      <div style="width:24px;height:24px;border-radius:50%;background:hsl(var(--primary));display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 100 100" fill="white"><circle cx="50" cy="50" r="20"/></svg></div>
      <span style="font-size:14px;font-weight:600">Canvas</span>
    </div>
    <nav style="display:flex;gap:4px;margin-left:1rem" onclick="if(!event.target.classList.contains('navlink'))return;event.preventDefault();this.querySelectorAll('.navlink').forEach(a=>a.classList.remove('active'));event.target.classList.add('active')">
      <a class="navlink active" href="#">Dashboard</a>
      <a class="navlink" href="#">Users</a>
      <a class="navlink" href="#">Settings</a>
    </nav>
    <div style="flex:1"></div>
    <button class="btn btn-ghost btn-icon" onclick="var b=this;b.style.background='hsl(var(--accent))';setTimeout(function(){b.style.background=''},300)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button>
    <button class="btn btn-ghost btn-icon" onclick="var b=this;b.style.background='hsl(var(--accent))';setTimeout(function(){b.style.background=''},300)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
    <span class="avatar"><img src="/rachel-chen.jpg" alt="RC"></span>
  </header>
</div>`,
        }],
      },
      {
        title: "With search bar",
        anatomy: "Inline search command in the middle of the bar. Triggers the command palette on click.",
        examples: [{
          full: true,
          html: `<div style="border:1px solid hsl(var(--border));border-radius:var(--radius-lg);overflow:hidden">
  <header class="topbar" style="position:static">
    <div style="display:flex;align-items:center;gap:0.5rem">
      <div style="width:24px;height:24px;border-radius:50%;background:hsl(var(--primary));display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 100 100" fill="white"><circle cx="50" cy="50" r="20"/></svg></div>
      <span style="font-size:14px;font-weight:600">Canvas</span>
    </div>
    <div style="flex:1;max-width:400px;margin:0 1rem">
      <button style="width:100%;display:flex;align-items:center;gap:0.5rem;height:34px;padding:0 0.625rem;background:hsl(var(--card));border:1px solid hsl(var(--border));border-radius:var(--radius-md);color:hsl(var(--muted-foreground));font-size:13px;font-family:inherit;cursor:pointer" onclick="var b=this;b.style.borderColor='hsl(var(--primary))';b.style.boxShadow='0 0 0 2px hsl(var(--ring))';setTimeout(function(){b.style.borderColor='';b.style.boxShadow=''},400)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span style="flex:1;text-align:left">Search…</span>
        <span class="kbd">⌘K</span>
      </button>
    </div>
    <div style="flex:1"></div>
    <button class="btn btn-ghost btn-icon" onclick="var b=this;b.style.background='hsl(var(--accent))';setTimeout(function(){b.style.background=''},300)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
    <span class="avatar"><img src="/rachel-chen.jpg" alt="RC"></span>
  </header>
</div>`,
        }],
      },
      {
        title: "Mobile",
        anatomy: "Nav collapses to hamburger below md breakpoint. Logo + avatar remain visible.",
        examples: [{
          full: true,
          html: `<div style="border:1px solid hsl(var(--border));border-radius:var(--radius-lg);overflow:hidden;max-width:360px">
  <header class="topbar" style="position:static">
    <button class="btn btn-ghost btn-icon" onclick="var nav=this.closest('div[style*=max-width]').querySelector('[data-mobilenav]');nav.style.display=nav.style.display==='none'?'block':'none'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></button>
    <div style="display:flex;align-items:center;gap:0.5rem">
      <div style="width:20px;height:20px;border-radius:50%;background:hsl(var(--primary));display:flex;align-items:center;justify-content:center"><svg width="12" height="12" viewBox="0 0 100 100" fill="white"><circle cx="50" cy="50" r="20"/></svg></div>
      <span style="font-size:13px;font-weight:600">Canvas</span>
    </div>
    <div style="flex:1"></div>
    <span class="avatar" style="width:28px;height:28px;font-size:11px"><img src="/rachel-chen.jpg" alt="RC"></span>
  </header>
  <nav data-mobilenav style="display:none;padding:0.5rem;border-top:1px solid hsl(var(--border));background:hsl(var(--card))" onclick="if(!event.target.classList.contains('navlink'))return;event.preventDefault();this.querySelectorAll('.navlink').forEach(a=>a.classList.remove('active'));event.target.classList.add('active')">
    <a class="navlink active" href="#" style="display:block;padding:0.5rem 0.75rem">Dashboard</a>
    <a class="navlink" href="#" style="display:block;padding:0.5rem 0.75rem">Users</a>
    <a class="navlink" href="#" style="display:block;padding:0.5rem 0.75rem">Settings</a>
  </nav>
</div>`,
        }],
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
