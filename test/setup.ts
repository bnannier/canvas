// Test setup (bun preload):
// 1. Register happy-dom so React Native Web components can render to a DOM.
// 2. Provide `react-native` as `react-native-web` so the kit's modules load under `bun test`
//    (Node/Bun can't parse react-native's Flow-typed entry). This mirrors how every
//    React-Native-Web consumer aliases the package, so tests render the exact web output.
import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!(globalThis as { document?: unknown }).document) GlobalRegistrator.register();

// Give react-native-web a real desktop viewport. RNW's Dimensions reads
// window.visualViewport (falling back to documentElement.clientWidth), and
// happy-dom reports both as 0, which flips every useResponsive/useWindowDimensions
// consumer into its phone (≤ sm) branch. The kit is desktop-first, so tests must
// exercise the desktop branch by default: stub a fixed 1280x800 visualViewport
// (RNW multiplies by `scale`, and subscribes via addEventListener) before
// react-native-web first computes dimensions.
if (!(window as { visualViewport?: unknown }).visualViewport) {
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: {
      width: 1280,
      height: 800,
      scale: 1,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return true; },
    },
  });
}

import { plugin } from "bun";

plugin({
  name: "react-native-web-alias",
  setup(build) {
    build.module("react-native", () => ({
      exports: require("react-native-web"),
      loader: "object",
    }));
    // expo-blur / expo-glass-effect are OPTIONAL peers (they pull in expo-modules-core,
    // which needs RN internals RNW lacks). Stub them so GlassSurface takes its documented
    // fallback (a plain translucent View) under test — exactly how the kit degrades when a
    // consumer skips the optional glass deps.
    build.module("expo-blur", () => ({ exports: {}, loader: "object" }));
    build.module("expo-glass-effect", () => ({ exports: {}, loader: "object" }));
    // @shopify/react-native-skia is an OPTIONAL peer for Backdrop's GPU renderer.
    // An empty stub is the interesting case rather than a lazy one: it reproduces
    // "module resolves but no drawing backend is live", which is exactly what a web
    // consumer sees before CanvasKit finishes loading. Backdrop must render its SVG
    // baseline in that window, not a blank screen.
    build.module("@shopify/react-native-skia", () => ({ exports: {}, loader: "object" }));
    // react-native-svg's native entry imports deep RN internals RNW lacks; stub it with
    // no-op elements (the kit's Icon/Spinner/Popover draw with it, but behavior tests assert
    // logic/interaction, not the rendered vector paths).
    build.module("react-native-svg", () => {
      const React = require("react");
      const stub = (props?: { children?: unknown }) => React.createElement(React.Fragment, null, props?.children ?? null);
      const svg = {
        default: stub, Svg: stub, Path: stub, Circle: stub, Ellipse: stub, Line: stub,
        Polygon: stub, Polyline: stub, Rect: stub, G: stub, Defs: stub, ClipPath: stub,
        LinearGradient: stub, RadialGradient: stub, Stop: stub, Mask: stub, Text: stub,
      };
      return { exports: svg, loader: "object" };
    });
  },
});

// Sweep leaked react-native-web PressResponder listeners after every test, suite-wide.
// An Enter/Space keydown on any RNW Pressable registers a document-level keyup listener
// that is removed only by a matching valid keyup; tests that fire keydown without keyup
// leak it across files (one shared happy-dom document per bun test process), and a later
// keyup whose target lacks a tagName then throws inside the leaked handler
// ("undefined is not an object (evaluating 'element.tagName.toLowerCase')"). A benign
// Enter keyup on <body> (an Element, so tagName exists) drives each leaked handler
// through its removal branch; no onPress can fire because the stale responder element
// never equals <body>. Registered in preload, so this afterEach runs after each file's
// own afterEach(cleanup), when trees are already unmounted and only leaks remain.
import { afterEach } from "bun:test";
afterEach(() => {
  document.body.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
});
