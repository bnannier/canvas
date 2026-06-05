import { type ReactNode } from "react";
import { Image, type ImageStyle } from "react-native";
import { cn } from "../cn.js";
import { Box, Text, useStyles } from "../engine/index.js";

// The avatar shows an account's photo when it has one, falling back to one or
// two initials on a muted surface. It is a circle by default (the consistent
// shape across topbars, identity rows, and menus), optionally a rounded square.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Size picks the
// diameter and proportional type (~40% of the diameter); shape switches the
// corner radius; `ring` draws the separator outline used when avatars overlap
// in a stack.

export interface AvatarProps {
  /** Photo URL. When set, the image fills the circle and the fallback is hidden. */
  src?: string;
  /** Alias for `src`, for callers that think in terms of a native image uri. */
  uri?: string;
  /** Initials fallback shown when there is no photo (e.g. "AO"). */
  name?: string;
  /** Same as `name`; the rendered initials when no photo is supplied. */
  children?: ReactNode;
  // Size (pick one; default is the 40px row avatar).
  small?: boolean;
  large?: boolean;
  // Shape (pick one; default is a circle).
  circle?: boolean;
  rounded?: boolean;
  /** Separator outline, for avatars that overlap in a stack. */
  ring?: boolean;
  className?: string;
}

type Size = "small" | "default" | "large";
type Shape = "circle" | "rounded";

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: AvatarProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// Shape precedence when more than one is passed: first match wins.
function shapeOf(p: AvatarProps): Shape {
  if (p.circle) return "circle";
  if (p.rounded) return "rounded";
  return "circle";
}

// Diameter per size. Defaults to the 40px row avatar; small is the inline
// topbar/stack size, large the identity-header size.
const SIZE_BOX: Record<Size, string> = {
  small: "w-7 h-7",
  default: "w-10 h-10",
  large: "w-12 h-12",
};

// Initials type per size, ~40% of the diameter (28 -> xs, 40 -> base, 48 -> lg).
const SIZE_LABEL: Record<Size, string> = {
  small: "text-xs",
  default: "text-base",
  large: "text-lg",
};

// Circle by default; the rounded square uses the same radius as a card/menu so
// it sits consistently with bordered surfaces.
const SHAPE_RADIUS: Record<Shape, string> = {
  circle: "rounded-full",
  rounded: "rounded-md",
};

export function Avatar(props: AvatarProps) {
  const { src, uri, name, children, ring, className } = props;
  const size = sizeOf(props);
  const shape = shapeOf(props);
  const photo = src ?? uri;

  const container = cn(
    "shrink-0 items-center justify-center overflow-hidden bg-muted",
    SIZE_BOX[size],
    SHAPE_RADIUS[shape],
    // The engine has no ring-* utility; a 2px background-colored border is the
    // RN-supported equivalent of ring-2 ring-background for stacked separation.
    ring && "border-2 border-background",
    className,
  );

  // Resolve the container sizing/radius so the photo fills it exactly. Using the
  // resolved width/height keeps the image square and lets overflow-hidden clip
  // it to the circle (RN clips children to a parent's borderRadius).
  const imageStyle = useStyles(cn("w-full h-full", SHAPE_RADIUS[shape]));

  if (photo) {
    return (
      <Box className={container}>
        <Image
          source={{ uri: photo }}
          accessibilityLabel={name}
          resizeMode="cover"
          style={imageStyle as unknown as ImageStyle}
        />
      </Box>
    );
  }

  const initials = (name ?? (typeof children === "string" ? children : "")) || "";
  const label = cn("font-medium text-muted-foreground", SIZE_LABEL[size]);

  return (
    <Box className={container}>
      {initials ? <Text className={label}>{initials}</Text> : null}
    </Box>
  );
}
