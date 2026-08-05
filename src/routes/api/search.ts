import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { createServerFn } from '@tanstack/react-start';

interface SearchItem {
  name: string;
  name_ar?: string;
  [key: string]: any;
}

export const searchApi = createServerFn({ method: 'GET' })
  .inputValidator((d) => z.object({ q: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const fs = await import('fs');
    const path = await import('path');
    const searchIndex: SearchItem[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/api/search-index.json'), 'utf8'));
    const query = data.q.toLowerCase();
    return searchIndex.filter((item: SearchItem) => 
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
        const fs = await import('fs');
        const path = await import('path');
        const searchIndex: SearchItem[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/api/search-index.json'), 'utf8'));
        const query = q.toLowerCase();
        const results = searchIndex.filter((item: SearchItem) => 
            item.name.toLowerCase().includes(query) || 
            (item.name_ar && item.name_ar.includes(query))
        ).slice(0, 20);
        return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
      }
    }
  }
});
