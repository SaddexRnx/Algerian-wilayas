import React, { Suspense, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

// Lazy load the map component to avoid SSR ReferenceError: window is not defined
const LeafletMap = React.lazy(() => import("@/components/LeafletMap"));

export function MapContent() {
  const { t, dir, lang } = useI18n();
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [zones, setZones] = useState<any>(null);
  const [shipping, setShipping] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, zRes, sRes] = await Promise.all([
          fetch("/api/coordinates/wilayas.json"),
          fetch("/api/shipping/zones.json"),
          fetch("/api/shipping/rates.json"),
        ]);
        
        const wData = await wRes.json();
        const zData = await zRes.json();
        const sData = await sRes.json();
        
        setWilayas(wData);
        setZones(zData);
        setShipping(sData);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white font-sans">
        <div className="animate-pulse text-lg font-bold text-black">Loading Algerian Maps...</div>
      </div>
    );
  }

  return (
    <div dir={dir} className="flex h-screen flex-col bg-white font-sans antialiased">
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold text-black uppercase tracking-tighter">{t("nav.map")} - v2.0</h1>
          <a href="/" className="text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors">← {t("nav.backHome")}</a>

        </div>
      </header>

      <div className="flex-1 relative">
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <span className="text-sm text-gray-400 animate-pulse">Initializing Interactive Map...</span>
          </div>
        }>
          <LeafletMap 
            wilayas={wilayas} 
            zones={zones} 
            shipping={shipping} 
            lang={lang} 
            t={t} 
          />
        </Suspense>
      </div>

      <footer className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="mx-auto max-w-7xl flex flex-wrap gap-6 text-xs font-medium text-gray-500 uppercase tracking-widest">
           <div className="flex items-center gap-2">
             <span className="h-3 w-3 rounded-full bg-blue-500"></span> Zone 1: {lang === "ar" ? "الشمال" : "North"}
           </div>
           <div className="flex items-center gap-2">
             <span className="h-3 w-3 rounded-full bg-emerald-500"></span> Zone 2: {lang === "ar" ? "الهضاب العليا" : "Highlands"}
           </div>
           <div className="flex items-center gap-2">
             <span className="h-3 w-3 rounded-full bg-amber-500"></span> Zone 3: {lang === "ar" ? "الجنوب" : "South"}
           </div>
        </div>
      </footer>
    </div>
  );
}
