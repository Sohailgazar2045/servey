import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    global: {
      fetch: (url: RequestInfo | URL, opts?: RequestInit) =>
        fetch(url, { ...opts, cache: 'no-store' }),
    },
  }
)
