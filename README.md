# DZ Address Select

Act as an expert full-stack developer and minimalist UI/UX designer. Build a complete, production-ready, single-page web application called "DZ Address Picker". 



The goal is to provide developers and e-commerce store owners with a beautiful, plug-and-play solution to integrate official Algerian addresses (69 Wilayas, Dairas, and Communes) into their websites.



### ⛔ STRICT RULES (MUST FOLLOW WITHOUT EXCEPTION):

1. ZERO ATTRIBUTION OR COPYRIGHT: Do NOT include any copyright notices, credits, watermarks, or mentions of "islam-re", "Algeria-wilayas", "GitHub", or any previous repository in the UI, footer, or code comments. Present the data neutrally as "Official Algerian Administrative Data".

2. STRICT DESIGN SYSTEM: Use ONLY black, white, and grayscale (Tailwind classes: black, white, gray-50 to `gray-950`). 

   - NO gradients, NO vibrant colors, NO blue/green accents.

   - Rely on generous whitespace, subtle borders (`border-gray-200`), crisp typography (Inter or system-ui), and subtle shadows (`shadow-sm`).

   - The design must be ultra-modern, clean, and professional.

3. NO MOCK DATA: You must fetch the REAL, LIVE data automatically from the official source at runtime. Do not hardcode mock arrays.



### 🌐 DATA FETCHING & MAPPING INSTRUCTIONS:

Fetch the live JSON data directly from this URL on component mount:

https://raw.githubusercontent.com/islam-re/Algeria-wilayas/main/json/wilaya-daira-commune/wilaya-daira-commune.json



Map the fetched data to this exact TypeScript interface (adapt to the actual keys in the JSON, typically code, arabic, `ascii`):

```typescript

interface Commune {

  arabic: string;

  ascii: string;

  postal_code?: string; 

}



interface Daira {

  arabic: string;

  ascii: string;

  communes: Commune[];

}



interface Wilaya {

  code: number;

  arabic: string;

  ascii: string;

  dairas: Daira[];

}



PAGE SECTIONS TO BUILD:

Header / Navigation:

Minimalist top bar with a subtle bottom border (border-b border-gray-200).

Left: Bold text logo "DZ Address Picker" (text-black font-bold text-xl).

Right: Simple text links: "Demo", "Integration", "Docs" (text-gray-600 hover:text-black transition).

Hero Section:

Centered, bold typography with generous vertical padding (py-20).

H1: "The Modern Algerian Address Integration." (text-4xl md:text-5xl font-bold text-black tracking-tight).

Subtitle: "The complete, up-to-date dataset of all 69 Wilayas and 1,541 Communes. Ready for e-commerce, forms, and maps. Zero dependencies." (text-xl text-gray-500 max-w-2xl mx-auto mt-4).

Two buttons:

Primary: "View Live Demo" (bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition).

Secondary: "Copy Integration Code" (bg-white text-black border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition).

Live Demo Section (ID: demo):

A clean, bordered card (bg-white border border-gray-200 rounded-xl shadow-sm p-8 max-w-2xl mx-auto).

Title: "Live Interactive Demo" (text-lg font-semibold text-black mb-6).

Implement the actual cascading dropdowns using React state (useState):

Select 1 (Wilaya): Populated from fetched data. Display format: {code} - {arabic} ({ascii}).

Select 2 (Daira): Disabled until Wilaya is chosen. Display format: {arabic}.

Select 3 (Commune): Disabled until Daira is chosen. Display format: {arabic}.

Input (Postal Code): Read-only input that auto-fills when a Commune is selected. If the source JSON lacks postal codes, dynamically generate a placeholder (e.g., Wilaya 16 → "16000") and add a subtle helper text: "Auto-generated placeholder".

Style all native <select> and <input> elements to match the minimalist theme: w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition.

One-Click Integration Section (ID: integration):

Dark card for contrast (bg-gray-950 text-white rounded-xl p-8 max-w-2xl mx-auto mt-16).

Title: "Integrate in 30 Seconds" (text-lg font-semibold mb-4).

Description: "Add this single line of code before the closing </body> tag of your website." (text-gray-400 text-sm mb-4).



A code block (bg-gray-900 rounded-lg p-4 relative) containing:

html



<div class="dz-address-picker"></div>

<script src="https://cdn.jsdelivr.net/gh/your-username/dz-address-picker@main/dist/widget.js"></script>



Include a functional "Copy" button (absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1 rounded text-white transition) that copies the snippet to the clipboard and temporarily changes text to "Copied!".

Features Grid:

3-column grid on desktop (grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20).

Each feature: Simple monochrome SVG icon (stroke black or gray-600), bold title (text-black font-semibold), and subtle description (text-gray-500 text-sm mt-2).

Feature 1: "Blazing Fast" - Hosted on global CDN, minified data loads in milliseconds.

Feature 2: "Framework Agnostic" - Works with Vanilla JS, React, Vue, WordPress, and Shopify.

Feature 3: "Always Updated" - Reflects the latest official administrative reforms.

Footer:

Simple, centered text at the bottom (py-12 text-gray-400 text-sm).

Text: "Built for the Algerian developer community. Open source and free to use."

NO external links, NO mentions of the original data source.

⚙️ TECHNICAL REQUIREMENTS:

Use React with TypeScript (Vite/Next.js compatible).

Use Tailwind CSS for ALL styling. Strictly enforce the grayscale palette.

Create a reusable, self-contained React component <AlgeriaAddressPicker /> that handles the fetching and cascading logic, so it can be easily extracted into a standalone script later.

Handle loading states (isLoading) and error states (isError) gracefully with minimalist UI (e.g., a simple skeleton loader or subtle error message).

Ensure the code is clean, modular, and completely free of any forbidden attributions.

Generate the complete application with all components, the live fetch logic, and the styling exactly as described.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ed549980-73e4-4b3e-8bd1-838694b578b3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
