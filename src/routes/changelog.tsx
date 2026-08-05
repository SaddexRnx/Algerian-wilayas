import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from '@/lib/i18n';
import { CheckCircle2, Package, Map, Database, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';


export const Route = createFileRoute('/changelog')({
  component: ChangelogPage,
});

const UPDATES = [
  {
    version: '2.0.0-beta.2',
    date: 'August 5, 2026',
    title: 'Economy & Utilities',
    icon: <Sparkles className="w-5 h-5" />,
    changes: [
      'Added Population & Demographics endpoints (Wilaya level).',
      'Added Cost of Living & Real Estate estimates.',
      'Live Currency Exchange rates (Official vs Parallel).',
      'Services locator (Post Offices, Banks, ATMs, Healthcare).',
      'Smart Search with fuzzy matching index.',
      'Data Export formats (CSV/SQL).'
    ]
  },
  {
    version: '2.0.0-beta.1',
    date: 'August 1, 2026',
    title: 'Logistics & Maps',
    icon: <Map className="w-5 h-5" />,
    changes: [
      'Interactive Leaflet map for all 69 wilayas.',
      'Shipping rates API integration (Estimated).',
      'Delivery zones classification (North, Highlands, South).',
      'Pickup points coordinates (Beta).'
    ]
  },
  {
    version: '1.0.5',
    date: 'June 10, 2026',
    title: 'Official Data Integrity',
    icon: <Database className="w-5 h-5" />,
    changes: [
      'Integrated official Algérie Poste dataset.',
      'Fixed ZIP code mapping for 1,977 communes.',
      'Improved Arabic name accuracy for remote regions.'
    ]
  },
  {
    version: '1.0.0',
    date: 'January 1, 2026',
    title: 'Grand Launch',
    icon: <Package className="w-5 h-5" />,
    changes: [
      'Initial release with 69 wilayas.',
      'Cascading dropdown components.',
      'React & Vanilla JS integration snippets.'
    ]
  }
];

function ChangelogPage() {
  const { lang, t } = useTranslation();
  const isRtl = lang === 'ar';


  return (
    <div className={`min-h-screen bg-background py-12 px-4 relative ${isRtl ? 'rtl' : ''}`}>
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-black sm:static sm:mb-8 sm:w-fit"
      >
        <span dir="ltr">←</span> {t("common.backHome")}
      </Link>
      <div className="max-w-3xl mx-auto">

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{isRtl ? 'سجل التغييرات' : 'Changelog'}</h1>
          <p className="text-muted-foreground">{isRtl ? 'تتبع تطور DZ Address Picker من البداية.' : 'Track the evolution of DZ Address Picker from the start.'}</p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {UPDATES.map((update, idx) => (
            <div key={update.version} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {update.icon}
              </div>
              {/* Content */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-primary">{update.version}</span>
                  <time className="text-xs text-muted-foreground">{update.date}</time>
                </div>
                <h3 className="text-xl font-bold mb-4">{update.title}</h3>
                <ul className="space-y-2">
                  {update.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
