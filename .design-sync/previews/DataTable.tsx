import { Badge, DataTable } from "@nannier/canvas";

const people = [
  ["Alice Johnson", "alice@example.com", "Admin"],
  ["Bob Smith", "bob@example.com", "Editor"],
  ["Rachel Chen", "rachel@example.com", "Admin"],
  ["Dan Wright", "dan@example.com", "Viewer"],
];

export const Default = () => <DataTable columns={["Name", "Email", "Role"]} rows={people.slice(0, 3)} />;

export const Striped = () => <DataTable striped columns={["Name", "Email", "Role"]} rows={people} />;

export const Bordered = () => <DataTable bordered compact columns={["Name", "Email", "Role"]} rows={people.slice(0, 3)} />;

export const WithBadges = () => (
  <DataTable
    columns={["Invoice", "Status", "Amount"]}
    rows={[
      ["INV-0041", <Badge success>Paid</Badge>, "$1,250.00"],
      ["INV-0042", <Badge warning>Due</Badge>, "$450.00"],
      ["INV-0043", <Badge neutral>Draft</Badge>, "$8,120.00"],
    ]}
  />
);
