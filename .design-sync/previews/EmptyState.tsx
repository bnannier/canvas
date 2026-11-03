import { Column, EmptyState, Icon } from "@nannier/canvas";

export const NoResults = () => (
  <EmptyState
    bordered
    icon={<Icon search />}
    title="No results found"
    description="Try a different search term or clear your filters."
    actionLabel="Clear filters"
  />
);

export const Success = () => (
  <EmptyState success bordered icon={<Icon check />} title="Inbox zero" description="You have reviewed every pending request." />
);

export const Elevated = () => (
  <EmptyState elevated icon={<Icon folder />} title="No projects yet" description="Create your first project to start collaborating." actionLabel="New project" />
);

export const Compact = () => (
  <Column cozy>
    <EmptyState compact bordered icon={<Icon bell />} title="No notifications" description="You are all caught up." />
  </Column>
);
