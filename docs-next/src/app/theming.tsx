import { Page, PageHeader } from "../ui/page";
import { Section } from "../ui/section";
import { P, InlineCode } from "../ui/prose";
import { CodeBlock } from "../ui/code-block";
import { PageNav } from "../ui/page-nav";

export default function ThemingScreen() {
  return (
    <Page>
      <PageHeader
        title="Theming"
        description="One ThemeProvider drives the color scheme (light / dark) and surface (default / glass). Components read tokens from it — you never restyle per component."
      />

      <Section title="ThemeProvider">
        <P muted>Wrap your app once. Omit the scheme to follow the OS appearance.</P>
        <CodeBlock
          code={`import { ThemeProvider } from "@olympusoss/canvas";

export default function App() {
  return (
    <ThemeProvider scheme="dark" surface="glass">
      <YourApp />
    </ThemeProvider>
  );
}`}
        />
      </Section>

      <Section title="Reading tokens">
        <P muted>
          Build RN style objects from the live tokens with <InlineCode>useTheme()</InlineCode>.
        </P>
        <CodeBlock
          code={`const { tokens, dark } = useTheme();

<View style={{ backgroundColor: tokens.card, borderColor: tokens.border }} />`}
        />
      </Section>

      <Section title="Light, dark & glass">
        <P muted>
          Toggle Solid / Glass and light / dark from the top bar of these docs — every token and component updates live.
          Following Apple's Liquid Glass model, glass makes the functional surfaces (popovers, menus, bars, sheets)
          translucent; content surfaces (cards, lists, tables) stay solid.
        </P>
      </Section>

      <PageNav />
    </Page>
  );
}
