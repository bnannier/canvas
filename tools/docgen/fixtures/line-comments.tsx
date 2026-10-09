// Fixture for the `//` comment reading in extract-props.test.ts: each member sits
// under the comment shape its row is expected to read.

export interface LineCommentProps {
  /** A JSDoc description wins over any line comment. */
  label?: string;
  // Tone (pick one; default neutral): a red title and a destructive
  // Button. The run wraps over two lines.
  destructive?: boolean;
  // Size (pick one). A one-line header carries to the axis's later booleans.
  small?: boolean;
  large?: boolean;
  // A note about the axis above, ended by a blank line.

  // State.
  disabled?: boolean;
  // Two families:
  //  - Semantic status: success / warning.
  success?: boolean;
  warning?: boolean;
  // A run broken by a block comment.
  /* not a doc */
  // Only this line is read.
  compact?: boolean;
  dense?: boolean; // A trailing comment belongs to dense, never to the next member.
  // Loose comes after it.
  loose?: boolean;
}
