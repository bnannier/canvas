import { type ReactNode } from "react";
import { ScrollView, View, useTheme } from "@olympusoss/canvas";
import { TOPBAR_HEIGHT } from "../shell/topbar";
import { H1, Lead } from "./prose";

// The standard scrollable content frame, mirroring `.app-content` (max-width 1400,
// the 24/28/80 padding, centered).
export function Page({ children }: { children: ReactNode }) {
  const { tokens, surface } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: surface === "glass" ? "transparent" : tokens.background }}
      contentContainerStyle={{
        // Inset by the overlaying topbar so the first row clears it but content
        // still scrolls behind the glass bar.
        paddingTop: TOPBAR_HEIGHT + 24,
        paddingHorizontal: 28,
        paddingBottom: 80,
        gap: 28,
        width: "100%",
        maxWidth: 1400,
        alignSelf: "center",
      }}
    >
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
