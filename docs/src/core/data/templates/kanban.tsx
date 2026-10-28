import { useState } from "react";
import type { BoardItem } from "@nannier/canvas";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Kanban (`Canvas v4.0.0 Templates.dc.html`, `t.kanban`): the Q4 board
// heading with Add card, then the kit Board's four status lanes, each card carrying its grip,
// its trailing badge, its tag chip and its owner's photo. Cards drag between lanes; Add card
// appends a draft to Backlog. Every part is a kit component from the frame's scope.

const COLUMNS = [
  { id: "backlog", label: "Backlog" },
  { id: "progress", label: "In progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

interface Card {
  id: string;
  columnId: string;
  title: string;
  tag: string;
  badge?: string;
  owner: string;
}

/** The hand-off's KB table. */
const SEED: Card[] = [
  { id: "k1", columnId: "backlog", title: "Calendar week timeline", tag: "organism", owner: "kira-tanaka" },
  { id: "k2", columnId: "backlog", title: "GeoMap zoom clusters", tag: "chart", badge: "P2", owner: "liang-bao" },
  { id: "k3", columnId: "progress", title: "Overlays on dense glass", tag: "overlay", badge: "#482", owner: "kira-tanaka" },
  { id: "k4", columnId: "progress", title: "Chart series palette", tag: "chart", owner: "liang-bao" },
  { id: "k5", columnId: "review", title: "Switch thumb spring", tag: "atom", badge: "ready", owner: "noor-park" },
  { id: "k6", columnId: "done", title: "Icon set at 1.75 stroke", tag: "atom", owner: "ada-lovelace" },
  { id: "k7", columnId: "done", title: "Container tiers", tag: "layout", owner: "grace-hopper" },
];

const nameOf = (owner: string) => owner.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ");

function KanbanScreen({ K, phone }: TemplateScreenProps) {
  const { Row, Column, Typography, Button, Icon, Board, Chip, Avatar } = K;
  const [cards, setCards] = useState(SEED);
  const [added, setAdded] = useState(0);
  const byId = new Map(cards.map((c) => [c.id, c]));
  const items: BoardItem[] = cards.map((c) => ({
    id: c.id,
    columnId: c.columnId,
    title: c.title,
    badge: c.badge,
    chips: (
      <Row between alignCenter>
        <Chip>{c.tag}</Chip>
        <Avatar tiny src={`/${c.owner}.jpg`} name={nameOf(c.owner)} />
      </Row>
    ),
  }));
  const addCard = () => {
    const n = added + 1;
    setAdded(n);
    setCards((list) => [...list, { id: `new-${n}`, columnId: "backlog", title: `New card ${n}`, tag: "draft", owner: "noor-park" }]);
  };
  return (
    <Column airy>
      <Row between alignEnd wrap cozy>
        {phone ? null : (
          <Column tight>
            <Typography h3 level={2}>Q4 board</Typography>
            <Typography small subtle>Canvas v4.0.0 rollout · 4 columns</Typography>
          </Column>
        )}
        <Button primary raised iconLeft={<Icon plus decorative />} onPress={addCard}>Add card</Button>
      </Row>
      <Board
        columns={COLUMNS}
        items={items}
        onItemsChange={(next) => setCards(next.map((item) => ({ ...byId.get(item.id)!, columnId: item.columnId })))}
      />
    </Column>
  );
}

export const KANBAN_TEMPLATE: TemplateDoc = {
  slug: "kanban",
  name: "Kanban",
  group: "App",
  icon: "columns2",
  description: "A board of status columns; cards carry tags, owners and badges.",
  path: "kanban",
  app: true,
  Screen: KanbanScreen,
};
