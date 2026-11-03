import { FilterPanel } from "@nannier/canvas";

export const Bordered = () => (
  <FilterPanel
    bordered
    groups={[
      { title: "Status", options: [
        { label: "Active", checked: true, count: "128" },
        { label: "Pending", count: "12" },
        { label: "Archived", count: "2" },
      ] },
      { title: "Schema", options: [
        { label: "Default", count: "96" },
        { label: "Custom", count: "46" },
      ] },
    ]}
  />
);

export const Regions = () => (
  <FilterPanel
    groups={[
      { title: "Status", options: [
        { label: "Active", checked: true, count: "128" },
        { label: "Archived", count: "14" },
      ] },
      { title: "Region", options: [
        { label: "North America", checked: true, count: "86" },
        { label: "Europe", count: "56" },
      ] },
    ]}
  />
);
