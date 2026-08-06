import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only intercept /api/* requests
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Call the increment endpoint (which uses supabaseAdmin) to update the counter
    // This runs on Vercel Edge for every static file request under /api/
    const url = new URL(request.url);
    const incrementUrl = `${url.origin}/api/public/increment`;
    
    // Fire and forget (don't wait for response to keep performance)
    void fetch(incrementUrl, { method: 'POST' }).catch(() => {});
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
