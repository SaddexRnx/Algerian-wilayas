/**
 * Splits public/api/full-data.json into lightweight per-wilaya endpoints.
 *
 * Run with: node scripts/split-data.js
 *
 * Generates, for every wilaya:
 *   public/api/wilayas/{code}-dairas.json
 *     [ { name_ar, name_ascii, communes: [ { name_ar, name_ascii } ] } ]
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "public", "api");
const wilayasDir = path.join(apiDir, "wilayas");

async function main() {
  const raw = await readFile(path.join(apiDir, "full-data.json"), "utf8");
  const wilayas = JSON.parse(raw);

  await mkdir(wilayasDir, { recursive: true });

  let files = 0;
  for (const wilaya of wilayas) {
    const payload = (wilaya.dairas ?? []).map((daira) => ({
      name_ar: daira.arabic,
      name_ascii: daira.ascii,
      communes: (daira.communes ?? []).map((commune) => ({
        name_ar: commune.arabic,
        name_ascii: commune.ascii,
      })),
    }));

    await writeFile(
      path.join(wilayasDir, `${wilaya.code}-dairas.json`),
      JSON.stringify(payload),
      "utf8",
    );
    files += 1;
  }

  console.log(`Generated ${files} {code}-dairas.json files in public/api/wilayas/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
