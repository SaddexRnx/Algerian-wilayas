const fs = require('fs');
const path = require('path');

const zoneMapping = {
  "North": [6, 15, 16, 18, 23, 31, 35, 42, 44, 48, 2, 9, 10, 13, 21, 22, 24, 25, 26, 27, 29, 30, 33, 34, 36, 38, 43, 46],
  "Highlands": [4, 5, 7, 12, 14, 17, 19, 20, 28, 39, 40, 41, 45, 11],
  "South": [1, 3, 8, 32, 37, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58]
};

const fullData = JSON.parse(fs.readFileSync('public/api/full-data.json', 'utf8'));

// 2.3 Delivery Coverage & Time Estimator
const coverage = fullData.map(w => ({
  wilaya_code: w.code,
  wilaya_name: w.ascii,
  covered: true,
  estimated_days: zoneMapping.North.includes(w.code) ? { min: 1, max: 2 } : 
                  zoneMapping.Highlands.includes(w.code) ? { min: 2, max: 4 } : { min: 4, max: 7 }
}));

coverage.forEach(c => {
  fs.writeFileSync(`public/api/shipping/coverage/${c.wilaya_code}.json`, JSON.stringify(c, null, 2));
});

// 2.4 Pickup Points (Beta - Data Pending)
fullData.forEach(w => {
  const pickupPoints = [
    {
      name: `${w.ascii} Main Office`,
      address: `Avenue de la République, ${w.ascii}`,
      lat: 36.0, 
      lng: 3.0,
      company: "Yalidine",
      hours: "08:00 - 17:00",
      status: "Beta - Data Pending"
    }
  ];
  fs.writeFileSync(`public/api/pickup-points/${w.code}.json`, JSON.stringify(pickupPoints, null, 2));
});

// 3.5 Border Wilayas
const borderWilayas = {
  "1": ["Mali"],
  "8": ["Morocco"],
  "11": ["Niger"],
  "12": ["Tunisia"],
  "33": ["Libya"],
  "37": ["Morocco", "Mauritania"],
  "45": ["Morocco"],
  "53": ["Morocco"],
  "54": ["Mali", "Niger"],
  "56": ["Libya"],
  "57": ["Morocco"],
  "63": ["Tunisia"],
  "64": ["Tunisia"]
};

Object.entries(borderWilayas).forEach(([code, countries]) => {
  fs.writeFileSync(`public/api/borders/${code}.json`, JSON.stringify({ wilaya_code: parseInt(code), neighbors: countries }, null, 2));
});

console.log("Part 1 Final API Generation Complete.");
