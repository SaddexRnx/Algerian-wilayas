# 🇩🇿 DZ Address Picker v2.0.0

**The Ultimate Algerian Data Platform.** 
A free, high-performance, and plug-and-play solution for developers and e-commerce store owners. Access 69 wilayas, 1,541 communes, postal codes, logistics, demographics, and economy through trilingual static APIs.

---

## 🚀 What's New in v2.0.0
- **Logistics Engine** — Shipping rates, delivery zones, and pickup points for all 69 wilayas.
- **Geographic Data** — Full wilaya coordinates and interactive Leaflet map integration.
- **Demographics** — Population statistics, density, and growth data.
- **Economic Indicators** — Cost of living estimates and live currency exchange rates.
- **Service Locator** — Post offices, Banks, ATMs, and Healthcare facilities map.
- **Travel Utilities** — Visa requirements and travel information.
- **Smart Search** — Global fuzzy matching index for lightning-fast address lookups.
- **Multi-Format Exports** — Download datasets in CSV or SQL formats.

---

## 📚 API Categories (10 Total)
Access 30+ new endpoints across these categories:

1. **Admin Divisions** — `/api/wilayas.json`, `/api/full-data.json`
2. **Language-Specific** — `/api/ar/`, `/api/latin/` trees
3. **ZIP Lookup** — Reverse lookup via `/api/zip/{zipcode}.json`
4. **Geographic** — `/api/coordinates/wilayas.json`
5. **Logistics** — `/api/shipping/rates.json`, `/api/shipping/zones.json`
6. **Demographics** — `/api/population/wilayas.json`
7. **Economy** — `/api/economy/cost-of-living/`, `/api/economy/exchange-rates.json`
8. **Services** — Post Office, Bank, and ATM locators
9. **Travel** — `/api/travel/visa-requirements.json`
10. **Export** — Downloadable CSV/SQL full datasets

---

## 📦 Integration

### ⚛️ React
```tsx
import { AlgeriaAddressPicker } from "dz-address-picker";

function App() {
  return (
    <AlgeriaAddressPicker 
      onUpdate={(address) => console.log(address)}
      language="en"
    />
  );
}
```

### 🛠️ Script Tag (Vanilla JS)
```html
<div class="dz-address-picker"></div>
<script src="https://dz-address-select.vercel.app/widget.js"></script>
```

---

## 🌟 Support & Community

- **GitHub Star:** [SaddexRnx/Algerian-wilayas](https://github.com/SaddexRnx/Algerian-wilayas)
- **Portfolio:** [SaddexRnx.github.io](https://SaddexRnx.github.io)
- **Telegram:** [@Saddex_x](https://t.me/Saddex_x)

*Thank you to all developers using this API. More updates are coming!*

---

## ⚖️ License
MIT Licensed. Built for the Algerian developer community.
