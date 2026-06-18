// React Native Web accepts a `dataSet` prop on every RN host component and renders it
// as `data-*` attributes on the underlying DOM node. The upstream react-native types
// don't declare it, so we add it here. Used to tag the main content scroller so the
// web scrollbar styling (ui/web-scrollbar.tsx) can inset it below the topbar.
// ScrollViewProps extends ViewProps, so this covers ScrollView too.
import "react-native";

declare module "react-native" {
  interface ViewProps {
    dataSet?: Record<string, string | number | boolean | undefined>;
  }
}
