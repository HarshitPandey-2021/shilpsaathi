/**
 * Resilient LLM Service for ShilpSaathi
 *
 * Provider hierarchy:
 * 1. Google Gemini (Primary) - GEMINI_API_KEY
 * 2. Groq (Fallback) - GROQ_API_KEY (Llama 3.3 / Llama 3.1)
 *
 * Features:
 * - Structured error classification (auth/expired_token, quota_exceeded, timeout, provider_error)
 * - Safe server console logging without leaking credentials
 * - Robust JSON extraction (handles markdown blocks, whitespace, nested JSON)
 */

import { config } from '../config/index.js';

/**
 * Classifies HTTP errors or exceptions into standard failure types.
 * Accepts either an Error object or (status, message, errName).
 */
export function classifyError(statusOrErr, message = '', errName = '') {
  let status = null;
  let msg = '';
  let name = '';

  if (statusOrErr && typeof statusOrErr === 'object') {
    status = statusOrErr.status || statusOrErr.statusCode || statusOrErr.response?.status || null;
    msg = (statusOrErr.message || '') + ' ' + (statusOrErr.response?.data?.error?.message || '');
    name = statusOrErr.name || '';
  } else {
    status = typeof statusOrErr === 'number' ? statusOrErr : null;
    msg = message || '';
    name = errName || '';
  }

  if (name === 'AbortError' || /timeout|timed out/i.test(msg)) {
    return { type: 'timeout', label: 'timeout' };
  }
  if (status === 401 || status === 403 || /unauthorized|forbidden|invalid api key|api key not valid|api_key_invalid|permission_denied/i.test(msg)) {
    return { type: 'auth/expired_token', label: 'auth/expired_token' };
  }
  if (status === 429 || status === 402 || /quota|rate limit|resource_exhausted|insufficient/i.test(msg)) {
    return { type: 'quota_exceeded', label: 'quota_exceeded' };
  }
  return { type: 'unknown', label: 'provider_error' };
}

/**
 * Strips markdown code fences and extracts the outermost JSON object/array.
 */
export function safeExtractJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  let cleaned = rawText.trim();
  // Strip ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // Attempt regex match for innermost or outermost JSON object
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return null;
  }
}

/**
 * Invokes Google Gemini API with structured JSON output expectation.
 */
export async function callGemini(prompt, { systemPrompt = '', temperature = 0.3 } = {}) {
  const { apiKey, model } = config.gemini;
  if (!apiKey) {
    return { success: false, reason: 'unconfigured' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const contents = [];
    if (systemPrompt) {
      contents.push({ role: 'user', parts: [{ text: `System Instruction: ${systemPrompt}\n\nTask:\n${prompt}` }] });
    } else {
      contents.push({ parts: [{ text: prompt }] });
    }

    let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });

    if (res.status === 404) {
      // Retry with modern Gemini model endpoints if initial configured model returns 404
      const fallbackModels = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'].filter(m => m !== model);
      for (const fallbackModel of fallbackModels) {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature,
              responseMimeType: 'application/json',
            },
          }),
          signal: controller.signal,
        });
        if (res.ok) break;
      }
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const classification = classifyError(res.status, errText);
      const cleanMsg = errText.slice(0, 160).replace(/key=[^&\s]+/gi, 'key=REDACTED');
      return {
        success: false,
        errorType: classification.label,
        status: res.status,
        message: cleanMsg || `HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return { success: false, errorType: 'empty_response', message: 'No content in candidates' };
    }

    const parsed = safeExtractJson(rawText);
    if (!parsed) {
      return { success: false, errorType: 'malformed_json', message: 'Invalid JSON returned', rawText };
    }

    return { success: true, data: parsed, provider: 'gemini' };
  } catch (err) {
    const classification = classifyError(0, err.message, err.name);
    return {
      success: false,
      errorType: classification.label,
      message: err.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Invokes Groq API (OpenAI-compatible) with structured JSON output expectation.
 */
export async function callGroq(prompt, { systemPrompt = '', temperature = 0.3 } = {}) {
  const { apiKey, model, timeoutMs } = config.groq;
  if (!apiKey) {
    return { success: false, reason: 'unconfigured' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs || 30000);

  try {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        temperature,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const classification = classifyError(res.status, errText);
      const cleanMsg = errText.slice(0, 160).replace(/Bearer\s+[^\s]+/gi, 'Bearer REDACTED');
      return {
        success: false,
        errorType: classification.label,
        status: res.status,
        message: cleanMsg || `HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, errorType: 'empty_response', message: 'No content in choices' };
    }

    const parsed = safeExtractJson(content);
    if (!parsed) {
      return { success: false, errorType: 'malformed_json', message: 'Invalid JSON returned', rawText: content };
    }

    return { success: true, data: parsed, provider: 'groq' };
  } catch (err) {
    const classification = classifyError(0, err.message, err.name);
    return {
      success: false,
      errorType: classification.label,
      message: err.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Unified multi-provider LLM executor:
 * 1. Try Gemini
 * 2. If Gemini fails -> log structured error & fallback to Groq
 * 3. If Groq fails -> log structured error & return failure so caller can run heuristics
 */
export async function callLlmWithFallback(prompt, options = {}) {
  // 1. Try Gemini
  if (config.gemini.enabled) {
    const geminiRes = await callGemini(prompt, options);
    if (geminiRes.success) {
      return { success: true, provider: 'gemini', data: geminiRes.data };
    }

    const errType = geminiRes.errorType || 'unknown';
    const errDetail = geminiRes.message || 'No detail';
    console.error(`[AI:Gemini] ${errType} — falling back to Groq. ${errDetail}`);
  } else {
    console.log('[AI:Gemini] Key not configured. Skipping Gemini and proceeding to Groq.');
  }

  // 2. Try Groq
  if (config.groq.enabled) {
    const groqRes = await callGroq(prompt, options);
    if (groqRes.success) {
      return { success: true, provider: 'groq', data: groqRes.data };
    }

    const errType = groqRes.errorType || 'unknown';
    const errDetail = groqRes.message || 'No detail';
    console.error(`[AI:Groq] ${errType} — falling back to heuristic. ${errDetail}`);
  } else {
    console.log('[AI:Groq] Key not configured. Falling back to heuristic.');
  }

  // 3. Complete fallback
  return { success: false, provider: 'none', data: null };
}
