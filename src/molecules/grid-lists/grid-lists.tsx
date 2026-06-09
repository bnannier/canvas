import { cn } from "../../cn.js";
import { View, Text } from "../../engine/index.js";
import { Card } from "../card/card.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Button } from "../../atoms/button/button.js";

// GridList: a responsive grid of card tiles for a people directory, a project
// or file collection, or any tiled gallery. Each item renders as a bordered
// card tile with a leading avatar, a title, and supporting text or a badge.
//
// The engine has no CSS grid, so the grid is built from a flex-row flex-wrap
// container whose tiles carry a fractional flex-basis (`w-[31%]` / `w-[48%]`)
// plus `grow`, so they share the row evenly and reflow as the row fills. Tiles
// are authored desktop-first: they take their column share on wide viewports
// and collapse to full width (`sm:w-full`) on phones and below.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf).
//
// - Columns (pick one; default is two-up): `cols3` packs three tiles per row,
//   `cols2` is the explicit two-up. With neither set the grid is two-up.
// - Density: `compact` tightens the gap and per-tile padding for denser grids.

/** A trailing tile action, rendered as a Button in people mode. */
export interface GridListAction {
  /** Button label (e.g. "Message"). */
  label: string;
  /** Render as an outline button (the default look is solid). */
  outline?: boolean;
  /** Render as a ghost button. */
  ghost?: boolean;
}

export interface GridListItem {
  /** Primary label for the tile (a name, project, or file). */
  title: string;
  /** Optional supporting line beneath the title (a role, path, or size). */
  subtitle?: string;
  /** Optional avatar photo URL or initials source for the leading avatar. */
  avatar?: string;
  /** Optional status word rendered as a trailing badge (e.g. "Active"). */
  badge?: string;
  /**
   * Gallery-tile block tint: a palette or token color name (e.g. "primary",
   * "blue-500"). Painted as `bg-{color}/20` behind the filename in gallery mode.
   */
  color?: string;
  /**
   * Trailing actions rendered as a button row beneath the title (people mode),
   * e.g. an outline "Message" and a ghost "View".
   */
  actions?: GridListAction[];
}

export interface GridListProps {
  /** The tiles to render, one card per entry. */
  items: GridListItem[];
  // Columns (pick one; default is two-up).
  cols3?: boolean;
  cols2?: boolean;
  /**
   * Gallery mode: render each tile as a borderless thumbnail (a square color
   * block from `item.color`, with a left-aligned filename and size below).
   * Avatars, badges, and actions are not shown in this mode. Omit for the
   * default people/card tile.
   */
  gallery?: boolean;
  // Density modifier: tighter gap and tile padding.
  compact?: boolean;
  className?: string;
}

type Columns = "cols2" | "cols3";

// Column precedence when more than one is passed: first match wins.
function columnsOf(p: GridListProps): Columns {
  if (p.cols3) return "cols3";
  if (p.cols2) return "cols2";
  return "cols2";
}

// Per-tile width share per column count. The fraction leaves room for the gap,
// `grow` lets a trailing tile expand to fill, and `sm:w-full` collapses each
// tile to a single column on phones and below (desktop-first).
const TILE_WIDTH: Record<Columns, string> = {
  cols2: "w-[48%] sm:w-full",
  cols3: "w-[31%] sm:w-full",
};

export function GridList(props: GridListProps) {
  const { items, gallery, compact, className } = props;
  const columns = columnsOf(props);

  // Container: a wrapping flex row. Compact tightens the inter-tile gap.
  const container = cn("flex-row flex-wrap", compact ? "gap-2" : "gap-3.5", className);

  // Gallery tiles are borderless thumbnails; people tiles are bordered cards.
  const tilePad = compact ? "p-4" : "p-5";

  return (
    <View className={container}>
      {items.map((item, index) =>
        gallery ? (
          <View
            key={`${item.title}-${index}`}
            className={cn("grow", TILE_WIDTH[columns])}
          >
            {/* Square color block. The engine has no bg-gradient, so a single
                translucent tint stands in for the legacy gradient swatch. */}
            <View
              className={cn("w-full h-32 rounded-md", item.color ? `bg-${item.color}/20` : "bg-muted")}
            />
            <View className="mt-2">
              <Text className="text-xs font-medium text-card-foreground">{item.title}</Text>
              {item.subtitle != null ? (
                <Text className="text-xs text-muted-foreground">{item.subtitle}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <Card
            key={`${item.title}-${index}`}
            className={cn("grow items-center", TILE_WIDTH[columns], tilePad)}
          >
            <View className="items-center gap-2">
              <Avatar large src={isPhoto(item.avatar) ? item.avatar : undefined} name={item.title}>
                {item.avatar && !isPhoto(item.avatar) ? item.avatar : undefined}
              </Avatar>
              <Text className="text-sm font-semibold text-card-foreground">{item.title}</Text>
              {item.subtitle != null ? (
                <Text className="text-xs text-muted-foreground">{item.subtitle}</Text>
              ) : null}
              {item.badge != null ? (
                <View className="mt-1">
                  <Badge secondary>{item.badge}</Badge>
                </View>
              ) : null}
              {item.actions != null && item.actions.length > 0 ? (
                <View className="flex-row gap-2 mt-2">
                  {item.actions.map((action, i) => (
                    <Button key={`${action.label}-${i}`} small outline={action.outline} ghost={action.ghost}>
                      {action.label}
                    </Button>
                  ))}
                </View>
              ) : null}
            </View>
          </Card>
        ),
      )}
    </View>
  );
}

// Treat anything that looks like a URL or path as a photo source; otherwise the
// value is initials, handed to the Avatar fallback.
function isPhoto(value?: string): value is string {
  if (!value) return false;
  return value.startsWith("http") || value.startsWith("/") || value.startsWith("data:");
}
