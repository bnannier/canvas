import { BarList, Chart, DashboardGrid } from "@nannier/canvas";

const items = [
  { id: "revenue", span: 8, title: "Revenue", content: <Chart title="Revenue" data={[{ label: "Mon", value: 12 }, { label: "Tue", value: 18 }, { label: "Wed", value: 15 }, { label: "Thu", value: 22 }]} /> },
  { id: "signups", span: 4, title: "Signups", content: <BarList title="Signups" items={[{ label: "Web", value: 82 }, { label: "iOS", value: 64 }]} /> },
  { id: "endpoints", span: 12, title: "Slowest endpoints", content: <BarList title="Slowest endpoints" items={[{ label: "/api/search", value: 240 }, { label: "/api/feed", value: 180 }]} /> },
];

export const Locked = () => <DashboardGrid items={items} />;

export const Unlocked = () => <DashboardGrid unlocked items={items.slice(0, 2).map((i) => ({ ...i, span: 6 }))} />;
