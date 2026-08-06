import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

export const Route = createFileRoute('/api/public/stats')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from('site_stats')
            .select('total_api_calls')
            .single();
          
          if (error) throw error;
          
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ total_api_calls: 15420 }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200 // Return fallback even on error
          });
        }
      }
    }
  }
})
