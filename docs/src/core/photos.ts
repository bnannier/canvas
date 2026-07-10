import type { ComponentType } from "react";
import { createElement } from "react";

// Bundled sample avatar photos. The docs examples reference them as root-relative paths
// (`/rachel-chen.jpg`) that Expo serves from `public/` on the web, but a native device
// has no web origin, so those paths do not resolve there and the avatar shows a blank
// circle. Metro bundles these `require()`d images for native (and serves them on web),
// so mapping the sample paths to the bundled modules makes the example avatars display
// on iOS and Android too. Web already resolves the relative paths, so this is applied
// only in the native scope.
const PHOTOS: Record<string, number> = {
  "/rachel-chen.jpg": require("../../public/rachel-chen.jpg"),
  "/liang-bao.jpg": require("../../public/liang-bao.jpg"),
  "/marcus-allen.jpg": require("../../public/marcus-allen.jpg"),
  "/kira-tanaka.jpg": require("../../public/kira-tanaka.jpg"),
  "/ada-lovelace.jpg": require("../../public/ada-lovelace.jpg"),
  "/grace-hopper.jpg": require("../../public/grace-hopper.jpg"),
  "/noor-park.jpg": require("../../public/noor-park.jpg"),
};

/** Resolve a sample photo path to its bundled module; pass anything else through. */
export function resolvePhoto(src: unknown): unknown {
  return typeof src === "string" && PHOTOS[src] != null ? PHOTOS[src] : src;
}

// Wrap an image-bearing component (e.g. Avatar) so the given props have their sample
// photo paths resolved to bundled modules before the real component renders. Keeps the
// example code clean (`src="/rachel-chen.jpg"`) while making the images load on device.
export function withResolvedPhotos<P>(Component: ComponentType<P>, props: readonly string[]): ComponentType<P> {
  const Loose = Component as ComponentType<Record<string, unknown>>;
  const Wrapped = (p: P) => {
    const rec = p as Record<string, unknown>;
    let next: Record<string, unknown> | null = null;
    for (const key of props) {
      if (rec[key] != null) {
        const resolved = resolvePhoto(rec[key]);
        if (resolved !== rec[key]) (next ??= { ...rec })[key] = resolved;
      }
    }
    return createElement(Loose, next ?? rec);
  };
  Wrapped.displayName = `WithPhotos(${Component.displayName ?? Component.name ?? "Component"})`;
  return Wrapped as ComponentType<P>;
}
