import { createCodeBlock } from "./code-block.shared.js";
import { webSkin } from "./code-block.styles.js";

// Web CodeBlock (the base; Metro falls back to it on native, web bundlers resolve it).
export const CodeBlock = createCodeBlock(webSkin);
export type { CodeBlockProps } from "./code-block.shared.js";
