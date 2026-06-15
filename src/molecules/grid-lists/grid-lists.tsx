import { type DimensionValue } from "react-native";
import { View, Pressable, Text, useTheme, useResponsive, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Card } from "../card/card.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Button } from "../../atoms/button/button.js";
import * as s from "./grid-lists.styles.js";
import { type Columns } from "./grid-lists.styles.js";

// GridList: a responsive grid of card tiles for a people directory, a project
// or file collection, or any tiled gallery. Each item renders as a bordered
// card tile with a leading avatar, a title, and supporting text or a badge.
//
// RN has no CSS grid, so the grid is built from a flex-row flex-wrap container
// whose tiles carry a fractional flex-basis (48% / 31% width) plus grow, so they
// share the row evenly and reflow as the row fills. Tiles are authored
// desktop-first: they take their column share on wide viewports and collapse to
// full width on phones and below (the `sm` responsive width).
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
   * "blue-500"). Painted at 20% behind the filename in gallery mode.
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
  /** Make each tile a tappable target (open a detail, select a tile). When set,
   *  every tile renders as a Pressable with a button role and a pressed
   *  affordance, so a tappable grid needs no hand-rolled Pressable. */
  onPressItem?: (index: number) => void;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Column precedence when more than one is passed: first match wins.
function columnsOf(p: GridListProps): Columns {
  if (p.cols3) return "cols3";
  if (p.cols2) return "cols2";
  return "cols2";
}

// A borderless gallery thumbnail: a square color block with a filename and size
// below. Owns the responsive width so it collapses to full width on phones.
function GalleryTile({ item, columns, onPress }: { item: GridListItem; columns: Columns; onPress?: () => void }) {
  const { tokens } = useTheme();
  const width = useResponsive<DimensionValue>({ base: s.TILE_WIDTH[columns], sm: "100%" });
  const inner = (
    <>
      {/* Square color block. A single translucent tint stands in for the legacy
          gradient swatch. */}
      <View style={[s.galleryBlock, s.galleryBlockFill(tokens, item.color)]} />
      <View style={s.galleryMeta}>
        <Text style={s.galleryTitle(tokens)}>{item.title}</Text>
        {item.subtitle != null ? <Text style={s.gallerySubtitle(tokens)}>{item.subtitle}</Text> : null}
      </View>
    </>
  );
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.tileGrow, { width }, pressed ? { opacity: 0.9 } : null]}>
        {inner}
      </Pressable>
    );
  }
  return <View style={[s.tileGrow, { width }]}>{inner}</View>;
}

// A bordered people card tile: a leading avatar, a title, supporting text, an
// optional badge, and an optional action row. Owns the responsive width so it
// collapses to full width on phones.
function PeopleTile({ item, columns, compact, onPress }: { item: GridListItem; columns: Columns; compact: boolean; onPress?: () => void }) {
  const { tokens } = useTheme();
  const width = useResponsive<DimensionValue>({ base: s.TILE_WIDTH[columns], sm: "100%" });
  return (
    <Card onPress={onPress} style={[s.tilePad(compact), { width }]}>
      <View style={s.cardInner}>
        <Avatar large src={isPhoto(item.avatar) ? item.avatar : undefined} name={item.title}>
          {item.avatar && !isPhoto(item.avatar) ? item.avatar : undefined}
        </Avatar>
        <Text style={s.cardTitle(tokens)}>{item.title}</Text>
        {item.subtitle != null ? <Text style={s.cardSubtitle(tokens)}>{item.subtitle}</Text> : null}
        {item.badge != null ? (
          <View style={s.badgeSpacing}>
            <Badge secondary>{item.badge}</Badge>
          </View>
        ) : null}
        {item.actions != null && item.actions.length > 0 ? (
          <View style={s.actions}>
            {item.actions.map((action, i) => (
              <Button key={`${action.label}-${i}`} small outline={action.outline} ghost={action.ghost}>
                {action.label}
              </Button>
            ))}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

export function GridList(props: GridListProps) {
  const { items, gallery, compact, style, onPressItem } = props;
  const columns = columnsOf(props);

  return (
    <View style={[s.container, s.containerGap(!!compact), style]}>
      {items.map((item, index) => {
        const onPress = onPressItem ? () => onPressItem(index) : undefined;
        return gallery ? (
          <GalleryTile key={`${item.title}-${index}`} item={item} columns={columns} onPress={onPress} />
        ) : (
          <PeopleTile key={`${item.title}-${index}`} item={item} columns={columns} compact={!!compact} onPress={onPress} />
        );
      })}
    </View>
  );
}

// Treat anything that looks like a URL or path as a photo source; otherwise the
// value is initials, handed to the Avatar fallback.
function isPhoto(value?: string): value is string {
  if (!value) return false;
  return value.startsWith("http") || value.startsWith("/") || value.startsWith("data:");
}
