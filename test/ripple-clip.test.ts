import { describe, it, expect } from "bun:test";
import { StyleSheet } from "react-native";
import { rippleClipWrapperStyle } from "../src/style/ripple-clip.tsx";
import { iosSkin, androidSkin, webSkin } from "../src/atoms/button/button.styles.ts";
import { lightColors } from "../src/style/tokens.ts";

// A bounded android_ripple (borderless:false) is the pressable's OWN rectangular-masked
// background drawable. React Native implements overflow:"hidden" as a path-clip applied only
// in ViewGroup.dispatchDraw — i.e. only to CHILD views — so a node can never clip its own
// ripple; the rectangle bleeds past rounded corners. The fix is a rounded, overflow:"hidden"
// PARENT (<RippleClip>) so the child ripple is clipped. These tests pin the parent's clip
// style (Android-only, rounded) and guard the Button skin against the disproven same-node
// overflow:"hidden" creeping back in. The ripple itself is Android-native and invisible under
// react-native-web, so its rendering is verified on-device; here we verify the clip contract.

describe("rippleClipWrapperStyle", () => {
  const shape = { borderRadius: 9999 };

  it("clips to the rounded shape AND overflow:hidden on Android", () => {
    const flat = StyleSheet.flatten(rippleClipWrapperStyle(shape, true));
    expect(flat.borderRadius).toBe(9999);
    expect(flat.overflow).toBe("hidden");
  });

  it("adds no clip off Android (iOS/web have no ripple to clip)", () => {
    expect(rippleClipWrapperStyle(shape, false)).toBeNull();
  });

  it("adds no clip when there is no shape, even on Android", () => {
    expect(rippleClipWrapperStyle(undefined, true)).toBeNull();
  });
});

describe("Button skin ripple clip shape", () => {
  const opts = { icon: false, block: false, dim: false };

  it("the Android skin clips the ripple to the pill (same 9999 radius as the container)", () => {
    expect(androidSkin.rippleClipShape?.("base", opts)).toEqual({ borderRadius: 9999 });
    // icon buttons are circles at the same radius, so the clip still matches their corners.
    expect(androidSkin.rippleClipShape?.("base", { ...opts, icon: true })).toEqual({
      borderRadius: 9999,
    });
  });

  it("iOS and web declare no clip shape (no bounded ripple to clip)", () => {
    expect(iosSkin.rippleClipShape).toBeUndefined();
    expect(webSkin.rippleClipShape).toBeUndefined();
  });
});

describe("Button Android container no longer carries the disproven same-node clip", () => {
  const base = androidSkin.container(lightColors, "primary", "base", {
    icon: false,
    block: false,
    dim: false,
  });

  it("does not set overflow:hidden on the ripple node (a same-node clip cannot clip the ripple)", () => {
    // The clip belongs on the <RippleClip> parent, not the node that carries the ripple.
    expect(base.overflow).toBeUndefined();
  });

  it("keeps the pill radius so the parent clip's rounded outline matches the button", () => {
    expect(base.borderRadius).toBe(9999);
  });

  it("does not force width on the node for a block button (block lives on the wrapper)", () => {
    const blocked = androidSkin.container(lightColors, "primary", "base", {
      icon: false,
      block: true,
      dim: false,
    });
    expect(blocked.width).toBeUndefined();
  });
});
