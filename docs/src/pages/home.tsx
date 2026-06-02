import { Link } from "react-router-dom";
import { CanvasMark } from "@/components/canvas-mark";
import { COMPONENTS } from "@/data/components";
import {
  Layers, CheckCircle, Copy, ChevronRight,
  Plus, Shield, AppWindow, Home as HomeIcon, Check,
} from "lucide-react";

const PRINCIPLES = [
  {
    title: "Tokens first",
    body: "Every value in the system is a token. No hex codes in components. Custom properties are the API, so theming is a single-property change.",
  },
  {
    title: "CSS-first",
    body: "Pure CSS with no framework dependency. Components are CSS classes that compose with any stack. No React, no Tailwind, no build step required.",
  },
  {
    title: "Dual surface",
    body: "Every chrome surface can render solid or glass. Tokens stay the same; glass mode layers an aurora backdrop and backdrop-filter blur over the existing palette.",
  },
  {
    title: "Mobile equal",
    body: "Every layout has a tested phone form. Sidebar becomes a drawer, dense grids stack, tables horizontal-scroll. No desktop-only excuse.",
  },
];

const ATOMIC_LEVELS = [
  {
    id: "tokens",
    label: "Tokens",
    icon: Layers,
    blurb: "The lowest-level decisions: colors, typography, spacing, radii, shadows. Every component derives from these.",
    pages: [
      { label: "Colors & Theme", to: "/tokens" },
      { label: "Theming", to: "/theming" },
    ],
  },
  {
    id: "atoms",
    label: "Atoms",
    icon: Plus,
    blurb: "Indivisible building blocks. One job each, every variant and state documented.",
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
    blurb: "Small compositions of atoms with a clear single purpose. Reusable across pages.",
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
    blurb: "Self-contained sections of a page. Tables, navigation, overlays.",
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
    blurb: "Full page compositions showing how the pieces assemble into product surfaces.",
    pages: [
      { label: "App Shell", to: "/components/app-shell" },
      { label: "Page Header", to: "/components/page-header" },
    ],
  },
  {
    id: "patterns",
    label: "Patterns",
    icon: Check,
    blurb: "Cross-cutting concerns and treatments that span multiple components.",
    pages: [
      { label: "Theming", to: "/theming" },
      { label: "Browser Support", to: "/browser-support" },
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
            color: "hsl(var(--muted-foreground))",
          }}>
            v3.0
          </span>
        </div>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          color: "hsl(var(--foreground))",
          maxWidth: "48rem",
        }}>
          A complete visual language:{" "}
          <span style={{ color: "hsl(var(--primary))" }}>tokens</span>, components, patterns, and page templates.
        </h1>
        <p style={{
          marginTop: "1rem",
          maxWidth: "42rem",
          fontSize: "15px",
          lineHeight: 1.6,
          color: "hsl(var(--muted-foreground))",
        }}>
          A working specification for any product built on the Olympus platform.
          {" "}{COMPONENTS.length} documented components, 7 token files, light/dark mode,
          glass surface, and density controls. No framework required.
        </p>
        <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link to="/components/button" className="btn btn-default">Browse all components</Link>
          <Link to="/tokens" className="btn btn-outline">Start with tokens</Link>
        </div>
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
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              padding: "1.25rem",
            }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: "0.375rem" }}>
                {p.title}
              </div>
              <div style={{ fontSize: "13px", color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
                {p.body}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Atomic structure */}
      <Section
        title="Atomic structure"
        description="The system follows atomic design. Every page in this site is one of six levels of abstraction."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {ATOMIC_LEVELS.map((lvl, i) => (
            <div key={lvl.id} style={{
              borderRadius: "var(--radius-lg, 12px)",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              overflow: "hidden",
            }}>
              <div className="atomic-level-row">
                <div className="atomic-level-index">
                  <span style={{
                    fontSize: "28px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    lineHeight: 1,
                    color: "hsl(var(--muted-foreground) / 0.7)",
                  }}>
                    0{i + 1}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <lvl.icon size={16} />
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "hsl(var(--foreground))" }}>
                      {lvl.label}
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <p style={{
                    margin: 0,
                    fontSize: "13.5px",
                    color: "hsl(var(--muted-foreground))",
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
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--background))",
                          fontSize: "12px",
                          color: "hsl(var(--foreground))",
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
            body="Every token value, every component variant, every state. The single source of truth designers and engineers compare against."
          />
          <FeatureCard
            icon={<CheckCircle size={18} />}
            iconBg="rgb(16 185 129 / 0.1)"
            iconColor="#10b981"
            title="Playground"
            body="Toggle dark mode, glass surface, and density. See every page react live. Useful for evaluating brand options without rebuilding."
          />
          <FeatureCard
            icon={<Copy size={18} />}
            iconBg="rgb(139 92 246 / 0.1)"
            iconColor="#8b5cf6"
            title="Handoff"
            body='Click "Show code" on any example to see the exact class string. Pair this with the integration guide for full implementation guidance.'
          />
        </div>
      </Section>

      {/* Footer */}
      <footer style={{
        marginTop: "3rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid hsl(var(--border))",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "12px",
        color: "hsl(var(--muted-foreground))",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CanvasMark size={16} /> Canvas v3.0
        </div>
        <span style={{ display: "inline-block", margin: "0 0.25rem" }}>·</span>
        <span>CSS-first · Framework-agnostic</span>
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
          color: "hsl(var(--foreground))",
        }}>
          {title}
        </h2>
        {description && (
          <p style={{
            marginTop: "0.25rem",
            marginBottom: 0,
            fontSize: "13.5px",
            color: "hsl(var(--muted-foreground))",
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
      border: "1px solid hsl(var(--border))",
      background: "hsl(var(--card))",
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
        color: "hsl(var(--muted-foreground))",
        lineHeight: 1.6,
      }}>
        {body}
      </p>
    </div>
  );
}
