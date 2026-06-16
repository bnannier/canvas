import { View, Text, useTheme } from "@olympusoss/canvas";
import { MONO } from "./prose";

// A simple bordered table. Cells distribute width evenly; the first column reads as the
// label (foreground), the rest muted. `mono` renders the first column monospace.
export function Table({ headers, rows, mono }: { headers: string[]; rows: string[][]; mono?: boolean }) {
  const { tokens } = useTheme();
  return (
    <View style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 10, overflow: "hidden" }}>
      <View style={{ flexDirection: "row", backgroundColor: tokens.muted }}>
        {headers.map((h, i) => (
          <View key={i} style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 9 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 0.3, color: tokens.foreground }}>{h}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: "row", borderTopWidth: 1, borderColor: tokens.border }}>
          {row.map((cell, i) => (
            <View key={i} style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 9 }}>
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 17,
                  fontFamily: mono && i === 0 ? MONO : undefined,
                  color: i === 0 ? tokens.foreground : tokens["muted-foreground"],
                }}
              >
                {cell}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
