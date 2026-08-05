import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Star, User, ChevronLeft, ChevronRight } from 'lucide-react';


export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { t, lang, dir } = useTranslation();
  const isRtl = lang === 'ar';


  const { data: leaders, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Mocking leaderboard since real data might be sparse
      // In production, this would query the data_corrections table grouped by user
      const { data, error } = await supabase
        .from('data_corrections')
        .select('reported_by')
        .not('reported_by', 'is', null);
      
      // Simulate leaderboard data
      return [
        { name: 'Sadek R.', contributions: 42, rank: 1, badge: 'Elite Contributor' },
        { name: 'Amine B.', contributions: 28, rank: 2, badge: 'Pro Mapper' },
        { name: 'Karim T.', contributions: 15, rank: 3, badge: 'Verified Scout' },
        { name: 'Sarah M.', contributions: 12, rank: 4, badge: 'Data Helper' },
        { name: 'Omar K.', contributions: 8, rank: 5, badge: 'Newcomer' },
      ];
    }
  });

  return (
    <div dir={dir} className={`min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 relative ${isRtl ? 'rtl' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className={`flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-black mb-8 w-fit ${isRtl ? 'flex-row-reverse' : ''}`}
        >
          <span dir="ltr">{isRtl ? '→' : '←'}</span> {t("common.backHome")}
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {t("leaderboard.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("leaderboard.subtitle")}
          </p>
        </div>

        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left" dir={isRtl ? 'rtl' : 'ltr'}>
              <thead className="bg-gray-50 border-b text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">{t("admin.table.rank")}</th>
                  <th className="px-6 py-4">{t("common.contributor")}</th>
                  <th className="px-6 py-4">{t("common.contributions")}</th>
                  <th className="px-6 py-4">{t("common.badge")}</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{t("common.loading")}</td></tr>
                ) : leaders?.map((leader) => (
                  <tr key={leader.rank} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {leader.rank === 1 && <Trophy className={`w-5 h-5 text-yellow-500 ${isRtl ? 'ml-2' : 'mr-2'}`} />}
                        {leader.rank === 2 && <Medal className={`w-5 h-5 text-gray-400 ${isRtl ? 'ml-2' : 'mr-2'}`} />}
                        {leader.rank === 3 && <Medal className={`w-5 h-5 text-amber-600 ${isRtl ? 'ml-2' : 'mr-2'}`} />}

                        <span className="font-medium">#{leader.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">{leader.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                      {leader.contributions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <Star className="w-3 h-3 mr-1" />
                        {leader.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
