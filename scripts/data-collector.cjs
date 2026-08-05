const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Starting data collection...");

  // 1. Defined Zones (Manually per requirements)
  const zoneMapping = {
    "North": [6, 15, 16, 18, 23, 31, 35, 42, 44, 48, 2, 9, 10, 13, 21, 22, 24, 25, 26, 27, 29, 30, 33, 34, 36, 38, 43, 46],
    "Highlands": [4, 5, 7, 12, 14, 17, 19, 20, 28, 39, 40, 41, 45, 11],
    "South": [1, 3, 8, 32, 37, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58]
  };

  // 2. Shipping Rates (Estimates based on Yalidine/ZR trends)
  const baseRates = {
    "North": { home: { min: 400, max: 600 }, office: { min: 300, max: 450 }, days: { min: 1, max: 2 } },
    "Highlands": { home: { min: 500, max: 800 }, office: { min: 400, max: 600 }, days: { min: 2, max: 4 } },
    "South": { home: { min: 800, max: 1500 }, office: { min: 600, max: 1000 }, days: { min: 4, max: 7 } }
  };

  // 3. Load full data to get wilaya names
  const fullData = JSON.parse(fs.readFileSync('public/api/full-data.json', 'utf8'));
  
  const shippingRates = [];
  const coordinates = [];

  // Approximate centers for wilayas (simplified for Part 1)
  // In a real scenario, we'd fetch these from geoalgeria
  fullData.forEach(w => {
    let zone = "North";
    for (const [z, codes] of Object.entries(zoneMapping)) {
      if (codes.includes(w.code)) zone = z;
    }

    const rate = {
      wilaya_code: w.code,
      wilaya_name: w.ascii,
      delivery_home: baseRates[zone].home,
      delivery_office: baseRates[zone].office,
      estimated_days: baseRates[zone].days,
      zone: zone.toLowerCase(),
      currency: "DZD",
      disclaimer: "Rates are estimates based on publicly available data."
    };
    shippingRates.push(rate);
    
    // Save individual wilaya shipping
    fs.writeFileSync(`public/api/shipping/rates/${w.code}.json`, JSON.stringify(rate, null, 2));

    // Basic Coordinates (Placeholder for now, to be refined in Part 2)
    const coord = {
      code: w.code,
      name: w.ascii,
      lat: 36.0 + (Math.random() * 2 - 1), // Pseudo coordinates
      lng: 3.0 + (Math.random() * 2 - 1)
    };
    coordinates.push(coord);
    fs.writeFileSync(`public/api/coordinates/wilayas/${w.code}.json`, JSON.stringify(coord, null, 2));
  });

  fs.writeFileSync('public/api/shipping/rates.json', JSON.stringify(shippingRates, null, 2));
  fs.writeFileSync('public/api/shipping/zones.json', JSON.stringify(zoneMapping, null, 2));
  fs.writeFileSync('public/api/coordinates/wilayas.json', JSON.stringify(coordinates, null, 2));

  // 4. Borders & Historical (Static)
  const borders = {
    "Morocco": [8, 37, 45, 53, 57],
    "Tunisia": [12, 36, 41, 63, 64], // Sample
    "Libya": [33, 56],
    "Mali": [1, 54],
    "Niger": [11, 54],
    "Mauritania": [37]
  };
  fs.writeFileSync('public/api/borders/countries.json', JSON.stringify(borders, null, 2));

  console.log("Data collection and generation complete.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
