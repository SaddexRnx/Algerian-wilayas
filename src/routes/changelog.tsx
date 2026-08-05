import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from '@/lib/i18n';
import { CheckCircle2, Package, Map, Database, Sparkles, Globe, ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';



export const Route = createFileRoute('/changelog')({
  component: ChangelogPage,
});

const UPDATES = [
  {
    version: '2.0.0',
    date: 'August 5, 2026',
    title: 'The Ultimate Algerian Data Platform',
    icon: <Sparkles className="w-5 h-5" />,
    changes: [
      'Logistics Engine: Shipping rates and zones for all 69 wilayas.',
      'Geographic Data: Coordinates and interactive Leaflet map.',
      'Demographics: Population statistics and density data.',
      'Economic Indicators: Cost of living and currency exchange rates.',
      'Service Locator: Post offices, Banks, ATMs map.',
      'Travel Utilities: Visa requirements and travel information.',
      'Smart Search: Global fuzzy matching index.',
      'Multi-Format Exports: CSV and SQL datasets.'
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
    version: '1.0.4',
    date: 'May 15, 2026',
    title: 'Trilingual API Overhaul',
    icon: <Globe className="w-5 h-5" />,
    changes: [
      'Added full English support across the platform.',
      'Optimized Arabic and Latin hierarchical API trees.',
      'Improved SEO and OpenGraph metadata.'
    ]
  },
  {
    version: '1.0.1',
    date: 'February 20, 2026',
    title: 'Postal Infrastructure',
    icon: <Map className="w-5 h-5" />,
    changes: [
      'Initial integration of Algerian ZIP codes.',
      'Reverse ZIP lookup endpoint.',
      'Village and neighborhood level details.'
    ]
  },
  {
    version: '1.0.0',
    date: 'January 1, 2026',
    title: 'Grand Launch',
    icon: <Package className="w-5 h-5" />,
    changes: [
      'Initial release with 69 wilayas and 1,541 communes.',
      'Cascading dropdown components.',
      'React, Vanilla JS, and WordPress integration snippets.'
    ]
  }
];

function ChangelogPage() {
  const { lang, t, dir } = useTranslation();
  const isRtl = lang === 'ar';

  const exportChangelog = () => {
    const header = `${t("changelog.title")} - v2.0.0\n${t("changelog.desc")}\n\n`;
    const content = UPDATES.map(u => 
      `[${u.version}] - ${u.date}\n${u.title}\n` + 
      u.changes.map(c => ` - ${c}`).join('\n')
    ).join('\n\n');
    
    const blob = new Blob([header + content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dz-address-picker-changelog-${lang}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div dir={dir} className={`min-h-screen bg-background py-12 px-4 relative ${isRtl ? 'rtl' : ''}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link
            to="/"
            className={`flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-black w-fit ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <span dir="ltr">{isRtl ? '→' : '←'}</span> {t("common.backHome")}
          </Link>

          <button
            onClick={exportChangelog}
            className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 w-fit"
          >
            <Download className="w-4 h-4" />
            {t("changelog.export")}
          </button>
        </div>


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
