import { createContext, forwardRef, useContext } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";
import { useScrollFocus } from "./use-scroll-focus.js";

export const OverlayScrollContext = createContext<{
  contentHeight(height: number): void;
  viewportHeight(height: number): void;
} | null>(null);

/** One measured scrollport, shared by anchored cards and option-list owners. */
export const OverlayScrollView = forwardRef<ScrollView, ScrollViewProps>(function OverlayScrollView({
  style, onLayout, onContentSizeChange, tabIndex, ...props
}, ref) {
  const report = useContext(OverlayScrollContext);
  const focus = useScrollFocus("vertical");
  return (
    <ScrollView
      {...props}
      ref={ref}
      style={[{ flexShrink: 1 }, style]}
      keyboardShouldPersistTaps={props.keyboardShouldPersistTaps ?? "handled"}
      tabIndex={tabIndex ?? focus.tabIndex}
      onLayout={(event) => {
        focus.onLayout(event);
        report?.viewportHeight(event.nativeEvent.layout.height);
        onLayout?.(event);
      }}
      onContentSizeChange={(width, height) => {
        focus.onContentSizeChange(width, height);
        report?.contentHeight(height);
        onContentSizeChange?.(width, height);
      }}
    />
  );
});
