import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, fireEvent, within } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { MediaObject as MediaObjectWeb } from "../src/molecules/media-objects/media-objects.tsx";
import { MediaObject as MediaObjectIOS } from "../src/molecules/media-objects/media-objects.ios.tsx";
import { MediaObject as MediaObjectAndroid } from "../src/molecules/media-objects/media-objects.android.tsx";
import { iosSkin, webSkin, androidSkin } from "../src/molecules/media-objects/media-objects.styles.ts";
import type { MediaObjectProps, MediaObjectSkin } from "../src/molecules/media-objects/media-objects.shared.tsx";

// MediaObject on every entry (the shell is shared; each platform passes its own skin and
// Avatar): the leading-media precedence, the alignment and direction axes, the compact
// avatar, truncation that keeps the full text, and the tappable row. A tappable row is
// one button named by every line it shows, and a trailing action sits BESIDE that
// button, never inside it (a control in a button is invalid nesting and one ambiguous
// control), with the card's inset split so the row's tap area still reaches the edge.
// The split pads by start and end, which each platform resolves for its reading
// direction (react-native-web through its locale context), so a reversed row is the
// mirror case these tests pin.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const at = (id: string) => screen.getByTestId(id);

const SKINS: [string, ComponentType<MediaObjectProps>, MediaObjectSkin][] = [
  ["web", MediaObjectWeb, webSkin],
  ["ios", MediaObjectIOS, iosSkin],
  ["android", MediaObjectAndroid, androidSkin],
];

/** The inset a skin's bordered card pads by (the one `padding` the shell splits). */
const insetOf = (skin: MediaObjectSkin) => `${skin.borderedSurface({} as never).padding}px`;

for (const [platform, MediaObject, skin] of SKINS) {
  describe(`MediaObject on ${platform}`, () => {
    it("leads with the photo over the initials over the icon, one at a time", () => {
      ui(<MediaObject src="https://example.com/rc.jpg" avatar="RC" icon="★" title="Rachel Chen" />);
      // The photo is the platform Avatar's image, named after the row's title.
      expect(screen.getAllByRole("img", { name: "Rachel Chen" }).length).toBeGreaterThan(0);
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

    it("is one button named by every line it shows, and fires onPress", () => {
      let presses = 0;
      ui(<MediaObject avatar="RC" title="Rachel Chen" description="Engineering Lead" body="Building the identity platform." meta="1h" onPress={() => presses++} />);
      const row = screen.getByRole("button", { name: "Rachel Chen, Engineering Lead, Building the identity platform., 1h" });
      fireEvent.click(row);
      expect(presses).toBe(1);
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    it("leaves a body that is not plain text out of the row's name", () => {
      ui(<MediaObject title="Rachel Chen" body={<Text>rich body</Text>} onPress={() => {}} />);
      expect(screen.getByRole("button", { name: "Rachel Chen" })).toBeTruthy();
    });

    it("keeps a trailing action beside the row's button, not inside it", () => {
      let rows = 0;
      let invites = 0;
      ui(
        <MediaObject
          bordered
          avatar="AL"
          title="Ada Lovelace"
          description="ada@example.com"
          onPress={() => rows++}
          action={<Button outline small onPress={() => invites++}>Invite</Button>}
          testID="row"
        />,
      );
      const row = screen.getByRole("button", { name: "Ada Lovelace, ada@example.com" });
      const invite = screen.getByRole("button", { name: "Invite" });
      expect(row.contains(invite)).toBe(false);
      expect(invite.contains(row)).toBe(false);
      // The testID still marks the whole card, which holds both.
      expect(at("row").contains(row) && at("row").contains(invite)).toBe(true);
      fireEvent.click(invite);
      expect([rows, invites]).toEqual([0, 1]);
      fireEvent.click(row);
      expect([rows, invites]).toEqual([1, 1]);
    });

    it("splits the card's inset so the row's tap area reaches the card's edge", () => {
      ui(
        <>
          <MediaObject bordered title="Leading" onPress={() => {}} action={<Button small>Go</Button>} testID="l" />
          <MediaObject bordered reversed title="Reversed" onPress={() => {}} action={<Button small>Go</Button>} testID="r" />
        </>,
      );
      const inset = insetOf(skin);
      // The row: top and bottom and its outer side; the action column: the other outer side.
      for (const [id, rowSide, actionSide] of [["l", "Left", "Right"], ["r", "Right", "Left"]] as const) {
        const frame = at(id);
        const row = within(frame).getByRole("button", { name: id === "l" ? "Leading" : "Reversed" });
        const action = row.nextElementSibling as HTMLElement;
        expect(row.parentElement).toBe(frame);
        expect(row.style.paddingTop).toBe(inset);
        expect(row.style.paddingBottom).toBe(inset);
        expect(row.style[`padding${rowSide}`]).toBe(inset);
        expect(row.style[`padding${actionSide}`]).toBe("");
        expect(action.style[`padding${actionSide}`]).toBe(inset);
        expect(action.style.paddingTop).toBe(inset);
        // The frame paints the card and pads nothing itself; its gap parts the two.
        expect(frame.style.paddingTop).toBe("");
        expect(frame.style.borderTopWidth).toBe("1px");
        expect(frame.style.gap).not.toBe("");
      }
    });

    it("centers the action with a centered row and top-aligns it otherwise", () => {
      ui(
        <>
          <MediaObject center title="Centered" onPress={() => {}} action={<Button small>Go</Button>} testID="c" />
          <MediaObject title="Top" onPress={() => {}} action={<Button small>Go</Button>} testID="t" />
        </>,
      );
      const actionColumn = (id: string, name: string) => within(at(id)).getByRole("button", { name }).nextElementSibling as HTMLElement;
      expect(actionColumn("c", "Centered").style.justifyContent).toBe("center");
      expect(actionColumn("t", "Top").style.justifyContent).toBe("flex-start");
    });

    it("exposes no button without onPress", () => {
      ui(<MediaObject title="Static" action={<Text>Meta action</Text>} />);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });
}
