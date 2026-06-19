import { type ReactNode } from "react";
import { ScrollView, View, useTheme } from "@olympusoss/canvas";
import { CONTENT_TOP_INSET } from "../shell/topbar";
import { NativeHeader } from "../shell/native-header";
import { H1, Lead } from "./prose";

// The standard scrollable content frame, mirroring `.app-content` (max-width 1400,
// the 24/28/80 padding, centered).
export function Page({ children }: { children: ReactNode }) {
  const { tokens, surface } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: surface === "glass" ? "transparent" : tokens.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        // Web: clear the absolute Topbar overlay (CONTENT_TOP_INSET = 56). Native: iOS
        // owns the inset via contentInsetAdjustmentBehavior, so we add 0 and let content
        // sit under the collapsing large-title nav bar.
        paddingTop: CONTENT_TOP_INSET + 24,
        paddingHorizontal: 28,
        paddingBottom: 80,
        gap: 28,
        width: "100%",
        maxWidth: 1400,
        alignSelf: "center",
      }}
    >
      <NativeHeader />
      {children}
    </ScrollView>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <H1>{title}</H1>
      {description ? <Lead>{description}</Lead> : null}
    </View>
  );
}
