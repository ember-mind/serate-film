// Genera log riproducibile dei cue usati per artwork dei 100 classici.
import fs from "node:fs";
import path from "node:path";
import { CLASSIC_FILMS } from "./classic-films.mjs";

const slugify = (title) => title
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const header = `# Classic artwork prompts (1921–1994)

Generated with built-in image generator, one distinct request per film. Shared constraints: original cinematic 16:9 artwork, at least three film-specific visual cues, readable at thumbnail size, no copied poster/frame, title/text/logo/watermark, actor likeness, or exact copyrighted character design. Outputs converted with ImageMagick to 960×540 WebP, stripped metadata, method 6, quality 58 (lower fallback when needed), maximum 90 KB.
`;
const entries = CLASSIC_FILMS.map(({ title, year, cues }) => `
## ${year} — ${title}

- Output: \`public/posters/generated/${year}-${slugify(title)}.webp\`
- Visual cues: ${cues}.
`).join("");

const output = path.join(process.cwd(), "artwork-prompts-1921-1994.md");
fs.writeFileSync(output, `${header}${entries}`);
console.log(`Prompt log: ${CLASSIC_FILMS.length} film in ${path.relative(process.cwd(), output)}.`);
