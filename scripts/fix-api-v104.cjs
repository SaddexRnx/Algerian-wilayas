const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../public/api');
const BASE_DATA_PATH = path.join(__dirname, '../public/api/full-data.json'); // Hopefully uncorrupted or we fix it

// If full-data.json is suspected corrupted, we should have a backup or a way to rebuild.
// Based on the prompt, the "base dataset" is the source of truth.
// I will read full-data.json and verify if it has 69 wilayas.

async function run() {
    console.log('Starting API fix and regeneration v1.0.4...');

    if (!fs.existsSync(BASE_DATA_PATH)) {
        console.error('Base data not found at', BASE_DATA_PATH);
        return;
    }

    const fullData = JSON.parse(fs.readFileSync(BASE_DATA_PATH, 'utf8'));
    console.log(`Loaded base data with ${fullData.length} wilayas.`);

    if (fullData.length !== 69) {
        console.warn(`Warning: Expected 69 wilayas, found ${fullData.length}.`);
    }

    // Task 1: Fix ZIP 19070 mapping
    // "19070" -> Commune: Boussellam, Daira: Bouandas, Wilaya: Setif (19)
    // Let's find Wilaya 19
    const setif = fullData.find(w => w.code === 19);
    if (setif) {
        const bouandas = setif.dairas.find(d => d.ascii === 'Bouandas' || d.arabic === 'بوعنداس');
        if (bouandas) {
            const boussellam = bouandas.communes.find(c => c.ascii === 'Boussellam' || c.arabic === 'بوسلام');
            if (boussellam) {
                boussellam.zip = '19070';
                console.log('Fixed ZIP 19070 mapping to Boussellam.');
            }
        }
    }

    // Task 2: Language-specific endpoints (Arabic & Latin)
    // Paths: /api/ar/wilayas.json, /api/latin/wilayas.json, etc.
    const arDir = path.join(API_DIR, 'ar');
    const latinDir = path.join(API_DIR, 'latin');
    if (!fs.existsSync(arDir)) fs.mkdirSync(arDir, { recursive: true });
    if (!fs.existsSync(latinDir)) fs.mkdirSync(latinDir, { recursive: true });

    // /api/ar/wilayas.json & /api/latin/wilayas.json
    const wilayasAr = fullData.map(w => ({ code: w.code, name: w.arabic }));
    const wilayasLatin = fullData.map(w => ({ code: w.code, name: w.ascii }));
    fs.writeFileSync(path.join(arDir, 'wilayas.json'), JSON.stringify(wilayasAr));
    fs.writeFileSync(path.join(latinDir, 'wilayas.json'), JSON.stringify(wilayasLatin));

    // /api/ar/full-data.json & /api/latin/full-data.json
    const fullDataAr = fullData.map(w => ({
        code: w.code,
        name: w.arabic,
        dairas: w.dairas.map(d => ({
            name: d.arabic,
            communes: d.communes.map(c => ({ name: c.arabic, zip: c.zip }))
        }))
    }));
    const fullDataLatin = fullData.map(w => ({
        code: w.code,
        name: w.ascii,
        dairas: w.dairas.map(d => ({
            name: d.ascii,
            communes: d.communes.map(c => ({ name: c.ascii, zip: c.zip }))
        }))
    }));
    fs.writeFileSync(path.join(arDir, 'full-data.json'), JSON.stringify(fullDataAr));
    fs.writeFileSync(path.join(latinDir, 'full-data.json'), JSON.stringify(fullDataLatin));

    // Task 3: Fix api/index.json
    const index = {
        version: "1.0.4",
        endpoints: [
            "/api/wilayas.json",
            "/api/full-data.json",
            "/api/wilayas/{code}.json",
            "/api/wilayas/{code}/dairas.json",
            "/api/wilayas/{code}/dairas/{slug}.json",
            "/api/zip/{zipcode}.json",
            "/api/ar/wilayas.json",
            "/api/latin/wilayas.json"
        ]
    };
    fs.writeFileSync(path.join(API_DIR, 'index.json'), JSON.stringify(index, null, 2));

    // Task 4: Regenerate zip lookups
    const zipDir = path.join(API_DIR, 'zip');
    if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir, { recursive: true });

    const zipIndex = {};
    fullData.forEach(w => {
        w.dairas.forEach(d => {
            d.communes.forEach(c => {
                if (c.zip) {
                    const zipData = {
                        zip: c.zip,
                        wilayaCode: w.code,
                        wilayaNameAr: w.arabic,
                        wilayaNameAscii: w.ascii,
                        dairaNameAr: d.arabic,
                        dairaNameAscii: d.ascii,
                        communeNameAr: c.arabic,
                        communeNameAscii: c.ascii
                    };
                    fs.writeFileSync(path.join(zipDir, `${c.zip}.json`), JSON.stringify(zipData));
                    zipIndex[c.zip] = {
                        wilayaCode: w.code,
                        dairaName: d.ascii,
                        communeName: c.ascii,
                        zip: c.zip
                    };
                }
            });
        });
    });
    fs.writeFileSync(path.join(API_DIR, 'zip-index.json'), JSON.stringify(zipIndex));

    // Regenerate wilayas.json (the general one)
    const wilayasGeneral = fullData.map(w => ({
        code: w.code,
        arabic: w.arabic,
        ascii: w.ascii
    }));
    fs.writeFileSync(path.join(API_DIR, 'wilayas.json'), JSON.stringify(wilayasGeneral));

    // Update full-data.json with fixed ZIPs
    fs.writeFileSync(BASE_DATA_PATH, JSON.stringify(fullData));

    console.log('Regeneration complete.');
}

run();
