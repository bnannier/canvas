import { createButtonGroup } from "./button-group.shared.js";
import { iosSkin } from "./button-group.styles.js";

// iOS (UISegmentedControl) ButtonGroup. Metro resolves this file on iOS; the docs import it for preview.
export const ButtonGroup = createButtonGroup(iosSkin);
export type { ButtonGroupProps } from "./button-group.shared.js";
