import { Fragment, type ComponentType } from "react";
import { FlatList, StyleSheet, type DimensionValue, type LayoutChangeEvent, type ViewProps } from "react-native";
import { View, Pressable, Text, useTheme, useContainerWidth, devWarn, FOCUS_RESET, type ColorTokens, type ViewStyle, type TextStyle, type LayoutStyle, GlassSurface, GlassPane, paneStyle, paneRipple, alpha } from "../../style/index.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { Card as WebCard } from "../card/card.js";
import { Avatar as WebAvatar } from "../../atoms/avatar/avatar.js";
import { Badge as WebBadge } from "../../atoms/badge/badge.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { type CardProps } from "../card/card.shared.js";
import { type AvatarProps } from "../../atoms/avatar/avatar.shared.js";
import { type BadgeProps } from "../../atoms/badge/badge.shared.js";
import { type ButtonProps } from "../../atoms/button/button.shared.js";
import { useHover } from "../../style/hover.js";
import { GradientFill } from "../../style/gradient-fill.js";
import { MEASURE_ROUNDING, gridCellWidth, gridColumns } from "../../atoms/grid/grid.shared.js";
import { AnatomyPart, AnatomyScope, useAnatomyPart, withPartLayout, type AnatomyTarget } from "../../style/anatomy.js";
import { useScrollFocus } from "../../style/use-scroll-focus.js";
import { useFocusFrame } from "../../style/focus-frame.js";
import { LIST_ITEM, LIST_WRAPPER, WindowedListCell, listProps, windowedListItem } from "../../style/list-semantics.js";
import * as s from "./grid-lists.styles.js";
import { type Columns } from "./grid-lists.styles.js";

// Shared GridList shell. The structure (a responsive grid of card tiles, the
// people-card and gallery-thumbnail tiles, the avatar/title/subtitle/badge/action
// composition), the boolean-prop axes, the data-shape types, and the responsive
// column math live here once; a platform file supplies only its skin (the gallery
// thumbnail radius, the grid density, the title/subtitle type tracking, and the
// press feedback on the molecule's own pressable) and calls createGridList.
//
// GridList: a responsive grid of card tiles for a people directory, a project
// or file collection, or any tiled gallery. Each item renders as a bordered
// card tile with a leading avatar, a title, and supporting text or a badge.
//
// RN has no CSS grid, so the grid is a flex-row flex-wrap container whose tiles take
// the hand-off's auto-fill column width, measured on the grid itself: as many columns as
// asked for while each holds 140 px, fewer below that, and a short last row keeps its
// columns rather than stretching.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf).
//
// - Columns (pick one; default is three-up, the hand-off's): `cols3` is the explicit
//   three-up, `cols2` the two-up.
// - Density: `compact` tightens the gap and per-tile padding for denser grids.
//
// GridList is a "Light" platform treatment: one structure and one set of
// (semantic) colors, with per-OS touches limited to the gallery thumbnail radius,
// grid density, type tracking, and press feedback — so the skin carries only
// those, not the colors or layout structure. The bordered people tile composes
// the Card atom, which brings its own surface; the gallery thumbnail is the
// molecule's own pressable, so its ripple/opacity feedback comes from the skin.

// The contract a platform skin fulfills. The shell renders the grid, the people
// tile, and the gallery tile; the skin maps the active platform's thumbnail
// radius, density, type tracking, and press feedback onto each piece.
export interface GridListSkin {
  /** Gallery thumbnail block corner radius, when the thumbnail stands on its own (iOS). */
  galleryRadius: number;
  /**
   * The gallery tile's frame (its corner, hairline and fill): the thumbnail sits square
   * at its top, clipped by the frame, over a padded caption. Null where the thumbnail
   * stands on its own with the caption under it (iOS Collections).
   */
  galleryTile: ((t: ColorTokens) => ViewStyle) | null;
  /** The framed gallery tile's caption inset. */
  galleryCaption: ViewStyle;
  /** iOS continuous (superellipse) corner curve for the gallery thumbnail; omitted (no-op) elsewhere. */
  galleryCurve?: ViewStyle["borderCurve"];
  /** Inter-tile grid gap per density (default vs compact). */
  gap: { default: number; compact: number };
  /** Per-tile padding for the people card per density (default vs compact). */
  tilePad: { default: number; compact: number };
  /** Gallery filename type (size/line-height/weight + per-OS tracking). */
  galleryTitle: (t: ColorTokens) => TextStyle;
  /** People-tile title type (size/line-height/weight + per-OS tracking). */
  cardTitle: (t: ColorTokens) => TextStyle;
  /** Gallery filename subtitle type (size/line-height + per-OS tracking). */
  gallerySubtitle: (t: ColorTokens) => TextStyle;
  /** People-tile subtitle type (size/line-height + per-OS tracking). */
  cardSubtitle: (t: ColorTokens) => TextStyle;
  /** iOS/web dim-on-press for the gallery pressable; null on Android. */
  pressedOpacity: number | null;
  /** Android ripple over the gallery pressable; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
  /** The shadow a tappable framed tile lifts to under the pointer (the web); null elsewhere. */
  hoverShadow: ((t: ColorTokens) => ViewStyle) | null;
}

