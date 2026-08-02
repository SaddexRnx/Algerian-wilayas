import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ar" | "fr";

const LANG_KEY = "dz-address-picker:lang";

const fr = {
  "nav.demo": "Démo",
  "nav.inAction": "En action",
  "nav.integration": "Intégration",
  "nav.api": "API",
  "nav.features": "Fonctionnalités",
  "nav.admin": "Tableau de bord",
  "nav.backHome": "Retour au site",
  "nav.language": "Langue",

  "hero.title": "L'intégration moderne des adresses algériennes.",
  "hero.subtitle":
    "Le jeu de données complet et à jour des 69 wilayas et 1 541 communes. Prêt pour l'e-commerce, les formulaires et les cartes. Zéro dépendance.",
  "hero.ctaDemo": "Voir la démo",
  "hero.ctaCopy": "Copier le code d'intégration",

  "demo.title": "Démo interactive",
  "demo.console": "Console des évènements",
  "demo.waiting": "En attente des évènements",

  "picker.wilaya": "Wilaya",
  "picker.daira": "Daira",
  "picker.commune": "Commune",
  "picker.selectWilaya": "Choisir la Wilaya",
  "picker.selectDaira": "Choisir la Daira",
  "picker.selectCommune": "Choisir la Commune",
  "picker.wilayaFirst": "Choisissez d'abord une wilaya",
  "picker.dairaFirst": "Choisissez d'abord une daira",
  "picker.searchWilaya": "Rechercher une wilaya…",
  "picker.searchDaira": "Rechercher une daira…",
  "picker.searchCommune": "Rechercher une commune…",
  "picker.noMatches": "Aucun résultat",
  "picker.preview": "Aperçu de l'adresse",
  "picker.previewEmpty": "Sélectionnez une wilaya, une daira et une commune.",
  "picker.presetShort": "Courte",
  "picker.presetFull": "Complète",
  "picker.presetCompact": "Compacte",
  "picker.copy": "Copier l'adresse",
  "picker.copied": "Copié !",
  "picker.export": "Exporter en CSV",
  "picker.loading": "Chargement des données",
  "picker.error": "Impossible de charger les données. Vérifiez votre connexion.",
  "picker.retry": "Réessayer",
  "picker.stale": "Réseau indisponible — copie locale affichée.",

  "checkout.title": "Voyez-le en action",
  "checkout.subtitle":
    "Une simulation de commande qui montre le comportement du widget une fois intégré.",
  "checkout.header": "Paiement",
  "checkout.total": "Total : 4 500 DZD",
  "checkout.name": "Nom complet",
  "checkout.phone": "Numéro de téléphone",
  "checkout.play": "▶ Lancer l'animation",
  "checkout.auto": "▶ Démo automatique",
  "checkout.reset": "Réinitialiser",
  "checkout.validated": "Adresse validée",
  "checkout.synced": "Synchronisé avec votre sélection en direct",

  "hub.title": "Espace développeur",
  "hub.subtitle": "Choisissez votre plateforme et collez le code. Sans build, sans dépendance.",
  "hub.liveConfig": "Configuration du widget",
  "hub.liveConfigDesc": "Modifiez ces valeurs : tous les extraits se régénèrent instantanément.",
  "hub.target": "Élément cible",
  "hub.format": "Format de sortie",
  "hub.inputName": "Nom du champ",
  "hub.options": "Attributs disponibles",
  "hub.optionsDesc":
    "Définissez ces attributs sur le conteneur pour contrôler le montage et le format.",
  "hub.copy": "Copier",
  "hub.copied": "Copié !",

  "api.title": "Documentation de l'API",
  "api.subtitle": "Trois points de terminaison en lecture seule, servis depuis le CDN.",
  "api.params": "Paramètres",
  "api.response": "Réponse",
  "api.wilayasDesc": "Liste complète des 69 wilayas avec code, nom arabe et nom latin.",
  "api.dairasDesc": "Toutes les dairas d'une wilaya donnée, identifiée par son code.",
  "api.communesDesc": "Toutes les communes d'une daira donnée.",

  "features.title": "Fonctionnalités",
  "features.fast": "Ultra rapide",
  "features.fastDesc": "Servi par un CDN mondial, les données minifiées chargent en millisecondes.",
  "features.agnostic": "Compatible partout",
  "features.agnosticDesc": "Vanilla JS, React, Vue, WordPress et Shopify.",
  "features.updated": "Toujours à jour",
  "features.updatedDesc": "Reflète les dernières réformes administratives officielles.",

  "footer.text": "Conçu pour la communauté des développeurs algériens. Libre et gratuit.",

  "admin.title": "Tableau de bord",
  "admin.subtitle": "Suivi de l'utilisation du widget et de l'API.",
  "admin.export": "Exporter les données",
  "admin.kpi.calls": "Appels API total",
  "admin.kpi.stores": "Boutiques actives",
  "admin.kpi.loads": "Chargements du widget",
  "admin.kpi.latency": "Temps de réponse moyen",
  "admin.chart.title": "Trafic API et utilisation du widget",
  "admin.range.7": "7 derniers jours",
  "admin.range.30": "30 derniers jours",
  "admin.range.90": "90 derniers jours",
  "admin.series.api": "Appels API",
  "admin.series.widget": "Chargements widget",
  "admin.table.title": "Wilayas les plus sélectionnées",
  "admin.table.search": "Filtrer les wilayas…",
  "admin.table.rank": "Rang",
  "admin.table.name": "Wilaya",
  "admin.table.code": "Code",
  "admin.table.count": "Sélections",
  "admin.table.share": "Part",
  "admin.table.empty": "Aucune wilaya ne correspond.",
  "admin.methods.title": "Méthodes d'intégration",
  "admin.methods.subtitle": "Répartition des installations par plateforme.",
} as const;

