import { createButtonGroup } from "./button-group.shared.js";
import { androidSkin } from "./button-group.styles.js";

// Material 3 SegmentedButton ButtonGroup. Metro resolves this file on Android; the docs import it for preview.
export const ButtonGroup = createButtonGroup(androidSkin);
export type { ButtonGroupProps, ButtonGroupItem } from "./button-group.shared.js";
