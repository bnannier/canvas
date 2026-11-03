import { Typography, Column } from "@nannier/canvas";

export const Headings = () => (
  <Column>
    <Typography h1>Design with light</Typography>
    <Typography h2>Components that adapt</Typography>
    <Typography h3>Tokens and themes</Typography>
    <Typography h4>Getting started</Typography>
  </Column>
);

export const Body = () => (
  <Column>
    <Typography lead>Canvas is a universal UI kit for iOS, Android and the web.</Typography>
    <Typography>Every component renders natively on each platform and shares one API, so a screen you build once looks right everywhere.</Typography>
    <Typography small muted>Last updated 3 November 2026</Typography>
  </Column>
);

export const Eyebrow = () => (
  <Column>
    <Typography eyebrow>Release notes</Typography>
    <Typography h3>What is new in 4.1</Typography>
  </Column>
);

export const Code = () => <Typography code>npm install @nannier/canvas</Typography>;

export const Emphasis = () => (
  <Column>
    <Typography medium>Medium weight</Typography>
    <Typography bold>Bold weight</Typography>
    <Typography muted>Muted ink</Typography>
    <Typography center>Centered text</Typography>
  </Column>
);
