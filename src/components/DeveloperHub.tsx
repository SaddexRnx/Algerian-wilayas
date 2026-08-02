import { useState } from "react";

const CDN_BASE = "https://cdn.jsdelivr.net/gh/SaddexRnx/Algeria-wilayas@main";

export const WIDGET_DATA_URL = `${CDN_BASE}/json/wilaya-daira-commune/wilaya-daira-commune.json`;

export interface Snippet {
  id: string;
  label: string;
  code: string;
}

export const SNIPPETS: Snippet[] = [
  {
    id: "vanilla",
    label: "Vanilla JS",
    code: `<!-- 1. Add this container where you want the dropdowns -->
<div class="dz-address-picker"></div>

<!-- 2. Add this script before the closing </body> tag -->
<script src="${CDN_BASE}/dist/widget.js"></script>`,
  },
  {
    id: "react",
    label: "React / Next.js",
    code: `import { useState, useEffect } from 'react';

export default function DzAddressPicker() {
  const [data, setData] = useState<any[]>([]);
  const [wilaya, setWilaya] = useState('');
  const [daira, setDaira] = useState('');
  const [commune, setCommune] = useState('');

  useEffect(() => {
    fetch('${WIDGET_DATA_URL}')
      .then(res => res.json())
      .then(setData);
  }, []);

  const selectedWilaya = data.find(w => w.code == wilaya);
  const selectedDaira = selectedWilaya?.dairas.find(d => d.arabic === daira);

  return (
    <div className="dz-address-picker">
      <select
        value={wilaya}
        onChange={e => { setWilaya(e.target.value); setDaira(''); setCommune(''); }}
      >
        <option value="">اختر الولاية</option>
        {data.map(w => (
          <option key={w.code} value={w.code}>{w.code} - {w.arabic}</option>
        ))}
      </select>

      <select
        value={daira}
        onChange={e => { setDaira(e.target.value); setCommune(''); }}
        disabled={!wilaya}
      >
        <option value="">اختر الدائرة</option>
        {selectedWilaya?.dairas.map((d: any) => (
          <option key={d.arabic} value={d.arabic}>{d.arabic}</option>
        ))}
      </select>

      <select
        value={commune}
        onChange={e => setCommune(e.target.value)}
        disabled={!daira}
      >
        <option value="">اختر البلدية</option>
        {selectedDaira?.communes.map((c: any) => (
          <option key={c.arabic} value={c.arabic}>{c.arabic}</option>
        ))}
      </select>
    </div>
  );
}`,
  },
  {
    id: "wordpress",
    label: "WordPress / WooCommerce",
    code: `// Add this to your theme's functions.php file
add_action('wp_footer', 'dz_inject_address_widget');
function dz_inject_address_widget() {
    if (is_checkout()) {
        echo '<div class="dz-address-picker"></div>
        <script>
        document.addEventListener("DOMContentLoaded", function() {
            var script = document.createElement("script");
            script.src = "${CDN_BASE}/dist/widget.js";
            document.body.appendChild(script);
        });
        </script>';
    }
}`,
  },
  {
    id: "prestashop",
    label: "PrestaShop",
    code: `// Add this to your theme's custom JS file or footer hook
document.addEventListener("DOMContentLoaded", function() {
    const container = document.createElement("div");
    container.className = "dz-address-picker";
    // Target PrestaShop state/city fields (adjust selectors if needed)
    const stateField = document.querySelector("#id_state");
    if (stateField) {
        stateField.parentElement.prepend(container);
        stateField.style.display = "none"; // Hide default dropdown

        const script = document.createElement("script");
        script.src = "${CDN_BASE}/dist/widget.js";
        document.body.appendChild(script);
    }
});`,
  },
  {
    id: "shopify",
    label: "Shopify",
    code: `<!-- Add this to your checkout.liquid or theme JS -->
<div class="dz-address-picker"></div>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    var script = document.createElement("script");
    script.src = "${CDN_BASE}/dist/widget.js";
    document.body.appendChild(script);
  });
</script>`,
  },
];

export const WIDGET_OPTIONS: { attr: string; description: string; example: string }[] = [
  {
    attr: "data-target",
    description: "CSS selector of the element the widget mounts into.",
    example: '.dz-address-picker',
  },
  {
    attr: "data-source",
    description: "Override the dataset URL (defaults to the CDN copy).",
    example: WIDGET_DATA_URL,
  },
  {
    attr: "data-format",
    description: 'Output format for the hidden input: "arabic", "latin" or "json".',
    example: "arabic",
  },
  {
    attr: "data-input-name",
    description: "Name of the hidden input submitted with your form.",
    example: "shipping_address",
  },
  {
    attr: "data-on-change",
    description: "Name of a global function called with the selection on every change.",
    example: "window.onDzAddressChange",
  },
  {
    attr: "data-cache-ttl",
    description: "localStorage cache lifetime in seconds (0 disables caching).",
    example: "21600",
  },
];

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute top-4 right-4 rounded bg-gray-800 px-3 py-1.5 text-xs text-white transition hover:bg-gray-700"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function DeveloperHub() {
  const [activeTab, setActiveTab] = useState(SNIPPETS[0]!.id);
  const active = SNIPPETS.find((s) => s.id === activeTab) ?? SNIPPETS[0]!;

  return (
    <div className="mx-auto mt-16 max-w-3xl">
      <h2 className="text-lg font-semibold text-black">Developer Hub</h2>
      <p className="mt-2 text-sm text-gray-500">
        Pick your platform and drop the snippet in. No build step, no dependencies.
      </p>

      <div
        role="tablist"
        aria-label="Integration platforms"
        className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
      >
        {SNIPPETS.map((s) => {
          const isActive = s.id === active.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(s.id)}
              className={
                isActive
                  ? "rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition"
                  : "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              }
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="relative mt-4 overflow-x-auto rounded-xl bg-gray-950 p-6 text-gray-100">
        <CopyCodeButton code={active.code} />
        <pre className="pt-6 font-mono text-sm leading-relaxed sm:pt-0 sm:pr-20">
          <code>{active.code}</code>
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-black">Widget configuration</h3>
        <p className="mt-1 text-sm text-gray-500">
          Set these attributes on the container element to control mounting, output format and
          callbacks.
        </p>
        <dl className="mt-4 divide-y divide-gray-200">
          {WIDGET_OPTIONS.map((o) => (
            <div key={o.attr} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-mono text-xs text-black">{o.attr}</dt>
              <dd className="text-sm text-gray-600 sm:col-span-2">
                {o.description}
                <span className="mt-1 block font-mono text-xs break-all text-gray-400">
                  {o.example}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default DeveloperHub;
