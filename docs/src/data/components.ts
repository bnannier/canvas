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

// The Canvas brand mark (flat-fill rainbow "C") for example app logos in the
// nav demos. viewBox 0 0 48 48, transparent counter so it sits on any bar.
// Flat fills (no gradient ids) stay crisp and collision-free at small sizes.
const canvasLogo = (px: number) =>
  `<svg width="${px}" height="${px}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Canvas"><path d="M31.293 28.557 L41.385 34.863 A20.5 20.5 0 0 1 28.959 43.891 L26.081 32.345 A8.6 8.6 0 0 0 31.293 28.557 Z" fill="#a83ff0"/><path d="M26.081 32.345 L28.959 43.891 A20.5 20.5 0 0 1 14.376 42.1 L19.963 31.593 A8.6 8.6 0 0 0 26.081 32.345 Z" fill="#ff2d6e"/><path d="M19.963 31.593 L14.376 42.1 A20.5 20.5 0 0 1 4.736 31.011 L15.919 26.941 A8.6 8.6 0 0 0 19.963 31.593 Z" fill="#ff5a44"/><path d="M15.919 26.941 L4.736 31.011 A20.5 20.5 0 0 1 6.246 13.75 L16.552 19.7 A8.6 8.6 0 0 0 15.919 26.941 Z" fill="#ffa72e"/><path d="M16.552 19.7 L6.246 13.75 A20.5 20.5 0 0 1 24 3.5 L24 15.4 A8.6 8.6 0 0 0 16.552 19.7 Z" fill="#25bdf0"/><path d="M24 15.4 L24 3.5 A20.5 20.5 0 0 1 41.385 13.137 L31.293 19.443 A8.6 8.6 0 0 0 24 15.4 Z" fill="#2fd673"/></svg>`;

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
// Combobox: a searchable single-select. An input with a chevron and a popover
// list that opens on focus, closes on blur or selection, filters as you type
// (with an empty state), and shows a check on the selected option. Same popover
// idiom as the listbox (lbPanel/lbOption/lbCheck), plus text filtering.
const cbChevron =
  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>`;
const cbList =
  "absolute left-0 top-full z-20 mt-1 hidden max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md";
const cbOption =
  "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground";
const cbItemEl = (name: string, selected = false, avatar = "") =>
  `<button type="button" data-cb-item class="${cbOption}">${avatar ? `<span class="${avatarBase} h-6 w-6 shrink-0 text-[10px]">${avatar}</span>` : ""}<span data-cb-label class="flex-1 truncate">${name}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-cb-check class="ml-auto shrink-0${selected ? "" : " invisible"}"><polyline points="20 6 9 17 4 12"/></svg></button>`;
const cbEmpty =
  `<div data-cb-empty class="hidden px-2 py-1.5 text-sm text-muted-foreground">No matches.</div>`;
const cbFilter =
  ` onfocus="this.parentElement.querySelector('[data-cb-list]').classList.remove('hidden')"` +
  ` onblur="var el=this;setTimeout(function(){el.parentElement.querySelector('[data-cb-list]').classList.add('hidden')},160)"` +
  ` oninput="var l=this.parentElement.querySelector('[data-cb-list]');l.classList.remove('hidden');var v=this.value.toLowerCase(),any=false;l.querySelectorAll('[data-cb-item]').forEach(function(i){var m=i.querySelector('[data-cb-label]').textContent.toLowerCase().includes(v);i.style.display=m?'':'none';if(m)any=true});l.querySelector('[data-cb-empty]').classList.toggle('hidden',any)"`;
const cbSelect =
  ` onclick="var t=event.target.closest('[data-cb-item]');if(!t)return;this.querySelectorAll('[data-cb-check]').forEach(function(c){c.classList.add('invisible')});var c=t.querySelector('[data-cb-check]');if(c)c.classList.remove('invisible');this.parentElement.querySelector('input').value=t.querySelector('[data-cb-label]').textContent.trim();this.querySelectorAll('[data-cb-item]').forEach(function(i){i.style.display=''});this.querySelector('[data-cb-empty]').classList.add('hidden');this.classList.add('hidden')"`;
const cbField = (
  opts: string,
  o: { value?: string; placeholder?: string; disabled?: boolean; filter?: boolean; select?: string } = {},
) =>
  `<div class="relative"><input class="${inputBase} pr-9"${o.value ? ` value="${o.value}"` : ""}${o.placeholder ? ` placeholder="${o.placeholder}"` : ""}${o.disabled ? " disabled" : ""}${o.filter === false ? "" : cbFilter}><span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">${cbChevron}</span><div data-cb-list class="${cbList}"${o.select ?? cbSelect}>${opts}${cbEmpty}</div></div>`;
const cbPeople: [string, string][] = [
  ["Ada Lovelace", "ada-lovelace.jpg"],
  ["Grace Hopper", "grace-hopper.jpg"],
  ["Kira Tanaka", "kira-tanaka.jpg"],
  ["Liang Bao", "liang-bao.jpg"],
  ["Marcus Allen", "marcus-allen.jpg"],
  ["Noor Park", "noor-park.jpg"],
  ["Rachel Chen", "rachel-chen.jpg"],
];

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
// Catalyst-style alert dialog: a centered modal over a dimmed, blurred backdrop.
const alertSize: Record<string, string> = { xs: "max-w-xs", sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };
const overlayCls = "fixed inset-0 z-50 hidden items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center";
const alertPanel = "w-full rounded-xl border border-border bg-popover p-6 text-popover-foreground shadow-xl";
const alertTrigger = ` onclick="var o=this.nextElementSibling;o.classList.remove('hidden');o.classList.add('flex')"`;
const alertClose = ` onclick="var o=this.closest('[data-alert-overlay]');o.classList.add('hidden');o.classList.remove('flex')"`;
// Dialog: the general modal. Same overlay machinery as the alert dialog
// (overlayCls + alertTrigger/alertClose), with a roomier panel and a wider
// size scale for task content like a form.
const dialogPanel = "w-full rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-xl sm:p-7";
const dialogSize: Record<string, string> = { xs: "max-w-xs", sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl": "max-w-2xl" };
// Fieldset: a labeled group of fields (legend + field group + per-field label/help/error).
const fieldsetLegend = "text-base font-semibold text-foreground";
const fsField = (label: string, control: string, help = "", error = "") =>
  `<div><label class="${labelCls}">${label}</label>${control}${error ? `<p class="mt-1 text-xs text-destructive">${error}</p>` : help ? `<p class="${helperCls}">${help}</p>` : ""}</div>`;
// Listbox: a custom (non-native) select with single/multi selection.
const lbTriggerCls = "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
const lbPanel = "absolute left-0 top-full z-10 mt-1 hidden max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md";
const lbOption = "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground";
const lbCheck = (selected: boolean) =>
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-check class="ml-auto shrink-0${selected ? "" : " invisible"}"><polyline points="20 6 9 17 4 12"/></svg>`;
const statTone: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600",
  success: "bg-green-500/10 text-green-600",
  purple: "bg-purple-500/10 text-purple-600",
  destructive: "bg-destructive/10 text-destructive",
  amber: "bg-amber-500/10 text-amber-600",
};
const codeblockCls =
  "block w-full overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-left font-mono text-[13px] leading-relaxed";
const tableWrap = "overflow-x-auto rounded-lg border border-border";
const tableCls = "w-full text-sm";
const thCls = "border-b border-border px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground";
const tdCls = "border-b border-border px-4 py-2.5";
const emptyCardCls = "rounded-lg border border-dashed border-border px-6 py-8 text-center";
const emptyCard = (title: string, desc: string, extra = "") =>
  `<div class="${emptyCardCls}"><div class="text-[15px] font-semibold">${title}</div><p class="mt-1 text-sm text-muted-foreground">${desc}</p>${extra}</div>`;
const fieldRowEl = (label: string, value: string) =>
  `<div class="grid grid-cols-[180px_1fr] gap-4 text-sm"><span class="text-muted-foreground">${label}</span><span>${value}</span></div>`;
const statCard = (label: string, value: string, delta = "", deltaTone = "text-emerald-600", extra = "") =>
  `<div class="${cardCls} p-5${extra ? " " + extra : ""}"><div class="text-xs text-muted-foreground">${label}</div><div class="mt-1 text-2xl font-semibold tracking-tight">${value}</div>${delta ? `<div class="mt-1 text-xs font-medium ${deltaTone}">${delta}</div>` : ""}</div>`;
const filterChipCls =
  "inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground";
const filterGroupLabel = "text-xs font-medium uppercase tracking-wide text-muted-foreground";
const fbtnOutline = `${btnBase} ${btnVariant.outline} ${btnSize.sm}`;
const fbtnActive = `${btnBase} ${btnVariant.default} ${btnSize.sm}`;

const calCellBase = "flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent";
const calCellOut = "text-muted-foreground/40";
const calToday = "bg-accent font-medium text-accent-foreground";
const calSelected = "bg-primary text-primary-foreground hover:bg-primary";
const calHead = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
  .map((h) => `<span class="flex h-8 w-9 items-center justify-center text-xs font-medium text-muted-foreground">${h}</span>`)
  .join("");
const calCells = ([27, 28, 29, 30] as number[])
  .map((d) => ({ d, v: "out" }))
  .concat(Array.from({ length: 31 }, (_, i) => ({ d: i + 1, v: i + 1 === 23 ? "today" : i + 1 === 24 ? "selected" : "" })))
  .map((c) => {
    const cls = calCellBase + (c.v === "out" ? " " + calCellOut : c.v === "today" ? " " + calToday : c.v === "selected" ? " " + calSelected : "");
    return `<button data-cell="${c.v === "out" ? "out" : c.v === "today" ? "today" : ""}" class="${cls}">${c.d}</button>`;
  })
  .join("");
const calendarBlock = (gridOnclick: string) =>
  `<div class="w-fit rounded-lg border border-border p-3"><div class="mb-2 flex items-center justify-between"><button class="${btnBase} ${btnVariant.ghost} h-7 w-7 p-0">&lt;</button><span class="text-sm font-medium">May 2026</span><button class="${btnBase} ${btnVariant.ghost} h-7 w-7 p-0">&gt;</button></div><div class="grid grid-cols-7 gap-0.5"${gridOnclick}>${calHead}${calCells}</div></div>`;

const cmdDialog = "rounded-lg border border-border bg-popover shadow-lg";
const cmdInput = "w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground";
const cmdList = "max-h-80 overflow-auto p-2";
const cmdGroupLabel = "px-2 py-1.5 text-xs font-medium text-muted-foreground";
const cmdItem = "command-item flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent";
const cmdSep = "command-sep my-1 h-px bg-border";
const cmdItemEl = (label: string, shortcut = "", selected = false) =>
  `<div class="${cmdItem}${selected ? " bg-accent text-accent-foreground" : ""}">${label}${shortcut ? `<span class="text-xs text-muted-foreground">${shortcut}</span>` : ""}</div>`;

const dtWrap = "dt-wrap overflow-hidden rounded-lg border border-border";
const dtToolbar = "dt-toolbar flex items-center gap-2 border-b border-border p-3";
const dtTable = "w-full text-sm";
const dtTh = "border-b border-border bg-muted/40 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground";
const dtThSort = dtTh + " cursor-pointer select-none hover:text-foreground";
const dtTd = "border-b border-border px-4 py-2.5";
const dtFooter = "dt-footer flex items-center justify-between border-t border-border px-4 py-2.5 text-sm text-muted-foreground";
const dtRow = "clickable cursor-pointer hover:bg-accent/50";

const sidebarItem = "sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent";
const sidebarGroupLabel = "px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground";
const tabUnderline = "border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
const tabUnderlineActive = "border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground";
const tabU = `tab ${tabUnderline}`;
const tabUActive = `tab ${tabUnderlineActive}`;
const tabsPillList = "inline-flex gap-1 rounded-lg bg-muted p-1";
const tabPill = "tab rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
const tabPillActive = "tab rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm";
const tabV = "tab w-full rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
const tabVActive = "tab w-full rounded-md bg-accent px-3 py-2 text-left text-sm font-medium text-accent-foreground";
const navlink = "navlink rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
const navlinkActive = "navlink rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-foreground";
const navlinkM = "navlink block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent";
const navlinkMActive = "navlink block rounded-md bg-accent px-3 py-2 text-sm font-medium text-foreground";
const stepInd = (state: string) =>
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium " +
  (state === "completed" ? "border-primary bg-primary text-primary-foreground" : state === "active" ? "border-primary text-primary" : "border-border text-muted-foreground");
const stepConn = (done: boolean) => "mx-2 mt-4 h-0.5 flex-1 " + (done ? "bg-primary" : "bg-border");

export const COMPONENTS: ComponentDoc[] = [
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
      {
        title: "Default variant",
        dont: {
          html: `<div class="flex flex-wrap items-center gap-1.5">${badge("default", "employee")}${badge("default", "engineering")}${badge("default", "remote")}${badge("default", "admin")}</div>`,
          caption: "The solid primary fill is the loudest badge; using it for every tag makes the whole row shout and nothing leads.",
        },
        do: {
          html: `<div class="flex flex-wrap items-center gap-1.5">${badge("default", "admin")}${badge("secondary", "engineering")}${badge("secondary", "remote")}</div>`,
          caption: "Reserve the default fill for the single tag you want noticed first; keep the rest secondary.",
        },
      },
      {
        title: "Secondary variant",
        dont: {
          html: `<div class="flex flex-wrap items-center gap-1.5">${badge("secondary", "active")}${badge("secondary", "pending")}${badge("secondary", "failed")}</div>`,
          caption: "A muted gray pill reads as static metadata, so live state shown as a secondary badge looks inert and goes unnoticed.",
        },
        do: {
          html: `<div class="flex flex-wrap items-center gap-1.5">${badge("secondary", "employee")}${badge("secondary", "engineering")}${statusBadge("success", "active")}</div>`,
          caption: "Keep secondary for static metadata (role, team) and switch to the status-badge for anything live.",
        },
      },
      {
        title: "Outline variant",
        dont: {
          html: `<div class="flex flex-wrap items-center gap-1.5 rounded-md bg-primary p-3">${badge("outline", "draft")}${badge("outline", "internal")}</div>`,
          caption: "The thin border is the whole badge; on a colored or busy surface it disappears and the label floats unboxed.",
        },
        do: {
          html: `<div class="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-card p-3">${badge("outline", "draft")}${badge("outline", "internal")}</div>`,
          caption: "Use outline on a plain surface where the quiet border has contrast, for low-priority secondary tags.",
        },
      },
      {
        title: "Destructive variant",
        dont: {
          html: `<div class="flex flex-wrap items-center gap-1.5">${badge("destructive", "marketing")}${badge("destructive", "finance")}${badge("destructive", "legal")}</div>`,
          caption: "Solid red signals error or danger, so using it to color-code neutral categories raises a false alarm.",
        },
        do: {
          html: `<div class="flex flex-wrap items-center gap-1.5">${badge("destructive", "Revoked")}${badge("destructive", "Banned")}${badge("secondary", "marketing")}</div>`,
          caption: "Reserve destructive for genuinely destructive or error semantics like revoked or banned.",
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
      {
        title: "Chevron",
        dont: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}<span class="select-none text-muted-foreground/60"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>${crumbLink("Identity Platform")}<span class="select-none text-muted-foreground/60"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>${crumbCurrent("Settings")}</nav>`,
          caption: "A down (or back) chevron reads as a dropdown or a back affordance, not progression down the hierarchy.",
        },
        do: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}${crumbChevron}${crumbLink("Identity Platform")}${crumbChevron}${crumbCurrent("Settings")}</nav>`,
          caption: "Point the chevron in the reading direction (right in LTR) so each one means 'drill into the next level'.",
        },
      },
      {
        title: "Slash",
        dont: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}<span class="px-1 font-medium text-foreground">/</span>${crumbLink("Identity Platform")}<span class="px-1 font-medium text-foreground">/</span>${crumbCurrent("Settings")}</nav>`,
          caption: "A full-weight, foreground slash competes with the labels and can read as part of a link.",
        },
        do: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}${crumbSep("/")}${crumbLink("Identity Platform")}${crumbSep("/")}${crumbCurrent("Settings")}</nav>`,
          caption: "Keep the slash muted and lighter than the text so it reads as a quiet path divider.",
        },
      },
      {
        title: "Dot",
        dont: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}<span class="select-none text-muted-foreground/60">.</span>${crumbLink("Identity Platform")}<span class="select-none text-muted-foreground/60">.</span>${crumbCurrent("Settings")}</nav>`,
          caption: "A baseline period looks like a typo or end-of-sentence, not a separator between crumbs.",
        },
        do: {
          html: `<nav class="${bcNav}">${crumbLink("Projects")}${crumbSep("·")}${crumbLink("Identity Platform")}${crumbSep("·")}${crumbCurrent("Settings")}</nav>`,
          caption: "Use a centered middot (·) so the dot sits between the crumbs and clearly divides them.",
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
        title: "Unchecked",
        dont: {
          html: `<label class="flex items-start gap-2 text-sm"><input type="checkbox" checked class="mt-0.5 size-4 accent-primary"><span>Email me product news, offers, and survey invitations.</span></label>`,
          caption: "A consent box that starts checked opts users in by default; under GDPR pre-ticked consent is not consent.",
        },
        do: {
          html: `<label class="flex items-start gap-2 text-sm"><input type="checkbox" class="mt-0.5 size-4 accent-primary"><span>Email me product news, offers, and survey invitations.</span></label>`,
          caption: "Leave opt-in consent unchecked so agreeing is a deliberate act the user takes.",
        },
      },
      {
        title: "Checked",
        dont: {
          html: `<div class="flex flex-col gap-2 text-sm"><label class="flex items-center gap-2 font-medium"><input type="checkbox" checked class="size-4 accent-primary"> Select all</label><div class="ml-6 flex flex-col gap-2"><label class="flex items-center gap-2"><input type="checkbox" checked class="size-4 accent-primary"> Read</label><label class="flex items-center gap-2"><input type="checkbox" class="size-4 accent-primary"> Write</label><label class="flex items-center gap-2"><input type="checkbox" class="size-4 accent-primary"> Delete</label></div></div>`,
          caption: "A fully checked parent claims every child is selected when only one is, so the state reads as a lie.",
        },
        do: {
          html: `<div class="flex flex-col gap-2 text-sm"><label class="flex items-center gap-2 font-medium"><span class="mt-0 flex size-4 shrink-0 items-center justify-center rounded-[3px] bg-primary"><span class="block h-0.5 w-2.5 rounded-full bg-primary-foreground"></span></span> Select all</label><div class="ml-6 flex flex-col gap-2"><label class="flex items-center gap-2"><input type="checkbox" checked class="size-4 accent-primary"> Read</label><label class="flex items-center gap-2"><input type="checkbox" class="size-4 accent-primary"> Write</label><label class="flex items-center gap-2"><input type="checkbox" class="size-4 accent-primary"> Delete</label></div></div>`,
          caption: "Show the parent indeterminate (a dash, not a tick) when only some children are checked.",
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
        const label = s.withLabel ? `<label class="${labelCls}">Assigned to</label>` : "";
        const helper = s.withHelper ? `<p class="${helperCls}">The person responsible for this account.</p>` : "";
        const items = cbPeople.map(([n, img]) => cbItemEl(n, false, avatarImg("/" + img, n))).join("");
        return `<div class="max-w-[300px]">${label}${cbField(items, { placeholder: s.placeholder as string, disabled: s.disabled as boolean })}${helper}</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "When to use",
        dont: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Size</label>${cbField(["Small", "Medium", "Large"].map((n) => cbItemEl(n)).join(""), { placeholder: "Search…" })}</div>`,
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
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label>${cbField(["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook", "Tanya Fox", "Hellen Schmidt"].map((n) => cbItemEl(n)).join(""), { placeholder: "Type to filter… (nothing happens)", filter: false })}</div>`,
          caption: "Try typing: a search box that ignores input is just a dropdown wearing a costume.",
        },
        do: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label>${cbField(["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook", "Tanya Fox", "Hellen Schmidt"].map((n) => cbItemEl(n)).join(""), { placeholder: "Type to filter…" })}</div>`,
          caption: "Type a few letters: the list narrows as you go, so a long list stays usable.",
        },
      },
      {
        title: "Selection",
        dont: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label>${cbField(["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook"].map((n) => cbItemEl(n)).join(""), { placeholder: "Pick a person…", select: ` onclick="var t=event.target.closest('[data-cb-item]');if(!t)return;t.classList.add('bg-accent');setTimeout(function(){t.classList.remove('bg-accent')},250)"` })}</div>`,
          caption: "Click an option: it flashes but the field stays empty, so you can't tell what you picked.",
        },
        do: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label>${cbField(`${cbItemEl("Wade Cooper")}${cbItemEl("Arlene Mccoy")}${cbItemEl("Devon Webb", true)}${cbItemEl("Tom Cook")}`, { value: "Devon Webb" })}</div>`,
          caption: "Click an option: it fills the input and stays marked as selected.",
        },
      },
      {
        title: "With label",
        dont: {
          html: `<div class="max-w-[280px]">${cbField(`${cbItemEl("Wade Cooper")}${cbItemEl("Arlene Mccoy")}${cbItemEl("Devon Webb", true)}`, { value: "Devon Webb" })}</div>`,
          caption: "Once a value replaces the placeholder, an unlabeled field has nothing left to name it.",
        },
        do: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label>${cbField(`${cbItemEl("Wade Cooper")}${cbItemEl("Arlene Mccoy")}${cbItemEl("Devon Webb", true)}`, { value: "Devon Webb" })}</div>`,
          caption: "A persistent label keeps the field named after a selection has filled the input.",
        },
      },
      {
        title: "With helper text",
        dont: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label>${cbField(["Wade Cooper", "Arlene Mccoy", "Devon Webb"].map((n) => cbItemEl(n)).join(""), { placeholder: "Pick an active teammate; deactivated users are hidden" })}</div>`,
          caption: "Type a letter: guidance crammed into the placeholder vanishes the moment you start.",
        },
        do: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label>${cbField(["Wade Cooper", "Arlene Mccoy", "Devon Webb"].map((n) => cbItemEl(n)).join(""), { placeholder: "Search a person…" })}<p class="${helperCls}">Deactivated users are hidden from the list.</p></div>`,
          caption: "A short placeholder plus persistent helper text keeps the rule visible while you type.",
        },
      },
      {
        title: "Disabled",
        dont: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label>${cbField(["Wade Cooper", "Arlene Mccoy", "Devon Webb"].map((n) => cbItemEl(n)).join(""), { placeholder: "Search a person…", disabled: true })}</div>`,
          caption: "An empty, dimmed field with no value reads as broken, not as intentionally locked.",
        },
        do: {
          html: `<div class="max-w-[280px]"><label class="${labelCls}">Assigned to</label>${cbField(`${cbItemEl("Wade Cooper")}${cbItemEl("Arlene Mccoy")}${cbItemEl("Devon Webb", true)}`, { value: "Devon Webb", disabled: true })}<p class="${helperCls}">Set by the project owner and can't be changed here.</p></div>`,
          caption: "Show the locked value and say why it's fixed, so disabled reads as a settled choice.",
        },
      },
    ],
  },

  {
    slug: "divider",
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
          return `<div class="flex h-8 items-center gap-3 text-sm"><span class="text-foreground">Docs</span><div class="h-4 w-px bg-border"></div><span class="text-muted-foreground">API</span><div class="h-4 w-px bg-border"></div><span class="text-muted-foreground">Support</span></div>`;
        }
        if (s.variant === "label") {
          return `<div class="w-80 space-y-3"><button class="${btnBase} ${btnVariant.default} ${btnSize.default} w-full">Sign in</button>${sepLabel(s.label as string)}<button class="${btnBase} ${btnVariant.outline} ${btnSize.default} w-full">Continue with Google</button></div>`;
        }
        if (s.variant === "action") {
          return `<div class="w-80 text-sm"><div class="space-y-2"><div class="rounded-md border border-border px-3 py-2">Ada commented on the draft</div><div class="rounded-md border border-border px-3 py-2">Grace approved the request</div></div><div class="mt-3 flex items-center gap-3"><hr class="flex-1 border-border"><button class="${btnBase} ${btnVariant.ghost} ${btnSize.sm}" onclick="this.textContent=this.textContent==='Show more'?'Show less':'Show more'">Show more</button><hr class="flex-1 border-border"></div></div>`;
        }
        return `<div class="w-80"><div class="text-sm font-medium">Billing</div><p class="text-sm text-muted-foreground">Manage your plan and payment method.</p><hr class="my-4 border-border"><div class="text-sm font-medium">Notifications</div><p class="text-sm text-muted-foreground">Choose what updates you receive.</p></div>`;
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
        title: "Leading icons",
        dont: {
          html: `<div class="${menuBase}"${menuFlash}>${menuItemEl(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg><span>Edit</span>`)}${menuItemEl(`<span class="pl-[22px]">Duplicate</span>`)}${menuItemEl(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="3"/></svg><span>Settings</span>`)}</div>`,
          caption: "Click an item: icons on some rows but not others leave labels misaligned and the column ragged.",
        },
        do: {
          html: `<div class="${menuBase}"${menuFlash}>${menuItemEl(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg><span>Edit</span>`)}${menuItemEl(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Duplicate</span>`)}${menuItemEl(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="3"/></svg><span>Settings</span>`)}</div>`,
          caption: "Click an item: give every row a leading icon so labels share one start column.",
        },
      },
      {
        title: "Keyboard shortcuts",
        dont: {
          html: `<div class="${menuBase}"${menuFlash}>${menuItemEl(`<span>Edit profile ⌘E</span>`)}${menuItemEl(`<span>Duplicate ⌘D</span>`)}${menuItemEl(`<span>Settings ⌘,</span>`)}</div>`,
          caption: "Click an item: hints inline after the label crowd the text and never line up into a readable column.",
        },
        do: {
          html: `<div class="${menuBase}"${menuFlash}>${menuItemEl(`<span>Edit profile</span>${shortcut("⌘E")}`)}${menuItemEl(`<span>Duplicate</span>${shortcut("⌘D")}`)}${menuItemEl(`<span>Settings</span>${shortcut("⌘,")}`)}</div>`,
          caption: "Click an item: push shortcuts to a muted, right-aligned column so the eye can scan them.",
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
        { type: "pills", key: "view", label: "View", options: ["single", "set"], cols: 2 },
        { type: "range", key: "size", label: "Size", min: 12, max: 64, step: 2, suffix: "px", disabledWhen: (s) => s.view !== "single" },
        { type: "pills", key: "color", label: "Color", options: ["foreground", "primary", "destructive", "muted"], cols: 4, disabledWhen: (s) => s.view !== "single" },
      ],
      defaults: { view: "single", size: 24, color: "foreground" },
      render: (s) => {
        if (s.view === "set") {
          return `<div class="grid w-full grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-0.5 text-[10px]">
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
</div>`;
        }
        const sz = s.size as number;
        const colorCls: Record<string, string> = { foreground: "text-foreground", primary: "text-primary", destructive: "text-destructive", muted: "text-muted-foreground" };
        return `<span class="${colorCls[s.color as string]}"><svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>`;
      },
    },
    sections: [
      {
        title: "Full set",
        description: "90+ icons currently in the set. All Lucide-style outline with 1.75 stroke weight. Switch the playground View to \"set\" to browse them by name.",
        examples: [],
      },
    ],
    donts: [
      {
        title: "Stroke coherence",
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
      },
      {
        title: "foreground",
        dont: {
          html: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
          caption: "Hard-coding a hex stroke pins the icon to one theme; it stays black on a dark surface and disappears.",
        },
        do: {
          html: `<span class="text-foreground"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>`,
          caption: "Leave stroke as currentColor and set text-foreground on the parent so it follows light and dark.",
        },
      },
      {
        title: "primary",
        dont: {
          html: `<div class="flex items-center gap-5 text-primary">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
</div>`,
          caption: "Painting a whole toolbar primary spends the accent on everything, so nothing reads as emphasized.",
        },
        do: {
          html: `<div class="flex items-center gap-5">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
