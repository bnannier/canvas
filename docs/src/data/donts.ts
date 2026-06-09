// Do / Don't examples rendered with the REAL Canvas components.
//
// The component pages used to render guidance examples from hand-authored HTML
// strings (data/components.ts `donts`), styled to imitate the components. This
// map replaces them with `El` descriptor trees the page renders through the
// registry's renderTree, so a Do/Don't shows the actual <Button>, <ButtonGroup>,
// etc. from @olympusoss/canvas, the same single-source path the playground uses.
//
// Each side is normally a `tree` (a real component). The exception is a Don't
// that depicts an anti-pattern the real component cannot produce (e.g. a split
// button with no divider, which the real ButtonGroup always draws): those keep a
// self-contained `html` mock, since the whole point is the component does it
// right. component-page.tsx renders `tree` via renderTree, else the `html`.
//
// A slug present here wins over its legacy `donts` in data/components.ts; a slug
// absent here still falls back to that legacy HTML.

import type { El } from "@/jsx-code";

export interface DontDoSide {
  /** A real-component element tree, resolved against the registry COMPONENT_MAP. */
  tree?: El;
  /** Fallback static markup, only for anti-patterns the real component can't show. */
  html?: string;
  caption: string;
}

export interface DontDoExample {
  title?: string;
  dont: DontDoSide;
  do: DontDoSide;
}

