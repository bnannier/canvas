import * as Canvas from "@olympusoss/canvas";
import type { ColorTokens } from "@olympusoss/canvas";
import { PLATFORM_SKINS } from "./platform-skins";
import type { ExampleScope, PreviewScope } from "./scope";

// Web build: render the example under all three platform skins side by side — the
// docs' signature cross-platform comparison. The base (`...Canvas`) is the web skin;
// the iOS/Android columns swap in the per-OS implementations from the literal-path
// registry. `tokens` is the live, theme-aware value, injected by the caller.
export function buildScopes(tokens: ColorTokens): PreviewScope[] {
  return [
    { label: "iOS", platform: "ios", scope: { ...Canvas, ...PLATFORM_SKINS.ios, tokens } as unknown as ExampleScope },
    { label: "Android", platform: "android", scope: { ...Canvas, ...PLATFORM_SKINS.android, tokens } as unknown as ExampleScope },
    { label: "Web", platform: "web", scope: { ...Canvas, tokens } as unknown as ExampleScope },
  ];
}
