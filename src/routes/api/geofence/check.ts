import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/geofence/check')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const lat = parseFloat(url.searchParams.get('lat') || '0');
        const lng = parseFloat(url.searchParams.get('lng') || '0');
        
        // Alger center check
        const isNearAlger = Math.abs(lat - 36.77) < 0.5 && Math.abs(lng - 3.05) < 0.5;
        
        return new Response(JSON.stringify({
          lat,
          lng,
          inside: isNearAlger,
          wilaya: isNearAlger ? 16 : null,
          status: "Beta - Mock Geofence"
        }), { 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
  }
});