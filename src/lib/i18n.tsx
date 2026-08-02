import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ar" | "fr" | "en";

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
  "api.subtitle": "Deux points de terminaison statiques en lecture seule, servis depuis le CDN.",
  "api.params": "Paramètres",
  "api.response": "Réponse",
  "api.example": "Exemple",
  "api.note":
    "Ce sont des points de terminaison statiques, mis en cache sur le CDN. Ils se chargent en moins de 50 ms partout dans le monde et ne nécessitent aucune clé d'API.",
  "api.wilayasDesc": "Liste légère des 69 wilayas avec code, nom arabe et nom latin.",
  "api.fullDesc":
    "Jeu de données hiérarchique complet : wilayas, dairas et communes dans un seul fichier.",
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
  "admin.empty.chart": "Aucune donnée disponible pour le moment.",
  "admin.empty.methods": "Aucune installation enregistrée.",
  "admin.login.title": "Accès administrateur",
  "admin.login.subtitle": "Connectez-vous pour consulter le tableau de bord.",
  "admin.login.email": "Adresse e-mail",
  "admin.login.password": "Mot de passe",
  "admin.login.submit": "Se connecter",
  "admin.login.loading": "Connexion…",
  "admin.login.error": "Identifiants incorrects.",
  "admin.logout": "Se déconnecter",
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
  "api.subtitle": "نقطتا وصول ثابتتان للقراءة فقط، مقدَّمتان عبر شبكة توزيع المحتوى.",
  "api.params": "المعاملات",
  "api.response": "الاستجابة",
  "api.example": "مثال",
  "api.note":
    "هذه نقاط وصول ثابتة ومخزَّنة مؤقتًا على شبكة CDN. تُحمَّل في أقل من 50 مللي ثانية عالميًا ولا تتطلب أي مفتاح API.",
  "api.wilayasDesc": "قائمة خفيفة بالولايات الـ69 مع الرمز والاسم بالعربية واللاتينية.",
  "api.fullDesc": "مجموعة البيانات الهرمية الكاملة: الولايات والدوائر والبلديات في ملف واحد.",
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
  "admin.empty.chart": "لا توجد بيانات حالياً.",
  "admin.empty.methods": "لم يتم تسجيل أي تركيب بعد.",
  "admin.login.title": "دخول المشرف",
  "admin.login.subtitle": "سجّل الدخول لعرض لوحة التحكم.",
  "admin.login.email": "البريد الإلكتروني",
  "admin.login.password": "كلمة المرور",
  "admin.login.submit": "تسجيل الدخول",
  "admin.login.loading": "جارٍ الدخول…",
  "admin.login.error": "بيانات الدخول غير صحيحة.",
  "admin.logout": "تسجيل الخروج",
};

