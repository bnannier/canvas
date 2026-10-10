// react-native-web ships no type declarations for its internal modules. The audit's source
// reader (interaction-signals.ts) names a control's ARIA role the way react-native-web does,
// through its own mapping, so it declares the one module it imports.
declare module "react-native-web/dist/modules/AccessibilityUtil/propsToAriaRole.js" {
  /** The ARIA role react-native-web renders for these props (`adjustable` is `slider`), or undefined for none. */
  const propsToAriaRole: (props: { accessibilityRole?: string; role?: string }) => string | undefined;
  export default propsToAriaRole;
}
