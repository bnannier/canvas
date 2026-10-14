import type { ReactNode } from "react";
import { View, Pressable, useTheme } from "../../style/index.js";
import { useHover, hoverFill } from "../../style/hover.js";
import type { Card as CardComponent } from "../card/card.js";
import { Icon } from "../../atoms/icon/icon.js";
import { Typography } from "../../atoms/typography/typography.js";
import type { AccordionItem } from "./accordion.shared.js";
import * as s from "./accordion.activity.styles.js";

export function ActivityAccordionRow({ Card, item, expanded, disabled, compact, renderHeader, onToggle }: { Card: typeof CardComponent; item: AccordionItem; expanded: boolean; disabled: boolean; compact: boolean; renderHeader?: (item: AccordionItem, expanded: boolean, indicator: ReactNode) => ReactNode; onToggle: () => void }) {
  const { tokens } = useTheme();
  const { hovered, target } = useHover(!disabled);
  const indicator = <Icon disclosure expanded={expanded} decorative chevronDown size={14} muted heavyStroke />;
  return <Card borderless gapless flush rowShadow clip>
    <Pressable {...target} accessibilityRole={renderHeader ? "none" : "button"} accessibilityLabel={item.title} accessibilityState={{ expanded, disabled }} aria-expanded={expanded} disabled={disabled} onPress={onToggle} style={[s.header(compact), hovered ? { backgroundColor: hoverFill(tokens) } : null, disabled ? s.disabled : null]}>
      {renderHeader ? renderHeader(item, expanded, indicator) : <><Typography body bold>{item.title}</Typography>{indicator}</>}
    </Pressable>
    {expanded ? <View style={[s.content(compact), { borderTopColor: tokens.border }]}>{item.content}</View> : null}
  </Card>;
}
