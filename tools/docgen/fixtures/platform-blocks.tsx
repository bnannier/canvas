// Fixture for the platform blocks inside prop comments (extract-props.test.ts): a
// JSDoc description and a `//` axis header that each scope a clause to builds.

export interface PlatformBlockProps {
  /**
   * The field's label. Its placement is platform-adaptive:
   * <!-- only: web -->
   * iOS and web render it above the field; Android floats it.
   * <!-- /only -->
   * <!-- only: ios -->
   * iOS renders it above the field.
   * <!-- /only -->
   * <!-- only: android -->
   * Android floats it.
   * <!-- /only -->
   * The label names the field.
   */
  label?: string;
  // Size (pick one). The web track scales;
  // <!-- only: web ios -->
  // iOS draws one size.
  // <!-- /only -->
  small?: boolean;
  /**
   * An unclosed block.
   * <!-- only: web -->
   */
  broken?: boolean;
}
