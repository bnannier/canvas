import { Children, Fragment, isValidElement, type ReactNode } from "react";

// The Backdrop's layer vocabulary: the renderer-agnostic contract between the
// application's scene and the kit's engine.
//
// The kit deliberately knows nothing about stars, auroras or rain. It knows about
// particle fields, gradient fields and shaders, each parked at a parallax depth.
// An application composes those into whatever animation it wants and owns all of
// the art: the seeds, the palettes, the shader source. Swap the scene and the same
// engine renders something completely different.
//
// Layer components are DECLARATIONS: they render nothing and exist only to be read
// out of `children` by the surface, which hands the resulting descriptors to the
// active renderer. That keeps the child list static and synchronous (no registry,
// no effects) and keeps layer types open-ended rather than an enum the kit has to
// extend for every new effect.

/** One body in a particle field. Positions are unit-box (0..1) so a field is
 *  resolution independent; the surface multiplies by the live viewport. */
export interface Particle {
  x: number;
  y: number;
  /** Radius in px at parallax scale 1. */
  r: number;
  /** Per-body alpha factor, multiplied by the layer's cap. */
  a: number;
  /** Explicit colour. Omit to take the layer's tint. */
  color?: string;
  /** Static rotation in degrees, for sprites whose orientation reads. */
  rot?: number;
  /** Unit direction, for sprites that elongate along their travel axis. */
  dx?: number;
  dy?: number;
  /** Length in box-units at scale 1, for the streak sprite. */
  len?: number;
}

/** The sprite a particle field draws. Renderers map these onto their own
 *  primitives; every renderer must support all four. */
export type ParticleSprite = "disc" | "halo" | "spark" | "streak";

/** One blob in a gradient field: a soft radial falloff used to build clouds. */
export interface GradientBlob {
  color: string;
  /** Unit position inside the layer's own box. */
  cx: number;
  cy: number;
  /** Radius as a fraction of the box. */
  r: number;
  /** Core stop opacity. */
  o: number;
  /** Gradient fade-out offset. */
  end: number;
}

export interface ParticlesLayer {
  kind: "particles";
  field: Particle[];
  sprite: ParticleSprite;
  /** Parallax rate. 0 pins the layer to the backdrop; 1 travels with the flight;
   *  above 1 rushes past in the foreground. */
  depth: number;
  /** Stagger inside the flight cycle, 0..1, so sibling layers at the same depth
   *  do not arrive together. */
  phase: number;
  tint?: string;
  alpha: number;
  bloom: boolean;
  twinkle: boolean;
}

export interface GradientLayer {
  kind: "gradient";
  blobs: GradientBlob[];
  depth: number;
  /** Box edge in px. */
  size: number;
  /** Unit anchor in the viewport. */
  at: { x: number; y: number };
  drift: boolean;
  alpha: number;
}

export interface ShaderLayer {
  kind: "shader";
  /** SkSL source. Only a GPU renderer consumes this; the SVG renderer draws
   *  `fallback` instead, which is why fallback is not optional. */
  source: string;
  uniforms: Record<string, number | number[]>;
  depth: number;
  /** What a renderer without shader support draws in this layer's place. */
  fallback: ReactNode;
  alpha: number;
}

export interface CustomLayer {
  kind: "custom";
  content: ReactNode;
  depth: number;
  alpha: number;
}

export type Layer = ParticlesLayer | GradientLayer | ShaderLayer | CustomLayer;

// ---------------------------------------------------------------------------
// Declaration components.
// ---------------------------------------------------------------------------

export interface ParticlesProps {
  field: Particle[];
  sprite?: ParticleSprite;
  depth?: number;
  phase?: number;
  tint?: string;
  alpha?: number;
  bloom?: boolean;
  twinkle?: boolean;
}

export interface GradientProps {
  blobs: GradientBlob[];
  depth?: number;
  size?: number;
  at?: { x: number; y: number };
  drift?: boolean;
  alpha?: number;
}

export interface ShaderProps {
  source: string;
  uniforms?: Record<string, number | number[]>;
  depth?: number;
  fallback: ReactNode;
  alpha?: number;
}

/** A field of particles at one parallax depth. */
export function Particles(_props: ParticlesProps): null {
  return null;
}
Particles.layerKind = "particles" as const;

/** A field of soft radial blobs: the cheap, universally available cloud. */
export function Gradient(_props: GradientProps): null {
  return null;
}
Gradient.layerKind = "gradient" as const;

/** A GPU shader layer, with the mandatory fallback for renderers without one. */
export function Shader(_props: ShaderProps): null {
  return null;
}
Shader.layerKind = "shader" as const;

export interface CustomProps {
  children?: ReactNode;
  depth?: number;
  alpha?: number;
}

/** Arbitrary application-supplied art, painted at this position in the layer
 *  stack. This is the seam that keeps the engine general: anything the vocabulary
 *  does not cover, the app draws itself, and it can bind to `backdropClock` to
 *  stay in phase with the rest of the scene. */
export function Custom(_props: CustomProps): null {
  return null;
}
Custom.layerKind = "custom" as const;

// ---------------------------------------------------------------------------
// Reading the scene.
// ---------------------------------------------------------------------------

type LayerComponent = { layerKind?: Layer["kind"] };

/** Walk `children` into layer descriptors, in declaration order (which is paint
 *  order: first child is furthest back). Unknown children are ignored rather
 *  than thrown on, so a scene can hold a comment or a conditional null.
 *
 *  Fragments are traversed. Children.forEach flattens arrays but treats a
 *  Fragment as a single opaque child, and a scene grouped in <>…</> silently
 *  rendering nothing is a miserable thing to debug. */
export function readLayers(children: ReactNode): Layer[] {
  const out: Layer[] = [];
  collect(children, out);
  return out;
}

function collect(children: ReactNode, out: Layer[]): void {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (child.type === Fragment) {
      collect((child.props as { children?: ReactNode }).children, out);
      return;
    }

    const kind = (child.type as LayerComponent)?.layerKind;
    if (!kind) return;

    if (kind === "particles") {
      const p = child.props as ParticlesProps;
      out.push({
        kind: "particles",
        field: p.field,
        sprite: p.sprite ?? "disc",
        depth: p.depth ?? 1,
        phase: p.phase ?? 0,
        tint: p.tint,
        alpha: p.alpha ?? 1,
        bloom: !!p.bloom,
        twinkle: !!p.twinkle,
      });
      return;
    }

    if (kind === "gradient") {
      const p = child.props as GradientProps;
      out.push({
        kind: "gradient",
        blobs: p.blobs,
        depth: p.depth ?? 0.2,
        size: p.size ?? 720,
        at: p.at ?? { x: 0.5, y: 0.5 },
        drift: p.drift ?? true,
        alpha: p.alpha ?? 1,
      });
      return;
    }

    if (kind === "custom") {
      const p = child.props as CustomProps;
      out.push({ kind: "custom", content: p.children, depth: p.depth ?? 0, alpha: p.alpha ?? 1 });
      return;
    }

    const p = child.props as ShaderProps;
    out.push({
      kind: "shader",
      source: p.source,
      uniforms: p.uniforms ?? {},
      depth: p.depth ?? 0,
      fallback: p.fallback,
      alpha: p.alpha ?? 1,
    });
  });
}
