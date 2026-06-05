// Composite previews for the playground, single source of truth.
//
// A few playground options are genuinely a composition of several components,
// not a single one, and no single Canvas component models the shape: an avatar
// stack, a badge identity row, a key combo, a radio group, a stat card. Each is
// an `El` descriptor tree (jsx-code.ts) the playground BOTH renders
// (registry.renderTree) AND serializes (serializeTree), so the preview and the
// shown code come from one description.
//
// NOTE: options that are really a single flagship component missing a feature
// (DataTable density, Dialog size, Tabs vertical, a Chart mode) are NOT here,
// they are fixed by adding a real boolean-axis prop to that component so the
// playground shows <DataTable .../> etc., never a hand-rebuilt primitive tree.

import type { El } from "@/jsx-code";

type TreeFn = (s: Record<string, unknown>) => El | null;

export const TREES: Record<string, TreeFn> = {

  badge: (s) => {
    if (s.kind === "identity") {
      return {
        type: "Box",
        props: { className: "flex-row flex-wrap items-center gap-2" },
        children: [
          { type: "Text", props: { className: "text-[15px] font-semibold text-foreground" }, children: "Rachel Chen" },
          { type: "Badge", props: { status: true, success: true }, children: "active" },
          { type: "Badge", props: { status: true, info: true }, children: "Verified" },
          { type: "Badge", props: { secondary: true }, children: "employee" },
        ],
      };
    }
    if (s.kind === "grants") {
      return {
        type: "Box",
        props: { className: "flex-row flex-wrap gap-1" },
        children: ["authorization_code", "refresh_token", "client_credentials"].map((g) => ({
          type: "Badge",
          props: { secondary: true, mono: true },
          children: g,
        })),
      };
    }
    return null;
  },

  avatar: (s) => {
  if (s.variant === "stacked") {
    const people = [
      { name: "RC", src: "/rachel-chen.jpg" },
      { name: "LB", src: "/liang-bao.jpg" },
      { name: "AO", src: undefined },
      { name: "KT", src: "/kira-tanaka.jpg" },
    ];
    return {
      type: "Box",
      props: { className: "flex-row items-center" },
      children: [
        ...people.map((p, i) => ({
          type: "Avatar",
          props: {
            ring: true,
            src: p.src,
            name: p.name,
            className: i > 0 ? "-ml-3" : undefined,
          },
        })),
        ...(s.overflow
          ? [
              {
                type: "Text",
                props: { className: "ml-1.5 text-xs text-muted-foreground" },
                children: "+12",
              },
            ]
          : []),
      ],
    };
  }
  if (s.variant === "topbar") {
    return {
      type: "Box",
      props: {
        className:
          "flex-row items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5",
      },
      children: [
        { type: "Avatar", props: { small: true, src: "/marcus-allen.jpg", name: "MA" } },
        {
          type: "Text",
          props: { className: "text-sm font-medium text-foreground" },
          children: "admin@example.com",
        },
        { type: "Icon", props: { chevronDown: true, muted: true, size: 12 } },
      ],
    };
  }
  if (s.variant === "identity") {
    return {
      type: "Box",
      props: { className: "flex-row items-center gap-4" },
      children: [
        { type: "Avatar", props: { src: "/rachel-chen.jpg", name: "RC" } },
        {
          type: "Box",
          children: [
            {
              type: "Text",
              props: { className: "text-base font-semibold text-foreground" },
              children: "Rachel Chen",
            },
            {
              type: "Text",
              props: { className: "text-sm text-muted-foreground" },
              children: "rachel.chen@example.com",
            },
          ],
        },
      ],
    };
  }
  if (s.variant === "menu") {
    return {
      type: "Box",
      props: { className: "flex-row items-center gap-3 border-b border-border pb-3" },
      children: [
        { type: "Avatar", props: { src: "/ada-lovelace.jpg", name: "AL" } },
        {
          type: "Box",
          children: [
            {
              type: "Text",
              props: { className: "text-sm font-semibold text-foreground" },
              children: "Ada Lovelace",
            },
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "admin@example.com",
            },
          ],
        },
      ],
    };
  }
  return null;
},

  breadcrumb: (s) => {
  if (s.pageHeader === true) {
    return {
      type: "Box",
      props: { className: "flex-row flex-wrap items-start justify-between gap-4" },
      children: [
        {
          type: "Box",
          children: [
            {
              type: "Box",
              props: { className: "mb-2" },
              children: [
                {
                  type: "Breadcrumb",
                  props: { items: ["Users", "Rachel Chen"] },
                },
              ],
            },
            {
              type: "Text",
              props: { className: "text-2xl font-semibold tracking-tight text-foreground" },
              children: "Rachel Chen",
            },
          ],
        },
        {
          type: "Box",
          props: { className: "flex-row items-center gap-2" },
          children: [
            { type: "Button", props: { outline: true, small: true }, children: "Edit" },
            { type: "Button", props: { primary: true, small: true }, children: "Save" },
          ],
        },
      ],
    };
  }
  return null;
},

  calendar: (s) => {
  if (s.variant === "events") {
    const events = [
      { title: "Sprint planning", time: "9:00 AM" },
      { title: "Design review", time: "11:30 AM" },
      { title: "1:1 with manager", time: "2:00 PM" },
    ];
    return {
      type: "Box",
      props: { className: "flex-row flex-wrap items-start gap-6" },
      children: [
        {
          type: "Calendar",
          props: {
            month: "May 2026",
            today: 23,
            selected: 24,
            daysInMonth: 31,
            startWeekday: 4,
          },
        },
        {
          type: "Card",
          props: { className: "min-w-[240px] flex-1" },
          children: [
            {
              type: "Box",
              props: { className: "border-b border-border px-5 py-3" },
              children: {
                type: "Text",
                props: { className: "text-sm font-semibold text-card-foreground" },
                children: "May 24",
              },
            },
            ...events.map((ev, i) => ({
              type: "Box",
              props: {
                className:
                  "flex-row items-center justify-between px-4 py-2.5" +
                  (i < events.length - 1 ? " border-b border-border" : ""),
              },
              children: [
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground" },
                  children: ev.title,
                },
                {
                  type: "Text",
                  props: { className: "text-sm text-muted-foreground" },
                  children: ev.time,
                },
              ],
            })),
          ],
        },
      ],
    };
  }
  return null;
},

  card: (s) => {
  if (s.type === "stat") {
    const tone = (s.tone) || "blue";
    const toneClass = {
      blue: "bg-blue-500/10 text-blue-600",
      success: "bg-green-500/10 text-green-600",
      purple: "bg-purple-500/10 text-purple-600",
      destructive: "bg-destructive/10 text-destructive",
      amber: "bg-amber-500/10 text-amber-600",
    }[tone] || "bg-blue-500/10 text-blue-600";
    const letter = { blue: "U", success: "S", purple: "O", destructive: "!", amber: "T" }[tone] || "U";
    const left = {
      type: "Box",
      children: [
        { type: "Text", props: { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground" }, children: (s.label) || "Active identities" },
        { type: "Text", props: { className: "mt-1 text-2xl font-bold text-card-foreground" }, children: (s.value) || "12,348" },
        { type: "Text", props: { className: "mt-0.5 text-[11px] text-muted-foreground" }, children: "+142 today" },
      ],
    };
    const row = {
      type: "Box",
      props: { className: "flex-row items-start justify-between" },
      children: s.icon
        ? [
            left,
            {
              type: "Box",
              props: { className: "h-10 w-10 items-center justify-center rounded-lg " + toneClass },
              children: { type: "Text", props: { className: "text-sm font-semibold " + toneClass.split(" ")[1] }, children: letter },
            },
          ]
        : [left],
    };
    return {
      type: "Card",
      props: { className: "w-[280px] p-5" },
      children: row,
    };
  }
  return null;
},

  checkbox: (s) => {
  if (s.withDesc) {
    const checked = s.state === "checked";
    const disabled = s.state === "disabled";
    const label = (typeof s.label === "string" && s.label) || "Email notifications";
    return {
      type: "Box",
      props: { className: "flex-row items-start gap-2" },
      children: [
        {
          type: "Checkbox",
          props: { checked, disabled },
        },
        {
          type: "Box",
          props: { className: "gap-0.5" },
          children: [
            { type: "Text", props: { className: "text-sm font-medium text-foreground" }, children: label },
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "Get notified when activity happens on your account.",
            },
          ],
        },
      ],
    };
  }
  return null;
},

  divider: (s) => {
  if (s.variant === "action") {
    return {
      type: "Box",
      props: { className: "w-80" },
      children: [
        {
          type: "Box",
          props: { className: "gap-2" },
          children: [
            {
              type: "Box",
              props: { className: "rounded-md border border-border px-3 py-2" },
              children: { type: "Text", props: { className: "text-sm text-foreground" }, children: "Ada commented on the draft" },
            },
            {
              type: "Box",
              props: { className: "rounded-md border border-border px-3 py-2" },
              children: { type: "Text", props: { className: "text-sm text-foreground" }, children: "Grace approved the request" },
            },
          ],
        },
        {
          type: "Divider",
          props: {
            className: "mt-3",
            children: { type: "Button", props: { ghost: true, small: true }, children: "Show more" },
          },
        },
      ],
    };
  }
  return null;
},

  "empty-state": (s) => {
  if (s.inTable) {
    const v = s.variant;
    const icons = { search: "🔍", users: "👥", files: "📄", activity: "📈", notifications: "🔔", errors: "✅", "all-clear": "✅" };
    const titles = { search: "No results found", users: "No users", files: "No files", activity: "No activity", notifications: "All caught up", errors: "No errors", "all-clear": "All clear" };
    const descs = { search: "Try adjusting your search filters.", users: "Invite your first team member.", files: "Upload or drag files here.", activity: "Events will appear as they happen.", notifications: "No new notifications.", errors: "Everything is running smoothly.", "all-clear": "No locked accounts or pending reviews." };
    const positive = v === "errors" || v === "all-clear";
    return {
      type: "Box",
      props: { className: "overflow-x-auto rounded-lg border border-border" },
      children: [
        {
          type: "Box",
          props: { className: "flex-row border-b border-border" },
          children: ["Name", "Email", "Role", "Status"].map((h) => ({
            type: "Text",
            props: { className: "flex-1 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground" },
            children: h,
          })),
        },
        {
          type: "Box",
          props: { className: "px-4 py-10" },
          children: {
            type: "EmptyState",
            props: {
              bordered: true,
              positive,
              icon: icons[v],
              title: titles[v],
              description: descs[v],
              actionLabel: s.action ? "Create identity" : undefined,
            },
          },
        },
      ],
    };
  }
  return null;
},

  input: (s) => {
  if (s.type === "select") {
    const isError = s.state === "error";
    const isDisabled = s.state === "disabled";
    const helperText = isError
      ? "Please enter a valid email address."
      : "We'll use this for account recovery.";
    const children = [
      {
        type: "Text",
        props: { className: "text-sm font-medium text-foreground" },
        children: "Status",
      },
      {
        type: "Select",
        props: {
          value: "Active",
          options: ["Active", "Inactive", "Pending"],
          disabled: isDisabled,
        },
      },
    ];
    if (s.helper) {
      children.push({
        type: "Text",
        props: {
          className: isError
            ? "text-xs text-destructive"
            : "text-xs text-muted-foreground",
        },
        children: helperText,
      });
    }
    return {
      type: "Box",
      props: { className: "max-w-[320px] flex-col gap-1.5" },
      children,
    };
  }
  return null;
},

  kbd: (s) => {
  const keys = ((s.keys) || "⌘ K").trim().split(/\s+/);

  // combo: render each key as a Kbd cap, joined by a " + " separator so the
  // chord reads as keys pressed together (legacy keys.map(kbdEl).join(" + ")).
  if (s.mode === "combo") {
    const children = [];
    keys.forEach((k, i) => {
      if (i > 0) {
        children.push({
          type: "Text",
          props: { className: "text-xs text-muted-foreground" },
          children: "+",
        });
      }
      children.push({ type: "Kbd", children: k });
    });
    return {
      type: "Box",
      props: { className: "flex-row items-center gap-1" },
      children,
    };
  }

  // in a sentence: keys wrapped as caps inside sentence prose
  // (legacy <p class="text-sm">Press [caps] to search.</p>).
  if (s.mode === "in a sentence") {
    const children = [
      { type: "Text", props: { className: "text-sm text-foreground" }, children: "Press " },
    ];
    keys.forEach((k) => {
      children.push({ type: "Kbd", children: k });
    });
    children.push({
      type: "Text",
      props: { className: "text-sm text-foreground" },
      children: " to search.",
    });
    return {
      type: "Box",
      props: { className: "flex-row flex-wrap items-center gap-1" },
      children,
    };
  }

  return null;
},

  "media-objects": (s) => {
  if (s.variant === "icon") {
    return {
      type: "Box",
      props: { className: "max-w-[560px] grid grid-cols-1 gap-3 sm:grid-cols-2" },
      children: [
        {
          type: "MediaObject",
          props: {
            bordered: true,
            start: true,
            title: "Security first",
            description: "End-to-end encryption with automatic key rotation.",
            icon: { type: "Icon", props: { shield: true, primary: true, size: 18 } },
          },
        },
        {
          type: "MediaObject",
          props: {
            bordered: true,
            start: true,
            title: "Real-time analytics",
            description: "Live dashboards with sub-second refresh latency.",
            icon: { type: "Icon", props: { activity: true, primary: true, size: 18 } },
          },
        },
      ],
    };
  }
  if (s.variant === "action") {
    return {
      type: "Box",
      props: { className: "max-w-[480px]" },
      children: [
        {
          type: "MediaObject",
          props: {
            bordered: true,
            center: true,
            truncate: true,
            src: "/ada-lovelace.jpg",
            title: "Ada Lovelace",
            description: "ada@example.com",
            action: { type: "Button", props: { outline: true, small: true }, children: "Invite" },
          },
        },
      ],
    };
  }
  return null;
},

  radio: (s) => {
  const opts = [
    { val: "hobby", label: "Hobby", desc: "For personal projects and experiments." },
    { val: "pro", label: "Pro", desc: "For growing teams that need more control." },
    { val: "enterprise", label: "Enterprise", desc: "Advanced security, compliance, and support." },
  ];

  if (s.variant === "card") {
    return {
      type: "Box",
      props: { className: "grid grid-cols-3 gap-2" },
      children: opts.map((o) => {
        const sel = o.val === "pro";
        return {
          type: "Box",
          props: {
            className:
              "flex-col rounded-md p-3.5 " +
              (sel ? "border-2 border-primary bg-primary/5" : "border border-border"),
          },
          children: [
            { type: "Radio", props: { checked: sel, className: "mb-2" } },
            {
              type: "Text",
              props: { className: "text-[13px] font-semibold text-foreground" },
              children: o.label,
            },
            ...(s.withDesc
              ? [
                  {
                    type: "Text",
                    props: { className: "text-xs text-muted-foreground" },
                    children: o.desc,
                  },
                ]
              : []),
          ],
        };
      }),
    };
  }

  if (s.variant === "stacked") {
    return {
      type: "Box",
      props: { className: "flex-col gap-2.5" },
      children: opts.map((o) => {
        const sel = o.val === "pro";
        return {
          type: "Box",
          props: { className: "flex-row gap-2" },
          children: [
            { type: "Radio", props: { checked: sel, className: "mt-[3px]" } },
            {
              type: "Box",
              children: [
                {
                  type: "Text",
                  props: { className: "text-[13px] font-medium text-foreground" },
                  children: o.label,
                },
                ...(s.withDesc
                  ? [
                      {
                        type: "Text",
                        props: { className: "text-xs text-muted-foreground" },
                        children: o.desc,
                      },
                    ]
                  : []),
              ],
            },
          ],
        };
      }),
    };
  }

  return null;
},

  textarea: (s) => {
  const rows = typeof s.rows === "number" ? s.rows : 4;
  const minH = rows * 22 + 16;
  const disabled = s.disabled === true;

  // Formatting toolbar: bordered container with B/I/</> ghost toggle buttons,
  // a separator, a Comment ghost button, and a "Leave a comment" textarea.
  if (s.toolbar === true) {
    return {
      type: "Box",
      props: { className: "max-w-[400px] overflow-hidden rounded-md border border-border" },
      children: [
        {
          type: "Box",
          props: { className: "flex-row items-center gap-1 border-b border-border bg-muted/30 px-3 py-2" },
          children: [
            { type: "Button", props: { ghost: true, small: true, className: "min-w-8 px-2" }, children: "B" },
            { type: "Button", props: { ghost: true, small: true, className: "min-w-8 px-2" }, children: "I" },
            { type: "Button", props: { ghost: true, small: true, className: "min-w-8 px-2" }, children: "</>" },
            { type: "Box", props: { className: "mx-1 h-4 w-px bg-border" } },
            { type: "Button", props: { ghost: true, small: true, className: "px-3" }, children: "Comment" },
          ],
        },
        {
          type: "Textarea",
          props: {
            rows: rows,
            disabled: disabled,
            placeholder: "Leave a comment…",
            className: `min-h-[${minH}px] w-full rounded-none border-0`,
          },
        },
      ],
    };
  }

  // Character counter: label + textarea + a right-aligned muted "0 / 280" row.
  if (s.charCounter === true) {
    const children = [];
    if (s.withLabel !== false) {
      children.push({
        type: "Text",
        props: { className: "mb-1.5 text-sm font-medium text-foreground" },
        children: "Description",
      });
    }
    children.push({
      type: "Textarea",
      props: {
        rows: rows,
        disabled: disabled,
        placeholder: "A few words about this project…",
      },
    });
    children.push({
      type: "Box",
      props: { className: "mt-1 flex-row justify-end" },
      children: {
        type: "Text",
        props: { className: "text-[11px] text-muted-foreground" },
        children: "0 / 280",
      },
    });
    return {
      type: "Box",
      props: { className: "max-w-[400px]" },
      children: children,
    };
  }

  return null;
},

};
