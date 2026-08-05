import fs from 'fs';
import path from 'path';

async function run() {
  console.log("Processing ZIP data from local file...");
  const zipRaw = JSON.parse(fs.readFileSync('dzcities_raw.json', 'utf8'));

  // Load existing wilayas to get correct names
  const wilayasRaw = JSON.parse(fs.readFileSync('public/api/wilayas.json', 'utf8'));
  
  const zipIndex = {};
  const wilayaMap = {}; // code -> wilaya data

  // Normalize existing data for merging
  for (const w of wilayasRaw) {
    const fullWilaya = JSON.parse(fs.readFileSync(`public/api/wilayas/${w.code}.json`, 'utf8'));
    wilayaMap[w.code] = fullWilaya;
  }

  // Iterate over zipRaw (external data)
  for (const entry of zipRaw) {
    const wilayaCode = parseInt(entry.wilaya_code);
    const dairaAscii = entry.daira_name_ascii;
    const communeAscii = entry.commune_name_ascii;
    const zip = entry.post_code;

    if (!wilayaMap[wilayaCode]) continue;

    const wilaya = wilayaMap[wilayaCode];
    // Find daira by ASCII name
    const daira = wilaya.dairas.find(d => d.ascii.toLowerCase() === dairaAscii.toLowerCase());
    if (daira) {
      // Find commune by ASCII name
      const commune = daira.communes.find(c => c.ascii.toLowerCase() === communeAscii.toLowerCase());
      if (commune) {
        commune.zip = zip;
        // Update individual zip file
        const zipFile = {
          zip,
          wilayaCode: wilaya.code,
          wilayaName: wilaya.ascii,
          wilayaNameAr: wilaya.arabic,
          dairaName: daira.ascii,
          dairaNameAr: daira.arabic,
          communeName: commune.ascii,
          communeNameAr: commune.arabic
        };
        zipIndex[zip] = zipFile;
        
        const zipDir = 'public/api/zip';
        if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir, { recursive: true });
        fs.writeFileSync(path.join(zipDir, `${zip}.json`), JSON.stringify(zipFile, null, 2));
      }
    }
  }

  // Write updated wilaya/daira files
  for (const code in wilayaMap) {
    const wilaya = wilayaMap[code];
    fs.writeFileSync(`public/api/wilayas/${code}.json`, JSON.stringify(wilaya, null, 2));
    
    // Also update dairas-flat file if it exists
    const dairaFlatPath = `public/api/wilayas/${code}-dairas.json`;
    if (fs.existsSync(dairaFlatPath)) {
      const flatDairas = wilaya.dairas.map(d => ({
        arabic: d.arabic,
        ascii: d.ascii,
        slug: d.slug,
        communes: d.communes.map(c => ({
          arabic: c.arabic,
          ascii: c.ascii,
          zip: c.zip
        }))
      }));
      fs.writeFileSync(dairaFlatPath, JSON.stringify(flatDairas, null, 2));
    }
  }

  fs.writeFileSync('public/api/zip-index.json', JSON.stringify(zipIndex, null, 2));
  console.log("Data merging complete.");
}

run().catch(console.error);
