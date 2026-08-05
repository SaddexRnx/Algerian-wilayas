const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../public/api');
const BASE_DATA_PATH = path.join(API_DIR, 'full-data.json');

async function run() {
    console.log('Starting API fix and regeneration v1.0.4 (NESTED FIX)...');

    if (!fs.existsSync(BASE_DATA_PATH)) {
        console.error('Base data not found at', BASE_DATA_PATH);
        return;
    }

    const fullData = JSON.parse(fs.readFileSync(BASE_DATA_PATH, 'utf8'));
    console.log(`Loaded base data with ${fullData.length} wilayas.`);

    // 1. Prepare directories
    const arDir = path.join(API_DIR, 'ar');
    const latinDir = path.join(API_DIR, 'latin');
    const zipDir = path.join(API_DIR, 'zip');
    
    [arDir, latinDir, zipDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // 3. Generate Granular & Language-specific endpoints
    const zipIndex = {};
    const wilayasAr = [];
    const wilayasLatin = [];
    const wilayasGeneral = [];

    fullData.forEach(w => {
        const wCode = w.code;
        const wAr = w.arabic;
        const wLat = w.ascii;

        wilayasGeneral.push({ code: wCode, arabic: wAr, ascii: wLat });
        wilayasAr.push({ code: wCode, name: wAr });
        wilayasLatin.push({ code: wCode, name: wLat });

        // /api/wilayas/{code}.json
        fs.writeFileSync(path.join(API_DIR, 'wilayas', `${wCode}.json`), JSON.stringify(w));

        // /api/ar/wilayas/{code}.json
        const wArData = {
            code: wCode,
            name: wAr,
            dairas: w.dairas.map(d => ({
                name: d.arabic,
                slug: d.slug,
                communes: d.communes.map(c => ({ name: c.arabic, zip: c.zip }))
            }))
        };
        const arWilayasDir = path.join(arDir, 'wilayas');
        if (!fs.existsSync(arWilayasDir)) fs.mkdirSync(arWilayasDir, { recursive: true });
        fs.writeFileSync(path.join(arWilayasDir, `${wCode}.json`), JSON.stringify(wArData));

        // /api/latin/wilayas/{code}.json
        const wLatData = {
            code: wCode,
            name: wLat,
            dairas: w.dairas.map(d => ({
                name: d.ascii,
                slug: d.slug,
                communes: d.communes.map(c => ({ name: c.ascii, zip: c.zip }))
            }))
        };
        const latinWilayasDir = path.join(latinDir, 'wilayas');
        if (!fs.existsSync(latinWilayasDir)) fs.mkdirSync(latinWilayasDir, { recursive: true });
        fs.writeFileSync(path.join(latinWilayasDir, `${wCode}.json`), JSON.stringify(wLatData));

        // /api/wilayas/{code}/dairas.json
        const dairasDir = path.join(API_DIR, 'wilayas', String(wCode));
        if (!fs.existsSync(dairasDir)) fs.mkdirSync(dairasDir, { recursive: true });
        
        const dairasGeneral = w.dairas.map(d => ({
            slug: d.slug,
            nameAr: d.arabic,
            nameAscii: d.ascii
        }));
        fs.writeFileSync(path.join(dairasDir, 'dairas.json'), JSON.stringify(dairasGeneral));

        // /api/ar/wilayas/{code}/dairas.json
        const arDairasDir = path.join(arWilayasDir, String(wCode));
        if (!fs.existsSync(arDairasDir)) fs.mkdirSync(arDairasDir, { recursive: true });
        fs.writeFileSync(path.join(arDairasDir, 'dairas.json'), JSON.stringify(w.dairas.map(d => ({ name: d.arabic, slug: d.slug }))));

        // /api/latin/wilayas/{code}/dairas.json
        const latinDairasDir = path.join(latinWilayasDir, String(wCode));
        if (!fs.existsSync(latinDairasDir)) fs.mkdirSync(latinDairasDir, { recursive: true });
        fs.writeFileSync(path.join(latinDairasDir, 'dairas.json'), JSON.stringify(w.dairas.map(d => ({ name: d.ascii, slug: d.slug }))));

        w.dairas.forEach(d => {
            const dSlug = d.slug || d.ascii.toLowerCase().replace(/[^a-z0-9]/g, '-');
            
            // /api/wilayas/{code}/dairas/{slug}.json
            const dairaCommunesDir = path.join(dairasDir, 'dairas');
            if (!fs.existsSync(dairaCommunesDir)) fs.mkdirSync(dairaCommunesDir, { recursive: true });
            
            const dairaData = {
                wilayaCode: wCode,
                wilayaNameAr: wAr,
                wilayaNameAscii: wLat,
                dairaNameAr: d.arabic,
                dairaNameAscii: d.ascii,
                communes: d.communes.map(c => ({ nameAr: c.arabic, nameAscii: c.ascii, zip: c.zip }))
            };
            fs.writeFileSync(path.join(dairaCommunesDir, `${dSlug}.json`), JSON.stringify(dairaData));

            // /api/ar/wilayas/{code}/dairas/{slug}.json
            const arDairaCommunesDir = path.join(arDairasDir, 'dairas');
            if (!fs.existsSync(arDairaCommunesDir)) fs.mkdirSync(arDairaCommunesDir, { recursive: true });
            fs.writeFileSync(path.join(arDairaCommunesDir, `${dSlug}.json`), JSON.stringify({
                wilaya_code: wCode,
                wilaya_name: wAr,
                daira_name: d.arabic,
                communes: d.communes.map(c => ({ name: c.arabic, zip: c.zip }))
            }));

            // /api/latin/wilayas/{code}/dairas/{slug}.json
            const latinDairaCommunesDir = path.join(latinDairasDir, 'dairas');
            if (!fs.existsSync(latinDairaCommunesDir)) fs.mkdirSync(latinDairaCommunesDir, { recursive: true });
            fs.writeFileSync(path.join(latinDairaCommunesDir, `${dSlug}.json`), JSON.stringify({
                wilaya_code: wCode,
                wilaya_name: wLat,
                daira_name: d.ascii,
                communes: d.communes.map(c => ({ name: c.ascii, zip: c.zip }))
            }));

            d.communes.forEach(c => {
                if (c.zip) {
                    const zData = {
                        zip: c.zip,
                        wilayaCode: wCode,
                        wilayaNameAr: wAr,
                        wilayaNameAscii: wLat,
                        dairaNameAr: d.arabic,
                        dairaNameAscii: d.ascii,
                        communeNameAr: c.arabic,
                        communeNameAscii: c.ascii
                    };
                    fs.writeFileSync(path.join(zipDir, `${c.zip}.json`), JSON.stringify(zData));
                    zipIndex[c.zip] = {
                        wilayaCode: wCode,
                        dairaName: d.ascii,
                        communeName: c.ascii,
                        zip: c.zip
                    };
                }
            });
        });
    });

    // 4. Save bulk files
    fs.writeFileSync(path.join(API_DIR, 'wilayas.json'), JSON.stringify(wilayasGeneral));
    fs.writeFileSync(path.join(arDir, 'wilayas.json'), JSON.stringify(wilayasAr));
    fs.writeFileSync(path.join(latinDir, 'wilayas.json'), JSON.stringify(wilayasLatin));
    fs.writeFileSync(path.join(API_DIR, 'zip-index.json'), JSON.stringify(zipIndex));
    
    // Arabic/Latin full-data
    const fullDataAr = fullData.map(w => ({
        code: w.code,
        name: w.arabic,
        dairas: w.dairas.map(d => ({
            name: d.arabic,
            slug: d.slug,
            communes: d.communes.map(c => ({ name: c.arabic, zip: c.zip }))
        }))
    }));
    fs.writeFileSync(path.join(arDir, 'full-data.json'), JSON.stringify(fullDataAr));

    const fullDataLatin = fullData.map(w => ({
        code: w.code,
        name: w.ascii,
        dairas: w.dairas.map(d => ({
            name: d.ascii,
            slug: d.slug,
            communes: d.communes.map(c => ({ name: c.ascii, zip: c.zip }))
        }))
    }));
    fs.writeFileSync(path.join(latinDir, 'full-data.json'), JSON.stringify(fullDataLatin));

    // 5. Update index.json
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

    console.log('Regeneration complete.');
}

run();
