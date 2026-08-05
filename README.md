# 🇩🇿 DZ Address Picker v2.0.0

**The Ultimate Algerian Data Platform.** 
A free, high-performance, and plug-and-play solution for developers and e-commerce store owners. Access all 69 wilayas, 1,541 communes, official postal codes, logistics, demographics, and economy indicators through professional trilingual APIs.

---

## 🚀 Key Features

- **Cascading Selectors** — Professional UI components for Wilaya/Daira/Commune selection with search.
- **Official ZIP Codes** — Integrated Algérie Poste dataset with global search and validation.
- **Trilingual & RTL** — First-class support for Arabic, French, and English (Right-to-Left optimized).
- **Logistics Engine** — Shipping rates, delivery zones, and pickup points for all 69 wilayas.
- **Geographic Data** — High-precision coordinates and interactive Leaflet map integration.
- **Demographics & Economy** — Population statistics, cost of living, and currency exchange rates.
- **Service Locator** — Map post offices, banks, and ATMs across the territory.
- **Smart Search** — Global fuzzy matching index for lightning-fast address lookups.
- **Multi-Format Exports** — Download granular datasets in CSV, SQL, or JSON formats.
- **Zero Dependencies** — Ultra-lightweight widget mode for any website.

---

## 📚 API Architecture

The platform provides a massive distributed API structure (2,000+ static files):

- **Core Divisions:** `/api/wilayas.json` (The base registry)
- **Language Trees:** 
  - `/api/ar/` — Full Arabic names and metadata
  - `/api/latin/` — French/English compatible latin names
- **ZIP System:** `/api/zip/{zipcode}.json` (Granular reverse lookup)
- **Logistics Engine:** `/api/shipping/rates.json`, `/api/shipping/zones.json`
- **Geographic Layer:** `/api/geo/wilayas.json`, `/api/geo/coordinates.json`
- **Utility Layer:** Banks, Post Offices, and ATMs by wilaya
- **Global Index:** `/api/index.json` (Full registry of all available endpoints)

---

## 📦 Integration Guides

### 🛠️ Vanilla JavaScript (One-Click)
Embed the address picker into any CMS or custom site using a single script:
```html
<div id="dz-address-widget"></div>
<script src="https://dz-address-select.vercel.app/widget.js"></script>
<script>
  window.dzAddressPicker.init({
    target: '#dz-address-widget',
    lang: 'ar',
    onUpdate: (data) => console.log('Selected:', data)
  });
</script>
```

### ⚛️ React / Next.js
Install via your favorite package manager and import the component:
```tsx
import { AlgeriaAddressPicker } from "dz-address-picker";

function App() {
  return (
    <AlgeriaAddressPicker 
      defaultLanguage="en"
      onUpdate={(data) => {
        const { wilaya, commune, zip } = data;
        console.log(`User is from ${commune}, ${wilaya} (${zip})`);
      }}
    />
  );
}
```

---

## 📊 Version History (Changelog)

- **v2.0.0 (Latest):** The "Mega Update". Added Logistics, Maps, Economy, Services, and trilingual Docs.
- **v1.0.5:** Integrated official Algérie Poste ZIP dataset (20,000+ entries).
- **v1.0.4:** Lightweight language-specific endpoints and ASCII matching fix.
- **v1.0.0:** Initial launch with 48 Wilayas and basic Commune support.

---

## 🌟 Support & Community

We are building a community-driven open-source project to empower Algerian digitalization.

- **🌐 Live Demo:** [dz-address-select.vercel.app](https://dz-address-select.vercel.app)
- **📁 Data Source:** [GitHub Repo](https://github.com/SaddexRnx/Algerian-wilayas)
- **💼 Developer:** [SaddexRnx (Sadek R.)](https://SaddexRnx.github.io)
- **📢 Updates:** [Telegram Channel](https://t.me/Saddex_x)

---

## ⚖️ License & Open Source
Licensed under the **MIT License**. This project belongs to the community. No attribution required for commercial use, but stars on GitHub are highly appreciated! ⭐️
