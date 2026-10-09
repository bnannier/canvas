import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
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
import { shape } from "../src/style/tokens.ts";
import { LOOKS, lookProps } from "./fixtures/looks.ts";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// The web skin's surface insets (see card.styles.ts): the default density (the
// standard padded surface plus the card's flat-child gap) and the density steps.
// The tests pin the padding CONTRACT, not the exact pixel values, but reading them
// from one place keeps the two in sync if the skin ever moves.
const PADDED = "24px";
const GAP = "16px";
const COMPACT = "16px";

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
    expect(el.style.gap).toBe("12px");
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
  it("spaces its flat children with the standard card rhythm", () => {
    const { getByText } = ui(
      <CardContent>
        <Text>inside</Text>
      </CardContent>,
    );
    // The Text renders as a leaf div; its parent is CardContent's own View.
    expect((getByText("inside").parentElement as HTMLElement).style.gap).toBe(GAP);
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

  // The cover is named through Image's own resolution, so `alt` (or its alias) reaches the
  // web as a named image; before, react-native-web dropped `alt` and the cover was a
  // decorative <img alt="">, whatever the caller wrote.
  it("names the cover from `alt`, as an image", () => {
    // A remote source, so react-native-web starts the load and mounts its hidden <img>.
    const { getByTestId } = ui(<CardMedia src="https://example.com/kira-tanaka.jpg" alt="Portrait of Kira Tanaka" testID="m" />);
    const media = getByTestId("m");
    expect(media.getAttribute("role")).toBe("img");
    expect(media.getAttribute("aria-label")).toBe("Portrait of Kira Tanaka");
    expect(media.querySelector("img")?.getAttribute("alt")).toBe("Portrait of Kira Tanaka");
  });

  it("names it from `accessibilityLabel` too, with `alt` winning when both are set", () => {
    const alias = ui(<CardMedia src="/kira-tanaka.jpg" accessibilityLabel="Cover photo" testID="m" />);
    expect(alias.getByTestId("m").getAttribute("aria-label")).toBe("Cover photo");
    cleanup();
    const both = ui(<CardMedia src="/kira-tanaka.jpg" alt="Portrait" accessibilityLabel="Cover photo" testID="m" />);
    expect(both.getByTestId("m").getAttribute("aria-label")).toBe("Portrait");
  });

  it("is decorative with no name", () => {
    const { getByTestId } = ui(<CardMedia src="/kira-tanaka.jpg" testID="m" />);
    expect(getByTestId("m").getAttribute("role")).toBeNull();
    expect(getByTestId("m").getAttribute("aria-label")).toBeNull();
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
