import { createCodeBlock } from "./code-block.shared.js";
import { androidSkin } from "./code-block.styles.js";

// Material 3 CodeBlock. Metro resolves this file on Android; the docs import it for
// preview. CodeBlock is a "Shared" treatment (no native M3 code-display component),
// so the Android skin is identical to the web look.
export const CodeBlock = createCodeBlock(androidSkin);
export type { CodeBlockProps, CodeBlockTab } from "./code-block.shared.js";
export { tokenize, syntaxColor, type CodeToken, type TokenKind } from "./tokenize.js";
