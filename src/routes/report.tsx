import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";


export const Route = createFileRoute("/report")({
  component: ReportPage,
});

function ReportPage() {
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    wilaya: "",
    daira: "",
    commune: "",
    zip: "",
    village: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("data_corrections").insert({
      wilaya_code: parseInt(formData.wilaya),
      daira_name: formData.daira,
      commune_name: formData.commune,
      zip_code: formData.zip,
      village_name: formData.village,
      user_message: formData.message,
      language_submitted: lang,
    });
    setLoading(false);
    if (!error) {
      setSuccess(true);
      setFormData({ wilaya: "", daira: "", commune: "", zip: "", village: "", message: "" });
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 font-[system-ui,Inter,sans-serif] antialiased">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8">
        <ChevronLeft className="w-4 h-4" />
        {t("nav.backHome")}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-black uppercase mb-2">{t("report.title")}</h1>
      <p className="text-sm text-gray-500 font-medium mb-8">{t("vote.subtitle")}</p>


      {success ? (
        <div className="rounded-xl border border-black bg-black p-8 text-center text-white shadow-xl animate-in fade-in zoom-in duration-300">
          <div className="mb-4 text-4xl">✓</div>
          <h2 className="text-xl font-bold mb-2">{t("vote.success")}</h2>
          <p className="text-gray-400 text-sm mb-6">{t("leaderboard.privacy")}</p>
          <Link to="/" className="inline-block border border-white/20 px-6 py-2 rounded-lg hover:bg-white/10 transition">
             {t("nav.backHome")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("picker.wilaya")}</label>
              <input required type="number" placeholder="16" className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("picker.daira")}</label>
              <input required type="text" placeholder="Dar El Beida" className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" value={formData.daira} onChange={e => setFormData({...formData, daira: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("picker.commune")}</label>
              <input required type="text" placeholder="Bab Ezzouar" className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("picker.zipLabel")}</label>
              <input type="text" placeholder="16042" className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("picker.village")}</label>
            <input type="text" placeholder="Cité 5 Juillet" className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("report.message")}</label>
            <textarea placeholder="..." rows={4} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
          </div>

          <button disabled={loading} className="w-full bg-black text-white p-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition shadow-lg hover:shadow-black/20 disabled:opacity-50">
            {loading ? "SENDING..." : t("report.submit")}
          </button>

        </form>
      )}
    </div>

  );
}
