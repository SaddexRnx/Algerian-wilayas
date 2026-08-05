import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { createServerFn } from '@tanstack/react-start';

export const searchApi = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ q: z.string() }).parse)
  .handler(async ({ data }) => {
    const searchIndex = JSON.parse(await import('fs').then(fs => fs.readFileSync('public/api/search-index.json', 'utf8')));
    const query = data.q.toLowerCase();
    return searchIndex.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.name_ar && item.name_ar.includes(query))
    ).slice(0, 20);
  });

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get('q') || '';
        const searchIndex = JSON.parse(await import('fs').then(fs => fs.readFileSync('public/api/search-index.json', 'utf8')));
        const query = q.toLowerCase();
        const results = searchIndex.filter(item => 
            item.name.toLowerCase().includes(query) || 
            (item.name_ar && item.name_ar.includes(query))
        ).slice(0, 20);
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
      }
    }
  }
});
