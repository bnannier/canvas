import { useEffect, useState, type ReactNode } from "react";
import type { ImageSourcePropType, ViewStyle } from "react-native";
import { View, Text, Pressable, LoopView, createLoopChannel, useReducedMotion, useTheme } from "../../style/index.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Image } from "../../atoms/image/image.shared.js";
import { MONO_FONT } from "../../style/mono.js";
import type { CardProps } from "./card.shared.js";
import type { SectionInsets } from "./card.styles.js";
import * as s from "./card.board.layout.js";

export interface BoardCardProps {
  /** A board ticket with fixed text slots and an optional full-bleed image header. */
  board?: boolean;
  ticketNumber?: string;
  priorityLabel?: string;
  statusLabel?: string;
  /** Display Blocked, or Blocked by the supplied reason, as the status. */
  blocked?: boolean;
  blockedReason?: string;
  typeLabel?: string;
  /** A short notice shown as a quiet outline pill after the type and priority, such as
   * "Workflow v1" for a ticket on an older workflow. */
  noticeLabel?: string;
  /** Display functional text shimmer and cycling dots while work is active. */
  aiActive?: boolean;
  /** Open the active AI work from its progress label, independently of the card. */
  onAIProgressPress?: () => void;
  /** Board's provided move handle, preserving its pointer/keyboard bindings. */
  moveHandle?: ReactNode;
  /** Actual supplied image; authenticated React Native sources retain their headers. */
  imageSource?: ImageSourcePropType;
  imageLabel?: string;
}

const progress = createLoopChannel({ period: 1800 });
let progressing = 0;
const hidden = { "aria-hidden": true, accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const };
const progressLabel = "AI work in progress";
// Three discrete states, rather than a setInterval or React commits on every frame.
const dotTracks = [
  [1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1],
];
const dotTimes = [0, 1 / 3 - 0.0001, 1 / 3, 2 / 3 - 0.0001, 2 / 3, 1];

function ProgressText({ onPress }: { onPress?: () => void }) {
  const { tokens } = useTheme();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    if (++progressing === 1) progress.play();
    return () => { if (--progressing === 0) progress.stop(); };
  }, [reduced]);
  const content = reduced ? <Text {...hidden} numberOfLines={1} ellipsizeMode="tail" style={s.label(tokens)}>{progressLabel}...</Text> : <View {...hidden} style={s.progressRow}>
      {[...progressLabel].map((letter, index) => <View key={index} style={s.character}>
        <Text style={s.label(tokens)}>{letter}</Text>
        <LoopView style={s.highlight} opacity={{ channel: progress, inputRange: [0, 0.12, 0.24, 1], outputRange: [0, 1, 0, 0], offset: -index * 0.025 }}>
          <Text style={[s.label(tokens), { color: tokens["card-foreground"] }]}>{letter}</Text>
        </LoopView>
      </View>)}
      <View style={s.dots}>
        {dotTracks.map((outputRange, index) => <LoopView key={index} style={s.highlight} opacity={{ channel: progress, inputRange: dotTimes, outputRange }}>
          <Text style={s.label(tokens)}>{".".repeat(index + 1)}</Text>
        </LoopView>)}
      </View>
    </View>;
  if (onPress) return <View style={s.progressRow}>
    <Pressable style={s.progressRow} accessible accessibilityRole="button" accessibilityLabel="View AI work in progress" onPress={(event) => { event.stopPropagation(); onPress(); }}>
      {content}
    </Pressable>
  </View>;
  return <View style={s.progressRow} accessible accessibilityRole="progressbar" accessibilityLabel={progressLabel} accessibilityState={{ busy: true }} aria-busy>
    {content}
  </View>;
}

/** Content anatomy only: the existing Card continues to own surface and interaction. */
export function BoardCardContent(props: CardProps & { imageHeaderCorners: ViewStyle; insets: SectionInsets }) {
  const { tokens } = useTheme();
  // Failure is tied to the exact source. A new source retries immediately; an error
  // collapses the image well rather than leaving a large broken/empty rectangle.
  const sourceKey = JSON.stringify(props.imageSource);
  const [failed, setFailed] = useState<string>();
  const withImage = props.imageSource != null && failed !== sourceKey;
  const id = (part: string) => props.testID ? `${props.testID}-${part}` : undefined;
  const reason = props.blockedReason?.trim();
  const status = props.blocked ? (reason ? `Blocked by ${reason}` : "Blocked") : props.statusLabel;
  const priority = props.priorityLabel?.trim().toLowerCase();
  const metadata = <View style={s.header}>
    <View style={s.numberRow}>
      <View style={s.number}><Text testID={id("number")} numberOfLines={1} ellipsizeMode="tail" style={[s.key(tokens), { fontFamily: MONO_FONT }]}>{props.ticketNumber}</Text></View>
      <View testID={id("move")} style={s.move}>{props.moveHandle}</View>
    </View>
  </View>;
  return <>
    <View testID={id("header")} style={withImage ? [s.imageHeader, props.imageHeaderCorners, { backgroundColor: tokens.muted }] : props.insets.header}>
      {withImage ? <>
        <Image testID={id("image")} contain source={props.imageSource} alt={props.imageLabel} style={s.image} onError={() => setFailed(sourceKey)} />
        <View style={[s.overlay, { backgroundColor: tokens.card }]}>{metadata}</View>
      </> : metadata}
    </View>
    <View testID={id("text")} style={[props.insets.contentBelow, s.body]}>
      <View style={s.titleSlot}><Text testID={id("title")} numberOfLines={2} ellipsizeMode="tail" style={s.title(tokens)}>{props.title}</Text></View>
      <View style={s.descriptionSlot}><Text testID={id("description")} numberOfLines={2} ellipsizeMode="tail" style={s.description(tokens)}>{props.description}</Text></View>
      <View style={s.single}><Text testID={id("status")} accessibilityLabel={status ? `Status: ${status}` : undefined} numberOfLines={1} ellipsizeMode="tail" style={props.blocked ? s.reason(tokens) : s.label(tokens)}>{status}</Text></View>
      <View testID={id("metadata")} style={s.badgeSlot}>
        {props.typeLabel ? <View testID={id("type")} accessible accessibilityRole="text" accessibilityLabel={`Type: ${props.typeLabel}`}><Badge small soft primary start>{props.typeLabel}</Badge></View> : null}
        {props.priorityLabel ? <View testID={id("priority")} accessible accessibilityRole="text" accessibilityLabel={`Priority: ${props.priorityLabel}`}><Badge small soft start error={priority === "high" || priority === "critical"} warning={priority === "medium"} secondary={priority !== "high" && priority !== "critical" && priority !== "medium"}>{props.priorityLabel}</Badge></View> : null}
        {props.noticeLabel ? <View testID={id("notice")} accessible accessibilityRole="text" accessibilityLabel={props.noticeLabel}><Badge small outline start>{props.noticeLabel}</Badge></View> : null}
      </View>
      <View testID={id("progress")} style={s.single}>{props.aiActive ? <ProgressText onPress={props.onAIProgressPress} /> : null}</View>
    </View>
  </>;
}
