import { FunnelChart } from "@nannier/canvas";

export const Hero = () => (
  <FunnelChart
    title="Signup funnel"
    stages={[
      { label: "Visits", value: 12400 },
      { label: "Signups", value: 4200 },
      { label: "Activated", value: 1850 },
      { label: "Paid", value: 480 },
    ]}
  />
);

export const Share = () => (
  <FunnelChart
    share
    title="Checkout"
    stages={[
      { label: "Cart", value: 8600 },
      { label: "Address", value: 5200 },
      { label: "Payment", value: 3900 },
      { label: "Placed", value: 3400 },
    ]}
  />
);

export const Tapered = () => (
  <FunnelChart
    tapered
    stages={[
      { label: "Visited", value: 12400 },
      { label: "Signed up", value: 7900 },
      { label: "Activated", value: 4980 },
      { label: "Paid", value: 2610 },
    ]}
  />
);

export const CompactSelected = () => (
  <FunnelChart
    compact
    defaultSelected={1}
    stages={[
      { label: "Leads", value: 900 },
      { label: "Qualified", value: 340 },
      { label: "Closed", value: 120 },
    ]}
  />
);
