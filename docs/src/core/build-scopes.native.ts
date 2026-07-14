import * as Canvas from "@bnannier/canvas";
import type { ColorTokens } from "@bnannier/canvas";
import { Platform } from "react-native";
import { Stateful, Ticker } from "./live-state";
import { withResolvedPhotos } from "./photos";
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
      scope: {
        ...Canvas,
        // The docs examples reference sample photos as root-relative paths
        // (`/rachel-chen.jpg`) that only resolve against the web origin; on a device
        // they have no host, so resolve them to their bundled modules here (web keeps
        // the relative path, which the browser resolves).
        Avatar: withResolvedPhotos(Canvas.Avatar, ["src", "uri"]),
        MediaObject: withResolvedPhotos(Canvas.MediaObject, ["src"]),
        tokens,
        Stateful,
        Ticker,
      } as unknown as ExampleScope,
    },
  ];
}
