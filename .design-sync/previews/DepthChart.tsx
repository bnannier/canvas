import { DepthChart } from "@nannier/canvas";

const bids = [
  { price: 191.3, size: 80 },
  { price: 191.15, size: 120 },
  { price: 191.0, size: 116 },
  { price: 190.85, size: 118 },
  { price: 190.7, size: 176 },
  { price: 190.55, size: 190 },
  { price: 190.4, size: 210 },
  { price: 190.25, size: 236 },
];
const asks = [
  { price: 191.6, size: 90 },
  { price: 191.75, size: 122 },
  { price: 191.9, size: 110 },
  { price: 192.05, size: 154 },
  { price: 192.2, size: 154 },
  { price: 192.35, size: 210 },
  { price: 192.5, size: 222 },
  { price: 192.65, size: 240 },
];

export const Hero = () => <DepthChart title="OLY order book" bids={bids} asks={asks} />;

export const WithSpread = () => (
  <DepthChart
    title="OLY order book"
    spread="spread 0.16%"
    bids={bids.filter((_, i) => i % 2 === 0)}
    asks={asks.filter((_, i) => i % 2 === 0)}
  />
);

export const Compact = () => <DepthChart compact bids={bids.slice(0, 5)} asks={asks.slice(0, 5)} />;