const en: Record<TranslationKey, string> = {
  "nav.demo": "Demo",
  "nav.inAction": "In action",
  "nav.integration": "Integration",
  "nav.api": "API",
  "nav.features": "Features",
  "nav.admin": "Dashboard",
  "nav.backHome": "Back to site",
  "nav.language": "Language",

  "hero.title": "The modern way to integrate Algerian addresses.",
  "hero.subtitle":
    "The complete, up-to-date dataset of all 69 wilayas and 1,541 communes. Ready for e-commerce, forms and maps. Zero dependencies.",
  "hero.ctaDemo": "See the demo",
  "hero.ctaCopy": "Copy integration code",

  "demo.title": "Interactive demo",
  "demo.console": "Event console",
  "demo.waiting": "Waiting for events",

  "picker.wilaya": "Wilaya",
  "picker.daira": "Daira",
  "picker.commune": "Commune",
  "picker.selectWilaya": "Select wilaya",
  "picker.selectDaira": "Select daira",
  "picker.selectCommune": "Select commune",
  "picker.wilayaFirst": "Pick a wilaya first",
  "picker.dairaFirst": "Pick a daira first",
  "picker.searchWilaya": "Search a wilaya…",
  "picker.searchDaira": "Search a daira…",
  "picker.searchCommune": "Search a commune…",
  "picker.noMatches": "No results",
  "picker.preview": "Address preview",
  "picker.previewEmpty": "Select a wilaya, a daira and a commune.",
  "picker.presetShort": "Short",
  "picker.presetFull": "Full",
  "picker.presetCompact": "Compact",
  "picker.copy": "Copy address",
  "picker.copied": "Copied!",
  "picker.export": "Export as CSV",
  "picker.loading": "Loading data",
  "picker.error": "Could not load the data. Check your connection.",
  "picker.retry": "Retry",
  "picker.stale": "Network unavailable — showing a local copy.",

  "checkout.title": "See it in action",
  "checkout.subtitle": "A mock checkout showing how the widget behaves once integrated.",
  "checkout.header": "Checkout",
  "checkout.total": "Total: 4,500 DZD",
  "checkout.name": "Full name",
  "checkout.phone": "Phone number",
  "checkout.play": "▶ Play animation",
  "checkout.auto": "▶ Auto demo",
  "checkout.reset": "Reset",
  "checkout.validated": "Address validated",
  "checkout.synced": "Synced with your live selection",

  "hub.title": "Developer hub",
  "hub.subtitle": "Pick your platform and paste the code. No build step, no dependencies.",
  "hub.liveConfig": "Widget configuration",
  "hub.liveConfigDesc": "Change these values — every snippet regenerates instantly.",
  "hub.target": "Target element",
  "hub.format": "Output format",
  "hub.inputName": "Field name",
  "hub.options": "Available attributes",
  "hub.optionsDesc": "Set these attributes on the container to control mounting and output format.",
  "hub.copy": "Copy",
  "hub.copied": "Copied!",

  "api.title": "API documentation",
  "api.subtitle": "Two static read-only endpoints, served from the CDN.",
  "api.params": "Parameters",
  "api.response": "Response",
  "api.example": "Example",
  "api.note":
    "These are static, CDN-cached endpoints. They load in <50ms globally and require no API keys.",
  "api.wilayasDesc": "Lightweight list of the 69 wilayas with code, Arabic name and Latin name.",
  "api.fullDesc": "Complete hierarchical dataset: wilayas, dairas and communes in a single file.",
  "api.dairasDesc": "All dairas of a given wilaya, identified by its code.",
  "api.communesDesc": "All communes of a given daira.",

  "features.title": "Features",
  "features.fast": "Blazing fast",
  "features.fastDesc": "Served from a global CDN, the minified data loads in milliseconds.",
  "features.agnostic": "Works everywhere",
  "features.agnosticDesc": "Vanilla JS, React, Vue, WordPress and Shopify.",
  "features.updated": "Always up to date",
  "features.updatedDesc": "Reflects the latest official administrative reforms.",

  "footer.text": "Built for the Algerian developer community. Free and open to use.",

  "admin.title": "Dashboard",
  "admin.subtitle": "Widget and API usage monitoring.",
  "admin.export": "Export data",
  "admin.kpi.calls": "Total API calls",
  "admin.kpi.stores": "Active stores",
  "admin.kpi.loads": "Widget loads",
  "admin.kpi.latency": "Average response time",
  "admin.chart.title": "API traffic and widget usage",
  "admin.range.7": "Last 7 days",
  "admin.range.30": "Last 30 days",
  "admin.range.90": "Last 90 days",
  "admin.series.api": "API calls",
  "admin.series.widget": "Widget loads",
  "admin.table.title": "Most selected wilayas",
  "admin.table.search": "Filter wilayas…",
  "admin.table.rank": "Rank",
  "admin.table.name": "Wilaya",
  "admin.table.code": "Code",
  "admin.table.count": "Selections",
  "admin.table.share": "Share",
  "admin.table.empty": "No wilaya matches.",
  "admin.methods.title": "Integration methods",
  "admin.methods.subtitle": "Installs broken down by platform.",
  "admin.empty.chart": "No data available yet.",
  "admin.empty.methods": "No installs recorded.",
  "admin.login.title": "Admin access",
  "admin.login.subtitle": "Sign in to view the dashboard.",
  "admin.login.email": "Email address",
  "admin.login.password": "Password",
  "admin.login.submit": "Sign in",
  "admin.login.loading": "Signing in…",
  "admin.login.error": "Incorrect credentials.",
  "admin.logout": "Sign out",
};

const DICT: Record<Lang, Record<TranslationKey, string>> = { fr, ar, en };

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
      if (saved === "ar" || saved === "fr" || saved === "en") setLangState(saved);
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

export function ForcedLanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<I18nValue>(
    () => ({ lang, dir, setLang: () => {}, t: (key) => DICT[lang][key] ?? key }),
    [lang, dir],
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
      {(["ar", "fr", "en"] as const).map((l) => (
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
