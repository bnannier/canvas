import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { type ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Image } from "../src/atoms/image/image.tsx";
import {
  Card,
  CardMedia,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardSeparator,
} from "../src/molecules/card/card.tsx";
import * as cardStyles from "../src/molecules/card/card.styles.ts";
import { elevationOf, densityOf, mediaWellOf } from "../src/molecules/card/card.shared.tsx";
import { platformShape } from "../src/style/platform-shape.ts";
import { shape, lightColors } from "../src/style/tokens.ts";
import { shadow, customShadow } from "../src/style/index.ts";
import { LOOKS, lookProps } from "./fixtures/looks.ts";
import { mockInPageFrost } from "./fixtures/material-platform.ts";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// The web skin's surface insets (see card.styles.ts): the default density (the
// standard padded surface plus the card's flat-child gap) and the density steps.
// The tests pin the padding CONTRACT, not the exact pixel values, but reading them
// from one place keeps the two in sync if the skin ever moves.
const PADDED = "20px";
const GAP = "8px";
const COMPACT = "14px";

describe("Card surface padding", () => {
  it("pads raw children by default and spaces them (the surface owns the rhythm)", () => {
    const { getByTestId } = ui(
      <Card testID="c">
        <Text>one</Text>
        <Text>two</Text>
        <Text>three</Text>
      </Card>,
    );
    const el = getByTestId("c");
    expect(el.style.padding).toBe(PADDED);
    expect(el.style.gap).toBe(GAP);
  });

  it("`padded` (the explicit form of the default) pads and gaps the same", () => {
    const { getByTestId } = ui(<Card padded testID="c"><Text>content</Text></Card>);
    const el = getByTestId("c");
    expect(el.style.padding).toBe(PADDED);
    expect(el.style.gap).toBe(GAP);
  });

  it("`flush` removes the inset AND the gap for edge-to-edge children", () => {
    const { getByTestId } = ui(<Card flush testID="c"><Text>content</Text></Card>);
    const el = getByTestId("c");
    expect(el.style.padding).toBe("");
    expect(el.style.gap).toBe("");
  });

  it("a density boolean retunes the inset and gap on the children path", () => {
    const { getByTestId } = ui(<Card compact testID="c"><Text>content</Text></Card>);
    const el = getByTestId("c");
    expect(el.style.padding).toBe(COMPACT);
    expect(el.style.gap).toBe("8px");
  });

  it("the string path pads through its sections, never the surface", () => {
    const { getByTestId } = ui(<Card title="Title" body="Body" testID="c" />);
    expect(getByTestId("c").style.padding).toBe("");
  });

  it("`padded` on the string path never double-pads the self-padding sections", () => {
    const { getByTestId } = ui(<Card padded title="Title" body="Body" testID="c" />);
    expect(getByTestId("c").style.padding).toBe("");
  });

  it("a density boolean on the string path adds neither inset nor gap", () => {
    const { getByTestId } = ui(<Card compact title="Title" body="Body" testID="c" />);
    const el = getByTestId("c");
    expect(el.style.padding).toBe("");
    expect(el.style.gap).toBe("");
  });

  it("a pressable string-path card keeps the surface bare too", () => {
    const { getByTestId } = ui(
      <Card padded onPress={() => {}} title="Title" body="Body" testID="c" />,
    );
    expect(getByTestId("c").style.padding).toBe("");
  });
});

describe("CardContent", () => {
  it("spaces its flat children with the section's own rhythm", () => {
    const { getByText } = ui(
      <CardContent>
        <Text>inside</Text>
      </CardContent>,
    );
    // The Text renders as a leaf div; its parent is CardContent's own View.
    expect((getByText("inside").parentElement as HTMLElement).style.gap).toBe(`${cardStyles.content.gap}px`);
  });
});

