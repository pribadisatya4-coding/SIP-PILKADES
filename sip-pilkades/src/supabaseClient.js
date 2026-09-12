import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hkohdhvlayglpfiuvqlg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrb2hkaHZsYXlnbHBmaXV2cWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTg2OTksImV4cCI6MjEwNDczNDY5OX0.AjqtZ2cSXa74ErgnL2CYhLAS0hAVq-uqiYs6b-A03uw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
