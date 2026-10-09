// A small grayscale thumbnail of an image and the mean absolute difference between two
// of them: enough to tell two frames apart (a navigation that landed, a frame that is
// still moving) and too coarse to see sub-pixel antialiasing noise. Shared by the
// native capture host's two-grab stability check and scripts/capture-looks.ts's stale
// frame guard.

import sharp from "sharp";

/** The thumbnail size: capture-looks.ts's, the iPhone 17 Pro screen's aspect at 64 wide. */
export const FINGERPRINT_SIZE = { width: 64, height: 139 } as const;

/** A grayscale `width` x `height` thumbnail of an image file or encoded buffer, one byte per pixel. */
export async function fingerprint(input: string | Buffer, size: { width: number; height: number } = FINGERPRINT_SIZE): Promise<Buffer> {
  return await sharp(input).grayscale().resize(size.width, size.height, { fit: "fill" }).raw().toBuffer();
}

/** The mean absolute difference of two thumbnails of one size, from 0 (identical) to 255. */
export function meanAbsDiff(a: Buffer, b: Buffer): number {
  if (a.length !== b.length) throw new Error(`fingerprints differ in size: ${a.length} and ${b.length} bytes`);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}
