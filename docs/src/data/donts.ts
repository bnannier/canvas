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
  alert: [
    {
      title: "info",
      dont: {
        tree: {
          type: "Alert",
          props: {
            info: true,
            icon: "ℹ",
            title: "Trial expires today",
            description: "Upgrade now or you'll lose access to your projects."
          }
        },
        caption: "Dressing an act-now message in the neutral info tone hides the urgency; users skim past it like an FYI."
      },
      do: {
        tree: {
          type: "Alert",
          props: {
            info: true,
            icon: "ℹ",
            title: "Heads up",
            description: "Maintenance window scheduled for Sunday 2:00 UTC."
          }
        },
        caption: "Reserve info for passive, non-urgent context (notices, tips); escalate to warning or destructive when action is required."
      }
    },
    {
      title: "success",
      dont: {
        tree: {
          type: "Alert",
          props: {
            success: true,
            icon: "✓",
            title: "Saved",
            description: "Your changes have been saved successfully."
          }
        },
        caption: "A success banner pinned with no way to dismiss it lingers as visual noise long after the action is done."
      },
      do: {
        tree: {
          type: "Alert",
          props: {
            success: true,
            icon: "✓",
            title: "Saved",
            description: "Your changes have been saved successfully."
          },
          children: [
            {
              type: "View",
              props: { className: "mt-3 flex-row gap-2" },
              children: [{ type: "Button", props: { ghost: true, small: true }, children: "Dismiss" }]
            }
          ]
        },
        caption: "Make confirmations transient: auto-dismiss or give a Dismiss control so the success state clears once acknowledged."
      }
    },
    {
      title: "warning",
      dont: {
        tree: {
          type: "Alert",
          props: {
            warning: true,
            icon: "⚠",
            title: "Action required",
            description: "Something needs your attention."
          }
        },
        caption: "A warning with no specifics or next step leaves the user guessing what to fix and by when."
      },
      do: {
        tree: {
          type: "Alert",
          props: {
            warning: true,
            icon: "⚠",
            title: "Action required",
            description: "Your trial expires in 3 days. Upgrade to keep your projects."
          },
          children: [
            {
              type: "View",
              props: { className: "mt-3 flex-row gap-2" },
              children: [
                {
                  type: "Button",
                  props: { primary: true, small: true },
                  children: "Upgrade plan"
                }
              ]
            }
          ]
        },
        caption: "State the consequence, the deadline, and the action: name what's wrong and give a button to resolve it."
      }
    },
    {
      title: "destructive",
      dont: {
        tree: {
          type: "Alert",
          props: {
            error: true,
            icon: "✕",
            title: "Saved",
            description: "Your changes have been saved successfully."
          }
        },
        caption: "Using the destructive variant for non-errors cries wolf; users learn to tune out red and miss real failures."
      },
      do: {
        tree: {
          type: "Alert",
          props: {
            error: true,
            icon: "✕",
            title: "Something went wrong",
            description: "Could not save your changes. Please try again."
          }
        },
        caption: "Match the variant to the severity: reserve destructive for genuine failures, success for confirmations."
      }
    }
  ],
  "alert-dialog": [
    {
      title: "Reserve the dialog for blocking decisions",
      dont: {
        tree: {
          type: "AlertDialog",
          props: {
            open: true,
            small: true,
            title: "Saved",
            description: "Your changes have been saved.",
            confirmLabel: "OK"
          }
        },
        caption: "A blocking alert dialog for passive confirmation interrupts the user for no reason."
      },
      do: {
        tree: {
          type: "Alert",
          props: {
            success: true,
            title: "Saved",
            description: "Your changes have been saved."
          }
        },
        caption: "Use an inline banner or toast for passive feedback; reserve the dialog for decisions that must be confirmed."
      }
    },
    {
      title: "Name the action on the confirm button",
      dont: {
        tree: {
          type: "AlertDialog",
          props: {
            open: true,
            small: true,
            destructive: true,
            title: "Delete this identity?",
            cancelLabel: "No",
            confirmLabel: "Yes"
          }
        },
        caption: "Generic Yes / No forces the user to re-read the title to know what they are confirming."
      },
      do: {
        tree: {
          type: "AlertDialog",
          props: {
            open: true,
            small: true,
            destructive: true,
            title: "Delete this identity?",
            cancelLabel: "Cancel",
            confirmLabel: "Delete"
          }
        },
        caption: "Label the confirm button with the verb it performs (Delete, Archive, Sign out)."
      }
    },
    {
      title: "xs",
      dont: {
        tree: {
          type: "AlertDialog",
          props: {
            open: true,
            narrow: true,
            destructive: true,
            title: "Remove this trusted device?",
            description: "It will need to re-authenticate, and any pending background syncs from it will be cancelled the next time it connects.",
            cancelLabel: "Cancel",
            confirmLabel: "Remove device"
          }
        },
        caption: "A long title, multi-line description, and wordy buttons get cramped in the xs width and wrap awkwardly."
      },
      do: {
        tree: {
          type: "AlertDialog",
          props: {
            open: true,
            narrow: true,
            destructive: true,
            title: "Remove device?",
            cancelLabel: "Cancel",
            confirmLabel: "Remove"
          }
        },
        caption: "Reserve xs for a terse one-line question with short button labels and no body content."
      }
    },
    {
      title: "sm",
      dont: {
        html: "<div class=\"w-full max-w-[384px] rounded-lg border border-border bg-popover p-6 text-popover-foreground shadow-xl\"><h2 class=\"text-base font-semibold\">Transfer ownership</h2><div class=\"mt-4 space-y-4\"><div><label class=\"mb-1.5 block text-sm font-medium\">New owner email</label><input class=\"h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm\" placeholder=\"owner@example.com\"></div><div><label class=\"mb-1.5 block text-sm font-medium\">Reason</label><input class=\"h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm\" placeholder=\"Optional note\"></div><div><label class=\"mb-1.5 block text-sm font-medium\">Type TRANSFER to confirm</label><input class=\"h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm\" placeholder=\"TRANSFER\"></div></div><div class=\"mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end\"><button class=\"inline-flex h-8 items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm font-medium\">Cancel</button><button class=\"inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground\">Transfer</button></div></div>",
        caption: "Packing a multi-field form into sm makes it feel like a form crammed into a confirmation popup."
      },
      do: {
        tree: {
          type: "AlertDialog",
          props: {
            open: true,
            small: true,
            title: "Transfer ownership?",
            description: "You will lose admin access to this workspace.",
            cancelLabel: "Cancel",
            confirmLabel: "Transfer"
          }
        },
        caption: "Use sm for a single short confirmation with a one-line description; move real forms to a full dialog."
      }
    },
    {
      title: "md",
      dont: {
        tree: {
          type: "AlertDialog",
          props: {
            open: true,
            narrow: true,
            destructive: true,
            title: "Delete this identity?",
            description: "This permanently removes the identity and revokes any active sessions. This action cannot be undone.",
            cancelLabel: "Cancel",
            confirmLabel: "Delete"
          }
        },
        caption: "Squeezing a description-carrying confirm into a smaller width crowds the copy against the edges."
      },
      do: {
        tree: {
          type: "AlertDialog",
          props: {
            open: true,
            destructive: true,
            title: "Delete this identity?",
            description: "This permanently removes the identity and revokes any active sessions. This action cannot be undone.",
            cancelLabel: "Cancel",
            confirmLabel: "Delete"
          }
        },
        caption: "md is the default home for a typical destructive confirm with a sentence or two of description."
      }
    },
    {
      title: "lg",
      dont: {
        tree: {
          type: "AlertDialog",
          props: {
            open: true,
            large: true,
            title: "Sign out?",
            cancelLabel: "Cancel",
            confirmLabel: "Sign out"
          }
        },
        caption: "A bare yes/no in lg leaves a wide, empty panel that reads as heavier than the trivial decision it asks for."
      },
      do: {
        tree: {
          type: "AlertDialog",
          props: {
            open: true,
            large: true,
            destructive: true,
            withInput: true,
            title: "Delete this identity?",
            description: "This permanently removes the identity and revokes any active sessions. This action cannot be undone.",
            cancelLabel: "Cancel",
            confirmLabel: "Delete"
          }
        },
        caption: "Reserve lg for dialogs that earn the width: a body field or a longer explanation to read."
      }
    }
  ],
  fieldset: [
    {
      title: "Text fields",
      dont: {
        tree: {
          type: "Fieldset",
          props: {
            legend: "Shipping details",
            items: [{ label: "", placeholder: "Full name" }, { label: "", placeholder: "Email" }]
          }
        },
        caption: "A placeholder is not a label: it vanishes on focus and is skipped by many screen readers, leaving the field unnamed."
      },
      do: {
        tree: {
          type: "Fieldset",
          props: {
            legend: "Shipping details",
            items: [
              { label: "Full name", placeholder: "Ada Lovelace" },
              {
                label: "Email",
                placeholder: "ada@example.com",
                help: "We'll only use this for order updates."
              }
            ]
          }
        },
        caption: "Give every field a persistent label; use the placeholder only for an example value or format hint."
      }
    },
    {
      title: "Checkbox group",
      dont: {
        tree: {
          type: "Fieldset",
          props: { checkboxes: [{ label: "Email" }, { label: "SMS" }, { label: "Push" }] }
        },
        caption: "Without a legend the relationship between the controls is implicit; screen readers announce them as unrelated."
      },
      do: {
        tree: {
          type: "Fieldset",
          props: {
            legend: "Notify me by",
            checkboxes: [{ label: "Email" }, { label: "SMS" }, { label: "Push" }]
          }
        },
        caption: "A legend names the group so its checkboxes read as one labeled unit."
      }
    },
    {
      title: "Two-column",
      dont: {
        tree: {
          type: "Fieldset",
          props: {
            legend: "Account",
            twoColumn: true,
            items: [
              { label: "Bio", value: "Engineering lead." },
              { label: "Country", value: "United States" }
            ]
          }
        },
        caption: "Splitting unrelated or full-width fields across two columns crams the form and breaks the reading order."
      },
      do: {
        tree: {
          type: "Fieldset",
          props: {
            legend: "Card details",
            twoColumn: true,
            items: [
              { label: "Expiry", placeholder: "MM / YY" },
              { label: "CVC", placeholder: "123" }
            ]
          }
        },
        caption: "Pair only naturally adjacent, short fields side by side; the grid stacks to one column on small screens."
      }
    }
  ],
  card: [
    {
      title: "stat",
      dont: {
        tree: {
          type: "Card",
          props: { padded: true, className: "max-w-[280px]" },
          children: [
            {
              type: "Text",
              props: {
                className: "text-xs font-medium uppercase tracking-wide text-muted-foreground"
              },
              children: "This month"
            },
            {
              type: "Text",
              props: { className: "mt-1 text-sm font-medium text-card-foreground" },
              children: "We onboarded 12,348 active identities, up 142 today, with churn holding steady."
            }
          ]
        },
        caption: "Prose where the number should be: the eye has nothing big to land on, so the card stops being a stat."
      },
      do: {
        tree: {
          type: "Card",
          props: { padded: true, className: "max-w-[280px]" },
          children: {
            type: "View",
            props: { className: "flex-row items-start justify-between" },
            children: [
              {
                type: "View",
                children: [
                  {
                    type: "Text",
                    props: {
                      className: "text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    },
                    children: "Active identities"
                  },
                  {
                    type: "Text",
                    props: { className: "mt-1 text-2xl font-bold text-card-foreground" },
                    children: "12,348"
                  },
                  {
                    type: "Text",
                    props: { className: "mt-0.5 text-[11px] text-muted-foreground" },
                    children: "+142 today"
                  }
                ]
              },
              {
                type: "View",
                props: {
                  className: "h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10"
                },
                children: {
                  type: "Text",
                  props: { className: "text-sm font-semibold text-blue-600" },
                  children: "U"
                }
              }
            ]
          }
        },
        caption: "One big number, a short label, a small delta. The metric is scannable in a glance."
      }
    },
    {
      title: "section",
      dont: {
        tree: {
          type: "Card",
          props: { className: "max-w-[360px]" },
          children: [
            {
              type: "CardHeader",
              children: { type: "CardTitle", children: "Recent activity" }
            },
            {
              type: "CardContent",
              children: {
                type: "Text",
                props: { className: "text-sm text-card-foreground" },
                children: "Two events today."
              }
            }
          ]
        },
        caption: "Without the divider the header floats and stops reading as a header."
      },
      do: {
        tree: {
          type: "Card",
          props: { className: "max-w-[360px]" },
          children: [
            {
              type: "CardHeader",
              children: { type: "CardTitle", children: "Recent activity" }
            },
            { type: "CardSeparator" },
            {
              type: "CardContent",
              children: {
                type: "Text",
                props: { className: "text-sm text-card-foreground" },
                children: "Two events today."
              }
            }
          ]
        },
        caption: "Keep the divider between header and body; it anchors the title."
      }
    },
    {
      title: "generic",
      dont: {
        tree: {
          type: "Card",
          props: { padded: true, className: "max-w-[360px]" },
          children: {
            type: "Card",
            props: { padded: true },
            children: [
              {
                type: "Text",
                props: { className: "mb-1 text-[15px] font-semibold text-card-foreground" },
                children: "Nested surface"
              },
              {
                type: "Text",
                props: { className: "text-sm text-muted-foreground" },
                children: "A card inside a card doubles the border and shadow."
              }
            ]
          }
        },
        caption: "Nesting one card surface inside another stacks border on border and shadow on shadow; the inner block looks dropped in."
      },
      do: {
        tree: {
          type: "Card",
          props: { padded: true, className: "max-w-[360px]" },
          children: [
            {
              type: "Text",
              props: { className: "mb-1 text-[15px] font-semibold text-card-foreground" },
              children: "Anything goes here"
            },
            {
              type: "Text",
              props: { className: "text-sm text-muted-foreground" },
              children: "The card surface gives you the border, radius, and shadow. You bring the content."
            }
          ]
        },
        caption: "Use the surface once and layout the content with plain spacing inside it."
      }
    }
  ],
  "code-block": [
    {
      title: "Plain",
      dont: {
        html: "<p class=\"max-w-[360px] font-mono text-[13px]\">const theme = getTheme(); setTheme(theme === \"dark\" ? \"light\" : \"dark\");</p>",
        caption: "A paragraph collapses the line breaks and indentation, so multi-line code reads as one run-on string."
      },
      do: {
        tree: {
          type: "CodeBlock",
          props: {
            code: "const theme = getTheme();\nsetTheme(theme === \"dark\" ? \"light\" : \"dark\");"
          }
        },
        caption: "Use a pre element so whitespace, line breaks, and indentation survive verbatim."
      }
    },
    {
      title: "Terminal",
      dont: {
        html: "<div class=\"w-full overflow-x-auto rounded-lg bg-zinc-900 p-4 font-mono text-[13px] text-zinc-100\">npm install @olympusoss/canvas</div>",
        caption: "Selectable prompt text means a reader who copies the line drags the $ marker into their shell."
      },
      do: {
        tree: {
          type: "CodeBlock",
          props: { terminal: true, code: "npm install @olympusoss/canvas" }
        },
        caption: "Mark the prompt select-none so a copy yields only the command, not the shell glyph."
      }
    },
    {
      title: "Numbered",
      dont: {
        html: "<pre class=\"w-full self-start overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm leading-relaxed text-foreground\"><div class=\"grid grid-cols-[2ch_1fr] gap-x-1\"><span class=\"pr-4 text-right text-muted-foreground/50\">1</span><span>const theme = getTheme();</span><span class=\"pr-4 text-right text-muted-foreground/50\">2</span><span>setTheme(theme);</span></div></pre>",
        caption: "Selectable line numbers get swept into the selection and pasted as 1 2 ahead of every line."
      },
      do: {
        tree: {
          type: "CodeBlock",
          props: { numbered: true, code: "const theme = getTheme();\nsetTheme(theme);" }
        },
        caption: "Keep the gutter select-none so copying the block returns clean, runnable code."
      }
    },
    {
      title: "Inline",
      dont: {
        html: "<p class=\"max-w-[360px] text-sm leading-relaxed\">Run <code class=\"rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground\">npm install @olympusoss/canvas &amp;&amp; npm run build &amp;&amp; npm run preview</code> to start.</p>",
        caption: "A long, multi-step command crammed inline wraps mid-token and offers no horizontal scroll."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[360px] gap-1.5" },
          children: [
            {
              type: "Text",
              props: { className: "text-sm leading-relaxed" },
              children: "Run the setup command:"
            },
            {
              type: "CodeBlock",
              props: { code: "npm install @olympusoss/canvas\nnpm run build" }
            }
          ]
        },
        caption: "Reserve inline code for short tokens; move anything multi-line into a block."
      }
    }
  ],
  "empty-state": [
    {
      title: "search",
      dont: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            icon: "🔍",
            title: "Nothing matched",
            description: "You searched for the wrong thing. Check your spelling and try again."
          }
        },
        caption: "Blaming the searcher for an empty result set makes a normal outcome feel like a mistake."
      },
      do: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            icon: "🔍",
            title: "No results found",
            description: "Try adjusting your search filters."
          }
        },
        caption: "State the result neutrally and point at the lever the user can pull (filters, query)."
      }
    },
    {
      title: "users",
      dont: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            icon: "👥",
            title: "No users",
            description: "There are no team members in this workspace."
          }
        },
        caption: "A dead-end that only restates the emptiness leaves the user with nowhere to go."
      },
      do: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            icon: "👥",
            title: "No users",
            description: "Invite your first team member.",
            actionLabel: "Invite member"
          }
        },
        caption: "When the user can fix it, give them the one action that does (Invite, Create)."
      }
    },
    {
      title: "files",
      dont: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            icon: "📄",
            title: "Nothing here",
            description: "This folder is empty."
          }
        },
        caption: "Generic 'nothing here' copy never tells the user how files would get into the folder."
      },
      do: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            icon: "📄",
            title: "No files",
            description: "Upload or drag files here."
          }
        },
        caption: "Name the gesture that fills the empty space so the next step is obvious."
      }
    },
    {
      title: "activity",
      dont: {
        html: "<div class=\"rounded-lg border border-border px-6 py-8 text-center items-center\"><div class=\"mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10\"><svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"text-destructive\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 8v4\"/><path d=\"M12 16h.01\"/></svg></div><div class=\"text-base font-semibold text-foreground\">No activity</div><p class=\"mt-1 text-sm text-muted-foreground\">Events will appear as they happen.</p></div>",
        caption: "An alarming red icon turns a calm, expected empty feed into a false error."
      },
      do: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            icon: "📈",
            title: "No activity",
            description: "Events will appear as they happen."
          }
        },
        caption: "Keep a routinely-empty state calm: muted icon, reassuring copy, no urgency."
      }
    },
    {
      title: "notifications",
      dont: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            icon: "🔔",
            title: "Nothing to see",
            description: "You have no notifications. Sorry, it's quiet in here."
          }
        },
        caption: "Apologetic, sad-toned copy frames an inbox-zero win as a letdown."
      },
      do: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            icon: "🔔",
            title: "All caught up",
            description: "No new notifications."
          }
        },
        caption: "Celebrate a cleared queue: 'All caught up' reads as success, not absence."
      }
    },
    {
      title: "errors",
      dont: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            icon: "🔍",
            title: "No errors",
            description: "Nothing was found."
          }
        },
        caption: "A grey 'nothing found' disc reads as a failed query, not as a healthy, error-free system."
      },
      do: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            positive: true,
            icon: "✅",
            title: "No errors",
            description: "Everything is running smoothly."
          }
        },
        caption: "Signal the good news with a green check: zero errors is a passing state, not an empty one."
      }
    },
    {
      title: "all-clear",
      dont: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            positive: true,
            icon: "✅",
            title: "No pending reviews",
            description: "3 accounts are locked and waiting on you."
          }
        },
        caption: "A green all-clear over copy that admits work is pending hides the action the user must take."
      },
      do: {
        tree: {
          type: "EmptyState",
          props: {
            bordered: true,
            positive: true,
            icon: "✅",
            title: "All clear",
            description: "No locked accounts or pending reviews."
          }
        },
        caption: "Reserve the green all-clear for genuinely empty queues: nothing locked, nothing waiting."
      }
    }
  ],
  field: [
    {
      title: "Basic",
      dont: {
        html: "<div class=\"flex max-w-[400px] flex-col gap-1\">\n  <div class=\"text-sm\"><span class=\"font-semibold\">Name:</span> Rachel Chen</div>\n  <div class=\"text-sm\"><span class=\"font-semibold\">Role:</span> Admin</div>\n</div>",
        caption: "Inline label-colon-value with no shared column makes values ragged and impossible to scan down a list."
      },
      do: {
        tree: {
          type: "Field",
          props: {
            className: "max-w-[400px]",
            rows: [{ label: "Name", value: "Rachel Chen" }, { label: "Role", value: "Admin" }]
          }
        },
        caption: "Use the fixed 180px label column so every value aligns to one baseline."
      }
    },
    {
      title: "Mono",
      dont: {
        tree: {
          type: "Field",
          props: {
            className: "max-w-[400px]",
            rows: [
              { label: "Client ID", value: "clt_8f2a9b4c7e1d" },
              { label: "Fingerprint", value: "sha256:xK9v..." }
            ]
          }
        },
        caption: "Rendering IDs and hashes in proportional type makes look-alike characters (l/1, O/0) hard to compare."
      },
      do: {
        tree: {
          type: "Field",
          props: {
            className: "max-w-[400px]",
            rows: [
              { label: "Client ID", value: "clt_8f2a9b4c7e1d", mono: true },
              { label: "Fingerprint", value: "sha256:xK9v...", mono: true }
            ]
          }
        },
        caption: "Wrap IDs, hashes, and timestamps in font-mono so every glyph is fixed-width and copy-able."
      }
    },
    {
      title: "Composed",
      dont: {
        tree: {
          type: "Field",
          props: {
            className: "max-w-[400px]",
            rows: [{ label: "Status", value: "Active" }, { label: "Plan", value: "Pro" }]
          }
        },
        caption: "Flattening a live status or plan tier to plain text drops the color and shape that signal state at a glance."
      },
      do: {
        tree: {
          type: "Field",
          props: {
            className: "max-w-[400px]",
            rows: [{ label: "Status", status: "Active" }, { label: "Plan", badge: "Pro" }]
          }
        },
        caption: "Compose real nodes into the value slot: a status badge for state, a badge for the plan tier."
      }
    }
  ],
  form: [
    {
      title: "Stacked",
      dont: {
        tree: {
          type: "Form",
          props: {
            twoColumn: true,
            submitLabel: "Sign in",
            className: "max-w-[360px]",
            fields: [{ label: "Email", placeholder: "you@example.com" }, { label: "Password" }]
          }
        },
        caption: "Pairing an email and password side by side cramps a sign-in form and breaks the natural top-to-bottom reading order."
      },
      do: {
        tree: {
          type: "Form",
          props: {
            stacked: true,
            submitLabel: "Sign in",
            className: "max-w-[360px]",
            fields: [{ label: "Email", placeholder: "you@example.com" }, { label: "Password" }]
          }
        },
        caption: "Keep short forms one field per row so each label sits directly above its input and the eye flows straight down."
      }
    },
    {
      title: "Two-column",
      dont: {
        tree: {
          type: "Form",
          props: {
            twoColumn: true,
            submitLabel: "Save",
            className: "max-w-[560px]",
            fields: [
              { label: "Street address", placeholder: "123 Market St" },
              { label: "ZIP", placeholder: "94103" }
            ]
          }
        },
        caption: "Putting a wide field next to a tiny one in the same two-column row leaves the short input awkwardly oversized."
      },
      do: {
        html: "<div class=\"max-w-[560px]\">\n  <div class=\"mb-3\"><label class=\"mb-1.5 block text-sm font-medium text-foreground\">Street address</label><input class=\"h-9 w-full rounded-md border border-input bg-background px-3 text-sm\" placeholder=\"123 Market St\" /></div>\n  <div class=\"grid grid-cols-2 gap-3\">\n    <div><label class=\"mb-1.5 block text-sm font-medium text-foreground\">City</label><input class=\"h-9 w-full rounded-md border border-input bg-background px-3 text-sm\" placeholder=\"San Francisco\" /></div>\n    <div><label class=\"mb-1.5 block text-sm font-medium text-foreground\">ZIP</label><input class=\"h-9 w-full rounded-md border border-input bg-background px-3 text-sm\" placeholder=\"94103\" /></div>\n  </div>\n</div>",
        caption: "Pair fields of similar width (city / ZIP) in a row and give a full-width field like the street its own line."
      }
    },
    {
      title: "Sidebar",
      dont: {
        tree: {
          type: "Form",
          props: {
            sidebar: true,
            submitLabel: "Save",
            className: "max-w-[720px]",
            sections: [
              {
                title: "Personal info",
                fields: [{ label: "Full name", value: "Rachel Chen" }]
              },
              { title: "Billing", fields: [{ label: "Card number", value: "•••• 4242" }] }
            ]
          }
        },
        caption: "A bare section heading with no helper text wastes the sidebar column and gives the user no context for the group."
      },
      do: {
        tree: {
          type: "Form",
          props: {
            sidebar: true,
            submitLabel: "Save",
            className: "max-w-[720px]",
            sections: [
              {
                title: "Personal info",
                description: "Displayed on your public profile.",
                fields: [{ label: "Full name", value: "Rachel Chen" }]
              },
              {
                title: "Billing",
                description: "Used for invoices and receipts.",
                fields: [{ label: "Card number", value: "•••• 4242" }]
              }
            ]
          }
        },
        caption: "Pair each sidebar heading with a line of helper text so the left column explains what the section's fields are for."
      }
    }
  ],
  "action-panels": [
    {
      title: "Simple",
      dont: {
        tree: {
          type: "ActionPanel",
          props: {
            title: "Delete this project",
            actionLabel: "Delete project",
            destructive: true,
            className: "max-w-[420px]"
          }
        },
        caption: "A destructive action with no consequence copy invites accidental, irreversible clicks."
      },
      do: {
        tree: {
          type: "ActionPanel",
          props: {
            title: "Delete this project",
            description: "Once you delete a project, there is no going back. Please be certain.",
            actionLabel: "Delete project",
            destructive: true,
            className: "max-w-[420px]"
          }
        },
        caption: "Spell out the consequence above the button so the stakes are clear before the click."
      }
    },
    {
      title: "With form inline",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[420px] p-6\">\n  <div class=\"mb-1 text-[15px] font-semibold\">Subscribe to updates</div>\n  <div class=\"mb-4 text-sm text-muted-foreground\">We'll send you a weekly digest of what changed.</div>\n  <input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50\" type=\"email\" placeholder=\"you@example.com\" />\n  <div class=\"mt-2\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2\">Subscribe</button></div>\n</div>",
        caption: "Stacking the field above its button breaks the single-decision rhythm and adds a row of dead space."
      },
      do: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[420px] p-6\">\n  <div class=\"mb-1 text-[15px] font-semibold\">Subscribe to updates</div>\n  <div class=\"mb-4 text-sm text-muted-foreground\">We'll send you a weekly digest of what changed.</div>\n  <div class=\"flex gap-2\">\n    <input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex-1\" type=\"email\" placeholder=\"you@example.com\" />\n    <button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2\">Subscribe</button>\n  </div>\n</div>",
        caption: "Keep the input and its submit button on one row so the input + action reads as one step."
      }
    },
    {
      title: "Side-by-side",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm flex max-w-[460px] items-start gap-6 p-6\">\n  <div class=\"flex-1\">\n    <div class=\"mb-1 text-[15px] font-semibold\">Discard unsaved changes?</div>\n    <div class=\"text-sm text-muted-foreground\">You have unsaved edits in this form. Leaving now will lose all progress.</div>\n  </div>\n  <div class=\"flex shrink-0 gap-2\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 rounded-md px-3 text-xs\">Discard</button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 rounded-md px-3 text-xs\">Cancel</button></div>\n</div>",
        caption: "Two destructive-styled buttons make the safe escape (Cancel) look as dangerous as the discard."
      },
      do: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm flex max-w-[460px] items-start gap-6 p-6\">\n  <div class=\"flex-1\">\n    <div class=\"mb-1 text-[15px] font-semibold\">Discard unsaved changes?</div>\n    <div class=\"text-sm text-muted-foreground\">You have unsaved edits in this form. Leaving now will lose all progress.</div>\n  </div>\n  <div class=\"flex shrink-0 gap-2\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Cancel</button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 rounded-md px-3 text-xs\">Discard</button></div>\n</div>",
        caption: "Style only the irreversible action as destructive; keep the cancel/escape as a quiet outline button."
      }
    },
    {
      title: "With toggle",
      dont: {
        tree: {
          type: "ActionPanel",
          props: {
            title: "Two-factor authentication",
            toggle: true,
            checked: true,
            className: "max-w-[460px]"
          }
        },
        caption: "A bare switch with no description leaves the user guessing what flipping it actually changes."
      },
      do: {
        tree: {
          type: "ActionPanel",
          props: {
            title: "Two-factor authentication",
            description: "Add an extra layer of security to your account by requiring a verification code on login.",
            toggle: true,
            checked: true,
            className: "max-w-[460px]"
          }
        },
        caption: "Pair the switch with a one-line explanation of what turning it on or off does."
      }
    }
  ],
  "description-lists": [
    {
      title: "Two-column",
      dont: {
        html: "<dl class=\"max-w-[420px]\">\n  <div class=\"grid grid-cols-[64px_1fr] gap-4 border-b border-border py-3 text-sm\"><dt class=\"text-muted-foreground\">Client identifier</dt><dd class=\"break-all font-mono text-[12.5px]\">clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF</dd></div>\n  <div class=\"grid grid-cols-[64px_1fr] gap-4 py-3 text-sm\"><dt class=\"text-muted-foreground\">Status</dt><dd><span class=\"inline-flex items-center gap-1.5 rounded-full border border-transparent bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600\"><span class=\"h-1.5 w-1.5 rounded-full bg-emerald-500\"></span>Active</span></dd></div>\n</dl>",
        caption: "A too-narrow label column wraps the longest term and knocks the two columns out of alignment."
      },
      do: {
        tree: {
          type: "DescriptionList",
          props: {
            twoColumn: true,
            divided: true,
            className: "max-w-[420px]",
            items: [
              {
                term: "Client identifier",
                value: "clnt_01H2X8K9P3Q7VN4W6R5T0JYMZF",
                mono: true
              },
              { term: "Status", value: "Active", status: true }
            ]
          }
        },
        caption: "Fix the label column wide enough for the longest term so every value lines up on one edge."
      }
    },
    {
      title: "Inline-edit",
      dont: {
        tree: {
          type: "DescriptionList",
          props: {
            twoColumn: true,
            className: "max-w-[420px]",
            items: [
              { term: "Name", value: "Rachel Chen" },
              { term: "Email", value: "rachel.chen@example.com" }
            ]
          }
        },
        caption: "Editable rows that look identical to read-only ones give no hint a value can be changed."
      },
      do: {
        tree: {
          type: "DescriptionList",
          props: {
            twoColumn: true,
            className: "max-w-[420px]",
            items: [
              { term: "Name", value: "Rachel Chen", update: true },
              { term: "Email", value: "rachel.chen@example.com", update: true }
            ]
          }
        },
        caption: "Give every editable row a trailing Update affordance so the inline editor is discoverable."
      }
    },
    {
      title: "Stacked",
      dont: {
        html: "<dl class=\"max-w-[320px] flex flex-col gap-4\">\n  <div><dt class=\"mb-1 text-sm\">Full name</dt><dd class=\"text-sm text-muted-foreground\">Rachel Chen</dd></div>\n  <div><dt class=\"mb-1 text-sm\">Email</dt><dd class=\"text-sm text-muted-foreground\">rachel.chen@example.com</dd></div>\n</dl>",
        caption: "Muting the value and bolding nothing inverts the hierarchy; the label outweighs the data it describes."
      },
      do: {
        tree: {
          type: "DescriptionList",
          props: {
            stacked: true,
            className: "max-w-[320px]",
            items: [
              { term: "Full name", value: "Rachel Chen" },
              { term: "Email", value: "rachel.chen@example.com" }
            ]
          }
        },
        caption: "Keep the label small, uppercase, and muted above a full-weight value so the data stays primary."
      }
    }
  ],
  feeds: [
    {
      title: "Connector",
      dont: {
        html: "<div class=\"w-full max-w-[420px] rounded-lg border border-border bg-card overflow-hidden p-6\"><ul class=\"m-0 list-none p-0\"><li class=\"relative flex gap-3 pb-6\"><div class=\"absolute -bottom-6 left-[13px] top-7 w-px bg-border\"></div><div class=\"flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card\"><span class=\"text-xs font-medium text-muted-foreground\">RC</span></div><div class=\"flex-1 pt-0.5\"><div class=\"text-sm\"><span class=\"font-medium\">Rachel Chen</span> <span class=\"text-muted-foreground\">approved the request</span></div><div class=\"mt-0.5 text-xs text-muted-foreground\">2 hours ago</div></div></li><li class=\"relative flex gap-3\"><div class=\"absolute -bottom-6 left-[13px] top-7 w-px bg-border\"></div><div class=\"flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card\"><span class=\"text-xs font-medium text-muted-foreground\">SY</span></div><div class=\"flex-1 pt-0.5\"><div class=\"text-sm\"><span class=\"font-medium\">System</span> <span class=\"text-muted-foreground\">created the project</span></div><div class=\"mt-0.5 text-xs text-muted-foreground\">3 days ago</div></div></li></ul></div>",
        caption: "Running the connector line past the final event leaves a dangling tail pointing at nothing."
      },
      do: {
        tree: {
          type: "Feed",
          props: {
            connector: true,
            items: [
              { actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" },
              { actor: "System", action: "created the project", time: "3 days ago" }
            ]
          }
        },
        caption: "Drop the connector on the last item so the line terminates cleanly at the final event."
      }
    },
    {
      title: "Avatar",
      dont: {
        html: "<div class=\"w-full max-w-[420px] rounded-lg border border-border bg-card overflow-hidden\"><div class=\"flex items-start gap-3 px-5 py-4\"><span class=\"inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-base font-medium text-muted-foreground\">?</span><div class=\"min-w-0 flex-1\"><div class=\"text-sm text-muted-foreground\">Pushed 3 commits</div></div></div></div>",
        caption: "An anonymous avatar with no actor name and no timestamp strips the row of the who and the when."
      },
      do: {
        tree: {
          type: "Feed",
          props: {
            avatar: true,
            items: [
              {
                actor: "Ada Lovelace",
                action: "pushed 3 commits",
                time: "5 hours ago",
                avatar: "/ada-lovelace.jpg"
              }
            ]
          }
        },
        caption: "Lead with the person's avatar, bold the actor, and keep the action plus a relative timestamp muted."
      }
    }
  ],
  "grid-lists": [
    {
      title: "People (card grid)",
      dont: {
        html: "<div class=\"grid grid-cols-4 gap-3.5\"><div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm flex w-[200px] flex-col items-center gap-2 p-5 text-center\"><span class=\"inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground h-16 w-16 text-2xl\">RC</span><div class=\"text-sm font-semibold\">Rachel Chen</div><div class=\"text-xs text-muted-foreground\">Engineering Lead</div></div><div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm flex w-[200px] flex-col items-center gap-2 p-5 text-center\"><span class=\"inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground h-16 w-16 text-2xl\">AL</span><div class=\"text-sm font-semibold\">Ada Lovelace</div><div class=\"text-xs text-muted-foreground\">Staff Engineer</div></div><div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm flex w-[200px] flex-col items-center gap-2 p-5 text-center\"><span class=\"inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground h-16 w-16 text-2xl\">KT</span><div class=\"text-sm font-semibold\">Kevin Turner</div><div class=\"text-xs text-muted-foreground\">Product Designer</div></div></div>",
        caption: "A fixed column count with hard-width cards overflows the row on narrow viewports instead of reflowing."
      },
      do: {
        tree: {
          type: "GridList",
          props: {
            cols2: true,
            items: [
              { title: "Rachel Chen", subtitle: "Engineering Lead", avatar: "RC" },
              { title: "Ada Lovelace", subtitle: "Staff Engineer", avatar: "AL" },
              { title: "Kevin Turner", subtitle: "Product Designer", avatar: "KT" }
            ]
          }
        },
        caption: "Let auto-fill minmax columns size to the available width so cards wrap cleanly at any breakpoint."
      }
    },
    {
      title: "Image gallery",
      dont: {
        html: "<div class=\"grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3\"><div><div class=\"h-24 overflow-hidden rounded-md bg-gradient-to-br from-primary/30 to-primary/10\"></div><div class=\"mt-2 truncate text-[12.5px] font-medium\">hero-banner.png</div></div><div><div class=\"h-40 overflow-hidden rounded-md bg-gradient-to-br from-blue-500/30 to-blue-500/10\"></div><div class=\"mt-2 truncate text-[12.5px] font-medium\">icon-set.svg</div></div><div><div class=\"h-16 overflow-hidden rounded-md bg-gradient-to-br from-emerald-500/30 to-emerald-500/10\"></div><div class=\"mt-2 truncate text-[12.5px] font-medium\">product-shot.jpg</div></div><div><div class=\"h-32 overflow-hidden rounded-md bg-gradient-to-br from-amber-500/30 to-amber-500/10\"></div><div class=\"mt-2 truncate text-[12.5px] font-medium\">avatar-default.png</div></div></div>",
        caption: "Letting each thumbnail keep its intrinsic height makes a ragged grid and shifts the layout as images load."
      },
      do: {
        tree: {
          type: "GridList",
          props: {
            gallery: true,
            cols3: true,
            items: [
              { title: "hero-banner.png", subtitle: "1.2 MB", color: "primary" },
              { title: "icon-set.svg", subtitle: "340 KB", color: "blue-500" },
              { title: "product-shot.jpg", subtitle: "2.8 MB", color: "emerald-500" },
              { title: "avatar-default.png", subtitle: "96 KB", color: "amber-500" }
            ]
          }
        },
        caption: "Lock a consistent aspect ratio so the grid stays even and nothing reflows once thumbnails load."
      }
    }
  ],
  "media-objects": [
    {
      title: "Avatar",
      dont: {
        tree: {
          type: "MediaObject",
          props: {
            bordered: true,
            center: true,
            className: "max-w-[480px]",
            src: "/rachel-chen.jpg",
            title: "Rachel Chen",
            description: "Engineering Lead",
            body: "Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging."
          }
        },
        caption: "Centering the avatar against a multi-line body leaves it floating beside the middle of the text."
      },
      do: {
        tree: {
          type: "MediaObject",
          props: {
            bordered: true,
            start: true,
            className: "max-w-[480px]",
            src: "/rachel-chen.jpg",
            title: "Rachel Chen",
            description: "Engineering Lead",
            body: "Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging."
          }
        },
        caption: "Top-align with items-start so the avatar anchors to the first line of the title."
      }
    },
    {
      title: "Icon",
      dont: {
        html: "<div class=\"flex max-w-[480px] items-start gap-3 rounded-lg border border-border bg-card p-4\">\n  <div class=\"inline-flex shrink-0 items-center justify-center rounded-md bg-primary/15 p-2 text-primary\"><svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/></svg></div>\n  <div class=\"min-w-0 flex-1\"><div class=\"text-sm font-semibold\">Security first</div><div class=\"mt-0.5 text-xs leading-snug text-muted-foreground\">End-to-end encryption with automatic key rotation.</div></div>\n</div>",
        caption: "An oversized icon box throws off the optical balance with the two-line text."
      },
      do: {
        tree: {
          type: "MediaObject",
          props: {
            bordered: true,
            start: true,
            className: "max-w-[480px]",
            title: "Security first",
            description: "End-to-end encryption with automatic key rotation.",
            icon: { type: "Icon", props: { shield: true, primary: true, size: 18 } }
          }
        },
        caption: "Fix the icon box at h-9 w-9 with an 18px glyph so it reads as a tidy lead affordance."
      }
    },
    {
      title: "Action",
      dont: {
        tree: {
          type: "MediaObject",
          props: {
            bordered: true,
            center: true,
            className: "max-w-[480px]",
            src: "/ada-lovelace.jpg",
            title: "Ada Lovelace",
            description: "ada.lovelace@analytical-engine.example.com",
            action: { type: "Button", props: { outline: true, small: true }, children: "Invite" }
          }
        },
        caption: "Without truncation a long email wraps and pushes the trailing button out of alignment."
      },
      do: {
        tree: {
          type: "MediaObject",
          props: {
            bordered: true,
            center: true,
            truncate: true,
            className: "max-w-[480px]",
            src: "/ada-lovelace.jpg",
            title: "Ada Lovelace",
            description: "ada.lovelace@analytical-engine.example.com",
            action: { type: "Button", props: { outline: true, small: true }, children: "Invite" }
          }
        },
        caption: "Use min-w-0 + truncate on the text and shrink-0 on the button to keep the action pinned right."
      }
    }
  ],
  "stacked-lists": [
    {
      title: "Two-line with avatar",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card overflow-hidden shadow-sm max-w-[560px]\"><div class=\"flex items-center gap-3 px-5 py-3\"><span class=\"inline-flex h-10 w-10 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted text-[12px] font-medium text-muted-foreground\">RC</span><div class=\"min-w-0 flex-1\"><div class=\"text-[13.5px] font-semibold\">Rachel Chen</div><div class=\"text-[13.5px] font-semibold\">rachel.chen@example.com</div></div></div></div>",
        caption: "Equal weight on both lines flattens the hierarchy; the email competes with the name."
      },
      do: {
        tree: {
          type: "StackedList",
          props: {
            items: [{ name: "Rachel Chen", detail: "rachel.chen@example.com", initials: "RC" }]
          }
        },
        caption: "Primary line bold; secondary line smaller and muted, truncated so long values never wrap."
      }
    },
    {
      title: "Clickable",
      dont: {
        tree: {
          type: "StackedList",
          props: {
            items: [
              {
                name: "Ada Lovelace",
                detail: "ada@example.com",
                meta: "5h ago",
                initials: "AL"
              }
            ]
          }
        },
        caption: "A drilldown row with no hover state and no chevron gives no hint it is interactive."
      },
      do: {
        tree: {
          type: "StackedList",
          props: {
            clickable: true,
            items: [
              {
                name: "Ada Lovelace",
                detail: "ada@example.com",
                meta: "5h ago",
                initials: "AL"
              }
            ]
          }
        },
        caption: "Wrap the row in a link with a hover background and a trailing chevron to signal drilldown."
      }
    },
    {
      title: "Card surface group",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card overflow-hidden shadow-sm max-w-[560px]\"><div class=\"flex items-center justify-between px-5 py-3\"><span class=\"text-sm font-semibold\">Team members</span></div><div class=\"flex items-center gap-3 px-5 py-3\"><span class=\"inline-flex h-10 w-10 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted text-[12px] font-medium text-muted-foreground\">RC</span><div class=\"min-w-0 flex-1\"><div class=\"text-[13.5px] font-semibold\">Rachel Chen</div><div class=\"text-xs text-muted-foreground\">Engineering Lead</div></div></div></div>",
        caption: "A header with no rule blends into the rows, and dropping the per-row action removes the affordance."
      },
      do: {
        tree: {
          type: "StackedList",
          props: {
            card: true,
            title: "Team members",
            addAction: "Add",
            rowMenu: true,
            items: [{ name: "Rachel Chen", detail: "Engineering Lead", initials: "RC" }]
          }
        },
        caption: "Separate the titled header with a rule and give each row a trailing action menu."
      }
    }
  ],
  stats: [
    {
      title: "Single",
      dont: {
        tree: {
          type: "Stats",
          props: {
            className: "max-w-[280px]",
            items: [{ label: "Active users", value: "71,897", delta: "+12.3%" }]
          }
        },
        caption: "A bare delta with no baseline leaves the reader asking: up against what, and over what window?"
      },
      do: {
        tree: {
          type: "Stats",
          props: {
            className: "max-w-[280px]",
            items: [{ label: "Active users", value: "71,897", delta: "+12.3% vs. last 30 days" }]
          }
        },
        caption: "Name the comparison and the period so the delta is unambiguous."
      }
    },
    {
      title: "Group",
      dont: {
        tree: {
          type: "Stats",
          props: {
            items: [
              { label: "Revenue", value: "$48,250.00", delta: "+12.5%" },
              { label: "Orders", value: "842", delta: "+3.2%" },
              { label: "Conversion", value: "3.6%", delta: "+0.4%" }
            ]
          }
        },
        caption: "A fixed flex row of full-precision numbers overflows on narrow viewports and crowds the cards."
      },
      do: {
        tree: {
          type: "Stats",
          props: {
            items: [
              { label: "Revenue", value: "$48.2k", delta: "+12.5%" },
              { label: "Orders", value: "842", delta: "+3.2%" },
              { label: "Conversion", value: "3.6%", delta: "+0.4%" }
            ]
          }
        },
        caption: "Use the auto-fit grid and round headline numbers so cards wrap and stay scannable."
      }
    },
    {
      title: "Plain (no border)",
      dont: {
        tree: {
          type: "View",
          props: { className: "rounded-lg border border-border bg-card shadow-sm p-6" },
          children: [
            {
              type: "Stats",
              props: {
                items: [{ label: "Revenue", value: "$48.2k" }, { label: "Orders", value: "842" }]
              }
            }
          ]
        },
        caption: "Bordered cards inside a card surface double the chrome: a box drawn around boxes."
      },
      do: {
        tree: {
          type: "Stats",
          props: {
            plain: true,
            items: [{ label: "Revenue", value: "$48.2k" }, { label: "Orders", value: "842" }]
          }
        },
        caption: "On a parent surface drop the border and radius; let the number stacks stand on their own."
      }
    },
    {
      title: "With sparkline",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[220px] p-5\"><div class=\"text-xs text-muted-foreground\">Requests</div><div class=\"mt-1 text-2xl font-semibold\">24.5k</div><svg width=\"100%\" height=\"24\" viewBox=\"0 0 200 24\" preserveAspectRatio=\"none\" class=\"mt-2 block\"><polyline points=\"0,20 20,16 40,18 60,12 80,14 100,8 120,10 140,6 160,8 180,4 200,2\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"1.5\"/></svg></div>",
        caption: "A trend line with no current delta makes you eyeball the slope to guess the direction."
      },
      do: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[220px] p-5\"><div class=\"text-xs text-muted-foreground\">Requests</div><div class=\"mt-1 flex items-baseline justify-between\"><span class=\"text-2xl font-semibold\">24.5k</span><span class=\"font-mono text-[11px] text-emerald-600\">+8.2%</span></div><svg width=\"100%\" height=\"24\" viewBox=\"0 0 200 24\" preserveAspectRatio=\"none\" class=\"mt-2 block\"><defs><linearGradient id=\"sgd\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"var(--primary)\" stop-opacity=\"0.3\"/><stop offset=\"100%\" stop-color=\"var(--primary)\" stop-opacity=\"0\"/></linearGradient></defs><polygon points=\"0,20 20,16 40,18 60,12 80,14 100,8 120,10 140,6 160,8 180,4 200,2 200,24 0,24\" fill=\"url(#sgd)\"/><polyline points=\"0,20 20,16 40,18 60,12 80,14 100,8 120,10 140,6 160,8 180,4 200,2\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"1.5\"/></svg></div>",
        caption: "Pair the sparkline with an explicit delta so the headline reads without decoding the curve."
      }
    }
  ],
  "filter-panel": [
    {
      title: "Sidebar",
      dont: {
        html: "<div class=\"flex flex-wrap gap-2\"><span class=\"inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground\">Active</span><span class=\"inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground\">Default</span></div>",
        caption: "Active-filter chips with no remove affordance leave no way to clear one filter without hunting back through the sidebar."
      },
      do: {
        html: "<div class=\"flex flex-wrap gap-2\"><span class=\"inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground\">Active &#215;</span><span class=\"inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground\">Default &#215;</span></div>",
        caption: "Give each chip a × so a single filter can be removed in place, and keep it in sync with the sidebar checkbox."
      }
    },
    {
      title: "Inline",
      dont: {
        html: "<div class=\"flex flex-wrap items-center gap-2\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Status <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg></button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Role <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg></button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Schema <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg></button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">MFA <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg></button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Region <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg></button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Created <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg></button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Last seen <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg></button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Team <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg></button></div>",
        caption: "Eight inline dropdowns wrap into a wall of buttons, which defeats the compact bar; that volume of filtering belongs in the sidebar rail."
      },
      do: {
        html: "<div class=\"flex flex-wrap items-center gap-2\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-md px-3 text-xs\">Status <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg></button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Role <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"m6 9 6 6 6-6\"/></svg></button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs text-primary\">+ Add filter</button></div>",
        caption: "Surface two or three primary filters and tuck the rest behind \"+ Add filter\" so the bar stays one scannable row."
      }
    }
  ],
  calendar: [
    {
      title: "Single date",
      dont: {
        html: "<div class=\"w-fit rounded-lg border border-border p-3\"><div class=\"grid grid-cols-7 gap-0.5\"><button class=\"flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent bg-primary text-primary-foreground hover:bg-primary\">8</button><button class=\"flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent bg-primary text-primary-foreground hover:bg-primary\">14</button><button class=\"flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent bg-primary text-primary-foreground hover:bg-primary\">23</button></div></div>",
        caption: "Painting several days with the primary selected style makes a single-date picker look like a multi-select."
      },
      do: {
        html: "<div class=\"w-fit rounded-lg border border-border p-3\"><div class=\"grid grid-cols-7 gap-0.5\"><button class=\"flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent\">8</button><button class=\"flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent bg-accent font-medium text-accent-foreground\">23</button><button class=\"flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent bg-primary text-primary-foreground hover:bg-primary\">24</button></div></div>",
        caption: "Exactly one selected day (primary), with today marked separately in the accent tone."
      }
    },
    {
      title: "With event list",
      dont: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-start gap-6" },
          children: [
            {
              type: "Calendar",
              props: {
                month: "May 2026",
                today: 23,
                selected: 24,
                daysInMonth: 31,
                startWeekday: 4
              }
            },
            {
              type: "Card",
              props: { className: "min-w-[240px] flex-1" },
              children: {
                type: "View",
                props: { className: "px-4 py-3" },
                children: {
                  type: "Text",
                  props: { className: "text-sm text-muted-foreground" },
                  children: "Pick a date to see events."
                }
              }
            }
          ]
        },
        caption: "Selecting May 24 but leaving the panel on a placeholder breaks the link between the grid and its day."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "flex-row flex-wrap items-start gap-6" },
          children: [
            {
              type: "Calendar",
              props: {
                month: "May 2026",
                today: 23,
                selected: 24,
                daysInMonth: 31,
                startWeekday: 4
              }
            },
            {
              type: "Card",
              props: { className: "min-w-[240px] flex-1" },
              children: [
                {
                  type: "View",
                  props: { className: "border-b border-border px-5 py-3" },
                  children: {
                    type: "Text",
                    props: { className: "text-sm font-semibold text-card-foreground" },
                    children: "May 24"
                  }
                },
                {
                  type: "View",
                  props: { className: "flex-row items-center justify-between px-4 py-2.5" },
                  children: [
                    {
                      type: "Text",
                      props: { className: "text-sm font-medium text-foreground" },
                      children: "Sprint planning"
                    },
                    {
                      type: "Text",
                      props: { className: "text-sm text-muted-foreground" },
                      children: "9:00 AM"
                    }
                  ]
                }
              ]
            }
          ]
        },
        caption: "Keep the panel header and rows in sync with the selected day so the two views always agree."
      }
    }
  ],
  command: [
    {
      title: "Trigger",
      dont: {
        html: "<button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3\">\n  <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/></svg>\n  Search...\n</button>",
        caption: "A bare search button hides the keyboard shortcut, so power users never learn the &#8984;K entry point."
      },
      do: {
        tree: { type: "Command", props: { trigger: true, open: false } },
        caption: "Surface the shortcut in a trailing kbd so the trigger advertises the faster keyboard path."
      }
    },
    {
      title: "Inline",
      dont: {
        tree: {
          type: "Command",
          props: {
            open: true,
            placeholder: "Type a command...",
            active: -1,
            groups: [
              {
                items: [
                  { label: "New File", icon: "📄", shortcut: "Ctrl+N" },
                  { label: "Save", icon: "💾", shortcut: "Ctrl+S" },
                  { label: "Go to Dashboard", icon: "▸" },
                  { label: "Go to Settings", icon: "▸" }
                ]
              }
            ]
          }
        },
        caption: "Dumping every command into one flat list with no labels makes the palette hard to scan."
      },
      do: {
        tree: {
          type: "Command",
          props: {
            open: true,
            placeholder: "Type a command...",
            active: 0,
            groups: [
              {
                heading: "Actions",
                items: [
                  { label: "New File", icon: "📄", shortcut: "Ctrl+N" },
                  { label: "Save", icon: "💾", shortcut: "Ctrl+S" }
                ]
              },
              {
                heading: "Navigation",
                items: [
                  { label: "Go to Dashboard", icon: "▸" },
                  { label: "Go to Settings", icon: "▸" }
                ]
              }
            ]
          }
        },
        caption: "Group commands under labels with separators and highlight the first match so results stay scannable."
      }
    }
  ],
  "data-table": [
    {
      title: "default",
      dont: {
        tree: {
          type: "View",
          props: { className: "overflow-hidden rounded-lg border border-border max-w-[520px]" },
          children: [
            {
              type: "View",
              props: { className: "flex-row items-center gap-2 border-b border-border p-3" },
              children: [
                {
                  type: "Input",
                  props: { small: true, placeholder: "Search users...", className: "max-w-[240px]" }
                },
                { type: "View", props: { className: "flex-1" } },
                { type: "Button", props: { outline: true, small: true }, children: "Export" }
              ]
            },
            {
              type: "DataTable",
              props: {
                columns: ["Name", "Email"],
                rows: [
                  ["Alice Johnson", "alice@example.com"],
                  ["Bob Smith", "bob@example.com"],
                  ["Rachel Chen", "rachel@example.com"]
                ]
              }
            }
          ]
        },
        caption: "Wiring search but dropping the footer leaves the user with no result count or way to page through 142 rows."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "overflow-hidden rounded-lg border border-border max-w-[520px]" },
          children: [
            {
              type: "View",
              props: { className: "flex-row items-center gap-2 border-b border-border p-3" },
              children: [
                {
                  type: "Input",
                  props: { small: true, placeholder: "Search users...", className: "max-w-[240px]" }
                },
                { type: "View", props: { className: "flex-1" } },
                { type: "Button", props: { outline: true, small: true }, children: "Export" }
              ]
            },
            {
              type: "DataTable",
              props: {
                columns: ["Name", "Email"],
                rows: [
                  ["Alice Johnson", "alice@example.com"],
                  ["Bob Smith", "bob@example.com"],
                  ["Rachel Chen", "rachel@example.com"]
                ]
              }
            },
            {
              type: "View",
              props: {
                className: "flex-row items-center justify-between border-t border-border px-4 py-2.5"
              },
              children: [
                {
                  type: "Text",
                  props: { className: "text-sm text-muted-foreground" },
                  children: "Showing 1–3 of 142"
                },
                {
                  type: "View",
                  props: { className: "flex-row gap-1" },
                  children: [
                    {
                      type: "Button",
                      props: { outline: true, small: true, disabled: true },
                      children: "«"
                    },
                    { type: "Button", props: { outline: true, small: true }, children: "»" }
                  ]
                }
              ]
            }
          ]
        },
        caption: "Keep the count + pagination footer so the search result is always anchored to the total."
      }
    },
    {
      title: "bulk",
      dont: {
        tree: {
          type: "View",
          props: {
            className: "flex-row items-center gap-2 rounded-lg border border-border p-3 max-w-[520px]"
          },
          children: [
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "3 selected"
            },
            { type: "View", props: { className: "flex-1" } },
            {
              type: "Button",
              props: { destructive: true, small: true },
              children: "Delete"
            }
          ]
        },
        caption: "Surfacing only the destructive Delete on a selection invites accidental data loss with no safer path."
      },
      do: {
        tree: {
          type: "View",
          props: {
            className: "flex-row items-center gap-2 rounded-lg border border-border p-3 max-w-[520px]"
          },
          children: [
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "3 selected"
            },
            { type: "View", props: { className: "flex-1" } },
            {
              type: "Button",
              props: { outline: true, small: true },
              children: "Bulk edit"
            },
            {
              type: "Button",
              props: { destructive: true, small: true },
              children: "Delete"
            }
          ]
        },
        caption: "Lead with the non-destructive bulk action and keep Delete visually distinct on the right."
      }
    },
    {
      title: "filter",
      dont: {
        tree: {
          type: "View",
          props: {
            className: "flex-row items-center gap-2 rounded-lg border border-border p-3 max-w-[520px]"
          },
          children: [
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "Status:"
            },
            {
              type: "Select",
              props: {
                open: false,
                value: "All",
                options: ["All", "Active", "Inactive"],
                small: true,
                className: "w-[120px]"
              }
            }
          ]
        },
        caption: "A filter control with no result count leaves the user guessing whether the filter narrowed anything."
      },
      do: {
        tree: {
          type: "View",
          props: {
            className: "flex-row items-center gap-2 rounded-lg border border-border p-3 max-w-[520px]"
          },
          children: [
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "Status:"
            },
            {
              type: "Select",
              props: {
                open: false,
                value: "All",
                options: ["All", "Active", "Inactive"],
                small: true,
                className: "w-[120px]"
              }
            },
            { type: "View", props: { className: "flex-1" } },
            {
              type: "Text",
              props: { className: "text-xs text-muted-foreground" },
              children: "142 results"
            }
          ]
        },
        caption: "Echo the live result count next to the filter so its effect is visible."
      }
    },
    {
      title: "empty",
      dont: {
        tree: {
          type: "DataTable",
          props: {
            bordered: true,
            columns: ["Name", "Email", "Status"],
            rows: [],
            className: "max-w-[520px]"
          }
        },
        caption: "Hiding the body entirely on no results collapses the table and looks broken."
      },
      do: {
        html: "<div class=\"overflow-hidden rounded-lg border border-border max-w-[520px]\"><div class=\"overflow-x-auto\"><table class=\"w-full text-sm\"><thead><tr><th class=\"border-b border-border bg-muted/40 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground\">Name</th><th class=\"border-b border-border bg-muted/40 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground\">Email</th><th class=\"border-b border-border bg-muted/40 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground\">Status</th></tr></thead><tbody><tr><td colspan=\"3\" class=\"px-4 py-8 text-center text-sm text-muted-foreground\">No results found.</td></tr></tbody></table></div></div>",
        caption: "Keep the header and span a single centered message row so the structure stays intact."
      }
    },
    {
      title: "loading",
      dont: {
        html: "<div class=\"overflow-hidden rounded-lg border border-border max-w-[520px]\"><div class=\"overflow-x-auto\"><table class=\"w-full text-sm\"><thead><tr><th class=\"border-b border-border bg-muted/40 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground\">Name</th><th class=\"border-b border-border bg-muted/40 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground\">Email</th><th class=\"border-b border-border bg-muted/40 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground\">Status</th></tr></thead><tbody><tr><td colspan=\"3\" class=\"px-4 py-8 text-center text-sm text-muted-foreground\">Loading…</td></tr></tbody></table></div></div>",
        caption: "A bare \"Loading…\" string gives no sense of progress and reads like static content."
      },
      do: {
        html: "<div class=\"overflow-hidden rounded-lg border border-border max-w-[520px]\"><div class=\"overflow-x-auto\"><table class=\"w-full text-sm\"><thead><tr><th class=\"border-b border-border bg-muted/40 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground\">Name</th><th class=\"border-b border-border bg-muted/40 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground\">Email</th><th class=\"border-b border-border bg-muted/40 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground\">Status</th></tr></thead><tbody><tr><td colspan=\"3\" class=\"px-4 py-8 text-center\"><div class=\"inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground\"></div></td></tr></tbody></table></div></div>",
        caption: "Show a spinner in a centered spanning row so the load reads as active and in place."
      }
    }
  ],
  dialog: [
    {
      title: "When to use",
      dont: {
        tree: {
          type: "Dialog",
          props: {
            open: true,
            title: "Delete file?",
            small: true,
            destructive: true,
            confirmLabel: "Delete",
            cancelLabel: "Cancel"
          }
        },
        caption: "A bare yes/no question does not need the roomier Dialog; that is what the Alert Dialog is for."
      },
      do: {
        tree: {
          type: "Dialog",
          props: { open: true, large: true },
          children: [
            {
              type: "Text",
              props: { className: "text-base font-semibold text-popover-foreground" },
              children: "Edit profile"
            },
            {
              type: "Text",
              props: { className: "text-sm text-muted-foreground mt-2" },
              children: "Update how your name and email appear to teammates."
            },
            {
              type: "View",
              props: { className: "mt-5" },
              children: [
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5" },
                  children: "Name"
                },
                { type: "Input", props: { value: "Ada Lovelace" } },
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5 mt-4" },
                  children: "Email"
                },
                { type: "Input", props: { value: "ada@example.com" } }
              ]
            },
            {
              type: "View",
              props: { className: "flex-row justify-end gap-2 mt-6" },
              children: [
                { type: "Button", props: { outline: true, small: true }, children: "Cancel" },
                {
                  type: "Button",
                  props: { primary: true, small: true },
                  children: "Save changes"
                }
              ]
            }
          ]
        },
        caption: "Use the Dialog for a focused task with real content, like a short form."
      }
    },
    {
      title: "Description",
      dont: {
        tree: {
          type: "Dialog",
          props: {
            open: true,
            title: "Refund payment",
            description: "Refunds are processed through the original payment method. Depending on the bank, the amount can take 2 to 3 business days to appear. Partial refunds are supported. Once submitted a refund cannot be cancelled, and the payout for this period will be adjusted on your next statement.",
            medium: true,
            confirmLabel: "Refund",
            cancelLabel: "Cancel"
          }
        },
        caption: "A multi-sentence policy dump in the description buries the task under reading."
      },
      do: {
        tree: {
          type: "Dialog",
          props: {
            open: true,
            title: "Refund payment",
            description: "The refund posts to the original card in 2 to 3 business days.",
            medium: true,
            confirmLabel: "Refund",
            cancelLabel: "Cancel"
          }
        },
        caption: "Keep the description to one supporting line; link out for the full policy."
      }
    },
    {
      title: "Body form",
      dont: {
        tree: {
          type: "Dialog",
          props: { open: true, small: true },
          children: [
            {
              type: "Text",
              props: { className: "text-base font-semibold text-popover-foreground" },
              children: "Create project"
            },
            {
              type: "View",
              props: { className: "mt-5" },
              children: [
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5" },
                  children: "Name"
                },
                { type: "Input", props: {} },
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5 mt-3" },
                  children: "Key"
                },
                { type: "Input", props: {} },
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5 mt-3" },
                  children: "Description"
                },
                { type: "Input", props: {} },
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5 mt-3" },
                  children: "Lead"
                },
                { type: "Input", props: {} },
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5 mt-3" },
                  children: "Team"
                },
                { type: "Input", props: {} },
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5 mt-3" },
                  children: "Visibility"
                },
                { type: "Input", props: {} },
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5 mt-3" },
                  children: "Template"
                },
                { type: "Input", props: {} }
              ]
            },
            {
              type: "View",
              props: { className: "flex-row justify-end gap-2 mt-6" },
              children: [
                { type: "Button", props: { outline: true, small: true }, children: "Cancel" },
                { type: "Button", props: { primary: true, small: true }, children: "Create" }
              ]
            }
          ]
        },
        caption: "A seven-field form crammed into a small dialog feels like a page stuffed into a popup."
      },
      do: {
        tree: {
          type: "Dialog",
          props: { open: true, large: true },
          children: [
            {
              type: "Text",
              props: { className: "text-base font-semibold text-popover-foreground" },
              children: "Create project"
            },
            {
              type: "View",
              props: { className: "mt-5" },
              children: [
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5" },
                  children: "Name"
                },
                { type: "Input", props: { placeholder: "Acme website" } },
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5 mt-4" },
                  children: "Key"
                },
                { type: "Input", props: { placeholder: "ACME" } }
              ]
            },
            {
              type: "View",
              props: { className: "flex-row justify-end gap-2 mt-6" },
              children: [
                { type: "Button", props: { outline: true, small: true }, children: "Cancel" },
                { type: "Button", props: { primary: true, small: true }, children: "Create" }
              ]
            }
          ]
        },
        caption: "Keep the body to the few fields the task needs; send long forms to a full page."
      }
    },
    {
      title: "Actions",
      dont: {
        tree: {
          type: "Dialog",
          props: { open: true, medium: true },
          children: [
            {
              type: "Text",
              props: { className: "text-base font-semibold text-popover-foreground" },
              children: "Unsaved changes"
            },
            {
              type: "Text",
              props: { className: "text-sm text-muted-foreground mt-2" },
              children: "You have edits that are not saved."
            },
            {
              type: "View",
              props: { className: "flex-row justify-end gap-2 mt-6" },
              children: [
                { type: "Button", props: { primary: true, small: true }, children: "Save" },
                { type: "Button", props: { primary: true, small: true }, children: "Discard" },
                {
                  type: "Button",
                  props: { primary: true, small: true },
                  children: "Keep editing"
                }
              ]
            }
          ]
        },
        caption: "Three look-alike primary buttons give no signal about the default, safe choice."
      },
      do: {
        tree: {
          type: "Dialog",
          props: { open: true, medium: true },
          children: [
            {
              type: "Text",
              props: { className: "text-base font-semibold text-popover-foreground" },
              children: "Unsaved changes"
            },
            {
              type: "Text",
              props: { className: "text-sm text-muted-foreground mt-2" },
              children: "You have edits that are not saved."
            },
            {
              type: "View",
              props: { className: "flex-row justify-end gap-2 mt-6" },
              children: [
                { type: "Button", props: { ghost: true, small: true }, children: "Discard" },
                {
                  type: "Button",
                  props: { outline: true, small: true },
                  children: "Keep editing"
                },
                { type: "Button", props: { primary: true, small: true }, children: "Save" }
              ]
            }
          ]
        },
        caption: "One primary plus quieter secondaries, right-aligned and labeled with their verb."
      }
    },
    {
      title: "Destructive action",
      dont: {
        tree: {
          type: "Dialog",
          props: {
            open: true,
            title: "Save changes",
            description: "Update the profile with your edits.",
            medium: true,
            destructive: true,
            confirmLabel: "Save",
            cancelLabel: "Cancel"
          }
        },
        caption: "A red button on a routine Save trains users to ignore the colour that should mean danger."
      },
      do: {
        tree: {
          type: "Dialog",
          props: {
            open: true,
            title: "Delete workspace",
            description: "This removes all projects and cannot be undone.",
            medium: true,
            destructive: true,
            confirmLabel: "Delete",
            cancelLabel: "Cancel"
          }
        },
        caption: "Reserve the destructive tone for the irreversible action it names."
      }
    },
    {
      title: "Size",
      dont: {
        tree: {
          type: "Dialog",
          props: { open: true, wide: true },
          children: [
            {
              type: "Text",
              props: { className: "text-base font-semibold text-popover-foreground" },
              children: "Rename"
            },
            {
              type: "View",
              props: { className: "mt-5" },
              children: [
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5" },
                  children: "Name"
                },
                { type: "Input", props: { value: "Untitled" } }
              ]
            },
            {
              type: "View",
              props: { className: "flex-row justify-end gap-2 mt-6" },
              children: [
                { type: "Button", props: { outline: true, small: true }, children: "Cancel" },
                { type: "Button", props: { primary: true, small: true }, children: "Save" }
              ]
            }
          ]
        },
        caption: "A 2xl panel around a single field leaves a vast empty expanse beside the input."
      },
      do: {
        tree: {
          type: "Dialog",
          props: { open: true, small: true },
          children: [
            {
              type: "Text",
              props: { className: "text-base font-semibold text-popover-foreground" },
              children: "Rename"
            },
            {
              type: "View",
              props: { className: "mt-5" },
              children: [
                {
                  type: "Text",
                  props: { className: "text-sm font-medium text-foreground mb-1.5" },
                  children: "Name"
                },
                { type: "Input", props: { value: "Untitled" } }
              ]
            },
            {
              type: "View",
              props: { className: "flex-row justify-end gap-2 mt-6" },
              children: [
                { type: "Button", props: { outline: true, small: true }, children: "Cancel" },
                { type: "Button", props: { primary: true, small: true }, children: "Save" }
              ]
            }
          ]
        },
        caption: "Size the dialog to its content: a single field belongs in xs or sm."
      }
    }
  ],
  overlays: [
    {
      title: "Drawer (SlideOver)",
      dont: {
        tree: {
          type: "Dialog",
          props: {
            open: true,
            destructive: true,
            title: "Delete identity?",
            description: "This cannot be undone.",
            confirmLabel: "Delete",
            cancelLabel: "Cancel"
          }
        },
        caption: "A centered, page-blocking modal for a routine edit hides the very record the user wants to reference."
      },
      do: {
        tree: {
          type: "Overlay",
          props: {
            open: true,
            drawer: true,
            title: "Edit Identity",
            description: "Visible above the parent page so the user can compare.",
            doneLabel: "Save"
          }
        },
        caption: "Slide the form in from the edge so the parent page stays visible beneath it."
      }
    },
    {
      title: "Modal (Confirm)",
      dont: {
        tree: {
          type: "Dialog",
          props: {
            open: true,
            title: "Delete identity?",
            confirmLabel: "Yes",
            cancelLabel: "No"
          }
        },
        caption: "Generic Yes/No on a default-styled button hides both the stakes and what is being confirmed."
      },
      do: {
        tree: {
          type: "Dialog",
          props: {
            open: true,
            destructive: true,
            title: "Delete identity?",
            description: "This cannot be undone.",
            confirmLabel: "Delete",
            cancelLabel: "Cancel"
          }
        },
        caption: "Name the verb (Delete) and flag destructive actions with the danger style."
      }
    },
    {
      title: "Toast",
      dont: {
        html: "<div class=\"flex items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-popover px-4 py-3 shadow-lg\"><div><div class=\"text-sm font-medium\">Delete this identity?</div><div class=\"mt-2 flex gap-2\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Cancel</button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 rounded-md px-3 text-xs\">Delete</button></div></div><button class=\"text-muted-foreground hover:text-foreground\">&times;</button></div>",
        caption: "A toast that demands a decision can be auto-dismissed before the user acts, and steals focus from a transient surface."
      },
      do: {
        html: "<div class=\"flex items-start justify-between gap-3 rounded-lg border border-border bg-popover px-4 py-3 shadow-lg\"><div><div class=\"text-sm font-medium\">Identity deleted</div><div class=\"text-xs text-muted-foreground\">You can undo this for 10 seconds.</div></div><button class=\"text-muted-foreground hover:text-foreground\">&times;</button></div>",
        caption: "Keep toasts to passive confirmation of something already done; offer Undo, not a blocking choice."
      }
    },
    {
      title: "Row menu",
      dont: {
        html: "<div class=\"flex flex-wrap gap-2\"><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Edit</button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs\">Duplicate</button><button class=\"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 rounded-md px-3 text-xs\">Delete</button></div>",
        caption: "Splaying every row action inline multiplies visual noise across every table row."
      },
      do: {
        tree: {
          type: "RowMenu",
          props: {
            open: true,
            sectionLabel: "Actions",
            items: [
              { label: "Edit", icon: "✎" },
              { label: "Duplicate", icon: "⧉" },
              { label: "Delete", icon: "🗑", destructive: true, separatorBefore: true }
            ]
          }
        },
        caption: "Collapse per-row actions behind a ··· trigger; keep Delete separated and danger-colored."
      }
    }
  ],
  sidebar: [
    {
      title: "Sidebar",
      dont: {
        html: "<nav class=\"w-60 overflow-hidden rounded-lg border border-border bg-card\">\n  <div class=\"flex h-14 items-center border-b border-border px-4 font-semibold\">Acme</div>\n  <div class=\"p-2\">\n    <button class=\"flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium bg-accent text-accent-foreground\">Dashboard</button>\n    <button class=\"flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium bg-accent text-accent-foreground\">Users</button>\n    <button class=\"flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm font-medium text-muted-foreground\">Settings</button>\n  </div>\n</nav>",
        caption: "Click an item: two rows wearing the active background means the nav can't tell you which page you're on."
      },
      do: {
        tree: {
          type: "Sidebar",
          props: {
            bordered: true,
            active: "Dashboard",
            sections: [
              {
                title: "Main",
                items: [
                  { label: "Dashboard", icon: "◉" },
                  { label: "Users", icon: "○", badge: "12" },
                  { label: "Settings", icon: "◇" }
                ]
              }
            ]
          }
        },
        caption: "Exactly one item carries the accent background; clicking moves it so the active page is always unambiguous."
      }
    },
    {
      title: "Topbar",
      dont: {
        tree: {
          type: "View",
          props: {
            className: "h-14 w-[420px] max-w-full flex-row items-center gap-2 rounded-lg border border-border bg-card px-4"
          },
          children: [
            {
              type: "Text",
              props: { className: "text-base font-semibold text-foreground" },
              children: "Dashboard"
            },
            { type: "Button", props: { primary: true, small: true }, children: "Search" },
            { type: "Button", props: { primary: true, small: true }, children: "Filter" },
            { type: "Button", props: { primary: true, small: true }, children: "Export" },
            { type: "Button", props: { primary: true, small: true }, children: "New" }
          ]
        },
        caption: "Four solid primary buttons crammed left-to-right give the topbar no focal action and no breathing room."
      },
      do: {
        tree: {
          type: "View",
          props: {
            className: "h-14 w-[420px] max-w-full flex-row items-center rounded-lg border border-border bg-card px-4"
          },
          children: [
            {
              type: "Text",
              props: { className: "text-base font-semibold text-foreground" },
              children: "Dashboard"
            },
            {
              type: "View",
              props: { className: "ml-auto flex-row gap-2" },
              children: [
                { type: "Button", props: { ghost: true, small: true }, children: "Search" },
                { type: "Button", props: { primary: true, small: true }, children: "New" }
              ]
            }
          ]
        },
        caption: "Push utilities to the right, keep one primary button, and demote the rest to ghost so the New action leads."
      }
    },
    {
      title: "Page header",
      dont: {
        tree: {
          type: "View",
          props: { className: "w-[420px] max-w-full" },
          children: [
            { type: "Typography", props: { h1: true }, children: "Users" },
            {
              type: "Typography",
              props: { muted: true, className: "mt-1" },
              children: "Manage your team members."
            }
          ]
        },
        caption: "A 36px display heading on the page body competes with the topbar and screams louder than the content beneath it."
      },
      do: {
        html: "<div class=\"w-[420px] max-w-full\">\n  <h1 class=\"text-[22px] font-semibold tracking-tight\">Users</h1>\n  <p class=\"mt-1 text-sm text-muted-foreground\">Manage your team members.</p>\n</div>",
        caption: "Page-header titles are 20-22px semibold: clearly the page label, never larger than the topbar brand."
      }
    },
    {
      title: "Breadcrumbs",
      dont: {
        html: "<nav class=\"flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground\"><a href=\"#\" class=\"transition-colors hover:text-foreground\">Home</a><span class=\"select-none text-muted-foreground/60\">/</span><a href=\"#\" class=\"transition-colors hover:text-foreground\">Team</a><span class=\"select-none text-muted-foreground/60\">/</span><a href=\"#\" class=\"transition-colors hover:text-foreground\">Rachel Chen</a></nav>",
        caption: "Making the last crumb a link implies the current page is somewhere else to navigate to."
      },
      do: {
        tree: {
          type: "Breadcrumb",
          props: { slash: true, items: ["Home", "Team", "Rachel Chen"] }
        },
        caption: "The final crumb is plain current-page text, not a link: it marks where you are, not where you can go."
      }
    },
    {
      title: "Tabs",
      dont: {
        html: "<div class=\"w-[420px] max-w-full border-b border-border\">\n  <button class=\"border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground\">Overview</button>\n  <button class=\"border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground\">Sessions</button>\n  <button class=\"border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground\">Audit log</button>\n</div>",
        caption: "Two underlined tabs at once breaks the one-active-facet contract and hides which view you're reading."
      },
      do: {
        tree: {
          type: "Tabs",
          props: { underline: true, active: 0, tabs: ["Overview", "Sessions", "Audit log"] }
        },
        caption: "Click a tab: exactly one carries the primary underline so the active facet is always singular."
      }
    },
    {
      title: "Command palette",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[480px] overflow-hidden\">\n  <div class=\"flex items-center gap-2 border-b border-border px-3.5 py-3\">\n    <span class=\"text-sm text-muted-foreground\">Type a command or search...</span>\n  </div>\n  <div class=\"p-1.5\">\n    <div class=\"flex items-center gap-2.5 rounded-md bg-accent px-2.5 py-2 text-sm\">Create identity</div>\n    <div class=\"flex items-center gap-2.5 rounded-md bg-accent px-2.5 py-2 text-sm\">Invite teammate</div>\n  </div>\n</div>",
        caption: "No search affordance and two highlighted rows: nothing tells you to type or which result Enter will run."
      },
      do: {
        tree: {
          type: "Command",
          props: {
            open: true,
            active: 0,
            placeholder: "Type a command or search...",
            groups: [
              {
                heading: "Actions",
                items: [{ label: "Create identity", shortcut: "C" }, { label: "Invite teammate" }]
              }
            ]
          }
        },
        caption: "A search icon and esc hint signal input, and a single highlighted row shows exactly what Enter will run."
      }
    }
  ],
  stepper: [
    {
      title: "Horizontal",
      dont: {
        html: "<div class=\"flex items-start\">\n    <div class=\"flex flex-col items-center gap-1.5\"><div class=\"flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium border-primary text-primary\">1</div><span class=\"text-xs font-medium\">Account</span></div>\n    <div class=\"mx-2 mt-4 h-0.5 flex-1 bg-border\"></div>\n    <div class=\"flex flex-col items-center gap-1.5\"><div class=\"flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium border-primary text-primary\">2</div><span class=\"text-xs font-medium\">Profile</span></div>\n    <div class=\"mx-2 mt-4 h-0.5 flex-1 bg-border\"></div>\n    <div class=\"flex flex-col items-center gap-1.5\"><div class=\"flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium border-primary text-primary\">3</div><span class=\"text-xs font-medium\">Review</span></div>\n  </div>",
        caption: "Styling several steps as active at once hides which step the user is actually on."
      },
      do: {
        tree: {
          type: "Stepper",
          props: {
            current: 1,
            steps: [{ label: "Account" }, { label: "Profile" }, { label: "Review" }]
          }
        },
        caption: "Mark exactly one step active; show completed steps filled and the rest pending."
      }
    },
    {
      title: "Vertical",
      dont: {
        tree: {
          type: "View",
          props: { className: "max-w-[320px]" },
          children: [
            {
              type: "Stepper",
              props: {
                vertical: true,
                current: 1,
                steps: [
                  { label: "Account created" },
                  { label: "Profile setup" },
                  { label: "Team invite" },
                  { label: "Done" }
                ]
              }
            }
          ]
        },
        caption: "A vertical step with only a title wastes the space the layout is built to use."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[320px]" },
          children: [
            {
              type: "Stepper",
              props: {
                vertical: true,
                current: 1,
                steps: [
                  { label: "Account created", description: "Email verified and password set." },
                  { label: "Profile setup", description: "Add your name and avatar." },
                  {
                    label: "Team invite",
                    description: "Invite collaborators to your workspace."
                  },
                  { label: "Done", description: "You're all set." }
                ]
              }
            }
          ]
        },
        caption: "Pair each vertical step with a one-line description so the extra width earns its place."
      }
    },
    {
      title: "Progress bar",
      dont: {
        html: "<div class=\"max-w-[320px]\">\n  <div class=\"h-1.5 overflow-hidden rounded-full bg-muted\">\n    <div class=\"h-full rounded-full bg-primary\" style=\"width:68%\"></div>\n  </div>\n</div>",
        caption: "A bare progress bar with no percentage leaves users guessing how far along they are."
      },
      do: {
        tree: {
          type: "View",
          props: { className: "max-w-[320px]" },
          children: [
            {
              type: "Stepper",
              props: { progress: true, current: 0, steps: [], label: "Setup progress", value: 68 }
            }
          ]
        },
        caption: "Label the bar and show the exact percentage so progress is legible at a glance."
      }
    }
  ],
  tabs: [
    {
      title: "Underline",
      dont: {
        html: "<div class=\"flex border-b border-border\">\n  <button class=\"border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground\">Overview</button>\n  <button class=\"border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground\">Activity</button>\n  <button class=\"border-b-2 border-primary px-4 py-2.5 text-sm font-medium text-foreground\">Settings</button>\n</div>",
        caption: "Underlining every tab erases the active indicator: there is no way to tell which view is current."
      },
      do: {
        tree: {
          type: "Tabs",
          props: { tabs: ["Overview", "Activity", "Settings"], active: 0 }
        },
        caption: "Underline and foreground-color only the active tab; leave the rest muted with no rule."
      }
    },
    {
      title: "Pill",
      dont: {
        html: "<div class=\"inline-flex gap-1 rounded-lg bg-muted p-1\">\n  <button class=\"rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm\">All</button>\n  <button class=\"rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm\">Active</button>\n  <button class=\"rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm\">Archived</button>\n</div>",
        caption: "Giving every pill the raised background makes the group read as three buttons, not one selection."
      },
      do: {
        tree: {
          type: "Tabs",
          props: { tabs: ["All", "Active", "Archived"], active: 0, pills: true }
        },
        caption: "Exactly one pill gets the elevated background; the rest sit flat on the muted track."
      }
    },
    {
      title: "Vertical",
      dont: {
        html: "<div class=\"flex w-[180px] flex-col gap-1\">\n  <button class=\"w-full rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground\">General</button>\n  <button class=\"w-full rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground\">Security</button>\n  <button class=\"w-full rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground\">Notifications</button>\n</div>",
        caption: "With no filled active item the rail collapses into a plain link list and loses its current selection."
      },
      do: {
        tree: {
          type: "Tabs",
          props: { tabs: ["General", "Security", "Notifications"], active: 0, vertical: true }
        },
        caption: "Fill the active rail item with the accent background so the selected pane is unmistakable."
      }
    }
  ],
  "row-menu": [
    {
      title: "Actions",
      dont: {
        tree: {
          type: "RowMenu",
          props: {
            open: true,
            items: [
              { label: "Edit" },
              { label: "Delete", destructive: true },
              { label: "Duplicate" }
            ]
          }
        },
        caption: "Click an item: a destructive action sandwiched between routine ones invites a costly misclick."
      },
      do: {
        tree: {
          type: "RowMenu",
          props: {
            open: true,
            items: [
              { label: "Edit" },
              { label: "Duplicate" },
              { label: "Delete", destructive: true, separatorBefore: true }
            ]
          }
        },
        caption: "Click an item: place destructive actions last, color them, and split them off with a divider."
      }
    },
    {
      title: "Links",
      dont: {
        tree: {
          type: "RowMenu",
          props: {
            open: true,
            items: [{ label: "Profile" }, { label: "Billing" }, { label: "Members" }]
          }
        },
        caption: "Buttons can't be opened in a new tab, bookmarked, or middle-clicked, navigation needs real links."
      },
      do: {
        tree: {
          type: "RowMenu",
          props: {
            open: true,
            links: true,
            items: [{ label: "Profile" }, { label: "Billing" }, { label: "Members" }]
          }
        },
        caption: "Use <a href> anchors so links behave like links, and mark the current page with an active highlight."
      }
    }
  ],
  charts: [
    {
      title: "Bar",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[560px] p-5\"><div class=\"flex h-[140px] items-end gap-[3px]\"><div class=\"flex-1 rounded-sm bg-primary\" style=\"height:45%\"></div><div class=\"flex-1 rounded-sm bg-primary\" style=\"height:60%\"></div><div class=\"flex-1 rounded-sm bg-primary\" style=\"height:35%\"></div><div class=\"flex-1 rounded-sm bg-primary\" style=\"height:70%\"></div><div class=\"flex-1 rounded-sm bg-primary\" style=\"height:55%\"></div><div class=\"flex-1 rounded-sm bg-primary\" style=\"height:80%\"></div><div class=\"flex-1 rounded-sm bg-primary\" style=\"height:95%\"></div></div></div>",
        caption: "Every bar the same full-strength fill and no labels: nothing is emphasized and the axis is unreadable."
      },
      do: {
        tree: {
          type: "Chart",
          props: {
            title: "Signups",
            max: 100,
            className: "max-w-[560px]",
            data: [
              { label: "Mon", value: 45 },
              { label: "Tue", value: 60 },
              { label: "Wed", value: 35 },
              { label: "Thu", value: 70 },
              { label: "Fri", value: 55 },
              { label: "Sat", value: 80 },
              { label: "Sun", value: 95 }
            ]
          }
        },
        caption: "Mute past bars, brighten the current one, and keep an axis row so the buckets read."
      }
    },
    {
      title: "Sparkline",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[200px] p-5\"><svg width=\"100%\" height=\"34\" viewBox=\"0 0 200 34\" preserveAspectRatio=\"none\" class=\"block\"><polyline points=\"0,28 20,26 40,22 60,24 80,18 100,14 120,16 140,9 160,11 180,5 200,3\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"1.5\"/></svg></div>",
        caption: "A bare line with no value or end dot reads as decoration: you cannot tell the current figure or where it ends."
      },
      do: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[200px] p-5\"><div class=\"text-xs text-muted-foreground\">Tokens issued</div><div class=\"mt-1 flex items-baseline justify-between\"><span class=\"text-[22px] font-semibold\">4,847</span><span class=\"font-mono text-[11px] text-foreground\">+12%</span></div><svg width=\"100%\" height=\"34\" viewBox=\"0 0 200 34\" preserveAspectRatio=\"none\" class=\"mt-2 block overflow-visible\"><defs><linearGradient id=\"dospk\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"var(--primary)\" stop-opacity=\"0.3\"/><stop offset=\"100%\" stop-color=\"var(--primary)\" stop-opacity=\"0\"/></linearGradient></defs><polygon points=\"0,28 20,26 40,22 60,24 80,18 100,14 120,16 140,9 160,11 180,5 200,3 200,34 0,34\" fill=\"url(#dospk)\"/><polyline points=\"0,28 20,26 40,22 60,24 80,18 100,14 120,16 140,9 160,11 180,5 200,3\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"1.5\"/><circle cx=\"200\" cy=\"3\" r=\"2.5\" fill=\"var(--primary)\"/></svg></div>",
        caption: "Pair the line with the current value and delta, add the gradient fill and an end dot so it anchors a stat."
      }
    },
    {
      title: "Stacked bar",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[560px] p-5\"><div class=\"flex h-2.5 overflow-hidden rounded-full bg-muted\"><div class=\"bg-chart-1\" style=\"width:42%\"></div><div class=\"bg-chart-2\" style=\"width:28%\"></div><div class=\"bg-chart-3\" style=\"width:18%\"></div><div class=\"bg-chart-4\" style=\"width:12%\"></div></div></div>",
        caption: "Colored segments with no legend force the reader to guess which channel each band represents."
      },
      do: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[560px] p-5\"><div class=\"mb-3.5 flex h-2.5 overflow-hidden rounded-full bg-muted\"><div class=\"bg-chart-1\" style=\"width:42%\"></div><div class=\"bg-chart-2\" style=\"width:28%\"></div><div class=\"bg-chart-3\" style=\"width:18%\"></div><div class=\"bg-chart-4\" style=\"width:12%\"></div></div><div class=\"flex flex-col gap-2\"><div class=\"flex items-center gap-2.5 text-sm\"><span class=\"h-2 w-2 shrink-0 rounded-full bg-chart-1\"></span><span class=\"flex-1\">Direct</span><span class=\"font-mono text-xs text-muted-foreground\">42%</span></div><div class=\"flex items-center gap-2.5 text-sm\"><span class=\"h-2 w-2 shrink-0 rounded-full bg-chart-2\"></span><span class=\"flex-1\">Organic search</span><span class=\"font-mono text-xs text-muted-foreground\">28%</span></div><div class=\"flex items-center gap-2.5 text-sm\"><span class=\"h-2 w-2 shrink-0 rounded-full bg-chart-3\"></span><span class=\"flex-1\">Social</span><span class=\"font-mono text-xs text-muted-foreground\">18%</span></div><div class=\"flex items-center gap-2.5 text-sm\"><span class=\"h-2 w-2 shrink-0 rounded-full bg-chart-4\"></span><span class=\"flex-1\">Referral</span><span class=\"font-mono text-xs text-muted-foreground\">12%</span></div></div></div>",
        caption: "Always ship a legend with a colored dot, label, and percentage per segment."
      }
    },
    {
      title: "Gauge",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm flex max-w-[200px] items-center justify-center p-5\"><svg width=\"140\" height=\"140\" viewBox=\"0 0 140 140\"><circle cx=\"70\" cy=\"70\" r=\"56\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"12\" stroke-dasharray=\"351.8583772\" stroke-dashoffset=\"95.00176184\" stroke-linecap=\"round\" transform=\"rotate(-90 70 70)\"/></svg></div>",
        caption: "An arc with no track and no number: there is no baseline to read the fill against and no exact value."
      },
      do: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm flex max-w-[200px] items-center justify-center p-5\"><svg width=\"140\" height=\"140\" viewBox=\"0 0 140 140\"><circle cx=\"70\" cy=\"70\" r=\"56\" fill=\"none\" stroke=\"var(--muted)\" stroke-width=\"12\"/><circle cx=\"70\" cy=\"70\" r=\"56\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"12\" stroke-dasharray=\"351.8583772\" stroke-dashoffset=\"95.00176184\" stroke-linecap=\"round\" transform=\"rotate(-90 70 70)\"/><text x=\"70\" y=\"66\" text-anchor=\"middle\" font-size=\"28\" font-weight=\"700\" fill=\"var(--foreground)\">73%</text><text x=\"70\" y=\"84\" text-anchor=\"middle\" font-size=\"11\" fill=\"var(--muted-foreground)\">Uptime</text></svg></div>",
        caption: "Put a muted track behind the fill and the numeric value plus label in the center."
      }
    },
    {
      title: "Heatmap",
      dont: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[480px] p-5\"><div class=\"grid grid-cols-[repeat(14,1fr)] gap-[3px]\"><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.12\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.49\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.86\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.23\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.60\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.97\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.34\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.71\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.20\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.57\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.20\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.92\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.31\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.68\"></span></div></div>",
        caption: "A density grid with no legend leaves the alpha-to-value mapping a mystery."
      },
      do: {
        html: "<div class=\"rounded-lg border border-border bg-card text-card-foreground shadow-sm max-w-[480px] p-5\"><div class=\"grid grid-cols-[repeat(14,1fr)] gap-[3px]\"><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.12\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.49\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.86\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.23\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.60\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.97\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.34\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.71\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.20\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.57\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.20\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.92\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.31\"></span><span class=\"aspect-square rounded-sm\" style=\"background:var(--primary);opacity:0.68\"></span></div><div class=\"mt-3 flex items-center justify-between font-mono text-[11.5px] text-muted-foreground\"><span>14d ago</span><span class=\"inline-flex items-center gap-1.5\"><span>less</span><span class=\"h-3 w-3 rounded-[3px]\" style=\"background:var(--primary);opacity:0.1\"></span><span class=\"h-3 w-3 rounded-[3px]\" style=\"background:var(--primary);opacity:0.3\"></span><span class=\"h-3 w-3 rounded-[3px]\" style=\"background:var(--primary);opacity:0.55\"></span><span class=\"h-3 w-3 rounded-[3px]\" style=\"background:var(--primary);opacity:0.8\"></span><span class=\"h-3 w-3 rounded-[3px]\" style=\"background:var(--primary);opacity:1\"></span><span>more</span></span></div></div>",
        caption: "Pair the grid with a discrete less-to-more legend so the density scale is legible."
      }
    }
  ],
  navbars: [
    {
      title: "Standard topbar",
      dont: {
        tree: {
          type: "Navbar",
          props: {
            bordered: true,
            brand: "Canvas",
            active: 0,
            links: [
              "Dashboard",
              "Users",
              "Settings",
              "Billing",
              "Reports",
              "Integrations",
              "Audit",
              "Webhooks"
            ],
            avatar: "RC"
          }
        },
        caption: "Cramming every destination into the bar wraps the row and buries the primary links."
      },
      do: {
        tree: {
          type: "Navbar",
          props: {
            bordered: true,
            brand: "Canvas",
            active: 0,
            links: ["Dashboard", "Users", "Settings"],
            actionLabel: "New",
            avatar: "RC"
          }
        },
        caption: "Keep a few primary links inline and fold the rest behind a More menu."
      }
    },
    {
      title: "With search bar",
      dont: {
        html: "<div class=\"w-full overflow-hidden rounded-lg border border-border\"><header class=\"flex h-14 items-center gap-2 bg-card px-4\"><span class=\"text-sm font-semibold\">Canvas</span><div class=\"mx-4 max-w-[400px] flex-1\"><input class=\"flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring\" placeholder=\"Search…\"></div></header></div>",
        caption: "A live text field in the bar reads as a form input and offers no keyboard affordance."
      },
      do: {
        html: "<div class=\"w-full overflow-hidden rounded-lg border border-border\"><header class=\"flex h-14 items-center gap-2 bg-card px-4\"><span class=\"text-sm font-semibold\">Canvas</span><div class=\"mx-4 max-w-[400px] flex-1\"><button class=\"flex h-[34px] w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 text-sm text-muted-foreground\"><svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/></svg><span class=\"flex-1 text-left\">Search…</span><kbd class=\"inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground\">⌘K</kbd></button></div></header></div>",
        caption: "Use a button that opens the command palette and advertise the ⌘K shortcut."
      }
    },
    {
      title: "Mobile",
      dont: {
        html: "<div class=\"w-full max-w-[360px] overflow-hidden rounded-lg border border-border\"><header class=\"flex h-14 items-center gap-1 bg-card px-3\"><span class=\"text-[13px] font-semibold\">Canvas</span><nav class=\"ml-2 flex flex-wrap gap-1\"><a class=\"rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-foreground\" href=\"#\">Dashboard</a><a class=\"rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground\" href=\"#\">Users</a><a class=\"rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground\" href=\"#\">Settings</a><a class=\"rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground\" href=\"#\">Billing</a></nav></header></div>",
        caption: "A full horizontal nav at phone width wraps onto a second row and crowds out the logo."
      },
      do: {
        html: "<div class=\"w-full max-w-[360px] overflow-hidden rounded-lg border border-border\"><header class=\"flex h-14 items-center gap-2 bg-card px-3\"><button class=\"inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"4\" y1=\"6\" x2=\"20\" y2=\"6\"/><line x1=\"4\" y1=\"12\" x2=\"20\" y2=\"12\"/><line x1=\"4\" y1=\"18\" x2=\"20\" y2=\"18\"/></svg></button><span class=\"text-[13px] font-semibold\">Canvas</span><div class=\"flex-1\"></div><span class=\"inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground h-7 w-7 text-[11px]\"><img src=\"/rachel-chen.jpg\" alt=\"RC\" class=\"h-full w-full object-cover\"></span></header></div>",
        caption: "Collapse the links into a hamburger and keep only the logo and avatar in the bar."
      }
    }
  ],
};
