import { createClient } from '@supabase/supabase-js';

// Estas variables las lee del archivo .env.local que creamos antes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);