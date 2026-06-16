import { ScrollView, View, Text } from "react-native";
import * as Canvas from "@olympusoss/canvas";
import { useTheme } from "@olympusoss/canvas";
import type { ExampleScope } from "docs-core/scope";
import ButtonUsage from "docs-core/examples/atoms/button/example-0";
import AvatarUsage from "docs-core/examples/atoms/avatar/example-0";

// Phase 2 smoke screen: proves the source-only Canvas library (../src) and the
// generated example modules (../docs-core) bundle and render under Metro — both a
// raw Canvas component and a generated fence module, rendered against a native
// scope (every Canvas export + the live theme tokens). On a device, Metro resolves
// each component's .ios/.android skin automatically, so this is the real per-OS look.
export default function Home() {
  const { tokens } = useTheme();
  const scope = { ...Canvas, tokens } as unknown as ExampleScope;

  return (
    <ScrollView
      style={{ backgroundColor: tokens.background }}
      contentContainerStyle={{ padding: 24, gap: 18 }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700", color: tokens.foreground }}>
        Canvas docs — native Phase 2 smoke
      </Text>

      <Text style={{ color: tokens["muted-foreground"] }}>Raw Canvas Button:</Text>
      <View style={{ alignItems: "flex-start" }}>
        <Canvas.Button primary>Save changes</Canvas.Button>
      </View>

      <Text style={{ color: tokens["muted-foreground"] }}>Generated Button example:</Text>
      <View style={{ alignItems: "flex-start" }}>{ButtonUsage(scope)}</View>

      <Text style={{ color: tokens["muted-foreground"] }}>Generated Avatar example:</Text>
      <View style={{ alignItems: "flex-start" }}>{AvatarUsage(scope)}</View>
    </ScrollView>
  );
}
