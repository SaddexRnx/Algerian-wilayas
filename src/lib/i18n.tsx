import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "fr" | "ar";

const LANG_KEY = "dz-address-picker:lang";

const baseTranslations = {
  "nav.demo": { en: "Demo", fr: "Démo", ar: "عرض حي" },
  "nav.inAction": { en: "In Action", fr: "En action", ar: "قيد التشغيل" },
  "nav.integration": { en: "Integration", fr: "Intégration", ar: "التكامل" },
  "nav.api": { en: "API", fr: "API", ar: "برمجية (API)" },
  "nav.map": { en: "Map", fr: "Carte", ar: "الخريطة" },
  "nav.features": { en: "Features", fr: "Fonctionnalités", ar: "الميزات" },
  "nav.admin": { en: "Dashboard", fr: "Tableau de bord", ar: "لوحة التحكم" },
  "nav.backHome": { en: "Back Home", fr: "Retour au site", ar: "الرئيسية" },
  "nav.language": { en: "Language", fr: "Langue", ar: "اللغة" },
  "nav.leaderboard": { en: "Leaderboard", fr: "Classement", ar: "المتصدرين" },
  "nav.vote": { en: "Vote", fr: "Voter", ar: "تصويت" },
  "nav.changelog": { en: "Changelog", fr: "Journal", ar: "سجل التغييرات" },
  "nav.integrations": { en: "Integrations", fr: "Intégrations", ar: "تكاملات" },
  "nav.tester": { en: "Tester", fr: "Testeur", ar: "مختبر" },
  "nav.report": { en: "Report", fr: "Signaler", ar: "تبليغ" },
  "nav.adminLogin": { en: "Admin Login", fr: "Connexion admin", ar: "دخول المشرف" },
  "nav.dashboard": { en: "Dashboard", fr: "Tableau de bord", ar: "لوحة التحكم" },

  "hero.title": { en: "Modern Algerian Address Integration.", fr: "L'intégration moderne des adresses algériennes.", ar: "التكامل الحديث للعناوين الجزائرية." },
  "hero.subtitle": { 
    en: "The complete, up-to-date dataset of 69 wilayas and 1,541 communes. Ready for e-commerce, forms, and maps. Zero dependencies.", 
    fr: "Le jeu de données complet et à jour des 69 wilayas et 1 541 communes. Prêt pour l'e-commerce, les formulaires et les cartes. Zéro dépendance.", 
    ar: "مجموعة البيانات الكاملة والمحدثة لـ 69 ولاية و 1541 بلدية. جاهزة للتجارة الإلكترونية والخرائط. بدون تبعات برمجية." 
  },
  "hero.ctaDemo": { en: "See Demo", fr: "Voir la démo", ar: "عرض التجربة" },
  "hero.ctaCopy": { en: "Copy Integration Code", fr: "Copier le code d'intégration", ar: "نسخ رمز التكامل" },

  "demo.title": { en: "Interactive Demo", fr: "Démo interactive", ar: "تجربة تفاعلية" },
  "demo.console": { en: "Event Console", fr: "Console des évènements", ar: "لوحة الأحداث" },
  "demo.waiting": { en: "Waiting for events...", fr: "En attente des évènements", ar: "بانتظار الأحداث..." },

  "picker.wilaya": { en: "Wilaya", fr: "Wilaya", ar: "الولاية" },
  "picker.daira": { en: "Daira", fr: "Daira", ar: "الدائرة" },
  "picker.commune": { en: "Commune", fr: "Commune", ar: "البلدية" },
  "picker.selectWilaya": { en: "Select Wilaya", fr: "Choisir la Wilaya", ar: "اختر الولاية" },
  "picker.selectDaira": { en: "Select Daira", fr: "Choisir la Daira", ar: "اختر الدائرة" },
  "picker.selectCommune": { en: "Select Commune", fr: "Choisir la Commune", ar: "اختر البلدية" },
  "picker.wilayaFirst": { en: "Pick a wilaya first", fr: "Choisissez d'abord une wilaya", ar: "اختر الولاية أولاً" },
  "picker.dairaFirst": { en: "Pick a daira first", fr: "Choisissez d'abord une daira", ar: "اختر الدائرة أولاً" },
  "picker.searchWilaya": { en: "Search a wilaya…", fr: "Rechercher une wilaya…", ar: "ابحث عن ولاية…" },
  "picker.searchDaira": { en: "Search a daira…", fr: "Rechercher une daira…", ar: "ابحث عن دائرة…" },
  "picker.searchCommune": { en: "Search a commune…", fr: "Rechercher une commune…", ar: "ابحث عن بلدية…" },
  "picker.noMatches": { en: "No results", fr: "Aucun résultat", ar: "لا توجد نتائج" },
  "picker.quick": { en: "Quick Search / ZIP", fr: "Recherche rapide / ZIP", ar: "بحث سريع / رمز بريدي" },
  "picker.quickPlaceholder": { en: "Filter or enter a ZIP code (e.g. 19070)…", fr: "Filtrer ou entrer un code postal (ex. 19070)…", ar: "تصفية أو إدخال رمز بريدي (مثلاً 19070)…" },
  "picker.quickHint": { en: "Type a ZIP code or name to filter results.", fr: "Tapez un code postal ou un nom pour filtrer les résultats.", ar: "اكتب رمزاً بريدياً أو اسماً لتصفية النتائج." },
  "picker.quickDaira": { en: "Daira", fr: "Daira", ar: "دائرة" },
  "picker.quickCommune": { en: "Commune", fr: "Commune", ar: "بلدية" },
  "picker.preview": { en: "Address preview", fr: "Aperçu de l'adresse", ar: "معاينة العنوان" },
  "picker.previewEmpty": { en: "Select a wilaya, a daira and a commune.", fr: "Sélectionnez une wilaya, une daira et une commune.", ar: "اختر الولاية والدائرة والبلدية." },
  "picker.presetShort": { en: "Short", fr: "Courte", ar: "مختصر" },
  "picker.presetFull": { en: "Full", fr: "Complète", ar: "كامل" },
  "picker.presetCompact": { en: "Compact", fr: "Compacte", ar: "مضغوط" },
  "picker.copy": { en: "Copy address", fr: "Copier l'adresse", ar: "نسخ العنوان" },
  "picker.copied": { en: "Copied!", fr: "Copié !", ar: "تم النسخ!" },
  "picker.export": { en: "Export as CSV", fr: "Exporter en CSV", ar: "تصدير CSV" },
  "picker.loading": { en: "Loading data", fr: "Chargement des données", ar: "جارٍ تحميل البيانات" },
  "picker.error": { en: "Could not load data", fr: "Impossible de charger les données", ar: "تعذّر تحميل البيانات" },
  "picker.retry": { en: "Retry", fr: "Réessayer", ar: "إعادة المحاولة" },
  "picker.stale": { en: "Network unavailable", fr: "Réseau indisponible", ar: "الشبكة غير متوفرة" },
  "picker.village": { en: "Village / Neighborhood", fr: "Village / Quartier", ar: "القرية / الحي" },
  "picker.zipInvalid": { en: "Invalid ZIP code", fr: "Code postal invalide", ar: "رمز بريدي غير صالح" },
  "picker.zipNotFound": { en: "ZIP not found", fr: "Code postal non trouvé", ar: "الرمز البريدي غير موجود" },
  "picker.zipDisclaimer": { 
    en: "Postal codes are based on official data. Help us keep it accurate.", 
    fr: "Les codes postaux sont basés sur des données officielles. Aidez-nous à les garder précis.", 
    ar: "الرموز البريدية مستمدة من البيانات الرسمية. ساعدنا في الحفاظ على دقتها." 
  },
  "picker.zipLabel": { en: "ZIP Code", fr: "Code postal", ar: "الرمز البريدي" },
  "picker.searchByZip": { en: "Search by ZIP", fr: "Recherche par ZIP", ar: "البحث بالرمز البريدي" },

  "checkout.title": { en: "See it in action", fr: "Voyez-le en action", ar: "شاهده قيد التشغيل" },
  "checkout.subtitle": { en: "Simulation of a checkout page.", fr: "Simulation d'une page de paiement.", ar: "محاكاة لصفحة الدفع." },
  "checkout.header": { en: "Payment", fr: "Paiement", ar: "الدفع" },
  "checkout.total": { en: "Total: 4,500 DZD", fr: "Total : 4 500 DZD", ar: "المجموع: 4٬500 دج" },
  "checkout.name": { en: "Full Name", fr: "Nom complet", ar: "الاسم الكامل" },
  "checkout.phone": { en: "Phone Number", fr: "Numéro de téléphone", ar: "رقم الهاتف" },
  "checkout.play": { en: "Play Animation", fr: "Lancer l'animation", ar: "تشغيل العرض" },
  "checkout.auto": { en: "Auto Demo", fr: "Démo automatique", ar: "عرض تلقائي" },
  "checkout.reset": { en: "Reset", fr: "Réinitialiser", ar: "إعادة" },
  "checkout.validated": { en: "Address Validated", fr: "Adresse validée", ar: "تم التحقق من العنوان" },
  "checkout.synced": { en: "Synced with live selection", fr: "Synchronisé avec la sélection", ar: "متزامن مع اختيارك" },

  "hub.title": { en: "Developer Hub", fr: "Espace développeur", ar: "مركز المطورين" },
  "hub.subtitle": { en: "Pick your platform and paste the code.", fr: "Choisissez votre plateforme et collez le code.", ar: "اختر منصتك وانسخ الكود." },
  "hub.liveConfig": { en: "Widget Configuration", fr: "Configuration du widget", ar: "إعدادات الأداة" },
  "hub.liveConfigDesc": { en: "Change these values.", fr: "Modifiez ces valeurs.", ar: "غيّر هذه القيم." },
  "hub.target": { en: "Target Element", fr: "Élément cible", ar: "العنصر المستهدف" },
  "hub.format": { en: "Output Format", fr: "Format de sortie", ar: "صيغة الإخراج" },
  "hub.inputName": { en: "Field Name", fr: "Nom du champ", ar: "اسم الحقل" },
  "hub.options": { en: "Attributes", fr: "Attributs", ar: "الخصائص" },
  "hub.optionsDesc": { en: "Set these attributes.", fr: "Définissez ces attributs.", ar: "اضبط هذه الخصائص." },
  "hub.copy": { en: "Copy", fr: "Copier", ar: "نسخ" },
  "hub.copied": { en: "Copied!", fr: "Copié !", ar: "تم النسخ!" },
  "hub.wpTitle": { en: "WordPress Plugin", fr: "Extension WordPress", ar: "إضافة ووردبريس" },
  "hub.wpDesc": { en: "Download ready-to-use plugin.", fr: "Téléchargez l'extension prête à l'emploi.", ar: "نزّل الإضافة الجاهزة." },
  "hub.download": { en: "Download", fr: "Télécharger", ar: "تنزيل" },
  "hub.advanced": { en: "Advanced Options", fr: "Options avancées", ar: "خيارات متقدمة" },
  "hub.showAdvanced": { en: "Show Advanced", fr: "Afficher les options avancées", ar: "إظهار الخيارات المتقدمة" },

  "api.title": { en: "API Documentation", fr: "Documentation API", ar: "توثيق واجهة البرمجة" },
  "api.subtitle": { en: "Static read-only endpoints.", fr: "Points de terminaison statiques.", ar: "نقاط وصول ثابتة." },
  "api.params": { en: "Parameters", fr: "Paramètres", ar: "المعاملات" },
  "api.response": { en: "Response", fr: "Réponse", ar: "الاستجابة" },
  "api.example": { en: "Example", fr: "Exemple", ar: "مثال" },
  "api.note": { en: "Official postal codes integrated.", fr: "Codes postaux officiels intégrés.", ar: "الرموز البريدية الرسمية مدمجة." },
  "api.catBase": { en: "Base", fr: "Base", ar: "الأساسية" },
  "api.catLang": { en: "Language", fr: "Langue", ar: "اللغة" },
  "api.catGranular": { en: "Granular", fr: "Granulaire", ar: "تفصيلية" },
  "api.catZip": { en: "ZIP Lookup", fr: "Recherche ZIP", ar: "بحث الرمز البريدي" },
  "api.theming": { en: "Theming", fr: "Thématisation", ar: "التخصيص" },
  "api.indexDesc": { en: "API Index", fr: "Index API", ar: "فهرس الواجهة" },
  "api.wilayasDesc": { en: "Wilayas List", fr: "Liste des Wilayas", ar: "قائمة الولايات" },
  "api.fullDataDesc": { en: "Full hierarchical data", fr: "Données complètes", ar: "البيانات الكاملة" },
  "api.fullDesc": { en: "Full data", fr: "Données complètes", ar: "البيانات الكاملة" },
  "api.wilayaDetailDesc": { en: "Wilaya detail", fr: "Détails wilaya", ar: "تفاصيل الولاية" },
  "api.wilayaDairasDesc": { en: "Wilaya dairas", fr: "Dairas de la wilaya", ar: "دوائر الولاية" },
  "api.dairaDetailDesc": { en: "Daira detail", fr: "Détails daira", ar: "تفاصيل الدائرة" },
  "api.zipReverseDesc": { en: "ZIP reverse lookup", fr: "Recherche ZIP inversée", ar: "بحث عكسي بالرمز البريدي" },

  "tester.title": { en: "Live API Tester", fr: "Testeur API", ar: "مُختبِر الواجهة" },
  "tester.subtitle": { en: "Send requests to endpoints.", fr: "Envoyez des requêtes.", ar: "أرسل طلبات." },
  "tester.endpoint": { en: "Endpoint", fr: "Point de terminaison", ar: "نقطة الوصول" },
  "tester.send": { en: "Send", fr: "Envoyer", ar: "إرسال" },
  "tester.sending": { en: "Sending...", fr: "Envoi...", ar: "إرسال..." },
  "tester.status": { en: "Status", fr: "Statut", ar: "الحالة" },
  "tester.time": { en: "Time", fr: "Temps", ar: "الزمن" },
  "tester.responseBody": { en: "Response", fr: "Réponse", ar: "الاستجابة" },
  "tester.empty": { en: "No request sent.", fr: "Aucune requête.", ar: "لا يوجد طلب." },
  "tester.error": { en: "Request failed.", fr: "Échec.", ar: "فشل." },

  "features.fast": { en: "Fast", fr: "Rapide", ar: "سريع" },
  "features.fastDesc": { en: "CDN served.", fr: "Servi par CDN.", ar: "عبر CDN." },
  "features.agnostic": { en: "Compatible", fr: "Compatible", ar: "متوافق" },
  "features.agnosticDesc": { en: "Works everywhere.", fr: "Fonctionne partout.", ar: "يعمل في كل مكان." },
  "features.updated": { en: "Updated", fr: "Mis à jour", ar: "محدث" },
  "features.updatedDesc": { en: "Always fresh.", fr: "Toujours frais.", ar: "دائما جديد." },

  "admin.login.title": { en: "Admin Access", fr: "Accès Admin", ar: "دخول المشرف" },
  "admin.login.subtitle": { en: "Sign in to dashboard", fr: "Connectez-vous", ar: "سجّل الدخول" },
  "admin.login.email": { en: "Email", fr: "Email", ar: "البريد" },
  "admin.login.password": { en: "Password", fr: "Mot de passe", ar: "كلمة المرور" },
  "admin.login.submit": { en: "Sign In", fr: "Se connecter", ar: "دخول" },
  "admin.login.loading": { en: "Signing in...", fr: "Connexion...", ar: "جارٍ الدخول..." },
  "admin.login.error": { en: "Error", fr: "Erreur", ar: "خطأ" },
  "admin.logout": { en: "Logout", fr: "Déconnexion", ar: "خروج" },
  "admin.logout.title": { en: "Logout", fr: "Déconnexion", ar: "خروج" },
  "admin.logout.body": { en: "Confirm logout", fr: "Confirmer la déconnexion", ar: "تأكيد الخروج" },
  "admin.logout.cancel": { en: "Cancel", fr: "Annuler", ar: "إلغاء" },
  "admin.logout.confirm": { en: "Confirm", fr: "Confirmer", ar: "تأكيد" },
  "admin.kpi.calls": { en: "Calls", fr: "Appels", ar: "الطلبات" },
  "admin.kpi.stores": { en: "Stores", fr: "Boutiques", ar: "المتاجر" },
  "admin.kpi.loads": { en: "Loads", fr: "Chargements", ar: "التحميلات" },
  "admin.kpi.latency": { en: "Latency", fr: "Latence", ar: "التأخير" },

  "leaderboard.title": { en: "Leaderboard", fr: "Classement", ar: "المتصدرين" },
  "vote.title": { en: "Vote", fr: "Voter", ar: "تصويت" },
  "changelog.title": { en: "Changelog", fr: "Journal", ar: "سجل التغييرات" },
  "integrations.title": { en: "Integrations", fr: "Intégrations", ar: "تكاملات" },
  
  "report.success": { en: "Sent!", fr: "Envoyé !", ar: "تم الإرسال!" },
  "home.reportLink": { en: "Report Error", fr: "Signaler une erreur", ar: "تبليغ عن خطأ" },
};

