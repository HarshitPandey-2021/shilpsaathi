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
