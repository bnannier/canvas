# Audit decisions for the owner

Decisions the component audit cannot settle on its own: a public API change, a change in
documented behaviour, or a design call the rubric leaves open. Each lists the options and
the recommendation. Phase 3 scoping (2026-10-09) produced most of them; each item's root
cause and file:line evidence travel with the commit that carries it out and with the
affected component checklists.

**Decided by the owner on 2026-10-09:** every recommendation below was accepted as
written, with K12-2 (deprecate all 111), K1.8 (normalize as a patch) and P3g (col-12
reset) chosen explicitly. One item stays open: K11.1 export (the hand-off's canvas-react
export has not been located), so new chart affordances are judged against the existing
chart family and Dark Factory until it turns up. The Recommendation column is now the
decision.

## Public API and documented behaviour

| ID | Question | Options | Recommendation |
|---|---|---|---|
| K12-2 | Retire the 111 foundation exports that are kit internals (AnchoredOverlay, Portal, GlassSurface, GlassPane, LoopView, FloatingLabel, the sizing and ripple helpers and so on) as deprecated aliases? Nothing is removed; each keeps working and names the kit component to use. | (a) deprecate all 111; (b) deprecate only behaviour, ripple, label, entrance and loop internals, keep glass and sizing helpers public behind an "Extending Canvas" page; (c) keep all public and document them | (a). It retracts names earlier minors announced, so it is yours to make. |
| K12-2 OD4 | `shadow`, `customShadow`, `ShadowLevel` | deprecate; keep `shadow()` as an elevation reader | Deprecate: elevation comes from Card's appearances. |
| K12-2 OD5 | The `StyleSheet` and `useWindowDimensions` pass-throughs | deprecate; keep | Deprecate: they are React Native's, and StyleSheet invites raw styling. |
| K12-2 tabular | If `tabularNums` is deprecated, apps lose tabular figures | add a `tabular` boolean to Typography (minor); accept the loss | Add `tabular`. |
| K12-7 OD3 | `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing` are the old Riskora ladder and nothing reads them | deprecate pointing to Typography roles; keep as legacy; export DF's type scale instead | Deprecate. |
| K12-5 OD6 | OverlayProvider's `style` prop | document as app-frame only now; narrow it at the next major | Document now. |
| K12-10 OD2 | A home for the foundation API reference | a generated `/foundation` guide page; extend Integration by hand; none | Generated `/foundation` page. |
| K1 | Where each component's axis precedence lives | (a) declarative axis tables in the kit with a generated Precedence section; (b) hand-written per page with a drift test; (c) hand-written | (a), one source that cannot drift. |
| K1.8 | Normalize conflicting axis orders? Size resolves smaller-wins in 13 components and larger-wins in 11; status tones use six orders. Normalizing changes what a call site renders only when it passes two props from one axis. | (a) document as-is; (b) normalize to "the smaller size wins" and "the most urgent status wins" as a patch under that stated assumption; (c) normalize only at the next major | (b), chosen by the owner: a patch, with the changeset stating that output changes only for call sites passing two props from one axis. |
| K1 S9 | Enforce that every non-default axis member appears in some example (about 61 members across 30 components) | enforce; leave to review | Enforce. |
| K1 toggles | The 30 components with only independent toggles | one-line "independent toggles" Precedence section; omit | Show the line. |
| P3g | A Row that stacks transposes its alignment, so template toolbars (`Row stacks alignEnd`) stack right-aligned on phones. layout.md documents the transposition. | (1) col-12 reset: a stacked Row's children go full width, as CLAUDE.md defines; (2) add stacked-alignment props (minor); (3) keep the rule and rewrite the templates | (1), matches the sizing contract. |
| P3d | Should a busy (`loading`) control dim? Native labels measure 1.7 to 2.5:1 while busy. | (1) no: keeps its intent look, blocks presses, announces busy (as web and DF); (2) dim the fill only; (3) keep the disabled dim | (1); becomes the kit rule for busy controls. |
| P3e | Tooltip opens in flow and pushes its trigger out from under the pointer (WCAG 1.4.13). The fix is an AnchoredOverlay placement option (above, beside), a minor. Popover `top` today only moves the iOS arrow; the card still anchors below. | ship Popover `top` real above-anchoring in the same minor; hold it for Popover's own row | Same minor. |
| K6 | Tooltip semantics | (a) APG/Radix: role tooltip, aria-describedby from the trigger, accessibilityHint natively (needs a describedby pass-through on Button and Pressable triggers); (b) keep today's polite live region (role alert); (c) live region natively, APG on the web | (a). |
| K6 baselines | Tooltip and AvatarMenu open states | mint four Linux overlay baselines; keep them out of the visual gate | Mint them. |
| K6-ext | Add `open-surface` to ButtonGroup and Calendar in the materials manifest; move PhoneInput into the gated overlay list and mint its baselines | yes; no | Yes to both. |
| K7 Breadcrumb | The Home crumb shifts `onItemPress` indices by one | (a) new optional `onHomePress` (minor); (b) Home reports -1 (patch, changes consumers matching 0); (c) keep and document | (a). |
| K7 Card | CardTitle semantics | (a) role heading with a default level and a `level` prop; (b) plain text, Card's `title` owns the heading | (a). |
| K7 Image | Decorative images | (a) unnamed is decorative (no new prop); (b) a `decorative` boolean (minor) | (a). Taken in Phase 3 batch A (reversible). |

