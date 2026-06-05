import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Card } from "./card.js";
import { Avatar } from "./avatar.js";
import { Badge } from "./badge.js";

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

export interface GridListItem {
  /** Primary label for the tile (a name, project, or file). */
  title: string;
  /** Optional supporting line beneath the title (a role, path, or size). */
  subtitle?: string;
  /** Optional avatar photo URL or initials source for the leading avatar. */
  avatar?: string;
  /** Optional status word rendered as a trailing badge (e.g. "Active"). */
  badge?: string;
}

export interface GridListProps {
  /** The tiles to render, one card per entry. */
  items: GridListItem[];
  // Columns (pick one; default is two-up).
  cols3?: boolean;
  cols2?: boolean;
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
  const { items, compact, className } = props;
  const columns = columnsOf(props);

  // Container: a wrapping flex row. Compact tightens the inter-tile gap.
  const container = cn("flex-row flex-wrap", compact ? "gap-2" : "gap-3.5", className);

  // Tile: a bordered card sharing the row. Centered stack of avatar, title, and
  // supporting line, matching the people-directory tile in the docs reference.
  const tilePad = compact ? "p-4" : "p-5";

  return (
    <Box className={container}>
      {items.map((item, index) => (
        <Card
          key={`${item.title}-${index}`}
          className={cn("grow items-center", TILE_WIDTH[columns], tilePad)}
        >
          <Box className="items-center gap-2">
            <Avatar large src={isPhoto(item.avatar) ? item.avatar : undefined} name={item.title}>
              {item.avatar && !isPhoto(item.avatar) ? item.avatar : undefined}
            </Avatar>
            <Text className="text-sm font-semibold text-card-foreground">{item.title}</Text>
            {item.subtitle != null ? (
              <Text className="text-xs text-muted-foreground">{item.subtitle}</Text>
            ) : null}
            {item.badge != null ? (
              <Box className="mt-1">
                <Badge secondary>{item.badge}</Badge>
              </Box>
            ) : null}
          </Box>
        </Card>
      ))}
    </Box>
  );
}

// Treat anything that looks like a URL or path as a photo source; otherwise the
// value is initials, handed to the Avatar fallback.
function isPhoto(value?: string): value is string {
  if (!value) return false;
  return value.startsWith("http") || value.startsWith("/") || value.startsWith("data:");
}
