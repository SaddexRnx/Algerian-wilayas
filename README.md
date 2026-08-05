# 🇩🇿 DZ Address Picker v2.0.0

**The Ultimate Algerian Data Platform.** 
A free, high-performance, and plug-and-play solution for developers and e-commerce store owners. Access 69 wilayas, 1,541 communes, postal codes, logistics, demographics, and economy through trilingual static APIs.

---

## 🚀 Key Features

- **Cascading Selectors** — Professional UI components for Wilaya/Daira/Commune selection.
- **Trilingual Support** — Native Arabic (RTL), French, and English interfaces.
- **Logistics Engine** — Shipping rates, delivery zones, and pickup points for all 69 wilayas.
- **Geographic Data** — Full coordinates and interactive map integration.
- **Demographics & Economy** — Population stats, cost of living, and currency exchange rates.
- **Service Locator** — Map post offices, banks, and ATMs.
- **Smart Search** — Global fuzzy matching index for lightning-fast address lookups.
- **Multi-Format Exports** — Download datasets in CSV or SQL.
- **Zero Dependencies** — Lightweight, fast, and works everywhere.

---

## 📚 API Endpoints
The platform provides 30+ endpoints across 10 categories:

- **Admin Divisions:** `/api/wilayas.json`, `/api/full-data.json`
- **Language-Specific:** `/api/ar/`, `/api/latin/` trees
- **ZIP Lookup:** Reverse lookup via `/api/zip/{zipcode}.json`
- **Geographic:** `/api/coordinates/wilayas.json`
- **Logistics:** `/api/shipping/rates.json`, `/api/shipping/zones.json`
- **Demographics:** `/api/population/wilayas.json`
- **Economy:** `/api/economy/exchange-rates.json`
- **Services:** Post Office, Bank, and ATM locators
- **Travel:** `/api/travel/visa-requirements.json`
- **Export:** Downloadable CSV/SQL datasets

---

## 📦 Integration

### 🛠️ HTML / Vanilla JS
```html
<div class="dz-address-picker"></div>
<script src="https://dz-address-select.vercel.app/widget.js"></script>
```

### ⚛️ React / Next.js
```tsx
import { AlgeriaAddressPicker } from "dz-address-picker";

function App() {
  return (
    <AlgeriaAddressPicker 
      language="en"
      onUpdate={(data) => console.log(data)}
    />
  );
}
```

---

## 🌟 Support & Community

- **GitHub Repository:** [SaddexRnx/Algerian-wilayas](https://github.com/SaddexRnx/Algerian-wilayas)
- **Official Website:** [dz-address-select.vercel.app](https://dz-address-select.vercel.app)
- **Portfolio:** [SaddexRnx.github.io](https://SaddexRnx.github.io)
- **Telegram:** [@Saddex_x](https://t.me/Saddex_x)

---

## ⚖️ License
MIT Licensed. Built for the Algerian developer community.

