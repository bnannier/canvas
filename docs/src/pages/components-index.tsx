import { Link } from "react-router-dom";
import { NAV_GROUPS } from "@/layout/sidebar";
import { CanvasMark } from "@/components/canvas-mark";
import { PageNav } from "@/components/page-nav";
import { ChevronRight, ChevronLeft } from "lucide-react";

const CATEGORY_IDS = ["Tokens", "Atoms", "Molecules", "Organisms", "Templates", "Patterns"];

function Tile({ title, to, span, children }: {
  title: string;
  to: string;
  span?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      style={{
        borderRadius: "var(--radius-xl, 12px)",
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        overflow: "hidden",
        textDecoration: "none",
        color: "hsl(var(--foreground))",
        display: "block",
        gridColumn: span === 2 ? "span 2" : undefined,
      }}
      className="docs-tile"
    >
      <div style={{
        aspectRatio: "16 / 9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(var(--muted) / 0.3)",
        borderBottom: "1px solid hsl(var(--border))",
        padding: 16,
        overflow: "hidden",
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
        }}>
          {children}
        </div>
      </div>
      <div style={{
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ fontSize: "12.5px", fontWeight: 500 }}>{title}</div>
        <ChevronRight size={12} style={{ color: "hsl(var(--muted-foreground))" }} />
      </div>
    </Link>
  );
}

function CatGroup({ id, label, count, children }: {
  id: string;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: 40, scrollMarginTop: 80 }}>
      <div style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 12,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}>
          {label}
        </h2>
        <span style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "hsl(var(--muted-foreground))",
          fontWeight: 500,
        }}>
          {count} components
        </span>
      </div>
      <div style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(3, 1fr)",
      }}>
        {children}
      </div>
    </section>
  );
}

const gradients = [
  "linear-gradient(135deg, hsl(240 70% 55%), hsl(280 70% 55%))",
  "linear-gradient(135deg, hsl(271 70% 55%), hsl(310 70% 55%))",
  "linear-gradient(135deg, hsl(173 70% 55%), hsl(200 70% 55%))",
  "linear-gradient(135deg, hsl(346 70% 55%), hsl(30 70% 55%))",
];

