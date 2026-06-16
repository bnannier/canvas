import { View, Text, useTheme } from "@olympusoss/canvas";
import { MONO } from "./prose";
import { geist } from "./fonts";

// A simple bordered table mirroring the docs `.dt-table`. Cells distribute width evenly;
// the first column reads as the label (foreground), the rest muted. `mono` renders the
// first column monospace. Weight is carried by the Geist family (RN custom fonts do not
// honor fontWeight), so headers use geist("600").
export function Table({ headers, rows, mono }: { headers: string[]; rows: string[][]; mono?: boolean }) {
  const { tokens } = useTheme();
  return (
    <View style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 10, overflow: "hidden" }}>
      <View style={{ flexDirection: "row", backgroundColor: tokens.muted }}>
        {headers.map((h, i) => (
          <View key={i} style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 9 }}>
            <Text style={{ fontFamily: geist("600"), fontSize: 11, letterSpacing: 0.3, color: tokens.foreground }}>{h}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: "row", borderTopWidth: 1, borderColor: tokens.border }}>
          {row.map((cell, i) => (
            <View key={i} style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 9 }}>
              <Text
                style={{
                  fontFamily: mono && i === 0 ? MONO : geist("400"),
                  fontSize: 12,
                  lineHeight: 17,
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
