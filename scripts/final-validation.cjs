const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../public/api');

const check = (p, label) => {
    const fullPath = path.join(API_DIR, p);
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ ${label} (${p}): Missing`);
        return false;
    }
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        JSON.parse(content);
        console.log(`✅ ${label} (${p}): Valid`);
        return true;
    } catch (e) {
        console.log(`❌ ${label} (${p}): Invalid JSON (${e.message})`);
        return false;
    }
};

console.log('--- Critical Endpoints ---');
check('wilayas.json', 'Wilayas List');
check('wilayas/19.json', 'Setif Detail');
check('wilayas/19/dairas.json', 'Setif Dairas');
check('wilayas/19/dairas/bouandas.json', 'Bouandas Communes');
check('full-data.json', 'Full Data');
check('ar/wilayas.json', 'Arabic Wilayas');
check('latin/wilayas.json', 'Latin Wilayas');
check('zip/19070.json', 'ZIP 19070');
check('shipping/rates.json', 'Shipping Rates');
check('geo/wilayas.json', 'Geo Wilayas');
check('coordinates/wilayas.json', 'Coordinates');
check('population/wilayas.json', 'Population');
check('economy/exchange-rates.json', 'Exchange Rates');
check('travel/visa-requirements.json', 'Visa Requirements');
check('versions.json', 'Versions');

console.log('\n--- Data Accuracy Spot Check ---');
try {
    const zip19070 = JSON.parse(fs.readFileSync(path.join(API_DIR, 'zip/19070.json'), 'utf8'));
    if (zip19070.communeNameAr === 'بوسلام' || zip19070.communeNameAscii === 'Bousselam' || zip19070.communeName === 'Bousselam') {
        console.log('✅ ZIP 19070 maps correctly to Boussellam');
    } else {
        console.log(`❌ ZIP 19070 maps to incorrect commune: ${zip19070.communeNameAscii || zip19070.communeName}`);
    }
} catch (e) {
    console.log('❌ Failed to spot check ZIP 19070');
}

