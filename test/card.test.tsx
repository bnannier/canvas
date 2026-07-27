import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Card, CardMedia, CardContent } from "../src/molecules/card/card.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// The web skin's surface insets (see card.styles.ts): the `padded` default and the
// density steps. The tests pin the padding CONTRACT, not the exact pixel values, but
// reading them from one place keeps the two in sync if the skin ever moves.
const PADDED = "24px";
const COMPACT = "16px";

describe("Card surface padding", () => {
  it("pads raw children by default", () => {
    const { getByTestId } = ui(<Card testID="c"><Text>content</Text></Card>);
    expect(getByTestId("c").style.padding).toBe(PADDED);
  });

  it("`flush` removes the inset for edge-to-edge children", () => {
    const { getByTestId } = ui(<Card flush testID="c"><Text>content</Text></Card>);
    expect(getByTestId("c").style.padding).toBe("");
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
    // The top corners nest inside the web card's 8px corner + 1px border...
    expect(media.style.borderTopLeftRadius).toBe("7px");
    expect(media.style.borderTopRightRadius).toBe("7px");
    // ...and the bottom edge stays flat where the content continues.
    expect(media.style.borderBottomLeftRadius).toBe("");
    expect(media.style.borderBottomRightRadius).toBe("");
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
