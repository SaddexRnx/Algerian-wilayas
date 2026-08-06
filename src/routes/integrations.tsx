import React from "react";
import { createFileRoute, Link } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from "react";
import { AlgeriaAddressPicker } from "@/components/AlgeriaAddressPicker";
import { CheckoutSimulation, type LiveAddress } from "@/components/CheckoutSimulation";
import { DeveloperHub } from "@/components/DeveloperHub";
import { ApiDocs } from "@/components/ApiDocs";
import { ApiTester } from "@/components/ApiTester";
import { useTranslation } from '@/lib/i18n';
import { ShoppingBag, Code, Terminal, Layers, ChevronLeft, Download, Info } from 'lucide-react';

export const Route = createFileRoute('/integrations')({
  component: IntegrationsPage,
});

const INTEGRATIONS = [
  {
    id: 'woocommerce',
    name: 'WooCommerce / WordPress',
    desc: 'Native plugin for checkout fields synchronization.',
    icon: <ShoppingBag className="w-8 h-8" />,
    color: 'from-blue-500 to-emerald-500',
    steps: [
      'Download the latest plugin version (v1.0.4 recommended).',
      'Go to WordPress Admin > Plugins > Add New.',
      'Upload the downloaded ZIP file and Activate.',
      'Configure your shipping zones in WooCommerce settings.'
    ],
    code: `<script src="https://dz-address-select.vercel.app/widget.js"></script>`,
    hasVersions: true
  },
  {
    id: 'shopify',
    name: 'Shopify',
    desc: 'Custom script for Shopify Liquid themes.',
    icon: <Code className="w-8 h-8" />,
    color: 'from-blue-600 to-sky-500',
    steps: [
      'Open your Shopify Admin > Online Store > Themes.',
      'Click Edit Code and find "theme.liquid".',
      'Paste the widget script before the closing </body> tag.',
      'Add data attributes to your address inputs to sync.'
    ],
    code: `<script src="https://dz-address-select.vercel.app/widget.js" defer></script>`
  },
  {
    id: 'laravel',
    name: 'Laravel / PHP',
    desc: 'Composer package for backend validation.',
    icon: <Terminal className="w-8 h-8" />,
    color: 'from-emerald-600 to-teal-500',
    steps: [
      'Install via composer: composer require saddexrnx/dz-address-picker',
      'Publish the configuration file.',
      'Use the validation rules in your Request classes.',
      'Fetch Wilayas via the provided Facade.'
    ],
    code: `use SaddexRnx\\DzAddress\\Rules\\WilayaRule;\n\n$request->validate([\n  'wilaya' => ['required', new WilayaRule]\n]);`
  },
  {
    id: 'react',
    name: 'Node.js / React',
    desc: 'NPM package with full TypeScript support.',
    icon: <Layers className="w-8 h-8" />,
    color: 'from-blue-400 to-blue-700',
    steps: [
      'Install via npm: npm install @dz-address/react',
      'Import the AlgeriaAddressPicker component.',
      'Pass props to customize behavior and language.',
      'Listen to onChange events for state updates.'
    ],
    code: `import { AlgeriaAddressPicker } from '@dz-address/react';\n\n<AlgeriaAddressPicker \n  lang="en" \n  onChange={(data) => console.log(data)} \n/>`
  }
];

function IntegrationsPage() {
  const { lang, t, dir } = useTranslation();
  const [live, setLive] = useState<LiveAddress | undefined>(undefined);

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<LiveAddress>).detail;
      if (detail) setLive(detail);
    };
    window.addEventListener("dz-address-update", onUpdate);
    return () => window.removeEventListener("dz-address-update", onUpdate);
  }, []);

  return (
    <div dir={dir} className="min-h-screen bg-white font-sans pb-20">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white transition-transform">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-black uppercase tracking-tighter">
              {t("nav.backHome")}
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-4">
             <span className="text-xs font-black uppercase tracking-widest text-gray-400">Developer Hub</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-black text-black mb-6 tracking-tighter uppercase leading-none">
            Developer Integration Hub
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto font-medium">
            Seamlessly integrate Algerian address data into any platform with our pre-built plugins and snippets.
          </p>
        </div>
 
        <section className="bg-black rounded-3xl p-8 mb-16 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <Info className="w-4 h-4" /> Pro Tip
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-4 uppercase tracking-tighter">Optimize for Arabic Users</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Use the <code className="bg-white/20 px-1.5 py-0.5 rounded">/api/ar/wilayas.json</code> endpoint to reduce your payload size by <strong>50%</strong> for Arabic-only applications.
              </p>
            </div>
            <Link to="/status" className="shrink-0 bg-white text-black px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform active:scale-95 uppercase tracking-widest text-sm">
              Check API Status
            </Link>
          </div>
        </section>

        <div className="grid gap-8 mb-24">
          {INTEGRATIONS.map((item) => (
            <details key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group transition-all hover:border-black open:shadow-xl">
              <summary className="list-none cursor-pointer flex flex-col lg:flex-row items-stretch">
                <div className="lg:w-80 bg-gray-50 p-8 flex flex-col justify-between text-black border-r border-gray-100">
                  <div>
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-inner text-white group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter leading-tight">{item.name}</h3>
                    <p className="text-gray-500 font-medium">{item.desc}</p>
                  </div>
                </div>
                <div className="flex-1 p-8 sm:p-12 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Status</h4>
                    <p className="text-sm font-bold text-black mt-1">Ready for Integration</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-open:rotate-180 transition-transform">
                    <ChevronLeft className="w-5 h-5 rotate-[270deg]" />
                  </div>
                </div>
              </summary>
              
              <div className="p-8 sm:p-12 border-t border-gray-100 bg-white">
                <div className="grid md:grid-cols-2 gap-12">
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Setup Steps</h4>
                    <ul className="space-y-4">
                      {item.steps.map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-black flex items-center justify-center text-xs font-black">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-black">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-col">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Integration Snippet</h4>
                    <div className="bg-gray-50 rounded-2xl p-6 font-mono text-xs text-black border border-gray-100 relative group/code overflow-x-auto min-h-[120px]">
                      <pre className="whitespace-pre-wrap">{item.code}</pre>
                      <button 
                        onClick={() => {
                          void navigator.clipboard.writeText(item.code);
                        }}
                        className="absolute top-4 right-4 p-2 bg-black text-white rounded-lg opacity-0 group-hover/code:opacity-100 transition-opacity hover:bg-gray-800 flex items-center gap-2"
                      >
                        <Code className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Copy</span>
                      </button>
                    </div>
                    <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Click button to copy snippet</p>
                    
                    {item.hasVersions && (
                      <div className="mt-8 pt-8 border-t border-gray-50">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Download Plugin</label>
                        <div className="flex items-center gap-2">
                          <select className="bg-white border border-gray-200 text-black text-xs font-bold rounded-lg px-3 py-2 outline-none appearance-none cursor-pointer">
                            <option value="1.0.4">v1.0.4 (Latest)</option>
                            <option value="1.0.3">v1.0.3</option>
                            <option value="1.0.2">v1.0.2</option>
                          </select>
                          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg shadow-lg transition-colors hover:bg-gray-800">
                            <Download className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Download ZIP</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
        <section id="integration" className="scroll-mt-32 my-24 pt-12 border-t border-gray-100">
          <DeveloperHub />
        </section>

        <section id="tester" className="scroll-mt-32 my-24 pt-12 border-t border-gray-100">
          <ApiTester />
        </section>

        <section id="api" className="scroll-mt-32 my-24 pt-12 border-t border-gray-100">
          <ApiDocs />
        </section>
      </main>
    </div>
  );
}
