import { Badge, BadgeGroup, Card, Column, Emblem, Icon, Row, Typography } from "@nannier/canvas";
import type { CatTile } from "./tile";

function ColorsPreview() {
  return <BadgeGroup><Badge default>Action</Badge><Badge secondary>Secondary</Badge><Badge status success>Success</Badge><Badge status warning>Warning</Badge><Badge destructive>Error</Badge></BadgeGroup>;
}

function SpacingPreview() {
  return <Column snug><Row snug alignCenter><Emblem small><Icon bell /></Emblem><Emblem><Icon bell /></Emblem><Emblem large><Icon bell /></Emblem></Row><Card compact><Typography small>Compact surface</Typography></Card></Column>;
}

function TypographyPreview() {
  return <Column tight><Typography h2>Aa</Typography><Typography>Manrope</Typography><Typography mono small>Geist Mono</Typography></Column>;
}

export const TOKENS_TILES: CatTile[] = [
  { title: "Colors & Theme", href: "/tokens/colors", Preview: ColorsPreview },
  { title: "Spacing & Shape", href: "/tokens/spacing", Preview: SpacingPreview },
  { title: "Typography", href: "/tokens/typography", Preview: TypographyPreview },
];
