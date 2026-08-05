import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from '@/lib/i18n';

import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ThumbsUp, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/vote')({
  component: VotePage,
});

const FEATURES = [
  { id: 'street-data', title_en: 'Street-level Data', title_ar: 'بيانات على مستوى الشوارع', desc_en: 'Precise house numbers and street names.', desc_ar: 'أرقام منازل وأسماء شوارع دقيقة.' },
  { id: 'mobile-app', title_en: 'Mobile App (iOS/Android)', title_ar: 'تطبيق الهاتف المحمول', desc_en: 'Native mobile SDKs and standalone app.', desc_ar: 'SDKs للهاتف المحمول وتطبيق مستقل.' },
  { id: 'real-time', title_en: 'Real-time Transport Data', title_ar: 'بيانات النقل في الوقت الفعلي', desc_en: 'Live bus and train schedules.', desc_ar: 'مواعيد الحافلات والقطارات المباشرة.' },
  { id: 'offline-sdk', title_en: 'Offline SDK', title_ar: 'SDK للعمل بدون اتصال', desc_en: 'Full address picking without internet.', desc_ar: 'اختيار العناوين بالكامل بدون إنترنت.' },
];

function VotePage() {
  const { lang, t } = useTranslation();
  const isRtl = lang === 'ar';

  const queryClient = useQueryClient();
  const [voterId, setVoterId] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem('dz-voter-id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('dz-voter-id', id);
    }
    setVoterId(id);
  }, []);

  const { data: votes } = useQuery({
    queryKey: ['votes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('feature_votes').select('feature_id');
      const counts: Record<string, number> = {};
      data?.forEach(v => counts[v.feature_id] = (counts[v.feature_id] || 0) + 1);
      return counts;
    }
  });

  const { data: myVotes } = useQuery({
    queryKey: ['my-votes', voterId],
    queryFn: async () => {
      if (!voterId) return [];
      const { data } = await supabase.from('feature_votes').select('feature_id').eq('voter_id', voterId);
      return data?.map(v => v.feature_id) || [];
    },
    enabled: !!voterId
  });

  const voteMutation = useMutation({
    mutationFn: async (featureId: string) => {
      const { error } = await supabase.from('feature_votes').insert({ feature_id: featureId, voter_id: voterId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      queryClient.invalidateQueries({ queryKey: ['my-votes'] });
      toast.success(isRtl ? 'تم تسجيل تصويتك!' : 'Vote recorded!');
    },
    onError: () => {
      toast.error(isRtl ? 'لقد قمت بالتصويت بالفعل لهذا المرفق.' : 'You have already voted for this feature.');
    }
  });

  return (
    <div className={`min-h-screen bg-background py-12 px-4 relative ${isRtl ? 'rtl' : ''}`}>
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-black sm:static sm:mb-8 sm:w-fit"
      >
        <span dir="ltr">←</span> {t("common.backHome")}
      </Link>
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{isRtl ? 'صوّت للميزات القادمة' : 'Vote for Upcoming Features'}</h1>
          <p className="text-muted-foreground">{isRtl ? 'ساعدنا في تحديد أولويات خريطة الطريق الخاصة بنا.' : 'Help us prioritize our roadmap. What should we build next?'}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map(f => {
            const hasVoted = myVotes?.includes(f.id);
            const voteCount = votes?.[f.id] || 0;

            return (
              <div key={f.id} className="bg-card border rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-xl font-bold mb-2">{isRtl ? f.title_ar : f.title_en}</h3>
                  <p className="text-muted-foreground mb-4">{isRtl ? f.desc_ar : f.desc_en}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    {voteCount} {isRtl ? 'صوت' : 'votes'}
                  </span>
                  <button
                    onClick={() => voteMutation.mutate(f.id)}
                    disabled={hasVoted || voteMutation.isPending}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      hasVoted 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    {hasVoted ? <CheckCircle2 className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
                    {hasVoted ? (isRtl ? 'تم التصويت' : 'Voted') : (isRtl ? 'تصويت' : 'Vote')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
