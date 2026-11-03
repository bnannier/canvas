import { Autocomplete, Column } from "@nannier/canvas";

const people = ["Ada Lovelace", "Grace Hopper", "Kira Tanaka", "Liang Bao", "Noor Park"];

export const Default = () => (
  <Autocomplete label="Assigned to" placeholder="Search a person…" options={people} />
);

export const OpenWithQuery = () => (
  <Autocomplete label="Assigned to" open defaultQuery="a" options={people} />
);

export const WithDetails = () => (
  <Autocomplete
    label="Runtime"
    placeholder="Search runtimes…"
    options={[
      { label: "Expo", detail: "SDK 57" },
      { label: "React Native", detail: "0.86" },
      { label: "React Native Web", detail: "web" },
      { label: "Remix", detail: "web" },
    ]}
  />
);

export const Selected = () => (
  <Autocomplete label="Assigned to" defaultValue="Grace Hopper" helperText="The person responsible for this account." options={people} />
);

export const States = () => (
  <Column>
    <Autocomplete label="Assigned to" required placeholder="Search a person…" options={people} />
    <Autocomplete label="Assigned to" disabled placeholder="Search a person…" options={people} />
  </Column>
);
