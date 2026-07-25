// Generates the docs' sample avatar portraits as flat-vector cartoon characters.
//
// Why this exists: the Avatar examples previously used seven 128x128 photographs of
// identifiable real people whose source was never recorded. Shipping those in an App
// Store binary carries two unverifiable rights at once, copyright in the photograph and
// the subject's likeness, and neither could be established from anything in the repo. A
// licence audit is not a thing you want resting on "probably fine", so the photos are
// replaced by characters drawn here. Everything below is original geometry: no traced
// source, no third-party art, no model.
//
// They are deliberately CARTOONS rather than abstract shapes, because the Avatar docs
// demonstrate the image path and need to read as portraits. Initials are demonstrated
// separately by the component's own fallback, so these must not look like initials.
//
// Run: bun run avatars:gen   (writes docs/public/*.jpg)

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT = "docs/public";
const SIZE = 256; // 2x the 128 display box, so the art stays crisp on retina

// One entry per sample person used across the Avatar, identity-row and stacked examples.
// The names are the existing filenames and are only labels; the characters are invented,
// and are drawn to be visually distinct at 32px as well as at full size.
const PEOPLE = [
  { file: "ada-lovelace",  bg: "#F5D6C6", skin: "#F2C6A0", hair: "#8C3B24", style: "wavy",   top: "#2F7D6B" },
  { file: "grace-hopper",  bg: "#C9D9EC", skin: "#EFC9AC", hair: "#B9BEC7", style: "crop",   top: "#26456E" },
  { file: "kira-tanaka",   bg: "#F3CFDA", skin: "#EFC3A2", hair: "#231F25", style: "bob",   top: "#2B2A33" },
  { file: "liang-bao",     bg: "#BFE0DA", skin: "#D9A277", hair: "#241C16", style: "neat",   top: "#4A5361", glasses: true },
  { file: "marcus-allen",  bg: "#F0D2A8", skin: "#8A5533", hair: "#1B1512", style: "fade",   top: "#7C2F3E", beard: true },
  { file: "noor-park",     bg: "#D6CCEE", skin: "#C98F63", hair: "#2A1E1A", style: "bun",    top: "#C2622F" },
  { file: "rachel-chen",   bg: "#C6E6D5", skin: "#E8B78E", hair: "#3A2A22", style: "long",   top: "#33608F" },
];

// Slightly darker variant of a hex colour, for shading that keeps the flat look.
function shade(hex, amount = 0.82) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.round(v * amount)));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// The hair shapes. Each returns SVG drawn over a head centred at (128,116) with rx 52 /
// ry 58, so the silhouettes differ enough to tell the characters apart in a stacked group.
function hair(style, c) {
  const d = shade(c, 0.78);
  switch (style) {
    case "wavy":
      // Crown plus two side lengths. The sides start at y=104, above where the crown
      // reaches at the temples, so they read as one head of hair rather than detached
      // flaps, while staying outside the face ellipse so they never cross an eye.
      return `<path d="M64 116c0-44 26-70 64-70s64 26 64 70c-4-24-16-36-30-40-16-5-36-4-52 4-18 9-32 16-46 36z" fill="${c}"/>
              <path d="M62 104c-6 30-2 58 6 82 6-28 4-56 0-82z" fill="${c}"/>
              <path d="M194 104c6 30 2 58-6 82-6-28-4-56 0-82z" fill="${c}"/>
              <path d="M88 60c14-10 30-15 46-14-19 3-35 8-49 19z" fill="${d}"/>`;
    case "crop":
      return `<path d="M72 112c-2-40 24-66 56-66s58 26 56 66c-4-14-10-24-18-31-10 8-24 12-40 12-14 0-26-3-34-9-10 7-16 17-20 28z" fill="${c}"/>
              <path d="M126 46c14 0 27 5 36 14-12-5-24-7-36-7-13 0-25 3-36 9 9-10 22-16 36-16z" fill="${d}"/>`;
    case "bob":
      return `<path d="M60 118c0-46 28-72 68-72s68 26 68 72c0 22-4 40-8 52-4-34-6-56-10-70-16 12-52 14-72 0-6 16-10 36-12 70-4-12-8-30-8-52z" fill="${c}"/>
              <path d="M78 74c16-16 42-22 66-16-22 2-42 8-58 22z" fill="${d}"/>`;
    case "neat":
      return `<path d="M68 106c2-38 28-60 60-60s58 22 60 60c-10-22-24-32-42-34-22-3-40 2-54 14-10 8-18 10-24 20z" fill="${c}"/>`;
    case "fade":
      return `<path d="M70 108c0-38 26-58 58-58s58 20 58 58c-10-16-22-24-38-27-20-4-38-2-54 6-10 5-18 10-24 21z" fill="${c}"/>
              <path d="M70 108c6-8 14-14 24-19-4 8-6 14-6 22z" fill="${d}"/>`;
    case "bun":
      return `<circle cx="128" cy="40" r="22" fill="${c}"/>
              <path d="M66 116c0-44 28-68 62-68s62 24 62 68c-8-24-22-36-40-40-22-5-42-1-58 10-12 8-20 14-26 30z" fill="${c}"/>
              <circle cx="128" cy="40" r="22" fill="none" stroke="${d}" stroke-width="3"/>`;
    case "long":
    default:
      return `<path d="M60 120c0-48 30-74 68-74s68 26 68 74c0 30-4 54-8 68-6-38-6-64-10-82-18 12-54 14-74-2-8 18-10 46-14 84-6-14-10-38-10-68z" fill="${c}"/>`;
  }
}

