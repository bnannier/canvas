import { Page, PageHeader } from "../ui/page";
import { Section } from "../ui/section";
import { P } from "../ui/prose";
import { CodeBlock } from "../ui/code-block";
import { Table } from "../ui/table";
import { PageNav } from "../ui/page-nav";

export default function IntegrationScreen() {
  return (
    <Page>
      <PageHeader title="Integration" description="Install Canvas and render your first component." />

      <Section title="Install">
        <CodeBlock code={`npm install @olympusoss/canvas react react-native react-native-svg`} />
      </Section>

      <Section title="Quick start">
        <P muted>Wrap your app in the ThemeProvider once, then use components with semantic boolean props.</P>
        <CodeBlock
          code={`import { ThemeProvider, Button } from "@olympusoss/canvas";

export default function App() {
  return (
    <ThemeProvider>
      <Button primary>Save changes</Button>
    </ThemeProvider>
  );
}`}
        />
      </Section>

      <Section title="React Native Web">
        <P muted>
          On the web, alias react-native to react-native-web in your bundler. These docs are the kit itself, running
          universally — native on this device, and on the web through React Native Web.
        </P>
      </Section>

      <Section title="Package exports">
        <Table
          headers={["Entry", "What"]}
          rows={[
            ["@olympusoss/canvas", "Components, primitives, theme, tokens"],
            ["@olympusoss/canvas/styles/*", "The canvas.css token layer (web)"],
          ]}
          mono
        />
      </Section>

      <PageNav />
    </Page>
  );
}
