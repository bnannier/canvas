import { View, Row, Typography, useTheme } from "@nannier/canvas";

/** The compact component-reference footer from Component.dc.html, lines 310–312. */
export function DetailFooter() {
  const { tokens } = useTheme();
  return (
    <View role="contentinfo" style={{ width: "100%", maxWidth: 1440, paddingTop: 64, paddingHorizontal: 32, paddingBottom: 48 }}>
      <View style={{ borderTopWidth: 1, borderColor: tokens.border, paddingTop: 24 }}>
        <Row between wrap relaxed>
          <Typography specMeta mono muted style={{ lineHeight: 19.2 }}>Canvas v4.0.0 · component detail · props and examples read from bnannier/canvas</Typography>
          <Typography specMeta mono muted style={{ lineHeight: 19.2 }}>MIT licensed</Typography>
        </Row>
      </View>
    </View>
  );
}