</div>`,
          caption: "Reserve text-primary for the one active or selected icon; keep the rest muted.",
        },
      },
      {
        title: "destructive",
        dont: {
          html: `<span class="text-destructive"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span>`,
          caption: "A red download icon implies danger on a perfectly safe action and trains users to ignore the warning color.",
        },
        do: {
          html: `<span class="text-destructive"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span>`,
          caption: "Keep text-destructive for genuinely destructive actions like delete, so red always means consequence.",
        },
      },
      {
        title: "muted",
        dont: {
          html: `<button class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><span class="text-muted-foreground"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>New project</button>`,
          caption: "A muted icon inside a solid primary button reads as disabled and clashes with the high-contrast label.",
        },
        do: {
          html: `<span class="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Optional, used only for recovery</span>`,
          caption: "Use text-muted-foreground for secondary, inline hint icons where its color matches the helper text.",
        },
      },
    ]
  },

  {
    slug: "input-group",
    name: "Input Groups",
    description: "Addon props on Input: leading/trailing text, icons, currency, action buttons. (The separate InputGroup is deprecated; pass these as props on Input.)",
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
    donts: [
      {
        title: "lead-text",
        dont: {
          html: `<div class="flex max-w-[320px]"><span class="${inputAddon} rounded-l-md border-r-0">https://</span><input class="${inputBase} rounded-l-none" placeholder="https://example.com"></div>`,
          caption: "The addon already shows the protocol; repeating it in the placeholder is redundant.",
        },
        do: {
          html: `<div class="flex max-w-[320px]"><span class="${inputAddon} rounded-l-md border-r-0">https://</span><input class="${inputBase} rounded-l-none" placeholder="example.com"></div>`,
          caption: "Let the addon carry the fixed part; the input holds only what the user types.",
        },
      },
      {
        title: "trail-text",
        dont: {
          html: `<div class="flex max-w-[320px]"><input class="${inputBase} rounded-r-md" placeholder="ada"><span class="${inputAddon} rounded-md ml-1">@canvas.dev</span></div>`,
          caption: "A gap and matching radii make the suffix read as a separate chip, not part of the field.",
        },
        do: {
          html: `<div class="flex max-w-[320px]"><input class="${inputBase} rounded-r-none" placeholder="ada"><span class="${inputAddon} rounded-r-md border-l-0">@canvas.dev</span></div>`,
          caption: "Square the joined edges and drop the shared border so input and addon read as one control.",
        },
      },
      {
        title: "lead-icon",
        dont: {
          html: `<div class="relative max-w-[320px]"><span class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span><input class="${inputBase}" placeholder="Quick search…"></div>`,
          caption: "Text slides under the icon: no left padding and the icon can swallow the caret/clicks.",
        },
        do: {
          html: `<div class="relative max-w-[320px]"><span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span><input class="${inputBase} pl-9" placeholder="Quick search…"></div>`,
          caption: "Add pl-9 to clear the glyph and pointer-events-none so clicks fall through to the input.",
        },
      },
      {
        title: "trail-icon",
        dont: {
          html: `<div class="relative max-w-[320px]"><input class="${inputBase}" placeholder="you@example.com"><span class="absolute inset-y-0 right-0 flex items-center pr-3"><button class="${btnBase} ${btnVariant.ghost} h-7 w-7 p-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></button></span></div>`,
          caption: "A clickable control floating over the field with no padding overlaps typed text and confuses its role.",
        },
        do: {
          html: `<div class="relative max-w-[320px]"><input class="${inputBase} pr-9" placeholder="you@example.com"><span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span></div>`,
          caption: "Reserve a trailing icon for a passive hint (pr-9, pointer-events-none); use the action variant when it must be clickable.",
        },
      },
      {
        title: "currency",
        dont: {
          html: `<div class="flex max-w-[320px]"><input class="${inputBase} rounded-l-none" type="number" placeholder="0.00"><span class="${inputAddon} rounded-r-md border-l-0">$ USD</span></div>`,
          caption: "Cramming the symbol and code into the trailing addon hides the $ until after the amount is typed.",
        },
        do: {
          html: `<div class="flex max-w-[320px]"><span class="${inputAddon} rounded-l-md border-r-0">$</span><input class="${inputBase} rounded-none" type="number" placeholder="0.00"><span class="${inputAddon} rounded-r-md border-l-0">USD</span></div>`,
          caption: "Lead with the symbol and trail with the code so the value is framed on both sides.",
        },
      },
      {
        title: "action",
        dont: {
          html: `<div class="flex max-w-[320px]"><input class="${inputBase} rounded-r-none font-mono" value="sk_live_••••••••4242"><button class="${btnBase} ${btnVariant.outline} ${btnSize.sm} rounded-l-none border-l-0">Copy</button></div>`,
          caption: "An editable field beside a Copy button invites accidental edits to a value meant only to be copied.",
        },
        do: {
          html: `<div class="flex max-w-[320px]"><input class="${inputBase} rounded-r-none font-mono" value="sk_live_••••••••4242" readonly><button class="${btnBase} ${btnVariant.outline} ${btnSize.sm} rounded-l-none border-l-0">Copy</button></div>`,
          caption: "Mark the input readonly so the attached action operates on a stable, uneditable value.",
        },
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
    donts: [
      {
        title: "text",
        dont: {
          html: `<div class="max-w-[320px]"><input class="${inputBase}" placeholder="Email"></div>`,
          caption: "A placeholder is not a label; it vanishes the moment the user types and screen readers may skip it.",
        },
        do: {
          html: `<div class="max-w-[320px]"><label class="${labelCls}">Email</label><input class="${inputBase}" placeholder="ada@acme.dev"></div>`,
          caption: "Pair every field with a persistent .label above the control.",
        },
      },
      {
        title: "number",
        dont: {
          html: `<div class="max-w-[320px]"><label class="${labelCls}">Storage</label><input class="${inputBase}" value="1024 GB"></div>`,
          caption: "A plain text field lets users type the unit into the value, breaking parsing and validation.",
        },
        do: {
          html: `<div class="max-w-[320px]"><label class="${labelCls}">Storage</label><div class="flex"><input class="${inputBase} rounded-r-none" type="number" inputmode="numeric" value="1024"><span class="${inputAddon} rounded-r-md border-l-0">GB</span></div></div>`,
          caption: "Use type=\"number\" with inputmode and park the unit in a .input-addon so the value stays purely numeric.",
        },
      },
      {
        title: "select",
        dont: {
          html: `<div class="max-w-[320px]"><label class="${labelCls}">Email notifications</label><select class="${inputBase}"><option>On</option><option>Off</option></select></div>`,
          caption: "A select for a single on/off choice buries a one-tap decision behind a dropdown.",
        },
        do: {
          html: `<div class="max-w-[320px]"><label class="${labelCls}">Status</label><select class="${inputBase}"><option>Active</option><option>Inactive</option><option>Pending</option><option>Archived</option></select></div>`,
          caption: "Reserve a select for picking one of several mutually exclusive options; use a switch or radios for two.",
        },
      },
      {
        title: "textarea",
        dont: {
          html: `<div class="max-w-[320px]"><label class="${labelCls}">Notes</label><textarea class="${inputBase} resize-none">Describe the change in enough detail that a teammate could follow it…</textarea></div>`,
          caption: "A one-line, resize-none textarea clips multi-line input so users cannot review what they wrote.",
        },
        do: {
          html: `<div class="max-w-[320px]"><label class="${labelCls}">Notes</label><textarea class="${inputBase.replace("h-9", "min-h-20")} resize-y">Describe the change in enough detail that a teammate could follow it…</textarea></div>`,
          caption: "Give a textarea a min-height for several lines and resize-y so it can grow with the content.",
        },
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
    donts: [
      {
        title: "compact",
        dont: {
          html: `<div class="flex items-center justify-end gap-1 text-sm">${btn("outline", "Previous", "sm")}${btn("outline", "Next", "sm")}</div>`,
          caption: "Bare Previous/Next with no range label leaves the user unable to tell where they are or how much is left.",
        },
        do: {
          html: `<div class="flex items-center justify-between gap-4 text-sm"><span class="text-muted-foreground">Showing 11–20 of 120</span><div class="flex gap-1">${btn("outline", "Previous", "sm")}${btn("outline", "Next", "sm")}</div></div>`,
          caption: "Pair the buttons with a \"Showing X–Y of N\" range so position and total are always visible.",
        },
      },
      {
        title: "numbered",
        dont: {
          html: `<nav class="flex items-center gap-1">${pageBtn("&laquo;", false, " disabled")}${pageBtn("1", true)}${[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => pageBtn(String(n))).join("")}${pageBtn("&raquo;")}</nav>`,
          caption: "Rendering every page number overflows and stops being scannable past a handful.",
        },
        do: {
          html: `<nav class="flex items-center gap-1">${pageBtn("&laquo;", false, " disabled")}${pageBtn("1", true)}${pageBtn("2")}${pageBtn("3")}<span class="px-1 text-muted-foreground">...</span>${pageBtn("12")}${pageBtn("&raquo;")}</nav>`,
          caption: "Truncate the middle with an ellipsis; keep first, last, and a window around the current page.",
        },
      },
      {
        title: "with-size",
        dont: {
          html: `<div class="flex items-center gap-4 text-sm"><div class="flex items-center gap-2"><span class="text-muted-foreground">Rows per page</span><select class="${inputBase.replace("h-9", "h-7")} w-16 text-xs"><option>10</option><option>25</option><option>50</option></select></div><div class="flex gap-1"><button class="${btnBase} ${btnVariant.outline} h-7 w-7 rounded-md p-0">&lt;</button><button class="${btnBase} ${btnVariant.outline} h-7 w-7 rounded-md p-0">&gt;</button></div></div>`,
          caption: "Offering a page-size selector without a page indicator hides which page the new size landed on.",
        },
        do: {
          html: `<div class="flex items-center gap-4 text-sm"><div class="flex items-center gap-2"><span class="text-muted-foreground">Rows per page</span><select class="${inputBase.replace("h-9", "h-7")} w-16 text-xs"><option>10</option><option>25</option><option>50</option></select></div><span class="text-muted-foreground">Page 2 of 12</span><div class="flex gap-1"><button class="${btnBase} ${btnVariant.outline} h-7 w-7 rounded-md p-0">&lt;</button><button class="${btnBase} ${btnVariant.outline} h-7 w-7 rounded-md p-0">&gt;</button></div></div>`,
          caption: "Show \"Page X of N\" beside the size selector and reset to page 1 when the size changes.",
        },
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
    donts: [
      {
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
      },
      {
        title: "Stacked",
        dont: {
          html: `<div class="flex flex-col gap-2.5">
  <label class="flex cursor-pointer items-center gap-2"><input type="radio" name="dd-st1" checked class="accent-primary"><div><div class="text-[13px] font-medium">Pro</div><div class="text-xs text-muted-foreground">For growing teams that need more control.</div></div></label>
</div>`,
          caption: "With items-center the input floats to the vertical middle of a two-line label, leaving it visually unattached to the title it controls.",
        },
        do: {
          html: `<div class="flex flex-col gap-2.5">
  <label class="flex cursor-pointer gap-2"><input type="radio" name="dd-st2" checked class="accent-primary mt-[3px]"><div><div class="text-[13px] font-medium">Pro</div><div class="text-xs text-muted-foreground">For growing teams that need more control.</div></div></label>
</div>`,
          caption: "Align the control to the first text line (mt-[3px]) so it sits beside the title, with the description flowing below.",
        },
      },
      {
        title: "Inline",
        dont: {
          html: `<div class="flex flex-wrap gap-1.5 text-sm">
  <label class="flex cursor-pointer items-center gap-1"><input type="radio" name="dd-in1" checked class="accent-primary">Hobby</label>
  <label class="flex cursor-pointer items-center gap-1"><input type="radio" name="dd-in1" class="accent-primary">Pro</label>
  <label class="flex cursor-pointer items-center gap-1"><input type="radio" name="dd-in1" class="accent-primary">Enterprise</label>
</div>`,
          caption: "Cramped gap-1 between options makes each label blur into the next radio, so it is hard to tell which dot belongs to which choice.",
        },
        do: {
          html: `<div class="flex flex-wrap gap-6 text-sm">
  <label class="flex cursor-pointer items-center gap-2"><input type="radio" name="dd-in2" checked class="accent-primary">Hobby</label>
  <label class="flex cursor-pointer items-center gap-2"><input type="radio" name="dd-in2" class="accent-primary">Pro</label>
  <label class="flex cursor-pointer items-center gap-2"><input type="radio" name="dd-in2" class="accent-primary">Enterprise</label>
</div>`,
          caption: "Use gap-6 between options (gap-2 inside each) so every label clearly pairs with its own control.",
        },
      },
      {
        title: "Card",
        dont: {
          html: `<div class="grid grid-cols-2 gap-2">
  <label class="${radioCard(false)}"><input type="radio" name="dd-cd1" checked class="accent-primary mb-2"><span class="text-[13px] font-semibold">Pro</span><span class="text-xs text-muted-foreground">For growing teams.</span></label>
  <label class="${radioCard(false)}"><input type="radio" name="dd-cd1" class="accent-primary mb-2"><span class="text-[13px] font-semibold">Enterprise</span><span class="text-xs text-muted-foreground">Advanced security.</span></label>
</div>`,
          caption: "When the selected card keeps the same plain border, only the tiny native dot signals the choice and the active card is easy to miss.",
        },
        do: {
          html: `<div class="grid grid-cols-2 gap-2">
  <label class="${radioCard(true)}"><input type="radio" name="dd-cd2" checked class="accent-primary mb-2"><span class="text-[13px] font-semibold">Pro</span><span class="text-xs text-muted-foreground">For growing teams.</span></label>
  <label class="${radioCard(false)}"><input type="radio" name="dd-cd2" class="accent-primary mb-2"><span class="text-[13px] font-semibold">Enterprise</span><span class="text-xs text-muted-foreground">Advanced security.</span></label>
</div>`,
          caption: "Give the selected card a primary border and tinted fill so the whole tile reads as chosen, not just the dot.",
        },
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
        const sz = s.size === "sm" ? inputBase.replace("h-9", "h-8") : s.size === "lg" ? inputBase.replace("h-9", "h-10") : inputBase;
        const dis = s.disabled ? " disabled" : "";
        const label = s.withLabel ? `<label class="${labelCls}">Country</label>` : "";
        const globe = s.withIcon ? `<span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>` : "";
        const pad = s.withIcon ? " pl-9" : "";
        return `<div class="max-w-[280px]">${label}<div class="relative">${globe}<select class="${sz}${pad}"${dis}><option>United States</option><option>Canada</option><option>Mexico</option><option>United Kingdom</option></select></div></div>`;
      },
    },
    sections: [],
    donts: [
      {
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
      },
      {
        title: "sm",
        dont: {
          html: `<div class="max-w-[200px]">
  <label class="${labelCls}">Rows per page</label>
  <select class="${inputBase.replace("h-9", "h-8")}"><option>10</option><option>25</option><option>50</option></select>
</div>`,
          caption: "A stacked block label towers over the small control and breaks the dense row it belongs in.",
        },
        do: {
          html: `<div class="flex items-center gap-2">
  <span class="text-xs text-muted-foreground">Rows</span>
  <select class="${inputBase.replace("h-9", "h-8")} w-auto"><option>10</option><option>25</option><option>50</option></select>
</div>`,
          caption: "Keep the small select inline with a short label so it stays compact inside toolbars and table footers.",
        },
      },
      {
        title: "default",
        dont: {
          html: `<div class="flex max-w-[420px] items-end gap-3">
  <div class="flex-1"><label class="${labelCls}">City</label><input class="${inputBase.replace("h-9", "h-10")}" value="Austin"></div>
  <div class="flex-1"><label class="${labelCls}">State</label><select class="${inputBase}"><option>Texas</option><option>Oregon</option></select></div>
</div>`,
          caption: "A default select next to a taller lg input leaves the row baselines misaligned.",
        },
        do: {
          html: `<div class="flex max-w-[420px] items-end gap-3">
  <div class="flex-1"><label class="${labelCls}">City</label><input class="${inputBase}" value="Austin"></div>
  <div class="flex-1"><label class="${labelCls}">State</label><select class="${inputBase}"><option>Texas</option><option>Oregon</option></select></div>
</div>`,
          caption: "Match the default select to sibling inputs at the same height so the form row lines up.",
        },
      },
      {
        title: "lg",
        dont: {
          html: `<div class="max-w-[320px]">
  <label class="${labelCls}">Plan</label>
  <select class="${inputBase.replace("h-9", "h-10")} text-xs"><option>Starter</option><option>Pro</option><option>Enterprise</option></select>
</div>`,
          caption: "Tiny option text inside a tall control wastes the height and looks like an accidental mismatch.",
        },
        do: {
          html: `<div class="max-w-[320px]">
  <label class="${labelCls}">Plan</label>
  <select class="${inputBase.replace("h-9", "h-10")} text-base"><option>Starter</option><option>Pro</option><option>Enterprise</option></select>
</div>`,
          caption: "Scale the text up with the height so the large select reads as a deliberate, touch-friendly target.",
        },
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
    donts: [
      {
        title: "text",
        dont: {
          html: `<div class="flex w-[320px] flex-col gap-1.5">${skLine(true, "100%")}${skLine(true, "100%")}${skLine(true, "100%")}</div>`,
          caption: "Three full-width lines read as a solid block, not as a paragraph of prose.",
        },
        do: {
          html: `<div class="flex w-[320px] flex-col gap-1.5">${skLine(true, "100%")}${skLine(true, "95%")}${skLine(true, "60%")}</div>`,
          caption: "Vary the line widths and shorten the last line so it reads like real wrapped text.",
        },
      },
      {
        title: "avatar",
        dont: {
          html: `<div class="${skelCls(true)} rounded-md" style="width:40px;height:40px"></div>`,
          caption: "A square placeholder for a round avatar snaps shape the instant the image loads.",
        },
        do: {
          html: `<div class="${skelCls(true)} rounded-full" style="width:40px;height:40px"></div>`,
          caption: "Match the avatar's circle exactly so the photo drops in with no shift.",
        },
      },
      {
        title: "button",
        dont: {
          html: `<div class="${skelCls(true)} w-[320px] rounded-md" style="height:72px"></div>`,
          caption: "An oversized bar overstates a button and the layout jumps when the real control mounts.",
        },
        do: {
          html: `<div class="${skelCls(true)} rounded-md" style="width:120px;height:36px"></div>`,
          caption: "Size the placeholder to the button's real height and width (h-9, content-fit).",
        },
      },
      {
        title: "card",
        dont: {
          html: `<div class="${skelCls(true)} rounded-md" style="width:320px;height:88px"></div>`,
          caption: "A generic block that ignores the content's shape causes a jarring shift when it loads.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[320px] p-4"><div class="mb-4 flex items-center gap-3"><div class="${skelCls(true)} shrink-0 rounded-full" style="width:40px;height:40px"></div><div class="flex-1">${skLine(true, "70%")}${skLine(true, "40%", "mt-1.5")}</div></div>${skLine(true, "100%")}</div>`,
          caption: "Mirror the real layout (avatar circle, text lines) so the swap is seamless.",
        },
      },
      {
        title: "list",
        dont: {
          html: `<div class="${skelCls(true)} w-[400px] rounded-md" style="height:120px"></div>`,
          caption: "One tall block hides the row rhythm, so the list reflows when each item appears.",
        },
        do: {
          html: `<div class="flex w-[400px] flex-col gap-4"><div class="flex items-center gap-3"><div class="${skelCls(true)} rounded-full" style="width:2rem;height:2rem"></div><div class="flex-1">${skLine(true, "70%", "mb-1.5")}${skLine(true, "50%")}</div></div><div class="flex items-center gap-3"><div class="${skelCls(true)} rounded-full" style="width:2rem;height:2rem"></div><div class="flex-1">${skLine(true, "55%", "mb-1.5")}${skLine(true, "35%")}</div></div></div>`,
          caption: "Repeat a per-row placeholder so the avatar-and-text rhythm matches the loaded list.",
        },
      },
      {
        title: "table",
        dont: {
          html: `<div class="${skelCls(true)} w-[400px] rounded-md" style="height:120px"></div>`,
          caption: "A single rectangle gives no column structure; cells shift sideways once data lands.",
        },
        do: {
          html: `<div class="w-[400px]"><div class="grid gap-3 border-b border-border py-3" style="grid-template-columns:40px 1fr 1fr 80px">${skLine(true, "100%")}${skLine(true, "70%")}${skLine(true, "50%")}${skLine(true, "100%")}</div><div class="grid gap-3 py-3" style="grid-template-columns:40px 1fr 1fr 80px">${skLine(true, "100%")}${skLine(true, "80%")}${skLine(true, "60%")}${skLine(true, "100%")}</div></div>`,
          caption: "Lay placeholders out on the real column grid so each cell stays put when it fills in.",
        },
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
      title: "With label",
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
    }, {
      title: "Character counter",
      dont: {
        html: `<div class="max-w-[400px]">
  <label class="${labelCls}">Bio</label>
  <textarea class="${taBase}" style="min-height:80px">I have been building things on the web for fifteen years and counting, across teams large and small, shipping product end to end.</textarea>
  <div class="mt-1 flex justify-end"><span class="text-[11px] text-muted-foreground">over limit</span></div>
</div>`,
        caption: "A vague \"over limit\" message gives no number, so users cannot tell how much to trim.",
      },
      do: {
        html: `<div class="max-w-[400px]">
  <label class="${labelCls}">Bio</label>
  <textarea class="${taBase}" style="min-height:80px">I have been building things on the web for fifteen years and counting, across teams large and small, shipping product end to end.</textarea>
  <div class="mt-1 flex justify-end"><span class="text-[11px] text-destructive">123 / 120</span></div>
</div>`,
        caption: "Show the live count against the cap and turn it destructive past the limit so the overage is precise.",
      },
    }, {
      title: "Formatting toolbar",
      dont: {
        html: `<div class="max-w-[400px] overflow-hidden rounded-md border border-border">
  <div class="flex items-center gap-1 border-b border-border bg-muted/30 px-3 py-2">
    <span class="px-2 text-sm font-bold">B</span>
    <span class="px-2 text-sm italic">I</span>
    <span class="px-2 font-mono text-[11px]">&lt;/&gt;</span>
  </div>
  <textarea class="w-full resize-y bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none" placeholder="Leave a comment…" style="min-height:96px"></textarea>
</div>`,
        caption: "Static, unclickable glyphs look like a toolbar but cannot be pressed or focused.",
      },
      do: {
        html: `<div class="max-w-[400px] overflow-hidden rounded-md border border-border">
  <div class="flex items-center gap-1 border-b border-border bg-muted/30 px-3 py-2">
    <button type="button" class="${btnBase} ${btnVariant.ghost} h-8 min-w-8 px-2 font-bold" onclick="this.classList.toggle('bg-accent');this.classList.toggle('text-accent-foreground')">B</button>
    <button type="button" class="${btnBase} ${btnVariant.ghost} h-8 min-w-8 px-2 italic" onclick="this.classList.toggle('bg-accent');this.classList.toggle('text-accent-foreground')">I</button>
    <button type="button" class="${btnBase} ${btnVariant.ghost} h-8 min-w-8 px-2 font-mono text-[11px]" onclick="this.classList.toggle('bg-accent');this.classList.toggle('text-accent-foreground')">&lt;/&gt;</button>
  </div>
  <textarea class="w-full resize-y bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none" placeholder="Leave a comment…" style="min-height:96px"></textarea>
</div>`,
        caption: "Make each control a real focusable button that toggles an active state when pressed.",
      },
    }, {
      title: "Disabled",
      dont: {
        html: `<div class="max-w-[400px]">
  <label class="${labelCls}">Description</label>
  <textarea class="${taBase}" style="min-height:80px;opacity:0.5" readonly>Read-only content the user must not change.</textarea>
</div>`,
        caption: "Dimming a textarea while leaving it editable looks disabled but still accepts input.",
      },
      do: {
        html: `<div class="max-w-[400px]">
  <label class="${labelCls}">Description</label>
  <textarea class="${taBase}" style="min-height:80px" disabled>Read-only content the user must not change.</textarea>
</div>`,
        caption: "Use the disabled attribute so the field blocks editing and focus, matching its dimmed look.",
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
    donts: [
      {
        title: "Off",
        dont: {
          html: `<label class="flex max-w-[280px] items-center justify-between gap-4"><span class="text-[13px]">Two-factor auth</span><span class="relative inline-flex shrink-0 items-center"><input type="checkbox" role="switch" class="peer sr-only"><span class="relative h-5 w-9 rounded-full bg-muted/30 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-muted after:content-['']"></span></span></label>`,
          caption: "A washed-out off track reads as disabled, so users can't tell the switch is simply off versus locked.",
        },
        do: {
          html: `<label class="flex max-w-[280px] items-center justify-between gap-4"><span class="text-[13px]">Two-factor auth</span>${switchEl(false)}</label>`,
          caption: "Keep the standard bg-input off track so off stays clearly interactive and distinct from a disabled control.",
        },
      },
      {
        title: "On",
        dont: {
          html: `<label class="flex max-w-[280px] items-center justify-between gap-4"><span class="text-[13px] text-destructive">Permanently delete account</span>${switchEl(true)}</label>`,
          caption: "A switch applies instantly; wiring an on toggle to an irreversible action invites accidental, unconfirmed data loss.",
        },
        do: {
          html: `<div class="flex max-w-[280px] flex-col gap-3"><label class="flex items-center justify-between gap-4"><span class="text-[13px]">Auto-save drafts</span>${switchEl(true)}</label><button class="${btnBase} ${btnVariant.destructive} ${btnSize.sm} self-start">Delete account…</button></div>`,
          caption: "Reserve the on switch for instantly reversible settings; route irreversible actions through a button plus confirmation.",
        },
      },
      {
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
    donts: [
      {
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
      },
      {
        title: "top",
        dont: {
          html: `<div class="pt-2">
  <div class="relative inline-flex">
    ${btn("outline", "Save", "sm")}
    <div class="${tooltipCls} absolute whitespace-nowrap" style="bottom:calc(100% + 8px);left:50%;transform:translateX(-50%)">Saves your changes</div>
  </div>
</div>`,
          caption: "A top tooltip on a trigger near the top edge clips above the viewport and goes unread.",
        },
        do: {
          html: `<div class="pt-14">
  <div class="relative inline-flex">
    ${btn("outline", "Save", "sm")}
    <div class="${tooltipCls} absolute whitespace-nowrap" style="bottom:calc(100% + 8px);left:50%;transform:translateX(-50%)">Saves your changes</div>
  </div>
</div>`,
          caption: "Leave headroom above (or flip to bottom) so a top-placed tooltip stays fully on screen.",
        },
      },
      {
        title: "right",
        dont: {
          html: `<div class="flex justify-end">
  <div class="relative inline-flex">
    ${btn("ghost", "i", "icon")}
    <div class="${tooltipCls} absolute whitespace-nowrap" style="left:calc(100% + 8px);top:50%;transform:translateY(-50%)">More info</div>
  </div>
</div>`,
          caption: "A right tooltip on a control flush against the right edge is cut off by the container.",
        },
        do: {
          html: `<div class="flex justify-end pr-28">
  <div class="relative inline-flex">
    ${btn("ghost", "i", "icon")}
    <div class="${tooltipCls} absolute whitespace-nowrap" style="left:calc(100% + 8px);top:50%;transform:translateY(-50%)">More info</div>
  </div>
</div>`,
          caption: "Keep room to the right, or flip the tooltip to the left when the trigger hugs the edge.",
        },
      },
      {
        title: "bottom",
        dont: {
          html: `<div class="flex flex-col gap-2">
  <div class="relative inline-flex w-fit">
    ${btn("outline", "Filters", "sm")}
    <div class="${tooltipCls} absolute whitespace-nowrap" style="top:calc(100% + 4px);left:50%;transform:translateX(-50%)">Refine results</div>
  </div>
  ${btn("ghost", "Clear all", "sm")}
</div>`,
          caption: "A bottom tooltip sits right on top of the next row, masking the control beneath it.",
        },
        do: {
          html: `<div class="flex flex-col gap-10">
  <div class="relative inline-flex w-fit">
    ${btn("outline", "Filters", "sm")}
    <div class="${tooltipCls} absolute whitespace-nowrap" style="top:calc(100% + 8px);left:50%;transform:translateX(-50%)">Refine results</div>
  </div>
  ${btn("ghost", "Clear all", "sm")}
</div>`,
          caption: "Give a bottom tooltip clearance so it never overlaps the interactive content below.",
        },
      },
      {
        title: "left",
        dont: {
          html: `<div class="relative inline-flex">
  ${btn("ghost", "?", "icon")}
  <div class="${tooltipCls} absolute whitespace-nowrap" style="right:calc(100% + 8px);top:50%;transform:translateY(-50%)">Need help?</div>
</div>`,
          caption: "A left tooltip on a trigger at the left edge is clipped by the container's left boundary.",
        },
        do: {
          html: `<div class="pl-28">
  <div class="relative inline-flex">
    ${btn("ghost", "?", "icon")}
    <div class="${tooltipCls} absolute whitespace-nowrap" style="right:calc(100% + 8px);top:50%;transform:translateY(-50%)">Need help?</div>
  </div>
</div>`,
          caption: "Reserve space on the left, or flip to the right, so a left-placed tooltip is never cut off.",
        },
      },
    ],
  },

  {
    slug: "alert",
    name: "Alerts",
    description: "Inline notification banners: info, success, warning, and error, plus a full-width announcement bar. For a blocking confirmation prompt, see Alert Dialog.",
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
    donts: [
      {
        title: "info",
        dont: {
          html: alertBox("info", "Trial expires today", "Upgrade now or you'll lose access to your projects."),
          caption: "Dressing an act-now message in the neutral info tone hides the urgency; users skim past it like an FYI.",
        },
        do: {
          html: alertBox("info", "Heads up", "Maintenance window scheduled for Sunday 2:00 UTC."),
          caption: "Reserve info for passive, non-urgent context (notices, tips); escalate to warning or destructive when action is required.",
        },
      },
      {
        title: "success",
        dont: {
          html: alertBox("success", "Saved", "Your changes have been saved successfully."),
          caption: "A success banner pinned with no way to dismiss it lingers as visual noise long after the action is done.",
        },
        do: {
          html: alertBox("success", "Saved", "Your changes have been saved successfully.", `<div class="mt-3 flex gap-2">${btn("ghost", "Dismiss", "sm", ` onclick="this.closest('[data-alert]').style.display='none'"`)}</div>`),
          caption: "Make confirmations transient: auto-dismiss or give a Dismiss control so the success state clears once acknowledged.",
        },
      },
      {
        title: "warning",
        dont: {
          html: alertBox("warning", "Action required", "Something needs your attention."),
          caption: "A warning with no specifics or next step leaves the user guessing what to fix and by when.",
        },
        do: {
          html: alertBox("warning", "Action required", "Your trial expires in 3 days. Upgrade to keep your projects.", `<div class="mt-3 flex gap-2">${btn("default", "Upgrade plan", "sm")}</div>`),
          caption: "State the consequence, the deadline, and the action: name what's wrong and give a button to resolve it.",
        },
      },
      {
        title: "destructive",
        dont: {
          html: alertBox("destructive", "Saved", "Your changes have been saved successfully."),
          caption: "Using the destructive variant for non-errors cries wolf; users learn to tune out red and miss real failures.",
        },
        do: {
          html: alertBox("destructive", "Something went wrong", "Could not save your changes. Please try again."),
          caption: "Match the variant to the severity: reserve destructive for genuine failures, success for confirmations.",
        },
      },
    ],
  },

  {
    slug: "alert-dialog",
    name: "Alert Dialog",
    description: "Catalyst-style confirmation dialog: a centered panel over a dimmed, blurred backdrop, with a title, description, optional body, and action buttons. Reserve it for decisions that must block the rest of the app.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "size", label: "Size", options: ["xs", "sm", "md", "lg"], cols: 4 },
        { type: "check", key: "withDescription", label: "Description" },
        { type: "check", key: "withInput", label: "Body field" },
        { type: "check", key: "destructive", label: "Destructive confirm" },
      ],
      defaults: { size: "md", withDescription: true, withInput: false, destructive: true },
      render: (s) => {
        const size = alertSize[s.size as string] || alertSize.md;
        const desc = s.withDescription ? `<p class="mt-2 text-sm text-muted-foreground sm:mt-1">This permanently removes the identity and revokes any active sessions. This action cannot be undone.</p>` : "";
        const body = s.withInput ? `<div class="mt-4">${fsField("Type DELETE to confirm", `<input class="${inputBase}" placeholder="DELETE">`)}</div>` : "";
        const v = s.destructive ? "destructive" : "default";
        const confirmLabel = s.destructive ? "Delete" : "Confirm";
        return `<div class="relative inline-block"><button class="${btnBase} ${btnVariant.outline} ${btnSize.default}"${alertTrigger}>Open alert</button><div data-alert-overlay class="${overlayCls}" onclick="if(event.target===this){this.classList.add('hidden');this.classList.remove('flex')}"><div class="${alertPanel} ${size}"><h2 class="text-base font-semibold sm:text-sm">Delete this identity?</h2>${desc}${body}<div class="mt-6 flex flex-col-reverse gap-2 sm:mt-4 sm:flex-row sm:justify-end">${btn("ghost", "Cancel", "default", alertClose)}${btn(v, confirmLabel, "default", alertClose)}</div></div></div></div>`;
      },
    },
    sections: [
      {
        title: "Anatomy",
        anatomy: "Title (the question) . optional description . optional body (custom content like an input) . actions (Cancel + confirm; right-aligned on desktop, stacked on mobile). The panel sits centered over a dimmed, blurred backdrop; dismiss via Cancel, a backdrop click, or Esc.",
        examples: [],
      },
    ],
    donts: [
      {
        title: "Reserve the dialog for blocking decisions",
        dont: {
          html: `<div class="${alertPanel} ${alertSize.sm}"><h2 class="text-sm font-semibold">Saved</h2><p class="mt-1 text-sm text-muted-foreground">Your changes have been saved.</p><div class="mt-4 flex justify-end">${btn("default", "OK", "sm")}</div></div>`,
          caption: "A blocking alert dialog for passive confirmation interrupts the user for no reason.",
        },
        do: {
          html: alertBox("success", "Saved", "Your changes have been saved."),
          caption: "Use an inline banner or toast for passive feedback; reserve the dialog for decisions that must be confirmed.",
        },
      },
      {
        title: "Name the action on the confirm button",
        dont: {
          html: `<div class="${alertPanel} ${alertSize.sm}"><h2 class="text-sm font-semibold">Delete this identity?</h2><div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "No", "sm")}${btn("destructive", "Yes", "sm")}</div></div>`,
          caption: "Generic Yes / No forces the user to re-read the title to know what they are confirming.",
        },
        do: {
          html: `<div class="${alertPanel} ${alertSize.sm}"><h2 class="text-sm font-semibold">Delete this identity?</h2><div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "Cancel", "sm")}${btn("destructive", "Delete", "sm")}</div></div>`,
          caption: "Label the confirm button with the verb it performs (Delete, Archive, Sign out).",
        },
      },
      {
        title: "xs",
        dont: {
          html: `<div class="${alertPanel} ${alertSize.xs}"><h2 class="text-sm font-semibold">Remove this trusted device?</h2><p class="mt-1 text-sm text-muted-foreground">It will need to re-authenticate, and any pending background syncs from it will be cancelled the next time it connects.</p><div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "Cancel", "sm")}${btn("destructive", "Remove device", "sm")}</div></div>`,
          caption: "A long title, multi-line description, and wordy buttons get cramped in the xs width and wrap awkwardly.",
        },
        do: {
          html: `<div class="${alertPanel} ${alertSize.xs}"><h2 class="text-sm font-semibold">Remove device?</h2><div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "Cancel", "sm")}${btn("destructive", "Remove", "sm")}</div></div>`,
          caption: "Reserve xs for a terse one-line question with short button labels and no body content.",
        },
      },
      {
        title: "sm",
        dont: {
          html: `<div class="${alertPanel} ${alertSize.sm}"><h2 class="text-sm font-semibold">Transfer ownership</h2><div class="mt-4 space-y-4">${fsField("New owner email", `<input class="${inputBase}" placeholder="owner@example.com">`)}${fsField("Reason", `<input class="${inputBase}" placeholder="Optional note">`)}${fsField("Type TRANSFER to confirm", `<input class="${inputBase}" placeholder="TRANSFER">`)}</div><div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "Cancel", "sm")}${btn("default", "Transfer", "sm")}</div></div>`,
          caption: "Packing a multi-field form into sm makes it feel like a form crammed into a confirmation popup.",
        },
        do: {
          html: `<div class="${alertPanel} ${alertSize.sm}"><h2 class="text-sm font-semibold">Transfer ownership?</h2><p class="mt-1 text-sm text-muted-foreground">You will lose admin access to this workspace.</p><div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "Cancel", "sm")}${btn("default", "Transfer", "sm")}</div></div>`,
          caption: "Use sm for a single short confirmation with a one-line description; move real forms to a full dialog.",
        },
      },
      {
        title: "md",
        dont: {
          html: `<div class="${alertPanel} ${alertSize.xs}"><h2 class="text-sm font-semibold">Delete this identity?</h2><p class="mt-1 text-sm text-muted-foreground">This permanently removes the identity and revokes any active sessions. This action cannot be undone.</p><div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "Cancel", "sm")}${btn("destructive", "Delete", "sm")}</div></div>`,
          caption: "Squeezing a description-carrying confirm into a smaller width crowds the copy against the edges.",
        },
        do: {
          html: `<div class="${alertPanel} ${alertSize.md}"><h2 class="text-sm font-semibold">Delete this identity?</h2><p class="mt-1 text-sm text-muted-foreground">This permanently removes the identity and revokes any active sessions. This action cannot be undone.</p><div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "Cancel", "sm")}${btn("destructive", "Delete", "sm")}</div></div>`,
          caption: "md is the default home for a typical destructive confirm with a sentence or two of description.",
        },
      },
      {
        title: "lg",
        dont: {
          html: `<div class="${alertPanel} ${alertSize.lg}"><h2 class="text-sm font-semibold">Sign out?</h2><div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "Cancel", "sm")}${btn("default", "Sign out", "sm")}</div></div>`,
          caption: "A bare yes/no in lg leaves a wide, empty panel that reads as heavier than the trivial decision it asks for.",
        },
        do: {
          html: `<div class="${alertPanel} ${alertSize.lg}"><h2 class="text-sm font-semibold">Delete this identity?</h2><p class="mt-1 text-sm text-muted-foreground">This permanently removes the identity and revokes any active sessions. This action cannot be undone.</p><div class="mt-4">${fsField("Type DELETE to confirm", `<input class="${inputBase}" placeholder="DELETE">`)}</div><div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "Cancel", "sm")}${btn("destructive", "Delete", "sm")}</div></div>`,
          caption: "Reserve lg for dialogs that earn the width: a body field or a longer explanation to read.",
        },
      },
    ]
  },

  {
    slug: "fieldset",
    name: "Fieldsets",
    description: "Group related form controls under a legend. Each field pairs a label, control, optional help text, and an inline error, so a set of inputs reads as one labeled unit.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "content", label: "Content", options: ["fields", "checkboxes"], cols: 2 },
        { type: "check", key: "legend", label: "Legend" },
        { type: "check", key: "description", label: "Description" },
        { type: "check", key: "error", label: "Validation error", disabledWhen: (s) => s.content === "checkboxes" },
        { type: "check", key: "disabled", label: "Disabled" },
        { type: "pills", key: "columns", label: "Columns", options: ["1", "2"], cols: 2, disabledWhen: (s) => s.content === "checkboxes" },
      ],
      defaults: { content: "fields", legend: true, description: true, error: false, disabled: false, columns: "1" },
      render: (s) => {
        const dis = s.disabled ? " disabled" : "";
        if (s.content === "checkboxes") {
          const legendCb = s.legend ? `<legend class="${fieldsetLegend}">Email notifications</legend>` : "";
          const descCb = s.description ? `<p class="mt-1 text-sm text-muted-foreground">Choose what we email you about.</p>` : "";
          const boxes = ["Product updates", "Security alerts", "Weekly digest"].map((l, i) => `<label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary"${i < 2 ? " checked" : ""}${dis}> ${l}</label>`).join("");
          return `<fieldset class="max-w-xl${s.disabled ? " opacity-60" : ""}"${dis}>${legendCb}${descCb}<div class="mt-3 space-y-2">${boxes}</div></fieldset>`;
        }
        const legend = s.legend ? `<legend class="${fieldsetLegend}">Shipping details</legend>` : "";
        const desc = s.description ? `<p class="mt-1 text-sm text-muted-foreground">Where should we send your order?</p>` : "";
        const err = s.error ? "Enter a valid email address" : "";
        const group = s.columns === "2" ? "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" : "mt-4 space-y-4";
        const fields =
          fsField("Full name", `<input class="${inputBase}" placeholder="Ada Lovelace"${dis}>`) +
          fsField("Email", `<input class="${inputBase}${err ? " border-destructive" : ""}" value="ada@" type="email"${dis}>`, "We'll only use this for order updates.", err) +
          fsField("Country", `<select class="${inputBase}"${dis}><option>United States</option><option>Canada</option><option>Mexico</option></select>`);
        return `<fieldset class="max-w-xl${s.disabled ? " opacity-60" : ""}"${dis}>${legend}${desc}<div class="${group}">${fields}</div></fieldset>`;
      },
    },
    sections: [
      {
        title: "Anatomy",
        anatomy: "fieldset (the group) . legend (its name) . field group (a vertical stack) . field (label + control + help/error). The native <fieldset disabled> attribute disables every control inside at once.",
        examples: [],
      },
    ],
    donts: [
      {
        title: "Text fields",
        dont: {
          html: `<fieldset class="max-w-md"><legend class="${fieldsetLegend}">Shipping details</legend><div class="mt-4 space-y-4">${fsField("", `<input class="${inputBase}" placeholder="Full name">`)}${fsField("", `<input class="${inputBase}" placeholder="Email">`)}</div></fieldset>`,
          caption: "A placeholder is not a label: it vanishes on focus and is skipped by many screen readers, leaving the field unnamed.",
        },
        do: {
          html: `<fieldset class="max-w-md"><legend class="${fieldsetLegend}">Shipping details</legend><div class="mt-4 space-y-4">${fsField("Full name", `<input class="${inputBase}" placeholder="Ada Lovelace">`)}${fsField("Email", `<input class="${inputBase}" type="email" placeholder="ada@example.com">`, "We'll only use this for order updates.")}</div></fieldset>`,
          caption: "Give every field a persistent label; use the placeholder only for an example value or format hint.",
        },
      },
      {
        title: "Checkbox group",
        dont: {
          html: `<fieldset class="max-w-md"><div class="space-y-3">${["Email", "SMS", "Push"].map((l) => `<label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary"> ${l}</label>`).join("")}</div></fieldset>`,
          caption: "Without a legend the relationship between the controls is implicit; screen readers announce them as unrelated.",
        },
        do: {
          html: `<fieldset class="max-w-md"><legend class="${fieldsetLegend}">Notify me by</legend><div class="mt-3 space-y-3">${["Email", "SMS", "Push"].map((l) => `<label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary"> ${l}</label>`).join("")}</div></fieldset>`,
          caption: "A legend names the group so its checkboxes read as one labeled unit.",
        },
      },
      {
        title: "Two-column",
        dont: {
          html: `<fieldset class="max-w-md"><legend class="${fieldsetLegend}">Account</legend><div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">${fsField("Bio", `<textarea class="${inputBase} min-h-20" rows="3">Engineering lead.</textarea>`)}${fsField("Country", `<select class="${inputBase}"><option>United States</option></select>`)}</div></fieldset>`,
          caption: "Splitting unrelated or full-width fields across two columns crams the form and breaks the reading order.",
        },
        do: {
          html: `<fieldset class="max-w-md"><legend class="${fieldsetLegend}">Card details</legend><div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">${fsField("Expiry", `<input class="${inputBase}" placeholder="MM / YY">`)}${fsField("CVC", `<input class="${inputBase}" placeholder="123">`)}</div></fieldset>`,
          caption: "Pair only naturally adjacent, short fields side by side; the grid stacks to one column on small screens.",
        },
      },
    ],
  },

  {
    slug: "listbox",
    name: "Listboxes",
    description: "A custom (non-native) select: single or multi-select, optional avatars or icons per option, and a checkmark on the chosen items. Reach for it when a native select can't show rich options; prefer a native select for simple short lists.",
    category: "Atoms",
    playground: {
      controls: [
        { type: "pills", key: "mode", label: "Mode", options: ["single", "multi"], cols: 2 },
        { type: "pills", key: "size", label: "Size", options: ["sm", "default", "lg"], cols: 3 },
        { type: "check", key: "withIcon", label: "Avatars" },
        { type: "check", key: "disabled", label: "Disabled" },
      ],
      defaults: { mode: "single", size: "default", withIcon: false, disabled: false },
      render: (s) => {
        const multi = s.mode === "multi";
        const dis = s.disabled ? " disabled" : "";
        const sizeH = s.size === "sm" ? "h-8 text-xs" : s.size === "lg" ? "h-10 text-sm" : "h-9 text-sm";
        const items: any[] = s.withIcon
          ? [{ l: "Rachel Chen", i: "RC", img: "/rachel-chen.jpg" }, { l: "Ada Lovelace", i: "AL", img: "/ada-lovelace.jpg" }, { l: "Kevin Turner", i: "KT", img: "" }, { l: "Linus Berg", i: "LB", img: "" }]
          : [{ l: "Backend" }, { l: "Frontend" }, { l: "Design" }, { l: "Platform" }, { l: "Security" }];
        const av = (it: any) => s.withIcon ? `<span class="${avatarBase} h-5 w-5 text-[9px]">${it.img ? avatarImg(it.img, it.i) : (it.i || "")}</span>` : "";
        const optionRow = (it: any, sel: boolean) => `<button type="button" data-lb-opt class="${lbOption}">${av(it)}<span data-lb-label>${it.l}</span>${lbCheck(sel)}</button>`;
        const optionsHtml = items.map((it, i) => optionRow(it, i === 0)).join("");
        const value = multi ? "1 selected" : items[0].l;
        const triggerAv = (s.withIcon && !multi) ? `<span class="${avatarBase} h-5 w-5 text-[9px]">${items[0].img ? avatarImg(items[0].img, items[0].i) : items[0].i}</span>` : "";
        const panelClick = multi
          ? ` onclick="var t=event.target.closest('[data-lb-opt]');if(!t)return;t.querySelector('[data-check]').classList.toggle('invisible');var sel=[].slice.call(this.querySelectorAll('[data-lb-opt]')).filter(function(o){return !o.querySelector('[data-check]').classList.contains('invisible')});this.previousElementSibling.querySelector('[data-lb-value]').textContent=sel.length?sel.length+' selected':'Select…'"`
          : ` onclick="var t=event.target.closest('[data-lb-opt]');if(!t)return;this.querySelectorAll('[data-check]').forEach(function(c){c.classList.add('invisible')});t.querySelector('[data-check]').classList.remove('invisible');this.previousElementSibling.querySelector('[data-lb-value]').textContent=t.querySelector('[data-lb-label]').textContent;this.classList.add('hidden')"`;
        return `<div class="relative w-64 max-w-full"><button type="button" class="${lbTriggerCls} ${sizeH}"${dis}${menuTrigger}><span class="flex min-w-0 items-center gap-2">${triggerAv}<span data-lb-value class="truncate">${value}</span></span>${chevronDown}</button><div class="${lbPanel}"${panelClick}>${optionsHtml}</div></div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Prefer a native select for simple lists",
        dont: {
          html: `<div class="w-48 rounded-md border border-border bg-popover p-1 shadow-md">${([["Yes", true], ["No", false]] as [string, boolean][]).map(([l, sel]) => `<div class="${lbOption}"><span>${l}</span>${lbCheck(sel)}</div>`).join("")}</div>`,
          caption: "A custom listbox for two short options is heavier than it needs to be and worse on mobile.",
        },
        do: {
          html: `<select class="${inputBase} w-48"><option>Yes</option><option>No</option></select>`,
          caption: "For short, plain lists a native select is lighter, accessible, and uses the platform picker on mobile.",
        },
      },
      {
        title: "single",
        dont: {
          html: `<div class="w-56 rounded-md border border-border bg-popover p-1 shadow-md">${([["Backend", true], ["Frontend", true], ["Design", false], ["Platform", false]] as [string, boolean][]).map(([l, sel]) => `<div class="${lbOption}"><span>${l}</span>${lbCheck(sel)}</div>`).join("")}</div>`,
          caption: "Single-select with two checkmarks lies about state: only one option can be the value.",
        },
        do: {
          html: `<div class="w-56 rounded-md border border-border bg-popover p-1 shadow-md">${([["Backend", true], ["Frontend", false], ["Design", false], ["Platform", false]] as [string, boolean][]).map(([l, sel]) => `<div class="${lbOption}"><span>${l}</span>${lbCheck(sel)}</div>`).join("")}</div>`,
          caption: "Show exactly one checkmark, mirror it in the trigger value, and close the panel on pick.",
        },
      },
      {
        title: "multi",
        dont: {
          html: `<div class="w-56 rounded-md border border-border bg-popover p-1 shadow-md">${([["Backend", true], ["Frontend", true], ["Design", false], ["Platform", true]] as [string, boolean][]).map(([l, sel]) => `<div class="${lbOption}"><span>${l}</span>${lbCheck(sel)}</div>`).join("")}<div class="px-2 pb-1 pt-1.5 text-xs text-muted-foreground">Backend</div></div>`,
          caption: "Don't close on each pick or echo only the last choice: multi-select needs to keep all selections visible.",
        },
        do: {
          html: `<div class="w-56 rounded-md border border-border bg-popover p-1 shadow-md">${([["Backend", true], ["Frontend", true], ["Design", false], ["Platform", true]] as [string, boolean][]).map(([l, sel]) => `<div class="${lbOption}"><span>${l}</span>${lbCheck(sel)}</div>`).join("")}<div class="px-2 pb-1 pt-1.5 text-xs text-muted-foreground">3 selected</div></div>`,
          caption: "Keep the panel open, toggle each option's own checkmark, and summarize the count in the trigger.",
        },
      },
    ],
  },

  {
    slug: "card",
    name: "Cards",
    description: "Three families. <code>StatCard</code> = a single metric, big number + delta. <code>SectionCard</code> = a labeled content surface with optional header and divider. Generic <code>card</code> = bring your own structure. Density: pass <code>compact</code> or <code>comfortable</code> to tighten or relax the card's own padding and the gap between flat children (<code>compact</code> takes precedence, and a density prop pads the surface on its own).",
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
    donts: [
      {
        title: "stat",
        dont: {
          html: `<div class="${cardCls} max-w-[280px] p-5"><div class="text-xs font-medium uppercase tracking-wide text-muted-foreground">This month</div><div class="mt-1 text-sm font-medium">We onboarded 12,348 active identities, up 142 today, with churn holding steady.</div></div>`,
          caption: "Prose where the number should be: the eye has nothing big to land on, so the card stops being a stat.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[280px] p-5"><div class="flex items-start justify-between"><div><div class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active identities</div><div class="mt-1 text-2xl font-bold">12,348</div><div class="mt-0.5 text-[11px] text-muted-foreground">+142 today</div></div><div class="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${statTone.blue}">U</div></div></div>`,
          caption: "One big number, a short label, a small delta. The metric is scannable in a glance.",
        },
      },
      {
        title: "section",
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
      },
      {
        title: "generic",
        dont: {
          html: `<div class="${cardCls} max-w-[360px] p-6"><div class="${cardCls} p-4"><div class="mb-1 text-[15px] font-semibold">Nested surface</div><p class="text-sm text-muted-foreground">A card inside a card doubles the border and shadow.</p></div></div>`,
          caption: "Nesting one card surface inside another stacks border on border and shadow on shadow; the inner block looks dropped in.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[360px] p-6"><div class="mb-1 text-[15px] font-semibold">Anything goes here</div><p class="text-sm text-muted-foreground">The card surface gives you the border, radius, and shadow. You bring the content.</p></div>`,
          caption: "Use the surface once and layout the content with plain spacing inside it.",
        },
      },
    ],
  },

  {
    slug: "code-block",
    name: "Code Block",
    description: "Preformatted code block with monospace font and padding.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["plain", "terminal", "numbered", "inline"], cols: 4 },
        { type: "check", key: "copy", label: "Copy button", disabledWhen: (s) => s.variant === "inline" },
        { type: "check", key: "wrap", label: "Wrap long lines", disabledWhen: (s) => s.variant === "inline" },
      ],
      defaults: { variant: "plain", copy: false, wrap: false },
      render: (s) => {
        const lines = ['const theme = getTheme();', 'setTheme(theme === "dark" ? "light" : "dark");'];
        const code = lines.join("\n");
        const wrapCls = s.wrap ? " whitespace-pre-wrap break-words" : "";
        const copyBtn = `<button type="button" aria-label="Copy code" class="absolute right-2 top-2 inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground" onclick="var p=this.parentElement.querySelector('pre,code');navigator.clipboard.writeText(p.innerText);var b=this;var o=b.innerHTML;b.textContent='Copied!';setTimeout(function(){b.innerHTML=o},1500)">Copy</button>`;

        if (s.variant === "inline") {
          return `<p class="max-w-[420px] text-sm leading-relaxed">Toggle the active theme with <code class="${typeScale.code}">setTheme("dark")</code>, then persist it to storage.</p>`;
        }

        if (s.variant === "terminal") {
          const body = `<div class="overflow-x-auto bg-zinc-900 p-4 font-mono text-[13px] leading-relaxed text-zinc-100"><div class="${wrapCls.trim()}"><span class="select-none text-emerald-400">$ </span>npm install @olympusoss/canvas</div><div class="text-zinc-400">added 1 package in 1.2s</div></div>`;
          const inner = `<div class="flex items-center gap-1.5 border-b border-zinc-700 bg-zinc-800 px-4 py-2.5"><span class="h-3 w-3 rounded-full bg-red-500"></span><span class="h-3 w-3 rounded-full bg-amber-500"></span><span class="h-3 w-3 rounded-full bg-green-500"></span><span class="ml-2 font-mono text-xs text-zinc-400">bash</span></div>${body}`;
          return `<div class="relative w-full overflow-hidden rounded-lg border border-border shadow-sm">${inner}${s.copy ? copyBtn : ""}</div>`;
        }

        if (s.variant === "numbered") {
          const rows = lines
            .map((l, i) => `<span class="select-none pr-4 text-right text-muted-foreground/50">${i + 1}</span><span class="${wrapCls.trim()}">${l}</span>`)
            .join("");
          const pre = `<pre class="${codeblockCls}"><div class="grid grid-cols-[2ch_1fr] gap-x-1">${rows}</div></pre>`;
          return s.copy ? `<div class="relative w-full">${pre}${copyBtn}</div>` : pre;
        }

        const pre = `<pre class="${codeblockCls}${wrapCls}">${code}</pre>`;
        return s.copy ? `<div class="relative w-full">${pre}${copyBtn}</div>` : pre;
      },
    },
    sections: [],
    donts: [
      {
        title: "Plain",
        dont: {
          html: `<p class="max-w-[360px] font-mono text-[13px]">const theme = getTheme(); setTheme(theme === "dark" ? "light" : "dark");</p>`,
          caption: "A paragraph collapses the line breaks and indentation, so multi-line code reads as one run-on string.",
        },
        do: {
          html: `<pre class="${codeblockCls}">const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");</pre>`,
          caption: "Use a pre element so whitespace, line breaks, and indentation survive verbatim.",
        },
      },
      {
        title: "Terminal",
        dont: {
          html: `<div class="w-full overflow-x-auto rounded-lg bg-zinc-900 p-4 font-mono text-[13px] text-zinc-100">npm install @olympusoss/canvas</div>`,
          caption: "Selectable prompt text means a reader who copies the line drags the $ marker into their shell.",
        },
        do: {
          html: `<div class="w-full overflow-x-auto rounded-lg bg-zinc-900 p-4 font-mono text-[13px] text-zinc-100"><span class="select-none text-emerald-400">$ </span>npm install @olympusoss/canvas</div>`,
          caption: "Mark the prompt select-none so a copy yields only the command, not the shell glyph.",
        },
      },
      {
        title: "Numbered",
        dont: {
          html: `<pre class="${codeblockCls}"><div class="grid grid-cols-[2ch_1fr] gap-x-1"><span class="pr-4 text-right text-muted-foreground/50">1</span><span>const theme = getTheme();</span><span class="pr-4 text-right text-muted-foreground/50">2</span><span>setTheme(theme);</span></div></pre>`,
          caption: "Selectable line numbers get swept into the selection and pasted as 1 2 ahead of every line.",
        },
        do: {
          html: `<pre class="${codeblockCls}"><div class="grid grid-cols-[2ch_1fr] gap-x-1"><span class="select-none pr-4 text-right text-muted-foreground/50">1</span><span>const theme = getTheme();</span><span class="select-none pr-4 text-right text-muted-foreground/50">2</span><span>setTheme(theme);</span></div></pre>`,
          caption: "Keep the gutter select-none so copying the block returns clean, runnable code.",
        },
      },
      {
        title: "Inline",
        dont: {
          html: `<p class="max-w-[360px] text-sm leading-relaxed">Run <code class="${typeScale.code}">npm install @olympusoss/canvas &amp;&amp; npm run build &amp;&amp; npm run preview</code> to start.</p>`,
          caption: "A long, multi-step command crammed inline wraps mid-token and offers no horizontal scroll.",
        },
        do: {
          html: `<div class="max-w-[360px]"><p class="text-sm leading-relaxed">Run the setup command:</p><pre class="${codeblockCls} mt-1.5">npm install @olympusoss/canvas
npm run build</pre></div>`,
          caption: "Reserve inline code for short tokens; move anything multi-line into a block.",
        },
      },
    ],
  },

  {
    slug: "empty-state",
    name: "Empty States",
    description: "Centered, calm, never blame the user. Always tell them what could be here, and ideally how to get there.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["search", "users", "files", "activity", "notifications", "errors", "all-clear"], cols: 4 },
        { type: "check", key: "action", label: "Single action" },
        { type: "check", key: "inTable", label: "Inside a table" },
      ],
      defaults: { variant: "search", action: false, inTable: false },
      render: (s) => {
        const v = s.variant as string;
        const icons: Record<string, string> = {
          search: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
          users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
          files: `<path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/>`,
          activity: `<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>`,
          notifications: `<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>`,
          errors: `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
          "all-clear": `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
        };
        const titles: Record<string, string> = { search: "No results found", users: "No users", files: "No files", activity: "No activity", notifications: "All caught up", errors: "No errors", "all-clear": "All clear" };
        const descs: Record<string, string> = {
          search: "Try adjusting your search filters.",
          users: "Invite your first team member.",
          files: "Upload or drag files here.",
          activity: "Events will appear as they happen.",
          notifications: "No new notifications.",
          errors: "Everything is running smoothly.",
          "all-clear": "No locked accounts or pending reviews.",
        };
        const good = v === "errors" || v === "all-clear";
        const disc = `<div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${good ? "bg-green-600/10" : "bg-muted"}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${good ? "text-green-600" : "text-muted-foreground"}">${icons[v]}</svg></div>`;
        const action = s.action ? `<div class="mt-4">${btn("default", "Create identity", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Creating…';setTimeout(function(){b.textContent='Created!';setTimeout(function(){b.textContent=o;b.disabled=false},1200)},800)"`)}</div>` : "";
        const card = `<div class="${emptyCardCls}">${disc}<div class="text-[15px] font-semibold">${titles[v]}</div><p class="mt-1 text-sm text-muted-foreground">${descs[v]}</p>${action}</div>`;
        if (s.inTable) {
          return `<div class="${tableWrap}">
  <table class="${tableCls}">
    <thead><tr>${["Name", "Email", "Role", "Status"].map((h) => `<th class="${thCls}">${h}</th>`).join("")}</tr></thead>
    <tbody>
      <tr><td colspan="4" class="px-4 py-10">
        ${card}
      </td></tr>
    </tbody>
  </table>
