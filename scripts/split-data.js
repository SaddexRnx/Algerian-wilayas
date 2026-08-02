/**
 * Splits public/api/full-data.json into lightweight static endpoints.
 *
 * Generates:
 *   public/api/wilayas.json                      -> [{ code, arabic, ascii }]
 *   public/api/wilayas/{code}.json               -> full wilaya record
 *   public/api/wilayas/{code}-dairas.json        -> [{ name_ar, name_ascii, slug, communes: [...] }]
 *   public/api/wilayas/{code}/dairas.json        -> [{ arabic, ascii, slug, communes: <count> }]
 *   public/api/wilayas/{code}/communes.json      -> flat commune list for the wilaya
 *   public/api/wilayas/{code}/dairas/{slug}.json -> single daira with its communes
 *   public/api/dairas/{code}-{slug}.json         -> communes of one daira (globally addressable)
 *   public/api/dairas/{slug}.json                -> same, when the slug is unambiguous
 *   public/api/dairas/index.json                 -> lookup table of every daira
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "public", "api");
const wilayasDir = path.join(apiDir, "wilayas");
const dairasDir = path.join(apiDir, "dairas");

export function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const write = async (file, payload) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(payload), "utf8");
};

async function main() {
  const wilayas = JSON.parse(await readFile(path.join(apiDir, "full-data.json"), "utf8"));

  await mkdir(wilayasDir, { recursive: true });
  await mkdir(dairasDir, { recursive: true });

  // Detect slug collisions across wilayas (e.g. "Boutlelis" exists in 31 and 36).
  const slugCount = new Map();
  for (const w of wilayas) {
    for (const d of w.dairas ?? []) {
      const s = slugify(d.ascii);
      slugCount.set(s, (slugCount.get(s) ?? 0) + 1);
    }
  }

  const index = [];
  let files = 0;

  await write(
    path.join(apiDir, "wilayas.json"),
    wilayas.map((w) => ({ code: w.code, arabic: w.arabic, ascii: w.ascii })),
  );
  files += 1;

  for (const wilaya of wilayas) {
    const dairas = wilaya.dairas ?? [];

    await write(path.join(wilayasDir, `${wilaya.code}.json`), wilaya);

    await write(
      path.join(wilayasDir, `${wilaya.code}-dairas.json`),
      dairas.map((d) => ({
        name_ar: d.arabic,
        name_ascii: d.ascii,
        slug: slugify(d.ascii),
        communes: (d.communes ?? []).map((c) => ({ name_ar: c.arabic, name_ascii: c.ascii })),
      })),
    );

    await write(
      path.join(wilayasDir, String(wilaya.code), "dairas.json"),
      dairas.map((d) => ({
        arabic: d.arabic,
        ascii: d.ascii,
        slug: slugify(d.ascii),
        communes: (d.communes ?? []).length,
      })),
    );

    await write(
      path.join(wilayasDir, String(wilaya.code), "communes.json"),
      dairas.flatMap((d) =>
        (d.communes ?? []).map((c) => ({
          arabic: c.arabic,
          ascii: c.ascii,
          daira_ar: d.arabic,
          daira_ascii: d.ascii,
        })),
      ),
    );

    files += 4;

    for (const daira of dairas) {
      const slug = slugify(daira.ascii);
      const payload = {
        wilaya_code: wilaya.code,
        wilaya_ar: wilaya.arabic,
        wilaya_ascii: wilaya.ascii,
        name_ar: daira.arabic,
        name_ascii: daira.ascii,
        slug,
        communes: (daira.communes ?? []).map((c) => ({
          name_ar: c.arabic,
          name_ascii: c.ascii,
        })),
      };

      await write(path.join(wilayasDir, String(wilaya.code), "dairas", `${slug}.json`), payload);
      await write(path.join(dairasDir, `${wilaya.code}-${slug}.json`), payload);
      files += 2;

      if (slugCount.get(slug) === 1) {
        await write(path.join(dairasDir, `${slug}.json`), payload);
        files += 1;
      }

      index.push({
        wilaya_code: wilaya.code,
        slug,
        name_ar: daira.arabic,
        name_ascii: daira.ascii,
        communes: (daira.communes ?? []).length,
      });
    }
  }

  await write(path.join(dairasDir, "index.json"), index);
  files += 1;

  console.log(`Generated ${files} JSON files (${wilayas.length} wilayas, ${index.length} dairas).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
