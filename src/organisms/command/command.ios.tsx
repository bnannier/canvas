import { createCommand } from "./command.shared.js";
import { iosSkin } from "./command.styles.js";

// iOS (HIG list rows) Command. Metro resolves this file on iOS; the docs import it for preview.
export const Command = createCommand(iosSkin);
export type { CommandProps, CommandItem, CommandGroup } from "./command.shared.js";
