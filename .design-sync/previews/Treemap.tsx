import { Treemap } from "@nannier/canvas";

export const Hero = () => (
  <Treemap
    title="Storage by service (GB)"
    data={[
      { label: "Media", value: 620 },
      { label: "Backups", value: 340 },
      { label: "Logs", value: 180 },
      { label: "Search index", value: 120 },
      { label: "Thumbnails", value: 90 },
      { label: "Exports", value: 45 },
      { label: "Other", value: 25 },
    ]}
  />
);

export const Compact = () => (
  <Treemap
    compact
    data={[
      { label: "Chrome", value: 61 },
      { label: "Safari", value: 24 },
      { label: "Edge", value: 8 },
      { label: "Firefox", value: 5 },
      { label: "Other", value: 2 },
    ]}
  />
);

export const Selected = () => (
  <Treemap
    defaultSelected={0}
    data={[
      { label: "Platform", value: 4200 },
      { label: "Add-ons", value: 1400 },
      { label: "Services", value: 900 },
      { label: "Training", value: 300 },
    ]}
  />
);

export const PartitionedOutlined = () => (
  <Treemap
    partitioned
    outlined
    formatValue={(v) => `${v}%`}
    data={[
      { label: "Web", value: 42 },
      { label: "Phone", value: 28 },
      { label: "Tablet", value: 18 },
      { label: "Desktop", value: 7 },
      { label: "CLI", value: 3 },
      { label: "Other", value: 2 },
    ]}
  />
);
