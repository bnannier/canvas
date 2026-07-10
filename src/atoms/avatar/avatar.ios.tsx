import type { ReactNode } from "react";
import { createAvatar, createAvatarGroup } from "./avatar.shared.js";
import { iosSkin } from "./avatar.styles.js";
import { GlassSurface, type StyleProp, type ViewStyle } from "../../style/index.js";

// iOS (HIG) Avatar. Metro resolves this file on iOS; the docs import it for preview.
//
// The initials fallback renders on Apple's real, INTERACTIVE Liquid Glass: a glass
// account chip that refracts the content behind it (a topbar avatar over the page) and
// responds to touch with the system fluid press animation. GlassSurface degrades on its
// own to the solid muted fill when the app is in solid surface mode or Reduce
// Transparency is on. Web and Android never receive this surface (createAvatar keeps
// their plain box and never imports GlassSurface), so the glass material is iOS-only.
function IosGlassAvatarSurface({ style, testID, children }: { style?: StyleProp<ViewStyle>; testID?: string; children?: ReactNode }) {
  return (
    <GlassSurface interactive style={style} testID={testID}>
      {children}
    </GlassSurface>
  );
}

export const Avatar = createAvatar(iosSkin, IosGlassAvatarSurface);
export const AvatarGroup = createAvatarGroup(iosSkin);
export type { AvatarProps, AvatarGroupProps } from "./avatar.shared.js";
