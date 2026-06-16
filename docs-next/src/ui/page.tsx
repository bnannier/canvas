import { type ReactNode } from "react";
import { ScrollView, View, useTheme } from "@olympusoss/canvas";
import { H1, Lead } from "./prose";

// The standard scrollable page frame: centered, max-width, consistent padding.
export function Page({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.background }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 72,
        gap: 28,
        width: "100%",
        maxWidth: 920,
        alignSelf: "center",
      }}
    >
      {children}
    </ScrollView>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <View style={{ gap: 8 }}>
      <H1>{title}</H1>
      {description ? <Lead>{description}</Lead> : null}
    </View>
  );
}
