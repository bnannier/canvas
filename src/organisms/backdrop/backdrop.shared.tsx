import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo } from "react-native";
import { useTheme, useReducedMotion, useReducedTransparency, useIncreasedContrast } from "../../style/index.js";
import { type Energy } from "./backdrop-clock.js";
import { readLayers, Particles, Gradient, Shader, Custom, type Layer } from "./backdrop-layers.js";
import { useBackdropClaim, BackdropSurface, type BackdropClaim } from "./backdrop-host.js";
import { type BackdropSkin, type Density, type Prominence } from "./backdrop.styles.js";

// The Backdrop shell: the framework that displays a background animation.
//
// The kit owns the ENGINE (the surface, the clock, renderer selection, the frame
// budget, the accessibility ladder) and knows nothing about what is being drawn.
// The consuming application owns the SCENE: it composes Particles, Gradient and
// Shader layers, and supplies every seed, palette and shader source. Swap the
// children and the same engine renders a completely different animation, which is
// what makes this a kit component rather than one app's brand art.

export interface BackdropProps {
  /** The scene: Backdrop.Particles / .Gradient / .Shader layers, back to front. */
  children?: ReactNode;

  // Energy (pick one; omit for the default rate).
  energetic?: boolean;
  calm?: boolean;

  // Density (pick one; omit for the default field). Also the frame-budget lever.
  dense?: boolean;
  sparse?: boolean;

  // Prominence (pick one; omit for the default weight).
  vivid?: boolean;
  subtle?: boolean;

  /** Render the poster still and run no timers. Reduce Motion forces this on. */
  still?: boolean;

  /** The vanishing point every travelling layer radiates from, in 0..1 viewport
   *  units. Defaults slightly above centre so content breathes below it. */
  focus?: { x: number; y: number };

  /** Base tint for bodies that do not carry their own colour. Defaults to the
   *  theme's foreground-ish starlight, so an app with no palette still looks like
   *  ITS brand rather than like Canvas. */
  tint?: string;

  testID?: string;
}

// Precedence when more than one prop on an axis is passed: first match wins.
function energyOf(p: BackdropProps): Energy {
  if (p.energetic) return "energetic";
  if (p.calm) return "calm";
  return "default";
}

function densityOf(p: BackdropProps): Density {
  if (p.dense) return "dense";
  if (p.sparse) return "sparse";
  return "default";
}

function prominenceOf(p: BackdropProps): Prominence {
  if (p.vivid) return "vivid";
  if (p.subtle) return "subtle";
  return "default";
}

const DEFAULT_FOCUS = { x: 0.5, y: 0.42 };

/** Trim every particle field to the active detail tier. A scene declares its
 *  richest field once; the skin decides how much of it survives. */
function trim(layers: Layer[], detail: number): Layer[] {
  if (detail >= 1) return layers;
  return layers.map((l) => {
    if (l.kind !== "particles") return l;
    const n = Math.max(1, Math.round(l.field.length * detail));
    return n >= l.field.length ? l : { ...l, field: l.field.slice(0, n) };
  });
}

/** Structural comparison so a rebuilt array with identical content does not churn
 *  the surface. Fields are module-scope constants in practice, so identity holds. */
function layersEqual(a: Layer[], b: Layer[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x.kind !== y.kind || x.depth !== y.depth || x.alpha !== y.alpha) return false;
    if (x.kind === "particles" && y.kind === "particles") {
      if (x.field !== y.field || x.sprite !== y.sprite || x.phase !== y.phase || x.tint !== y.tint) return false;
    } else if (x.kind === "gradient" && y.kind === "gradient") {
      if (x.blobs !== y.blobs || x.size !== y.size || x.at.x !== y.at.x || x.at.y !== y.at.y) return false;
    } else if (x.kind === "shader" && y.kind === "shader") {
      if (x.source !== y.source || x.fallback !== y.fallback) return false;
    } else if (x.kind === "custom" && y.kind === "custom") {
      if (x.content !== y.content) return false;
    }
  }
  return true;
}

export function createBackdrop(skin: BackdropSkin) {
  function Backdrop(props: BackdropProps) {
    const { tokens, dark } = useTheme();
    const reduced = useReducedMotion();
    const reducedTransparency = useReducedTransparency();
    const increasedContrast = useIncreasedContrast();

    // useReducedMotion resolves asynchronously and reports false until it does, so
    // a Reduce Motion user would otherwise catch one animated frame before the
    // poster lands. Start still and go live only once the preference has been read.
    const [settled, setSettled] = useState(false);
    useEffect(() => {
      let alive = true;
      void AccessibilityInfo.isReduceMotionEnabled()
        .then(() => {
          if (alive) setSettled(true);
        })
        .catch(() => {
          if (alive) setSettled(true);
        });
      return () => {
        alive = false;
      };
    }, []);

    const energy = energyOf(props);
    const density = densityOf(props);
    const prominence = prominenceOf(props);
    const still = !!props.still || reduced || !settled;

    const tint = props.tint ?? (dark ? "#c7d2fe" : "#4338ca");
    const focus = props.focus ?? DEFAULT_FOCUS;

    const detail = skin.detail(density);
    const children = props.children;

    const layers = useMemo(() => {
      const read = trim(readLayers(children), detail);
      // Accessibility ladder, rungs 3 and 4. These win over any renderer, the same
      // way GlassSurface's degraded path wins over its material.
      // Increase Contrast paints the background token only, so nothing can reduce
      // text contrast. Reduce Transparency keeps the discrete bodies and drops the
      // wide translucent washes, which are the layers that actually veil content.
      if (increasedContrast) return [];
      if (reducedTransparency) return read.filter((l) => l.kind === "particles" || l.kind === "custom");
      return read;
    }, [children, detail, increasedContrast, reducedTransparency]);

    const stable = useStableLayers(layers);

    let alpha = skin.prominence(prominence, dark);
    if (reducedTransparency) alpha *= 0.5;

    const claim: BackdropClaim = {
      layers: stable,
      energy,
      focus,
      prominence: alpha,
      floor: increasedContrast ? tokens.background : skin.floor(tokens, dark),
      tint,
      still,
    };

    const hosted = useBackdropClaim(claim);
    // Hosted: the host owns the one surface and this renders nothing. Unhosted:
    // render inline, so a consumer without a host is never broken.
    return hosted ? null : <BackdropSurface claim={claim} />;
  }

  Backdrop.Particles = Particles;
  Backdrop.Gradient = Gradient;
  Backdrop.Shader = Shader;
  Backdrop.Custom = Custom;

  return Backdrop;
}

/** Hold the previous array when the new one is structurally identical, so the
 *  claim's identity check keeps the surface still. A ref, not state: this is a
 *  pure memo cache, so updating it during render triggers no extra pass. */
function useStableLayers(layers: Layer[]): Layer[] {
  const held = useRef(layers);
  if (!layersEqual(held.current, layers)) held.current = layers;
  return held.current;
}
