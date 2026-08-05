import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/format/address')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const wilaya = url.searchParams.get('wilaya');
        const lang = url.searchParams.get('lang') || 'en';
        const style = url.searchParams.get('style') || 'official';
        
        // Mock response
        const formatted = style === 'official' ? `Wilaya: ${wilaya}, Algeria` : `Algeria - ${wilaya}`;
        
        return new Response(JSON.stringify({ wilaya, lang, style, formatted }), { headers: { 'Content-Type': 'application/json' } });
      }
    }
  }
});
