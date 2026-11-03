import { Accordion, Column } from "@nannier/canvas";

export const Faq = () => (
  <Accordion
    defaultValue="what"
    items={[
      { key: "what", title: "What is Canvas?", content: "A universal React Native UI kit for iOS, Android, and the web." },
      { key: "access", title: "Is it accessible?", content: "Yes. Each header is a button that exposes its expanded state." },
      { key: "theme", title: "Is it themed?", content: "Yes. Every color comes from the active theme tokens." },
    ]}
  />
);

export const MultipleOpen = () => (
  <Accordion
    multiple
    defaultValue={["billing", "security"]}
    items={[
      { key: "billing", title: "Billing", content: "Manage your plan, payment method, and invoices." },
      { key: "team", title: "Team", content: "Invite teammates and set their roles." },
      { key: "security", title: "Security", content: "Two-factor authentication and active sessions." },
    ]}
  />
);

export const Card = () => (
  <Accordion
    card
    defaultValue="ship"
    items={[
      { key: "ship", title: "Shipping", content: "Free 2-day shipping on orders over $50." },
      { key: "return", title: "Returns", content: "30-day returns, no questions asked." },
      { key: "warranty", title: "Warranty", content: "Two years, parts and labor." },
    ]}
  />
);

export const WithDescriptionsAndDisabled = () => (
  <Column cozy>
    <Accordion
      defaultValue="billing"
      items={[
        { key: "billing", title: "Billing", description: "Plan, payment method, invoices.", content: "Manage your plan, payment method, and invoices." },
        { key: "team", title: "Team", description: "Members and roles.", content: "Invite teammates and set their roles." },
      ]}
    />
    <Accordion
      defaultValue="general"
      items={[
        { key: "general", title: "General", content: "Workspace name, language, and time zone." },
        { key: "advanced", title: "Advanced (coming soon)", content: "Not available yet.", disabled: true },
      ]}
    />
  </Column>
);
