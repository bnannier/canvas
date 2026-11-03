import { Badge, Column, DescriptionList, Kbd, Row } from "@nannier/canvas";

export const Profile = () => (
  <DescriptionList
    card
    title="Application details"
    subtitle="Personal information and credentials."
    items={[
      { term: "Full name", value: "Rachel Chen" },
      { term: "Email", value: "rachel.chen@example.com" },
      { term: "Role", value: "Admin" },
    ]}
  />
);

export const Inline = () => (
  <DescriptionList
    inline
    items={[
      { term: "Status", value: "Active" },
      { term: "Seats", value: "12 of 20" },
      { term: "Renews", value: "Mar 1, 2026" },
    ]}
  />
);

export const RichValues = () => (
  <DescriptionList
    twoColumn
    items={[
      { term: "Status", value: "Active", status: true },
      { term: "Plan", value: "Pro", badge: true },
      { term: "Members", value: "8 members", avatars: [{ name: "Rachel Chen" }, { name: "Alan Turing" }, { name: "Grace Hopper" }], overflow: 5 },
      { term: "Client ID", value: "clnt_01H2X8K9", mono: true, copyValue: "clnt_01H2X8K9" },
    ]}
  />
);

export const RuledKeys = () => (
  <DescriptionList
    twoColumn
    ruled
    items={[
      { term: <Kbd>Enter</Kbd>, value: "Activates" },
      { term: <Kbd>Space</Kbd>, value: "Activates" },
      { term: <Kbd>Tab</Kbd>, value: "Moves focus to the next control" },
    ]}
  />
);

export const InlineEdit = () => (
  <Column cozy>
    <DescriptionList
      twoColumn
      items={[
        { term: "Name", value: "Rachel Chen", update: true },
        { term: "Email", value: "rachel.chen@example.com", update: true },
      ]}
    />
    <DescriptionList
      twoColumn
      divided
      items={[
        { term: "States", value: <Row snug wrap><Badge soft>disabled</Badge><Badge soft>busy</Badge><Badge soft>focused</Badge></Row> },
        { term: "Keyboard", value: "Enter and Space activate it" },
      ]}
    />
  </Column>
);
