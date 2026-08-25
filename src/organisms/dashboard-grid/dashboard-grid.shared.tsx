import { type ComponentType, useRef } from "react";
import {
  View,
  devWarn,
  useTheme,
  useControllableState,
  useContainerBreakpoint,
  type Responsive,
  type StyleProp,
  type ViewStyle,
} from "../../style/index.js";
import {
  DragDropProvider as WebDragDropProvider,
  DropZone as WebDropZone,
  Draggable as WebDraggable,
  DragHandle as WebDragHandle,
} from "../drag-drop/drag-drop.js";
import {
  type DropEvent,
  type DragDropProviderProps,
  type DropZoneProps,
  type DraggableProps,
  type DragHandleProps,
} from "../drag-drop/drag-drop.shared.js";
import {
  DASHBOARD_COLUMNS,
  effectiveSpan,
  moveWidget,
  orderedWidgets,
  type DashboardTier,
  type DashboardWidget,
} from "./dashboard-grid.logic.js";
import { type DashboardGridSkin } from "./dashboard-grid.styles.js";

// Shared DashboardGrid shell. A 12-column widget board: each widget declares a span in
// twelfths, the grid measures its OWN width, resolves every span for the tier that width
// falls in, and lays the cells out as a wrapping row. Locked (the default) it is a plain
// static grid; `unlocked` turns it into customize mode, where every cell becomes a drop
// target with a drag grip and the order can be rearranged.
//
// The whole drag interaction (the pointer ghost, the insertion indicator, the keyboard
// grab/move/drop, the screen-reader announcements) comes from the kit's own DragDrop
// family; DashboardGrid adds only the grid structure and the order bookkeeping, which is
// pure and lives in dashboard-grid.logic.ts. Board is the precedent for this composition.
//
// THE DROP MODEL, and why each cell is its own DropZone. drag-drop.geometry.ts resolves an
// insertion index along ONE main axis (`insertionIndexFor` walks card midpoints in Y, or in
// X for a horizontal zone), so a wrapped two-dimensional grid cannot be a single DropZone:
// the second row's cards would be indexed by the same axis as the first row's. Zone
// HIT-TESTING, though, is fully two-dimensional (`withinRect` tests X and Y). So every
// widget cell is its own DropZone (zone id = widget id, zone label = widget title) holding
// exactly ONE Draggable with the same id. A drop therefore always lands on a target widget,
// and the zone's single-card insertion index collapses to a binary: 0 means the pointer
// stopped before the target's midpoint, 1 means past it. That is exactly "place the dragged
// widget before / after this target", which is `moveWidget`'s signature.
//
// Which midpoint decides is per cell: a cell that fills the row (12 columns) is stacked
// above and below its neighbors, so it splits vertically; a narrower cell shares its row,
// so it splits horizontally (`horizontal` on the DropZone picks the axis). The keyboard
// path needs no axis at all: the arrow keys walk the zone list, which is widget order.
//
// CHROME SPLIT. A widget arrives with its own surface (a Card, a Chart, a Stats row), so
// cells render BARE: no fill, no border, no header. `title` is an accessibility name for
// the drop zone and the draggable, not visible chrome. Only customize mode paints, and its
// grips are ALWAYS visible while unlocked rather than hover-revealed: React Native has no
// portable hover event, and an explicit edit mode already announces itself. Locked, the
// drag provider is not mounted at all, so a read-only dashboard carries none of the drag
// machinery's listeners or measurement.

export type { DashboardWidget, DashboardTier };

// The tier map, resolved against the grid's OWN measured width (never the window): at or
// below `lg` a container is `narrow`, at or below `sm` it is `phone`, and anything wider
// honors each declared span. Desktop-first, so an unmeasured frame resolves to `wide`.
const TIERS: Responsive<DashboardTier> = { base: "wide", lg: "narrow", sm: "phone" };

// The grid spans its container so the measurement is truthful: a hugging root would measure
// its own content width and latch the wrong tier forever (the container.ts probe note).
const ROOT: ViewStyle = { width: "100%", maxWidth: "100%" };
const GRID: ViewStyle = { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" };

// Where the uncontrolled `storageKey` convenience writes. Namespaced so a consumer's key is
// a short name of their own ("overview", "billing") rather than a global-scope collision.
const STORAGE_PREFIX = "canvas-dashboard-order:";

// localStorage is guarded exactly like src/theme.ts guards it: a try/catch that no-ops. On
// native there is no localStorage (the kit takes no storage dependency), and during SSR
// there is no window, so both read and write fall through silently and the uncontrolled
// order is simply session-only there.
function readStoredOrder(storageKey: string): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === "string")) return null;
    return parsed as string[];
  } catch {
    return null;
  }
}

