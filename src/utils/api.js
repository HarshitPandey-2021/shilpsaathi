const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
    return url;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:5000/api`;
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();


async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  const data = await response.json().catch(() => null);

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

  calculatePrice: (optionsOrCost = 250, hours = 6) => {
    const body = typeof optionsOrCost === 'object'
      ? optionsOrCost
      : { rawMaterialCost: optionsOrCost, hoursSpent: hours };

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

  processVoice: ({ audioBlob = null, transcript = null, language = 'hi' } = {}) => {
    if (audioBlob) {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      if (transcript) formData.append('transcript', transcript);
      formData.append('language', language);
      return fetchJSON(`${API_BASE_URL}/process-voice`, { method: 'POST', body: formData });
    }

    return fetchJSON(`${API_BASE_URL}/process-voice`, {
      method: 'POST',
      body: JSON.stringify({ transcript, language }),
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

  generateCatalog: (productId, transcript, language = 'hi') => {
    const url = productId
      ? `${API_BASE_URL}/products/${productId}/generate-catalog`
      : `${API_BASE_URL}/process-voice`;
    return fetchJSON(url, {
      method: 'POST',
      body: JSON.stringify({ transcript, language }),
    });
  },
};

export { API_BASE_URL };

