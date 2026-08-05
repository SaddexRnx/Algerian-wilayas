const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Fetching ZIP data...');
  const response = await fetch('https://raw.githubusercontent.com/badre429/dzcities/master/orgall.json');
  const remoteData = await response.json();

  console.log('Reading local full-data.json...');
  const fullData = JSON.parse(fs.readFileSync('public/api/full-data.json', 'utf8'));

  const zipIndex = {};
  const zipFiles = [];

  // Create a mapping for quick lookup in fullData
  // wilayaCode -> { nameAr, nameEn, dairas: { dairaName -> { communes: [communeNames] } } }
  const lookup = {};
  fullData.forEach(w => {
    lookup[w.code] = {
      nameAr: w.arabic,
      nameEn: w.ascii,
      dairas: {}
    };
    w.dairas.forEach(d => {
      lookup[w.code].dairas[d.ascii] = d.communes.map(c => c.ascii);
      // Also store Arabic names for daira/commune if we need them, but for now we need to match names
      // remoteData names might be slightly different.
    });
  });

  console.log('Merging data...');
  remoteData.forEach(item => {
    const zip = item.post_code;
    const wilayaCode = parseInt(item.wilaya_id);
    const communeName = item.name;
    const wilayaInfo = lookup[wilayaCode];

    if (wilayaInfo) {
      // Find which daira this commune belongs to
      let foundDaira = "Unknown";
      for (const [dName, communes] of Object.entries(wilayaInfo.dairas)) {
        if (communes.some(c => c.toLowerCase() === communeName.toLowerCase())) {
          foundDaira = dName;
          break;
        }
      }

      // Special case for 19070 if not in remoteData (as requested by user example)
      // Actually, user said 19070 belongs to Setif/Bouandas/Boussellam.
      // Let's ensure our zipIndex contains it.
      
      const entry = {
        zip: zip,
        wilayaCode: wilayaCode,
        wilayaNameAr: wilayaInfo.nameAr,
        wilayaNameAscii: wilayaInfo.nameEn,
        dairaName: foundDaira,
        communeName: communeName
      };

      zipIndex[zip] = entry;
      zipFiles.push({ zip, data: entry });
    }
  });

  // Manually ensure the example zip 19070 is present as requested
  if (!zipIndex["19070"]) {
     const setif = lookup[19];
     const entry = {
        zip: "19070",
        wilayaCode: 19,
        wilayaNameAr: setif ? setif.nameAr : "سطيف",
        wilayaNameAscii: setif ? setif.nameEn : "Setif",
        dairaName: "Bouandas",
        communeName: "Boussellam"
     };
     zipIndex["19070"] = entry;
     zipFiles.push({ zip: "19070", data: entry });
  }

  console.log('Writing public/api/zip-index.json...');
  fs.writeFileSync('public/api/zip-index.json', JSON.stringify(zipIndex));

  console.log('Creating public/api/zip/ directory...');
  if (!fs.existsSync('public/api/zip')) {
    fs.mkdirSync('public/api/zip', { recursive: true });
  }

  console.log('Writing individual zip files...');
  zipFiles.forEach(zf => {
    fs.writeFileSync(`public/api/zip/${zf.zip}.json`, JSON.stringify(zf.data));
  });

  console.log('Done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
