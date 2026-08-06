import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Increment API call counter
        try {
          await supabaseAdmin.rpc('increment_api_calls');
        } catch (e) {
          console.error('Failed to increment API calls', e);
        }

        // Return a 404 since this is just a middleware-like catch-all
        // The actual static files are served by the platform.
        // NOTE: In TanStack Start, the static file serving usually takes precedence 
        // if the file exists. This route might only hit for non-existent API files.
        // For a true middleware, we'd need platform-level support or a proxy.
        return new Response('API Call Tracked', { status: 404 });
      }
    }
  }
})
