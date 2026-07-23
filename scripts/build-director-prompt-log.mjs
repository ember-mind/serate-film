import fs from "node:fs";
import path from "node:path";
import { DIRECTOR_CATALOG } from "./director-catalog.mjs";

const header = `# Generated director portrait prompts\n\nBuilt-in image generator, one distinct request per director. Shared direction: stylized editorial portrait, vertical 4:5, recognizable public-figure likeness without photorealistic impersonation, cinematic set lighting, abstract background cues from catalog filmography, no copied poster/frame/character, title, text, logo, or watermark. Final assets: 640×800 WebP, stripped metadata, maximum 70 KB.\n`;
const entries = DIRECTOR_CATALOG.map(({ name, slug, filmography }) => {
  const films = filmography.slice(0, 4).map(({ title, year }) => `${title} (${year})`).join("; ");
  return `\n## ${name}\n\n- Output: \`public/directors/generated/${slug}.webp\`\n- Film cues: ${films}.\n`;
}).join("");

const output = path.join(process.cwd(), "artwork-prompts-directors.md");
fs.writeFileSync(output, `${header}${entries}`);
console.log(`Prompt log registi: ${DIRECTOR_CATALOG.length}.`);
