import { Column, Feed } from "@nannier/canvas";

export const AuditLog = () => (
  <Feed
    label="Recent activity"
    items={[
      { actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" },
      { actor: "Ada Lovelace", action: "merged", target: "release/4.2", time: "5 hours ago" },
      { actor: "System", action: "created the project", time: "3 days ago" },
    ]}
  />
);

export const IconLead = () => (
  <Feed
    items={[
      { icon: "shieldCheck", actor: "System", action: "rotated the signing key", time: "12 minutes ago" },
      { icon: "userPlus", actor: "Rachel Chen", action: "invited a teammate", time: "2 hours ago" },
      { icon: "gitMerge", actor: "Ada Lovelace", action: "merged a release", time: "1 day ago" },
    ]}
  />
);

export const Avatars = () => (
  <Feed
    avatar
    items={[
      { actor: "Rachel Chen", action: "commented on the pull request", time: "2 hours ago" },
      { actor: "Ada Lovelace", action: "pushed 3 commits", time: "5 hours ago" },
      { actor: "Kevin Turner", action: "opened the pull request", time: "1 day ago" },
    ]}
  />
);

export const ActivityAndTrace = () => (
  <Column cozy>
    <Feed activity label="Recent activity" items={[{ time: "2m", action: "Scout completed discovery" }, { time: "18m", action: "Ranger restored the deployment" }]} />
    <Feed trace label="Latest trace" items={[{ time: "00:00", kind: "Context", action: "Loaded the work item" }, { time: "01:05", kind: "Eval", action: "Checks passed" }]} />
  </Column>
);
