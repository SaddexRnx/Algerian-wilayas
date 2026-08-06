import { createMiddleware } from '@tanstack/react-start'
import { supabase } from './client'

// Robust fallback for session hydration when edge middleware is disabled
// or during SSR/Prerender where cookies might not be immediately available.
export const attachSupabaseAuth = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    // If we're in a browser environment, we can reliably get the session from localStorage
    // via the client even if the edge middleware didn't inject a token.
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  },
)
