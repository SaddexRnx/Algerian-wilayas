import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapContent } from "@/components/MapContent";
import { useTranslation } from "@/lib/i18n";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Interactive Algerian Map | DZ Address Picker" },
      { name: "description", content: "Explore Algerian wilayas, zones, and shipping rates on an interactive map." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { t, dir } = useTranslation();
  return (
    <div dir={dir} className="min-h-screen bg-blue-50/30 font-sans">
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-blue-900 uppercase tracking-tighter">
              {t("nav.backHome")}
            </span>
          </Link>
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm">
                Interactive Logistics Map
             </span>
          </div>
        </div>
      </header>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter mb-2">Algerian Logistics Coverage</h1>
            <p className="text-blue-600 font-medium">Real-time visualization of Wilayas, shipping zones, and transit routes.</p>
          </div>
          <div className="rounded-3xl border-4 border-white bg-white shadow-2xl overflow-hidden min-h-[600px] relative">
            <MapContent />
          </div>
        </div>
      </main>
    </div>
  );
}