</div>`;
        }
        return card;
      },
    },
    sections: [
      {
        title: "Anatomy",
        anatomy: "Round muted icon container (48x48) . 12px gap . semibold 15px title . 13px muted description. Used inside SectionCard or as a cell colspan in tables; when emptiness is good (no errors, all caught up) the icon disc goes green.",
        examples: [],
      },
    ],
    donts: [
      {
        title: "search",
        dont: {
          html: emptyCard("Nothing matched", "You searched for the wrong thing. Check your spelling and try again."),
          caption: "Blaming the searcher for an empty result set makes a normal outcome feel like a mistake.",
        },
        do: {
          html: emptyCard("No results found", "Try adjusting your search filters."),
          caption: "State the result neutrally and point at the lever the user can pull (filters, query).",
        },
      },
      {
        title: "users",
        dont: {
          html: emptyCard("No users", "There are no team members in this workspace."),
          caption: "A dead-end that only restates the emptiness leaves the user with nowhere to go.",
        },
        do: {
          html: emptyCard("No users", "Invite your first team member.", `<div class="mt-4">${btn("default", "Invite member", "sm")}</div>`),
          caption: "When the user can fix it, give them the one action that does (Invite, Create).",
        },
      },
      {
        title: "files",
        dont: {
          html: emptyCard("Nothing here", "This folder is empty."),
          caption: "Generic 'nothing here' copy never tells the user how files would get into the folder.",
        },
        do: {
          html: emptyCard("No files", "Upload or drag files here."),
          caption: "Name the gesture that fills the empty space so the next step is obvious.",
        },
      },
      {
        title: "activity",
        dont: {
          html: `<div class="${emptyCardCls}"><div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-destructive"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div><div class="text-[15px] font-semibold">No activity</div><p class="mt-1 text-sm text-muted-foreground">Events will appear as they happen.</p></div>`,
          caption: "An alarming red icon turns a calm, expected empty feed into a false error.",
        },
        do: {
          html: emptyCard("No activity", "Events will appear as they happen."),
          caption: "Keep a routinely-empty state calm: muted icon, reassuring copy, no urgency.",
        },
      },
      {
        title: "notifications",
        dont: {
          html: emptyCard("Nothing to see", "You have no notifications. Sorry, it's quiet in here."),
          caption: "Apologetic, sad-toned copy frames an inbox-zero win as a letdown.",
        },
        do: {
          html: emptyCard("All caught up", "No new notifications."),
          caption: "Celebrate a cleared queue: 'All caught up' reads as success, not absence.",
        },
      },
      {
        title: "errors",
        dont: {
          html: `<div class="${emptyCardCls}"><div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div><div class="text-[15px] font-semibold">No errors</div><p class="mt-1 text-sm text-muted-foreground">Nothing was found.</p></div>`,
          caption: "A grey 'nothing found' disc reads as a failed query, not as a healthy, error-free system.",
        },
        do: {
          html: `<div class="${emptyCardCls}"><div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></div><div class="text-[15px] font-semibold">No errors</div><p class="mt-1 text-sm text-muted-foreground">Everything is running smoothly.</p></div>`,
          caption: "Signal the good news with a green check: zero errors is a passing state, not an empty one.",
        },
      },
      {
        title: "all-clear",
        dont: {
          html: `<div class="${emptyCardCls}"><div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></div><div class="text-[15px] font-semibold">No pending reviews</div><p class="mt-1 text-sm text-muted-foreground">3 accounts are locked and waiting on you.</p></div>`,
          caption: "A green all-clear over copy that admits work is pending hides the action the user must take.",
        },
        do: {
          html: `<div class="${emptyCardCls}"><div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></div><div class="text-[15px] font-semibold">All clear</div><p class="mt-1 text-sm text-muted-foreground">No locked accounts or pending reviews.</p></div>`,
          caption: "Reserve the green all-clear for genuinely empty queues: nothing locked, nothing waiting.",
        },
      },
    ]
  },

  {
    slug: "field",
    name: "Field Display",
    description: "Read-only key/value pairs. Used in detail views, modal previews, and audit screens. Optional mono mode for IDs, tokens, dates.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "mode", label: "Value mode", options: ["basic", "mono", "composed"], cols: 3 },
        { type: "text", key: "label", label: "First label", disabledWhen: (s) => s.mode !== "basic" },
      ],
      defaults: { mode: "basic", label: "User ID" },
      render: (s) => {
        if (s.mode === "mono") {
          return `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl("Client ID", `<span class="font-mono">clt_8f2a9b4c7e1d</span>`)}
  ${fieldRowEl("Created", `<span class="font-mono">2026-05-24T14:32:00Z</span>`)}
  ${fieldRowEl("Fingerprint", `<span class="font-mono">sha256:xK9v...</span>`)}
</div>`;
        }
        if (s.mode === "composed") {
          return `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl("Status", statusBadge("success", "Active"))}
  ${fieldRowEl("Plan", badge("secondary", "Pro"))}
  ${fieldRowEl("Token", `<span class="flex items-center gap-2"><span class="font-mono">sk_live_a8f2...c9e1</span><button class="${btnBase} ${btnVariant.ghost} h-6 px-2 text-[11px]" onclick="var b=this;navigator.clipboard.writeText('sk_live_a8f2c9e1');var o=b.textContent;b.textContent='Copied!';setTimeout(function(){b.textContent=o},1500)">Copy</button></span>`)}
  ${fieldRowEl("Members", `<span class="flex gap-1"><span class="${avatarBase} h-6 w-6"><img src="/rachel-chen.jpg" alt="RC" class="h-full w-full object-cover"></span><span class="${avatarBase} h-6 w-6 text-[10px]">AJ</span><span class="${avatarBase} h-6 w-6 text-[10px]">+3</span></span>`)}
</div>`;
        }
        const first = (s.label as string) || "User ID";
        return `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl(first, `<span class="font-mono">usr_abc123</span>`)}
  ${fieldRowEl("Name", "Rachel Chen")}
  ${fieldRowEl("Role", "Admin")}
  ${fieldRowEl("Status", statusBadge("success", "Active"))}
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Basic",
        dont: {
          html: `<div class="flex max-w-[400px] flex-col gap-1">
  <div class="text-sm"><span class="font-semibold">Name:</span> Rachel Chen</div>
  <div class="text-sm"><span class="font-semibold">Role:</span> Admin</div>
</div>`,
          caption: "Inline label-colon-value with no shared column makes values ragged and impossible to scan down a list.",
        },
        do: {
          html: `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl("Name", "Rachel Chen")}
  ${fieldRowEl("Role", "Admin")}
</div>`,
          caption: "Use the fixed 180px label column so every value aligns to one baseline.",
        },
      },
      {
        title: "Mono",
        dont: {
          html: `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl("Client ID", "clt_8f2a9b4c7e1d")}
  ${fieldRowEl("Fingerprint", "sha256:xK9v...")}
