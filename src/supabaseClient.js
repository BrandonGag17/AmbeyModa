import { createClient } from '@supabase/supabase-js'

// Prefer environment variables (Vite): VITE_SUPABASE_URL and VITE_SUPABASE_KEY
// Fallback to the existing hardcoded values if env vars are not provided.
// IMPORTANT: `createClient` expects the project base URL (without `/rest/v1`).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mnykxqeyzszkevuusekv.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_mMFzEEcDBxWsvnwajh_t1w_pciIl38r'

if (!supabaseUrl) console.warn('VITE_SUPABASE_URL is not set; using fallback URL')

export const supabase = createClient(supabaseUrl, supabaseKey)