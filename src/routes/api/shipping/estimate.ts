import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/shipping/estimate')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        
        return new Response(JSON.stringify({
          from,
          to,
          estimated_distance_km: 450,
          estimated_days: { min: 2, max: 3 },
          base_price: 600,
          currency: "DZD",
          status: "Beta"
        }), { 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
  }
});