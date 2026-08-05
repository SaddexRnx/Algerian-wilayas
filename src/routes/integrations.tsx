import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@/lib/i18n';
import { ShoppingBag, Code, Terminal, Layers } from 'lucide-react';

export const Route = createFileRoute('/integrations')({
  component: IntegrationsPage,
});

const INTEGRATIONS = [
  {
    id: 'woocommerce',
    name: 'WooCommerce / WordPress',
    desc_en: 'Native plugin for checkout fields synchronization.',
    desc_ar: 'إضافة أصلية لمزامنة حقول الدفع.',
    icon: <ShoppingBag className="w-6 h-6" />,
    difficulty: 'Easy'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    desc_en: 'Custom script for Shopify Liquid themes.',
    desc_ar: 'سكربت مخصص لقوالب Shopify Liquid.',
    icon: <Code className="w-6 h-6" />,
    difficulty: 'Medium'
  },
  {
    id: 'laravel',
    name: 'Laravel / PHP',
    desc_en: 'Composer package for backend validation.',
    desc_ar: 'حزمة Composer للتحقق من البيانات في الخلفية.',
    icon: <Terminal className="w-6 h-6" />,
    difficulty: 'Easy'
  },
  {
    id: 'nodejs',
    name: 'Node.js / React',
    desc_en: 'NPM package with full TypeScript support.',
    desc_ar: 'حزمة NPM مع دعم كامل لـ TypeScript.',
    icon: <Layers className="w-6 h-6" />,
    difficulty: 'Easy'
  }
];

function IntegrationsPage() {
  const { lang, t } = useTranslation();
  const isRtl = lang === 'ar';

  return (
    <div className={`min-h-screen bg-background py-12 px-4 ${isRtl ? 'rtl' : ''}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">{t('integrations.title')}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isRtl ? 'أدلة شاملة لدمج DZ Address Picker في متجرك الحالي.' : 'Comprehensive guides to integrate DZ Address Picker into your existing store.'}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {INTEGRATIONS.map(item => (
            <div key={item.id} className="bg-card border rounded-2xl p-8 hover:border-primary/50 transition-colors group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted border">
                  {item.difficulty}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
              <p className="text-muted-foreground mb-6">
                {isRtl ? item.desc_ar : item.desc_en}
              </p>
              <button className="w-full py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity">
                {isRtl ? 'عرض الدليل' : 'View Guide'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
