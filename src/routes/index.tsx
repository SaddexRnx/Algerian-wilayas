import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlgeriaAddressPicker } from "@/components/AlgeriaAddressPicker";
import { DeveloperHub, SNIPPETS } from "@/components/DeveloperHub";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DZ Address Picker — Algerian Wilaya, Daira & Commune Data" },
      {
        name: "description",
        content:
          "Plug-and-play cascading address picker with all 69 Algerian wilayas, dairas and communes. Zero dependencies, ready for e-commerce and forms.",
      },
      { property: "og:title", content: "DZ Address Picker — Algerian Address Integration" },
      {
        property: "og:description",
        content:
          "Complete, up-to-date dataset of Algerian wilayas, dairas and communes with a one-line integration snippet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const WIDGET_DATA_URL =
  "https://cdn.jsdelivr.net/gh/SaddexRnx/Algeria-wilayas@main/json/wilaya-daira-commune/wilaya-daira-commune.json";

const SNIPPET = `<div class="dz-address-picker" data-source="${WIDGET_DATA_URL}"></div>
<script src="https://cdn.jsdelivr.net/gh/SaddexRnx/Algeria-wilayas@main/dist/widget.js"></script>`;

function CopyButton({
  className,
  label = "Copy",
}: {
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(SNIPPET);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={className}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

const features = [
  {
    title: "Blazing Fast",
    description: "Hosted on global CDN, minified data loads in milliseconds.",
    icon: (
      <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
    ),
  },
  {
    title: "Framework Agnostic",
    description: "Works with Vanilla JS, React, Vue, WordPress, and Shopify.",
    icon: (
      <>
        <path d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    title: "Always Updated",
    description: "Reflects the latest official administrative reforms.",
    icon: (
      <>
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </>
    ),
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-white font-[system-ui,Inter,sans-serif] antialiased">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-xl font-bold text-black">DZ Address Picker</span>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#demo" className="text-gray-600 transition hover:text-black">
              Demo
            </a>
            <a href="#integration" className="text-gray-600 transition hover:text-black">
              Integration
            </a>
            <a href="#features" className="text-gray-600 transition hover:text-black">
              Features
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-8">
        <section className="py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
            The Modern Algerian Address Integration.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
            The complete, up-to-date dataset of all 69 Wilayas and 1,541 Communes. Ready for
            e-commerce, forms, and maps. Zero dependencies.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#demo"
              className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800"
            >
              View Live Demo
            </a>
            <CopyButton
              label="Copy Integration Code"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-black transition hover:bg-gray-50"
            />
          </div>
        </section>

        <section id="demo" className="scroll-mt-24">
          <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-black">Live Interactive Demo</h2>
            <AlgeriaAddressPicker />
          </div>
        </section>

        <section id="integration" className="scroll-mt-24">
          <DeveloperHub />
        </section>

        <section id="features" className="mx-auto mt-20 grid max-w-4xl gap-8 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600"
                aria-hidden="true"
              >
                {f.icon}
              </svg>
              <h3 className="mt-4 font-semibold text-black">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{f.description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="py-12 text-center text-sm text-gray-400">
        Built for the Algerian developer community. Open source and free to use.
      </footer>
    </div>
  );
}
