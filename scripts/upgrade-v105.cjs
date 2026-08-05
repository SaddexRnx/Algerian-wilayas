const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../public/api');
const BASE_DATA_PATH = path.join(API_DIR, 'full-data.json');
const GEOALGERIA_COMMUNES_PATH = '/tmp/geo-test/node_modules/geoalgeria/data/ecommerce/communes.json';

async function run() {
    console.log('Starting v1.0.5 Upgrade: Official Algérie Poste Integration...');

    if (!fs.existsSync(BASE_DATA_PATH)) {
        console.error('Base data not found at', BASE_DATA_PATH);
        return;
    }

    const fullData = JSON.parse(fs.readFileSync(BASE_DATA_PATH, 'utf8'));
    const officialData = JSON.parse(fs.readFileSync(GEOALGERIA_COMMUNES_PATH, 'utf8'));

    // Create a lookup for official postal codes
    // Key: WilayaCode_CommuneNameAscii (normalized)
    const officialLookup = {};
    officialData.forEach(item => {
        const key = `${item.wilaya_code}_${item.commune_name_fr.toLowerCase().trim()}`;
        officialLookup[key] = item.postal_code;
    });

    console.log(`Loaded ${fullData.length} wilayas and ${officialData.length} official records.`);

    // 1. Prepare directories
    const dirs = [
        'ar/wilayas', 'latin/wilayas', 'zip', 'wilayas'
    ];
    dirs.forEach(d => {
        const dirPath = path.join(API_DIR, d);
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    });

    const zipIndex = {};
    const wilayasAr = [];
    const wilayasLatin = [];
    const wilayasGeneral = [];

    // 2. Process and Merge
    fullData.forEach(w => {
        const wCode = w.code;
        const wAr = w.arabic;
        const wLat = w.ascii;

        wilayasGeneral.push({ code: wCode, arabic: wAr, ascii: wLat });
        wilayasAr.push({ code: wCode, name: wAr });
        wilayasLatin.push({ code: wCode, name: wLat });

        w.dairas.forEach(d => {
            const dSlug = d.slug || d.ascii.toLowerCase().replace(/[^a-z0-9]/g, '-');
            d.communes.forEach(c => {
                // Try matching by wilaya code and ASCII name
                const lookupKey = `${wCode}_${c.ascii.toLowerCase().trim()}`;
                if (officialLookup[lookupKey]) {
                    c.zip = officialLookup[lookupKey];
                }

                // Global ZIP index for reverse lookup
                if (c.zip) {
                    zipIndex[c.zip] = {
                        wilayaCode: wCode,
                        wilayaNameAr: wAr,
                        wilayaNameAscii: wLat,
                        dairaNameAr: d.arabic,
                        dairaNameAscii: d.ascii,
                        communeNameAr: c.arabic,
                        communeNameAscii: c.ascii,
                        zip: c.zip
                    };
                }
            });
        });

        // Save individual wilaya files
        fs.writeFileSync(path.join(API_DIR, 'wilayas', `${wCode}.json`), JSON.stringify(w));

        // Language-specific wilaya files
        const arWilaya = {
            code: wCode,
            name: wAr,
            dairas: w.dairas.map(d => ({
                name: d.arabic,
                slug: d.slug,
                communes: d.communes.map(c => ({ name: c.arabic, zip: c.zip }))
            }))
        };
        fs.writeFileSync(path.join(API_DIR, 'ar/wilayas', `${wCode}.json`), JSON.stringify(arWilaya));

        const latinWilaya = {
            code: wCode,
            name: wLat,
            dairas: w.dairas.map(d => ({
                name: d.ascii,
                slug: d.slug,
                communes: d.communes.map(c => ({ name: c.ascii, zip: c.zip }))
            }))
        };
        fs.writeFileSync(path.join(API_DIR, 'latin/wilayas', `${wCode}.json`), JSON.stringify(latinWilaya));

        // Daira lists
        const dairasDir = path.join(API_DIR, 'wilayas', String(wCode));
        if (!fs.existsSync(dairasDir)) fs.mkdirSync(dairasDir, { recursive: true });
        fs.writeFileSync(path.join(dairasDir, 'dairas.json'), JSON.stringify(w.dairas.map(d => ({
            slug: d.slug,
            nameAr: d.arabic,
            nameAscii: d.ascii
        }))));

        const arDairasDir = path.join(API_DIR, 'ar/wilayas', String(wCode));
        if (!fs.existsSync(arDairasDir)) fs.mkdirSync(arDairasDir, { recursive: true });
        fs.writeFileSync(path.join(arDairasDir, 'dairas.json'), JSON.stringify(w.dairas.map(d => ({ name: d.arabic, slug: d.slug }))));

        const latinDairasDir = path.join(API_DIR, 'latin/wilayas', String(wCode));
        if (!fs.existsSync(latinDairasDir)) fs.mkdirSync(latinDairasDir, { recursive: true });
        fs.writeFileSync(path.join(latinDairasDir, 'dairas.json'), JSON.stringify(w.dairas.map(d => ({ name: d.ascii, slug: d.slug }))));

        // Individual Daira files
        w.dairas.forEach(d => {
            const dSlug = d.slug || d.ascii.toLowerCase().replace(/[^a-z0-9]/g, '-');
            
            const dairaGeneral = {
                wilayaCode: wCode,
                wilayaNameAr: wAr,
                wilayaNameAscii: wLat,
                dairaNameAr: d.arabic,
                dairaNameAscii: d.ascii,
                communes: d.communes.map(c => ({ nameAr: c.arabic, nameAscii: c.ascii, zip: c.zip }))
            };
            const dairaCommunesDir = path.join(dairasDir, 'dairas');
            if (!fs.existsSync(dairaCommunesDir)) fs.mkdirSync(dairaCommunesDir, { recursive: true });
            fs.writeFileSync(path.join(dairaCommunesDir, `${dSlug}.json`), JSON.stringify(dairaGeneral));

            const arDaira = {
                wilaya_code: wCode,
                wilaya_name: wAr,
                daira_name: d.arabic,
                communes: d.communes.map(c => ({ name: c.arabic, zip: c.zip }))
            };
            const arDairaCommunesDir = path.join(arDairasDir, 'dairas');
            if (!fs.existsSync(arDairaCommunesDir)) fs.mkdirSync(arDairaCommunesDir, { recursive: true });
            fs.writeFileSync(path.join(arDairaCommunesDir, `${dSlug}.json`), JSON.stringify(arDaira));

            const latinDaira = {
                wilaya_code: wCode,
                wilaya_name: wLat,
                daira_name: d.ascii,
                communes: d.communes.map(c => ({ name: c.ascii, zip: c.zip }))
            };
            const latinDairaCommunesDirPath = path.join(latinDairasDir, 'dairas');
            // Wait, I need to make sure the dir exists
            const latinDairaCommunesDirPath = path.join(latinDairasDir, 'dairas');
            if (!fs.existsSync(latinDairaCommunesDirPath)) fs.mkdirSync(latinDairaCommunesDirPath, { recursive: true });
            fs.writeFileSync(path.join(latinDairaCommunesDirPath, `${dSlug}.json`), JSON.stringify(latinDaira));
        });
    });

    // 3. Save individual ZIP files
    Object.keys(zipIndex).forEach(zip => {
        fs.writeFileSync(path.join(API_DIR, 'zip', `${zip}.json`), JSON.stringify(zipIndex[zip]));
    });

    // 4. Save bulk files
    fs.writeFileSync(BASE_DATA_PATH, JSON.stringify(fullData));
    fs.writeFileSync(path.join(API_DIR, 'wilayas.json'), JSON.stringify(wilayasGeneral));
    fs.writeFileSync(path.join(API_DIR, 'ar/wilayas.json'), JSON.stringify(wilayasAr));
    fs.writeFileSync(path.join(API_DIR, 'latin/wilayas.json'), JSON.stringify(wilayasLatin));
    fs.writeFileSync(path.join(API_DIR, 'zip-index.json'), JSON.stringify(zipIndex));
    
    const fullDataAr = fullData.map(w => ({
        code: w.code,
        name: w.arabic,
        dairas: w.dairas.map(d => ({
            name: d.arabic,
            slug: d.slug,
            communes: d.communes.map(c => ({ name: c.arabic, zip: c.zip }))
        }))
    }));
    fs.writeFileSync(path.join(API_DIR, 'ar/full-data.json'), JSON.stringify(fullDataAr));

    const fullDataLatin = fullData.map(w => ({
        code: w.code,
        name: w.ascii,
        dairas: w.dairas.map(d => ({
            name: d.ascii,
            slug: d.slug,
            communes: d.communes.map(c => ({ name: c.ascii, zip: c.zip }))
        }))
    }));
    fs.writeFileSync(path.join(API_DIR, 'latin/full-data.json'), JSON.stringify(fullDataLatin));

    // 5. Update index.json
    const index = {
        version: "1.0.5",
        last_update: new Date().toISOString(),
        source: "Algérie Poste via GeoAlgeria",
        endpoints: [
            "/api/wilayas.json",
            "/api/full-data.json",
            "/api/wilayas/{code}.json",
            "/api/wilayas/{code}/dairas.json",
            "/api/wilayas/{code}/dairas/{slug}.json",
            "/api/zip/{zipcode}.json",
            "/api/ar/wilayas.json",
            "/api/ar/full-data.json",
            "/api/ar/wilayas/{code}.json",
            "/api/ar/wilayas/{code}/dairas.json",
            "/api/ar/wilayas/{code}/dairas/{slug}.json",
            "/api/latin/wilayas.json",
            "/api/latin/full-data.json",
            "/api/latin/wilayas/{code}.json",
            "/api/latin/wilayas/{code}/dairas.json",
            "/api/latin/wilayas/{code}/dairas/{slug}.json"
        ]
    };
    fs.writeFileSync(path.join(API_DIR, 'index.json'), JSON.stringify(index, null, 2));

    console.log('v1.0.5 Upgrade complete.');
}

run();
