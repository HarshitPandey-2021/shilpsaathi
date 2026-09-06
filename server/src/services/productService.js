import { supabase, isSupabaseConfigured } from '../config/index.js';
import { isValidUUID } from '../utils/validation.js';

const TABLE = 'products';

function selectFields() {
  return 'id, artisan_id, name, category, material, colour, craft_type, description_hi, description_en, keywords, original_image_url, image_url, price_min, price_max, final_price, status, created_at';
}

export async function getAllProducts(artisanId = null) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  let query = supabase.from(TABLE).select(selectFields()).order('created_at', { ascending: false });
  if (artisanId) {
    if (!isValidUUID(artisanId)) throw Object.assign(new Error('Invalid artisan ID'), { statusCode: 400 });
    query = query.eq('artisan_id', artisanId);
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
  const { data, error } = await supabase.from(TABLE).insert(productData).select(selectFields()).single();
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
