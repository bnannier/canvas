import { createCommand } from "./command.shared.js";
import { androidSkin } from "./command.styles.js";

// Material 3 (list items) Command. Metro resolves this file on Android; the docs import it for preview.
export const Command = createCommand(androidSkin);
export type { CommandProps, CommandItem, CommandGroup } from "./command.shared.js";
