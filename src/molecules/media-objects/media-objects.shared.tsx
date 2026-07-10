import { type ReactNode } from "react";
import { type ImageStyle } from "react-native";
import { View, Pressable, Image, Text, useTheme, surfaceRipple, pressDim, alpha, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import { type Align, type Direction, DIRECTION_ROW, ALIGN_ITEMS } from "./media-objects.styles.js";

// Shared MediaObject shell. The structure, the boolean-prop axes, the data shape,
// the accessibility, the leading-media precedence (photo > initials > icon), the
// truncation logic, and the semantic colors (which read the active tokens) live
// here once; a platform file supplies only its skin (radius, density/spacing, type
// tracking, shadow/elevation, press feedback) and calls createMediaObject.
//
// A media object is a horizontal row: a leading media element (avatar, image, or
// icon glyph) sits beside a content column (a bold title, a muted description,
// and an optional longer supporting body), sometimes with a trailing action
// pinned to the right. It is the building block for list rows, notifications,
// and comment layouts.
//
// MediaObject is a "Light" platform treatment: one structure and one set of
// (semantic) colors, with per-OS touches limited to corner radius, density,
// type tracking, shadow, and press feedback — so the skin carries only those.
//
// Boolean-prop API, grouped by axis with first-match precedence within an axis
// (mirrors Button's intentOf):
//
// - Alignment: `center` aligns the row's cross axis to the middle (the compact,
//   single-line list/action row); the default top-aligns with items-start so the
//   media anchors to the first line of a multi-line body (per the component's
//   "Avatar" do/don't: items-start for multi-line, center for single-line rows).
// - Direction: `reversed` flips the media to the trailing edge; default leads
//   with the media on the left.
// - Surface: `bordered` wraps the row in the card surface (border + padding) used
//   when a media object stands alone as a card; omit for a bare row.
//
// State/layout booleans stack orthogonally: `truncate` clamps the title and
// description to one line each (the action pattern, so a long email never wraps
// and pushes the trailing action out of alignment).

export interface MediaObjectSkin {
  /** Row gap between the leading media, content column, and trailing slot. */
  containerBase: ViewStyle;
  /** bordered card surface: corner radius + border width + padding (+ elevation). The
   *  border color and the card fill (which read the tokens and follow light/dark; the
   *  card stays SOLID under glass) are supplied by shared; the skin carries only the
   *  shape/density/shadow. */
  borderedSurface: ViewStyle;
  /** Leading photo wrapper shape: size + corner radius (the muted fill comes from shared). */
  photoBox: ViewStyle;
  /** The photo itself: matching corner radius. */
  photoImage: ImageStyle;
  /** Leading icon box shape: size + corner radius (the tinted fill comes from shared). */
  iconBox: ViewStyle;
  /** The glyph inside the icon box: type size/weight/tracking (the primary color comes from shared). */
  iconGlyph: TextStyle;
  /** Content column layout: min-width 0 + flex + the title/description gap. */
  content: ViewStyle;
  /** Title type: size / line-height / weight / tracking (the color comes from shared). */
  title: TextStyle;
  /** Description type: size / line-height / tracking (the color comes from shared). */
  description: TextStyle;
  /** Body paragraph type: size / line-height / tracking (the color comes from shared). */
  body: TextStyle;
  /** Trailing meta type: size / line-height / tracking (the color comes from shared). */
  meta: TextStyle;
  /** Trailing action wrapper: shrink-0. */
  actionBox: ViewStyle;
  /** Press opacity dim for iOS/web (null on Android, where the ripple carries it). */
  pressedOpacity: number;
}

export interface MediaObjectProps {
  /** Primary line: the bold heading (e.g. a person's name). */
  title?: string;
  /** Secondary line: muted supporting text under the title (e.g. a role or email). */
  description?: string;
  /** Optional longer body paragraph rendered below the description. */
  body?: ReactNode;
  /** Trailing metadata text pinned to the right (e.g. "2h ago", "admin"). */
  meta?: string;
  /** Initials for the leading avatar (e.g. "RC"); rendered as <Avatar>{avatar}</Avatar>. */
  avatar?: string;
  /** Photo for the leading avatar (a URI string or a bundled `require(...)` image); takes precedence over initials. */
  src?: string | number;
  /** A leading icon glyph rendered in a tinted square box (stands in for an SVG icon). */
  icon?: ReactNode;
  /** A trailing action node (e.g. a <Button>), pinned to the right edge. */
  action?: ReactNode;
  /** Make the whole row a tappable target (navigate to a detail, select a row).
   *  When set, the row renders as a Pressable with a button role and a pressed
   *  affordance, so you never hand-roll a Pressable for a tappable media row. */
  onPress?: () => void;
  // Alignment (pick one; default top-aligns with items-start).
  center?: boolean;
  start?: boolean;
  // Direction (pick one; default leads with the media on the left).
  reversed?: boolean;
  leading?: boolean;
  // Surface.
  bordered?: boolean;
  // Layout.
  truncate?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// Alignment precedence when more than one is passed: first match wins. Default is
// start (items-start) so the media anchors to the first line of a multi-line body.
function alignOf(p: MediaObjectProps): Align {
  if (p.center) return "center";
  if (p.start) return "start";
  return "start";
}

// Direction precedence when more than one is passed: first match wins.
function directionOf(p: MediaObjectProps): Direction {
  if (p.reversed) return "reversed";
  if (p.leading) return "leading";
  return "leading";
}

// The bordered card surface color (platform-neutral): border + card fill read the
// active tokens, so the surface follows light/dark. MediaObject is a CONTENT-layer
// surface that paints tokens.card, which stays SOLID under glass (only the
// functional/popover layer frosts). The skin carries only the shape/density/shadow.
function borderedColors(tokens: ColorTokens): ViewStyle {
  return { borderColor: tokens.border, backgroundColor: tokens.card };
}

export function createMediaObject(skin: MediaObjectSkin) {
  return function MediaObject(props: MediaObjectProps) {
    const { title, description, body, meta, avatar, src, icon, action, truncate, testID, style } = props;
    const { tokens } = useTheme();
    const align = alignOf(props);
    const direction = directionOf(props);

    const container: StyleProp<ViewStyle> = [
      skin.containerBase,
      { flexDirection: DIRECTION_ROW[direction], alignItems: ALIGN_ITEMS[align] },
      props.bordered ? [skin.borderedSurface, borderedColors(tokens)] : null,
      style,
    ];

    // Leading media: photo > initials avatar > icon box. Only one renders. The
    // muted/tint fills read the tokens; the box shape comes from the skin.
    let media: ReactNode = null;
    if (src) {
      media = (
        <View style={[skin.photoBox, { backgroundColor: tokens.muted }]}>
          <Image style={[skin.photoImage, { width: "100%", height: "100%" }]} source={typeof src === "number" ? src : { uri: src }} accessibilityLabel={title} resizeMode="cover" />
        </View>
      );
    } else if (avatar) {
      media = <Avatar name={avatar}>{avatar}</Avatar>;
    } else if (icon != null) {
      media = (
        <View style={[skin.iconBox, { backgroundColor: alpha(tokens.primary, 0.15) }]}>
          {typeof icon === "string" ? <Text style={[skin.iconGlyph, { color: tokens.primary }]}>{icon}</Text> : icon}
        </View>
      );
    }

    // The engine has no truncate utility; RN clamps text via numberOfLines, which
    // is the supported equivalent (single line with an ellipsis on overflow).
    const inner = (
      <>
        {media}
        <View style={skin.content}>
          {title != null ? (
            <Text style={[skin.title, { color: tokens.foreground }]} numberOfLines={truncate ? 1 : undefined}>
              {title}
            </Text>
          ) : null}
          {description != null ? (
            <Text style={[skin.description, { color: tokens["muted-foreground"] }]} numberOfLines={truncate ? 1 : undefined}>
              {description}
            </Text>
          ) : null}
          {body != null ? <Text style={[skin.body, { color: tokens.foreground }]}>{body}</Text> : null}
        </View>
        {meta != null ? <Text style={[skin.meta, { color: tokens["muted-foreground"] }]}>{meta}</Text> : null}
        {action != null ? <View style={skin.actionBox}>{action}</View> : null}
      </>
    );

    // A tappable row swaps the View for a Pressable with a button role and a pressed
    // affordance, so a tappable media row needs no hand-rolled Pressable. Android
    // shows the native surface ripple; iOS/web dim opacity on press.
    if (props.onPress) {
      // A tappable row's accessible name is otherwise derived only from its
      // descendant Text. An icon-only or photo-only row (no title/description/meta)
      // would expose an unlabeled button, so fall back to the first available text
      // prop to give the control a name for screen readers.
      const a11yLabel = title ?? description ?? meta ?? undefined;
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
          onPress={props.onPress}
          testID={testID}
          android_ripple={surfaceRipple(tokens)}
          style={({ pressed }) => [container, pressDim(pressed, skin.pressedOpacity)]}
        >
          {inner}
        </Pressable>
      );
    }

    return <View testID={testID} style={container}>{inner}</View>;
  };
}
