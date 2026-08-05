import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/distance')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        
        // Mock distance calculation
        const distance = Math.floor(Math.random() * 500) + 100;
        
        return new Response(JSON.stringify({
          from,
          to,
          distance_km: distance,
          unit: "km",
          status: "Beta - Estimated"
        }), { 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
  }
});