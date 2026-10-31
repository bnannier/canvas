import { PLATFORM_COPY } from "../data/platform-copy";
import { View, Row, Column, Divider, Typography } from "@nannier/canvas";
import { CanvasMark } from "../brand/canvas-mark";
import { FOOTER, SHELL } from "./page-look";

/** The section hand-off's closing brand, direction paragraph and typography credits. */
export function Footer() {
  return (
    <View role="contentinfo" style={{ width: "100%", maxWidth: SHELL.frameMax, paddingTop: FOOTER.top, paddingHorizontal: FOOTER.side, paddingBottom: FOOTER.bottom, gap: FOOTER.ruleGap }}>
      <Divider />
      <Row between wrap loose alignStart>
        <View style={{ gap: 8, maxWidth: 450.203125, flexShrink: 1 }}>
          <Row snug alignCenter><CanvasMark size={22} /><Typography h5 style={{ fontSize: 16, lineHeight: 16, fontWeight: "600", letterSpacing: 0 }}>Canvas v4.0.0 · component library</Typography></Row>
          <Typography small muted style={{ lineHeight: 19.5 }}>{PLATFORM_COPY.footer}</Typography>
        </View>
        <Column compact>
          {[
            "display · Bricolage Grotesque 300–800",
            "ui · Instrument Sans 400–700",
            "mono · JetBrains Mono 400–600",
            "accent · oklch(L C var(--hue))",
          ].map(line => <Typography key={line} caption mono muted style={{ lineHeight: 19.2 }}>{line}</Typography>)}
          <Typography caption mono primary style={{ lineHeight: 19.2 }} href="https://github.com/bnannier/canvas">github.com/bnannier/canvas ↗</Typography>
        </Column>
      </Row>
    </View>
  );
}
