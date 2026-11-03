import { CandlestickChart } from "@nannier/canvas";

const labels = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"];
const candles = [
  { open: 64.0, high: 64.3, low: 62.7, close: 63.5 },
  { open: 63.5, high: 64.6, low: 63.2, close: 63.9 },
  { open: 63.9, high: 64.9, low: 62.4, close: 63.6 },
  { open: 63.6, high: 65.2, low: 62.4, close: 64.2 },
  { open: 64.2, high: 64.4, low: 64.0, close: 64.2 },
  { open: 64.2, high: 65.3, low: 62.8, close: 64.4 },
  { open: 64.4, high: 65.4, low: 63.8, close: 64.4 },
  { open: 64.4, high: 64.5, low: 62.6, close: 63.8 },
  { open: 63.8, high: 65.8, low: 63.6, close: 64.7 },
  { open: 64.7, high: 65.1, low: 63.9, close: 64.6 },
];

export const WithVolume = () => (
  <CandlestickChart
    title="OLY"
    labels={labels}
    candles={candles}
    volume={[31, 27, 35, 29, 18, 33, 26, 41, 38, 24]}
  />
);

export const Compact = () => <CandlestickChart compact labels={labels} candles={candles} />;

export const Overlays = () => (
  <CandlestickChart
    title="OLY"
    labels={labels}
    candles={candles}
    overlays={[
      { label: "3-day average", values: [63.7, 63.8, 63.8, 63.9, 64.0, 64.3, 64.3, 64.2, 64.3, 64.4] },
      { label: "5-day average", values: [63.6, 63.7, 63.7, 63.8, 63.9, 64.0, 64.1, 64.1, 64.2, 64.3], dashed: true },
    ]}
  />
);

export const Selected = () => <CandlestickChart defaultSelected={5} labels={labels} candles={candles} />;
