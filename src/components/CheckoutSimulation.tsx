import React, { useEffect, useRef, useState } from "react";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { CheckCircle2, RefreshCw, Zap, MapPin, Building2, PlayCircle } from "lucide-react";

const FIELDS: { labelKey: TranslationKey; icon: React.ReactNode; value: string }[] = [
  { labelKey: "picker.wilaya", icon: <MapPin className="w-4 h-4" />, value: "16 - Alger" },
  { labelKey: "picker.daira", icon: <Building2 className="w-4 h-4" />, value: "Sidi M'hamed" },
  { labelKey: "picker.commune", icon: <Building2 className="w-4 h-4" />, value: "Alger Centre" },
];

const STEP_DELAY = 1000;

export interface LiveAddress {
  wilayaCode: string;
  wilayaName: string;
  dairaName: string;
  communeName: string;
}

export function CheckoutSimulation({ live }: { live?: LiveAddress | undefined }) {
  const { t, dir, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [searchByZip, setSearchByZip] = useState(false);
  const [zipValue, setZipValue] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const liveValues = [
    live?.wilayaCode ? `${String(live.wilayaCode).padStart(2, '0')} - ${live.wilayaName}` : "",
    live?.dairaName ?? "",
    live?.communeName ?? "",
  ];
  const hasLive = liveValues.some(Boolean);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStep(0);
    setSearchByZip(false);
    setZipValue("");
    setRunning(true);
    
    // Simulate ZIP search logic
    timers.current.push(setTimeout(() => {
      setStep(1);
      setSearchByZip(true);
    }, STEP_DELAY));

    timers.current.push(setTimeout(() => {
      setZipValue("19070");
    }, STEP_DELAY * 2));

    timers.current.push(setTimeout(() => {
      setStep(4);
      setRunning(false);
    }, STEP_DELAY * 4));
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(false);
    setStep(0);
    setSearchByZip(false);
    setZipValue("");
  };

  const isComplete = hasLive ? liveValues.every(Boolean) : step >= 4;

  return (
    <div className="w-full mx-auto my-16">
      <div className="bg-white rounded-[2rem] border-4 border-gray-100 shadow-2xl overflow-hidden w-full">
        <div className="bg-black p-6 sm:p-10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
             <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">v2.0 Simulation</span>
                {hasLive && <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-white/10 text-white px-2 py-0.5 rounded animate-pulse"><Zap className="w-3 h-3"/> {t("checkout.synced")}</span>}
             </div>
             <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{t("checkout.header")}</h2>
             <p className="mt-2 text-gray-400 font-medium opacity-90">{t("checkout.total")}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={play}
              disabled={running || hasLive}
              className="bg-white text-black px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:scale-100 flex items-center gap-2 uppercase tracking-widest text-xs"
            >
              {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              {t("checkout.play")}
            </button>
            {(step > 0 || hasLive) && !running && (
               <button onClick={reset} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                 <RefreshCw className="w-5 h-5" />
               </button>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-12 grid lg:grid-cols-2 gap-12" dir={dir}>
          {/* Form Side */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">{t("checkout.name")}</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-black">Sadek Rnx</div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">{t("checkout.phone")}</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-black" dir="ltr">0770 00 00 00</div>
              </div>
            </div>

            {/* The Integrated Picker */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm relative group">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
                 <span className="text-xs font-black text-black uppercase tracking-tighter">DZ Address Picker</span>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{t("picker.searchByZip")}</span>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${(searchByZip || (hasLive && live?.wilayaCode)) ? 'bg-black' : 'bg-gray-200'}`}>
                       <div className={`w-3 h-3 bg-white rounded-full transition-transform ${(searchByZip || (hasLive && live?.wilayaCode)) ? 'translate-x-4' : ''}`}></div>
                    </div>
                 </div>
              </div>

              {(searchByZip || hasLive) ? (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t("picker.zipLabel")}</label>
                    <div className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-black text-black flex items-center justify-between">
                       <span>{hasLive ? (live?.wilayaCode ? '19070' : '—') : (zipValue || '—')}</span>
                       { (zipValue === '19070' || hasLive) && <CheckCircle2 className="w-4 h-4 text-black" /> }
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                    {FIELDS.map((f, i) => (
                      <div key={f.labelKey} className={i === 2 ? 'col-span-2' : ''}>
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t(f.labelKey)}</label>
                         <div className="text-sm font-bold text-black truncate">
                           {(hasLive ? liveValues[i] : (step >= 4 ? f.value : '—'))}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  {FIELDS.map((f, i) => (
                    <div key={f.labelKey} className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t(f.labelKey)}</label>
                      <div className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                         {f.icon} {t(f.labelKey === "picker.wilaya" ? "picker.selectWilaya" : f.labelKey === "picker.daira" ? "picker.selectDaira" : "picker.selectCommune")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t("picker.village")}</label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400">
                  {lang === 'ar' ? 'القرية / الحي' : 'Village / Neighborhood'}
                </div>
              </div>
            </div>
          </div>

          {/* Cart Side */}
          <div className="bg-gray-50 rounded-3xl p-8 flex flex-col justify-between">
             <div>
               <h3 className="text-lg font-black text-black uppercase tracking-tighter mb-6 border-b border-gray-200 pb-4">Order Summary</h3>
               <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-600 font-medium">Original AirPods Pro 2</span>
                     <span className="text-black font-black">45,000 DZD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-600 font-medium">Shipping Fee</span>
                     <span className="text-black font-black">{isComplete ? '600 DZD' : '—'}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                     <span className="text-black font-black uppercase tracking-widest text-xs">Total Amount</span>
                     <span className="text-2xl font-black text-black">{isComplete ? '45,600 DZD' : '45,000 DZD'}</span>
                  </div>
               </div>
             </div>
             
             <button 
               disabled={!isComplete}
               className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all mt-12"
             >
               {t("checkout.validated")}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSimulation;
