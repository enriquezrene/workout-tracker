import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createConfiguredSupabaseClient(): SupabaseClient | undefined {
  const url = import.meta.env.VITE_SUPABASE_URL
  const publishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !publishableKey) return undefined

  return createClient(url, publishableKey, {
    auth: {
      storage: window.sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}
