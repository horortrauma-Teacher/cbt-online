import { createClient } from '@supabase/supabase-js';

// Ambil URL dan Key dari Environment Variables Vercel / .env.local
const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('placeholder')
);

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export type Question = {
  id: string;
  exam_id: string;
  question_text: string;
  image_url: string | null;
  image_caption?: string | null;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option?: string;
  explanation?: string | null;
  order_index: number;
};

export type StudentAnswer = {
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  is_doubtful: boolean;
};

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