</div>`,
          caption: "Rendering IDs and hashes in proportional type makes look-alike characters (l/1, O/0) hard to compare.",
        },
        do: {
          html: `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl("Client ID", `<span class="font-mono">clt_8f2a9b4c7e1d</span>`)}
  ${fieldRowEl("Fingerprint", `<span class="font-mono">sha256:xK9v...</span>`)}
</div>`,
          caption: "Wrap IDs, hashes, and timestamps in font-mono so every glyph is fixed-width and copy-able.",
        },
      },
      {
        title: "Composed",
        dont: {
          html: `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl("Status", "Active")}
  ${fieldRowEl("Plan", "Pro")}
</div>`,
          caption: "Flattening a live status or plan tier to plain text drops the color and shape that signal state at a glance.",
        },
        do: {
          html: `<div class="flex max-w-[400px] flex-col gap-3">
  ${fieldRowEl("Status", statusBadge("success", "Active"))}
  ${fieldRowEl("Plan", badge("secondary", "Pro"))}
</div>`,
          caption: "Compose real nodes into the value slot: a status badge for state, a badge for the plan tier.",
        },
      }
    ]
  },

  {
    slug: "form",
    name: "Form Layouts",
    description: "Stacked, two-column, with sidebar description.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "layout", label: "Layout", options: ["stacked", "two-column", "sidebar"], cols: 3 },
      ],
      defaults: { layout: "stacked" },
      render: (s) => {
        if (s.layout === "two-column") {
          return `<div data-form class="max-w-[560px]">
  <div class="grid grid-cols-2 gap-3">
    <div class="mb-4"><label class="${labelCls}">First name</label><input class="${inputBase}" placeholder="Ada" /></div>
    <div class="mb-4"><label class="${labelCls}">Last name</label><input class="${inputBase}" placeholder="King" /></div>
  </div>
  <div class="mb-4"><label class="${labelCls}">Email</label><input class="${inputBase}" placeholder="ada@example.com" /></div>
  <div class="mt-4 flex justify-end gap-2">${btn("outline", "Cancel", "sm", ` onclick="var c=this.closest('[data-form]');c.style.opacity='0.5';setTimeout(function(){c.style.opacity='1'},800)"`)}${btn("default", "Create", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Creating…';setTimeout(function(){b.textContent='Created!';setTimeout(function(){b.textContent=o;b.disabled=false},1200)},800)"`)}</div>
</div>`;
        }
        if (s.layout === "sidebar") {
          return `<div class="max-w-[720px]">
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
</div>`;
        }
        return `<div data-form class="max-w-[360px]">
  <div class="mb-4"><label class="${labelCls}">Email</label><input class="${inputBase}" type="email" placeholder="you@example.com" /></div>
  <div class="mb-4"><label class="${labelCls}">Password</label><input class="${inputBase}" type="password" /></div>
  <div class="mt-4"><button class="${btnBase} ${btnVariant.default} ${btnSize.default} w-full" onclick="var form=this.closest('[data-form]');var email=form.querySelector('input[type=email]');var err=form.querySelector('[data-error]');if(err)err.remove();if(!email.value){email.classList.add('ring-2','ring-destructive');var e=document.createElement('div');e.dataset.error='';e.className='mt-1 text-xs text-destructive';e.textContent='Email is required';email.parentElement.appendChild(e);setTimeout(function(){email.classList.remove('ring-2','ring-destructive');if(e.parentElement)e.remove()},2500);return}var b=this;b.disabled=true;b.textContent='Signing in…';setTimeout(function(){b.textContent='Sign in';b.disabled=false},2000)">Sign in</button></div>
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Stacked",
        dont: {
          html: `<div class="grid max-w-[360px] grid-cols-2 gap-3">
  <div><label class="${labelCls}">Email</label><input class="${inputBase}" type="email" placeholder="you@example.com" /></div>
  <div><label class="${labelCls}">Password</label><input class="${inputBase}" type="password" /></div>
</div>`,
          caption: "Pairing an email and password side by side cramps a sign-in form and breaks the natural top-to-bottom reading order.",
        },
        do: {
          html: `<div class="max-w-[360px]">
  <div class="mb-4"><label class="${labelCls}">Email</label><input class="${inputBase}" type="email" placeholder="you@example.com" /></div>
  <div><label class="${labelCls}">Password</label><input class="${inputBase}" type="password" /></div>
</div>`,
          caption: "Keep short forms one field per row so each label sits directly above its input and the eye flows straight down.",
        },
      },
      {
        title: "Two-column",
        dont: {
          html: `<div class="grid max-w-[560px] grid-cols-2 gap-3">
  <div><label class="${labelCls}">Street address</label><input class="${inputBase}" placeholder="123 Market St" /></div>
  <div><label class="${labelCls}">ZIP</label><input class="${inputBase}" placeholder="94103" /></div>
</div>`,
          caption: "Putting a wide field next to a tiny one in the same two-column row leaves the short input awkwardly oversized.",
        },
        do: {
          html: `<div class="max-w-[560px]">
  <div class="mb-3"><label class="${labelCls}">Street address</label><input class="${inputBase}" placeholder="123 Market St" /></div>
  <div class="grid grid-cols-2 gap-3">
    <div><label class="${labelCls}">City</label><input class="${inputBase}" placeholder="San Francisco" /></div>
    <div><label class="${labelCls}">ZIP</label><input class="${inputBase}" placeholder="94103" /></div>
  </div>
</div>`,
          caption: "Pair fields of similar width (city / ZIP) in a row and give a full-width field like the street its own line.",
        },
      },
      {
        title: "Sidebar",
        dont: {
          html: `<div class="max-w-[720px]">
  <div class="grid grid-cols-[200px_1fr] gap-8 border-b border-border pb-6">
    <div><div class="text-sm font-semibold">Personal info</div></div>
    <div><label class="${labelCls}">Full name</label><input class="${inputBase}" value="Rachel Chen" /></div>
  </div>
  <div class="grid grid-cols-[200px_1fr] gap-8 pt-6">
    <div><div class="text-sm font-semibold">Billing</div></div>
    <div><label class="${labelCls}">Card number</label><input class="${inputBase}" value="•••• 4242" /></div>
  </div>
</div>`,
          caption: "A bare section heading with no helper text wastes the sidebar column and gives the user no context for the group.",
        },
        do: {
          html: `<div class="max-w-[720px]">
  <div class="grid grid-cols-[200px_1fr] gap-8 border-b border-border pb-6">
    <div>
      <div class="text-sm font-semibold">Personal info</div>
      <p class="mt-1 text-xs text-muted-foreground">Displayed on your public profile.</p>
    </div>
    <div><label class="${labelCls}">Full name</label><input class="${inputBase}" value="Rachel Chen" /></div>
  </div>
  <div class="grid grid-cols-[200px_1fr] gap-8 pt-6">
    <div>
      <div class="text-sm font-semibold">Billing</div>
      <p class="mt-1 text-xs text-muted-foreground">Used for invoices and receipts.</p>
    </div>
    <div><label class="${labelCls}">Card number</label><input class="${inputBase}" value="•••• 4242" /></div>
  </div>
</div>`,
          caption: "Pair each sidebar heading with a line of helper text so the left column explains what the section's fields are for.",
        },
      },
    ]
  },

  {
    slug: "filter-panel",
    name: "Filter Panels",
    description: "Sidebar filter rail with chip pills for active filters.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "mode", label: "Mode", options: ["sidebar", "inline"], cols: 2 },
      ],
      defaults: { mode: "sidebar" },
      render: (s) => {
        if (s.mode === "inline") {
          return `<div class="flex flex-wrap items-center gap-2" onclick="var b=event.target.closest('button');if(!b)return;if(b.dataset.add!==undefined){var o=b.textContent;b.disabled=true;b.textContent='Added!';setTimeout(function(){b.textContent=o;b.disabled=false},1500);return}if(b.dataset.on==='1'){b.dataset.on='0';b.className='${fbtnOutline}'}else{b.dataset.on='1';b.className='${fbtnActive}'}">
  <button data-on="0" class="${fbtnOutline}">Status <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
  <button data-on="0" class="${fbtnOutline}">Role <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
  <button data-on="0" class="${fbtnOutline}">Date range <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
  <button data-add class="${btnBase} ${btnVariant.ghost} ${btnSize.sm} text-primary">+ Add filter</button>
</div>`;
        }
        return `<div data-fp class="grid grid-cols-[200px_1fr] gap-6" onclick="var chip=event.target.closest('[data-filter]');if(!chip)return;var n=chip.dataset.filter;this.querySelectorAll('input[type=checkbox]').forEach(function(c){if(c.parentElement.textContent.trim()===n)c.click()})">
  <div class="space-y-5 rounded-lg border border-border p-4" onchange="var wrap=this.closest('[data-fp]');var chips=wrap.querySelector('[data-chips]');while(chips.firstChild)chips.removeChild(chips.firstChild);this.querySelectorAll('input[type=checkbox]:checked').forEach(function(cb){var name=cb.parentElement.textContent.trim();var s=document.createElement('span');s.className='${filterChipCls}';s.dataset.filter=name;s.textContent=name+' ×';chips.appendChild(s)});var count=chips.children.length;wrap.querySelector('[data-count]').textContent='Showing '+(count*12)+' of 142 identities'">
    <div class="space-y-2">
      <span class="${filterGroupLabel}">Status</span>
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary" checked /> Active</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary" /> Pending</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary" /> Archived</label>
      </div>
    </div>
    <div class="space-y-2">
      <span class="${filterGroupLabel}">Schema</span>
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary" checked /> Default</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary" /> Custom</label>
      </div>
    </div>
    <div class="space-y-2">
      <span class="${filterGroupLabel}">MFA</span>
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary" /> Enabled</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="size-4 accent-primary" /> Disabled</label>
      </div>
    </div>
  </div>
  <div>
    <div data-chips class="mb-4 flex flex-wrap gap-2">
      <span class="${filterChipCls}" data-filter="Active">Active ×</span>
      <span class="${filterChipCls}" data-filter="Default">Default ×</span>
    </div>
    <div data-count class="text-sm text-muted-foreground">Showing 24 of 142 identities</div>
  </div>
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Sidebar",
        dont: {
          html: `<div class="flex flex-wrap gap-2"><span class="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">Active</span><span class="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">Default</span></div>`,
          caption: "Active-filter chips with no remove affordance leave no way to clear one filter without hunting back through the sidebar.",
        },
        do: {
          html: `<div class="flex flex-wrap gap-2"><span class="${filterChipCls}" data-filter="Active">Active ×</span><span class="${filterChipCls}" data-filter="Default">Default ×</span></div>`,
          caption: "Give each chip a × so a single filter can be removed in place, and keep it in sync with the sidebar checkbox.",
        },
      },
      {
        title: "Inline",
        dont: {
          html: `<div class="flex flex-wrap items-center gap-2">${["Status", "Role", "Schema", "MFA", "Region", "Created", "Last seen", "Team"].map((l) => `<button class="${fbtnOutline}">${l} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>`).join("")}</div>`,
          caption: "Eight inline dropdowns wrap into a wall of buttons, which defeats the compact bar; that volume of filtering belongs in the sidebar rail.",
        },
        do: {
          html: `<div class="flex flex-wrap items-center gap-2"><button class="${fbtnActive}">Status <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button><button class="${fbtnOutline}">Role <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button><button class="${btnBase} ${btnVariant.ghost} ${btnSize.sm} text-primary">+ Add filter</button></div>`,
          caption: "Surface two or three primary filters and tuck the rest behind \"+ Add filter\" so the bar stays one scannable row.",
        },
      },
    ]
  },

  {
    slug: "calendar",
    name: "Calendars",
    description: "Date picker, event list. Production: wrap react-day-picker.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["single", "events"], cols: 2 },
      ],
      defaults: { variant: "single" },
      render: (s) => {
        if (s.variant === "events") {
          return `<div data-cal class="grid grid-cols-[auto_1fr] items-start gap-6">
  ${calendarBlock(` onclick="var t=event.target.closest('[data-cell]');if(!t||t.dataset.cell==='out')return;this.querySelectorAll('[data-cell]').forEach(function(c){var v=c.dataset.cell;c.className='${calCellBase}'+(v==='out'?' ${calCellOut}':v==='today'?' ${calToday}':'')});t.className='${calCellBase} ${calSelected}';var d=t.textContent;var wrap=this.closest('[data-cal]');wrap.querySelector('[data-day]').textContent='May '+d;var ev={'1':'Sprint kickoff|10:00 AM','8':'Retrospective|3:00 PM','15':'All-hands|11:00 AM','22':'Demo day|2:00 PM','23':'Team lunch|12:00 PM~Code review|4:00 PM','24':'Sprint planning|9:00 AM~Design review|11:30 AM~1:1 with manager|2:00 PM','25':'Standup|9:30 AM','26':'Deploy window|6:00 PM'};var items=(ev[d]||'No events').split('~');var bd=wrap.querySelector('[data-events]');bd.innerHTML=items[0]==='No events'?'<div class=\\'px-4 py-3 text-sm text-muted-foreground\\'>No events scheduled.</div>':items.map(function(e,i){var p=e.split('|');return '<div class=\\'flex justify-between px-4 py-2.5 text-sm'+(i<items.length-1?' border-b border-border':'')+'\\'><span class=\\'font-medium\\'>'+p[0]+'</span><span class=\\'text-muted-foreground\\'>'+p[1]+'</span></div>'}).join('')"`)}
  <div class="${cardCls}">
    <div data-day class="border-b border-border px-5 py-3 text-sm font-semibold">May 24</div>
    <div data-events>
      <div class="flex justify-between border-b border-border px-4 py-2.5 text-sm"><span class="font-medium">Sprint planning</span><span class="text-muted-foreground">9:00 AM</span></div>
      <div class="flex justify-between border-b border-border px-4 py-2.5 text-sm"><span class="font-medium">Design review</span><span class="text-muted-foreground">11:30 AM</span></div>
      <div class="flex justify-between px-4 py-2.5 text-sm"><span class="font-medium">1:1 with manager</span><span class="text-muted-foreground">2:00 PM</span></div>
    </div>
  </div>
</div>`;
        }
        return calendarBlock(` onclick="var t=event.target.closest('[data-cell]');if(!t||t.dataset.cell==='out')return;this.querySelectorAll('[data-cell]').forEach(function(c){var v=c.dataset.cell;c.className='${calCellBase}'+(v==='out'?' ${calCellOut}':v==='today'?' ${calToday}':'')});t.className='${calCellBase} ${calSelected}'"`);
      },
    },
    sections: [
      {
        title: "Production note",
        description: "In production, wrap <code>react-day-picker</code> (or your framework's equivalent) with Canvas token overrides. The examples on this page use a static HTML mock for illustration.",
        anatomy: "Token-themed month grid. Selected day has primary background; today gets accent. Calendars need locale-aware date math, keyboard navigation, range selection, and accessibility, so back them with a real date library and apply Canvas tokens for colors, radius, and typography.",
        examples: [],
      },
    ],
    donts: [
      {
        title: "Single date",
        dont: {
          html: `<div class="w-fit rounded-lg border border-border p-3"><div class="grid grid-cols-7 gap-0.5"><button class="${calCellBase} ${calSelected}">8</button><button class="${calCellBase} ${calSelected}">14</button><button class="${calCellBase} ${calSelected}">23</button></div></div>`,
          caption: "Painting several days with the primary selected style makes a single-date picker look like a multi-select.",
        },
        do: {
          html: `<div class="w-fit rounded-lg border border-border p-3"><div class="grid grid-cols-7 gap-0.5"><button class="${calCellBase}">8</button><button class="${calCellBase} ${calToday}">23</button><button class="${calCellBase} ${calSelected}">24</button></div></div>`,
          caption: "Exactly one selected day (primary), with today marked separately in the accent tone.",
        },
      },
      {
        title: "With event list",
        dont: {
          html: `<div class="grid grid-cols-[auto_1fr] items-start gap-6"><div class="w-fit rounded-lg border border-border p-3"><div class="grid grid-cols-7 gap-0.5"><button class="${calCellBase} ${calSelected}">24</button></div></div><div class="${cardCls}"><div class="px-4 py-3 text-sm text-muted-foreground">Pick a date to see events.</div></div></div>`,
          caption: "Selecting May 24 but leaving the panel on a placeholder breaks the link between the grid and its day.",
        },
        do: {
          html: `<div class="grid grid-cols-[auto_1fr] items-start gap-6"><div class="w-fit rounded-lg border border-border p-3"><div class="grid grid-cols-7 gap-0.5"><button class="${calCellBase} ${calSelected}">24</button></div></div><div class="${cardCls}"><div class="border-b border-border px-5 py-3 text-sm font-semibold">May 24</div><div class="flex justify-between px-4 py-2.5 text-sm"><span class="font-medium">Sprint planning</span><span class="text-muted-foreground">9:00 AM</span></div></div></div>`,
          caption: "Keep the panel header and rows in sync with the selected day so the two views always agree.",
        },
      },
    ]
  },

  {
    slug: "command",
    name: "Command Palette",
    description: "Cmd+K search: navigation, actions, recent items.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "mode", label: "Mode", options: ["trigger", "inline"], cols: 2 },
        { type: "check", key: "shortcuts", label: "Per-item key hints" },
        { type: "check", key: "footer", label: "Footer with key hints" },
      ],
      defaults: { mode: "trigger", shortcuts: true, footer: false },
      render: (s) => {
        const sc = s.shortcuts === true;
        const footer = s.footer
          ? `<div class="flex items-center gap-3 border-t border-border px-4 py-2.5 text-xs text-muted-foreground"><span class="flex items-center gap-1">${kbdEl("&#8593;")}${kbdEl("&#8595;")} to navigate</span><span class="flex items-center gap-1">${kbdEl("&#8629;")} to select</span><span class="flex items-center gap-1">${kbdEl("esc")} to close</span></div>`
          : "";
        const list = `<div class="${cmdList}" onclick="var t=event.target.closest('.command-item');if(!t)return;this.querySelectorAll('.command-item').forEach(function(i){i.classList.remove('bg-accent','text-accent-foreground')});t.classList.add('bg-accent','text-accent-foreground')">
      <div class="command-group">
        <div class="${cmdGroupLabel}">Actions</div>
        ${cmdItemEl("New File", sc ? "Ctrl+N" : "", true)}
        ${cmdItemEl("Open File", sc ? "Ctrl+O" : "")}
        ${cmdItemEl("Save", sc ? "Ctrl+S" : "")}
      </div>
      <div class="${cmdSep}"></div>
      <div class="command-group">
        <div class="${cmdGroupLabel}">Navigation</div>
        ${cmdItemEl("Go to Dashboard")}
        ${cmdItemEl("Go to Settings")}
      </div>
    </div>`;
        const palette = `<input class="${cmdInput}" placeholder="Type a command..." oninput="var v=this.value.toLowerCase();var items=this.parentElement.querySelectorAll('.command-item');var first=true;items.forEach(function(i){var txt=i.textContent.toLowerCase();var show=txt.includes(v);i.style.display=show?'':'none';i.classList.remove('bg-accent','text-accent-foreground');if(show&&first){i.classList.add('bg-accent','text-accent-foreground');first=false}});this.parentElement.querySelectorAll('.command-group').forEach(function(g){var vis=g.querySelectorAll('.command-item:not([style*=none])');g.style.display=vis.length?'':'none'});this.parentElement.querySelectorAll('.command-sep').forEach(function(s){s.style.display=v?'none':''})">
    ${list}
    ${footer}`;
        if (s.mode === "inline") {
          return `<div class="${cmdDialog} w-[480px] max-w-full">
  ${palette}
</div>`;
        }
        return `<div class="w-[480px] max-w-full">
  <button class="${btnBase} ${btnVariant.outline} ${btnSize.sm} w-full justify-start" onclick="var d=this.nextElementSibling;if(d.classList.contains('hidden')){d.classList.remove('hidden');d.querySelector('input').focus();var close=function(e){if(!d.contains(e.target)&&e.target!==this){d.classList.add('hidden');document.removeEventListener('click',close)}}.bind(this);setTimeout(function(){document.addEventListener('click',close)},0)}else{d.classList.add('hidden')}">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    Search...
    <kbd class="${kbdCls} ml-auto">&#8984;K</kbd>
  </button>
  <div class="${cmdDialog} mt-3 hidden">
    ${palette}
  </div>
</div>`;
      },
    },
    sections: [
      {
        title: "Anatomy",
        anatomy: "Centered overlay . 480px wide . search input + grouped results (label + items, separated) + optional footer with key hints. Typing filters items live, highlights the first match, and hides empty groups.",
        examples: [],
      },
    ],
    donts: [
      {
        title: "Trigger",
        dont: {
          html: `<button class="${btnBase} ${btnVariant.outline} ${btnSize.sm}">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  Search...
</button>`,
          caption: "A bare search button hides the keyboard shortcut, so power users never learn the &#8984;K entry point.",
        },
        do: {
          html: `<button class="${btnBase} ${btnVariant.outline} ${btnSize.sm} w-full justify-start">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  Search...
  <kbd class="${kbdCls} ml-auto">&#8984;K</kbd>
</button>`,
          caption: "Surface the shortcut in a trailing kbd so the trigger advertises the faster keyboard path.",
        },
      },
      {
        title: "Inline",
        dont: {
          html: `<div class="${cmdDialog} w-[320px] max-w-full">
  <input class="${cmdInput}" placeholder="Type a command...">
  <div class="${cmdList}">
    ${cmdItemEl("New File", "Ctrl+N")}
    ${cmdItemEl("Save", "Ctrl+S")}
    ${cmdItemEl("Go to Dashboard")}
    ${cmdItemEl("Go to Settings")}
  </div>
</div>`,
          caption: "Dumping every command into one flat list with no labels makes the palette hard to scan.",
        },
        do: {
          html: `<div class="${cmdDialog} w-[320px] max-w-full">
  <input class="${cmdInput}" placeholder="Type a command...">
  <div class="${cmdList}">
    <div class="${cmdGroupLabel}">Actions</div>
    ${cmdItemEl("New File", "Ctrl+N", true)}
    ${cmdItemEl("Save", "Ctrl+S")}
    <div class="${cmdSep}"></div>
    <div class="${cmdGroupLabel}">Navigation</div>
    ${cmdItemEl("Go to Dashboard")}
    ${cmdItemEl("Go to Settings")}
  </div>
</div>`,
          caption: "Group commands under labels with separators and highlight the first match so results stay scannable.",
        },
      },
    ]
  },

  {
    slug: "data-table",
    name: "Data Tables",
    description: "Every table is the same composition: bordered wrap &rarr; toolbar &rarr; scrollable table &rarr; footer. Density tweaks affect padding live.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["default", "bulk", "filter", "empty", "loading"], cols: 3 },
        { type: "pills", key: "density", label: "Density", options: ["compact", "regular", "comfy"], cols: 3, disabledWhen: (s) => s.variant === "empty" || s.variant === "loading" },
        { type: "check", key: "sortable", label: "Sortable header", disabledWhen: (s) => s.variant === "empty" || s.variant === "loading" },
        { type: "check", key: "clickable", label: "Clickable rows", disabledWhen: (s) => s.variant === "empty" || s.variant === "loading" },
      ],
      defaults: { variant: "default", density: "regular", sortable: true, clickable: true },
      render: (s) => {
        const variant = s.variant as string;
        // Density tunes the th/td padding and font size live (compact 8px/12.5px,
        // regular 12px/13px, comfy 16px/13.5px), matching the documented modes.
        const pad: Record<string, string> = { compact: "px-2 py-1.5 text-[12.5px]", regular: "px-3 py-2.5 text-[13px]", comfy: "px-4 py-3 text-[13.5px]" };
        const d = (pad[s.density as string] || pad.regular);
        const th = `border-b border-border bg-muted/40 ${d} text-left text-xs font-medium uppercase tracking-wide text-muted-foreground`;
        const thSort = `${th} cursor-pointer select-none hover:text-foreground`;
        const td = `border-b border-border ${d}`;
        // Empty and loading states drop the toolbar/footer and fill the body.
        if (variant === "empty") {
          return `<div class="${dtWrap}"><div class="overflow-x-auto"><table class="${dtTable}"><thead><tr><th class="${dtTh}">Name</th><th class="${dtTh}">Email</th><th class="${dtTh}">Status</th></tr></thead><tbody><tr><td colspan="3" class="px-4 py-8 text-center text-sm text-muted-foreground">No results found.</td></tr></tbody></table></div></div>`;
        }
        if (variant === "loading") {
          return `<div class="${dtWrap}"><div class="overflow-x-auto"><table class="${dtTable}"><thead><tr><th class="${dtTh}">Name</th><th class="${dtTh}">Email</th><th class="${dtTh}">Status</th></tr></thead><tbody><tr><td colspan="3" class="px-4 py-8 text-center">${spinnerEl("inline-block h-4 w-4")}</td></tr></tbody></table></div></div>`;
        }
        // Toolbar swaps per variant; the table body below is shared so density
        // and the sortable/clickable toggles apply uniformly.
        let toolbar: string;
        if (variant === "bulk") {
          toolbar = `<div class="${dtToolbar}">
    <input class="${inputBase} max-w-[200px]" placeholder="Filter users..." />
    <div class="flex-1"></div>
    <span class="text-xs text-muted-foreground">3 selected</span>
    ${btn("outline", "Bulk edit", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Editing…';setTimeout(function(){b.textContent=o;b.disabled=false},2000)"`)}
    ${btn("destructive", "Delete", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Deleting…';setTimeout(function(){b.textContent='Deleted!';setTimeout(function(){b.textContent=o;b.disabled=false},1000)},800)"`)}
  </div>`;
        } else if (variant === "filter") {
          toolbar = `<div class="${dtToolbar}">
    <div class="flex items-center gap-2">
      <span class="text-xs text-muted-foreground">Status:</span>
      <select class="${inputBase.replace("h-9", "h-8")} w-[120px] text-xs"><option>All</option><option>Active</option></select>
    </div>
    <div class="flex-1"></div>
    <span class="text-xs text-muted-foreground">142 results</span>
  </div>`;
        } else {
          toolbar = `<div class="${dtToolbar}">
    <input class="${inputBase} max-w-[240px]" placeholder="Search users..." oninput="var v=this.value.toLowerCase();var rows=this.closest('.dt-wrap').querySelectorAll('tbody tr');var count=0;rows.forEach(function(r){var txt=r.textContent.toLowerCase();var show=txt.includes(v);r.style.display=show?'':'none';if(show)count++});this.closest('.dt-wrap').querySelector('.dt-footer span').innerHTML='Showing 1&ndash;'+count+' of '+count" />
    <div class="flex-1"></div>
    ${btn("outline", "Export", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Exporting…';setTimeout(function(){b.textContent='Exported!';setTimeout(function(){b.textContent=o;b.disabled=false},1000)},800)"`)}
  </div>`;
        }
        const nameTh = s.sortable
          ? `<th class="${thSort} sortable sorted">Name <span class="dt-sort-icon ml-1 text-[10px]">&#9650;</span></th><th class="${thSort} sortable">Email</th>`
          : `<th class="${th}">Name</th><th class="${th}">Email</th>`;
        const headRow = s.sortable
          ? `<tr onclick="var th=event.target.closest('.sortable');if(!th)return;var ths=this.querySelectorAll('.sortable');ths.forEach(function(h){if(h!==th){h.classList.remove('sorted');var ic=h.querySelector('.dt-sort-icon');if(ic)ic.remove()}});th.classList.add('sorted');var ico=th.querySelector('.dt-sort-icon');if(ico){var up=ico.innerHTML==='▲';ico.innerHTML=up?'▼':'▲'}else{var sp=document.createElement('span');sp.className='dt-sort-icon ml-1 text-[10px]';sp.innerHTML='▲';th.appendChild(sp)}">${nameTh}<th class="${th}">Role</th><th class="${th}">Status</th></tr>`
          : `<tr>${nameTh}<th class="${th}">Role</th><th class="${th}">Status</th></tr>`;
        const rowCls = s.clickable ? dtRow : "";
        const bodyClick = s.clickable ? ` onclick="var tr=event.target.closest('tr');if(!tr)return;tr.classList.toggle('bg-accent')"` : "";
        const row = (name: string, email: string, role: string, tone: string, status: string) =>
          `<tr class="${rowCls}"><td class="${td}">${name}</td><td class="${td}">${email}</td><td class="${td}">${role}</td><td class="${td}">${statusBadge(tone, status)}</td></tr>`;
        return `<div class="${dtWrap}">
  ${toolbar}
  <div class="overflow-x-auto">
    <table class="${dtTable}">
      <thead>${headRow}</thead>
      <tbody${bodyClick}>
        ${row("Alice Johnson", "alice@example.com", "Admin", "success", "Active")}
        ${row("Bob Smith", "bob@example.com", "Editor", "neutral", "Inactive")}
        ${row("Rachel Chen", "rachel@example.com", "Admin", "success", "Active")}
      </tbody>
    </table>
  </div>
  <div class="${dtFooter}">
    <span>Showing 1&ndash;3 of 142</span>
    <div class="flex gap-1">
      ${btn("outline", "&laquo;", "sm", " disabled")}
      ${btn("outline", "&raquo;", "sm")}
    </div>
  </div>
</div>`;
      },
    },
    sections: [
      {
        title: "Anatomy",
        anatomy: "Toolbar (filters + bulk actions + count) . Header row (12px muted labels on tinted background) . Body rows (13px, clickable optional, hover background) . Footer (count + pagination). Density modes retune th/td/toolbar padding and font size live: compact 8px/12.5px, regular 12px/13px, comfy 16px/13.5px.",
        examples: [],
      },
    ],
    donts: [
      {
        title: "default",
        dont: {
          html: `<div class="${dtWrap} max-w-[520px]"><div class="${dtToolbar}"><input class="${inputBase} max-w-[240px]" placeholder="Search users..." /><div class="flex-1"></div>${btn("outline", "Export", "sm")}</div><div class="overflow-x-auto"><table class="${dtTable}"><thead><tr><th class="${dtTh}">Name</th><th class="${dtTh}">Email</th></tr></thead><tbody><tr class="${dtRow}"><td class="${dtTd}">Alice Johnson</td><td class="${dtTd}">alice@example.com</td></tr></tbody></table></div></div>`,
          caption: "Wiring search but dropping the footer leaves the user with no result count or way to page through 142 rows.",
        },
        do: {
          html: `<div class="${dtWrap} max-w-[520px]"><div class="${dtToolbar}"><input class="${inputBase} max-w-[240px]" placeholder="Search users..." /><div class="flex-1"></div>${btn("outline", "Export", "sm")}</div><div class="overflow-x-auto"><table class="${dtTable}"><thead><tr><th class="${dtTh}">Name</th><th class="${dtTh}">Email</th></tr></thead><tbody><tr class="${dtRow}"><td class="${dtTd}">Alice Johnson</td><td class="${dtTd}">alice@example.com</td></tr></tbody></table></div><div class="${dtFooter}"><span>Showing 1&ndash;3 of 142</span><div class="flex gap-1">${btn("outline", "&laquo;", "sm", " disabled")}${btn("outline", "&raquo;", "sm")}</div></div></div>`,
          caption: "Keep the count + pagination footer so the search result is always anchored to the total.",
        },
      },
      {
        title: "bulk",
        dont: {
          html: `<div class="${dtToolbar} rounded-lg border max-w-[520px]"><span class="text-xs text-muted-foreground">3 selected</span><div class="flex-1"></div>${btn("destructive", "Delete", "sm")}</div>`,
          caption: "Surfacing only the destructive Delete on a selection invites accidental data loss with no safer path.",
        },
        do: {
          html: `<div class="${dtToolbar} rounded-lg border max-w-[520px]"><span class="text-xs text-muted-foreground">3 selected</span><div class="flex-1"></div>${btn("outline", "Bulk edit", "sm")}${btn("destructive", "Delete", "sm")}</div>`,
          caption: "Lead with the non-destructive bulk action and keep Delete visually distinct on the right.",
        },
      },
      {
        title: "filter",
        dont: {
          html: `<div class="${dtToolbar} rounded-lg border max-w-[520px]"><div class="flex items-center gap-2"><span class="text-xs text-muted-foreground">Status:</span><select class="${inputBase.replace("h-9", "h-8")} w-[120px] text-xs"><option>All</option></select></div></div>`,
          caption: "A filter control with no result count leaves the user guessing whether the filter narrowed anything.",
        },
        do: {
          html: `<div class="${dtToolbar} rounded-lg border max-w-[520px]"><div class="flex items-center gap-2"><span class="text-xs text-muted-foreground">Status:</span><select class="${inputBase.replace("h-9", "h-8")} w-[120px] text-xs"><option>All</option></select></div><div class="flex-1"></div><span class="text-xs text-muted-foreground">142 results</span></div>`,
          caption: "Echo the live result count next to the filter so its effect is visible.",
        },
      },
      {
        title: "empty",
        dont: {
          html: `<div class="${dtWrap} max-w-[520px]"><div class="overflow-x-auto"><table class="${dtTable}"><thead><tr><th class="${dtTh}">Name</th><th class="${dtTh}">Email</th><th class="${dtTh}">Status</th></tr></thead><tbody></tbody></table></div></div>`,
          caption: "Hiding the body entirely on no results collapses the table and looks broken.",
        },
        do: {
          html: `<div class="${dtWrap} max-w-[520px]"><div class="overflow-x-auto"><table class="${dtTable}"><thead><tr><th class="${dtTh}">Name</th><th class="${dtTh}">Email</th><th class="${dtTh}">Status</th></tr></thead><tbody><tr><td colspan="3" class="px-4 py-8 text-center text-sm text-muted-foreground">No results found.</td></tr></tbody></table></div></div>`,
          caption: "Keep the header and span a single centered message row so the structure stays intact.",
        },
      },
      {
        title: "loading",
        dont: {
          html: `<div class="${dtWrap} max-w-[520px]"><div class="overflow-x-auto"><table class="${dtTable}"><thead><tr><th class="${dtTh}">Name</th><th class="${dtTh}">Email</th><th class="${dtTh}">Status</th></tr></thead><tbody><tr><td colspan="3" class="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</td></tr></tbody></table></div></div>`,
          caption: "A bare \"Loading…\" string gives no sense of progress and reads like static content.",
        },
        do: {
          html: `<div class="${dtWrap} max-w-[520px]"><div class="overflow-x-auto"><table class="${dtTable}"><thead><tr><th class="${dtTh}">Name</th><th class="${dtTh}">Email</th><th class="${dtTh}">Status</th></tr></thead><tbody><tr><td colspan="3" class="px-4 py-8 text-center">${spinnerEl("inline-block h-4 w-4")}</td></tr></tbody></table></div></div>`,
          caption: "Show a spinner in a centered spanning row so the load reads as active and in place.",
        },
      },
    ]
  },

  {
    slug: "dialog",
    name: "Dialog",
    description: "A modal dialog: a centered panel over a dimmed, blurred backdrop, with a title, an optional description, a body for real content like a form, and right-aligned actions. Use it for a focused task that warrants interrupting the page; reach for the Alert Dialog for a terse yes/no confirmation.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "size", label: "Size", options: ["xs", "sm", "md", "lg", "xl", "2xl"], cols: 6 },
        { type: "check", key: "withDescription", label: "Description" },
        { type: "check", key: "withBody", label: "Body form" },
        { type: "check", key: "destructive", label: "Destructive action" },
      ],
      defaults: { size: "lg", withDescription: true, withBody: true, destructive: false },
      render: (s) => {
        const size = dialogSize[s.size as string] || dialogSize.lg;
        const desc = s.withDescription ? `<p class="mt-2 text-sm text-muted-foreground">The refund will be reflected in the customer's bank account within 2 to 3 business days.</p>` : "";
        const body = s.withBody ? `<div class="mt-5 space-y-4">${fsField("Amount", `<div class="relative"><span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span><input class="${inputBase} pl-7" value="90.00"></div>`)}${fsField("Reason", `<input class="${inputBase}" placeholder="Duplicate charge">`)}</div>` : "";
        const v = s.destructive ? "destructive" : "default";
        return `<div class="relative inline-block"><button class="${btnBase} ${btnVariant.outline} ${btnSize.default}"${alertTrigger}>Open dialog</button><div data-alert-overlay class="${overlayCls}" onclick="if(event.target===this){this.classList.add('hidden');this.classList.remove('flex')}"><div class="${dialogPanel} ${size}"><h2 class="text-lg font-semibold">Refund payment</h2>${desc}${body}<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("outline", "Cancel", "default", alertClose)}${btn(v, "Refund", "default", alertClose)}</div></div></div></div>`;
      },
    },
    sections: [
      {
        title: "Anatomy",
        anatomy: "Title (the task) . optional description . body (the real content, usually a form) . actions (Cancel plus a primary, right-aligned on desktop and stacked on mobile). The panel is centered over a dimmed, blurred backdrop; dismiss via Cancel, a backdrop click, or Esc. Size to the content: a form wants md to xl, a one-line message wants sm.",
        examples: [],
      },
    ],
    donts: [
      {
        title: "When to use",
        dont: {
          html: `<div class="${dialogPanel} ${dialogSize.sm}"><h2 class="text-lg font-semibold">Delete file?</h2><div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("outline", "Cancel", "sm")}${btn("destructive", "Delete", "sm")}</div></div>`,
          caption: "A bare yes/no question does not need the roomier Dialog; that is what the Alert Dialog is for.",
        },
        do: {
          html: `<div class="${dialogPanel} ${dialogSize.lg}"><h2 class="text-lg font-semibold">Edit profile</h2><p class="mt-2 text-sm text-muted-foreground">Update how your name and email appear to teammates.</p><div class="mt-5 space-y-4">${fsField("Name", `<input class="${inputBase}" value="Ada Lovelace">`)}${fsField("Email", `<input class="${inputBase}" value="ada@example.com">`)}</div><div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("outline", "Cancel", "sm")}${btn("default", "Save changes", "sm")}</div></div>`,
          caption: "Use the Dialog for a focused task with real content, like a short form.",
        },
      },
      {
        title: "Description",
        dont: {
          html: `<div class="${dialogPanel} ${dialogSize.md}"><h2 class="text-lg font-semibold">Refund payment</h2><p class="mt-2 text-sm text-muted-foreground">Refunds are processed through the original payment method. Depending on the bank, the amount can take 2 to 3 business days to appear. Partial refunds are supported. Once submitted a refund cannot be cancelled, and the payout for this period will be adjusted on your next statement.</p><div class="mt-6 flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("default", "Refund", "sm")}</div></div>`,
          caption: "A multi-sentence policy dump in the description buries the task under reading.",
        },
        do: {
          html: `<div class="${dialogPanel} ${dialogSize.md}"><h2 class="text-lg font-semibold">Refund payment</h2><p class="mt-2 text-sm text-muted-foreground">The refund posts to the original card in 2 to 3 business days.</p><div class="mt-6 flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("default", "Refund", "sm")}</div></div>`,
          caption: "Keep the description to one supporting line; link out for the full policy.",
        },
      },
      {
        title: "Body form",
        dont: {
          html: `<div class="${dialogPanel} ${dialogSize.sm}"><h2 class="text-lg font-semibold">Create project</h2><div class="mt-5 space-y-3">${["Name", "Key", "Description", "Lead", "Team", "Visibility", "Template"].map((l) => fsField(l, `<input class="${inputBase}">`)).join("")}</div><div class="mt-6 flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("default", "Create", "sm")}</div></div>`,
          caption: "A seven-field form crammed into a small dialog feels like a page stuffed into a popup.",
        },
        do: {
          html: `<div class="${dialogPanel} ${dialogSize.lg}"><h2 class="text-lg font-semibold">Create project</h2><div class="mt-5 space-y-4">${fsField("Name", `<input class="${inputBase}" placeholder="Acme website">`)}${fsField("Key", `<input class="${inputBase}" placeholder="ACME">`)}</div><div class="mt-6 flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("default", "Create", "sm")}</div></div>`,
          caption: "Keep the body to the few fields the task needs; send long forms to a full page.",
        },
      },
      {
        title: "Actions",
        dont: {
          html: `<div class="${dialogPanel} ${dialogSize.md}"><h2 class="text-lg font-semibold">Unsaved changes</h2><p class="mt-2 text-sm text-muted-foreground">You have edits that are not saved.</p><div class="mt-6 flex justify-end gap-2">${btn("default", "Save", "sm")}${btn("default", "Discard", "sm")}${btn("default", "Keep editing", "sm")}</div></div>`,
          caption: "Three look-alike primary buttons give no signal about the default, safe choice.",
        },
        do: {
          html: `<div class="${dialogPanel} ${dialogSize.md}"><h2 class="text-lg font-semibold">Unsaved changes</h2><p class="mt-2 text-sm text-muted-foreground">You have edits that are not saved.</p><div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${btn("ghost", "Discard", "sm")}${btn("outline", "Keep editing", "sm")}${btn("default", "Save", "sm")}</div></div>`,
          caption: "One primary plus quieter secondaries, right-aligned and labeled with their verb.",
        },
      },
      {
        title: "Destructive action",
        dont: {
          html: `<div class="${dialogPanel} ${dialogSize.md}"><h2 class="text-lg font-semibold">Save changes</h2><p class="mt-2 text-sm text-muted-foreground">Update the profile with your edits.</p><div class="mt-6 flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("destructive", "Save", "sm")}</div></div>`,
          caption: "A red button on a routine Save trains users to ignore the colour that should mean danger.",
        },
        do: {
          html: `<div class="${dialogPanel} ${dialogSize.md}"><h2 class="text-lg font-semibold">Delete workspace</h2><p class="mt-2 text-sm text-muted-foreground">This removes all projects and cannot be undone.</p><div class="mt-6 flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("destructive", "Delete", "sm")}</div></div>`,
          caption: "Reserve the destructive tone for the irreversible action it names.",
        },
      },
      {
        title: "Size",
        dont: {
          html: `<div class="${dialogPanel} ${dialogSize["2xl"]}"><h2 class="text-lg font-semibold">Rename</h2><div class="mt-5">${fsField("Name", `<input class="${inputBase}" value="Untitled">`)}</div><div class="mt-6 flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("default", "Save", "sm")}</div></div>`,
          caption: "A 2xl panel around a single field leaves a vast empty expanse beside the input.",
        },
        do: {
          html: `<div class="${dialogPanel} ${dialogSize.sm}"><h2 class="text-lg font-semibold">Rename</h2><div class="mt-5">${fsField("Name", `<input class="${inputBase}" value="Untitled">`)}</div><div class="mt-6 flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("default", "Save", "sm")}</div></div>`,
          caption: "Size the dialog to its content: a single field belongs in xs or sm.",
        },
      },
    ],
  },

  {
    slug: "overlays",
    name: "Overlays",
    description: "Floating surfaces: drawers, modals, popovers, toasts.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "kind", label: "Surface", options: ["drawer", "modal", "toast", "menu"], cols: 4 },
        { type: "pills", key: "side", label: "Drawer side", options: ["right", "left"], cols: 2, disabledWhen: (s) => s.kind !== "drawer" },
        { type: "check", key: "destructive", label: "Destructive confirm", disabledWhen: (s) => s.kind !== "modal" },
        { type: "check", key: "withDescription", label: "Supporting line", disabledWhen: (s) => s.kind !== "drawer" && s.kind !== "toast" },
        { type: "text", key: "title", label: "Title", disabledWhen: (s) => s.kind === "menu" },
      ],
      defaults: { kind: "drawer", side: "right", destructive: true, withDescription: true, title: "Edit Identity" },
      render: (s) => {
        const title = (s.title as string) || "Edit Identity";
        if (s.kind === "drawer") {
          const sideCls = s.side === "left" ? "inset-y-0 left-0" : "inset-y-0 right-0";
          const desc = s.withDescription ? `<p class="${helperCls}">Visible above the parent page so the user can compare.</p>` : "";
          return `<div class="relative h-[200px] overflow-hidden rounded-lg border border-border">
  <div class="sheet absolute ${sideCls} flex w-full flex-col bg-popover">
    <div class="flex items-center border-b border-border px-4 py-3"><h2 class="text-sm font-semibold">${title}</h2><button class="${btnBase} ${btnVariant.ghost} ml-auto h-7 w-7 p-0" onclick="var s=this.closest('.sheet');s.style.opacity='0.3';s.style.transition='opacity 300ms';setTimeout(function(){s.style.opacity='1'},1000)">&times;</button></div>
    <div class="p-4">
      <div><label class="${labelCls}">Email</label><input class="${inputBase}" value="user@example.com" />${desc}</div>
    </div>
  </div>
</div>`;
        }
        if (s.kind === "modal") {
          const v = s.destructive ? "destructive" : "default";
          const confirmLabel = s.destructive ? "Delete" : "Confirm";
          const heading = s.destructive ? "Delete identity?" : `${title}?`;
          const lead = s.destructive ? "This cannot be undone." : "Confirm to apply this change.";
          return `<div class="rounded-lg border border-border p-0">
  <div class="dialog rounded-lg bg-popover p-5">
    <h2 class="text-base font-semibold">${heading}</h2>
    <p class="mt-1 text-sm text-muted-foreground">${lead}</p>
    <div class="mt-4 flex justify-end gap-2">
      ${btn("outline", "Cancel", "sm", ` onclick="var d=this.closest('.dialog');d.style.opacity='0.5';setTimeout(function(){d.style.opacity='1'},1000)"`)}
      ${btn(v, confirmLabel, "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent=o+'…';setTimeout(function(){b.textContent='Done!';setTimeout(function(){b.textContent=o;b.disabled=false},1500)},800)"`)}
    </div>
  </div>
</div>`;
        }
        if (s.kind === "toast") {
          const desc = s.withDescription ? `<div class="text-xs text-muted-foreground">Your settings have been updated.</div>` : "";
          return `<div>
  <div class="flex items-start justify-between gap-3 rounded-lg border border-border bg-popover px-4 py-3 shadow-lg" data-toast>
    <div><div class="text-sm font-medium">${title}</div>${desc}</div>
    <button class="text-muted-foreground transition-colors hover:text-foreground" onclick="var t=this.closest('[data-toast]');t.style.display='none';t.nextElementSibling.style.display='inline-flex'">&times;</button>
  </div>
  <button class="${btnBase} ${btnVariant.outline} ${btnSize.sm} mt-2 hidden" onclick="var t=this.previousElementSibling;t.style.display='';this.style.display='none'">Show toast again</button>
</div>`;
        }
        return `<div class="${menuBase} inline-block min-w-[160px]"${menuFlash}>
  ${menuItemEl("Edit")}
  ${menuItemEl("Duplicate")}
  <div class="${menuSep}"></div>
  ${menuItemEl("Delete", "text-destructive")}
</div>`;
      },
    },
    sections: [
      {
        title: "When to use",
        anatomy: "Drawer = task with form fields the user might want to compare with the underlying page (identity edit, message preview, client config). Modal = critical, blocking decision (delete identity, revoke sessions, rotate secret); always pairs the danger flag with an unambiguous confirm verb. Toast = transient after-the-fact feedback for completed actions. Row menu = per-row table actions, hidden behind the ··· button to reduce noise. Overlays compose, so order them deliberately: confirm modals (99999) beat toasts (100000 for feedback that must never be lost) beat slide-overs (9000) beat the in-flow row menu (50).",
        examples: [],
      },
    ],
    donts: [
      {
        title: "Drawer (SlideOver)",
        dont: {
          html: `<div class="dialog rounded-lg bg-popover p-5 shadow-xl"><h2 class="text-base font-semibold">Delete identity?</h2><p class="mt-1 text-sm text-muted-foreground">This cannot be undone.</p><div class="mt-4 flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("destructive", "Delete", "sm")}</div></div>`,
          caption: "A centered, page-blocking modal for a routine edit hides the very record the user wants to reference.",
        },
        do: {
          html: `<div class="relative h-[150px] overflow-hidden rounded-lg border border-border"><div class="absolute inset-y-0 right-0 flex w-2/3 flex-col bg-popover shadow-xl"><div class="flex items-center border-b border-border px-4 py-3"><h2 class="text-sm font-semibold">Edit Identity</h2><button class="${btnBase} ${btnVariant.ghost} ml-auto h-7 w-7 p-0">&times;</button></div><div class="p-4"><label class="${labelCls}">Email</label><input class="${inputBase}" value="user@example.com" /></div></div></div>`,
          caption: "Slide the form in from the edge so the parent page stays visible beneath it.",
        },
      },
      {
        title: "Modal (Confirm)",
        dont: {
          html: `<div class="dialog rounded-lg bg-popover p-5 shadow-xl"><h2 class="text-base font-semibold">Delete identity?</h2><div class="mt-4 flex justify-end gap-2">${btn("outline", "No", "sm")}${btn("default", "Yes", "sm")}</div></div>`,
          caption: "Generic Yes/No on a default-styled button hides both the stakes and what is being confirmed.",
        },
        do: {
          html: `<div class="dialog rounded-lg bg-popover p-5 shadow-xl"><h2 class="text-base font-semibold">Delete identity?</h2><p class="mt-1 text-sm text-muted-foreground">This cannot be undone.</p><div class="mt-4 flex justify-end gap-2">${btn("outline", "Cancel", "sm")}${btn("destructive", "Delete", "sm")}</div></div>`,
          caption: "Name the verb (Delete) and flag destructive actions with the danger style.",
        },
      },
      {
        title: "Toast",
        dont: {
          html: `<div class="flex items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-popover px-4 py-3 shadow-lg"><div><div class="text-sm font-medium">Delete this identity?</div><div class="mt-2 flex gap-2">${btn("outline", "Cancel", "sm")}${btn("destructive", "Delete", "sm")}</div></div><button class="text-muted-foreground hover:text-foreground">&times;</button></div>`,
          caption: "A toast that demands a decision can be auto-dismissed before the user acts, and steals focus from a transient surface.",
        },
        do: {
          html: `<div class="flex items-start justify-between gap-3 rounded-lg border border-border bg-popover px-4 py-3 shadow-lg"><div><div class="text-sm font-medium">Identity deleted</div><div class="text-xs text-muted-foreground">You can undo this for 10 seconds.</div></div><button class="text-muted-foreground hover:text-foreground">&times;</button></div>`,
          caption: "Keep toasts to passive confirmation of something already done; offer Undo, not a blocking choice.",
        },
      },
      // Dialog `menu` surface do/dont: teaches the overlay choice (collapse row
      // actions behind ··· vs splaying them inline), not the item-ordering lesson
      // the standalone row-menu component covers. Required by the dont-per-variant
      // directive; intentionally kept distinct, not merged with row-menu.
      {
        title: "Row menu",
        dont: {
          html: `<div class="flex flex-wrap gap-2">${btn("ghost", "Edit", "sm")}${btn("ghost", "Duplicate", "sm")}${btn("destructive", "Delete", "sm")}</div>`,
          caption: "Splaying every row action inline multiplies visual noise across every table row.",
        },
        do: {
          html: `<div class="${menuBase} inline-block min-w-[160px]">${menuItemEl("Edit")}${menuItemEl("Duplicate")}<div class="${menuSep}"></div>${menuItemEl("Delete", "text-destructive")}</div>`,
          caption: "Collapse per-row actions behind a ··· trigger; keep Delete separated and danger-colored.",
        },
      }
    ]
},

  {
    slug: "sidebar",
    name: "Navigation",
    description: "Sidebar + Topbar + breadcrumbs + page header. The sidebar you see on the left of this very page is the production sidebar: same component, same width, same drawer behavior.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "part", label: "Part", options: ["sidebar", "topbar", "page header", "breadcrumbs", "tabs", "command"], cols: 3 },
        { type: "check", key: "groupLabels", label: "Group labels", disabledWhen: (s) => s.part !== "sidebar" },
        { type: "check", key: "subtitle", label: "Subtitle", disabledWhen: (s) => s.part !== "page header" },
      ],
      defaults: { part: "sidebar", groupLabels: true, subtitle: true },
      render: (s) => {
        if (s.part === "topbar") {
          return `<header class="flex h-14 w-[480px] max-w-full items-center rounded-lg border border-border bg-card px-4">
  <span class="text-base font-semibold">Dashboard</span>
  <div class="ml-auto flex gap-2">
    ${btn("ghost", "Search", "sm", ` onclick="var b=this;b.classList.add('bg-accent');setTimeout(function(){b.classList.remove('bg-accent')},300)"`)}
    ${btn("default", "New", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Created!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)"`)}
  </div>
