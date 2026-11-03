import { Badge, BadgeGroup } from "@nannier/canvas";

export const Default = () => (
  <BadgeGroup>
    <Badge>employee</Badge>
    <Badge>engineering</Badge>
    <Badge status success>active</Badge>
  </BadgeGroup>
);

export const Secondary = () => (
  <BadgeGroup>
    <Badge secondary>employee</Badge>
    <Badge secondary>engineering</Badge>
    <Badge secondary>remote</Badge>
  </BadgeGroup>
);

export const Tight = () => (
  <BadgeGroup tight>
    <Badge token>busy</Badge>
    <Badge token>disabled</Badge>
    <Badge token>aria-expanded</Badge>
  </BadgeGroup>
);
