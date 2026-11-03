import { RangeAreaChart } from "@nannier/canvas";

export const Hero = () => (
  <RangeAreaChart
    label="p50 to p99 latency (ms)"
    labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
    data={[
      { low: 42, high: 118, mid: 61 },
      { low: 38, high: 102, mid: 55 },
      { low: 44, high: 131, mid: 66 },
      { low: 40, high: 95, mid: 52 },
      { low: 47, high: 144, mid: 71 },
      { low: 36, high: 88, mid: 49 },
      { low: 34, high: 81, mid: 46 },
    ]}
  />
);

export const NegativeRange = () => (
  <RangeAreaChart
    label="Daily temperature (C)"
    labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
    data={[
      { low: -4, high: 6 },
      { low: -2, high: 9 },
      { low: 2, high: 14 },
      { low: 7, high: 19 },
      { low: 11, high: 24 },
      { low: 15, high: 28 },
    ]}
  />
);

export const SuccessSelected = () => (
  <RangeAreaChart
    success
    defaultSelected={2}
    title="Forecast"
    label="Confidence band"
    labels={["W1", "W2", "W3", "W4"]}
    data={[
      { low: 90, high: 110, mid: 100 },
      { low: 95, high: 125, mid: 108 },
      { low: 100, high: 140, mid: 118 },
      { low: 104, high: 158, mid: 129 },
    ]}
  />
);
