import { createField } from "./field.shared.js";
import { iosSkin } from "./field.styles.js";
import { Avatar as AvatarIOS } from "../../atoms/avatar/avatar.ios.js";
import { Badge as BadgeIOS } from "../../atoms/badge/badge.ios.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";
import { Input as InputIOS } from "../../atoms/input/input.ios.js";

// iOS (HIG / SwiftUI LabeledContent rows) Field. Metro resolves this file on
// iOS; the docs import it for preview. The composed atoms are the iOS-styled
// ones so a value row's avatar stack, status/plan badge, Copy button, and the
// control-mode Input read native. The literal `.ios` imports are required for
// the WEB docs 3-up, where barrel imports would resolve the web atoms.
export const Field = createField(iosSkin, AvatarIOS, BadgeIOS, ButtonIOS, InputIOS);
export type { FieldProps, FieldRow, FieldAvatar } from "./field.shared.js";
