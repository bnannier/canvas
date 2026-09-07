/**
 * The one stroke weight every Canvas glyph is drawn at.
 *
 * Icons from two families, or one family at two weights, is among the most visible
 * signs of an interface that was assembled rather than designed: the eye reads the
 * mismatch long before it can name it. Canvas draws its whole set at a single weight,
 * and this constant is what makes that a fact rather than an intention.
 *
 * It lives in its own module, free of any React Native import, so the raster generator
 * (tools/rastergen, which bakes the iOS UIMenu glyph PNGs, since a native menu cannot
 * render SVG) reads the same number the component draws with instead of repeating it.
 */
export const ICON_STROKE_WIDTH = 1.75;
