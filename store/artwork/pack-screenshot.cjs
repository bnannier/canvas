const { copyFile, mkdir } = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const sizes = {
  medium: [1206, 2622],
  large: [1320, 2868],
  ipad: [2064, 2752],
};

const [input, output, display] = process.argv.slice(2);

async function pack() {
  const size = sizes[display];
  if (!input || !output || !size) {
    throw new Error("Usage: node pack-screenshot.cjs INPUT.png OUTPUT.png medium|large|ipad");
  }
  if (path.resolve(input) === path.resolve(output)) {
    throw new Error("Use different paths for the raw screenshot and upload PNG");
  }

  const source = sharp(input);
  const metadata = await source.metadata();
  const [width, height] = size;
  if (metadata.format !== "png" || metadata.width !== width || metadata.height !== height) {
    throw new Error(`Expected a ${width}×${height} PNG for ${display}: ${input}`);
  }
  if (metadata.hasAlpha) {
    const { channels } = await source.stats();
    if (channels[channels.length - 1].min !== 255) {
      throw new Error(`Screenshot has non-opaque pixels: ${input}`);
    }
  }

  await mkdir(path.dirname(output), { recursive: true });
  if (metadata.hasAlpha) {
    await source.removeAlpha().png().toFile(output);
  } else {
    await copyFile(input, output);
  }

  const final = await sharp(output).metadata();
  if (final.channels !== 3 || final.hasAlpha) {
    throw new Error(`App Store PNG requires three opaque channels: ${output}`);
  }
}

pack().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
