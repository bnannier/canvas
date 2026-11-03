import { Column, Icon, Stats } from "@nannier/canvas";

export const Group = () => (
  <Stats
    items={[
      { label: "Total users", value: "12,847", delta: "+12.5%" },
      { label: "Error rate", value: "0.12%", delta: "+0.03%", down: true },
      { label: "Avg. session", value: "4m 32s", delta: "last 30 days", steady: true },
    ]}
  />
);

export const Plain = () => (
  <Stats plain title="This quarter" items={[{ label: "Revenue", value: "$48.2k" }, { label: "Orders", value: "842" }, { label: "Conversion", value: "3.6%" }]} />
);

export const FramedStrips = () => (
  <Stats
    framed
    items={[
      { label: "Requests", value: "24.5k", delta: "+8.2%", spark: [4, 8, 6, 12, 10, 16, 14, 18] },
      { label: "Verified identities", value: "81.3%", delta: "1,502 of 1,847 verified", steady: true, share: [{ label: "Verified", value: 1502 }, { label: "Unverified", value: 345 }] },
    ]}
  />
);

export const IconsAndLarge = () => (
  <Column cozy>
    <Stats items={[{ label: "Active users", value: "12,348", icon: <Icon users muted size={16} />, chart1: true }, { label: "Sessions", value: "489", chart2: true }]} />
    <Stats large items={[{ label: "Monthly revenue", value: "$91.4k", delta: "+6.1%" }]} />
  </Column>
);