function svg(p) {
  const skinShade = shade(p.skin, 0.9);
  const topShade = shade(p.top, 0.85);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="${SIZE}" height="${SIZE}">
  <rect width="256" height="256" fill="${p.bg}"/>
  <!-- shoulders: drawn wide so the figure still reads when clipped to a circle -->
  <path d="M40 256c0-44 34-70 88-70s88 26 88 70z" fill="${p.top}"/>
  <path d="M106 158h44v34a22 22 0 0 1-44 0z" fill="${skinShade}"/>
  <!-- collar, sitting just under the jaw so no bare band shows between head and top -->
  <path d="M106 186c10 12 34 12 44 0 14 5 24 12 28 20-24 10-76 10-100 0 4-8 14-15 28-20z" fill="${topShade}"/>
  <!-- ears -->
  <ellipse cx="72" cy="122" rx="9" ry="12" fill="${p.skin}"/>
  <ellipse cx="184" cy="122" rx="9" ry="12" fill="${p.skin}"/>
  <!-- head -->
  <ellipse cx="128" cy="116" rx="52" ry="58" fill="${p.skin}"/>
  ${hair(p.style, p.hair)}
  <!-- eyes -->
  <ellipse cx="108" cy="118" rx="5.5" ry="6.5" fill="#2B2320"/>
  <ellipse cx="148" cy="118" rx="5.5" ry="6.5" fill="#2B2320"/>
  <circle cx="110" cy="115.5" r="1.9" fill="#fff" opacity="0.9"/>
  <circle cx="150" cy="115.5" r="1.9" fill="#fff" opacity="0.9"/>
  <!-- brows -->
  <path d="M99 104c5-4 13-4 18-1" stroke="${shade(p.hair, 0.9)}" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M139 103c5-3 13-3 18 1" stroke="${shade(p.hair, 0.9)}" stroke-width="4" stroke-linecap="round" fill="none"/>
  <!-- smile -->
  <path d="M116 141c7 7 17 7 24 0" stroke="#8A4A3C" stroke-width="4" stroke-linecap="round" fill="none"/>
  ${p.beard ? `<path d="M92 126c2 30 18 44 36 44s34-14 36-44c4 22-2 46-16 56-12 9-28 9-40 0-14-10-20-34-16-56z" fill="${p.hair}" opacity="0.95"/>
               <path d="M116 141c7 7 17 7 24 0" stroke="#6E3A2E" stroke-width="4" stroke-linecap="round" fill="none"/>` : ""}
  ${p.glasses ? `<g fill="none" stroke="#3A3F47" stroke-width="4">
       <rect x="93" y="106" width="30" height="24" rx="9"/>
       <rect x="133" y="106" width="30" height="24" rx="9"/>
       <path d="M123 118h10M79 114l14 4M177 114l-14 4"/>
     </g>` : ""}
</svg>`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const p of PEOPLE) {
  const out = path.join(OUT, `${p.file}.jpg`);
  // JPEG keeps the existing filenames, so no example, registry or photos.ts edit is
  // needed. Quality 92 with chroma subsampling off keeps flat colour edges clean, which
  // ordinary JPEG defaults would ring around.
  await sharp(Buffer.from(svg(p)))
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toFile(out);
  console.log(`avatargen: ${out} (${SIZE}x${SIZE}, ${fs.statSync(out).size} bytes)`);
}
