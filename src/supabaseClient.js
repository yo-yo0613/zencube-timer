import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uwblrxiainfkvftzwcvg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YmxyeGlhaW5ma3ZmdHp3Y3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Nzk3MTQsImV4cCI6MjA5NTQ1NTcxNH0._v1yKCprS-Gd7Pr3SFJPoIul7rEuhLVcO_VIyhZ-I60'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
