import { Card, ServiceHealthList } from "@nannier/canvas";

export const Hero = () => (
  <ServiceHealthList
    title="System status"
    items={[
      { label: "API", detail: "99.98%", periods: Array.from({ length: 45 }, () => ({})) },
      { label: "Dashboard", detail: "99.92%", periods: Array.from({ length: 45 }, (_, i) => (i === 30 ? { degraded: true } : {})), degraded: true },
      { label: "Webhooks", detail: "97.10%", periods: Array.from({ length: 45 }, (_, i) => (i > 40 ? { down: true } : {})), down: true },
    ]}
  />
);

export const Compact = () => (
  <ServiceHealthList
    compact
    items={[
      { label: "API", detail: "99.98%" },
      { label: "Dashboard", detail: "99.92%", degraded: true },
      { label: "Webhooks", detail: "97.10%", down: true },
    ]}
  />
);

export const Pressable = () => (
  <ServiceHealthList
    onPressItem={() => {}}
    items={[
      { label: "API", detail: "99.98%" },
      { label: "Search", detail: "99.95%" },
      { label: "Exports", detail: "99.80%", degraded: true },
    ]}
  />
);

export const InsideCard = () => (
  <Card>
    <ServiceHealthList
      plain
      items={[
        { label: "API", detail: "operational" },
        { label: "Dashboard", detail: "degraded", degraded: true },
      ]}
    />
  </Card>
);
