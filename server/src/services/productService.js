import { supabase, isSupabaseConfigured } from '../config/index.js';
import { isValidUUID } from '../utils/validation.js';
const TABLE = 'products';

function selectFields() {
  return 'id, artisan_id, name, category, material, colour, craft_type, description_hi, description_en, keywords, original_image_url, image_url, price_min, price_max, final_price, status, created_at';
}

/**
 * List products owned by a single artisan.
 *
 * SECURITY: ownership is resolved server-side from the ACTUAL database
 * artisan UUID (never from a phone number or a synthesized hash). When no
 * valid artisan identity is supplied we return an empty set so that one user
 * can never receive another user's products. Only published products are
 * returned.
 */
export async function getAllProducts(artisanId = null) {
  if (!isSupabaseConfigured()) throw new Error('Database not configured');
  if (!artisanId) return [];

  if (!isValidUUID(artisanId)) {
    throw Object.assign(new Error('Invalid artisan ID'), { statusCode: 400 });
  }

  const query = supabase
    .from(TABLE)
    .select(selectFields())
    .eq('artisan_id', artisanId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

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
    // Ownership MUST reference the ACTUAL database artisan UUID. Reject any
    // non-UUID value (e.g. a raw phone number) instead of synthesizing a hash.
    if (!isValidUUID(payload.artisan_id)) {
      throw Object.assign(new Error('Invalid artisan ID'), { statusCode: 400 });
    }
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
