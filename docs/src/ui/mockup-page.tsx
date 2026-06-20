import { View, Text, useTheme } from "@olympusoss/canvas";
import { Page } from "./page";
import { H2 } from "./prose";
import { PageNav } from "./page-nav";
import { Callout } from "./tokens-kit";
import { Mockup } from "./mockup";
import { geist } from "./fonts";

type DocSection = { title: string; description?: string; anatomy?: string; html: string };

// The shared layout for a pattern or template doc page: a title (.h2, 24/600), a muted
// description, then one section per entry, each a `.h4` heading + muted `.body-sm` blurb
// + Anatomy callout + the live mockup in a bordered `.section-card` stage, with the html
// mockups rendered by <Mockup>.
export function MockupDocPage({ name, description, sections }: { name: string; description: string; sections: DocSection[] }) {
  const { tokens } = useTheme();
  return (
    <Page>
      <View style={{ gap: 28, maxWidth: 960 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: geist("600"), fontSize: 24, letterSpacing: -0.48, color: tokens.foreground }}>{name}</Text>
          <Text style={{ fontFamily: geist("400"), fontSize: 14, lineHeight: 22.4, color: tokens["muted-foreground"], maxWidth: 640 }}>{description}</Text>
        </View>

        {sections.map((s, i) => (
          <View key={i} style={{ gap: 12 }}>
            <H2>{s.title}</H2>
            {s.description ? (
              <Text style={{ fontFamily: geist("400"), fontSize: 13, lineHeight: 20, color: tokens["muted-foreground"], maxWidth: 640 }}>{s.description}</Text>
            ) : null}
            {s.anatomy ? <Callout label="Anatomy.">{s.anatomy}</Callout> : null}
            <View style={{ borderWidth: 1, borderColor: tokens.border, borderRadius: 12, backgroundColor: tokens.card, padding: 24 }}>
              <Mockup html={s.html} />
            </View>
          </View>
        ))}

        <PageNav />
      </View>
    </Page>
  );
}
