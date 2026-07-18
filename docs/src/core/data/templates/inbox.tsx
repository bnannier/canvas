import { Row, Column, Card, Typography, Button, Badge, Input, Avatar, StackedList, Divider, useResponsive, Icon } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

// Inbox built from real Canvas components: a message list beside the open
// thread on desktop, stacking to a single column on phones via useResponsive.

function Message({ initials, name, time, children }: { initials: string; name: string; time: string; children: string }) {
  return (
    <Card flat>
      <Column snug>
        <Row between alignCenter>
          <Row snug alignCenter>
            <Avatar small name={initials} />
            <Typography small medium>{name}</Typography>
          </Row>
          <Typography tiny>{time}</Typography>
        </Row>
        <Typography small>{children}</Typography>
      </Column>
    </Card>
  );
}

function InboxLive() {
  const narrow = useResponsive({ base: false, sm: true });
  const list = (
    <Card flush>
      <StackedList
        clickable
        items={[
          { name: "Rachel Chen", detail: "Re: Q3 access review — sign-off needed", meta: "9:12" },
          { name: "Ada Lovelace", detail: "SSO rollout plan draft attached", meta: "8:40" },
          { name: "Billing", detail: "Your July invoice is ready", meta: "Yesterday" },
          { name: "Kevin Turner", detail: "Kudos on the launch!", meta: "Yesterday" },
        ]}
      />
    </Card>
  );
  const thread = (
    <Column cozy>
      <Row between alignCenter wrap>
        <Typography h4>Re: Q3 access review</Typography>
        <Badge secondary>3 messages</Badge>
      </Row>
      <Message initials="RC" name="Rachel Chen" time="9:12 AM">
        The access review is due Friday. Two admin grants look stale; can you confirm whether Kevin still needs production write?
      </Message>
      <Message initials="ME" name="You" time="9:20 AM">
        Kevin moved to the data team last sprint, so production write can go. I will drop it today and note it in the review.
      </Message>
      <Message initials="RC" name="Rachel Chen" time="9:24 AM">
        Perfect. Once that lands I will sign off on the review.
      </Message>
      <Divider />
      <Row snug alignCenter>
        <Column fill>
          <Input placeholder="Reply to Rachel…" block />
        </Column>
        <Button primary icon iconLeft={<Icon send primaryForeground size={18} />} accessibilityLabel="Send reply" />
      </Row>
    </Column>
  );
  if (narrow) {
    return (
      <Column relaxed>
        {list}
        {thread}
      </Column>
    );
  }
  return (
    <Row relaxed alignStart>
      <Column style={{ width: 300 }}>{list}</Column>
      <Column fill>{thread}</Column>
    </Row>
  );
}

export const INBOX_TEMPLATE: TemplateDoc = {
  slug: "inbox",
  name: "Inbox",
  description: "Two-pane inbox: message list beside the open thread, stacking to one column on phones. Built from live Canvas components.",
  sections: [
    {
      title: "List and thread",
      anatomy: "StackedList of conversations (fixed 300px rail on desktop) beside the thread of flat message Cards and the reply composer; the panes stack below the sm breakpoint.",
      render: () => <InboxLive />,
    },
  ],
};
