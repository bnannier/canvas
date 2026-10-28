import { ViewportOverlay } from "../ui/viewport-overlay";
import * as Canvas from "@nannier/canvas";
import type { ColorTokens } from "@nannier/canvas";
import { Stateful, Ticker, applyDrop, IconGallery, WithToast, AppScreen, AppShell } from "./live-state";
import { applyResolvedPhotos } from "./photos";
import type { ExampleScope, PreviewScope } from "./scope";
import { HOST, PLATFORM_LABELS } from "./platforms-shown";

// Native build: on a device you ARE the platform — Metro already resolved each
// component's `.ios`/`.android` skin through the barrel — so there is a single, real
// preview. We deliberately do NOT import the literal-path skin registry here: importing
// `button.ios` on an Android device would force the wrong-OS skin onto a real device.
export function buildScopes(tokens: ColorTokens): PreviewScope[] {
  const platform = HOST as PreviewScope["platform"];
  // The docs examples name sample photos as root-absolute paths (`/rachel-chen.jpg`);
  // a device has no web origin, so resolve them to their bundled assets here. The web
  // scope applies the very same helper (for its own reason: a subpath-hosted export
  // cannot resolve them either), so the two platforms cannot drift apart again.
  const scope: Record<string, unknown> = { ...Canvas };
  applyResolvedPhotos(scope);
  scope.tokens = tokens;
  scope.Stateful = Stateful;
  scope.Ticker = Ticker;
  scope.applyDrop = applyDrop;
  scope.IconGallery = IconGallery;
  scope.WithToast = WithToast;
  scope.AppScreen = AppScreen;
  scope.ViewportOverlay = ViewportOverlay;
  scope.AppShell = AppShell;
  return [
    {
      label: PLATFORM_LABELS[platform]!.label,
      platform,
      scope: scope as unknown as ExampleScope,
    },
  ];
}
