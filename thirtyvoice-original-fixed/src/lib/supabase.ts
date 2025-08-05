import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://bjtjobxqqnngvponbuek.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdGpvYnhxcW5uZ3Zwb25idWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTU3NzgsImV4cCI6MjA2OTA5MTc3OH0.YNv7FmzZ2S02_fy8t7VggUEz6vR7jcgpzSDb45i1Um4'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type { Database }
