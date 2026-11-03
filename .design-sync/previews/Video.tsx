import { Video } from "@nannier/canvas";

// The docs' sample clip and poster are docs-site files that neither the bundle nor the
// Claude Design project ships, so the poster is an inline still; the clip URI is the docs'
// and the poster stays up until a real clip's first frame lands. `controls` is not
// shown: the control bar appears on interaction, so a still capture equals Poster.
const still = (w: number, h: number) =>
  "data:image/svg+xml;base64," +
  btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#3b2a8f'/><stop offset='1' stop-color='#0e7490'/></linearGradient></defs><rect width='${w}' height='${h}' fill='url(#g)'/><rect x='${w * 0.12}' y='${h * 0.2}' width='${w * 0.5}' height='${h * 0.08}' rx='${h * 0.04}' fill='white' fill-opacity='.85'/><rect x='${w * 0.12}' y='${h * 0.34}' width='${w * 0.34}' height='${h * 0.05}' rx='${h * 0.025}' fill='white' fill-opacity='.5'/><rect x='${w * 0.12}' y='${h * 0.5}' width='${w * 0.76}' height='${h * 0.32}' rx='${h * 0.04}' fill='white' fill-opacity='.18'/></svg>`);

const source = { uri: "/video-sample.mp4" };

export const Poster = () => (
  <Video source={source} poster={{ uri: still(1280, 720) }} accessibilityLabel="Product walkthrough" />
);

export const Square = () => (
  <Video source={source} poster={{ uri: still(720, 720) }} cover aspectRatio={1} accessibilityLabel="Square crop" />
);
