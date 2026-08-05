/**
 * Generates/Updates static JSON endpoints with ZIP code support.
 * 
 * Generates:
 *   public/api/wilayas/{code}.json -> Includes ZIPs for communes
 *   public/api/wilayas/{code}-dairas.json -> Includes ZIPs
 *   ... and ensures all levels return ZIP data where available.
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
  const fullData = JSON.parse(await readFile(path.join(apiDir, "full-data.json"), "utf8"));
  const zipIndex = JSON.parse(await readFile(path.join(apiDir, "zip-index.json"), "utf8"));

  // Create a map of Commune -> ZIP
  // Note: One commune can have multiple ZIPs, but usually it's one main one in this dataset.
  // We'll map by WilayaCode + CommuneNameAscii (normalized)
  const communeZipMap = new Map();
  for (const [zip, data] of Object.entries(zipIndex)) {
    const key = `${data.wilayaCode}-${slugify(data.communeName)}`;
    if (!communeZipMap.has(key)) {
      communeZipMap.set(key, zip);
    }
  }

  await mkdir(wilayasDir, { recursive: true });
  await mkdir(dairasDir, { recursive: true });

  const slugCount = new Map();
  for (const w of fullData) {
    for (const d of w.dairas ?? []) {
      const s = slugify(d.ascii);
      slugCount.set(s, (slugCount.get(s) ?? 0) + 1);
    }
  }

  const dairaIndex = [];
  let files = 0;

  await write(
    path.join(apiDir, "wilayas.json"),
    fullData.map((w) => ({ code: w.code, arabic: w.arabic, ascii: w.ascii })),
  );
  files += 1;

  for (const wilaya of fullData) {
    const dairas = wilaya.dairas ?? [];

    // Inject ZIPs into wilaya object
    const wilayaWithZips = {
      ...wilaya,
      dairas: dairas.map(d => ({
        ...d,
        communes: (d.communes ?? []).map(c => ({
          ...c,
          zip: communeZipMap.get(`${wilaya.code}-${slugify(c.ascii)}`) || null
        }))
      }))
    };

    await write(path.join(wilayasDir, `${wilaya.code}.json`), wilayaWithZips);

    await write(
      path.join(wilayasDir, `${wilaya.code}-dairas.json`),
      wilayaWithZips.dairas.map((d) => ({
        name_ar: d.arabic,
        name_ascii: d.ascii,
        slug: slugify(d.ascii),
        communes: d.communes.map((c) => ({ 
          name_ar: c.arabic, 
          name_ascii: c.ascii,
          zip: c.zip
        })),
      })),
    );

    await write(
      path.join(wilayasDir, String(wilaya.code), "dairas.json"),
      wilayaWithZips.dairas.map((d) => ({
        arabic: d.arabic,
        ascii: d.ascii,
        slug: slugify(d.ascii),
        communes: d.communes.length,
      })),
    );

    await write(
      path.join(wilayasDir, String(wilaya.code), "communes.json"),
      wilayaWithZips.dairas.flatMap((d) =>
        d.communes.map((c) => ({
          arabic: c.arabic,
          ascii: c.ascii,
          zip: c.zip,
          daira_ar: d.arabic,
          daira_ascii: d.ascii,
        })),
      ),
    );

    files += 4;

    for (const daira of wilayaWithZips.dairas) {
      const slug = slugify(daira.ascii);
      const payload = {
        wilaya_code: wilaya.code,
        wilaya_ar: wilaya.arabic,
        wilaya_ascii: wilaya.ascii,
        name_ar: daira.arabic,
        name_ascii: daira.ascii,
        slug,
        communes: daira.communes.map((c) => ({
          name_ar: c.arabic,
          name_ascii: c.ascii,
          zip: c.zip
        })),
      };

      await write(path.join(wilayasDir, String(wilaya.code), "dairas", `${slug}.json`), payload);
      await write(path.join(dairasDir, `${wilaya.code}-${slug}.json`), payload);
      files += 2;

      if (slugCount.get(slug) === 1) {
        await write(path.join(dairasDir, `${slug}.json`), payload);
        files += 1;
      }

      dairaIndex.push({
        wilaya_code: wilaya.code,
        slug,
        name_ar: daira.arabic,
        name_ascii: daira.ascii,
        communes: daira.communes.length,
      });
    }
  }

  await write(path.join(dairasDir, "index.json"), dairaIndex);
  files += 1;

  console.log(`Generated ${files} JSON files with ZIP support.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
