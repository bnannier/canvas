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

// ── Tailwind recipes ─────────────────────────────────────────────────────
// Literal class strings so Tailwind generates the utilities, plus helpers,
// reused by playground renders and do/dont markup.

const btnBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";
const btnVariant: Record<string, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  link: "text-primary underline-offset-4 hover:underline",
};
const btnSize: Record<string, string> = {
  sm: "h-8 rounded-md px-3 text-xs",
  default: "h-9 px-4 py-2",
  lg: "h-10 rounded-md px-6",
  icon: "h-9 w-9",
};
const btn = (variant: string, label: string, size = "default", attrs = "") =>
  `<button class="${btnBase} ${btnVariant[variant]} ${btnSize[size]}"${attrs}>${label}</button>`;

const avatarBase =
  "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground";
const avatarImg = (src: string, alt: string) =>
  `<img src="${src}" alt="${alt}" class="h-full w-full object-cover">`;
const avatarEl = (content: string, style: string, ring = false, extra = "") =>
  `<span class="${avatarBase}${ring ? " ring-2 ring-background" : ""}${extra ? " " + extra : ""}" style="${style}">${content}</span>`;

const menuBase =
  "min-w-[12rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md";
const menuItem =
  "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground";
const menuLabel = "px-2 py-1.5 text-xs font-medium text-muted-foreground";
const menuSep = "my-1 h-px bg-border";

const badgeBase =
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors";
const badgeVariant: Record<string, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "border-border text-foreground",
  destructive: "border-transparent bg-destructive text-destructive-foreground",
};
const badge = (variant: string, label: string, mono = false) =>
  `<span class="${badgeBase} ${badgeVariant[variant]}${mono ? " font-mono text-[10.5px]" : ""}">${label}</span>`;

const statusTone: Record<string, string> = {
  success: "border-green-600/20 bg-green-600/10 text-green-700 dark:text-green-400",
  warning: "border-amber-600/20 bg-amber-600/10 text-amber-700 dark:text-amber-400",
  error: "border-red-600/20 bg-red-600/10 text-red-700 dark:text-red-400",
  info: "border-blue-600/20 bg-blue-600/10 text-blue-700 dark:text-blue-400",
  neutral: "border-border bg-muted text-muted-foreground",
};
const statusDot: Record<string, string> = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-zinc-400",
};
const statusBadge = (variant: string, label: string) =>
  `<span class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone[variant]}"><span class="h-1.5 w-1.5 rounded-full ${statusDot[variant]}"></span>${label}</span>`;

const bcNav = "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground";
const crumbLink = (label: string, attrs = "") =>
  `<a href="#"${attrs} class="transition-colors hover:text-foreground">${label}</a>`;
const crumbCurrent = (label: string) => `<span class="font-medium text-foreground">${label}</span>`;
const crumbSep = (sep = "/") => `<span class="select-none text-muted-foreground/60">${sep}</span>`;
const crumbChevron = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/60"><path d="m9 18 6-6-6-6"/></svg>`;
const homeIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;