export function ComponentsIndex() {
  const groups = NAV_GROUPS.filter((g) => CATEGORY_IDS.includes(g.label));
  const totalCount = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div>
      {/* Sticky category anchor bar */}
      <div style={{
        position: "sticky",
        top: 56,
        zIndex: 10,
        marginLeft: -28,
        marginRight: -28,
        marginTop: -24,
        paddingLeft: 28,
        paddingRight: 28,
        paddingTop: 12,
        paddingBottom: 12,
        marginBottom: 20,
        borderBottom: "1px solid hsl(var(--border))",
        background: "hsl(var(--background) / 0.8)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: -4,
        }}>
          {CATEGORY_IDS.map((id) => (
            <a
              key={id}
              href={`#${id.toLowerCase()}`}
              style={{
                flexShrink: 0,
                padding: "4px 12px",
                borderRadius: 9999,
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                fontSize: "12px",
                fontWeight: 500,
                color: "hsl(var(--foreground))",
                textDecoration: "none",
              }}
            >
              {id}
            </a>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{
            fontSize: "11px",
            color: "hsl(var(--muted-foreground))",
            alignSelf: "center",
            paddingRight: 4,
            whiteSpace: "nowrap",
          }}>
            {totalCount} components
          </span>
        </div>
      </div>

      <p style={{
        marginBottom: 24,
        maxWidth: "42rem",
        fontSize: "13px",
        color: "hsl(var(--muted-foreground))",
        lineHeight: 1.6,
      }}>
        A live catalog of every component in the Canvas design system. Each tile is the real
        component rendered with the current theme. Click a tile to open its full reference.
      </p>

      {/* ─── Tokens ─────────────────────────────────────────── */}
      <CatGroup id="tokens" label="Tokens" count={3}>
        <Tile title="Colors & Theme" to="/tokens">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, width: "100%", maxWidth: 220 }}>
            {[
              "hsl(var(--primary))", "hsl(var(--card))", "hsl(var(--muted))",
              "hsl(var(--accent))", "hsl(var(--foreground))", "hsl(var(--destructive))",
              "hsl(var(--secondary))", "hsl(var(--popover))", "hsl(var(--background))",
              "hsl(var(--ring))", "hsl(var(--input))", "hsl(var(--border))",
            ].map((c, i) => (
              <div key={i} style={{
                height: 28,
                borderRadius: "var(--radius-sm, 4px)",
                background: c,
                border: "1px solid hsl(var(--border))",
              }} />
            ))}
          </div>
        </Tile>
        <Tile title="Spacing & Shape" to="/tokens/spacing">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
            {[12, 16, 20, 24, 28].map((n) => (
              <div key={n} style={{
                width: n,
                height: n,
                borderRadius: "var(--radius-md, 6px)",
                background: "hsl(var(--primary) / 0.25)",
                border: "1px solid hsl(var(--primary) / 0.4)",
              }} />
            ))}
          </div>
        </Tile>
        <Tile title="Typography" to="/tokens/typography">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>Aa</div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", lineHeight: 1.2 }}>JetBrains</div>
          </div>
        </Tile>
      </CatGroup>

      {/* ─── Atoms ──────────────────────────────────────────── */}
      <CatGroup id="atoms" label="Atoms" count={19}>
        <Tile title="Avatars" to="/components/avatar">
          <div style={{ display: "flex" }}>
            {["AL", "GH", "RC", "LB"].map((s, i) => (
              <div key={s} style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 600,
                border: "2px solid hsl(var(--background))",
                background: gradients[i],
                marginLeft: i > 0 ? -8 : 0,
                zIndex: 10 - i,
              }}>
                {s}
              </div>
            ))}
          </div>
        </Tile>
        <Tile title="Badges" to="/components/badge">
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 4 }}>
              <span className="badge badge-default">Default</span>
              <span className="badge badge-secondary">Tag</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <span className="status-badge" data-status="success">Active</span>
              <span className="status-badge" data-status="warning">Pending</span>
            </div>
          </div>
        </Tile>
        <Tile title="Breadcrumbs" to="/components/breadcrumb">
          <nav style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>Projects</span>
            <ChevronRight size={10} />
            <span style={{ color: "hsl(var(--muted-foreground))" }}>Identity</span>
            <ChevronRight size={10} />
            <span style={{ fontWeight: 500 }}>Profile</span>
          </nav>
        </Tile>
        <Tile title="Button Groups" to="/components/button-group">
          <div style={{
            display: "inline-flex",
            borderRadius: "var(--radius-md, 6px)",
            border: "1px solid hsl(var(--input))",
            background: "hsl(var(--card))",
            padding: 2,
          }}>
            <span style={{
              padding: "2px 8px",
              fontSize: 11,
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              borderRadius: "var(--radius-sm, 4px)",
            }}>Day</span>
            <span style={{ padding: "2px 8px", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>Week</span>
            <span style={{ padding: "2px 8px", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>Month</span>
          </div>
        </Tile>
        <Tile title="Buttons" to="/components/button">
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-default btn-sm">Save</button>
            <button className="btn btn-outline btn-sm">Cancel</button>
          </div>
        </Tile>
        <Tile title="Checkboxes" to="/components/checkbox">
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" defaultChecked style={{ width: 14, height: 14, accentColor: "hsl(var(--primary))" }} />
              Option A
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" style={{ width: 14, height: 14, accentColor: "hsl(var(--primary))" }} />
              Option B
            </label>
          </div>
        </Tile>
        <Tile title="Comboboxes" to="/components/combobox">
          <div style={{ position: "relative", width: "100%", maxWidth: 180 }}>
            <input className="input" placeholder="Search…" style={{ height: 32, fontSize: 12, paddingRight: 28 }} />
            <div style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              color: "hsl(var(--muted-foreground))",
              pointerEvents: "none",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </Tile>
        <Tile title="Dividers" to="/components/separator">
          <div style={{ width: "100%", maxWidth: 180 }}>
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginBottom: 8 }}>Above</div>
            <hr className="sep" />
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginTop: 8 }}>Below</div>
          </div>
        </Tile>
        <Tile title="Dropdowns" to="/components/dropdown">
          <div style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md, 6px)",
            padding: 4,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            minWidth: 120,
            fontSize: 11,
          }}>
            <div style={{ padding: "4px 8px", borderRadius: "var(--radius-sm, 4px)" }}>Edit</div>
            <div style={{ padding: "4px 8px", borderRadius: "var(--radius-sm, 4px)" }}>Copy</div>
            <div style={{ padding: "4px 8px", borderRadius: "var(--radius-sm, 4px)", color: "hsl(var(--destructive))" }}>Delete</div>
          </div>
        </Tile>
        <Tile title="Icons" to="/components/icon">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            {[
              "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
              "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4-4v2",
              "M22 12h-4l-3 9L9 3l-3 9H2",
              "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
              "M12 2L2 7l10 5 10-5-10-5z",
              "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
              "M15.5 7.5l-7 7M21 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z",
              "M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8",
              "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51",
              "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",
              "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
              "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707",
            ].map((d, i) => (
              <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={d} />
              </svg>
            ))}
          </div>
        </Tile>
        <Tile title="Input Groups" to="/components/input-group">
          <div style={{ display: "flex", width: "100%", maxWidth: 200 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0 8px",
              borderRadius: "var(--radius-md, 6px) 0 0 var(--radius-md, 6px)",
              border: "1px solid hsl(var(--input))",
              borderRight: 0,
              background: "hsl(var(--muted))",
              fontSize: 10,
              color: "hsl(var(--muted-foreground))",
            }}>
              https://
            </span>
            <input className="input" defaultValue="example.com" style={{
              height: 32,
              fontSize: 12,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }} />
          </div>
        </Tile>
        <Tile title="Inputs & Forms" to="/components/input">
          <input className="input" placeholder="email@example.com" style={{ height: 32, fontSize: 12, width: "100%", maxWidth: 180 }} />
        </Tile>
        <Tile title="Pagination" to="/components/pagination">
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="btn btn-ghost btn-sm" style={{ height: 28, width: 28, padding: 0 }}>
              <ChevronLeft size={12} />
            </button>
            <button className="btn btn-ghost btn-sm" style={{ height: 28, width: 28, padding: 0, fontSize: 11 }}>1</button>
            <button className="btn btn-default btn-sm" style={{ height: 28, width: 28, padding: 0, fontSize: 11 }}>2</button>
            <button className="btn btn-ghost btn-sm" style={{ height: 28, width: 28, padding: 0, fontSize: 11 }}>3</button>
            <button className="btn btn-ghost btn-sm" style={{ height: 28, width: 28, padding: 0 }}>
              <ChevronRight size={12} />
            </button>
          </nav>
        </Tile>
        <Tile title="Radios" to="/components/radio">
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="radio" name="tile-radio" defaultChecked style={{ width: 14, height: 14, accentColor: "hsl(var(--primary))" }} />
              Pro
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="radio" name="tile-radio" style={{ width: 14, height: 14, accentColor: "hsl(var(--primary))" }} />
              Hobby
            </label>
          </div>
        </Tile>
        <Tile title="Selects" to="/components/select">
          <select className="input" style={{ height: 32, fontSize: 12, width: "100%", maxWidth: 160 }}>
            <option>United States</option>
          </select>
        </Tile>
        <Tile title="Skeletons" to="/components/skeleton">
          <div style={{ width: "100%", maxWidth: 180, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "hsl(var(--muted) / 0.6)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 8, background: "hsl(var(--muted) / 0.6)", borderRadius: 4, animation: "pulse 2s ease-in-out infinite" }} />
              <div style={{ height: 8, width: "75%", background: "hsl(var(--muted) / 0.6)", borderRadius: 4, animation: "pulse 2s ease-in-out infinite" }} />
            </div>
          </div>
        </Tile>
        <Tile title="Textareas" to="/components/textarea">
          <textarea className="input" placeholder="Description…" style={{
            minHeight: 40,
            padding: 8,
            resize: "none",
            fontSize: 12,
            width: "100%",
            maxWidth: 180,
          }} />
        </Tile>
        <Tile title="Toggles" to="/components/switch">
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{
              position: "relative",
              display: "inline-flex",
              height: 20,
              width: 36,
              borderRadius: 9999,
              background: "hsl(var(--primary))",
            }}>
              <span style={{
                height: 16,
                width: 16,
                borderRadius: "50%",
                background: "hsl(var(--background))",
                boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)",
                transform: "translateX(16px)",
                marginTop: 2,
                marginLeft: 2,
              }} />
            </div>
            <div style={{
              position: "relative",
              display: "inline-flex",
              height: 20,
              width: 36,
              borderRadius: 9999,
              background: "hsl(var(--muted))",
            }}>
              <span style={{
                height: 16,
                width: 16,
                borderRadius: "50%",
                background: "hsl(var(--background))",
                boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)",
                transform: "translateX(0px)",
                marginTop: 2,
                marginLeft: 2,
              }} />
            </div>
          </div>
        </Tile>
        <Tile title="Tooltips" to="/components/tooltip">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{
              padding: "4px 8px",
              borderRadius: "var(--radius-sm, 4px)",
              background: "hsl(var(--foreground))",
              color: "hsl(var(--background))",
              fontSize: 10,
            }}>Tooltip</span>
            <svg width="10" height="6" viewBox="0 0 10 6">
              <polygon points="0,0 10,0 5,6" fill="hsl(var(--foreground))" />
            </svg>
            <button className="btn btn-outline btn-sm">Hover me</button>
          </div>
        </Tile>
      </CatGroup>

      {/* ─── Molecules ──────────────────────────────────────── */}
      <CatGroup id="molecules" label="Molecules" count={12}>
        <Tile title="Action Panels" to="/components/action-panels">
          <div className="section-card" style={{ width: "100%", maxWidth: 220, padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Delete account</div>
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginBottom: 8 }}>Permanent and irreversible.</div>
            <button className="btn btn-sm" style={{
              background: "hsl(var(--destructive))",
              color: "#fff",
              border: "1px solid hsl(var(--destructive))",
              height: 24,
              fontSize: 10,
              padding: "0 8px",
            }}>Delete</button>
          </div>
        </Tile>
        <Tile title="Alerts" to="/components/alert">
          <div style={{ width: "100%", maxWidth: 220, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{
              borderRadius: "var(--radius-sm, 4px)",
              border: "1px solid hsl(38 92% 50% / 0.3)",
              background: "hsl(38 92% 50% / 0.10)",
              padding: "4px 8px",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="hsl(38 92% 45%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Warning
            </div>
            <div style={{
              borderRadius: "var(--radius-sm, 4px)",
              border: "1px solid hsl(143 70% 45% / 0.3)",
              background: "hsl(143 70% 45% / 0.08)",
              padding: "4px 8px",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="hsl(143 70% 40%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              All set
            </div>
          </div>
        </Tile>
        <Tile title="Cards" to="/components/card">
          <div style={{ width: "100%", maxWidth: 220 }}>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-header">
                <span className="stat-card-label">Users</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "hsl(var(--muted-foreground))" }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="stat-card-value">12.3k</div>
              <div className="stat-card-delta" data-trend="up">+8%</div>
            </div>
          </div>
        </Tile>
        <Tile title="Description Lists" to="/components/description-lists">
          <dl style={{ fontSize: 11, width: "100%", maxWidth: 220, margin: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", padding: "4px 0" }}>
              <dt style={{ color: "hsl(var(--muted-foreground))" }}>Name</dt>
              <dd style={{ margin: 0 }}>Ada Lovelace</dd>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", padding: "4px 0", borderTop: "1px solid hsl(var(--border))" }}>
              <dt style={{ color: "hsl(var(--muted-foreground))" }}>Email</dt>
              <dd style={{ margin: 0 }}>ada@...</dd>
            </div>
          </dl>
        </Tile>
        <Tile title="Empty States" to="/components/empty-state">
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: 16,
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-xl, 12px)",
            background: "hsl(var(--card))",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div style={{ fontSize: 12, fontWeight: 600 }}>No items</div>
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>Create one to start.</div>
          </div>
        </Tile>
        <Tile title="Feeds" to="/components/feeds">
          <div style={{ width: "100%", maxWidth: 220, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { icon: "M12 5v14M5 12h14", label: "created", color: "hsl(var(--primary))" },
              { icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", label: "commented", color: "hsl(var(--primary))" },
              { icon: "M20 6L9 17l-5-5", label: "merged", color: "hsl(var(--primary))" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "hsl(var(--primary) / 0.15)",
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                </div>
                <div style={{ fontSize: 10, flex: 1 }}>
                  <b>Ada</b>{" "}
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </Tile>
        <Tile title="Field Display" to="/components/field">
          <div style={{ width: "100%", maxWidth: 220 }}>
            <div className="field" style={{ padding: 8 }}>
              <div className="field-label" style={{ fontSize: 11 }}>ID</div>
              <div className="field-value" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>01HZ8X4M...</div>
            </div>
          </div>
        </Tile>
        <Tile title="Form Layouts" to="/components/form">
          <div style={{ width: "100%", maxWidth: 200, display: "flex", flexDirection: "column", gap: 6 }}>
            <input className="input" placeholder="Name" style={{ height: 28, fontSize: 12 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <input className="input" placeholder="First" style={{ height: 28, fontSize: 12 }} />
              <input className="input" placeholder="Last" style={{ height: 28, fontSize: 12 }} />
            </div>
          </div>
        </Tile>
        <Tile title="Grid Lists" to="/components/grid-lists">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, width: "100%", maxWidth: 220 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: "var(--radius-sm, 4px)", background: "hsl(var(--muted) / 0.6)" }} />
            ))}
          </div>
        </Tile>
        <Tile title="Media Objects" to="/components/media-objects">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, width: "100%", maxWidth: 220 }}>
            <span className="avatar" style={{ width: 32, height: 32, fontSize: 10 }}>AL</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>Ada Lovelace</div>
              <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>Principal eng.</div>
            </div>
          </div>
        </Tile>
        <Tile title="Stacked Lists" to="/components/stacked-lists">
          <div className="section-card" style={{ width: "100%", maxWidth: 220 }}>
            {["AL", "GH", "LB"].map((s, i) => (
              <div key={s} style={{
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderTop: i > 0 ? "1px solid hsl(var(--border))" : undefined,
              }}>
                <span className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{s}</span>
                <div style={{ fontSize: 10, flex: 1, minWidth: 0 }}>
                  {s === "AL" ? "Ada Lovelace" : s === "GH" ? "Grace Hopper" : "Linus Berg"}
                </div>
              </div>
            ))}
          </div>
        </Tile>
        <Tile title="Stats" to="/components/stats">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, width: "100%", maxWidth: 220 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>Users</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>71.8k</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>Revenue</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>$58</div>
            </div>
          </div>
        </Tile>
      </CatGroup>

      {/* ─── Organisms ──────────────────────────────────────── */}
      <CatGroup id="organisms" label="Organisms" count={10}>
        <Tile title="Calendars" to="/components/calendar">
          <div style={{ width: "100%", maxWidth: 160, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} style={{
                aspectRatio: "1",
                fontSize: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-sm, 4px)",
                background: i === 14 ? "hsl(var(--primary))" : i % 3 === 0 ? "hsl(var(--accent))" : undefined,
                color: i === 14 ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                fontWeight: i === 14 ? 600 : undefined,
              }}>
                {i + 1}
              </div>
            ))}
          </div>
        </Tile>
        <Tile title="Charts" to="/components/charts">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: "100%", maxWidth: 200, height: 40 }}>
            <polyline
              points="0,24 10,20 20,22 30,14 40,16 50,10 60,12 70,6 80,8 90,4 100,2"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </Tile>
        <Tile title="Command Palette" to="/components/command">
          <div style={{
            width: "100%",
            maxWidth: 220,
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md, 6px)",
            boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)",
            fontSize: 10,
          }}>
            <div style={{
              padding: "4px 8px",
              borderBottom: "1px solid hsl(var(--border))",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span style={{ color: "hsl(var(--muted-foreground))" }}>Search...</span>
              <span className="kbd" style={{ marginLeft: "auto", fontSize: 9 }}>&#8984;K</span>
            </div>
            <div style={{ padding: 4 }}>
              <div style={{ padding: "2px 6px", background: "hsl(var(--accent))", borderRadius: "var(--radius-sm, 4px)" }}>Go to Dashboard</div>
              <div style={{ padding: "2px 6px" }}>Identities</div>
            </div>
          </div>
        </Tile>
        <Tile title="Data Tables" to="/components/data-table" span={2}>
          <div className="dt-wrap" style={{ width: "100%", maxWidth: 380, overflow: "hidden" }}>
            <table className="dt-table" style={{ fontSize: 10 }}>
              <thead>
                <tr><th>Name</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>ada@ex.com</td><td><span className="status-badge" data-status="success">Active</span></td></tr>
                <tr><td>grace@ex.com</td><td><span className="status-badge" data-status="success">Active</span></td></tr>
              </tbody>
            </table>
          </div>
        </Tile>
        <Tile title="Filter Panels" to="/components/filter-panel">
          <div className="section-card" style={{ width: "100%", maxWidth: 180, padding: 8, fontSize: 10 }}>
            <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.05em", color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>Status</div>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" defaultChecked style={{ width: 12, height: 12, accentColor: "hsl(var(--primary))" }} />Active
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" style={{ width: 12, height: 12, accentColor: "hsl(var(--primary))" }} />Inactive
            </label>
          </div>
        </Tile>
        <Tile title="Navbars" to="/components/navbars">
          <div style={{
            width: "100%",
            maxWidth: 260,
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md, 6px)",
            overflow: "hidden",
          }}>
            <div style={{
              height: 36,
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "hsl(var(--card))",
              borderBottom: "1px solid hsl(var(--border))",
            }}>
              <CanvasMark size={16} />
              <span style={{ fontWeight: 600, fontSize: 10 }}>Canvas</span>
              <div style={{ flex: 1 }} />
              <span className="avatar" style={{ width: 24, height: 24, fontSize: 9 }}>AL</span>
            </div>
          </div>
        </Tile>
        <Tile title="Navigation" to="/components/sidebar">
          <div style={{
            width: "100%",
            maxWidth: 160,
            background: "hsl(var(--sidebar-background, var(--card)))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md, 6px)",
            padding: 6,
            fontSize: 10,
          }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", color: "hsl(var(--muted-foreground))", padding: "0 4px", marginBottom: 2 }}>Identity</div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px",
              borderRadius: "var(--radius-sm, 4px)",
              background: "hsl(var(--accent))",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Identities
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px",
              borderRadius: "var(--radius-sm, 4px)",
              color: "hsl(var(--muted-foreground))",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Sessions
            </div>
          </div>
        </Tile>
        <Tile title="Overlays" to="/components/dialog">
          <div style={{ position: "relative", width: "100%", maxWidth: 200, height: 64 }}>
            <div style={{ borderRadius: "var(--radius-md, 6px)", background: "hsl(var(--muted) / 0.4)", height: "100%" }} />
            <div style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-md, 6px)",
              padding: 4,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: 10,
            }}>
              <div style={{ padding: "2px 6px", borderRadius: "var(--radius-sm, 4px)" }}>Edit</div>
              <div style={{ padding: "2px 6px", borderRadius: "var(--radius-sm, 4px)" }}>Copy</div>
            </div>
          </div>
        </Tile>
        <Tile title="Steppers" to="/components/stepper">
          <ol style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 220, margin: 0, padding: 0, listStyle: "none" }}>
            {[true, true, false, false].map((done, i, arr) => (
              <li key={i} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : undefined }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 600,
                  background: done ? "hsl(var(--primary))" : i === 2 ? "transparent" : "hsl(var(--muted))",
                  color: done ? "hsl(var(--primary-foreground))" : i === 2 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  border: i === 2 ? "2px solid hsl(var(--primary))" : undefined,
                }}>
                  {done ? (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : i + 1}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ flex: 1, height: 2, margin: "0 4px", background: done ? "hsl(var(--primary))" : "hsl(var(--muted))" }} />
                )}
              </li>
            ))}
          </ol>
        </Tile>
        <Tile title="Tabs" to="/components/tabs">
          <div style={{ width: "100%", maxWidth: 260, display: "flex", gap: 2, borderBottom: "1px solid hsl(var(--border))" }}>
            {["Overview", "Activity", "Settings"].map((t, i) => (
              <div key={t} style={{
                padding: "6px 8px",
                fontSize: 10,
                marginBottom: -1,
                borderBottom: i === 0 ? "2px solid hsl(var(--foreground))" : undefined,
                fontWeight: i === 0 ? 600 : undefined,
                color: i === 0 ? undefined : "hsl(var(--muted-foreground))",
              }}>{t}</div>
            ))}
          </div>
        </Tile>
      </CatGroup>

      {/* ─── Templates ──────────────────────────────────────── */}
      <CatGroup id="templates" label="Templates" count={8}>
        <Tile title="Calendar" to="/templates/calendar">
          <div style={{ width: "100%", maxWidth: 180, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} style={{
                aspectRatio: "1",
                background: i === 10 ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.4)",
                borderBottom: i === 8 ? "1px solid hsl(var(--primary))" : undefined,
              }} />
            ))}
          </div>
        </Tile>
        <Tile title="Dashboard" to="/templates/dashboard">
          <div style={{ width: "100%", maxWidth: 220, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  height: 28,
                  borderRadius: "var(--radius-sm, 4px)",
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  padding: 4,
                }}>
                  <div style={{ fontSize: 7, color: "hsl(var(--muted-foreground))" }}>Stat</div>
                  <div style={{ fontSize: 8, fontWeight: 600 }}>12k</div>
                </div>
              ))}
            </div>
            <svg viewBox="0 0 100 18" preserveAspectRatio="none" style={{ width: "100%", height: 20 }}>
              <polyline points="0,14 20,10 40,12 60,5 80,7 100,2" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </Tile>
        <Tile title="Detail w/ sidebar" to="/templates/detail-sidebar">
          <div style={{ width: "100%", maxWidth: 220, display: "grid", gridTemplateColumns: "1fr 60px", gap: 6 }}>
            <div className="section-card" style={{ padding: 6, display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ height: 6, width: 48, borderRadius: 4, background: "hsl(var(--foreground) / 0.8)" }} />
              <div style={{ height: 6, width: 64, borderRadius: 4, background: "hsl(var(--muted))" }} />
              <div style={{ height: 6, width: 56, borderRadius: 4, background: "hsl(var(--muted))" }} />
            </div>
            <div className="section-card" style={{ padding: 6, display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ height: 6, borderRadius: 4, background: "hsl(var(--muted))" }} />
              <div style={{ height: 6, borderRadius: 4, background: "hsl(var(--muted))" }} />
            </div>
          </div>
        </Tile>
        <Tile title="Identities" to="/templates/identities">
          <div style={{ width: "100%", maxWidth: 200, display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, height: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "hsl(var(--primary) / 0.3)" }} />
                <div style={{ flex: 1, height: 6, borderRadius: 4, background: "hsl(var(--muted))" }} />
                <div style={{ width: 24, height: 6, borderRadius: 4, background: "hsl(var(--muted) / 0.6)" }} />
              </div>
            ))}
          </div>
        </Tile>
        <Tile title="Onboarding" to="/templates/onboarding">
          <div style={{ width: "100%", maxWidth: 200, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 8, color: "hsl(var(--muted-foreground))", display: "flex", justifyContent: "space-between" }}>
              <span>Step 2 of 4</span><span>50%</span>
            </div>
            <div style={{ height: 4, background: "hsl(var(--muted))", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "50%", background: "hsl(var(--primary))" }} />
            </div>
            <div className="section-card" style={{ padding: 8, marginTop: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 600 }}>Profile</div>
              <div style={{ fontSize: 8, color: "hsl(var(--muted-foreground))" }}>Tell us about yourself.</div>
            </div>
          </div>
        </Tile>
        <Tile title="Profile" to="/templates/profile">
          <div style={{ width: "100%", maxWidth: 220, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, hsl(240 70% 55%), hsl(280 70% 55%))",
              }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ height: 8, width: 64, borderRadius: 4, background: "hsl(var(--foreground) / 0.8)" }} />
                <div style={{ height: 6, width: 48, borderRadius: 4, background: "hsl(var(--muted))" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 2, borderBottom: "1px solid hsl(var(--border))", paddingBottom: 2 }}>
              <div style={{ fontSize: 8, fontWeight: 500, paddingBottom: 2, borderBottom: "1px solid hsl(var(--foreground))", marginBottom: -3 }}>Overview</div>
              <div style={{ fontSize: 8, color: "hsl(var(--muted-foreground))", marginLeft: 4 }}>Credentials</div>
            </div>
          </div>
        </Tile>
        <Tile title="Settings" to="/templates/settings">
          <div style={{ width: "100%", maxWidth: 220, display: "grid", gridTemplateColumns: "60px 1fr", gap: 6 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 9, padding: "2px 4px", borderRadius: "var(--radius-sm, 4px)", background: "hsl(var(--accent))" }}>Profile</div>
              <div style={{ fontSize: 9, padding: "2px 4px", color: "hsl(var(--muted-foreground))" }}>Security</div>
              <div style={{ fontSize: 9, padding: "2px 4px", color: "hsl(var(--muted-foreground))" }}>Billing</div>
            </div>
            <div className="section-card" style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ height: 6, width: 48, borderRadius: 4, background: "hsl(var(--foreground) / 0.8)" }} />
              <div style={{ height: 16, borderRadius: "var(--radius-sm, 4px)", border: "1px solid hsl(var(--border))" }} />
              <div style={{ height: 16, borderRadius: "var(--radius-sm, 4px)", border: "1px solid hsl(var(--border))" }} />
            </div>
          </div>
        </Tile>
        <Tile title="Sign-in" to="/templates/signin">
          <div className="section-card" style={{ width: "100%", maxWidth: 180, padding: 12, textAlign: "center" }}>
            <CanvasMark size={18} />
            <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>Sign in</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
              <input className="input" placeholder="Email" style={{ height: 24, fontSize: 9 }} />
              <input className="input" placeholder="Password" style={{ height: 24, fontSize: 9 }} />
              <button className="btn btn-default btn-sm" style={{ height: 24, width: "100%", fontSize: 9 }}>Sign in</button>
            </div>
          </div>
        </Tile>
      </CatGroup>

      {/* ─── Patterns ───────────────────────────────────────── */}
      <CatGroup id="patterns" label="Patterns" count={6}>
        <Tile title="Accessibility" to="/patterns/accessibility">
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button className="btn btn-default btn-sm" style={{
              boxShadow: "0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring))",
            }}>Focus</button>
            <span className="kbd">&#8984;K</span>
          </div>
        </Tile>
        <Tile title="Density" to="/patterns/density">
          <div style={{ width: "100%", maxWidth: 200, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, fontSize: 8, textAlign: "center" }}>
            <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm, 4px)", padding: 4 }}>Compact</div>
            <div style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", border: "1px solid hsl(var(--primary))", borderRadius: "var(--radius-sm, 4px)", padding: 8 }}>Regular</div>
            <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-sm, 4px)", padding: 12 }}>Comfy</div>
          </div>
        </Tile>
        <Tile title="Form Validation" to="/patterns/form-validation">
          <div style={{ width: "100%", maxWidth: 200, display: "flex", flexDirection: "column", gap: 6 }}>
            <input
              className="input"
              defaultValue="not-an-email"
              style={{
                height: 28,
                fontSize: 10,
                borderColor: "hsl(var(--destructive))",
                boxShadow: "0 0 0 1px hsl(var(--destructive))",
              }}
            />
            <div style={{ fontSize: 9, color: "hsl(var(--destructive))" }}>Not a valid email</div>
          </div>
        </Tile>
        <Tile title="Glass Surface" to="/patterns/glass">
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 220,
            height: 80,
            borderRadius: "var(--radius-lg, 8px)",
            overflow: "hidden",
            background: "radial-gradient(60% 50% at 20% 10%, hsl(28 100% 80% / 0.55), transparent 60%), radial-gradient(55% 55% at 80% 20%, hsl(210 100% 78% / 0.55), transparent 60%), hsl(220 30% 96%)",
          }}>
            <div style={{
              position: "absolute",
              inset: 12,
              borderRadius: "var(--radius-md, 6px)",
              border: "1px solid rgb(255 255 255 / 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 500,
              background: "hsl(255 100% 100% / 0.55)",
              backdropFilter: "blur(8px) saturate(140%)",
            }}>Frosted</div>
          </div>
        </Tile>
        <Tile title="Loading" to="/patterns/loading">
          <div style={{ width: "100%", maxWidth: 200, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "hsl(var(--muted) / 0.6)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 8, background: "hsl(var(--muted) / 0.6)", borderRadius: 4, animation: "pulse 2s ease-in-out infinite" }} />
              <div style={{ height: 8, width: "75%", background: "hsl(var(--muted) / 0.6)", borderRadius: 4, animation: "pulse 2s ease-in-out infinite" }} />
            </div>
          </div>
        </Tile>
        <Tile title="Responsive" to="/patterns/responsive">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <div style={{
              width: 20,
              height: 36,
              borderRadius: 2,
              background: "hsl(var(--primary) / 0.15)",
              border: "1px solid hsl(var(--primary) / 0.3)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 2,
            }}>
              <span style={{ fontSize: 7, fontFamily: "var(--font-mono)" }}>375</span>
            </div>
            <div style={{
              width: 32,
              height: 44,
              borderRadius: 2,
              background: "hsl(var(--primary) / 0.20)",
              border: "1px solid hsl(var(--primary) / 0.3)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 2,
            }}>
              <span style={{ fontSize: 7, fontFamily: "var(--font-mono)" }}>768</span>
            </div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: "hsl(var(--primary) / 0.30)",
              border: "1px solid hsl(var(--primary) / 0.4)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 2,
            }}>
              <span style={{ fontSize: 8, fontFamily: "var(--font-mono)" }}>1024</span>
            </div>
          </div>
        </Tile>
      </CatGroup>

      <PageNav />

      <style>{`
        .docs-tile:hover {
          border-color: hsl(var(--foreground) / 0.2) !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
