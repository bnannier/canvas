import { createCommand } from "./command.shared.js";
import { webSkin } from "./command.styles.js";

// Web Command (the base; Metro falls back to it on native, web bundlers resolve it).
/** A command palette: search across navigation, actions and recent items. */
export const Command = createCommand(webSkin);
export type { CommandProps, CommandItem, CommandGroup } from "./command.shared.js";