export type TranslationKey = keyof typeof fr;

const ar: Record<TranslationKey, string> = {
  "nav.demo": "العرض",
  "nav.inAction": "قيد التشغيل",
  "nav.integration": "الدمج",
  "nav.api": "واجهة البرمجة",
  "nav.features": "المميزات",
  "nav.admin": "لوحة التحكم",
  "nav.backHome": "العودة للموقع",
  "nav.language": "اللغة",

  "hero.title": "الدمج العصري للعناوين الجزائرية.",
  "hero.subtitle":
    "قاعدة بيانات كاملة ومحدّثة لكل الولايات الـ69 و1541 بلدية. جاهزة للمتاجر الإلكترونية والنماذج والخرائط. بدون أي تبعيات.",
  "hero.ctaDemo": "شاهد العرض المباشر",
  "hero.ctaCopy": "نسخ كود الدمج",

  "demo.title": "عرض تفاعلي مباشر",
  "demo.console": "سجل الأحداث",
  "demo.waiting": "في انتظار الأحداث",

  "picker.wilaya": "الولاية",
  "picker.daira": "الدائرة",
  "picker.commune": "البلدية",
  "picker.selectWilaya": "اختر الولاية",
  "picker.selectDaira": "اختر الدائرة",
  "picker.selectCommune": "اختر البلدية",
  "picker.wilayaFirst": "اختر الولاية أولاً",
  "picker.dairaFirst": "اختر الدائرة أولاً",
  "picker.searchWilaya": "ابحث عن ولاية…",
  "picker.searchDaira": "ابحث عن دائرة…",
  "picker.searchCommune": "ابحث عن بلدية…",
  "picker.noMatches": "لا توجد نتائج",
  "picker.preview": "معاينة العنوان",
  "picker.previewEmpty": "اختر الولاية والدائرة والبلدية.",
  "picker.presetShort": "مختصر",
  "picker.presetFull": "كامل",
  "picker.presetCompact": "مضغوط",
  "picker.copy": "نسخ العنوان",
  "picker.copied": "تم النسخ!",
  "picker.export": "تصدير CSV",
  "picker.loading": "جارٍ تحميل البيانات",
  "picker.error": "تعذّر تحميل البيانات. تحقق من اتصالك.",
  "picker.retry": "إعادة المحاولة",
  "picker.stale": "الشبكة غير متوفرة — يتم عرض نسخة محفوظة محلياً.",

  "checkout.title": "شاهده قيد التشغيل",
  "checkout.subtitle": "محاكاة لصفحة الدفع توضح سلوك الأداة بعد دمجها.",
  "checkout.header": "الدفع",
  "checkout.total": "المجموع: 4٬500 دج",
  "checkout.name": "الاسم الكامل",
  "checkout.phone": "رقم الهاتف",
  "checkout.play": "▶ تشغيل العرض",
  "checkout.auto": "▶ عرض تلقائي",
  "checkout.reset": "إعادة",
  "checkout.validated": "تم التحقق من العنوان",
  "checkout.synced": "متزامن مع اختيارك المباشر",

  "hub.title": "مركز المطورين",
  "hub.subtitle": "اختر منصتك وانسخ الكود. بدون أدوات بناء أو تبعيات.",
  "hub.liveConfig": "إعدادات الأداة",
  "hub.liveConfigDesc": "غيّر هذه القيم وسيتم تحديث كل الأكواد فوراً.",
  "hub.target": "العنصر المستهدف",
  "hub.format": "صيغة الإخراج",
  "hub.inputName": "اسم الحقل",
  "hub.options": "الخصائص المتاحة",
  "hub.optionsDesc": "اضبط هذه الخصائص على العنصر الحاوي للتحكم في التركيب وصيغة الإخراج.",
  "hub.copy": "نسخ",
  "hub.copied": "تم النسخ!",

  "api.title": "توثيق الواجهة البرمجية",
  "api.subtitle": "ثلاث نقاط وصول للقراءة فقط، مقدَّمة عبر شبكة توزيع المحتوى.",
  "api.params": "المعاملات",
  "api.response": "الاستجابة",
  "api.wilayasDesc": "قائمة كاملة بالولايات الـ69 مع الرمز والاسم بالعربية واللاتينية.",
  "api.dairasDesc": "كل دوائر ولاية محددة عبر رمزها.",
  "api.communesDesc": "كل بلديات دائرة محددة.",

  "features.title": "المميزات",
  "features.fast": "سرعة فائقة",
  "features.fastDesc": "مستضافة على شبكة عالمية، تُحمَّل البيانات في أجزاء من الثانية.",
  "features.agnostic": "تعمل في كل مكان",
  "features.agnosticDesc": "Vanilla JS وReact وVue وWordPress وShopify.",
  "features.updated": "محدَّثة دائماً",
  "features.updatedDesc": "تعكس آخر الإصلاحات الإدارية الرسمية.",

  "footer.text": "صُنع لمجتمع المطورين الجزائريين. مفتوح ومجاني للاستخدام.",

  "admin.title": "لوحة التحكم",
  "admin.subtitle": "متابعة استخدام الأداة وواجهة البرمجة.",
  "admin.export": "تصدير البيانات",
  "admin.kpi.calls": "إجمالي طلبات API",
  "admin.kpi.stores": "المتاجر النشطة",
  "admin.kpi.loads": "مرات تحميل الأداة",
  "admin.kpi.latency": "متوسط زمن الاستجابة",
  "admin.chart.title": "حركة الواجهة واستخدام الأداة",
  "admin.range.7": "آخر 7 أيام",
  "admin.range.30": "آخر 30 يوماً",
  "admin.range.90": "آخر 90 يوماً",
  "admin.series.api": "طلبات API",
  "admin.series.widget": "تحميلات الأداة",
  "admin.table.title": "الولايات الأكثر اختياراً",
  "admin.table.search": "تصفية الولايات…",
  "admin.table.rank": "الترتيب",
  "admin.table.name": "الولاية",
  "admin.table.code": "الرمز",
  "admin.table.count": "الاختيارات",
  "admin.table.share": "النسبة",
  "admin.table.empty": "لا توجد ولاية مطابقة.",
  "admin.methods.title": "طرق الدمج",
  "admin.methods.subtitle": "توزيع عمليات التركيب حسب المنصة.",
};

const DICT: Record<Lang, Record<TranslationKey, string>> = { fr, ar };

interface I18nValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANG_KEY);
      if (saved === "ar" || saved === "fr") setLangState(saved);
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<I18nValue>(
    () => ({ lang, dir, setLang, t: (key) => DICT[lang][key] ?? key }),
    [lang, dir, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex shrink-0 overflow-hidden rounded-md border border-gray-300"
      dir="ltr"
    >
      {(["ar", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 text-xs font-semibold tracking-wide uppercase transition-all duration-300 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none ${
            lang === l ? "bg-black text-white" : "bg-white text-gray-500 hover:bg-gray-100"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
