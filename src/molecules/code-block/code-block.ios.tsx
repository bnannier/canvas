import { createCodeBlock } from "./code-block.shared.js";
import { iosSkin } from "./code-block.styles.js";

// iOS CodeBlock. Metro resolves this file on iOS; the docs import it for preview.
// CodeBlock is a "Shared" treatment (no native iOS code-display control), so the iOS
// skin is identical to the web look.
export const CodeBlock = createCodeBlock(iosSkin);
export type { CodeBlockProps } from "./code-block.shared.js";
