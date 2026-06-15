import { type ReactNode } from "react";
import { View, Pressable, Image, Text, useTheme, surfaceRipple, pressDim, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import * as s from "./media-objects.styles.js";
import { type Align, type Direction } from "./media-objects.styles.js";

// A media object is a horizontal row: a leading media element (avatar, image, or
// icon glyph) sits beside a content column (a bold title, a muted description,
// and an optional longer supporting body), sometimes with a trailing action
// pinned to the right. It is the building block for list rows, notifications,
// and comment layouts.
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
  /** Photo URL for the leading avatar; takes precedence over initials. */
  src?: string;
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
  /** Escape hatch for layout/positioning composition (width, margins). */
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

export function MediaObject(props: MediaObjectProps) {
  const { title, description, body, meta, avatar, src, icon, action, truncate, style } = props;
  const { tokens } = useTheme();
  const align = alignOf(props);
  const direction = directionOf(props);

  const container: StyleProp<ViewStyle> = [
    s.containerBase,
    { flexDirection: s.DIRECTION_ROW[direction], alignItems: s.ALIGN_ITEMS[align] },
    props.bordered ? s.borderedSurface(tokens) : null,
    style,
  ];

  // Leading media: photo > initials avatar > icon box. Only one renders.
  let media: ReactNode = null;
  if (src) {
    media = (
      <View style={s.photoBox(tokens)}>
        <Image style={s.photoImage} source={{ uri: src }} accessibilityLabel={title} resizeMode="cover" />
      </View>
    );
  } else if (avatar) {
    media = <Avatar name={avatar}>{avatar}</Avatar>;
  } else if (icon != null) {
    media = (
      <View style={s.iconBox(tokens)}>
        {typeof icon === "string" ? <Text style={s.iconGlyph(tokens)}>{icon}</Text> : icon}
      </View>
    );
  }

  // The engine has no truncate utility; RN clamps text via numberOfLines, which
  // is the supported equivalent (single line with an ellipsis on overflow).
  const inner = (
    <>
      {media}
      <View style={s.content}>
        {title != null ? (
          <Text style={s.title(tokens)} numberOfLines={truncate ? 1 : undefined}>
            {title}
          </Text>
        ) : null}
        {description != null ? (
          <Text style={s.description(tokens)} numberOfLines={truncate ? 1 : undefined}>
            {description}
          </Text>
        ) : null}
        {body != null ? <Text style={s.body(tokens)}>{body}</Text> : null}
      </View>
      {meta != null ? <Text style={s.meta(tokens)}>{meta}</Text> : null}
      {action != null ? <View style={s.actionBox}>{action}</View> : null}
    </>
  );

  // A tappable row swaps the View for a Pressable with a button role and a pressed
  // affordance, so a tappable media row needs no hand-rolled Pressable.
  if (props.onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={props.onPress}
        android_ripple={surfaceRipple(tokens)}
        style={({ pressed }) => [container, pressDim(pressed)]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={container}>{inner}</View>;
}
