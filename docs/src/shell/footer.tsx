import { useRouter } from "expo-router";
import { PLATFORM_COPY } from "../data/platform-copy";
import { View, Row, Column, Container, Divider, Typography, Button } from "@nannier/canvas";
import { CanvasMark } from "../brand/canvas-mark";
import { GUIDES_ROOM } from "../data/rooms";
import { useLatestVersion } from "../ui/use-latest-version";
import { FOOTER, SHELL } from "./page-look";

// The docs' footer, the hand-off's (`Canvas v4.0.0 Controls.dc.html`, its <footer>): a
// hairline, then the brand line over a short paragraph, and a mono column of meta lines
// ending in the repository link; Canvas adds a Guides column (decision L), since the
// pill carries the rooms and the reference pages need a home. The page mounts it after
// its content on every platform (../ui/page.tsx). The columns wrap under each other where
// they do not fit side by side. Only the frame (the padding and the hairline's gap) is
// docs scaffolding; everything in it is a kit component.

const REPO_URL = "https://github.com/bnannier/canvas";

export function Footer() {
  const router = useRouter();
  const version = useLatestVersion();
  return (
    <View
      role="contentinfo"
      // The footer sits beside the page's main landmark, not inside its frame, so it carries
      // the hand-off's page frame itself (`max-width:1440px;margin:0 auto`, Component.dc.html
      // line 310), centred by the scroll content around it.
      style={{ width: "100%", maxWidth: SHELL.frameMax, paddingTop: FOOTER.top, paddingHorizontal: FOOTER.side, paddingBottom: FOOTER.bottom, gap: FOOTER.ruleGap }}
    >
      <Divider />
      {/* No cross-axis alignment: stacked, the Row is a Column whose stretch gives the
          brand block the line's width, so its paragraph wraps there instead of measuring
          at its max-content width (it ran off a phone's edge on iOS). Side by side, the
          brand block shrinks before the link columns, as the hand-off's wrap row does. */}
      <Row between stacks stackBreakpoint="lg" loose>
        <Column snug shrink>
          <Row snug alignCenter>
            <CanvasMark size={22} />
            <Typography h5 level={2}>{`Canvas ${version} · component library`}</Typography>
          </Row>
          <Container md start>
            <Typography small subtle>
              {`Direction \u201cMade of light\u201d. ${PLATFORM_COPY.footer}`}
            </Typography>
          </Container>
        </Column>
        <Row loose alignStart wrap>
          <Column compact>
            <Typography caption mono subtle>Guides</Typography>
            <Container xxs start>
              <Row cozy wrap>
                {GUIDES_ROOM.items.map((item) => (
                  <Button key={item.id} link small href={item.href} onPress={(event) => {
                      // The row is an anchor: route on the client instead of loading the page.
                      event.preventDefault();
                      router.push(item.href as never);
                    }}>
                    {item.label}
                  </Button>
                ))}
              </Row>
            </Container>
          </Column>
          <Column compact>
            <Typography caption mono subtle>{`@nannier/canvas ${version}`}</Typography>
            <Typography caption mono subtle>display · Bricolage Grotesque</Typography>
            <Typography caption mono subtle>ui · Instrument Sans</Typography>
            <Typography caption mono subtle>mono · JetBrains Mono</Typography>
            <Typography caption mono subtle>accent · oklch(L C hue)</Typography>
            <Button link small external href={REPO_URL}>github.com/bnannier/canvas ↗</Button>
          </Column>
        </Row>
      </Row>
    </View>
  );
}
