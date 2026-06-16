import { type ReactNode } from "react";
import { Platform } from "react-native";
import { View, Text, useTheme } from "@olympusoss/canvas";

// Prose primitives for the docs, styled from Canvas tokens so they track the active
// scheme/surface. The web docs use the Geist font + CSS; native uses the system font.
export const MONO = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" })!;

export function H1({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <Text style={{ fontSize: 28, fontWeight: "700", letterSpacing: -0.4, color: tokens.foreground }}>
      {children}
    </Text>
  );
}

export function H2({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <Text style={{ fontSize: 20, fontWeight: "600", letterSpacing: -0.3, color: tokens.foreground }}>
      {children}
    </Text>
  );
}

export function H3({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <Text style={{ fontSize: 15, fontWeight: "600", color: tokens.foreground }}>{children}</Text>
  );
}

export function P({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const { tokens } = useTheme();
  return (
    <Text style={{ fontSize: 14, lineHeight: 22, color: muted ? tokens["muted-foreground"] : tokens.foreground }}>
      {children}
    </Text>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return (
    <Text style={{ fontSize: 15, lineHeight: 23, color: tokens["muted-foreground"], maxWidth: 640 }}>
      {children}
    </Text>
  );
}

export function InlineCode({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  return <Text style={{ fontFamily: MONO, fontSize: 13, color: tokens.primary }}>{children}</Text>;
}

// A hairline rule.
export function Rule() {
  const { tokens } = useTheme();
  return <View style={{ height: 1, backgroundColor: tokens.border, marginVertical: 4 }} />;
}