const fr: any = {};
const en: any = {};
const ar: any = {};

Object.entries(baseTranslations).forEach(([key, values]) => {
  fr[key] = values.fr;
  en[key] = values.en;
  ar[key] = values.ar;
});

export type TranslationKey = keyof typeof baseTranslations;

const DICT: Record<Lang, Record<string, string>> = { fr, ar, en };

interface I18nValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANG_KEY);
      if (saved === "ar" || saved === "fr" || saved === "en") setLangState(saved);
    } catch {
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
    }
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<I18nValue>(
    () => ({ lang, dir, setLang, t: (key) => DICT[lang][key] || key }),
    [lang, dir, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used inside <LanguageProvider>");
  return ctx;
}

// Keep useI18n as an alias for backward compatibility
export const useI18n = useTranslation;

export function ForcedLanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);
  const value = useMemo<I18nValue>(
    () => ({ lang, dir, setLang: () => {}, t: (key) => DICT[lang][key] || key }),
    [lang, dir],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function LanguageToggle() {
  const { lang, setLang } = useTranslation();
  return (
    <div
      role="group"
      aria-label="Language Toggle"
      className="inline-flex shrink-0 overflow-hidden rounded-md border border-gray-300"
      dir="ltr"
    >
      {(["ar", "fr", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 text-xs font-semibold uppercase transition-all duration-300 ${
            lang === l ? "bg-black text-white" : "bg-white text-gray-500 hover:bg-gray-100"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
