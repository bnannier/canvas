import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { CanvasMark } from "@/components/canvas-mark";
import { Markdown } from "@/components/markdown";
import { COMPONENTS } from "@/data/components";
import {
  Layers, ChevronRight, Plus, Shield, AppWindow,
  Home as HomeIcon, Check, ArrowRight, Globe,
} from "lucide-react";

// lucide-react dropped its brand glyphs, so ship the marks we need inline.
function Github({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.2 11.19.6.11.82-.25.82-.57v-2c-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.33-1.73-1.33-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.23-3.17-.12-.3-.53-1.51.12-3.15 0 0 1-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.3-1.53 3.3-1.21 3.3-1.21.65 1.64.24 2.85.12 3.15.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57C20.57 21.91 24 17.5 24 12.29 24 5.78 18.63.5 12 .5Z" />
    </svg>
  );
}

// Apple mark (iOS). fill=currentColor so it tracks the theme.
function AppleLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
    </svg>
  );
}

// Android robot mark. Uses the brand green so it reads at a glance.
function AndroidLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0729L4.841 5.4207a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396" />
    </svg>
  );
}

const REPO_URL = "https://github.com/OlympusOSS/canvas";
const VERSION = "v5.0.0";

const INSTALL_MD = [
  "```bash",
  "bun add @olympusoss/canvas",
  "```",
  "",
  "```tsx",
  'import "@olympusoss/canvas/styles/canvas.css";',
  'import { Button } from "@olympusoss/canvas";',
  "",
  "// The prop name is the value: <Button primary large />",
  "<Button primary large>Save changes</Button>",
  "<Button destructive>Delete</Button>",
  "<Button ghost small>Cancel</Button>",
  "```",
].join("\n");

const PLATFORMS = ["iOS", "Android", "Web", "React Native Web"];

const PRINCIPLES = [
  {
    title: "Universal React Native",
    body: "One codebase, one component API, every platform. Canvas renders natively on iOS and Android, and on the web through React Native Web. Write a screen once and ship it everywhere, with no per-platform forks to maintain.",
  },
  {
    title: "Responsive, desktop-first",
    body: "Every component is highly responsive by default, authored desktop-first: size for the desktop case, then add the variants that scale it down to tablet and phone. The smallest matching breakpoint wins.",
  },
  {
    title: "Semantic boolean props",
    body: "Change a component's style with flat boolean props. Each choice is its own prop, named for its meaning, so the prop name is the value. You write <Button primary large>, never variant=\"primary\". It reads like a sentence.",
  },
  {
    title: "Tokens, themes, density",
    body: "Built with atomic design and driven by design tokens: light and dark schemes, a glass surface mode, and density controls. Theming is a token change, not a rewrite, so the boolean props stay your only API.",
  },
];

