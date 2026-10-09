import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import QRRenderer from "react-native-qrcode-svg";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Row, Column } from "../src/atoms/layout/layout.tsx";
import { QRCode } from "../src/atoms/qrcode/qrcode.tsx";
import { iosSkin, webSkin, androidSkin } from "../src/atoms/qrcode/qrcode.styles.ts";
import { contrastRatio } from "../src/style/color.ts";
import { LOOKS, lookProps } from "./fixtures/looks.ts";

// QRCode is camera-only content, so two things have to hold. It is named (a role=img
// whose name carries the payload, unless the caller names it), and it stays scannable:
// dark modules on a light field inside a white frame in every look and on every surface,
// whatever the theme does to the rest of the page. The size axis picks the code's edge.
//
// The test harness stubs react-native-svg, so the code's own vector paths never reach
// the DOM; what the kit controls is what it hands the renderer (react-native-qrcode-svg),
// read here off the rendered tree, and the frame it draws around it.

afterEach(cleanup);
const ui = (n: ReactNode, provider: Record<string, unknown> = {}) => render(<ThemeProvider {...provider}>{n}</ThemeProvider>);
const URL = "https://example.com/invite/42";

const rootOf = (c: HTMLElement) => c.querySelector('[role="img"]') as HTMLElement;

/** The props QRCode handed react-native-qrcode-svg, read off the React tree under its frame. */
function rendererProps(frame: HTMLElement): { value: string; size: number; color: string; backgroundColor: string } {
  const key = Object.keys(frame).find((k) => k.startsWith("__reactFiber$"));
  if (!key) throw new Error("no React fiber on the QRCode frame");
  type Fiber = { type: unknown; memoizedProps: Record<string, unknown>; child: Fiber | null; sibling: Fiber | null };
  const stack: (Fiber | null)[] = [(frame as unknown as Record<string, Fiber>)[key].child];
  while (stack.length) {
    const fiber = stack.pop();
    if (!fiber) continue;
    if (fiber.type === QRRenderer) return fiber.memoizedProps as never;
    stack.push(fiber.sibling, fiber.child);
  }
  throw new Error("QRCode rendered no react-native-qrcode-svg (is the optional peer loading?)");
}

describe("QRCode name", () => {
  it("is an image named after the payload it encodes", () => {
    const { container } = ui(<QRCode value={URL} />);
    expect(rootOf(container).getAttribute("aria-label")).toBe(`QR code encoding ${URL}`);
  });

  it("takes the caller's name instead, for a payload that should not be read aloud", () => {
    const { container } = ui(<QRCode value="otpauth://totp/acme?secret=ABC" accessibilityLabel="Authenticator setup code" />);
    expect(rootOf(container).getAttribute("aria-label")).toBe("Authenticator setup code");
  });
});

describe("QRCode size axis", () => {
  const sizeOf = (props: Record<string, boolean>) => {
    const { container } = ui(<QRCode value={URL} {...props} />);
    const size = rendererProps(rootOf(container)).size;
    cleanup();
    return size;
  };

  it("draws the medium 140 code by default, 96 small and 200 large", () => {
    expect(sizeOf({})).toBe(140);
    expect(sizeOf({ small: true })).toBe(96);
    expect(sizeOf({ large: true })).toBe(200);
  });

  it("resolves small over large", () => {
    expect(sizeOf({ small: true, large: true })).toBe(96);
  });

  it("encodes the value it is given", () => {
    const { container } = ui(<QRCode value={URL} />);
    expect(rendererProps(rootOf(container)).value).toBe(URL);
  });
});

describe("QRCode stays scannable", () => {
  it("draws the same dark-on-white skin on every platform", () => {
    for (const skin of [iosSkin, androidSkin]) expect(skin).toEqual(webSkin);
    expect(webSkin.fieldColor).toBe("#ffffff");
    expect(webSkin.frame.backgroundColor).toBe("#ffffff");
    // Far past the 7:1 a scanner wants: near-black on white.
    expect(contrastRatio(webSkin.moduleColor, webSkin.fieldColor)).toBeGreaterThan(18);
  });

  for (const look of LOOKS) {
    for (const surface of ["solid", "glass"] as const) {
      it(`keeps dark modules on a white field and frame in the ${look.name} look, ${surface}`, () => {
        const { container } = ui(<QRCode value={URL} />, { ...lookProps(look), [surface]: true });
        const frame = rootOf(container);
        expect(frame.style.backgroundColor).toBe("rgba(255, 255, 255, 1.00)");
        // No material is laid under the code: a frosted or tinted field would cost contrast.
        expect(frame.children).toHaveLength(0);
        const drawn = rendererProps(frame);
        expect(drawn.color).toBe(webSkin.moduleColor);
        expect(drawn.backgroundColor).toBe(webSkin.fieldColor);
      });
    }
  }
});

describe("QRCode edge cases and sizing", () => {
  it("renders an empty value without throwing", () => {
    expect(() => ui(<QRCode value="" />)).not.toThrow();
  });

  it("hugs its code inside a stretching Column and takes no cross-axis rule in a Row", () => {
    const column = ui(
      <Column>
        <QRCode value={URL} testID="q" />
      </Column>,
    );
    expect((column.container.querySelector('[data-testid="q"]') as HTMLElement).style.alignSelf).toBe("flex-start");
    cleanup();
    const row = ui(
      <Row>
        <QRCode value={URL} testID="q" />
      </Row>,
    );
    expect((row.container.querySelector('[data-testid="q"]') as HTMLElement).style.alignSelf).toBe("");
  });
});
