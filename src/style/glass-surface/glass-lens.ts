// The web Liquid Glass LENS: the top tier of the glass material ladder on
// Chromium web, above the expo-blur frost and the translucent popover fill.
//
// Liquid Glass bends and concentrates light through a 2D displacement map
// rather than scattering it the way a blur does, and the bend is concentrated
// at the RIM: the centre of a pane is optically flat, the edges curve steeply.
// No combination of blur/saturate/brightness can fake that, so the lens is an
// SVG filter referenced as `backdrop-filter: url(#cds-glass-lens)`, injected
// ONCE per document. Two grayscale ramps drive it: a horizontal ramp displaces
// on X, a vertical ramp on Y. Each ramp is FLAT at 128 (zero shift) across the
// middle and swings toward its extremes only near the rim, which is what puts
// the refraction on the edge; the blue channel stays a constant 128 so it can
// be selected as the "no displacement" axis on each pass.
//
// Two geometry constraints, both load-bearing:
//   - The shift must stay well inside the surface. The filter region is
//     finite, so a sample taken from beyond it resolves to transparent black;
//     an oversized scale hollows out the edges of a bar-height surface instead
//     of refracting them. The ramps top out at 0.28 from centre and the scale
//     is 34, giving ~9px, right for the 50-70px bars and sheets this material
//     is used on.
//   - The region is inflated past the border box so those edge samples have
//     real backdrop to draw from rather than nothing.
//
// The filter markup and its id are kept in lockstep with the design system's
// reference lens, and the id matches the shipped CSS token layer's
// `--glass-lens: url(#cds-glass-lens)` (styles/tokens/colors.css), so raw-CSS
// web surfaces and the kit's own components resolve one and the same filter.
//
// On Android and native iOS `document` does not exist, so every entry point
// here answers false and those platforms keep their own real materials.

import { useEffect, useState } from "react";

export const GLASS_LENS_ID = "cds-glass-lens";
export const GLASS_LENS_FILTER = `url(#${GLASS_LENS_ID})`;

// A displacement ramp as a data-URI SVG gradient: flat mid-gray across the
// middle 60%, swinging toward the extremes only in the outer 20% at each end.
function ramp(vertical: boolean): string {
  const [x2, y2] = vertical ? [0, 1] : [1, 0];
  const mid = "rgb(128,128,128)";
  const lo = vertical ? "rgb(128,56,128)" : "rgb(56,128,128)";
  const hi = vertical ? "rgb(128,200,128)" : "rgb(200,128,128)";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' preserveAspectRatio='none'><defs><linearGradient id='g' x1='0' y1='0' x2='${x2}' y2='${y2}'><stop offset='0' stop-color='${lo}'/><stop offset='0.2' stop-color='${mid}'/><stop offset='0.8' stop-color='${mid}'/><stop offset='1' stop-color='${hi}'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/></svg>`;
  return "data:image/svg+xml," + svg.replace(/#/g, "%23").replace(/"/g, "'");
}

/** True when the lens filter element is present in this document. A
 *  `backdrop-filter` that references a MISSING filter resolves to NO filter at
 *  all, not a fallback, so presence is what surfaces must gate on before ever
 *  emitting the lens value. */
export function hasGlassLens(): boolean {
  return typeof document !== "undefined" && !!document.getElementById(GLASS_LENS_ID);
}

/** Inject the lens filter once. Idempotent; returns whether the filter is now
 *  available in the document. */
export function ensureGlassLens(): boolean {
  if (typeof document === "undefined") return false;
  if (document.getElementById(GLASS_LENS_ID)) return true;
  if (!document.body) return false;
  const host = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  host.id = GLASS_LENS_ID + "-defs";
  host.setAttribute("aria-hidden", "true");
  host.setAttribute("width", "0");
  host.setAttribute("height", "0");
  host.style.position = "absolute";
  host.style.width = "0";
  host.style.height = "0";
  host.style.pointerEvents = "none";
  host.style.overflow = "hidden";
  host.innerHTML = `<filter id="${GLASS_LENS_ID}" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
    <feImage href="${ramp(false)}" preserveAspectRatio="none" x="-12%" y="-12%" width="124%" height="124%" result="mx"/>
    <feImage href="${ramp(true)}" preserveAspectRatio="none" x="-12%" y="-12%" width="124%" height="124%" result="my"/>
    <feDisplacementMap in="SourceGraphic" in2="mx" scale="34" xChannelSelector="R" yChannelSelector="B" result="dx"/>
    <feDisplacementMap in="dx" in2="my" scale="34" xChannelSelector="B" yChannelSelector="G" result="dy"/>
    <feGaussianBlur in="dy" stdDeviation="6" result="soft"/>
    <feColorMatrix in="soft" type="saturate" values="1.9"/>
  </filter>`;
  document.body.appendChild(host);
  return true;
}

/**
 * Whether this engine can RENDER an SVG-reference backdrop-filter, decided from
 * the user agent string and a `CSS.supports` probe. Only Chromium renders SVG
 * filters in `backdrop-filter`; WebKit and Gecko parse-accept the value but
 * paint no filter at all, which would strip the frost instead of upgrading it,
 * and with a single inline style value there is no CSS-cascade fallback to
 * catch that. Render support is therefore not feature-detectable, and the gate
 * allows the known-good family: every Chromium UA carries "Chrome/" (Edge,
 * Brave, Arc, Opera, HeadlessChrome included), while iOS Chrome, which is
 * WebKit underneath, identifies as "CriOS/" and correctly stays on the frost.
 * The `CSS.supports` probe is the future-proof floor for engines that reject
 * the value outright. Pure so tests can exercise the truth table directly.
 */
export function lensBackdropSupported(
  userAgent: string,
  supports: (property: string, value: string) => boolean,
): boolean {
  return /Chrome\/\d/.test(userAgent) && supports("backdrop-filter", GLASS_LENS_FILTER);
}

// The environment-reading wrapper around the pure gate above. Recomputed per
// call (a regex and one CSS.supports probe) rather than memoized, so tests
// that override the user agent stay isolated across files.
function glassLensRenderable(): boolean {
  if (typeof navigator === "undefined" || typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  return lensBackdropSupported(navigator.userAgent, (property, value) => CSS.supports(property, value));
}

/**
 * The lens gate for a glass surface: true only once the filter is PRESENT in
 * the document and the engine can render it. Surfaces render the frost until
 * this answers true and only then upgrade; emitting the lens eagerly would
 * resolve to no filter at all while the element is missing.
 */
export function useGlassLens(glass: boolean): boolean {
  const [present, setPresent] = useState(() => glass && hasGlassLens());
  useEffect(() => {
    if (glass && ensureGlassLens()) setPresent(true);
  }, [glass]);
  return glass && present && glassLensRenderable();
}

// Injected as early as the document allows: the filter has to exist BEFORE the
// first frame that references it, and eager injection also makes hasGlassLens()
// true by the time the first surface renders, so a glass app mounts straight
// into the lens with no one-frame frost flash. A hidden 0x0 SVG, harmless for
// solid-mode documents.
if (typeof document !== "undefined") {
  if (document.body) ensureGlassLens();
  else document.addEventListener("DOMContentLoaded", () => { ensureGlassLens(); }, { once: true });
}