describe("CardMedia", () => {
  it("spans the card edge to edge with nested top corners and a flat bottom", () => {
    const { getByTestId } = ui(
      <Card flush testID="c">
        <CardMedia src="/kira-tanaka.jpg" height={180} alt="Portrait" testID="m" />
        <CardContent>
          <Text>Below the fold</Text>
        </CardContent>
      </Card>,
    );
    const media = getByTestId("m");
    // Full bleed: the image fills the card's width and the given band height.
    expect(media.style.width).toBe("100%");
    expect(media.style.height).toBe("180px");
    // The top corners nest inside the web card's corner, less its 1px border...
    expect(media.style.borderTopLeftRadius).toBe(`${shape.web.card - 1}px`);
    expect(media.style.borderTopRightRadius).toBe(`${shape.web.card - 1}px`);
    // ...and the bottom edge stays flat where the content continues.
    expect(media.style.borderBottomLeftRadius).toBe("");
    expect(media.style.borderBottomRightRadius).toBe("");
  });

  // The cover is named through Image's own resolution, so `alt` (or `accessibilityLabel`)
  // reaches the web as a named image; before, react-native-web dropped `alt` and the cover
  // was a decorative <img alt="">, whatever the caller wrote.
  it("names the cover from `alt`, as one image", () => {
    // A remote source, so react-native-web starts the load and mounts its hidden <img>.
    const { getByTestId, getAllByRole } = ui(<CardMedia src="https://example.com/kira-tanaka.jpg" alt="Portrait of Kira Tanaka" testID="m" />);
    const media = getByTestId("m");
    const named = getAllByRole("img", { name: "Portrait of Kira Tanaka" });
    expect(named).toHaveLength(1);
    expect(named[0]).toBe(media.querySelector("img")!);
  });

  it("names it from `accessibilityLabel` too, in Image's order: accessibilityLabel wins over alt", () => {
    const alias = ui(<CardMedia src="https://example.com/kira-tanaka.jpg" accessibilityLabel="Cover photo" testID="m" />);
    expect(alias.getAllByRole("img", { name: "Cover photo" })).toHaveLength(1);
    cleanup();
    const both = ui(<CardMedia src="https://example.com/kira-tanaka.jpg" alt="Portrait" accessibilityLabel="Cover photo" testID="m" />);
    expect(both.getByTestId("m").querySelector("img")?.getAttribute("alt")).toBe("Cover photo");
    cleanup();
    // The same pair on a bare Image resolves to the same name.
    const image = ui(<Image source={{ uri: "https://example.com/kira-tanaka.jpg" }} alt="Portrait" accessibilityLabel="Cover photo" testID="i" />);
    expect(image.getByTestId("i").querySelector("img")?.getAttribute("alt")).toBe("Cover photo");
  });

  it("is decorative with no name", () => {
    const { getByTestId } = ui(<CardMedia src="/kira-tanaka.jpg" testID="m" />);
    expect(getByTestId("m").getAttribute("role")).toBeNull();
    expect(getByTestId("m").getAttribute("aria-label")).toBeNull();
  });
});

// CardMedia given children: the specimen well the v4 component page stages its
// variants, sizes, states and platform skins on (Component.dc.html): the content
// centered on the sunken fill, at least the well step's height, with its inset.
describe("CardMedia well", () => {
  const hexRgb = (hex: string) => {
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)!;
    return `rgba(${parseInt(m[1]!, 16)},${parseInt(m[2]!, 16)},${parseInt(m[3]!, 16)},1.00)`;
  };

  it("stages its children centered on the sunken fill, in place of the image", () => {
    const { getByTestId, getByText, queryAllByRole } = ui(
      <Card flush>
        <CardMedia src="https://example.com/cover.png" alt="Cover" testID="well">
          <Text>Live specimen</Text>
        </CardMedia>
      </Card>,
    );
    const well = getByTestId("well");
    expect(well.contains(getByText("Live specimen"))).toBe(true);
    // Children win over `src`: no image is mounted.
    expect(queryAllByRole("img")).toHaveLength(0);
    expect(well.style.alignItems).toBe("center");
    expect(well.style.justifyContent).toBe("center");
    expect(well.style.backgroundColor.replace(/\s/g, "")).toBe(hexRgb(lightColors["surface-sunken"]!));
    // The top corners nest inside the card's corner, like the image's.
    expect(well.style.borderTopLeftRadius).toBe(`${shape.web.card - 1}px`);
  });

  it("takes the default well, `compact` and `tall` steps, the smaller winning", () => {
    const step = (props: Record<string, boolean>) => {
      const { getByTestId } = ui(
        <CardMedia testID="well" {...props}>
          <Text>x</Text>
        </CardMedia>,
      );
      const st = getByTestId("well").style;
      const out = [st.minHeight, st.paddingTop, st.paddingLeft];
      cleanup();
      return out;
    };
    expect(step({})).toEqual(["160px", "28px", "20px"]);
    expect(step({ compact: true })).toEqual(["130px", "24px", "16px"]);
    expect(step({ tall: true })).toEqual(["240px", "32px", "20px"]);
    expect(step({ tall: true, compact: true })).toEqual(["130px", "24px", "16px"]);
  });

  // The well is in-page: the web keeps its solid sunken fill under glass (the v4 hand-off),
  // and a platform whose in-page surfaces frost lays it as an ink tint on the material.
  it("is an ink tint, not an opaque patch, under glass where the card frosts", () => {
    const well = () => (
      <ThemeProvider glass>
        <CardMedia testID="well">
          <Text>x</Text>
        </CardMedia>
      </ThemeProvider>
    );
    const web = render(well());
    expect(web.getByTestId("well").style.backgroundColor.replace(/\s/g, "")).toBe(hexRgb(lightColors["surface-sunken"]!));
    cleanup();
    const frost = mockInPageFrost();
    try {
      const { getByTestId } = render(well());
      const fill = getByTestId("well").style.backgroundColor;
      expect(fill).toMatch(/^rgba\(/);
      expect(fill.replace(/\s/g, "")).not.toBe(hexRgb(lightColors["surface-sunken"]!));
    } finally { frost.mockRestore(); }
  });

  it("centers a hug child rather than pinning it to the start edge", () => {
    const { getByTestId } = ui(
      <Card flush>
        <CardMedia testID="well">
          <Button primary>Save</Button>
        </CardMedia>
      </Card>,
    );
    const pinned = [...getByTestId("well").querySelectorAll("*")].filter((n) => (n as HTMLElement).style.alignSelf === "flex-start");
    expect(pinned).toHaveLength(0);
  });

  it("keeps the image band when it has no children", () => {
    const { getByTestId } = ui(<CardMedia src="/kira-tanaka.jpg" height={120} testID="m" />);
    expect(getByTestId("m").style.height).toBe("120px");
    expect(getByTestId("m").style.minHeight).toBe("");
  });
});

