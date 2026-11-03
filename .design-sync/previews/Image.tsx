import { Image, Row } from "@nannier/canvas";

const svg = (a: string, b: string) =>
  "data:image/svg+xml;base64," +
  btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='240' height='160' viewBox='0 0 240 160'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='240' height='160' fill='url(#g)'/><circle cx='170' cy='55' r='22' fill='white' fill-opacity='.7'/><path d='M0 160 L80 80 L140 130 L180 100 L240 160Z' fill='white' fill-opacity='.55'/></svg>`);

export const Default = () => (
  <Image source={{ uri: svg("#7c5cff", "#22d3ee") }} alt="Mountain landscape at dusk" width={240} height={160} radius="xl" />
);

export const Fits = () => (
  <Row wrap>
    <Image source={{ uri: svg("#f43f5e", "#f59e0b") }} cover width={160} height={96} radius="xl" accessibilityLabel="Cover fit" />
    <Image source={{ uri: svg("#10b981", "#3b82f6") }} contain width={160} height={96} radius="xl" accessibilityLabel="Contain fit" />
    <Image source={{ uri: svg("#6366f1", "#ec4899") }} stretch width={160} height={96} radius="xl" accessibilityLabel="Stretch fit" />
  </Row>
);
