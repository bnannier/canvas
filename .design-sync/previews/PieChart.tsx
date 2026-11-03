import { Card, PieChart } from "@nannier/canvas";

const slices = [
  { label: "Direct", value: 42 },
  { label: "Organic search", value: 28 },
  { label: "Social", value: 18 },
  { label: "Other", value: 12 },
];

export const Hero = () => <PieChart label="Traffic" slices={slices} />;

export const Donut = () => <PieChart donut label="Traffic" slices={slices} />;

export const DonutDetailed = () => (
  <PieChart
    donut
    detailed
    label="Sessions"
    slices={[
      { label: "Direct", value: 42 },
      { label: "Search", value: 28 },
      { label: "Other", value: 30 },
    ]}
  />
);

export const InsideCard = () => (
  <Card padded>
    <PieChart plain label="Traffic" slices={slices} />
  </Card>
);
