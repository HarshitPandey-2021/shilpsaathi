import { config } from '../config/index.js';

const AI_SERVICE_URL = config.ai?.serviceUrl || process.env.AI_IMAGE_SERVICE_URL || 'http://localhost:8000';
const AI_ENHANCE_TIMEOUT = config.ai?.timeout || parseInt(process.env.AI_ENHANCE_TIMEOUT || '120000', 10);

export async function enhanceImage(file) {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new Error('No image data provided for enhancement');
  }

  console.log('[ImageEnhancer] Sending image to AI service');

  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype || 'image/jpeg' });
  formData.append('file', blob, file.originalname || 'product.jpg');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_ENHANCE_TIMEOUT);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/enhance`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`AI service responded with status ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('image')) {
      throw new Error('AI service did not return a valid image');
    }

    const arrayBuffer = await response.arrayBuffer();
    const enhancedBuffer = Buffer.from(arrayBuffer);

    console.log('[ImageEnhancer] AI processing successful, enhanced size:', enhancedBuffer.length, 'bytes');

    return {
      buffer: enhancedBuffer,
      mimetype: 'image/jpeg',
      originalname: file.originalname ? `enhanced-${file.originalname.replace(/\.[^.]+$/, '.jpg')}` : 'enhanced-product.jpg',
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      console.error('[ImageEnhancer] AI processing timed out');
      throw Object.assign(new Error('Image enhancement timed out. Please try again.'), { statusCode: 504 });
    }

    if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
      console.error('[ImageEnhancer] AI service unreachable:', err.message);
      throw Object.assign(new Error('Image enhancement service is unavailable. Please try again later.'), { statusCode: 503 });
    }

    console.error('[ImageEnhancer] AI processing failed:', err.message);
    throw err;
  }
}

export function enhanceImageStream(file) {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new Error('No image data provided for enhancement');
  }

  console.log('[ImageEnhancer] Starting streaming enhancement');

  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype || 'image/jpeg' });
  formData.append('file', blob, file.originalname || 'product.jpg');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_ENHANCE_TIMEOUT);

  return {
    formData,
    controller,
    timeoutId,
    cleanup() {
      clearTimeout(timeoutId);
      controller.abort();
    },
  };
}

export { AI_SERVICE_URL, AI_ENHANCE_TIMEOUT };