</header>`;
        }
        if (s.part === "page header") {
          return `<div class="w-[480px] max-w-full">
  <div class="flex items-start justify-between">
    <div>
      <h1 class="text-[22px] font-semibold tracking-tight">Users</h1>
      ${s.subtitle ? `<p class="mt-1 text-sm text-muted-foreground">Manage your team members.</p>` : ""}
    </div>
    <div class="flex gap-2">
      ${btn("outline", "Export", "default", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Exporting…';setTimeout(function(){b.textContent=o;b.disabled=false},2000)"`)}
      ${btn("default", "Add User", "default", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Added!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)"`)}
    </div>
  </div>
</div>`;
        }
        if (s.part === "breadcrumbs") {
          return `<nav class="${bcNav}" onclick="var a=event.target.closest('a');if(a)event.preventDefault()">${crumbLink("Home")}${crumbSep()}${crumbLink("Team")}${crumbSep()}${crumbCurrent("Rachel Chen")}</nav>`;
        }
        if (s.part === "tabs") {
          return `<div class="flex w-[480px] max-w-full border-b border-border" onclick="if(!event.target.dataset.tab)return;this.querySelectorAll('[data-tab]').forEach(function(t){t.className='border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'});event.target.className='border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground'">
  <button data-tab="1" class="border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground">Overview</button>
  <button data-tab="2" class="border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Sessions</button>
  <button data-tab="3" class="border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Audit log</button>
</div>`;
        }
        if (s.part === "command") {
          return `<div class="${cardCls} max-w-[480px] overflow-hidden">
  <div class="flex items-center gap-2 border-b border-border px-3.5 py-3">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <span class="text-sm text-muted-foreground">Type a command or search...</span>
    <kbd class="${kbdCls} ml-auto">esc</kbd>
  </div>
  <div class="p-1.5">
    <div class="px-2.5 py-1.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">Actions</div>
    <div class="flex items-center gap-2.5 rounded-md bg-accent px-2.5 py-2 text-sm">Create identity <kbd class="${kbdCls} ml-auto">C</kbd></div>
    <div class="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm">Invite teammate</div>
  </div>
</div>`;
        }
        const label = (text: string) => s.groupLabels ? `<div class="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">${text}</div>` : "";
        return `<nav class="h-[300px] w-60 overflow-hidden rounded-lg border border-border bg-card">
  <div class="flex h-14 items-center border-b border-border px-4 font-semibold">Acme</div>
  <div class="p-2" onclick="if(!event.target.classList.contains('sidebar-item'))return;this.querySelectorAll('.sidebar-item').forEach(function(i){i.classList.remove('bg-accent','text-accent-foreground')});event.target.classList.add('bg-accent','text-accent-foreground')">
    <div class="mb-2">
      ${label("Main")}
      <button class="sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent bg-accent text-accent-foreground">Dashboard</button>
      <button class="sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent">Users</button>
      <button class="sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent">Settings</button>
    </div>
    <div class="mb-2">
      ${label("Reports")}
      <button class="sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent">Analytics</button>
    </div>
  </div>
</nav>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Sidebar",
        dont: {
          html: `<nav class="w-60 overflow-hidden rounded-lg border border-border bg-card">
  <div class="flex h-14 items-center border-b border-border px-4 font-semibold">Acme</div>
  <div class="p-2" onclick="if(!event.target.classList.contains('sidebar-item'))return;this.querySelectorAll('.sidebar-item').forEach(function(i){i.classList.remove('bg-accent','text-accent-foreground')});event.target.classList.add('bg-accent','text-accent-foreground')">
    <button class="sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent bg-accent text-accent-foreground">Dashboard</button>
    <button class="sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent bg-accent text-accent-foreground">Users</button>
    <button class="sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent">Settings</button>
  </div>
</nav>`,
          caption: "Click an item: two rows wearing the active background means the nav can't tell you which page you're on.",
        },
        do: {
          html: `<nav class="w-60 overflow-hidden rounded-lg border border-border bg-card">
  <div class="flex h-14 items-center border-b border-border px-4 font-semibold">Acme</div>
  <div class="p-2" onclick="if(!event.target.classList.contains('sidebar-item'))return;this.querySelectorAll('.sidebar-item').forEach(function(i){i.classList.remove('bg-accent','text-accent-foreground')});event.target.classList.add('bg-accent','text-accent-foreground')">
    <button class="sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent bg-accent text-accent-foreground">Dashboard</button>
    <button class="sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent">Users</button>
    <button class="sidebar-item flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent">Settings</button>
  </div>
</nav>`,
          caption: "Exactly one item carries the accent background; clicking moves it so the active page is always unambiguous.",
        },
      },
      {
        title: "Topbar",
        dont: {
          html: `<header class="flex h-14 w-[420px] max-w-full items-center gap-2 rounded-lg border border-border bg-card px-4">
  <span class="text-base font-semibold">Dashboard</span>
  ${btn("default", "Search", "sm")}
  ${btn("default", "Filter", "sm")}
  ${btn("default", "Export", "sm")}
  ${btn("default", "New", "sm")}
</header>`,
          caption: "Four solid primary buttons crammed left-to-right give the topbar no focal action and no breathing room.",
        },
        do: {
          html: `<header class="flex h-14 w-[420px] max-w-full items-center rounded-lg border border-border bg-card px-4">
  <span class="text-base font-semibold">Dashboard</span>
  <div class="ml-auto flex gap-2">
    ${btn("ghost", "Search", "sm")}
    ${btn("default", "New", "sm")}
  </div>
</header>`,
          caption: "Push utilities to the right, keep one primary button, and demote the rest to ghost so the New action leads.",
        },
      },
      {
        title: "Page header",
        dont: {
          html: `<div class="w-[420px] max-w-full">
  <h1 class="text-4xl font-bold tracking-tight">Users</h1>
  <p class="mt-1 text-sm text-muted-foreground">Manage your team members.</p>
</div>`,
          caption: "A 36px display heading on the page body competes with the topbar and screams louder than the content beneath it.",
        },
        do: {
          html: `<div class="w-[420px] max-w-full">
  <h1 class="text-[22px] font-semibold tracking-tight">Users</h1>
  <p class="mt-1 text-sm text-muted-foreground">Manage your team members.</p>
</div>`,
          caption: "Page-header titles are 20-22px semibold: clearly the page label, never larger than the topbar brand.",
        },
      },
      {
        title: "Breadcrumbs",
        dont: {
          html: `<nav class="${bcNav}">${crumbLink("Home")}${crumbSep()}${crumbLink("Team")}${crumbSep()}${crumbLink("Rachel Chen")}</nav>`,
          caption: "Making the last crumb a link implies the current page is somewhere else to navigate to.",
        },
        do: {
          html: `<nav class="${bcNav}">${crumbLink("Home")}${crumbSep()}${crumbLink("Team")}${crumbSep()}${crumbCurrent("Rachel Chen")}</nav>`,
          caption: "The final crumb is plain current-page text, not a link: it marks where you are, not where you can go.",
        },
      },
      {
        title: "Tabs",
        dont: {
          html: `<div class="w-[420px] max-w-full border-b border-border">
  <button class="border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground">Overview</button>
  <button class="border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground">Sessions</button>
  <button class="border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Audit log</button>
</div>`,
          caption: "Two underlined tabs at once breaks the one-active-facet contract and hides which view you're reading.",
        },
        do: {
          html: `<div class="w-[420px] max-w-full border-b border-border" onclick="if(!event.target.dataset.tab)return;this.querySelectorAll('[data-tab]').forEach(function(t){t.className='border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'});event.target.className='border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground'">
  <button data-tab="1" class="border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground">Overview</button>
  <button data-tab="2" class="border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Sessions</button>
  <button data-tab="3" class="border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Audit log</button>
</div>`,
          caption: "Click a tab: exactly one carries the primary underline so the active facet is always singular.",
        },
      },
      {
        title: "Command palette",
        dont: {
          html: `<div class="${cardCls} max-w-[480px] overflow-hidden">
  <div class="flex items-center gap-2 border-b border-border px-3.5 py-3">
    <span class="text-sm text-muted-foreground">Type a command or search...</span>
  </div>
  <div class="p-1.5">
    <div class="flex items-center gap-2.5 rounded-md bg-accent px-2.5 py-2 text-sm">Create identity</div>
    <div class="flex items-center gap-2.5 rounded-md bg-accent px-2.5 py-2 text-sm">Invite teammate</div>
  </div>
</div>`,
          caption: "No search affordance and two highlighted rows: nothing tells you to type or which result Enter will run.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[480px] overflow-hidden">
  <div class="flex items-center gap-2 border-b border-border px-3.5 py-3">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <span class="text-sm text-muted-foreground">Type a command or search...</span>
    <kbd class="${kbdCls} ml-auto">esc</kbd>
  </div>
  <div class="p-1.5">
    <div class="px-2.5 py-1.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">Actions</div>
    <div class="flex items-center gap-2.5 rounded-md bg-accent px-2.5 py-2 text-sm">Create identity <kbd class="${kbdCls} ml-auto">C</kbd></div>
    <div class="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm">Invite teammate</div>
  </div>
</div>`,
          caption: "A search icon and esc hint signal input, and a single highlighted row shows exactly what Enter will run.",
        },
      }
    ]
  },

  {
    slug: "stepper",
    name: "Steppers",
    description: "Multi-step progress indicators: horizontal, vertical, with progress.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "type", label: "Type", options: ["Horizontal", "Vertical", "Progress bar"], cols: 3 },
        { type: "range", key: "progress", label: "Progress", min: 0, max: 100, step: 1, suffix: "%", disabledWhen: (s) => s.type !== "Progress bar" },
      ],
      defaults: { type: "Horizontal", progress: 68 },
      render: (s) => {
        if (s.type === "Vertical") {
          return `<div class="max-w-[320px]">${[
  { st: "completed", n: 1, t: "Account created", d: "Email verified and password set." },
  { st: "active", n: 2, t: "Profile setup", d: "Add your name and avatar." },
  { st: "pending", n: 3, t: "Team invite", d: "Invite collaborators to your workspace." },
  { st: "pending", n: 4, t: "Done", d: "You're all set." },
].map((step, i, a) => `<div class="flex gap-3"><div class="flex flex-col items-center"><div class="${stepInd(step.st)}">${step.st === "completed" ? "&#10003;" : step.n}</div>${i < a.length - 1 ? `<div class="my-1 w-0.5 flex-1 ${step.st === "completed" ? "bg-primary" : "bg-border"}"></div>` : ""}</div><div class="${i < a.length - 1 ? "pb-6" : ""}"><span class="block text-sm font-medium">${step.t}</span><span class="text-xs text-muted-foreground">${step.d}</span></div></div>`).join("")}</div>`;
        }
        if (s.type === "Progress bar") {
          const pct = (s.progress as number) ?? 68;
          return `<div class="max-w-[320px]">
  <div class="mb-1.5 flex justify-between text-xs">
    <span class="font-medium">Setup progress</span>
    <span class="text-muted-foreground">${pct}%</span>
  </div>
  <div class="h-1.5 overflow-hidden rounded-full bg-muted">
    <div class="h-full rounded-full bg-primary" style="width:${pct}%"></div>
  </div>
</div>`;
        }
        return `<div>
  <div data-stepper class="flex items-start">
    <div class="flex flex-col items-center gap-1.5"><div data-ind data-state="completed" class="${stepInd("completed")}">&#10003;</div><span class="text-xs font-medium">Account</span></div>
    <div data-conn class="${stepConn(true)}"></div>
    <div class="flex flex-col items-center gap-1.5"><div data-ind data-state="active" class="${stepInd("active")}">2</div><span class="text-xs font-medium">Profile</span></div>
    <div data-conn class="${stepConn(false)}"></div>
    <div class="flex flex-col items-center gap-1.5"><div data-ind data-state="pending" class="${stepInd("pending")}">3</div><span class="text-xs font-medium">Review</span></div>
    <div data-conn class="${stepConn(false)}"></div>
    <div class="flex flex-col items-center gap-1.5"><div data-ind data-state="pending" class="${stepInd("pending")}">4</div><span class="text-xs font-medium">Done</span></div>
  </div>
  <div class="mt-6 flex justify-end gap-2" onclick="var wrap=this.parentElement.querySelector('[data-stepper]');var inds=[].slice.call(wrap.querySelectorAll('[data-ind]'));var conns=[].slice.call(wrap.querySelectorAll('[data-conn]'));var cur=inds.findIndex(function(s){return s.dataset.state==='active'});var t=event.target.closest('button');if(!t)return;var fwd=t.textContent.trim()==='Next'||t.textContent.trim()==='Finish';var ni=fwd?cur+1:cur-1;if(ni<0||ni>=inds.length)return;inds.forEach(function(ind,i){var st=i<ni?'completed':i===ni?'active':'pending';ind.dataset.state=st;ind.className=st==='completed'?'${stepInd("completed")}':st==='active'?'${stepInd("active")}':'${stepInd("pending")}';ind.innerHTML=i<ni?'\\u2713':''+(i+1)});conns.forEach(function(c,i){c.className=i<ni?'${stepConn(true)}':'${stepConn(false)}'});var bs=this.querySelectorAll('button');bs[0].disabled=ni<=0;bs[1].textContent=ni>=inds.length-1?'Finish':'Next'">
    <button class="${btnBase} ${btnVariant.outline} ${btnSize.sm}" disabled>Back</button>
    <button class="${btnBase} ${btnVariant.default} ${btnSize.sm}">Next</button>
  </div>
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Horizontal",
        dont: {
          html: `<div class="flex items-start">
    <div class="flex flex-col items-center gap-1.5"><div class="${stepInd("active")}">1</div><span class="text-xs font-medium">Account</span></div>
    <div class="${stepConn(false)}"></div>
    <div class="flex flex-col items-center gap-1.5"><div class="${stepInd("active")}">2</div><span class="text-xs font-medium">Profile</span></div>
    <div class="${stepConn(false)}"></div>
    <div class="flex flex-col items-center gap-1.5"><div class="${stepInd("active")}">3</div><span class="text-xs font-medium">Review</span></div>
  </div>`,
          caption: "Styling several steps as active at once hides which step the user is actually on.",
        },
        do: {
          html: `<div class="flex items-start">
    <div class="flex flex-col items-center gap-1.5"><div class="${stepInd("completed")}">&#10003;</div><span class="text-xs font-medium">Account</span></div>
    <div class="${stepConn(true)}"></div>
    <div class="flex flex-col items-center gap-1.5"><div class="${stepInd("active")}">2</div><span class="text-xs font-medium">Profile</span></div>
    <div class="${stepConn(false)}"></div>
    <div class="flex flex-col items-center gap-1.5"><div class="${stepInd("pending")}">3</div><span class="text-xs font-medium">Review</span></div>
  </div>`,
          caption: "Mark exactly one step active; show completed steps filled and the rest pending.",
        },
      },
      {
        title: "Vertical",
        dont: {
          html: `<div class="max-w-[320px]"><div class="flex gap-3"><div class="flex flex-col items-center"><div class="${stepInd("active")}">2</div></div><div><span class="block text-sm font-medium">Profile setup</span></div></div></div>`,
          caption: "A vertical step with only a title wastes the space the layout is built to use.",
        },
        do: {
          html: `<div class="max-w-[320px]"><div class="flex gap-3"><div class="flex flex-col items-center"><div class="${stepInd("active")}">2</div></div><div><span class="block text-sm font-medium">Profile setup</span><span class="text-xs text-muted-foreground">Add your name and avatar.</span></div></div></div>`,
          caption: "Pair each vertical step with a one-line description so the extra width earns its place.",
        },
      },
      {
        title: "Progress bar",
        dont: {
          html: `<div class="max-w-[320px]">
  <div class="h-1.5 overflow-hidden rounded-full bg-muted">
    <div class="h-full rounded-full bg-primary" style="width:68%"></div>
  </div>
</div>`,
          caption: "A bare progress bar with no percentage leaves users guessing how far along they are.",
        },
        do: {
          html: `<div class="max-w-[320px]">
  <div class="mb-1.5 flex justify-between text-xs">
    <span class="font-medium">Setup progress</span>
    <span class="text-muted-foreground">68%</span>
  </div>
  <div class="h-1.5 overflow-hidden rounded-full bg-muted">
    <div class="h-full rounded-full bg-primary" style="width:68%"></div>
  </div>
</div>`,
          caption: "Label the bar and show the exact percentage so progress is legible at a glance.",
        },
      },
    ],
  },

  {
    slug: "tabs",
    name: "Tabs",
    description: "Underline, pill, vertical, with badges.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["underline", "pill", "vertical"], cols: 3 },
        { type: "check", key: "badges", label: "Badge counts", disabledWhen: (s) => s.variant !== "underline" },
      ],
      defaults: { variant: "underline", badges: false },
      render: (s) => {
        if (s.variant === "pill") {
          return `<div class="${tabsPillList}" onclick="if(!event.target.classList.contains('tab'))return;this.querySelectorAll('.tab').forEach(function(t){t.className='${tabPill}'});event.target.className='${tabPillActive}'">
  <button class="${tabPillActive}">All</button>
  <button class="${tabPill}">Active</button>
  <button class="${tabPill}">Archived</button>
  <button class="${tabPill}">Deleted</button>
</div>`;
        }
        if (s.variant === "vertical") {
          return `<div data-vtabs class="grid grid-cols-[180px_1fr] gap-6">
  <div class="flex flex-col gap-1" onclick="if(!event.target.classList.contains('tab'))return;this.querySelectorAll('.tab').forEach(function(t){t.className='${tabV}'});event.target.className='${tabVActive}';var wrap=this.closest('[data-vtabs]');wrap.querySelector('[data-title]').textContent=event.target.textContent+' Settings';var f={'General':'<div><label class=\\'${labelCls}\\'>Display name</label><input class=\\'${inputBase}\\' value=\\'Rachel Chen\\' /></div><div><label class=\\'${labelCls}\\'>Email</label><input class=\\'${inputBase}\\' value=\\'rachel@example.com\\' /></div>','Security':'<div><label class=\\'${labelCls}\\'>Password</label><input class=\\'${inputBase}\\' type=\\'password\\' value=\\'secretpass\\' /></div><label class=\\'flex items-center gap-2 text-sm\\'><input type=\\'checkbox\\' class=\\'size-4 accent-primary\\'> Two-factor auth</label>','Notifications':'<label class=\\'flex items-center gap-2 text-sm\\'><input type=\\'checkbox\\' class=\\'size-4 accent-primary\\' checked> Email notifications</label><label class=\\'flex items-center gap-2 text-sm\\'><input type=\\'checkbox\\' class=\\'size-4 accent-primary\\'> Push notifications</label>','API Keys':'<div><label class=\\'${labelCls}\\'>API Key</label><input class=\\'${inputBase} font-mono\\' value=\\'sk-proj-abc123\\' readonly /></div>','Billing':'<div><label class=\\'${labelCls}\\'>Plan</label><input class=\\'${inputBase}\\' value=\\'Pro ($12/mo)\\' readonly /></div>'};wrap.querySelector('[data-body]').innerHTML=f[event.target.textContent]||''">
    <button class="${tabVActive}">General</button>
    <button class="${tabV}">Security</button>
    <button class="${tabV}">Notifications</button>
    <button class="${tabV}">API Keys</button>
    <button class="${tabV}">Billing</button>
  </div>
  <div class="${cardCls}">
    <div class="border-b border-border px-5 py-3"><h3 data-title class="text-sm font-semibold">General Settings</h3></div>
    <div data-body class="space-y-3 p-5">
      <div><label class="${labelCls}">Display name</label><input class="${inputBase}" value="Rachel Chen" /></div>
      <div><label class="${labelCls}">Email</label><input class="${inputBase}" value="rachel@example.com" /></div>
    </div>
  </div>
</div>`;
        }
        if (s.badges) {
          return `<div class="flex border-b border-border" onclick="var t=event.target.closest('.tab');if(!t)return;this.querySelectorAll('.tab').forEach(function(b){b.className='${tabU} inline-flex items-center gap-1.5'});t.className='${tabUActive} inline-flex items-center gap-1.5'">
  <button class="${tabUActive} inline-flex items-center gap-1.5">All ${badge("secondary", "142")}</button>
  <button class="${tabU} inline-flex items-center gap-1.5">Active ${badge("secondary", "89")}</button>
  <button class="${tabU} inline-flex items-center gap-1.5">Pending ${badge("secondary", "12")}</button>
  <button class="${tabU} inline-flex items-center gap-1.5">Archived ${badge("secondary", "53")}</button>
</div>`;
        }
        return `<div>
  <div class="flex border-b border-border" onclick="if(!event.target.classList.contains('tab'))return;this.querySelectorAll('.tab').forEach(function(t){t.className='${tabU}'});event.target.className='${tabUActive}';var m={'General':'General settings content goes here.','Security':'Security preferences and two-factor authentication.','Notifications':'Email and push notification preferences.','Billing':'Payment methods and subscription plan.','Integrations':'Connected apps and API configuration.'};this.nextElementSibling.querySelector('p').textContent=m[event.target.textContent]||''">
    <button class="${tabUActive}">General</button>
    <button class="${tabU}">Security</button>
    <button class="${tabU}">Notifications</button>
    <button class="${tabU}">Billing</button>
    <button class="${tabU}">Integrations</button>
  </div>
  <div class="pt-4"><p class="text-sm">General settings content goes here.</p></div>
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Underline",
        dont: {
          html: `<div class="flex border-b border-border">
  <button class="${tabUActive}">Overview</button>
  <button class="${tabUActive}">Activity</button>
  <button class="${tabUActive}">Settings</button>
</div>`,
          caption: "Underlining every tab erases the active indicator: there is no way to tell which view is current.",
        },
        do: {
          html: `<div class="flex border-b border-border">
  <button class="${tabUActive}">Overview</button>
  <button class="${tabU}">Activity</button>
  <button class="${tabU}">Settings</button>
</div>`,
          caption: "Underline and foreground-color only the active tab; leave the rest muted with no rule.",
        },
      },
      {
        title: "Pill",
        dont: {
          html: `<div class="${tabsPillList}">
  <button class="${tabPillActive}">All</button>
  <button class="${tabPillActive}">Active</button>
  <button class="${tabPillActive}">Archived</button>
</div>`,
          caption: "Giving every pill the raised background makes the group read as three buttons, not one selection.",
        },
        do: {
          html: `<div class="${tabsPillList}">
  <button class="${tabPillActive}">All</button>
  <button class="${tabPill}">Active</button>
  <button class="${tabPill}">Archived</button>
</div>`,
          caption: "Exactly one pill gets the elevated background; the rest sit flat on the muted track.",
        },
      },
      {
        title: "Vertical",
        dont: {
          html: `<div class="flex w-[180px] flex-col gap-1">
  <button class="${tabV}">General</button>
  <button class="${tabV}">Security</button>
  <button class="${tabV}">Notifications</button>
</div>`,
          caption: "With no filled active item the rail collapses into a plain link list and loses its current selection.",
        },
        do: {
          html: `<div class="flex w-[180px] flex-col gap-1">
  <button class="${tabVActive}">General</button>
  <button class="${tabV}">Security</button>
  <button class="${tabV}">Notifications</button>
</div>`,
          caption: "Fill the active rail item with the accent background so the selected pane is unmistakable.",
        },
      },
    ]
  },

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
    donts: [
      {
        title: "Single",
        dont: {
          html: kbdEl("⌘K"),
          caption: "Packing a whole shortcut into one key cap reads as a single keystroke that does not exist.",
        },
        do: {
          html: kbdEl("Esc"),
          caption: "Use the single mode for one real key; give each cap exactly one key.",
        },
      },
      {
        title: "Combo",
        dont: {
          html: `<span class="font-mono text-[11px] text-muted-foreground">${kbdEl("⌘")}${kbdEl("⇧")}${kbdEl("P")}</span>`,
          caption: "Caps butted together with no separator blur into one token and hide that it is a chord.",
        },
        do: {
          html: `<span class="inline-flex items-center gap-1">${kbdEl("⌘")}<span class="text-xs text-muted-foreground">+</span>${kbdEl("⇧")}<span class="text-xs text-muted-foreground">+</span>${kbdEl("P")}</span>`,
          caption: "Separate each key with a + so the combo reads as keys pressed together.",
        },
      },
      {
        title: "In a sentence",
        dont: {
          html: `<p class="text-sm">Press Ctrl+K to search.</p>`,
          caption: "Plain-text shortcuts blend into the prose and are easy to miss.",
        },
        do: {
          html: `<p class="text-sm">Press ${kbdEl("Ctrl")}${kbdEl("K")} to search.</p>`,
          caption: "Wrap each key in a kbd so shortcuts read as physical keys.",
        },
      },
    ],
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
    donts: [
      {
        title: "display",
        dont: {
          html: `<div class="space-y-2"><p class="${typeScale.display}">Welcome</p><p class="${typeScale.display}">Get started</p></div>`,
          caption: "Two display-size lines in one view fight for attention and leave no clear focal point.",
        },
        do: {
          html: `<div><p class="${typeScale.display}">Welcome</p><p class="${typeScale.muted} mt-2">Sign in to pick up where you left off.</p></div>`,
          caption: "Use display once per hero, then drop to a muted line for the supporting copy.",
        },
      },
      {
        title: "h1",
        dont: {
          html: `<div class="space-y-1"><h1 class="${typeScale.h1}">Billing</h1><h1 class="${typeScale.h1}">Invoices</h1></div>`,
          caption: "Two h1 titles on a page break the document outline and confuse assistive tech.",
        },
        do: {
          html: `<div><h1 class="${typeScale.h1}">Billing</h1><h2 class="${typeScale.h2} mt-4">Invoices</h2></div>`,
          caption: "Give each page a single h1, then step down to h2 for the sections beneath it.",
        },
      },
      {
        title: "h2",
        dont: {
          html: `<div><h1 class="${typeScale.h1}">Settings</h1><h4 class="${typeScale.h4} mt-4">Profile</h4></div>`,
          caption: "Jumping from h1 straight to h4 skips a level and flattens the visible hierarchy.",
        },
        do: {
          html: `<div><h1 class="${typeScale.h1}">Settings</h1><h2 class="${typeScale.h2} mt-4">Profile</h2></div>`,
          caption: "Follow an h1 with h2 for its top-level sections; don't skip the scale.",
        },
      },
      {
        title: "h3",
        dont: {
          html: `<p class="${typeScale.h3} max-w-[340px]">Canvas is a CSS-first design system for building consistent product interfaces.</p>`,
          caption: "Body copy set in a heading style is hard to read in bulk and flattens the hierarchy.",
        },
        do: {
          html: `<div class="max-w-[340px]"><h3 class="${typeScale.h3}">About Canvas</h3><p class="${typeScale.body} mt-1">Canvas is a CSS-first design system for building consistent product interfaces.</p></div>`,
          caption: "Reserve heading styles for titles; set running text in a small body utility.",
        },
      },
      {
        title: "h4",
        dont: {
          html: `<div class="space-y-1"><h4 class="${typeScale.h4}">Notifications</h4><h4 class="${typeScale.h4}">A long descriptive sentence that explains everything in detail.</h4></div>`,
          caption: "h4 is a minor heading, not a place for full sentences; long text at this weight reads as a wall.",
        },
        do: {
          html: `<div><h4 class="${typeScale.h4}">Notifications</h4><p class="${typeScale.small} mt-1">Choose how and when we reach you.</p></div>`,
          caption: "Keep h4 to a short label and carry the explanation in a small supporting line.",
        },
      },
      {
        title: "h5",
        dont: {
          html: `<div class="space-y-1"><h5 class="${typeScale.h5}">Members</h5><p class="${typeScale.h5}">Aisha, Bao, Cleo, and 9 others have access.</p></div>`,
          caption: "Setting the value in h5 too makes the label and its data indistinguishable.",
        },
        do: {
          html: `<div><h5 class="${typeScale.h5}">Members</h5><p class="${typeScale.body} mt-0.5">Aisha, Bao, Cleo, and 9 others have access.</p></div>`,
          caption: "Use h5 only for the label; render the value in body so the pair stays scannable.",
        },
      },
      {
        title: "body",
        dont: {
          html: `<p class="${typeScale.body} max-w-[340px]"><span class="${typeScale.code}">npm install</span> THEN restart the dev server BEFORE you continue.</p>`,
          caption: "All-caps emphasis inside body copy shouts and undercuts the relaxed reading rhythm.",
        },
        do: {
          html: `<p class="${typeScale.body} max-w-[340px]">Run <span class="${typeScale.code}">npm install</span>, then restart the dev server before you continue.</p>`,
          caption: "Keep body copy in sentence case and let inline code carry the technical emphasis.",
        },
      },
      {
        title: "small",
        dont: {
          html: `<button class="${btnBase} ${btnVariant.default} ${btnSize.default}"><span class="${typeScale.small}">Save changes</span></button>`,
          caption: "small is muted-foreground; on a colored button it loses contrast and looks disabled.",
        },
        do: {
          html: `<div><p class="${typeScale.body}">Save changes</p><p class="${typeScale.small} mt-0.5">Last saved 2 minutes ago.</p></div>`,
          caption: "Use small for secondary captions on a plain surface, not for the primary label.",
        },
      },
      {
        title: "tiny",
        dont: {
          html: `<p class="${typeScale.tiny} max-w-[300px]">These terms govern your use of the service and your data; please read them carefully before you continue past this screen.</p>`,
          caption: "tiny is for metadata, not legal prose; long copy at 12px strains the eye.",
        },
        do: {
          html: `<div class="flex items-center gap-2"><span class="${typeScale.body}">Deploy succeeded</span><span class="${typeScale.tiny}">3m ago</span></div>`,
          caption: "Reserve tiny for short metadata like timestamps and counts beside the main text.",
        },
      },
      {
        title: "muted",
        dont: {
          html: `<a href="#" class="${typeScale.muted} underline">View your invoices</a>`,
          caption: "A primary, clickable action in muted-foreground reads as disabled and is easy to miss.",
        },
        do: {
          html: `<p class="${typeScale.body}">Payment due May 31. <a href="#" class="text-primary underline-offset-4 hover:underline">View invoices</a></p>`,
          caption: "Keep muted for de-emphasized context; give the actual action full foreground or primary color.",
        },
      },
      {
        title: "caption",
        dont: {
          html: `<p class="${typeScale.caption} max-w-[320px]">Your subscription renews automatically each month unless you cancel from the billing page.</p>`,
          caption: "Uppercase, letter-spaced caption text is illegible for anything longer than a label.",
        },
        do: {
          html: `<div><p class="${typeScale.caption}">Billing</p><p class="${typeScale.body} mt-1">Your subscription renews automatically each month.</p></div>`,
          caption: "Use caption as a short eyebrow label above a section, then explain in body.",
        },
      },
      {
        title: "code",
        dont: {
          html: `<pre class="${typeScale.code} block whitespace-pre">git checkout -b feature\ngit add .\ngit commit -m "wip"</pre>`,
          caption: "The inline code utility has tight padding and no scroll; multi-line blocks overflow and clip.",
        },
        do: {
          html: `<p class="${typeScale.body}">Create a branch with <span class="${typeScale.code}">git checkout -b feature</span> before committing.</p>`,
          caption: "Use code for inline tokens inside a sentence; reach for the code block component for multi-line snippets.",
        },
      },
      {
        title: "mono",
        dont: {
          html: `<p class="${typeScale.mono} max-w-[320px]">We could not process your request because the upstream service returned an unexpected response.</p>`,
          caption: "Mono spacing makes prose sentences sparse and slow to read; it is meant for fixed-width data.",
        },
        do: {
          html: `<div class="flex items-center justify-between gap-4"><span class="${typeScale.small}">Request ID</span><span class="${typeScale.mono}">req_8f2c10ab</span></div>`,
          caption: "Use mono for identifiers, hashes, and tabular values where character alignment matters.",
        },
      }
    ]
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
    donts: [
      {
        dont: {
          html: spinnerEl(),
          caption: "A bare spinner with no label leaves users guessing what is happening and for how long.",
        },
        do: {
          html: `<div class="flex items-center gap-2">${spinnerEl("h-4 w-4")}<span class="text-sm text-muted-foreground">Loading…</span></div>`,
          caption: "Pair longer waits with a short label so the spinner has context.",
        },
      },
      {
        title: "sm",
        dont: {
          html: `<div class="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">${spinnerEl("h-4 w-4")}</div>`,
          caption: "The 4×4 spinner is too small to anchor a full panel; alone in open space it reads as a stray dot.",
        },
        do: {
          html: btn("default", `${spinnerEl("h-4 w-4")}<span>Saving…</span>`, "default", " disabled"),
          caption: "Use the small size inline: inside a button or beside a line of text where its scale matches the type.",
        },
      },
      {
        title: "default",
        dont: {
          html: `<div class="rounded-md bg-muted p-3">${spinnerEl("w-12 h-5")}</div>`,
          caption: "Don't stretch it with conflicting w/h utilities; a spinner must stay a perfect circle to spin cleanly.",
        },
        do: {
          html: `<div class="flex flex-col items-center gap-2 rounded-lg border border-border p-6">${spinnerEl("h-5 w-5")}<span class="text-sm text-muted-foreground">Loading…</span></div>`,
          caption: "Keep the default square and centered with a label for small content panels and cards.",
        },
      },
      {
        title: "lg",
        dont: {
          html: `<button class="${btnBase} ${btnVariant.default} ${btnSize.sm}" disabled>${spinnerEl("h-8 w-8")}</button>`,
          caption: "The 8×8 spinner overflows a small control; cramming the large size into a button breaks its height.",
        },
        do: {
          html: `<div class="flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-border">${spinnerEl("h-8 w-8")}<span class="text-sm text-muted-foreground">Loading dashboard…</span></div>`,
          caption: "Reserve the large size for section- or page-level loading, centered in the empty content area.",
        },
      },
    ],
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
    donts: [
      {
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
      },
      {
        title: "Triggered",
        dont: {
          html: `<div class="inline-block">${btn("outline", "Open popover", "sm")}<div class="${popoverCls} mt-2 min-w-[240px]"><p class="text-sm">No anchor, no dismiss, no Close.</p></div></div>`,
          caption: "A trigger with no relative anchor and no way to dismiss leaves the panel floating loose and stuck open.",
        },
        do: {
          html: `<div class="relative inline-block" onclick="event.stopPropagation()">${btn("outline", "Open popover", "sm", ` onclick="var p=this.nextElementSibling;if(p.classList.contains('hidden')){p.classList.remove('hidden');var close=function(e){if(!p.contains(e.target)){p.classList.add('hidden');document.removeEventListener('click',close)}};setTimeout(function(){document.addEventListener('click',close)},0)}else{p.classList.add('hidden')}"`)}<div data-pop class="${popoverCls} absolute left-0 top-full z-10 mt-2 min-w-[240px]"><p class="mb-2 text-sm">Anchored to the trigger, closes on outside click.</p>${btn("outline", "Close", "sm", ` onclick="this.closest('[data-pop]').classList.add('hidden')"`)}</div></div>`,
          caption: "Wrap the trigger in a relative anchor and dismiss on outside click so the panel positions and closes predictably.",
        },
      },
      {
        title: "Inline",
        dont: {
          html: `<div class="${popoverCls} max-h-[120px] min-w-[260px] overflow-auto">
  <label class="${labelCls}">Street</label><input class="${inputBase} mb-2">
  <label class="${labelCls}">City</label><input class="${inputBase} mb-2">
  <label class="${labelCls}">Region</label><input class="${inputBase} mb-2">
  <label class="${labelCls}">Postal code</label><input class="${inputBase} mb-2">
</div>`,
          caption: "An always-visible panel that scrolls internally is doing a card's or section's job; use the panel chrome only for short content.",
        },
        do: {
          html: `<div class="${popoverCls} min-w-[240px]"><p class="mb-2 text-sm">Saved to drafts. Publish when ready.</p>${btn("outline", "Publish", "sm")}</div>`,
          caption: "Reserve the static panel for a brief always-on message with a single follow-up action.",
        },
      },
    ],
  },

  {
    slug: "row-menu",
    name: "Row Menu",
    description: "Vertical action menu items and navigation links.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "kind", label: "Kind", options: ["actions", "links"], cols: 2 },
        { type: "check", key: "label", label: "Section label" },
        { type: "check", key: "icons", label: "Leading icons" },
        { type: "check", key: "destructive", label: "Destructive item", disabledWhen: (s) => s.kind !== "actions" },
      ],
      defaults: { kind: "actions", label: false, icons: false, destructive: true },
      render: (s) => {
        const ico = (d: string) => s.icons ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">${d}</svg>` : "";
        const header = s.label ? `<div class="${menuLabel}">${s.kind === "links" ? "Account" : "Actions"}</div>` : "";
        if (s.kind === "links") {
          const link = (label: string, active: boolean) =>
            `<a href="#" class="${active ? navlinkActive : navlink} flex items-center gap-2">${ico(`<circle cx="12" cy="12" r="10"/>`)}<span>${label}</span></a>`;
          return `<nav class="${menuBase} inline-flex flex-col" onclick="if(!event.target.closest('a'))return;event.preventDefault();var a=event.target.closest('a');this.querySelectorAll('a').forEach(function(l){l.className='${navlink} flex items-center gap-2'});a.className='${navlinkActive} flex items-center gap-2'">
  ${header}${link("Profile", true)}
  ${link("Billing", false)}
  ${link("Members", false)}
  ${link("Settings", false)}
</nav>`;
        }
        const danger = s.destructive
          ? `<div class="${menuSep}"></div>${menuItemEl(`${ico(`<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`)}<span>Delete</span>`, "text-destructive", " data-danger")}`
          : "";
        return `<div class="${menuBase} inline-flex flex-col" onclick="var t=event.target.closest('[data-menu-item]');if(!t)return;var o=t.textContent;t.classList.add('bg-accent');t.textContent=t.dataset.danger!==undefined?'Deleted!':o==='Edit'?'Editing…':'Duplicated!';setTimeout(function(){t.textContent=o;t.classList.remove('bg-accent')},1500)">
  ${header}${menuItemEl(`${ico(`<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>`)}<span>Edit</span>`)}
  ${menuItemEl(`${ico(`<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`)}<span>Duplicate</span>`)}${danger}
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Actions",
        dont: {
          html: `<div class="${menuBase} inline-flex flex-col"${menuFlash}>${menuItemEl("Edit")}${menuItemEl("Delete", "text-destructive")}${menuItemEl("Duplicate")}</div>`,
          caption: "Click an item: a destructive action sandwiched between routine ones invites a costly misclick.",
        },
        do: {
          html: `<div class="${menuBase} inline-flex flex-col"${menuFlash}>${menuItemEl("Edit")}${menuItemEl("Duplicate")}<div class="${menuSep}"></div>${menuItemEl("Delete", "text-destructive")}</div>`,
          caption: "Click an item: place destructive actions last, color them, and split them off with a divider.",
        },
      },
      {
        title: "Links",
        dont: {
          html: `<nav class="${menuBase} inline-flex flex-col">${["Profile", "Billing", "Members"].map((l) => `<button type="button" class="${navlink} text-left">${l}</button>`).join("")}</nav>`,
          caption: "Buttons can't be opened in a new tab, bookmarked, or middle-clicked, navigation needs real links.",
        },
        do: {
          html: `<nav class="${menuBase} inline-flex flex-col"><a href="#" class="${navlinkActive}">Profile</a><a href="#" class="${navlink}">Billing</a><a href="#" class="${navlink}">Members</a></nav>`,
          caption: "Use <a href> anchors so links behave like links, and mark the current page with an active highlight.",
        },
      },
    ],
  },

  {
    slug: "action-panels",
    name: "Action Panels",
    description: "Section card with headline, body text, and a primary action. Used to surface a single decision or call-to-action.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["simple", "form", "side-by-side", "toggle"], cols: 4 },
        { type: "text", key: "title", label: "Title", disabledWhen: (s) => s.variant === "form" },
        { type: "check", key: "destructive", label: "Destructive action", disabledWhen: (s) => s.variant === "form" || s.variant === "toggle" },
        { type: "check", key: "on", label: "Enabled", disabledWhen: (s) => s.variant !== "toggle" },
      ],
      defaults: { variant: "simple", title: "Delete this project", destructive: true, on: true },
      render: (s) => {
        if (s.variant === "form") {
          return `<div class="${cardCls} max-w-[560px] p-6">
  <div class="mb-1 text-[15px] font-semibold">Subscribe to updates</div>
  <div class="mb-4 text-sm text-muted-foreground">We'll send you a weekly digest of what changed.</div>
  <div class="flex max-w-[360px] gap-2">
    <input class="${inputBase} flex-1" type="email" placeholder="you@example.com" />
    <button class="${btnBase} ${btnVariant.default} ${btnSize.default}" onclick="var b=this;var inp=b.parentElement.querySelector('input');if(!inp.value){inp.classList.add('ring-2','ring-destructive');inp.placeholder='Enter your email';setTimeout(function(){inp.classList.remove('ring-2','ring-destructive');inp.placeholder='you@example.com'},2000);return}b.disabled=true;b.textContent='Subscribed!';inp.disabled=true;setTimeout(function(){b.textContent='Subscribe';b.disabled=false;inp.disabled=false;inp.value=''},2000)">Subscribe</button>
  </div>
</div>`;
        }
        if (s.variant === "side-by-side") {
          const act = s.destructive === true
            ? btn("destructive", "Discard", "sm", ` onclick="var b=this;b.disabled=true;b.textContent='Discarded!';setTimeout(function(){b.textContent='Discard';b.disabled=false},2000)"`)
            : btn("default", "Save", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Saved!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)"`);
          return `<div data-card class="${cardCls} flex max-w-[560px] items-start gap-6 p-6">
  <div class="flex-1">
    <div class="mb-1 text-[15px] font-semibold">${(s.title as string) || "Discard unsaved changes?"}</div>
    <div class="text-sm text-muted-foreground">You have unsaved edits in this form. Leaving now will lose all progress.</div>
  </div>
  <div class="flex shrink-0 gap-2">${btn("outline", "Cancel", "sm", ` onclick="var card=this.closest('[data-card]');card.style.opacity='0.5';setTimeout(function(){card.style.opacity='1'},1000)"`)}${act}</div>
</div>`;
        }
        if (s.variant === "toggle") {
          return `<div class="${cardCls} flex max-w-[560px] items-start justify-between gap-6 p-6">
  <div class="flex-1">
    <div class="mb-1 text-[15px] font-semibold">${(s.title as string) || "Two-factor authentication"}</div>
    <div class="text-sm text-muted-foreground">Add an extra layer of security to your account by requiring a verification code on login.</div>
  </div>
  <label class="shrink-0 cursor-pointer">${switchEl(s.on === true)}</label>
</div>`;
        }
        const act = s.destructive === true
          ? btn("destructive", "Delete project", "sm", ` onclick="var b=this;var orig=b.textContent;b.disabled=true;b.textContent='Deleted!';setTimeout(function(){b.textContent=orig;b.disabled=false},2000)"`)
          : btn("default", "Save changes", "sm", ` onclick="var b=this;var orig=b.textContent;b.disabled=true;b.textContent='Saved!';setTimeout(function(){b.textContent=orig;b.disabled=false},2000)"`);
        return `<div class="${cardCls} max-w-[560px] p-6">
  <div class="mb-1 text-[15px] font-semibold">${(s.title as string) || "Delete this project"}</div>
  <div class="mb-4 text-sm text-muted-foreground">Once you delete a project, there is no going back. Please be certain.</div>
  ${act}
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Simple",
        dont: {
          html: `<div class="${cardCls} max-w-[420px] p-6">
  <div class="mb-4 text-[15px] font-semibold">Delete this project</div>
  ${btn("destructive", "Delete project", "sm")}
