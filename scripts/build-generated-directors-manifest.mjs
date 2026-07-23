// Genera mapping TypeScript solo per ritratti presenti in public/directors/generated/.
import fs from "node:fs";
import path from "node:path";
import { DIRECTOR_CATALOG } from "./director-catalog.mjs";

const root = process.cwd();
const portraitDir = path.join(root, "public", "directors", "generated");
const outputPath = path.join(root, "lib", "generatedDirectorPortraits.ts");
const available = new Set(
  fs.existsSync(portraitDir)
    ? fs.readdirSync(portraitDir).filter((name) => name.endsWith(".webp"))
    : [],
);
const entries = DIRECTOR_CATALOG.flatMap(({ name, slug }) => {
  const filename = `${slug}.webp`;
  return available.has(filename) ? [[name, `/directors/generated/${filename}`]] : [];
});
const body = entries
  .map(([name, url]) => `  ${JSON.stringify(name)}: ${JSON.stringify(url)},`)
  .join("\n");
const generated = `// Generato da scripts/build-generated-directors-manifest.mjs. Non modificare a mano.\nconst GENERATED_DIRECTOR_PORTRAITS: Record<string, string> = {\n${body}\n};\n\nexport function generatedDirectorPortraitFor(name: string): string | null {\n  return GENERATED_DIRECTOR_PORTRAITS[name] ?? null;\n}\n`;

fs.writeFileSync(outputPath, generated);
console.log(`Manifest registi: ${entries.length}/${DIRECTOR_CATALOG.length} ritratti.`);
