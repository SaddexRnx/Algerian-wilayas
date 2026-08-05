# DZ Address Picker v1.0.4

**A free, blazing-fast, plug-and-play Algerian address system — 69 Wilayas, all Dairas and 1,541 Communes — as a static JSON API, an embeddable widget and a React component.**

DZ Address Picker provides official administrative Algerian addresses (Arabic & Latin) through high-performance static JSON endpoints. It is designed to be a plug-and-play solution for developers and e-commerce store owners.

---

## 🚀 Key Features

- **Blazing Fast** — Served via global CDN-friendly static JSON endpoints (~2,000 files).
- **Multi-Language** — Optimized `/api/ar/` and `/api/latin/` trees for lightweight localized payloads.
- **Granular Access** — Fetch only what you need (e.g., specific daira communes) to save bandwidth.
- **ZIP Reverse Lookup** — Get full address details from a 5-digit postal code instantly.
- **Framework Agnostic** — Ready-to-use snippets for Vanilla JS, React, Vue, WordPress, Shopify, and more.
- **Zero Dependencies** — No bulky libraries or server-side requirements.

---

## 📚 API Documentation

Base URL: `https://dz-address-select.vercel.app/api`

### 1. Base Endpoints (Mixed Languages)
| Endpoint | Description |
| :--- | :--- |
| `GET /index.json` | Discovery index with all available endpoints and versions. |
| `GET /wilayas.json` | List of all 69 wilayas with both Arabic and Latin names. |
| `GET /full-data.json` | The entire hierarchical dataset (Large file). |

### 2. Language-Specific Endpoints
| Endpoint | Description |
| :--- | :--- |
| `GET /ar/wilayas.json` | Arabic-only list of all wilayas. |
| `GET /latin/wilayas.json` | Latin-only list of all wilayas. |
| `GET /ar/wilayas/{code}.json` | Wilaya details (dairas/communes) in Arabic only. |
| `GET /latin/wilayas/{code}.json` | Wilaya details (dairas/communes) in Latin only. |

### 3. Granular Daira Endpoints
| Endpoint | Description |
| :--- | :--- |
| `GET /wilayas/{code}/dairas/{daira-slug}.json` | Details of a specific daira and its communes. |
| `GET /ar/wilayas/{code}/dairas/{daira-slug}.json` | Daira details in Arabic. |
| `GET /latin/wilayas/{code}/dairas/{daira-slug}.json` | Daira details in Latin. |

### 4. ZIP Code Lookup
| Endpoint | Description |
| :--- | :--- |
| `GET /zip/{zipcode}.json` | Reverse lookup for a 5-digit postal code. |

---

## 📦 Integration

### 🛠️ Script Tag (Vanilla JS)
Add the following to your HTML to mount the picker into any element with the `dz-address-picker` class:

```html
<div class="dz-address-picker"></div>
<script src="https://dz-address-select.vercel.app/widget.js"></script>
```

### ⚛️ React
```tsx
import { AlgeriaAddressPicker } from "@/components/AlgeriaAddressPicker";

function MyForm() {
  return (
    <AlgeriaAddressPicker 
      onUpdate={(data) => console.log(data)} 
      language="en"
    />
  );
}
```

---

## 🌟 Support & Community

If you like this project, please **give it a star** on GitHub: [https://github.com/SaddexRnx/Algerian-wilayas](https://github.com/SaddexRnx/Algerian-wilayas)

Visit my portfolio for more open-source projects: [https://SaddexRnx.github.io](https://SaddexRnx.github.io)

*A huge thank you to all the developers using this API. More updates are coming soon to make this API as useful and comprehensive as possible for the Algerian developer community!*

---

## 📞 Contact

- **Telegram:** [@Saddex_x](https://t.me/Saddex_x)
- **Live Demo:** [dz-address-select.vercel.app](https://dz-address-select.vercel.app)

Built for the Algerian developer community. MIT Licensed.
