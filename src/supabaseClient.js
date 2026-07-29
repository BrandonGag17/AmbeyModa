import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://mnykxqeyzszkevuusekv.supabase.co'

const supabaseKey = 'sb_publishable_mMFzEEcDBxWsvnwajh_t1w_pciIl38r'

export const supabase = createClient(supabaseUrl, supabaseKey)