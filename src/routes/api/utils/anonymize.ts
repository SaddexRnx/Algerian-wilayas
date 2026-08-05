import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/utils/anonymize')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const { text, level = 'medium' } = body;
        
        let result = text;
        if (level === 'high') {
            result = text.replace(/[\w]/g, '*');
        } else if (level === 'medium') {
            result = text.substring(0, 4) + '***' + text.substring(text.length - 4);
        }
        
        return new Response(JSON.stringify({ original: text, anonymized: result }), { headers: { 'Content-Type': 'application/json' } });
      }
    }
  }
});
