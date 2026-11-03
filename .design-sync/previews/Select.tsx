import { Select } from "@nannier/canvas";

const countries = [
  { value: "us", label: "United States", leading: "🇺🇸" },
  { value: "fr", label: "France", leading: "🇫🇷" },
  { value: "jp", label: "Japan", leading: "🇯🇵" },
];

export const Basic = () => <Select label="Country" options={countries} defaultValue="fr" />;

export const Placeholder = () => <Select label="Role" placeholder="Choose a role" options={["Owner", "Admin", "Member", "Guest"]} />;

export const Open = () => <Select label="Region" defaultOpen options={["US East", "EU West", "Asia Pacific"]} defaultValue="EU West" />;

export const Sizes = () => (
  <>
    <Select small accessibilityLabel="Small" options={["Daily", "Weekly"]} defaultValue="Daily" />
    <Select large accessibilityLabel="Large" options={["Daily", "Weekly"]} defaultValue="Weekly" />
  </>
);

export const Disabled = () => <Select disabled label="Plan" options={["Free", "Pro"]} defaultValue="Free" />;
