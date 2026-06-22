import { createCommand } from "./command.shared.js";
import { webSkin } from "./command.styles.js";

// Web Command (the base; Metro falls back to it on native, web bundlers resolve it).
export const Command = createCommand(webSkin);
export type { CommandProps, CommandItem, CommandGroup } from "./command.shared.js";