</div>`,
          caption: "A destructive action with no consequence copy invites accidental, irreversible clicks.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[420px] p-6">
  <div class="mb-1 text-[15px] font-semibold">Delete this project</div>
  <div class="mb-4 text-sm text-muted-foreground">Once you delete a project, there is no going back. Please be certain.</div>
  ${btn("destructive", "Delete project", "sm")}
</div>`,
          caption: "Spell out the consequence above the button so the stakes are clear before the click.",
        },
      },
      {
        title: "With form inline",
        dont: {
          html: `<div class="${cardCls} max-w-[420px] p-6">
  <div class="mb-1 text-[15px] font-semibold">Subscribe to updates</div>
  <div class="mb-4 text-sm text-muted-foreground">We'll send you a weekly digest of what changed.</div>
  <input class="${inputBase}" type="email" placeholder="you@example.com" />
  <div class="mt-2">${btn("default", "Subscribe", "default")}</div>
</div>`,
          caption: "Stacking the field above its button breaks the single-decision rhythm and adds a row of dead space.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[420px] p-6">
  <div class="mb-1 text-[15px] font-semibold">Subscribe to updates</div>
  <div class="mb-4 text-sm text-muted-foreground">We'll send you a weekly digest of what changed.</div>
  <div class="flex gap-2">
    <input class="${inputBase} flex-1" type="email" placeholder="you@example.com" />
    ${btn("default", "Subscribe", "default")}
  </div>
</div>`,
          caption: "Keep the input and its submit button on one row so the input + action reads as one step.",
        },
      },
      {
        title: "Side-by-side",
        dont: {
          html: `<div class="${cardCls} flex max-w-[460px] items-start gap-6 p-6">
  <div class="flex-1">
    <div class="mb-1 text-[15px] font-semibold">Discard unsaved changes?</div>
    <div class="text-sm text-muted-foreground">You have unsaved edits in this form. Leaving now will lose all progress.</div>
  </div>
  <div class="flex shrink-0 gap-2">${btn("destructive", "Discard", "sm")}${btn("destructive", "Cancel", "sm")}</div>
</div>`,
          caption: "Two destructive-styled buttons make the safe escape (Cancel) look as dangerous as the discard.",
        },
        do: {
          html: `<div class="${cardCls} flex max-w-[460px] items-start gap-6 p-6">
  <div class="flex-1">
    <div class="mb-1 text-[15px] font-semibold">Discard unsaved changes?</div>
    <div class="text-sm text-muted-foreground">You have unsaved edits in this form. Leaving now will lose all progress.</div>
  </div>
  <div class="flex shrink-0 gap-2">${btn("outline", "Cancel", "sm")}${btn("destructive", "Discard", "sm")}</div>
</div>`,
          caption: "Style only the irreversible action as destructive; keep the cancel/escape as a quiet outline button.",
        },
      },
      {
        title: "With toggle",
        dont: {
          html: `<div class="${cardCls} flex max-w-[460px] items-start justify-between gap-6 p-6">
  <div class="flex-1">
    <div class="text-[15px] font-semibold">Two-factor authentication</div>
  </div>
  <label class="shrink-0 cursor-pointer">${switchEl(true)}</label>
</div>`,
          caption: "A bare switch with no description leaves the user guessing what flipping it actually changes.",
        },
        do: {
          html: `<div class="${cardCls} flex max-w-[460px] items-start justify-between gap-6 p-6">
  <div class="flex-1">
    <div class="mb-1 text-[15px] font-semibold">Two-factor authentication</div>
    <div class="text-sm text-muted-foreground">Add an extra layer of security to your account by requiring a verification code on login.</div>
  </div>
  <label class="shrink-0 cursor-pointer">${switchEl(true)}</label>
</div>`,
          caption: "Pair the switch with a one-line explanation of what turning it on or off does.",
        },
      }
    ]
  },

  {
    slug: "description-lists",
    name: "Description Lists",
    description: "Key-value pairs in stacked, two-column, or inline-edit layouts. Used for detail panels, settings, and profile views.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Layout", options: ["two-column", "inline-edit", "stacked"], cols: 3 },
      ],
      defaults: { variant: "two-column" },
      render: (s) => {
        if (s.variant === "inline-edit") {
          return `<div class="${cardCls} max-w-[640px]">
  <div class="border-b border-border px-6 py-4"><div class="text-[15px] font-semibold">Profile</div></div>
  <dl class="px-6" onclick="var btn=event.target.closest('button');if(!btn)return;var row=btn.closest('[data-row]');var dd=row.querySelector('dd');if(btn.textContent==='Update'){var inp=document.createElement('input');inp.className='${inputBase.replace("h-9", "h-8")}';inp.value=dd.textContent;dd.textContent='';dd.appendChild(inp);inp.focus();btn.textContent='Save'}else{var inp=dd.querySelector('input');dd.textContent=inp?inp.value:dd.textContent;btn.textContent='Update'}">
    <div data-row class="grid grid-cols-[160px_1fr_auto] items-baseline gap-4 border-b border-border py-3.5 text-sm"><dt class="text-muted-foreground">Name</dt><dd>Rachel Chen</dd>${btn("link", "Update", "sm")}</div>
    <div data-row class="grid grid-cols-[160px_1fr_auto] items-baseline gap-4 border-b border-border py-3.5 text-sm"><dt class="text-muted-foreground">Email</dt><dd>rachel.chen@example.com</dd>${btn("link", "Update", "sm")}</div>
    <div data-row class="grid grid-cols-[160px_1fr_auto] items-baseline gap-4 py-3.5 text-sm"><dt class="text-muted-foreground">Title</dt><dd>Senior Engineer</dd>${btn("link", "Update", "sm")}</div>
  </dl>
</div>`;
        }
        if (s.variant === "stacked") {
          return `<div class="${cardCls} max-w-[320px] p-6">
  <dl class="flex flex-col gap-4">
    <div>
      <dt class="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Full name</dt>
      <dd class="text-sm">Rachel Chen</dd>
    </div>
    <div>
      <dt class="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
      <dd class="text-sm">rachel.chen@example.com</dd>
    </div>
    <div>
      <dt class="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Client ID</dt>
      <dd class="break-all font-mono text-[12.5px]">clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF</dd>
    </div>
  </dl>
</div>`;
        }
        return `<div class="${cardCls} max-w-[640px]">
  <div class="border-b border-border px-6 py-4">
    <div class="text-[15px] font-semibold">Application details</div>
    <div class="text-xs text-muted-foreground">Personal information and credentials.</div>
  </div>
  <dl class="px-6">
    <div class="grid grid-cols-[160px_1fr] gap-4 border-b border-border py-3.5 text-sm"><dt class="text-muted-foreground">Full name</dt><dd>Rachel Chen</dd></div>
    <div class="grid grid-cols-[160px_1fr] gap-4 border-b border-border py-3.5 text-sm"><dt class="text-muted-foreground">Email</dt><dd>rachel.chen@example.com</dd></div>
    <div class="grid grid-cols-[160px_1fr] gap-4 border-b border-border py-3.5 text-sm"><dt class="text-muted-foreground">Role</dt><dd>${badge("secondary", "admin")}</dd></div>
    <div class="grid grid-cols-[160px_1fr] gap-4 py-3.5 text-sm"><dt class="text-muted-foreground">Status</dt><dd>${statusBadge("success", "Active")}</dd></div>
  </dl>
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Two-column",
        dont: {
          html: `<dl class="max-w-[420px]">
  <div class="grid grid-cols-[64px_1fr] gap-4 border-b border-border py-3 text-sm"><dt class="text-muted-foreground">Client identifier</dt><dd class="break-all font-mono text-[12.5px]">clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF</dd></div>
  <div class="grid grid-cols-[64px_1fr] gap-4 py-3 text-sm"><dt class="text-muted-foreground">Status</dt><dd>${statusBadge("success", "Active")}</dd></div>
</dl>`,
          caption: "A too-narrow label column wraps the longest term and knocks the two columns out of alignment.",
        },
        do: {
          html: `<dl class="max-w-[420px]">
  <div class="grid grid-cols-[160px_1fr] gap-4 border-b border-border py-3 text-sm"><dt class="text-muted-foreground">Client identifier</dt><dd class="break-all font-mono text-[12.5px]">clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF</dd></div>
  <div class="grid grid-cols-[160px_1fr] gap-4 py-3 text-sm"><dt class="text-muted-foreground">Status</dt><dd>${statusBadge("success", "Active")}</dd></div>
</dl>`,
          caption: "Fix the label column wide enough for the longest term so every value lines up on one edge.",
        },
      },
      {
        title: "Inline-edit",
        dont: {
          html: `<dl class="max-w-[420px]">
  <div class="grid grid-cols-[160px_1fr] items-baseline gap-4 py-3.5 text-sm"><dt class="text-muted-foreground">Name</dt><dd>Rachel Chen</dd></div>
  <div class="grid grid-cols-[160px_1fr] items-baseline gap-4 py-3.5 text-sm"><dt class="text-muted-foreground">Email</dt><dd>rachel.chen@example.com</dd></div>
</dl>`,
          caption: "Editable rows that look identical to read-only ones give no hint a value can be changed.",
        },
        do: {
          html: `<dl class="max-w-[420px]">
  <div class="grid grid-cols-[160px_1fr_auto] items-baseline gap-4 py-3.5 text-sm"><dt class="text-muted-foreground">Name</dt><dd>Rachel Chen</dd>${btn("link", "Update", "sm")}</div>
  <div class="grid grid-cols-[160px_1fr_auto] items-baseline gap-4 py-3.5 text-sm"><dt class="text-muted-foreground">Email</dt><dd>rachel.chen@example.com</dd>${btn("link", "Update", "sm")}</div>
</dl>`,
          caption: "Give every editable row a trailing Update affordance so the inline editor is discoverable.",
        },
      },
      {
        title: "Stacked",
        dont: {
          html: `<dl class="max-w-[320px] flex flex-col gap-4">
  <div><dt class="mb-1 text-sm">Full name</dt><dd class="text-sm text-muted-foreground">Rachel Chen</dd></div>
  <div><dt class="mb-1 text-sm">Email</dt><dd class="text-sm text-muted-foreground">rachel.chen@example.com</dd></div>
</dl>`,
          caption: "Muting the value and bolding nothing inverts the hierarchy; the label outweighs the data it describes.",
        },
        do: {
          html: `<dl class="max-w-[320px] flex flex-col gap-4">
  <div><dt class="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Full name</dt><dd class="text-sm">Rachel Chen</dd></div>
  <div><dt class="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Email</dt><dd class="text-sm">rachel.chen@example.com</dd></div>
</dl>`,
          caption: "Keep the label small, uppercase, and muted above a full-weight value so the data stays primary.",
        },
      }
    ]
  },

  {
    slug: "feeds",
    name: "Feeds",
    description: "Vertical activity streams with icons and timestamps. Used for audit logs, change history, and notification lists.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["connector", "avatar"], cols: 2 },
      ],
      defaults: { variant: "connector" },
      render: (s) => {
        if (s.variant === "avatar") {
          return `<div class="${cardCls} max-w-[560px]">
  <div class="flex items-start gap-3 border-b border-border px-5 py-4">
    <span class="${avatarBase} h-10 w-10 shrink-0"><img src="/rachel-chen.jpg" alt="RC" class="h-full w-full object-cover"></span>
    <div class="min-w-0 flex-1"><div class="text-sm"><span class="font-semibold">Rachel Chen</span> <span class="text-muted-foreground">commented on the pull request</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">2 hours ago</div></div>
  </div>
  <div class="flex items-start gap-3 border-b border-border px-5 py-4">
    <span class="${avatarBase} h-10 w-10 shrink-0"><img src="/ada-lovelace.jpg" alt="AL" class="h-full w-full object-cover"></span>
    <div class="min-w-0 flex-1"><div class="text-sm"><span class="font-semibold">Ada Lovelace</span> <span class="text-muted-foreground">pushed 3 commits</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">5 hours ago</div></div>
  </div>
  <div class="flex items-start gap-3 px-5 py-4">
    <span class="${avatarBase} h-10 w-10 shrink-0">KT</span>
    <div class="min-w-0 flex-1"><div class="text-sm"><span class="font-semibold">Kevin Turner</span> <span class="text-muted-foreground">opened the pull request</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">1 day ago</div></div>
  </div>
</div>`;
        }
        return `<div class="${cardCls} max-w-[560px] p-6">
  <ul class="m-0 list-none p-0">
    <li class="relative flex gap-3 pb-6">
      <div class="absolute bottom-0 left-[13px] top-7 w-px bg-border"></div>
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="flex-1 pt-0.5"><div class="text-sm"><span class="font-semibold">Rachel Chen</span> <span class="text-muted-foreground">approved the request</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">2 hours ago</div></div>
    </li>
    <li class="relative flex gap-3 pb-6">
      <div class="absolute bottom-0 left-[13px] top-7 w-px bg-border"></div>
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></div>
      <div class="flex-1 pt-0.5"><div class="text-sm"><span class="font-semibold">Ada Lovelace</span> <span class="text-muted-foreground">updated the description</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">5 hours ago</div></div>
    </li>
    <li class="flex gap-3">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
      <div class="flex-1 pt-0.5"><div class="text-sm"><span class="font-semibold">System</span> <span class="text-muted-foreground">created the project</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">3 days ago</div></div>
    </li>
  </ul>
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Connector",
        dont: {
          html: `<div class="${cardCls} max-w-[420px] p-6">
  <ul class="m-0 list-none p-0">
    <li class="relative flex gap-3 pb-6">
      <div class="absolute -bottom-6 left-[13px] top-7 w-px bg-border"></div>
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="flex-1 pt-0.5"><div class="text-sm"><span class="font-semibold">Rachel Chen</span> <span class="text-muted-foreground">approved the request</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">2 hours ago</div></div>
    </li>
    <li class="relative flex gap-3">
      <div class="absolute -bottom-6 left-[13px] top-7 w-px bg-border"></div>
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
      <div class="flex-1 pt-0.5"><div class="text-sm"><span class="font-semibold">System</span> <span class="text-muted-foreground">created the project</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">3 days ago</div></div>
    </li>
  </ul>
</div>`,
          caption: "Running the connector line past the final event leaves a dangling tail pointing at nothing.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[420px] p-6">
  <ul class="m-0 list-none p-0">
    <li class="relative flex gap-3 pb-6">
      <div class="absolute bottom-0 left-[13px] top-7 w-px bg-border"></div>
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="flex-1 pt-0.5"><div class="text-sm"><span class="font-semibold">Rachel Chen</span> <span class="text-muted-foreground">approved the request</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">2 hours ago</div></div>
    </li>
    <li class="flex gap-3">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
      <div class="flex-1 pt-0.5"><div class="text-sm"><span class="font-semibold">System</span> <span class="text-muted-foreground">created the project</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">3 days ago</div></div>
    </li>
  </ul>
</div>`,
          caption: "Drop the connector on the last item so the line terminates cleanly at the final event.",
        },
      },
      {
        title: "Avatar",
        dont: {
          html: `<div class="${cardCls} max-w-[420px]">
  <div class="flex items-start gap-3 px-5 py-4">
    <span class="${avatarBase} h-10 w-10 shrink-0">?</span>
    <div class="min-w-0 flex-1"><div class="text-sm text-muted-foreground">Pushed 3 commits</div></div>
  </div>
</div>`,
          caption: "An anonymous avatar with no actor name and no timestamp strips the row of the who and the when.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[420px]">
  <div class="flex items-start gap-3 px-5 py-4">
    <span class="${avatarBase} h-10 w-10 shrink-0"><img src="/ada-lovelace.jpg" alt="AL" class="h-full w-full object-cover"></span>
    <div class="min-w-0 flex-1"><div class="text-sm"><span class="font-semibold">Ada Lovelace</span> <span class="text-muted-foreground">pushed 3 commits</span></div><div class="mt-0.5 text-[11.5px] text-muted-foreground">5 hours ago</div></div>
  </div>
</div>`,
          caption: "Lead with the person's avatar, bold the actor, and keep the action plus a relative timestamp muted.",
        },
      },
    ]
  },

  {
    slug: "grid-lists",
    name: "Grid Lists",
    description: "Tiled card grids for people directories, item collections, and image galleries.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["people", "gallery"], cols: 2 },
      ],
      defaults: { variant: "people" },
      render: (s) => {
        if (s.variant === "gallery") {
          return `<div class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">${[
  { name: "hero-banner.png", size: "1.2 MB", grad: "from-primary/30 to-primary/10" },
  { name: "icon-set.svg", size: "340 KB", grad: "from-blue-500/30 to-blue-500/10" },
  { name: "product-shot.jpg", size: "2.8 MB", grad: "from-emerald-500/30 to-emerald-500/10" },
  { name: "avatar-default.png", size: "96 KB", grad: "from-amber-500/30 to-amber-500/10" },
].map((f) => `<div><div class="aspect-square overflow-hidden rounded-md bg-gradient-to-br ${f.grad}"></div><div class="mt-2"><div class="truncate text-[12.5px] font-medium">${f.name}</div><div class="text-[11px] text-muted-foreground">${f.size}</div></div></div>`).join("")}</div>`;
        }
        return `<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">${[
  { name: "Rachel Chen", role: "Engineering Lead", img: "/rachel-chen.jpg", initials: "RC" },
  { name: "Ada Lovelace", role: "Staff Engineer", img: "/ada-lovelace.jpg", initials: "AL" },
  { name: "Kevin Turner", role: "Product Designer", img: "", initials: "KT" },
].map((p) => `<div class="${cardCls} flex flex-col items-center gap-2 p-5 text-center"><span class="${avatarBase} h-16 w-16 text-2xl">${p.img ? `<img src="${p.img}" alt="${p.initials}" class="h-full w-full object-cover">` : p.initials}</span><div class="text-sm font-semibold">${p.name}</div><div class="text-xs text-muted-foreground">${p.role}</div><div class="mt-3 flex gap-2">${btn("outline", "Message", "sm", ` onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Sent!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)"`)}${btn("ghost", "View", "sm", ` onclick="var b=this;b.classList.add('bg-accent');setTimeout(function(){b.classList.remove('bg-accent')},300)"`)}</div></div>`).join("")}</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "People (card grid)",
        dont: {
          html: `<div class="grid grid-cols-4 gap-3.5">${[
  { name: "Rachel Chen", role: "Engineering Lead", initials: "RC" },
  { name: "Ada Lovelace", role: "Staff Engineer", initials: "AL" },
  { name: "Kevin Turner", role: "Product Designer", initials: "KT" },
].map((p) => `<div class="${cardCls} flex w-[200px] flex-col items-center gap-2 p-5 text-center"><span class="${avatarBase} h-16 w-16 text-2xl">${p.initials}</span><div class="text-sm font-semibold">${p.name}</div><div class="text-xs text-muted-foreground">${p.role}</div></div>`).join("")}</div>`,
          caption: "A fixed column count with hard-width cards overflows the row on narrow viewports instead of reflowing.",
        },
        do: {
          html: `<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">${[
  { name: "Rachel Chen", role: "Engineering Lead", initials: "RC" },
  { name: "Ada Lovelace", role: "Staff Engineer", initials: "AL" },
  { name: "Kevin Turner", role: "Product Designer", initials: "KT" },
].map((p) => `<div class="${cardCls} flex flex-col items-center gap-2 p-5 text-center"><span class="${avatarBase} h-16 w-16 text-2xl">${p.initials}</span><div class="text-sm font-semibold">${p.name}</div><div class="text-xs text-muted-foreground">${p.role}</div></div>`).join("")}</div>`,
          caption: "Let auto-fill minmax columns size to the available width so cards wrap cleanly at any breakpoint.",
        },
      },
      {
        title: "Image gallery",
        dont: {
          html: `<div class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">${[
  { name: "hero-banner.png", h: "h-24", grad: "from-primary/30 to-primary/10" },
  { name: "icon-set.svg", h: "h-40", grad: "from-blue-500/30 to-blue-500/10" },
  { name: "product-shot.jpg", h: "h-16", grad: "from-emerald-500/30 to-emerald-500/10" },
  { name: "avatar-default.png", h: "h-32", grad: "from-amber-500/30 to-amber-500/10" },
].map((f) => `<div><div class="${f.h} overflow-hidden rounded-md bg-gradient-to-br ${f.grad}"></div><div class="mt-2 truncate text-[12.5px] font-medium">${f.name}</div></div>`).join("")}</div>`,
          caption: "Letting each thumbnail keep its intrinsic height makes a ragged grid and shifts the layout as images load.",
        },
        do: {
          html: `<div class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">${[
  { name: "hero-banner.png", grad: "from-primary/30 to-primary/10" },
  { name: "icon-set.svg", grad: "from-blue-500/30 to-blue-500/10" },
  { name: "product-shot.jpg", grad: "from-emerald-500/30 to-emerald-500/10" },
  { name: "avatar-default.png", grad: "from-amber-500/30 to-amber-500/10" },
].map((f) => `<div><div class="aspect-square overflow-hidden rounded-md bg-gradient-to-br ${f.grad}"></div><div class="mt-2 truncate text-[12.5px] font-medium">${f.name}</div></div>`).join("")}</div>`,
          caption: "Lock a consistent aspect ratio so the grid stays even and nothing reflows once thumbnails load.",
        },
      },
    ]
  },

  {
    slug: "media-objects",
    name: "Media Objects",
    description: "Image or icon paired with text content. The fundamental building block for list items, notifications, and comment layouts.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["avatar", "icon", "action"], cols: 3 },
      ],
      defaults: { variant: "avatar" },
      render: (s) => {
        if (s.variant === "icon") {
          return `<div class="grid max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-2">
  <div class="${cardCls} flex items-start gap-3 p-4">
  <div class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
  <div class="min-w-0 flex-1"><div class="text-[13.5px] font-semibold">Security first</div><div class="mt-0.5 text-xs leading-snug text-muted-foreground">End-to-end encryption with automatic key rotation.</div></div>
</div>
  <div class="${cardCls} flex items-start gap-3 p-4">
  <div class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
  <div class="min-w-0 flex-1"><div class="text-[13.5px] font-semibold">Real-time analytics</div><div class="mt-0.5 text-xs leading-snug text-muted-foreground">Live dashboards with sub-second refresh latency.</div></div>
</div>
</div>`;
        }
        if (s.variant === "action") {
          return `<div class="${cardCls} flex max-w-[480px] items-center gap-3 p-4">
  <span class="${avatarBase} h-10 w-10 shrink-0"><img src="/ada-lovelace.jpg" alt="AL" class="h-full w-full object-cover"></span>
  <div class="min-w-0 flex-1">
    <div class="truncate text-[13.5px] font-semibold">Ada Lovelace</div>
    <div class="truncate text-xs text-muted-foreground">ada@example.com</div>
  </div>
  <button class="${btnBase} ${btnVariant.outline} ${btnSize.sm} shrink-0" onclick="var b=this;var o=b.textContent;b.disabled=true;b.textContent='Invited!';setTimeout(function(){b.textContent=o;b.disabled=false},2000)">Invite</button>
</div>`;
        }
        return `<div class="${cardCls} flex max-w-[480px] items-start gap-4 p-5">
  <span class="${avatarBase} h-12 w-12 shrink-0 text-lg"><img src="/rachel-chen.jpg" alt="RC" class="h-full w-full object-cover"></span>
  <div class="min-w-0 flex-1">
    <div class="text-[14.5px] font-semibold">Rachel Chen</div>
    <div class="text-xs text-muted-foreground">Engineering Lead</div>
    <div class="mt-2 text-sm leading-relaxed">Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging.</div>
  </div>
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Avatar",
        dont: {
          html: `<div class="${cardCls} flex max-w-[480px] items-center gap-4 p-5">
  <span class="${avatarBase} h-12 w-12 shrink-0 text-lg"><img src="/rachel-chen.jpg" alt="RC" class="h-full w-full object-cover"></span>
  <div class="min-w-0 flex-1">
    <div class="text-[14.5px] font-semibold">Rachel Chen</div>
    <div class="text-xs text-muted-foreground">Engineering Lead</div>
    <div class="mt-2 text-sm leading-relaxed">Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging.</div>
  </div>
</div>`,
          caption: "Centering the avatar against a multi-line body leaves it floating beside the middle of the text.",
        },
        do: {
          html: `<div class="${cardCls} flex max-w-[480px] items-start gap-4 p-5">
  <span class="${avatarBase} h-12 w-12 shrink-0 text-lg"><img src="/rachel-chen.jpg" alt="RC" class="h-full w-full object-cover"></span>
  <div class="min-w-0 flex-1">
    <div class="text-[14.5px] font-semibold">Rachel Chen</div>
    <div class="text-xs text-muted-foreground">Engineering Lead</div>
    <div class="mt-2 text-sm leading-relaxed">Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging.</div>
  </div>
</div>`,
          caption: "Top-align with items-start so the avatar anchors to the first line of the title.",
        },
      },
      {
        title: "Icon",
        dont: {
          html: `<div class="${cardCls} flex items-start gap-3 p-4">
  <div class="inline-flex shrink-0 items-center justify-center rounded-md bg-primary/15 p-2 text-primary"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
  <div class="min-w-0 flex-1"><div class="text-[13.5px] font-semibold">Security first</div><div class="mt-0.5 text-xs leading-snug text-muted-foreground">End-to-end encryption with automatic key rotation.</div></div>
</div>`,
          caption: "An oversized icon box throws off the optical balance with the two-line text.",
        },
        do: {
          html: `<div class="${cardCls} flex items-start gap-3 p-4">
  <div class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
  <div class="min-w-0 flex-1"><div class="text-[13.5px] font-semibold">Security first</div><div class="mt-0.5 text-xs leading-snug text-muted-foreground">End-to-end encryption with automatic key rotation.</div></div>
</div>`,
          caption: "Fix the icon box at h-9 w-9 with an 18px glyph so it reads as a tidy lead affordance.",
        },
      },
      {
        title: "Action",
        dont: {
          html: `<div class="${cardCls} flex max-w-[480px] items-center gap-3 p-4">
  <span class="${avatarBase} h-10 w-10 shrink-0"><img src="/ada-lovelace.jpg" alt="AL" class="h-full w-full object-cover"></span>
  <div class="flex-1">
    <div class="text-[13.5px] font-semibold">Ada Lovelace</div>
    <div class="text-xs text-muted-foreground">ada.lovelace@analytical-engine.example.com</div>
  </div>
  <button class="${btnBase} ${btnVariant.outline} ${btnSize.sm}">Invite</button>
</div>`,
          caption: "Without truncation a long email wraps and pushes the trailing button out of alignment.",
        },
        do: {
          html: `<div class="${cardCls} flex max-w-[480px] items-center gap-3 p-4">
  <span class="${avatarBase} h-10 w-10 shrink-0"><img src="/ada-lovelace.jpg" alt="AL" class="h-full w-full object-cover"></span>
  <div class="min-w-0 flex-1">
    <div class="truncate text-[13.5px] font-semibold">Ada Lovelace</div>
    <div class="truncate text-xs text-muted-foreground">ada.lovelace@analytical-engine.example.com</div>
  </div>
  <button class="${btnBase} ${btnVariant.outline} ${btnSize.sm} shrink-0">Invite</button>
</div>`,
          caption: "Use min-w-0 + truncate on the text and shrink-0 on the button to keep the action pinned right.",
        },
      },
    ],
  },

  {
    slug: "stacked-lists",
    name: "Stacked Lists",
    description: "Vertical lists with avatar, two-line items, and trailing metadata. Used for contacts, activity feeds, and data previews.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["two-line", "clickable", "card"], cols: 3 },
        { type: "check", key: "divider", label: "Row dividers", disabledWhen: (s) => s.variant === "card" },
      ],
      defaults: { variant: "two-line", divider: true },
      render: (s) => {
        const div = (i: number, len: number) => (s.divider !== false && i < len - 1 ? " border-b border-border" : "");
        if (s.variant === "clickable") {
          const rows = [
            { name: "Rachel Chen", email: "rachel.chen@example.com", img: "/rachel-chen.jpg", initials: "RC", meta: "2h ago" },
            { name: "Ada Lovelace", email: "ada@example.com", img: "/ada-lovelace.jpg", initials: "AL", meta: "5h ago" },
            { name: "Kevin Turner", email: "kevin@example.com", img: "", initials: "KT", meta: "1d ago" },
          ];
          return `<div class="${cardCls} max-w-[560px]">${rows.map((u, i, a) => `<a href="#" class="flex items-center gap-3 px-5 py-3 text-inherit no-underline transition-colors hover:bg-accent${div(i, a.length)}"><span class="${avatarBase} h-10 w-10 shrink-0">${u.img ? `<img src="${u.img}" alt="${u.initials}" class="h-full w-full object-cover">` : u.initials}</span><div class="min-w-0 flex-1"><div class="truncate text-[13.5px] font-semibold">${u.name}</div><div class="truncate text-xs text-muted-foreground">${u.email}</div></div><span class="text-xs text-muted-foreground">${u.meta}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg></a>`).join("")}</div>`;
        }
        if (s.variant === "card") {
          const rows = [
            { name: "Rachel Chen", role: "Engineering Lead", img: "/rachel-chen.jpg", initials: "RC" },
            { name: "Ada Lovelace", role: "Staff Engineer", img: "/ada-lovelace.jpg", initials: "AL" },
          ];
          return `<div class="${cardCls} max-w-[560px]">
  <div class="flex items-center justify-between border-b border-border px-5 py-3">
    <span class="text-sm font-semibold">Team members</span>
    <button class="${btnBase} ${btnVariant.outline} ${btnSize.sm}" onclick="var b=this;var o=b.innerHTML;b.disabled=true;b.textContent='Added!';setTimeout(function(){b.innerHTML=o;b.disabled=false},2000)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add</button>
  </div>
  ${rows.map((u, i, a) => `<div class="flex items-center gap-3 px-5 py-3${i < a.length - 1 ? " border-b border-border" : ""}"><span class="${avatarBase} h-10 w-10 shrink-0"><img src="${u.img}" alt="${u.initials}" class="h-full w-full object-cover"></span><div class="min-w-0 flex-1"><div class="text-[13.5px] font-semibold">${u.name}</div><div class="text-xs text-muted-foreground">${u.role}</div></div><button class="${btnBase} ${btnVariant.ghost} h-7 px-2" onclick="var b=this;b.classList.add('bg-accent');setTimeout(function(){b.classList.remove('bg-accent')},300)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button></div>`).join("")}
</div>`;
        }
        const rows = [
          { name: "Rachel Chen", email: "rachel.chen@example.com", img: "/rachel-chen.jpg", initials: "RC", meta: "admin" },
          { name: "Ada Lovelace", email: "ada@example.com", img: "/ada-lovelace.jpg", initials: "AL", meta: "editor" },
          { name: "Kevin Turner", email: "kevin@example.com", img: "", initials: "KT", meta: "viewer" },
        ];
        return `<div class="${cardCls} max-w-[560px]">${rows.map((u, i, a) => `<div class="flex items-center gap-3 px-5 py-3${div(i, a.length)}"><span class="${avatarBase} h-10 w-10 shrink-0">${u.img ? `<img src="${u.img}" alt="${u.initials}" class="h-full w-full object-cover">` : u.initials}</span><div class="min-w-0 flex-1"><div class="truncate text-[13.5px] font-semibold">${u.name}</div><div class="truncate text-xs text-muted-foreground">${u.email}</div></div><span class="text-xs text-muted-foreground">${u.meta}</span></div>`).join("")}</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Two-line with avatar",
        dont: {
          html: `<div class="${cardCls} max-w-[560px]"><div class="flex items-center gap-3 px-5 py-3"><span class="${avatarBase} h-10 w-10 shrink-0">RC</span><div class="min-w-0 flex-1"><div class="text-[13.5px] font-semibold">Rachel Chen</div><div class="text-[13.5px] font-semibold">rachel.chen@example.com</div></div></div></div>`,
          caption: "Equal weight on both lines flattens the hierarchy; the email competes with the name.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[560px]"><div class="flex items-center gap-3 px-5 py-3"><span class="${avatarBase} h-10 w-10 shrink-0">RC</span><div class="min-w-0 flex-1"><div class="truncate text-[13.5px] font-semibold">Rachel Chen</div><div class="truncate text-xs text-muted-foreground">rachel.chen@example.com</div></div></div></div>`,
          caption: "Primary line bold; secondary line smaller and muted, truncated so long values never wrap.",
        },
      },
      {
        title: "Clickable",
        dont: {
          html: `<div class="${cardCls} max-w-[560px]"><div class="flex items-center gap-3 px-5 py-3"><span class="${avatarBase} h-10 w-10 shrink-0">AL</span><div class="min-w-0 flex-1"><div class="truncate text-[13.5px] font-semibold">Ada Lovelace</div><div class="truncate text-xs text-muted-foreground">ada@example.com</div></div><span class="text-xs text-muted-foreground">5h ago</span></div></div>`,
          caption: "A drilldown row with no hover state and no chevron gives no hint it is interactive.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[560px]"><a href="#" class="flex items-center gap-3 px-5 py-3 text-inherit no-underline transition-colors hover:bg-accent"><span class="${avatarBase} h-10 w-10 shrink-0">AL</span><div class="min-w-0 flex-1"><div class="truncate text-[13.5px] font-semibold">Ada Lovelace</div><div class="truncate text-xs text-muted-foreground">ada@example.com</div></div><span class="text-xs text-muted-foreground">5h ago</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg></a></div>`,
          caption: "Wrap the row in a link with a hover background and a trailing chevron to signal drilldown.",
        },
      },
      {
        title: "Card surface group",
        dont: {
          html: `<div class="${cardCls} max-w-[560px]"><div class="flex items-center justify-between px-5 py-3"><span class="text-sm font-semibold">Team members</span></div><div class="flex items-center gap-3 px-5 py-3"><span class="${avatarBase} h-10 w-10 shrink-0">RC</span><div class="min-w-0 flex-1"><div class="text-[13.5px] font-semibold">Rachel Chen</div><div class="text-xs text-muted-foreground">Engineering Lead</div></div></div></div>`,
          caption: "A header with no rule blends into the rows, and dropping the per-row action removes the affordance.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[560px]"><div class="flex items-center justify-between border-b border-border px-5 py-3"><span class="text-sm font-semibold">Team members</span><button class="${btnBase} ${btnVariant.outline} ${btnSize.sm}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add</button></div><div class="flex items-center gap-3 px-5 py-3"><span class="${avatarBase} h-10 w-10 shrink-0">RC</span><div class="min-w-0 flex-1"><div class="text-[13.5px] font-semibold">Rachel Chen</div><div class="text-xs text-muted-foreground">Engineering Lead</div></div><button class="${btnBase} ${btnVariant.ghost} h-7 px-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button></div></div>`,
          caption: "Separate the titled header with a rule and give each row a trailing action menu.",
        },
      },
    ]
  },

  {
    slug: "stats",
    name: "Stats",
    description: "Single value, grouped row, with sparkline, with comparison. Used for dashboards and overview pages.",
    category: "Molecules",
    playground: {
      controls: [
        { type: "pills", key: "variant", label: "Variant", options: ["single", "group", "plain", "sparkline"], cols: 4 },
        { type: "check", key: "delta", label: "Show delta", disabledWhen: (s) => s.variant === "plain" || s.variant === "sparkline" },
      ],
      defaults: { variant: "single", delta: true },
      render: (s) => {
        const showDelta = s.delta !== false;
        if (s.variant === "group") {
          return `<div class="w-full max-w-[680px]"><div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">${statCard("Total users", "12,847", showDelta ? "+12.5%" : "")}${statCard("Active sessions", "1,024", showDelta ? "+3.2%" : "")}${statCard("Error rate", "0.12%", showDelta ? "+0.03%" : "", "text-red-600")}</div></div>`;
        }
        if (s.variant === "plain") {
          return `<div class="${cardCls} w-full max-w-[560px] p-6"><div class="mb-4 text-[15px] font-semibold">Key metrics</div><div class="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-6">${[["Revenue", "$48.2k"], ["Orders", "842"], ["Avg. value", "$57.24"], ["Conversion", "3.6%"]].map(([l, v]) => `<div><div class="mb-1 text-xs text-muted-foreground">${l}</div><div class="text-2xl font-semibold tracking-tight">${v}</div></div>`).join("")}</div></div>`;
        }
        if (s.variant === "sparkline") {
          return `<div class="w-full max-w-[460px]"><div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
  <div class="${cardCls} p-5">
    <div class="text-xs text-muted-foreground">Requests</div>
    <div class="mt-1 flex items-baseline justify-between"><span class="text-2xl font-semibold">24.5k</span><span class="font-mono text-[11px] text-emerald-600">+8.2%</span></div>
    <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none" class="mt-2 block"><defs><linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/><stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs><polygon points="0,20 20,16 40,18 60,12 80,14 100,8 120,10 140,6 160,8 180,4 200,2 200,24 0,24" fill="url(#sg1)"/><polyline points="0,20 20,16 40,18 60,12 80,14 100,8 120,10 140,6 160,8 180,4 200,2" fill="none" stroke="var(--primary)" stroke-width="1.5"/></svg>
  </div>
  <div class="${cardCls} p-5">
    <div class="text-xs text-muted-foreground">Latency</div>
    <div class="mt-1 flex items-baseline justify-between"><span class="text-2xl font-semibold">142ms</span><span class="font-mono text-[11px] text-red-600">+12ms</span></div>
    <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none" class="mt-2 block"><defs><linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--destructive)" stop-opacity="0.3"/><stop offset="100%" stop-color="var(--destructive)" stop-opacity="0"/></linearGradient></defs><polygon points="0,18 20,16 40,14 60,12 80,10 100,12 120,8 140,6 160,4 180,2 200,4 200,24 0,24" fill="url(#sg2)"/><polyline points="0,18 20,16 40,14 60,12 80,10 100,12 120,8 140,6 160,4 180,2 200,4" fill="none" stroke="var(--destructive)" stroke-width="1.5"/></svg>
  </div>
</div></div>`;
        }
        return statCard("Active users", "71,897", showDelta ? `+12.3% <span class="font-normal text-muted-foreground">vs. last 30 days</span>` : "", "text-emerald-600", "w-full max-w-[280px]");
      },
    },
    sections: [],
    donts: [
      {
        title: "Single",
        dont: {
          html: statCard("Active users", "71,897", "+12.3%", "text-emerald-600", "max-w-[280px]"),
          caption: "A bare delta with no baseline leaves the reader asking: up against what, and over what window?",
        },
        do: {
          html: statCard("Active users", "71,897", `+12.3% <span class="font-normal text-muted-foreground">vs. last 30 days</span>`, "text-emerald-600", "max-w-[280px]"),
          caption: "Name the comparison and the period so the delta is unambiguous.",
        },
      },
      {
        title: "Group",
        dont: {
          html: `<div class="flex gap-3.5">${statCard("Revenue", "$48,250.00", "+12.5%")}${statCard("Orders", "842", "+3.2%")}${statCard("Conversion", "3.6%", "+0.4%")}</div>`,
          caption: "A fixed flex row of full-precision numbers overflows on narrow viewports and crowds the cards.",
        },
        do: {
          html: `<div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">${statCard("Revenue", "$48.2k", "+12.5%")}${statCard("Orders", "842", "+3.2%")}${statCard("Conversion", "3.6%", "+0.4%")}</div>`,
          caption: "Use the auto-fit grid and round headline numbers so cards wrap and stay scannable.",
        },
      },
      {
        title: "Plain (no border)",
        dont: {
          html: `<div class="${cardCls} p-6"><div class="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-6">${[["Revenue", "$48.2k"], ["Orders", "842"]].map(([l, v]) => `<div class="${cardCls} p-5"><div class="mb-1 text-xs text-muted-foreground">${l}</div><div class="text-2xl font-semibold tracking-tight">${v}</div></div>`).join("")}</div></div>`,
          caption: "Bordered cards inside a card surface double the chrome: a box drawn around boxes.",
        },
        do: {
          html: `<div class="${cardCls} p-6"><div class="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-6">${[["Revenue", "$48.2k"], ["Orders", "842"]].map(([l, v]) => `<div><div class="mb-1 text-xs text-muted-foreground">${l}</div><div class="text-2xl font-semibold tracking-tight">${v}</div></div>`).join("")}</div></div>`,
          caption: "On a parent surface drop the border and radius; let the number stacks stand on their own.",
        },
      },
      {
        title: "With sparkline",
        dont: {
          html: `<div class="${cardCls} max-w-[220px] p-5"><div class="text-xs text-muted-foreground">Requests</div><div class="mt-1 text-2xl font-semibold">24.5k</div><svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none" class="mt-2 block"><polyline points="0,20 20,16 40,18 60,12 80,14 100,8 120,10 140,6 160,8 180,4 200,2" fill="none" stroke="var(--primary)" stroke-width="1.5"/></svg></div>`,
          caption: "A trend line with no current delta makes you eyeball the slope to guess the direction.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[220px] p-5"><div class="text-xs text-muted-foreground">Requests</div><div class="mt-1 flex items-baseline justify-between"><span class="text-2xl font-semibold">24.5k</span><span class="font-mono text-[11px] text-emerald-600">+8.2%</span></div><svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none" class="mt-2 block"><defs><linearGradient id="sgd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/><stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs><polygon points="0,20 20,16 40,18 60,12 80,14 100,8 120,10 140,6 160,8 180,4 200,2 200,24 0,24" fill="url(#sgd)"/><polyline points="0,20 20,16 40,18 60,12 80,14 100,8 120,10 140,6 160,8 180,4 200,2" fill="none" stroke="var(--primary)" stroke-width="1.5"/></svg></div>`,
          caption: "Pair the sparkline with an explicit delta so the headline reads without decoding the curve.",
        },
      }
    ]
  },

  {
    slug: "charts",
    name: "Charts",
    description: "Sparklines, bars, gauges, heatmaps. All SVG, all token-themed. No charting library required.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "type", label: "Chart type", options: ["bar", "sparkline", "stacked", "gauge", "heatmap"], cols: 5 },
      ],
      defaults: { type: "bar" },
      render: (s) => {
        const type = s.type as string;
        if (type === "sparkline") {
          return `<div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">${[
  { label: "Tokens issued", val: "4,847", delta: "+12%", deltaCls: "text-foreground", color: "var(--primary)", id: "spk1", poly: "0,28 20,26 40,22 60,24 80,18 100,14 120,16 140,9 160,11 180,5 200,3 200,34 0,34", line: "0,28 20,26 40,22 60,24 80,18 100,14 120,16 140,9 160,11 180,5 200,3", cy: 3 },
  { label: "Active sessions", val: "1,204", delta: "+8%", deltaCls: "text-teal-600", color: "var(--chart-2)", id: "spk2", poly: "0,22 20,24 40,18 60,20 80,15 100,17 120,11 140,13 160,8 180,10 200,6 200,34 0,34", line: "0,22 20,24 40,18 60,20 80,15 100,17 120,11 140,13 160,8 180,10 200,6", cy: 6 },
  { label: "Error rate", val: "0.42%", delta: "-3%", deltaCls: "text-red-600", color: "var(--destructive)", id: "spk3", poly: "0,8 20,10 40,9 60,14 80,12 100,16 120,15 140,19 160,17 180,21 200,24 200,34 0,34", line: "0,8 20,10 40,9 60,14 80,12 100,16 120,15 140,19 160,17 180,21 200,24", cy: 24 },
].map((c) => `<div class="${cardCls} p-5"><div class="text-xs text-muted-foreground">${c.label}</div><div class="mt-1 flex items-baseline justify-between"><span class="text-[22px] font-semibold">${c.val}</span><span class="font-mono text-[11px] ${c.deltaCls}">${c.delta}</span></div><svg width="100%" height="34" viewBox="0 0 200 34" preserveAspectRatio="none" class="mt-2 block overflow-visible"><defs><linearGradient id="${c.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c.color}" stop-opacity="0.3"/><stop offset="100%" stop-color="${c.color}" stop-opacity="0"/></linearGradient></defs><polygon points="${c.poly}" fill="url(#${c.id})"/><polyline points="${c.line}" fill="none" stroke="${c.color}" stroke-width="1.5"/><circle cx="200" cy="${c.cy}" r="2.5" fill="${c.color}"/></svg></div>`).join("")}</div>`;
        }
        if (type === "stacked") {
          return `<div class="${cardCls} max-w-[560px] p-5">
  <div class="mb-1 text-[15px] font-semibold">Traffic sources</div>
  <div class="mb-4 text-xs text-muted-foreground">Breakdown by channel</div>
  <div class="mb-3.5 flex h-2.5 overflow-hidden rounded-full bg-muted">${[["bg-chart-1", "42%"], ["bg-chart-2", "28%"], ["bg-chart-3", "18%"], ["bg-chart-4", "12%"]].map(([c, w]) => `<div class="${c}" style="width:${w}"></div>`).join("")}</div>
  <div class="flex flex-col gap-2">${[["bg-chart-1", "Direct", "42%"], ["bg-chart-2", "Organic search", "28%"], ["bg-chart-3", "Social", "18%"], ["bg-chart-4", "Referral", "12%"]].map(([c, l, p]) => `<div class="flex items-center gap-2.5 text-sm"><span class="h-2 w-2 shrink-0 rounded-full ${c}"></span><span class="flex-1">${l}</span><span class="font-mono text-xs text-muted-foreground">${p}</span></div>`).join("")}</div>
</div>`;
        }
        if (type === "gauge") {
          return `<div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">${[
  { pct: 0.73, color: "var(--primary)", label: "Uptime", val: "73%" },
  { pct: 0.45, color: "var(--chart-2)", label: "Storage", val: "45%" },
  { pct: 0.89, color: "var(--destructive)", label: "CPU", val: "89%" },
].map((g) => `<div class="${cardCls} flex items-center justify-center p-5"><svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="56" fill="none" stroke="var(--muted)" stroke-width="12"/><circle cx="70" cy="70" r="56" fill="none" stroke="${g.color}" stroke-width="12" stroke-dasharray="${56 * 2 * Math.PI}" stroke-dashoffset="${56 * 2 * Math.PI * (1 - g.pct)}" stroke-linecap="round" transform="rotate(-90 70 70)"/><text x="70" y="66" text-anchor="middle" font-size="28" font-weight="700" fill="var(--foreground)">${g.val}</text><text x="70" y="84" text-anchor="middle" font-size="11" fill="var(--muted-foreground)">${g.label}</text></svg></div>`).join("")}</div>`;
        }
        if (type === "heatmap") {
          return `<div class="${cardCls} max-w-[480px] p-5">
  <div class="mb-4"><div class="text-[15px] font-semibold">Token issuance</div><div class="text-xs text-muted-foreground">14 days, darker = more</div></div>
  <div class="grid grid-cols-[repeat(14,1fr)] gap-[3px]">${Array.from({ length: 98 }, (_, i) => `<span class="aspect-square rounded-sm" style="background:var(--primary);opacity:${(0.12 + ((i * 37) % 80) / 100).toFixed(2)}"></span>`).join("")}</div>
  <div class="mt-3 flex items-center justify-between font-mono text-[11.5px] text-muted-foreground"><span>14d ago</span><span class="inline-flex items-center gap-1.5"><span>less</span>${[0.1, 0.3, 0.55, 0.8, 1].map((o) => `<span class="h-3 w-3 rounded-[3px]" style="background:var(--primary);opacity:${o}"></span>`).join("")}<span>more</span></span></div>
