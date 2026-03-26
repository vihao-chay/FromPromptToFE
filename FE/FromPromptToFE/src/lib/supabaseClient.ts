import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const uploadToSupabaseAndGetUrl = async (content: string, path: string, type: string) => {
  if (!supabase) {
    console.warn("Supabase configuration missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
    return null;
  }
  const { error } = await supabase.storage.from('generated-ui').upload(path, content, {
    contentType: type,
    upsert: false
  });
  if (error) {
    console.error('Supabase upload error:', error);
    return null;
  }
  const { data } = supabase.storage.from('generated-ui').getPublicUrl(path);
  return data.publicUrl;
}

export const fetchContentIfUrl = async (val: string) => {
  if (val && val.startsWith('http')) {
    try {
      const res = await fetch(val);
      return await res.text();
    } catch {
      return val;
    }
  }
  return val;
}