function writeStoredOrder(storageKey: string, order: readonly string[]): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(order));
  } catch {
    /* no storage here (native, SSR, or a blocked origin): the order stays session-only */
  }
}

/**
 * Forget the widget order saved under `storageKey`, so the next uncontrolled DashboardGrid
 * seeded from that key falls back to `defaultOrder` (or the `widgets` array order). This is
 * what a "Reset layout" action calls. A no-op wherever there is no storage (native, SSR),
 * matching the write side, and safe to call for a key that was never written.
 */
export function clearStoredDashboardOrder(storageKey: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + storageKey);
  } catch {
    /* nothing was stored here in the first place */
  }
}

/**
 * KIT-INTERNAL: the px width of a cell spanning `span` of the 12 columns, in a grid `width`
 * wide whose cells sit `gap` apart. The board is modeled as 12 equal column units separated
 * by 11 gaps, so a multi-column span also swallows the gaps it straddles: two 6-column cells
 * plus the one gap between them fill the row exactly, as do twelve 1-column cells and their
 * eleven gaps. Floored, so rounding can only ever leave a sub-pixel sliver rather than
 * overflow the row into an extra wrap. Deliberately NOT re-exported from the platform entry
 * files: it is the layout's own arithmetic, not public API.
 */
export function dashboardCellWidth(width: number, span: number, gap: number): number {
  const unit = (width - gap * (DASHBOARD_COLUMNS - 1)) / DASHBOARD_COLUMNS;
  return Math.max(0, Math.floor(unit * span + gap * (span - 1)));
}

