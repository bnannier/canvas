import type { PatternDoc } from "./types";

const PATTERNS: PatternDoc[] = [
  // ── Accessibility ───────────────────────────────────────
  {
    slug: "accessibility",
    name: "Accessibility",
    description: "Focus rings, keyboard navigation, ARIA attributes, and color contrast. The baseline a11y requirements every Canvas surface must meet.",
    sections: [
      {
        title: "Focus ring",
        description: "Every interactive element gets a visible focus indicator on :focus-visible. Canvas uses a 2px ring offset with the --ring token color.",
        anatomy: "Ring appears on keyboard focus only (not mouse click). Uses box-shadow, not outline, so it respects border-radius.",
        html: `<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center">
  <button class="btn btn-primary" style="box-shadow:0 0 0 2px var(--background),0 0 0 4px var(--ring)">Focused button</button>
  <input class="input" value="Focused input" style="max-width:200px;box-shadow:0 0 0 2px var(--background),0 0 0 4px var(--ring)">
  <a href="#" style="padding:4px 8px;border-radius:var(--radius-md,8px);box-shadow:0 0 0 2px var(--background),0 0 0 4px var(--ring);text-decoration:none;color:var(--primary);font-size:13px">Focused link</a>
</div>`,
      },
      {
        title: "Keyboard shortcuts",
        description: "Standard keyboard patterns used across Canvas components.",
        html: `<div style="display:flex;flex-direction:column;gap:0;font-size:13px">
  <div style="display:flex;padding:10px 0;border-bottom:1px solid var(--border)"><span style="width:200px;color:var(--muted-foreground)">Open command palette</span><span style="display:flex;gap:4px"><kbd class="kbd">&#8984;</kbd><kbd class="kbd">K</kbd></span></div>
  <div style="display:flex;padding:10px 0;border-bottom:1px solid var(--border)"><span style="width:200px;color:var(--muted-foreground)">Close dialog / drawer</span><span><kbd class="kbd">Esc</kbd></span></div>
  <div style="display:flex;padding:10px 0;border-bottom:1px solid var(--border)"><span style="width:200px;color:var(--muted-foreground)">Navigate list items</span><span style="display:flex;gap:4px"><kbd class="kbd">&uarr;</kbd><kbd class="kbd">&darr;</kbd></span></div>
  <div style="display:flex;padding:10px 0;border-bottom:1px solid var(--border)"><span style="width:200px;color:var(--muted-foreground)">Select / activate</span><span><kbd class="kbd">Enter</kbd></span></div>
  <div style="display:flex;padding:10px 0"><span style="width:200px;color:var(--muted-foreground)">Move focus forward</span><span><kbd class="kbd">Tab</kbd></span></div>
</div>`,
      },
      {
        title: "ARIA essentials",
        description: "Minimum ARIA attributes required on common Canvas patterns.",
        html: `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">
  <div class="section-card" style="padding:16px">
    <div style="font-size:13px;font-weight:600;margin-bottom:8px">Dialog</div>
    <code style="font-size:11.5px;display:block;padding:8px;background:color-mix(in oklch, var(--muted) 30%, transparent);border-radius:var(--radius-sm,4px);line-height:1.6">role="dialog"<br>aria-modal="true"<br>aria-labelledby="title-id"</code>
  </div>
  <div class="section-card" style="padding:16px">
    <div style="font-size:13px;font-weight:600;margin-bottom:8px">Tabs</div>
    <code style="font-size:11.5px;display:block;padding:8px;background:color-mix(in oklch, var(--muted) 30%, transparent);border-radius:var(--radius-sm,4px);line-height:1.6">role="tablist"<br>role="tab" + aria-selected<br>role="tabpanel"</code>
  </div>
  <div class="section-card" style="padding:16px">
    <div style="font-size:13px;font-weight:600;margin-bottom:8px">Alert</div>
    <code style="font-size:11.5px;display:block;padding:8px;background:color-mix(in oklch, var(--muted) 30%, transparent);border-radius:var(--radius-sm,4px);line-height:1.6">role="alert"<br>aria-live="assertive"</code>
  </div>
  <div class="section-card" style="padding:16px">
    <div style="font-size:13px;font-weight:600;margin-bottom:8px">Toggle</div>
    <code style="font-size:11.5px;display:block;padding:8px;background:color-mix(in oklch, var(--muted) 30%, transparent);border-radius:var(--radius-sm,4px);line-height:1.6">role="switch"<br>aria-checked="true|false"</code>
  </div>
</div>`,
      },
      {
        title: "Color contrast",
        description: "Canvas tokens are designed for WCAG AA contrast (4.5:1 for normal text, 3:1 for large text). Verify contrast when customizing theme colors.",
        html: `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
  <div class="section-card" style="padding:16px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="width:24px;height:24px;border-radius:4px;background:var(--foreground)"></span>
      <span style="width:24px;height:24px;border-radius:4px;background:var(--background);border:1px solid var(--border)"></span>
    </div>
    <div style="font-size:12px;font-weight:500">foreground / background</div>
    <div style="font-size:11px;color:hsl(142 71% 45%);font-weight:600;margin-top:2px">&#10003; AA pass</div>
  </div>
  <div class="section-card" style="padding:16px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="width:24px;height:24px;border-radius:4px;background:var(--muted-foreground)"></span>
      <span style="width:24px;height:24px;border-radius:4px;background:var(--background);border:1px solid var(--border)"></span>
    </div>
    <div style="font-size:12px;font-weight:500">muted-foreground / background</div>
    <div style="font-size:11px;color:hsl(142 71% 45%);font-weight:600;margin-top:2px">&#10003; AA pass</div>
  </div>
  <div class="section-card" style="padding:16px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="width:24px;height:24px;border-radius:4px;background:var(--primary)"></span>
      <span style="width:24px;height:24px;border-radius:4px;background:white;border:1px solid var(--border)"></span>
    </div>
    <div style="font-size:12px;font-weight:500">primary / white</div>
    <div style="font-size:11px;color:hsl(142 71% 45%);font-weight:600;margin-top:2px">&#10003; AA pass</div>
  </div>
</div>`,
      },
    ],
  },

  // ── Density ─────────────────────────────────────────────
  {
    slug: "density",
    name: "Density",
    description: "Three-level density system (compact, regular, comfy) controlled via the data-density attribute. Scales padding and font sizes globally.",
    sections: [
      {
        title: "How it works",
        description: "Set data-density on <html> (or any container) to switch between compact, regular (default), and comfy spacing. Canvas components read density-aware custom properties.",
        html: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:13px">
  <div class="section-card" style="padding:16px;text-align:center">
    <div style="font-weight:600;margin-bottom:4px">Compact</div>
    <code style="font-size:11px;color:var(--muted-foreground)">data-density="compact"</code>
    <div style="margin-top:12px;font-size:12px;color:var(--muted-foreground)">Tight spacing for dense data views (tables, admin panels)</div>
  </div>
  <div class="section-card" style="padding:16px;text-align:center;border-color:var(--primary)">
    <div style="font-weight:600;margin-bottom:4px">Regular</div>
    <code style="font-size:11px;color:var(--muted-foreground)">default</code>
    <div style="margin-top:12px;font-size:12px;color:var(--muted-foreground)">Balanced spacing for most interfaces</div>
  </div>
  <div class="section-card" style="padding:16px;text-align:center">
    <div style="font-weight:600;margin-bottom:4px">Comfy</div>
    <code style="font-size:11px;color:var(--muted-foreground)">data-density="comfy"</code>
    <div style="margin-top:12px;font-size:12px;color:var(--muted-foreground)">Generous spacing for reading-heavy or touch-friendly layouts</div>
  </div>
</div>`,
      },
      {
        title: "Live demo",
        description: "The same toolbar and table row rendered at each density level.",
        html: `<div style="display:flex;flex-direction:column;gap:16px">
  <div>
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted-foreground);margin-bottom:6px">Compact</div>
    <div class="section-card" style="padding:8px 12px">
      <div style="display:flex;align-items:center;gap:6px">
        <input class="input" placeholder="Search..." style="height:28px;font-size:12px;padding:0 8px;max-width:180px">
        <button class="btn btn-outline" style="height:28px;font-size:11px;padding:0 10px">Filter</button>
        <span style="margin-left:auto;font-size:11px;color:var(--muted-foreground)">24 results</span>
      </div>
    </div>
  </div>
  <div>
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted-foreground);margin-bottom:6px">Regular (default)</div>
    <div class="section-card" style="padding:12px 16px">
      <div style="display:flex;align-items:center;gap:8px">
        <input class="input" placeholder="Search..." style="max-width:200px">
        <button class="btn btn-outline btn-sm">Filter</button>
        <span style="margin-left:auto;font-size:12px;color:var(--muted-foreground)">24 results</span>
      </div>
    </div>
  </div>
  <div>
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted-foreground);margin-bottom:6px">Comfy</div>
    <div class="section-card" style="padding:16px 20px">
      <div style="display:flex;align-items:center;gap:10px">
        <input class="input" placeholder="Search..." style="height:40px;font-size:14px;max-width:220px">
        <button class="btn btn-outline" style="height:40px;font-size:13px">Filter</button>
        <span style="margin-left:auto;font-size:13px;color:var(--muted-foreground)">24 results</span>
      </div>
    </div>
  </div>
</div>`,
      },
      {
        title: "Extending",
        anatomy: "Use the compact and comfy density selectors in your own components to shrink or grow padding the same way the built-ins do.",
        html: `<div style="max-width:680px;font-family:var(--font-mono);font-size:12.5px;background:color-mix(in oklch, var(--muted) 40%, transparent);border:1px solid var(--border);border-radius:8px;padding:1rem;white-space:pre;overflow:auto;color:var(--foreground)">html[data-density="compact"] .my-row { padding: 0.5rem 0.75rem; }
.my-row                               { padding: 0.75rem 1rem; }
html[data-density="comfy"]   .my-row { padding: 1rem 1.25rem; }</div>`,
      },
    ],
  },

  // ── Form Validation ─────────────────────────────────────
  {
    slug: "form-validation",
    name: "Form Validation",
    description: "Touch-on-blur validation pattern with visual states (default, focused, error, success, disabled) and inline error messages.",
    sections: [
      {
        title: "States",
        description: "Each state has a distinct visual treatment. Error and success states include helper text below the field.",
        html: `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
  <div>
    <label class="label">Default</label>
    <input class="input" placeholder="Enter value">
  </div>
  <div>
    <label class="label">Focused</label>
    <input class="input" placeholder="Enter value" style="border-color:var(--ring);box-shadow:0 0 0 2px color-mix(in oklch, var(--ring) 20%, transparent)">
  </div>
  <div>
    <label class="label">Error</label>
    <input class="input input-error" value="bad-email">
    <p class="field-helper field-error" style="margin-top:4px">Please enter a valid email address</p>
  </div>
  <div>
    <label class="label">Success</label>
    <input class="input" value="valid@email.com" style="border-color:hsl(142 71% 45%)">
    <p class="field-helper" style="margin-top:4px;color:hsl(142 71% 45%)">Email verified</p>
  </div>
  <div>
    <label class="label">Disabled</label>
    <input class="input" value="locked" disabled>
  </div>
</div>`,
      },
      {
        title: "Validation lifecycle",
        description: "Touch-on-blur: validate when the field loses focus (not on every keystroke). Show errors inline. Clear errors as the user corrects them.",
        anatomy: "1. User focuses field. 2. User types and leaves (blur). 3. If invalid, show error state + message. 4. On next keystroke, re-validate live until valid. 5. Show success briefly, then return to default.",
        html: `<div style="display:flex;gap:12px;flex-wrap:wrap">
  <div class="section-card" style="padding:16px;flex:1;min-width:180px;text-align:center">
    <div style="width:32px;height:32px;border-radius:50%;background:var(--muted);display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;font-size:14px;font-weight:600">1</div>
    <div style="font-size:12px;font-weight:500">Focus</div>
    <div style="font-size:11px;color:var(--muted-foreground);margin-top:2px">Ring appears</div>
  </div>
  <div class="section-card" style="padding:16px;flex:1;min-width:180px;text-align:center">
    <div style="width:32px;height:32px;border-radius:50%;background:var(--muted);display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;font-size:14px;font-weight:600">2</div>
    <div style="font-size:12px;font-weight:500">Blur</div>
    <div style="font-size:11px;color:var(--muted-foreground);margin-top:2px">Validate on leave</div>
  </div>
  <div class="section-card" style="padding:16px;flex:1;min-width:180px;text-align:center">
    <div style="width:32px;height:32px;border-radius:50%;background:color-mix(in oklch, var(--destructive) 15%, transparent);color:var(--destructive);display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;font-size:14px;font-weight:600">3</div>
    <div style="font-size:12px;font-weight:500">Error</div>
    <div style="font-size:11px;color:var(--muted-foreground);margin-top:2px">Show inline message</div>
  </div>
  <div class="section-card" style="padding:16px;flex:1;min-width:180px;text-align:center">
    <div style="width:32px;height:32px;border-radius:50%;background:hsl(142 71% 45%/0.15);color:hsl(142 71% 45%);display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;font-size:14px;font-weight:600">4</div>
    <div style="font-size:12px;font-weight:500">Corrected</div>
    <div style="font-size:11px;color:var(--muted-foreground);margin-top:2px">Clear error live</div>
  </div>
</div>`,
      },
      {
        title: "Example form",
        description: "A sign-in form demonstrating error states with inline helper text.",
        html: `<div style="max-width:380px">
  <div class="card">
    <div class="card-header">
      <h3 style="margin:0 0 4px;font-size:18px;font-weight:600">Sign in</h3>
      <p style="margin:0;font-size:13px;color:var(--muted-foreground)">Enter your credentials</p>
    </div>
    <div class="card-content" style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label class="label">Email</label>
        <input class="input input-error" value="rachel@">
        <p class="field-helper field-error" style="margin-top:4px">Please enter a valid email address</p>
      </div>
      <div>
        <label class="label">Password</label>
        <input class="input" type="password" placeholder="••••••••">
      </div>
      <button class="btn btn-primary" style="width:100%">Sign in</button>
    </div>
  </div>
</div>`,
      },
      {
        title: "Production stack",
        html: `<div style="max-width:680px;padding:1rem;border-radius:8px;background:color-mix(in oklch, var(--muted) 40%, transparent);border:1px solid var(--border);font-size:12.5px;color:var(--muted-foreground);line-height:1.6"><span style="font-weight:600;color:var(--foreground)">In production:</span> use <code>react-hook-form</code> for state and <code>zod</code> via <code>@hookform/resolvers/zod</code> for validation. Canvas demonstrates the visual states; the runtime wiring is the consumer's choice.</div>`,
      },
    ],
  },

  // ── Glass Surface ───────────────────────────────────────
  {
    slug: "glass",
    name: "Glass Surface",
    description: "Backdrop-filter glassmorphism on the functional layer (controls, navigation, overlays) — not content cards. Controlled via data-surface=\"glass\" on the document root.",
    sections: [
      {
        title: "What 'glass' means in Canvas",
        description: "Glass follows Apple's Liquid Glass model: it is a material for the FUNCTIONAL layer — navigation and overlays that float above content — not the content layer. The single Surface: solid / glass toggle swaps the popover token translucent, so overlays (popovers, menus, dropdowns, selects, dialogs, sheets, drawers, command) and the bars/sidebar go glass, while content surfaces (cards, lists, tables, calendars, charts) stay solid. The page background switches to a 3-radial-gradient aurora and each functional surface gets a backdrop-filter blur with a light edge highlight.",
        anatomy: "Toggle with the Solid / Glass switch in the topbar (top right), or set the data-surface attribute to glass on the html element manually.",
        html: `<div class="section-card" style="padding:1.25rem"><p style="margin:0;font-size:13.5px;color:var(--muted-foreground);line-height:1.6">Components never change for glass, and Canvas never hand-paints glass per component. Only token values and a few backdrop-filter overrides switch on, keyed off the document's surface attribute. Real iOS Liquid Glass is the OS's automatic system material; this is Canvas's own cross-platform glassmorphism for the functional layer.</p></div>`,
      },
      {
        title: "The four ingredients",
        description: "Glass surfaces combine four CSS effects to create the frosted-pane look.",
        html: `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
  <div class="section-card" style="padding:16px;text-align:center">
    <div style="font-size:24px;margin-bottom:8px">&#x1F4A8;</div>
    <div style="font-size:13px;font-weight:600;margin-bottom:4px">Backdrop blur</div>
    <code style="font-size:11px;color:var(--muted-foreground)">backdrop-filter: blur(12px)</code>
  </div>
  <div class="section-card" style="padding:16px;text-align:center">
    <div style="font-size:24px;margin-bottom:8px">&#x1F3A8;</div>
    <div style="font-size:13px;font-weight:600;margin-bottom:4px">Tinted background</div>
    <code style="font-size:11px;color:var(--muted-foreground)">background: oklch(... / 0.62)</code>
  </div>
  <div class="section-card" style="padding:16px;text-align:center">
    <div style="font-size:24px;margin-bottom:8px">&#x2728;</div>
    <div style="font-size:13px;font-weight:600;margin-bottom:4px">Subtle border</div>
    <code style="font-size:11px;color:var(--muted-foreground)">border: 1px solid rgba(...)</code>
  </div>
  <div class="section-card" style="padding:16px;text-align:center">
    <div style="font-size:24px;margin-bottom:8px">&#x1F30C;</div>
    <div style="font-size:13px;font-weight:600;margin-bottom:4px">Aurora background</div>
    <code style="font-size:11px;color:var(--muted-foreground)">3-radial-gradient body bg</code>
  </div>
</div>`,
      },
      {
        title: "Surface inventory",
        description: "How glass values map to each UI role.",
        html: `<div style="font-size:13px">
  <div style="display:grid;grid-template-columns:160px 1fr 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-md,8px);overflow:hidden">
    <div style="padding:8px 12px;font-weight:600;background:color-mix(in oklch, var(--muted) 30%, transparent);border-bottom:1px solid var(--border)">Surface</div>
    <div style="padding:8px 12px;font-weight:600;background:color-mix(in oklch, var(--muted) 30%, transparent);border-bottom:1px solid var(--border)">Blur</div>
    <div style="padding:8px 12px;font-weight:600;background:color-mix(in oklch, var(--muted) 30%, transparent);border-bottom:1px solid var(--border)">Opacity</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border)">Sidebar</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">16px</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">0.65</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border)">Card / Section card</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">12px</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">0.55</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border)">Topbar</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">12px</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">0.60</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border)">Dialog / Drawer</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">20px</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">0.70</div>
    <div style="padding:8px 12px">Tooltip / Popover</div>
    <div style="padding:8px 12px;color:var(--muted-foreground)">8px</div>
    <div style="padding:8px 12px;color:var(--muted-foreground)">0.80</div>
  </div>
</div>`,
      },
      {
        title: "Live comparison",
        description: "The same content rendered in solid mode vs glass mode. The Solid / Glass toggle in the topbar swaps both at once.",
        html: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;border-radius:12px;padding:20px;background:radial-gradient(120% 120% at 0% 0%, hsl(262 83% 58% / 0.25), transparent 50%), radial-gradient(120% 120% at 100% 100%, hsl(190 90% 50% / 0.2), transparent 50%), var(--background)">
  <div>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted-foreground);margin-bottom:8px">Solid</div>
    <div class="section-card" style="padding:16px;background:var(--card)"><div style="font-size:13px;font-weight:600;margin-bottom:4px">Active sessions</div><div style="font-size:22px;font-weight:700">1,204</div></div>
  </div>
  <div>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted-foreground);margin-bottom:8px">Glass</div>
    <div style="padding:16px;border-radius:12px;backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);background:hsl(255 100% 100% / 0.12);border:1px solid hsl(255 100% 100% / 0.25);box-shadow:inset 0 1px 0 hsl(255 100% 100% / 0.25)"><div style="font-size:13px;font-weight:600;margin-bottom:4px">Active sessions</div><div style="font-size:22px;font-weight:700">1,204</div></div>
  </div>
</div>`,
      },
      {
        title: "When NOT to use glass",
        description: "Glass works best for ambient UI. Avoid it in contexts where legibility or performance matters more than aesthetics.",
        html: `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
  <div class="section-card" style="padding:16px;border-color:color-mix(in oklch, var(--destructive) 30%, transparent)">
    <div style="font-size:13px;font-weight:600;margin-bottom:4px;color:var(--destructive)">Dense data tables</div>
    <div style="font-size:12px;color:var(--muted-foreground)">Blur behind hundreds of rows tanks rendering. Use solid background for data tables.</div>
  </div>
  <div class="section-card" style="padding:16px;border-color:color-mix(in oklch, var(--destructive) 30%, transparent)">
    <div style="font-size:13px;font-weight:600;margin-bottom:4px;color:var(--destructive)">Low-end devices</div>
    <div style="font-size:12px;color:var(--muted-foreground)">backdrop-filter is GPU-intensive. Degrade to solid on devices without hardware acceleration.</div>
  </div>
  <div class="section-card" style="padding:16px;border-color:color-mix(in oklch, var(--destructive) 30%, transparent)">
    <div style="font-size:13px;font-weight:600;margin-bottom:4px;color:var(--destructive)">Print stylesheets</div>
    <div style="font-size:12px;color:var(--muted-foreground)">Glass has no meaning on paper. Reset to opaque backgrounds in @media print.</div>
  </div>
  <div class="section-card" style="padding:16px;border-color:color-mix(in oklch, var(--destructive) 30%, transparent)">
    <div style="font-size:13px;font-weight:600;margin-bottom:4px;color:var(--destructive)">Safety-critical UI</div>
    <div style="font-size:12px;color:var(--muted-foreground)">When misreading a value is dangerous (medical, financial), never rely on translucent surfaces.</div>
  </div>
</div>`,
      },
      {
        title: "Implementation",
        description: "Glass keys off the document's data-surface attribute. Rather than restyle each surface, it overrides the surface tokens (--card, --popover) with translucent oklch values, then applies a backdrop-filter blur so the aurora backdrop shows through. Because <html> carries both .dark and data-surface=\"glass\" at once, light-only values are scoped with :not(.dark) so they never leak into dark mode. Light mode also needs a colored backdrop: pure-white frost over a white page reads as a solid card, so light glass strengthens the aurora (plus a faint floor tint) and adds soft edge definition to content surfaces so the frosted panes separate from what is behind them.",
        html: `<div style="max-width:680px;font-family:var(--font-mono);font-size:12px;background:color-mix(in oklch, var(--muted) 40%, transparent);border:1px solid var(--border);border-radius:8px;padding:1rem;white-space:pre;overflow:auto;color:var(--foreground)">/* base alphas (also feed dark) */
[data-surface="glass"] {
  --card: oklch(1 0 0 / 0.62);
  --popover: oklch(1 0 0 / 0.74);
}
.dark[data-surface="glass"] {
  --card: oklch(0.24 0.006 285.885 / 0.5);
  --popover: oklch(0.25 0.006 285.885 / 0.62);
}
/* light only: more translucent, faint cool tint */
[data-surface="glass"]:not(.dark) {
  --card: oklch(0.99 0.01 286 / 0.52);
  --popover: oklch(0.99 0.01 286 / 0.66);
}
/* frost every surface */
[data-surface="glass"] :where(.card, .topbar, .sidebar, .bg-card) {
  backdrop-filter: blur(16px) saturate(1.6);
  -webkit-backdrop-filter: blur(16px) saturate(1.6);
}</div>`,
      },
    ],
  },

  // ── Loading ─────────────────────────────────────────────
  {
    slug: "loading",
    name: "Loading",
    description: "Three loading strategies: skeleton (predictable layout, >300ms), spinner (indeterminate, <300ms), and progressive disclosure (keep parent usable).",
    sections: [
      {
        title: "Choose by intent",
        description: "Pick the right loading pattern based on what the user is waiting for and how long they'll wait.",
        html: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
  <div class="section-card" style="padding:16px">
    <div style="font-size:13px;font-weight:600;margin-bottom:4px">Skeleton</div>
    <div style="font-size:12px;color:var(--muted-foreground);margin-bottom:12px">Layout is predictable. Feels faster because shape is visible immediately.</div>
    <div style="font-size:11px;padding:4px 8px;border-radius:var(--radius-sm,4px);background:color-mix(in oklch, var(--primary) 10%, transparent);color:var(--primary);display:inline-block">Best for: page loads, lists</div>
  </div>
  <div class="section-card" style="padding:16px">
    <div style="font-size:13px;font-weight:600;margin-bottom:4px">Spinner</div>
    <div style="font-size:12px;color:var(--muted-foreground);margin-bottom:12px">Indeterminate. Good for short waits where content shape is unknown.</div>
    <div style="font-size:11px;padding:4px 8px;border-radius:var(--radius-sm,4px);background:hsl(38 92% 50%/0.1);color:hsl(38 92% 50%);display:inline-block">Best for: button actions, saves</div>
  </div>
  <div class="section-card" style="padding:16px">
    <div style="font-size:13px;font-weight:600;margin-bottom:4px">Progressive</div>
    <div style="font-size:12px;color:var(--muted-foreground);margin-bottom:12px">Show what you have, load the rest. Keeps parent interactive.</div>
    <div style="font-size:11px;padding:4px 8px;border-radius:var(--radius-sm,4px);background:hsl(142 71% 45%/0.1);color:hsl(142 71% 45%);display:inline-block">Best for: dashboards, feeds</div>
  </div>
</div>`,
      },
      {
        title: "Spinner in button",
        description: "Replace button label with spinner during async actions. Disable the button to prevent double submission.",
        html: `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
  <button class="btn btn-primary" disabled style="display:inline-flex;align-items:center;gap:8px">
    <span class="spinner" style="width:14px;height:14px"></span> Saving...
  </button>
  <button class="btn btn-outline" disabled style="display:inline-flex;align-items:center;gap:8px">
    <span class="spinner" style="width:14px;height:14px"></span> Loading
  </button>
  <button class="btn btn-destructive" disabled style="display:inline-flex;align-items:center;gap:8px">
    <span class="spinner" style="width:14px;height:14px"></span> Deleting...
  </button>
</div>`,
      },
      {
        title: "Skeleton row",
        description: "Animated placeholder rows that match the shape of the content being loaded.",
        html: `<div class="section-card" style="padding:0;overflow:hidden">
  <div style="display:flex;flex-direction:column">
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border)">
      <div class="skeleton" style="width:32px;height:32px;border-radius:50%"></div>
      <div style="flex:1"><div class="skeleton" style="width:60%;height:12px;border-radius:4px;margin-bottom:6px"></div><div class="skeleton" style="width:40%;height:10px;border-radius:4px"></div></div>
      <div class="skeleton" style="width:60px;height:10px;border-radius:4px"></div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border)">
      <div class="skeleton" style="width:32px;height:32px;border-radius:50%"></div>
      <div style="flex:1"><div class="skeleton" style="width:50%;height:12px;border-radius:4px;margin-bottom:6px"></div><div class="skeleton" style="width:35%;height:10px;border-radius:4px"></div></div>
      <div class="skeleton" style="width:48px;height:10px;border-radius:4px"></div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px">
      <div class="skeleton" style="width:32px;height:32px;border-radius:50%"></div>
      <div style="flex:1"><div class="skeleton" style="width:70%;height:12px;border-radius:4px;margin-bottom:6px"></div><div class="skeleton" style="width:45%;height:10px;border-radius:4px"></div></div>
      <div class="skeleton" style="width:54px;height:10px;border-radius:4px"></div>
    </div>
  </div>
</div>`,
      },
      {
        title: "Inline progress bar",
        description: "Determinate progress for file uploads, multi-step processes, or batch operations.",
        html: `<div style="max-width:400px">
  <div class="section-card" style="padding:16px">
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
      <span style="font-weight:500">Uploading report.pdf</span>
      <span style="color:var(--muted-foreground)">68%</span>
    </div>
    <div style="height:6px;border-radius:9999px;background:var(--muted);overflow:hidden">
      <div style="width:68%;height:100%;border-radius:9999px;background:var(--primary);transition:width 300ms"></div>
    </div>
    <div style="font-size:11px;color:var(--muted-foreground);margin-top:6px">2.4 MB of 3.5 MB</div>
  </div>
</div>`,
      },
    ],
  },

  // ── Responsive ──────────────────────────────────────────
  {
    slug: "responsive",
    name: "Responsive",
    description: "Desktop-first responsive system with breakpoints, sidebar drawer-to-fixed transition, and reusable grid patterns.",
    sections: [
      {
        title: "Breakpoints",
        description: "Canvas is desktop-first. Unprefixed utilities are the desktop base; a breakpoint prefix (sm, md, lg, xl, 2xl) applies at that width and below.",
        html: `<div style="font-size:13px">
  <div style="display:grid;grid-template-columns:80px 110px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-md,8px);overflow:hidden">
    <div style="padding:8px 12px;font-weight:600;background:color-mix(in oklch, var(--muted) 30%, transparent);border-bottom:1px solid var(--border)">Name</div>
    <div style="padding:8px 12px;font-weight:600;background:color-mix(in oklch, var(--muted) 30%, transparent);border-bottom:1px solid var(--border)">Applies at</div>
    <div style="padding:8px 12px;font-weight:600;background:color-mix(in oklch, var(--muted) 30%, transparent);border-bottom:1px solid var(--border)">Typical use</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-weight:500">base</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:12px">default</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">Unprefixed desktop base; the widest layouts, where the side table-of-contents shows</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-weight:500">2xl</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:12px">&le; 1536px</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">Large monitors</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-weight:500">xl</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:12px">&le; 1280px</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">Desktops</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-weight:500">lg</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:12px">&le; 1024px</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">Small laptops; the sidebar collapses to a drawer at lg and below</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-weight:500">md</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:12px">&le; 768px</div>
    <div style="padding:8px 12px;border-bottom:1px solid var(--border);color:var(--muted-foreground)">Tablets</div>
    <div style="padding:8px 12px;font-weight:500">sm</div>
    <div style="padding:8px 12px;font-family:var(--font-mono);font-size:12px">&le; 640px</div>
    <div style="padding:8px 12px;color:var(--muted-foreground)">Phones</div>
  </div>
  <p style="margin:12px 0 0;font-size:12.5px;color:var(--muted-foreground);line-height:1.6">A prefix is active when the viewport is at its width or narrower, so several match at once on a small screen. The smallest matching prefix wins: at 700px wide, <code style="font-family:var(--font-mono);font-size:11.5px">md:</code> applies (sm at 640px does not match yet), and <code style="font-family:var(--font-mono);font-size:11.5px">sm:</code> takes over at 640px and below.</p>
</div>`,
      },
      {
        title: "Sidebar - drawer ↔ fixed",
        description: "On the desktop base the sidebar is a fixed panel. The lg variant applies at 1024px and below, swapping it for a drawer overlay triggered by the hamburger button. Above lg, the fixed panel stays.",
        html: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
  <div class="section-card" style="padding:16px">
    <div style="font-size:13px;font-weight:600;margin-bottom:8px">lg and below (drawer)</div>
    <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius-md,8px);overflow:hidden;height:120px">
      <div style="flex:1;padding:8px;font-size:11px;display:flex;align-items:start">
        <div style="width:24px;height:24px;border-radius:4px;background:var(--muted);display:inline-flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer">&#9776;</div>
        <span style="margin-left:8px;color:var(--muted-foreground)">Full-width content</span>
      </div>
    </div>
    <div style="font-size:11px;color:var(--muted-foreground);margin-top:6px">Sidebar hidden. Hamburger opens drawer overlay.</div>
  </div>
  <div class="section-card" style="padding:16px">
    <div style="font-size:13px;font-weight:600;margin-bottom:8px">Above lg (fixed)</div>
    <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:var(--radius-md,8px);overflow:hidden;height:120px">
      <div style="width:48px;background:var(--card);border-right:1px solid var(--border);padding:6px;font-size:9px;color:var(--muted-foreground)">Nav</div>
      <div style="flex:1;padding:8px;font-size:11px;color:var(--muted-foreground)">Main content area</div>
    </div>
    <div style="font-size:11px;color:var(--muted-foreground);margin-top:6px">Sidebar fixed. Collapsible via toggle.</div>
  </div>
</div>`,
      },
      {
        title: "Grid templates",
        description: "Four reusable responsive grid templates that adapt across breakpoints.",
        html: `<div style="display:flex;flex-direction:column;gap:16px">
  <div>
    <div style="font-size:12px;font-weight:600;margin-bottom:6px">Stats grid (auto-fit 220px)</div>
    <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
      <div class="section-card" style="padding:10px;text-align:center;font-size:12px">Stat 1</div>
      <div class="section-card" style="padding:10px;text-align:center;font-size:12px">Stat 2</div>
      <div class="section-card" style="padding:10px;text-align:center;font-size:12px">Stat 3</div>
      <div class="section-card" style="padding:10px;text-align:center;font-size:12px">Stat 4</div>
    </div>
  </div>
  <div>
    <div style="font-size:12px;font-weight:600;margin-bottom:6px">Content + sidebar (2fr + 1fr at lg)</div>
    <div style="display:grid;gap:8px;grid-template-columns:2fr 1fr">
      <div class="section-card" style="padding:10px;font-size:12px">Main content</div>
      <div class="section-card" style="padding:10px;font-size:12px">Sidebar</div>
    </div>
  </div>
  <div>
    <div style="font-size:12px;font-weight:600;margin-bottom:6px">Card grid (auto-fit 280px)</div>
    <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
      <div class="section-card" style="padding:10px;text-align:center;font-size:12px">Card</div>
      <div class="section-card" style="padding:10px;text-align:center;font-size:12px">Card</div>
      <div class="section-card" style="padding:10px;text-align:center;font-size:12px">Card</div>
    </div>
  </div>
</div>`,
      },
      {
        title: "What's behind the scenes",
        description: "Specific responsive treatments worth noting beyond just stacking grids.",
        html: `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0.75rem">
  <div class="section-card" style="padding:1rem"><div style="font-size:14px;font-weight:600;margin-bottom:4px">Topbar: progressive disclosure</div><div style="font-size:12.5px;color:var(--muted-foreground);line-height:1.5">Search text shrinks to just "Search..." at small sizes, the Cmd+K kbd hides below sm, and the user pill collapses to an avatar below md.</div></div>
  <div class="section-card" style="padding:1rem"><div style="font-size:14px;font-weight:600;margin-bottom:4px">Tables: horizontal scroll</div><div style="font-size:12.5px;color:var(--muted-foreground);line-height:1.5">Tables get a min-width and live inside a scroll container that overflows horizontally. Easier to scroll than to pack columns into a phone screen.</div></div>
  <div class="section-card" style="padding:1rem"><div style="font-size:14px;font-weight:600;margin-bottom:4px">Drawer: viewport cap</div><div style="font-size:12.5px;color:var(--muted-foreground);line-height:1.5">The slide-over width is wrapped in min(width, 100vw) so an open drawer can never exceed the phone's width.</div></div>
  <div class="section-card" style="padding:1rem"><div style="font-size:14px;font-weight:600;margin-bottom:4px">Page header: wrap actions</div><div style="font-size:12.5px;color:var(--muted-foreground);line-height:1.5">The actions row uses flex-wrap. On small screens, a row of buttons wraps to a second line rather than overflowing.</div></div>
  <div class="section-card" style="padding:1rem"><div style="font-size:14px;font-weight:600;margin-bottom:4px">Density layers on top</div><div style="font-size:12.5px;color:var(--muted-foreground);line-height:1.5">The compact and comfy utilities layer on top of responsive ones, so compact mode shrinks padding everywhere regardless of viewport.</div></div>
  <div class="section-card" style="padding:1rem"><div style="font-size:14px;font-weight:600;margin-bottom:4px">Mobile is real, not an afterthought</div><div style="font-size:12.5px;color:var(--muted-foreground);line-height:1.5">Every page was checked at 375px and 768px. No desktop-only surfaces.</div></div>
</div>`,
      },
      {
        title: "Try it yourself",
        html: `<div style="max-width:680px;padding:1rem;border-radius:8px;background:color-mix(in oklch, var(--muted) 40%, transparent);border:1px solid var(--border);font-size:12.5px;color:var(--muted-foreground);line-height:1.6">Resize this browser window. Watch the sidebar collapse into a drawer, the page header stack, and the grids reflow. The same patterns apply across every page in the system.</div>`,
      },
    ],
  },
];

export function getPattern(slug: string): PatternDoc | undefined {
  return PATTERNS.find((p) => p.slug === slug);
}

export function getAllPatterns(): PatternDoc[] {
  return PATTERNS;
}
