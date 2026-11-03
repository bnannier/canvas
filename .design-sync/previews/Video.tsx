import { Video } from "@nannier/canvas";

const source = { uri: "/video-sample.mp4" };
const poster = { uri: "/video-sample.jpg" };

export const Poster = () => <Video source={source} poster={poster} accessibilityLabel="Product walkthrough" />;

export const Controls = () => <Video source={source} poster={poster} controls accessibilityLabel="Walkthrough with controls" />;

export const Square = () => <Video source={source} poster={poster} cover aspectRatio={1} accessibilityLabel="Square crop" />;