// The composition parts: what a caller assembles when the string props do not fit (a
// cover over a header, a separator, a body and a footer row). Each part owns its section
// padding, so a composed card never pads by hand; the expectations read the web skin's
// section styles from card.styles.ts, so they pin the contract rather than the numbers.
describe("Card composition parts", () => {
  // react-native-web writes a color as `rgba(r, g, b, a.aa)`; a token may be hex.
  const rgba = (color: string): string => {
    const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
    if (hex) return `${parseInt(hex[1], 16)},${parseInt(hex[2], 16)},${parseInt(hex[3], 16)},1.00`;
    const m = /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)/.exec(color);
    if (!m) throw new Error(`not a color: ${color}`);
    return `${m[1]},${m[2]},${m[3]},${Number(m[4] ?? 1).toFixed(2)}`;
  };
  const px = (n: number | string | undefined) => `${n}px`;

  const composed = (props: Record<string, unknown> = {}) =>
    ui(
      <Card flush testID="card" {...props}>
        <CardMedia src="/kira-tanaka.jpg" height={120} alt="Cover" testID="media" />
        <CardHeader>
          <CardTitle>Northwind</CardTitle>
          <CardDescription>Workspace settings</CardDescription>
        </CardHeader>
        <CardSeparator />
        <CardContent>
          <Text>Body copy</Text>
        </CardContent>
        <CardFooter>
          <Text>Footer line</Text>
        </CardFooter>
      </Card>,
    );

  it("renders the parts in the order they were composed", () => {
    const { getByText, getByTestId } = composed();
    const order = [getByTestId("media"), getByText("Northwind"), getByText("Workspace settings"), getByText("Body copy"), getByText("Footer line")];
    for (let i = 1; i < order.length; i++) {
      expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it("pads each section itself, so a flush card adds no inset of its own", () => {
    const { getByText, getByTestId } = composed();
    expect(getByTestId("card").style.padding).toBe("");
    const header = getByText("Northwind").parentElement as HTMLElement;
    expect(header.style.paddingTop).toBe(px(cardStyles.header.paddingTop));
    expect(header.style.paddingBottom).toBe(px(cardStyles.header.paddingBottom));
    expect(header.style.paddingLeft).toBe(px(cardStyles.header.paddingHorizontal));
    expect(header.style.gap).toBe(px(cardStyles.header.gap));
    const content = getByText("Body copy").parentElement as HTMLElement;
    expect(content.style.paddingTop).toBe(px(cardStyles.content.paddingVertical));
    expect(content.style.paddingLeft).toBe(px(cardStyles.content.paddingHorizontal));
    const footer = getByText("Footer line").parentElement as HTMLElement;
    expect(footer.style.flexDirection).toBe("row");
    expect(footer.style.paddingTop).toBe(px(cardStyles.footer.paddingTop));
    expect(footer.style.paddingBottom).toBe(px(cardStyles.footer.paddingBottom));
  });

  for (const look of LOOKS) {
    it(`takes the title, muted and border tokens of the ${look.name} look`, () => {
      const { getByText, container } = render(
        <ThemeProvider {...lookProps(look)} solid>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardSeparator />
        </ThemeProvider>,
      );
      expect(rgba(getByText("Title").style.color)).toBe(rgba(look.tokens["card-foreground"]));
      expect(rgba(getByText("Description").style.color)).toBe(rgba(look.tokens["muted-foreground"]));
      // The separator is the last node: a full-width 1px hairline in the border token.
      const rule = [...container.querySelectorAll<HTMLElement>("div")].find((d) => d.style.height === "1px") as HTMLElement;
      expect(rule).toBeTruthy();
      expect(rule.style.width).toBe("100%");
      expect(rgba(rule.style.backgroundColor)).toBe(rgba(look.tokens.border));
    });
  }

  it("keeps the title and description type of the card's own string path", () => {
    const parts = ui(
      <>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </>,
    );
    const partTitle = parts.getByText("Title").style;
    const partDescription = parts.getByText("Description").style;
    cleanup();
    const strings = ui(<Card title="Title" description="Description" />);
    expect(partTitle.fontSize).toBe(strings.getByText("Title").style.fontSize);
    expect(partDescription.fontSize).toBe(strings.getByText("Description").style.fontSize);
  });
});

describe("Card header slots", () => {
	it("renders an icon before the title", () => {
		const { getByText } = ui(<Card title="Identity" icon={<Text>ICON</Text>} />);
		expect(getByText("ICON")).toBeTruthy();
		expect(getByText("Identity")).toBeTruthy();
	});

	it("renders trailing header actions", () => {
		const { getByText } = ui(<Card title="Identity" actions={<Text>ACTION</Text>} />);
		expect(getByText("ACTION")).toBeTruthy();
	});

	// A card given only an icon or only actions still needs the header row, or the
	// slot would render nothing at all.
	it("renders a header for an icon alone", () => {
		const { getByText } = ui(<Card icon={<Text>ICON</Text>} />);
		expect(getByText("ICON")).toBeTruthy();
	});

	it("renders a header for actions alone", () => {
		const { getByText } = ui(<Card actions={<Text>ACTION</Text>} />);
		expect(getByText("ACTION")).toBeTruthy();
	});
});

// The fix: a card given children used to short-circuit to `inner = children`, so
// title / icon / actions / description / footer were silently dropped. That is what
// forced consuming apps to hand-roll a "SectionCard" out of Card + CardHeader +
// CardTitle, which is the duplication these tests exist to prevent recurring.
describe("Card sections beside children", () => {
  it("renders the header above raw children", () => {
    const { getByText } = ui(
      <Card title="Identity">
        <Text>a table</Text>
      </Card>,
    );
    expect(getByText("Identity")).toBeTruthy();
    expect(getByText("a table")).toBeTruthy();
  });

  it("renders every header slot beside children", () => {
    const { getByText, getByTestId } = ui(
      <Card title="Health" description="All services" icon={<Text testID="icon">i</Text>} actions={<Text testID="act">a</Text>}>
        <Text>body</Text>
      </Card>,
    );
    expect(getByText("Health")).toBeTruthy();
    expect(getByText("All services")).toBeTruthy();
    expect(getByTestId("icon")).toBeTruthy();
    expect(getByTestId("act")).toBeTruthy();
    expect(getByText("body")).toBeTruthy();
  });

  it("renders the footer below raw children", () => {
    const { getByText } = ui(
      <Card title="T" footer="the footer">
        <Text>body</Text>
      </Card>,
    );
    expect(getByText("the footer")).toBeTruthy();
    expect(getByText("body")).toBeTruthy();
  });

  // The padding contract: a sectioned card's inset lives on its sections, so the
  // surface must not also pad (or gap) or the two stack.
  it("moves the inset off the surface when sectioned", () => {
    const { getByTestId } = ui(
      <Card title="T" testID="c">
        <Text>body</Text>
      </Card>,
    );
    const el = getByTestId("c");
    expect(el.style.padding).toBe("");
    expect(el.style.gap).toBe("");
  });

  it("leaves a PLAIN card's surface inset exactly as it was", () => {
    const { getByTestId } = ui(
      <Card testID="c">
        <Text>body</Text>
      </Card>,
    );
    expect(getByTestId("c").style.padding).toBe(PADDED);
  });

  // `{cond && <X/>}` collapses to `false`, not null. A body that renders nothing must
  // not hang a separator over an empty content section.
  it("treats a false body as no body", () => {
    const { getByText } = ui(<Card title="T">{false}</Card>);
    expect(getByText("T")).toBeTruthy();
  });

  it("still renders children alone when no section props are passed", () => {
    const { getByText, queryByText } = ui(
      <Card>
        <Text>just me</Text>
      </Card>,
    );
    expect(getByText("just me")).toBeTruthy();
    expect(queryByText("undefined")).toBeNull();
  });

  // The data-driven string path must be untouched.
  it("keeps the string-body path working", () => {
    const { getByText } = ui(<Card title="T" body="the body" footer="the footer" />);
    expect(getByText("T")).toBeTruthy();
    expect(getByText("the body")).toBeTruthy();
    expect(getByText("the footer")).toBeTruthy();
  });

  it("children win over a string body when both are passed", () => {
    const { getByText, queryByText } = ui(
      <Card title="T" body="ignored">
        <Text>the children</Text>
      </Card>,
    );
    expect(getByText("the children")).toBeTruthy();
    expect(queryByText("ignored")).toBeNull();
  });
});

describe("A grown card fills the box it is given", () => {
  // `grow` used to reach the surface alone, so a card stretched to stand beside a
  // taller neighbour drew its content in a box it did not fill and left its footer
  // floating in the middle of the surface. The BODY is what takes up the slack.
  it("hands the slack to the body section", () => {
    const { getByText, getByTestId } = ui(
      <Card grow title="T" testID="c">
        <Text>body</Text>
      </Card>,
    );
    expect(getByTestId("c").style.flexGrow).toBe("1");
    expect((getByText("body").parentElement as HTMLElement).style.flexGrow).toBe("1");
  });

  it("grows the string body the same way", () => {
    const { getByText } = ui(<Card grow title="T" body="the body" />);
    expect((getByText("the body").parentElement as HTMLElement).style.flexGrow).toBe("1");
  });

  it("leaves the body alone on a card that was not asked to grow", () => {
    const { getByText } = ui(
      <Card title="T">
        <Text>body</Text>
      </Card>,
    );
    expect((getByText("body").parentElement as HTMLElement).style.flexGrow).toBe("");
  });
});

it("clickable cards with nested actions expose only the action button role", () => {
  const { getAllByRole, getByRole } = ui(<Card interactiveContents steadyPress onPress={() => {}}><Button onPress={() => {}}>Pause</Button></Card>);
  expect(getAllByRole("button").length).toBe(1);
  expect(getByRole("button", { name: "Pause" })).toBeTruthy();
});

it("owns reference summary content and opens the supplied source once", () => {
  let opened = 0;
  const { getByRole, getByText } = ui(<Card referenceStacked referenceKey="CORE-1" title="Preserve the interface" description="Ready" onPress={() => { opened += 1; }} accessibilityLabel="Open reference" />);
  expect(getByText("CORE-1")).toBeTruthy();
  expect(getByText("Preserve the interface")).toBeTruthy();
  expect(getByText("Ready")).toBeTruthy();
  fireEvent.click(getByRole("button", { name: "Open reference" }));
  expect(opened).toBe(1);
});

it("featured cards own their content and keep approval actions independent", () => {
  let selected = 0, approved = 0;
  const { getByText, getByRole, getAllByRole } = ui(<Card featured stacked interactiveContents steadyPress title="Blueprint" initials="B" eyebrow="Awaiting approval" badge="Architecture" body="Define the boundaries" caption="A human signs every one" metadata="Commerce" onPress={() => { selected++; }} actions={<Button onPress={() => { approved++; }}>Approve</Button>} />);
  for (const text of ["Blueprint", "Awaiting approval", "Architecture", "Define the boundaries", "A human signs every one", "Commerce"]) expect(getByText(text)).toBeTruthy();
  expect(getAllByRole("button").length).toBe(1);
  fireEvent.click(getByRole("button", { name: "Approve" }));
  expect(approved).toBe(1);
  expect(selected).toBe(0);
});

it("promotional cards retain their title, body and action", () => {
  let opened = 0;
  const { getByText, getByRole } = ui(<Card promo title="Ship the next agent" body="Start with its charter" actions={<Button onPress={() => { opened++; }}>Read the charter</Button>} />);
  expect(getByText("Ship the next agent")).toBeTruthy();
  expect(getByText("Start with its charter")).toBeTruthy();
  fireEvent.click(getByRole("button", { name: "Read the charter" }));
  expect(opened).toBe(1);
});

it("a data-driven card sets the hand-off's eyebrow row above its title", () => {
  const { getByText } = ui(<Card eyebrow="Library" badge="MIT" title="Canvas v4.0.0" description="107 components" footer="Updated Oct 26" />);
  const eyebrow = getByText("Library");
  expect(eyebrow.style.textTransform).toBe("uppercase");
  expect(eyebrow.style.fontSize).toBe(`${cardStyles.eyebrow(lightColors).fontSize}px`);
  expect(getByText("MIT")).toBeTruthy();
  // The eyebrow precedes the title, and the title takes the card's 500 20 px heading.
  const title = getByText("Canvas v4.0.0");
  expect(eyebrow.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(title.style.fontSize).toBe("21px");
  expect(title.style.fontWeight).toBe("500");
});

// The v4 hand-off component page's card geometry (Component.dc.html): the Corners axis,
// the `outlined` elevation, the page densities (on a plain and on a sectioned card) and
// the two stage wells.
describe("Card corners", () => {
  it("draws each step from the web row, the card corner by default", () => {
    const radius = (node: ReturnType<typeof ui>) => node.getByTestId("c").style.borderRadius;
    expect(radius(ui(<Card testID="c"><Text>a</Text></Card>))).toBe(`${shape.web.card}px`);
    cleanup();
    expect(radius(ui(<Card smallCorners testID="c"><Text>a</Text></Card>))).toBe(`${shape.web.tile}px`);
    cleanup();
    expect(radius(ui(<Card calloutCorners testID="c"><Text>a</Text></Card>))).toBe(`${platformShape.web.callout}px`);
    cleanup();
    expect(radius(ui(<Card largeCorners testID="c"><Text>a</Text></Card>))).toBe(`${platformShape.web.panel}px`);
    cleanup();
    expect(radius(ui(<Card stageCorners testID="c"><Text>a</Text></Card>))).toBe(`${platformShape.web.stage}px`);
    cleanup();
    expect(radius(ui(<Card showcaseCorners testID="c"><Text>a</Text></Card>))).toBe(`${platformShape.web.showcaseCard}px`);
    cleanup();
    expect(radius(ui(<Card heroCorners testID="c"><Text>a</Text></Card>))).toBe(`${platformShape.web.heroStage}px`);
  });

  it("the smaller step wins when several are passed", () => {
    const { getByTestId } = ui(<Card stageCorners largeCorners calloutCorners testID="c"><Text>a</Text></Card>);
    expect(getByTestId("c").style.borderRadius).toBe(`${platformShape.web.callout}px`);
  });

  it("the native skins keep their own card corner on every step but the tile", () => {
    for (const skin of [cardStyles.iosSkin, cardStyles.androidSkin]) {
      expect(skin.corners.callout).toBe(skin.radius);
      expect(skin.corners.large).toBe(skin.radius);
      expect(skin.corners.stage).toBe(skin.radius);
      expect(skin.corners.showcase).toBe(skin.radius);
      expect(skin.corners.hero).toBe(skin.radius);
      expect(skin.corners.default).toBe(skin.radius);
    }
    expect(cardStyles.iosSkin.corners.small).toBe(shape.ios.tile);
    expect(cardStyles.androidSkin.corners.small).toBe(shape.android.tile);
  });

  // The v4 hand-off section pages' two steps (`<Section>.dc.html`, canvas-hero.js): the
  // web skin draws the showcase card at 20 and the hero stage at 24; the native skins keep
  // their own card corner on them, as on the component page's steps.
  it("the section pages' showcase card and hero stage are the web row's 20 and 24", () => {
    expect(platformShape.web.showcaseCard).toBe(20);
    expect(platformShape.web.heroStage).toBe(24);
    expect(cardStyles.webSkin.corners.showcase).toBe(platformShape.web.showcaseCard);
    expect(cardStyles.webSkin.corners.hero).toBe(platformShape.web.heroStage);
    // The component page's stage and the section page's showcase card are both 20 on the
    // web; the stage, the earlier step, wins the tie, and both win over the hero's 24.
    const { getByTestId } = ui(<Card heroCorners showcaseCorners stageCorners testID="c"><Text>a</Text></Card>);
    expect(getByTestId("c").style.borderRadius).toBe(`${platformShape.web.stage}px`);
    cleanup();
    expect(ui(<Card heroCorners showcaseCorners testID="c"><Text>a</Text></Card>).getByTestId("c").style.borderRadius).toBe(`${platformShape.web.showcaseCard}px`);
  });
});

// The section hero's stage shadow and the showcase card's density (the v4 hand-off's
// section pages): `heroShadow` is the ladder's medium step between the resting and the
// raised card, and `roomy` the card's 24 px inset with a 20 px rhythm, on every platform.
describe("Card hero shadow and roomy density", () => {
  it("heroShadow is the medium shadow on the web and iOS, M3 level 2 on Android", () => {
    expect(elevationOf({ heroShadow: true })).toBe("hero");
    expect(elevationOf({ raised: true, heroShadow: true })).toBe("raised");
    expect(elevationOf({ outlined: true, heroShadow: true })).toBe("outlined");
    expect(elevationOf({ heroShadow: true, tileShadow: true })).toBe("hero");
    expect(cardStyles.webSkin.elevation("hero", lightColors)).toEqual(shadow("md", lightColors));
    expect(cardStyles.iosSkin.elevation("hero", lightColors)).toEqual(shadow("md", lightColors));
    // M3 level 2 (3dp), between the resting level 1 and the raised level 3.
    expect(cardStyles.androidSkin.elevation("hero", lightColors)).toEqual(customShadow({ offsetY: 2, radius: 4, opacity: 0.1, elevation: 3 }));
    expect(cardStyles.androidSkin.elevation("hero", lightColors)).not.toEqual(cardStyles.androidSkin.elevation("raised", lightColors));
    expect(cardStyles.androidSkin.elevation("hero", lightColors)).not.toEqual(cardStyles.androidSkin.elevation("default", lightColors));
    const { getByTestId } = ui(
      <>
        <Card heroShadow testID="hero"><Text>a</Text></Card>
        <Card raised testID="raised"><Text>a</Text></Card>
        <Card testID="rest"><Text>a</Text></Card>
      </>,
    );
    const hero = getByTestId("hero").style.boxShadow;
    expect(hero).not.toBe("none");
    expect(hero).not.toBe(getByTestId("raised").style.boxShadow);
    expect(hero).not.toBe(getByTestId("rest").style.boxShadow);
  });

  it("roomy is a 24 px inset with a 20 px rhythm on every skin, between relaxed and spacious", () => {
    expect(densityOf({ roomy: true })).toBe("roomy");
    expect(densityOf({ relaxed: true, roomy: true })).toBe("relaxed");
    expect(densityOf({ roomy: true, spacious: true, compact: true })).toBe("roomy");
    for (const skin of [cardStyles.webSkin, cardStyles.iosSkin, cardStyles.androidSkin]) {
      expect(skin.density.roomy).toEqual({ padding: 24, gap: 20 });
    }
    const { getByTestId } = ui(<Card roomy testID="c"><Text>a</Text><Text>b</Text></Card>);
    expect(getByTestId("c").style.padding).toBe("24px");
    expect(getByTestId("c").style.gap).toBe("20px");
  });
});

describe("Card outlined", () => {
  it("keeps the card fill under the hairline with no shadow, where `flat` steps the fill up", () => {
    const { getByTestId } = ui(
      <>
        <Card outlined testID="o"><Text>a</Text></Card>
        <Card flat testID="f"><Text>a</Text></Card>
        <Card testID="d"><Text>a</Text></Card>
      </>,
    );
    const outlined = getByTestId("o");
    const flat = getByTestId("f");
    const rest = getByTestId("d");
    expect(outlined.style.boxShadow).toBe("none");
    expect(flat.style.boxShadow).toBe("none");
    expect(rest.style.boxShadow).not.toBe("none");
    expect(outlined.style.backgroundColor).toBe(rest.style.backgroundColor);
    expect(outlined.style.borderWidth).toBe("1px");
    // The fills by skin, since the light scheme paints card and popover the same white:
    // outlined keeps the card fill, flat steps up to the popover (sf2).
    expect(cardStyles.webSkin.surface(lightColors, "outlined").backgroundColor).toBe(lightColors.card);
    expect(cardStyles.webSkin.flatFill!(lightColors)).toBe(lightColors.popover);
  });

  it("sits after `flat` in the elevation precedence", () => {
    expect(elevationOf({ flat: true, outlined: true })).toBe("flat");
    expect(elevationOf({ outlined: true, tileShadow: true })).toBe("outlined");
    // Android's outlined card is the Material 3 outlined card: the hairline shows and the elevation drops.
    expect(cardStyles.androidSkin.surface(lightColors, "outlined").borderColor).toBe(lightColors.border);
    expect(cardStyles.androidSkin.elevation("outlined", lightColors)).toEqual(cardStyles.androidSkin.elevation("flat", lightColors));
  });
});

describe("Card page densities", () => {
  it("pad a plain card at the hand-off's insets and rhythm", () => {
    const cases: [keyof typeof cardStyles.webSkin.density, string, string][] = [
      ["panel", "18px", "12px"],
      ["guide", "18px 20px", "10px"],
      ["linkTile", "14px 16px", "6px"],
      ["pager", "16px 18px", "4px"],
    ];
    for (const [density, padding, gap] of cases) {
      const { getByTestId } = ui(<Card {...{ [density]: true }} testID="c"><Text>a</Text><Text>b</Text></Card>);
      const el = getByTestId("c");
      expect(el.style.padding, density).toBe(padding);
      expect(el.style.gap, density).toBe(gap);
      cleanup();
    }
  });

  it("on a sectioned card move the inset and rhythm onto the sections, the surface staying bare", () => {
    const { getByTestId, getByText } = ui(
      <Card panel eyebrow="Keyboard" testID="c">
        <Text>Enter</Text>
      </Card>,
    );
    expect(getByTestId("c").style.padding).toBe("");
    // The eyebrow row takes the inset above and beside.
    const eyebrow = getByText("Keyboard").parentElement as HTMLElement;
    expect(eyebrow.style.paddingTop).toBe("18px");
    expect(eyebrow.style.paddingLeft).toBe("18px");
    // The body sits the rhythm under it, keeps the inset beside and below, and spaces its children by it.
    const body = getByText("Enter").parentElement as HTMLElement;
    expect(body.style.paddingTop).toBe("12px");
    expect(body.style.paddingLeft).toBe("18px");
    expect(body.style.paddingBottom).toBe("18px");
    expect(body.style.gap).toBe("12px");
  });

  it("leave a sectioned card's standard sections alone at the default density", () => {
    const { getByText } = ui(<Card eyebrow="Keyboard"><Text>Enter</Text></Card>);
    const body = getByText("Enter").parentElement as HTMLElement;
    expect(body.style.paddingTop).toBe(`${cardStyles.content.paddingVertical}px`);
    expect(body.style.gap).toBe(`${cardStyles.content.gap}px`);
  });
});

describe("CardMedia stage wells", () => {
  it("`stage` is the anatomy figure's well and `playground` the live specimen's, growing beside a panel", () => {
    const { getByTestId } = ui(
      <>
        <CardMedia stage testID="s"><Text>figure</Text></CardMedia>
        <CardMedia playground testID="p"><Text>live</Text></CardMedia>
      </>,
    );
    const stage = getByTestId("s");
    // The hand-off's 320 is the bordered figure's box (line 217, `box-sizing:border-box`):
    // the well inside the frame's two hairlines is 318.
    expect(stage.style.minHeight).toBe("318px");
    expect(stage.style.padding).toBe("80px 40px");
    expect(stage.style.flexGrow).toBe("");
    const playground = getByTestId("p");
    expect(playground.style.minHeight).toBe("340px");
    expect(playground.style.padding).toBe("44px 28px");
    expect(playground.style.flexGrow).toBe("1");
    expect(playground.style.flexShrink).toBe("1");
  });

  it("the specimen wells win over the stages", () => {
    expect(mediaWellOf({ compact: true, stage: true })).toBe("compact");
    expect(mediaWellOf({ tall: true, playground: true })).toBe("tall");
    expect(mediaWellOf({ stage: true, playground: true })).toBe("stage");
  });
});