export const DONTS: Record<string, DontDoExample[]> = {
  "button-group": [
    {
      title: "Segmented",
      dont: {
        tree: { type: "ButtonGroup", props: { segmented: true, active: 0, items: ["Day", "Week", "Month", "Quarter", "Year", "5Y", "All"] } },
        caption: "Past ~4 options a segmented control gets cramped and hard to scan; reach for a select.",
      },
      do: {
        tree: { type: "ButtonGroup", props: { segmented: true, active: 0, items: ["Day", "Week", "Month"] } },
        caption: "Keep a segmented control to a few mutually-exclusive views.",
      },
    },
    {
      title: "Attached",
      dont: {
        tree: { type: "ButtonGroup", props: { segmented: true, active: -1, items: ["Save", "Delete", "Export"] } },
        caption: "Attaching unrelated actions implies they belong to one control.",
      },
      do: {
        tree: { type: "ButtonGroup", props: { stepper: true, active: 1, items: ["Yesterday", "Today", "Tomorrow"] } },
        caption: "Reserve attached groups for closely-related actions like prev / today / next.",
      },
    },
    {
      title: "Split",
      dont: {
        // The real ButtonGroup split always draws the hairline divider, so the
        // anti-pattern (a split with no divider) can only be a static mock.
        html: `<div class="inline-flex"><button class="inline-flex items-center justify-center h-9 px-4 rounded-l-md bg-primary text-primary-foreground text-sm font-medium">Save</button><button class="inline-flex items-center justify-center h-9 px-2 rounded-r-md bg-primary text-primary-foreground"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button></div>`,
        caption: "With no divider the chevron looks like part of one button, hiding the menu.",
      },
      do: {
        tree: { type: "ButtonGroup", props: { split: true, items: ["Save"], menu: ["Save as draft", "Save and close", "Save a copy"] } },
        caption: "Separate the chevron with a hairline so the secondary menu reads as distinct.",
      },
    },
  ],
  avatar: [
    {
      title: "Single",
      dont: {
        html: "<span class=\"inline-flex h-10 w-10 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted text-[12px] font-medium text-muted-foreground\">ABCD</span>",
        caption: "Cramming in a full set of initials shrinks the type and crowds the circle."
      },
      do: {
        tree: { type: "Avatar", props: { name: "AO" } },
        caption: "One or two initials, sized about 40% of the diameter."
      }
    },
    {
      title: "Stacked",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center" },
          children: [
            { type: "Avatar", props: { small: true, ring: true, name: "AO" } },
            {
              type: "Avatar",
              props: { small: true, ring: true, name: "RC", className: "-ml-2.5" }
            },
            {
              type: "Avatar",
              props: { small: true, ring: true, name: "LB", className: "-ml-2.5" }
            },
            {
              type: "Avatar",
              props: { small: true, ring: true, name: "KT", className: "-ml-2.5" }
            },
            {
              type: "Avatar",
              props: { small: true, ring: true, name: "JD", className: "-ml-2.5" }
            },
            {
              type: "Avatar",
              props: { small: true, ring: true, name: "MA", className: "-ml-2.5" }
            },
            {
              type: "Avatar",
              props: { small: true, ring: true, name: "AL", className: "-ml-2.5" }
            },
            {
              type: "Avatar",
              props: { small: true, ring: true, name: "SK", className: "-ml-2.5" }
            }
          ]
        },
        caption: "An unbounded stack runs off the row and stops being scannable."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center" },
          children: [
            { type: "Avatar", props: { small: true, ring: true, name: "AO" } },
            {
              type: "Avatar",
              props: { small: true, ring: true, name: "RC", className: "-ml-2.5" }
            },
            {
              type: "Avatar",
              props: { small: true, ring: true, name: "LB", className: "-ml-2.5" }
            },
            {
              type: "Avatar",
              props: { small: true, ring: true, name: "KT", className: "-ml-2.5" }
            },
            {
              type: "Text",
              props: { className: "ml-1.5 text-xs text-muted-foreground" },
              children: "+12"
            }
          ]
        },
        caption: "Cap the stack and summarize the rest with a +N count."
      }
    },
    {
      title: "Topbar account menu",
      dont: {
        tree: {
          type: "Avatar",
          props: { small: true, src: "/marcus-allen.jpg", name: "MA" }
        },
        caption: "A lone avatar gives no hint that it opens the account menu."
      },
      do: {
        tree: {
          type: "View",
          props: {
            className: "flex-row items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5"
          },
          children: [
            {
              type: "Avatar",
              props: { small: true, src: "/marcus-allen.jpg", name: "MA" }
            },
            {
              type: "Text",
              props: { className: "text-sm font-medium text-foreground" },
              children: "admin@example.com"
            },
            { type: "Icon", props: { chevronDown: true, muted: true, size: 12 } }
          ]
        },
        caption: "Pair it with the account name and a chevron so it reads as a trigger."
      }
    },
    {
      title: "Identity",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-4" },
          children: [
            { type: "Avatar", props: { src: "/rachel-chen.jpg", name: "RC" } },
            {
              type: "View",
              children: [
                {
                  type: "Text",
                  props: { className: "text-sm text-foreground" },
                  children: "Rachel Chen"
                },
                {
                  type: "Text",
                  props: { className: "text-sm text-foreground" },
                  children: "rachel.chen@example.com"
                }
              ]
            }
          ]
        },
        caption: "Equal weight on the name and email flattens the hierarchy."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-4" },
          children: [
            { type: "Avatar", props: { src: "/rachel-chen.jpg", name: "RC" } },
            {
              type: "View",
              children: [
                {
                  type: "Text",
                  props: { className: "text-base font-semibold text-foreground" },
                  children: "Rachel Chen"
                },
                {
                  type: "Text",
                  props: { className: "text-sm text-muted-foreground" },
                  children: "rachel.chen@example.com"
                }
              ]
            }
          ]
        },
        caption: "Name primary; email muted and secondary."
      }
    },
    {
      title: "Menu header",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-3" },
          children: [
            {
              type: "Avatar",
              props: { rounded: true, src: "/ada-lovelace.jpg", name: "AL" }
            },
            {
              type: "View",
              children: [
                {
                  type: "Text",
                  props: { className: "text-sm font-semibold text-foreground" },
                  children: "Ada Lovelace"
                },
                {
                  type: "Text",
                  props: { className: "text-xs text-muted-foreground" },
                  children: "admin@example.com"
                }
              ]
            }
          ]
        },
        caption: "Squaring the avatar here clashes with the circular avatars everywhere else."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-3" },
          children: [
            { type: "Avatar", props: { src: "/ada-lovelace.jpg", name: "AL" } },
            {
              type: "View",
              children: [
                {
                  type: "Text",
                  props: { className: "text-sm font-semibold text-foreground" },
                  children: "Ada Lovelace"
                },
                {
                  type: "Text",
                  props: { className: "text-xs text-muted-foreground" },
                  children: "admin@example.com"
                }
              ]
            }
          ]
        },
        caption: "Keep one consistent circular avatar shape across contexts."
      }
    }
  ],
  badge: [
    {
      title: "Metadata badge",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-center gap-1.5" },
          children: [
            { type: "Badge", props: { default: true }, children: "employee" },
            { type: "Badge", props: { destructive: true }, children: "engineering" },
            { type: "Badge", props: { default: true }, children: "remote" },
            { type: "Badge", props: { destructive: true }, children: "active" }
          ]
        },
        caption: "Borrowing status colors for plain metadata reads as severity that isn't there; a red tag looks like an error."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-center gap-1.5" },
          children: [
            { type: "Badge", props: { secondary: true }, children: "employee" },
            { type: "Badge", props: { secondary: true }, children: "engineering" },
            { type: "Badge", props: { secondary: true }, children: "remote" },
            { type: "Badge", props: { status: true, success: true }, children: "active" }
          ]
        },
        caption: "Neutral tags for metadata; reserve color and the status-badge dot for live state."
      }
    },
    {
      title: "Status badge",
      dont: {
        tree: { type: "Badge", props: { status: true, error: true } },
        caption: "A bare colored dot isn't a label and fails for color-blind users."
      },
      do: {
        tree: { type: "Badge", props: { status: true, error: true }, children: "Failed" },
        caption: "Always pair the dot with a word: active, pending, failed."
      }
    },
    {
      title: "Identity row",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-center gap-2" },
          children: [
            {
              type: "Text",
              props: { className: "text-[15px] font-semibold text-foreground" },
              children: "Rachel Chen"
            },
            { type: "Badge", props: { status: true, success: true }, children: "active" },
            { type: "Badge", props: { status: true, info: true }, children: "Verified" },
            { type: "Badge", props: { secondary: true }, children: "employee" },
            { type: "Badge", props: { secondary: true }, children: "engineering" },
            { type: "Badge", props: { secondary: true }, children: "remote" },
            { type: "Badge", props: { secondary: true }, children: "admin" }
          ]
        },
        caption: "A wall of badges after a name buries the one that matters."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-center gap-2" },
          children: [
            {
              type: "Text",
              props: { className: "text-[15px] font-semibold text-foreground" },
              children: "Rachel Chen"
            },
            { type: "Badge", props: { status: true, success: true }, children: "active" },
            { type: "Badge", props: { secondary: true }, children: "employee" }
          ]
        },
        caption: "Show only the one or two badges relevant to this view."
      }
    },
    {
      title: "Token / code badge",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap gap-1" },
          children: [
            { type: "Badge", props: { secondary: true }, children: "authorization_code" },
            { type: "Badge", props: { secondary: true }, children: "refresh_token" },
            { type: "Badge", props: { secondary: true }, children: "client_credentials" }
          ]
        },
        caption: "Proportional type makes identifiers hard to scan and compare."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap gap-1" },
          children: [
            {
              type: "Badge",
              props: { secondary: true, mono: true },
              children: "authorization_code"
            },
            {
              type: "Badge",
              props: { secondary: true, mono: true },
              children: "refresh_token"
            },
            {
              type: "Badge",
              props: { secondary: true, mono: true },
              children: "client_credentials"
            }
          ]
        },
        caption: "Use the mono variant for tokens, scopes, and event names."
      }
    },
    {
      title: "Default variant",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-center gap-1.5" },
          children: [
            { type: "Badge", props: { default: true }, children: "employee" },
            { type: "Badge", props: { default: true }, children: "engineering" },
            { type: "Badge", props: { default: true }, children: "remote" },
            { type: "Badge", props: { default: true }, children: "admin" }
          ]
        },
        caption: "The solid primary fill is the loudest badge; using it for every tag makes the whole row shout and nothing leads."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-center gap-1.5" },
          children: [
            { type: "Badge", props: { default: true }, children: "admin" },
            { type: "Badge", props: { secondary: true }, children: "engineering" },
            { type: "Badge", props: { secondary: true }, children: "remote" }
          ]
        },
        caption: "Reserve the default fill for the single tag you want noticed first; keep the rest secondary."
      }
    },
    {
      title: "Secondary variant",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-center gap-1.5" },
          children: [
            { type: "Badge", props: { secondary: true }, children: "active" },
            { type: "Badge", props: { secondary: true }, children: "pending" },
            { type: "Badge", props: { secondary: true }, children: "failed" }
          ]
        },
        caption: "A muted gray pill reads as static metadata, so live state shown as a secondary badge looks inert and goes unnoticed."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-center gap-1.5" },
          children: [
            { type: "Badge", props: { secondary: true }, children: "employee" },
            { type: "Badge", props: { secondary: true }, children: "engineering" },
            { type: "Badge", props: { status: true, success: true }, children: "active" }
          ]
        },
        caption: "Keep secondary for static metadata (role, team) and switch to the status-badge for anything live."
      }
    },
    {
      title: "Outline variant",
      dont: {
        tree: {
          type: "View",
          props: {
            className: "flex-row flex-wrap items-center gap-1.5 rounded-md bg-primary p-3"
          },
          children: [
            { type: "Badge", props: { outline: true }, children: "draft" },
            { type: "Badge", props: { outline: true }, children: "internal" }
          ]
        },
        caption: "The thin border is the whole badge; on a colored or busy surface it disappears and the label floats unboxed."
      },
      do: {
        tree: {
          type: "View",
          props: {
            className: "flex-row flex-wrap items-center gap-1.5 rounded-md border border-border bg-card p-3"
          },
          children: [
            { type: "Badge", props: { outline: true }, children: "draft" },
            { type: "Badge", props: { outline: true }, children: "internal" }
          ]
        },
        caption: "Use outline on a plain surface where the quiet border has contrast, for low-priority secondary tags."
      }
    },
    {
      title: "Destructive variant",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-center gap-1.5" },
          children: [
            { type: "Badge", props: { destructive: true }, children: "marketing" },
            { type: "Badge", props: { destructive: true }, children: "finance" },
            { type: "Badge", props: { destructive: true }, children: "legal" }
          ]
        },
        caption: "Solid red signals error or danger, so using it to color-code neutral categories raises a false alarm."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-center gap-1.5" },
          children: [
            { type: "Badge", props: { destructive: true }, children: "Revoked" },
            { type: "Badge", props: { destructive: true }, children: "Banned" },
            { type: "Badge", props: { secondary: true }, children: "marketing" }
          ]
        },
        caption: "Reserve destructive for genuinely destructive or error semantics like revoked or banned."
      }
    }
  ],
  breadcrumb: [
    {
      title: "Current page",
      dont: {
        html: "<nav class=\"flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground\"><a href=\"#\" class=\"transition-colors hover:text-foreground\">Projects</a><span class=\"select-none text-muted-foreground/60\">/</span><a href=\"#\" class=\"transition-colors hover:text-foreground\">Identity Platform</a><span class=\"select-none text-muted-foreground/60\">/</span><a href=\"#\" class=\"transition-colors hover:text-foreground\">Settings</a></nav>",
        caption: "Linking the current page implies there's somewhere to go; it's a dead link to itself."
      },
      do: {
        tree: {
          type: "Breadcrumb",
          props: { items: ["Projects", "Identity Platform", "Settings"] }
        },
        caption: "Ancestors are links; the page you're on is plain text at the end of the trail."
      }
    },
    {
      title: "Deep paths",
      dont: {
        tree: {
          type: "Breadcrumb",
          props: {
            items: ["Projects", "Identity Platform", "Settings", "Profile", "Avatar", "Edit"]
          }
        },
        caption: "A fully expanded deep path wraps and competes with the page."
      },
      do: {
        html: "<nav class=\"flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground\"><a href=\"#\" class=\"transition-colors hover:text-foreground\">Projects</a><span class=\"select-none text-muted-foreground/60\">›</span><span class=\"px-1 text-muted-foreground\">…</span><span class=\"select-none text-muted-foreground/60\">›</span><a href=\"#\" class=\"transition-colors hover:text-foreground\">Avatar</a><span class=\"select-none text-muted-foreground/60\">›</span><span class=\"font-medium text-foreground\">Edit</span></nav>",
        caption: "Collapse the middle to an ellipsis; keep the root and the last couple of levels."
      }
    },
    {
      title: "Separator",
      dont: {
        html: "<nav class=\"flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground\"><a href=\"#\" class=\"transition-colors hover:text-foreground\">Projects</a><span class=\"select-none text-muted-foreground/60\">/</span><a href=\"#\" class=\"transition-colors hover:text-foreground\">Identity Platform</a><span class=\"select-none text-muted-foreground/60\">›</span><span class=\"font-medium text-foreground\">Settings</span></nav>",
        caption: "Mixing separators in one trail looks broken."
      },
      do: {
        tree: {
          type: "Breadcrumb",
          props: { items: ["Projects", "Identity Platform", "Settings"] }
        },
        caption: "Pick one separator and use it the whole way."
      }
    },
    {
      title: "Home root",
      dont: {
        html: "<nav class=\"flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground\"><a href=\"#\" class=\"transition-colors hover:text-foreground\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg></a><span class=\"select-none text-muted-foreground/60\">/</span><span class=\"font-medium text-foreground\">Settings</span></nav>",
        caption: "An icon-only root with no label is unclear to screen readers."
      },
      do: {
        tree: { type: "Breadcrumb", props: { homeIcon: true, items: ["Settings"] } },
        caption: "Give the home icon an aria-label so the root is announced."
      }
    },
    {
      title: "Chevron",
      dont: {
        html: "<nav class=\"flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground\"><a href=\"#\" class=\"transition-colors hover:text-foreground\">Projects</a><span class=\"select-none text-muted-foreground/60\"><svg width=\"11\" height=\"11\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m6 9 6 6 6-6\"/></svg></span><a href=\"#\" class=\"transition-colors hover:text-foreground\">Identity Platform</a><span class=\"select-none text-muted-foreground/60\"><svg width=\"11\" height=\"11\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m6 9 6 6 6-6\"/></svg></span><span class=\"font-medium text-foreground\">Settings</span></nav>",
        caption: "A down (or back) chevron reads as a dropdown or a back affordance, not progression down the hierarchy."
      },
      do: {
        tree: {
          type: "Breadcrumb",
          props: { chevron: true, items: ["Projects", "Identity Platform", "Settings"] }
        },
        caption: "Point the chevron in the reading direction (right in LTR) so each one means 'drill into the next level'."
      }
    },
    {
      title: "Slash",
      dont: {
        html: "<nav class=\"flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground\"><a href=\"#\" class=\"transition-colors hover:text-foreground\">Projects</a><span class=\"px-1 font-medium text-foreground\">/</span><a href=\"#\" class=\"transition-colors hover:text-foreground\">Identity Platform</a><span class=\"px-1 font-medium text-foreground\">/</span><span class=\"font-medium text-foreground\">Settings</span></nav>",
        caption: "A full-weight, foreground slash competes with the labels and can read as part of a link."
      },
      do: {
        tree: {
          type: "Breadcrumb",
          props: { slash: true, items: ["Projects", "Identity Platform", "Settings"] }
        },
        caption: "Keep the slash muted and lighter than the text so it reads as a quiet path divider."
      }
    },
    {
      title: "Dot",
      dont: {
        html: "<nav class=\"flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground\"><a href=\"#\" class=\"transition-colors hover:text-foreground\">Projects</a><span class=\"select-none text-muted-foreground/60\">.</span><a href=\"#\" class=\"transition-colors hover:text-foreground\">Identity Platform</a><span class=\"select-none text-muted-foreground/60\">.</span><span class=\"font-medium text-foreground\">Settings</span></nav>",
        caption: "A baseline period looks like a typo or end-of-sentence, not a separator between crumbs."
      },
      do: {
        tree: {
          type: "Breadcrumb",
          props: { dot: true, items: ["Projects", "Identity Platform", "Settings"] }
        },
        caption: "Use a centered middot (·) so the dot sits between the crumbs and clearly divides them."
      }
    }
  ],
  button: [
    {
      title: "Default (primary)",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-2" },
          children: [
            { type: "Button", props: { primary: true }, children: "Save" },
            { type: "Button", props: { primary: true }, children: "Apply" },
            { type: "Button", props: { primary: true }, children: "Continue" }
          ]
        },
        caption: "Multiple primaries compete; nothing stands out."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-2" },
          children: [
            { type: "Button", props: { primary: true }, children: "Save" },
            { type: "Button", props: { outline: true }, children: "Cancel" }
          ]
        },
        caption: "One clear primary action; everything else is supporting."
      }
    },
    {
      title: "Outline",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-2" },
          children: [
            { type: "Button", props: { outline: true }, children: "Save" },
            { type: "Button", props: { outline: true }, children: "Publish" },
            { type: "Button", props: { outline: true }, children: "Schedule" }
          ]
        },
        caption: "All-outline leaves no signal which action is primary."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-2" },
          children: [
            { type: "Button", props: { primary: true }, children: "Publish" },
            { type: "Button", props: { outline: true }, children: "Save draft" },
            { type: "Button", props: { outline: true }, children: "Schedule" }
          ]
        },
        caption: "Promote the main action to default; keep the rest outline."
      }
    },
    {
      title: "Secondary",
      dont: {
        tree: { type: "Button", props: { secondary: true }, children: "Create account" },
        caption: "A secondary button as the main call to action under-sells it."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-2" },
          children: [
            { type: "Button", props: { primary: true }, children: "Create account" },
            { type: "Button", props: { secondary: true }, children: "Import instead" }
          ]
        },
        caption: "Default for the primary action; secondary for the next one down."
      }
    },
    {
      title: "Ghost",
      dont: {
        tree: { type: "Button", props: { ghost: true }, children: "Save changes" },
        caption: "A ghost button is too quiet to carry the primary action."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-2" },
          children: [
            { type: "Button", props: { ghost: true }, children: "Cancel" },
            { type: "Button", props: { primary: true }, children: "Save changes" }
          ]
        },
        caption: "Use ghost for tertiary and toolbar actions; keep the CTA filled."
      }
    },
    {
      title: "Destructive",
      dont: {
        tree: { type: "Button", props: { destructive: true }, children: "Save changes" },
        caption: "Red on a safe action cries wolf; users learn to ignore it."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-2" },
          children: [
            { type: "Button", props: { primary: true }, children: "Save changes" },
            { type: "Button", props: { destructive: true }, children: "Delete account" }
          ]
        },
        caption: "Reserve the destructive variant for irreversible actions like delete."
      }
    },
    {
      title: "Link",
      dont: {
        tree: { type: "Button", props: { link: true }, children: "Submit form" },
        caption: "A link-styled submit doesn't look pressable and gets lost."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-3" },
          children: [
            { type: "Button", props: { primary: true }, children: "Submit" },
            { type: "Button", props: { link: true }, children: "Learn more" }
          ]
        },
        caption: "Link variant for inline navigation; a filled button for the submit."
      }
    }
  ],
  checkbox: [
    {
      title: "Unchecked",
      dont: {
        tree: {
          type: "Checkbox",
          props: { checked: true },
          children: "Email me product news, offers, and survey invitations."
        },
        caption: "A consent box that starts checked opts users in by default; under GDPR pre-ticked consent is not consent."
      },
      do: {
        tree: {
          type: "Checkbox",
          children: "Email me product news, offers, and survey invitations."
        },
        caption: "Leave opt-in consent unchecked so agreeing is a deliberate act the user takes."
      }
    },
    {
      title: "Checked",
      dont: {
        tree: {
          type: "View",
          props: { className: "gap-2" },
          children: [
            { type: "Checkbox", props: { checked: true }, children: "Select all" },
            {
              type: "View",
              props: { className: "ml-6 gap-2" },
              children: [
                { type: "Checkbox", props: { checked: true }, children: "Read" },
                { type: "Checkbox", children: "Write" },
                { type: "Checkbox", children: "Delete" }
              ]
            }
          ]
        },
        caption: "A fully checked parent claims every child is selected when only one is, so the state reads as a lie."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "gap-2" },
          children: [
            { type: "Checkbox", props: { indeterminate: true }, children: "Select all" },
            {
              type: "View",
              props: { className: "ml-6 gap-2" },
              children: [
                { type: "Checkbox", props: { checked: true }, children: "Read" },
                { type: "Checkbox", children: "Write" },
                { type: "Checkbox", children: "Delete" }
              ]
            }
          ]
        },
        caption: "Show the parent indeterminate (a dash, not a tick) when only some children are checked."
      }
    },
    {
      title: "Disabled",
      dont: {
        tree: { type: "Checkbox", props: { disabled: true }, children: "Export to CSV" },
        caption: "A disabled option with no reason leaves users stuck and guessing."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-1.5" },
          children: [
            { type: "Checkbox", props: { disabled: true }, children: "Export to CSV" },
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "(Pro plan)"
            }
          ]
        },
        caption: "Say why it's unavailable, like a plan gate, or don't show it at all."
      }
    },
    {
      title: "Selection",
      dont: {
        tree: {
          type: "View",
          props: { className: "gap-2" },
          children: [
            {
              type: "Text",
              props: { className: "mb-1 text-sm font-semibold text-foreground" },
              children: "Plan"
            },
            { type: "Checkbox", children: "Free" },
            { type: "Checkbox", props: { checked: true }, children: "Pro" },
            { type: "Checkbox", children: "Enterprise" }
          ]
        },
        caption: "Checkboxes allow multiple selections; for a one-of choice they let users pick contradictory options."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "gap-2" },
          children: [
            {
              type: "Text",
              props: { className: "mb-1 text-sm font-semibold text-foreground" },
              children: "Plan"
            },
            { type: "Radio", children: "Free" },
            { type: "Radio", props: { checked: true }, children: "Pro" },
            { type: "Radio", children: "Enterprise" }
          ]
        },
        caption: "Radios for one-of-many; reserve checkboxes for independent multi-select."
      }
    },
    {
      title: "With description",
      dont: {
        html: "<div class=\"flex gap-2 text-sm\"><input type=\"checkbox\" checked class=\"mt-0.5 size-4 accent-primary\"><div><div class=\"font-medium\">Email notifications</div><div class=\"text-xs text-muted-foreground\">Get notified when activity happens on your account.</div></div></div>",
        caption: "A bare div makes only the 16px box clickable; the label text does nothing."
      },
      do: {
        html: "<label class=\"flex cursor-pointer gap-2 text-sm\"><input type=\"checkbox\" checked class=\"mt-0.5 size-4 accent-primary\"><div><div class=\"font-medium\">Email notifications</div><div class=\"text-xs text-muted-foreground\">Get notified when activity happens on your account.</div></div></label>",
        caption: "Wrap the box, label, and description in a <label> so the whole row toggles."
      }
    }
  ],
  combobox: [
    {
      title: "When to use",
      dont: {
        tree: {
          type: "Combobox",
          props: {
            label: "Size",
            options: ["Small", "Medium", "Large"],
            open: true,
            placeholder: "Search…",
            className: "max-w-[280px]"
          }
        },
        caption: "Type or click: a search field for three fixed options is overhead with nothing to filter."
      },
      do: {
        tree: {
          type: "Select",
          props: {
            label: "Size",
            options: ["Small", "Medium", "Large"],
            open: true,
            placeholder: "Select a size",
            className: "max-w-[280px]"
          }
        },
        caption: "A plain select for short, fixed lists; reserve the combobox for long, searchable ones."
      }
    },
    {
      title: "Filtering",
      dont: {
        html: "<div class=\"max-w-[280px]\"><label class=\"mb-1.5 block text-sm font-medium\">Assigned to</label><div class=\"relative\"><div class=\"flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm\"><span class=\"text-foreground\">co</span><span class=\"text-muted-foreground\">▾</span></div><div class=\"absolute left-0 top-full z-20 mt-1 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md\"><div class=\"rounded-sm px-2 py-1.5 text-sm text-popover-foreground\">Wade Cooper</div><div class=\"rounded-sm px-2 py-1.5 text-sm text-popover-foreground\">Arlene Mccoy</div><div class=\"rounded-sm px-2 py-1.5 text-sm text-popover-foreground\">Devon Webb</div><div class=\"rounded-sm px-2 py-1.5 text-sm text-popover-foreground\">Tom Cook</div><div class=\"rounded-sm px-2 py-1.5 text-sm text-popover-foreground\">Tanya Fox</div><div class=\"rounded-sm px-2 py-1.5 text-sm text-popover-foreground\">Hellen Schmidt</div></div></div></div>",
        caption: "Try typing: a search box that ignores input is just a dropdown wearing a costume."
      },
      do: {
        tree: {
          type: "Combobox",
          props: {
            label: "Assigned to",
            options: [
              "Wade Cooper",
              "Arlene Mccoy",
              "Devon Webb",
              "Tom Cook",
              "Tanya Fox",
              "Hellen Schmidt"
            ],
            query: "co",
            open: true,
            className: "max-w-[280px]"
          }
        },
        caption: "Type a few letters: the list narrows as you go, so a long list stays usable."
      }
    },
    {
      title: "Selection",
      dont: {
        html: "<div class=\"max-w-[280px]\"><label class=\"mb-1.5 block text-sm font-medium\">Assigned to</label><div class=\"relative\"><div class=\"flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm\"><span class=\"text-muted-foreground\">Pick a person…</span><span class=\"text-muted-foreground\">▾</span></div><div class=\"absolute left-0 top-full z-20 mt-1 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md\"><div class=\"flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground\"><span style=\"width:14px\">&nbsp;</span><span>Wade Cooper</span></div><div class=\"flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground\"><span style=\"width:14px\">&nbsp;</span><span>Arlene Mccoy</span></div><div class=\"flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground\"><span style=\"width:14px\">&nbsp;</span><span>Devon Webb</span></div><div class=\"flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground\"><span style=\"width:14px\">&nbsp;</span><span>Tom Cook</span></div></div></div></div>",
        caption: "Click an option: it flashes but the field stays empty, so you can't tell what you picked."
      },
      do: {
        tree: {
          type: "Combobox",
          props: {
            label: "Assigned to",
            options: ["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook"],
            value: "Devon Webb",
            open: true,
            className: "max-w-[280px]"
          }
        },
        caption: "Click an option: it fills the input and stays marked as selected."
      }
    },
    {
      title: "With label",
      dont: {
        tree: {
          type: "Combobox",
          props: {
            options: ["Wade Cooper", "Arlene Mccoy", "Devon Webb"],
            value: "Devon Webb",
            open: true,
            className: "max-w-[280px]"
          }
        },
        caption: "Once a value replaces the placeholder, an unlabeled field has nothing left to name it."
      },
      do: {
        tree: {
          type: "Combobox",
          props: {
            label: "Assigned to",
            options: ["Wade Cooper", "Arlene Mccoy", "Devon Webb"],
            value: "Devon Webb",
            open: true,
            className: "max-w-[280px]"
          }
        },
        caption: "A persistent label keeps the field named after a selection has filled the input."
      }
    },
    {
      title: "With helper text",
      dont: {
        tree: {
          type: "Combobox",
          props: {
            label: "Assigned to",
            options: ["Wade Cooper", "Arlene Mccoy", "Devon Webb"],
            open: true,
            placeholder: "Pick an active teammate; deactivated users are hidden",
            className: "max-w-[280px]"
          }
        },
        caption: "Type a letter: guidance crammed into the placeholder vanishes the moment you start."
      },
      do: {
        tree: {
          type: "Combobox",
          props: {
            label: "Assigned to",
            options: ["Wade Cooper", "Arlene Mccoy", "Devon Webb"],
            open: true,
            placeholder: "Search a person…",
            helperText: "Deactivated users are hidden from the list.",
            className: "max-w-[280px]"
          }
        },
        caption: "A short placeholder plus persistent helper text keeps the rule visible while you type."
      }
    },
    {
      title: "Disabled",
      dont: {
        tree: {
          type: "Combobox",
          props: {
            label: "Assigned to",
            options: ["Wade Cooper", "Arlene Mccoy", "Devon Webb"],
            open: false,
            disabled: true,
            placeholder: "Search a person…",
            className: "max-w-[280px]"
          }
        },
        caption: "An empty, dimmed field with no value reads as broken, not as intentionally locked."
      },
      do: {
        tree: {
          type: "Combobox",
          props: {
            label: "Assigned to",
            options: ["Wade Cooper", "Arlene Mccoy", "Devon Webb"],
            value: "Devon Webb",
            open: false,
            disabled: true,
            helperText: "Set by the project owner and can't be changed here.",
            className: "max-w-[280px]"
          }
        },
        caption: "Show the locked value and say why it's fixed, so disabled reads as a settled choice."
      }
    }
  ],
  divider: [
    {
      title: "Plain",
      dont: {
        tree: {
          type: "View",
          props: { className: "max-w-[280px]" },
          children: [
            {
              type: "Text",
              props: { className: "rounded-md px-2 py-1.5 text-sm" },
              children: "Profile"
            },
            { type: "Divider" },
            {
              type: "Text",
              props: { className: "rounded-md px-2 py-1.5 text-sm" },
              children: "Account"
            },
            { type: "Divider" },
            {
              type: "Text",
              props: { className: "rounded-md px-2 py-1.5 text-sm" },
              children: "Notifications"
            },
            { type: "Divider" },
            {
              type: "Text",
              props: { className: "rounded-md px-2 py-1.5 text-sm" },
              children: "Billing"
            }
          ]
        },
        caption: "Click a row: a divider between every one is noise that competes with the content."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[280px]" },
          children: [
            {
              type: "Text",
              props: { className: "rounded-md px-2 py-1.5 text-sm" },
              children: "Profile"
            },
            {
              type: "Text",
              props: { className: "rounded-md px-2 py-1.5 text-sm" },
              children: "Account"
            },
            {
              type: "Text",
              props: { className: "rounded-md px-2 py-1.5 text-sm" },
              children: "Notifications"
            },
            { type: "Divider", props: { className: "my-1" } },
            {
              type: "Text",
              props: { className: "rounded-md px-2 py-1.5 text-sm" },
              children: "Sign out"
            }
          ]
        },
        caption: "Click a row: group with spacing and reserve a divider for a real break like Sign out."
      }
    },
    {
      title: "With label",
      dont: {
        tree: {
          type: "View",
          props: { className: "w-80 flex-col gap-2" },
          children: [
            { type: "Button", props: { primary: true, block: true }, children: "Sign in" },
            {
              type: "Divider",
              children: "or continue with one of your previously linked third-party accounts"
            }
          ]
        },
        caption: "Click Sign in: a full sentence in the label divider buries the choice."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "w-80 flex-col gap-2" },
          children: [
            { type: "Button", props: { primary: true, block: true }, children: "Sign in" },
            { type: "Divider", children: "or continue with" },
            {
              type: "View",
              props: { className: "flex-row gap-2" },
              children: [
                {
                  type: "Button",
                  props: { outline: true, block: true, className: "flex-1" },
                  children: "Google"
                },
                {
                  type: "Button",
                  props: { outline: true, block: true, className: "flex-1" },
                  children: "GitHub"
                }
              ]
            }
          ]
        },
        caption: "Click a provider: keep the label to a few words and let the buttons carry the options."
      }
    },
    {
      title: "With action",
      dont: {
        tree: {
          type: "View",
          props: { className: "w-80" },
          children: {
            type: "Divider",
            children: { type: "Button", props: { ghost: true, small: true }, children: "Show more" }
          }
        },
        caption: "Click the button: an action divider that does nothing is just decoration."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "w-80 gap-1.5" },
          children: [
            {
              type: "Text",
              props: { className: "py-1.5 text-sm text-muted-foreground" },
              children: "Logged in from 2 new devices · 3 more entries"
            },
            {
              type: "Divider",
              children: { type: "Button", props: { ghost: true, small: true }, children: "Show less" }
            }
          ]
        },
        caption: "Click Show more: the button toggles its label and reveals the rest."
      }
    },
    {
      title: "Vertical",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-col items-start gap-2" },
          children: [
            { type: "Text", props: { className: "text-sm" }, children: "Edit" },
            { type: "Divider", props: { vertical: true, className: "h-4" } },
            { type: "Text", props: { className: "text-sm" }, children: "Delete" }
          ]
        },
        caption: "Click an action: a vertical rule between stacked items reads as a glitch."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-3" },
          children: [
            { type: "Text", props: { className: "text-sm" }, children: "Edit" },
            { type: "Divider", props: { vertical: true, className: "h-4" } },
            { type: "Text", props: { className: "text-sm" }, children: "Delete" },
            { type: "Divider", props: { vertical: true, className: "h-4" } },
            { type: "Text", props: { className: "text-sm" }, children: "Share" }
          ]
        },
        caption: "Click an action: the vertical rule separates inline actions in a row."
      }
    }
  ],
  dropdown: [
    {
      title: "Trigger",
      dont: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            open: true,
            items: [{ label: "Edit profile" }, { label: "Duplicate" }, { label: "Settings" }]
          }
        },
        caption: "Always open: it clutters the page and there's no way to dismiss it."
      },
      do: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            items: [{ label: "Edit profile" }, { label: "Duplicate" }, { label: "Settings" }]
          }
        },
        caption: "Click Actions to open; click outside to dismiss."
      }
    },
    {
      title: "Sectioning",
      dont: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            open: true,
            items: [
              { label: "New file" },
              { label: "New folder" },
              { label: "Upload" },
              { label: "Rename" },
              { label: "Duplicate" },
              { label: "Move to…" },
              { label: "Download" },
              { label: "Delete" }
            ]
          }
        },
        caption: "Click an item: a long, flat menu of eight actions is hard to scan."
      },
      do: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            open: true,
            label: "Create",
            items: [
              { label: "New file" },
              { label: "New folder" },
              { label: "Upload" },
              { label: "Rename", separatorBefore: true },
              { label: "Move to…" },
              { label: "Download" }
            ]
          }
        },
        caption: "Click an item: group related actions under labels with a separator."
      }
    },
    {
      title: "Leading icons",
      dont: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            open: true,
            items: [
              { label: "Edit", icon: "✎" },
              { label: "Duplicate" },
              { label: "Settings", icon: "⚙" }
            ]
          }
        },
        caption: "Click an item: icons on some rows but not others leave labels misaligned and the column ragged."
      },
      do: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            open: true,
            items: [
              { label: "Edit", icon: "✎" },
              { label: "Duplicate", icon: "⧉" },
              { label: "Settings", icon: "⚙" }
            ]
          }
        },
        caption: "Click an item: give every row a leading icon so labels share one start column."
      }
    },
    {
      title: "Keyboard shortcuts",
      dont: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            open: true,
            items: [
              { label: "Edit profile ⌘E" },
              { label: "Duplicate ⌘D" },
              { label: "Settings ⌘," }
            ]
          }
        },
        caption: "Click an item: hints inline after the label crowd the text and never line up into a readable column."
      },
      do: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            open: true,
            items: [
              { label: "Edit profile", shortcut: "⌘E" },
              { label: "Duplicate", shortcut: "⌘D" },
              { label: "Settings", shortcut: "⌘," }
            ]
          }
        },
        caption: "Click an item: push shortcuts to a muted, right-aligned column so the eye can scan them."
      }
    },
    {
      title: "Disabled item",
      dont: {
        html: "<div class=\"self-start rounded-md border border-border bg-popover p-1 shadow-lg\" style=\"min-width:200px\"><div class=\"flex flex-row items-center gap-2 rounded-sm px-2 py-1.5\"><span class=\"text-sm text-popover-foreground\">Edit</span></div><div class=\"flex flex-row items-center gap-2 rounded-sm px-2 py-1.5 opacity-50 cursor-pointer hover:bg-accent\" onclick=\"this.classList.add('bg-accent');var el=this;setTimeout(function(){el.classList.remove('bg-accent')},300)\"><span class=\"text-sm text-popover-foreground\">Archive</span></div><div class=\"flex flex-row items-center gap-2 rounded-sm px-2 py-1.5\"><span class=\"text-sm text-popover-foreground\">Duplicate</span></div></div>",
        caption: "Click Archive: it looks disabled but still fires, a greyed item that works is a trap."
      },
      do: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            open: true,
            items: [
              { label: "Edit" },
              { label: "Archive", disabled: true },
              { label: "Duplicate" }
            ]
          }
        },
        caption: "Click Archive: nothing happens; a real disabled item doesn't respond."
      }
    },
    {
      title: "Destructive item",
      dont: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            open: true,
            items: [{ label: "Edit" }, { label: "Delete" }, { label: "Duplicate" }]
          }
        },
        caption: "Click an item: a destructive action wedged between routine ones invites a costly misclick."
      },
      do: {
        tree: {
          type: "Dropdown",
          props: {
            trigger: "Actions",
            open: true,
            items: [
              { label: "Edit" },
              { label: "Duplicate" },
              { label: "Delete", destructive: true, separatorBefore: true }
            ]
          }
        },
        caption: "Click an item: separate destructive actions with a divider, color them, and place them last."
      }
    }
  ],
  icon: [
    {
      title: "Stroke coherence",
      dont: {
        html: "<div class=\"flex items-center gap-5\">\n  <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/></svg>\n  <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/></svg>\n  <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"currentColor\" stroke=\"none\"><path d=\"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9\"/></svg>\n</div>",
        caption: "Mixed stroke weights and a stray filled glyph make a set look incoherent."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-5" },
          children: [
            { type: "Icon", props: { home: true, size: 28 } },
            { type: "Icon", props: { search: true, size: 28 } },
            { type: "Icon", props: { bell: true, size: 28 } }
          ]
        },
        caption: "One outline style at 1.75 stroke across the whole set."
      }
    },
    {
      title: "foreground",
      dont: {
        html: "<svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#0a0a0a\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"/><polyline points=\"22,6 12,13 2,6\"/></svg>",
        caption: "Hard-coding a hex stroke pins the icon to one theme; it stays black on a dark surface and disappears."
      },
      do: {
        tree: { type: "Icon", props: { mail: true, size: 28 } },
        caption: "Leave stroke as currentColor and set text-foreground on the parent so it follows light and dark."
      }
    },
    {
      title: "primary",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-5" },
          children: [
            { type: "Icon", props: { home: true, primary: true, size: 22 } },
            { type: "Icon", props: { search: true, primary: true, size: 22 } },
            { type: "Icon", props: { settings: true, primary: true, size: 22 } }
          ]
        },
        caption: "Painting a whole toolbar primary spends the accent on everything, so nothing reads as emphasized."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-5" },
          children: [
            { type: "Icon", props: { home: true, muted: true, size: 22 } },
            { type: "Icon", props: { star: true, primary: true, size: 22 } },
            { type: "Icon", props: { settings: true, muted: true, size: 22 } }
          ]
        },
        caption: "Reserve text-primary for the one active or selected icon; keep the rest muted."
      }
    },
    {
      title: "destructive",
      dont: {
        tree: { type: "Icon", props: { download: true, destructive: true, size: 28 } },
        caption: "A red download icon implies danger on a perfectly safe action and trains users to ignore the warning color."
      },
      do: {
        tree: { type: "Icon", props: { trash: true, destructive: true, size: 28 } },
        caption: "Keep text-destructive for genuinely destructive actions like delete, so red always means consequence."
      }
    },
    {
      title: "muted",
      dont: {
        html: "<button class=\"inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground\"><span class=\"text-muted-foreground\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.75\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"/><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/></svg></span>New project</button>",
        caption: "A muted icon inside a solid primary button reads as disabled and clashes with the high-contrast label."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-1.5" },
          children: [
            { type: "Icon", props: { info: true, muted: true, size: 16 } },
            {
              type: "Text",
              props: { className: "text-sm text-muted-foreground" },
              children: "Optional, used only for recovery"
            }
          ]
        },
        caption: "Use text-muted-foreground for secondary, inline hint icons where its color matches the helper text."
      }
    }
  ],
  input: [
    {
      title: "text",
      dont: {
        tree: { type: "Input", props: { placeholder: "Email", className: "max-w-[320px]" } },
        caption: "A placeholder is not a label; it vanishes the moment the user types and screen readers may skip it."
      },
      do: {
        tree: {
          type: "Field",
          props: { label: "Email", placeholder: "ada@acme.dev", className: "max-w-[320px]" }
        },
        caption: "Pair every field with a persistent .label above the control."
      }
    },
    {
      title: "number",
      dont: {
        tree: {
          type: "Field",
          props: { label: "Storage", value: "1024 GB", className: "max-w-[320px]" }
        },
        caption: "A plain text field lets users type the unit into the value, breaking parsing and validation."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[320px]" },
          children: [
            {
              type: "Text",
              props: { className: "mb-1.5 text-sm font-medium text-foreground" },
              children: "Storage"
            },
            { type: "Input", props: { value: "1024", suffix: "GB" } }
          ]
        },
        caption: "Use type=\"number\" with inputmode and park the unit in a .input-addon so the value stays purely numeric."
      }
    },
    {
      title: "select",
      dont: {
        tree: {
          type: "Select",
          props: {
            label: "Email notifications",
            options: ["On", "Off"],
            value: "On",
            open: false,
            className: "max-w-[320px]"
          }
        },
        caption: "A select for a single on/off choice buries a one-tap decision behind a dropdown."
      },
      do: {
        tree: {
          type: "Select",
          props: {
            label: "Status",
            options: ["Active", "Inactive", "Pending", "Archived"],
            value: "Active",
            open: false,
            className: "max-w-[320px]"
          }
        },
        caption: "Reserve a select for picking one of several mutually exclusive options; use a switch or radios for two."
      }
    },
    {
      title: "textarea",
      dont: {
        html: "<div class=\"max-w-[320px]\"><label class=\"mb-1.5 block text-sm font-medium\">Notes</label><textarea class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none resize-none\">Describe the change in enough detail that a teammate could follow it…</textarea></div>",
        caption: "A one-line, resize-none textarea clips multi-line input so users cannot review what they wrote."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[320px]" },
          children: [
            {
              type: "Text",
              props: { className: "mb-1.5 text-sm font-medium text-foreground" },
              children: "Notes"
            },
            {
              type: "Textarea",
              props: {
                rows: 4,
                value: "Describe the change in enough detail that a teammate could follow it…"
              }
            }
          ]
        },
        caption: "Give a textarea a min-height for several lines and resize-y so it can grow with the content."
      }
    }
  ],
  pagination: [
    {
      title: "compact",
      dont: {
        html: "<div class=\"flex items-center justify-end gap-1 text-sm\"><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">‹</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">›</button></div>",
        caption: "Bare Previous/Next with no range label leaves the user unable to tell where they are or how much is left."
      },
      do: {
        tree: { type: "Pagination", props: { compact: true, page: 2, total: 12 } },
        caption: "Pair the buttons with a \"Showing X–Y of N\" range so position and total are always visible."
      }
    },
    {
      title: "numbered",
      dont: {
        html: "<nav class=\"flex items-center gap-1\"><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground opacity-50\">‹</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-primary bg-primary text-sm font-medium text-primary-foreground\">1</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">2</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">3</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">4</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">5</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">6</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">7</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">8</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">9</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">10</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">11</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">12</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">›</button></nav>",
        caption: "Rendering every page number overflows and stops being scannable past a handful."
      },
      do: {
        tree: { type: "Pagination", props: { page: 2, total: 12 } },
        caption: "Truncate the middle with an ellipsis; keep first, last, and a window around the current page."
      }
    },
    {
      title: "with-size",
      dont: {
        html: "<div class=\"flex items-center gap-4 text-sm\"><div class=\"flex items-center gap-2\"><span class=\"text-muted-foreground\">Rows per page</span><div class=\"inline-flex items-center justify-between gap-1 h-9 min-w-9 px-2.5 rounded-md border border-input bg-background\"><span class=\"text-sm font-medium text-foreground\">10</span><span class=\"text-sm text-muted-foreground\">▾</span></div></div><div class=\"flex gap-1\"><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground opacity-50\">‹</button><button class=\"inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-md border border-input bg-background text-sm font-medium text-foreground\">›</button></div></div>",
        caption: "Offering a page-size selector without a page indicator hides which page the new size landed on."
      },
      do: {
        tree: {
          type: "Pagination",
          props: { withSize: true, page: 2, total: 12, pageSize: 10, pageSizes: [10, 25, 50] }
        },
        caption: "Show \"Page X of N\" beside the size selector and reset to page 1 when the size changes."
      }
    }
  ],
  radio: [
    {
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-col gap-2" },
          children: [
            {
              type: "Text",
              props: { className: "mb-1 text-sm font-semibold text-foreground" },
              children: "Plan"
            },
            { type: "Radio", children: "Hobby" },
            { type: "Radio", children: "Pro" },
            { type: "Radio", children: "Enterprise" }
          ]
        },
        caption: "Leaving a radio group with nothing selected forces an extra decision and can submit empty."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-col gap-2" },
          children: [
            {
              type: "Text",
              props: { className: "mb-1 text-sm font-semibold text-foreground" },
              children: "Plan"
            },
            { type: "Radio", children: "Hobby" },
            { type: "Radio", props: { checked: true }, children: "Pro" },
            { type: "Radio", children: "Enterprise" }
          ]
        },
        caption: "Pre-select a sensible default so the common path needs no clicks."
      }
    },
    {
      title: "Stacked",
      dont: {
        html: "<div class=\"flex flex-col gap-2.5\">\n  <label class=\"flex cursor-pointer items-center gap-2\"><span class=\"mt-0 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-primary\"><span class=\"h-2 w-2 rounded-full bg-primary\"></span></span><div><div class=\"text-[13px] font-medium text-foreground\">Pro</div><div class=\"text-xs text-muted-foreground\">For growing teams that need more control.</div></div></label>\n</div>",
        caption: "With items-center the input floats to the vertical middle of a two-line label, leaving it visually unattached to the title it controls."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-col gap-2.5" },
          children: [
            {
              type: "View",
              props: { className: "flex-row gap-2" },
              children: [
                { type: "Radio", props: { checked: true, className: "mt-[3px]" } },
                {
                  type: "View",
                  children: [
                    {
                      type: "Text",
                      props: { className: "text-[13px] font-medium text-foreground" },
                      children: "Pro"
                    },
                    {
                      type: "Text",
                      props: { className: "text-xs text-muted-foreground" },
                      children: "For growing teams that need more control."
                    }
                  ]
                }
              ]
            }
          ]
        },
        caption: "Align the control to the first text line (mt-[3px]) so it sits beside the title, with the description flowing below."
      }
    },
    {
      title: "Inline",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap gap-1.5" },
          children: [
            { type: "Radio", props: { checked: true, small: true }, children: "Hobby" },
            { type: "Radio", props: { small: true }, children: "Pro" },
            { type: "Radio", props: { small: true }, children: "Enterprise" }
          ]
        },
        caption: "Cramped gap-1 between options makes each label blur into the next radio, so it is hard to tell which dot belongs to which choice."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap gap-6" },
          children: [
            { type: "Radio", props: { checked: true, small: true }, children: "Hobby" },
            { type: "Radio", props: { small: true }, children: "Pro" },
            { type: "Radio", props: { small: true }, children: "Enterprise" }
          ]
        },
        caption: "Use gap-6 between options (gap-2 inside each) so every label clearly pairs with its own control."
      }
    },
    {
      title: "Card",
      dont: {
        tree: {
          type: "View",
          props: { className: "grid grid-cols-2 gap-2" },
          children: [
            {
              type: "View",
              props: { className: "flex-col rounded-md border border-border p-3.5" },
              children: [
                { type: "Radio", props: { checked: true, className: "mb-2" } },
                {
                  type: "Text",
                  props: { className: "text-[13px] font-semibold text-foreground" },
                  children: "Pro"
                },
                {
                  type: "Text",
                  props: { className: "text-xs text-muted-foreground" },
                  children: "For growing teams."
                }
              ]
            },
            {
              type: "View",
              props: { className: "flex-col rounded-md border border-border p-3.5" },
              children: [
                { type: "Radio", props: { className: "mb-2" } },
                {
                  type: "Text",
                  props: { className: "text-[13px] font-semibold text-foreground" },
                  children: "Enterprise"
                },
                {
                  type: "Text",
                  props: { className: "text-xs text-muted-foreground" },
                  children: "Advanced security."
                }
              ]
            }
          ]
        },
        caption: "When the selected card keeps the same plain border, only the tiny native dot signals the choice and the active card is easy to miss."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "grid grid-cols-2 gap-2" },
          children: [
            {
              type: "View",
              props: {
                className: "flex-col rounded-md border-2 border-primary bg-primary/5 p-3.5"
              },
              children: [
                { type: "Radio", props: { checked: true, className: "mb-2" } },
                {
                  type: "Text",
                  props: { className: "text-[13px] font-semibold text-foreground" },
                  children: "Pro"
                },
                {
                  type: "Text",
                  props: { className: "text-xs text-muted-foreground" },
                  children: "For growing teams."
                }
              ]
            },
            {
              type: "View",
              props: { className: "flex-col rounded-md border border-border p-3.5" },
              children: [
                { type: "Radio", props: { className: "mb-2" } },
                {
                  type: "Text",
                  props: { className: "text-[13px] font-semibold text-foreground" },
                  children: "Enterprise"
                },
                {
                  type: "Text",
                  props: { className: "text-xs text-muted-foreground" },
                  children: "Advanced security."
                }
              ]
            }
          ]
        },
        caption: "Give the selected card a primary border and tinted fill so the whole tile reads as chosen, not just the dot."
      }
    }
  ],
  select: [
    {
      dont: {
        tree: {
          type: "Select",
          props: {
            open: true,
            label: "Country",
            value: "Choose a country…",
            options: ["Choose a country…", "United States", "Canada", "Mexico"],
            className: "max-w-[280px]"
          }
        },
        caption: "A placeholder as a normal option can be submitted as a real value."
      },
      do: {
        tree: {
          type: "Select",
          props: {
            open: true,
            label: "Country",
            placeholder: "Choose a country…",
            options: ["United States", "Canada", "Mexico"],
            className: "max-w-[280px]"
          }
        },
        caption: "Mark the placeholder disabled and selected so it prompts without being a valid choice."
      }
    },
    {
      title: "sm",
      dont: {
        tree: {
          type: "Select",
          props: {
            small: true,
            label: "Rows per page",
            value: "10",
            options: ["10", "25", "50"],
            className: "max-w-[200px]"
          }
        },
        caption: "A stacked block label towers over the small control and breaks the dense row it belongs in."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-2" },
          children: [
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "Rows"
            },
            {
              type: "Select",
              props: { small: true, value: "10", options: ["10", "25", "50"], className: "w-auto" }
            }
          ]
        },
        caption: "Keep the small select inline with a short label so it stays compact inside toolbars and table footers."
      }
    },
    {
      title: "default",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row items-end gap-3 max-w-[420px]" },
          children: [
            {
              type: "View",
              props: { className: "flex-1" },
              children: [
                {
                  type: "Text",
                  props: { className: "mb-1.5 text-sm font-medium text-foreground" },
                  children: "City"
                },
                { type: "Input", props: { large: true, value: "Austin" } }
              ]
            },
            {
              type: "View",
              props: { className: "flex-1" },
              children: [
                {
                  type: "Text",
                  props: { className: "mb-1.5 text-sm font-medium text-foreground" },
                  children: "State"
                },
                { type: "Select", props: { value: "Texas", options: ["Texas", "Oregon"] } }
              ]
            }
          ]
        },
        caption: "A default select next to a taller lg input leaves the row baselines misaligned."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-end gap-3 max-w-[420px]" },
          children: [
            {
              type: "View",
              props: { className: "flex-1" },
              children: [
                {
                  type: "Text",
                  props: { className: "mb-1.5 text-sm font-medium text-foreground" },
                  children: "City"
                },
                { type: "Input", props: { value: "Austin" } }
              ]
            },
            {
              type: "View",
              props: { className: "flex-1" },
              children: [
                {
                  type: "Text",
                  props: { className: "mb-1.5 text-sm font-medium text-foreground" },
                  children: "State"
                },
                { type: "Select", props: { value: "Texas", options: ["Texas", "Oregon"] } }
              ]
            }
          ]
        },
        caption: "Match the default select to sibling inputs at the same height so the form row lines up."
      }
    },
    {
      title: "lg",
      dont: {
        html: "<div class=\"max-w-[320px]\">\n  <label class=\"mb-1.5 block text-sm font-medium\">Plan</label>\n  <div class=\"flex h-10 items-center justify-between rounded-md border border-input bg-background px-3\">\n    <span class=\"text-xs text-foreground\">Starter</span>\n    <span class=\"text-xs text-muted-foreground\">▾</span>\n  </div>\n</div>",
        caption: "Tiny option text inside a tall control wastes the height and looks like an accidental mismatch."
      },
      do: {
        tree: {
          type: "Select",
          props: {
            large: true,
            label: "Plan",
            value: "Starter",
            options: ["Starter", "Pro", "Enterprise"],
            className: "max-w-[320px]"
          }
        },
        caption: "Scale the text up with the height so the large select reads as a deliberate, touch-friendly target."
      }
    }
  ],
  skeleton: [
    {
      title: "text",
      dont: {
        tree: {
          type: "View",
          props: { className: "w-[320px] flex-col gap-1.5" },
          children: [
            {
              type: "Skeleton",
              props: { text: true, animate: true, className: "w-full" }
            },
            {
              type: "Skeleton",
              props: { text: true, animate: true, className: "w-full" }
            },
            {
              type: "Skeleton",
              props: { text: true, animate: true, className: "w-full" }
            }
          ]
        },
        caption: "Three full-width lines read as a solid block, not as a paragraph of prose."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "w-[320px] flex-col gap-1.5" },
          children: [
            {
              type: "Skeleton",
              props: { text: true, animate: true, className: "w-full" }
            },
            {
              type: "Skeleton",
              props: { text: true, animate: true, className: "w-[95%]" }
            },
            {
              type: "Skeleton",
              props: { text: true, animate: true, className: "w-[60%]" }
            }
          ]
        },
        caption: "Vary the line widths and shorten the last line so it reads like real wrapped text."
      }
    },
    {
      title: "avatar",
      dont: {
        html: "<div class=\"bg-muted animate-pulse rounded-md\" style=\"width:40px;height:40px\"></div>",
        caption: "A square placeholder for a round avatar snaps shape the instant the image loads."
      },
      do: {
        tree: { type: "Skeleton", props: { avatar: true, animate: true } },
        caption: "Match the avatar's circle exactly so the photo drops in with no shift."
      }
    },
    {
      title: "button",
      dont: {
        html: "<div class=\"bg-muted animate-pulse w-[320px] rounded-md\" style=\"height:72px\"></div>",
        caption: "An oversized bar overstates a button and the layout jumps when the real control mounts."
      },
      do: {
        tree: { type: "Skeleton", props: { button: true, animate: true } },
        caption: "Size the placeholder to the button's real height and width (h-9, content-fit)."
      }
    },
    {
      title: "card",
      dont: {
        html: "<div class=\"bg-muted animate-pulse rounded-md\" style=\"width:320px;height:88px\"></div>",
        caption: "A generic block that ignores the content's shape causes a jarring shift when it loads."
      },
      do: {
        tree: { type: "Skeleton", props: { card: true, animate: true } },
        caption: "Mirror the real layout (avatar circle, text lines) so the swap is seamless."
      }
    },
    {
      title: "list",
      dont: {
        html: "<div class=\"bg-muted animate-pulse w-[400px] rounded-md\" style=\"height:120px\"></div>",
        caption: "One tall block hides the row rhythm, so the list reflows when each item appears."
      },
      do: {
        tree: { type: "Skeleton", props: { list: true, animate: true } },
        caption: "Repeat a per-row placeholder so the avatar-and-text rhythm matches the loaded list."
      }
    },
    {
      title: "table",
      dont: {
        html: "<div class=\"bg-muted animate-pulse w-[400px] rounded-md\" style=\"height:120px\"></div>",
        caption: "A single rectangle gives no column structure; cells shift sideways once data lands."
      },
      do: {
        tree: { type: "Skeleton", props: { table: true, animate: true } },
        caption: "Lay placeholders out on the real column grid so each cell stays put when it fills in."
      }
    }
  ],
  textarea: [
    {
      title: "With label",
      dont: {
        html: "<div class=\"max-w-[400px]\"><label class=\"mb-1.5 block text-sm font-medium\">Description</label><textarea class=\"flex w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50\" style=\"height:32px;resize:none\">This is a longer description that runs past one line and gets clipped.</textarea></div>",
        caption: "A locked, single-line textarea hides long content with no way to expand."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[400px] flex-col gap-1.5" },
          children: [
            {
              type: "Text",
              props: { className: "text-sm font-medium text-foreground" },
              children: "Description"
            },
            {
              type: "Textarea",
              props: {
                rows: 3,
                value: "This is a longer description that runs past one line and stays readable."
              }
            }
          ]
        },
        caption: "Give a sensible min-height and allow vertical resize so users can see and grow their text."
      }
    },
    {
      title: "Character counter",
      dont: {
        tree: {
          type: "View",
          props: { className: "max-w-[400px] flex-col gap-1.5" },
          children: [
            {
              type: "Text",
              props: { className: "text-sm font-medium text-foreground" },
              children: "Bio"
            },
            {
              type: "Textarea",
              props: {
                rows: 3,
                value: "I have been building things on the web for fifteen years and counting, across teams large and small, shipping product end to end."
              }
            },
            {
              type: "View",
              props: { className: "mt-1 flex-row justify-end" },
              children: [
                {
                  type: "Text",
                  props: { className: "text-[11px] text-muted-foreground" },
                  children: "over limit"
                }
              ]
            }
          ]
        },
        caption: "A vague \"over limit\" message gives no number, so users cannot tell how much to trim."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[400px] flex-col gap-1.5" },
          children: [
            {
              type: "Text",
              props: { className: "text-sm font-medium text-foreground" },
              children: "Bio"
            },
            {
              type: "Textarea",
              props: {
                rows: 3,
                invalid: true,
                value: "I have been building things on the web for fifteen years and counting, across teams large and small, shipping product end to end."
              }
            },
            {
              type: "View",
              props: { className: "mt-1 flex-row justify-end" },
              children: [
                {
                  type: "Text",
                  props: { className: "text-[11px] text-destructive" },
                  children: "123 / 120"
                }
              ]
            }
          ]
        },
        caption: "Show the live count against the cap and turn it destructive past the limit so the overage is precise."
      }
    },
    {
      title: "Formatting toolbar",
      dont: {
        tree: {
          type: "View",
          props: { className: "max-w-[400px] overflow-hidden rounded-md border border-border" },
          children: [
            {
              type: "View",
              props: {
                className: "flex-row items-center gap-1 border-b border-border bg-muted/30 px-3 py-2"
              },
              children: [
                {
                  type: "Text",
                  props: { className: "px-2 text-sm font-bold" },
                  children: "B"
                },
                { type: "Text", props: { className: "px-2 text-sm italic" }, children: "I" },
                {
                  type: "Text",
                  props: { className: "px-2 font-mono text-[11px]" },
                  children: "</>"
                }
              ]
            },
            {
              type: "Textarea",
              props: {
                rows: 4,
                placeholder: "Leave a comment",
                className: "rounded-none border-0 shadow-none"
              }
            }
          ]
        },
        caption: "Static, unclickable glyphs look like a toolbar but cannot be pressed or focused."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[400px] overflow-hidden rounded-md border border-border" },
          children: [
            {
              type: "View",
              props: {
                className: "flex-row items-center gap-1 border-b border-border bg-muted/30 px-3 py-2"
              },
              children: [
                {
                  type: "Button",
                  props: { ghost: true, small: true, className: "font-bold" },
                  children: "B"
                },
                {
                  type: "Button",
                  props: { ghost: true, small: true, className: "italic" },
                  children: "I"
                },
                {
                  type: "Button",
                  props: { ghost: true, small: true, className: "font-mono text-[11px]" },
                  children: "</>"
                }
              ]
            },
            {
              type: "Textarea",
              props: {
                rows: 4,
                placeholder: "Leave a comment",
                className: "rounded-none border-0 shadow-none"
              }
            }
          ]
        },
        caption: "Make each control a real focusable button that toggles an active state when pressed."
      }
    },
    {
      title: "Disabled",
      dont: {
        html: "<div class=\"max-w-[400px]\"><label class=\"mb-1.5 block text-sm font-medium\">Description</label><textarea class=\"flex w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y\" style=\"min-height:80px;opacity:0.5\" readonly>Read-only content the user must not change.</textarea></div>",
        caption: "Dimming a textarea while leaving it editable looks disabled but still accepts input."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[400px] flex-col gap-1.5" },
          children: [
            {
              type: "Text",
              props: { className: "text-sm font-medium text-foreground" },
              children: "Description"
            },
            {
              type: "Textarea",
              props: {
                rows: 3,
                disabled: true,
                value: "Read-only content the user must not change."
              }
            }
          ]
        },
        caption: "Use the disabled attribute so the field blocks editing and focus, matching its dimmed look."
      }
    }
  ],
  switch: [
    {
      title: "Off",
      dont: {
        html: "<label class=\"flex max-w-[280px] items-center justify-between gap-4\"><span class=\"text-[13px]\">Two-factor auth</span><span class=\"relative inline-flex shrink-0 items-center\"><input type=\"checkbox\" role=\"switch\" class=\"peer sr-only\"><span class=\"relative h-5 w-9 rounded-full bg-muted/30 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-muted after:content-['']\"></span></span></label>",
        caption: "A washed-out off track reads as disabled, so users can't tell the switch is simply off versus locked."
      },
      do: {
        tree: {
          type: "Switch",
          props: { checked: false, className: "max-w-[280px]" },
          children: "Two-factor auth"
        },
        caption: "Keep the standard bg-input off track so off stays clearly interactive and distinct from a disabled control."
      }
    },
    {
      title: "On",
      dont: {
        html: "<label class=\"flex max-w-[280px] items-center justify-between gap-4\"><span class=\"text-[13px] text-destructive\">Permanently delete account</span><span class=\"relative inline-flex shrink-0 items-center\"><input type=\"checkbox\" role=\"switch\" class=\"peer sr-only\" checked><span class=\"relative h-5 w-9 rounded-full bg-input transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-background after:shadow after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-4\"></span></span></label>",
        caption: "A switch applies instantly; wiring an on toggle to an irreversible action invites accidental, unconfirmed data loss."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[280px] flex-col gap-3" },
          children: [
            { type: "Switch", props: { checked: true }, children: "Auto-save drafts" },
            {
              type: "Button",
              props: { destructive: true, small: true, className: "self-start" },
              children: "Delete account…"
            }
          ]
        },
        caption: "Reserve the on switch for instantly reversible settings; route irreversible actions through a button plus confirmation."
      }
    },
    {
      dont: {
        tree: {
          type: "View",
          props: { className: "max-w-[280px] flex-row items-center justify-between" },
          children: [
            {
              type: "Text",
              props: { className: "text-[13px]" },
              children: "Notifications"
            },
            {
              type: "View",
              props: { className: "flex-row items-center gap-2" },
              children: [
                {
                  type: "Text",
                  props: { className: "text-xs text-muted-foreground" },
                  children: "Off"
                },
                { type: "Switch", props: { checked: false } },
                {
                  type: "Text",
                  props: { className: "text-xs text-muted-foreground" },
                  children: "On"
                }
              ]
            }
          ]
        },
        caption: "An On/Off label duplicates what the switch position already shows."
      },
      do: {
        tree: {
          type: "Switch",
          props: { checked: true, className: "max-w-[280px]" },
          children: "Notifications"
        },
        caption: "Label the setting, not the state; the switch communicates on or off."
      }
    }
  ],
  tooltip: [
    {
      dont: {
        tree: {
          type: "Tooltip",
          props: {
            iconTrigger: true,
            bottom: true,
            open: true,
            label: "To rotate this key you must first revoke the old one in Settings, then confirm via email within 24 hours."
          }
        },
        caption: "Long, essential instructions hidden in a tooltip are missed on touch and by screen readers."
      },
      do: {
        tree: {
          type: "Tooltip",
          props: { iconTrigger: true, bottom: true, open: true, label: "Rotate key" }
        },
        caption: "Keep tooltips short and supplementary; put essential steps in visible copy."
      }
    },
    {
      title: "top",
      dont: {
        html: "<div class=\"pt-2\"><div class=\"relative inline-flex\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Save</button><div class=\"z-10 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md absolute whitespace-nowrap\" style=\"bottom:calc(100% + 8px);left:50%;transform:translateX(-50%)\">Saves your changes</div></div></div>",
        caption: "A top tooltip on a trigger near the top edge clips above the viewport and goes unread."
      },
      do: {
        tree: {
          type: "Tooltip",
          props: { trigger: "Save", top: true, open: true, label: "Saves your changes" }
        },
        caption: "Leave headroom above (or flip to bottom) so a top-placed tooltip stays fully on screen."
      }
    },
    {
      title: "right",
      dont: {
        html: "<div class=\"flex justify-end\"><div class=\"relative inline-flex\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9\">i</button><div class=\"z-10 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md absolute whitespace-nowrap\" style=\"left:calc(100% + 8px);top:50%;transform:translateY(-50%)\">More info</div></div></div>",
        caption: "A right tooltip on a control flush against the right edge is cut off by the container."
      },
      do: {
        tree: {
          type: "Tooltip",
          props: { iconTrigger: true, right: true, open: true, label: "More info" }
        },
        caption: "Keep room to the right, or flip the tooltip to the left when the trigger hugs the edge."
      }
    },
    {
      title: "bottom",
      dont: {
        html: "<div class=\"flex flex-col gap-2\"><div class=\"relative inline-flex w-fit\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Filters</button><div class=\"z-10 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md absolute whitespace-nowrap\" style=\"top:calc(100% + 4px);left:50%;transform:translateX(-50%)\">Refine results</div></div><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs w-fit\">Clear all</button></div>",
        caption: "A bottom tooltip sits right on top of the next row, masking the control beneath it."
      },
      do: {
        tree: {
          type: "Tooltip",
          props: { trigger: "Filters", bottom: true, open: true, label: "Refine results" }
        },
        caption: "Give a bottom tooltip clearance so it never overlaps the interactive content below."
      }
    },
    {
      title: "left",
      dont: {
        html: "<div class=\"relative inline-flex\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9\">?</button><div class=\"z-10 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md absolute whitespace-nowrap\" style=\"right:calc(100% + 8px);top:50%;transform:translateY(-50%)\">Need help?</div></div>",
        caption: "A left tooltip on a trigger at the left edge is clipped by the container's left boundary."
      },
      do: {
        tree: {
          type: "Tooltip",
          props: { iconTrigger: true, left: true, open: true, label: "Need help?" }
        },
        caption: "Reserve space on the left, or flip to the right, so a left-placed tooltip is never cut off."
      }
    }
  ],
  listbox: [
    {
      title: "Prefer a native select for simple lists",
      dont: {
        tree: {
          type: "Listbox",
          props: {
            bordered: true,
            className: "w-48",
            items: [{ label: "Yes", selected: true }, { label: "No" }]
          }
        },
        caption: "A custom listbox for two short options is heavier than it needs to be and worse on mobile."
      },
      do: {
        html: "<select class=\"flex h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50\"><option>Yes</option><option>No</option></select>",
        caption: "For short, plain lists a native select is lighter, accessible, and uses the platform picker on mobile."
      }
    },
    {
      title: "single",
      dont: {
        tree: {
          type: "Listbox",
          props: {
            bordered: true,
            className: "w-56",
            items: [
              { label: "Backend", selected: true },
              { label: "Frontend", selected: true },
              { label: "Design" },
              { label: "Platform" }
            ]
          }
        },
        caption: "Single-select with two checkmarks lies about state: only one option can be the value."
      },
      do: {
        tree: {
          type: "Listbox",
          props: {
            bordered: true,
            className: "w-56",
            items: [
              { label: "Backend", selected: true },
              { label: "Frontend" },
              { label: "Design" },
              { label: "Platform" }
            ]
          }
        },
        caption: "Show exactly one checkmark, mirror it in the trigger value, and close the panel on pick."
      }
    },
    {
      title: "multi",
      dont: {
        html: "<div class=\"w-56 rounded-md border border-border bg-popover p-1 shadow-md\"><div class=\"flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground\"><span>Backend</span><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"ml-auto shrink-0\"><polyline points=\"20 6 9 17 4 12\"/></svg></div><div class=\"flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground\"><span>Frontend</span><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"ml-auto shrink-0\"><polyline points=\"20 6 9 17 4 12\"/></svg></div><div class=\"flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground\"><span>Design</span><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"ml-auto shrink-0 invisible\"><polyline points=\"20 6 9 17 4 12\"/></svg></div><div class=\"flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground\"><span>Platform</span><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"ml-auto shrink-0\"><polyline points=\"20 6 9 17 4 12\"/></svg></div><div class=\"px-2 pb-1 pt-1.5 text-xs text-muted-foreground\">Backend</div></div>",
        caption: "Don't close on each pick or echo only the last choice: multi-select needs to keep all selections visible."
      },
      do: {
        html: "<div class=\"w-56 rounded-md border border-border bg-popover p-1 shadow-md\"><div class=\"flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground\"><span>Backend</span><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"ml-auto shrink-0\"><polyline points=\"20 6 9 17 4 12\"/></svg></div><div class=\"flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground\"><span>Frontend</span><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"ml-auto shrink-0\"><polyline points=\"20 6 9 17 4 12\"/></svg></div><div class=\"flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground\"><span>Design</span><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"ml-auto shrink-0 invisible\"><polyline points=\"20 6 9 17 4 12\"/></svg></div><div class=\"flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground\"><span>Platform</span><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"ml-auto shrink-0\"><polyline points=\"20 6 9 17 4 12\"/></svg></div><div class=\"px-2 pb-1 pt-1.5 text-xs text-muted-foreground\">3 selected</div></div>",
        caption: "Keep the panel open, toggle each option's own checkmark, and summarize the count in the trigger."
      }
    }
  ],
  kbd: [
    {
      title: "Single",
      dont: {
        tree: { type: "Kbd", children: "⌘K" },
        caption: "Packing a whole shortcut into one key cap reads as a single keystroke that does not exist."
      },
      do: {
        tree: { type: "Kbd", children: "Esc" },
        caption: "Use the single mode for one real key; give each cap exactly one key."
      }
    },
    {
      title: "Combo",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center" },
          children: [
            { type: "Kbd", children: "⌘" },
            { type: "Kbd", children: "⇧" },
            { type: "Kbd", children: "P" }
          ]
        },
        caption: "Caps butted together with no separator blur into one token and hide that it is a chord."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-1" },
          children: [
            { type: "Kbd", children: "⌘" },
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "+"
            },
            { type: "Kbd", children: "⇧" },
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "+"
            },
            { type: "Kbd", children: "P" }
          ]
        },
        caption: "Separate each key with a + so the combo reads as keys pressed together."
      }
    },
    {
      title: "In a sentence",
      dont: {
        tree: {
          type: "Text",
          props: { className: "text-sm" },
          children: "Press Ctrl+K to search."
        },
        caption: "Plain-text shortcuts blend into the prose and are easy to miss."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-1" },
          children: [
            { type: "Text", props: { className: "text-sm" }, children: "Press" },
            { type: "Kbd", children: "Ctrl" },
            { type: "Kbd", children: "K" },
            { type: "Text", props: { className: "text-sm" }, children: "to search." }
          ]
        },
        caption: "Wrap each key in a kbd so shortcuts read as physical keys."
      }
    }
  ],
  typography: [
    {
      title: "display",
      dont: {
        tree: {
          type: "View",
          props: { className: "gap-2" },
          children: [
            { type: "Typography", props: { display: true }, children: "Welcome" },
            { type: "Typography", props: { display: true }, children: "Get started" }
          ]
        },
        caption: "Two display-size lines in one view fight for attention and leave no clear focal point."
      },
      do: {
        tree: {
          type: "View",
          children: [
            { type: "Typography", props: { display: true }, children: "Welcome" },
            {
              type: "Typography",
              props: { muted: true, className: "mt-2" },
              children: "Sign in to pick up where you left off."
            }
          ]
        },
        caption: "Use display once per hero, then drop to a muted line for the supporting copy."
      }
    },
    {
      title: "h1",
      dont: {
        tree: {
          type: "View",
          props: { className: "gap-1" },
          children: [
            { type: "Typography", props: { h1: true }, children: "Billing" },
            { type: "Typography", props: { h1: true }, children: "Invoices" }
          ]
        },
        caption: "Two h1 titles on a page break the document outline and confuse assistive tech."
      },
      do: {
        tree: {
          type: "View",
          children: [
            { type: "Typography", props: { h1: true }, children: "Billing" },
            {
              type: "Typography",
              props: { h2: true, className: "mt-4" },
              children: "Invoices"
            }
          ]
        },
        caption: "Give each page a single h1, then step down to h2 for the sections beneath it."
      }
    },
    {
      title: "h2",
      dont: {
        tree: {
          type: "View",
          children: [
            { type: "Typography", props: { h1: true }, children: "Settings" },
            {
              type: "Typography",
              props: { h4: true, className: "mt-4" },
              children: "Profile"
            }
          ]
        },
        caption: "Jumping from h1 straight to h4 skips a level and flattens the visible hierarchy."
      },
      do: {
        tree: {
          type: "View",
          children: [
            { type: "Typography", props: { h1: true }, children: "Settings" },
            {
              type: "Typography",
              props: { h2: true, className: "mt-4" },
              children: "Profile"
            }
          ]
        },
        caption: "Follow an h1 with h2 for its top-level sections; don't skip the scale."
      }
    },
    {
      title: "h3",
      dont: {
        tree: {
          type: "Typography",
          props: { h3: true, className: "max-w-[340px]" },
          children: "Canvas is a universal React Native UI kit for building consistent product interfaces."
        },
        caption: "Body copy set in a heading style is hard to read in bulk and flattens the hierarchy."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[340px]" },
          children: [
            { type: "Typography", props: { h3: true }, children: "About Canvas" },
            {
              type: "Typography",
              props: { body: true, className: "mt-1" },
              children: "Canvas is a universal React Native UI kit for building consistent product interfaces."
            }
          ]
        },
        caption: "Reserve heading styles for titles; set running text in a small body utility."
      }
    },
    {
      title: "h4",
      dont: {
        tree: {
          type: "View",
          props: { className: "gap-1" },
          children: [
            { type: "Typography", props: { h4: true }, children: "Notifications" },
            {
              type: "Typography",
              props: { h4: true },
              children: "A long descriptive sentence that explains everything in detail."
            }
          ]
        },
        caption: "h4 is a minor heading, not a place for full sentences; long text at this weight reads as a wall."
      },
      do: {
        tree: {
          type: "View",
          children: [
            { type: "Typography", props: { h4: true }, children: "Notifications" },
            {
              type: "Typography",
              props: { small: true, className: "mt-1" },
              children: "Choose how and when we reach you."
            }
          ]
        },
        caption: "Keep h4 to a short label and carry the explanation in a small supporting line."
      }
    },
    {
      title: "h5",
      dont: {
        tree: {
          type: "View",
          props: { className: "gap-1" },
          children: [
            { type: "Typography", props: { h5: true }, children: "Members" },
            {
              type: "Typography",
              props: { h5: true },
              children: "Aisha, Bao, Cleo, and 9 others have access."
            }
          ]
        },
        caption: "Setting the value in h5 too makes the label and its data indistinguishable."
      },
      do: {
        tree: {
          type: "View",
          children: [
            { type: "Typography", props: { h5: true }, children: "Members" },
            {
              type: "Typography",
              props: { body: true, className: "mt-0.5" },
              children: "Aisha, Bao, Cleo, and 9 others have access."
            }
          ]
        },
        caption: "Use h5 only for the label; render the value in body so the pair stays scannable."
      }
    },
    {
      title: "body",
      dont: {
        tree: {
          type: "Typography",
          props: { body: true, className: "max-w-[340px]" },
          children: [
            { type: "Typography", props: { code: true }, children: "npm install" },
            " THEN restart the dev server BEFORE you continue."
          ]
        },
        caption: "All-caps emphasis inside body copy shouts and undercuts the relaxed reading rhythm."
      },
      do: {
        tree: {
          type: "Typography",
          props: { body: true, className: "max-w-[340px]" },
          children: [
            "Run ",
            { type: "Typography", props: { code: true }, children: "npm install" },
            ", then restart the dev server before you continue."
          ]
        },
        caption: "Keep body copy in sentence case and let inline code carry the technical emphasis."
      }
    },
    {
      title: "small",
      dont: {
        tree: {
          type: "Button",
          props: { secondary: true },
          children: { type: "Typography", props: { small: true }, children: "Save changes" }
        },
        caption: "small is muted-foreground; on a colored button it loses contrast and looks disabled."
      },
      do: {
        tree: {
          type: "View",
          children: [
            { type: "Typography", props: { body: true }, children: "Save changes" },
            {
              type: "Typography",
              props: { small: true, className: "mt-0.5" },
              children: "Last saved 2 minutes ago."
            }
          ]
        },
        caption: "Use small for secondary captions on a plain surface, not for the primary label."
      }
    },
    {
      title: "tiny",
      dont: {
        tree: {
          type: "Typography",
          props: { tiny: true, className: "max-w-[300px]" },
          children: "These terms govern your use of the service and your data; please read them carefully before you continue past this screen."
        },
        caption: "tiny is for metadata, not legal prose; long copy at 12px strains the eye."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-2" },
          children: [
            { type: "Typography", props: { body: true }, children: "Deploy succeeded" },
            { type: "Typography", props: { tiny: true }, children: "3m ago" }
          ]
        },
        caption: "Reserve tiny for short metadata like timestamps and counts beside the main text."
      }
    },
    {
      title: "muted",
      dont: {
        tree: {
          type: "Typography",
          props: { muted: true, className: "self-start underline" },
          children: "View your invoices"
        },
        caption: "A primary, clickable action in muted-foreground reads as disabled and is easy to miss."
      },
      do: {
        html: "<p class=\"text-sm leading-relaxed\">Payment due May 31. <a href=\"#\" class=\"text-primary underline-offset-4 hover:underline\">View invoices</a></p>",
        caption: "Keep muted for de-emphasized context; give the actual action full foreground or primary color."
      }
    },
    {
      title: "caption",
      dont: {
        tree: {
          type: "Typography",
          props: { caption: true, className: "max-w-[320px]" },
          children: "Your subscription renews automatically each month unless you cancel from the billing page."
        },
        caption: "Uppercase, letter-spaced caption text is illegible for anything longer than a label."
      },
      do: {
        tree: {
          type: "View",
          children: [
            { type: "Typography", props: { caption: true }, children: "Billing" },
            {
              type: "Typography",
              props: { body: true, className: "mt-1" },
              children: "Your subscription renews automatically each month."
            }
          ]
        },
        caption: "Use caption as a short eyebrow label above a section, then explain in body."
      }
    },
    {
      title: "code",
      dont: {
        tree: {
          type: "Typography",
          props: { code: true },
          children: "git checkout -b feature\ngit add .\ngit commit -m \"wip\""
        },
        caption: "The inline code utility has tight padding and no scroll; multi-line blocks overflow and clip."
      },
      do: {
        tree: {
          type: "Typography",
          props: { body: true },
          children: [
            "Create a branch with ",
            {
              type: "Typography",
              props: { code: true },
              children: "git checkout -b feature"
            },
            " before committing."
          ]
        },
        caption: "Use code for inline tokens inside a sentence; reach for the code block component for multi-line snippets."
      }
    },
    {
      title: "mono",
      dont: {
        tree: {
          type: "Typography",
          props: { mono: true, className: "max-w-[320px]" },
          children: "We could not process your request because the upstream service returned an unexpected response."
        },
        caption: "Mono spacing makes prose sentences sparse and slow to read; it is meant for fixed-width data."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center justify-between gap-4" },
          children: [
            { type: "Typography", props: { small: true }, children: "Request ID" },
            { type: "Typography", props: { mono: true }, children: "req_8f2c10ab" }
          ]
        },
        caption: "Use mono for identifiers, hashes, and tabular values where character alignment matters."
      }
    }
  ],
  spinner: [
    {
      dont: {
        tree: { type: "Spinner" },
        caption: "A bare spinner with no label leaves users guessing what is happening and for how long."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row items-center gap-2" },
          children: [
            { type: "Spinner", props: { small: true } },
            {
              type: "Text",
              props: { className: "text-sm text-muted-foreground" },
              children: "Loading…"
            }
          ]
        },
        caption: "Pair longer waits with a short label so the spinner has context."
      }
    },
    {
      title: "sm",
      dont: {
        tree: {
          type: "View",
          props: {
            className: "h-32 items-center justify-center rounded-lg border border-dashed border-border"
          },
          children: [{ type: "Spinner", props: { small: true } }]
        },
        caption: "The 4×4 spinner is too small to anchor a full panel; alone in open space it reads as a stray dot."
      },
      do: {
        tree: {
          type: "Button",
          props: { loading: true, disabled: true },
          children: "Saving…"
        },
        caption: "Use the small size inline: inside a button or beside a line of text where its scale matches the type."
      }
    },
    {
      title: "default",
      dont: {
        html: "<div class=\"rounded-md bg-muted p-3\"><div class=\"w-12 h-5 animate-spin rounded-full border-2 border-muted border-t-foreground\"></div></div>",
        caption: "Don't stretch it with conflicting w/h utilities; a spinner must stay a perfect circle to spin cleanly."
      },
      do: {
        tree: {
          type: "View",
          props: {
            className: "flex-col items-center gap-2 rounded-lg border border-border p-6"
          },
          children: [
            { type: "Spinner" },
            {
              type: "Text",
              props: { className: "text-sm text-muted-foreground" },
              children: "Loading…"
            }
          ]
        },
        caption: "Keep the default square and centered with a label for small content panels and cards."
      }
    },
    {
      title: "lg",
      dont: {
        html: "<button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium h-8 px-3 bg-primary text-primary-foreground opacity-50\" disabled><div class=\"h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground\"></div></button>",
        caption: "The 8×8 spinner overflows a small control; cramming the large size into a button breaks its height."
      },
      do: {
        tree: {
          type: "View",
          props: {
            className: "h-40 flex-col items-center justify-center gap-3 rounded-lg border border-border"
          },
          children: [
            { type: "Spinner", props: { large: true } },
            {
              type: "Text",
              props: { className: "text-sm text-muted-foreground" },
              children: "Loading dashboard…"
            }
          ]
        },
        caption: "Reserve the large size for section- or page-level loading, centered in the empty content area."
      }
    }
  ],
  popover: [
    {
      dont: {
        html: "<div class=\"rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md relative inline-block min-w-[260px]\">\n  <label class=\"mb-1.5 block text-sm font-medium\">Name</label><input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-2\">\n  <label class=\"mb-1.5 block text-sm font-medium\">Email</label><input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-2\">\n  <label class=\"mb-1.5 block text-sm font-medium\">Role</label><select class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-2\"><option>Engineer</option></select>\n  <label class=\"mb-1.5 block text-sm font-medium\">Team</label><input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-2\">\n  <div class=\"flex justify-end gap-2\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Cancel</button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-md px-3 text-xs\">Save</button></div>\n</div>",
        caption: "A full form belongs in a dialog; in a floating popover it is cramped and easy to dismiss by accident."
      },
      do: {
        html: "<div class=\"rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md relative inline-block min-w-[240px]\">\n  <p class=\"mb-2 text-sm\">Rename this project?</p>\n  <input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-2\" value=\"Identity Platform\">\n  <div class=\"flex justify-end gap-2\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Cancel</button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-md px-3 text-xs\">Rename</button></div>\n</div>",
        caption: "Keep popovers compact: a focused prompt with one input and a clear action."
      }
    },
    {
      title: "Triggered",
      dont: {
        html: "<div class=\"inline-block\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Open popover</button><div class=\"rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md mt-2 min-w-[240px]\"><p class=\"text-sm\">No anchor, no dismiss, no Close.</p></div></div>",
        caption: "A trigger with no relative anchor and no way to dismiss leaves the panel floating loose and stuck open."
      },
      do: {
        tree: {
          type: "Popover",
          props: {
            trigger: "Open popover",
            open: true,
            description: "Anchored to the trigger, closes on outside click.",
            actionLabel: "Close"
          }
        },
        caption: "Wrap the trigger in a relative anchor and dismiss on outside click so the panel positions and closes predictably."
      }
    },
    {
      title: "Inline",
      dont: {
        html: "<div class=\"rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md max-h-[120px] min-w-[260px] overflow-auto\">\n  <label class=\"mb-1.5 block text-sm font-medium\">Street</label><input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-2\">\n  <label class=\"mb-1.5 block text-sm font-medium\">City</label><input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-2\">\n  <label class=\"mb-1.5 block text-sm font-medium\">Region</label><input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-2\">\n  <label class=\"mb-1.5 block text-sm font-medium\">Postal code</label><input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-2\">\n</div>",
        caption: "An always-visible panel that scrolls internally is doing a card's or section's job; use the panel chrome only for short content."
      },
      do: {
        tree: {
          type: "Popover",
          props: {
            inline: true,
            description: "Saved to drafts. Publish when ready.",
            actionLabel: "Publish"
          }
        },
        caption: "Reserve the static panel for a brief always-on message with a single follow-up action."
      }
    }
  ],
};
