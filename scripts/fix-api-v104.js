import fs from 'node:fs';
import path from 'node:path';

const API_DIR = path.join(process.cwd(), 'public', 'api');
const FULL_DATA_PATH = path.join(API_DIR, 'full-data.json');
const DZ_CITIES_RAW = path.join(process.cwd(), 'dzcities_raw.json');

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function run() {
  console.log("Starting regeneration of API files (v1.0.4)...");

  // 1. Load base dataset
  const baseData = JSON.parse(fs.readFileSync(FULL_DATA_PATH, 'utf8'));
  console.log(`Loaded base data with ${baseData.length} wilayas.`);

  // 2. Load ZIP data
  const zipRaw = JSON.parse(fs.readFileSync(DZ_CITIES_RAW, 'utf8'));
  console.log(`Loaded raw ZIP data with ${zipRaw.length} entries.`);

  // Create lookup for ZIP data: ascii_commune_name -> zipcode
  const zipLookup = new Map();
  for (const entry of zipRaw) {
    // entry format: { code: ZIP, w: wilayaCode, ar: nameAr, name: nameEn/Ascii }
    const name = entry.name.toLowerCase();
    zipLookup.set(name, String(entry.code).padStart(5, '0'));
  }

  // 3. Merge ZIP codes into base dataset
  const zipIndex = {};
  
  for (const wilaya of baseData) {
    for (const daira of (wilaya.dairas || [])) {
      for (const commune of (daira.communes || [])) {
        const lookupKey = commune.ascii.toLowerCase();
        const zip = zipLookup.get(lookupKey);
        if (zip) {
          commune.zip = zip;
          
          // Add to zipIndex
          const zipEntry = {
            zip: zip,
            wilayaCode: wilaya.code,
            wilayaNameAr: wilaya.arabic,
            wilayaNameAscii: wilaya.ascii,
            dairaNameAr: daira.arabic,
            dairaNameAscii: daira.ascii,
            communeNameAr: commune.arabic,
            communeNameAscii: commune.ascii
          };
          zipIndex[zip] = zipEntry;
        }
      }
    }
  }

  // 4. Generate all files
  const writeJson = (filePath, data) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data));
  };

  // Main files
  writeJson(path.join(API_DIR, 'full-data.json'), baseData);
  writeJson(path.join(API_DIR, 'wilayas.json'), baseData.map(w => ({ code: w.code, arabic: w.arabic, ascii: w.ascii })));
  writeJson(path.join(API_DIR, 'zip-index.json'), zipIndex);
  writeJson(path.join(API_DIR, 'index.json'), {
    version: "1.0.4",
    endpoints: [
      "/api/wilayas.json",
      "/api/full-data.json",
      "/api/wilayas/{code}.json",
      "/api/wilayas/{code}/dairas.json",
      "/api/wilayas/{code}/dairas/{slug}.json",
      "/api/zip/{zipcode}.json",
      "/api/ar/wilayas.json",
      "/api/fr/wilayas.json",
      "/api/en/wilayas.json"
    ]
  });

  // ZIP files
  const zipDir = path.join(API_DIR, 'zip');
  if (fs.existsSync(zipDir)) fs.rmSync(zipDir, { recursive: true, force: true });
  for (const zip in zipIndex) {
    writeJson(path.join(zipDir, `${zip}.json`), zipIndex[zip]);
  }

  // Language specific folders
  const arDir = path.join(API_DIR, 'ar');
  const frDir = path.join(API_DIR, 'fr');
  const enDir = path.join(API_DIR, 'en');

  writeJson(path.join(arDir, 'wilayas.json'), baseData.map(w => ({ code: w.code, name: w.arabic })));
  writeJson(path.join(frDir, 'wilayas.json'), baseData.map(w => ({ code: w.code, name: w.ascii })));
  writeJson(path.join(enDir, 'wilayas.json'), baseData.map(w => ({ code: w.code, name: w.ascii })));
  
  // Ar/Fr full-data
  writeJson(path.join(arDir, 'full-data.json'), baseData.map(w => ({
    code: w.code,
    name: w.arabic,
    dairas: (w.dairas || []).map(d => ({
      name: d.arabic,
      slug: slugify(d.ascii),
      communes: (d.communes || []).map(c => ({ name: c.arabic, zip: c.zip }))
    }))
  })));
  
  writeJson(path.join(frDir, 'full-data.json'), baseData.map(w => ({
    code: w.code,
    name: w.ascii,
    dairas: (w.dairas || []).map(d => ({
      name: d.ascii,
      slug: slugify(d.ascii),
      communes: (d.communes || []).map(c => ({ name: c.ascii, zip: c.zip }))
    }))
  })));
  
  writeJson(path.join(enDir, 'full-data.json'), baseData.map(w => ({
    code: w.code,
    name: w.ascii,
    dairas: (w.dairas || []).map(d => ({
      name: d.ascii,
      slug: slugify(d.ascii),
      communes: (d.communes || []).map(c => ({ name: c.ascii, zip: c.zip }))
    }))
  })));

  // Granular files
  const slugCount = new Map();
  for (const w of baseData) {
    for (const d of w.dairas ?? []) {
      const s = slugify(d.ascii);
      slugCount.set(s, (slugCount.get(s) ?? 0) + 1);
    }
  }

  for (const wilaya of baseData) {
    const code = wilaya.code;
    const dairas = wilaya.dairas ?? [];

    writeJson(path.join(API_DIR, 'wilayas', `${code}.json`), wilaya);
    
    writeJson(path.join(API_DIR, 'wilayas', `${code}-dairas.json`), dairas.map(d => ({
      name_ar: d.arabic,
      name_ascii: d.ascii,
      slug: slugify(d.ascii),
      communes: d.communes.map(c => ({ name_ar: c.arabic, name_ascii: c.ascii, zip: c.zip }))
    })));

    writeJson(path.join(API_DIR, 'wilayas', String(code), 'dairas.json'), dairas.map(d => ({
      arabic: d.arabic,
      ascii: d.ascii,
      slug: slugify(d.ascii),
      communes: d.communes.length
    })));

    writeJson(path.join(API_DIR, 'wilayas', String(code), 'communes.json'), dairas.flatMap(d => d.communes.map(c => ({
      arabic: c.arabic,
      ascii: c.ascii,
      zip: c.zip,
      daira_ar: d.arabic,
      daira_ascii: d.ascii
    }))));

    for (const daira of dairas) {
      const slug = slugify(daira.ascii);
      const payload = {
        wilaya_code: wilaya.code,
        wilaya_ar: wilaya.arabic,
        wilaya_ascii: wilaya.ascii,
        name_ar: daira.arabic,
        name_ascii: daira.ascii,
        slug,
        communes: daira.communes.map(c => ({
          name_ar: c.arabic,
          name_ascii: c.ascii,
          zip: c.zip
        }))
      };
      writeJson(path.join(API_DIR, 'wilayas', String(code), 'dairas', `${slug}.json`), payload);
      writeJson(path.join(API_DIR, 'dairas', `${code}-${slug}.json`), payload);
      if (slugCount.get(slug) === 1) {
        writeJson(path.join(API_DIR, 'dairas', `${slug}.json`), payload);
      }
    }
  }

  console.log("Regeneration complete.");
}

run().catch(console.error);