/** Same ids in the same positions: a drop that changes nothing reports nothing. */
function sameOrder(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

export interface DashboardGridProps {
  /** The widgets to lay out. Their array order is the fallback order: any widget whose id
   *  is missing from the active order is appended, so adding one to a release never breaks
   *  a saved layout. */
  widgets: DashboardWidget[];
  /**
   * CONTROLLED widget order, as ids. The primary path: the consuming app owns the array and
   * persists it through its own API, applying each `onOrderChange`. Ids the widget list does
   * not hold are ignored, and widgets missing from it are appended, so a stored order
   * survives a release that adds or drops a widget.
   */
  order?: string[];
  /** Initial order for UNCONTROLLED use; the grid then applies each drop itself. Defaults to
   *  the `widgets` array order. */
  defaultOrder?: string[];
  /** Fired with the full, reconciled next order after every drop that changes it, in BOTH
   *  the controlled and the uncontrolled mode. */
  onOrderChange?: (order: string[]) => void;
  /** Customize mode: cells gain the edit affordance and a drag grip, and the board becomes
   *  reorderable. The grid never flips this itself; the app owns the "Done" / "Customize"
   *  control. Locked (the default) the drag provider is not mounted at all. */
  unlocked?: boolean;
  /** Web-only convenience for the UNCONTROLLED path: seed the initial order from browser
   *  storage under this key and write each drop back to it. Ignored when `order` is passed
   *  (the controlled order owns persistence). On native there is no storage, so the order is
   *  session-only there; `clearStoredDashboardOrder` forgets a saved layout. */
  storageKey?: string;
  // Density axis (pass none for the default density).
  compact?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// The composed-part component types, so each platform can pass its own resolved DragDrop
// build (web base by default) without widening to `any`.
export interface DashboardGridParts {
  DragDropProvider: ComponentType<DragDropProviderProps>;
  DropZone: ComponentType<DropZoneProps>;
  Draggable: ComponentType<DraggableProps<DashboardWidget>>;
  DragHandle: ComponentType<DragHandleProps>;
}

const WEB_PARTS: DashboardGridParts = {
  DragDropProvider: WebDragDropProvider,
  DropZone: WebDropZone,
  Draggable: WebDraggable,
  DragHandle: WebDragHandle,
};

/** Build a DashboardGrid component from a platform skin and its platform-styled parts. */
export function createDashboardGrid(skin: DashboardGridSkin, parts: DashboardGridParts = WEB_PARTS) {
  const { DragDropProvider, DropZone, Draggable, DragHandle } = parts;

  interface CellsProps {
    widgets: DashboardWidget[];
    unlocked: boolean;
    compact: boolean;
    onDrop: (e: DropEvent) => void;
  }

  // The cells live in their own component so the measurement re-renders only the grid row,
  // never the order state above it. The SAME row renders in both modes, so toggling
  // customize mode changes the paint and the drag wiring, not the arrangement.
  function DashboardCells({ widgets, unlocked, compact, onDrop }: CellsProps) {
    const { tokens } = useTheme();
    const gap = skin.gap(compact);
    // One container query serves both jobs: `value` is the tier the spans resolve against,
    // `width` is the px the cell arithmetic divides. Unmeasured (width 0) the cells carry no
    // explicit width and simply flow, which is the kit's first-frame policy (the Grid atom's
    // `cellWidth == null` precedent) rather than a blank frame.
    const { value: tier, width, onLayout } = useContainerBreakpoint<DashboardTier>(TIERS);

    return (
      <View onLayout={onLayout} style={[GRID, { gap }]}>
        {widgets.map((widget) => {
          const span = effectiveSpan(widget, tier);
          const cell = width > 0 ? { width: dashboardCellWidth(width, span, gap) } : null;
          if (!unlocked) {
            return (
              <View key={widget.id} style={cell}>
                {widget.content}
              </View>
            );
          }
          return (
            <DropZone
              key={widget.id}
              id={widget.id}
              label={widget.title}
              onDrop={onDrop}
              // A full-row cell stacks above and below its neighbors, so its midpoint splits
              // vertically; a cell that shares its row splits left/right.
              horizontal={span < DASHBOARD_COLUMNS}
              style={cell}
            >
              <Draggable id={widget.id} data={widget} label={widget.title}>
                <View style={skin.editCell(tokens)}>
                  <View style={skin.gripRow}>
                    <DragHandle label={`Reorder ${widget.title}`} />
                  </View>
                  {widget.content}
                </View>
              </Draggable>
            </DropZone>
          );
        })}
      </View>
    );
  }

  return function DashboardGrid(props: DashboardGridProps) {
    const { widgets, defaultOrder, onOrderChange, unlocked = false, storageKey, compact = false, testID, style } = props;
    // Read the controlled prop RAW (never destructured with a default): coalescing it would
    // latch the component into controlled mode and a bare grid would stop reordering.
    const controlledOrder = props.order;
    devWarn(
      controlledOrder != null && storageKey != null,
      "[canvas] <DashboardGrid />: `order` and `storageKey` were both passed; `storageKey` is ignored, because a controlled order is persisted by the app that owns it.",
    );
    // Storage is an uncontrolled-path convenience only, so it is off entirely when controlled.
    const persistKey = controlledOrder === undefined ? storageKey : undefined;

    // The seed is read ONCE (useControllableState only ever uses it on the first render), so
    // the storage read must not repeat on every render either.
    const seed = useRef<string[] | null>(null);
    if (seed.current === null) {
      seed.current = (persistKey != null ? readStoredOrder(persistKey) : null) ?? defaultOrder ?? widgets.map((w) => w.id);
    }
    const [order, setOrder] = useControllableState<string[]>(controlledOrder, seed.current, onOrderChange);

    // The rendered arrangement, reconciled against the live widget list. Its ids are also the
    // basis every move is computed from, so a widget appended because the stored order predates
    // it is still movable, and the reported order is always complete.
    const arranged = orderedWidgets(widgets, order);

    const handleDrop = (e: DropEvent) => {
      const ids = arranged.map((w) => w.id);
      // The target zone holds exactly one card, so the insertion index is binary: 0 lands
      // before the target widget, 1 after it.
      const next = moveWidget(ids, e.id, e.to, e.index <= 0);
      if (sameOrder(next, ids)) return;
      // Uncontrolled mode stores the next order internally; controlled mode leaves it to the
      // consumer (setOrder only fires onOrderChange there).
      setOrder(next);
      if (persistKey != null) writeStoredOrder(persistKey, next);
    };

    const cells = <DashboardCells widgets={arranged} unlocked={unlocked} compact={compact} onDrop={handleDrop} />;
    // Locked: a plain static grid, with no drag provider mounted at all.
    if (!unlocked) {
      return (
        <View testID={testID} style={[ROOT, style]}>
          {cells}
        </View>
      );
    }
    return (
      <DragDropProvider testID={testID} style={[ROOT, style]}>
        {cells}
      </DragDropProvider>
    );
  };
}
