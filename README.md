# DZ Address Picker v1.0.4

**A free, blazing-fast, plug-and-play Algerian address system — 69 Wilayas, all Dairas and 1,541 Communes — as a static JSON API, an embeddable widget and a React component.**

DZ Address Picker provides official administrative Algerian addresses (Arabic & Latin) through high-performance static JSON endpoints. It is designed to be a plug-and-play solution for developers and e-commerce store owners.

---

## Features

- 🚀 **Blazing Fast** — Served via CDN-friendly static JSON endpoints (~2,000 files).
- 🌍 **Works Everywhere** — Ready-to-use snippets for Vanilla JS, React, Vue, WordPress, Shopify, and more.
- 🔄 **Always Up to Date** — Community-driven data corrections and updated postal records.
- 🎨 **Minimalist Design** — Strict monochrome (B&W) UI that fits any brand.
- 📱 **Fully Responsive** — Works perfectly on mobile and desktop.
- ♿ **Accessible** — Full keyboard navigation and ARIA compliance.
- 📦 **Offline Fallback** — Advanced client-side caching (6h TTL) with service worker support.

---

## API Documentation

Base URL: `https://dz-address-select.vercel.app/api`

### Granular Endpoints

| Endpoint | Description |
| :--- | :--- |
| `GET /wilayas.json` | List of all 69 wilayas (code, nameAr, nameAscii). |
| `GET /ar/wilayas.json` | Arabic-only list of all wilayas. |
| `GET /latin/wilayas.json` | Latin-only list of all wilayas. |
| `GET /wilayas/{code}.json` | Single wilaya data with all nested dairas and communes. |
| `GET /wilayas/{code}/dairas/{daira-slug}.json` | Communes for a specific daira. |
| `GET /zip/{zipcode}.json` | Reverse lookup for a 5-digit postal code. |

*Full endpoint registry available at `/api/index.json`.*

---

## Integration

### 1. Script Tag (Vanilla JS)

Add the following to your HTML to mount the picker into any element with the `dz-address-picker` class:

```html
<div class="dz-address-picker"></div>
<script src="https://dz-address-select.vercel.app/widget.js"></script>
```

### 2. React

```tsx
import { AlgeriaAddressPicker } from "@/components/AlgeriaAddressPicker";

function MyForm() {
  return (
    <AlgeriaAddressPicker 
      onUpdate={(data) => console.log(data)} 
    />
  );
}
```

---

## Changelog

### v1.0.4
- **Fresh Data**: Sourced more accurate postal code data.
- **Improved Tester**: Dynamic input fields in the API Tester based on endpoint parameters.
- **Expanded API**: Full `/api/ar/` and `/api/latin/` trees including all dairas and communes.
- **Bug Fixes**: Corrected ZIP 19070 mapping (Boussellam), fixed hardcoded version displays.
- **Documentation**: Completely overhauled README and API index.

---

## Contributing

Data accuracy is our priority. If you find incorrect Commune names or ZIP codes:
1. Open an issue on GitHub.
2. Use the "Report Incorrect Data" feature on the live site.
3. Reach out on Telegram.

---

## Contact & Links

- **Telegram:** [@Saddex_x](https://t.me/Saddex_x)
- **Portfolio:** [SaddexRnx.github.io](https://SaddexRnx.github.io)
- **Live Demo:** [dz-address-select.vercel.app](https://dz-address-select.vercel.app)

Built for the Algerian developer community. MIT Licensed.
