import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { I18nManager, Text, View } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { MediaObject as MediaObjectWeb } from "../src/molecules/media-objects/media-objects.tsx";
import { MediaObject as MediaObjectIOS } from "../src/molecules/media-objects/media-objects.ios.tsx";
import { MediaObject as MediaObjectAndroid } from "../src/molecules/media-objects/media-objects.android.tsx";
import type { MediaObjectProps } from "../src/molecules/media-objects/media-objects.shared.tsx";

// MediaObject on every entry (the shell is shared; each platform passes its own skin and
// Avatar): the leading-media precedence, the alignment and direction axes (and the
// reading direction, which each platform mirrors itself), the compact avatar, truncation
// that keeps the full text, and the tappable row. Three defects stay open for Phase 4
// (audit/components/media-objects.md): a trailing action renders inside a tappable row's
// button, the row is named by its title alone, and a photo row reads the title twice.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const at = (id: string) => screen.getByTestId(id);

const SKINS: [string, ComponentType<MediaObjectProps>][] = [
  ["web", MediaObjectWeb],
  ["ios", MediaObjectIOS],
  ["android", MediaObjectAndroid],
];

for (const [platform, MediaObject] of SKINS) {
  describe(`MediaObject on ${platform}`, () => {
    it("leads with the photo over the initials over the icon, one at a time", () => {
      ui(<MediaObject src="https://example.com/rc.jpg" avatar="RC" icon="★" title="Rachel Chen" />);
      // The photo is the platform Avatar's image, named after the row's title, once.
      expect(screen.getAllByRole("img", { name: "Rachel Chen" })).toHaveLength(1);
      expect(screen.queryByText("★")).toBeNull();
      cleanup();
      ui(<MediaObject avatar="RC" icon="★" title="Rachel Chen" />);
      expect(screen.getByText("RC")).toBeTruthy();
      expect(screen.queryByText("★")).toBeNull();
      cleanup();
      ui(<MediaObject icon="★" title="Security first" />);
      expect(screen.getByText("★")).toBeTruthy();
    });

    it("renders the title, description, body and trailing meta", () => {
      ui(<MediaObject avatar="RC" title="Rachel Chen" description="Engineering Lead" body="Reviewed the pull request." meta="1h" />);
      for (const line of ["Rachel Chen", "Engineering Lead", "Reviewed the pull request.", "1h"]) expect(screen.getByText(line)).toBeTruthy();
    });

    it("top-aligns by default and resolves alignment center > start", () => {
      ui(
        <>
          <MediaObject title="Default" testID="d" />
          <MediaObject title="Start" start testID="s" />
          <MediaObject title="Center" center testID="c" />
          <MediaObject title="Both" center start testID="b" />
        </>,
      );
      expect(at("d").style.alignItems).toBe("flex-start");
      expect(at("s").style.alignItems).toBe("flex-start");
      expect(at("c").style.alignItems).toBe("center");
      expect(at("b").style.alignItems).toBe("center");
    });

    it("leads with the media by default and resolves direction reversed > leading", () => {
      ui(
        <>
          <MediaObject title="Default" testID="d" />
          <MediaObject title="Reversed" reversed testID="r" />
          <MediaObject title="Both" reversed leading testID="b" />
        </>,
      );
      expect(at("d").style.flexDirection).toBe("row");
      expect(at("r").style.flexDirection).toBe("row-reverse");
      expect(at("b").style.flexDirection).toBe("row-reverse");
    });

    it("leaves right-to-left mirroring to the platform, so the media leads on the reading side", () => {
      // Yoga mirrors a logical row natively under I18nManager's RTL, and the browser
      // mirrors it under a `dir="rtl"` ancestor. A shell that flipped the row itself on
      // RTL would mirror it twice, so the row stays logical with RTL forced on.
      const original = I18nManager.getConstants;
      I18nManager.getConstants = () => ({ ...original.call(I18nManager), isRTL: true });
      try {
        ui(
          <View dir="rtl">
            <MediaObject avatar="RC" title="Leading" testID="l" />
            <MediaObject avatar="RC" title="Reversed" reversed testID="r" />
          </View>,
        );
        expect(at("l").style.flexDirection).toBe("row");
        expect(at("r").style.flexDirection).toBe("row-reverse");
        expect(at("l").closest('[dir="rtl"]')).not.toBeNull();
        // The media is still the row's first child: the leading side is the reading start.
        expect(at("l").firstElementChild?.textContent).toBe("RC");
      } finally {
        I18nManager.getConstants = original;
      }
    });

    it("steps the leading avatar down to the 28px `small` size under compact", () => {
      ui(
        <>
          <MediaObject avatar="RC" title="Default" testID="d" />
          <MediaObject compact avatar="RC" title="Compact" testID="c" />
        </>,
      );
      const avatarBox = (id: string) => (at(id).firstElementChild as HTMLElement).style.width;
      expect(avatarBox("c")).toBe("28px");
      expect(avatarBox("d")).not.toBe("28px");
    });

    it("clamps the title and description to one line under truncate and keeps the full text", () => {
      const email = "ada.lovelace@analytical-engine.example.com";
      ui(<MediaObject truncate title="Ada Lovelace" description={email} />);
      const line = screen.getByText(email);
      // react-native-web clamps one line with an ellipsis; the text itself is whole.
      expect(line.textContent).toBe(email);
      expect(getComputedStyle(line).textOverflow).toBe("ellipsis");
      expect(getComputedStyle(screen.getByText("Ada Lovelace")).textOverflow).toBe("ellipsis");
      cleanup();
      ui(<MediaObject title="Ada Lovelace" description={email} />);
      expect(getComputedStyle(screen.getByText(email)).textOverflow).not.toBe("ellipsis");
    });

    it("is one button named after its title, and fires onPress", () => {
      let presses = 0;
      ui(<MediaObject avatar="RC" title="Rachel Chen" description="Engineering Lead" meta="1h" onPress={() => presses++} />);
      const row = screen.getByRole("button", { name: "Rachel Chen" });
      fireEvent.click(row);
      expect(presses).toBe(1);
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    it("names a title-less row from its first text prop", () => {
      ui(<MediaObject src="https://example.com/rc.jpg" description="Engineering Lead" onPress={() => {}} />);
      expect(screen.getByRole("button", { name: "Engineering Lead" })).toBeTruthy();
      cleanup();
      ui(<MediaObject icon="★" meta="1h" onPress={() => {}} />);
      expect(screen.getByRole("button", { name: "1h" })).toBeTruthy();
    });

    it("keeps a bordered tappable row one button, the card itself", () => {
      // The card a static bordered row paints, to compare the button with.
      ui(<MediaObject bordered avatar="AL" title="Ada Lovelace" testID="static" />);
      const card = at("static").style;
      const edge = [card.borderTopWidth, card.borderTopColor, card.borderTopLeftRadius, card.paddingTop];
      cleanup();
      let presses = 0;
      ui(<MediaObject bordered avatar="AL" title="Ada Lovelace" description="ada@example.com" onPress={() => presses++} testID="card" />);
      const row = screen.getByRole("button", { name: "Ada Lovelace" });
      expect(screen.getAllByRole("button")).toHaveLength(1);
      // The button is the bordered card: it carries the testID and the card's own edge.
      expect(at("card")).toBe(row);
      expect([row.style.borderTopWidth, row.style.borderTopColor, row.style.borderTopLeftRadius, row.style.paddingTop]).toEqual(edge);
      fireEvent.click(row);
      expect(presses).toBe(1);
    });

    it("exposes no button without onPress", () => {
      ui(<MediaObject title="Static" action={<Text>Meta action</Text>} />);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });
}
