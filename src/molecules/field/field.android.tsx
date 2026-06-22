import { createField } from "./field.shared.js";
import { androidSkin } from "./field.styles.js";
import { Avatar as AvatarAndroid } from "../../atoms/avatar/avatar.android.js";
import { Badge as BadgeAndroid } from "../../atoms/badge/badge.android.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";
import { Input as InputAndroid } from "../../atoms/input/input.android.js";

// Material 3 Field. Metro resolves this file on Android; the docs import it for
// preview. The composed atoms are the M3-styled ones so a value row's avatar
// stack, status/plan badge, Copy button, and the control-mode Input read native
// (M3 ripple on the Copy button / Input). The literal `.android` imports are
// required for the WEB docs 3-up, where barrel imports would resolve the web atoms.
export const Field = createField(androidSkin, AvatarAndroid, BadgeAndroid, ButtonAndroid, InputAndroid);
export type { FieldProps, FieldRow, FieldAvatar } from "./field.shared.js";
