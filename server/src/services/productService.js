import { supabase, isSupabaseConfigured } from '../config/index.js';
import { isValidUUID } from '../utils/validation.js';
import crypto from 'crypto';
const TABLE = 'products';

function toSafeUUID(id) {
  if (!id) return null;
  const str = String(id).trim();
  if (isValidUUID(str)) return str;
  // Generate a reproducible UUIDv5-like hash from the phone string
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

function toDeterministicUUID(identifier) {
  if (!identifier) return null;
  const str = String(identifier).trim();
  if (isValidUUID(str)) return str;

  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}
function selectFields() {
  return 'id, artisan_id, name, category, material, colour, craft_type, description_hi, description_en, keywords, original_image_url, image_url, price_min, price_max, final_price, status, created_at';
}

export async function getAllProducts(artisanId = null) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  let query = supabase.from(TABLE).select(selectFields()).order('created_at', { ascending: false });

  if (artisanId) {
    const safeUUID = toDeterministicUUID(artisanId);
    query = query.eq('artisan_id', safeUUID);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProductById(id) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  if (!isValidUUID(id)) throw Object.assign(new Error('Invalid product ID'), { statusCode: 400 });
  const { data, error } = await supabase.from(TABLE).select(selectFields()).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getProductWithArtisan(id) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  if (!isValidUUID(id)) throw Object.assign(new Error('Invalid product ID'), { statusCode: 400 });
  const { data, error } = await supabase.from(TABLE).select(`${selectFields()}, artisans(id, name, phone, preferred_language, location)`).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createProduct(productData) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');

  const payload = { ...productData };
  if (payload.artisan_id) {
    payload.artisan_id = toDeterministicUUID(payload.artisan_id);
  }

  const { data, error } = await supabase.from(TABLE).insert(payload).select(selectFields()).single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, productData) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  if (!isValidUUID(id)) throw Object.assign(new Error('Invalid product ID'), { statusCode: 400 });
  const { data, error } = await supabase.from(TABLE).update(productData).eq('id', id).select(selectFields()).single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  if (!isValidUUID(id)) throw Object.assign(new Error('Invalid product ID'), { statusCode: 400 });
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select(selectFields()).single();
  if (error) throw error;
  return data;
}

export async function updateProductStatus(id, status) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  if (!isValidUUID(id)) throw Object.assign(new Error('Invalid product ID'), { statusCode: 400 });
  const { data, error } = await supabase.from(TABLE).update({ status }).eq('id', id).select(selectFields()).single();
  if (error) throw error;
  return data;
}

export async function isProductOwnedByArtisan(productId, artisanId) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  if (!isValidUUID(productId)) return false;
  if (!isValidUUID(artisanId)) return false;
  const { data, error } = await supabase.from(TABLE).select('id').eq('id', productId).eq('artisan_id', artisanId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return Boolean(data);
}
