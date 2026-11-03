import { Skeleton, Column } from "@nannier/canvas";

export const Text = () => (
  <Column>
    <Skeleton text />
    <Skeleton text long />
    <Skeleton text short />
  </Column>
);

export const Avatar = () => <Skeleton avatar />;

export const Card = () => <Skeleton card />;

export const List = () => <Skeleton list />;

export const Table = () => <Skeleton table />;

export const Button = () => <Skeleton button />;
