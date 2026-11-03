import { UptimeBar } from "@nannier/canvas";

export const Hero = () => (
  <UptimeBar
    label="API uptime"
    caption="99.98% uptime"
    startLabel="90 days ago"
    endLabel="Today"
    periods={Array.from({ length: 90 }, (_, i) => (i === 61 ? { down: true } : i === 78 ? { degraded: true } : {}))}
  />
);

export const Compact = () => (
  <UptimeBar
    compact
    label="CDN uptime"
    periods={Array.from({ length: 60 }, (_, i) => (i === 40 ? { degraded: true } : {}))}
  />
);

export const UnknownHistory = () => (
  <UptimeBar
    label="Worker uptime"
    periods={Array.from({ length: 30 }, (_, i) => (i < 6 ? { unknown: true } : {}))}
  />
);

export const MidLabel = () => (
  <UptimeBar
    label="API uptime"
    startLabel="90 days ago"
    midLabel="45 days"
    endLabel="Today"
    periods={Array.from({ length: 90 }, (_, i) => (i === 61 ? { down: true } : {}))}
  />
);

export const Detailed = () => (
  <UptimeBar
    detailed
    label="API uptime"
    caption="99.94% uptime"
    startLabel="60 days ago"
    endLabel="Today"
    periods={Array.from({ length: 60 }, (_, i) => ({
      label: `Day ${i + 1}`,
      degraded: i === 17 || i === 41,
      down: i === 52,
      unknown: i === 3,
    }))}
  />
);