</div>`;
        }
        return `<div class="${cardCls} max-w-[560px] p-5">
  <div class="mb-3 flex items-baseline justify-between"><span class="text-[15px] font-semibold">Signups</span><span class="text-xs text-muted-foreground">642 total</span></div>
  <div class="flex h-[140px] items-end gap-[3px]">${[45, 60, 35, 70, 55, 80, 95].map((h, i, a) => `<div class="flex-1 rounded-sm ${i === a.length - 1 ? "bg-primary" : "bg-primary/30"}" style="height:${h}%"></div>`).join("")}</div>
  <div class="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `<span>${d}</span>`).join("")}</div>
</div>`;
      },
    },
    sections: [
      {
        title: "Anatomy",
        description: "Every chart in Canvas is plain SVG or CSS using the same color tokens as the rest of the system. No charting library: visuals respond to accent, dark mode, and glass without any data layer. Bars are flex items with percentage heights; sparklines are a polyline plus a gradient-filled polygon; the stacked bar is one thin flex bar split by width; gauges are two concentric arcs whose dasharray is derived from the radius and Math.PI; the heatmap is a 2D grid with alpha mapped to value. Use them when your data is small enough to inline; for dozens of series or interactive brushing, reach for d3/recharts and theme it with the same tokens.",
        examples: [],
      },
    ],
    donts: [
      {
        title: "Bar",
        dont: {
          html: `<div class="${cardCls} max-w-[560px] p-5"><div class="flex h-[140px] items-end gap-[3px]">${[45, 60, 35, 70, 55, 80, 95].map((h) => `<div class="flex-1 rounded-sm bg-primary" style="height:${h}%"></div>`).join("")}</div></div>`,
          caption: "Every bar the same full-strength fill and no labels: nothing is emphasized and the axis is unreadable.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[560px] p-5"><div class="flex h-[140px] items-end gap-[3px]">${[45, 60, 35, 70, 55, 80, 95].map((h, i, a) => `<div class="flex-1 rounded-sm ${i === a.length - 1 ? "bg-primary" : "bg-primary/30"}" style="height:${h}%"></div>`).join("")}</div><div class="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `<span>${d}</span>`).join("")}</div></div>`,
          caption: "Mute past bars, brighten the current one, and keep an axis row so the buckets read.",
        },
      },
      {
        title: "Sparkline",
        dont: {
          html: `<div class="${cardCls} max-w-[200px] p-5"><svg width="100%" height="34" viewBox="0 0 200 34" preserveAspectRatio="none" class="block"><polyline points="0,28 20,26 40,22 60,24 80,18 100,14 120,16 140,9 160,11 180,5 200,3" fill="none" stroke="var(--primary)" stroke-width="1.5"/></svg></div>`,
          caption: "A bare line with no value or end dot reads as decoration: you cannot tell the current figure or where it ends.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[200px] p-5"><div class="text-xs text-muted-foreground">Tokens issued</div><div class="mt-1 flex items-baseline justify-between"><span class="text-[22px] font-semibold">4,847</span><span class="font-mono text-[11px] text-foreground">+12%</span></div><svg width="100%" height="34" viewBox="0 0 200 34" preserveAspectRatio="none" class="mt-2 block overflow-visible"><defs><linearGradient id="dospk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/><stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs><polygon points="0,28 20,26 40,22 60,24 80,18 100,14 120,16 140,9 160,11 180,5 200,3 200,34 0,34" fill="url(#dospk)"/><polyline points="0,28 20,26 40,22 60,24 80,18 100,14 120,16 140,9 160,11 180,5 200,3" fill="none" stroke="var(--primary)" stroke-width="1.5"/><circle cx="200" cy="3" r="2.5" fill="var(--primary)"/></svg></div>`,
          caption: "Pair the line with the current value and delta, add the gradient fill and an end dot so it anchors a stat.",
        },
      },
      {
        title: "Stacked bar",
        dont: {
          html: `<div class="${cardCls} max-w-[560px] p-5"><div class="flex h-2.5 overflow-hidden rounded-full bg-muted">${[["bg-chart-1", "42%"], ["bg-chart-2", "28%"], ["bg-chart-3", "18%"], ["bg-chart-4", "12%"]].map(([c, w]) => `<div class="${c}" style="width:${w}"></div>`).join("")}</div></div>`,
          caption: "Colored segments with no legend force the reader to guess which channel each band represents.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[560px] p-5"><div class="mb-3.5 flex h-2.5 overflow-hidden rounded-full bg-muted">${[["bg-chart-1", "42%"], ["bg-chart-2", "28%"], ["bg-chart-3", "18%"], ["bg-chart-4", "12%"]].map(([c, w]) => `<div class="${c}" style="width:${w}"></div>`).join("")}</div><div class="flex flex-col gap-2">${[["bg-chart-1", "Direct", "42%"], ["bg-chart-2", "Organic search", "28%"], ["bg-chart-3", "Social", "18%"], ["bg-chart-4", "Referral", "12%"]].map(([c, l, p]) => `<div class="flex items-center gap-2.5 text-sm"><span class="h-2 w-2 shrink-0 rounded-full ${c}"></span><span class="flex-1">${l}</span><span class="font-mono text-xs text-muted-foreground">${p}</span></div>`).join("")}</div></div>`,
          caption: "Always ship a legend with a colored dot, label, and percentage per segment.",
        },
      },
      {
        title: "Gauge",
        dont: {
          html: `<div class="${cardCls} flex max-w-[200px] items-center justify-center p-5"><svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="56" fill="none" stroke="var(--primary)" stroke-width="12" stroke-dasharray="${56 * 2 * Math.PI}" stroke-dashoffset="${56 * 2 * Math.PI * (1 - 0.73)}" stroke-linecap="round" transform="rotate(-90 70 70)"/></svg></div>`,
          caption: "An arc with no track and no number: there is no baseline to read the fill against and no exact value.",
        },
        do: {
          html: `<div class="${cardCls} flex max-w-[200px] items-center justify-center p-5"><svg width="140" height="140" viewBox="0 0 140 140"><circle cx="70" cy="70" r="56" fill="none" stroke="var(--muted)" stroke-width="12"/><circle cx="70" cy="70" r="56" fill="none" stroke="var(--primary)" stroke-width="12" stroke-dasharray="${56 * 2 * Math.PI}" stroke-dashoffset="${56 * 2 * Math.PI * (1 - 0.73)}" stroke-linecap="round" transform="rotate(-90 70 70)"/><text x="70" y="66" text-anchor="middle" font-size="28" font-weight="700" fill="var(--foreground)">73%</text><text x="70" y="84" text-anchor="middle" font-size="11" fill="var(--muted-foreground)">Uptime</text></svg></div>`,
          caption: "Put a muted track behind the fill and the numeric value plus label in the center.",
        },
      },
      {
        title: "Heatmap",
        dont: {
          html: `<div class="${cardCls} max-w-[480px] p-5"><div class="grid grid-cols-[repeat(14,1fr)] gap-[3px]">${Array.from({ length: 98 }, (_, i) => `<span class="aspect-square rounded-sm" style="background:var(--primary);opacity:${(0.12 + ((i * 37) % 80) / 100).toFixed(2)}"></span>`).join("")}</div></div>`,
          caption: "A density grid with no legend leaves the alpha-to-value mapping a mystery.",
        },
        do: {
          html: `<div class="${cardCls} max-w-[480px] p-5"><div class="grid grid-cols-[repeat(14,1fr)] gap-[3px]">${Array.from({ length: 98 }, (_, i) => `<span class="aspect-square rounded-sm" style="background:var(--primary);opacity:${(0.12 + ((i * 37) % 80) / 100).toFixed(2)}"></span>`).join("")}</div><div class="mt-3 flex items-center justify-between font-mono text-[11.5px] text-muted-foreground"><span>14d ago</span><span class="inline-flex items-center gap-1.5"><span>less</span>${[0.1, 0.3, 0.55, 0.8, 1].map((o) => `<span class="h-3 w-3 rounded-[3px]" style="background:var(--primary);opacity:${o}"></span>`).join("")}<span>more</span></span></div></div>`,
          caption: "Pair the grid with a discrete less-to-more legend so the density scale is legible.",
        },
      },
    ]
  },

  {
    slug: "navbars",
    name: "Navbars",
    description: "Topbars with navigation links, search, and action buttons. Used as the primary app-level navigation.",
    category: "Organisms",
    playground: {
      controls: [
        { type: "pills", key: "layout", label: "Layout", options: ["standard", "search", "mobile"], cols: 3 },
      ],
      defaults: { layout: "standard" },
      render: (s) => {
        const flash = ` onclick="var b=this;b.classList.add('bg-accent');setTimeout(function(){b.classList.remove('bg-accent')},300)"`;
        const searchIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
        const bellIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
        const logo = canvasLogo(24);
        const avatar = `<span class="${avatarBase} h-8 w-8"><img src="/rachel-chen.jpg" alt="RC" class="h-full w-full object-cover"></span>`;
        if (s.layout === "search") {
          return `<div class="w-full overflow-hidden rounded-lg border border-border">
  <header class="flex h-14 items-center gap-2 bg-card px-4">
    <div class="flex items-center gap-2">
      ${logo}
      <span class="text-sm font-semibold">Canvas</span>
    </div>
    <div class="mx-4 max-w-[400px] flex-1">
      <button class="flex h-[34px] w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 text-sm text-muted-foreground transition-shadow" onclick="var b=this;b.classList.add('ring-2','ring-ring');setTimeout(function(){b.classList.remove('ring-2','ring-ring')},400)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span class="flex-1 text-left">Search…</span>
        <kbd class="${kbdCls}">⌘K</kbd>
      </button>
    </div>
    <div class="flex-1"></div>
    ${btn("ghost", bellIcon, "icon", flash)}
    ${avatar}
  </header>
</div>`;
        }
        if (s.layout === "mobile") {
          const hamburger = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`;
          return `<div data-mnav-wrap class="w-full max-w-[360px] overflow-hidden rounded-lg border border-border">
  <header class="flex h-14 items-center gap-2 bg-card px-4">
    ${btn("ghost", hamburger, "icon", ` onclick="var nav=this.closest('[data-mnav-wrap]').querySelector('[data-mobilenav]');nav.classList.toggle('hidden')"`)}
    <div class="flex items-center gap-2">
      ${canvasLogo(20)}
      <span class="text-[13px] font-semibold">Canvas</span>
    </div>
    <div class="flex-1"></div>
    <span class="${avatarBase} h-7 w-7 text-[11px]"><img src="/rachel-chen.jpg" alt="RC" class="h-full w-full object-cover"></span>
  </header>
  <nav data-mobilenav class="hidden border-t border-border bg-card p-2" onclick="if(!event.target.classList.contains('navlink'))return;event.preventDefault();this.querySelectorAll('.navlink').forEach(function(a){a.className='${navlinkM}'});event.target.className='${navlinkMActive}'">
    <a class="${navlinkMActive}" href="#">Dashboard</a>
    <a class="${navlinkM}" href="#">Users</a>
    <a class="${navlinkM}" href="#">Settings</a>
  </nav>
</div>`;
        }
        return `<div class="w-full overflow-hidden rounded-lg border border-border">
  <header class="flex h-14 items-center gap-2 bg-card px-4">
    <div class="flex items-center gap-2">
      ${logo}
      <span class="text-sm font-semibold">Canvas</span>
    </div>
    <nav class="ml-4 flex gap-1" onclick="if(!event.target.classList.contains('navlink'))return;event.preventDefault();this.querySelectorAll('.navlink').forEach(function(a){a.className='${navlink}'});event.target.className='${navlinkActive}'">
      <a class="${navlinkActive}" href="#">Dashboard</a>
      <a class="${navlink}" href="#">Users</a>
      <a class="${navlink}" href="#">Settings</a>
    </nav>
    <div class="flex-1"></div>
    ${btn("ghost", searchIcon, "icon", flash)}
    ${btn("ghost", bellIcon, "icon", flash)}
    ${avatar}
  </header>
</div>`;
      },
    },
    sections: [],
    donts: [
      {
        title: "Standard topbar",
        dont: {
          html: `<div class="w-full overflow-hidden rounded-lg border border-border"><header class="flex h-12 items-center gap-1 bg-card px-3"><span class="text-sm font-semibold">Canvas</span><nav class="ml-3 flex flex-wrap gap-1">${["Dashboard", "Users", "Settings", "Billing", "Reports", "Integrations", "Audit", "Webhooks"].map((l, i) => `<a class="${i === 0 ? navlinkActive : navlink}" href="#">${l}</a>`).join("")}</nav></header></div>`,
          caption: "Cramming every destination into the bar wraps the row and buries the primary links.",
        },
        do: {
          html: `<div class="w-full overflow-hidden rounded-lg border border-border"><header class="flex h-12 items-center gap-1 bg-card px-3"><span class="text-sm font-semibold">Canvas</span><nav class="ml-3 flex gap-1">${["Dashboard", "Users", "Settings"].map((l, i) => `<a class="${i === 0 ? navlinkActive : navlink}" href="#">${l}</a>`).join("")}${btn("ghost", "More" + chevronDown, "sm")}</nav></header></div>`,
          caption: "Keep a few primary links inline and fold the rest behind a More menu.",
        },
      },
      {
        title: "With search bar",
        dont: {
          html: `<div class="w-full overflow-hidden rounded-lg border border-border"><header class="flex h-14 items-center gap-2 bg-card px-4"><span class="text-sm font-semibold">Canvas</span><div class="mx-4 max-w-[400px] flex-1"><input class="${inputBase}" placeholder="Search…"></div></header></div>`,
          caption: "A live text field in the bar reads as a form input and offers no keyboard affordance.",
        },
        do: {
          html: `<div class="w-full overflow-hidden rounded-lg border border-border"><header class="flex h-14 items-center gap-2 bg-card px-4"><span class="text-sm font-semibold">Canvas</span><div class="mx-4 max-w-[400px] flex-1"><button class="flex h-[34px] w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 text-sm text-muted-foreground"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><span class="flex-1 text-left">Search…</span><kbd class="${kbdCls}">⌘K</kbd></button></div></header></div>`,
          caption: "Use a button that opens the command palette and advertise the ⌘K shortcut.",
        },
      },
      {
        title: "Mobile",
        dont: {
          html: `<div class="w-full max-w-[360px] overflow-hidden rounded-lg border border-border"><header class="flex h-14 items-center gap-1 bg-card px-3"><span class="text-[13px] font-semibold">Canvas</span><nav class="ml-2 flex flex-wrap gap-1">${["Dashboard", "Users", "Settings", "Billing"].map((l, i) => `<a class="${i === 0 ? navlinkActive : navlink}" href="#">${l}</a>`).join("")}</nav></header></div>`,
          caption: "A full horizontal nav at phone width wraps onto a second row and crowds out the logo.",
        },
        do: {
          html: `<div class="w-full max-w-[360px] overflow-hidden rounded-lg border border-border"><header class="flex h-14 items-center gap-2 bg-card px-3">${btn("ghost", `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`, "icon")}<span class="text-[13px] font-semibold">Canvas</span><div class="flex-1"></div><span class="${avatarBase} h-7 w-7 text-[11px]"><img src="/rachel-chen.jpg" alt="RC" class="h-full w-full object-cover"></span></header></div>`,
          caption: "Collapse the links into a hamburger and keep only the logo and avatar in the bar.",
        },
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
