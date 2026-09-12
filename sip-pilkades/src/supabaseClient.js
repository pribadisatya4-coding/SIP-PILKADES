import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'MASUKKAN_SUPABASE_URL_ANDA'
const supabaseAnonKey = 'MASUKKAN_SUPABASE_ANON_KEY_ANDA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
