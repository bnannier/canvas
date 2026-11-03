import { Avatar, AvatarGroup, Row, Column } from "@nannier/canvas";

export const Palette = () => (
  <Row snug wrap>
    {["Ada Ito", "Rachel Tanaka", "Liang Kim", "Kira Okafor", "Marcus Singh", "Noor Novak", "Sofia Bao", "Theo Lovelace", "Omar Moreau", "Priya Haddad"].map((n) => (
      <Avatar key={n} name={n} />
    ))}
  </Row>
);

export const Sizes = () => (
  <Row relaxed alignCenter>
    <Avatar tiny name="NP" />
    <Avatar small name="AL" />
    <Avatar name="MA" />
    <Avatar large name="RC" />
  </Row>
);

export const Variants = () => (
  <Row relaxed alignCenter>
    <Avatar rounded name="LB" />
    <Avatar ring name="AO" />
    <Avatar online name="Rachel Chen" accessibilityLabel="Rachel Chen, online" />
    <Avatar logo whiteInk initials="A" />
  </Row>
);

export const Group = () => (
  <Column>
    <AvatarGroup max={3}>
      <Avatar name="Rachel Chen" />
      <Avatar name="Liang Bao" />
      <Avatar name="Marcus Allen" />
      <Avatar name="Kira Tran" />
    </AvatarGroup>
  </Column>
);
