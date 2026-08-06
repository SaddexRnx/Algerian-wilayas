import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

export const Route = createFileRoute('/api/public/increment')({
  server: {
    handlers: {
      POST: async () => {
        try {
          await supabaseAdmin.rpc('increment_api_calls');
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
        }
      }
    }
  }
})
