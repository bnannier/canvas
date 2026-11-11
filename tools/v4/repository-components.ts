// Components the repository ships that the vendored v4 hand-off predates, declared once.
//
// The hand-off stays verbatim (tools/v4/README.md), so where such a component sits, how its
// detail page is specified, which tier the Library index tags it with and which card shows
// it on its section page are the repository's own, declared here in the hand-off's forms
// and read by everything that would otherwise take them from the hand-off:
//
//   - tools/v4/derive-detail-specs.ts: the section (room) placement and the detail spec;
//   - tools/v4/derive-showcase.ts: the section page card (REPOSITORY_CARDS);
//   - test/docs-library.test.ts: the tier the Library index tags the component with;
//   - test/detail-presentation.test.ts: the components with no reference presentation.
//
// Each reader throws once the hand-off lists a slug declared here, so a declaration is
// dropped when the hand-off catches up instead of shadowing the hand-off's own. Plain data
// with no import, so the derivations and the unit tests read it without a kit build.

/** A tier as the Library index tags it (docs/src/data/tiers.ts `Tier`). */
export type RepositoryTier = "atom" | "molecule" | "organism" | "chart" | "primitive";

/** A detail spec in the hand-off's `CVK.def` form: `k` knobs in the knob DSL, `st` states, `an` anatomy parts, `kb` keyboard pattern, `w` width nature. */
export interface RepositorySpec {
  k?: string;
  st?: string;
  an?: string[];
  kb?: string;
  w?: string;
}

export interface RepositoryComponent {
  /** The hand-off section (room) the component is filed under. */
  section: string;
  /** The hand-off component it follows in that section. */
  after: string;
  /** The props interface its detail page's knobs drive. */
  props: string;
  /** The tier the Library index tags it with (the hand-off's IDX letter for the component's `category`). */
  tier: RepositoryTier;
  spec: RepositorySpec;
}

/** Every post-hand-off component, by URL slug. */
export const REPOSITORY_COMPONENTS: Readonly<Record<string, RepositoryComponent>> = {
  "flow-editor": {
    section: "Surfaces & data",
    after: "board",
    props: "FlowEditorProps",
    tier: "organism",
    spec: { k: "label=Delivery workflow;readOnly?;freePlacement?", an: ["Toolbar", "Canvas", "Node", "Port", "Edge", "Edge label"], kb: "flow-editor", w: "fill" },
  },
};

/** Keyboard patterns for REPOSITORY_COMPONENTS, as [keys, effect] rows (the hand-off's K.KB form). */
export const REPOSITORY_KEYBOARD: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  "flow-editor": [["Tab · Shift+Tab", "Moves between the toolbar, the canvas and each card"], ["Arrow keys", "Move the focused card one grid step"], ["Delete · Backspace", "Removes the selected card or edge"], ["+ · -", "Zooms the canvas in or out"], ["0", "Fits the whole graph in view"]],
};

/**
 * A section page card the repository adds for post-hand-off components, in the form of a
 * hand-off card (`<div id="c-...">` in `Canvas v4.0.0 <Section>.dc.html`). It joins the
 * card grid of the card it follows and takes that card's tile floor, frame (inset, gap,
 * header rhythm) and subsection, so only what the card itself says is declared here.
 */
export interface RepositoryCard {
  /** The card id (`c-<slug>`): its anchor and its `showcase-<id>` test id. */
  id: string;
  /** The section page, by its rooms id (tools/v4/derive-showcase.ts `SECTION_PAGES`). */
  page: string;
  /** The hand-off card it follows on that page. */
  after: string;
  /** The components its chips link to, each one declared in REPOSITORY_COMPONENTS. */
  links: readonly string[];
  /** The header row's left and right labels. */
  title: string;
  meta: string;
  /** The card spans the whole row (`grid-column: 1 / -1`). */
  full: boolean;
  /** The names the card's subsection header appends to the components it lists. */
  groupNames?: readonly string[];
}

/** Every repository card, in page order. */
export const REPOSITORY_CARDS: readonly RepositoryCard[] = [
  {
    id: "c-flow-editor",
    page: "data",
    after: "c-board",
    links: ["flow-editor"],
    title: "FlowEditor",
    meta: "read only · pan · zoom · select",
    full: true,
    groupNames: ["FlowEditor"],
  },
];
