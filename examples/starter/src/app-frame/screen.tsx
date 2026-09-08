import { type ReactNode } from "react";
import { Column, OverlayProvider, ScrollView } from "@nannier-com/canvas";

// App-frame scaffolding owns the scroll viewport and readable page measure.
// Page content uses Canvas layout props for all spacing and arrangement.
export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView role="main" keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
      <Column padLoose alignCenter>
        <OverlayProvider style={{ width: "100%", maxWidth: 1120, flexGrow: 0, flexShrink: 0, flexBasis: "auto" }}>
          <Column loose>{children}</Column>
        </OverlayProvider>
      </Column>
    </ScrollView>
  );
}
