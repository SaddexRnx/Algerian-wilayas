import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-black mb-6">{t("report.title")}</h1>
      {success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center text-green-800">
          {t("report.success")}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="number" placeholder="Wilaya Code" className="w-full border p-2" value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value})} />
          <input required type="text" placeholder="Daira" className="w-full border p-2" value={formData.daira} onChange={e => setFormData({...formData, daira: e.target.value})} />
          <input required type="text" placeholder="Commune" className="w-full border p-2" value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} />
          <input type="text" placeholder="ZIP" className="w-full border p-2" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
          <input type="text" placeholder="Village" className="w-full border p-2" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} />
          <textarea placeholder={t("report.message")} className="w-full border p-2" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
          <button disabled={loading} className="w-full bg-black text-white p-3 rounded">{loading ? "..." : t("report.submit")}</button>
        </form>
      )}
    </div>
  );
}
