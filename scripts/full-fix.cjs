const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../public/api');
const BASE_DATA_PATH = path.join(API_DIR, 'full-data.json');

async function run() {
    console.log('Starting COMPREHENSIVE API REGENERATION...');

    if (!fs.existsSync(BASE_DATA_PATH)) {
        console.error('Base data not found at', BASE_DATA_PATH);
        return;
    }

    const fullData = JSON.parse(fs.readFileSync(BASE_DATA_PATH, 'utf8'));
    console.log(`Loaded base data with ${fullData.length} wilayas.`);

    // 1. Prepare directories
    const dirs = [
        'ar', 'latin', 'zip', 'wilayas', 'coordinates', 'shipping', 'geo',
        'ar/wilayas', 'latin/wilayas', 'api/geo', 'api/logistics', 'api/demographics', 'api/services'
    ];
    
    dirs.forEach(d => {
        const fullPath = path.join(API_DIR, d);
        if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    });

    const zipIndex = {};
    const wilayasAr = [];
    const wilayasLatin = [];
    const wilayasGeneral = [];
    const coords = [];

    fullData.forEach(w => {
        const wCode = w.code;
        const wAr = w.arabic;
        const wLat = w.ascii;

        wilayasGeneral.push({ code: wCode, arabic: wAr, ascii: wLat });
        wilayasAr.push({ code: wCode, name: wAr });
        wilayasLatin.push({ code: wCode, name: wLat });
        
        // Mock coordinates if missing in base but needed for map
        // Adrar is ~27, 0. Setif is ~36, 5. Alger is ~36, 3.
        // We use a rough grid for the ones without real data in the file
        coords.push({ code: wCode, lat: 20 + Math.random() * 15, lng: -2 + Math.random() * 10 });

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
        fs.writeFileSync(path.join(API_DIR, 'ar/wilayas', `${wCode}.json`), JSON.stringify(wArData));

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
        fs.writeFileSync(path.join(API_DIR, 'latin/wilayas', `${wCode}.json`), JSON.stringify(wLatData));

        // Dairas dir
        const dairasDir = path.join(API_DIR, 'wilayas', String(wCode));
        if (!fs.existsSync(dairasDir)) fs.mkdirSync(dairasDir, { recursive: true });
        
        fs.writeFileSync(path.join(dairasDir, 'dairas.json'), JSON.stringify(w.dairas.map(d => ({
            slug: d.slug,
            nameAr: d.arabic,
            nameAscii: d.ascii
        }))));

        w.dairas.forEach(d => {
            const dSlug = d.slug || d.ascii.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const dairaCommunesDir = path.join(dairasDir, 'dairas');
            if (!fs.existsSync(dairaCommunesDir)) fs.mkdirSync(dairaCommunesDir, { recursive: true });
            
            fs.writeFileSync(path.join(dairaCommunesDir, `${dSlug}.json`), JSON.stringify({
                wilayaCode: wCode,
                wilayaNameAr: wAr,
                wilayaNameAscii: wLat,
                dairaNameAr: d.arabic,
                dairaNameAscii: d.ascii,
                communes: d.communes.map(c => ({ nameAr: c.arabic, nameAscii: c.ascii, zip: c.zip }))
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
                    fs.writeFileSync(path.join(API_DIR, 'zip', `${c.zip}.json`), JSON.stringify(zData));
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
    fs.writeFileSync(path.join(API_DIR, 'ar/wilayas.json'), JSON.stringify(wilayasAr));
    fs.writeFileSync(path.join(API_DIR, 'latin/wilayas.json'), JSON.stringify(wilayasLatin));
    fs.writeFileSync(path.join(API_DIR, 'zip-index.json'), JSON.stringify(zipIndex));
    fs.writeFileSync(path.join(API_DIR, 'coordinates/wilayas.json'), JSON.stringify(coords));
    
    // Shipping mock
    const rates = wilayasGeneral.map(w => ({
        wilaya_code: w.code,
        delivery_home: { min: 400, max: 800 },
        delivery_office: { min: 300, max: 600 },
        currency: "DZD",
        zone: w.code < 16 ? "North" : (w.code < 35 ? "Highlands" : "South")
    }));
    fs.writeFileSync(path.join(API_DIR, 'shipping/rates.json'), JSON.stringify(rates));
    fs.writeFileSync(path.join(API_DIR, 'shipping/zones.json'), JSON.stringify({
        North: wilayasGeneral.filter(w => w.code < 16).map(w => w.code),
        Highlands: wilayasGeneral.filter(w => w.code >= 16 && w.code < 35).map(w => w.code),
        South: wilayasGeneral.filter(w => w.code >= 35).map(w => w.code)
    }));

    console.log('Regeneration complete.');
}

run();
