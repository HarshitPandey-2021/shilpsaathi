import { supabase, config, isSupabaseConfigured } from '../config/index.js';
import path from 'path';

const BUCKET = config.storage.bucket;

function generateFileName(originalName) {
  const ext = path.extname(originalName || '.jpg').toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `products/${timestamp}-${random}${ext}`;
}

function getPublicUrl(filePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data?.publicUrl || null;
}

export async function uploadImage(file) {
  if (!isSupabaseConfigured()) throw new Error('Storage not configured');
  if (!file) throw new Error('No file provided');

  const fileName = generateFileName(file.originalname);
  const fileBuffer = file.buffer;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, fileBuffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (uploadError) {
    if (uploadError.message?.includes('Bucket not found')) {
      throw Object.assign(
        new Error(`Storage bucket "${BUCKET}" not found. Please create it in Supabase Storage.`),
        { statusCode: 500 }
      );
    }
    throw uploadError;
  }

  const publicUrl = getPublicUrl(fileName);
  return { filePath: fileName, publicUrl };
}

/**
 * Store an image permanently in Supabase Storage from a base64 payload.
 * This is the single point where enhanced images become permanent product assets.
 * Called ONLY at final submission time.
 */
export async function storePermanentImage(base64Data, originalName = 'product.jpg') {
  if (!isSupabaseConfigured()) throw new Error('Storage not configured');
  if (!base64Data) throw new Error('No image data provided');

  // Handle data URL prefix if present (e.g. "data:image/jpeg;base64,...")
  let pureBase64 = base64Data;
  let mimeType = 'image/jpeg';
  const dataUrlMatch = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (dataUrlMatch) {
    mimeType = dataUrlMatch[1];
    pureBase64 = dataUrlMatch[2];
  }

  let imageBuffer;
  try {
    imageBuffer = Buffer.from(pureBase64, 'base64');
  } catch (e) {
    throw new Error('Invalid base64 image data');
  }

  if (imageBuffer.length === 0) {
    throw new Error('Decoded image is empty');
  }

  // Determine extension from mime type
  const extMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
  const ext = extMap[mimeType] || '.jpg';

  const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, imageBuffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (uploadError) {
    if (uploadError.message?.includes('Bucket not found')) {
      throw Object.assign(
        new Error(`Storage bucket "${BUCKET}" not found. Please create it in Supabase Storage.`),
        { statusCode: 500 }
      );
    }
    throw uploadError;
  }

  const publicUrl = getPublicUrl(fileName);
  return { filePath: fileName, publicUrl, mimeType };
}

export async function deleteImage(filePath) {
  if (!isSupabaseConfigured()) throw new Error('Storage not configured');
  if (!filePath) return;
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) throw error;
}

export async function ensureBucketExists() {
  if (!isSupabaseConfigured()) return false;
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) return false;
  return buckets?.some((b) => b.name === BUCKET);
}

export { BUCKET };
