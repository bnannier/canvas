// Molecules: the React Native UI kit components at the molecules atomic level.
export * from "./accordion/accordion.js";
export * from "./action-panels/action-panels.js";
export * from "./alert/alert.js";
export * from "./alert-dialog/alert-dialog.js";
export * from "./card/card.js";
export * from "./code-block/code-block.js";
// CodeBlock's own highlighter, published by accident through its platform entries before
// the public surface was listed name by name. Each name is a deprecated alias that keeps
// working until a major (audit K12-2), re-exported here once, from the module every
// platform shares, so its tag is written once for the web, iOS and Android; CodeBlock
// imports the declarations untagged.
export {
  /**
   * @deprecated Kit internals: one span of `CodeBlock`'s own highlighter; pass `code` and
   * `language` to `CodeBlock`. It keeps working until a major.
   */
  type CodeToken,
  /**
   * @deprecated Kit internals: the ink `CodeBlock` paints a token kind in for the scheme;
   * pass `code` and `language` to `CodeBlock`. It keeps working until a major.
   */
  syntaxColor,
  /**
   * @deprecated Kit internals: `CodeBlock`'s own highlighter; pass `code` and `language`
   * to `CodeBlock`. It keeps working until a major.
   */
  tokenize,
  /**
   * @deprecated Kit internals: the token kinds `CodeBlock`'s highlighter tells apart; pass
   * `code` and `language` to `CodeBlock`. It keeps working until a major.
   */
  type TokenKind,
} from "./code-block/tokenize.js";
export * from "./collapsible/collapsible.js";
export * from "./description-lists/description-lists.js";
export * from "./empty-state/empty-state.js";
export * from "./feeds/feeds.js";
export * from "./field/field.js";
export * from "./form/form.js";
export * from "./grid-lists/grid-lists.js";
export * from "./media-objects/media-objects.js";
export * from "./phone-input/phone-input.js";
export * from "./stacked-lists/stacked-lists.js";
export * from "./stats/stats.js";