## Design language and platforms

| ID | Question | Options | Recommendation |
|---|---|---|---|
| K8b caret | InputOTP's caret blinks natively and is static on the web | (a) alias fully, static everywhere; (b) blink natively only; (c) blink everywhere on the loop primitive, tuned through the harness | (c); fallback (b). |
| K8b dims | InputOTP disabled dim and the iOS press dims of the nine aliased components (HIG 0.8 to the web skin's 0.7 or 0.9) | platform dims (iOS 0.4, Android 0.38) with DF press dims; web values everywhere | Platform disabled dims, DF press dims (Pagination and Avatar precedent). |
| K8b Command | Command's native rows, search and trigger heights | keep the 44/48 floors (rows abut, hitSlop cannot reach the minimum); DF's 40 everywhere | Keep the floors. |
| K8c | Twelve components cite no native control on one platform yet draw their own native skin | per-component verdicts (alias Card iOS, Form, DataTable, DescriptionList, GridList Android, Board and DragDrop both; keep Carousel iOS, ActionSheet Android, Autocomplete iOS, FilterPanel iOS as one-job substitutions); timing now or per Phase 4 family | The verdicts as listed, executed per Phase 4 family. |
| K8a | PLATFORM-REFERENCES catalog shape | a row for every docs component including primitives; Treatment legend "Shared = own skin is the web skin on every platform"; substitutes recorded in an in-test map | Yes to all three. |
| P3a | Android in-page glass resolves solid by design (no safe capture target), so the audit's Android glass column equals solid outside overlays | (1) accept and record it; (2) commission a page-level capture plane (native work, own tuning card) | (1) now. Recorded in Phase 3 batch A. |
| P3b | React Native maps a read-only field to a disabled native field, so VoiceOver and TalkBack announce `<Input readOnly>` as disabled | (1) accept and document; (2) native work outside TextInput | (1). |
| P3c | Firefox and Safari keep the browser's focus-ring colour unless the CSS hand-off is loaded (true of every Pressable) | (1) keep the documented status quo; (2) the docs load the hand-off's :focus-visible rule (needs your authorization: docs-only CSS); (3) JS focus tracking | (1). |
| K13 links | Preview links carry an optional `&scheme=&surface=&palette=` | add it for look-specific reviews; route only | Add it as optional. |
| K13 native | An in-app palette control on native and the desktop Topbar | Palette row in the iOS header menu and the Android overflow sheet (and Topbar if 768 allows); link-only | Native rows yes; Topbar only if it fits at 768. |
| Backlog | ScrollView as a keyboard stop by default | make every ScrollView focusable; only when it holds no focusable child; leave it | Only when it holds no focusable child (WCAG 2.1.1 scrollable regions). |
| Backlog | The phone drawer wraps the theme toggles in its own order | keep; match the desktop order | Match desktop. |

## Hand-off and charts

| ID | Question | Options | Recommendation |
|---|---|---|---|
| K11.1 | Does the 2026-08-17 hand-off still bind after the Dark Factory decision? | (1) capabilities yes, looks and metrics no; (2) both; (3) retire the check | (1). |
| K11.1 reveal | Tooltip `reveal` and `brisk` | settle as omitted under the 2026-09-21 motion removal; reopen with a new motion decision | Settle. |
| K11.1 export | Where is the hand-off export (canvas-react)? Needed to judge crosshair, the last-price tag and slice labels | a path; none available | Open: not located. |
| K11.3 | ChartFrame names and breadth | `plain` (not `bare`), `description` (not `subtitle`), chrome plus a cartesian render prop, description stacked under the title | All four as listed. Minor, justified by the new public component. |
| K11.4 | `unit` sugar on charts | `formatValue` only; add `unit` | `formatValue` only, and export `formatCompact`. |
| K11.5 | Chart inspection accessibility | the plot becomes adjustable (increment and decrement with value text); a separate focus stop | Adjustable; no opt-out boolean until a consumer needs one. |
| K11.6 to K11.10 | New chart options (`lastPrice`, `mid`, `valueLabels`, `centerLabel`, `centerValue`, `sliceLabels`, `totals`) | opt-in; on by default as the hand-off has them | Opt-in (backward compatible). |
| K11.9 | ScatterPlot y title | rotated beside the axis; horizontal above it on phones | Rotated at tablet and desktop, horizontal at phone width (container-measured). |
| K11.12 | Round charts' sizing (Gauge, PieChart, RadialBarChart, ProgressRing) | intrinsic diameters with a `compact` step; FILL with a measured diameter | Intrinsic with `compact`. |
| K11.13 | Drawer's owned header | close button by default when `title` is set; only on request | By default with `title`. |
| K11.14 | DataTable `footer` | a free footer slot; a column-aligned totals row | Free slot. |
| K11.15 | StackedList selection semantics | aria-current (navigation list); listbox with aria-selected | aria-current. |
| K11.16 | TabBar iOS 26 search tab, accessory, scroll-to-minimize | implement search and accessory in the iOS skin; settle as omissions; minimize needs a motion decision | Implement search and accessory; defer minimize. |
| K11.17 | The hand-off's Input validation chain | kit validation; the app's form-state layer | The app's layer; ask DF before adding a `valid` state. |
| K11.18 | Avatar diameter scale | keep 24/28/40/48; move to a DF-derived scale in Phase 4; the hand-off's 24/32/40 | Keep for now, decide in Phase 4 with photographs. |

## Docs

| ID | Question | Options | Recommendation |
|---|---|---|---|
| K2 source | One source for a component's description | (a) the .md intro is the source, the registry description is generated from it (editorial pass over 94 intros); (b) keep both; (c) delete the .md intros | (a); (b) is the cheaper fallback. |
| K2 notes | Where a variant's note shows | under the Playground rail for the selected example; a collapsed notes list | Under the rail. |
| K2 lists | The shared prose renderer needs a bullet list | rule a docs prose list as frame scaffolding (kit Typography rows with list semantics); add a list component to the kit | Frame scaffolding, recorded here. |
| K3 | Do and Don't on every page, primitives and charts included | (a) mandatory everywhere; (b) exempt primitives | (a). Taken in Phase 3 batch A. |
| K3 a11y | When "## Accessibility" becomes a required section | now (104 sections written blind); per tier in Phase 4 from the audit's findings | Per tier in Phase 4. Taken in Phase 3 batch A. |

## Audit process

| ID | Question | Options | Recommendation |
|---|---|---|---|
| Width | Desktop capture width | 1440 (Dark Factory's reference strips; the 1280 page cap shows inside it); 1280 | 1440 (the runner's default). |
| Motion | iOS Reduce Motion during native runs | on (stable frames); off (what most users see) | Off for captures, on only for the motion checks that need it. |
| Commits | Fix-commit format | one commit per component family with its changeset; one per component | One per family. |