const ATOMIC_LEVELS = [
  {
    id: "tokens", label: "Tokens", icon: Layers,
    blurb: "The lowest-level decisions: color schemes (light and dark), typography, spacing, radii, and density. Every component derives from these tokens, so theming is a token change, not a rewrite.",
    pages: [
      { label: "Colors & Theme", to: "/tokens" },
      { label: "Theming", to: "/theming" },
    ],
  },
  {
    id: "atoms", label: "Atoms", icon: Plus,
    blurb: "Indivisible building blocks like Button, Input, Badge, Icon, and Avatar. One job each, styled entirely through semantic boolean props, every state identical on native and web.",
    pages: [
      { label: "Buttons", to: "/components/button" },
      { label: "Inputs", to: "/components/input" },
      { label: "Badges", to: "/components/badge" },
      { label: "Avatars", to: "/components/avatar" },
    ],
  },
  {
    id: "molecules", label: "Molecules", icon: Shield,
    blurb: "Small compositions of atoms with a single clear purpose: Card, Field, Empty State. Reusable across pages and built from the same boolean prop API.",
    pages: [
      { label: "Cards", to: "/components/card" },
      { label: "Field Display", to: "/components/field" },
      { label: "Empty States", to: "/components/empty-state" },
    ],
  },
  {
    id: "organisms", label: "Organisms", icon: AppWindow,
    blurb: "Self-contained sections of a screen: Data Table, Sidebar, Dialog, Tabs. The larger pieces that adapt desktop-first down to phone and assemble into product surfaces.",
    pages: [
      { label: "Data Tables", to: "/components/data-table" },
      { label: "Sidebar", to: "/components/sidebar" },
      { label: "Dialog", to: "/components/dialog" },
      { label: "Tabs", to: "/components/tabs" },
    ],
  },
  {
    id: "templates", label: "Templates", icon: HomeIcon,
    blurb: "Full screen compositions showing how atoms, molecules, and organisms assemble into real product surfaces, from a dashboard to a sign-in flow.",
    pages: [
      { label: "Dashboard", to: "/templates/dashboard" },
      { label: "Sign In", to: "/templates/signin" },
      { label: "Settings", to: "/templates/settings" },
    ],
  },
  {
    id: "patterns", label: "Patterns", icon: Check,
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
    <div className="landing">
      {/* Hero: split heading + live component window, aurora wash behind. */}
      <section className="landing-hero">
        <div className="landing-aurora" aria-hidden />
        <div className="landing-wrap landing-hero-grid">
          <div className="landing-hero-copy">
            <span className="landing-badge">
              <span className="landing-badge-dot" />
              {VERSION} · @olympusoss/canvas
            </span>
            <h1 className="landing-h1">
              One codebase.{" "}
              <span className="landing-h1-accent">Every platform.</span>{" "}
              One component API.
            </h1>
            <p className="landing-lede">
              Canvas is a universal React Native UI kit. The same components render natively
              on iOS and Android and on the web through React Native Web, styled with flat,
              semantic boolean props that read like a sentence.
            </p>
            <p className="landing-prop-proof">
              <code className="landing-prop-chip">&lt;Button primary large block&gt;</code>
              <span>the prop name is the value.</span>
            </p>
            <div className="landing-cta-row">
              <Link to="/components/button" className="landing-btn landing-btn-primary landing-btn-lg">
                Browse components <ArrowRight size={16} />
              </Link>
              <Link to="/tokens" className="landing-btn landing-btn-outline landing-btn-lg">
                Explore tokens
              </Link>
            </div>
            <div className="landing-checks">
              {PLATFORMS.map((p) => (
                <span key={p} className="landing-check">
                  <Check size={13} /> {p}
                </span>
              ))}
            </div>
          </div>

          {/* Canvas at the core, the platforms it targets orbiting around it:
              the same component API rendered on iOS, Android, and the web. */}
          <div className="landing-hero-showcase">
            <div className="hero-orbit" aria-hidden>
              <span className="hero-orbit-ring" />
              <span className="hero-orbit-core">
                <CanvasMark size={74} />
              </span>
              <span className="orbit-badge orbit-badge-ios" style={{ "--i": 0 } as CSSProperties}>
                <span className="orbit-badge-inner"><AppleLogo size={26} /></span>
              </span>
              <span className="orbit-badge orbit-badge-android" style={{ "--i": 1 } as CSSProperties}>
                <span className="orbit-badge-inner"><AndroidLogo size={26} /></span>
              </span>
              <span className="orbit-badge orbit-badge-web" style={{ "--i": 2 } as CSSProperties}>
                <span className="orbit-badge-inner"><Globe size={25} strokeWidth={1.75} /></span>
              </span>
            </div>
            <p className="landing-window-caption">
              Canvas at the core; iOS, Android, and the web as targets. One component API,
              rendered natively on every platform.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="landing-section landing-wrap">
        <div className="landing-section-head">
          <span className="landing-eyebrow">The system</span>
          <h2 className="landing-section-title">Four principles, one API.</h2>
          <p className="landing-section-desc">
            The non-negotiable rules every component follows, so the styling stays predictable
            from the smallest atom to a full template.
          </p>
        </div>
        <div className="landing-card-grid landing-card-grid-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="landing-card">
              <h3 className="landing-card-title">{p.title}</h3>
              <p className="landing-card-body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Get started */}
      <section className="landing-section landing-wrap">
        <div className="landing-getstarted-grid">
          <div className="landing-section-head landing-getstarted-copy">
            <span className="landing-eyebrow">Get started</span>
            <h2 className="landing-section-title">Three props to a styled button.</h2>
            <p className="landing-section-desc">
              Install the package, import the stylesheet once, and compose. No enum strings,
              no className soup, no platform forks. Style props group into orthogonal axes
              (intent, size, density): pass at most one per axis, stack the rest freely.
            </p>
            <Link to="/integration" className="landing-textlink">
              Read the integration guide <ArrowRight size={15} />
            </Link>
          </div>
          <div className="landing-window">
            <div className="landing-window-bar">
              <span className="landing-window-dots">
                <i /><i /><i />
              </span>
              <span className="landing-window-title">app.tsx</span>
            </div>
            <div className="landing-window-body landing-window-body-code">
              <Markdown source={INSTALL_MD} />
            </div>
          </div>
        </div>
      </section>

      {/* Atomic structure */}
      <section className="landing-section landing-wrap">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Architecture</span>
          <h2 className="landing-section-title">Atomic design, end to end.</h2>
          <p className="landing-section-desc">
            Every page in this site is one of six levels of abstraction, and all {COMPONENTS.length} components
            render as real React Native components, straight from their markdown example docs.
          </p>
        </div>
        <div className="landing-levels">
          {ATOMIC_LEVELS.map((lvl, i) => (
            <div key={lvl.id} className="landing-level">
              <div className="landing-level-index">
                <span className="landing-level-num">0{i + 1}</span>
                <span className="landing-level-name">
                  <lvl.icon size={16} /> {lvl.label}
                </span>
              </div>
              <div className="landing-level-body">
                <p className="landing-level-blurb">{lvl.blurb}</p>
                <div className="landing-level-links">
                  {lvl.pages.map((p) => (
                    <Link key={p.to} to={p.to} className="landing-pill">
                      {p.label} <ChevronRight size={11} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="landing-cta-band">
        <div className="landing-wrap landing-cta-band-inner">
          <h2 className="landing-cta-title">Build your first screen.</h2>
          <p className="landing-cta-sub">
            Browse every component live, copy the JSX, and ship it to iOS, Android, and web.
          </p>
          <div className="landing-cta-row">
            <Link to="/components/button" className="landing-btn landing-btn-primary landing-btn-lg">
              Browse components <ArrowRight size={16} />
            </Link>
            <a className="landing-btn landing-btn-outline landing-btn-lg" href={REPO_URL} target="_blank" rel="noreferrer">
              <Github size={16} /> View on GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-wrap landing-footer-inner">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-brand">
              <CanvasMark size={26} />
              <span className="landing-brand-text">
                <span className="landing-brand-name">Canvas</span>
                <span className="landing-brand-sub">design system</span>
              </span>
            </Link>
            <p className="landing-footer-tag">
              A universal React Native UI kit. Native iOS and Android, plus web.
            </p>
          </div>
          <div className="landing-footer-cols">
            <div className="landing-footer-col">
              <span className="landing-footer-head">Components</span>
              <Link to="/components/button">Buttons</Link>
              <Link to="/components/card">Cards</Link>
              <Link to="/components/data-table">Data Tables</Link>
              <Link to="/components/dialog">Dialog</Link>
            </div>
            <div className="landing-footer-col">
              <span className="landing-footer-head">Foundations</span>
              <Link to="/tokens">Tokens</Link>
              <Link to="/theming">Theming</Link>
              <Link to="/patterns/responsive">Responsive</Link>
              <Link to="/integration">Integration</Link>
            </div>
            <div className="landing-footer-col">
              <span className="landing-footer-head">Project</span>
              <a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://www.npmjs.com/package/@olympusoss/canvas" target="_blank" rel="noreferrer">npm</a>
              <Link to="/compare">Compare</Link>
            </div>
          </div>
        </div>
        <div className="landing-wrap landing-footer-bottom">
          <span>© 2026 Olympus · @olympusoss/canvas {VERSION}</span>
          <span>Universal React Native, native iOS and Android plus web.</span>
        </div>
      </footer>
    </div>
  );
}
