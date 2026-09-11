const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
    return url;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:5000/api`;
    }
    // LAN/mobile dev: when opened as http://<LAPTOP-LAN-IP>:5173, call the
    // backend on the same laptop IP (backend default port 5000).
    // Override with VITE_API_URL=http://<LAPTOP-LAN-IP>:5000/api if needed.
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) {
      return `http://${host}:5000/api`;
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const TOKEN_KEY = 'shilpsaathi_auth_token';

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Public endpoints that should NEVER include an auth token.
const PUBLIC_ENDPOINTS = new Set([
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
  '/api/artisans/resolve',
  '/api/health',
]);

function shouldAttachToken(url) {
  const path = url.replace(API_BASE_URL, '');
  for (const pub of PUBLIC_ENDPOINTS) {
    if (path === pub || path.startsWith(pub + '?')) return false;
  }
  return true;
}

async function fetchJSON(url, options = {}) {
  const token = getAuthToken();
  const attachToken = token && shouldAttachToken(url) && !options.headers?.['Authorization'];

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(attachToken ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  const data = await response.json().catch(() => null);

  // On 401, clear stale token so the app re-authenticates.
  if (response.status === 401 && token) {
    clearAuthToken();
    window.dispatchEvent(new CustomEvent('shilpsaathi:unauthorized'));
  }

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  getHealth: () => fetchJSON(`${API_BASE_URL}/health`),

  sendOtp: (phone) =>
    fetchJSON(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone, token, extras = {}) =>
    fetchJSON(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ phone, token, ...extras }),
    }),

  getMe: () => fetchJSON(`${API_BASE_URL}/auth/me`),

  syncArtisan: (data = {}) =>
    fetchJSON(`${API_BASE_URL}/auth/sync`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetchJSON(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
  },

  uploadImageStream: (file, onStage) => {
    const formData = new FormData();
    formData.append('image', file);

    return fetch(`${API_BASE_URL}/upload/stream`, { method: 'POST', body: formData });
  },

  storePermanentImage: (imageB64, mimeType = 'image/jpeg') =>
    fetchJSON(`${API_BASE_URL}/upload/permanent`, {
      method: 'POST',
      body: JSON.stringify({ image_b64: imageB64, mimeType }),
    }),

  getProducts: (artisanId = null) => {
    const url = artisanId
      ? `${API_BASE_URL}/products?artisan_id=${artisanId}`
      : `${API_BASE_URL}/products`;
    return fetchJSON(url);
  },

  getProduct: (id) => fetchJSON(`${API_BASE_URL}/products/${id}`),

  createProduct: (productData) =>
    fetchJSON(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    fetchJSON(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  deleteProduct: (id, artisanId = null) => {
    const url = artisanId
      ? `${API_BASE_URL}/products/${id}?artisan_id=${artisanId}`
      : `${API_BASE_URL}/products/${id}`;
    return fetchJSON(url, { method: 'DELETE' });
  },

  getProductListing: (id) => fetchJSON(`${API_BASE_URL}/products/${id}/listing`),

  calculatePrice: (optionsOrCost = 250, hours = 6, product = null, language = 'hi') => {
    const body = typeof optionsOrCost === 'object'
      ? optionsOrCost
      : { rawMaterialCost: optionsOrCost, hoursSpent: hours, product, language };

    return fetchJSON(`${API_BASE_URL}/calculate-price`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  enhanceImage: (image) =>
    fetchJSON(`${API_BASE_URL}/enhance-image`, {
      method: 'POST',
      body: JSON.stringify({ image }),
    }),

  processVoice: ({ audioBlob = null, transcript = null, language = 'hi', targetLanguage = 'en' } = {}) => {
    if (audioBlob) {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      if (transcript) formData.append('transcript', transcript);
      formData.append('language', language);
      formData.append('targetLanguage', targetLanguage);
      return fetchJSON(`${API_BASE_URL}/process-voice`, { method: 'POST', body: formData });
    }

    return fetchJSON(`${API_BASE_URL}/process-voice`, {
      method: 'POST',
      body: JSON.stringify({ transcript, language, targetLanguage }),
    });
  },

  transcribe: (productId, audioBlob, language = 'hi') => {
    const formData = new FormData();
    if (audioBlob) formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', language);
    const url = productId
      ? `${API_BASE_URL}/products/${productId}/transcribe`
      : `${API_BASE_URL}/process-voice`;
    return fetchJSON(url, { method: 'POST', body: formData });
  },

  generateCatalog: (productId, transcript, language = 'hi', targetLanguage = 'en') => {
    const url = productId
      ? `${API_BASE_URL}/products/${productId}/generate-catalog`
      : `${API_BASE_URL}/process-voice`;
    return fetchJSON(url, {
      method: 'POST',
      body: JSON.stringify({ transcript, language, targetLanguage }),
    });
  },
};

export { API_BASE_URL, setAuthToken, getAuthToken, clearAuthToken };

