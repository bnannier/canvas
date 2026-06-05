import { Link } from "react-router-dom";
import { CanvasMark } from "@/components/canvas-mark";
import { CodeBlock } from "@/components/code-block";
import { COMPONENTS } from "@/data/components";
import {
  Layers, CheckCircle, Copy, ChevronRight,
  Plus, Shield, AppWindow, Home as HomeIcon, Check,
} from "lucide-react";

// The styling API, shown before it is explained. Static illustrative JSX: the
// home page is docs chrome (plain divs + inline styles), not live Canvas
// components, so this is a syntax-highlighted snippet, not a rendered example.
const API_SAMPLE = `import { Card, Field, Button } from "@olympusoss/canvas";

function SaveBar({ saving }) {
  return (
    <Card glass compact>
      <Field label="Workspace name" />
      <Button primary large loading={saving} block>
        Save changes
      </Button>
      <Button ghost small>Cancel</Button>
      <Button destructive>Delete workspace</Button>
    </Card>
  );
}`;

const API_CAPTION =
  "This is the entire styling API. Style props group into orthogonal axes (intent, size, surface, density): within an axis you pass at most one, across axes they stack freely. The same component, the same props, on iOS, Android, and web. No enum strings, no className soup, no platform forks.";

const PRINCIPLES = [
  {
    title: "Universal React Native",
    body: "One codebase, one component API, every platform. Canvas renders natively on iOS and Android, and on the web through React Native Web. You write a screen once and ship it everywhere; the same Button and Card components run wherever your app runs, with no per-platform forks to maintain.",
  },
  {
    title: "Responsive, desktop-first",
    body: "Every component is highly responsive by default, authored desktop-first: lay out and size for the desktop case, then add responsive variants that scale it down to tablet and phone. This is the inverse of mobile-first. Breakpoint variants apply at a given width and below, so the smallest matching variant wins.",
  },
  {
    title: "Semantic boolean props",
    body: "Change a component's style with flat boolean props. Each style choice is its own prop, named for its meaning; passing the prop turns it on, so the prop name is the value. You write <Button primary large>, never <Button variant=\"primary\" size=\"lg\">. String-valued enum props (variant, size, tone, surface) are rejected. It reads like natural language.",
  },
  {
    title: "Tokens, themes, and atomic design",
    body: "Built with atomic design (Atoms, Molecules, Organisms, plus Templates and Patterns), all driven by design tokens: light and dark color schemes, a glass surface mode, and density controls. Theming is a token change, not a rewrite. An in-house engine resolves it under the hood; the boolean props stay your only API.",
  },
];