const chevronDown = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
const chevronLeft = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`;
const chevronRight = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;

const segItem =
  "relative inline-flex items-center justify-center rounded-none border border-input font-medium transition-colors -ml-px first:ml-0 first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const segIdle = "bg-background hover:bg-accent hover:text-accent-foreground";
const segActive = "z-10 border-primary bg-primary text-primary-foreground hover:bg-primary/90";
const segSize: Record<string, string> = { sm: "h-8 px-3 text-xs", default: "h-9 px-4 text-sm", lg: "h-10 px-5 text-sm" };
const seg = (label: string, active: boolean, size = "sm", attrs = "", extra = "") =>
  `<button class="${segItem} ${segSize[size]} ${active ? segActive : segIdle}${extra ? " " + extra : ""}"${attrs}>${label}</button>`;

const inputBase =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
const labelCls = "mb-1.5 block text-sm font-medium";
const helperCls = "mt-1.5 text-xs text-muted-foreground";
const inputAddon =
  "inline-flex items-center whitespace-nowrap border border-input bg-muted px-3 text-sm text-muted-foreground";
const cbList = "mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover p-1 shadow-md";
const cbItem =
  "flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground";
const cbItemEl = (name: string, selected = false) =>
  `<button type="button" data-cb-item class="${cbItem}${selected ? " bg-accent text-accent-foreground" : ""}">${name}</button>`;
const cbFilter =
  ` oninput="var v=this.value.toLowerCase();this.parentElement.querySelectorAll('[data-cb-item]').forEach(function(i){i.style.display=i.textContent.toLowerCase().includes(v)?'':'none'})"`;
const cbSelect =
  ` onclick="var t=event.target.closest('[data-cb-item]');if(!t)return;this.querySelectorAll('[data-cb-item]').forEach(function(i){i.classList.remove('bg-accent','text-accent-foreground')});t.classList.add('bg-accent','text-accent-foreground');this.parentElement.querySelector('input').value=t.textContent.trim()"`;

const hrLine = `<hr class="border-border">`;
const sepLabel = (label: string) =>
  `<div class="flex items-center gap-3 text-xs text-muted-foreground"><span class="h-px flex-1 bg-border"></span><span>${label}</span><span class="h-px flex-1 bg-border"></span></div>`;

const menuItemEl = (label: string, extra = "", attrs = "") =>
  `<button type="button" data-menu-item class="${menuItem}${extra ? " " + extra : ""}"${attrs}>${label}</button>`;
const menuFlash =
  ` onclick="var t=event.target.closest('[data-menu-item]');if(!t)return;t.classList.add('bg-accent');setTimeout(function(){t.classList.remove('bg-accent')},300)"`;
const menuTrigger =
  ` onclick="var d=this.nextElementSibling;if(d.classList.contains('hidden')){d.classList.remove('hidden');var c=function(e){if(!d.contains(e.target)){d.classList.add('hidden');document.removeEventListener('click',c)}};setTimeout(function(){document.addEventListener('click',c)},0)}else{d.classList.add('hidden')}"`;
const shortcut = (k: string) => `<span class="ml-auto text-xs tracking-widest text-muted-foreground">${k}</span>`;

const pageBtnCls =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50";
const pageBtnActive = "bg-foreground text-background hover:bg-foreground hover:text-background";
const pageBtn = (label: string, active = false, attrs = "") =>
  `<button data-pg class="${pageBtnCls}${active ? " " + pageBtnActive : ""}"${attrs}>${label}</button>`;

const cardCls = "rounded-lg border border-border bg-card text-card-foreground shadow-sm";
const skelCls = (pulse: boolean) => `bg-muted${pulse ? " animate-pulse" : ""}`;
const skLine = (pulse: boolean, w: string, extra = "") =>
  `<div class="${skelCls(pulse)} h-3.5 rounded${extra ? " " + extra : ""}" style="width:${w}"></div>`;
const radioCard = (sel: boolean) =>
  `flex cursor-pointer flex-col rounded-md p-3.5 transition-colors ${sel ? "border-2 border-primary bg-primary/5" : "border border-border"}`;
const taBase = inputBase.replace("h-9 ", "") + " resize-y";
const switchTrack =
  "relative h-5 w-9 rounded-full bg-input transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-background after:shadow after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background";
const switchEl = (on: boolean, dis = "") =>
  `<span class="relative inline-flex shrink-0 items-center${dis ? " opacity-50" : ""}"><input type="checkbox" role="switch" class="peer sr-only"${on ? " checked" : ""}${dis}><span class="${switchTrack}"></span></span>`;
const tooltipCls = "z-10 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md";
const kbdCls =
  "inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground";
const kbdEl = (k: string) => `<kbd class="${kbdCls}">${k}</kbd>`;
const typeScale: Record<string, string> = {
  display: "text-5xl font-bold tracking-tight",
  h1: "text-4xl font-bold tracking-tight",
  h2: "text-3xl font-semibold tracking-tight",
  h3: "text-2xl font-semibold tracking-tight",
  h4: "text-xl font-semibold tracking-tight",
  h5: "text-lg font-semibold",
  body: "text-sm leading-relaxed",
  small: "text-sm text-muted-foreground",
  tiny: "text-xs text-muted-foreground",
  muted: "text-sm text-muted-foreground",
  caption: "text-xs uppercase tracking-wide text-muted-foreground",
  code: "rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]",
  mono: "font-mono text-sm",
};
const spinnerEl = (size = "h-5 w-5") =>
  `<div class="${size} animate-spin rounded-full border-2 border-muted border-t-foreground"></div>`;
const popoverCls = "rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md";
const alertTone: Record<string, { box: string; title: string }> = {
  info: { box: "border-border bg-muted/40", title: "text-foreground" },
  success: { box: "border-green-600/30 bg-green-600/5", title: "text-green-700 dark:text-green-400" },
  warning: { box: "border-amber-600/30 bg-amber-600/5", title: "text-amber-700 dark:text-amber-400" },
  destructive: { box: "border-destructive/30 bg-destructive/5", title: "text-destructive" },
};
const alertBox = (v: string, title: string, desc: string, extra = "") =>
  `<div data-alert class="max-w-[560px] rounded-lg border px-4 py-3 ${alertTone[v].box}"><div class="mb-1 text-sm font-semibold ${alertTone[v].title}">${title}</div><div class="text-sm text-muted-foreground">${desc}</div>${extra}</div>`;
const statTone: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600",
  success: "bg-green-500/10 text-green-600",
  purple: "bg-purple-500/10 text-purple-600",
  destructive: "bg-destructive/10 text-destructive",
  amber: "bg-amber-500/10 text-amber-600",
};
const codeblockCls =
  "overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-[13px] leading-relaxed";
const tableWrap = "overflow-x-auto rounded-lg border border-border";
const tableCls = "w-full text-sm";
const thCls = "border-b border-border px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground";
const tdCls = "border-b border-border px-4 py-2.5";
const emptyCardCls = "rounded-lg border border-dashed border-border px-6 py-8 text-center";
const emptyCard = (title: string, desc: string, extra = "") =>
  `<div class="${emptyCardCls}"><div class="text-[15px] font-semibold">${title}</div><p class="mt-1 text-sm text-muted-foreground">${desc}</p>${extra}</div>`;
const fieldRowEl = (label: string, value: string) =>
  `<div class="grid grid-cols-[180px_1fr] gap-4 text-sm"><span class="text-muted-foreground">${label}</span><span>${value}</span></div>`;

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
        if (s.variant === "stacked") {
          const overlap = Math.round(sz * 0.3);
          const photos: Record<string, string> = { RC: "/rachel-chen.jpg", LB: "/liang-bao.jpg", KT: "/kira-tanaka.jpg" };
          const items = ["RC", "LB", "AO", "KT"];
          const stack = items.map((n, i) =>
            avatarEl(photos[n] ? avatarImg(photos[n], n) : n,
              `width:${sz}px;height:${sz}px;font-size:${fs}px;${i > 0 ? `margin-left:-${overlap}px;` : ""}z-index:${items.length - i}`, true)
          ).join("");
          const overflow = s.overflow ? `<span class="ml-1.5 inline-flex items-center text-xs text-muted-foreground">+12</span>` : "";
          return `<div class="flex items-center">${stack}${overflow}</div>`;
        }
        if (s.variant === "topbar") {
          return `<div class="inline-flex flex-col items-start gap-1.5"><button type="button" aria-haspopup="menu" aria-expanded="false" onclick="var m=this.nextElementSibling;var open=m.style.display!=='block';m.style.display=open?'block':'none';this.setAttribute('aria-expanded',open);this.querySelector('svg').style.transform=open?'rotate(180deg)':'';" class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 text-sm font-medium">${avatarEl(avatarImg("/marcus-allen.jpg", "MA"), "width:28px;height:28px")}<span>admin@example.com</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform"><path d="m6 9 6 6 6-6"/></svg></button><div role="menu" class="${menuBase}" style="display:none" onclick="var t=event.target.closest('button');if(!t)return;this.style.display='none';var b=this.previousElementSibling;b.setAttribute('aria-expanded','false');b.querySelector('svg').style.transform='';"><div class="${menuLabel}">admin@example.com</div><button class="${menuItem}">Profile</button><button class="${menuItem}">Settings</button><div class="${menuSep}"></div><button class="${menuItem}">Sign out</button></div></div>`;
        }
        if (s.variant === "identity") {
          return `<div class="flex items-center gap-4">${avatarEl(avatarImg("/rachel-chen.jpg", "RC"), "width:40px;height:40px;font-size:16px")}<div><div class="text-base font-semibold">Rachel Chen</div><div class="text-sm text-muted-foreground">rachel.chen@example.com</div></div></div>`;
        }
        if (s.variant === "menu") {
          return `<div class="flex items-center gap-3 border-b border-border pb-3">${avatarEl(avatarImg("/ada-lovelace.jpg", "AL"), "width:40px;height:40px;font-size:16px")}<div><div class="text-sm font-semibold">Ada Lovelace</div><div class="text-xs text-muted-foreground">admin@example.com</div></div></div>`;
        }
        return avatarEl(ini, `width:${sz}px;height:${sz}px;font-size:${fs}px`, s.ring === true);
      },
    },
    sections: [],
    donts: [
      {
        title: "Single",
        dont: {
          html: avatarEl("ABCD", "width:40px;height:40px;font-size:12px"),
          caption: "Cramming in a full set of initials shrinks the type and crowds the circle.",
        },
        do: {
          html: avatarEl("AO", "width:40px;height:40px;font-size:16px"),
          caption: "One or two initials, sized about 40% of the diameter.",
        },
      },
      {
        title: "Stacked",
        dont: {
          html: `<div class="flex items-center">${["AO", "RC", "LB", "KT", "JD", "MA", "AL", "SK"].map((n, i) => avatarEl(n, `width:32px;height:32px;font-size:13px;${i > 0 ? "margin-left:-10px;" : ""}`, true)).join("")}</div>`,
          caption: "An unbounded stack runs off the row and stops being scannable.",
        },
        do: {
          html: `<div class="flex items-center">${["AO", "RC", "LB", "KT"].map((n, i) => avatarEl(n, `width:32px;height:32px;font-size:13px;${i > 0 ? "margin-left:-10px;" : ""}`, true)).join("")}<span class="ml-1.5 inline-flex items-center text-xs text-muted-foreground">+12</span></div>`,
          caption: "Cap the stack and summarize the rest with a +N count.",
        },
      },
      {
        title: "Topbar account menu",
        dont: {
          html: avatarEl(avatarImg("/marcus-allen.jpg", "MA"), "width:32px;height:32px"),
          caption: "A lone avatar gives no hint that it opens the account menu.",
        },
        do: {
          html: `<div class="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 text-sm font-medium">${avatarEl(avatarImg("/marcus-allen.jpg", "MA"), "width:24px;height:24px")}<span>admin@example.com</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-60"><path d="m6 9 6 6 6-6"/></svg></div>`,
          caption: "Pair it with the account name and a chevron so it reads as a trigger.",
        },
      },
      {
        title: "Identity",
        dont: {
          html: `<div class="flex items-center gap-4">${avatarEl(avatarImg("/rachel-chen.jpg", "RC"), "width:40px;height:40px;font-size:16px")}<div><div class="text-sm">Rachel Chen</div><div class="text-sm">rachel.chen@example.com</div></div></div>`,
          caption: "Equal weight on the name and email flattens the hierarchy.",
        },
        do: {
          html: `<div class="flex items-center gap-4">${avatarEl(avatarImg("/rachel-chen.jpg", "RC"), "width:40px;height:40px;font-size:16px")}<div><div class="text-base font-semibold">Rachel Chen</div><div class="text-sm text-muted-foreground">rachel.chen@example.com</div></div></div>`,
          caption: "Name primary; email muted and secondary.",
        },
      },
      {
        title: "Menu header",
        dont: {
          html: `<div class="flex items-center gap-3">${avatarEl(avatarImg("/ada-lovelace.jpg", "AL"), "width:40px;height:40px;border-radius:6px")}<div><div class="text-sm font-semibold">Ada Lovelace</div><div class="text-xs text-muted-foreground">admin@example.com</div></div></div>`,
          caption: "Squaring the avatar here clashes with the circular avatars everywhere else.",
        },
        do: {
          html: `<div class="flex items-center gap-3">${avatarEl(avatarImg("/ada-lovelace.jpg", "AL"), "width:40px;height:40px")}<div><div class="text-sm font-semibold">Ada Lovelace</div><div class="text-xs text-muted-foreground">admin@example.com</div></div></div>`,
          caption: "Keep one consistent circular avatar shape across contexts.",
        },
      },
    ],
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
          return `<div class="flex flex-wrap items-center gap-2"><span class="text-[15px] font-semibold">Rachel Chen</span>${statusBadge("success", "active")}${statusBadge("info", "Verified")}${badge("secondary", "employee")}</div>`;
        }
        if (s.kind === "grants") {
          return `<div class="flex flex-wrap gap-1">${["authorization_code", "refresh_token", "client_credentials"].map((g) => badge("secondary", g, true)).join("")}</div>`;
        }
        if (s.kind === "status") return statusBadge(s.statusVariant as string, s.label as string);
        return badge(s.variant as string, s.label as string, s.mono === true);
      },
    },
    sections: [],
    donts: [
      {
        title: "Metadata badge",
        dont: {
          html: `<div class="flex flex-wrap items-center gap-1.5">${badge("default", "employee")}${badge("destructive", "engineering")}${badge("default", "remote")}${badge("destructive", "active")}</div>`,
          caption: "Borrowing status colors for plain metadata reads as severity that isn't there; a red tag looks like an error.",
        },
        do: {
          html: `<div class="flex flex-wrap items-center gap-1.5">${badge("secondary", "employee")}${badge("secondary", "engineering")}${badge("secondary", "remote")}${statusBadge("success", "active")}</div>`,
          caption: "Neutral tags for metadata; reserve color and the status-badge dot for live state.",
        },
      },
      {
        title: "Status badge",
        dont: {
          html: statusBadge("error", ""),
          caption: "A bare colored dot isn't a label and fails for color-blind users.",
        },
        do: {
          html: statusBadge("error", "Failed"),
          caption: "Always pair the dot with a word: active, pending, failed.",
        },
      },
      {
        title: "Identity row",
        dont: {
          html: `<div class="flex flex-wrap items-center gap-2"><span class="text-[15px] font-semibold">Rachel Chen</span>${statusBadge("success", "active")}${statusBadge("info", "Verified")}${badge("secondary", "employee")}${badge("secondary", "engineering")}${badge("secondary", "remote")}${badge("secondary", "admin")}</div>`,
          caption: "A wall of badges after a name buries the one that matters.",
        },
        do: {
          html: `<div class="flex flex-wrap items-center gap-2"><span class="text-[15px] font-semibold">Rachel Chen</span>${statusBadge("success", "active")}${badge("secondary", "employee")}</div>`,
          caption: "Show only the one or two badges relevant to this view.",
        },
      },
      {
        title: "Token / code badge",
        dont: {
          html: `<div class="flex flex-wrap gap-1">${["authorization_code", "refresh_token", "client_credentials"].map((g) => badge("secondary", g)).join("")}</div>`,
          caption: "Proportional type makes identifiers hard to scan and compare.",
        },
        do: {
          html: `<div class="flex flex-wrap gap-1">${["authorization_code", "refresh_token", "client_credentials"].map((g) => badge("secondary", g, true)).join("")}</div>`,
          caption: "Use the mono variant for tokens, scopes, and event names.",
        },
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
        { type: "range", key: "depth", label: "Depth", min: 2, max: 6, step: 1, disabledWhen: (s) => s.pageHeader === true },
        { type: "pills", key: "separator", label: "Separator", options: ["chevron", "slash", "dot"], cols: 3, disabledWhen: (s) => s.pageHeader === true },
        { type: "check", key: "homeIcon", label: "Leading home icon", disabledWhen: (s) => s.pageHeader === true },
        { type: "check", key: "pageHeader", label: "In a page header" },
      ],
      defaults: { depth: 4, separator: "chevron", homeIcon: false, pageHeader: false },
      render: (s) => {
        const click = ` onclick="var a=event.target.closest('a');if(a)event.preventDefault()"`;
        if (s.pageHeader) {
          const fb = (t: string) => ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='${t}';setTimeout(function(){b.textContent=o;b.disabled=false},2000)"`;
          return `<div class="flex items-start justify-between gap-4"><div><nav class="${bcNav} mb-2"${click}>${crumbLink("Users")}${crumbSep()}${crumbCurrent("Rachel Chen")}</nav><h1 class="text-2xl font-semibold tracking-tight text-foreground">Rachel Chen</h1></div><div class="flex items-center gap-2">${btn("outline", "Edit", "sm", fb("Editing…"))}${btn("default", "Save", "sm", fb("Saved!"))}</div></div>`;
        }
        const crumbs = ["Projects", "Identity Platform", "Settings", "Profile", "Avatar", "Edit"].slice(0, s.depth as number);
        const sep = s.separator === "chevron" ? crumbChevron : crumbSep(s.separator === "dot" ? "·" : "/");
        const home = s.homeIcon ? crumbLink(homeIconSvg, ` aria-label="Home"`) + sep : "";
        const items = crumbs.map((c, i) => i === crumbs.length - 1 ? crumbCurrent(c) : crumbLink(c) + sep).join("");
        return `<nav class="${bcNav}"${click}>${home}${items}</nav>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Current page",
        dont: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}${crumbSep()}${crumbLink("Identity Platform")}${crumbSep()}${crumbLink("Settings")}</nav>`,
          caption: "Linking the current page implies there's somewhere to go; it's a dead link to itself.",
        },
        do: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}${crumbSep()}${crumbLink("Identity Platform")}${crumbSep()}${crumbCurrent("Settings")}</nav>`,
          caption: "Ancestors are links; the page you're on is plain text at the end of the trail.",
        },
      },
      {
        title: "Deep paths",
        dont: {
          html: `<nav class="${bcNav}">${["Projects", "Identity Platform", "Settings", "Profile", "Avatar"].map((c) => crumbLink(c) + crumbSep()).join("")}${crumbCurrent("Edit")}</nav>`,
          caption: "A fully expanded deep path wraps and competes with the page.",
        },
        do: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}${crumbSep()}<span class="px-1 text-muted-foreground">…</span>${crumbSep()}${crumbLink("Avatar")}${crumbSep()}${crumbCurrent("Edit")}</nav>`,
          caption: "Collapse the middle to an ellipsis; keep the root and the last couple of levels.",
        },
      },
      {
        title: "Separator",
        dont: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}${crumbSep("/")}${crumbLink("Identity Platform")}${crumbSep("›")}${crumbCurrent("Settings")}</nav>`,
          caption: "Mixing separators in one trail looks broken.",
        },
        do: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}${crumbSep()}${crumbLink("Identity Platform")}${crumbSep()}${crumbCurrent("Settings")}</nav>`,
          caption: "Pick one separator and use it the whole way.",
        },
      },
      {
        title: "Home root",
        dont: {
          html: `<nav class="${bcNav}">${crumbLink(homeIconSvg)}${crumbSep()}${crumbCurrent("Settings")}</nav>`,
          caption: "An icon-only root with no label is unclear to screen readers.",
        },
        do: {
          html: `<nav class="${bcNav}">${crumbLink(homeIconSvg, ` aria-label="Home"`)}${crumbSep()}${crumbCurrent("Settings")}</nav>`,
          caption: "Give the home icon an aria-label so the root is announced.",
        },
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
        { type: "pills", key: "size", label: "Size", options: ["sm", "default", "lg"], cols: 3, disabledWhen: (s) => s.variant === "attached" },
        { type: "range", key: "buttons", label: "Buttons", min: 2, max: 5, step: 1, disabledWhen: (s) => s.variant !== "segmented" },
      ],
      defaults: { variant: "segmented", size: "sm", buttons: 3 },
      render: (s) => {
        const sz = s.size as string;
        if (s.variant === "split") {
          const splitL = `${btnBase.replace("rounded-md", "rounded-l-md rounded-r-none")} ${btnVariant.default} ${btnSize.sm}`;
          const splitR = `${btnBase.replace("rounded-md", "rounded-r-md rounded-l-none")} ${btnVariant.default} ${btnSize.sm} border-l border-l-primary-foreground/20 px-2`;
          return `<div class="relative inline-block" data-split><span data-saved class="pointer-events-none absolute bottom-full left-0 mb-1.5 rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background opacity-0 transition-opacity">Saved ✓</span><div class="inline-flex"><button class="${splitL}" onclick="var t=this.closest('[data-split]').querySelector('[data-saved]');t.textContent='Saved ✓';t.classList.remove('opacity-0');setTimeout(function(){t.classList.add('opacity-0')},1400)">Save</button><button class="${splitR}" aria-label="More save options" onclick="var m=this.closest('[data-split]').querySelector('[data-menu]');m.classList.toggle('hidden')">${chevronDown}</button></div><div data-menu class="${menuBase} absolute right-0 top-full z-10 mt-1 hidden" onclick="var t=event.target.closest('button');if(!t)return;this.classList.add('hidden');var s=this.closest('[data-split]').querySelector('[data-saved]');s.textContent='Saved ('+t.textContent.trim()+')';s.classList.remove('opacity-0');setTimeout(function(){s.classList.add('opacity-0')},1600)"><button class="${menuItem}">Save as draft</button><button class="${menuItem}">Save and close</button><button class="${menuItem}">Save a copy</button></div></div>`;
        }
        if (s.variant === "attached") {
          const nav = (dir: number) => ` onclick="const g=this.parentElement,d=['May 23','May 24','May 25','Today','May 27','May 28','May 29'];let i=Math.${dir < 0 ? "max(0," : "min(d.length-1,"}+(g.dataset.idx)${dir < 0 ? "-1)" : "+1)"};g.dataset.idx=i;g.querySelector('[data-lbl]').textContent=d[i]"`;
          return `<div class="inline-flex" data-idx="3">${seg(chevronLeft, false, "sm", nav(-1))}${seg("Today", false, "sm", " data-lbl", "pointer-events-none min-w-[5.5rem]")}${seg(chevronRight, false, "sm", nav(1))}</div>`;
        }
        const labels = ["Day", "Week", "Month", "Year", "All"].slice(0, s.buttons as number);
        return `<div class="inline-flex" onclick="var b=event.target.closest('button');if(!b)return;this.querySelectorAll('button').forEach(function(x){x.className='${segItem} ${segSize[sz]} ${segIdle}'});b.className='${segItem} ${segSize[sz]} ${segActive}'">${labels.map((l, i) => seg(l, i === 0, sz)).join("")}</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Segmented",
        dont: {
          html: `<div class="inline-flex">${["Day", "Week", "Month", "Quarter", "Year", "5Y", "All"].map((l, i) => seg(l, i === 0)).join("")}</div>`,
          caption: "Past ~4 options a segmented control gets cramped and hard to scan; reach for a select.",
        },
        do: {
          html: `<div class="inline-flex">${["Day", "Week", "Month"].map((l, i) => seg(l, i === 0)).join("")}</div>`,
          caption: "Keep a segmented control to a few mutually-exclusive views.",
        },
      },
      {
        title: "Attached",
        dont: {
          html: `<div class="inline-flex">${["Save", "Delete", "Export"].map((l) => seg(l, false)).join("")}</div>`,
          caption: "Attaching unrelated actions implies they belong to one control.",
        },
        do: {
          html: `<div class="inline-flex">${seg(chevronLeft, false)}${seg("Today", false, "sm", "", "min-w-[5.5rem]")}${seg(chevronRight, false)}</div>`,
          caption: "Reserve attached groups for closely-related actions like prev / today / next.",
        },
      },
      {
        title: "Split",
        dont: {
          html: `<div class="inline-flex"><button class="${btnBase.replace("rounded-md", "rounded-l-md rounded-r-none")} ${btnVariant.default} ${btnSize.sm}">Save</button><button class="${btnBase.replace("rounded-md", "rounded-r-md rounded-l-none")} ${btnVariant.default} ${btnSize.sm} px-2">${chevronDown}</button></div>`,
          caption: "With no divider the chevron looks like part of one button, hiding the menu.",
        },
        do: {
          html: `<div class="inline-flex"><button class="${btnBase.replace("rounded-md", "rounded-l-md rounded-r-none")} ${btnVariant.default} ${btnSize.sm}">Save</button><button class="${btnBase.replace("rounded-md", "rounded-r-md rounded-l-none")} ${btnVariant.default} ${btnSize.sm} border-l border-l-primary-foreground/20 px-2">${chevronDown}</button></div>`,
          caption: "Separate the chevron with a hairline so the secondary menu reads as distinct.",
        },
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
        const plus = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
        const dis = s.disabled ? " disabled" : "";
        if (s.size === "icon") return btn(s.variant as string, s.withIcon ? plus : "+", "icon", dis);
        const inner = s.withIcon ? `${plus}${s.label}` : `${s.label}`;
        return btn(s.variant as string, inner, s.size as string, dis);
      },
    },
    sections: [],
    donts: [
      {
        title: "Default (primary)",
        dont: {
          html: `<div class="flex gap-2">${btn("default", "Save")}${btn("default", "Apply")}${btn("default", "Continue")}</div>`,
          caption: "Multiple primaries compete; nothing stands out.",
        },
        do: {
          html: `<div class="flex gap-2">${btn("default", "Save")}${btn("outline", "Cancel")}</div>`,
          caption: "One clear primary action; everything else is supporting.",
        },
      },
      {
        title: "Outline",
        dont: {
          html: `<div class="flex gap-2">${btn("outline", "Save")}${btn("outline", "Publish")}${btn("outline", "Schedule")}</div>`,
          caption: "All-outline leaves no signal which action is primary.",
        },
        do: {
          html: `<div class="flex gap-2">${btn("default", "Publish")}${btn("outline", "Save draft")}${btn("outline", "Schedule")}</div>`,
          caption: "Promote the main action to default; keep the rest outline.",
        },
      },
      {
        title: "Secondary",
        dont: {
          html: btn("secondary", "Create account"),
          caption: "A secondary button as the main call to action under-sells it.",
        },
        do: {
          html: `<div class="flex gap-2">${btn("default", "Create account")}${btn("secondary", "Import instead")}</div>`,
          caption: "Default for the primary action; secondary for the next one down.",
        },
      },
      {
        title: "Ghost",
        dont: {
          html: btn("ghost", "Save changes"),
          caption: "A ghost button is too quiet to carry the primary action.",
        },
        do: {
          html: `<div class="flex gap-2">${btn("ghost", "Cancel")}${btn("default", "Save changes")}</div>`,
          caption: "Use ghost for tertiary and toolbar actions; keep the CTA filled.",
        },
      },
      {
        title: "Destructive",
        dont: {
          html: btn("destructive", "Save changes"),
          caption: "Red on a safe action cries wolf; users learn to ignore it.",
        },
        do: {
          html: `<div class="flex gap-2">${btn("default", "Save changes")}${btn("destructive", "Delete account")}</div>`,
          caption: "Reserve the destructive variant for irreversible actions like delete.",
        },
      },
      {
        title: "Link",
        dont: {
          html: btn("link", "Submit form"),
          caption: "A link-styled submit doesn't look pressable and gets lost.",
        },
        do: {
          html: `<div class="flex items-center gap-3">${btn("default", "Submit")}${btn("link", "Learn more")}</div>`,
          caption: "Link variant for inline navigation; a filled button for the submit.",
        },
      },
    ],
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
        const desc = s.withDesc ? `<div class="text-xs text-muted-foreground">Get notified when activity happens on your account.</div>` : "";
        return `<label class="flex cursor-pointer gap-2"><input type="checkbox"${checked}${disabled} class="mt-0.5 size-4 accent-primary"><div><div class="text-sm font-medium">${s.label}</div>${desc}</div></label>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Selection",
        dont: {
          html: `<div class="flex flex-col gap-2 text-sm"><div class="mb-1 font-semibold">Plan</div><label class="flex items-center gap-2"><input type="checkbox" class="size-4 accent-primary"> Free</label><label class="flex items-center gap-2"><input type="checkbox" checked class="size-4 accent-primary"> Pro</label><label class="flex items-center gap-2"><input type="checkbox" class="size-4 accent-primary"> Enterprise</label></div>`,
          caption: "Checkboxes allow multiple selections; for a one-of choice they let users pick contradictory options.",
        },
        do: {
          html: `<div class="flex flex-col gap-2 text-sm"><div class="mb-1 font-semibold">Plan</div><label class="flex items-center gap-2"><input type="radio" name="dd-plan" class="size-4 accent-primary"> Free</label><label class="flex items-center gap-2"><input type="radio" name="dd-plan" checked class="size-4 accent-primary"> Pro</label><label class="flex items-center gap-2"><input type="radio" name="dd-plan" class="size-4 accent-primary"> Enterprise</label></div>`,
          caption: "Radios for one-of-many; reserve checkboxes for independent multi-select.",
        },
      },
      {
        title: "With description",
        dont: {
          html: `<div class="flex gap-2 text-sm"><input type="checkbox" checked class="mt-0.5 size-4 accent-primary"><div><div class="font-medium">Email notifications</div><div class="text-xs text-muted-foreground">Get notified when activity happens on your account.</div></div></div>`,
          caption: "A bare div makes only the 16px box clickable; the label text does nothing.",
        },
        do: {
          html: `<label class="flex cursor-pointer gap-2 text-sm"><input type="checkbox" checked class="mt-0.5 size-4 accent-primary"><div><div class="font-medium">Email notifications</div><div class="text-xs text-muted-foreground">Get notified when activity happens on your account.</div></div></label>`,
          caption: "Wrap the box, label, and description in a <label> so the whole row toggles.",
        },
      },
      {
        title: "Disabled",
        dont: {
          html: `<label class="flex items-center gap-2 text-sm"><input type="checkbox" disabled class="size-4 accent-primary"> Export to CSV</label>`,
          caption: "A disabled option with no reason leaves users stuck and guessing.",
        },
        do: {
          html: `<label class="flex items-center gap-2 text-sm"><input type="checkbox" disabled class="size-4 accent-primary"> Export to CSV <span class="text-xs text-muted-foreground">(Pro plan)</span></label>`,
          caption: "Say why it's unavailable, like a plan gate, or don't show it at all.",
        },
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
        const label = s.withLabel ? `<label class="${labelCls}">Assigned to</label>` : "";
        const helper = s.withHelper ? `<p class="${helperCls}">The person responsible for this account.</p>` : "";
        const items = ["Wade Cooper", "Arlene Mccoy", "Devon Webb"].map((n, i) => cbItemEl(n, i === 0)).join("");
        return `<div class="max-w-[280px]">${label}<div class="relative"><input class="${inputBase}" placeholder="${s.placeholder}"${dis}${cbFilter}><div data-cb-list class="${cbList}"${cbSelect}>${items}</div></div>${helper}</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "When to use",
        dont: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Size</label><div class="relative"><input class="${inputBase}" placeholder="Search…"${cbFilter}><div data-cb-list class="${cbList}"${cbSelect}>${["Small", "Medium", "Large"].map((n) => cbItemEl(n)).join("")}</div></div></div>`,
          caption: "Type or click: a search field for three fixed options is overhead with nothing to filter.",
        },
        do: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Size</label><select class="${inputBase}" onchange="this.classList.add('ring-2','ring-ring');var el=this;setTimeout(function(){el.classList.remove('ring-2','ring-ring')},500)"><option>Small</option><option>Medium</option><option>Large</option></select></div>`,
          caption: "A plain select for short, fixed lists; reserve the combobox for long, searchable ones.",
        },
      },
      {
        title: "Filtering",
        dont: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label><div class="relative"><input class="${inputBase}" placeholder="Type to filter… (nothing happens)"><div data-cb-list class="${cbList}"${cbSelect}>${["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook", "Tanya Fox", "Hellen Schmidt"].map((n) => cbItemEl(n)).join("")}</div></div></div>`,
          caption: "Try typing: a search box that ignores input is just a dropdown wearing a costume.",
        },
        do: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label><div class="relative"><input class="${inputBase}" placeholder="Type to filter…"${cbFilter}><div data-cb-list class="${cbList}"${cbSelect}>${["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook", "Tanya Fox", "Hellen Schmidt"].map((n) => cbItemEl(n)).join("")}</div></div></div>`,
          caption: "Type a few letters: the list narrows as you go, so a long list stays usable.",
        },
      },
      {
        title: "Selection",
        dont: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label><div class="relative"><input class="${inputBase}" placeholder="Pick a person…"${cbFilter}><div data-cb-list class="${cbList}" onclick="var t=event.target.closest('[data-cb-item]');if(!t)return;t.classList.add('bg-accent');setTimeout(function(){t.classList.remove('bg-accent')},250)">${["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook"].map((n) => cbItemEl(n)).join("")}</div></div></div>`,
          caption: "Click an option: it flashes but the field stays empty, so you can't tell what you picked.",
        },
        do: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label><div class="relative"><input class="${inputBase}" value="Devon Webb"${cbFilter}><div data-cb-list class="${cbList}"${cbSelect}>${cbItemEl("Wade Cooper")}${cbItemEl("Arlene Mccoy")}${cbItemEl("Devon Webb", true)}${cbItemEl("Tom Cook")}</div></div></div>`,
          caption: "Click an option: it fills the input and stays marked as selected.",
        },
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
          return `<div class="flex h-8 items-center gap-3 text-sm"><span>Left</span><div class="h-5 w-px bg-border"></div><span>Right</span></div>`;
        }
        if (s.variant === "label") return `<div class="w-80">${sepLabel(s.label as string)}</div>`;
        if (s.variant === "action") {
          return `<div class="flex w-80 items-center gap-3"><hr class="flex-1 border-border"><button class="${btnBase} ${btnVariant.ghost} ${btnSize.sm}" onclick="this.textContent=this.textContent==='Show more'?'Show less':'Show more'">Show more</button><hr class="flex-1 border-border"></div>`;
        }
        return `<hr class="w-64 border-border">`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Plain",
        dont: {
          html: `<div class="max-w-[280px]" onclick="var r=event.target.closest('[data-row]');if(!r)return;r.classList.add('bg-accent');setTimeout(function(){r.classList.remove('bg-accent')},250)"><div data-row class="cursor-pointer rounded-md px-2 py-1.5 text-sm">Profile</div>${hrLine}<div data-row class="cursor-pointer rounded-md px-2 py-1.5 text-sm">Account</div>${hrLine}<div data-row class="cursor-pointer rounded-md px-2 py-1.5 text-sm">Notifications</div>${hrLine}<div data-row class="cursor-pointer rounded-md px-2 py-1.5 text-sm">Billing</div></div>`,
          caption: "Click a row: a divider between every one is noise that competes with the content.",
        },
        do: {
          html: `<div class="max-w-[280px]" onclick="var r=event.target.closest('[data-row]');if(!r)return;r.classList.add('bg-accent');setTimeout(function(){r.classList.remove('bg-accent')},250)"><div data-row class="cursor-pointer rounded-md px-2 py-1.5 text-sm">Profile</div><div data-row class="cursor-pointer rounded-md px-2 py-1.5 text-sm">Account</div><div data-row class="cursor-pointer rounded-md px-2 py-1.5 text-sm">Notifications</div>${hrLine}<div data-row class="cursor-pointer rounded-md px-2 py-1.5 text-sm">Sign out</div></div>`,
          caption: "Click a row: group with spacing and reserve a divider for a real break like Sign out.",
        },
      },
      {
        title: "With label",
        dont: {
          html: `<div class="flex w-80 flex-col gap-2"><button class="${btnBase} ${btnVariant.default} ${btnSize.default} w-full" onclick="this.classList.add('ring-2','ring-ring');var b=this;setTimeout(function(){b.classList.remove('ring-2','ring-ring')},400)">Sign in</button>${sepLabel("or continue with one of your previously linked third-party accounts")}</div>`,
          caption: "Click Sign in: a full sentence in the label divider buries the choice.",
        },
        do: {
          html: `<div class="flex w-80 flex-col gap-2"><button class="${btnBase} ${btnVariant.default} ${btnSize.default} w-full" onclick="this.classList.add('ring-2','ring-ring');var b=this;setTimeout(function(){b.classList.remove('ring-2','ring-ring')},400)">Sign in</button>${sepLabel("or continue with")}<div class="flex gap-2"><button class="${btnBase} ${btnVariant.outline} ${btnSize.default} flex-1" onclick="this.classList.add('ring-2','ring-ring');var b=this;setTimeout(function(){b.classList.remove('ring-2','ring-ring')},400)">Google</button><button class="${btnBase} ${btnVariant.outline} ${btnSize.default} flex-1" onclick="this.classList.add('ring-2','ring-ring');var b=this;setTimeout(function(){b.classList.remove('ring-2','ring-ring')},400)">GitHub</button></div></div>`,
          caption: "Click a provider: keep the label to a few words and let the buttons carry the options.",
        },
      },
      {
        title: "With action",
        dont: {
          html: `<div class="flex w-80 items-center gap-3"><hr class="flex-1 border-border"><button class="${btnBase} ${btnVariant.ghost} ${btnSize.sm}">Show more</button><hr class="flex-1 border-border"></div>`,
          caption: "Click the button: an action divider that does nothing is just decoration.",
        },
        do: {
          html: `<div class="w-80"><div data-extra class="hidden py-1.5 text-sm text-muted-foreground">Logged in from 2 new devices · 3 more entries</div><div class="flex items-center gap-3"><hr class="flex-1 border-border"><button class="${btnBase} ${btnVariant.ghost} ${btnSize.sm}" onclick="var x=this.parentElement.parentElement.querySelector('[data-extra]');x.classList.toggle('hidden');this.textContent=x.classList.contains('hidden')?'Show more':'Show less'">Show more</button><hr class="flex-1 border-border"></div></div>`,
          caption: "Click Show more: the button toggles its label and reveals the rest.",
        },
      },
      {
        title: "Vertical",
        dont: {
          html: `<div class="flex flex-col items-start gap-2" onclick="var a=event.target.closest('[data-act]');if(!a)return;a.classList.add('text-primary');setTimeout(function(){a.classList.remove('text-primary')},400)"><span data-act class="cursor-pointer text-sm">Edit</span><div class="h-4 w-px bg-border"></div><span data-act class="cursor-pointer text-sm">Delete</span></div>`,
          caption: "Click an action: a vertical rule between stacked items reads as a glitch.",
        },
        do: {
          html: `<div class="flex items-center gap-3" onclick="var a=event.target.closest('[data-act]');if(!a)return;a.classList.add('text-primary');setTimeout(function(){a.classList.remove('text-primary')},400)"><span data-act class="cursor-pointer text-sm">Edit</span><div class="h-4 w-px bg-border"></div><span data-act class="cursor-pointer text-sm">Delete</span><div class="h-4 w-px bg-border"></div><span data-act class="cursor-pointer text-sm">Share</span></div>`,
          caption: "Click an action: the vertical rule separates inline actions in a row.",
        },
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
        { type: "check", key: "trigger", label: "Trigger button (click to open)" },
        { type: "check", key: "label", label: "Section label" },
        { type: "check", key: "icons", label: "Leading icons" },
        { type: "check", key: "shortcuts", label: "Keyboard shortcuts" },
        { type: "check", key: "disabledItem", label: "Disabled item" },
        { type: "check", key: "destructive", label: "Destructive item" },
      ],
      defaults: { trigger: false, label: false, icons: true, shortcuts: false, disabledItem: false, destructive: false },
      render: (s) => {
        const ico = (d: string) => s.icons ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">${d}</svg>` : "";
        const sc = (k: string) => s.shortcuts ? shortcut(k) : "";
        let items = s.label ? `<div class="${menuLabel}">Actions</div>` : "";
        items += menuItemEl(`${ico(`<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>`)}<span>Edit profile</span>${sc("⌘E")}`);
        items += menuItemEl(`${ico(`<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`)}<span>Duplicate</span>${sc("⌘D")}`);
        items += menuItemEl(`${ico(`<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`)}<span>Settings</span>${sc("⌘,")}`);
        if (s.disabledItem) items += menuItemEl(`<span>Archive</span>`, "pointer-events-none opacity-50", " disabled");
        if (s.destructive) items += `<div class="${menuSep}"></div>` + menuItemEl(`${ico(`<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`)}<span>Delete…</span>`, "text-destructive");
        if (s.trigger) {
          return `<div class="relative inline-block pb-28" onclick="event.stopPropagation()"><button class="${btnBase} ${btnVariant.outline} ${btnSize.sm}"${menuTrigger}>Actions ${chevronDown}</button><div class="${menuBase} absolute left-0 top-full z-10 mt-1 hidden"${menuFlash}>${items}</div></div>`;
        }
        return `<div class="${menuBase}"${menuFlash}>${items}</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Trigger",
        dont: {
          html: `<div class="${menuBase}"${menuFlash}>${menuItemEl("<span>Edit profile</span>")}${menuItemEl("<span>Duplicate</span>")}${menuItemEl("<span>Settings</span>")}</div>`,
          caption: "Always open: it clutters the page and there's no way to dismiss it.",
        },
        do: {
          html: `<div class="relative inline-block pb-28" onclick="event.stopPropagation()"><button class="${btnBase} ${btnVariant.outline} ${btnSize.sm}"${menuTrigger}>Actions ${chevronDown}</button><div class="${menuBase} absolute left-0 top-full z-10 mt-1 hidden"${menuFlash}>${menuItemEl("<span>Edit profile</span>")}${menuItemEl("<span>Duplicate</span>")}${menuItemEl("<span>Settings</span>")}</div></div>`,
          caption: "Click Actions to open; click outside to dismiss.",
        },
      },
      {
        title: "Sectioning",
        dont: {
          html: `<div class="${menuBase}"${menuFlash}>${["New file", "New folder", "Upload", "Rename", "Duplicate", "Move to…", "Download", "Delete"].map((l) => menuItemEl(l)).join("")}</div>`,
          caption: "Click an item: a long, flat menu of eight actions is hard to scan.",
        },
        do: {
          html: `<div class="${menuBase}"${menuFlash}><div class="${menuLabel}">Create</div>${["New file", "New folder", "Upload"].map((l) => menuItemEl(l)).join("")}<div class="${menuSep}"></div><div class="${menuLabel}">Manage</div>${["Rename", "Move to…", "Download"].map((l) => menuItemEl(l)).join("")}</div>`,
          caption: "Click an item: group related actions under labels with a separator.",
        },
      },
      {
        title: "Disabled item",
        dont: {
          html: `<div class="${menuBase}"${menuFlash}>${menuItemEl("Edit")}${menuItemEl("Archive", "opacity-50")}${menuItemEl("Duplicate")}</div>`,
          caption: "Click Archive: it looks disabled but still fires, a greyed item that works is a trap.",
        },
        do: {
          html: `<div class="${menuBase}"${menuFlash}>${menuItemEl("Edit")}${menuItemEl("Archive", "pointer-events-none opacity-50", " disabled")}${menuItemEl("Duplicate")}</div>`,
          caption: "Click Archive: nothing happens; a real disabled item doesn't respond.",
        },
      },
      {
        title: "Destructive item",
        dont: {
          html: `<div class="${menuBase}"${menuFlash}>${menuItemEl("Edit")}${menuItemEl("Delete")}${menuItemEl("Duplicate")}</div>`,
          caption: "Click an item: a destructive action wedged between routine ones invites a costly misclick.",
        },
        do: {
          html: `<div class="${menuBase}"${menuFlash}>${menuItemEl("Edit")}${menuItemEl("Duplicate")}<div class="${menuSep}"></div>${menuItemEl("Delete", "text-destructive")}</div>`,
          caption: "Click an item: separate destructive actions with a divider, color them, and place them last.",
        },
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
      defaults: { size: 24, color: "foreground" },
      render: (s) => {
        const sz = s.size as number;
        const colorCls: Record<string, string> = { foreground: "text-foreground", primary: "text-primary", destructive: "text-destructive", muted: "text-muted-foreground" };
        return `<span class="${colorCls[s.color as string]}"><svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>`;
      },
    },
    sections: [
      {
        title: "Full set",
        description: "90+ icons currently in the set. All Lucide-style outline with 1.75 stroke weight.",
        examples: [{
          full: true,
          html: `<div class="grid w-full grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-0.5 text-[10px]">
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><code class="text-muted-foreground">activity</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><code class="text-muted-foreground">alert-tri</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 3v4M8 3v4"/></svg><code class="text-muted-foreground">archive</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><code class="text-muted-foreground">bell</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><code class="text-muted-foreground">calendar</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><code class="text-muted-foreground">check</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg><code class="text-muted-foreground">chevron-down</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><code class="text-muted-foreground">clock</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg><code class="text-muted-foreground">code</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><code class="text-muted-foreground">copy</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg><code class="text-muted-foreground">database</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><code class="text-muted-foreground">download</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><code class="text-muted-foreground">eye</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg><code class="text-muted-foreground">file</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg><code class="text-muted-foreground">filter</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><code class="text-muted-foreground">globe</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><code class="text-muted-foreground">home</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><code class="text-muted-foreground">info</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg><code class="text-muted-foreground">key</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><code class="text-muted-foreground">lock</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><code class="text-muted-foreground">mail</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><code class="text-muted-foreground">plus</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><code class="text-muted-foreground">search</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><code class="text-muted-foreground">settings</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><code class="text-muted-foreground">shield</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><code class="text-muted-foreground">star</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg><code class="text-muted-foreground">trash</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><code class="text-muted-foreground">upload</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><code class="text-muted-foreground">user</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><code class="text-muted-foreground">users</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><code class="text-muted-foreground">x</code></div>
  <div class="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><code class="text-muted-foreground">zap</code></div>
