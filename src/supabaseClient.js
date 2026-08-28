import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '')
	.trim()
	.replace(/\/rest\/v1\/?$/, '')
const supabaseKey = (import.meta.env.VITE_SUPABASE_KEY || '').trim()

if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_KEY. Configuralas en el archivo .env local y en las variables de entorno de Vercel.'
	)
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
	},
})
