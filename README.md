# DZ Address Picker

**A free, blazing-fast, plug-and-play Algerian address system — 58 Wilayas (69 with the new administrative divisions), all Dairas and 1,541 Communes — as a static JSON API, an embeddable widget and a React component.**

Monochrome by design. Zero dependencies for the widget. Works offline once cached.

---

## Table of contents

- [Why](#why)
- [Features](#features)
- [Live demo](#live-demo)
- [Quick start](#quick-start)
  - [1. Script tag (any website)](#1-script-tag-any-website)
  - [2. React / Next.js](#2-react--nextjs)
  - [3. WordPress / WooCommerce](#3-wordpress--woocommerce)
  - [4. Plain fetch](#4-plain-fetch)
- [The API](#the-api)
- [Widget configuration](#widget-configuration)
- [Events](#events)
- [Theming](#theming)
- [Offline behaviour](#offline-behaviour)
- [Internationalisation](#internationalisation)
- [Local development](#local-development)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [Star the project](#star-the-project)
- [License](#license)
- [Contact](#contact)

---

## Why

Every Algerian e-commerce store rebuilds the same thing: a Wilaya → Daira → Commune dropdown,
usually with an outdated hardcoded array copied from a forum. DZ Address Picker gives you the
official administrative hierarchy as pre-split, CDN-friendly JSON plus a ready-made UI you can
drop into any checkout in under a minute.

## Features

- **Complete dataset** — every Wilaya, Daira and Commune, in Arabic and Latin script.
- **Static JSON API** — ~2,000 pre-generated files, no server, no rate limits, instant responses.
- **Granular endpoints** — load only the Dairas of one Wilaya instead of the whole country.
- **Embeddable widget** — one `<script>` tag mounts cascading selects into any `div`.
- **React component** — `<AlgeriaAddressPicker />` with searchable dropdowns and presets.
- **Offline-first cache** — responses are cached in `localStorage` (6h TTL) and reused when the
  network fails, with a clear "showing a local copy" notice.
- **Fully accessible** — keyboard navigation, ARIA labels, focus management, screen-reader tested.
- **Trilingual UI** — English (default), French and Arabic with full RTL mirroring.
- **CSV export** — download the current Wilaya/Daira/Commune selection as CSV.
- **Shareable URLs** — the selection is reflected in query parameters and restored on load.
- **Strict monochrome design** — black, white and grays only, blends into any brand.
- **WordPress plugin** — WooCommerce checkout integration, downloadable as a ZIP.
- **Live API tester** — a mini-Postman built into the site with autocomplete.

## Live demo

**https://dz-address-select.vercel.app**

Try the interactive picker, the animated checkout simulation, the event console and the API tester.

---

## Quick start

### 1. Script tag (any website)

```html
<div class="dz-address-picker"></div>
<script src="https://dz-address-select.vercel.app/widget.js"></script>
```

That's it. The widget fetches the data, injects its own styles and renders three cascading
selects plus a hidden input containing the formatted address.

### 2. React / Next.js

```tsx
import { AlgeriaAddressPicker } from "@/components/AlgeriaAddressPicker";

export default function Checkout() {
  return (
    <AlgeriaAddressPicker
      defaultWilayaCode={16}
      defaultDairaName="Bir Mourad Rais"
      defaultCommuneName="Hydra"
    />
  );
}
```

Listen for changes anywhere in the app:

```ts
window.addEventListener("dz-address-update", (e) => {
  console.log((e as CustomEvent).detail);
  // { wilayaCode: "16", wilayaName: "...", dairaName: "...", communeName: "..." }
});
```

### 3. WordPress / WooCommerce

1. Download the plugin ZIP from the **Integration → WordPress** tab on the live site.
2. WordPress admin → **Plugins → Add New → Upload Plugin** → activate.
3. **Settings → DZ Address Picker** → set the API base URL.
4. The picker is injected automatically above the billing address, or use the shortcode
   `[dz_address_picker]` anywhere.

The selection is saved on the order as `_dz_address`, `_dz_wilaya`, `_dz_daira` and `_dz_commune`.

### 4. Plain fetch

```js
const wilayas = await fetch("https://dz-address-select.vercel.app/api/wilayas.json").then((r) =>
  r.json(),
);

const dairas = await fetch(
  "https://dz-address-select.vercel.app/api/wilayas/16/dairas.json",
).then((r) => r.json());
```

---

## The API

Base URL: `https://dz-address-select.vercel.app/api`

| Method | Endpoint                                | Description                                          |
| ------ | --------------------------------------- | ---------------------------------------------------- |
| GET    | `/index.json`                           | API index: available routes and dataset metadata      |
| GET    | `/wilayas.json`                         | All Wilayas (code, Arabic name, Latin name)           |
| GET    | `/full-data.json`                       | The complete nested dataset in one file               |
| GET    | `/wilayas/{code}.json`                  | One Wilaya with its Dairas and Communes               |
| GET    | `/wilayas/{code}/dairas.json`           | Dairas of one Wilaya                                  |
| GET    | `/wilayas/{code}/communes.json`         | Flat list of every Commune in one Wilaya              |
| GET    | `/wilayas/{code}-dairas.json`           | Dairas with nested Communes (compact alias)           |
| GET    | `/wilayas/{code}/dairas/{slug}.json`    | One Daira with its Communes                           |

Working examples:

```
GET /api/wilayas.json
GET /api/wilayas/19.json
GET /api/wilayas/19/dairas.json
GET /api/wilayas/19/dairas/bouandas.json
```

Shape:

```ts
interface Commune {
  arabic: string;
  ascii: string;
}

interface Daira {
  arabic: string;
  ascii: string;
  slug: string;
  communes: Commune[];
}

interface Wilaya {
  code: number;
  arabic: string;
  ascii: string;
}
```

All endpoints are plain static files: cacheable, CORS-friendly, no key, no quota.

---

## Widget configuration

Configure the script-tag widget with data attributes:

| Attribute         | Values                            | Default            | Description                          |
| ----------------- | --------------------------------- | ------------------ | ------------------------------------ |
| `data-lang`       | `ar`, `fr`, `en`                  | `ar`               | Label language and option script     |
| `data-format`     | `arabic`, `latin`, `json`         | `arabic`           | Hidden input output format           |
| `data-input-name` | any string                        | `shipping_address` | Name of the generated hidden input   |
| `data-wilaya`     | Wilaya code                       | —                  | Pre-selected Wilaya                  |
| `data-daira`      | Daira name (Arabic or Latin)      | —                  | Pre-selected Daira                   |
| `data-commune`    | Commune name (Arabic or Latin)    | —                  | Pre-selected Commune                 |

```html
<div
  class="dz-address-picker"
  data-lang="fr"
  data-format="json"
  data-input-name="customer_address"
  data-wilaya="16"
></div>
```

## Events

Both the widget and the React component dispatch a bubbling `dz-address-update` event on every
change:

```ts
{
  wilayaCode: string;
  wilayaName: string;
  dairaName:  string;
  communeName: string;
}
```

## Theming

Override these CSS variables to match your brand while keeping the layout intact:

```css
:root {
  --dz-bg-color: #ffffff;
  --dz-text-color: #000000;
  --dz-border-color: #d1d5db;
  --dz-focus-ring-color: #000000;
  --dz-disabled-bg: #f9fafb;
}
```

## Offline behaviour

Every request goes through a small `localStorage` cache:

1. A **fresh** entry (younger than 6 hours) resolves instantly, with no network call.
2. A **stale** entry is refreshed in the background from the network.
3. If the network **fails**, the stale copy is served anyway and the UI shows a clear
   "Network unavailable — showing a local copy" notice with a **Retry** button.
4. If there is no cached copy at all, an explicit error state with **Retry** is displayed —
   the UI never silently shows an empty dropdown.

## Internationalisation

The interface ships in **English (default)**, **French** and **Arabic**. The Arabic locale
switches the document to RTL and mirrors every component. The selected language is persisted
across page loads.

---

## Local development

```bash
git clone https://github.com/SaddexRnx/dz-address-picker.git
cd dz-address-picker
npm install
npm run dev
```

Open http://localhost:8080.

Regenerate the static API files after a dataset update:

```bash
node scripts/split-data.js
```

## Project structure

```text
public/
  api/                 generated static JSON endpoints
  widget.js            standalone embeddable widget
  wp-plugin/           WordPress / WooCommerce plugin sources
scripts/
  split-data.js        dataset -> granular JSON generator
src/
  components/          picker, developer hub, API tester, docs, checkout demo
  lib/                 i18n, analytics, offline cache
  routes/              landing page, login, admin dashboard
```

---

## Contributing

Contributions are very welcome — data corrections especially.

1. Fork the repository and create a branch: `git checkout -b feat/my-change`.
2. Keep the design system strictly monochrome (black, white, grays only).
3. Keep the UI trilingual: add new strings to `src/lib/i18n.tsx` for **EN, FR and AR**.
4. Run `npm run lint` and make sure types pass before opening a PR.
5. For dataset changes, edit the source data and re-run `node scripts/split-data.js`, then commit
   the regenerated files.
6. Open a pull request with a clear description and, for UI changes, a screenshot.

Found a wrong Commune name or a missing Daira? Open an issue with the Wilaya code and the correct
spelling in both Arabic and Latin script — those are the most valuable contributions.

## Star the project

If this saved you a few hours, please **⭐ star the repository** — it's free, it takes one click,
and it genuinely helps other Algerian developers find the project.

## License

Released under the **MIT License**. Free for personal and commercial use.

The administrative dataset is official Algerian public administrative data.

## Contact

- **Telegram:** [@Saddex_x](https://t.me/Saddex_x)
- **Portfolio:** [SaddexRnx.github.io](https://SaddexRnx.github.io)

Built for the Algerian developer community. Open source and free to use.
