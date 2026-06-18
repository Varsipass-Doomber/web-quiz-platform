import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

// Обычный клиент для работы приложения (с RLS)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Административный клиент для обхода RLS (только для миграций, cron-задач и т.д.)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
);

export type { SupabaseClient };