import * as Canvas from "@olympusoss/canvas";
import type { ColorTokens } from "@olympusoss/canvas";
import { Platform } from "react-native";
import type { ExampleScope, PreviewScope } from "./scope";

// Native build: on a device you ARE the platform — Metro already resolved each
// component's `.ios`/`.android` skin through the barrel — so there is a single, real
// preview. We deliberately do NOT import the literal-path skin registry here: importing
// `button.ios` on an Android device would force the wrong-OS skin onto a real device.
export function buildScopes(tokens: ColorTokens): PreviewScope[] {
  const platform = Platform.OS === "android" ? "android" : "ios";
  return [
    {
      label: platform === "android" ? "Android" : "iOS",
      platform,
      scope: { ...Canvas, tokens } as unknown as ExampleScope,
    },
  ];
}