// The composed atoms (Card / Avatar / Badge / Button) are passed in by each
// platform entry file (grid-lists.ios.tsx / .android.tsx) so the people tile's
// surface, avatar, status badge, and action buttons all match the active OS. In
// the WEB docs 3-up preview this threading is load-bearing: a bare barrel import
// always resolves the WEB atoms in a browser bundle, so createGridList takes the
// per-OS atoms as parameters (defaulting to the web atoms for the web build).
export type CardComponent = ComponentType<CardProps>;
export type AvatarComponent = ComponentType<AvatarProps>;
export type BadgeComponent = ComponentType<BadgeProps>;
export type ButtonComponent = ComponentType<ButtonProps>;

/** A trailing tile action, rendered as a Button in people mode. */
export interface GridListAction {
  /** Button label (e.g. "Message"). */
  label: string;
  /** Called when the action button is pressed. */
  onPress?: () => void;
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
  // Columns (pick one; default is three-up).
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
  /**
   * The grid's accessible name (e.g. "Team members"): a screen reader announces it
   * with the list of tiles. A `virtualized` grid needs one: on the web its scroller is
   * a keyboard stop while the tiles overflow, and Chromium names an unnamed stop from
   * the text of every tile it has rendered.
   */
  label?: string;
  /**
   * Render the tiles through a windowed `FlatList` instead of mounting every tile up
   * front, for large grids. Give the grid a bounded height (via `style`, e.g.
   * `{ maxHeight: 480 }`) so it can scroll; without one it warns and renders eagerly
   * anyway. Default (omitted) mounts all tiles, unchanged. On the web, while the tiles
   * overflow, the windowed grid is a keyboard tab stop the keyboard can scroll, and it
   * draws the focus ring around itself while it has keyboard focus.
   */
  virtualized?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// Column precedence when more than one is passed: first match wins.
export function columnsOf(p: GridListProps): Columns {
  if (p.cols3) return "cols3";
  if (p.cols2) return "cols2";
  return "cols3";
}

// The handlers of the parts the first tile draws, handed to that tile only.
interface TileParts {
  tile: AnatomyTarget | undefined;
  media: AnatomyTarget | undefined;
  caption: AnatomyTarget | undefined;
}

// A pass-through box over a GlassSurface (which has no ref), measured as a docs AnatomyProvider part.
const MEASURE_BOX = StyleSheet.create({ box: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" } }).box;

export function createGridList(
  skin: GridListSkin,
  Card: CardComponent = WebCard,
  Avatar: AvatarComponent = WebAvatar,
  Badge: BadgeComponent = WebBadge,
  Button: ButtonComponent = WebButton,
) {
  // A borderless gallery thumbnail: a square color block with a filename and size
  // below. The parent GridList resolves the responsive width ONCE and passes it
  // down, so an N-tile grid carries one viewport subscription, not N.
  function GalleryTile({ item, width, grows, listItem, onPress, parts }: { item: GridListItem; width: DimensionValue; grows: boolean; listItem: ViewProps; onPress?: () => void; parts?: TileParts }) {
    const theme = useMaterialTheme({ static: true });
    const { tokens } = theme;
    const frame = skin.galleryTile ? skin.galleryTile(tokens) : null;
    const cell: ViewStyle[] = [grows ? s.tileGrow : {}, { width }];
    if (frame) return <FramedGalleryTile item={item} cell={cell} listItem={listItem} onPress={onPress} frame={frame} parts={parts} />;
    const inner = (
      <>
        {/* Square color block. A single translucent tint stands in for the legacy
            gradient swatch; under glass it is a CONTENT-layer pane carrying the item
            colour as its tint (GlassSurface is the plain View in solid mode). */}
        <GlassSurface
          layer="content"
          tint={item.color != null ? alpha(s.resolveColor(tokens, item.color), 0.32) : undefined}
          style={[
            s.galleryBlock,
            { borderRadius: skin.galleryRadius, ...(skin.galleryCurve ? { borderCurve: skin.galleryCurve } : null) },
            s.galleryBlockFill(tokens, item.color),
          ]}
        >
          {/* The Media part's box: GlassSurface has no ref, so a pass-through fill measures it. */}
          {parts?.media ? <View ref={parts.media.ref} onLayout={parts.media.onLayout} style={MEASURE_BOX} /> : null}
        </GlassSurface>
        <View ref={parts?.caption?.ref} onLayout={parts?.caption?.onLayout} style={s.galleryMeta}>
          <Text style={skin.galleryTitle(tokens)}>{item.title}</Text>
          {item.subtitle != null ? <Text style={skin.gallerySubtitle(tokens)}>{item.subtitle}</Text> : null}
        </View>
      </>
    );
    if (onPress) {
      // The gallery tile is the molecule's OWN pressable: the skin supplies the
      // press feedback (Android ripple vs iOS/web opacity dim). It is a button in its
      // list item, which is the grid cell: a `listitem` is not a control, so the item
      // wraps the button, and the button fills the cell as it did when it was one.
      const ripple = skin.ripple ? skin.ripple(tokens) : undefined;
      return (
        <View {...listItem} ref={parts?.tile?.ref} onLayout={parts?.tile?.onLayout} style={cell}>
          <Pressable
            accessibilityRole="button"
            onPress={onPress}
            android_ripple={ripple}
            style={({ pressed }) => [s.tileGrow, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
          >
            {inner}
          </Pressable>
        </View>
      );
    }
    return <View {...listItem} ref={parts?.tile?.ref} onLayout={parts?.tile?.onLayout} style={cell}>{inner}</View>;
  }

  // The framed gallery tile (the v4 hand-off's): the thumbnail square at the top of a
  // content pane, clipped by its corner, over the padded caption.
  function FramedGalleryTile({ item, cell, listItem, onPress, frame, parts }: { item: GridListItem; cell: ViewStyle[]; listItem: ViewProps; onPress?: () => void; frame: ViewStyle; parts?: TileParts }) {
    if (onPress) return <PressableFramedTile item={item} cell={cell} listItem={listItem} onPress={onPress} frame={frame} parts={parts} />;
    return (
      <View {...listItem} ref={parts?.tile?.ref} onLayout={parts?.tile?.onLayout} style={cell}>
        <GlassSurface layer="content" style={frame}><FramedTileContent item={item} parts={parts} /></GlassSurface>
      </View>
    );
  }

  // A tappable framed tile: the pane rides inside the Pressable so the tap, ripple and dim
  // stay on it, and the pointer lifts it to the skin's hover shadow.
  function PressableFramedTile({ item, cell, listItem, onPress, frame, parts }: { item: GridListItem; cell: ViewStyle[]; listItem: ViewProps; onPress: () => void; frame: ViewStyle; parts?: TileParts }) {
    const theme = useMaterialTheme({ static: true });
    const { tokens } = theme;
    const { hovered, target: hoverTarget } = useHover(skin.hoverShadow != null);
    const ripple = paneRipple(theme, skin.ripple ? skin.ripple(tokens) : undefined);
    return (
      <View {...listItem} ref={parts?.tile?.ref} onLayout={parts?.tile?.onLayout} style={cell}>
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          android_ripple={ripple}
          {...hoverTarget}
          style={({ pressed }) => [paneStyle(theme, frame), hovered && skin.hoverShadow ? skin.hoverShadow(tokens) : null, skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null]}
        >
          <GlassPane layer="content" shape={frame} />
          <FramedTileContent item={item} parts={parts} />
        </Pressable>
      </View>
    );
  }

  // The framed tile's thumbnail, the hand-off's 135 degree wash of the item's colour (a
  // paint inside the pane in either surface mode: artwork, not a fill role), over its caption.
  function FramedTileContent({ item, parts }: { item: GridListItem; parts?: TileParts }) {
    const { tokens } = useMaterialTheme({ static: true });
    return (
      <>
        <View ref={parts?.media?.ref} onLayout={parts?.media?.onLayout} style={s.galleryThumb}>
          <GradientFill angle={s.MEDIA_ANGLE} stops={s.mediaStops(tokens, item.color)} />
        </View>
        <View ref={parts?.caption?.ref} onLayout={parts?.caption?.onLayout} style={skin.galleryCaption}>
          <Text style={skin.galleryTitle(tokens)} numberOfLines={1}>{item.title}</Text>
          {item.subtitle != null ? <Text style={skin.gallerySubtitle(tokens)}>{item.subtitle}</Text> : null}
        </View>
      </>
    );
  }

  // A bordered people card tile: a leading avatar, a title, supporting text, an
  // optional badge, and an optional action row. The parent GridList resolves the
  // responsive width once and passes it down. Its surface and press feedback come
  // from the Card atom (already platform-correct per build), so the skin only sets
  // the tile padding density and the title type.
  function PeopleTile({ item, width, grows, compact, listItem, onPress, parts }: { item: GridListItem; width: DimensionValue; grows: boolean; compact: boolean; listItem: ViewProps; onPress?: () => void; parts?: TileParts }) {
    const { tokens } = useTheme();
    const pad = compact ? skin.tilePad.compact : skin.tilePad.default;
    // The tile cell owns the measured width (a layout cell) and is the list item; the
    // Card fills it. A tile with action buttons is a clickable container rather than a
    // button, so its actions are not buttons nested in a button.
    const actions = item.actions ?? [];
    const hasActions = actions.length > 0;
    const caption = (
      <>
        <Text style={skin.cardTitle(tokens)}>{item.title}</Text>
        {item.subtitle != null ? <Text style={skin.cardSubtitle(tokens)}>{item.subtitle}</Text> : null}
      </>
    );
    return (
      <View {...listItem} ref={parts?.tile?.ref} onLayout={parts?.tile?.onLayout} style={[grows ? s.tileGrow : null, { width }]}>
        {/* The tile's own inset rides its content, not the Card's style: a pressable
            Card's style lands on its outer clip, where it centred the press target
            instead of the content and left most of the tile untappable. */}
        <Card flush onPress={onPress} interactiveContents={hasActions}>
        <View style={[s.cardInner, { padding: pad }]}>
          <AnatomyPart part={parts?.media}>
            <Avatar large src={isPhoto(item.avatar) ? item.avatar : undefined} name={item.title}>
              {item.avatar && !isPhoto(item.avatar) ? item.avatar : undefined}
            </Avatar>
          </AnatomyPart>
          {/* A same-layout box (the column's own centring and gap) only under a docs AnatomyProvider, to measure the Caption. */}
          {parts?.caption ? <View ref={parts.caption.ref} onLayout={parts.caption.onLayout} style={s.cardInner}>{caption}</View> : caption}
          {item.badge != null ? (
            <View style={s.badgeSpacing}>
              <Badge secondary>{item.badge}</Badge>
            </View>
          ) : null}
          {hasActions ? (
            <View style={s.actions}>
              {actions.map((action, i) => (
                <Button key={`${action.label}-${i}`} small outline={action.outline} ghost={action.ghost} onPress={action.onPress}>
                  {action.label}
                </Button>
              ))}
            </View>
          ) : null}
        </View>
        </Card>
      </View>
    );
  }

  return function GridList(props: GridListProps) {
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Grid, Tile, Media, Caption. The last three are the first tile's,
    // taken before the tree's AnatomyScope so the tile's Card, Avatar and Badge register
    // nothing. A windowed grid has no host node to measure, so it registers none.
    const gridPart = useAnatomyPart("Grid");
    const firstParts: TileParts = { tile: useAnatomyPart("Tile"), media: useAnatomyPart("Media"), caption: useAnatomyPart("Caption") };
    const { items, gallery, compact, label, virtualized, testID, style, onPressItem } = props;
    const columns = columnsOf(props);
    const gap = compact ? skin.gap.compact : skin.gap.default;
    // ONE resolution for the whole grid, measured against the grid's OWN width (a grid in
    // a narrow desktop column drops columns too; a viewport seed keeps the first frame
    // plausible): the hand-off's auto-fill columns, at most the asked-for count, each at
    // least 140 px, every tile its column's width.
    const { width: gridWidth, onLayout: onGridLayout } = useContainerWidth();
    const asked = s.COLUMN_COUNT[columns];
    const cols = Math.min(asked, gridColumns(gridWidth, s.MIN_TILE_WIDTH, gap));
    // A windowed grid scrolls its tiles on its own, so it is a keyboard stop while they
    // overflow, whatever the tiles hold (DataTable's windowed body is the precedent).
    // Left alone, Chromium and Firefox made a read-only grid's scroller a stop anyway
    // (a scroller with nothing focusable inside) and drew their own ring on it, while
    // WebKit left it out of the tab order. The scroller is the grid's root, with no
    // card around it to clip a ring, so it is its own frame (src/style/focus-frame.tsx)
    // and draws the theme's ring around itself as the other lists' cards do.
    const gridFocus = useScrollFocus("vertical");
    const gridFrame = useFocusFrame();
    const tileWidth: DimensionValue = gridWidth > 0 ? gridCellWidth(gridWidth - (cols > 1 ? MEASURE_ROUNDING : 0), cols, gap) : s.TILE_SHARE[columns];
    const grows = gridWidth <= 0;
    // FlatList lays out `numColumns` tiles per row itself, the flex-wrap grid's count.
    const numColumns = gridWidth > 0 ? cols : asked;

    // One tile, keyless so it can be used both by the eager `.map` (which supplies
    // the key via a Fragment) and by FlatList's renderItem (which keys via keyExtractor).
    // `listItem` is the tile's place in the list (src/style/list-semantics.tsx).
    const renderTile = (item: GridListItem, index: number, listItem: ViewProps) => {
      const onPress = onPressItem ? () => onPressItem(index) : undefined;
      return gallery ? (
        <GalleryTile item={item} width={tileWidth} grows={grows} listItem={listItem} onPress={onPress} parts={index === 0 ? firstParts : undefined} />
      ) : (
        <PeopleTile item={item} width={tileWidth} grows={grows} compact={!!compact} listItem={listItem} onPress={onPress} parts={index === 0 ? firstParts : undefined} />
      );
    };
    // The tiles are a list named by `label`: the grid's root in both paths, as Tailwind
    // UI's grid lists are one `<ul role="list">` of `<li>` tiles.
    const list = listProps({ label });

    // Stable identity per tile; matches the eager path's key so switching to the
    // windowed path keeps a tile mapped to the same item.
    const keyOf = (item: GridListItem, index: number) => `${item.title}-${index}`;

    // A windowed grid needs a bounded height to scroll (and to actually window). Warn
    // once if `virtualized` is set without one; a FlatList with no height falls back
    // to rendering every tile anyway, so the flag would be a silent no-op.
    const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
    const bounded = flat.height != null || flat.maxHeight != null || flat.flex != null || flat.flexBasis != null;
    devWarn(
      !!virtualized && !bounded,
      "[canvas] <GridList virtualized>: give the grid a bounded height (e.g. style={{ maxHeight: 480 }}) so it can window and scroll; rendering eagerly for now.",
    );
    devWarn(
      !!virtualized && bounded && !label,
      "[canvas] <GridList virtualized>: give the grid a `label`. While its tiles overflow it is a keyboard stop, and Chromium names an unnamed stop from the text of every tile it has rendered.",
    );

    // The windowed path: FlatList tiles the items into `numColumns` per row. The
    // eager grid's single flex `gap` is split back into its two axes: the
    // inter-column gap onto each row wrapper, the inter-row gap onto the content
    // container, so the spacing matches the eager grid. The eager path below keeps
    // its one flex-wrap container, which is the list.
    if (virtualized && bounded) {
      return (
        <AnatomyScope>
        <FlatList
          // FlatList cannot change numColumns on a live list; remount when the
          // responsive column count crosses the breakpoint.
          key={numColumns}
          testID={testID}
          {...gridFocus}
          {...gridFrame.target}
          onLayout={(event: LayoutChangeEvent) => {
            onGridLayout(event);
            gridFocus.onLayout(event);
          }}
          // The list itself is the stop. Focused, an unnamed scroller took its name from
          // every tile it rendered in Chromium, a list included, so `label` names it
          // (the dev warning above asks for one).
          {...list}
          style={[style, FOCUS_RESET, gridFrame.ring()]}
          data={items}
          renderItem={({ item, index }) => renderTile(item, index, windowedListItem(index, items.length))}
          keyExtractor={keyOf}
          numColumns={numColumns}
          // FlatList's own wrappers (the content container, each cell, each row of
          // cells) stay static, so Chromium counts the tiles for the list.
          columnWrapperStyle={numColumns > 1 ? [{ gap }, LIST_WRAPPER] : undefined}
          contentContainerStyle={[{ gap }, LIST_WRAPPER]}
          CellRendererComponent={WindowedListCell}
          showsVerticalScrollIndicator={false}
        />
        </AnatomyScope>
      );
    }

    return (
      <AnatomyScope>
        <View ref={gridPart?.ref} testID={testID} onLayout={withPartLayout(gridPart, onGridLayout)} {...list} style={[s.container, { gap }, style]}>
          {items.map((item, index) => (
            <Fragment key={keyOf(item, index)}>{renderTile(item, index, LIST_ITEM)}</Fragment>
          ))}
        </View>
      </AnatomyScope>
    );
  };
}

// Treat anything that looks like a URL or path as a photo source; otherwise the
// value is initials, handed to the Avatar fallback.
function isPhoto(value?: string): value is string {
  if (!value) return false;
  return value.startsWith("http") || value.startsWith("/") || value.startsWith("data:");
}
