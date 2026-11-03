import { afterEach, describe, expect, it } from "bun:test";
import { cleanup } from "@testing-library/react";
import { Text } from "react-native";
import { anatomyParts } from "./fixtures/anatomy-parts.tsx";
import { Collapsible } from "../src/molecules/collapsible/collapsible.tsx";
import { CodeBlock } from "../src/molecules/code-block/code-block.tsx";
import { Carousel } from "../src/organisms/carousel/carousel.tsx";
import { Image } from "../src/atoms/image/image.tsx";
import { Video } from "../src/atoms/video/video.tsx";
import { QRCode } from "../src/atoms/qrcode/qrcode.tsx";
import { Calendar } from "../src/organisms/calendar/calendar.tsx";
import { Chat } from "../src/organisms/chat/chat.tsx";
import { Board } from "../src/organisms/board/board.tsx";
import { DragDropProvider, DropZone, Draggable } from "../src/organisms/drag-drop/drag-drop.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";

// Pins the anatomy parts the data and media components register with an AnatomyProvider
// (src/style/anatomy.tsx), by the names their docs specs list, and that the kit components
// each one composes (Board's drop zones and cards, Chat's markdown) register none of theirs.

afterEach(cleanup);

describe("anatomy parts, data and media", () => {
  it("Collapsible", async () => {
    expect(await anatomyParts(<Collapsible title="Advanced options" defaultOpen>Body</Collapsible>)).toEqual(["Chevron", "Content", "Trigger"]);
  });

  it("CodeBlock", async () => {
    expect(await anatomyParts(<CodeBlock numbered copy filename="Button.tsx" language="tsx" code={"const a = 1;\nconst b = 2;"} />)).toEqual(["Code", "Copy button", "Filename", "Frame", "Line numbers"]);
  });

  it("Carousel", async () => {
    expect(await anatomyParts(<Carousel showArrows showDots />)).toEqual(["Arrow", "Dots", "Slide", "Viewport"]);
  });

  it("Image", async () => {
    expect(await anatomyParts(<Image width={240} height={180} alt="Portrait" source={{ uri: "https://example.com/a.jpg" }} />)).toEqual(["Frame", "Image"]);
  });

  it("Video", async () => {
    expect(await anatomyParts(<Video controls poster={{ uri: "https://example.com/a.jpg" }} source={{ uri: "https://example.com/a.mp4" }} />)).toEqual(["Frame", "Play control", "Poster", "Scrubber"]);
  });

  it("QRCode", async () => {
    expect(await anatomyParts(<QRCode value="https://canvas.nannier.com" />)).toEqual(["Code", "Quiet zone"]);
  });

  it("Calendar", async () => {
    expect(await anatomyParts(<Calendar month="October 2026" daysInMonth={31} startWeekday={4} today={15} selected={26} events={[{ day: 3 }, { day: 26 }]} />)).toEqual(["Day", "Event dot", "Header", "Selected day", "Weekday row"]);
  });

  it("Chat", async () => {
    const messages = [
      { id: "u", role: "user" as const, content: "Can the accent follow our brand hue?" },
      { id: "a", role: "assistant" as const, content: "Yes. Set one hue.", providerIcon: <Text>*</Text> },
    ];
    expect(await anatomyParts(<Chat messages={messages} value="" onChangeText={() => {}} onSend={() => {}} />)).toEqual(["Assistant message", "Avatar", "Composer", "Thread", "User message"]);
  });

  it("Board, with its cards' badges and its drop zones and draggables registering none of theirs", async () => {
    const columns = [{ id: "todo", label: "To do" }, { id: "done", label: "Done" }];
    const items = [
      { id: "1", columnId: "todo", title: "Token audit", badge: "3" },
      { id: "2", columnId: "done", title: "Ship", badge: "5" },
    ];
    expect(await anatomyParts(<Board columns={columns} defaultItems={items} />)).toEqual(["Board", "Card", "Column", "Count"]);
  });

  it("DragDrop registers its first zone and draggable", async () => {
    expect(
      await anatomyParts(
        <DragDropProvider>
          <DropZone id="a" label="A">
            <Draggable id="1"><Text>One</Text></Draggable>
            <Draggable id="2"><Text>Two</Text></Draggable>
          </DropZone>
          <DropZone id="b" label="B">
            <Badge>Not a part</Badge>
          </DropZone>
        </DragDropProvider>,
      ),
    ).toEqual(["Draggable", "Drop zone"]);
  });
});
