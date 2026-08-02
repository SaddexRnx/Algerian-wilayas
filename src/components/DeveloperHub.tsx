import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";


const CONFIG_KEY = "dz-address-picker:widget-config";

const CDN_BASE = "https://cdn.jsdelivr.net/gh/SaddexRnx/Algeria-wilayas@main";

export const WIDGET_DATA_URL = `${CDN_BASE}/json/wilaya-daira-commune/wilaya-daira-commune.json`;

export interface WidgetConfig {
  target: string;
  format: "arabic" | "latin" | "json";
  inputName: string;
}

export const DEFAULT_CONFIG: WidgetConfig = {
  target: ".dz-address-picker",
  format: "arabic",
  inputName: "shipping_address",
};

export interface Snippet {
  id: string;
  label: string;
  code: string;
}

function containerClass(target: string) {
  return target.startsWith(".") ? target.slice(1) : "dz-address-picker";
}

function containerMarkup(c: WidgetConfig) {
  const isId = c.target.startsWith("#");
  const attrs = `${isId ? `id="${c.target.slice(1)}"` : `class="${containerClass(c.target)}"`} data-target="${c.target}" data-format="${c.format}" data-input-name="${c.inputName}"`;
  return `<div ${attrs}></div>`;
}

export function buildSnippets(c: WidgetConfig): Snippet[] {
  const container = containerMarkup(c);
  return [
    {
      id: "vanilla",
      label: "Vanilla JS",
      code: `<!-- 1. Add this container where you want the dropdowns -->
${container}

<!-- 2. Add this script before the closing </body> tag -->
<script src="https://your-domain.vercel.app/widget.js"></script>`,
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

  const key = '${c.format === "latin" ? "ascii" : "arabic"}';
  const value = ${
    c.format === "json"
      ? "JSON.stringify({ wilaya, daira, commune })"
      : "[commune, daira, selectedWilaya?.[key]].filter(Boolean).join(', ')"
  };

  return (
    <div className="${containerClass(c.target)}">
      <input type="hidden" name="${c.inputName}" value={value} />

      <select
        aria-label="Wilaya"
        value={wilaya}
        onChange={e => { setWilaya(e.target.value); setDaira(''); setCommune(''); }}
      >
        <option value="">اختر الولاية</option>
        {data.map(w => (
          <option key={w.code} value={w.code}>{w.code} - {w[key]}</option>
        ))}
      </select>

      <select
        aria-label="Daira"
        value={daira}
        onChange={e => { setDaira(e.target.value); setCommune(''); }}
        disabled={!wilaya}
      >
        <option value="">اختر الدائرة</option>
        {selectedWilaya?.dairas.map((d: any) => (
          <option key={d.arabic} value={d.arabic}>{d[key]}</option>
        ))}
      </select>

      <select
        aria-label="Commune"
        value={commune}
        onChange={e => setCommune(e.target.value)}
        disabled={!daira}
      >
        <option value="">اختر البلدية</option>
        {selectedDaira?.communes.map((c: any) => (
          <option key={c.arabic} value={c.arabic}>{c[key]}</option>
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
        echo '${container}
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
    container.className = "${containerClass(c.target)}";
    container.dataset.target = "${c.target}";
    container.dataset.format = "${c.format}";
    container.dataset.inputName = "${c.inputName}";
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
${container}
<script>
  document.addEventListener("DOMContentLoaded", function() {
    var script = document.createElement("script");
    script.src = "${CDN_BASE}/dist/widget.js";
    document.body.appendChild(script);
  });
</script>`,
    },
  ];
}

export const SNIPPETS = buildSnippets(DEFAULT_CONFIG);

export const WIDGET_OPTIONS: { attr: string; description: string; example: string }[] = [
  {
    attr: "data-target",
    description: "CSS selector of the element the widget mounts into.",
    example: ".dz-address-picker",
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

function CopyCodeButton({ code, label }: { code: string; label: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`${t("hub.copy")} — ${label}`}
      onClick={() => {
        void navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute top-3 right-3 rounded bg-gray-800 px-3 py-1.5 text-xs text-white transition hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:top-4 sm:right-4"
    >
      {copied ? t("hub.copied") : t("hub.copy")}
    </button>
  );
}


const fieldClass =
  "w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition";

export function DeveloperHub() {
  const { t } = useI18n();
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const configLoaded = useRef(false);


  // Restore the saved widget configuration on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CONFIG_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<WidgetConfig>;
        setConfig((c) => ({
          target: typeof saved.target === "string" ? saved.target : c.target,
          format:
            saved.format === "arabic" || saved.format === "latin" || saved.format === "json"
              ? saved.format
              : c.format,
          inputName: typeof saved.inputName === "string" ? saved.inputName : c.inputName,
        }));
      }
    } catch {
      /* storage unavailable — non-fatal */
    }
    configLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!configLoaded.current) return;
    try {
      window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [config]);

  const snippets = useMemo(() => buildSnippets(config), [config]);
  const [activeTab, setActiveTab] = useState(snippets[0]!.id);
  const active = snippets.find((s) => s.id === activeTab) ?? snippets[0]!;
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const last = snippets.length - 1;
    const next =
      e.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : e.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : e.key === "Home"
            ? 0
            : last;
    const id = snippets[next]!.id;
    setActiveTab(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <div className="mx-auto mt-16 max-w-3xl">
      <h2 className="text-lg font-semibold text-black">{t("hub.title")}</h2>
      <p className="mt-2 text-sm text-gray-500">{t("hub.subtitle")}</p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold text-black">{t("hub.liveConfig")}</h3>
        <p className="mt-1 text-sm text-gray-500">{t("hub.liveConfigDesc")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="cfg-target" className="mb-1.5 block text-xs font-medium text-gray-700">
              {t("hub.target")}
            </label>
            <input
              id="cfg-target"
              type="text"
              dir="ltr"
              value={config.target}
              onChange={(e) => setConfig((c) => ({ ...c, target: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="cfg-format" className="mb-1.5 block text-xs font-medium text-gray-700">
              {t("hub.format")}
            </label>
            <select
              id="cfg-format"
              value={config.format}
              dir="ltr"
              onChange={(e) =>
                setConfig((c) => ({ ...c, format: e.target.value as WidgetConfig["format"] }))
              }
              className={fieldClass}
            >
              <option value="arabic">arabic</option>
              <option value="latin">latin</option>
              <option value="json">json</option>
            </select>
          </div>
          <div>
            <label htmlFor="cfg-name" className="mb-1.5 block text-xs font-medium text-gray-700">
              {t("hub.inputName")}
            </label>
            <input
              id="cfg-name"
              type="text"
              dir="ltr"
              value={config.inputName}
              onChange={(e) => setConfig((c) => ({ ...c, inputName: e.target.value }))}
              className={fieldClass}
            />
          </div>
        </div>
      </div>


      <div
        role="tablist"
        aria-label="Integration platforms"
        className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
      >
        {snippets.map((s, i) => {
          const isActive = s.id === active.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`tab-${s.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${s.id}`}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => {
                tabRefs.current[s.id] = el;
              }}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              onClick={() => setActiveTab(s.id)}
              className={
                (isActive
                  ? "bg-black text-white "
                  : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 ") +
                "rounded-md px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
              }
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
        tabIndex={0}
        dir="ltr"
        className="relative mt-4 overflow-x-auto rounded-xl bg-gray-950 p-4 text-gray-100 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none sm:p-6"
      >
        <CopyCodeButton code={active.code} label={active.label} />
        <pre className="pt-8 font-mono text-xs leading-relaxed sm:pt-0 sm:pr-20 sm:text-sm">
          <code>{active.code}</code>
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold text-black">{t("hub.options")}</h3>
        <p className="mt-1 text-sm text-gray-500">{t("hub.optionsDesc")}</p>
        <dl className="mt-4 divide-y divide-gray-200">
          {WIDGET_OPTIONS.map((o) => (
            <div key={o.attr} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="font-mono text-xs text-black" dir="ltr">
                {o.attr}
              </dt>
              <dd className="text-sm text-gray-600 sm:col-span-2">
                {o.description}
                <span className="mt-1 block font-mono text-xs break-all text-gray-400" dir="ltr">
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
