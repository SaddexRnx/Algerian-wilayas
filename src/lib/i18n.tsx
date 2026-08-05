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
  // Navigation
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

  // Hero
  "hero.title": { en: "Modern Algerian Address Integration.", fr: "L'intégration moderne des adresses algériennes.", ar: "التكامل الحديث للعناوين الجزائرية." },
  "hero.subtitle": { 
    en: "The complete, up-to-date dataset of 69 wilayas and 1,541 communes. Ready for e-commerce, forms, and maps. Zero dependencies.", 
    fr: "Le jeu de données complet et à jour des 69 wilayas et 1 541 communes. Prêt pour l'e-commerce, les formulaires et les cartes. Zéro dépendance.", 
    ar: "مجموعة البيانات الكاملة والمحدثة لـ 69 ولاية و 1541 بلدية. جاهزة للتجارة الإلكترونية والخرائط. بدون تبعات برمجية." 
  },
  "hero.ctaDemo": { en: "See Demo", fr: "Voir la démo", ar: "عرض التجربة" },
  "hero.ctaCopy": { en: "Copy Integration Code", fr: "Copier le code d'intégration", ar: "نسخ رمز التكامل" },

  // Updates
  "updates.title": { en: "🚨 MEGA UPDATE TO v2.0.0", fr: "🚨 MÉGA MISE À JOUR v2.0.0", ar: "🚨 تحديث ضخم للإصدار 2.0.0" },
  "updates.showAll": { en: "View Version History", fr: "Voir l'historique", ar: "عرض سجل الإصدارات" },
  "updates.desc": { 
    en: "From address picker to full data platform. Logistics, Maps, Demographics, and Economy for all 69 wilayas.", 
    fr: "De simple sélecteur à plateforme complète. Logistique, Cartes, Démographie et Économie pour les 69 wilayas.", 
    ar: "من مجرد أداة اختيار إلى منصة بيانات كاملة. الخدمات اللوجستية، الخرائط، الديموغرافيا، والاقتصاد لـ 69 ولاية." 
  },

  // Picker & Demo
  "demo.title": { en: "Interactive Demo", fr: "Démo interactive", ar: "تجربة تفاعلية" },
  "demo.console": { en: "Event Console", fr: "Console des évènements", ar: "لوحة الأحداث" },
  "demo.waiting": { en: "Waiting for events...", fr: "En attente des évènements", ar: "بانتظار الأحداث..." },
  "picker.wilaya": { en: "Wilaya", fr: "Wilaya", ar: "الولاية" },
  "picker.daira": { en: "Daira", fr: "Daira", ar: "الدائرة" },
  "picker.commune": { en: "Commune", fr: "Commune", ar: "البلدية" },
  "picker.selectWilaya": { en: "Select Wilaya", fr: "Choisir la Wilaya", ar: "اختر الولاية" },
  "picker.selectDaira": { en: "Select Daira", fr: "Choisir la Daira", ar: "اختر الدائرة" },
  "picker.selectCommune": { en: "Select Commune", fr: "Choisir la Commune", ar: "اختر البلدية" },
  "picker.searchWilaya": { en: "Search a wilaya…", fr: "Rechercher une wilaya…", ar: "ابحث عن ولاية…" },
  "picker.searchDaira": { en: "Search a daira…", fr: "Rechercher une daira…", ar: "ابحث عن دائرة…" },
  "picker.searchCommune": { en: "Search a commune…", fr: "Rechercher une commune…", ar: "ابحث عن بلدية…" },
  "picker.noMatches": { en: "No results", fr: "Aucun résultat", ar: "لا توجد نتائج" },
  "picker.quick": { en: "Quick Search / ZIP", fr: "Recherche rapide / ZIP", ar: "بحث سريع / رمز بريدي" },
  "picker.copy": { en: "Copy address", fr: "Copier l'adresse", ar: "نسخ العنوان" },
  "picker.copied": { en: "Copied!", fr: "Copié !", ar: "تم النسخ!" },
  "picker.export": { en: "Export as CSV", fr: "Exporter en CSV", ar: "تصدير CSV" },
  "picker.village": { en: "Village / Neighborhood", fr: "Village / Quartier", ar: "القرية / الحي" },
  "picker.searchByZip": { en: "Search by ZIP", fr: "Recherche par ZIP", ar: "البحث بالرمز البريدي" },
  "picker.presetShort": { en: "Short", fr: "Courte", ar: "مختصر" },
  "picker.presetFull": { en: "Full", fr: "Complète", ar: "كامل" },
  "picker.presetCompact": { en: "Compact", fr: "Compacte", ar: "مضغوط" },
  "picker.zipInvalid": { en: "Invalid ZIP code", fr: "Code postal invalide", ar: "رمز بريدي غير صالح" },
  "picker.zipNotFound": { en: "ZIP not found", fr: "Code postal non trouvé", ar: "الرمز البريدي غير موجود" },
  "picker.error": { en: "Could not load data", fr: "Impossible de charger les données", ar: "تعذّر تحميل البيانات" },
  "picker.retry": { en: "Retry", fr: "Réessayer", ar: "إعادة المحاولة" },
  "picker.loading": { en: "Loading data", fr: "Chargement des données", ar: "جارٍ تحميل البيانات" },

  // Checkout
  "checkout.title": { en: "See it in action", fr: "Voyez-le en action", ar: "شاهده قيد التشغيل" },
  "checkout.subtitle": { en: "Simulation of a checkout page.", fr: "Simulation d'une page de paiement.", ar: "محاكاة لصفحة الدفع." },
  "checkout.header": { en: "Payment", fr: "Paiement", ar: "الدفع" },
  "checkout.total": { en: "Total: 4,500 DZD", fr: "Total : 4 500 DZD", ar: "المجموع: 4٬500 دج" },
  "checkout.name": { en: "Full Name", fr: "Nom complet", ar: "الاسم الكامل" },
  "checkout.phone": { en: "Phone Number", fr: "Numéro de téléphone", ar: "رقم الهاتف" },

  // API Docs Categories
  "api.catBase": { en: "Admin Divisions", fr: "Divisions admin", ar: "التقسيم الإداري" },
  "api.catLang": { en: "Language-Specific", fr: "Par langue", ar: "حسب اللغة" },
  "api.catZip": { en: "ZIP Lookup", fr: "Recherche ZIP", ar: "بحث الرمز البريدي" },
  "api.catGeo": { en: "Geographic", fr: "Géographique", ar: "الجغرافيا" },
  "api.catLogistics": { en: "Logistics", fr: "Logistique", ar: "الخدمات اللوجستية" },
  "api.catDemo": { en: "Demographics", fr: "Démographie", ar: "الديموغرافيا" },
  "api.catServices": { en: "Services", fr: "Services", ar: "الخدمات" },
  "api.catTravel": { en: "Travel", fr: "Voyage", ar: "السفر" },
  "api.catSmart": { en: "Smart Utilities", fr: "Utilitaires intelligents", ar: "الأدوات الذكية" },
  "api.catExport": { en: "Export", fr: "Exportation", ar: "التصدير" },

  // API Content
  "api.title": { en: "API Documentation", fr: "Documentation API", ar: "توثيق واجهة البرمجة" },
  "api.subtitle": { en: "Comprehensive endpoints for every use case.", fr: "Points de terminaison complets pour chaque cas.", ar: "نقاط وصول شاملة لكل حالة استخدام." },
  "api.example": { en: "Example", fr: "Exemple", ar: "مثال" },
  "api.response": { en: "Response", fr: "Réponse", ar: "الاستجابة" },
  "api.params": { en: "Parameters", fr: "Paramètres", ar: "المعاملات" },
  "api.copyUrl": { en: "Copy URL", fr: "Copier l'URL", ar: "نسخ الرابط" },
  "api.indexDesc": { en: "API index and versioning.", fr: "Index API et versionnage.", ar: "فهرس الواجهة والإصدارات." },
  "api.wilayasDesc": { en: "List all 69 wilayas.", fr: "Liste des 69 wilayas.", ar: "قائمة جميع الـ 69 ولاية." },
  "api.fullDataDesc": { en: "Complete hierarchical dataset.", fr: "Jeu de données hiérarchique complet.", ar: "مجموعة البيانات الهيكلية الكاملة." },
  "api.wilayaDetailDesc": { en: "Details for a specific wilaya.", fr: "Détails d'une wilaya spécifique.", ar: "تفاصيل ولاية معينة." },
  "api.wilayaDairasDesc": { en: "List dairas for a wilaya.", fr: "Liste des dairas d'une wilaya.", ar: "قائمة الدوائر لولاية ما." },
  "api.dairaDetailDesc": { en: "Details for a specific daira.", fr: "Détails d'une daira spécifique.", ar: "تفاصيل دائرة معينة." },
  "api.zipReverseDesc": { en: "Lookup address by ZIP code.", fr: "Recherche par code postal.", ar: "البحث عن العنوان بالرمز البريدي." },

  // API Tester
  "tester.title": { en: "API Tester", fr: "Testeur d'API", ar: "مختبر واجهة البرمجة" },
  "tester.subtitle": { en: "Interactive sandbox to test endpoints in real-time.", fr: "Bac à sable interactif pour tester les points de terminaison.", ar: "بيئة تجريبية تفاعلية لاختبار نقاط الوصول في الوقت الفعلي." },
  "tester.endpoint": { en: "Select Endpoint", fr: "Choisir un point de terminaison", ar: "اختر نقطة الوصول" },
  "tester.send": { en: "Send Request", fr: "Envoyer la requête", ar: "إرسال الطلب" },
  "tester.sending": { en: "Sending...", fr: "Envoi...", ar: "جاري الإرسال..." },

  // API Endpoint descriptions (detailed)
  "api.desc.wilayas": { en: "List all 69 wilayas.", fr: "Liste des 69 wilayas.", ar: "قائمة جميع الـ 69 ولاية." },
  "api.desc.full": { en: "Complete hierarchical dataset.", fr: "Jeu de données hiérarchique complet.", ar: "مجموعة البيانات الهيكلية الكاملة." },
  "api.desc.zipReverse": { en: "Lookup address by ZIP code.", fr: "Recherche par code postal.", ar: "البحث عن العنوان بالرمز البريدي." },
  "api.desc.geo": { en: "Wilaya geographic coordinates.", fr: "Coordonnées géographiques wilaya.", ar: "الإحداثيات الجغرافية للولاية." },
  "api.desc.shipping": { en: "Logistics rates and zones.", fr: "Tarifs et zones logistiques.", ar: "أسعار ومناطق الشحن." },
  "api.desc.population": { en: "Demographic and density data.", fr: "Données démographiques et densité.", ar: "بيانات الديموغرافيا والكثافة." },
  "api.desc.services": { en: "Locate banks, ATMs, and post offices.", fr: "Localiser banques, distributeurs et postes.", ar: "تحديد مواقع البنوك وأجهزة الصراف والبريد." },
  "api.desc.travel": { en: "Visa requirements and travel info.", fr: "Exigences de visa et infos voyage.", ar: "متطلبات التأشيرة ومعلومات السفر." },
  "api.desc.search": { en: "Fuzzy search across all names.", fr: "Recherche floue sur tous les noms.", ar: "البحث التقريبي في جميع الأسماء." },
  "api.desc.export": { en: "Download full data in CSV or SQL.", fr: "Télécharger les données en CSV ou SQL.", ar: "تنزيل البيانات بصيغة CSV أو SQL." },

  // Leaderboard
  "leaderboard.title": { en: "Contributor Leaderboard", fr: "Classement des contributeurs", ar: "لوحة المتصدرين للمساهمين" },
  "leaderboard.subtitle": { en: "Honoring the heroes helping us perfect Algerian address data.", fr: "Honorer les héros qui nous aident à perfectionner les données.", ar: "تكريم الأبطال الذين يساعدون في تحسين بيانات العناوين الجزائرية." },

  // Vote
  "vote.title": { en: "Vote for Upcoming Features", fr: "Votez pour les fonctionnalités", ar: "صوّت للميزات القادمة" },
  "vote.subtitle": { en: "Help us prioritize our roadmap.", fr: "Aidez-nous à prioriser notre feuille de route.", ar: "ساعدنا في تحديد أولويات خريطة الطريق الخاصة بنا." },
  "vote.success": { en: "Vote recorded!", fr: "Vote enregistré !", ar: "تم تسجيل تصويتك!" },
  "vote.error": { en: "Already voted.", fr: "Déjà voté.", ar: "لقد قمت بالتصويت بالفعل." },


  // Changelog
  "changelog.title": { en: "Project Changelog", fr: "Journal des modifications", ar: "سجل التغييرات" },
  "changelog.export": { en: "Export Changelog", fr: "Exporter le journal", ar: "تصدير سجل التغييرات" },
  "changelog.desc": { en: "Historical release notes for DZ Address Picker.", fr: "Notes de version historiques pour DZ Address Picker.", ar: "سجل الإصدارات التاريخي لـ DZ Address Picker." },
  "changelog.v": { en: "Version", fr: "Version", ar: "الإصدار" },
  "changelog.date": { en: "Date", fr: "التاريخ", ar: "التاريخ" },
  "changelog.changes": { en: "Changes", fr: "Modifications", ar: "التغييرات" },


  // Integrations
  "integrations.title": { en: "E-commerce Integrations", fr: "Intégrations E-commerce", ar: "التكامل مع التجارة الإلكترونية" },

  // Developer Hub
  "hub.title": { en: "Developer Hub", fr: "Espace développeur", ar: "مركز المطورين" },
  "hub.subtitle": { en: "Ready-to-use snippets.", fr: "Extraits prêts à l'emploi.", ar: "قصاصات برمجية جاهزة." },
  "hub.copy": { en: "Copy", fr: "Copier", ar: "نسخ" },
  "hub.copied": { en: "Copied!", fr: "Copié !", ar: "تم النسخ!" },

  // Footer & Features
  "footer.text": { en: "Built for the Algerian developer community.", fr: "Conçu pour les développeurs algériens.", ar: "صُنع لمجتمع المطورين الجزائريين." },
  "footer.support": { en: "Support & Community", fr: "Support et communauté", ar: "الدعم والمجتمع" },
  "footer.thanks": { en: "More updates are coming!", fr: "Plus de mises à jour !", ar: "المزيد من التحديثات قادمة!" },
  "home.reportLink": { en: "Report Error", fr: "Signaler une erreur", ar: "تبليغ عن خطأ" },
  "features.fast": { en: "Fast", fr: "Rapide", ar: "سريع" },
  "features.fastDesc": { en: "CDN served.", fr: "Servi par CDN.", ar: "عبر CDN." },
  "features.agnostic": { en: "Compatible", fr: "Compatible", ar: "متوافق" },
  "features.agnosticDesc": { en: "Works everywhere.", fr: "Fonctionne partout.", ar: "يعمل في كل مكان." },
  "features.updated": { en: "Updated", fr: "Mis à jour", ar: "محدث" },
  "features.updatedDesc": { en: "Always fresh.", fr: "Toujours frais.", ar: "دائما جديد." },
  "admin.logout": { en: "Logout", fr: "Déconnexion", ar: "خروج" },
  "admin.kpi.calls": { en: "Calls", fr: "Appels", ar: "الطلبات" },
  "admin.kpi.stores": { en: "Stores", fr: "Boutiques", ar: "المتاجر" },
  "admin.kpi.loads": { en: "Loads", fr: "Chargements", ar: "التحميلات" },
  "admin.kpi.latency": { en: "Latency", fr: "Latence", ar: "التأخير" },
  "common.back": { en: "Back", fr: "Retour", ar: "رجوع" },
  "common.copy": { en: "Copy", fr: "Copier", ar: "نسخ" },
  "common.download": { en: "Download", fr: "Télécharger", ar: "تحميل" },
  "common.search": { en: "Search", fr: "Rechercher", ar: "بحث" },
  "common.submit": { en: "Submit", fr: "Soumettre", ar: "إرسال" },
  "common.vote": { en: "Vote", fr: "Voter", ar: "تصويت" },
  "common.share": { en: "Share", fr: "Partager", ar: "مشاركة" },
  "common.viewGuide": { en: "View Guide", fr: "Voir le guide", ar: "عرض الدليل" },
  "common.backHome": { en: "Back to Home", fr: "Retour à l'accueil", ar: "العودة للرئيسية" },
  "leaderboard.anonymous": { en: "Share my contributions anonymously", fr: "Partager mes contributions anonymement", ar: "مشاركة مساهماتي بشكل مجهول" },
  "leaderboard.privacy": { en: "Your data will be used to improve the database but your identity will not be displayed publicly.", fr: "Vos données seront utilisées pour améliorer la base de données mais votre identité ne sera pas affichée publiquement.", ar: "سيتم استخدام بياناتك لتحسين قاعدة البيانات ولكن لن يتم عرض هويتك علنًا." },
  "vote.voted": { en: "Voted ✓", fr: "Voté ✓", ar: "تم التصويت ✓" },
  "vote.share": { en: "Share this vote", fr: "Partager ce vote", ar: "مشاركة هذا التصويت" },
  "changelog.current": { en: "Current", fr: "Actuel", ar: "الحالي" },
  "integrations.installation": { en: "Step-by-step installation", fr: "Installation étape par étape", ar: "تثبيت خطوة بخطوة" },
  "integrations.copyCode": { en: "Copy Code", fr: "Copier le code", ar: "نسخ الكود" },
  "integrations.downloadPlugin": { en: "Download Plugin", fr: "Télécharger le plugin", ar: "تحميل الإضافة" },
  "integrations.time": { en: "Estimated time", fr: "Temps estimé", ar: "الوقت المقدر" },
  "integrations.difficulty": { en: "Difficulty", fr: "Difficulté", ar: "الصعوبة" },
  "picker.zipDisclaimer": { en: "Postal codes are provided for reference and may vary by specific neighborhood.", fr: "Les codes postaux sont fournis à titre de référence et peuvent varier selon le quartier.", ar: "يتم توفير الرموز البريدية كمرجع وقد تختلف حسب الحي." },
  "picker.preview": { en: "Address Preview", fr: "Aperçu de l'adresse", ar: "معاينة العنوان" },
  "picker.previewEmpty": { en: "Selected address will appear here...", fr: "L'adresse sélectionnée apparaîtra ici...", ar: "سيظهر العنوان المختار هنا..." },
  "picker.zipLabel": { en: "Postal Code", fr: "Code postal", ar: "الرمز البريدي" },
  "picker.wilayaFirst": { en: "Select wilaya first", fr: "Choisir d'abord la wilaya", ar: "اختر الولاية أولاً" },
  "picker.dairaFirst": { en: "Select daira first", fr: "Choisir d'abord la daira", ar: "اختر الدائرة أولاً" },
  "admin.table.zip": { en: "ZIP", fr: "ZIP", ar: "الرمز البريدي" },
  "check.auto": { en: "Auto-fill Demo", fr: "Démo remplissage auto", ar: "عرض الملء التلقائي" },
  "transit.title": { en: "Transit & Routes", fr: "Transit et itinéraires", ar: "النقل والمسارات" },
  "transit.disclaimer": { en: "Static data - Live tracking coming soon. Data is based on published schedules.", fr: "Données statiques - Suivi en direct bientôt. Basé sur les horaires publiés.", ar: "بيانات ثابتة - تتبع حي قريبًا. البيانات مبنية على الجداول المنشورة." },
  "admin.searchedZip": { en: "Searched ZIP", fr: "ZIP recherché", ar: "الرمز المبحوث" },
  "admin.resultZip": { en: "Result ZIP", fr: "ZIP résultant", ar: "الرمز الناتج" },
  "admin.i18n.title": { en: "I18n Validation", fr: "Validation I18n", ar: "تحقق اللغات" },
  "admin.i18n.missing": { en: "Missing Keys", fr: "Clés manquantes", ar: "مفاتيح مفقودة" },
  "admin.i18n.duplicate": { en: "Duplicate Values", fr: "Valeurs en double", ar: "قيم مكررة" },
  "admin.i18n.untranslated": { en: "Untranslated", fr: "Non traduit", ar: "غير مترجم" },
  "admin.i18n.scan": { en: "Scan UI Routes", fr: "Scanner les routes UI", ar: "فحص مسارات الواجهة" },
  "admin.health.title": { en: "API Health Checker", fr: "Vérificateur de santé API", ar: "فحص صحة الواجهة" },
  "admin.health.checkAll": { en: "Validate All Endpoints", fr: "Valider tous les points", ar: "التحقق من جميع النقاط" },
  "admin.health.pass": { en: "Pass", fr: "Passé", ar: "ناجح" },
  "admin.health.fail": { en: "Fail", fr: "Échec", ar: "فشل" },
  "admin.health.status": { en: "Status", fr: "Statut", ar: "الحالة" },
  "admin.health.lastCheck": { en: "Last Checked", fr: "Dernière vérification", ar: "آخر فحص" },

  "admin.zipMismatch": { en: "ZIP Mismatch Error", fr: "Erreur de correspondance ZIP", ar: "خطأ في تطابق الرمز" },
};


const fr: any = {};
const en: any = {};
const ar: any = {};

Object.entries(baseTranslations).forEach(([key, values]: [string, any]) => {
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