const ATOMIC_LEVELS = [
  {
    id: "tokens",
    label: "Tokens",
    icon: Layers,
    blurb: "The lowest-level decisions: color schemes (light and dark), typography, spacing, radii, and density. Every component derives from these tokens, so theming is a token change, not a rewrite.",
    pages: [
      { label: "Colors & Theme", to: "/tokens" },
      { label: "Theming", to: "/theming" },
    ],
  },
  {
    id: "atoms",
    label: "Atoms",
    icon: Plus,
    blurb: "Indivisible building blocks like Button, Input, Badge, Icon, and Avatar. One job each, styled entirely through semantic boolean props, every state documented and identical on native and web.",
    pages: [
      { label: "Buttons", to: "/components/button" },
      { label: "Inputs", to: "/components/input" },
      { label: "Badges", to: "/components/badge" },
      { label: "Icons", to: "/components/icon" },
      { label: "Avatars", to: "/components/avatar" },
    ],
  },
  {
    id: "molecules",
    label: "Molecules",
    icon: Shield,
    blurb: "Small compositions of atoms with a single clear purpose: Card, Field, Empty State. Reusable across pages and built from the same boolean prop API.",
    pages: [
      { label: "Cards", to: "/components/card" },
      { label: "Field Display", to: "/components/field" },
      { label: "Empty States", to: "/components/empty-state" },
    ],
  },
  {
    id: "organisms",
    label: "Organisms",
    icon: AppWindow,
    blurb: "Self-contained sections of a screen: Data Table, Sidebar, Dialog, Tabs. The larger pieces that adapt desktop-first down to phone and assemble into product surfaces.",
    pages: [
      { label: "Data Tables", to: "/components/data-table" },
      { label: "Sidebar", to: "/components/sidebar" },
      { label: "Dialog", to: "/components/dialog" },
      { label: "Tabs", to: "/components/tabs" },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    icon: HomeIcon,
    blurb: "Full screen compositions showing how atoms, molecules, and organisms assemble into real product surfaces, from a dashboard to a sign-in flow.",
    pages: [
      { label: "Dashboard", to: "/templates/dashboard" },
      { label: "Sign In", to: "/templates/signin" },
      { label: "Settings", to: "/templates/settings" },
    ],
  },
  {
    id: "patterns",
    label: "Patterns",
    icon: Check,
    blurb: "Cross-cutting treatments that span many components: responsive layout, glass surfaces, density, loading, form validation, and accessibility.",
    pages: [
      { label: "Responsive", to: "/patterns/responsive" },
      { label: "Glass", to: "/patterns/glass" },
      { label: "Density", to: "/patterns/density" },
    ],
  },
];

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={{ marginBottom: "2.5rem", paddingTop: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <CanvasMark size={36} />
          <span style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--muted-foreground)",
          }}>
            v3.2.1 · @olympusoss/canvas
          </span>
        </div>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          color: "var(--foreground)",
          maxWidth: "48rem",
        }}>
          One codebase.{" "}
          <span style={{ color: "var(--primary)" }}>Every platform.</span>{" "}
          One component API.
        </h1>
        <p style={{
          marginTop: "1rem",
          maxWidth: "44rem",
          fontSize: "15px",
          lineHeight: 1.6,
          color: "var(--muted-foreground)",
        }}>
          Canvas is a Universal React Native UI kit, published as{" "}
          <code style={{ fontSize: "13px" }}>@olympusoss/canvas</code>. It runs natively on iOS and Android
          and on the web through React Native Web, so the same components ship everywhere with no per-platform
          forks. You style them with flat, semantic boolean props that read like a sentence, theme them from
          design tokens, and watch all {COMPONENTS.length} components render live in the playground as real
          React Native components. Read the snippet below; that is the whole API.
        </p>
        <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link to="/components" className="btn btn-default">Browse all components</Link>
          <Link to="/tokens" className="btn btn-outline">Start with tokens</Link>
        </div>
      </section>

      {/* The API, shown before it is told */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{
          borderRadius: "var(--radius-lg, 12px)",
          border: "1px solid var(--border)",
          background: "var(--card)",
          overflow: "hidden",
        }}>
          <CodeBlock code={API_SAMPLE} language="tsx" />
        </div>
        <p style={{
          marginTop: "0.75rem",
          marginBottom: 0,
          maxWidth: "44rem",
          fontSize: "13px",
          lineHeight: 1.6,
          color: "var(--muted-foreground)",
        }}>
          {API_CAPTION}
        </p>
      </section>

      {/* Principles */}
      <Section title="Principles" description="The non-negotiable rules of the system.">
        <div style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}>
          {PRINCIPLES.map((p) => (
            <div key={p.title} style={{
              borderRadius: "var(--radius-lg, 12px)",
              border: "1px solid var(--border)",
              background: "var(--card)",
              padding: "1.25rem",
            }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.375rem" }}>
                {p.title}
              </div>
              <div style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                {p.body}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Atomic structure */}
      <Section
        title="Atomic structure"
        description="The system follows atomic design. Every page in this site is one of six levels of abstraction, and every component renders as a real React Native component."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {ATOMIC_LEVELS.map((lvl, i) => (
            <div key={lvl.id} style={{
              borderRadius: "var(--radius-lg, 12px)",
              border: "1px solid var(--border)",
              background: "var(--card)",
              overflow: "hidden",
            }}>
              <div className="atomic-level-row">
                <div className="atomic-level-index">
                  <span style={{
                    fontSize: "28px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    lineHeight: 1,
                    color: "color-mix(in oklch, var(--muted-foreground) 70%, transparent)",
                  }}>
                    0{i + 1}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <lvl.icon size={16} />
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--foreground)" }}>
                      {lvl.label}
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <p style={{
                    margin: 0,
                    fontSize: "13.5px",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.6,
                    maxWidth: "42rem",
                  }}>
                    {lvl.blurb}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {lvl.pages.map((p) => (
                      <Link
                        key={p.to}
                        to={p.to}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0.625rem",
                          borderRadius: "9999px",
                          border: "1px solid var(--border)",
                          background: "var(--background)",
                          fontSize: "12px",
                          color: "var(--foreground)",
                          textDecoration: "none",
                          transition: "background 150ms",
                        }}
                      >
                        {p.label}
                        <ChevronRight size={11} />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* What lives here */}
      <Section title="What lives here">
        <div style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}>
          <FeatureCard
            icon={<Layers size={18} />}
            iconBg="rgb(59 130 246 / 0.1)"
            iconColor="#3b82f6"
            title="Reference"
            body="Every token value, every component, every state, documented and rendered live as real React Native components. The single source of truth designers and engineers compare against, with the semantic boolean prop for each variation spelled out."
          />
          <FeatureCard
            icon={<CheckCircle size={18} />}
            iconBg="rgb(16 185 129 / 0.1)"
            iconColor="#10b981"
            title="Playground"
            body={`Toggle dark mode, the glass surface, and density, then resize to watch each page respond desktop-first. All ${COMPONENTS.length} components render as real React Native components, so what you see is exactly what ships to native and web.`}
          />
          <FeatureCard
            icon={<Copy size={18} />}
            iconBg="rgb(139 92 246 / 0.1)"
            iconColor="#8b5cf6"
            title="Handoff"
            body="Click Show code on any example to see idiomatic JSX with its semantic boolean props, ready to paste. Pair it with the integration guide for end-to-end implementation across native and web."
          />
        </div>
      </Section>

      {/* Footer */}
      <footer style={{
        marginTop: "3rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "12px",
        color: "var(--muted-foreground)",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CanvasMark size={16} /> Canvas v3.2.1
        </div>
        <span style={{ display: "inline-block", margin: "0 0.25rem" }}>·</span>
        <span>@olympusoss/canvas</span>
        <span style={{ display: "inline-block", margin: "0 0.25rem" }}>·</span>
        <span>Universal React Native, native iOS and Android plus web</span>
      </footer>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <header style={{ marginBottom: "1rem" }}>
        <h2 style={{
          margin: 0,
          fontSize: "20px",
          fontWeight: 600,
          letterSpacing: "-0.015em",
          color: "var(--foreground)",
        }}>
          {title}
        </h2>
        {description && (
          <p style={{
            marginTop: "0.25rem",
            marginBottom: 0,
            fontSize: "13.5px",
            color: "var(--muted-foreground)",
            maxWidth: "640px",
            lineHeight: 1.6,
          }}>
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function FeatureCard({ icon, iconBg, iconColor, title, body }: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
}) {
  return (
    <div style={{
      borderRadius: "var(--radius-lg, 12px)",
      border: "1px solid var(--border)",
      background: "var(--card)",
      padding: "1.25rem",
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: iconBg,
        color: iconColor,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "0.75rem",
      }}>
        {icon}
      </div>
      <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "0.25rem" }}>{title}</div>
      <p style={{
        margin: 0,
        fontSize: "13px",
        color: "var(--muted-foreground)",
        lineHeight: 1.6,
      }}>
        {body}
      </p>
    </div>
  );
}
