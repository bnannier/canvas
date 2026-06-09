import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { View, Image, Text } from "../engine/index.js";
import { Avatar } from "./avatar.js";

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
  className?: string;
}

type Align = "center" | "start";
type Direction = "reversed" | "leading";

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

const ALIGN_ITEMS: Record<Align, string> = {
  center: "items-center",
  start: "items-start",
};

const DIRECTION_ROW: Record<Direction, string> = {
  leading: "flex-row",
  reversed: "flex-row-reverse",
};

// The leading icon box: a fixed h-9 w-9 tinted square with the glyph centered, so
// it reads as a tidy lead affordance next to the two-line text.
const ICON_BOX =
  "shrink-0 items-center justify-center w-9 h-9 rounded-md bg-primary/15";
const ICON_GLYPH = "text-primary text-base font-semibold";

// Content column: min-w-0 + flex-1 lets the text truncate instead of pushing a
// trailing action out of alignment.
const CONTENT = "min-w-0 flex-1 gap-0.5";
const TITLE = "text-sm font-semibold text-foreground";
const DESCRIPTION = "text-xs text-muted-foreground";
const BODY = "text-sm text-foreground leading-relaxed";
const META = "shrink-0 text-xs text-muted-foreground";

export function MediaObject(props: MediaObjectProps) {
  const { title, description, body, meta, avatar, src, icon, action, truncate, className } = props;
  const align = alignOf(props);
  const direction = directionOf(props);

  const container = cn(
    DIRECTION_ROW[direction],
    "gap-3",
    ALIGN_ITEMS[align],
    props.bordered && "rounded-lg border border-border bg-card p-4",
    className,
  );

  // Leading media: photo > initials avatar > icon box. Only one renders.
  let media: ReactNode = null;
  if (src) {
    media = (
      <View className="shrink-0 w-10 h-10 overflow-hidden rounded-full bg-muted">
        <Image
          className="w-full h-full rounded-full"
          source={{ uri: src }}
          accessibilityLabel={title}
          resizeMode="cover"
        />
      </View>
    );
  } else if (avatar) {
    media = <Avatar name={avatar}>{avatar}</Avatar>;
  } else if (icon != null) {
    media = (
      <View className={ICON_BOX}>
        {typeof icon === "string" ? <Text className={ICON_GLYPH}>{icon}</Text> : icon}
      </View>
    );
  }

  // The engine has no truncate utility; RN clamps text via numberOfLines, which
  // is the supported equivalent (single line with an ellipsis on overflow).
  return (
    <View className={container}>
      {media}
      <View className={CONTENT}>
        {title != null ? (
          <Text className={TITLE} numberOfLines={truncate ? 1 : undefined}>
            {title}
          </Text>
        ) : null}
        {description != null ? (
          <Text className={DESCRIPTION} numberOfLines={truncate ? 1 : undefined}>
            {description}
          </Text>
        ) : null}
        {body != null ? <Text className={BODY}>{body}</Text> : null}
      </View>
      {meta != null ? <Text className={META}>{meta}</Text> : null}
      {action != null ? <View className="shrink-0">{action}</View> : null}
    </View>
  );
}
