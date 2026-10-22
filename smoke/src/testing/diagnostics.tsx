import { version as reactVersion } from "react";
import { NativeModules, Platform } from "react-native";
import Constants from "expo-constants";
import canvasPackage from "@nannier-com/canvas/package.json";
import { Column, Typography, useTheme } from "@nannier-com/canvas";

// Only the smoke build exposes this screen. The installed package's own metadata
// is bundled independently of the candidate identity supplied to Expo config.
export function SmokeDiagnostics() {
  const { dark } = useTheme();
  const build = Constants.expoConfig?.extra?.canvasBuild as Record<string, unknown> | undefined;
  const rn = Platform.constants?.reactNativeVersion;
  const sourceCode = NativeModules.SourceCode;
  const bundleURL = sourceCode?.getConstants?.()?.scriptURL ?? sourceCode?.scriptURL;
  const values: Record<string, unknown> = {
    "input-mode": build?.inputMode,
    appearance: dark ? "dark" : "light",
    "source-revision": build?.sourceRevision,
    "candidate-revision": build?.candidateRevision,
    "package-sha256": build?.packageSha256,
    "expected-package-version": build?.packageVersion,
    "package-version": canvasPackage.version,
    "react-version": reactVersion,
    "react-native-version": rn ? `${rn.major}.${rn.minor}.${rn.patch}` : "web",
    platform: Platform.OS,
    "bundle-url": bundleURL ?? (Platform.OS === "web" ? "web export" : "unavailable"),
  };
  return (
    <Column relaxed testID="smoke-diagnostics">
      <Typography h2>Candidate runtime identity</Typography>
      {Object.entries(values).map(([name, value]) => (
        <Column tight key={name}>
          <Typography small muted>{name}</Typography>
          <Typography testID={`smoke-${name}`}>{value == null ? "unavailable" : String(value)}</Typography>
        </Column>
      ))}
    </Column>
  );
}
