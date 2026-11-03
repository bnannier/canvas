import { Avatar, AvatarGroup, Column, Typography } from "@nannier/canvas";

export const Overflow = () => (
  <AvatarGroup max={3}>
    <Avatar name="Rachel Chen" />
    <Avatar name="Liang Bao" />
    <Avatar name="Marcus Allen" />
    <Avatar name="Kira Tran" />
    <Avatar name="Noor Park" />
  </AvatarGroup>
);

export const NoOverflow = () => (
  <AvatarGroup>
    <Avatar name="Ada Lovelace" />
    <Avatar name="Grace Hopper" />
    <Avatar name="Priya Haddad" />
  </AvatarGroup>
);

export const InContext = () => (
  <Column snug>
    <Typography small muted>Reviewers</Typography>
    <AvatarGroup small max={4} total={16}>
      <Avatar name="Ada Okafor" />
      <Avatar name="Rachel Chen" />
      <Avatar name="Liang Bao" />
      <Avatar name="Kira Tran" />
    </AvatarGroup>
  </Column>
);
