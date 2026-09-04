import { supabase, isSupabaseConfigured } from '../config/index.js';
import { isValidUUID } from '../utils/validation.js';

const TABLE = 'artisans';

export async function getAllArtisans() {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getArtisanById(id) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  if (!isValidUUID(id)) throw Object.assign(new Error('Invalid artisan ID'), { statusCode: 400 });
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getOrCreateDemoArtisan() {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  const { data: existing } = await supabase.from(TABLE).select('*').eq('phone', '0000000000').single();
  if (existing) return existing;
  const { data, error } = await supabase.from(TABLE).insert({
    name: 'Demo Artisan',
    phone: '0000000000',
    preferred_language: 'hi',
    location: 'India',
  }).select().single();
  if (error) throw error;
  return data;
}

export async function createArtisan(artisanData) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  const { data, error } = await supabase.from(TABLE).insert(artisanData).select().single();
  if (error) throw error;
  return data;
}

export async function updateArtisan(id, artisanData) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  if (!isValidUUID(id)) throw Object.assign(new Error('Invalid artisan ID'), { statusCode: 400 });
  const { data, error } = await supabase.from(TABLE).update(artisanData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteArtisan(id) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  if (!isValidUUID(id)) throw Object.assign(new Error('Invalid artisan ID'), { statusCode: 400 });
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select().single();
  if (error) throw error;
  return data;
}
