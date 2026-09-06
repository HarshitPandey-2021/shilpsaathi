import * as storageService from '../services/storageService.js';
import * as imageEnhancer from '../services/imageEnhancer.js';
import { isSupabaseConfigured } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function uploadProductImage(req, res, next) {
  try {
    if (!isSupabaseConfigured()) {
      return errorResponse(res, 'Storage not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }

    if (!req.file) {
      return errorResponse(res, 'No image file provided. Use field name "image".', 400);
    }

    console.log('[Upload] Original image received:', req.file.originalname, req.file.size, 'bytes');

    const enhancedFile = await imageEnhancer.enhanceImage(req.file);

    console.log('[Upload] Enhanced image received, uploading to storage...');

    const result = await storageService.uploadImage(enhancedFile);
    return successResponse(res, {
      filePath: result.filePath,
      publicUrl: result.publicUrl,
    }, 'Image enhanced and uploaded successfully', 201);
  } catch (err) {
    if (err.message?.includes('Storage bucket')) {
      return errorResponse(res, err.message, 500);
    }
    if (err.statusCode === 503) {
      return errorResponse(res, err.message, 503);
    }
    if (err.statusCode === 504) {
      return errorResponse(res, err.message, 504);
    }
    next(err);
  }
}

export async function uploadProductImageStream(req, res, next) {
  if (!isSupabaseConfigured()) {
    return errorResponse(res, 'Storage not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
  }

  if (!req.file) {
    return errorResponse(res, 'No image file provided. Use field name "image".', 400);
  }

  console.log('[Upload Stream] Starting streaming enhancement for:', req.file.originalname);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let aiResponse = null;

  try {
    const streamCtx = imageEnhancer.enhanceImageStream(req.file);

    aiResponse = await fetch(`${imageEnhancer.AI_SERVICE_URL}/enhance/stream`, {
      method: 'POST',
      body: streamCtx.formData,
      signal: streamCtx.controller.signal,
    });

    if (!aiResponse.ok) {
      sendEvent({ stage: 'error', message: `AI service error: ${aiResponse.status}`, success: false });
      return res.end();
    }

    const reader = aiResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data: ')) continue;

        let eventData;
        try {
          eventData = JSON.parse(line.slice(6));
        } catch (e) {
          continue;
        }

        if (eventData.stage === 'error') {
          sendEvent({ stage: 'error', message: eventData.message || 'Processing failed. Please try again.', success: false });
          streamCtx.cleanup();
          return res.end();
        }

        if (eventData.stage === 'complete') {
          const imageB64 = eventData.image_b64;
          if (!imageB64) {
            sendEvent({ stage: 'error', message: 'AI service did not return an enhanced image.', success: false });
            streamCtx.cleanup();
            return res.end();
          }

          const enhancedBuffer = Buffer.from(imageB64, 'base64');
          const enhancedFile = {
            buffer: enhancedBuffer,
            mimetype: 'image/jpeg',
            originalname: `enhanced-${req.file.originalname.replace(/\.[^.]+$/, '.jpg')}`,
          };

          const result = await storageService.uploadImage(enhancedFile);
          sendEvent({
            stage: 'stored',
            message: 'Image stored successfully',
            publicUrl: result.publicUrl,
            filePath: result.filePath,
            success: true,
          });
          streamCtx.cleanup();
          return res.end();
        }

        // Forward regular progress stage to the frontend
        sendEvent({ stage: eventData.stage, message: eventData.message, success: true });
      }
    }

    res.end();
  } catch (err) {
    console.error('[Upload Stream] Error:', err.message);
    if (err.name === 'AbortError') {
      sendEvent({ stage: 'error', message: 'Processing timed out. Please try again.', success: false });
    } else if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
      sendEvent({ stage: 'error', message: 'AI service unavailable. Please try again later.', success: false });
    } else {
      sendEvent({ stage: 'error', message: 'Processing failed. Please try again.', success: false });
    }

    if (aiResponse) {
      try { aiResponse.body?.cancel(); } catch (e) { /* ignore */ }
    }

    res.end();
  }
}