</div>`,
        }],
      },
    ],
    donts: [{
      dont: {
        html: `<div class="flex items-center gap-5">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
</div>`,
        caption: "Mixed stroke weights and a stray filled glyph make a set look incoherent.",
      },
      do: {
        html: `<div class="flex items-center gap-5">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
</div>`,
        caption: "One outline style at 1.75 stroke across the whole set.",
      },
    }],
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
        const inputCls = s.size === "sm" ? inputBase.replace("h-9", "h-8") : s.size === "lg" ? inputBase.replace("h-9", "h-10") : inputBase;
        const searchIco = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
        const mailIco = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
        if (s.variant === "lead-text") return `<div class="flex"><span class="${inputAddon} rounded-l-md border-r-0">https://</span><input class="${inputCls} rounded-l-none" placeholder="example.com"${dis}></div>`;
        if (s.variant === "trail-text") return `<div class="flex"><input class="${inputCls} rounded-r-none" placeholder="ada"${dis}><span class="${inputAddon} rounded-r-md border-l-0">@canvas.dev</span></div>`;
        if (s.variant === "lead-icon") return `<div class="relative"><span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">${searchIco}</span><input class="${inputCls} pl-9" placeholder="Quick search…"${dis}></div>`;
        if (s.variant === "trail-icon") return `<div class="relative"><input class="${inputCls} pr-9" placeholder="you@example.com"${dis}><span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">${mailIco}</span></div>`;
        if (s.variant === "currency") return `<div class="flex"><span class="${inputAddon} rounded-l-md border-r-0">$</span><input class="${inputCls} rounded-none" type="number" placeholder="0.00"${dis}><span class="${inputAddon} rounded-r-md border-l-0">USD</span></div>`;
        return `<div class="flex"><input class="${inputCls} rounded-r-none font-mono" value="sk_live_••••••••4242" readonly${dis}><button class="${btnBase} ${btnVariant.outline} ${btnSize.sm} rounded-l-none border-l-0" onclick="var b=this;var o=b.textContent;b.textContent='Copied!';setTimeout(function(){b.textContent=o},1500)">Copy</button></div>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<div class="flex max-w-[320px]"><span class="${inputAddon} rounded-l-md border-r-0">https://</span><input class="${inputBase} rounded-l-none" placeholder="https://example.com"></div>`,
        caption: "The addon already shows the protocol; repeating it in the placeholder is redundant.",
      },
      do: {
        html: `<div class="flex max-w-[320px]"><span class="${inputAddon} rounded-l-md border-r-0">https://</span><input class="${inputBase} rounded-l-none" placeholder="example.com"></div>`,
        caption: "Let the addon carry the fixed part; the input holds only what the user types.",
      },
    }],
  },

  {
    slug: "input",
    name: "Inputs & Forms",
    description: "One <code>.input</code> primitive drives text inputs, selects, textareas, and the search field. Every form composes <code>.label</code> + control + <code>.field-helper</code> in that order.",
    category: "Atoms",
    playground: {
      controls: [
        { type: "pills", key: "type", label: "Control", options: ["text", "number", "select", "textarea"], cols: 4 },
        { type: "pills", key: "state", label: "State", options: ["default", "focus", "error", "disabled", "readonly"], cols: 3 },
        { type: "check", key: "icon", label: "With leading icon", disabledWhen: (s) => s.type !== "text" },
        { type: "check", key: "helper", label: "Show helper" },
      ],
      defaults: { type: "text", state: "default", icon: true, helper: true },
      render: (s) => {
        const st = s.state as string;
        const sstyle = `${st === "error" ? "border-color:var(--destructive);" : ""}${st === "focus" ? "box-shadow:0 0 0 2px var(--ring);" : ""}`;
        const dis = st === "disabled" ? " disabled" : "";
        const ro = st === "readonly" ? " readonly" : "";
        const labelText = s.type === "select" ? "Status" : s.type === "textarea" ? "Notes" : "Email";
        const helperText = st === "error" ? "Please enter a valid email address." : "We'll use this for account recovery.";
        const helper = s.helper ? `<p class="${helperCls}" style="${st === "error" ? "color:var(--destructive)" : ""}">${helperText}</p>` : "";
        let control;
        if (s.type === "select") {
          control = `<select class="${inputBase}" style="${sstyle}"${dis}><option>Active</option><option>Inactive</option><option>Pending</option></select>`;
        } else if (s.type === "textarea") {
          control = `<textarea class="${inputBase.replace("h-9", "min-h-20")}" style="${sstyle}"${dis}${ro}>Describe the change…</textarea>`;
        } else if (s.type === "number") {
          control = `<input class="${inputBase}" type="number" value="1024" style="${sstyle}"${dis}${ro}>`;
        } else if (s.icon) {
          control = `<div class="relative"><input class="${inputBase} pl-9" value="rachel.chen@example.com" style="${sstyle}"${dis}${ro}><span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span></div>`;
        } else {
          control = `<input class="${inputBase}" value="rachel.chen@example.com" style="${sstyle}"${dis}${ro}>`;
        }
        return `<div class="max-w-[320px]"><label class="${labelCls}">${labelText}</label>${control}${helper}</div>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<div class="max-w-[320px]"><input class="${inputBase}" placeholder="Email"></div>`,
        caption: "A placeholder is not a label; it vanishes the moment the user types and screen readers may skip it.",
      },
      do: {
        html: `<div class="max-w-[320px]"><label class="${labelCls}">Email</label><input class="${inputBase}" placeholder="ada@acme.dev"></div>`,
        caption: "Pair every field with a persistent .label above the control.",
      },
    }],
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
          return `<div data-p="${cur}" class="flex items-center justify-between gap-4 text-sm" onclick="var c=this;var t=event.target.closest('button');if(!t||t.disabled)return;var p=+c.dataset.p;if(/Next/.test(t.textContent)&&p<${total})p++;else if(/Previous/.test(t.textContent)&&p>1)p--;else return;c.dataset.p=p;c.querySelector('[data-info]').textContent='Showing '+(((p-1)*${perPage})+1)+'–'+Math.min(p*${perPage},${total * perPage})+' of ${total * perPage}';var bs=c.querySelectorAll('button');bs[0].disabled=p<=1;bs[1].disabled=p>=${total}"><span data-info class="text-muted-foreground">Showing ${showFrom}–${showTo} of ${total * perPage}</span><div class="flex gap-1">${btn("outline", "Previous", "sm", prevDis)}${btn("outline", "Next", "sm", nextDis)}</div></div>`;
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
          const pages = list.map((p) => p === -1 ? `<span class="px-1 text-muted-foreground">…</span>` : pageBtn(String(p), p === cur)).join("");
          return `<div class="flex items-center gap-1" onclick="var b=event.target.closest('[data-pg]');if(!b)return;this.querySelectorAll('[data-pg]').forEach(function(x){x.className='${pageBtnCls}'});b.className='${pageBtnCls} ${pageBtnActive}'">${btn("outline", "Previous", "sm", prevDis)}${pages}${btn("outline", "Next", "sm", nextDis)}</div>`;
        }
        return `<div data-p="${cur}" data-per="${perPage}" class="flex items-center gap-4 text-sm"><div class="flex items-center gap-2"><span class="text-muted-foreground">Rows per page</span><select class="${inputBase.replace("h-9", "h-7")} w-16 text-xs" onchange="var c=this.closest('[data-p]');c.dataset.per=+this.value;c.dataset.p=1;var tp=Math.max(1,Math.ceil(${total * perPage}/+this.value));c.querySelector('[data-info]').textContent='Page 1 of '+tp;var bs=c.querySelectorAll('button');bs[0].disabled=true;bs[1].disabled=tp<=1"><option>10</option><option>25</option><option>50</option></select></div><span data-info class="text-muted-foreground">Page ${cur} of ${total}</span><div class="flex gap-1" onclick="var c=this.closest('[data-p]');var t=event.target.closest('button');if(!t||t.disabled)return;var p=+c.dataset.p;var tp=Math.max(1,Math.ceil(${total * perPage}/+c.dataset.per));if(t.textContent.includes('>')&&p<tp)p++;else if(t.textContent.includes('<')&&p>1)p--;else return;c.dataset.p=p;c.querySelector('[data-info]').textContent='Page '+p+' of '+tp;var bs=c.querySelectorAll('button');bs[0].disabled=p<=1;bs[1].disabled=p>=tp"><button class="${btnBase} ${btnVariant.outline} h-7 w-7 rounded-md p-0"${prevDis}>&lt;</button><button class="${btnBase} ${btnVariant.outline} h-7 w-7 rounded-md p-0"${nextDis}>&gt;</button></div></div>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<nav class="flex items-center gap-1">${pageBtn("&laquo;", false, " disabled")}${pageBtn("1", true)}${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => pageBtn(String(n))).join("")}${pageBtn("&raquo;")}</nav>`,
        caption: "Rendering every page number overflows and stops being scannable past a handful.",
      },
      do: {
        html: `<nav class="flex items-center gap-1">${pageBtn("&laquo;", false, " disabled")}${pageBtn("1", true)}${pageBtn("2")}${pageBtn("3")}<span class="px-1 text-muted-foreground">...</span>${pageBtn("12")}${pageBtn("&raquo;")}</nav>`,
        caption: "Truncate the middle with an ellipsis; keep first, last, and a window around the current page.",
      },
    }],
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
          return `<div data-rg class="grid grid-cols-3 gap-2">${opts.map(o => {
            const sel = o.val === "pro";
            return `<label class="${radioCard(sel)}"><input type="radio" name="pg-radio-card" class="accent-primary mb-2"${sel ? " checked" : ""} onchange="var g=this.closest('[data-rg]');g.querySelectorAll('label').forEach(function(l){l.className='${radioCard(false)}'});this.closest('label').className='${radioCard(true)}'"><span class="text-[13px] font-semibold">${o.label}</span>${s.withDesc ? `<span class="text-xs text-muted-foreground">${o.desc}</span>` : ""}</label>`;
          }).join("")}</div>`;
        }
        if (s.variant === "inline") {
          return `<div class="flex gap-6">${opts.map(o =>
            `<label class="flex cursor-pointer items-center gap-2 text-sm"><input type="radio" name="pg-radio" class="accent-primary"${o.val === "pro" ? " checked" : ""}>${o.label}</label>`
          ).join("")}</div>`;
        }
        return `<div class="flex flex-col gap-2.5">${opts.map(o =>
          `<label class="flex cursor-pointer gap-2"><input type="radio" name="pg-radio" class="accent-primary mt-[3px]"${o.val === "pro" ? " checked" : ""}><div><div class="text-[13px] font-medium">${o.label}</div>${s.withDesc ? `<div class="text-xs text-muted-foreground">${o.desc}</div>` : ""}</div></label>`
        ).join("")}</div>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<div class="flex flex-col gap-2 text-sm">
  <div class="mb-1 font-semibold">Plan</div>
  <label class="flex items-center gap-2"><input type="radio" name="dd-r1" class="accent-primary"> Hobby</label>
  <label class="flex items-center gap-2"><input type="radio" name="dd-r1" class="accent-primary"> Pro</label>
  <label class="flex items-center gap-2"><input type="radio" name="dd-r1" class="accent-primary"> Enterprise</label>
</div>`,
        caption: "Leaving a radio group with nothing selected forces an extra decision and can submit empty.",
      },
      do: {
        html: `<div class="flex flex-col gap-2 text-sm">
  <div class="mb-1 font-semibold">Plan</div>
  <label class="flex items-center gap-2"><input type="radio" name="dd-r2" class="accent-primary"> Hobby</label>
  <label class="flex items-center gap-2"><input type="radio" name="dd-r2" checked class="accent-primary"> Pro</label>
  <label class="flex items-center gap-2"><input type="radio" name="dd-r2" class="accent-primary"> Enterprise</label>
</div>`,
        caption: "Pre-select a sensible default so the common path needs no clicks.",
      },
    }],
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
        const sz = s.size === "sm" ? inputBase.replace("h-9", "h-8") : s.size === "lg" ? inputBase.replace("h-9", "h-10") : inputBase;
        const dis = s.disabled ? " disabled" : "";
        const label = s.withLabel ? `<label class="${labelCls}">Country</label>` : "";
        const globe = s.withIcon ? `<span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>` : "";
        const pad = s.withIcon ? " pl-9" : "";
        return `<div class="max-w-[280px]">${label}<div class="relative">${globe}<select class="${sz}${pad}"${dis}><option>United States</option><option>Canada</option><option>Mexico</option><option>United Kingdom</option></select></div></div>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<div class="max-w-[280px]">
  <label class="${labelCls}">Country</label>
  <select class="${inputBase}">
    <option>Choose a country…</option>
    <option>United States</option>
    <option>Canada</option>
    <option>Mexico</option>
  </select>
</div>`,
        caption: "A placeholder as a normal option can be submitted as a real value.",
      },
      do: {
        html: `<div class="max-w-[280px]">
  <label class="${labelCls}">Country</label>
  <select class="${inputBase}">
    <option value="" disabled selected>Choose a country…</option>
    <option>United States</option>
    <option>Canada</option>
    <option>Mexico</option>
  </select>
</div>`,
        caption: "Mark the placeholder disabled and selected so it prompts without being a valid choice.",
      },
    }],
  },

  {
    slug: "skeleton",
    name: "Skeletons",
    description: "Placeholders for loading content.",
    category: "Atoms",
    playground: {
      controls: [
        { type: "pills", key: "shape", label: "Shape", options: ["text", "avatar", "button", "card", "list", "table"], cols: 3 },
        { type: "range", key: "width", label: "Width", min: 10, max: 100, step: 5, suffix: "%", disabledWhen: (s) => s.shape === "card" || s.shape === "list" || s.shape === "table" },
        { type: "check", key: "animate", label: "Animate pulse" },
      ],
      defaults: { shape: "text", width: 60, animate: true },
      render: (s) => {
        const pulse = s.animate as boolean;
        const w = s.width as number;
        if (s.shape === "avatar") {
          const sz = Math.round(w * 0.8);
          return `<div class="${skelCls(pulse)} rounded-full" style="width:${sz}px;height:${sz}px"></div>`;
        }
        if (s.shape === "button") {
          return `<div class="${skelCls(pulse)} rounded-md" style="width:${Math.round(w * 1.6)}px;height:36px"></div>`;
        }
        if (s.shape === "card") {
          return `<div class="${cardCls} max-w-[320px] p-4"><div class="mb-4 flex items-center gap-3"><div class="${skelCls(pulse)} shrink-0 rounded-full" style="width:40px;height:40px"></div><div class="flex-1">${skLine(pulse, "70%")}${skLine(pulse, "40%", "mt-1.5")}</div></div>${skLine(pulse, "100%")}${skLine(pulse, "80%", "mt-1.5")}</div>`;
        }
        if (s.shape === "list") {
          const row = (a: string, b: string) => `<div class="flex items-center gap-3"><div class="${skelCls(pulse)} rounded-full" style="width:2rem;height:2rem"></div><div class="flex-1">${skLine(pulse, a, "mb-1.5")}${skLine(pulse, b)}</div>${skLine(pulse, "40px")}</div>`;
          return `<div class="flex max-w-[400px] flex-col gap-4">${row("70%", "50%")}${row("55%", "35%")}</div>`;
        }
        if (s.shape === "table") {
          const row = (a: string, b: string, last: boolean) => `<div class="grid gap-3 py-3${last ? "" : " border-b border-border"}" style="grid-template-columns:40px 1fr 1fr 80px">${skLine(pulse, "100%")}${skLine(pulse, a)}${skLine(pulse, b)}${skLine(pulse, "100%")}</div>`;
          return `<div class="max-w-[560px]">${row("70%", "50%", false)}${row("80%", "60%", false)}${row("65%", "45%", true)}</div>`;
        }
        return skLine(pulse, w + "%");
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<div class="${skelCls(true)} rounded-md" style="width:320px;height:88px"></div>`,
        caption: "A generic block that ignores the content's shape causes a jarring shift when it loads.",
      },
      do: {
        html: `<div class="${cardCls} max-w-[320px] p-4"><div class="mb-4 flex items-center gap-3"><div class="${skelCls(true)} shrink-0 rounded-full" style="width:40px;height:40px"></div><div class="flex-1">${skLine(true, "70%")}${skLine(true, "40%", "mt-1.5")}</div></div>${skLine(true, "100%")}</div>`,
        caption: "Mirror the real layout (avatar circle, text lines) so the swap is seamless.",
      },
    }],
  },

  {
    slug: "textarea",
    name: "Textareas",
    description: "Multi-line input, with character count, with toolbar.",
    category: "Atoms",
    playground: {
      controls: [
        { type: "range", key: "rows", label: "Rows", min: 2, max: 10, step: 1 },
        { type: "check", key: "withLabel", label: "With label", disabledWhen: (s) => s.toolbar === true },
        { type: "check", key: "charCounter", label: "Character counter", disabledWhen: (s) => s.toolbar === true },
        { type: "check", key: "toolbar", label: "Formatting toolbar" },
        { type: "check", key: "disabled", label: "Disabled" },
      ],
      defaults: { rows: 4, withLabel: true, charCounter: false, toolbar: false, disabled: false },
      render: (s) => {
        const dis = s.disabled ? " disabled" : "";
        const h = (s.rows as number) * 22 + 16;
        if (s.toolbar) {
          const tbtn = (inner: string, extra: string) => `<button type="button" class="${btnBase} ${btnVariant.ghost} h-8 min-w-8 px-2 ${extra}" onclick="this.classList.toggle('bg-accent');this.classList.toggle('text-accent-foreground')">${inner}</button>`;
          return `<div class="max-w-[400px] overflow-hidden rounded-md border border-border"><div class="flex items-center gap-1 border-b border-border bg-muted/30 px-3 py-2">${tbtn("B", "font-bold")}${tbtn("I", "italic")}${tbtn("&lt;/&gt;", "font-mono text-[11px]")}<span class="mx-1 h-4 w-px bg-border"></span><button type="button" class="${btnBase} ${btnVariant.ghost} h-8 px-3 text-xs" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Posted!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Comment</button></div><textarea class="w-full resize-y bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none" placeholder="Leave a comment…" style="min-height:${h}px"${dis}></textarea></div>`;
        }
        const label = s.withLabel ? `<label class="${labelCls}">Description</label>` : "";
        const counter = s.charCounter ? `<div class="mt-1 flex justify-end"><span class="text-[11px] text-muted-foreground">0 / 280</span></div>` : "";
        const oninput = s.charCounter ? ` oninput="var c=this.value.length;var s=this.nextElementSibling.querySelector('span');s.textContent=c+' / 280';s.classList.toggle('text-destructive',c>280);s.classList.toggle('text-muted-foreground',c<=280)"` : "";
        return `<div class="max-w-[400px]">${label}<textarea class="${taBase}" placeholder="A few words about this project…" style="min-height:${h}px"${dis}${oninput}></textarea>${counter}</div>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<div class="max-w-[400px]">
  <label class="${labelCls}">Description</label>
  <textarea class="${taBase}" style="height:32px;resize:none">This is a longer description that runs past one line and gets clipped.</textarea>
</div>`,
        caption: "A locked, single-line textarea hides long content with no way to expand.",
      },
      do: {
        html: `<div class="max-w-[400px]">
  <label class="${labelCls}">Description</label>
  <textarea class="${taBase}" style="min-height:80px">This is a longer description that runs past one line and stays readable.</textarea>
</div>`,
        caption: "Give a sensible min-height and allow vertical resize so users can see and grow their text.",
      },
    }],
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
        const desc = s.withDesc ? `<div class="text-xs text-muted-foreground">Show your availability to teammates.</div>` : "";
        return `<label class="flex cursor-pointer items-start justify-between gap-4"><div><div class="text-[13px] font-medium">${s.label}</div>${desc}</div>${switchEl(on, dis)}</label>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<div class="flex max-w-[280px] items-center justify-between">
  <span class="text-[13px]">Notifications</span>
  <div class="flex items-center gap-2"><span class="text-xs text-muted-foreground">Off</span>${switchEl(false)}<span class="text-xs text-muted-foreground">On</span></div>
</div>`,
        caption: "An On/Off label duplicates what the switch position already shows.",
      },
      do: {
        html: `<div class="flex max-w-[280px] items-center justify-between">
  <span class="text-[13px]">Notifications</span>
  ${switchEl(true)}
</div>`,
        caption: "Label the setting, not the state; the switch communicates on or off.",
      },
    }],
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
        { type: "pills", key: "reveal", label: "Reveal", options: ["always", "on hover"], cols: 2 },
        { type: "text", key: "label", label: "Label" },
      ],
      defaults: { side: "top", trigger: "icon", reveal: "always", label: "Open settings" },
      render: (s) => {
        const side = s.side as string;
        const lbl = s.label as string;
        let triggerHtml = "";
        if (s.trigger === "icon") {
          triggerHtml = btn("ghost", `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>`, "icon");
        } else if (s.trigger === "button") {
          triggerHtml = btn("outline", "Hover me", "sm");
        } else {
          triggerHtml = `<span class="cursor-help text-sm underline decoration-dotted">hover this text</span>`;
        }
        let pos = "";
        if (side === "top") pos = "bottom:calc(100% + 8px);left:50%;transform:translateX(-50%)";
        if (side === "bottom") pos = "top:calc(100% + 8px);left:50%;transform:translateX(-50%)";
        if (side === "left") pos = "right:calc(100% + 8px);top:50%;transform:translateY(-50%)";
        if (side === "right") pos = "left:calc(100% + 8px);top:50%;transform:translateY(-50%)";
        const hover = s.reveal === "on hover";
        const tipDisplay = hover ? "display:none;" : "";
        const wrapperEvents = hover ? ` onmouseenter="this.querySelector('[data-tip]').style.display='block'" onmouseleave="this.querySelector('[data-tip]').style.display='none'" onfocusin="this.querySelector('[data-tip]').style.display='block'" onfocusout="this.querySelector('[data-tip]').style.display='none'"` : "";
        return `<div class="relative inline-flex"${wrapperEvents}>${triggerHtml}<div class="${tooltipCls} absolute whitespace-nowrap" data-tip style="${pos};${tipDisplay}">${lbl}</div></div>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<div class="pb-14">
  <div class="relative inline-flex">
    ${btn("ghost", "?", "icon")}
    <div class="${tooltipCls} absolute w-60" style="top:calc(100% + 8px);left:0;white-space:normal">To rotate this key you must first revoke the old one in Settings, then confirm via email within 24 hours.</div>
  </div>
</div>`,
        caption: "Long, essential instructions hidden in a tooltip are missed on touch and by screen readers.",
      },
      do: {
        html: `<div class="pb-14">
  <div class="relative inline-flex">
    ${btn("ghost", "?", "icon")}
    <div class="${tooltipCls} absolute whitespace-nowrap" style="top:calc(100% + 8px);left:50%;transform:translateX(-50%)">Rotate key</div>
  </div>
</div>`,
        caption: "Keep tooltips short and supplementary; put essential steps in visible copy.",
      },
    }],
  },

  // ─── Molecules ────────────────────────────────────────────────────────

  {
    slug: "alert",
    name: "Alerts",
    description: "Inline messages: info, success, warning, error.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["info", "success", "warning", "destructive"], cols: 4, disabledWhen: (s) => s.banner === true },
        { type: "check", key: "title", label: "Title", disabledWhen: (s) => s.banner === true },
        { type: "check", key: "actions", label: "Action buttons", disabledWhen: (s) => s.banner === true },
        { type: "check", key: "banner", label: "Full-width banner" },
      ],
      defaults: { variant: "info", title: true, actions: false, banner: false },
      render: (s) => {
        if (s.banner) {
          return `<div class="flex items-center justify-center gap-3 bg-foreground px-4 py-2.5 text-sm text-background"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>We've shipped a new dashboard. <a href="#" class="underline" onclick="event.preventDefault()">See what's new &rarr;</a></span></div>`;
        }
        const v = s.variant as string;
        const titles: Record<string, string> = { info: "Heads up", success: "All set", warning: "Action required", destructive: "Something went wrong" };
        const descs: Record<string, string> = { info: "Maintenance window scheduled for Sunday 2:00 UTC.", success: "Your changes have been saved successfully.", warning: "Your trial expires in 3 days.", destructive: "Could not save your changes. Please try again." };
        const title = s.title ? titles[v] : "";
        const actions = s.actions ? `<div class="mt-3 flex gap-2">${btn("default", "Upgrade plan", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Upgrading…';setTimeout(function(){b.textContent=o;b.disabled=false},2000)"`)}${btn("ghost", "Dismiss", "sm", ` onclick="this.closest('[data-alert]').style.display='none'"`)}</div>` : "";
        const titleEl = title ? `<div class="mb-1 text-sm font-semibold ${alertTone[v].title}">${title}</div>` : "";
        return `<div data-alert class="max-w-[560px] rounded-lg border px-4 py-3 ${alertTone[v].box}">${titleEl}<div class="text-sm text-muted-foreground">${descs[v]}</div>${actions}</div>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: alertBox("destructive", "Saved", "Your changes have been saved successfully."),
        caption: "Using the error variant for non-errors cries wolf; users learn to ignore red.",
      },
      do: {
        html: alertBox("success", "Saved", "Your changes have been saved successfully."),
        caption: "Match the variant to the severity: success for confirmations, destructive for failures.",
      },
    }],
  },

  {
    slug: "card",
    name: "Cards",
    description: "Three families. <code>StatCard</code> = a single metric, big number + delta. <code>SectionCard</code> = a labeled content surface with optional header and divider. Generic <code>card</code> = bring your own structure.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "type", label: "Type", options: ["stat", "section", "generic"], cols: 3 },
        { type: "pills", key: "tone", label: "Icon tone", options: ["blue", "success", "purple", "destructive", "amber"], cols: 3, disabledWhen: (s) => s.type !== "stat" },
        { type: "check", key: "icon", label: "Icon", disabledWhen: (s) => s.type !== "stat" },
        { type: "text", key: "label", label: "Label", disabledWhen: (s) => s.type !== "stat" },
        { type: "text", key: "value", label: "Value", disabledWhen: (s) => s.type !== "stat" },
        { type: "check", key: "header", label: "Header + action", disabledWhen: (s) => s.type !== "section" },
      ],
      defaults: { type: "stat", tone: "blue", icon: true, label: "Active identities", value: "12,348", header: true },
      render: (s) => {
        if (s.type === "generic") {
          return `<div class="${cardCls} max-w-[360px] p-6"><div class="mb-1 text-[15px] font-semibold">Anything goes here</div><p class="text-sm text-muted-foreground">The card surface gives you the border, radius, and shadow. You bring the content.</p></div>`;
        }
        if (s.type === "section") {
          const header = s.header ? `<div class="flex items-center justify-between px-5 pb-4 pt-5"><h3 class="${typeScale.h4}">Recent activity</h3>${btn("ghost", "View all", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Loading…';setTimeout(function(){b.textContent=o;b.disabled=false},2000)"`)}</div><div class="h-px bg-border"></div>` : "";
          return `<div class="${cardCls} max-w-[360px]">${header}<div class="p-5"><p class="text-sm">A labeled content surface. Drop fields, a list, or any module of content here.</p></div></div>`;
        }
        const tone = s.tone as string;
        const letters: Record<string, string> = { blue: "U", success: "S", purple: "O", destructive: "!", amber: "T" };
        const ico = s.icon ? `<div class="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${statTone[tone]}">${letters[tone]}</div>` : "";
        return `<div class="${cardCls} max-w-[280px] p-5"><div class="flex items-start justify-between"><div><div class="text-xs font-medium uppercase tracking-wide text-muted-foreground">${s.label}</div><div class="mt-1 text-2xl font-bold">${s.value}</div><div class="mt-0.5 text-[11px] text-muted-foreground">+142 today</div></div>${ico}</div></div>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<div class="${cardCls} max-w-[360px]">
  <div class="flex items-center justify-between px-5 pb-4 pt-5"><h3 class="${typeScale.h4}">Recent activity</h3></div>
  <div class="px-5 pb-5"><p class="text-sm">Two events today.</p></div>
</div>`,
        caption: "Without the divider the header floats and stops reading as a header.",
      },
      do: {
        html: `<div class="${cardCls} max-w-[360px]">
  <div class="flex items-center justify-between px-5 pb-4 pt-5"><h3 class="${typeScale.h4}">Recent activity</h3></div>
  <div class="h-px bg-border"></div>
  <div class="p-5"><p class="text-sm">Two events today.</p></div>
</div>`,
        caption: "Keep the divider between header and body; it anchors the title.",
      },
    }],
  },

  {
    slug: "code-block",
    name: "Code Block",
    description: "Preformatted code block with monospace font and padding.",
    category: "Molecules",
    sections: [{
      title: "Default",
      examples: [{
        html: `<pre class="${codeblockCls}">const theme = getTheme();
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
          html: emptyCard("No results found", "Try adjusting your search filters."),
        }],
      },
      {
        title: "Inside a table",
        description: "When a query has no results, the empty state spans all columns.",
        examples: [{
          full: true,
          html: `<div class="${tableWrap}">
  <table class="${tableCls}">
    <thead><tr>${["Name", "Email", "Role", "Status"].map((h) => `<th class="${thCls}">${h}</th>`).join("")}</tr></thead>
    <tbody>
      <tr><td colspan="4" class="px-4 py-10">
        ${emptyCard("No results", "Try adjusting your search or filter criteria.")}
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
          html: emptyCard("No identities yet", "Create your first identity to get started.", `<div class="mt-4">${btn("default", "Create identity", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Creating…';setTimeout(function(){b.textContent='Created!';setTimeout(function(){b.textContent=o;b.disabled=false},1200)},800)"`)}</div>`),
        }],
      },
      {
        title: "Success-flavored ('all clear')",
        description: "When emptiness is good: no lockouts, no errors, no pending work.",
        examples: [{
          html: `<div class="${emptyCardCls}">
  <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
  </div>
  <div class="text-[15px] font-semibold">All clear</div>
  <p class="mt-1 text-sm text-muted-foreground">No locked accounts or pending reviews.</p>
</div>`,
        }],
      },
      {
        title: "Variants by icon",
        columns: 3,
        examples: [
          { label: "Users", html: emptyCard("No users", "Invite your first team member.") },
          { label: "Search", html: emptyCard("No results", "Try a different query.") },
          { label: "Files", html: emptyCard("No files", "Upload or drag files here.") },
          { label: "Activity", html: emptyCard("No activity", "Events will appear as they happen.") },
          { label: "Notifications", html: emptyCard("All caught up", "No new notifications.") },
          { label: "Errors", html: emptyCard("No errors", "Everything is running smoothly.") },
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
          html: `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl("User ID", `<span class="font-mono">usr_abc123</span>`)}
  ${fieldRowEl("Name", "Rachel Chen")}
  ${fieldRowEl("Role", "Admin")}
  ${fieldRowEl("Status", statusBadge("success", "Active"))}
</div>`,
        }],
      },
      {
        title: "Mono values",
        description: "Pass mono to use the JetBrains font for IDs, hashes, timestamps: anything copy-able.",
        examples: [{
          full: true,
          html: `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl("Client ID", `<span class="font-mono">clt_8f2a9b4c7e1d</span>`)}
  ${fieldRowEl("Created", `<span class="font-mono">2026-05-24T14:32:00Z</span>`)}
  ${fieldRowEl("Fingerprint", `<span class="font-mono">sha256:xK9v...</span>`)}
</div>`,
        }],
      },
      {
        title: "Composed values",
        description: "value can be any React node: a badge, a button, a small layout.",
        examples: [{
          full: true,
          html: `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl("Status", statusBadge("success", "Active"))}
  ${fieldRowEl("Plan", badge("secondary", "Pro"))}
  ${fieldRowEl("Token", `<span class="flex items-center gap-2"><span class="font-mono">sk_live_a8f2...c9e1</span><button class="${btnBase} ${btnVariant.ghost} h-6 px-2 text-[11px]" onclick="var b=this;navigator.clipboard.writeText('sk_live_a8f2c9e1');var o=b.textContent;b.textContent='Copied!';setTimeout(function(){b.textContent=o},1500)">Copy</button></span>`)}
  ${fieldRowEl("Members", `<span class="flex gap-1"><span class="${avatarBase} h-6 w-6"><img src="/rachel-chen.jpg" alt="RC" class="h-full w-full object-cover"></span><span class="${avatarBase} h-6 w-6 text-[10px]">AJ</span><span class="${avatarBase} h-6 w-6 text-[10px]">+3</span></span>`)}
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
          html: `<div data-form class="max-w-[360px]">
  <div class="mb-4"><label class="${labelCls}">Email</label><input class="${inputBase}" type="email" placeholder="you@example.com" /></div>
  <div class="mb-4"><label class="${labelCls}">Password</label><input class="${inputBase}" type="password" /></div>
  <div class="mt-4"><button class="${btnBase} ${btnVariant.default} ${btnSize.default} w-full" onclick="var form=this.closest('[data-form]');var email=form.querySelector('input[type=email]');var err=form.querySelector('[data-error]');if(err)err.remove();if(!email.value){email.classList.add('ring-2','ring-destructive');var e=document.createElement('div');e.dataset.error='';e.className='mt-1 text-xs text-destructive';e.textContent='Email is required';email.parentElement.appendChild(e);setTimeout(function(){email.classList.remove('ring-2','ring-destructive');if(e.parentElement)e.remove()},2500);return}var b=this;b.disabled=true;b.textContent='Signing in…';setTimeout(function(){b.textContent='Sign in';b.disabled=false},2000)">Sign in</button></div>
</div>`,
          code: `<div class="max-w-[360px]">
  <div class="mb-4"><label class="${labelCls}">Email</label><input class="${inputBase}" type="email" placeholder="you@example.com" /></div>
  <div class="mb-4"><label class="${labelCls}">Password</label><input class="${inputBase}" type="password" /></div>
  <div class="mt-4"><button class="${btnBase} ${btnVariant.default} ${btnSize.default} w-full">Sign in</button></div>
</div>`,
        }],
      },
      {
        title: "Two-column",
        anatomy: "Use when adjacent fields are related (first/last name, city/state). Stacks to one column below sm.",
        examples: [{
          full: true,
          html: `<div data-form class="max-w-[560px]">
  <div class="grid grid-cols-2 gap-3">
    <div class="mb-4"><label class="${labelCls}">First name</label><input class="${inputBase}" placeholder="Ada" /></div>
    <div class="mb-4"><label class="${labelCls}">Last name</label><input class="${inputBase}" placeholder="King" /></div>
  </div>
  <div class="mb-4"><label class="${labelCls}">Email</label><input class="${inputBase}" placeholder="ada@example.com" /></div>
  <div class="mt-4 flex justify-end gap-2">${btn("outline", "Cancel", "sm", ` onclick="var c=this.closest('[data-form]');c.style.opacity='0.5';setTimeout(function(){c.style.opacity='1'},800)"`)}${btn("default", "Create", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Creating…';setTimeout(function(){b.textContent='Created!';setTimeout(function(){b.textContent=o;b.disabled=false},1200)},800)"`)}</div>
</div>`,
        }],
      },
      {
        title: "With sidebar description",
        anatomy: "Section headline + helper text on the left; the form fields on the right. Best for settings or long forms with multiple sections.",
        examples: [{
          full: true,
          html: `<div class="max-w-[720px]">
  <div class="grid grid-cols-[200px_1fr] gap-8 border-b border-border pb-6">
    <div>
      <div class="text-sm font-semibold">Personal info</div>
      <p class="mt-1 text-xs text-muted-foreground">This information will be displayed on your public profile.</p>
    </div>
    <div class="flex flex-col gap-3">
      <div><label class="${labelCls}">Full name</label><input class="${inputBase}" value="Rachel Chen" /></div>
      <div><label class="${labelCls}">Email</label><input class="${inputBase}" value="rachel@example.com" /></div>
    </div>
  </div>
  <div class="grid grid-cols-[200px_1fr] gap-8 pt-6">
    <div>
      <div class="text-sm font-semibold">Notifications</div>
      <p class="mt-1 text-xs text-muted-foreground">Choose how you'd like to be notified.</p>
    </div>
    <div class="flex flex-col gap-3">
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary" checked /> Email notifications</label>
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary" /> SMS alerts</label>
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
    playground: {
      controls: [
        { type: "pills", key: "mode", label: "Mode", options: ["single", "combo", "in a sentence"], cols: 3 },
        { type: "text", key: "keys", label: "Keys (space-separated)" },
      ],
      defaults: { mode: "combo", keys: "⌘ K" },
      render: (s) => {
        const keys = ((s.keys as string) || "⌘ K").trim().split(/\s+/);
        const kbds = keys.map(kbdEl);
        if (s.mode === "single") return kbds[0];
        if (s.mode === "in a sentence") return `<p class="text-sm">Press ${kbds.join("")} to search.</p>`;
        return kbds.join(" + ");
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<p class="text-sm">Press Ctrl+K to search.</p>`,
        caption: "Plain-text shortcuts blend into the prose and are easy to miss.",
      },
      do: {
        html: `<p class="text-sm">Press ${kbdEl("Ctrl")}${kbdEl("K")} to search.</p>`,
        caption: "Wrap each key in a kbd so shortcuts read as physical keys.",
      },
    }],
  },

  {
    slug: "typography",
    name: "Typography",
    description: "Type scale classes for headings, body text, and helper styles.",
    category: "Atoms",
    playground: {
      controls: [
        { type: "pills", key: "style", label: "Style", options: ["display", "h1", "h2", "h3", "h4", "h5", "body", "small", "tiny", "muted", "caption", "code", "mono"], cols: 4 },
        { type: "text", key: "content", label: "Content" },
      ],
      defaults: { style: "h1", content: "The quick brown fox" },
      render: (s) => {
        const tags: Record<string, string> = { display: "h1", h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", code: "span" };
        const tag = tags[s.style as string] || "p";
        return `<${tag} class="${typeScale[s.style as string] || "text-sm"}">${s.content}</${tag}>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<p class="${typeScale.h3} max-w-[340px]">Canvas is a CSS-first design system for building consistent product interfaces across the Olympus platform.</p>`,
        caption: "Body copy set in a heading style is hard to read in bulk and flattens the hierarchy.",
      },
      do: {
        html: `<div class="max-w-[340px]"><h3 class="${typeScale.h3}">About Canvas</h3><p class="${typeScale.body} mt-1">Canvas is a CSS-first design system for building consistent product interfaces across the Olympus platform.</p></div>`,
        caption: "Reserve heading styles for titles; set running text in a small body utility.",
      },
    }],
  },

  {
    slug: "spinner",
    name: "Spinner",
    description: "Animated loading spinner in three sizes.",
    category: "Atoms",
    playground: {
      controls: [
        { type: "pills", key: "size", label: "Size", options: ["sm", "default", "lg"], cols: 3 },
      ],
      defaults: { size: "default" },
      render: (s) => {
        const size = s.size === "sm" ? "h-4 w-4" : s.size === "lg" ? "h-8 w-8" : "h-5 w-5";
        return spinnerEl(size);
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: spinnerEl(),
        caption: "A bare spinner with no label leaves users guessing what is happening and for how long.",
      },
      do: {
        html: `<div class="flex items-center gap-2">${spinnerEl("h-4 w-4")}<span class="text-sm text-muted-foreground">Loading…</span></div>`,
        caption: "Pair longer waits with a short label so the spinner has context.",
      },
    }],
  },

  {
    slug: "popover",
    name: "Popover",
    description: "Floating panel for rich content triggered by a click.",
    category: "Atoms",
    playground: {
      controls: [
        { type: "check", key: "trigger", label: "Trigger button (click to open)" },
        { type: "text", key: "content", label: "Content" },
      ],
      defaults: { trigger: true, content: "Place your rich content, form fields, or secondary actions here." },
      render: (s) => {
        const content = s.content as string;
        if (s.trigger) {
          return `<div class="relative inline-block" onclick="event.stopPropagation()">${btn("outline", "Open popover", "sm", ` onclick="var p=this.nextElementSibling;if(p.classList.contains('hidden')){p.classList.remove('hidden');var close=function(e){if(!p.contains(e.target)){p.classList.add('hidden');document.removeEventListener('click',close)}};setTimeout(function(){document.addEventListener('click',close)},0)}else{p.classList.add('hidden')}"`)}<div data-pop class="${popoverCls} absolute left-0 top-full z-10 mt-2 hidden min-w-[260px]"><p class="mb-2 text-sm">${content}</p>${btn("outline", "Close", "sm", ` onclick="this.closest('[data-pop]').classList.add('hidden')"`)}</div></div>`;
        }
        return `<div class="${popoverCls} relative inline-block min-w-[260px]"><p class="mb-2 text-sm">${content}</p>${btn("outline", "Action", "sm")}</div>`;
      },
    },
    sections: [],
    donts: [{
      dont: {
        html: `<div class="${popoverCls} relative inline-block min-w-[260px]">
  <label class="${labelCls}">Name</label><input class="${inputBase} mb-2">
  <label class="${labelCls}">Email</label><input class="${inputBase} mb-2">
  <label class="${labelCls}">Role</label><select class="${inputBase} mb-2"><option>Engineer</option></select>
  <label class="${labelCls}">Team</label><input class="${inputBase} mb-2">
  <div class="flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("default", "Save", "sm")}</div>
</div>`,
        caption: "A full form belongs in a dialog; in a floating popover it is cramped and easy to dismiss by accident.",
      },
      do: {
        html: `<div class="${popoverCls} relative inline-block min-w-[240px]">
  <p class="mb-2 text-sm">Rename this project?</p>
  <input class="${inputBase} mb-2" value="Identity Platform">
  <div class="flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("default", "Rename", "sm")}</div>
</div>`,
        caption: "Keep popovers compact: a focused prompt with one input and a clear action.",
      },
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
