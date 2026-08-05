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
  "picker.quick": "Recherche rapide / ZIP",
  "picker.quickPlaceholder": "Filtrer ou entrer un code postal (ex. 19070)…",
  "picker.quickHint": "Tapez un code postal ou un nom pour filtrer les résultats.",
  "picker.quickDaira": "Daira",
  "picker.quickCommune": "Commune",
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
  "api.subtitle": "Points de terminaison statiques en lecture seule, servis depuis le CDN.",
  "api.params": "Paramètres",
  "api.response": "Réponse",
  "api.example": "Exemple",
  "api.note":
    "Postal codes are sourced from official Algérie Poste data and community corrections. Please use the 'Report Incorrect Data' feature to help us maintain 100% accuracy.",
  "api.wilayasDesc": "Liste légère des 69 wilayas avec code, nom arabe et nom latin.",
  "api.fullDataDesc": "Jeu de données hiérarchique complet : wilayas, dairas et communes dans un seul fichier.",
  "api.fullDesc": "Jeu de données hiérarchique complet : wilayas, dairas et communes dans un seul fichier.",
  "api.wilayaDesc": "Détail complet d'une wilaya : ses dairas et leurs communes.",
  "api.wilayaDetailDesc": "Détail complet d'une wilaya : ses dairas et leurs communes.",
  "api.wilayaDairasDesc": "Liste des dairas d'une wilaya, avec le nombre de communes.",
  "api.wilayaDairasFlatDesc": "Dairas et communes d'une wilaya uniquement. Bien plus léger que full-data.json ; filtrez le tableau côté client.",
  "api.dairasDesc": "Toutes les dairas d'une wilaya donnée, identifiée par son code.",
  "api.catBase": "Points de terminaison de base",
  "api.catLang": "Points de terminaison par langue",
  "api.catGranular": "Points de terminaison granulaires",
  "api.catZip": "Recherche par Code Postal",
  "api.theming": "Envie de l'assortir à votre marque ? Surchargez nos variables CSS :",

  "tester.title": "Testeur d'API en direct",
  "tester.subtitle":
    "Envoyez une vraie requête aux points de terminaison statiques et inspectez la réponse.",
  "tester.endpoint": "Point de terminaison",
  "tester.send": "Envoyer la requête",
  "tester.sending": "Envoi…",
  "tester.status": "Statut",
  "tester.time": "Temps",
  "tester.responseBody": "Réponse",
  "tester.empty": "Aucune requête envoyée.",
  "tester.error": "Échec de la requête.",
  "nav.tester": "Testeur d'API",
  "hub.advanced": "Options avancées",
  "hub.showAdvanced": "Afficher les options avancées",
  "picker.zipDisclaimer": "Postal codes are sourced from official Algérie Poste data and community corrections. Please use the 'Report Incorrect Data' feature to help us maintain 100% accuracy.",



  "features.title": "Fonctionnalités",
  "features.fast": "Ultra rapide",
  "features.fastDesc": "Servi par un CDN mondial, les données minifiées chargent en millisecondes.",
  "features.agnostic": "Compatible partout",
  "features.agnosticDesc": "Vanilla JS, React, Vue, WordPress et Shopify.",
  "features.updated": "Toujours à jour",
  "features.updatedDesc": "Reflète les dernières réformes administratives officielles, avec des corrections communautaires.",

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
  "admin.logout.title": "Voulez-vous vraiment vous déconnecter ?",
  "admin.logout.body": "Vous devrez vous reconnecter pour accéder au tableau de bord.",
  "admin.logout.cancel": "Annuler",
  "admin.logout.confirm": "Confirmer",
  "admin.sessionExpired": "Session expirée — redirection vers la connexion…",
  "admin.kpi.sessions": "Sessions actives",
  "admin.endpoints.title": "Points de terminaison les plus demandés",
  "admin.sources.title": "Trafic par source",
  "admin.refresh": "Actualiser",
  "admin.loading": "Chargement…",
  "admin.live": "Données en direct",

  "hub.wpTitle": "Extension WordPress",
  "hub.wpDesc":
    "Téléchargez l'extension prête à l'emploi : le zip est généré dans votre navigateur.",
  "hub.download": "Télécharger l'extension Version",
  "hub.downloading": "Création du zip…",
  "hub.downloadError": "Fichier du plugin temporairement indisponible.",

  "tester.inputLabel": "Entrez le code ou le nom de la wilaya (ex. 16, Alger, أو وهران)",
  "tester.inputPlaceholder": "16 / Alger / وهران",
  "tester.notFound": "Aucune wilaya ne correspond à ce code ou nom.",
  "tester.resolved": "Résolu en",

  "api.indexDesc": "Index de découverte listant tous les points de terminaison disponibles.",
  "nav.adminLogin": "Connexion admin",
  "nav.dashboard": "Tableau de bord",
  "api.wilayaCommunesDesc": "Liste à plat de toutes les communes d'une wilaya.",
  "api.dairaDetailDesc": "Détail d'une daira précise et de ses communes.",
  "api.zipReverseDesc": "Recherche inversée d'un code postal pour obtenir la wilaya, la daira et la commune correspondantes.",
  "updates.title": "🚨 MISE À JOUR CRITIQUE DES DONNÉES v1.0.5",
  "updates.body": "v1.0.5 : Intégration de l'ensemble de données officiel d'Algérie Poste (via GeoAlgeria). Les codes postaux sont désormais 100 % précis et mappés officiellement aux communes.",

  "picker.searchByZip": "Search by ZIP Code / Postal Code",
  "picker.village": "Village / Neighborhood",
  "picker.zipLabel": "Enter 5-digit ZIP code",
  "admin.reports": "Rapports ZIP",
  "admin.reports.empty": "Aucun rapport soumis pour le moment.",
  "admin.table.village": "Village",
  "admin.table.zip": "Code postal",
  "admin.table.date": "Date",
  "admin.table.status": "Statut",
  "admin.status.pending": "En attente",
  "admin.status.approved": "Approuvé",
  "admin.approve": "Approuver",
  "picker.zipInvalid": "Code postal invalide. Doit comporter 5 chiffres.",
  "picker.zipNotFound": "Code postal non trouvé dans notre base de données.",
  "nav.report": "Signaler une erreur",
  "report.title": "Signaler une correction de données",
  "report.success": "Envoyé avec succès ! Merci de nous aider à garder la base de données des adresses algériennes précise.",
  "report.submit": "Envoyer la correction",
  "report.message": "Message supplémentaire (optionnel)",
  "admin.corrections": "Corrections de données",
  "updates.showAll": "Afficher toutes les mises à jour",
  "tester.help.index": "Aucun paramètre requis. Récupère toutes les wilayas.",
  "tester.help.wilayas": "Aucun paramètre requis. Récupère la liste des wilayas.",
  "tester.help.full": "Aucun paramètre requis. Récupère toutes les données.",
  "tester.help.wilaya": "Enter Wilaya Code (e.g., 16, 19)",
  "tester.help.dairas": "Enter Wilaya Code to see its dairas",
  "tester.help.daira": "Enter Wilaya Code and Daira Slug",
  "tester.help.zip": "Enter 5-digit ZIP code (e.g., 19070)",
  "tester.help.lang": "No parameters required. Returns language-specific data.",
  "updates.v104": "الإصدار v1.0.4: تم تصحيح دقة تعيين الرموز البريدية، وإضافة نقاط وصول ديناميكية خاصة باللغة (/api/ar/ و /api/latin/)، وتحسين مُختبِر واجهة البرمجة، وتطوير توثيق مركز المطورين.",

  "home.reportLink": "Quelque chose ne va pas avec les données ? Cliquez ici pour soumettre une correction.",

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
  "picker.quick": "بحث سريع / رمز بريدي",
  "picker.quickPlaceholder": "تصفية أو إدخال رمز بريدي (مثلاً 19070)…",
  "picker.quickHint": "اكتب رمزاً بريدياً أو اسماً لتصفية النتائج.",
  "picker.quickDaira": "دائرة",
  "picker.quickCommune": "بلدية",
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
  "api.subtitle": "نقاط وصول ثابتة للقراءة فقط، مقدَّمتان عبر شبكة توزيع المحتوى.",
  "api.params": "المعاملات",
  "api.response": "الاستجابة",
  "api.example": "مثال",
  "api.note":
    "الرموز البريدية مستمدة من بيانات بريد الجزائر الرسمية وتصحيحات المجتمع. يرجى استخدام ميزة 'الإبلاغ عن بيانات غير صحيحة' لمساعدتنا في الحفاظ على دقة بنسبة 100%.",
  "api.wilayasDesc": "قائمة خفيفة بالولايات الـ69 مع الرمز والاسم بالعربية واللاتينية.",
  "api.fullDesc": "مجموعة البيانات الهرمية الكاملة: الولايات والدوائر والبلديات في ملف واحد.",
  "api.dairasDesc": "كل دوائر ولاية محددة عبر رمزها.",
  "api.catBase": "Points de terminaison de base",
  "api.catLang": "Points de terminaison par langue",
  "api.catGranular": "Points de terminaison granulaires",
  "api.catZip": "Recherche par Code Postal",
  "api.theming": "تريد مطابقة هوية علامتك؟ عدِّل متغيرات CSS الخاصة بنا:",

  "tester.title": "مُختبِر الواجهة البرمجية",
  "tester.subtitle": "أرسل طلبًا حقيقيًا إلى نقاط الوصول الثابتة وافحص الاستجابة.",
  "tester.endpoint": "نقطة الوصول",
  "tester.send": "إرسال الطلب",
  "tester.sending": "جارٍ الإرسال…",
  "tester.status": "الحالة",
  "tester.time": "الزمن",
  "tester.responseBody": "الاستجابة",
  "tester.empty": "لم يتم إرسال أي طلب بعد.",
  "tester.error": "فشل الطلب.",
  "nav.tester": "مُختبِر API",



  "features.title": "المميزات",
  "features.fast": "سرعة فائقة",
  "features.fastDesc": "يتم تقديمه من شبكة CDN عالمية، ويتم تحميل البيانات المصغرة في أجزاء من الثانية.",
  "features.agnostic": "تعمل في كل مكان",
  "features.agnosticDesc": "Vanilla JS وReact وVue وWordPress وShopify.",
  "features.updated": "محدث دائما",
  "features.updatedDesc": "يعكس أحدث الإصلاحات الإدارية الجزائرية الرسمية، مع تصحيحات من المجتمع.",

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
  "admin.logout.title": "هل تريد تسجيل الخروج؟",
  "admin.logout.body": "ستحتاج إلى تسجيل الدخول مجددًا لعرض لوحة التحكم.",
  "admin.logout.cancel": "إلغاء",
  "admin.logout.confirm": "تأكيد",
  "admin.sessionExpired": "انتهت الجلسة — جارٍ التحويل إلى تسجيل الدخول…",
  "admin.kpi.sessions": "الجلسات النشطة",
  "admin.endpoints.title": "أكثر المسارات طلبًا",
  "admin.sources.title": "حركة المرور حسب المصدر",
  "admin.refresh": "تحديث",
  "admin.loading": "جارٍ التحميل…",
  "admin.live": "بيانات مباشرة",

  "hub.wpTitle": "إضافة ووردبريس",
  "hub.wpDesc": "نزّل الإضافة الجاهزة، يتم إنشاء ملف الـ zip داخل متصفحك.",
  "hub.download": "تنزيل نسخة الإضافة",
  "hub.downloading": "جارٍ إنشاء الملف…",
  "hub.downloadError": "ملف الإضافة غير متاح مؤقتًا.",

  "tester.inputLabel": "أدخل رمز الولاية أو اسمها (مثال: 16، Alger، وهران)",
  "tester.inputPlaceholder": "16 / Alger / وهران",
  "tester.notFound": "لا توجد ولاية مطابقة لهذا الرمز أو الاسم.",
  "tester.resolved": "تم التعرف على",

  "api.indexDesc": "فهرس يعرض جميع المسارات المتاحة.",
  "api.fullDataDesc": "مجموعة البيانات الهرمية الكاملة: الولايات والدوائر والبلديات في ملف واحد.",
  "api.wilayaDesc": "تفاصيل ولاية واحدة مع دوائرها وبلدياتها.",
  "api.wilayaDetailDesc": "تفاصيل كاملة عن ولاية معينة: دوائرها وبلدياتها.",
  "api.wilayaDairasDesc": "قائمة دوائر ولاية معينة مع عدد البلديات.",
  "api.wilayaDairasFlatDesc": "دوائر وبلديات ولاية معينة فقط. أخف بكثير من full-data.json؛ رشّح المصفوفة من جهة العميل.",
  "nav.adminLogin": "دخول المشرف",
  "nav.dashboard": "لوحة التحكم",
  "api.wilayaCommunesDesc": "قائمة مسطحة بكل بلديات الولاية.",
  "api.dairaDetailDesc": "تفاصيل دائرة محددة وبلدياتها.",
  "api.zipReverseDesc": "البحث العكسي عن الرمز البريدي للحصول على الولاية والدائرة والبلدية المقابلة.",
  "updates.title": "🚨 تحديث بيانات حرج v1.0.5",
  "updates.body": "الإصدار v1.0.5: دمج مجموعة البيانات الرسمية لبريد الجزائر (عبر GeoAlgeria). الرموز البريدية الآن دقيقة بنسبة 100% ومربوطة رسمياً بالبلديات.",

  "picker.searchByZip": "البحث عن طريق الرمز البريدي / الرمز البريدي",
  "picker.village": "القرية / الحي",
  "picker.zipLabel": "أدخل الرمز البريدي المكون من 5 أرقام",
  "admin.reports": "تقارير الرمز البريدي",
  "admin.reports.empty": "لا توجد تقارير مقدمة بعد.",
  "admin.table.village": "القرية",
  "admin.table.zip": "الرمز البريدي",
  "admin.table.date": "التاريخ",
  "admin.table.status": "الحالة",
  "admin.status.pending": "قيد الانتظار",
  "admin.status.approved": "مقبول",
  "admin.approve": "قبول",
  "picker.zipInvalid": "رمز بريدي غير صالح. يجب أن يتكون من 5 أرقام.",
  "picker.zipNotFound": "الرمز البريدي غير موجود في قاعدة بياناتنا.",
  "nav.report": "الإبلاغ عن خطأ",
  "report.title": "الإبلاغ عن تصحيح البيانات",
  "report.success": "تم الإرسال بنجاح! شكرًا لك على مساعدتنا في الحفاظ على دقة قاعدة بيانات العناوين الجزائرية.",
  "report.submit": "إرسال التصحيح",
  "report.message": "رسالة إضافية (اختياري)",
  "admin.corrections": "تصحيحات البيانات",
  "updates.showAll": "عرض جميع التحديثات",
  "tester.help.index": "لا توجد معلمات مطلوبة. يجلب جميع الولايات.",
  "tester.help.wilayas": "لا توجد معلمات مطلوبة. يجلب قائمة الولايات.",
  "tester.help.full": "لا توجد معلمات مطلوبة. يجلب كافة البيانات.",
  "tester.help.wilaya": "أدخل كود الولاية (مثلاً 16، 19)",
  "tester.help.dairas": "أدخل كود الولاية لرؤية دوائرها",
  "tester.help.daira": "أدخل كود الولاية واسم الدائرة",
  "tester.help.zip": "أدخل رمز بريدي مكون من 5 أرقام (مثلاً 19070)",
  "tester.help.lang": "لا توجد معلمات مطلوبة. يرجع بيانات خاصة باللغة.",
  "updates.v104": "الإصدار v1.0.4: تم تصحيح دقة تعيين الرموز البريدية، وإضافة نقاط وصول ديناميكية خاصة باللغة (/api/ar/ و /api/latin/)، وتحسين مُختبِر واجهة البرمجة، وتطوير توثيق مركز المطورين.",
  "hub.advanced": "خيارات متقدمة",
  "hub.showAdvanced": "إظهار الخيارات المتقدمة",
  "picker.zipDisclaimer": "ملاحظة: تعتمد الرموز البريدية على بيانات إدارية قديمة وقد تكون غير دقيقة. يرجى استخدام ميزة 'الإبلاغ عن بيانات غير صحيحة' لمساعدتنا في تحديث قاعدة البيانات.",
  "home.reportLink": "هل هناك خطأ في البيانات؟ اضغط هنا لتقديم تصحيح.",

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
  "picker.quick": "Quick Search / ZIP",
  "picker.quickPlaceholder": "Filter or enter a ZIP code (e.g. 19070)…",
  "picker.quickHint": "Type a ZIP code or name to filter results.",
  "picker.quickDaira": "Daira",
  "picker.quickCommune": "Commune",
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
  "api.subtitle": "Static read-only endpoints, served from the CDN.",
  "api.params": "Parameters",
  "api.response": "Response",
  "api.example": "Example",
  "api.note":
    "Postal codes are sourced from official Algérie Poste data and community corrections. Please use the 'Report Incorrect Data' feature to help us maintain 100% accuracy.",
  "api.wilayasDesc": "Lightweight list of the 69 wilayas with code, Arabic name and Latin name.",
  "api.fullDesc": "Complete hierarchical dataset: wilayas, dairas and communes in a single file.",
  "api.dairasDesc": "All dairas of a given wilaya, identified by its code.",
  "api.catBase": "Base Endpoints",
  "api.catLang": "Language-Specific Endpoints",
  "api.catGranular": "Granular Endpoints",
  "api.catZip": "ZIP Code Lookup",
  "api.theming": "Want to match your brand? Override our CSS variables:",

  "tester.title": "Live API Tester",
  "tester.subtitle": "Send a real request to the static endpoints and inspect the response.",
  "tester.endpoint": "Endpoint",
  "tester.send": "Send Request",
  "tester.sending": "Sending…",
  "tester.status": "Status",
  "tester.time": "Time",
  "tester.responseBody": "Response",
  "tester.empty": "No request sent yet.",
  "tester.error": "Request failed.",
  "nav.tester": "API Tester",



  "features.title": "Features",
  "features.fast": "Blazing fast",
  "features.fastDesc": "Served from a global CDN, the minified data loads in milliseconds.",
  "features.agnostic": "Works everywhere",
  "features.agnosticDesc": "Vanilla JS, React, Vue, WordPress and Shopify.",
  "features.updated": "Always up to date",
  "features.updatedDesc": "Reflects the latest official administrative reforms, with community-driven corrections.",

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
  "admin.logout.title": "Are you sure you want to sign out?",
  "admin.logout.body": "You will need to sign in again to view the dashboard.",
  "admin.logout.cancel": "Cancel",
  "admin.logout.confirm": "Confirm",
  "admin.sessionExpired": "Session expired — redirecting to sign in…",
  "admin.kpi.sessions": "Active sessions",
  "admin.endpoints.title": "Most requested endpoints",
  "admin.sources.title": "Traffic by source",
  "admin.refresh": "Refresh",
  "admin.loading": "Loading…",
  "admin.live": "Live data",

  "hub.wpTitle": "WordPress plugin",
  "hub.wpDesc": "Download the ready-to-install plugin — the zip is built right in your browser.",
  "hub.download": "Download Plugin Version",
  "hub.downloading": "Building zip…",
  "hub.downloadError": "Plugin file temporarily unavailable.",

  "tester.inputLabel": "Enter a wilaya code or name (e.g. 16, Alger, وهران)",
  "tester.inputPlaceholder": "16 / Alger / وهران",
  "tester.notFound": "No wilaya matches that code or name.",
  "tester.resolved": "Resolved to",

  "api.indexDesc": "Discovery index listing every available endpoint.",
  "api.fullDataDesc": "Complete hierarchical dataset: wilayas, dairas and communes in a single file.",
  "api.wilayaDesc": "Full detail for one wilaya, including its dairas and communes.",
  "api.wilayaDetailDesc": "Full detail for one wilaya, including its dairas and communes.",
  "api.wilayaDairasDesc": "All dairas of a wilaya with their commune counts.",
  "api.wilayaDairasFlatDesc": "Only the dairas and their communes for one wilaya. Much lighter than full-data.json — filter the array client-side to find your daira.",
  "nav.adminLogin": "Admin Login",
  "nav.dashboard": "Dashboard",
  "api.wilayaCommunesDesc": "Flat list of every commune inside a wilaya.",
  "api.dairaDetailDesc": "Detail for a single daira and its communes.",
  "api.zipReverseDesc": "Reverse lookup a ZIP code to get the corresponding Wilaya, Daira, and Commune.",
  "updates.title": "🚨 CRITICAL COMPREHENSIVE UPDATE TO v1.0.4",
  "updates.body": "v1.0.4: Fixed ZIP code mapping accuracy, added dynamic language-specific endpoints (/api/ar/ and /api/latin/), improved API tester, and enhanced Developer Hub documentation.",

  "picker.searchByZip": "Search by ZIP Code / Postal Code",
  "picker.village": "Village / Neighborhood",
  "picker.zipLabel": "Enter 5-digit ZIP code",
  "admin.reports": "ZIP Reports",
  "admin.reports.empty": "No reports submitted yet.",
  "admin.table.village": "Village",
  "admin.table.zip": "ZIP Code",
  "admin.table.date": "Date",
  "admin.table.status": "Status",
  "admin.status.pending": "Pending",
  "admin.status.approved": "Approved",
  "admin.approve": "Approve",
  "picker.zipInvalid": "Invalid ZIP code. Must be 5 digits.",
  "picker.zipNotFound": "ZIP code not found in our database.",
  "nav.report": "Report an Error",
  "report.title": "Submit a Data Correction",
  "report.success": "Successfully sent! Thank you for helping us keep the Algerian address database accurate.",
  "report.submit": "Submit Correction",
  "report.message": "Additional Message (optional)",
  "admin.corrections": "Data Corrections",
  "updates.showAll": "Show all updates",
  "tester.help.index": "No parameters needed. Fetches all wilayas.",
  "tester.help.wilayas": "No parameters needed. Fetches all wilayas list.",
  "tester.help.full": "No parameters needed. Fetches full data.",
  "tester.help.wilaya": "ENTER A WILAYA CODE (E.G. 16, 19)",
  "tester.help.dairas": "ENTER A WILAYA CODE TO SEE ITS DAIRAS",
  "tester.help.daira": "ENTER A WILAYA CODE AND DAIRA SLUG",
  "tester.help.zip": "ENTER A 5-DIGIT ZIP CODE (E.G. 19070)",
  "tester.help.lang": "No parameters needed. Returns language-specific data.",
  "updates.v104": "v1.0.4: Fixed ZIP code mapping accuracy, added dynamic language-specific endpoints (/api/ar/ and /api/latin/), improved API tester, and enhanced Developer Hub documentation.",

  "hub.advanced": "Advanced Options",
  "hub.showAdvanced": "Show Advanced Options",
  "picker.zipDisclaimer": "Note: Postal codes are based on historical administrative data and may be inaccurate. Please use the 'Report Incorrect Data' feature to help us keep the database updated.",
  "home.reportLink": "Something wrong with the data? Click here to submit a correction.",
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
  const [lang, setLangState] = useState<Lang>("en");

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
