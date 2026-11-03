import { Badge, Button, Column, Icon, MediaObject } from "@nannier/canvas";

export const Comment = () => (
  <MediaObject
    bordered
    avatar="RC"
    title="Rachel Chen"
    description="Engineering Lead"
    body="Reviewed the latest pull request and left comments on the auth middleware changes."
  />
);

export const RowsWithMeta = () => (
  <Column cozy>
    <MediaObject bordered compact avatar="RC" title="Rachel Chen" description="rachel.chen@example.com" />
    <MediaObject bordered avatar="AL" title="Ada Lovelace" description="Commented on the deploy pipeline." meta="1h" />
  </Column>
);

export const IconLead = () => (
  <MediaObject bordered title="Security first" description="End-to-end encryption with automatic key rotation." icon={<Icon shield primary size={18} />} />
);

export const WithAction = () => (
  <MediaObject bordered center truncate avatar="AL" title="Ada Lovelace" description="ada.lovelace@analytical-engine.example.com" action={<Button outline small>Invite</Button>} />
);

export const NumberedStep = () => (
  <MediaObject bareIcon icon={<Badge step default>1</Badge>} title="Intrinsic, no JavaScript" description="Fill or hug inside the parent's bounds, a minWidth floor, wrapping." />
);
