import type { TemplateDoc } from "./types";

const TEMPLATES: TemplateDoc[] = [
  // ── Sign-in ─────────────────────────────────────────────
  {
    slug: "signin",
    name: "Sign-in",
    description: "Authentication screens: centered card, split-screen with marketing, and passwordless magic link.",
    sections: [
      {
        title: "Centered card",
        anatomy: "Logo + card (email, password, submit) + social divider + OAuth buttons. Max-width 400px, vertically centered.",
        html: `<div style="display:flex;align-items:center;justify-content:center;min-height:420px;background:hsl(var(--muted)/0.15);border-radius:var(--radius-lg,12px);padding:2rem">
  <div class="card" style="width:100%;max-width:400px">
    <div class="card-header" style="text-align:center">
      <div style="width:40px;height:40px;border-radius:var(--radius-md,8px);background:hsl(var(--primary));display:inline-flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:18px;margin-bottom:12px">C</div>
      <h3 style="margin:0 0 4px;font-size:18px;font-weight:600">Sign in to Canvas</h3>
      <p style="margin:0;font-size:13px;color:hsl(var(--muted-foreground))">Enter your credentials to continue</p>
    </div>
    <div class="card-content" style="display:flex;flex-direction:column;gap:14px">
      <div><label class="label">Email</label><input class="input" type="email" placeholder="you@example.com"></div>
      <div><label class="label">Password</label><input class="input" type="password" placeholder="••••••••"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px">
        <label style="display:flex;align-items:center;gap:6px"><input type="checkbox" class="checkbox"> Remember me</label>
        <a href="#" style="color:hsl(var(--primary));text-decoration:none">Forgot password?</a>
      </div>
      <button class="btn btn-primary" style="width:100%">Sign in</button>
      <div class="sep" data-content="or"></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline" style="flex:1;font-size:12px">Google</button>
        <button class="btn btn-outline" style="flex:1;font-size:12px">GitHub</button>
      </div>
    </div>
  </div>
</div>`,
      },
      {
        title: "Split-screen",
        anatomy: "Two equal columns. Left: brand panel with headline and feature bullets. Right: sign-in form. Collapses to form-only on mobile.",
        html: `<div style="display:grid;grid-template-columns:1fr 1fr;min-height:400px;border-radius:var(--radius-lg,12px);overflow:hidden;border:1px solid hsl(var(--border))">
  <div style="background:hsl(var(--primary));color:white;padding:2.5rem;display:flex;flex-direction:column;justify-content:center">
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:white">Welcome back</h2>
    <p style="margin:0 0 24px;font-size:14px;opacity:0.85">Manage identities, sessions, and access policies from one dashboard.</p>
    <ul style="list-style:none;margin:0;padding:0;font-size:13px;display:flex;flex-direction:column;gap:10px;opacity:0.9">
      <li style="display:flex;align-items:center;gap:8px"><span style="width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:11px">&#10003;</span> Multi-factor authentication</li>
      <li style="display:flex;align-items:center;gap:8px"><span style="width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:11px">&#10003;</span> OAuth2 and OIDC support</li>
      <li style="display:flex;align-items:center;gap:8px"><span style="width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:11px">&#10003;</span> Audit logging and compliance</li>
    </ul>
  </div>
  <div style="padding:2.5rem;display:flex;flex-direction:column;justify-content:center;background:hsl(var(--background))">
    <h3 style="margin:0 0 4px;font-size:18px;font-weight:600">Sign in</h3>
    <p style="margin:0 0 20px;font-size:13px;color:hsl(var(--muted-foreground))">Enter your credentials below</p>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div><label class="label">Email</label><input class="input" type="email" placeholder="you@example.com"></div>
      <div><label class="label">Password</label><input class="input" type="password" placeholder="••••••••"></div>
      <button class="btn btn-primary" style="width:100%">Sign in</button>
    </div>
  </div>
</div>`,
      },
      {
        title: "Magic link",
        anatomy: "Single email field + submit. No password. Confirmation state swaps the form for a success message.",
        html: `<div style="display:flex;align-items:center;justify-content:center;min-height:340px;background:hsl(var(--muted)/0.15);border-radius:var(--radius-lg,12px);padding:2rem">
  <div class="card" style="width:100%;max-width:400px;text-align:center">
    <div class="card-header">
      <div style="width:48px;height:48px;border-radius:50%;background:hsl(var(--primary)/0.12);display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      </div>
      <h3 style="margin:0 0 4px;font-size:18px;font-weight:600">Sign in with email</h3>
      <p style="margin:0;font-size:13px;color:hsl(var(--muted-foreground))">We'll send you a magic link. No password required.</p>
    </div>
    <div class="card-content" style="display:flex;flex-direction:column;gap:12px">
      <div style="text-align:left"><label class="label">Email address</label><input class="input" type="email" placeholder="you@example.com"></div>
      <button class="btn btn-primary" style="width:100%">Send magic link</button>
      <p style="margin:0;font-size:12px;color:hsl(var(--muted-foreground))">By continuing, you agree to our Terms of Service.</p>
    </div>
  </div>
</div>`,
      },
    ],
  },

  // ── Dashboard ───────────────────────────────────────────
  {
    slug: "dashboard",
    name: "Dashboard",
    description: "Comprehensive admin overview with stats, activity, charts, and secondary widgets. Dense, scannable, optimized for operator workflows.",
    sections: [
      {
        title: "The shape of a dashboard",
        description: "Dense, scannable, lots of small data points. Hero stat row up top, then two-column for primary content, then auto-fit grid for secondary widgets.",
        anatomy: "PageHeader, 4x StatCard row (auto-fit minmax 220px), 2-col activity + chart (lg), auto-fit minmax 280px secondary widgets.",
        html: `<div style="display:flex;flex-direction:column;gap:16px">
  <!-- Page header -->
  <div class="page-header">
    <div class="page-header-text">
      <h2 class="page-header-title">Dashboard</h2>
      <p class="page-header-sub">Overview of your identity platform</p>
    </div>
    <div class="page-header-actions"><button class="btn btn-outline btn-sm">View metrics</button></div>
  </div>

  <!-- Stat cards -->
  <div style="display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
    <div class="stat-card"><div class="stat-card-label">Active identities</div><div class="stat-card-value">12,348</div><div class="stat-card-delta positive">+142 today</div></div>
    <div class="stat-card"><div class="stat-card-label">Active sessions</div><div class="stat-card-value">1,204</div><div class="stat-card-delta positive">+8% vs yesterday</div></div>
    <div class="stat-card"><div class="stat-card-label">OAuth2 clients</div><div class="stat-card-value">38</div><div class="stat-card-delta neutral">6 M2M, 32 user</div></div>
    <div class="stat-card"><div class="stat-card-label">Locked accounts</div><div class="stat-card-value">6</div><div class="stat-card-delta negative">2 since 1h ago</div></div>
  </div>

  <!-- Two-column: activity + chart -->
  <div style="display:grid;gap:16px;grid-template-columns:1fr 1fr">
    <div class="section-card">
      <div class="section-card-header"><h3 class="section-card-title">Recent activity</h3><button class="btn btn-ghost btn-sm">View all</button></div>
      <div class="section-card-body">
        <div style="display:flex;flex-direction:column;gap:0">
          <div style="display:flex;align-items:start;gap:12px;padding:10px 0;border-bottom:1px solid hsl(var(--border))">
            <span style="width:28px;height:28px;border-radius:8px;background:hsl(var(--primary)/0.12);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <div style="flex:1;min-width:0"><span style="font-size:13px"><strong>rachel.chen@example.com</strong> <span style="color:hsl(var(--muted-foreground))">signed in</span></span><br><code style="font-size:11px;color:hsl(var(--muted-foreground))">session.created</code></div>
            <span style="font-size:12px;color:hsl(var(--muted-foreground));white-space:nowrap">2 min ago</span>
          </div>
          <div style="display:flex;align-items:start;gap:12px;padding:10px 0;border-bottom:1px solid hsl(var(--border))">
            <span style="width:28px;height:28px;border-radius:8px;background:hsl(var(--primary)/0.12);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <div style="flex:1;min-width:0"><span style="font-size:13px"><strong>admin@example.com</strong> <span style="color:hsl(var(--muted-foreground))">revoked session</span></span><br><code style="font-size:11px;color:hsl(var(--muted-foreground))">session.revoked</code></div>
            <span style="font-size:12px;color:hsl(var(--muted-foreground));white-space:nowrap">12 min ago</span>
          </div>
          <div style="display:flex;align-items:start;gap:12px;padding:10px 0">
            <span style="width:28px;height:28px;border-radius:8px;background:hsl(var(--primary)/0.12);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <div style="flex:1;min-width:0"><span style="font-size:13px"><strong>cli_billing_m2m</strong> <span style="color:hsl(var(--muted-foreground))">exchanged credentials</span></span><br><code style="font-size:11px;color:hsl(var(--muted-foreground))">token.issued</code></div>
            <span style="font-size:12px;color:hsl(var(--muted-foreground));white-space:nowrap">27 min ago</span>
          </div>
        </div>
      </div>
    </div>
    <div class="section-card">
      <div class="section-card-header"><h3 class="section-card-title">Sign-ins (24 h)</h3></div>
      <div class="section-card-body">
        <div style="display:flex;align-items:end;gap:3px;height:140px">
          <div style="flex:1;border-radius:2px;height:28%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:22%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:35%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:42%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:55%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:48%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:62%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:70%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:85%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:78%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:90%;background:hsl(var(--primary)/0.25)"></div>
          <div style="flex:1;border-radius:2px;height:95%;background:hsl(var(--primary))"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:hsl(var(--muted-foreground));font-family:var(--font-mono)">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Secondary widgets -->
  <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
    <div class="section-card">
      <div class="section-card-header"><h3 class="section-card-title">Sign-in methods</h3></div>
      <div class="section-card-body">
        <div style="display:flex;height:10px;border-radius:9999px;overflow:hidden;margin-bottom:14px;background:hsl(var(--muted))">
          <div style="width:48%;background:hsl(var(--primary))"></div>
          <div style="width:22%;background:hsl(38 92% 50%)"></div>
          <div style="width:14%;background:hsl(173 70% 42%)"></div>
          <div style="width:9%;background:hsl(215 20% 50%)"></div>
          <div style="width:7%;background:hsl(346 78% 58%)"></div>
        </div>
        <div style="font-size:13px;display:flex;flex-direction:column;gap:4px">
          <div style="display:flex;justify-content:space-between"><span>Password</span><span style="font-family:var(--font-mono);font-size:12px;color:hsl(var(--muted-foreground))">48%</span></div>
          <div style="display:flex;justify-content:space-between"><span>Google</span><span style="font-family:var(--font-mono);font-size:12px;color:hsl(var(--muted-foreground))">22%</span></div>
          <div style="display:flex;justify-content:space-between"><span>WebAuthn</span><span style="font-family:var(--font-mono);font-size:12px;color:hsl(var(--muted-foreground))">14%</span></div>
          <div style="display:flex;justify-content:space-between"><span>GitHub</span><span style="font-family:var(--font-mono);font-size:12px;color:hsl(var(--muted-foreground))">9%</span></div>
          <div style="display:flex;justify-content:space-between"><span>Other</span><span style="font-family:var(--font-mono);font-size:12px;color:hsl(var(--muted-foreground))">7%</span></div>
        </div>
      </div>
    </div>
    <div class="section-card">
      <div class="section-card-header"><h3 class="section-card-title">Service health</h3></div>
      <div class="section-card-body" style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:8px;font-size:13px"><span class="status-badge sb-success"><span class="dot"></span> Healthy</span><span style="flex:1">Login flow</span><span style="font-size:12px;color:hsl(var(--muted-foreground))">22 ms</span></div>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px"><span class="status-badge sb-success"><span class="dot"></span> Healthy</span><span style="flex:1">Admin API</span><span style="font-size:12px;color:hsl(var(--muted-foreground))">8 ms</span></div>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px"><span class="status-badge sb-warning"><span class="dot"></span> Degraded</span><span style="flex:1">Webhooks</span><span style="font-size:12px;color:hsl(var(--muted-foreground))">340 ms</span></div>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px"><span class="status-badge sb-success"><span class="dot"></span> Healthy</span><span style="flex:1">Database</span><span style="font-size:12px;color:hsl(var(--muted-foreground))">3 ms</span></div>
      </div>
    </div>
  </div>
</div>`,
      },
    ],
  },

  // ── Calendar ────────────────────────────────────────────
  {
    slug: "calendar",
    name: "Calendar",
    description: "Month-view calendar with color-coded events, navigation controls, and event detail.",
    sections: [
      {
        title: "Month view",
        anatomy: "Navigation header (prev/next + month/year title) + 7-column weekday grid + day cells with event dots.",
        html: `<div style="display:flex;flex-direction:column;gap:16px">
  <div class="page-header">
    <div class="page-header-text"><h2 class="page-header-title">Calendar</h2><p class="page-header-sub">May 2026</p></div>
    <div class="page-header-actions" style="gap:8px">
      <button class="btn btn-ghost btn-sm btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
      <button class="btn btn-outline btn-sm">Today</button>
      <button class="btn btn-ghost btn-sm btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
    </div>
  </div>

  <div class="section-card" style="padding:0;overflow:hidden">
    <!-- Weekday header -->
    <div style="display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid hsl(var(--border))">
      <div style="padding:8px;text-align:center;font-size:11px;font-weight:600;color:hsl(var(--muted-foreground));text-transform:uppercase;letter-spacing:0.05em">Mon</div>
      <div style="padding:8px;text-align:center;font-size:11px;font-weight:600;color:hsl(var(--muted-foreground));text-transform:uppercase;letter-spacing:0.05em">Tue</div>
      <div style="padding:8px;text-align:center;font-size:11px;font-weight:600;color:hsl(var(--muted-foreground));text-transform:uppercase;letter-spacing:0.05em">Wed</div>
      <div style="padding:8px;text-align:center;font-size:11px;font-weight:600;color:hsl(var(--muted-foreground));text-transform:uppercase;letter-spacing:0.05em">Thu</div>
      <div style="padding:8px;text-align:center;font-size:11px;font-weight:600;color:hsl(var(--muted-foreground));text-transform:uppercase;letter-spacing:0.05em">Fri</div>
      <div style="padding:8px;text-align:center;font-size:11px;font-weight:600;color:hsl(var(--muted-foreground));text-transform:uppercase;letter-spacing:0.05em">Sat</div>
      <div style="padding:8px;text-align:center;font-size:11px;font-weight:600;color:hsl(var(--muted-foreground));text-transform:uppercase;letter-spacing:0.05em">Sun</div>
    </div>
    <!-- Week rows -->
    <div style="display:grid;grid-template-columns:repeat(7,1fr)">
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border));color:hsl(var(--muted-foreground))"><span style="font-size:12px">27</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border));color:hsl(var(--muted-foreground))"><span style="font-size:12px">28</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border));color:hsl(var(--muted-foreground))"><span style="font-size:12px">29</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border));color:hsl(var(--muted-foreground))"><span style="font-size:12px">30</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">1</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">2</span></div>
      <div style="padding:8px;min-height:80px;border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">3</span></div>

      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">4</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">5</span><div style="margin-top:4px;padding:2px 6px;border-radius:4px;font-size:10.5px;background:hsl(var(--primary)/0.12);color:hsl(var(--primary))">Team sync</div></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">6</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">7</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">8</span><div style="margin-top:4px;padding:2px 6px;border-radius:4px;font-size:10.5px;background:hsl(142 71% 45%/0.12);color:hsl(142 71% 45%)">Deploy v3</div></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">9</span></div>
      <div style="padding:8px;min-height:80px;border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">10</span></div>

      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">11</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">12</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">13</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">14</span><div style="margin-top:4px;padding:2px 6px;border-radius:4px;font-size:10.5px;background:hsl(38 92% 50%/0.12);color:hsl(38 92% 50%)">Sprint review</div></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">15</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">16</span></div>
      <div style="padding:8px;min-height:80px;border-bottom:1px solid hsl(var(--border))"><span style="font-size:12px">17</span></div>

      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border))"><span style="font-size:12px">18</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border))"><span style="font-size:12px">19</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border))"><span style="font-size:12px">20</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border))"><span style="font-size:12px">21</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border))"><span style="font-size:12px">22</span></div>
      <div style="padding:8px;min-height:80px;border-right:1px solid hsl(var(--border))"><span style="font-size:12px">23</span></div>
      <div style="padding:8px;min-height:80px"><span style="font-size:12px;width:24px;height:24px;border-radius:50%;background:hsl(var(--primary));color:white;display:inline-flex;align-items:center;justify-content:center">24</span></div>
    </div>
  </div>
</div>`,
      },
    ],
  },

  // ── Detail with sidebar ─────────────────────────────────
  {
    slug: "detail-sidebar",
    name: "Detail with Sidebar",
    description: "Master-detail layout for a single record: main content area with items and timeline, persistent right sidebar with summary and metadata.",
    sections: [
      {
        title: "Order detail",
        anatomy: "Breadcrumb + PageHeader + 2-col grid (main 2fr + sidebar 1fr). Main: items table + timeline. Sidebar: customer card + shipping card + order summary.",
        html: `<div style="display:flex;flex-direction:column;gap:16px">
  <!-- Breadcrumb -->
  <nav class="breadcrumb"><a class="breadcrumb-item" href="#">Orders</a><span class="breadcrumb-sep">/</span><span class="breadcrumb-item active">ORD-2847</span></nav>

  <div class="page-header">
    <div class="page-header-text"><h2 class="page-header-title">ORD-2847</h2><p class="page-header-sub">Placed May 20, 2026</p></div>
    <div class="page-header-actions"><span class="status-badge sb-success"><span class="dot"></span> Fulfilled</span></div>
  </div>

  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px">
    <!-- Main column -->
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="section-card">
        <div class="section-card-header"><h3 class="section-card-title">Items</h3></div>
        <div class="section-card-body" style="padding:0">
          <table style="width:100%;font-size:13px;border-collapse:collapse">
            <thead><tr style="border-bottom:1px solid hsl(var(--border))">
              <th style="text-align:left;padding:10px 16px;font-weight:500;color:hsl(var(--muted-foreground));font-size:12px">Product</th>
              <th style="text-align:center;padding:10px 16px;font-weight:500;color:hsl(var(--muted-foreground));font-size:12px">Qty</th>
              <th style="text-align:right;padding:10px 16px;font-weight:500;color:hsl(var(--muted-foreground));font-size:12px">Price</th>
            </tr></thead>
            <tbody>
              <tr style="border-bottom:1px solid hsl(var(--border))"><td style="padding:10px 16px">Canvas Pro License</td><td style="padding:10px 16px;text-align:center">2</td><td style="padding:10px 16px;text-align:right">$198.00</td></tr>
              <tr style="border-bottom:1px solid hsl(var(--border))"><td style="padding:10px 16px">Priority Support (1yr)</td><td style="padding:10px 16px;text-align:center">1</td><td style="padding:10px 16px;text-align:right">$49.00</td></tr>
              <tr><td style="padding:10px 16px">Custom Theme Pack</td><td style="padding:10px 16px;text-align:center">1</td><td style="padding:10px 16px;text-align:right">$29.00</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section-card">
        <div class="section-card-header"><h3 class="section-card-title">Timeline</h3></div>
        <div class="section-card-body">
          <div style="display:flex;flex-direction:column;gap:0">
            <div style="display:flex;gap:12px;padding:8px 0"><span style="width:8px;height:8px;border-radius:50%;background:hsl(142 71% 45%);margin-top:5px;flex-shrink:0"></span><div><div style="font-size:13px;font-weight:500">Delivered</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">May 22, 2026, 2:15 PM</div></div></div>
            <div style="display:flex;gap:12px;padding:8px 0;border-top:1px solid hsl(var(--border))"><span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--primary));margin-top:5px;flex-shrink:0"></span><div><div style="font-size:13px;font-weight:500">Shipped</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">May 21, 2026, 9:30 AM</div></div></div>
            <div style="display:flex;gap:12px;padding:8px 0;border-top:1px solid hsl(var(--border))"><span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--muted-foreground));margin-top:5px;flex-shrink:0"></span><div><div style="font-size:13px;font-weight:500">Payment confirmed</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">May 20, 2026, 11:02 AM</div></div></div>
            <div style="display:flex;gap:12px;padding:8px 0;border-top:1px solid hsl(var(--border))"><span style="width:8px;height:8px;border-radius:50%;background:hsl(var(--muted-foreground));margin-top:5px;flex-shrink:0"></span><div><div style="font-size:13px;font-weight:500">Order placed</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">May 20, 2026, 10:58 AM</div></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="section-card">
        <div class="section-card-header"><h3 class="section-card-title">Customer</h3></div>
        <div class="section-card-body" style="display:flex;flex-direction:column;gap:8px;font-size:13px">
          <div style="display:flex;align-items:center;gap:10px"><span class="avatar avatar-sm" style="background:hsl(var(--primary));color:white"><img src="/rachel-chen.jpg" alt="RC"></span><div><div style="font-weight:500">Rachel Chen</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">rachel.chen@example.com</div></div></div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-card-header"><h3 class="section-card-title">Shipping</h3></div>
        <div class="section-card-body" style="font-size:13px;color:hsl(var(--muted-foreground));line-height:1.5">
          Rachel Chen<br>42 Innovation Drive<br>San Francisco, CA 94107<br>United States
        </div>
      </div>
      <div class="section-card">
        <div class="section-card-header"><h3 class="section-card-title">Summary</h3></div>
        <div class="section-card-body" style="font-size:13px;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between"><span style="color:hsl(var(--muted-foreground))">Subtotal</span><span>$276.00</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:hsl(var(--muted-foreground))">Shipping</span><span>$0.00</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:hsl(var(--muted-foreground))">Tax</span><span>$24.84</span></div>
          <div class="sep" style="margin:4px 0"></div>
          <div style="display:flex;justify-content:space-between;font-weight:600"><span>Total</span><span>$300.84</span></div>
        </div>
      </div>
    </div>
  </div>
</div>`,
      },
    ],
  },

  // ── Identities ──────────────────────────────────────────
  {
    slug: "identities",
    name: "Identities",
    description: "Searchable, filterable data table with bulk actions, row selection, and status badges. The canonical list-view template.",
    sections: [
      {
        title: "Identity table",
        anatomy: "PageHeader + toolbar (search + filter pills + bulk actions) + data table with checkbox selection + pagination footer.",
        html: `<div style="display:flex;flex-direction:column;gap:16px">
  <div class="page-header">
    <div class="page-header-text"><h2 class="page-header-title">Identities</h2><p class="page-header-sub">1,247 total</p></div>
    <div class="page-header-actions"><button class="btn btn-primary btn-sm">Add identity</button></div>
  </div>

  <div class="dt-wrap">
    <div class="dt-toolbar">
      <input class="input" placeholder="Search identities..." style="max-width:280px">
      <div style="display:flex;gap:6px;margin-left:auto">
        <button class="btn btn-outline btn-sm">Status</button>
        <button class="btn btn-outline btn-sm">Role</button>
      </div>
    </div>
    <table class="dt-table">
      <thead>
        <tr>
          <th style="width:40px"><input type="checkbox" class="checkbox"></th>
          <th>Identity</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Last sign-in</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input type="checkbox" class="checkbox"></td>
          <td><div style="display:flex;align-items:center;gap:8px"><span class="avatar avatar-sm" style="background:hsl(var(--primary));color:white;font-size:11px"><img src="/rachel-chen.jpg" alt="RC"></span><span style="font-weight:500">Rachel Chen</span></div></td>
          <td>rachel.chen@example.com</td>
          <td><span class="badge">admin</span></td>
          <td><span class="status-badge sb-success"><span class="dot"></span> Active</span></td>
          <td style="color:hsl(var(--muted-foreground))">2 min ago</td>
        </tr>
        <tr>
          <td><input type="checkbox" class="checkbox"></td>
          <td><div style="display:flex;align-items:center;gap:8px"><span class="avatar avatar-sm" style="background:hsl(262 83% 58%);color:white;font-size:11px"><img src="/ada-lovelace.jpg" alt="AL"></span><span style="font-weight:500">Ada Lovelace</span></div></td>
          <td>ada@example.com</td>
          <td><span class="badge badge-secondary">editor</span></td>
          <td><span class="status-badge sb-success"><span class="dot"></span> Active</span></td>
          <td style="color:hsl(var(--muted-foreground))">1 hour ago</td>
        </tr>
        <tr>
          <td><input type="checkbox" class="checkbox"></td>
          <td><div style="display:flex;align-items:center;gap:8px"><span class="avatar avatar-sm" style="background:hsl(173 70% 42%);color:white;font-size:11px">KT</span><span style="font-weight:500">Kevin Turner</span></div></td>
          <td>kevin@example.com</td>
          <td><span class="badge badge-secondary">viewer</span></td>
          <td><span class="status-badge sb-warning"><span class="dot"></span> Pending</span></td>
          <td style="color:hsl(var(--muted-foreground))">3 days ago</td>
        </tr>
        <tr>
          <td><input type="checkbox" class="checkbox"></td>
          <td><div style="display:flex;align-items:center;gap:8px"><span class="avatar avatar-sm" style="background:hsl(346 78% 58%);color:white;font-size:11px">LB</span><span style="font-weight:500">Linus Berg</span></div></td>
          <td>linus.berg@example.com</td>
          <td><span class="badge badge-secondary">editor</span></td>
          <td><span class="status-badge sb-error"><span class="dot"></span> Locked</span></td>
          <td style="color:hsl(var(--muted-foreground))">1 week ago</td>
        </tr>
      </tbody>
    </table>
    <div class="dt-footer">
      <span style="font-size:12.5px;color:hsl(var(--muted-foreground))">Showing 1-4 of 1,247</span>
      <div style="display:flex;gap:4px;margin-left:auto">
        <button class="btn btn-outline btn-sm" disabled>Previous</button>
        <button class="btn btn-outline btn-sm">Next</button>
      </div>
    </div>
  </div>
</div>`,
      },
    ],
  },

  // ── Onboarding ──────────────────────────────────────────
  {
    slug: "onboarding",
    name: "Onboarding",
    description: "Multi-step wizard with progress indicator, form sections, and completion state. Guides new users through initial setup.",
    sections: [
      {
        title: "Wizard flow",
        anatomy: "Progress bar (step dots + connecting line) + card with form fields + navigation buttons (Back / Continue). Three steps: Profile, Workspace, Team.",
        html: `<div style="max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:24px">
  <!-- Progress -->
  <div style="display:flex;align-items:center;justify-content:center;gap:0">
    <div style="display:flex;align-items:center;gap:8px">
      <span style="width:32px;height:32px;border-radius:50%;background:hsl(var(--primary));color:white;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">1</span>
      <span style="font-size:13px;font-weight:500">Profile</span>
    </div>
    <div style="width:48px;height:2px;background:hsl(var(--primary));margin:0 8px"></div>
    <div style="display:flex;align-items:center;gap:8px">
      <span style="width:32px;height:32px;border-radius:50%;background:hsl(var(--primary));color:white;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">2</span>
      <span style="font-size:13px;font-weight:500">Workspace</span>
    </div>
    <div style="width:48px;height:2px;background:hsl(var(--border));margin:0 8px"></div>
    <div style="display:flex;align-items:center;gap:8px">
      <span style="width:32px;height:32px;border-radius:50%;border:2px solid hsl(var(--border));color:hsl(var(--muted-foreground));display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">3</span>
      <span style="font-size:13px;color:hsl(var(--muted-foreground))">Team</span>
    </div>
  </div>

  <!-- Current step card -->
  <div class="card">
    <div class="card-header">
      <h3 style="margin:0 0 4px;font-size:18px;font-weight:600">Set up your workspace</h3>
      <p style="margin:0;font-size:13px;color:hsl(var(--muted-foreground))">Configure the basics for your team's environment.</p>
    </div>
    <div class="card-content" style="display:flex;flex-direction:column;gap:14px">
      <div><label class="label">Workspace name</label><input class="input" value="Acme Corp"></div>
      <div><label class="label">Workspace URL</label>
        <div style="display:flex;align-items:center;gap:0">
          <span style="padding:0 12px;height:36px;display:inline-flex;align-items:center;font-size:13px;color:hsl(var(--muted-foreground));background:hsl(var(--muted));border:1px solid hsl(var(--border));border-right:0;border-radius:var(--radius-md,8px) 0 0 var(--radius-md,8px)">app.canvas.dev/</span>
          <input class="input" value="acme-corp" style="border-radius:0 var(--radius-md,8px) var(--radius-md,8px) 0">
        </div>
      </div>
      <div><label class="label">Default timezone</label>
        <select class="input"><option>America/Los_Angeles (UTC-7)</option><option>America/New_York (UTC-4)</option><option>Europe/London (UTC+1)</option></select>
      </div>
    </div>
    <div class="card-footer" style="display:flex;justify-content:space-between">
      <button class="btn btn-ghost">Back</button>
      <button class="btn btn-primary">Continue</button>
    </div>
  </div>
</div>`,
      },
    ],
  },

  // ── Profile ─────────────────────────────────────────────
  {
    slug: "profile",
    name: "Profile",
    description: "Single-record detail page with hero card, stat strip, tabbed interface, and content grid. Used for user profiles, entity details, and record views.",
    sections: [
      {
        title: "Profile detail",
        anatomy: "Breadcrumb + hero card (avatar, name, role, stat strip) + tab bar + 2-col content grid (traits list + metadata sidebar).",
        html: `<div style="display:flex;flex-direction:column;gap:16px">
  <nav class="breadcrumb"><a class="breadcrumb-item" href="#">Team</a><span class="breadcrumb-sep">/</span><span class="breadcrumb-item active">Rachel Chen</span></nav>

  <!-- Hero card -->
  <div class="section-card" style="padding:24px">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
      <span class="avatar avatar-lg" style="background:hsl(var(--primary));color:white;font-size:20px"><img src="/rachel-chen.jpg" alt="RC"></span>
      <div style="flex:1">
        <h2 style="margin:0;font-size:20px;font-weight:600">Rachel Chen</h2>
        <p style="margin:2px 0 8px;font-size:13px;color:hsl(var(--muted-foreground))">Engineering Lead</p>
        <div style="display:flex;gap:6px">
          <span class="status-badge sb-success"><span class="dot"></span> Active</span>
          <span class="badge badge-secondary">admin</span>
          <span class="badge badge-outline">MFA enabled</span>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline btn-sm">Edit</button>
        <button class="btn btn-ghost btn-sm btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
      </div>
    </div>
    <!-- Stat strip -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding-top:16px;border-top:1px solid hsl(var(--border))">
      <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:hsl(var(--muted-foreground));margin-bottom:2px">Sessions</div><div style="font-size:18px;font-weight:600">24</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:hsl(var(--muted-foreground));margin-bottom:2px">Sign-ins (30d)</div><div style="font-size:18px;font-weight:600">142</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:hsl(var(--muted-foreground));margin-bottom:2px">Joined</div><div style="font-size:18px;font-weight:600">Jan 2024</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:hsl(var(--muted-foreground));margin-bottom:2px">Last active</div><div style="font-size:18px;font-weight:600">2 min ago</div></div>
    </div>
  </div>

  <!-- Tabs -->
  <div style="display:flex;gap:0;border-bottom:1px solid hsl(var(--border))">
    <button style="padding:10px 16px;font-size:13px;font-weight:500;border:none;background:none;cursor:pointer;border-bottom:2px solid hsl(var(--primary));color:hsl(var(--foreground))">Overview</button>
    <button style="padding:10px 16px;font-size:13px;font-weight:500;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;color:hsl(var(--muted-foreground))">Sessions</button>
    <button style="padding:10px 16px;font-size:13px;font-weight:500;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;color:hsl(var(--muted-foreground))">Audit log</button>
    <button style="padding:10px 16px;font-size:13px;font-weight:500;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;color:hsl(var(--muted-foreground))">Credentials</button>
  </div>

  <!-- Content grid -->
  <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px">
    <div class="section-card">
      <div class="section-card-header"><h3 class="section-card-title">Traits</h3></div>
      <div class="section-card-body" style="padding:0">
        <div style="display:flex;flex-direction:column">
          <div style="display:flex;padding:10px 16px;border-bottom:1px solid hsl(var(--border))"><span class="field-label" style="width:140px">Email</span><span class="field-value">rachel.chen@example.com</span></div>
          <div style="display:flex;padding:10px 16px;border-bottom:1px solid hsl(var(--border))"><span class="field-label" style="width:140px">Name</span><span class="field-value">Rachel Chen</span></div>
          <div style="display:flex;padding:10px 16px;border-bottom:1px solid hsl(var(--border))"><span class="field-label" style="width:140px">Department</span><span class="field-value">Engineering</span></div>
          <div style="display:flex;padding:10px 16px;border-bottom:1px solid hsl(var(--border))"><span class="field-label" style="width:140px">Location</span><span class="field-value">San Francisco, CA</span></div>
          <div style="display:flex;padding:10px 16px"><span class="field-label" style="width:140px">Timezone</span><span class="field-value">America/Los_Angeles</span></div>
        </div>
      </div>
    </div>
    <div class="section-card">
      <div class="section-card-header"><h3 class="section-card-title">Metadata</h3></div>
      <div class="section-card-body" style="font-size:13px;display:flex;flex-direction:column;gap:8px">
        <div><div style="color:hsl(var(--muted-foreground));font-size:12px;margin-bottom:1px">Identity ID</div><code style="font-size:11.5px">id_8f3a2b1c</code></div>
        <div><div style="color:hsl(var(--muted-foreground));font-size:12px;margin-bottom:1px">Schema</div><code style="font-size:11.5px">person_v2</code></div>
        <div><div style="color:hsl(var(--muted-foreground));font-size:12px;margin-bottom:1px">Created</div><span>Jan 15, 2024</span></div>
        <div><div style="color:hsl(var(--muted-foreground));font-size:12px;margin-bottom:1px">Updated</div><span>May 24, 2026</span></div>
      </div>
    </div>
  </div>
</div>`,
      },
    ],
  },

  // ── Settings ────────────────────────────────────────────
  {
    slug: "settings",
    name: "Settings",
    description: "Sidebar-navigated settings page with multiple sections: profile form, notification toggles, security options. Includes sticky save bar.",
    sections: [
      {
        title: "Settings layout",
        anatomy: "Sidebar navigation (vertical pill list) + main form area with section cards. Sticky save bar appears at the bottom when changes are made.",
        html: `<div style="display:grid;grid-template-columns:200px 1fr;gap:24px">
  <!-- Sidebar nav -->
  <nav style="display:flex;flex-direction:column;gap:2px">
    <a href="#" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:var(--radius-md,8px);font-size:13px;font-weight:500;background:hsl(var(--primary)/0.1);color:hsl(var(--primary));text-decoration:none">General</a>
    <a href="#" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:var(--radius-md,8px);font-size:13px;color:hsl(var(--muted-foreground));text-decoration:none">Profile</a>
    <a href="#" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:var(--radius-md,8px);font-size:13px;color:hsl(var(--muted-foreground));text-decoration:none">Notifications</a>
    <a href="#" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:var(--radius-md,8px);font-size:13px;color:hsl(var(--muted-foreground));text-decoration:none">Security</a>
    <a href="#" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:var(--radius-md,8px);font-size:13px;color:hsl(var(--muted-foreground));text-decoration:none">Billing</a>
    <a href="#" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:var(--radius-md,8px);font-size:13px;color:hsl(var(--muted-foreground));text-decoration:none">Team</a>
  </nav>

  <!-- Main form -->
  <div style="display:flex;flex-direction:column;gap:20px">
    <div>
      <h2 style="margin:0 0 4px;font-size:18px;font-weight:600">General</h2>
      <p style="margin:0;font-size:13px;color:hsl(var(--muted-foreground))">Manage your workspace settings and preferences.</p>
    </div>

    <div class="section-card">
      <div class="section-card-header"><h3 class="section-card-title">Workspace</h3></div>
      <div class="section-card-body" style="display:flex;flex-direction:column;gap:14px">
        <div><label class="label">Workspace name</label><input class="input" value="Acme Corp"></div>
        <div><label class="label">Workspace URL</label><input class="input" value="acme-corp" disabled></div>
        <div><label class="label">Default timezone</label><select class="input"><option>America/Los_Angeles (UTC-7)</option></select></div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-card-header"><h3 class="section-card-title">Notifications</h3></div>
      <div class="section-card-body" style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><div style="font-size:13px;font-weight:500">Email notifications</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">Receive email when important events occur</div></div>
          <label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label>
        </div>
        <div class="sep"></div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><div style="font-size:13px;font-weight:500">Security alerts</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">Get notified about suspicious activity</div></div>
          <label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label>
        </div>
        <div class="sep"></div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><div style="font-size:13px;font-weight:500">Weekly digest</div><div style="font-size:12px;color:hsl(var(--muted-foreground))">Summary of activity sent every Monday</div></div>
          <label class="switch"><input type="checkbox"><span class="switch-slider"></span></label>
        </div>
      </div>
    </div>

    <!-- Save bar -->
    <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 16px;border-radius:var(--radius-lg,12px);background:hsl(var(--card));border:1px solid hsl(var(--border))">
      <span style="font-size:13px;color:hsl(var(--muted-foreground));margin-right:auto">Unsaved changes</span>
      <button class="btn btn-ghost btn-sm">Discard</button>
      <button class="btn btn-primary btn-sm">Save changes</button>
    </div>
  </div>
</div>`,
      },
    ],
  },
];

export function getTemplate(slug: string): TemplateDoc | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function getAllTemplates(): TemplateDoc[] {
  return TEMPLATES;
}
