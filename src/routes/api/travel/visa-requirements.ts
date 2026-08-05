import { createFileRoute } from '@tanstack/react-router';
import fs from 'fs';
import path from 'path';

export const Route = createFileRoute('/api/travel/visa-requirements')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const destination = url.searchParams.get('destination')?.toLowerCase();
        
        const filePath = path.join(process.cwd(), 'public/api/travel/visa-requirements.json');
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        
        if (destination) {
          const match = data.destinations.find((d: any) => d.country.toLowerCase() === destination);
          if (match) {
            return new Response(JSON.stringify(match), { 
              headers: { 'Content-Type': 'application/json' } 
            });
          }
        }
        
        return new Response(raw, { 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
  }
});